// Package studyrequest contém o agregado StudyRequest — uma solicitação de
// experiência de estudo personalizada feita por um estudante (de qualquer área).
//
// PADRÃO: DDD aggregate root puro. Sem deps de infra.
//
// V1: time interno revisa cada solicitação e produz o conteúdo manualmente.
// V2 futura: Claude API ingere os attachments e gera trilha automaticamente.
package studyrequest

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"github.com/fernandofv/api/internal/domain/shared"
)

// ─────────────────────────────────────────────────────────────────
// Typed IDs
// ─────────────────────────────────────────────────────────────────

// ID identifica unicamente uma StudyRequest.
type ID string

// NewID gera um novo ID aleatório (UUIDv4).
func NewID() ID { return ID(uuid.NewString()) }

func (id ID) String() string { return string(id) }
func (id ID) IsZero() bool   { return id == "" }

// AttachmentID identifica um arquivo anexado a uma StudyRequest.
type AttachmentID string

func NewAttachmentID() AttachmentID    { return AttachmentID(uuid.NewString()) }
func (id AttachmentID) String() string { return string(id) }

// ─────────────────────────────────────────────────────────────────
// Status enum
// ─────────────────────────────────────────────────────────────────

// Status representa o estado do workflow interno de uma solicitação.
type Status string

const (
	StatusPending      Status = "pending"
	StatusInReview     Status = "in_review"
	StatusInProduction Status = "in_production"
	StatusReady        Status = "ready"
	StatusRejected     Status = "rejected"
)

// IsValid reporta se o status é um dos valores permitidos.
func (s Status) IsValid() bool {
	switch s {
	case StatusPending, StatusInReview, StatusInProduction, StatusReady, StatusRejected:
		return true
	}
	return false
}

func (s Status) String() string { return string(s) }

// ─────────────────────────────────────────────────────────────────
// Attachment (Value Object)
// ─────────────────────────────────────────────────────────────────

// Attachment representa um arquivo anexado pelo estudante (PDF, slides, etc).
// StorageURL aponta para onde o arquivo realmente vive — pode ser s3://, file://, etc.
type Attachment struct {
	ID          AttachmentID
	FileName    string
	ContentType string
	SizeBytes   int64
	StorageURL  string
	CreatedAt   time.Time
}

// MaxAttachmentSize é o limite por arquivo: 25 MiB.
// Por solicitação aceitamos até MaxAttachmentsPerRequest arquivos.
const (
	MaxAttachmentSize        int64 = 25 * 1024 * 1024
	MaxAttachmentsPerRequest       = 10
)

// AllowedContentTypes lista os MIME types permitidos para upload.
// Manter restrito previne abuso (executáveis, scripts, etc.).
var AllowedContentTypes = map[string]bool{
	"application/pdf":    true,
	"image/png":          true,
	"image/jpeg":         true,
	"image/jpg":          true,
	"image/webp":         true,
	"image/gif":          true,
	"text/plain":         true,
	"text/markdown":      true,
	"text/csv":           true,
	"application/msword": true,
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
	"application/vnd.ms-excel": true,
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":         true,
	"application/vnd.ms-powerpoint":                                             true,
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": true,
}

// NewAttachment cria um Attachment validado.
func NewAttachment(fileName, contentType string, size int64, storageURL string, now time.Time) (Attachment, error) {
	fileName = strings.TrimSpace(fileName)
	if fileName == "" {
		return Attachment{}, shared.NewValidationError("arquivo precisa ter um nome")
	}
	if size <= 0 {
		return Attachment{}, shared.NewValidationError("arquivo está vazio")
	}
	if size > MaxAttachmentSize {
		return Attachment{}, shared.NewValidationError(
			fmt.Sprintf("arquivo excede o tamanho máximo de %d bytes", MaxAttachmentSize),
		)
	}
	if !AllowedContentTypes[contentType] {
		return Attachment{}, shared.NewValidationError(
			fmt.Sprintf("tipo de arquivo não permitido: %s", contentType),
		)
	}
	if strings.TrimSpace(storageURL) == "" {
		return Attachment{}, shared.NewValidationError("storage URL é obrigatória")
	}
	return Attachment{
		ID:          NewAttachmentID(),
		FileName:    fileName,
		ContentType: contentType,
		SizeBytes:   size,
		StorageURL:  storageURL,
		CreatedAt:   now,
	}, nil
}

// ─────────────────────────────────────────────────────────────────
// StudyRequest aggregate root
// ─────────────────────────────────────────────────────────────────

// StudyRequest agrega o pedido de um estudante. Lead pode estar deslogado
// (UserID vazio é permitido).
type StudyRequest struct {
	id               ID
	userID           shared.UserID // pode ser zero (lead anônimo)
	name             string
	email            string
	phone            string
	studyArea        string
	institution      string
	subject          string
	goal             string
	description      string
	status           Status
	internalNotes    string
	deliveredURL     string // URL do conteúdo gerado (preenchido ao marcar ready)
	marketingConsent bool
	attachments      []Attachment
	createdAt        time.Time
	updatedAt        time.Time
}

// Input agrupa os campos textuais de criação. Validação no construtor.
type Input struct {
	UserID           shared.UserID // opcional
	Name             string
	Email            string
	Phone            string
	StudyArea        string
	Institution      string
	Subject          string
	Goal             string
	Description      string
	MarketingConsent bool
}

const (
	maxNameLen        = 100
	maxEmailLen       = 254
	maxPhoneLen       = 30
	maxStudyAreaLen   = 80
	maxInstitutionLen = 200
	maxSubjectLen     = 200
	maxGoalLen        = 500
	maxDescriptionLen = 5000
)

// New cria uma StudyRequest validada com status pending.
func New(in Input, now time.Time) (*StudyRequest, error) {
	name := strings.TrimSpace(in.Name)
	if name == "" {
		return nil, shared.NewValidationError("nome é obrigatório")
	}
	if len(name) > maxNameLen {
		return nil, shared.NewValidationError("nome muito longo")
	}

	email := strings.TrimSpace(strings.ToLower(in.Email))
	if email == "" {
		return nil, shared.NewValidationError("email é obrigatório")
	}
	if len(email) > maxEmailLen {
		return nil, shared.NewValidationError("email muito longo")
	}
	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return nil, shared.NewValidationError("email inválido")
	}

	phone := strings.TrimSpace(in.Phone)
	if len(phone) > maxPhoneLen {
		return nil, shared.NewValidationError("telefone muito longo")
	}

	studyArea := strings.TrimSpace(in.StudyArea)
	if studyArea == "" {
		return nil, shared.NewValidationError("área de estudo é obrigatória")
	}
	if len(studyArea) > maxStudyAreaLen {
		return nil, shared.NewValidationError("área de estudo muito longa")
	}

	institution := strings.TrimSpace(in.Institution)
	if len(institution) > maxInstitutionLen {
		return nil, shared.NewValidationError("instituição muito longa")
	}

	subject := strings.TrimSpace(in.Subject)
	if subject == "" {
		return nil, shared.NewValidationError("matéria ou tema é obrigatório")
	}
	if len(subject) > maxSubjectLen {
		return nil, shared.NewValidationError("matéria ou tema muito longo")
	}

	goal := strings.TrimSpace(in.Goal)
	if len(goal) > maxGoalLen {
		return nil, shared.NewValidationError("objetivo muito longo")
	}

	description := strings.TrimSpace(in.Description)
	if description == "" {
		return nil, shared.NewValidationError("descrição é obrigatória")
	}
	if len(description) > maxDescriptionLen {
		return nil, shared.NewValidationError("descrição muito longa")
	}

	return &StudyRequest{
		id:               NewID(),
		userID:           in.UserID,
		name:             name,
		email:            email,
		phone:            phone,
		studyArea:        studyArea,
		institution:      institution,
		subject:          subject,
		goal:             goal,
		description:      description,
		status:           StatusPending,
		marketingConsent: in.MarketingConsent,
		attachments:      nil,
		createdAt:        now,
		updatedAt:        now,
	}, nil
}

// Reconstitute reconstrói um agregado a partir de dados do repositório.
// Não revalida — confia que o DB já tem dados válidos.
func Reconstitute(
	id ID,
	userID shared.UserID,
	name, email, phone, studyArea, institution, subject, goal, description string,
	status Status,
	internalNotes string,
	marketingConsent bool,
	attachments []Attachment,
	createdAt, updatedAt time.Time,
) *StudyRequest {
	return &StudyRequest{
		id:               id,
		userID:           userID,
		name:             name,
		email:            email,
		phone:            phone,
		studyArea:        studyArea,
		institution:      institution,
		subject:          subject,
		goal:             goal,
		description:      description,
		status:           status,
		internalNotes:    internalNotes,
		marketingConsent: marketingConsent,
		attachments:      attachments,
		createdAt:        createdAt,
		updatedAt:        updatedAt,
	}
}

// ReconstituteWithDelivery é igual a Reconstitute mas inclui deliveredURL.
// Repo usa esse construtor quando carrega solicitação com coluna delivered_url
// preenchida (status=ready geralmente). Mantemos os dois pra preservar
// compatibilidade com testes existentes que usam Reconstitute sem o campo novo.
func ReconstituteWithDelivery(
	id ID,
	userID shared.UserID,
	name, email, phone, studyArea, institution, subject, goal, description string,
	status Status,
	internalNotes string,
	deliveredURL string,
	marketingConsent bool,
	attachments []Attachment,
	createdAt, updatedAt time.Time,
) *StudyRequest {
	r := Reconstitute(id, userID, name, email, phone, studyArea, institution, subject, goal, description, status, internalNotes, marketingConsent, attachments, createdAt, updatedAt)
	r.deliveredURL = deliveredURL
	return r
}

// AttachFile adiciona um arquivo anexado. Falha se já atingiu o limite.
func (r *StudyRequest) AttachFile(att Attachment) error {
	if len(r.attachments) >= MaxAttachmentsPerRequest {
		return shared.NewValidationError(
			fmt.Sprintf("número máximo de anexos atingido (%d)", MaxAttachmentsPerRequest),
		)
	}
	r.attachments = append(r.attachments, att)
	return nil
}

// ChangeStatus muda o status do agregado. Valida que o novo status é
// reconhecido e atualiza updated_at via clock injetado.
//
// Decisão V1: aceitamos qualquer transição entre status válidos. O admin
// pode "voltar" um item rejected → pending se foi engano. Em produção,
// adicionaríamos uma máquina de estados estrita.
func (r *StudyRequest) ChangeStatus(s Status, now time.Time) error {
	if !s.IsValid() {
		return shared.NewValidationError(fmt.Sprintf("status inválido: %q", s))
	}
	if r.status == s {
		return nil // idempotente
	}
	r.status = s
	r.updatedAt = now
	return nil
}

// SetInternalNotes atualiza as notas internas (não visíveis ao estudante).
func (r *StudyRequest) SetInternalNotes(notes string, now time.Time) error {
	const maxNotesLen = 10000
	notes = strings.TrimSpace(notes)
	if len(notes) > maxNotesLen {
		return shared.NewValidationError("notas internas muito longas")
	}
	r.internalNotes = notes
	r.updatedAt = now
	return nil
}

// SetDeliveredURL grava o link do conteúdo gerado. Validações:
//   - Vazio é permitido (admin pode limpar se errou).
//   - Quando preenchido, deve começar com http:// ou https://.
//   - Tamanho máximo de 2048 chars (limite seguro de URL).
//
// O setter NÃO força status=ready automaticamente — admin decide quando mudar
// status separadamente (responsabilidade única).
func (r *StudyRequest) SetDeliveredURL(rawURL string, now time.Time) error {
	const maxURLLen = 2048
	url := strings.TrimSpace(rawURL)
	if url == "" {
		r.deliveredURL = ""
		r.updatedAt = now
		return nil
	}
	if len(url) > maxURLLen {
		return shared.NewValidationError("URL de entrega muito longa")
	}
	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		return shared.NewValidationError("URL de entrega deve começar com http:// ou https://")
	}
	r.deliveredURL = url
	r.updatedAt = now
	return nil
}

// AssignToUser vincula a solicitação a um usuário (lead → conta).
// Não falha se já existe vínculo — sobrescreve.
func (r *StudyRequest) AssignToUser(userID shared.UserID, now time.Time) {
	r.userID = userID
	r.updatedAt = now
}

// Getters (Object Calisthenics: no public state).
func (r *StudyRequest) ID() ID                    { return r.id }
func (r *StudyRequest) UserID() shared.UserID     { return r.userID }
func (r *StudyRequest) Name() string              { return r.name }
func (r *StudyRequest) Email() string             { return r.email }
func (r *StudyRequest) Phone() string             { return r.phone }
func (r *StudyRequest) StudyArea() string         { return r.studyArea }
func (r *StudyRequest) Institution() string       { return r.institution }
func (r *StudyRequest) Subject() string           { return r.subject }
func (r *StudyRequest) Goal() string              { return r.goal }
func (r *StudyRequest) Description() string       { return r.description }
func (r *StudyRequest) Status() Status            { return r.status }
func (r *StudyRequest) InternalNotes() string     { return r.internalNotes }
func (r *StudyRequest) DeliveredURL() string      { return r.deliveredURL }
func (r *StudyRequest) MarketingConsent() bool    { return r.marketingConsent }
func (r *StudyRequest) Attachments() []Attachment { return r.attachments }
func (r *StudyRequest) CreatedAt() time.Time      { return r.createdAt }
func (r *StudyRequest) UpdatedAt() time.Time      { return r.updatedAt }
