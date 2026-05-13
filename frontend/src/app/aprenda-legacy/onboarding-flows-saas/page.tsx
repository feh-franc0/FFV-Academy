import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  Timeline,
  DecisionBox,
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('onboarding-flows-saas');

const accent = '#fbbf24';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "time-to-value" (TTV) em SaaS e por que < 5 minutos é a meta moderna?',
    options: [
      'É o tempo que o cliente espera para ser cobrado pelo Stripe',
      'TTV é o tempo entre o signup e o momento em que o usuário extrai o primeiro valor real do produto (ex: enviou primeira fatura, gerou primeiro relatório, completou primeira automação). < 5 min é a meta porque: (1) atenção em SaaS PLG é fugaz — Profitwell mostra que 40-60% dos signups abandonam se não chegam ao "aha moment" na primeira sessão; (2) cada minuto extra reduz activation rate; (3) compete com a expectativa estabelecida por Linear, Notion, Figma — produtos que oferecem valor antes mesmo de cadastrar cartão.',
      'TTV é métrica deprecated — em 2026 o que importa é DAU',
      'TTV é só relevante para B2C — B2B aceita semanas',
    ],
    correct: 1,
    explanation: 'TTV (time-to-value) é o KPI norte do onboarding. Linear: você cria projeto + 1 issue em 30 segundos. Notion: template carrega populated em 1 clique. Figma: import de Sketch funciona no signup. Quanto mais cedo o "aha moment", maior activation. Estudos da Mind the Product e Profitwell consistent: cada extra minuto no onboarding reduz conversion em ~5%. Para B2B enterprise, TTV pode ser maior (sales-led), mas PLG SaaS solo precisa estar abaixo de 5 minutos.',
  },
  {
    question: 'Qual é a diferença entre "activation rate" e "conversion rate" e por que activation é mais previsível de churn?',
    options: [
      'São a mesma métrica com nomes diferentes',
      'Conversion rate = % de visitantes que viraram signup ou pagantes. Activation rate = % de signups que completaram a ação-chave do produto na primeira sessão/semana (ex: criou primeiro projeto, convidou 1 colega, conectou Slack). Activation é mais preditiva de retenção porque mede engajamento real, não só compra. Empresas com alta activation (>60%) têm churn médio 2-3x menor. Definir o "Aha Activation Event" certo é o trabalho mais importante de growth — geralmente correlaciona com Day-30 retention em análise de cohort.',
      'Conversion é métrica financeira, activation é métrica de marketing',
      'Activation só importa em apps mobile',
    ],
    correct: 1,
    explanation: 'Frameworks clássicos: AARRR (Dave McClure) tem "Activation" como segundo A após Acquisition. Pendo, Mixpanel e Amplitude documentam o "Activation Event" como métrica norte. Slack definiu o seu como "team enviou 2000 mensagens" — abaixo disso, ~60% churn em 30 dias; acima, ~7%. Você descobre o seu rodando análise de retenção por feature: quais features Day-1 correlacionam com Day-30 retention? Aquilo é seu Activation Event.',
  },
  {
    question: 'Por que checklists de progresso (Linear, Notion-style) funcionam tanto em onboarding?',
    options: [
      'São apenas decoração — não afetam comportamento',
      'Exploram 3 vieses cognitivos: (1) Efeito Zeigarnik — tarefas incompletas geram tensão mental que o usuário quer resolver (checklists com itens marcados puxam pra completar); (2) Goal Gradient — quanto mais perto da conclusão, mais motivado (4/5 itens é mais engajante que 1/5); (3) Progress framing — mostrar progresso explícito (barra, %, X de Y) reduz drop-off vs onboarding "infinito". Linear, Notion e Loom usam checklists persistentes no app por dias/semanas pós-signup. Linear especificamente usa um "Getting Started" panel que só esconde após completar 5 tasks-chave (criar issue, atribuir, mover status, etc.).',
      'Funcionam apenas para usuários millennials',
      'São deprecated — UX moderno usa só product tours',
    ],
    correct: 1,
    explanation: 'Zeigarnik effect (1927): tarefas inacabadas ocupam memória de trabalho até resolverem. Goal-gradient hypothesis (Hull, 1932): motivação aumenta exponencialmente perto da meta. Checklists ativos no produto (não modal, não tutorial) convertem porque o usuário VOLTA ao app para completar — mais sessões na primeira semana = maior retenção. Ferramentas: Userpilot, Appcues, Userflow constroem checklists; Linear/Notion fazem custom.',
  },
  {
    question: 'Quando product tours (Userpilot, Intercom Product Tours) ajudam vs prejudicam onboarding?',
    options: [
      'Sempre ajudam — coloque tooltip em cada botão da interface',
      'Ajudam quando: (1) o produto tem features escondidas/não-óbvias (ex: shortcuts, comandos); (2) você quer guiar para uma ação específica e não para "explorar". Prejudicam quando: (1) cobrem UI funcional com modais bloqueantes (usuário só quer usar); (2) interrompem o flow ao explicar coisas óbvias; (3) tentam ensinar todo o produto de uma vez (cognitive overload). Padrão moderno: tour curto (3-5 steps), pula-passos sempre disponível, contextual ("apareceu quando você abriu pela primeira vez"), nunca bloqueia interação.',
      'Sempre prejudicam — nunca use',
      'Só funcionam em mobile apps',
    ],
    correct: 1,
    explanation: 'Tours mal feitos são um anti-pattern famoso. Princípios: (1) lazy tours — só aparecem quando o usuário hovers a feature; (2) skip everywhere — o botão "skip" é prominente; (3) gamefy progress — mostre que faltam 2 steps, não 18; (4) save state — não force quem já completou a refazer. Ferramentas 2026: Userpilot (tier baixo: $250/mo), Appcues, Intercom Product Tours (embute no widget), Userflow (mais novo), Pendo (enterprise). Para solo: Driver.js (open source) ou react-joyride. Maturidade vs custo.',
  },
  {
    question: 'O que significa "first-mile" do onboarding e o que ele DEVE incluir num SaaS B2B?',
    options: [
      'É só o e-mail de boas-vindas',
      'É o intervalo entre signup e activation event — geralmente os primeiros 5-15 minutos. DEVE incluir: (1) Account setup minimal (não peça 20 campos no signup); (2) data seed (templates, sample data, projeto pré-populado) — usuário não vê app vazio; (3) primeiro success em <5min (envie 1 fatura, gere 1 doc, conecte 1 integração); (4) social proof real (mostre que outros completaram); (5) call-to-team — invite teammate desde o início (Slack faz isso bem). NÃO incluir: tour completo, configuração avançada, billing setup (deixa para depois do activation).',
      'É o tempo entre signup e primeira renovação',
      'É métrica de email marketing, não de produto',
    ],
    correct: 1,
    explanation: 'Conceito de "first mile" popularizado por Samuel Hulick (UserOnboard) e validado em estudos de Reforge. SaaS bem-sucedidos defendem o first mile com obsessão: Loom — botão "Record" disponível imediatamente; Linear — workspace + 1 issue de exemplo pré-criado; Figma — Untitled file aberto no signup. Em B2B: invite teammates é multiplier crítico — produtos com viral coefficient > 1 (cada user convida >1 user) crescem orgânico.',
  },
];

export default function OnboardingFlowsSaasPage() {
  return (
    <ModuleLayout
      slug="onboarding-flows-saas"
      title="Onboarding flows: time-to-value < 5 minutos"
      icon="🚀"
      xp={60}
      readTime={12}
      trailName="Solo SaaS / Indie Hacker Stack 2026"
      trailColor={accent}
      nextSlug="churn-analytics-mrr"
      nextTitle="Churn analytics: cohort, retention, MRR movement"
      quiz={quiz}
    >
      <Section title="O onboarding é o produto" accent={accent}>
        <p>
          Em SaaS Product-Led Growth (PLG), o onboarding <strong>é</strong> o produto. A primeira
          sessão decide se o usuário vira customer ativo ou some no éter. Estudo da Profitwell
          (2023) cruzou dados de 1500+ SaaS: a diferença entre top quartile e bottom quartile em
          retention Day-30 está quase toda na qualidade do onboarding — não no produto core.
        </p>
        <p>
          A meta concreta: <strong>time-to-value (TTV) abaixo de 5 minutos</strong>. Linear, Notion,
          Figma, Loom estabeleceram esse benchmark. Você compete com eles por atenção, mesmo se seu
          produto é em outro nicho.
        </p>
        <Callout tone="info" icon="📊">
          <strong>Dado duro:</strong> Mind the Product / Reforge mostram que cada minuto extra entre
          signup e activation reduz a conversion em 5-10%. Um onboarding de 15 minutos converte
          metade do que um de 5.
        </Callout>
      </Section>

      <Section title="As 4 métricas do onboarding" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Métrica', 'O que mede', 'Benchmark SaaS 2026']}
          rows={[
            ['TTV (Time-to-Value)', 'Tempo signup → primeiro valor extraído', '< 5 min (PLG), < 1 dia (sales-led)'],
            ['Activation Rate', '% signups que completam o Activation Event', '40-60% bom, > 60% excelente'],
            ['Onboarding Completion', '% que completam todos os checklist steps', '50-70% (depende da quantidade)'],
            ['Day-1 / Day-7 / Day-30 Retention', '% ainda ativos N dias depois', 'D1 > 40%, D7 > 25%, D30 > 15%'],
          ]}
        />
        <AnnotatedFormula
          accent={accent}
          title="A função objetivo do onboarding"
          formula="Onboarding ROI = (Activation Rate × LTV) − Cost-to-Build-Onboarding"
          parts={[
            { text: 'Activation Rate', annotation: '% que chegou ao Aha Event. Atacado por checklists, empty states, product tours, copy.' },
            { text: 'LTV', annotation: 'Lifetime value do customer ativado. Aumenta porque retention é maior.' },
            { text: 'Cost-to-Build', annotation: 'Eng time + tools (Userpilot/Appcues). Reaproveite componentes — não construa do zero.' },
          ]}
        />
      </Section>

      <Section title="Definindo o Activation Event" accent={accent}>
        <p>
          A pergunta fundadora: <strong>qual ação do usuário, completada na primeira semana,
          melhor prediz retenção em D30?</strong> Não é &quot;criou conta&quot; — é algo mais específico:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Empresa', 'Activation Event identificado']}
          rows={[
            ['Slack', 'Time enviou 2000 mensagens'],
            ['Facebook (Friendster killer)', '7 amigos em 10 dias'],
            ['Dropbox', '1 file uploadado em 1 device'],
            ['Twitter', 'Seguir 30+ contas'],
            ['Linear', 'Criou 1 issue + assignou'],
            ['Notion', 'Editou 1 doc + compartilhou ou convidou 1 pessoa'],
            ['Loom', 'Gravou 1 vídeo + compartilhou'],
            ['Figma', '1 file editado + 1 colab'],
          ]}
        />
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Como descobrir o seu Activation Event"
          steps={[
            { label: '1. Pegue 6-12 meses de dados', desc: 'Eventos de usuários: signup, primeiras N ações, retention D7/D30.' },
            { label: '2. Cohort de signups por mês', desc: 'Quem signou em janeiro: quais ações tomaram em D1-D7?' },
            { label: '3. Cross-correlation por ação', desc: 'Para cada ação possível, calcule: retention D30 dos que fizeram vs não fizeram. Maior delta = mais predictive.' },
            { label: '4. Inflection point', desc: 'Plot retenção D30 vs N (ações tomadas). Onde a curva quebra (de 10% para 50%, por exemplo) = magic number.' },
            { label: '5. Definir Activation Event', desc: 'Ex: "criou 3 issues + atribuiu pelo menos 1". Esse é seu KPI norte de onboarding.' },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          Não invente o Activation Event por intuição. Mensure. Ferramentas: Mixpanel, Amplitude,
          PostHog (gratuito até 1M eventos/mês — perfeito para solo). Configure cohort retention e
          deixe os dados falarem.
        </Callout>
      </Section>

      <Section title="Os 5 pilares do onboarding moderno" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: '1. Empty states que ensinam', v: 'Tela vazia é oportunidade, não problema. Mostre o que ESTARIA ali com botão direto para criar/importar.' },
            { k: '2. Data seed / sample content', v: 'Pré-popule workspace com template, exemplo, ou import. Usuário NUNCA vê a tela em branco real.' },
            { k: '3. Checklist persistente', v: 'Painel "Getting Started" visível por dias. Itens marcáveis. Progress bar. Esconde só após 80%+ completos.' },
            { k: '4. Product tours contextuais', v: 'Curtos (3-5 steps), lazy (aparecem quando útil), skipáveis. Nunca bloqueiam interação.' },
            { k: '5. Social proof embutido', v: '"5.000 teams usam esse template", "Há 2 minutos um usuário criou um doc". Reduz fricção.' },
          ]}
        />
      </Section>

      <Section title="Anti-patterns comuns (que você vai querer cometer)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Anti-pattern', 'Por que ruim', 'Faça em vez']}
          rows={[
            ['Formulário gigante no signup', 'Cada campo extra = 5-10% drop', 'Pegue só email/senha. Outros campos durante uso ("just-in-time")'],
            ['Email "confirme seu email" obrigatório', 'Drop-off de 20-40% antes mesmo do first session', 'Magic link OU postpone confirmation (libera produto, exige confirm depois de N dias)'],
            ['Modal tutorial bloqueante de 8 steps', 'Usuário fecha e nunca volta', 'Tour curto OU dot indicators inline OU side panel'],
            ['Empty state com "Crie seu primeiro X"', 'Não diz POR QUE criar nem MOSTRA o resultado', 'Preview com mockup + botão "Criar igual" + import option'],
            ['Pedir billing antes do trial', 'Você está cobrando atenção, não cartão', 'Trial sem CC para top-of-funnel; com CC após valor demonstrado'],
            ['Esconder features avançadas atrás de modal "Upgrade"', 'Usuário vê que existe e fica frustrado sem entender', 'Mostrar limit hit no contexto + upgrade contextual com benefit claro'],
          ]}
        />
      </Section>

      <Section title="Linear: onboarding referência" accent={accent}>
        <Timeline
          accent={accent}
          title="O que Linear faz em <2 minutos do signup"
          events={[
            { when: '0:00', label: 'Signup', detail: 'Email + senha. Sem confirm email obrigatório (você já está dentro).' },
            { when: '0:15', label: 'Crie seu workspace', detail: 'Nome + URL slug. Cmd+K ativo desde aqui.' },
            { when: '0:30', label: 'Convide teammates (opcional, mas pushed)', detail: 'Campo de emails + botão "Skip for now". Padrão para PLG B2B.' },
            { when: '0:45', label: 'Workspace populated', detail: 'Já tem: 1 issue exemplo, 1 ciclo ativo, 1 view "My Issues", keyboard shortcuts highlighted.' },
            { when: '1:00', label: 'Getting Started panel', detail: 'Side panel com 5 tasks: criar issue, mover status, criar view, conectar GitHub, convidar 1 teammate. Cada checkmark = +1 milestone.' },
            { when: '1:30', label: 'Aha moment', detail: 'Usuário criou primeira issue e moveu pelo Kanban — TTV atingido.' },
            { when: '2:00', label: 'Side panel continua disponível', detail: 'Não fecha. Reaparece em sessões futuras até completar.' },
          ]}
        />
        <Callout tone="success" icon="🎯">
          O Linear não &quot;ensina o produto&quot;. Ele <em>te coloca no produto fazendo coisas</em>{' '}
          desde o primeiro segundo. Você aprende usando, não vendo tutorial.
        </Callout>
      </Section>

      <Section title="Notion: import + template + collaboration" accent={accent}>
        <p>
          Notion resolve um problema único: como onboardar em uma ferramenta &quot;genérica&quot; (você
          pode fazer qualquer coisa)?
        </p>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Estratégia Notion"
          steps={[
            { label: '1. Pergunta de papel/persona', desc: 'Designer? Engineer? PM? Estudante? Define qual template inicial mostrar.' },
            { label: '2. Templates curados por persona', desc: 'PM vê "Roadmap + Issues + Docs". Estudante vê "Notes + Schedule + Tasks". Pré-populado com exemplos clicáveis.' },
            { label: '3. Import de Evernote/Trello/Google Docs', desc: 'Mostrado proeminentemente — "traga seu trabalho". Reduz fricção de start from scratch.' },
            { label: '4. AI assistant disponível', desc: 'Cmd+J abre Notion AI desde a primeira sessão. Cria conteúdo automático para popular pages.' },
            { label: '5. Convite social', desc: 'Compartilhamento de doc é trivial. Cada doc compartilhado = potential user novo.' },
          ]}
        />
      </Section>

      <Section title="Ferramentas: build vs buy" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Categoria', 'Build', 'Buy (tool)', 'Quando escolher']}
          rows={[
            ['Checklist progress', 'React component + DB column', 'Userpilot, Appcues', 'Build se você tem UX especific. Buy se quer iterar com PM.'],
            ['Product tours', 'Driver.js, react-joyride (free)', 'Userpilot, Pendo, Appcues', 'Build pra solo; Buy se você tem múltiplos fluxos para A/B test.'],
            ['Empty states', 'Sempre build', '—', 'Sempre. É design crítico, não tem comprado pronto.'],
            ['Email onboarding sequences', 'Resend + React Email', 'Customer.io, Loops, Hubspot', 'Build simples; Buy quando precisar de segmentação avançada.'],
            ['In-app messaging', 'Custom modal', 'Intercom, Chameleon', 'Buy quando suporte vai usar tb. Solo: build.'],
            ['Analytics de onboarding', 'PostHog, Mixpanel events', 'Mixpanel, Amplitude funnels', 'Build sempre — você precisa de eventos próprios.'],
          ]}
        />
        <DecisionBox
          scenario="Solo founder com $0 budget, 100 signups/mês, quer melhorar onboarding"
          winner="Build com PostHog (free) + checklist custom + Driver.js"
          winnerColor={accent}
          why="PostHog free aguenta 1M eventos/mês — sobra para 100 signups. Checklist é 1 componente React + 1 tabela no DB (8h de trabalho). Driver.js open source faz tours simples. Total: 0 dinheiro, 2-3 dias de eng."
          alternatives={[
            { name: 'Userpilot ($250+/mo)' }, { name: 'Vale quando você passa 1000 signups/mês e tem PM iterando weekly. Antes é overkill.' }, { name: 'Intercom (caro)' }, { name: 'Para B2B com sales humano envolvido. Solo PLG: pular.' }
          ]}
        />
      </Section>

      <Section title="Construindo o checklist persistente" accent={accent}>
        <p>
          Implementação mínima: tabela <InlineCode>user_onboarding</InlineCode> com colunas
          booleanas por step. Componente lê estado e renderiza UI.
        </p>
        <CodeBlock lang="sql">{`-- Schema
CREATE TABLE user_onboarding (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Steps específicos do produto
  created_first_project BOOLEAN DEFAULT false,
  invited_teammate BOOLEAN DEFAULT false,
  connected_integration BOOLEAN DEFAULT false,
  completed_tutorial BOOLEAN DEFAULT false,
  imported_data BOOLEAN DEFAULT false,
  -- Computed
  completed_at TIMESTAMPTZ -- preenchido quando todos true
);

-- Trigger para marcar completed_at
CREATE OR REPLACE FUNCTION mark_onboarding_complete()
RETURNS trigger AS $$
BEGIN
  IF NEW.created_first_project
     AND NEW.invited_teammate
     AND NEW.connected_integration
     AND NEW.completed_tutorial
     AND NEW.imported_data
     AND NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER onboarding_complete_trigger
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW EXECUTE FUNCTION mark_onboarding_complete();`}</CodeBlock>
        <CodeBlock lang="tsx">{`// components/OnboardingChecklist.tsx
'use client';
import { useOnboarding } from '@/hooks/useOnboarding';

const STEPS = [
  { key: 'created_first_project', label: 'Crie seu primeiro projeto', cta: '/projects/new' },
  { key: 'invited_teammate', label: 'Convide um teammate', cta: '/settings/team' },
  { key: 'connected_integration', label: 'Conecte uma integração', cta: '/settings/integrations' },
  { key: 'completed_tutorial', label: 'Veja o tutorial (3 min)', cta: '/welcome' },
  { key: 'imported_data', label: 'Importe seus dados', cta: '/import' },
] as const;

export function OnboardingChecklist() {
  const { state, completionPct, dismissed, dismiss } = useOnboarding();
  if (dismissed || completionPct === 100) return null;

  return (
    <div className="onboarding-panel">
      <header>
        <h3>Getting started</h3>
        <button onClick={dismiss} aria-label="Dismiss">×</button>
      </header>
      <progress value={completionPct} max={100} />
      <ol>
        {STEPS.map((step) => (
          <li key={step.key} data-done={state[step.key]}>
            <input type="checkbox" checked={state[step.key]} readOnly />
            <a href={step.cta}>{step.label}</a>
          </li>
        ))}
      </ol>
    </div>
  );
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          O checklist é atualizado por eventos da app — quando o user cria projeto, você dispara{' '}
          <InlineCode>UPDATE user_onboarding SET created_first_project = true</InlineCode>. Não use
          polling, use eventos.
        </Callout>
      </Section>

      <Section title="Email onboarding sequence" accent={accent}>
        <p>
          Mesmo com onboarding in-app perfeito, ~40% dos signups não retornam Day-1 sem trigger
          externo. Sequência de email é o segundo motor:
        </p>
        <Timeline
          accent={accent}
          title="Sequência de 5 emails clássica"
          events={[
            { when: 'T+0min', label: 'Welcome email', detail: 'Confirmação + 1 botão "Get started" levando para o onboarding. Plain text, parece pessoal.' },
            { when: 'T+1d', label: 'Quick win email', detail: 'Mostre 1 feature específica que entrega valor rápido. Link direto.' },
            { when: 'T+3d', label: 'Tutorial / case study', detail: 'Como customer X usa o produto. Concreto, não markety.' },
            { when: 'T+7d', label: 'Activation check', detail: 'Se NÃO ativou: email mais agressivo "podemos ajudar?". Se ativou: email "agora tente avançado".' },
            { when: 'T+14d', label: 'Trial ending (se aplicável)', detail: '3 dias antes do trial: lembrete + comparativo de planos.' },
          ]}
        />
        <CodeBlock lang="ts">{`// Trigger sequência ao signup
import { resend } from '@/lib/resend';
import { queue } from '@/lib/queue';

export async function onUserSignup(user: User) {
  // T+0: imediato
  await resend.emails.send({
    from: 'fernando@ffvacademy.com',
    to: user.email,
    subject: 'Bem-vindo à FFV Academy',
    react: WelcomeEmail({ text: user.name }),
  });

  // T+1d, T+3d, T+7d: queue (BullMQ, Inngest, ou cron)
  await queue.schedule('email-day-1', { userId: user.id }, { delay: 86400 * 1000 });
  await queue.schedule('email-day-3', { userId: user.id }, { delay: 3 * 86400 * 1000 });
  await queue.schedule('email-day-7', { userId: user.id }, { delay: 7 * 86400 * 1000 });
}

// Worker checa se já ativou antes de mandar
queue.process('email-day-7', async (job) => {
  const user = await db.users.findUnique({ where: { id: job.data.userId } });
  if (user.activated_at) {
    return sendAdvancedTipsEmail(user);
  } else {
    return sendActivationNudgeEmail(user);
  }
});`}</CodeBlock>
      </Section>

      <Section title="Personas e segmentação" accent={accent}>
        <p>
          Onboarding genérico é OK no MVP. Acima de 500 signups/mês, segmente por persona — onboarding
          diferente para PM, Engineer, Designer, etc.
        </p>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Segmentação via signup question"
          steps={[
            { label: '1. Signup pede "Qual é seu papel?', desc: '4-6 opções: Engineer, Designer, PM, Founder, Other. Field opcional mas pré-selecionado.' },
            { label: '2. Persona vai pra DB', desc: 'users.persona TEXT. Usado para template default, email content, in-app messaging.' },
            { label: '3. Template inicial difere', desc: 'Engineer → workspace com Kanban + issue templates. PM → roadmap. Designer → file board.' },
            { label: '4. Email content varia', desc: 'Resend templates por persona ou Customer.io segments.' },
            { label: '5. Iterate sobre dados', desc: 'Activation rate por persona — qual converte pior? Foque otimização ali.' },
          ]}
        />
      </Section>

      <Section title="Métricas e iteração" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Funnel de signup', v: 'Visit landing → signup form → form completed → email confirmed → first session. Mensure drop em cada step.' },
            { k: 'Funnel de activation', v: 'Signup → step 1 do checklist → ... → Activation Event. Mensure drop entre steps.' },
            { k: 'Time-to-each-step', v: 'Histograma de tempo entre signup e cada step. Identifica onde usuários travam.' },
            { k: 'Cohort retention', v: 'Por semana de signup: % ativos D1, D7, D14, D30. Compare antes vs depois de mudanças no onboarding.' },
            { k: 'Feature-first-use', v: 'Para cada feature key, qual % users a usa em D1, D7, D30? Identifica features sub-utilizadas.' },
          ]}
        />
        <Callout tone="info" icon="📈">
          <strong>Ferramenta:</strong> PostHog free tier dá tudo isso pronto (funnels, cohorts,
          retention) até 1M eventos/mês. Mixpanel free até 100k. Amplitude free até 100k MTU. Para
          solo, PostHog ganha em valor por dolar.
        </Callout>
      </Section>

      <Section title="Perguntas que aparecem na prática" accent={accent}>
        <QAItem
          q="Devo exigir email confirmation antes de liberar produto?"
          a="Depende. Para SaaS B2C ou freemium, NÃO — drop é grande. Libere produto, exija confirm em 7 dias (ou bloqueie features sensíveis após). Para B2B sales-led, sim — cliente espera. Tendência 2026: magic link (passwordless) elimina o problema, login já confirma."
        />
        <QAItem
          q="Empty state com 'sample data' polui o workspace do usuário?"
          a="Risco real. Soluções: (1) flag is_sample = true nos records, escondíveis com 1 clique; (2) workspace 'demo' separado do real; (3) sample data sumível ao primeiro real record. Notion faz (1), Linear faz misto. NÃO faça sample que vira clutter permanente."
        />
        <QAItem
          q="Quanto tempo o checklist deve ficar visível?"
          a="Até completar ~80% ou até user dismissar manual. Não esconda automaticamente em 7 dias — alguns usuários retornam em D14 e o checklist ainda é útil. Linear deixa indefinidamente até completar."
        />
        <QAItem
          q="Devo cobrar o cartão durante o trial?"
          a="Trial com CC (com cartão): conversão ~25% mas signup ~50% menor. Trial sem CC: signup alto, conversão 3-5%. Para SaaS solo monetizando seriedade, trial com CC ganha. Para top-of-funnel viral, sem CC. Métrica: revenue/signup é o que importa, não signup count."
        />
        <QAItem
          q="Como onboardar usuário convidado por outro (invited)?"
          a="Onboarding mais curto — ele já tem contexto do convidador. Pule persona question, mostre quem convidou ('Você foi convidado por Fernando para o workspace XYZ'), leva direto para o workspace populado. Skip cl 80% das introduções."
        />
      </Section>

      <Section title="Referências e ferramentas (2026)" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'UserOnboard.com', v: 'Samuel Hulick decortica onboardings de SaaS líderes — biblioteca gratuita.' },
            { k: 'GrowthDesign.co', v: 'Case studies visuais de onboarding (formato cartoon).' },
            { k: 'Reforge — Retention + Engagement', v: 'Curso pago (~$2k) mas referência da indústria. Casey Winters, Brian Balfour.' },
            { k: 'Profitwell research', v: 'profitwell.com — relatórios públicos sobre retention/activation cross-SaaS.' },
            { k: 'PostHog', v: 'Free analytics até 1M eventos/mês. Funnels, cohorts, session recording.' },
            { k: 'Driver.js', v: 'Library open source para tours/tooltips.' },
            { k: 'Userpilot, Appcues, Pendo', v: 'No-code product adoption tools. $250-2000/mês.' },
          ]}
        />
        <Callout tone="success" icon="➡️">
          <strong>Próximo módulo:</strong> com onboarding decente, agora você precisa medir{' '}
          <em>quem fica</em> e <em>quem sai</em>. Churn analytics, cohort retention, MRR movement —
          a matemática do crescimento SaaS.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
