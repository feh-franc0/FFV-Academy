package handlers

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	appsr "github.com/fernandofv/api/internal/application/studyrequest"
	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// StatusReader é o port mínimo pra ler status de uma study_request — usado
// pelo endpoint público GET /api/v1/study-requests/{id}/status. Subset de
// domsr.Repository: só FindByID. Evita acoplar handler ao repo completo.
type StatusReader interface {
	FindByID(ctx context.Context, id domsr.ID) (*domsr.StudyRequest, error)
}

// StudyRequestHandler recebe solicitações de experiência de estudo
// personalizada (formulário público da landing).
//
// Endpoints:
//   - POST /api/v1/study-requests       — cria nova (multipart, sem auth)
//   - GET  /api/v1/study-requests/{id}/status — consulta status (sem auth)
type StudyRequestHandler struct {
	create *appsr.CreateUseCase
	reader StatusReader // opcional — pode ser nil em ambientes que não expõem /status
}

func NewStudyRequestHandler(create *appsr.CreateUseCase) *StudyRequestHandler {
	return &StudyRequestHandler{create: create}
}

// WithStatusReader anexa a capacidade de ler status. Padrão builder pra evitar
// quebrar o construtor existente e seus callers em test/integration.
func (h *StudyRequestHandler) WithStatusReader(r StatusReader) *StudyRequestHandler {
	h.reader = r
	return h
}

// Limite total do request multipart: 200 MiB
// (até 10 anexos × 25 MiB = 250 MiB; deixamos 200 com margem por que a maioria
// das solicitações virá com 1-3 arquivos pequenos).
const maxMultipartBytes = 200 * 1024 * 1024

// Memória usada pelo ParseMultipartForm antes de spilllar pro disco temporário.
const multipartMemoryBytes = 32 * 1024 * 1024

// Create — POST /api/v1/study-requests
func (h *StudyRequestHandler) Create(w http.ResponseWriter, r *http.Request) {
	// Limita o body total para evitar abuso. Substitui r.Body por um leitor capado.
	r.Body = http.MaxBytesReader(w, r.Body, maxMultipartBytes)

	ct := r.Header.Get("Content-Type")
	if !strings.HasPrefix(ct, "multipart/form-data") {
		WriteError(w, http.StatusUnsupportedMediaType,
			"esperado multipart/form-data", "unsupported-media-type")
		return
	}

	// Body já limitado por MaxBytesReader acima — ParseMultipartForm não vai
	// alocar mais que isso. multipartMemoryBytes controla só o spill em RAM
	// antes de cair pro disco temporário.
	// #nosec G120 — body total limitado em maxMultipartBytes (200 MiB) via
	// MaxBytesReader na linha anterior.
	if err := r.ParseMultipartForm(multipartMemoryBytes); err != nil {
		WriteError(w, http.StatusBadRequest,
			"falha ao processar formulário: "+err.Error(), "parse-error")
		return
	}
	defer func() {
		if r.MultipartForm != nil {
			_ = r.MultipartForm.RemoveAll()
		}
	}()

	cmd := appsr.CreateCommand{
		Name:        r.FormValue("name"),
		Email:       r.FormValue("email"),
		Phone:       r.FormValue("phone"),
		StudyArea:   r.FormValue("studyArea"),
		Institution: r.FormValue("institution"),
		Subject:     r.FormValue("subject"),
		Goal:        r.FormValue("goal"),
		Description: r.FormValue("description"),
	}
	cmd.MarketingConsent = parseFormBool(r.FormValue("marketingConsent"))

	// Se a request vier com JWT (raramente neste endpoint público, mas suportamos),
	// vinculamos o lead ao user logado.
	if uid := middleware.UserIDFromContext(r.Context()); !uid.IsZero() {
		cmd.UserID = uid
	}

	// Arquivos (opcional).
	if r.MultipartForm != nil {
		files := r.MultipartForm.File["attachments"]
		if len(files) > domsr.MaxAttachmentsPerRequest {
			WriteError(w, http.StatusBadRequest,
				fmt.Sprintf("máximo de %d anexos por solicitação", domsr.MaxAttachmentsPerRequest),
				"validation-error")
			return
		}

		// Abrimos todos os arquivos e mantemos abertos até o final do handler.
		// `defer` em loop é seguro aqui porque o slice é pequeno e o handler
		// retorna imediatamente após Execute.
		openedFiles := make([]io.Closer, 0, len(files))
		defer func() {
			for _, c := range openedFiles {
				_ = c.Close()
			}
		}()

		for _, fh := range files {
			if fh.Size <= 0 {
				WriteError(w, http.StatusBadRequest,
					"arquivo vazio: "+fh.Filename, "validation-error")
				return
			}
			if fh.Size > domsr.MaxAttachmentSize {
				WriteError(w, http.StatusRequestEntityTooLarge,
					fmt.Sprintf("arquivo %q excede %d MiB", fh.Filename, domsr.MaxAttachmentSize/1024/1024),
					"file-too-large")
				return
			}
			ct := fh.Header.Get("Content-Type")
			if !domsr.AllowedContentTypes[ct] {
				WriteError(w, http.StatusUnsupportedMediaType,
					fmt.Sprintf("tipo não permitido para %q: %s", fh.Filename, ct),
					"unsupported-file-type")
				return
			}
			f, err := fh.Open()
			if err != nil {
				WriteError(w, http.StatusInternalServerError,
					"falha ao abrir anexo: "+err.Error(), "internal-error")
				return
			}
			openedFiles = append(openedFiles, f)
			cmd.Files = append(cmd.Files, appsr.FileInput{
				FileName:    fh.Filename,
				ContentType: ct,
				SizeBytes:   fh.Size,
				Content:     f,
			})
		}
	}

	result, err := h.create.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusCreated, map[string]interface{}{
		"id":              result.ID,
		"status":          result.Status,
		"attachmentCount": result.AttachmentCount,
		"message":         "Solicitação recebida! Em até 24h sua base de estudo estará pronta — avisaremos por e-mail e WhatsApp.",
	})
}

// statusDTO é o payload retornado pelo endpoint público de status.
// Não inclui PII (email/nome/descrição). Só ID, status traduzido,
// timestamp e ETA estimada.
type statusDTO struct {
	ID          string    `json:"id"`
	Status      string    `json:"status"` // received | curating | delivered | rejected
	SubmittedAt time.Time `json:"submittedAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	EtaHoursMax int       `json:"etaHoursMax"` // 24 sempre — SLA visível
	EtaHoursAvg int       `json:"etaHoursAvg"` // ~12 (média operacional)
}

// mapDomainStatus traduz o status interno (5 valores) pros 3 estados que o
// usuário enxerga (received/curating/delivered) — mais "rejected" como caso
// terminal especial. Esse é o contrato com o frontend (study-request-tracking).
//
//   - pending, in_review → received  (etapa 1)
//   - in_production      → curating  (etapa 2)
//   - ready              → delivered (etapa 3)
//   - rejected           → rejected  (terminal especial)
func mapDomainStatus(s domsr.Status) string {
	switch s {
	case domsr.StatusPending, domsr.StatusInReview:
		return "received"
	case domsr.StatusInProduction:
		return "curating"
	case domsr.StatusReady:
		return "delivered"
	case domsr.StatusRejected:
		return "rejected"
	default:
		return "received"
	}
}

// GetStatus — GET /api/v1/study-requests/{id}/status (público, sem auth).
//
// Privacidade: retorna SOMENTE id + status traduzido + timestamps. Não expõe
// email/nome/descrição. ID é gerado server-side com entropia suficiente
// (formato UUID-like — domsr.ID), inviabilizando enumeração por força bruta.
//
// Rate-limit recomendado no router (rl:study-request-status).
func (h *StudyRequestHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	if h.reader == nil {
		WriteError(w, http.StatusServiceUnavailable, "leitor de status indisponível", "service-unavailable")
		return
	}

	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		WriteError(w, http.StatusBadRequest, "id obrigatório", "validation-error")
		return
	}
	id := domsr.ID(idStr)

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	req, err := h.reader.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, shared.ErrNotFound) {
			// Não confirmar/negar existência via 404 vs 200 — sempre 404 padrão.
			WriteError(w, http.StatusNotFound, "solicitação não encontrada", "not-found")
			return
		}
		HandleDomainError(w, err)
		return
	}

	dto := statusDTO{
		ID:          string(req.ID()),
		Status:      mapDomainStatus(req.Status()),
		SubmittedAt: req.CreatedAt(),
		UpdatedAt:   req.UpdatedAt(),
		EtaHoursMax: 24,
		EtaHoursAvg: 12,
	}

	// Cache curto — status muda no máximo a cada poucas horas (curadoria
	// é manual). 30s reduz pressão no Postgres se usuário fica polling.
	w.Header().Set("Cache-Control", "public, max-age=30")
	WriteJSON(w, http.StatusOK, dto)
}

func parseFormBool(s string) bool {
	if s == "" {
		return false
	}
	b, err := strconv.ParseBool(s)
	if err != nil {
		// Aceita "on" (checkbox HTML default) e "yes" como verdadeiros.
		switch strings.ToLower(strings.TrimSpace(s)) {
		case "on", "yes", "y":
			return true
		}
		return false
	}
	return b
}
