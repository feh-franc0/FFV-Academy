// study_request_notifier: implementa o port studyrequest.EmailNotifier
// reutilizando o transport HTTP/SMTP dos clientes existentes (Resend/MailHog).
//
// Não duplica o transporte; recebe uma função `sendHTML` injetada pelo Composition Root.

package email

import (
	"context"
	"fmt"
	"html"
	"strings"

	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
)

// SendHTMLFunc é o callback de envio que cada client (Resend/MailHog) expõe.
// O Composition Root escolhe qual transport conecta.
type SendHTMLFunc func(ctx context.Context, to []string, subject, htmlBody string) error

// StudyRequestNotifier implementa studyrequest.EmailNotifier.
//
// Recebe:
//   - sendHTML: callback do transport (resend.SendHTML ou mailhog.SendHTML)
//   - adminEmail: para onde enviar notificações de novas solicitações pendentes
//   - frontendURL: usado nos links de "ver detalhes" no email do admin
type StudyRequestNotifier struct {
	sendHTML    SendHTMLFunc
	adminEmail  string
	frontendURL string
}

// NewStudyRequestNotifier cria o notifier. Se adminEmail estiver vazio, a
// notificação ao admin é silenciosamente omitida (sem panic) — útil em dev.
func NewStudyRequestNotifier(sendHTML SendHTMLFunc, adminEmail, frontendURL string) *StudyRequestNotifier {
	return &StudyRequestNotifier{
		sendHTML:    sendHTML,
		adminEmail:  strings.TrimSpace(adminEmail),
		frontendURL: strings.TrimRight(strings.TrimSpace(frontendURL), "/"),
	}
}

// SendReceivedConfirmation: estudante recebe confirmação ao enviar solicitação.
func (n *StudyRequestNotifier) SendReceivedConfirmation(ctx context.Context, to, name string, requestID domsr.ID, subject string) error {
	if n.sendHTML == nil || to == "" {
		return nil
	}
	displayName := firstName(name)
	body := fmt.Sprintf(`
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; color: #18181b;">
  <div style="background: #4f46e5; padding: 32px 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; color: #fff; font-size: 24px; letter-spacing: -0.02em;">Solicitação recebida ✅</h1>
  </div>
  <div style="padding: 28px 24px; border: 1px solid #e4e4e7; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Olá, <strong>%s</strong>!</p>
    <p style="font-size: 15px; line-height: 1.7; color: #52525b;">
      Recebemos sua solicitação de experiência de estudo personalizada sobre
      <strong style="color: #18181b;">%s</strong>.
    </p>
    <div style="background: #f4f4f5; border-left: 4px solid #4f46e5; padding: 16px; margin: 24px 0; border-radius: 6px;">
      <p style="margin: 0; font-size: 13px; color: #52525b; line-height: 1.6;">
        <strong>Próximos passos:</strong><br>
        1. Nosso time vai analisar sua solicitação e seus materiais.<br>
        2. Vamos montar uma trilha de estudo personalizada para o seu objetivo.<br>
        3. Você recebe um email assim que a experiência estiver pronta.
      </p>
    </div>
    <p style="font-size: 13px; line-height: 1.6; color: #71717a;">
      Protocolo da solicitação: <code style="background: #f4f4f5; padding: 2px 6px; border-radius: 4px;">%s</code>
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #71717a; margin-top: 24px;">
      Tem dúvidas ou quer adicionar algo? Responda a este email — chega direto pra gente.
    </p>
  </div>
  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin: 16px 0 0;">FFV Academy · educação personalizada para qualquer área</p>
</div>
`, escapeHTML(displayName), escapeHTML(subject), requestID.String())

	return n.sendHTML(ctx, []string{to}, "✅ Solicitação recebida — FFV Academy", body)
}

// SendAdminNotification: alerta o admin de nova solicitação pendente.
func (n *StudyRequestNotifier) SendAdminNotification(ctx context.Context, adminTo string, req *domsr.StudyRequest) error {
	if n.sendHTML == nil {
		return nil
	}
	target := adminTo
	if target == "" {
		target = n.adminEmail
	}
	if target == "" {
		return nil // sem destinatário configurado — não falha
	}

	detailURL := ""
	if n.frontendURL != "" {
		detailURL = fmt.Sprintf("%s/admin/study-requests/%s", n.frontendURL, req.ID().String())
	}

	attachInfo := ""
	if len(req.Attachments()) > 0 {
		attachInfo = fmt.Sprintf(
			`<tr><td style="padding: 8px 0; color: #4a5568; vertical-align: top;"><strong>Anexos</strong></td><td style="padding: 8px 0;">%d arquivo(s)</td></tr>`,
			len(req.Attachments()),
		)
	}

	cta := ""
	if detailURL != "" {
		cta = fmt.Sprintf(`
<div style="text-align: center; margin: 28px 0 12px;">
  <a href="%s" style="display: inline-block; background: #4f46e5; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
    Abrir no admin →
  </a>
</div>`, detailURL)
	}

	body := fmt.Sprintf(`
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #18181b;">
  <div style="background: #18181b; color: #fff; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <p style="margin: 0; font-family: monospace; font-size: 11px; letter-spacing: 0.1em; color: #06b6d4;">NOVA SOLICITAÇÃO · ADMIN ALERT</p>
    <h2 style="margin: 6px 0 0; font-size: 20px;">%s</h2>
  </div>
  <div style="padding: 20px 24px; border: 1px solid #e4e4e7; border-top: none; border-radius: 0 0 8px 8px;">
    <table style="width: 100%%; font-size: 14px; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #52525b; width: 140px;"><strong>Nome</strong></td><td style="padding: 8px 0;">%s</td></tr>
      <tr><td style="padding: 8px 0; color: #52525b;"><strong>Email</strong></td><td style="padding: 8px 0;">%s</td></tr>
      <tr><td style="padding: 8px 0; color: #52525b;"><strong>WhatsApp</strong></td><td style="padding: 8px 0;">%s</td></tr>
      <tr><td style="padding: 8px 0; color: #52525b;"><strong>Área</strong></td><td style="padding: 8px 0;">%s</td></tr>
      <tr><td style="padding: 8px 0; color: #52525b;"><strong>Instituição</strong></td><td style="padding: 8px 0;">%s</td></tr>
      <tr><td style="padding: 8px 0; color: #52525b;"><strong>Objetivo</strong></td><td style="padding: 8px 0;">%s</td></tr>
      %s
    </table>
    <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 16px 0;">
    <p style="font-size: 13px; color: #52525b; font-weight: 600; margin: 0 0 8px;">Descrição:</p>
    <p style="font-size: 14px; line-height: 1.7; background: #f4f4f5; padding: 12px; border-radius: 6px; white-space: pre-wrap;">%s</p>
    %s
    <p style="font-size: 11px; color: #a1a1aa; margin: 16px 0 0;">ID: %s</p>
  </div>
</div>
`,
		escapeHTML(req.Subject()),
		escapeHTML(req.Name()),
		escapeHTML(req.Email()),
		escapeHTML(emptyOr(req.Phone(), "—")),
		escapeHTML(req.StudyArea()),
		escapeHTML(emptyOr(req.Institution(), "—")),
		escapeHTML(emptyOr(req.Goal(), "—")),
		attachInfo,
		escapeHTML(req.Description()),
		cta,
		req.ID().String(),
	)

	subject := fmt.Sprintf("🆕 Nova solicitação: %s — %s", req.StudyArea(), truncate(req.Subject(), 60))
	return n.sendHTML(ctx, []string{target}, subject, body)
}

// SendStatusUpdate: estudante recebe email quando o status da solicitação muda.
// Quando newStatus=ready E deliveredURL não-vazio, o email vira "celebração":
// CTA grande clicável apontando pro conteúdo gerado pelo admin.
func (n *StudyRequestNotifier) SendStatusUpdate(ctx context.Context, to, name string, requestID domsr.ID, newStatus domsr.Status, subject string, deliveredURL string) error {
	if n.sendHTML == nil || to == "" {
		return nil
	}
	displayName := firstName(name)
	headline, message, accent := statusMessage(newStatus)

	// CTA dedicado quando ready + URL: vira a parte mais importante do email.
	ctaBlock := ""
	if newStatus == domsr.StatusReady && strings.TrimSpace(deliveredURL) != "" {
		ctaBlock = fmt.Sprintf(`
    <div style="text-align: center; margin: 28px 0 8px;">
      <a href="%s"
         style="display: inline-block; background: #059669; color: #fff; text-decoration: none;
                padding: 16px 32px; border-radius: 10px; font-weight: 700; font-size: 16px;
                letter-spacing: -0.01em; box-shadow: 0 4px 14px -4px rgba(5, 150, 105, 0.4);">
        Abrir minha trilha de estudos →
      </a>
    </div>
    <p style="text-align: center; font-size: 12px; color: #71717a; margin: 0 0 12px;">
      ou copie e cole: <a href="%s" style="color: #059669; word-break: break-all;">%s</a>
    </p>`,
			html.EscapeString(deliveredURL),
			html.EscapeString(deliveredURL),
			html.EscapeString(deliveredURL),
		)
	}

	body := fmt.Sprintf(`
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; color: #18181b;">
  <div style="background: %s; padding: 32px 24px; border-radius: 12px 12px 0 0; color: #fff;">
    <p style="margin: 0; font-family: monospace; font-size: 11px; letter-spacing: 0.1em; opacity: 0.85;">UPDATE DA SUA SOLICITAÇÃO</p>
    <h1 style="margin: 8px 0 0; font-size: 24px; letter-spacing: -0.02em;">%s</h1>
  </div>
  <div style="padding: 28px 24px; border: 1px solid #e4e4e7; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Olá, <strong>%s</strong>!</p>
    <p style="font-size: 15px; line-height: 1.7; color: #52525b;">
      Sua solicitação sobre <strong style="color: #18181b;">%s</strong> teve uma atualização.
    </p>
    <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #27272a;">%s</p>
    </div>
    %s
    <p style="font-size: 13px; line-height: 1.6; color: #71717a; margin-top: 20px;">
      Protocolo: <code style="background: #f4f4f5; padding: 2px 6px; border-radius: 4px;">%s</code>
    </p>
  </div>
  <p style="text-align: center; color: #a1a1aa; font-size: 12px; margin: 16px 0 0;">FFV Academy · educação personalizada para qualquer área</p>
</div>
`,
		accent, headline, escapeHTML(displayName), escapeHTML(subject), message,
		ctaBlock, requestID.String(),
	)

	subjectLine := fmt.Sprintf("📨 Atualização da sua solicitação — %s", headline)
	if newStatus == domsr.StatusReady && strings.TrimSpace(deliveredURL) != "" {
		subjectLine = fmt.Sprintf("🎉 Sua trilha de %s está pronta!", subject)
	}
	return n.sendHTML(ctx, []string{to}, subjectLine, body)
}

func statusMessage(s domsr.Status) (headline, message, accent string) {
	switch s {
	case domsr.StatusInReview:
		return "Em análise 🔍",
			"Nosso time começou a analisar sua solicitação e seus materiais. Em breve damos próximos passos.",
			"#4f46e5" // indigo
	case domsr.StatusInProduction:
		return "Curadoria iniciada 🛠️",
			"Começamos a montar sua base de estudo agora — analisando os materiais que você enviou e estruturando trilhas, módulos e questões personalizadas. Em até 24h você recebe o link pronto pra estudar.",
			"#0891b2" // cyan
	case domsr.StatusReady:
		return "Sua trilha está pronta 🎉",
			"Sua base de estudo personalizada foi entregue! Clique no botão abaixo pra acessar agora — trilhas, módulos, questões e tudo organizado pro seu objetivo.",
			"#059669" // emerald
	case domsr.StatusRejected:
		return "Sobre sua solicitação",
			"Infelizmente não conseguimos avançar com essa solicitação no momento. Se quiser, você pode nos enviar uma nova com mais detalhes ou contexto.",
			"#52525b" // zinc
	default:
		return "Atualização", "Recebemos uma atualização na sua solicitação.", "#4f46e5"
	}
}

func escapeHTML(s string) string { return html.EscapeString(s) }

func firstName(name string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		return "estudante"
	}
	parts := strings.Fields(name)
	return parts[0]
}

func emptyOr(s, fallback string) string {
	if strings.TrimSpace(s) == "" {
		return fallback
	}
	return s
}

func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}
	return s[:max-1] + "…"
}
