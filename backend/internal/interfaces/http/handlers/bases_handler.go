// Package handlers — BasesHandler expõe o catálogo público de "bases de
// conhecimento" da plataforma.
//
// Uma "base" é uma área temática completa (ex.: /tecnologia). A FFV Academy
// gera novas bases por demanda: o estudante envia uma solicitação, e em até
// 24h uma nova base nasce com o mesmo padrão da Tecnologia.
//
// A partir da migration 48+ o catálogo vive em Postgres (tabela `bases`).
// Antes, era hardcoded aqui em `buildBases()`. O hardcode fica como
// FALLBACK quando o repo não está disponível (testes legacy ou primeira
// inicialização antes do seed).
//
// Endpoints:
//   - GET /api/v1/bases               → lista resumida (compat backward)
//   - GET /api/v1/bases/{slug}/page   → descritor completo de página (Fase 3)
//
// Ambos são públicos (sem auth) e usados pelo frontend.
package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	dombase "github.com/fernandofv/api/internal/domain/base"
	"github.com/fernandofv/api/internal/domain/shared"
)

// BaseAreaCounter — port para contar solicitações ativas por área (demand
// counts). Implementado por postgres.StudyRequestRepo.CountActiveByArea.
type BaseAreaCounter interface {
	CountActiveByArea(ctx context.Context) (map[string]int, error)
}

// BasesHandler serve os endpoints públicos de bases.
type BasesHandler struct {
	counter BaseAreaCounter
	repo    dombase.Repository // opcional: se nil, cai no fallback hardcoded
}

// NewBasesHandler aceita counter e repo opcionais. Quando repo == nil, a
// listagem retorna a tabela hardcoded (preserva testes antigos).
func NewBasesHandler(counter BaseAreaCounter) *BasesHandler {
	return &BasesHandler{counter: counter}
}

// NewBasesHandlerWithRepo é o construtor preferencial em produção.
func NewBasesHandlerWithRepo(counter BaseAreaCounter, repo dombase.Repository) *BasesHandler {
	return &BasesHandler{counter: counter, repo: repo}
}

// BaseNavItemDTO — item de nav do header por base.
type BaseNavItemDTO struct {
	Href     string `json:"href"`
	Label    string `json:"label"`
	Color    string `json:"color,omitempty"`
	IconName string `json:"iconName,omitempty"`
	LgOnly   bool   `json:"lgOnly,omitempty"`
	XlOnly   bool   `json:"xlOnly,omitempty"`
	IsNew    bool   `json:"isNew,omitempty"`
}

// BaseThemeDTO — paleta de cores. Cores em hex.
type BaseThemeDTO struct {
	Ink         string   `json:"ink"`
	Paper       string   `json:"paper"`
	Cream       string   `json:"cream"`
	Border      string   `json:"border"`
	Muted       string   `json:"muted"`
	Accent      string   `json:"accent"`
	AccentLight string   `json:"accentLight"`
	Success     string   `json:"success"`
	HubColors   []string `json:"hubColors"`
}

// BaseDTO é o payload de uma base na resposta de /api/v1/bases (lista
// resumida — wire format inalterado vs. v1).
type BaseDTO struct {
	Slug                 string           `json:"slug"`
	Name                 string           `json:"name"`
	AreaLabel            string           `json:"areaLabel"`
	Description          string           `json:"description"`
	Icon                 string           `json:"icon"`
	Status               string           `json:"status"`
	URL                  string           `json:"url,omitempty"`
	Modules              int              `json:"modules,omitempty"`
	Trails               int              `json:"trails,omitempty"`
	Hubs                 int              `json:"hubs,omitempty"`
	DemandCount          int              `json:"demandCount"`
	NavItems             []BaseNavItemDTO `json:"navItems,omitempty"`
	Theme                *BaseThemeDTO    `json:"theme,omitempty"`
	HideGlobalContentNav bool             `json:"hideGlobalContentNav,omitempty"`
}

// BasesResponse é o envelope de /api/v1/bases.
type BasesResponse struct {
	Bases       []BaseDTO `json:"bases"`
	TotalLive   int       `json:"totalLive"`
	TotalQueued int       `json:"totalQueued"`
}

// List serve GET /api/v1/bases.
func (h *BasesHandler) List(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	var counts map[string]int
	if h.counter != nil {
		if c, err := h.counter.CountActiveByArea(ctx); err == nil {
			counts = c
		}
	}

	bases := h.loadList(ctx, counts)

	resp := BasesResponse{Bases: bases}
	for _, b := range bases {
		switch b.Status {
		case dombase.StatusLive:
			resp.TotalLive++
		case dombase.StatusQueued:
			resp.TotalQueued++
		}
	}

	w.Header().Set("Cache-Control", "public, max-age=60")
	WriteJSON(w, http.StatusOK, resp)
}

// loadList tenta primeiro o repo; em qualquer erro cai pro hardcoded.
func (h *BasesHandler) loadList(ctx context.Context, counts map[string]int) []BaseDTO {
	if h.repo != nil {
		if bases, err := h.repo.List(ctx); err == nil && len(bases) > 0 {
			out := make([]BaseDTO, 0, len(bases))
			for _, b := range bases {
				out = append(out, baseToListDTO(b, counts))
			}
			return out
		}
	}
	return buildHardcodedBases(counts)
}

func baseToListDTO(b *dombase.Base, counts map[string]int) BaseDTO {
	d := BaseDTO{
		Slug:                 b.Slug,
		Name:                 b.Name,
		AreaLabel:            b.AreaLabel,
		Description:          b.Description,
		Icon:                 b.Icon,
		Status:               b.Status,
		URL:                  b.URL,
		Modules:              b.Modules,
		Trails:               b.Trails,
		Hubs:                 b.Hubs,
		HideGlobalContentNav: b.HideGlobalContentNav,
	}
	if len(b.NavItems) > 0 {
		d.NavItems = make([]BaseNavItemDTO, 0, len(b.NavItems))
		for _, n := range b.NavItems {
			d.NavItems = append(d.NavItems, BaseNavItemDTO{
				Href: n.Href, Label: n.Label, Color: n.Color,
				IconName: n.IconName, LgOnly: n.LgOnly, XlOnly: n.XlOnly, IsNew: n.IsNew,
			})
		}
	}
	if b.Theme.Ink != "" || len(b.Theme.HubColors) > 0 {
		d.Theme = &BaseThemeDTO{
			Ink: b.Theme.Ink, Paper: b.Theme.Paper, Cream: b.Theme.Cream,
			Border: b.Theme.Border, Muted: b.Theme.Muted, Accent: b.Theme.Accent,
			AccentLight: b.Theme.AccentLight, Success: b.Theme.Success,
			HubColors: b.Theme.HubColors,
		}
	}
	if counts != nil {
		d.DemandCount = counts[b.Slug]
	}
	return d
}

// ─────────────────────────────────────────────────────────────────────────
// Fase 3 — GET /api/v1/bases/{slug}/page
//
// Descritor completo de página: theme + hero + paths + hubs + playlists +
// finalCta + microcopy + features. Frontend consome via getBasePage(slug)
// e renderiza <KnowledgeBaseHome />.
// ─────────────────────────────────────────────────────────────────────────

// BasePageDTO — descritor completo. Campos opcionais ficam vazios quando a
// base não os preenche (frontend tem defaults internos).
type BasePageDTO struct {
	Slug      string            `json:"slug"`
	Name      string            `json:"name"`
	Status    string            `json:"status"`
	URL       string            `json:"url,omitempty"`
	Theme     *BaseThemeDTO     `json:"theme,omitempty"`
	Hero      json.RawMessage   `json:"hero,omitempty"`
	Paths     json.RawMessage   `json:"paths,omitempty"`
	Hubs      json.RawMessage   `json:"hubs,omitempty"`
	Playlists json.RawMessage   `json:"playlists,omitempty"`
	FinalCta  json.RawMessage   `json:"finalCta,omitempty"`
	Stats     map[string]int    `json:"stats"`
	Microcopy map[string]string `json:"microcopy,omitempty"`
	Slogans   map[string]string `json:"slogans,omitempty"`
	Features  *dombase.Features `json:"features,omitempty"`
	Flags     BasePageFlagsDTO  `json:"flags"`
}

// BasePageFlagsDTO — toggles de exibição da home.
type BasePageFlagsDTO struct {
	HideComunidade       bool `json:"hideComunidade"`
	HideGlobalContentNav bool `json:"hideGlobalContentNav"`
}

// GetPage serve GET /api/v1/bases/{slug}/page.
func (h *BasesHandler) GetPage(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		WriteError(w, http.StatusBadRequest, "slug obrigatório", "")
		return
	}

	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "catálogo de bases indisponível", "")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	b, err := h.repo.GetBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, shared.ErrNotFound) {
			WriteError(w, http.StatusNotFound, "base não encontrada", "")
			return
		}
		WriteError(w, http.StatusInternalServerError, "falha ao carregar base", "")
		return
	}

	dto := basePageDTOFromDomain(b)

	w.Header().Set("Cache-Control", "public, max-age=300")
	WriteJSON(w, http.StatusOK, dto)
}

func basePageDTOFromDomain(b *dombase.Base) BasePageDTO {
	dto := BasePageDTO{
		Slug:   b.Slug,
		Name:   b.Name,
		Status: b.Status,
		URL:    b.URL,
		Stats: map[string]int{
			"modules": b.Modules,
			"trails":  b.Trails,
			"hubs":    b.Hubs,
		},
		Microcopy: b.Microcopy,
		Slogans:   b.Slogans,
		Flags: BasePageFlagsDTO{
			HideComunidade:       b.HideComunidade,
			HideGlobalContentNav: b.HideGlobalContentNav,
		},
	}
	if b.Theme.Ink != "" || len(b.Theme.HubColors) > 0 {
		dto.Theme = &BaseThemeDTO{
			Ink: b.Theme.Ink, Paper: b.Theme.Paper, Cream: b.Theme.Cream,
			Border: b.Theme.Border, Muted: b.Theme.Muted, Accent: b.Theme.Accent,
			AccentLight: b.Theme.AccentLight, Success: b.Theme.Success,
			HubColors: b.Theme.HubColors,
		}
	}
	if f := b.Features; f != (dombase.Features{}) {
		dto.Features = &f
	}
	// Re-marshal os blocos pra json.RawMessage e omitir os vazios.
	if raw, err := json.Marshal(b.Hero); err == nil && !isEmptyJSON(raw) {
		dto.Hero = raw
	}
	if raw, err := json.Marshal(b.Paths); err == nil && !isEmptyArray(raw) {
		dto.Paths = raw
	}
	if raw, err := json.Marshal(b.HubCards); err == nil && !isEmptyArray(raw) {
		dto.Hubs = raw
	}
	if raw, err := json.Marshal(b.Playlists); err == nil && !isEmptyArray(raw) {
		dto.Playlists = raw
	}
	if raw, err := json.Marshal(b.FinalCta); err == nil && !isEmptyJSON(raw) {
		dto.FinalCta = raw
	}
	return dto
}

func isEmptyJSON(b []byte) bool {
	s := string(b)
	return s == "" || s == "{}" || s == "null"
}

func isEmptyArray(b []byte) bool {
	s := string(b)
	return s == "" || s == "[]" || s == "null"
}

// ─────────────────────────────────────────────────────────────────────────
// FALLBACK HARDCODED — preservado pra testes legacy e ambientes sem o seed
// das migrations 48-49 aplicado. NÃO é mais a fonte de verdade.
// ─────────────────────────────────────────────────────────────────────────

var techThemeFallback = &BaseThemeDTO{
	Ink:         "#1c1917",
	Paper:       "#faf7f2",
	Cream:       "#ffffff",
	Border:      "#e7e0d0",
	Muted:       "#57534e",
	Accent:      "#1e3a8a",
	AccentLight: "#3b82f6",
	Success:     "#15803d",
	HubColors:   []string{"#1e3a8a", "#0e7490", "#15803d", "#b45309"},
}

var medvetThemeFallback = &BaseThemeDTO{
	Ink:         "#2d4a3e",
	Paper:       "#fbf7f0",
	Cream:       "#fdfbf6",
	Border:      "#e0d4ba",
	Muted:       "#6b6358",
	Accent:      "#8a9b7e",
	AccentLight: "#d4a574",
	Success:     "#6b9080",
	HubColors:   []string{"#8a9b7e", "#b08968", "#a07775", "#c19a78"},
}

var techNavFallback = []BaseNavItemDTO{
	{Href: "/ia", Label: "IA", Color: "#58a6ff", IconName: "brain"},
	{Href: "/aws", Label: "AWS", Color: "#ff9900", IconName: "cloud"},
	{Href: "/engenharia", Label: "Engenharia", Color: "#e3b341", IconName: "wrench"},
	{Href: "/claude-anthropic", Label: "Claude", Color: "#cc785c", IconName: "bot"},
}

func buildHardcodedBases(counts map[string]int) []BaseDTO {
	bases := []BaseDTO{
		{
			Slug:        "tecnologia",
			Name:        "Tecnologia",
			AreaLabel:   "IA · AWS · Engenharia · Programação · Hardware · OS · Compiladores · Mercado Tech · Hardware Hacking",
			Description: "Sistemas distribuídos, IA aplicada, AWS, backend, frontend, dados, paradigmas além de OOP (funcional/Lispian/Elixir/Prolog), compiladores deep (Lexer/Parser/AST/JIT/LLVM/GC), OS por dentro (schedulers EEVDF/syscalls/containers internals/eBPF), hardware moderno (CPU superscalar/cache coherency/GPU CUDA/ARM vs x86 vs RISC-V), end-to-end full-stack 2026 (ideia ao no ar), mercado tech (FAANG levels.fyi/comp packages/H1B vs O-1) e hardware hacking ético (Flipper Zero).",
			Status:      "live",
			Icon:        "💻",
			URL:         "/tecnologia",
			Modules:     780,
			Trails:      85,
			Hubs:        9,
			NavItems:    techNavFallback,
			Theme:       techThemeFallback,
		},
		{
			Slug:        "medicina-veterinaria",
			Name:        "Medicina Veterinária",
			AreaLabel:   "Genética · Anatomia · Clínica · Farmacologia",
			Description: "Trilha completa de Genética Veterinária: 12 módulos sobre Mendel, alelismo, genes letais, padrões de herança, Hardy-Weinberg, melhoramento e endogamia.",
			Status:      "live",
			Icon:        "🐾",
			URL:         "/medicina-veterinaria",
			Modules:     12,
			Trails:      1,
			Hubs:        1,
			NavItems: []BaseNavItemDTO{
				{Href: "/medicina-veterinaria/simulado-genetica", Label: "Simulado", Color: "#b08968", IconName: "target"},
			},
			Theme:                medvetThemeFallback,
			HideGlobalContentNav: true,
		},
		{
			Slug:        "carreira",
			Name:        "Carreira & Liderança",
			AreaLabel:   "Portfólio · Vagas · Entrevista · Promoção",
			Description: "Carreira profissional como sistema: portfólio, busca de vagas no Brasil e fora, entrevista comportamental, negociação salarial e promoção. Para qualquer profissional dirigir a própria trajetória.",
			Status:      "live",
			Icon:        "🎯",
			URL:         "/carreira",
			Modules:     13,
			Trails:      2,
			Hubs:        1,
			NavItems:    []BaseNavItemDTO{{Href: "/carreira", Label: "Carreira", Color: "#f472b6", IconName: "target"}},
		},
		{
			Slug:        "comunicacao",
			Name:        "Comunicação",
			AreaLabel:   "Falar em público · Escrita profissional · Reuniões · Feedback",
			Description: "Comunicação humana e escrita profissional: falar em público, conduzir reuniões, storytelling, dar e receber feedback, escuta ativa e documentos que convencem.",
			Status:      "live",
			Icon:        "💬",
			URL:         "/comunicacao",
			Modules:     14,
			Trails:      2,
			Hubs:        1,
			NavItems:    []BaseNavItemDTO{{Href: "/comunicacao", Label: "Comunicação", Color: "#fb7185", IconName: "message-circle"}},
		},
		{
			Slug:        "marketing",
			Name:        "Marketing Digital",
			AreaLabel:   "Posicionamento · Growth · Neuromarketing · Branding · SEO · CAC/LTV",
			Description: "Marketing como engenharia. Branding pessoal e SEO + Posicionamento Estratégico (Trout/Ries/Kotler/Dunford/Raskin) + Growth (AARRR, CAC/LTV, funnel, PLG/SLG/MLG, k-factor) + Neuromarketing & Attention Economy (Lindstrom, Nir Eyal Hooked, BJ Fogg, Tristan Harris, Paul Zak).",
			Status:      "live",
			Icon:        "📣",
			URL:         "/marketing",
			Modules:     35,
			Trails:      4,
			Hubs:        1,
			NavItems:    []BaseNavItemDTO{{Href: "/marketing", Label: "Marketing", Color: "#ef4444", IconName: "megaphone"}},
		},
		{
			Slug:        "conteudo",
			Name:        "Criação de Conteúdo",
			AreaLabel:   "YouTube · LinkedIn · Instagram · Podcast · Edição · Monetização",
			Description: "Criação de conteúdo digital ponta-a-ponta: estratégia editorial, gravação de áudio e vídeo, edição, publicação multi-plataforma (YouTube, LinkedIn, Instagram, TikTok, podcast), métricas e monetização.",
			Status:      "live",
			Icon:        "🎬",
			URL:         "/conteudo",
			Modules:     6,
			Trails:      1,
			Hubs:        1,
			NavItems:    []BaseNavItemDTO{{Href: "/conteudo", Label: "Conteúdo", Color: "#ec4899", IconName: "film"}},
		},
		{
			Slug:        "empreendedorismo",
			Name:        "Empreendedorismo Digital",
			AreaLabel:   "Produtos digitais · Infoprodutos · Freelance · SaaS · MEI",
			Description: "Produtos digitais, infoprodutos, freelance e renda recorrente: validação de ideia, MVP, formalização MEI, primeiras vendas, modelo de assinatura, distribuição internacional. Da primeira ideia ao negócio rodando.",
			Status:      "live",
			Icon:        "🚀",
			URL:         "/empreendedorismo",
			Modules:     15,
			Trails:      2,
			Hubs:        1,
			NavItems:    []BaseNavItemDTO{{Href: "/empreendedorismo", Label: "Empreendedorismo", Color: "#eab308", IconName: "rocket"}},
		},
		{
			Slug:        "ingles",
			Name:        "Inglês",
			AreaLabel:   "Gramática · 10 cenários · 70 fluxos de conversação real com diálogos",
			Description: "Inglês para brasileiros pra gringa com 8 trilhas e 89 módulos. Cada fluxo traz um trecho de DIÁLOGO REAL (4-6 turnos naturais) + 100 trocas: Cotidiano (aeroporto/moradia/médico/banco), Vida Prática (mecânico/contratante/vet/mudança), Negócios (standup/pitch/FAANG/salário), Corporativo Avançado (VC pitch/boardroom/demissão/burnout), Academia (office hours/conference/tese/orientador), Social (Tinder/conflito/luto), Relacionamento Profundo (Thanksgiving/pedido casamento/USCIS/sogro difícil) e Emergências (911/ER/polícia/ICE/IRS/saúde mental).",
			Status:      "live",
			Icon:        "🌎",
			URL:         "/ingles",
			Modules:     89,
			Trails:      8,
			Hubs:        1,
			NavItems:    []BaseNavItemDTO{{Href: "/ingles", Label: "Inglês", Color: "#06b6d4", IconName: "globe"}},
		},
		{
			Slug:        "neurociencia",
			Name:        "Neurociência",
			AreaLabel:   "Cérebro · Comportamento · Marketing · Decisão",
			Description: "Base de Neurociência aplicada — comece pela trilha Neuromarketing, que cobre como o cérebro humano decide comprar: dos modelos triunos (MacLean) e sistemas duplos (Kahneman) à dopamina, vieses, design visual e pricing.",
			Status:      "live",
			Icon:        "🧠",
			URL:         "/neurociencia",
			Modules:     8,
			Trails:      1,
			Hubs:        4,
			NavItems: []BaseNavItemDTO{
				{Href: "/neurociencia/simulado-neuromarketing", Label: "Simulado", Color: "#a855f7", IconName: "target"},
			},
			HideGlobalContentNav: true,
		},
		{
			Slug:        "cinema",
			Name:        "Cinematografia",
			AreaLabel:   "Linguagem · Roteiro · DP · Direção · Edição · Som · Produção · VLOG",
			Description: "Cinema com profundidade de conservatório, em PT-BR: linguagem (Kuleshov/Eisenstein/Bazin), roteiro (Save the Cat/McKee), storytelling visual (Storaro/Damasio), câmera ARRI Alexa 35 / Sony Venice 2 / RED V-Raptor, direção de fotografia (Deakins/Lubezki/Khondji), mise-en-scène (Villeneuve/Fincher), edição (Walter Murch — Regra dos Seis), som & trilha (Williams/Zimmer/Greenwood), produção (ANCINE/Cannes/agente/reel) e VLOG cinemático + construção de comunidade (Casey Neistat/Peter McKinnon/Mr Beast/David Spinks).",
			Status:      "live",
			Icon:        "🎬",
			URL:         "/cinema",
			Modules:     100,
			Trails:      10,
			Hubs:        1,
			NavItems:    []BaseNavItemDTO{{Href: "/cinema", Label: "Cinema", Color: "#ec4899", IconName: "film"}},
		},
		{
			Slug:        "vendas",
			Name:        "Vendas Consultivas & Negociação",
			AreaLabel:   "SPIN · Challenger · Sandler · MEDDIC · Chris Voss · Renvoise",
			Description: "Vendas B2B com método: SPIN de Neil Rackham (35.000 ligações analisadas), Challenger Sale de Dixon & Adamson, Sandler, MEDDIC/MEDDPICC, fechamento via tactical empathy de Chris Voss (FBI hostage), e Vendas via Cérebro (Patrick Renvoise SalesBrain — 3 cérebros + 6 estímulos reptilianos). Para SDR, AE, founder vendendo, account manager.",
			Status:      "live",
			Icon:        "🎯",
			URL:         "/vendas",
			Modules:     30,
			Trails:      3,
			Hubs:        1,
			NavItems:    []BaseNavItemDTO{{Href: "/vendas", Label: "Vendas", Color: "#0ea5e9", IconName: "target"}},
		},
		{
			Slug:        "psicologia-do-consumo",
			Name:        "Psicologia do Consumo",
			AreaLabel:   "Mente · Estágios da Vida · Felicidade · Status · Atração · Movimentos · Cérebro · Poder · Riqueza",
			Description: "Mente humana inteira em 12 trilhas. Consumo (Cialdini 7 gatilhos, Neuroeconomia Kahneman/Ariely/Thaler), Cérebro (Damasio/Eagleman/Ramachandran), Poder (48 Leis Greene), Influência (Carnegie + Godin + Sinek + BITE Hassan), Riqueza (Hill/Stanley/Housel/Bourdieu), Mente Cognitiva (Big Five OCEAN, Jung sombra, van der Kolk trauma), Estágios da Vida (Erikson 8 fases por idade — 20s/30s/40s/50s/60s+), Felicidade & Sentido (Aristóteles eudaimonia, Frankl Auschwitz, Csíkszentmihályi flow, Seligman PERMA, ikigai, Harvard Study 85 anos), Jogo Social (Veblen, Bourdieu, Girard mimesis, Storr 3 status games), Atração & Carisma (Cabane presença-poder-calor, Brené Brown vulnerabilidade, Kelly 1000 true fans), Construir Movimentos (Campbell hero journey, Sinek why, Ganz Obama 2008, Alinsky organizing, Gladwell tipping point).",
			Status:      "live",
			Icon:        "🧲",
			URL:         "/psicologia-do-consumo",
			Modules:     120,
			Trails:      12,
			Hubs:        1,
			NavItems:    []BaseNavItemDTO{{Href: "/psicologia-do-consumo", Label: "Psicologia", Color: "#a855f7", IconName: "brain"}},
		},
		{Slug: "medicina", Name: "Medicina", AreaLabel: "Residência · Disciplinas básicas · Especialidades", Description: "Aguardando demanda. Pode ser a próxima base no ar.", Status: "queued", Icon: "🩺"},
		{Slug: "engenharia", Name: "Engenharia", AreaLabel: "Cálculo · Estruturas · Mecânica · NRs", Description: "Aguardando demanda. Pode ser a próxima base no ar.", Status: "queued", Icon: "🏗️"},
		{Slug: "direito", Name: "Direito", AreaLabel: "OAB · Constitucional · Civil · Penal", Description: "Aguardando demanda. Pode ser a próxima base no ar.", Status: "queued", Icon: "⚖️"},
		{Slug: "administracao", Name: "Administração & Negócios", AreaLabel: "Marketing · Finanças · MBA · Gestão", Description: "Aguardando demanda. Pode ser a próxima base no ar.", Status: "queued", Icon: "📊"},
		{Slug: "design", Name: "Design", AreaLabel: "UX · Motion · Design Systems · Branding", Description: "Aguardando demanda. Pode ser a próxima base no ar.", Status: "queued", Icon: "🎨"},
		{Slug: "saude", Name: "Outras áreas da saúde", AreaLabel: "Enfermagem · Fisio · Nutrição · Odontologia", Description: "Aguardando demanda. Pode ser a próxima base no ar.", Status: "queued", Icon: "🧪"},
		{Slug: "concursos", Name: "Concursos públicos", AreaLabel: "Federais · Estaduais · Municipais", Description: "Aguardando demanda. Pode ser a próxima base no ar.", Status: "queued", Icon: "🎓"},
		{Slug: "faculdade-geral", Name: "Faculdade em geral", AreaLabel: "Qualquer curso superior", Description: "Aguardando demanda. Pode ser a próxima base no ar.", Status: "queued", Icon: "🏛️"},
		{Slug: "curso-livre", Name: "Curso livre / Aperfeiçoamento", AreaLabel: "Especializações · Workshops · MBAs", Description: "Aguardando demanda. Pode ser a próxima base no ar.", Status: "queued", Icon: "📈"},
	}
	if counts != nil {
		for i := range bases {
			if c, ok := counts[bases[i].Slug]; ok {
				bases[i].DemandCount = c
			}
		}
	}
	return bases
}
