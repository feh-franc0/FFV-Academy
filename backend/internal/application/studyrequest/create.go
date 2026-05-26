// Package studyrequest contém o use case de criação de StudyRequest.
//
// PADRÃO: orquestra domínio + ports (Repository, FileStorage). Não conhece HTTP.
package studyrequest

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"time"

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
	repo                domsr.Repository
	storage             domsr.FileStorage
	userLookup          domsr.UserLookup
	userUpserter        domsr.UserUpserter    // opcional — cria conta passwordless pra lead
	loginCodeIssuer     domsr.LoginCodeIssuer // opcional — gera código pro email de boas-vindas
	notifier            domsr.EmailNotifier
	adminLookup         domsr.AdminEmailLookup // fonte primária — query users WHERE role='admin'
	adminEmailsFallback []string               // env ADMIN_EMAIL_ALLOWLIST — usado se lookup falhar/vazio
	clock               shared.Clock
	logger              *slog.Logger
}

func NewCreateUseCase(repo domsr.Repository, storage domsr.FileStorage, clock shared.Clock) *CreateUseCase {
	return &CreateUseCase{repo: repo, storage: storage, clock: clock}
}

// WithUserLookup habilita associação automática lead → user logado por email.
func (uc *CreateUseCase) WithUserLookup(lookup domsr.UserLookup) *CreateUseCase {
	uc.userLookup = lookup
	return uc
}

// WithUserUpserter habilita criação automática de conta passwordless pra
// leads anônimos no submit. Combinado com WithLoginCodeIssuer, permite que
// o email de boas-vindas inclua o código de magic-link inline — 1 clique do
// estudante → logado → dashboard de status.
func (uc *CreateUseCase) WithUserUpserter(upserter domsr.UserUpserter) *CreateUseCase {
	uc.userUpserter = upserter
	return uc
}

// WithLoginCodeIssuer habilita emissão de código de magic-link no submit.
// O código é incluído no email de confirmação (não dispara email separado).
// Falha aqui NÃO bloqueia — solicitação ainda é salva, cliente pode pedir
// novo código depois via /login normal.
func (uc *CreateUseCase) WithLoginCodeIssuer(issuer domsr.LoginCodeIssuer) *CreateUseCase {
	uc.loginCodeIssuer = issuer
	return uc
}

// WithNotifier habilita envio de emails. adminEmailsFallback é a lista de
// emails do ADMIN_EMAIL_ALLOWLIST — usada como REDE DE SEGURANÇA se a query
// de admins no DB falhar (DB indisponível) ou retornar vazio (nenhum role=admin
// cadastrado ainda). Sem fallback e DB cai = alerta perdido.
func (uc *CreateUseCase) WithNotifier(n domsr.EmailNotifier, adminEmailsFallback []string) *CreateUseCase {
	uc.notifier = n
	uc.adminEmailsFallback = adminEmailsFallback
	return uc
}

// WithAdminLookup ativa fonte primária de destinatários do alerta admin:
// query no DB (users.role='admin'). Sem isso, cai direto pro fallback do
// WithNotifier. Recomendado em produção.
func (uc *CreateUseCase) WithAdminLookup(lookup domsr.AdminEmailLookup) *CreateUseCase {
	uc.adminLookup = lookup
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

	// Associação automática lead → user: PRIORIDADE 1 — upserter (cria conta
	// passwordless se não existir). PRIORIDADE 2 — userLookup legado (só
	// associa se já existir). Sem nenhum, lead fica anônimo (compat).
	if cmd.UserID.IsZero() {
		switch {
		case uc.userUpserter != nil:
			if uid, isNew, err := uc.userUpserter.UpsertPasswordlessUser(
				ctx, req.Email(), req.Name(), req.Phone(), req.MarketingConsent(),
			); err != nil {
				uc.logWarn("upsert user falhou (não-bloqueante)", "err", err)
			} else {
				req.AssignToUser(shared.UserID(uid), uc.clock.Now())
				uc.logInfo("user associado", "user_id", uid, "is_new", isNew)
			}
		case uc.userLookup != nil:
			if foundID, err := uc.userLookup.FindUserIDByEmail(ctx, req.Email()); err != nil {
				uc.logWarn("user lookup falhou", "err", err)
			} else if foundID != "" {
				req.AssignToUser(shared.UserID(foundID), uc.clock.Now())
			}
		}
	}

	if err := uc.repo.Save(ctx, req); err != nil {
		return nil, fmt.Errorf("salvar solicitação: %w", err)
	}

	// Gera código de magic-link (best-effort) pra incluir no email de
	// boas-vindas. Falha aqui NÃO bloqueia — cliente pode pedir código depois
	// via /login normal. Rate limit do RequestMagicLinkUseCase NÃO se aplica
	// aqui (esse flow é interno e idempotente por solicitação).
	loginCode := ""
	if uc.loginCodeIssuer != nil {
		if code, err := uc.loginCodeIssuer.IssueForEmail(ctx, req.Email()); err != nil {
			uc.logWarn("falha gerando código de login (não-bloqueante)", "err", err, "request_id", req.ID().String())
		} else {
			loginCode = code
		}
	}

	// Notificações são side-effects best-effort. Falhas só loga.
	//
	// CONFIRMAÇÃO ao estudante: SÍNCRONA. Travar 1-2s no HTTP é aceitável aqui
	// porque o user está esperando a tela de "obrigado" e o email é a próxima
	// ação esperada (entrar no link de magic-link). Se atrasar, ele vê delay.
	//
	// ALERTA ao admin: ASSÍNCRONO. Goroutine + context.Background() com timeout
	// próprio (30s). Razões: (a) admin não precisa receber em tempo real do
	// submit, (b) Resend pode demorar 2-5s e travar a UX do estudante é pior do
	// que atrasar o alerta do admin em segundos, (c) request cancela não pode
	// abortar o envio (estudante fecha aba ainda assim queremos notificar).
	if uc.notifier != nil {
		if err := uc.notifier.SendReceivedConfirmation(ctx, req.Email(), req.Name(), req.ID(), req.Subject(), loginCode); err != nil {
			uc.logWarn("falha enviando confirmação ao estudante", "err", err, "request_id", req.ID().String())
		}

		// Alerta admin: resolve destinatários DEPOIS, dentro da goroutine, pra
		// não bloquear a resposta HTTP. Estratégia:
		//   1. Query DB (users.role='admin') — fonte primária.
		//   2. Se falhar OU vazio: fallback pra env var ADMIN_EMAIL_ALLOWLIST.
		//   3. Se ambos vazios: log warn, sem-op (request fica no DB, admin
		//      pode ver via /admin/study-requests mesmo sem email).
		reqCopy := req
		fallback := append([]string(nil), uc.adminEmailsFallback...)
		reqID := req.ID().String()
		lookup := uc.adminLookup
		notifier := uc.notifier
		logger := uc.logger

		go func() {
			notifyCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			defer cancel()

			emails := resolveAdminEmails(notifyCtx, lookup, fallback, reqID, logger)
			if len(emails) == 0 {
				logWarnTo(logger, "nenhum admin configurado pra receber alerta", "request_id", reqID)
				return
			}
			if err := notifier.SendAdminNotification(notifyCtx, emails, reqCopy); err != nil {
				logWarnTo(logger, "falha notificando admins", "err", err, "request_id", reqID, "admin_count", len(emails))
				return
			}
			logInfoTo(logger, "admins notificados", "request_id", reqID, "admin_count", len(emails))
		}()
	}

	return &CreateResult{
		ID:              req.ID().String(),
		Status:          req.Status().String(),
		AttachmentCount: len(req.Attachments()),
	}, nil
}

func (uc *CreateUseCase) logWarn(msg string, keyvals ...any) {
	logWarnTo(uc.logger, msg, keyvals...)
}

func (uc *CreateUseCase) logInfo(msg string, keyvals ...any) {
	logInfoTo(uc.logger, msg, keyvals...)
}

// resolveAdminEmails tenta DB primeiro; cai pro fallback se erro/vazio.
// Função livre (não método) pra simplificar uso dentro de goroutine sem
// segurar referência ao receiver.
func resolveAdminEmails(ctx context.Context, lookup domsr.AdminEmailLookup, fallback []string, reqID string, logger *slog.Logger) []string {
	if lookup != nil {
		emails, err := lookup.ListAdminEmails(ctx)
		if err != nil {
			logWarnTo(logger, "lookup de admins no DB falhou, usando fallback (env)", "err", err, "request_id", reqID, "fallback_count", len(fallback))
		} else if len(emails) > 0 {
			return emails
		} else {
			logWarnTo(logger, "DB retornou 0 admins (role='admin'), usando fallback (env)", "request_id", reqID, "fallback_count", len(fallback))
		}
	}
	return fallback
}

func logWarnTo(logger *slog.Logger, msg string, keyvals ...any) {
	if logger != nil {
		logger.Warn(msg, keyvals...)
	}
}

func logInfoTo(logger *slog.Logger, msg string, keyvals ...any) {
	if logger != nil {
		logger.Info(msg, keyvals...)
	}
}
