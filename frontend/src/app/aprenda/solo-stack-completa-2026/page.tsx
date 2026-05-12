import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, KeyValue, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('solo-stack-completa-2026');

const accent = '#fbbf24';

const quiz: QuizQuestion[] = [
  { question: 'Vercel + Next.js para solo SaaS — quando deixa de ser ótimo?', options: ['Nunca', 'Quando: bandwidth ou function execution count cresce muito (Vercel fica caro >100k MAU), você precisa long-running workers (Vercel functions limitadas), ou regulamentação exige region específica que Vercel não cobre. Migração comum: Vercel → AWS/Cloudflare em scale', 'Sempre', 'Aos 10 usuários'], correct: 1, explanation: 'Vercel é "Stripe for hosting" — caro mas vale para começar. Cresce, custo escala. Threshold típico: ~100k MAU em SaaS web, função execution count > 1M/mês, ou quando bandwidth domina fatura.' },
  { question: 'Neon vs Supabase para Postgres SaaS:', options: ['São idênticos', 'Neon: Postgres serverless com branching (cada PR = branch isolada, ótimo para preview deploys), foco em DB. Supabase: Postgres + auth + storage + realtime + edge functions como suite completa. Neon para "DB puro modern"; Supabase para "Firebase OSS-like all-in-one"', 'Apenas Supabase', 'Neon não existe'], correct: 1, explanation: 'Dois ângulos do mesmo problema. Neon (neon.tech) é "Postgres como GitHub para code" — branching, serverless, scale-to-zero. Supabase é stack completa. Escolha por shape: já tem auth/storage? Neon. Vai construir do zero? Supabase.' },
  { question: 'Clerk vs Supabase Auth vs WorkOS:', options: ['Idênticos', 'Clerk: DX moderna, user management UI, MFA, social login, organizations, $25-99/mo. Supabase Auth: incluído no Supabase, simples, mais básico. WorkOS: B2B SSO/SAML/SCIM enterprise, modelo "Stripe for enterprise auth". Default indie: Clerk; default B2B selling enterprise: WorkOS', 'Apenas Clerk', 'Apenas WorkOS'], correct: 1, explanation: 'Clerk (clerk.com) é o default indie SaaS B2C/B2B early — DX excelente, includes MFA/orgs/teams. Supabase Auth é bom o suficiente se usa Supabase. WorkOS para B2B SSO enterprise (SAML, SCIM, directory sync) — vendendo para Fortune 500.' },
  { question: 'PostHog para analytics:', options: ['Caro', 'Open-source, autoinstrumentation, product analytics + feature flags + session recording + experiments — concorre com Mixpanel/Amplitude. Free tier generoso até 1M events/mês. Self-host se LGPD-strict', 'Apenas pago', 'Sem feature flags'], correct: 1, explanation: 'PostHog (posthog.com) consolidou-se 2024-2026 como "Mixpanel + LaunchDarkly + Hotjar open-source". Free 1M events suficiente para early-stage. Self-host docker para data sovereignty.' },
  { question: 'Sentry vs Highlight vs OpenTelemetry self-host:', options: ['São iguais', 'Sentry: error tracking + APM + session replay, padrão SaaS, $26/mo. Highlight: session replay + errors, alternativa moderna, open-source self-host. OpenTelemetry: vendor-neutral, requer mais setup. Default indie: Sentry. Self-host: OTel + Grafana stack', 'Apenas Sentry funciona', 'OpenTelemetry não existe'], correct: 1, explanation: 'Sentry é o "default error tracking" há anos. Highlight (highlight.io) emerge como alternativa moderna e mais OSS-friendly. OpenTelemetry é o futuro vendor-neutral mas exige investimento. Comece com Sentry; consider migration ao escalar.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="solo-stack-completa-2026" title="Stack completa solo SaaS 2026: do dia 0 ao $10k MRR" icon="🎯" xp={75} readTime={15}
      trailName="Solo SaaS / Indie Hacker Stack" trailColor={accent} quiz={quiz}>
      <Section title="A stack opinionated 2026" accent={accent}>
        <p className="text-sm leading-6">Como solo founder técnico, você precisa decidir uma vez e iterar — não passar 6 meses comparando frameworks. Esta é a stack que funciona <b>para a maioria dos casos</b> em 2026. Não é universal nem perfeita; é defensavelmente boa o suficiente para tirar do papel.</p>
      </Section>
      <Section title="O stack visualizado" accent={accent}>
        <NodeGraph title="Stack solo SaaS 2026" accent={accent} columns={[
          { label: 'Frontend / App', nodes: [
            { icon: '⚛️', label: 'Next.js 15+', sub: 'App Router, RSC, edge', tone: 'emphasis' },
            { icon: '☁️', label: 'Vercel', sub: 'Hosting + preview deploys' },
            { icon: '🎨', label: 'Tailwind v4 + shadcn/ui', sub: 'UI rápida' },
          ]},
          { label: 'Backend / Data', nodes: [
            { icon: '🐘', label: 'Neon ou Supabase Postgres', sub: 'DB com branching', tone: 'emphasis' },
            { icon: '🔐', label: 'Clerk', sub: 'Auth + user management' },
            { icon: '💳', label: 'Stripe', sub: 'Billing + subscriptions' },
            { icon: '📧', label: 'Resend + React Email', sub: 'Transactional email' },
          ]},
          { label: 'Observability', nodes: [
            { icon: '📊', label: 'PostHog', sub: 'Analytics + feature flags' },
            { icon: '🐛', label: 'Sentry', sub: 'Error tracking + APM' },
            { icon: '📈', label: 'Plausible ou Fathom', sub: 'Web analytics privacy-first' },
          ]},
          { label: 'Suporte & marketing', nodes: [
            { icon: '💬', label: 'Crisp ou Plain', sub: 'Customer support' },
            { icon: '📨', label: 'Loops', sub: 'Lifecycle email' },
            { icon: '🤖', label: 'Claude API / OpenAI', sub: 'AI features' },
          ]},
        ]} />
      </Section>
      <Section title="Custo mensal real (até $10k MRR)" accent={accent}>
        <ComparisonTable accent={accent} headers={['Tool', 'Tier', 'USD/mo']} rows={[
          ['Vercel', 'Pro', '$20'],
          ['Neon ou Supabase', 'Starter', '$0 → $19'],
          ['Clerk', 'Pro', '$25 → $99 (com orgs)'],
          ['Stripe', 'Pay-per-use', '~2.9% revenue'],
          ['Resend', 'Pro', '$20'],
          ['PostHog', 'Free → Growth', '$0 → $30'],
          ['Sentry', 'Team', '$26'],
          ['Plausible', 'Hobby', '$9'],
          ['Crisp', 'Pro', '$25'],
          ['Loops', 'Pro', '$49'],
          ['Domain + email (Google Workspace)', '—', '$12 + $7'],
          ['TOTAL fixo', '', '~$200/mo'],
        ]} />
        <Callout tone="info">Until $10k MRR, total fixo ~$200/mo é o threshold confortável. Stripe é variável, não conta. Acima de $10k MRR, alguns tools (PostHog, Clerk) saltam para tier maior.</Callout>
      </Section>
      <Section title="Quando trocar peças" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Vercel → Cloudflare / AWS', v: 'Quando bandwidth custa mais que app server. Threshold ~100k MAU' },
          { k: 'Neon → RDS / Aurora', v: 'Quando precisa multi-AZ, compliance regulatório específico, ou cluster real' },
          { k: 'Clerk → WorkOS / próprio', v: 'Quando enterprise SSO (SAML, SCIM) virou must-have' },
          { k: 'Stripe → outros', v: 'Raramente. Stripe escala bem. Migrar = dor real' },
          { k: 'PostHog free → Growth', v: 'Quando passa de 1M events/mês ou precisa session recording' },
          { k: 'Sentry → New Relic / Datadog', v: 'Em escala enterprise com SRE team dedicado' },
        ]} />
      </Section>
      <Section title="Alternativas viáveis" accent={accent}>
        <ComparisonTable accent={accent} headers={['Slot', 'Default', 'Alternativa']} rows={[
          ['Framework', 'Next.js', 'Astro (content), Remix, SvelteKit'],
          ['Hosting', 'Vercel', 'Cloudflare Pages + Workers, Netlify, Railway'],
          ['DB', 'Neon Postgres', 'Supabase, PlanetScale, Turso (SQLite distributed)'],
          ['Auth', 'Clerk', 'Supabase Auth, Auth.js, Lucia, WorkOS'],
          ['Billing', 'Stripe', 'Lemon Squeezy (taxa de imposto inclusa), Paddle'],
          ['Email', 'Resend', 'Postmark, SendGrid'],
          ['Analytics', 'PostHog', 'Mixpanel, Amplitude, June'],
          ['Web analytics', 'Plausible', 'Fathom, Vercel Analytics, Umami self-host'],
          ['Errors', 'Sentry', 'Highlight, BetterStack'],
        ]} />
      </Section>
      <Section title="O que NÃO comprar / configurar ainda" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'CDN custom', v: 'Vercel/Cloudflare resolve. Não invente roda' },
          { k: 'Kubernetes', v: 'Pelo menos até $1M ARR. Vercel/Railway/Fly bastam' },
          { k: 'Microserviços', v: 'Você é UMA pessoa. Monolito sério, modular.' },
          { k: 'Multi-region active-active', v: 'Vercel/Cloudflare faz isso. Não monte sozinho' },
          { k: 'Mobile app nativo', v: 'PWA primeiro. Mobile só quando product-market fit comprovado' },
          { k: 'Backoffice próprio', v: 'Retool / Tooljet / Forest Admin resolvem 90% dos casos' },
        ]} />
      </Section>
      <Callout tone="success" icon="🎓">Trilha Solo SaaS / Indie Hacker Stack concluída. Badge <b>Solo Founder</b> desbloqueado. Você tem o playbook para tirar SaaS solo do zero ao $10k MRR sem reinventar nada.</Callout>
    </ModuleLayout>
  );
}
