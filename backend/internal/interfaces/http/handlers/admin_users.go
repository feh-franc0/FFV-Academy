// Package handlers — Admin Users: listagem paginada de usuários.
package handlers

import (
	"context"
	"net/http"
	"time"
)

// AdminUsersRepository abstrai a fonte de dados da listagem admin de users.
type AdminUsersRepository interface {
	ListUsers(ctx context.Context, filter AdminUserFilter) ([]AdminUserListItem, int64, error)
}

// AdminUserFilter — filtros aceitos pelo endpoint /admin/users.
type AdminUserFilter struct {
	Search string // matching em email/name (ILIKE)
	Role   string // "user" | "admin"
	Limit  int
	Offset int
}

// AdminUserListItem — projeção segura pra dashboard admin.
//
// Campos sensíveis (senha, magic tokens) nunca aparecem aqui.
type AdminUserListItem struct {
	ID               string    `json:"id"`
	Email            string    `json:"email"`
	Name             string    `json:"name,omitempty"`
	Phone            string    `json:"phone,omitempty"`
	Role             string    `json:"role"`
	MarketingConsent bool      `json:"marketingConsent"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
	DeletedAt        *time.Time `json:"deletedAt,omitempty"`
}

type adminUsersResponse struct {
	Data   []AdminUserListItem `json:"data"`
	Total  int64               `json:"total"`
	Limit  int                 `json:"limit"`
	Offset int                 `json:"offset"`
}

// WithAdminUsers injeta o repo de listagem.
func (h *AdminHandler) WithAdminUsers(repo AdminUsersRepository) *AdminHandler {
	h.usersRepo = repo
	return h
}

// ListUsers — GET /api/v1/admin/users?search=&role=&limit=50&offset=0
func (h *AdminHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	if h.usersRepo == nil {
		WriteError(w, http.StatusServiceUnavailable, "admin users not configured", "service-unavailable")
		return
	}

	q := r.URL.Query()
	limit := parseIntParam(q.Get("limit"), 50)
	if limit > 200 {
		limit = 200
	}
	if limit < 1 {
		limit = 1
	}
	offset := parseIntParam(q.Get("offset"), 0)
	if offset < 0 {
		offset = 0
	}

	role := q.Get("role")
	if role != "" && role != "user" && role != "admin" {
		WriteError(w, http.StatusBadRequest, "role inválido (user|admin)", "validation")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	items, total, err := h.usersRepo.ListUsers(ctx, AdminUserFilter{
		Search: q.Get("search"),
		Role:   role,
		Limit:  limit,
		Offset: offset,
	})
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, adminUsersResponse{
		Data:   items,
		Total:  total,
		Limit:  limit,
		Offset: offset,
	})
}
