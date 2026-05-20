// Contract tests pra comments: validação de tamanho, anti-spam, auth gate,
// votos e reports. Stub in-memory do repo.
package contract_test

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// ─── Stub repo ────────────────────────────────────────────────────────────

type stubCommentsRepo struct {
	items map[string]*handlers.Comment
	votes map[string]int // key = commentID:userID → vote
	rpts  map[string]bool
	now   func() time.Time
	// Optional override pra forçar erros nos tests
	createErr error
	listErr   error
}

func newStubCommentsRepo() *stubCommentsRepo {
	return &stubCommentsRepo{
		items: map[string]*handlers.Comment{},
		votes: map[string]int{},
		rpts:  map[string]bool{},
		now:   time.Now,
	}
}

func (s *stubCommentsRepo) Create(_ context.Context, in handlers.CommentCreateInput) (handlers.Comment, error) {
	if s.createErr != nil {
		return handlers.Comment{}, s.createErr
	}
	id := "c-" + in.UserID + "-" + in.TargetID[:min(8, len(in.TargetID))]
	c := handlers.Comment{
		ID:         id,
		UserID:     in.UserID,
		TargetType: in.TargetType,
		TargetID:   in.TargetID,
		ParentID:   in.ParentID,
		Content:    in.Content,
		Status:     "visible",
		Score:      0,
		CreatedAt:  s.now(),
		UpdatedAt:  s.now(),
	}
	s.items[id] = &c
	return c, nil
}

func (s *stubCommentsRepo) ListByTarget(_ context.Context, targetType, targetID string, limit, offset int, viewerUserID string) ([]handlers.Comment, int64, error) {
	if s.listErr != nil {
		return nil, 0, s.listErr
	}
	out := []handlers.Comment{}
	for _, v := range s.items {
		if v.TargetType == targetType && v.TargetID == targetID && v.Status == "visible" {
			c := *v
			if viewerUserID != "" {
				c.UserVote = s.votes[c.ID+":"+viewerUserID]
			}
			out = append(out, c)
		}
	}
	return out, int64(len(out)), nil
}

func (s *stubCommentsRepo) SoftDelete(_ context.Context, commentID, userID string, isAdmin bool) error {
	c, ok := s.items[commentID]
	if !ok {
		// Importante: usar %w pra que errors.Is(err, shared.ErrNotFound) funcione.
		return fmt.Errorf("comment: %w", shared.ErrNotFound)
	}
	if c.UserID != userID && !isAdmin {
		return fmt.Errorf("comment: %w", shared.ErrForbidden)
	}
	c.Status = "deleted"
	return nil
}

func (s *stubCommentsRepo) UpdateStatus(_ context.Context, commentID, status string) error {
	c, ok := s.items[commentID]
	if !ok {
		return fmt.Errorf("comment: %w", shared.ErrNotFound)
	}
	// Mesma whitelist do adapter real — defense in depth.
	switch status {
	case "visible", "hidden", "flagged", "deleted":
	default:
		return fmt.Errorf("comment: %w", shared.ErrValidation)
	}
	c.Status = status
	return nil
}

func (s *stubCommentsRepo) Vote(_ context.Context, commentID, userID string, vote int) error {
	prev := s.votes[commentID+":"+userID]
	s.votes[commentID+":"+userID] = vote
	if c, ok := s.items[commentID]; ok {
		c.Score = c.Score - prev + vote
	}
	return nil
}

func (s *stubCommentsRepo) UnVote(_ context.Context, commentID, userID string) error {
	prev := s.votes[commentID+":"+userID]
	delete(s.votes, commentID+":"+userID)
	if c, ok := s.items[commentID]; ok {
		c.Score -= prev
	}
	return nil
}

func (s *stubCommentsRepo) Report(_ context.Context, commentID, reporterID, reason string) error {
	_ = reason
	s.rpts[commentID+":"+reporterID] = true
	return nil
}

func (s *stubCommentsRepo) ListByStatus(_ context.Context, status string, limit, offset int) ([]handlers.Comment, int64, error) {
	_ = limit
	_ = offset
	out := []handlers.Comment{}
	for _, v := range s.items {
		if v.Status == status {
			out = append(out, *v)
		}
	}
	return out, int64(len(out)), nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// withAuthCtx — injeta userID no contexto (simula Authenticate middleware).
func withAuthCtx(req *http.Request, userID string) *http.Request {
	ctx := context.WithValue(req.Context(), middleware.CtxKeyUserID, shared.UserID(userID))
	return req.WithContext(ctx)
}

// ─── Validação de input ───────────────────────────────────────────────────

func Test_Comments_Create_NoAuth_Returns401(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	body := []byte(`{"targetType":"article","targetId":"x","content":"hi there"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body))
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func Test_Comments_Create_EmptyContent_Returns400(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	body := []byte(`{"targetType":"article","targetId":"x","content":"   "}`)
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_Comments_Create_TooLong_Returns400(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	longContent := strings.Repeat("a", 1100) // > 1000 char limit
	body, _ := json.Marshal(map[string]string{
		"targetType": "article", "targetId": "x", "content": longContent,
	})
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_Comments_Create_InvalidTargetType_Returns400(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	body := []byte(`{"targetType":"badtype","targetId":"x","content":"ok"}`)
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

// ─── Anti-spam ─────────────────────────────────────────────────────────────

func Test_Comments_Create_TooManyURLs_Returns400(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	body := []byte(`{"targetType":"article","targetId":"x","content":"compra aqui https://a.com e https://b.com agora"}`)
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), "link")
}

func Test_Comments_Create_AllCaps_Returns400(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	body := []byte(`{"targetType":"article","targetId":"x","content":"ISSO É UMA FRASE TODA EM CAIXA ALTA"}`)
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
	assert.Contains(t, rec.Body.String(), "CAIXA")
}

func Test_Comments_Create_CharRepeat_Returns400(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	body := []byte(`{"targetType":"article","targetId":"x","content":"haaaaaaaaaaaa muito louco"}`)
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_Comments_Create_BannedWord_Returns400(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	body := []byte(`{"targetType":"article","targetId":"x","content":"compre agora e ganhe dinheiro fácil!"}`)
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_Comments_Create_OneURL_Accepted(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	body := []byte(`{"targetType":"article","targetId":"x","content":"Veja isso: https://example.com"}`)
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusCreated, rec.Code)
}

func Test_Comments_Create_LegitContent_Accepted(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	body := []byte(`{"targetType":"article","targetId":"transformers","content":"Excelente material, fiquei com dúvida na parte de atenção cruzada. Alguém pode explicar?"}`)
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	require.Equal(t, http.StatusCreated, rec.Code)
	var c handlers.Comment
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&c))
	assert.NotEmpty(t, c.ID)
	assert.Equal(t, "visible", c.Status)
}

// ─── List ───────────────────────────────────────────────────────────────

func Test_Comments_List_RequiresTargetParams(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	req := httptest.NewRequest(http.MethodGet, "/api/v1/comments", http.NoBody)
	rec := httptest.NewRecorder()
	h.List(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_Comments_List_ReturnsItems(t *testing.T) {
	repo := newStubCommentsRepo()
	// Pre-populate
	_, _ = repo.Create(context.Background(), handlers.CommentCreateInput{
		UserID: "u1", TargetType: "article", TargetID: "transformers", Content: "ótimo",
	})

	h := handlers.NewCommentsHandler(repo)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/comments?targetType=article&targetId=transformers", http.NoBody)
	rec := httptest.NewRecorder()
	h.List(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	var body struct {
		Data  []handlers.Comment `json:"data"`
		Total int64              `json:"total"`
	}
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))
	assert.Equal(t, int64(1), body.Total)
}

// ─── Vote ──────────────────────────────────────────────────────────────

func Test_Comments_Vote_NoAuth_Returns401(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	req := httptest.NewRequest(http.MethodPost, "/api/v1/comments/c1/vote", bytes.NewReader([]byte(`{"vote":1}`)))
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c1")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	rec := httptest.NewRecorder()
	h.Vote(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func Test_Comments_Vote_InvalidValue_Returns400(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	req := httptest.NewRequest(http.MethodPost, "/api/v1/comments/c1/vote", bytes.NewReader([]byte(`{"vote":5}`)))
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c1")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	req = withAuthCtx(req, "u1")
	rec := httptest.NewRecorder()
	h.Vote(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_Comments_Vote_Upvote_Returns204(t *testing.T) {
	repo := newStubCommentsRepo()
	_, _ = repo.Create(context.Background(), handlers.CommentCreateInput{
		UserID: "u-author", TargetType: "article", TargetID: "x", Content: "hi",
	})
	h := handlers.NewCommentsHandler(repo)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/comments/c-u-author-x/vote", bytes.NewReader([]byte(`{"vote":1}`)))
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c-u-author-x")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	req = withAuthCtx(req, "u-voter")
	rec := httptest.NewRecorder()
	h.Vote(rec, req)
	assert.Equal(t, http.StatusNoContent, rec.Code)
	assert.Equal(t, 1, repo.votes["c-u-author-x:u-voter"])
}

// ─── Report ──────────────────────────────────────────────────────────────

func Test_Comments_Report_NoAuth_Returns401(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	req := httptest.NewRequest(http.MethodPost, "/api/v1/comments/c1/report", bytes.NewReader([]byte(`{"reason":"spam"}`)))
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c1")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	rec := httptest.NewRecorder()
	h.Report(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func Test_Comments_Report_Authenticated_Returns204(t *testing.T) {
	repo := newStubCommentsRepo()
	h := handlers.NewCommentsHandler(repo)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/comments/c1/report", bytes.NewReader([]byte(`{"reason":"spam"}`)))
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c1")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	req = withAuthCtx(req, "u-reporter")
	rec := httptest.NewRecorder()
	h.Report(rec, req)
	assert.Equal(t, http.StatusNoContent, rec.Code)
	assert.True(t, repo.rpts["c1:u-reporter"])
}

// ─── Delete (FIX5 — gaps de cobertura críticos) ───────────────────────────

func Test_Comments_Delete_NoAuth_Returns401(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	req := httptest.NewRequest(http.MethodDelete, "/api/v1/comments/c1", http.NoBody)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c1")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	rec := httptest.NewRecorder()
	h.Delete(rec, req)
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func Test_Comments_Delete_NonOwner_NonAdmin_Returns403(t *testing.T) {
	repo := newStubCommentsRepo()
	_, _ = repo.Create(context.Background(), handlers.CommentCreateInput{
		UserID: "u-author", TargetType: "article", TargetID: "x", Content: "hi",
	})
	h := handlers.NewCommentsHandler(repo)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/comments/c-u-author-x", http.NoBody)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c-u-author-x")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	req = withAuthCtx(req, "u-other")
	rec := httptest.NewRecorder()
	h.Delete(rec, req)
	assert.Equal(t, http.StatusForbidden, rec.Code)
}

func Test_Comments_Delete_Owner_Returns204(t *testing.T) {
	repo := newStubCommentsRepo()
	_, _ = repo.Create(context.Background(), handlers.CommentCreateInput{
		UserID: "u-author", TargetType: "article", TargetID: "x", Content: "hi",
	})
	h := handlers.NewCommentsHandler(repo)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/comments/c-u-author-x", http.NoBody)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c-u-author-x")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	req = withAuthCtx(req, "u-author")
	rec := httptest.NewRecorder()
	h.Delete(rec, req)
	assert.Equal(t, http.StatusNoContent, rec.Code)
	assert.Equal(t, "deleted", repo.items["c-u-author-x"].Status)
}

func Test_Comments_Delete_Admin_Returns204(t *testing.T) {
	repo := newStubCommentsRepo()
	_, _ = repo.Create(context.Background(), handlers.CommentCreateInput{
		UserID: "u-author", TargetType: "article", TargetID: "x", Content: "hi",
	})
	h := handlers.NewCommentsHandler(repo)

	req := httptest.NewRequest(http.MethodDelete, "/api/v1/comments/c-u-author-x", http.NoBody)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c-u-author-x")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	// Injeta userID + role admin no contexto
	ctx := context.WithValue(req.Context(), middleware.CtxKeyUserID, shared.UserID("u-admin"))
	ctx = context.WithValue(ctx, middleware.CtxKeyRole, "admin")
	req = req.WithContext(ctx)
	rec := httptest.NewRecorder()
	h.Delete(rec, req)
	assert.Equal(t, http.StatusNoContent, rec.Code)
}

func Test_Comments_Delete_NotFound_Returns404(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	req := httptest.NewRequest(http.MethodDelete, "/api/v1/comments/c-fake", http.NoBody)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c-fake")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	req = withAuthCtx(req, "u1")
	rec := httptest.NewRecorder()
	h.Delete(rec, req)
	assert.Equal(t, http.StatusNotFound, rec.Code)
}

// ─── Vote toggle e unvote ──────────────────────────────────────────────────

func Test_Comments_Vote_Toggle_UpdatesNotDuplicates(t *testing.T) {
	repo := newStubCommentsRepo()
	_, _ = repo.Create(context.Background(), handlers.CommentCreateInput{
		UserID: "u-author", TargetType: "article", TargetID: "x", Content: "hi",
	})
	h := handlers.NewCommentsHandler(repo)

	// Vote +1
	req := httptest.NewRequest(http.MethodPost, "/api/v1/comments/c-u-author-x/vote", bytes.NewReader([]byte(`{"vote":1}`)))
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c-u-author-x")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	req = withAuthCtx(req, "u-voter")
	rec := httptest.NewRecorder()
	h.Vote(rec, req)
	require.Equal(t, http.StatusNoContent, rec.Code)
	require.Equal(t, 1, repo.votes["c-u-author-x:u-voter"])

	// Vote -1 (troca, não duplica)
	req2 := httptest.NewRequest(http.MethodPost, "/api/v1/comments/c-u-author-x/vote", bytes.NewReader([]byte(`{"vote":-1}`)))
	req2 = req2.WithContext(context.WithValue(req2.Context(), chi.RouteCtxKey, rctx))
	req2 = withAuthCtx(req2, "u-voter")
	rec2 := httptest.NewRecorder()
	h.Vote(rec2, req2)
	require.Equal(t, http.StatusNoContent, rec2.Code)
	require.Equal(t, -1, repo.votes["c-u-author-x:u-voter"], "toggle deve atualizar, não criar 2 entradas")
	require.Len(t, repo.votes, 1, "1 voto único por par (commentID, userID)")
}

func Test_Comments_Vote_Zero_RemovesVote(t *testing.T) {
	repo := newStubCommentsRepo()
	_, _ = repo.Create(context.Background(), handlers.CommentCreateInput{
		UserID: "u-author", TargetType: "article", TargetID: "x", Content: "hi",
	})
	h := handlers.NewCommentsHandler(repo)
	repo.votes["c-u-author-x:u-voter"] = 1 // estado inicial: votou

	req := httptest.NewRequest(http.MethodPost, "/api/v1/comments/c-u-author-x/vote", bytes.NewReader([]byte(`{"vote":0}`)))
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", "c-u-author-x")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	req = withAuthCtx(req, "u-voter")
	rec := httptest.NewRecorder()
	h.Vote(rec, req)
	require.Equal(t, http.StatusNoContent, rec.Code)
	_, exists := repo.votes["c-u-author-x:u-voter"]
	require.False(t, exists, "vote=0 deve remover do mapa")
}

// ─── Char limit boundary ──────────────────────────────────────────────────

func Test_Comments_Create_ExactlyMaxChars_Accepted(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	// 1000 chars exatos com texto realista (evita char-repeat)
	piece := "lorem ipsum dolor sit amet "
	content := strings.Repeat(piece, 50)[:1000]
	require.Len(t, content, 1000)
	body, _ := json.Marshal(map[string]string{
		"targetType": "article", "targetId": "x", "content": content,
	})
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusCreated, rec.Code)
}

// ─── Admin: List, Hide, Restore ────────────────────────────────────────────

func Test_Comments_AdminList_DefaultFlagged(t *testing.T) {
	repo := newStubCommentsRepo()
	c1, _ := repo.Create(context.Background(), handlers.CommentCreateInput{
		UserID: "u1", TargetType: "article", TargetID: "x", Content: "ok",
	})
	repo.items[c1.ID].Status = "flagged"

	h := handlers.NewCommentsHandler(repo)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/comments", http.NoBody)
	rec := httptest.NewRecorder()
	h.AdminList(rec, req)
	require.Equal(t, http.StatusOK, rec.Code)
	var body struct {
		Data  []handlers.Comment `json:"data"`
		Total int64              `json:"total"`
	}
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))
	assert.Equal(t, int64(1), body.Total)
	assert.Equal(t, "flagged", body.Data[0].Status)
}

func Test_Comments_AdminList_InvalidStatus_Returns400(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/comments?status=lixo", http.NoBody)
	rec := httptest.NewRecorder()
	h.AdminList(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_Comments_Hide_AdminFlow(t *testing.T) {
	repo := newStubCommentsRepo()
	c, _ := repo.Create(context.Background(), handlers.CommentCreateInput{
		UserID: "u1", TargetType: "article", TargetID: "x", Content: "ok",
	})
	h := handlers.NewCommentsHandler(repo)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/comments/"+c.ID+"/hide", http.NoBody)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", c.ID)
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	rec := httptest.NewRecorder()
	h.Hide(rec, req)
	require.Equal(t, http.StatusNoContent, rec.Code)
	assert.Equal(t, "hidden", repo.items[c.ID].Status)
}

func Test_Comments_Restore_AdminFlow(t *testing.T) {
	repo := newStubCommentsRepo()
	c, _ := repo.Create(context.Background(), handlers.CommentCreateInput{
		UserID: "u1", TargetType: "article", TargetID: "x", Content: "ok",
	})
	repo.items[c.ID].Status = "flagged"
	h := handlers.NewCommentsHandler(repo)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/comments/"+c.ID+"/restore", http.NoBody)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", c.ID)
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	rec := httptest.NewRecorder()
	h.Restore(rec, req)
	require.Equal(t, http.StatusNoContent, rec.Code)
	assert.Equal(t, "visible", repo.items[c.ID].Status)
}

// ─── Anti-spam: unicode bypass cobertura ───────────────────────────────────

func Test_Comments_Create_CyrillicLookalike_Rejected(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	// "сompre agora" com 'с' cirílico (U+0441) — atacante tentando bypass.
	body, _ := json.Marshal(map[string]string{
		"targetType": "article", "targetId": "x",
		"content": "Promoção imperdível, сompre agora!",
	})
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code, "lookalike fold deve normalizar e detectar banned word")
}

func Test_Comments_Create_ZeroWidthInjection_Rejected(t *testing.T) {
	h := handlers.NewCommentsHandler(newStubCommentsRepo())
	// Zero-width joiner U+200B injetado entre 'c' e 'ompre' pra burlar
	// substring match. Escape explícito (sem char invisível no source).
	//nolint:staticcheck // ST1018: o ponto do teste é exatamente injetar U+200B
	const sneaky = "Aviso: c​ompre agora antes que acabe!"
	body, _ := json.Marshal(map[string]string{
		"targetType": "article", "targetId": "x",
		"content": sneaky,
	})
	req := withAuthCtx(httptest.NewRequest(http.MethodPost, "/api/v1/comments", bytes.NewReader(body)), "u1")
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code, "zero-width strip deve normalizar e detectar banned word")
}

// Helper pra evitar import cycle quando o fmt é só pra format dentro do test.
var _ = fmt.Sprintf
