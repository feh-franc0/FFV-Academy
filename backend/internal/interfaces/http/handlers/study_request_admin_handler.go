package handlers

import (
	"archive/zip"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	appsr "github.com/fernandofv/api/internal/application/studyrequest"
	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
)

// VerificationLookup é um port mínimo que o admin handler usa pra exibir
// badges de "email verificado" + "logou há X" na listagem. Subset de
// identity.UserRepository.VerificationStatusBatch — evita acoplar o handler
// ao repo completo. Opcional: se nil, badges não aparecem (compat).
type VerificationLookup interface {
	VerificationStatusBatch(ctx context.Context, ids []shared.UserID) (map[shared.UserID]identity.VerificationStatus, error)
}

// AttachmentDownloader é um adapter opcional do FileStorage que sabe entregar
// o conteúdo binário de um anexo para download. Não vive no domain porque
// download é uma feature de transport, não invariante de negócio.
type AttachmentDownloader interface {
	// Open recebe o storage_url retornado pelo Upload (ex: file:///path ou s3://bucket/key)
	// e devolve o stream + content-type + tamanho. Caller fecha o ReadCloser.
	Open(ctx context.Context, storageURL string) (io.ReadCloser, error)
}

// StudyRequestAdminHandler expõe operações CRUD admin sobre StudyRequest.
type StudyRequestAdminHandler struct {
	list             *appsr.ListUseCase
	get              *appsr.GetUseCase
	update           *appsr.UpdateUseCase
	storage          AttachmentDownloader // opcional
	verificationRepo VerificationLookup   // opcional — badges email_verified
}

func NewStudyRequestAdminHandler(
	list *appsr.ListUseCase,
	get *appsr.GetUseCase,
	update *appsr.UpdateUseCase,
) *StudyRequestAdminHandler {
	return &StudyRequestAdminHandler{list: list, get: get, update: update}
}

func (h *StudyRequestAdminHandler) WithStorage(s AttachmentDownloader) *StudyRequestAdminHandler {
	h.storage = s
	return h
}

// WithVerificationLookup habilita exibição de badges 📩 email_verified +
// last_login_at na listagem. Sem isso, os campos saem omitidos no JSON.
func (h *StudyRequestAdminHandler) WithVerificationLookup(v VerificationLookup) *StudyRequestAdminHandler {
	h.verificationRepo = v
	return h
}

// ─── DTOs ────────────────────────────────────────────────────────

type studyRequestSummaryDTO struct {
	ID               string    `json:"id"`
	UserID           string    `json:"userId,omitempty"`
	Name             string    `json:"name"`
	Email            string    `json:"email"`
	Phone            string    `json:"phone,omitempty"`
	StudyArea        string    `json:"studyArea"`
	Institution      string    `json:"institution,omitempty"`
	Subject          string    `json:"subject"`
	Goal             string    `json:"goal,omitempty"`
	Status           string    `json:"status"`
	MarketingConsent bool      `json:"marketingConsent"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
	// Verificação de email do estudante (vem do user vinculado). Quando o
	// estudante clica no magic-link do email de boas-vindas e entra, esses
	// timestamps são populados. Admin usa pra priorizar leads reais.
	EmailVerifiedAt *time.Time `json:"emailVerifiedAt,omitempty"`
	LastLoginAt     *time.Time `json:"lastLoginAt,omitempty"`
}

type studyRequestDetailDTO struct {
	studyRequestSummaryDTO
	Description   string                  `json:"description"`
	InternalNotes string                  `json:"internalNotes,omitempty"`
	DeliveredURL  string                  `json:"deliveredUrl,omitempty"`
	Attachments   []studyRequestAttachDTO `json:"attachments"`
}

type studyRequestAttachDTO struct {
	ID          string    `json:"id"`
	FileName    string    `json:"fileName"`
	ContentType string    `json:"contentType"`
	SizeBytes   int64     `json:"sizeBytes"`
	StorageURL  string    `json:"storageUrl"`
	DownloadURL string    `json:"downloadUrl"`
	CreatedAt   time.Time `json:"createdAt"`
}

func summaryDTO(req *domsr.StudyRequest) studyRequestSummaryDTO {
	return studyRequestSummaryDTO{
		ID:               req.ID().String(),
		UserID:           req.UserID().String(),
		Name:             req.Name(),
		Email:            req.Email(),
		Phone:            req.Phone(),
		StudyArea:        req.StudyArea(),
		Institution:      req.Institution(),
		Subject:          req.Subject(),
		Goal:             req.Goal(),
		Status:           req.Status().String(),
		MarketingConsent: req.MarketingConsent(),
		CreatedAt:        req.CreatedAt(),
		UpdatedAt:        req.UpdatedAt(),
	}
}

func detailDTO(req *domsr.StudyRequest) studyRequestDetailDTO {
	atts := make([]studyRequestAttachDTO, len(req.Attachments()))
	for i, a := range req.Attachments() {
		atts[i] = studyRequestAttachDTO{
			ID:          a.ID.String(),
			FileName:    a.FileName,
			ContentType: a.ContentType,
			SizeBytes:   a.SizeBytes,
			StorageURL:  a.StorageURL,
			DownloadURL: fmt.Sprintf("/api/v1/admin/study-requests/%s/attachments/%s", req.ID().String(), a.ID.String()),
			CreatedAt:   a.CreatedAt,
		}
	}
	return studyRequestDetailDTO{
		studyRequestSummaryDTO: summaryDTO(req),
		Description:            req.Description(),
		InternalNotes:          req.InternalNotes(),
		DeliveredURL:           req.DeliveredURL(),
		Attachments:            atts,
	}
}

// ─── Endpoints ──────────────────────────────────────────────────

// List — GET /api/v1/admin/study-requests?status=&studyArea=&search=&limit=&offset=
func (h *StudyRequestAdminHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	res, err := h.list.Execute(r.Context(), appsr.ListQuery{
		Status:    q.Get("status"),
		StudyArea: q.Get("studyArea"),
		Search:    q.Get("search"),
		Limit:     parseIntParam(q.Get("limit"), 50),
		Offset:    parseIntParam(q.Get("offset"), 0),
	})
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	dtos := make([]studyRequestSummaryDTO, len(res.Items))
	for i, req := range res.Items {
		dtos[i] = summaryDTO(req)
	}

	// Enriquece com email_verified_at + last_login_at do user vinculado.
	// Batch 1-query pra evitar N+1. Falha aqui NÃO bloqueia — DTOs saem
	// sem badge mas com dados normais.
	if h.verificationRepo != nil {
		userIDs := make([]shared.UserID, 0, len(dtos))
		for _, d := range dtos {
			if d.UserID != "" {
				userIDs = append(userIDs, shared.UserID(d.UserID))
			}
		}
		if len(userIDs) > 0 {
			statuses, err := h.verificationRepo.VerificationStatusBatch(r.Context(), userIDs)
			if err == nil {
				for i, d := range dtos {
					if status, ok := statuses[shared.UserID(d.UserID)]; ok {
						dtos[i].EmailVerifiedAt = status.EmailVerifiedAt
						dtos[i].LastLoginAt = status.LastLoginAt
					}
				}
			}
		}
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"data":   dtos,
		"total":  res.Total,
		"limit":  res.Limit,
		"offset": res.Offset,
	})
}

// Get — GET /api/v1/admin/study-requests/{id}
func (h *StudyRequestAdminHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	req, err := h.get.Execute(r.Context(), id)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, detailDTO(req))
}

// updateRequest é o body aceito em PATCH. Ponteiros = atualização parcial.
type updateStudyRequestRequest struct {
	Status        *string `json:"status,omitempty"`
	InternalNotes *string `json:"internalNotes,omitempty"`
	DeliveredURL  *string `json:"deliveredUrl,omitempty"`
}

// Update — PATCH /api/v1/admin/study-requests/{id}
func (h *StudyRequestAdminHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		WriteError(w, http.StatusBadRequest, "id é obrigatório", "bad-request")
		return
	}
	var body updateStudyRequestRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo inválido", "bad-request")
		return
	}
	req, err := h.update.Execute(r.Context(), appsr.UpdateCommand{
		ID:            id,
		Status:        body.Status,
		InternalNotes: body.InternalNotes,
		DeliveredURL:  body.DeliveredURL,
	})
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, detailDTO(req))
}

// DownloadAttachment — GET /api/v1/admin/study-requests/{id}/attachments/{attachmentId}
//
// Carrega o request, valida que o attachment pertence a ele, e faz streaming
// do binário diretamente. Mantém o admin no controle (sem URLs temporárias
// expostas — segurança por defesa em profundidade).
func (h *StudyRequestAdminHandler) DownloadAttachment(w http.ResponseWriter, r *http.Request) {
	if h.storage == nil {
		WriteError(w, http.StatusServiceUnavailable, "download não disponível", "storage-not-configured")
		return
	}

	id := chi.URLParam(r, "id")
	attID := chi.URLParam(r, "attachmentId")

	req, err := h.get.Execute(r.Context(), id)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	var target *domsr.Attachment
	for i := range req.Attachments() {
		if req.Attachments()[i].ID.String() == attID {
			a := req.Attachments()[i]
			target = &a
			break
		}
	}
	if target == nil {
		WriteError(w, http.StatusNotFound, "anexo não encontrado", "not-found")
		return
	}

	reader, err := h.storage.Open(r.Context(), target.StorageURL)
	if err != nil {
		if errors.Is(err, shared.ErrNotFound) || errors.Is(err, os.ErrNotExist) {
			WriteError(w, http.StatusGone, "arquivo não disponível no storage", "gone")
			return
		}
		WriteError(w, http.StatusInternalServerError, "falha abrindo arquivo", "internal-error")
		return
	}
	defer reader.Close() //nolint:errcheck

	// Content-Disposition com filename* para preservar acentuação (RFC 5987).
	encoded := url.PathEscape(target.FileName)
	disposition := fmt.Sprintf(
		"attachment; filename=\"%s\"; filename*=UTF-8''%s",
		sanitizeFilenameASCII(target.FileName), encoded,
	)

	w.Header().Set("Content-Type", target.ContentType)
	w.Header().Set("Content-Disposition", disposition)
	w.Header().Set("X-Content-Type-Options", "nosniff")
	if target.SizeBytes > 0 {
		w.Header().Set("Content-Length", fmt.Sprintf("%d", target.SizeBytes))
	}

	if _, err := io.Copy(w, reader); err != nil {
		// Já enviamos headers; só logar via header customizado (cliente pode detectar).
		w.Header().Set("X-Stream-Error", "1")
	}
}

// DownloadZip — GET /api/v1/admin/study-requests/{id}/download-all
//
// Stream-a um arquivo .zip contendo todos os anexos da solicitação, lendo
// cada um via FileStorage.Open e gravando direto na response (sem buffer
// completo em memória). Nome do zip: solicitacao-<id-curto>.zip.
//
// Cada entry preserva o filename original (UTF-8 — zip suporta via flag 0x800).
// Se um anexo falhar (movido/perdido no storage), pula esse entry e continua;
// o zip termina íntegro com os arquivos restantes. Falhas ficam registradas
// no header X-Stream-Error pra observabilidade.
func (h *StudyRequestAdminHandler) DownloadZip(w http.ResponseWriter, r *http.Request) {
	if h.storage == nil {
		WriteError(w, http.StatusServiceUnavailable, "download não disponível", "storage-not-configured")
		return
	}

	id := chi.URLParam(r, "id")
	req, err := h.get.Execute(r.Context(), id)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	atts := req.Attachments()
	// NOTA: aceitamos ZIP mesmo sem anexos físicos — o solicitacao.json com
	// dados do form sempre estará incluído (admin pode usar pra alimentar IA).

	zipName := fmt.Sprintf("solicitacao-%s.zip", shortID(req.ID().String()))
	encoded := url.PathEscape(zipName)
	disposition := fmt.Sprintf(
		"attachment; filename=\"%s\"; filename*=UTF-8''%s",
		zipName, encoded,
	)
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", disposition)
	w.Header().Set("X-Content-Type-Options", "nosniff")
	// Sem Content-Length: stream zip não conhece o tamanho final antes do write.

	zw := zip.NewWriter(w)
	defer zw.Close() //nolint:errcheck

	// 1) Metadata da solicitação (form data) — sempre incluso. Esse arquivo é
	// o "input estruturado" que o admin alimenta na IA pra gerar o hub.
	if err := writeMetadataEntries(zw, req); err != nil {
		// Não aborta o zip — tenta entregar o que conseguir.
		w.Header().Set("X-Metadata-Error", "1")
	}

	// 2) Anexos físicos do storage.
	used := make(map[string]int, len(atts))
	failures := 0
	for _, a := range atts {
		entryName := "anexos/" + uniqueEntryName(a.FileName, a.ID.String(), used)
		if err := writeZipEntry(r.Context(), zw, h.storage, a, entryName); err != nil {
			failures++
			continue
		}
	}
	if failures > 0 {
		w.Header().Set("X-Stream-Error", fmt.Sprintf("%d/%d", failures, len(atts)))
	}
}

// writeMetadataEntries injeta dois arquivos no ZIP:
//   - solicitacao.json: forma estruturada (todos os campos) — fácil de parsear por IA
//   - solicitacao.txt:  forma legível pra humano abrir e ler de cara
//
// Esses arquivos têm as MESMAS info; só formato diferente. Conveniência pro admin.
func writeMetadataEntries(zw *zip.Writer, req *domsr.StudyRequest) error {
	meta := buildRequestMetadata(req)

	jsonBytes, err := json.MarshalIndent(meta, "", "  ")
	if err != nil {
		return err
	}
	if err := writeZipBytes(zw, "solicitacao.json", jsonBytes); err != nil {
		return err
	}

	return writeZipBytes(zw, "solicitacao.txt", []byte(renderMetadataTXT(meta)))
}

// requestMetadata captura todos os campos pro solicitacao.json.
type requestMetadata struct {
	ID               string                  `json:"id"`
	Name             string                  `json:"name"`
	Email            string                  `json:"email"`
	Phone            string                  `json:"phone,omitempty"`
	StudyArea        string                  `json:"studyArea"`
	Institution      string                  `json:"institution,omitempty"`
	Subject          string                  `json:"subject"`
	Goal             string                  `json:"goal,omitempty"`
	Description      string                  `json:"description"`
	Status           string                  `json:"status"`
	MarketingConsent bool                    `json:"marketingConsent"`
	DeliveredURL     string                  `json:"deliveredUrl,omitempty"`
	CreatedAt        time.Time               `json:"createdAt"`
	UpdatedAt        time.Time               `json:"updatedAt"`
	Attachments      []requestMetaAttachment `json:"attachments"`
}

type requestMetaAttachment struct {
	FileName    string `json:"fileName"`
	ContentType string `json:"contentType"`
	SizeBytes   int64  `json:"sizeBytes"`
}

func buildRequestMetadata(req *domsr.StudyRequest) requestMetadata {
	atts := req.Attachments()
	metaAtts := make([]requestMetaAttachment, 0, len(atts))
	for _, a := range atts {
		metaAtts = append(metaAtts, requestMetaAttachment{
			FileName:    a.FileName,
			ContentType: a.ContentType,
			SizeBytes:   a.SizeBytes,
		})
	}
	return requestMetadata{
		ID:               req.ID().String(),
		Name:             req.Name(),
		Email:            req.Email(),
		Phone:            req.Phone(),
		StudyArea:        req.StudyArea(),
		Institution:      req.Institution(),
		Subject:          req.Subject(),
		Goal:             req.Goal(),
		Description:      req.Description(),
		Status:           req.Status().String(),
		MarketingConsent: req.MarketingConsent(),
		DeliveredURL:     req.DeliveredURL(),
		CreatedAt:        req.CreatedAt(),
		UpdatedAt:        req.UpdatedAt(),
		Attachments:      metaAtts,
	}
}

func renderMetadataTXT(m requestMetadata) string {
	var b strings.Builder
	b.WriteString("════════════════════════════════════════════════\n")
	b.WriteString("  SOLICITAÇÃO DE EXPERIÊNCIA DE ESTUDO — FFV\n")
	b.WriteString("════════════════════════════════════════════════\n\n")
	fmt.Fprintf(&b, "ID:           %s\n", m.ID)
	fmt.Fprintf(&b, "Recebida em:  %s\n", m.CreatedAt.Format("02/01/2006 15:04"))
	fmt.Fprintf(&b, "Status atual: %s\n\n", m.Status)
	b.WriteString("─── ESTUDANTE ───────────────────────────────────\n")
	fmt.Fprintf(&b, "Nome:         %s\n", m.Name)
	fmt.Fprintf(&b, "Email:        %s\n", m.Email)
	if m.Phone != "" {
		fmt.Fprintf(&b, "WhatsApp:     %s\n", m.Phone)
	}
	if m.Institution != "" {
		fmt.Fprintf(&b, "Instituição:  %s\n", m.Institution)
	}
	b.WriteString("\n─── CONTEÚDO SOLICITADO ─────────────────────────\n")
	fmt.Fprintf(&b, "Área:         %s\n", m.StudyArea)
	fmt.Fprintf(&b, "Tema:         %s\n", m.Subject)
	if m.Goal != "" {
		fmt.Fprintf(&b, "Objetivo:     %s\n", m.Goal)
	}
	b.WriteString("\nDescrição completa:\n")
	b.WriteString(m.Description)
	b.WriteString("\n\n")
	if len(m.Attachments) > 0 {
		b.WriteString("─── ANEXOS ──────────────────────────────────────\n")
		for _, a := range m.Attachments {
			fmt.Fprintf(&b, "  • %s (%s · %d bytes)\n", a.FileName, a.ContentType, a.SizeBytes)
		}
		b.WriteString("\nVeja a pasta anexos/ deste ZIP para os arquivos físicos.\n")
	}
	if m.DeliveredURL != "" {
		fmt.Fprintf(&b, "\n─── ENTREGA ─────────────────────────────────────\nURL: %s\n", m.DeliveredURL)
	}
	return b.String()
}

func writeZipBytes(zw *zip.Writer, name string, data []byte) error {
	h := &zip.FileHeader{Name: name, Method: zip.Deflate, Modified: time.Now()}
	h.SetMode(0o644)
	w, err := zw.CreateHeader(h)
	if err != nil {
		return err
	}
	_, err = w.Write(data)
	return err
}

// writeZipEntry abre o anexo no storage e copia o conteúdo pra um entry novo
// dentro do zip. Erros são propagados pro caller decidir se aborta ou pula.
func writeZipEntry(
	ctx context.Context,
	zw *zip.Writer,
	storage AttachmentDownloader,
	att domsr.Attachment,
	entryName string,
) error {
	reader, err := storage.Open(ctx, att.StorageURL)
	if err != nil {
		return err
	}
	defer reader.Close() //nolint:errcheck

	header := &zip.FileHeader{
		Name:     entryName,
		Method:   zip.Deflate,
		Modified: att.CreatedAt,
	}
	// Habilita UTF-8 no entry (bit 11 do general purpose flag).
	header.SetMode(0o644)
	header.NonUTF8 = false

	out, err := zw.CreateHeader(header)
	if err != nil {
		return err
	}
	if _, err := io.Copy(out, reader); err != nil {
		return err
	}
	return nil
}

// uniqueEntryName garante que dois anexos com mesmo filename original não
// sobrescrevam um ao outro dentro do zip. Em colisão, prefixa o id curto.
func uniqueEntryName(fileName, attachmentID string, used map[string]int) string {
	name := sanitizeZipEntryName(fileName)
	if _, ok := used[name]; !ok {
		used[name] = 1
		return name
	}
	used[name]++
	ext := filepath.Ext(name)
	base := strings.TrimSuffix(name, ext)
	return fmt.Sprintf("%s-%s%s", base, shortID(attachmentID), ext)
}

// sanitizeZipEntryName remove separadores de path do nome (evita zip-slip
// se nome original tiver "/" ou "..") e colapsa nomes vazios em "arquivo".
func sanitizeZipEntryName(name string) string {
	name = filepath.Base(name)
	name = strings.ReplaceAll(name, "\\", "_")
	name = strings.TrimSpace(name)
	if name == "" || name == "." || name == ".." {
		return "arquivo"
	}
	return name
}

func shortID(id string) string {
	if len(id) >= 8 {
		return id[:8]
	}
	return id
}

// sanitizeFilenameASCII produz uma variante apenas-ASCII pro fallback de
// browsers antigos. Substitui caracteres não-ASCII por '_'.
func sanitizeFilenameASCII(name string) string {
	var b strings.Builder
	for _, r := range name {
		if r > 127 {
			b.WriteRune('_')
			continue
		}
		if r == '"' || r == '\\' {
			b.WriteRune('_')
			continue
		}
		b.WriteRune(r)
	}
	if b.Len() == 0 {
		return "download"
	}
	return b.String()
}

// helper opcional (não usada agora, mas pode ajudar em testes)
var _ = mime.TypeByExtension
var _ = filepath.Ext
