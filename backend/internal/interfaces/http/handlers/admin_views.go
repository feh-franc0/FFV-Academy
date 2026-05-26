// Package handlers — AdminViews: feed de "quem acessou o quê" para o admin.
//
// Lê de `module_views` (migration 38 + enrich 51) com filtros por base,
// usuário (email), módulo, kind, período. Retorna até 200 itens ordenados
// por viewed_at DESC.
//
// SEGURANÇA: admin-only (proteção via middleware RequireAdmin no router).
// Retorna user_email/display_name DENORMALIZADOS — o snapshot do tracking,
// não JOIN com `users`. Permite consultar histórico mesmo após exclusão de
// conta (auditoria).
package handlers

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// AdminViewsRepository — port de leitura do feed.
//
// ListViews retorna (entries, total, err). Paginação é offset+limit pra ser
// consistente com o restante do admin (AdminPagination 10/50/100). Volumes
// reais até ~10M views suportam OFFSET sem dor; quando passar disso, vale
// voltar pra keyset cursor.
type AdminViewsRepository interface {
	ListViews(ctx context.Context, q ListViewsQuery) (entries []ViewEntry, total int64, err error)
}

// ListViewsQuery — filtros aceitos. Todos opcionais.
type ListViewsQuery struct {
	BaseSlug  string    // exato
	Kind      string    // module|page|simulado|admin|other
	UserEmail string    // exato (lowercase)
	Slug      string    // exato
	Since     time.Time // viewed_at >= since
	Until     time.Time // viewed_at <  until
	Limit     int       // 1..200, default 50
	Offset    int       // default 0
}

// ViewEntry — uma linha do feed.
type ViewEntry struct {
	ID              int64     `json:"id"`
	ViewedAt        time.Time `json:"viewedAt"`
	BaseSlug        string    `json:"baseSlug,omitempty"`
	Kind            string    `json:"kind"`
	Slug            string    `json:"slug,omitempty"`
	Path            string    `json:"path,omitempty"`
	HubID           string    `json:"hubId,omitempty"`
	TrailID         string    `json:"trailId,omitempty"`
	UserID          string    `json:"userId,omitempty"`
	UserEmail       string    `json:"userEmail,omitempty"`
	UserDisplayName string    `json:"userDisplayName,omitempty"`
	AnonID          string    `json:"anonId,omitempty"`
	SessionID       string    `json:"sessionId,omitempty"`
	// Identidade já calculada pelo backend pra UI consumir direto.
	// "fer@gmail.com" se logado, "Visitante anônimo (abcd1234)" se anônimo,
	// "Desconhecido" se sem nem anonId.
	DisplayLabel string `json:"displayLabel"`
}

// ListViewsResponse — envelope da resposta.
type ListViewsResponse struct {
	Views []ViewEntry `json:"views"`
	Count int         `json:"count"`
	Total int64       `json:"total"`
}

// AdminViewsHandler — exposes GET /api/v1/admin/views.
type AdminViewsHandler struct {
	repo AdminViewsRepository
}

func NewAdminViewsHandler(repo AdminViewsRepository) *AdminViewsHandler {
	return &AdminViewsHandler{repo: repo}
}

// List — GET /api/v1/admin/views
//
// Query params (todos opcionais):
//   - base        slug da base (tecnologia, medicina-veterinaria, …)
//   - kind        module | page | simulado | admin | other
//   - user        email (case-insensitive)
//   - slug        slug do módulo/página
//   - since       RFC3339; default = now - 24h
//   - until       RFC3339; default = now
//   - limit       1..200; default 50
func (h *AdminViewsHandler) List(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "admin views não configurado", "service-unavailable")
		return
	}

	q := parseListViewsQuery(r)

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	entries, total, err := h.repo.ListViews(ctx, q)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	// Display label calculada aqui pra UI não precisar replicar lógica.
	for i := range entries {
		entries[i].DisplayLabel = computeDisplayLabel(entries[i])
	}

	w.Header().Set("Cache-Control", "private, max-age=10")
	WriteJSON(w, http.StatusOK, ListViewsResponse{
		Views: entries,
		Count: len(entries),
		Total: total,
	})
}

func computeDisplayLabel(e ViewEntry) string {
	if e.UserDisplayName != "" && e.UserEmail != "" {
		return e.UserDisplayName + " <" + e.UserEmail + ">"
	}
	if e.UserEmail != "" {
		return e.UserEmail
	}
	if e.UserDisplayName != "" {
		return e.UserDisplayName
	}
	if e.AnonID != "" {
		short := e.AnonID
		if len(short) > 8 {
			short = short[:8]
		}
		return "Visitante anônimo (" + short + ")"
	}
	return "Desconhecido"
}

func parseListViewsQuery(r *http.Request) ListViewsQuery {
	q := ListViewsQuery{
		Limit: 50,
	}
	v := r.URL.Query()

	q.BaseSlug = strings.TrimSpace(v.Get("base"))
	q.Kind = strings.TrimSpace(v.Get("kind"))
	q.UserEmail = strings.ToLower(strings.TrimSpace(v.Get("user")))
	q.Slug = strings.TrimSpace(v.Get("slug"))

	if s := v.Get("since"); s != "" {
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			q.Since = t
		}
	}
	if s := v.Get("until"); s != "" {
		if t, err := time.Parse(time.RFC3339, s); err == nil {
			q.Until = t
		}
	}
	// Defaults sensatos: últimas 24h.
	if q.Since.IsZero() {
		q.Since = time.Now().UTC().Add(-24 * time.Hour)
	}
	if q.Until.IsZero() {
		q.Until = time.Now().UTC()
	}

	if s := v.Get("limit"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 {
			q.Limit = n
		}
	}
	if q.Limit < 1 || q.Limit > 200 {
		q.Limit = 50
	}

	if s := v.Get("offset"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n >= 0 {
			q.Offset = n
		}
	}

	return q
}
