import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('crisp-intercom-suporte');

const accent = '#fbbf24';

const quiz: QuizQuestion[] = [
  { question: 'Intercom Fin (AI agent) resolve quanto dos tickets típicos?', options: ['5%', '50%+ de resolução autônoma quando alimentado com help center robusto. Anthropic Claude/GPT por baixo. Quando não resolve, escala para humano com contexto. Mudou economics de suporte SaaS em 2024-2025', '100%', '10%'], correct: 1, explanation: 'Intercom Fin (lançado 2023, refinado 2024-2025) é o "ChatGPT do suporte" treinado no seu help center. Resolve 50%+ em benchmarks reais. Quando precisa humano, repassa com transcrição completa. Custo: ~$1/conversa resolvida.' },
  { question: 'Plain destaca-se por:', options: ['Ser igual Intercom', 'Suporte dev-first: API-first, queue baseada em código, integração GitHub Issues nativa, customer chat dentro do produto via SDK. Pricing transparente, sem "Contact Us". Padrão para SaaS B2B técnico em 2026', 'Apenas legacy', 'Não suporta AI'], correct: 1, explanation: 'Plain (plain.com) é o "Linear do customer support". API-first, devs amam, queue como código. Foco em B2B SaaS técnico (Vercel, Linear, Cursor, Resend usam). Inclui AI agent moderna.' },
  { question: 'Crisp para indie/early-stage:', options: ['Caro', 'Plano gratuito generoso, $25/mo unlock multi-agent, chatbot, integrations. DX simples, widget bonito, mobile app para responder. Default para indie até ~$10k MRR', 'Apenas enterprise', 'Não tem mobile'], correct: 1, explanation: 'Crisp é a opção indie/early-stage clássica. Free tier viável para single-founder. Upgrade para Pro ($25) destrava maioria das features. Quando passa de 10k MRR e time cresce, pode virar pequeno demais.' },
  { question: 'Pylon vs Plain para B2B:', options: ['Idênticos', 'Pylon: foco em Slack/Teams (customer suporta via Slack compartilhado). Plain: foco em widget in-app + API. Modelos complementares — Pylon para customers que vivem no Slack (typical B2B mid-market), Plain para apps with rich in-product chat', 'Apenas Pylon', 'Pylon é grátis'], correct: 1, explanation: 'Pylon (pylon.com) é o "Slack-native" — customer cria ticket em canal Slack compartilhado, time interno responde. Excelente para B2B mid-market que já comunica via Slack. Plain é "in-app" — widget + API. Cada um para um pattern.' },
  { question: 'FRT (First Response Time), CSAT, deflection rate — quais importam?', options: ['Só CSAT', 'Todos: FRT impacta NPS, CSAT é norte qualitativo, deflection rate (% de tickets resolvidos por AI/self-service) é eficiência operacional. Em 2026, deflection vira métrica principal devido a AI', 'Apenas FRT', 'Apenas CSAT'], correct: 1, explanation: 'Stack moderna: deflection rate (40-60% target via AI + help center) + FRT (< 5min business hours) + CSAT (> 90%). Anthropic Fin reportou 50%+ deflection em casos reais.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="crisp-intercom-suporte" title="Suporte: Crisp vs Intercom Fin vs Plain, AI-first agora" icon="💬" xp={55} readTime={11}
      trailName="Solo SaaS / Indie Hacker Stack" trailColor={accent} nextSlug="llc-americana-faturamento-int" nextTitle="LLC americana" quiz={quiz}>
      <Section title="Suporte virou AI-first em 2024-2026" accent={accent}>
        <p className="text-sm leading-6">Intercom Fin lançou 2023 e mudou tudo. AI resolve 50%+ dos tickets corriqueiros via help center. Humano fica para casos complexos. Stack moderna combina AI agent + humano hand-off + analytics. Para indie, mesmo o Crisp tem AI agent decente agora.</p>
      </Section>
      <Section title="Comparativo por estágio" accent={accent}>
        <ComparisonTable accent={accent} headers={['Tool', 'Estágio ideal', 'Pricing approx', 'Diferencial']} rows={[
          ['Crisp', 'Indie / pre-PMF', 'Free → $25/mo', 'Free generoso, mobile, DX simples'],
          ['Intercom Fin', 'Growth / scale B2C/B2B', '$74/seat + Fin per resolution', 'AI agent maduro, suite completa'],
          ['Plain', 'B2B SaaS técnico', '$30/seat', 'API-first, dev-friendly, Linear-style'],
          ['Pylon', 'B2B mid-market Slack-heavy', 'Custom (~$30-50/seat)', 'Suporte via Slack compartilhado'],
          ['Zendesk', 'Enterprise legacy', '$55-115/seat', 'Suite enterprise, plenty integrations'],
          ['Help Scout', 'Mid-market human-first', '$25/seat', 'Email-based simples'],
        ]} />
      </Section>
      <Section title="Métricas que importam" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Deflection rate', v: '% de conversas resolvidas sem human handoff. Target 40-60% com AI bem configurado' },
          { k: 'FRT (First Response Time)', v: '< 5min business hours, < 1h fora — impacta NPS' },
          { k: 'CSAT (Customer Satisfaction)', v: 'Score 1-5 após resolução. > 4.5 = ótimo' },
          { k: 'CES (Customer Effort Score)', v: '"Quão fácil foi resolver?" — preditivo de retention' },
          { k: 'Backlog count', v: 'Tickets em aberto. Subindo = sub-dimensionado ou produto piorando' },
          { k: 'Tags / categorização', v: 'Bugs mais comuns viram backlog product. Sem categorização, dor invisible' },
        ]} />
      </Section>
      <Section title="Help center é a base do AI agent" accent={accent}>
        <p className="text-sm leading-6">Fin/Plain AI funciona consumindo seu help center / docs. Sem help center bem escrito, AI alucina ou diz "não sei". Investimento em docs structured + atualizada = ROI direto em deflection.</p>
        <KeyValue accent={accent} items={[
          { k: 'Articles bem estruturados', v: 'H1 = pergunta clara; conteúdo direto; links para artigos relacionados' },
          { k: 'Cover top intents', v: 'Análise dos top 20 motivos de ticket → cada um vira artigo' },
          { k: 'Atualização contínua', v: 'Cada vez que humano resolveu algo "novo" → artigo' },
          { k: 'Embed no produto', v: 'Não help center isolado; widgets contextuais relevant where user is' },
        ]} />
      </Section>
      <Section title="Setup recomendado por estágio" accent={accent}>
        <ComparisonTable accent={accent} headers={['MRR', 'Stack sugerido']} rows={[
          ['$0-$5k', 'Crisp free + help center próprio (Notion/Tella). Founder responde'],
          ['$5k-$50k', 'Crisp Pro OU Plain. AI agent ativo. Time 1-2 pessoas part-time'],
          ['$50k-$500k', 'Plain ou Intercom Fin. AI handles 50%+. Time dedicado 2-4 pessoas'],
          ['$500k+', 'Intercom Fin + Plain (B2B). AI handles 70%. Time tier-1/tier-2 split'],
          ['Enterprise', 'Intercom suite ou Zendesk. SLAs contratuais. Time global 24/7'],
        ]} />
      </Section>
    </ModuleLayout>
  );
}
