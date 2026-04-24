package handlers

import (
	"net/http"
	"strconv"
	"time"

	appevent "github.com/fernandofv/api/internal/application/event"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	postgresinfra "github.com/fernandofv/api/internal/infrastructure/persistence/postgres"
)

// AdminHandler expõe os endpoints de administração.
//
// PADRÃO: protegido pelo middleware RequireAdmin (role=admin no JWT).
// Acesso restrito — nunca exposto publicamente.
type AdminHandler struct {
	userRepo       domidentity.UserRepository
	attemptRepo    domsim.AttemptRepository
	eventIngest    *appevent.IngestEventUseCase
	auditLogRepo   postgresinfra.AdminAuditReader
}

func NewAdminHandler(
	userRepo domidentity.UserRepository,
	attemptRepo domsim.AttemptRepository,
	eventIngest *appevent.IngestEventUseCase,
) *AdminHandler {
	return &AdminHandler{
		userRepo:    userRepo,
		attemptRepo: attemptRepo,
		eventIngest: eventIngest,
	}
}

// WithAuditLog injeta o repositório de audit log no handler.
// Padrão builder para retrocompatibilidade com código existente.
func (h *AdminHandler) WithAuditLog(repo postgresinfra.AdminAuditReader) *AdminHandler {
	h.auditLogRepo = repo
	return h
}

// GetStats retorna métricas gerais do sistema.
// GET /api/v1/admin/stats
func (h *AdminHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"status": "operational",
	})
}

// GetAuditLog lista o audit_log de mutations com suporte a paginação e filtros.
// GET /api/v1/admin/audit?limit=50&offset=0&user_id=&action=&from=&to=
//
// Parâmetros:
//   - limit: máximo de registros (padrão 50, máximo 500)
//   - offset: deslocamento para paginação
//   - user_id: filtra por usuário específico (opcional)
//   - action: filtra por prefixo de ação (opcional)
//   - from: data ISO 8601 início (opcional)
//   - to: data ISO 8601 fim (opcional)
func (h *AdminHandler) GetAuditLog(w http.ResponseWriter, r *http.Request) {
	if h.auditLogRepo == nil {
		WriteError(w, http.StatusServiceUnavailable, "audit log não configurado", "service-unavailable")
		return
	}

	q := r.URL.Query()

	// Paginação — limita o máximo para evitar queries custosas.
	limit := parseIntParam(q.Get("limit"), 50)
	if limit > 500 {
		limit = 500
	}
	if limit < 1 {
		limit = 1
	}
	offset := parseIntParam(q.Get("offset"), 0)
	if offset < 0 {
		offset = 0
	}

	// Filtros opcionais.
	filter := postgresinfra.AuditLogFilter{
		UserID: q.Get("user_id"),
		Action: q.Get("action"),
		Limit:  limit,
		Offset: offset,
	}

	// Datas ISO 8601 — ignoradas silenciosamente se inválidas.
	if from := q.Get("from"); from != "" {
		if t, err := time.Parse(time.RFC3339, from); err == nil {
			filter.From = &t
		}
	}
	if to := q.Get("to"); to != "" {
		if t, err := time.Parse(time.RFC3339, to); err == nil {
			filter.To = &t
		}
	}

	entries, total, err := h.auditLogRepo.List(r.Context(), filter)
	if err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"data":   entries,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// parseIntParam parseia um parâmetro de query string como int com fallback.
func parseIntParam(s string, defaultVal int) int {
	if s == "" {
		return defaultVal
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return defaultVal
	}
	return v
}
