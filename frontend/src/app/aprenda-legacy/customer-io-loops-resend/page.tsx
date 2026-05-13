import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('customer-io-loops-resend');

const accent = '#fbbf24';

const quiz: QuizQuestion[] = [
  { question: 'Resend vs Postmark vs SendGrid:', options: ['São idênticos', 'Resend: DX moderna React Email + TS-first, ótimo para transactional. Postmark: foco em transactional, alta reputation. SendGrid: legacy, mais features mas DX pior. Em 2026 indie/startup vai Resend; enterprise legacy SendGrid', 'Apenas SendGrid funciona', 'Resend é caro'], correct: 1, explanation: 'Resend (~2022) é o "Stripe do email" — DX excelente, React Email integration nativa, preço justo. Postmark continua referência em deliverability. SendGrid é a opção corporate legacy.' },
  { question: 'Customer.io vs Loops:', options: ['Idênticos', 'Customer.io: behavioral segmentation profunda, journeys complexas, B2B/SaaS maduro. Loops: simples, foco em product-led growth, DX moderna, mais barato para começar. Loops <100k contacts; Customer.io para scale + complexity', 'Apenas Customer.io', 'Apenas Loops'], correct: 1, explanation: 'Customer.io é a "Salesforce Marketing Cloud do indie" — poderoso, configuração séria. Loops é o "novo" — visual, simples, ideal para SaaS com < 100k MAU. Em scale e complexidade enterprise, Customer.io ganha.' },
  { question: 'DKIM, SPF, DMARC — para que?', options: ['Logging', 'Autenticação de email para deliverability. SPF: lista IPs que podem enviar pelo seu domínio. DKIM: assinatura criptográfica do conteúdo. DMARC: política do que fazer se SPF/DKIM falham + relatórios. Sem os 3 configurados, email cai em spam', 'Apenas para spam', 'Não importa'], correct: 1, explanation: 'DKIM/SPF/DMARC é o "TLS 1.3 do email" — obrigatório em 2026. Gmail/Yahoo exigem desde fev/2024 para senders > 5000 emails/dia. Sem isso, taxa de entrega despenca, vai para spam.' },
  { question: 'React Email:', options: ['Não existe', 'Lib que permite escrever templates de email em React/JSX, com componentes que renderizam HTML email-compatible (table-based, inline styles). Funciona com Resend, Sendgrid, etc. Resolve "email HTML é um inferno"', 'Apenas para Outlook', 'Substitui SMTP'], correct: 1, explanation: 'React Email (Resend team, 2023) destrava DX moderna em email. JSX → HTML email-compatible. Componentes prontos para inbox compatibility (Outlook horror incluído). Open-source, integra com qualquer ESP.' },
  { question: 'Transactional vs Marketing email — separar?', options: ['Sempre junto', 'Sim, separar — em domínio (mail.app.com vs newsletter.app.com), em provider (Postmark transactional + Loops marketing) ou pelo menos em sub-domain. Marketing problemático afeta reputation; transactional crítico precisa entregar', 'Apenas para grandes', 'Não afeta'], correct: 1, explanation: 'Reputation de domínio é por (sub)domain. Newsletter com spam complaints pode degradar entrega de password reset crítico. Separação é boa prática indie/scale.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="customer-io-loops-resend" title="Email engineering: Customer.io, Loops, Resend, transactional" icon="📧" xp={60} readTime={12}
      trailName="Solo SaaS / Indie Hacker Stack" trailColor={accent} nextSlug="crisp-intercom-suporte" nextTitle="Suporte AI-first" quiz={quiz}>
      <Section title="A pilha de email em 2026" accent={accent}>
        <p className="text-sm leading-6">Email continua o canal de mais alto ROI em SaaS. Stack moderna separa <b>transactional</b> (signup, password reset, receipts — crítico) de <b>marketing/lifecycle</b> (onboarding, retention, newsletters). Cada um com tool ideal diferente.</p>
      </Section>
      <Section title="Comparativo de providers" accent={accent}>
        <ComparisonTable accent={accent} headers={['Tool', 'Foco', 'Pricing approx', 'Quando usar']} rows={[
          ['Resend', 'Transactional + DX moderna', '3k/mo grátis, depois $20/mo', 'Default indie 2026'],
          ['Postmark', 'Transactional alta deliverability', '$15/mo 10k', 'Enterprise critical'],
          ['SendGrid', 'Legacy enterprise', '$20/mo+', 'Já tem integração'],
          ['Loops', 'Marketing + product, simples', '$49/mo', 'PLG SaaS, < 100k contacts'],
          ['Customer.io', 'Behavioral, journeys complexas', '$150/mo+', 'B2B scale, segmentation rica'],
          ['ConvertKit / Beehiiv', 'Newsletter creators', 'Varies', 'Content creator, audience-first'],
          ['Brevo (ex Sendinblue)', 'All-in-one', '$25/mo+', 'EU GDPR-first'],
        ]} />
      </Section>
      <Section title="React Email + Resend" accent={accent}>
        <CodeBlock lang="tsx">{`// email/welcome.tsx
import { Html, Body, Container, Heading, Text, Button } from '@react-email/components';

export default function WelcomeEmail({ name }: { text: string }) {
  return (
    <Html>
      <Body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f6f8fa' }}>
        <Container style={{ maxWidth: 560, margin: '40px auto', padding: 32, background: 'white', borderRadius: 8 }}>
          <Heading>Bem-vinda, {name} 👋</Heading>
          <Text>Estamos felizes em ter você na FFV Academy.</Text>
          <Button href="https://ffvacademy.com/onboarding" style={{ background: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: 8 }}>
            Começar
          </Button>
        </Container>
      </Body>
    </Html>
  );
}`}</CodeBlock>
        <CodeBlock lang="typescript">{`// api/send.ts
import { Resend } from 'resend';
import WelcomeEmail from '@/email/welcome';

const resend = new Resend(process.env.RESEND_API_KEY!);

await resend.emails.send({
  from: 'FFV Academy <hello@mail.ffvacademy.com>',
  to: user.email,
  subject: 'Bem-vinda à FFV Academy!',
  react: WelcomeEmail({ text: user.name }),
});`}</CodeBlock>
      </Section>
      <Section title="DKIM / SPF / DMARC — setup obrigatório" accent={accent}>
        <CodeBlock lang="text">{`# DNS records típicos (Resend setup)

# SPF (TXT record na raiz do domain)
"v=spf1 include:_spf.resend.com ~all"

# DKIM (TXT record em resend._domainkey)
"v=DKIM1; k=rsa; p=<long-public-key>"

# DMARC (TXT record em _dmarc)
"v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yourdomain.com; pct=100"

# DMARC policy progression:
# 1. p=none     — apenas relatórios, sem ação
# 2. p=quarantine — falhas vão para spam
# 3. p=reject   — falhas rejeitadas (mais forte)`}</CodeBlock>
        <Callout tone="warn">Desde fev/2024, Gmail e Yahoo EXIGEM DMARC + DKIM + SPF para senders bulk. Sem isso, 90%+ dos emails caem em spam ou são rejeitados.</Callout>
      </Section>
      <Section title="Marketing/lifecycle com Loops" accent={accent}>
        <CodeBlock lang="typescript">{`// Send event para trigger journey
await fetch('https://app.loops.so/api/v1/events/send', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.LOOPS_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: user.email,
    eventName: 'signup_completed',
    eventProperties: {
      plan: user.plan,
      trial_ends_at: trialEndsAt.toISOString(),
    },
  }),
});

// Loops UI define a journey:
// - Email 1: welcome (delay 0min)
// - Email 2: feature tour (delay 1 dia)
// - Email 3: case study (delay 3 dias)
// - Email 4 (condicional): trial ending (delay 12 dias se trial)`}</CodeBlock>
      </Section>
      <Section title="Patterns críticos" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Subdomain separation', v: 'mail.yourdomain.com para transactional, news.yourdomain.com para marketing' },
          { k: 'List hygiene', v: 'Remove bounces hard imediatamente. Reactive low-engagement contacts depois de 6 meses sem abrir.' },
          { k: 'Unsubscribe one-click', v: 'List-Unsubscribe header (Gmail/Yahoo exige). Resend / Loops fazem automaticamente.' },
          { k: 'Preview text', v: 'Primeira linha visible — design intencional' },
          { k: 'Plain text version', v: 'Sempre incluir; melhora deliverability' },
          { k: 'Webhook events', v: 'Resend webhook → Postgres tracking de send/deliver/open/click/bounce' },
        ]} />
      </Section>
    </ModuleLayout>
  );
}
