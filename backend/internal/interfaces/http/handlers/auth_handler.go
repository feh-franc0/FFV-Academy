// Package handlers implementa os handlers HTTP da API.
package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	appidentity "github.com/fernandofv/api/internal/application/identity"
	infraauth "github.com/fernandofv/api/internal/infrastructure/auth"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

const (
	refreshCookieName = "ffv_refresh"
	refreshCookiePath = "/api/v1/auth"
	refreshCookieTTL  = 30 * 24 * time.Hour
)

// AuthHandler expõe os endpoints de autenticação.
//
// PADRÃO: Handler por bounded context (SRP), delega toda lógica aos use cases.
type AuthHandler struct {
	requestMagicLink *appidentity.RequestMagicLinkUseCase
	verifyMagicLink  *appidentity.VerifyMagicLinkUseCase
	refreshToken     *appidentity.RefreshTokenUseCase
	logout           *appidentity.LogoutUseCase
	logoutAll        *appidentity.LogoutAllUseCase
	getProfile       *appidentity.GetProfileUseCase
	updateProfile    *appidentity.UpdateProfileUseCase
	deleteAccount    *appidentity.DeleteAccountUseCase
	exportData       *appidentity.ExportUserDataUseCase
	userStats        *appidentity.UserStatsUseCase
	googleAuth       *appidentity.GoogleAuthUseCase
	googleAdapter    *infraauth.GoogleOAuthAdapter
	frontendURL      string
}

func NewAuthHandler(
	requestMagicLink *appidentity.RequestMagicLinkUseCase,
	verifyMagicLink *appidentity.VerifyMagicLinkUseCase,
	refreshToken *appidentity.RefreshTokenUseCase,
	logout *appidentity.LogoutUseCase,
	logoutAll *appidentity.LogoutAllUseCase,
	getProfile *appidentity.GetProfileUseCase,
	updateProfile *appidentity.UpdateProfileUseCase,
	deleteAccount *appidentity.DeleteAccountUseCase,
) *AuthHandler {
	return &AuthHandler{
		requestMagicLink: requestMagicLink,
		verifyMagicLink:  verifyMagicLink,
		refreshToken:     refreshToken,
		logout:           logout,
		logoutAll:        logoutAll,
		getProfile:       getProfile,
		updateProfile:    updateProfile,
		deleteAccount:    deleteAccount,
	}
}

// WithExportData injeta (opcionalmente) o use case de export. Chamado no main.
func (h *AuthHandler) WithExportData(uc *appidentity.ExportUserDataUseCase) *AuthHandler {
	h.exportData = uc
	return h
}

// WithUserStats injeta (opcionalmente) o use case de stats do usuário.
func (h *AuthHandler) WithUserStats(uc *appidentity.UserStatsUseCase) *AuthHandler {
	h.userStats = uc
	return h
}

// WithGoogleOAuth injeta o use case e adapter de Google OAuth (opcional).
func (h *AuthHandler) WithGoogleOAuth(uc *appidentity.GoogleAuthUseCase, adapter *infraauth.GoogleOAuthAdapter, frontendURL string) *AuthHandler {
	h.googleAuth = uc
	h.googleAdapter = adapter
	h.frontendURL = frontendURL
	return h
}

// RequestToken envia o magic link por email e SMS.
// POST /api/v1/auth/request-token
func (h *AuthHandler) RequestToken(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo da requisição inválido", "bad-request")
		return
	}

	cmd := appidentity.RequestMagicLinkCommand{
		Email: strings.TrimSpace(req.Email),
	}
	if _, err := h.requestMagicLink.Execute(r.Context(), cmd); err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusAccepted, map[string]string{"message": "token enviado"})
}

// Verify autentica o usuário com o token recebido.
// POST /api/v1/auth/verify
func (h *AuthHandler) Verify(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Token    string `json:"token"`
		Name     string `json:"name,omitempty"`
		Phone    string `json:"phone,omitempty"`
		Marketing bool  `json:"marketingConsent,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo da requisição inválido", "bad-request")
		return
	}

	cmd := appidentity.VerifyMagicLinkCommand{
		Email: strings.TrimSpace(req.Email),
		Token: strings.TrimSpace(req.Token),
	}
	if req.Name != "" || req.Phone != "" {
		cmd.Registration = &appidentity.RegistrationData{
			Name:             req.Name,
			Phone:            req.Phone,
			MarketingConsent: req.Marketing,
		}
	}

	result, err := h.verifyMagicLink.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	setRefreshCookie(w, result.RefreshToken, result.RefreshExpiresAt)

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"accessToken": result.AccessToken,
		"isNewUser":   result.IsNewUser,
		"user":        userToDTO(result.User),
	})
}

// Refresh emite novos tokens usando o refresh token (HttpOnly cookie).
// POST /api/v1/auth/refresh
func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	raw := extractRefreshToken(r)
	if raw == "" {
		WriteError(w, http.StatusUnauthorized, "refresh token ausente", "missing-token")
		return
	}

	hash := hashToken(raw)
	result, err := h.refreshToken.Execute(r.Context(), hash)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	setRefreshCookie(w, result.RefreshToken, result.RefreshExpiresAt)

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"accessToken": result.AccessToken,
		"user":        userToDTO(result.User),
	})
}

// LogoutAll revoga todos os refresh tokens do usuário (logout de todos os dispositivos).
// POST /api/v1/auth/logout-all
func (h *AuthHandler) LogoutAll(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	_ = h.logoutAll.Execute(r.Context(), userID)

	http.SetCookie(w, &http.Cookie{
		Name:     refreshCookieName,
		Value:    "",
		Path:     refreshCookiePath,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
	w.WriteHeader(http.StatusNoContent)
}

// Logout revoga o refresh token atual.
// POST /api/v1/auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	raw := extractRefreshToken(r)
	if raw == "" {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	userID := middleware.UserIDFromContext(r.Context())
	hash := hashToken(raw)
	_ = h.logout.Execute(r.Context(), userID, hash)

	// Limpa o cookie independente do resultado.
	http.SetCookie(w, &http.Cookie{
		Name:     refreshCookieName,
		Value:    "",
		Path:     refreshCookiePath,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
	w.WriteHeader(http.StatusNoContent)
}

// GetProfile retorna o perfil do usuário autenticado.
// GET /api/v1/me
func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	user, err := h.getProfile.Execute(r.Context(), userID)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, userToDTO(user))
}

// UpdateProfile atualiza o perfil do usuário.
// PATCH /api/v1/me
func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name             string `json:"name"`
		Phone            string `json:"phone"`
		MarketingConsent *bool  `json:"marketingConsent"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo da requisição inválido", "bad-request")
		return
	}

	userID := middleware.UserIDFromContext(r.Context())
	cmd := appidentity.UpdateProfileCommand{
		UserID:           userID,
		Name:             req.Name,
		Phone:            req.Phone,
		MarketingConsent: req.MarketingConsent,
	}

	user, err := h.updateProfile.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, userToDTO(user))
}

// DeleteAccount deleta (soft) a conta do usuário — LGPD.
// DELETE /api/v1/me
func (h *AuthHandler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	if err := h.deleteAccount.Execute(r.Context(), userID); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// ExportData retorna um JSON com todos os dados pessoais do usuário (LGPD).
// GET /api/v1/me/export
func (h *AuthHandler) ExportData(w http.ResponseWriter, r *http.Request) {
	if h.exportData == nil {
		WriteError(w, http.StatusNotImplemented, "export não configurado", "not-implemented")
		return
	}
	userID := middleware.UserIDFromContext(r.Context())
	cmd := appidentity.ExportUserDataCommand{
		UserID:    userID,
		IP:        clientIPFromRequest(r),
		UserAgent: r.UserAgent(),
		RequestID: w.Header().Get("X-Request-ID"),
	}
	result, err := h.exportData.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	w.Header().Set("Content-Disposition",
		"attachment; filename=\"ffv-academy-export-"+userID.String()+".json\"")
	WriteJSON(w, http.StatusOK, result)
}

// UserStats retorna estatísticas agregadas do usuário autenticado.
// GET /api/v1/me/stats
func (h *AuthHandler) UserStats(w http.ResponseWriter, r *http.Request) {
	if h.userStats == nil {
		WriteError(w, http.StatusNotImplemented, "stats não configurado", "not-implemented")
		return
	}
	userID := middleware.UserIDFromContext(r.Context())
	stats, err := h.userStats.Execute(r.Context(), userID)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, stats)
}

// GoogleRedirect inicia o fluxo OAuth2 do Google.
// GET /api/v1/auth/google
func (h *AuthHandler) GoogleRedirect(w http.ResponseWriter, r *http.Request) {
	if h.googleAdapter == nil {
		WriteError(w, http.StatusNotImplemented, "Google OAuth não configurado", "not-implemented")
		return
	}
	state := generateOAuthState()
	url := h.googleAdapter.AuthURL(state)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// GoogleCallback recebe o callback do Google, emite tokens e redireciona ao frontend.
// GET /api/v1/auth/google/callback
func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	if h.googleAdapter == nil || h.googleAuth == nil {
		WriteError(w, http.StatusNotImplemented, "Google OAuth não configurado", "not-implemented")
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		WriteError(w, http.StatusBadRequest, "code ausente", "bad-request")
		return
	}

	info, err := h.googleAdapter.Exchange(r.Context(), code)
	if err != nil {
		HandleDomainError(w, fmt.Errorf("google callback: %w", err))
		return
	}

	result, err := h.googleAuth.Execute(r.Context(), info)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	setRefreshCookie(w, result.RefreshToken, result.RefreshExpiresAt)

	// Redireciona ao frontend passando o access token no hash da URL.
	// Hash não é enviado ao servidor em requests subsequentes — mais seguro que query param.
	redirectURL := fmt.Sprintf("%s/#access_token=%s", h.frontendURL, result.AccessToken)
	http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
}

// generateOAuthState gera um state aleatório para proteção CSRF no OAuth2.
func generateOAuthState() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "fallback-state"
	}
	return hex.EncodeToString(b)
}

// --- helpers ---

func setRefreshCookie(w http.ResponseWriter, token string, expiresAt time.Time) {
	http.SetCookie(w, &http.Cookie{
		Name:     refreshCookieName,
		Value:    token,
		Path:     refreshCookiePath,
		Expires:  expiresAt,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
}

func extractRefreshToken(r *http.Request) string {
	cookie, err := r.Cookie(refreshCookieName)
	if err != nil {
		return ""
	}
	return cookie.Value
}

func hashToken(raw string) string {
	h := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(h[:])
}
