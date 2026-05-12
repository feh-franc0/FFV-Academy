// Package email implementa o adapter de envio de email usando Resend.
package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/fernandofv/api/internal/config"
	"github.com/fernandofv/api/internal/domain/identity"
)

// ResendClient implementa EmailSender via API Resend.
//
// DIP: implementa a interface EmailSender definida em application/identity.
type ResendClient struct {
	cfg        config.ResendConfig
	httpClient *http.Client
}

func NewResendClient(cfg config.ResendConfig) *ResendClient {
	return &ResendClient{
		cfg:        cfg,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

type resendEmailReq struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

func (c *ResendClient) SendMagicLink(ctx context.Context, to identity.Email, token string, expiresIn time.Duration) error {
	html := fmt.Sprintf(`
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
  <h2>🎓 Seu código de acesso FFV Academy</h2>
  <p>Use este código para fazer login:</p>
  <div style="font-size: 2em; font-weight: bold; letter-spacing: 0.3em; color: #58a6ff; padding: 16px; background: #0d1117; border-radius: 8px; text-align: center;">%s</div>
  <p style="color: #666;">Válido por %.0f minutos. Não compartilhe este código.</p>
</div>
`, token, expiresIn.Minutes())

	req := resendEmailReq{
		From:    fmt.Sprintf("%s <%s>", c.cfg.FromName, c.cfg.FromEmail),
		To:      []string{to.String()},
		Subject: fmt.Sprintf("[FFV Academy] Código de acesso: %s", token),
		HTML:    html,
	}

	return c.send(ctx, req)
}

func (c *ResendClient) send(ctx context.Context, req resendEmailReq) error {
	body, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("resend: marshal: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("resend: create request: %w", err)
	}
	httpReq.Header.Set("Authorization", "Bearer "+c.cfg.APIKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("resend: send: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode >= 300 {
		return fmt.Errorf("resend: unexpected status %d", resp.StatusCode)
	}
	return nil
}
