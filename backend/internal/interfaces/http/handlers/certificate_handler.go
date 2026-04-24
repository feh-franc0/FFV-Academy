package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	appcert "github.com/fernandofv/api/internal/application/certificate"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// CertificateHandler expõe os endpoints de certificados.
type CertificateHandler struct {
	issue    *appcert.IssueCertificateUseCase
	verify   *appcert.VerifyCertificateUseCase
	list     *appcert.ListUserCertificatesUseCase
	baseURL  string
}

func NewCertificateHandler(
	issue *appcert.IssueCertificateUseCase,
	verify *appcert.VerifyCertificateUseCase,
	list *appcert.ListUserCertificatesUseCase,
	baseURL string,
) *CertificateHandler {
	return &CertificateHandler{issue: issue, verify: verify, list: list, baseURL: baseURL}
}

// IssueCertificate emite um certificado para uma attempt aprovada.
// POST /api/v1/certificates
func (h *CertificateHandler) IssueCertificate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		AttemptID string `json:"attemptId"`
		Name      string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo inválido", "bad-request")
		return
	}

	attemptID, err := shared.ParseAttemptID(req.AttemptID)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "attemptId inválido", "bad-request")
		return
	}

	userID := middleware.UserIDFromContext(r.Context())
	cmd := appcert.IssueCertificateCommand{
		UserID:    userID,
		AttemptID: attemptID,
		Name:      req.Name,
	}

	cert, err := h.issue.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusCreated, certificateToDTO(cert, h.baseURL))
}

// VerifyCertificate verifica publicamente um certificado pelo hash.
// GET /api/v1/certificates/{hash}
func (h *CertificateHandler) VerifyCertificate(w http.ResponseWriter, r *http.Request) {
	hash := shared.CertificateHash(chi.URLParam(r, "hash"))
	cert, err := h.verify.Execute(r.Context(), hash)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, certificateToDTO(cert, h.baseURL))
}

// ListCertificates lista os certificados do usuário autenticado.
// GET /api/v1/me/certificates
func (h *CertificateHandler) ListCertificates(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	certs, err := h.list.Execute(r.Context(), userID)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	dtos := make([]CertificateDTO, len(certs))
	for i, c := range certs {
		dtos[i] = certificateToDTO(c, h.baseURL)
	}
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"certificates": dtos,
		"total":        len(dtos),
	})
}
