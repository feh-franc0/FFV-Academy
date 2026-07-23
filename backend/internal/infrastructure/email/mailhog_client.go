// Package email — cliente SMTP para dev local via MailHog.
package email

import (
	"bytes"
	"context"
	"fmt"
	"net/smtp"
	"strings"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
)

// MailhogClient implementa EmailSender via SMTP para dev local (MailHog em localhost:1025).
// Nunca usar em produção — sem autenticação, sem TLS.
type MailhogClient struct {
	addr     string // ex: "localhost:1025"
	fromAddr string // ex: "dev@ffv.local"
}

func NewMailhogClient(addr, fromAddr string) *MailhogClient {
	return &MailhogClient{addr: addr, fromAddr: fromAddr}
}

func (c *MailhogClient) SendMagicLink(_ context.Context, to identity.Email, token string, expiresIn time.Duration) error {
	html := fmt.Sprintf(`
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; color: #18181b;">
  <h2 style="margin: 0 0 12px;">🎓 Seu código de acesso FFV Academy</h2>
  <p style="color: #52525b;">Use este código para fazer login:</p>
  <div style="font-size: 2em; font-weight: bold; letter-spacing: 0.3em; color: #4f46e5; padding: 16px; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; text-align: center;">%s</div>
  <p style="color: #71717a;">Válido por %.0f minutos. Não compartilhe este código.</p>
  <p style="color: #a1a1aa; font-size: 0.8em;">Enviado via MailHog (dev local)</p>
</div>
`, token, expiresIn.Minutes())

	var msg bytes.Buffer
	msg.WriteString("From: FFV Academy Dev <" + c.fromAddr + ">\r\n")
	msg.WriteString("To: " + to.String() + "\r\n")
	fmt.Fprintf(&msg, "Subject: [FFV Academy DEV] Código de acesso: %s\r\n", token)
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(html)

	return smtp.SendMail(c.addr, nil, c.fromAddr, []string{to.String()}, msg.Bytes())
}

// SendHTML envia um email HTML genérico. Reaproveitado por outros notifiers
// (ex: StudyRequestNotifier) em dev.
func (c *MailhogClient) SendHTML(_ context.Context, to []string, subject, htmlBody string) error {
	if len(to) == 0 {
		return nil
	}
	var msg bytes.Buffer
	msg.WriteString("From: FFV Academy Dev <" + c.fromAddr + ">\r\n")
	msg.WriteString("To: " + strings.Join(to, ", ") + "\r\n")
	msg.WriteString("Subject: " + subject + "\r\n")
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)
	return smtp.SendMail(c.addr, nil, c.fromAddr, to, msg.Bytes())
}
