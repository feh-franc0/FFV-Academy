// Package handlers — curriculum_handler.go expõe a API do currículo educational.
//
// Endpoints públicos: listagem, artigo por slug, busca.
// Endpoints admin: criação, edição, soft-delete (protegidos por RequireAdmin).
package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	appcurriculum "github.com/fernandofv/api/internal/application/curriculum"
	domcurriculum "github.com/fernandofv/api/internal/domain/curriculum"
)

// CurriculumHandler expõe os endpoints do currículo educational.
type CurriculumHandler struct {
	getArticle     *appcurriculum.GetArticleUseCase
	listCurriculum *appcurriculum.ListCurriculumUseCase
	search         *appcurriculum.SearchCurriculumUseCase
	repo           domcurriculum.Repository // usado nas operações admin (save/update/delete)
}

// NewCurriculumHandler cria um novo handler de currículo.
func NewCurriculumHandler(
	getArticle *appcurriculum.GetArticleUseCase,
	listCurriculum *appcurriculum.ListCurriculumUseCase,
	search *appcurriculum.SearchCurriculumUseCase,
	repo domcurriculum.Repository,
) *CurriculumHandler {
	return &CurriculumHandler{
		getArticle:     getArticle,
		listCurriculum: listCurriculum,
		search:         search,
		repo:           repo,
	}
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

// articleResponse é o DTO de resposta de um artigo (sem campos internos do domínio).
type articleResponse struct {
	ID         string `json:"id"`
	Slug       string `json:"slug"`
	Title      string `json:"title"`
	TrailID    string `json:"trail_id"`
	HubID      string `json:"hub_id"`
	ContentMD  string `json:"content_md,omitempty"` // omitido em listagens — só em GetArticle
	XP         int    `json:"xp"`
	ReadTime   int    `json:"read_time"`
	Difficulty string `json:"difficulty"`
	Order      int    `json:"order"`
	Published  bool   `json:"published"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

// articleListItem omite content_md para economizar bandwidth na listagem.
type articleListItem struct {
	ID         string `json:"id"`
	Slug       string `json:"slug"`
	Title      string `json:"title"`
	TrailID    string `json:"trail_id"`
	HubID      string `json:"hub_id"`
	XP         int    `json:"xp"`
	ReadTime   int    `json:"read_time"`
	Difficulty string `json:"difficulty"`
	Order      int    `json:"order"`
	Published  bool   `json:"published"`
}

// createArticleRequest é o body de criação de artigo (admin).
type createArticleRequest struct {
	Slug       string `json:"slug"`
	Title      string `json:"title"`
	TrailID    string `json:"trail_id"`
	HubID      string `json:"hub_id"`
	ContentMD  string `json:"content_md"`
	XP         int    `json:"xp"`
	ReadTime   int    `json:"read_time"`
	Difficulty string `json:"difficulty"`
	Order      int    `json:"order"`
	Published  bool   `json:"published"`
}

// updateArticleRequest é o body de atualização de artigo (admin).
// Campos zerados são ignorados pelo domínio.
type updateArticleRequest struct {
	Title      string `json:"title"`
	ContentMD  string `json:"content_md"`
	XP         int    `json:"xp"`
	ReadTime   int    `json:"read_time"`
	Difficulty string `json:"difficulty"`
	Order      int    `json:"order"`
	Published  bool   `json:"published"`
}

// articleWithBlocksResponse é a resposta da rota CMS-driven (GET /:slug/blocks).
// Diferente de articleResponse, NÃO inclui content_md (legacy) — apenas blocks.
// updated_at é exposto como time.Time para precisão do ETag client-side.
type articleWithBlocksResponse struct {
	Slug       string                  `json:"slug"`
	Title      string                  `json:"title"`
	TrailID    string                  `json:"trail_id"`
	HubID      string                  `json:"hub_id"`
	XP         int                     `json:"xp"`
	ReadTime   int                     `json:"read_time"`
	Difficulty string                  `json:"difficulty"`
	Order      int                     `json:"order"`
	UpdatedAt  time.Time               `json:"updated_at"`
	Blocks     []*domcurriculum.Block  `json:"blocks"`
}

// ─── Endpoints públicos ───────────────────────────────────────────────────────

// List retorna artigos paginados, opcionalmente filtrados por trilha.
// GET /api/v1/curriculum?trail_id=&limit=20&offset=0
func (h *CurriculumHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	trailID := q.Get("trail_id")
	limit := parseIntParam(q.Get("limit"), 20)
	offset := parseIntParam(q.Get("offset"), 0)

	articles, total, err := h.listCurriculum.Execute(r.Context(), trailID, limit, offset)
	if err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}

	items := make([]articleListItem, 0, len(articles))
	for _, a := range articles {
		items = append(items, articleListItem{
			ID:         a.ID(),
			Slug:       a.Slug(),
			Title:      a.Title(),
			TrailID:    a.TrailID(),
			HubID:      a.HubID(),
			XP:         a.XP(),
			ReadTime:   a.ReadTime(),
			Difficulty: a.Difficulty(),
			Order:      a.Order(),
			Published:  a.Published(),
		})
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"data":   items,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// GetBySlug retorna um artigo completo (com content_md) pelo slug.
// GET /api/v1/curriculum/:slug
func (h *CurriculumHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	article, err := h.getArticle.Execute(r.Context(), slug)
	if err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}
	WriteJSON(w, http.StatusOK, toArticleResponse(article, true))
}

// GetBlocks retorna o artigo + sua árvore de blocks (CMS-driven content).
// Esta é a rota usada pela rota dinâmica do frontend (/aprenda/[slug]).
// Cache HTTP via ETag: cliente envia If-None-Match → 304 se não mudou.
//
// GET /api/v1/curriculum/:slug/blocks
func (h *CurriculumHandler) GetBlocks(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	article, err := h.getArticle.Execute(r.Context(), slug)
	if err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}

	blocks, err := h.repo.FindBlocksBySlug(r.Context(), slug)
	if err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}

	// ETag baseado em updatedAt do artigo (mais determinístico que hash).
	etag := `"v` + article.UpdatedAt().UTC().Format("20060102150405.000000") + `"`
	if match := r.Header.Get("If-None-Match"); match == etag {
		w.WriteHeader(http.StatusNotModified)
		return
	}
	w.Header().Set("ETag", etag)
	w.Header().Set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400")

	WriteJSON(w, http.StatusOK, articleWithBlocksResponse{
		Slug:           article.Slug(),
		Title:          article.Title(),
		TrailID:        article.TrailID(),
		HubID:          article.HubID(),
		XP:             article.XP(),
		ReadTime:       article.ReadTime(),
		Difficulty:     article.Difficulty(),
		Order:          article.Order(),
		UpdatedAt:      article.UpdatedAt(),
		Blocks:         blocks,
	})
}

// Search busca artigos por similaridade de título.
// GET /api/v1/curriculum/search?q=&limit=10
func (h *CurriculumHandler) Search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		WriteError(w, http.StatusBadRequest, "parâmetro 'q' é obrigatório", "validation-error")
		return
	}

	articles, err := h.search.Execute(r.Context(), q)
	if err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}

	items := make([]articleListItem, 0, len(articles))
	for _, a := range articles {
		items = append(items, articleListItem{
			ID:         a.ID(),
			Slug:       a.Slug(),
			Title:      a.Title(),
			TrailID:    a.TrailID(),
			HubID:      a.HubID(),
			XP:         a.XP(),
			ReadTime:   a.ReadTime(),
			Difficulty: a.Difficulty(),
			Order:      a.Order(),
			Published:  a.Published(),
		})
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"data": items,
	})
}

// ─── Endpoints admin ──────────────────────────────────────────────────────────

// Create cria um novo artigo no currículo.
// POST /api/v1/admin/curriculum
func (h *CurriculumHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req createArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "body inválido", "validation-error")
		return
	}

	if req.XP == 0 {
		req.XP = 30 // default
	}
	if req.ReadTime == 0 {
		req.ReadTime = 5 // default
	}

	article, err := domcurriculum.NewArticle(
		req.Slug, req.Title, req.TrailID, req.HubID,
		req.ContentMD, req.Difficulty, req.XP, req.ReadTime, req.Order, req.Published,
	)
	if err != nil {
		WriteError(w, http.StatusBadRequest, err.Error(), "validation-error")
		return
	}

	if err := h.repo.Save(r.Context(), article); err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}

	WriteJSON(w, http.StatusCreated, map[string]string{"slug": req.Slug})
}

// Update atualiza um artigo existente.
// PATCH /api/v1/admin/curriculum/:slug
func (h *CurriculumHandler) Update(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	// Busca o artigo atual para aplicar atualizações parciais.
	article, err := h.getArticle.Execute(r.Context(), slug)
	if err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}

	var req updateArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "body inválido", "validation-error")
		return
	}

	// Aplica as atualizações via método do domínio.
	article.Update(req.Title, req.ContentMD, req.Difficulty, req.XP, req.ReadTime, req.Order, req.Published)

	if err := h.repo.Update(r.Context(), article); err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}

	WriteJSON(w, http.StatusOK, toArticleResponse(article, true))
}

// Delete realiza soft-delete de um artigo.
// DELETE /api/v1/admin/curriculum/:slug
func (h *CurriculumHandler) Delete(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if err := h.repo.SoftDelete(r.Context(), slug); err != nil {
		HandleDomainErrorCtx(r, w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ─── Helper ───────────────────────────────────────────────────────────────────

// toArticleResponse converte um Article em DTO de resposta.
// withContent=false omite o content_md (para listagens).
func toArticleResponse(a *domcurriculum.Article, withContent bool) articleResponse {
	resp := articleResponse{
		ID:         a.ID(),
		Slug:       a.Slug(),
		Title:      a.Title(),
		TrailID:    a.TrailID(),
		HubID:      a.HubID(),
		XP:         a.XP(),
		ReadTime:   a.ReadTime(),
		Difficulty: a.Difficulty(),
		Order:      a.Order(),
		Published:  a.Published(),
		CreatedAt:  a.CreatedAt().Format("2006-01-02T15:04:05Z"),
		UpdatedAt:  a.UpdatedAt().Format("2006-01-02T15:04:05Z"),
	}
	if withContent {
		resp.ContentMD = a.ContentMD()
	}
	return resp
}
