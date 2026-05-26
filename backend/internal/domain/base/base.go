// Package base — domínio das "bases de conhecimento" da plataforma.
//
// Uma base é um catálogo de área temática (ex.: /tecnologia,
// /medicina-veterinaria). Diferente de aggregates com lifecycle (User,
// Attempt, Purchase), Base é essencialmente um read model — não há comandos
// de negócio modificando o estado pela aplicação. Por isso o tipo aqui é
// uma struct simples com getters/setters de campo, e não um aggregate
// encapsulado.
//
// Ver `UNIFICATION_PLAN.md` na raiz do monorepo.
package base

import "encoding/json"

// Status do ciclo de vida do catálogo.
const (
	StatusLive         = "live"
	StatusQueued       = "queued"
	StatusInProduction = "in_production"
)

// Theme — paleta de cores da base. Espelha BaseThemeDTO do handler HTTP.
type Theme struct {
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

// NavItem — item de nav do header por base. Frontend hidrata os links da top
// bar (GameHUD) a partir desses itens.
type NavItem struct {
	Href     string `json:"href"`
	Label    string `json:"label"`
	Color    string `json:"color,omitempty"`
	IconName string `json:"iconName,omitempty"`
	LgOnly   bool   `json:"lgOnly,omitempty"`
	XlOnly   bool   `json:"xlOnly,omitempty"`
	IsNew    bool   `json:"isNew,omitempty"`
}

// Stat — par value/label exibido no Hero.
type Stat struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

// HeroCta — botão do Hero.
type HeroCta struct {
	Href    string `json:"href"`
	Label   string `json:"label"`
	Variant string `json:"variant,omitempty"`
}

// Hero — payload do componente Hero. Campos opcionais permitem cair nos
// defaults do componente quando o banco não fornece.
type Hero struct {
	Kicker       string    `json:"kicker,omitempty"`
	BadgeText    string    `json:"badgeText,omitempty"`
	Title        string    `json:"title,omitempty"`
	Description  string    `json:"description,omitempty"`
	Ctas         []HeroCta `json:"ctas,omitempty"`
	Stats        []Stat    `json:"stats,omitempty"`
	ShowGameDemo *bool     `json:"showGameDemo,omitempty"`
}

// Path — card de "Por onde começar". Espelha ComecarPath no frontend.
type Path struct {
	Icon  string `json:"icon"`
	Title string `json:"title"`
	Desc  string `json:"desc"`
	Href  string `json:"href"`
	Cta   string `json:"cta"`
	Color string `json:"color"`
}

// HubCard — card de hub no Explorar. Espelha HubCardData no frontend.
type HubCard struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	Tagline     string `json:"tagline"`
	Href        string `json:"href"`
	TrailCount  int    `json:"trailCount"`
	ModuleCount int    `json:"moduleCount"`
}

// PlaylistCard — card de playlist no Explorar.
type PlaylistCard struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Emoji       string `json:"emoji"`
	Color       string `json:"color"`
	ModuleCount int    `json:"moduleCount"`
	Href        string `json:"href"`
}

// FinalCta — bloco final da home.
type FinalCta struct {
	Kicker      string `json:"kicker,omitempty"`
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	CtaHref     string `json:"ctaHref,omitempty"`
	CtaLabel    string `json:"ctaLabel,omitempty"`
	Footnote    string `json:"footnote,omitempty"`
}

// Features — toggles de funcionalidades da base.
type Features struct {
	Gamification string `json:"gamification,omitempty"` // "global" | "scoped" | "off"
	SRS          bool   `json:"srs,omitempty"`
	Quizzes      bool   `json:"quizzes,omitempty"`
	Community    bool   `json:"community,omitempty"`
}

// Base — entidade de catálogo da plataforma.
type Base struct {
	Slug        string
	Name        string
	AreaLabel   string
	Description string
	Icon        string
	Status      string
	URL         string

	Modules int
	Trails  int
	Hubs    int

	Theme     Theme
	NavItems  []NavItem
	Slogans   map[string]string
	Microcopy map[string]string
	Footer    json.RawMessage // pass-through; frontend conhece o shape
	Features  Features

	Hero      Hero
	Paths     []Path
	HubCards  []HubCard
	Playlists []PlaylistCard
	FinalCta  FinalCta

	HideGlobalContentNav bool
	HideComunidade       bool

	SortOrder int
}

// IsLive sinaliza se a base está disponível ao público.
func (b *Base) IsLive() bool {
	return b.Status == StatusLive
}
