// Package curriculum contém o domínio de artigos do currículo da plataforma.
//
// Bounded context: gerencia o conteúdo educational estruturado em trilhas e hubs.
// Article é o aggregate root deste contexto.
package curriculum

import (
	"fmt"
	"time"
)

// Dificuldade válidas para artigos do currículo.
const (
	DifficultyBeginner     = "beginner"
	DifficultyIntermediate = "intermediate"
	DifficultyAdvanced     = "advanced"
)

// Article representa um artigo de conteúdo educational.
// É o aggregate root deste bounded context.
// Campos são privados para forçar uso de getters — garante invariantes do domínio.
type Article struct {
	id         string
	slug       string
	title      string
	trailID    string
	hubID      string
	contentMD  string
	xp         int
	readTime   int
	difficulty string
	order      int
	published  bool
	createdAt  time.Time
	updatedAt  time.Time
}

// NewArticle cria um novo Article validando os campos obrigatórios.
// Retorna erro se slug, title, trailID ou hubID estiverem vazios.
func NewArticle(slug, title, trailID, hubID, contentMD, difficulty string, xp, readTime, order int, published bool) (*Article, error) {
	if slug == "" {
		return nil, fmt.Errorf("curriculum: slug é obrigatório")
	}
	if title == "" {
		return nil, fmt.Errorf("curriculum: title é obrigatório")
	}
	if trailID == "" {
		return nil, fmt.Errorf("curriculum: trailID é obrigatório")
	}
	if hubID == "" {
		return nil, fmt.Errorf("curriculum: hubID é obrigatório")
	}
	if difficulty == "" {
		difficulty = DifficultyBeginner
	}

	now := time.Now().UTC()
	return &Article{
		slug:       slug,
		title:      title,
		trailID:    trailID,
		hubID:      hubID,
		contentMD:  contentMD,
		xp:         xp,
		readTime:   readTime,
		difficulty: difficulty,
		order:      order,
		published:  published,
		createdAt:  now,
		updatedAt:  now,
	}, nil
}

// Reconstitute reconstrói um Article a partir de dados persistidos.
// Não valida — assume que o banco de dados é a fonte da verdade.
func Reconstitute(id, slug, title, trailID, hubID, contentMD, difficulty string, xp, readTime, order int, published bool, createdAt, updatedAt time.Time) *Article {
	return &Article{
		id:         id,
		slug:       slug,
		title:      title,
		trailID:    trailID,
		hubID:      hubID,
		contentMD:  contentMD,
		xp:         xp,
		readTime:   readTime,
		difficulty: difficulty,
		order:      order,
		published:  published,
		createdAt:  createdAt,
		updatedAt:  updatedAt,
	}
}

// ─── Getters ─────────────────────────────────────────────────────────────────

// ID retorna o identificador único do artigo (UUID gerado pelo banco).
func (a *Article) ID() string { return a.id }

// Slug retorna o identificador permanente do artigo (ex: "intro-redes-neurais").
func (a *Article) Slug() string { return a.slug }

// Title retorna o título do artigo.
func (a *Article) Title() string { return a.title }

// TrailID retorna o identificador da trilha (ex: "trail1").
func (a *Article) TrailID() string { return a.trailID }

// HubID retorna o identificador do hub (ex: "hub-ia").
func (a *Article) HubID() string { return a.hubID }

// ContentMD retorna o conteúdo Markdown do artigo.
func (a *Article) ContentMD() string { return a.contentMD }

// XP retorna os pontos de experiência concedidos ao completar o artigo.
func (a *Article) XP() int { return a.xp }

// ReadTime retorna o tempo estimado de leitura em minutos.
func (a *Article) ReadTime() int { return a.readTime }

// Difficulty retorna a dificuldade do artigo (beginner|intermediate|advanced).
func (a *Article) Difficulty() string { return a.difficulty }

// Order retorna a ordem do artigo dentro da trilha.
func (a *Article) Order() int { return a.order }

// Published indica se o artigo está publicado e visível aos usuários.
func (a *Article) Published() bool { return a.published }

// CreatedAt retorna a data de criação do artigo.
func (a *Article) CreatedAt() time.Time { return a.createdAt }

// UpdatedAt retorna a data da última atualização do artigo.
func (a *Article) UpdatedAt() time.Time { return a.updatedAt }

// ─── Mutações ─────────────────────────────────────────────────────────────────

// Update atualiza os campos editáveis do artigo e marca o updatedAt.
func (a *Article) Update(title, contentMD, difficulty string, xp, readTime, order int, published bool) {
	if title != "" {
		a.title = title
	}
	a.contentMD = contentMD
	if difficulty != "" {
		a.difficulty = difficulty
	}
	if xp > 0 {
		a.xp = xp
	}
	if readTime > 0 {
		a.readTime = readTime
	}
	a.order = order
	a.published = published
	a.updatedAt = time.Now().UTC()
}
