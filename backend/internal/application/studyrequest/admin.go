package studyrequest

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
)

// ─────────────────────────────────────────────────────────────────
// ListUseCase — listagem paginada para o admin
// ─────────────────────────────────────────────────────────────────

type ListUseCase struct {
	repo domsr.Repository
}

func NewListUseCase(repo domsr.Repository) *ListUseCase {
	return &ListUseCase{repo: repo}
}

// ListQuery agrupa filtros aceitos.
type ListQuery struct {
	Status    string
	StudyArea string
	Search    string
	Limit     int
	Offset    int
}

type ListResult struct {
	Items  []*domsr.StudyRequest
	Total  int64
	Limit  int
	Offset int
}

func (uc *ListUseCase) Execute(ctx context.Context, q ListQuery) (*ListResult, error) {
	if q.Limit <= 0 {
		q.Limit = 50
	}
	if q.Limit > 200 {
		q.Limit = 200
	}
	if q.Offset < 0 {
		q.Offset = 0
	}
	filter := domsr.Filter{
		StudyArea: q.StudyArea,
		Search:    q.Search,
		Limit:     q.Limit,
		Offset:    q.Offset,
	}
	if q.Status != "" {
		status := domsr.Status(q.Status)
		if !status.IsValid() {
			return nil, shared.NewValidationError(fmt.Sprintf("status inválido: %q", q.Status))
		}
		filter.Status = status
	}

	items, total, err := uc.repo.List(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("listar solicitações: %w", err)
	}
	return &ListResult{Items: items, Total: total, Limit: q.Limit, Offset: q.Offset}, nil
}

// ─────────────────────────────────────────────────────────────────
// GetUseCase — busca um agregado por ID
// ─────────────────────────────────────────────────────────────────

type GetUseCase struct {
	repo domsr.Repository
}

func NewGetUseCase(repo domsr.Repository) *GetUseCase {
	return &GetUseCase{repo: repo}
}

func (uc *GetUseCase) Execute(ctx context.Context, id string) (*domsr.StudyRequest, error) {
	if id == "" {
		return nil, shared.NewValidationError("id é obrigatório")
	}
	return uc.repo.FindByID(ctx, domsr.ID(id))
}

// ─────────────────────────────────────────────────────────────────
// UpdateUseCase — admin muda status e/ou notas internas
// ─────────────────────────────────────────────────────────────────

// UpdateCommand suporta atualizações parciais via ponteiros.
// nil = não tocar; ponteiro pra zero = tocar.
type UpdateCommand struct {
	ID            string
	Status        *string // se setado, valida e muda status
	InternalNotes *string // se setado, atualiza notas (pode ser vazio)
	DeliveredURL  *string // se setado, atualiza URL de entrega (vazio limpa)
}

type UpdateUseCase struct {
	repo     domsr.Repository
	notifier domsr.EmailNotifier
	clock    shared.Clock
	logger   *slog.Logger
}

func NewUpdateUseCase(repo domsr.Repository, clock shared.Clock) *UpdateUseCase {
	return &UpdateUseCase{repo: repo, clock: clock}
}

func (uc *UpdateUseCase) WithNotifier(n domsr.EmailNotifier) *UpdateUseCase {
	uc.notifier = n
	return uc
}

func (uc *UpdateUseCase) WithLogger(l *slog.Logger) *UpdateUseCase {
	uc.logger = l
	return uc
}

func (uc *UpdateUseCase) Execute(ctx context.Context, cmd UpdateCommand) (*domsr.StudyRequest, error) {
	if cmd.ID == "" {
		return nil, shared.NewValidationError("id é obrigatório")
	}

	req, err := uc.repo.FindByID(ctx, domsr.ID(cmd.ID))
	if err != nil {
		return nil, err
	}

	oldStatus := req.Status()
	now := uc.clock.Now()

	if cmd.Status != nil {
		if err := req.ChangeStatus(domsr.Status(*cmd.Status), now); err != nil {
			return nil, err
		}
	}
	if cmd.InternalNotes != nil {
		if err := req.SetInternalNotes(*cmd.InternalNotes, now); err != nil {
			return nil, err
		}
	}
	if cmd.DeliveredURL != nil {
		if err := req.SetDeliveredURL(*cmd.DeliveredURL, now); err != nil {
			return nil, err
		}
	}

	if err := uc.repo.Update(ctx, req); err != nil {
		return nil, fmt.Errorf("atualizar solicitação: %w", err)
	}

	// Notifica estudante apenas se o status mudou.
	if uc.notifier != nil && cmd.Status != nil && req.Status() != oldStatus {
		if err := uc.notifier.SendStatusUpdate(ctx, req.Email(), req.Name(), req.ID(), req.Status(), req.Subject(), req.DeliveredURL()); err != nil {
			uc.logWarn("falha enviando status update", "err", err, "request_id", req.ID().String())
		}
	}

	return req, nil
}

func (uc *UpdateUseCase) logWarn(msg string, keyvals ...any) {
	if uc.logger != nil {
		uc.logger.Warn(msg, keyvals...)
	}
}
