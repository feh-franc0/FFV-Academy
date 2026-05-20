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
	ListByTarget(ctx context.Context, targetType, targetID string, limit, offset int, userID string) ([]Comment, int64, error)
	SoftDelete(ctx context.Context, commentID, userID string, isAdmin bool) error
	UpdateStatus(ctx context.Context, commentID, status string) error
	// Vote: insere ou atualiza voto. vote ∈ {-1, 1}.
	Vote(ctx context.Context, commentID, userID string, vote int) error
	// UnVote: remove voto do user nesse comment (idempotente).
	UnVote(ctx context.Context, commentID, userID string) error
	// Report: registra reporte (uma vez por user/comment). Auto-flag em ≥3 via trigger DB.
	Report(ctx context.Context, commentID, reporterID, reason string) error
	// ListByStatus: usado por admin pra listar flagged/hidden pra moderação.
	ListByStatus(ctx context.Context, status string, limit, offset int) ([]Comment, int64, error)
	// GetForParentCheck: busca info mínima pra validar parent (target + parent_id próprio).
	// Retorna ErrNotFound se commentID não existe.
	GetForParentCheck(ctx context.Context, commentID string) (ParentInfo, error)
}

// ParentInfo — info mínima pra validar que o parent existe, é do mesmo target,
// e não é um reply (enforça profundidade ≤1).
type ParentInfo struct {
	TargetType string
	TargetID   string
	HasParent  bool // true se o próprio parent já tem parent_id (reply de reply)
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
	Score      int       `json:"score"`              // soma de upvotes/downvotes
	UserVote   int       `json:"userVote,omitempty"` // -1/0/+1 do usuário atual (0 = ninguém ou anônimo)
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
	// Validação completa: tamanho + URLs + caps + char-repeat + banned words.
	// Cobre 90% dos casos óbvios de spam sem precisar de serviço externo.
	if check := CheckCommentForSpam(content); !check.OK {
		WriteError(w, http.StatusBadRequest, check.Reason, check.Code)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	parentID := strings.TrimSpace(req.ParentID)
	// Threading invariants — audit de business logic identificou que o
	// comment_handler.go documenta "profundidade limitada a 2 níveis na app
	// layer" mas NÃO valida. Sem isso:
	//   - parent_id de OUTRO target (article X vê reply de article Y) →
	//     árvore inconsistente
	//   - reply de reply de reply (profundidade infinita) →
	//     UX quebrada, performance ruim
	if parentID != "" {
		info, err := h.repo.GetForParentCheck(ctx, parentID)
		if err != nil {
			HandleDomainError(w, err)
			return
		}
		if info.TargetType != req.TargetType || info.TargetID != req.TargetID {
			WriteError(w, http.StatusBadRequest, "parent comment pertence a outro target", "validation")
			return
		}
		if info.HasParent {
			WriteError(w, http.StatusBadRequest, "reply de reply não permitido (profundidade máxima: 1)", "validation")
			return
		}
	}

	c, err := h.repo.Create(ctx, CommentCreateInput{
		UserID:     userID,
		TargetType: req.TargetType,
		TargetID:   req.TargetID,
		ParentID:   parentID,
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

	// userID opcional — quando autenticado, preenchemos userVote em cada comment
	// pra UI mostrar "você upvotou esse".
	userID := string(middleware.UserIDFromContext(r.Context()))
	items, total, err := h.repo.ListByTarget(ctx, targetType, targetID, limit, offset, userID)
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

// AdminList — GET /api/v1/admin/comments?status=flagged&limit=50&offset=0
// Lista comments por status pra moderação. Admin only (auth no router).
func (h *CommentsHandler) AdminList(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteJSON(w, http.StatusOK, map[string]interface{}{"data": []Comment{}, "total": 0})
		return
	}
	q := r.URL.Query()
	status := q.Get("status")
	if status == "" {
		status = "flagged"
	}
	// Whitelist — não permitir status arbitrário (proteção defesa em profundidade).
	if status != "flagged" && status != "hidden" && status != "visible" && status != "deleted" {
		WriteError(w, http.StatusBadRequest, "status inválido", "validation")
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

	items, total, err := h.repo.ListByStatus(ctx, status, limit, offset)
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

// Hide — POST /api/v1/admin/comments/{id}/hide (admin only)
func (h *CommentsHandler) Hide(w http.ResponseWriter, r *http.Request) {
	h.changeStatus(w, r, "hidden")
}

// Restore — POST /api/v1/admin/comments/{id}/restore (admin only).
// Devolve comentário marcado como flagged/hidden pra 'visible' (após revisão).
func (h *CommentsHandler) Restore(w http.ResponseWriter, r *http.Request) {
	h.changeStatus(w, r, "visible")
}

func (h *CommentsHandler) changeStatus(w http.ResponseWriter, r *http.Request, status string) {
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
	if err := h.repo.UpdateStatus(ctx, id, status); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func isValidTargetType(t string) bool {
	return t == "article" || t == "trail" || t == "block"
}

// ─── Vote ─────────────────────────────────────────────────────────────────────
//
// POST /api/v1/comments/{id}/vote — body: {"vote": 1} ou {"vote": -1}
// Insere ou atualiza voto do user. PK composta no DB garante 1 voto por par.
// Score do comment é atualizado via trigger postgres (sem agregação cara).
//
// Vote = 0 → remove o voto (atalho pra UnVote).

type commentVoteRequest struct {
	Vote int `json:"vote"`
}

func (h *CommentsHandler) Vote(w http.ResponseWriter, r *http.Request) {
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
	var req commentVoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "json inválido", "validation")
		return
	}
	if req.Vote != -1 && req.Vote != 0 && req.Vote != 1 {
		WriteError(w, http.StatusBadRequest, "vote deve ser -1, 0 ou 1", "validation")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	var err error
	if req.Vote == 0 {
		err = h.repo.UnVote(ctx, id, userID)
	} else {
		err = h.repo.Vote(ctx, id, userID, req.Vote)
	}
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─── Report ───────────────────────────────────────────────────────────────────
//
// POST /api/v1/comments/{id}/report — body: {"reason": "spam"}
// Registra reporte. PK composta no DB evita reportes duplicados do mesmo user.
// Trigger auto-flag em ≥3 reports — admin revisa via /admin/comments.

type commentReportRequest struct {
	Reason string `json:"reason"`
}

func (h *CommentsHandler) Report(w http.ResponseWriter, r *http.Request) {
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
	var req commentReportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		// reason vazio é ok — registra report sem motivo
		req = commentReportRequest{}
	}
	reason := strings.TrimSpace(req.Reason)
	if len(reason) > 200 {
		reason = reason[:200]
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	if err := h.repo.Report(ctx, id, userID, reason); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
