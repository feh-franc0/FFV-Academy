package handlers

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"

	appsr "github.com/fernandofv/api/internal/application/studyrequest"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// StudyRequestHandler recebe solicitações de experiência de estudo
// personalizada (formulário público da landing).
//
// Endpoint: POST /api/v1/study-requests (sem auth).
// Content-Type: multipart/form-data (suporta arquivos opcionais).
type StudyRequestHandler struct {
	create *appsr.CreateUseCase
}

func NewStudyRequestHandler(create *appsr.CreateUseCase) *StudyRequestHandler {
	return &StudyRequestHandler{create: create}
}

// Limite total do request multipart: 200 MiB
// (até 10 anexos × 25 MiB = 250 MiB; deixamos 200 com margem por que a maioria
// das solicitações virá com 1-3 arquivos pequenos).
const maxMultipartBytes = 200 * 1024 * 1024

// errFileTooLarge é retornado quando o middleware/limite detecta excesso.
var errFileTooLarge = errors.New("arquivo excede tamanho máximo")

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

	// 32 MiB em memória; o resto vai pro disco temporário do sistema.
	if err := r.ParseMultipartForm(32 << 20); err != nil {
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
