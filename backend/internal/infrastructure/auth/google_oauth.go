package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/fernandofv/api/internal/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// GoogleUserInfo contém os campos retornados pela Google userinfo API.
type GoogleUserInfo struct {
	Sub       string `json:"sub"`   // Google user ID único
	Email     string `json:"email"`
	Name      string `json:"name"`
	Picture   string `json:"picture"`
	Verified  bool   `json:"email_verified"`
}

// GoogleOAuthAdapter lida com o fluxo OAuth2 do Google.
type GoogleOAuthAdapter struct {
	cfg oauth2.Config
}

func NewGoogleOAuthAdapter(cfg config.GoogleOAuthConfig) *GoogleOAuthAdapter {
	return &GoogleOAuthAdapter{
		cfg: oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			RedirectURL:  cfg.RedirectURL,
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     google.Endpoint,
		},
	}
}

// AuthURL gera a URL de redirecionamento para o Google com state CSRF.
func (a *GoogleOAuthAdapter) AuthURL(state string) string {
	return a.cfg.AuthCodeURL(state, oauth2.AccessTypeOnline)
}

// Exchange troca o code pelo token e retorna o perfil do usuário Google.
func (a *GoogleOAuthAdapter) Exchange(ctx context.Context, code string) (*GoogleUserInfo, error) {
	token, err := a.cfg.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("google oauth: exchange: %w", err)
	}

	client := a.cfg.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return nil, fmt.Errorf("google oauth: userinfo request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google oauth: userinfo status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("google oauth: read body: %w", err)
	}

	var info GoogleUserInfo
	if err := json.Unmarshal(body, &info); err != nil {
		return nil, fmt.Errorf("google oauth: decode userinfo: %w", err)
	}

	if !info.Verified {
		return nil, fmt.Errorf("google oauth: email não verificado")
	}

	return &info, nil
}
