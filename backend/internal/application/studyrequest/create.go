// Package studyrequest contém o use case de criação de StudyRequest.
//
// PADRÃO: orquestra domínio + ports (Repository, FileStorage). Não conhece HTTP.
package studyrequest

import (
	"context"
	"fmt"
	"io"
	"log/slog"

	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
)

// FileInput agrega os dados de um arquivo recebido pelo handler.
// O handler é responsável por já ter validado size e content-type básicos do
// multipart antes de passar pra cá. O domínio revalida (defense-in-depth).
type FileInput struct {
	FileName    string
	ContentType string
	SizeBytes   int64
	Content     io.Reader
}

// CreateCommand é o input do use case.
type CreateCommand struct {
	UserID           shared.UserID // opcional — lead pode estar deslogado
	Name             string
	Email            string
	Phone            string
	StudyArea        string
	Institution      string
	Subject          string
	Goal             string
	Description      string
	MarketingConsent bool
	Files            []FileInput
}

// CreateResult retorna o ID da request criada para que o handler responda algo
// útil ao cliente sem expor o agregado inteiro.
type CreateResult struct {
	ID              string
	Status          string
	AttachmentCount int
}

// CreateUseCase encapsula a criação completa de uma solicitação:
//  1. Valida e cria o agregado.
//  2. Resolve lead → user existente por email (associação automática).
//  3. Para cada arquivo, faz upload via FileStorage e anexa ao agregado.
//  4. Persiste o agregado (com seus attachments) no Repository.
//  5. Envia confirmação ao estudante + notificação ao admin (assíncrono).
//
// Falhas de upload abortam a request inteira (sem persistir nada).
// Falhas no envio de email NÃO abortam — são logadas e seguimos em frente:
// melhor entregar a solicitação ao admin via DB do que recusar pelo email.
type CreateUseCase struct {
	repo       domsr.Repository
	storage    domsr.FileStorage
	userLookup domsr.UserLookup
	notifier   domsr.EmailNotifier
	adminEmail string
	clock      shared.Clock
	logger     *slog.Logger
}

func NewCreateUseCase(repo domsr.Repository, storage domsr.FileStorage, clock shared.Clock) *CreateUseCase {
	return &CreateUseCase{repo: repo, storage: storage, clock: clock}
}

// WithUserLookup habilita associação automática lead → user logado por email.
func (uc *CreateUseCase) WithUserLookup(lookup domsr.UserLookup) *CreateUseCase {
	uc.userLookup = lookup
	return uc
}

// WithNotifier habilita envio de emails (confirmação + alerta admin).
func (uc *CreateUseCase) WithNotifier(n domsr.EmailNotifier, adminEmail string) *CreateUseCase {
	uc.notifier = n
	uc.adminEmail = adminEmail
	return uc
}

// WithLogger anexa um logger para falhas não-críticas (envio de email).
func (uc *CreateUseCase) WithLogger(l *slog.Logger) *CreateUseCase {
	uc.logger = l
	return uc
}

func (uc *CreateUseCase) Execute(ctx context.Context, cmd CreateCommand) (*CreateResult, error) {
	req, err := domsr.New(domsr.Input{
		UserID:           cmd.UserID,
		Name:             cmd.Name,
		Email:            cmd.Email,
		Phone:            cmd.Phone,
		StudyArea:        cmd.StudyArea,
		Institution:      cmd.Institution,
		Subject:          cmd.Subject,
		Goal:             cmd.Goal,
		Description:      cmd.Description,
		MarketingConsent: cmd.MarketingConsent,
	}, uc.clock.Now())
	if err != nil {
		return nil, err
	}

	if len(cmd.Files) > domsr.MaxAttachmentsPerRequest {
		return nil, shared.NewValidationError(
			fmt.Sprintf("número máximo de anexos por solicitação: %d", domsr.MaxAttachmentsPerRequest),
		)
	}

	for _, f := range cmd.Files {
		attID := domsr.NewAttachmentID()
		url, uploadErr := uc.storage.Upload(ctx, domsr.UploadInput{
			StudyRequestID: req.ID(),
			AttachmentID:   attID,
			FileName:       f.FileName,
			ContentType:    f.ContentType,
			SizeBytes:      f.SizeBytes,
			Content:        f.Content,
		})
		if uploadErr != nil {
			return nil, fmt.Errorf("upload arquivo %q: %w", f.FileName, uploadErr)
		}
		att, attErr := domsr.NewAttachment(f.FileName, f.ContentType, f.SizeBytes, url, uc.clock.Now())
		if attErr != nil {
			return nil, attErr
		}
		// O domínio aceita a ID que o storage já usou para nomear a chave.
		att.ID = attID
		if err := req.AttachFile(att); err != nil {
			return nil, err
		}
	}

	// Associação automática lead → user: se já existe um user com esse email,
	// vincula a solicitação à conta. Falha aqui NÃO bloqueia — solicitação anônima
	// é válida.
	if cmd.UserID.IsZero() && uc.userLookup != nil {
		if foundID, err := uc.userLookup.FindUserIDByEmail(ctx, req.Email()); err != nil {
			uc.logWarn("user lookup falhou", "err", err)
		} else if foundID != "" {
			req.AssignToUser(shared.UserID(foundID), uc.clock.Now())
		}
	}

	if err := uc.repo.Save(ctx, req); err != nil {
		return nil, fmt.Errorf("salvar solicitação: %w", err)
	}

	// Notificações são side-effects best-effort. Falhas só loga.
	if uc.notifier != nil {
		if err := uc.notifier.SendReceivedConfirmation(ctx, req.Email(), req.Name(), req.ID(), req.Subject()); err != nil {
			uc.logWarn("falha enviando confirmação ao estudante", "err", err, "request_id", req.ID().String())
		}
		if err := uc.notifier.SendAdminNotification(ctx, uc.adminEmail, req); err != nil {
			uc.logWarn("falha notificando admin", "err", err, "request_id", req.ID().String())
		}
	}

	return &CreateResult{
		ID:              req.ID().String(),
		Status:          req.Status().String(),
		AttachmentCount: len(req.Attachments()),
	}, nil
}

func (uc *CreateUseCase) logWarn(msg string, keyvals ...any) {
	if uc.logger != nil {
		uc.logger.Warn(msg, keyvals...)
	}
}
