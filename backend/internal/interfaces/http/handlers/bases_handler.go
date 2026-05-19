// Package handlers — BasesHandler expõe a lista pública de "bases de
// conhecimento" da plataforma.
//
// Uma "base" é uma área temática completa (ex.: /tecnologia). A FFV Academy
// gera novas bases por demanda: o estudante envia uma solicitação, e em até
// 24h uma nova base nasce com o mesmo padrão da Tecnologia.
//
// Este endpoint é público (sem auth) e usado pela landing `/bases` no frontend.
// Retorna lista estática curada + contagem dinâmica de demanda agregada das
// study_requests (sem expor dados pessoais).
package handlers

import (
	"context"
	"net/http"
	"time"
)

// BaseAreaCounter é o port para contar quantas solicitações ativas existem
// por área. Implementado por postgres.StudyRequestRepo.CountActiveByArea.
//
// Opcional: se nil, o handler retorna a lista sem demand counts (todos zero).
type BaseAreaCounter interface {
	CountActiveByArea(ctx context.Context) (map[string]int, error)
}

// BasesHandler serve GET /api/v1/bases.
type BasesHandler struct {
	counter BaseAreaCounter
}

// NewBasesHandler aceita counter nil (caso queira servir só a lista estática).
func NewBasesHandler(counter BaseAreaCounter) *BasesHandler {
	return &BasesHandler{counter: counter}
}

// BaseNavItemDTO — item de nav do header por base. Frontend hidrata os
// links da top bar (GameHUD) a partir desses itens. Cada base configura os
// seus; o que não vier aqui não aparece no header.
type BaseNavItemDTO struct {
	Href     string `json:"href"`
	Label    string `json:"label"`
	Color    string `json:"color,omitempty"`
	IconName string `json:"iconName,omitempty"`
	LgOnly   bool   `json:"lgOnly,omitempty"`
	XlOnly   bool   `json:"xlOnly,omitempty"`
	IsNew    bool   `json:"isNew,omitempty"`
}

// BaseThemeDTO — paleta de cores da base. Frontend usa para tematizar
// o header, footer e o conteúdo via CSS vars (--ffv-*). Cores em hex.
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

// BaseDTO é o payload de uma base na resposta.
//
//   - Status: "live" (no ar agora), "queued" (placeholder aguardando demanda),
//     "in_production" (sendo gerada por curadoria).
//   - URL: preenchido apenas se status == live (ex.: "/tecnologia").
//   - DemandCount: quantas solicitações ativas existem nessa área (anonimizado).
//   - NavItems / Theme: config visual da base — frontend tem fallback hardcoded
//     pra cada base; este endpoint serve como single source of truth quando
//     bases novas forem criadas dinamicamente (sem deploy).
type BaseDTO struct {
	Slug        string           `json:"slug"`
	Name        string           `json:"name"`
	AreaLabel   string           `json:"areaLabel"`
	Description string           `json:"description"`
	Icon        string           `json:"icon"`
	Status      string           `json:"status"`
	URL         string           `json:"url,omitempty"`
	Modules     int              `json:"modules,omitempty"`
	Trails      int              `json:"trails,omitempty"`
	Hubs        int              `json:"hubs,omitempty"`
	DemandCount int              `json:"demandCount"`
	NavItems    []BaseNavItemDTO `json:"navItems,omitempty"`
	Theme       *BaseThemeDTO    `json:"theme,omitempty"`
	// HideGlobalContentNav esconde os itens GLOBAIS de conteúdo (News, /simulados
	// de tech) no header dessa base. Útil quando a base tem seus próprios links
	// e não faz sentido vazar pro tech.
	HideGlobalContentNav bool `json:"hideGlobalContentNav,omitempty"`
}

// BasesResponse é o envelope. `lastUpdated` ajuda clientes a fazer cache local.
type BasesResponse struct {
	Bases       []BaseDTO `json:"bases"`
	TotalLive   int       `json:"totalLive"`
	TotalQueued int       `json:"totalQueued"`
}

func (h *BasesHandler) List(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	var counts map[string]int
	if h.counter != nil {
		if c, err := h.counter.CountActiveByArea(ctx); err == nil {
			counts = c
		}
		// Erro do counter não derruba o endpoint — a lista estática ainda é útil.
	}

	bases := buildBases(counts)

	resp := BasesResponse{Bases: bases}
	for _, b := range bases {
		switch b.Status {
		case "live":
			resp.TotalLive++
		case "queued":
			resp.TotalQueued++
		}
	}

	// Cache curto: a lista é praticamente estática + demand muda devagar.
	w.Header().Set("Cache-Control", "public, max-age=60")
	WriteJSON(w, http.StatusOK, resp)
}

// buildBases retorna a lista curada de bases.
//
// V1: apenas Tecnologia está "live". As demais são placeholders mostrando
// áreas possíveis ("queued") — quanto mais solicitações chegam pra uma área,
// mais relevante ela fica no UI (frontend ordena por DemandCount desc).
//
// Slugs aqui DEVEM bater com o select `studyArea` do StudyRequestForm —
// é a chave que une demanda do form às bases no /bases.
// Tema da Tecnologia — navy + cream + amber editorial.
var techTheme = &BaseThemeDTO{
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

// Tema da Medvet — sage + ivory + terracota + mel (calmante, neutro de gênero).
var medvetTheme = &BaseThemeDTO{
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

// Nav items globais por base (mesma config que o frontend tem em
// `lib/bases/<slug>/nav.ts`). Mantido aqui pra preparar bases dinâmicas
// (criadas via study requests sem deploy de código).
var techNav = []BaseNavItemDTO{
	{Href: "/ia", Label: "IA", Color: "#58a6ff", IconName: "brain"},
	{Href: "/aws", Label: "AWS", Color: "#ff9900", IconName: "cloud"},
	{Href: "/engenharia", Label: "Engenharia", Color: "#e3b341", IconName: "wrench"},
	{Href: "/claude-anthropic", Label: "Claude", Color: "#cc785c", IconName: "bot"},
}

func buildBases(counts map[string]int) []BaseDTO {
	bases := []BaseDTO{
		{
			Slug:        "tecnologia",
			Name:        "Tecnologia",
			AreaLabel:   "Programação · IA · AWS · Engenharia",
			Description: "Sistemas distribuídos, IA aplicada, AWS, frontend, backend, dados. Trilhas completas com revisão espaçada e gamificação.",
			Status:      "live",
			Icon:        "💻",
			URL:         "/tecnologia",
			Modules:     157,
			Trails:      16,
			Hubs:        8,
			NavItems:    techNav,
			Theme:       techTheme,
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
			Theme:                medvetTheme,
			HideGlobalContentNav: true,
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
