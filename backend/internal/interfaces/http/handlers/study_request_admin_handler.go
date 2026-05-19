package handlers

import (
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
	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
)

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
	list    *appsr.ListUseCase
	get     *appsr.GetUseCase
	update  *appsr.UpdateUseCase
	storage AttachmentDownloader // opcional
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
}

type studyRequestDetailDTO struct {
	studyRequestSummaryDTO
	Description    string                   `json:"description"`
	InternalNotes  string                   `json:"internalNotes,omitempty"`
	Attachments    []studyRequestAttachDTO `json:"attachments"`
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
