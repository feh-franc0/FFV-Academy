// Package handlers — testes do BasesHandler (lista + descritor de página).
//
// Padrão: contract tests httptest, sem Docker. Repo mockado inline.
package handlers_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"

	dombase "github.com/fernandofv/api/internal/domain/base"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// ─── Mocks ────────────────────────────────────────────────────────────────

type mockBaseRepo struct {
	bases map[string]*dombase.Base
	list  []*dombase.Base
	err   error
}

func (m *mockBaseRepo) GetBySlug(_ context.Context, slug string) (*dombase.Base, error) {
	if m.err != nil {
		return nil, m.err
	}
	b, ok := m.bases[slug]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return b, nil
}

func (m *mockBaseRepo) List(_ context.Context) ([]*dombase.Base, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.list, nil
}

var _ dombase.Repository = (*mockBaseRepo)(nil)

type mockCounter struct {
	counts map[string]int
	err    error
}

func (m *mockCounter) CountActiveByArea(_ context.Context) (map[string]int, error) {
	return m.counts, m.err
}

// ─── List ─────────────────────────────────────────────────────────────────

func Test_BasesHandler_List_FallsBackToHardcoded_WhenRepoNil(t *testing.T) {
	h := handlers.NewBasesHandler(nil)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases", http.NoBody)
	w := httptest.NewRecorder()
	h.List(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var resp handlers.BasesResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if resp.TotalLive < 2 {
		t.Fatalf("expected ≥2 live bases (tech + medvet), got %d", resp.TotalLive)
	}
	hasTech := false
	for _, b := range resp.Bases {
		if b.Slug == "tecnologia" {
			hasTech = true
			break
		}
	}
	if !hasTech {
		t.Fatalf("expected tecnologia base in fallback")
	}
}

func Test_BasesHandler_List_UsesRepo_WhenAvailable(t *testing.T) {
	repo := &mockBaseRepo{
		list: []*dombase.Base{
			{
				Slug:      "direito",
				Name:      "Direito",
				AreaLabel: "OAB",
				Status:    "live",
				Icon:      "⚖️",
				URL:       "/direito",
				Modules:   25, Trails: 2, Hubs: 1,
				Theme: dombase.Theme{Ink: "#000", HubColors: []string{"#a", "#b", "#c", "#d"}},
			},
		},
	}
	h := handlers.NewBasesHandlerWithRepo(nil, repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases", http.NoBody)
	w := httptest.NewRecorder()
	h.List(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var resp handlers.BasesResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if len(resp.Bases) != 1 || resp.Bases[0].Slug != "direito" {
		t.Fatalf("expected only direito from repo, got %+v", resp.Bases)
	}
	if resp.Bases[0].Theme == nil || resp.Bases[0].Theme.Ink != "#000" {
		t.Fatalf("theme not mapped: %+v", resp.Bases[0].Theme)
	}
}

func Test_BasesHandler_List_AddsDemandCount(t *testing.T) {
	repo := &mockBaseRepo{
		list: []*dombase.Base{
			{Slug: "medicina", Name: "Medicina", Status: "queued", Icon: "🩺"},
		},
	}
	counter := &mockCounter{counts: map[string]int{"medicina": 7}}
	h := handlers.NewBasesHandlerWithRepo(counter, repo)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases", http.NoBody)
	w := httptest.NewRecorder()
	h.List(w, req)

	var resp handlers.BasesResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if resp.Bases[0].DemandCount != 7 {
		t.Fatalf("expected demand=7, got %d", resp.Bases[0].DemandCount)
	}
}

// ─── GetPage ──────────────────────────────────────────────────────────────

func Test_BasesHandler_GetPage_Returns200_WithDescriptor(t *testing.T) {
	repo := &mockBaseRepo{
		bases: map[string]*dombase.Base{
			"tecnologia": {
				Slug:    "tecnologia",
				Name:    "Tecnologia",
				Status:  "live",
				URL:     "/tecnologia",
				Modules: 157, Trails: 16, Hubs: 8,
				Theme: dombase.Theme{
					Ink: "#111", Accent: "#1e3a8a",
					HubColors: []string{"#a", "#b", "#c", "#d"},
				},
				Paths: []dombase.Path{
					{Icon: "🌱", Title: "Nunca estudei IA", Href: "/fundamentos-da-ia"},
				},
				FinalCta: dombase.FinalCta{Title: "Comece agora", CtaHref: "/", CtaLabel: "Ir"},
				Microcopy: map[string]string{
					"ctaPrimary": "Começar trilha",
				},
			},
		},
	}
	h := handlers.NewBasesHandlerWithRepo(nil, repo)
	router := chi.NewRouter()
	router.Get("/api/v1/bases/{slug}/page", h.GetPage)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases/tecnologia/page", http.NoBody)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", w.Code, w.Body.String())
	}
	var dto handlers.BasePageDTO
	if err := json.Unmarshal(w.Body.Bytes(), &dto); err != nil {
		t.Fatalf("unmarshal: %v body=%s", err, w.Body.String())
	}
	if dto.Slug != "tecnologia" {
		t.Fatalf("slug mismatch: %q", dto.Slug)
	}
	if dto.Theme == nil || dto.Theme.Accent != "#1e3a8a" {
		t.Fatalf("theme not serialized: %+v", dto.Theme)
	}
	if dto.Stats["modules"] != 157 {
		t.Fatalf("stats.modules expected 157, got %d", dto.Stats["modules"])
	}
	if len(dto.Paths) == 0 {
		t.Fatalf("paths missing in DTO")
	}
	if dto.Microcopy["ctaPrimary"] != "Começar trilha" {
		t.Fatalf("microcopy missing")
	}
}

func Test_BasesHandler_GetPage_Returns404_WhenSlugUnknown(t *testing.T) {
	repo := &mockBaseRepo{bases: map[string]*dombase.Base{}}
	h := handlers.NewBasesHandlerWithRepo(nil, repo)
	router := chi.NewRouter()
	router.Get("/api/v1/bases/{slug}/page", h.GetPage)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases/nao-existe/page", http.NoBody)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
}

func Test_BasesHandler_GetPage_Returns503_WhenRepoNil(t *testing.T) {
	h := handlers.NewBasesHandler(nil)
	router := chi.NewRouter()
	router.Get("/api/v1/bases/{slug}/page", h.GetPage)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases/tecnologia/page", http.NoBody)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", w.Code)
	}
}

func Test_BasesHandler_GetPage_Returns500_OnRepoError(t *testing.T) {
	repo := &mockBaseRepo{err: errors.New("db down")}
	h := handlers.NewBasesHandlerWithRepo(nil, repo)
	router := chi.NewRouter()
	router.Get("/api/v1/bases/{slug}/page", h.GetPage)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases/qualquer/page", http.NoBody)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", w.Code)
	}
}

// ─── Content-Type guarantees (RFC 7807 — success vs error) ────────────────

// Sucesso deve retornar application/json — NÃO problem+json (que é só pra erro).
func Test_BasesHandler_GetPage_Success_HasJSONContentType(t *testing.T) {
	repo := &mockBaseRepo{
		bases: map[string]*dombase.Base{
			"tecnologia": {Slug: "tecnologia", Name: "Tecnologia", Status: "live"},
		},
	}
	h := handlers.NewBasesHandlerWithRepo(nil, repo)
	router := chi.NewRouter()
	router.Get("/api/v1/bases/{slug}/page", h.GetPage)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases/tecnologia/page", http.NoBody)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if ct := w.Header().Get("Content-Type"); ct != "application/json" {
		t.Fatalf("expected application/json on 200, got %q", ct)
	}
}

// Erro deve retornar application/problem+json (RFC 7807).
func Test_BasesHandler_GetPage_Error_HasProblemJSONContentType(t *testing.T) {
	repo := &mockBaseRepo{bases: map[string]*dombase.Base{}}
	h := handlers.NewBasesHandlerWithRepo(nil, repo)
	router := chi.NewRouter()
	router.Get("/api/v1/bases/{slug}/page", h.GetPage)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases/nao-existe/page", http.NoBody)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if ct := w.Header().Get("Content-Type"); ct != "application/problem+json" {
		t.Fatalf("expected application/problem+json on 404, got %q", ct)
	}
}

func Test_BasesHandler_GetPage_HasCacheControl(t *testing.T) {
	repo := &mockBaseRepo{
		bases: map[string]*dombase.Base{
			"x": {Slug: "x", Name: "X", Status: "live"},
		},
	}
	h := handlers.NewBasesHandlerWithRepo(nil, repo)
	router := chi.NewRouter()
	router.Get("/api/v1/bases/{slug}/page", h.GetPage)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases/x/page", http.NoBody)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	cc := w.Header().Get("Cache-Control")
	if cc != "public, max-age=300" {
		t.Fatalf("expected Cache-Control public, max-age=300, got %q", cc)
	}
}

// ─── DTO serialization — todos os campos do theme devem viajar ────────────

// Travamento contra regressão: se alguém remover algum campo do BaseThemeDTO
// no caminho domain→handler, este teste quebra. Auditoria sinalizou risco
// de perder `accentLight` no spread frontend; aqui validamos que o backend
// SEMPRE envia o tema completo quando preenchido.
func Test_BasesHandler_GetPage_ThemeFullyPopulated(t *testing.T) {
	full := dombase.Theme{
		Ink: "#000001", Paper: "#000002", Cream: "#000003",
		Border: "#000004", Muted: "#000005", Accent: "#000006",
		AccentLight: "#000007", Success: "#000008",
		HubColors: []string{"#a", "#b", "#c", "#d"},
	}
	repo := &mockBaseRepo{
		bases: map[string]*dombase.Base{
			"x": {Slug: "x", Name: "X", Status: "live", Theme: full},
		},
	}
	h := handlers.NewBasesHandlerWithRepo(nil, repo)
	router := chi.NewRouter()
	router.Get("/api/v1/bases/{slug}/page", h.GetPage)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases/x/page", http.NoBody)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	var dto handlers.BasePageDTO
	if err := json.Unmarshal(w.Body.Bytes(), &dto); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if dto.Theme == nil {
		t.Fatalf("theme missing")
	}
	checks := map[string]string{
		"ink": dto.Theme.Ink, "paper": dto.Theme.Paper, "cream": dto.Theme.Cream,
		"border": dto.Theme.Border, "muted": dto.Theme.Muted, "accent": dto.Theme.Accent,
		"accentLight": dto.Theme.AccentLight, "success": dto.Theme.Success,
	}
	for field, got := range checks {
		if got == "" {
			t.Fatalf("theme.%s perdido na serialização", field)
		}
	}
	if len(dto.Theme.HubColors) != 4 {
		t.Fatalf("hubColors len=%d, want 4", len(dto.Theme.HubColors))
	}
}

// ─── Paridade fallback hardcoded ≡ resultado esperado do seed ─────────────

// Trava drift entre `buildHardcodedBases` e o seed da migration 49. Se um
// dev mudar o seed (cores, modules count, nav items) e esquecer de atualizar
// o fallback, este teste falha — evita comportamento divergente quando o
// banco está vazio (testes de integração antigos) vs. seedeado (produção).
//
// Mantemos o fallback como SOMENTE TECH+MEDVET porque são as únicas bases
// live; queued bases podem variar entre seed e fallback sem impacto visual.
func Test_BasesHandler_Fallback_MatchesSeedExpectations(t *testing.T) {
	h := handlers.NewBasesHandler(nil) // sem repo → fallback
	req := httptest.NewRequest(http.MethodGet, "/api/v1/bases", http.NoBody)
	w := httptest.NewRecorder()
	h.List(w, req)

	var resp handlers.BasesResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	byslug := map[string]handlers.BaseDTO{}
	for _, b := range resp.Bases {
		byslug[b.Slug] = b
	}

	// Tecnologia — DEVE bater com migration 49 (seed_bases.up.sql).
	tech, ok := byslug["tecnologia"]
	if !ok {
		t.Fatal("tecnologia ausente do fallback")
	}
	if tech.Modules != 215 || tech.Trails != 22 || tech.Hubs != 8 {
		t.Fatalf("tech counts drift: modules=%d trails=%d hubs=%d (esperado: 215/22/8 — migration 70 expandiu jun/2026 com +6 trilhas: compiladores, OS deep, hardware moderno, paradigmas, end-to-end, mercado tech)",
			tech.Modules, tech.Trails, tech.Hubs)
	}
	if tech.URL != "/tecnologia" || tech.Status != "live" {
		t.Fatalf("tech url/status drift: url=%q status=%q", tech.URL, tech.Status)
	}
	if tech.Theme == nil || tech.Theme.Accent != "#1e3a8a" || tech.Theme.AccentLight != "#3b82f6" {
		t.Fatalf("tech theme drift: %+v", tech.Theme)
	}
	if len(tech.NavItems) != 4 {
		t.Fatalf("tech nav drift: got %d items, seed has 4", len(tech.NavItems))
	}
	if tech.HideGlobalContentNav {
		t.Fatal("tech hide_global_content_nav drift: fallback=true, seed=false")
	}

	// Medvet — DEVE bater com migration 49.
	med, ok := byslug["medicina-veterinaria"]
	if !ok {
		t.Fatal("medicina-veterinaria ausente do fallback")
	}
	if med.Modules != 12 || med.Trails != 1 || med.Hubs != 1 {
		t.Fatalf("medvet counts drift: modules=%d trails=%d hubs=%d (seed: 12/1/1)",
			med.Modules, med.Trails, med.Hubs)
	}
	if med.Theme == nil || med.Theme.Accent != "#8a9b7e" || med.Theme.AccentLight != "#d4a574" {
		t.Fatalf("medvet theme drift: %+v", med.Theme)
	}
	if !med.HideGlobalContentNav {
		t.Fatal("medvet hide_global_content_nav drift: fallback=false, seed=true")
	}

	// 9 queued bases — só verifica que existem (slugs do MARKET_ANALYSIS).
	queuedSlugs := []string{"medicina", "engenharia", "direito", "administracao", "design", "saude", "concursos", "faculdade-geral", "curso-livre"}
	for _, s := range queuedSlugs {
		b, ok := byslug[s]
		if !ok {
			t.Errorf("queued base %q ausente do fallback", s)
			continue
		}
		if b.Status != "queued" {
			t.Errorf("%s expected status=queued, got %q", s, b.Status)
		}
	}
}
