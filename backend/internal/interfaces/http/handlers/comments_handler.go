// Package handlers — Comments: discussão em artigos / trilhas / blocos.
//
// CRUD mínimo no que faz sentido pro MVP:
//   - GET   /api/v1/comments?targetType=article&targetId=<slug>  → lista (público, paginado)
//   - POST  /api/v1/comments                                     → cria (JWT)
//   - DELETE /api/v1/comments/{id}                               → soft-delete pelo autor (JWT)
//   - POST  /api/v1/admin/comments/{id}/hide                     → moderar (admin)
//
// Threading: parent_id opcional, profundidade limitada a 2 níveis na app layer.
package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// CommentsRepository é o port que o handler usa.
type CommentsRepository interface {
	Create(ctx context.Context, c CommentCreateInput) (Comment, error)
	ListByTarget(ctx context.Context, targetType, targetID string, limit, offset int) ([]Comment, int64, error)
	SoftDelete(ctx context.Context, commentID, userID string, isAdmin bool) error
	UpdateStatus(ctx context.Context, commentID, status string) error
}

// Comment é a projeção pública de um comentário.
type Comment struct {
	ID         string    `json:"id"`
	UserID     string    `json:"userId"`
	AuthorName string    `json:"authorName"`
	TargetType string    `json:"targetType"`
	TargetID   string    `json:"targetId"`
	ParentID   string    `json:"parentId,omitempty"`
	Content    string    `json:"content"`
	Status     string    `json:"status"`
	Edited     bool      `json:"edited"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

// CommentCreateInput — entrada normalizada após validação do handler.
type CommentCreateInput struct {
	UserID     string
	TargetType string
	TargetID   string
	ParentID   string // vazio = comentário raiz
	Content    string
}

// CommentsHandler — único, contém todas as rotas relacionadas.
type CommentsHandler struct {
	repo CommentsRepository
}

func NewCommentsHandler(repo CommentsRepository) *CommentsHandler {
	return &CommentsHandler{repo: repo}
}

type commentCreateRequest struct {
	TargetType string `json:"targetType"`
	TargetID   string `json:"targetId"`
	ParentID   string `json:"parentId,omitempty"`
	Content    string `json:"content"`
}

// Create — POST /api/v1/comments
func (h *CommentsHandler) Create(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "comments não configurados", "service-unavailable")
		return
	}

	userID := string(middleware.UserIDFromContext(r.Context()))
	if userID == "" {
		WriteError(w, http.StatusUnauthorized, "autenticação requerida", "unauthorized")
		return
	}

	var req commentCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "json inválido", "validation")
		return
	}

	if !isValidTargetType(req.TargetType) {
		WriteError(w, http.StatusBadRequest, "targetType inválido (article|trail|block)", "validation")
		return
	}
	req.TargetID = strings.TrimSpace(req.TargetID)
	if req.TargetID == "" || len(req.TargetID) > 200 {
		WriteError(w, http.StatusBadRequest, "targetId obrigatório (≤200 chars)", "validation")
		return
	}
	content := strings.TrimSpace(req.Content)
	if len(content) < 1 || len(content) > 4000 {
		WriteError(w, http.StatusBadRequest, "content entre 1 e 4000 chars", "validation")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	c, err := h.repo.Create(ctx, CommentCreateInput{
		UserID:     userID,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		ParentID:   strings.TrimSpace(req.ParentID),
		Content:    content,
	})
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusCreated, c)
}

// List — GET /api/v1/comments?targetType=article&targetId=<slug>&limit=50&offset=0
func (h *CommentsHandler) List(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteJSON(w, http.StatusOK, map[string]interface{}{"data": []Comment{}, "total": 0})
		return
	}

	q := r.URL.Query()
	targetType := q.Get("targetType")
	targetID := strings.TrimSpace(q.Get("targetId"))
	if !isValidTargetType(targetType) || targetID == "" {
		WriteError(w, http.StatusBadRequest, "targetType e targetId obrigatórios", "validation")
		return
	}

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

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	items, total, err := h.repo.ListByTarget(ctx, targetType, targetID, limit, offset)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	if items == nil {
		items = []Comment{}
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"data":   items,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// Delete — DELETE /api/v1/comments/{id} (autor ou admin)
func (h *CommentsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "comments não configurados", "service-unavailable")
		return
	}

	userID := string(middleware.UserIDFromContext(r.Context()))
	if userID == "" {
		WriteError(w, http.StatusUnauthorized, "autenticação requerida", "unauthorized")
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		WriteError(w, http.StatusBadRequest, "id obrigatório", "validation")
		return
	}

	isAdmin := middleware.IsAdminFromContext(r.Context())

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	if err := h.repo.SoftDelete(ctx, id, userID, isAdmin); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// Hide — POST /api/v1/admin/comments/{id}/hide (admin only)
func (h *CommentsHandler) Hide(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "comments não configurados", "service-unavailable")
		return
	}
	id := chi.URLParam(r, "id")
	if id == "" {
		WriteError(w, http.StatusBadRequest, "id obrigatório", "validation")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	if err := h.repo.UpdateStatus(ctx, id, "hidden"); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func isValidTargetType(t string) bool {
	return t == "article" || t == "trail" || t == "block"
}
