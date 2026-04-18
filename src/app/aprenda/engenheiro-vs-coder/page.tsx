import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  KeyValue,
  StackFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('engenheiro-vs-coder');

const ACCENT = '#e3b341';

const quiz: QuizQuestion[] = [
  {
    question:
      'Qual habilidade perde valor mais rápido com agents de código maduros?',
    options: [
      'Entender trade-off de arquitetura',
      'Escrever CRUD padrão e boilerplate (copy do StackOverflow, setup de libs, glue code)',
      'Decompor problema em subproblemas',
      'Fazer code review sério',
    ],
    correct: 1,
    explanation:
      'O que agent faz bem e barato é o trabalho mecânico. Se sua entrega é ~montar CRUD seguindo tutorial, essa parte agora tem custo marginal. O que não depreciou: decompor, especificar, revisar com olho crítico, decidir trade-off, operar o sistema em produção.',
  },
  {
    question:
      'Qual é a diferença de responsabilidade entre um engenheiro e um coder que usa agent?',
    options: [
      'Nenhuma',
      'O engenheiro é responsável pelo sistema (correção, performance, custo, segurança, operação); o coder é responsável pelo código que escreveu. Quando agent gera código ruim, é o engenheiro que responde — não o modelo',
      'O engenheiro não toca em código',
      'Coder ganha mais',
    ],
    correct: 1,
    explanation:
      'Accountability. O agent é ferramenta; a decisão de colocar o código em produção é humana. Engenheiro responde por outage, bug, vazamento, custo. Coder que terceiriza a responsabilidade no "foi o Claude que escreveu" não é engenheiro.',
  },
  {
    question:
      'Qual é o novo gargalo de produtividade em times que usam agents?',
    options: [
      'Velocidade de digitação',
      'Clareza da spec, qualidade do contexto dado ao agent, e velocidade de revisão humana do PR — o que o humano faz virou o caminho crítico',
      'Tamanho do monitor',
      'Tokens por segundo do modelo',
    ],
    correct: 1,
    explanation:
      'Quem escreve spec mal gera agent confuso; quem revisa PR de agent em 5 min deixa passar bug. O gargalo se deslocou de "digitar código" para "pensar antes de codar" e "revisar depois de codar". Skills de engineering sênior passam a dominar a produtividade.',
  },
  {
    question:
      'Por que "cobertura de skill T-shaped" (largo + profundo) virou ainda mais importante?',
    options: [
      'Não é mais importante',
      'Agent ajuda em qualquer stack, reduzindo custo de transitar entre áreas; mas pra revisar e decidir você precisa de profundidade em algo. Largura permite escolher problema certo; profundidade permite resolver direito',
      'Especializar só em frontend',
      'Largura tomou o lugar de profundidade',
    ],
    correct: 1,
    explanation:
      'T-shaped: horizontal = entende banco, rede, observabilidade, UI, custos, negócio — consegue pensar no sistema inteiro; vertical = é referência em 1-2 áreas e consegue revisar PR com olho de especialista. Agent potencializa ambos mas não substitui nenhum.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="engenheiro-vs-coder"
      title="Engenheiro vs Coder: o que mudou na era dos agents"
      icon="🧭"
      xp={60}
      readTime={14}
      trailName="Engenharia de Software Moderna"
      trailColor={ACCENT}
      nextSlug="spec-driven-development"
      nextTitle="Spec-Driven Development (SDD): a nova espinha dorsal"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Por duas décadas, a principal habilidade de um &ldquo;programador&rdquo; era{' '}
        <strong>traduzir intenção em código</strong>. Em 2026, agents como Claude Code, Codex, Cursor e Copilot fazem essa tradução em
        minutos — muitas vezes melhor que o humano médio em stack conhecido. Isso não acaba com a profissão; <em>redefine o que é
        valioso</em>. O coder — pessoa que implementa a feature que te passaram — vira commodity. O engenheiro — pessoa que decide o
        que construir, por quê, como validar e como operar — vira o cargo mais disputado da década.
      </p>

      <Section title="O mapa do trabalho mudou" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          title="Onde fica o valor humano em 2026"
          items={[
            { icon: '🎯', label: 'Entender o problema', sub: 'alto valor', detail: 'Conversar com usuário, ler ticket, entender restrição de negócio. Agent ajuda, mas não substitui.', connector: 'gera' },
            { icon: '📜', label: 'Escrever spec', sub: 'alto valor', detail: 'Descrever o que, por quê, restrições, critérios de aceite. A nova forma de programar.', connector: 'vira' },
            { icon: '🤖', label: 'Agent implementa', sub: 'commodity', detail: 'Código CRUD, glue, refactor mecânico, tests triviais. Barato.', connector: 'produz' },
            { icon: '🔍', label: 'Revisar PR', sub: 'alto valor', detail: 'Ler com olho crítico: correção, invariante, performance, segurança, design.', connector: 'decide' },
            { icon: '🚀', label: 'Operar sistema', sub: 'alto valor', detail: 'SLO, incidentes, custo, observabilidade, capacidade. Agent ajuda; humano responde.' },
          ]}
        />
        <Callout tone="info">
          <strong>A curva inverteu.</strong> Antes: 80% do tempo escrevendo código, 20% pensando e operando. Agora: 20% gerando
          código, 80% pensando em spec, revisando, decidindo e operando. Quem insiste em só &ldquo;produzir código rápido&rdquo;
          está competindo onde a IA é melhor e mais barata.
        </Callout>
      </Section>

      <Section title="O coder x o engenheiro em 2026" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'Coder', 'Engenheiro']}
          rows={[
            ['Input', 'Ticket com descrição clara', 'Problema ambíguo, stakeholder conflitante'],
            ['Foco', 'Implementar a feature', 'Resolver o problema (feature é meio)'],
            ['Relação com agent', 'Dá prompt, copia saída', 'Dá contexto, spec, revisa rigor'],
            ['Code review', 'Verifica se passa CI', 'Lê invariantes, performance, segurança, evolução'],
            ['Acerta quando', 'Stack conhecido, pattern comum', 'Sistema novo, restrição real de produção'],
            ['Produz valor por', 'Linhas de código/hora', 'Decisão técnica que evita retrabalho'],
            ['Responsabilidade', 'Código entregue', 'Sistema em produção ao longo do tempo'],
            ['Paga ~', 'Comprimido pelo agent', 'Crescente — gargalo real'],
          ]}
        />
      </Section>

      <Section title="Skills que ganham peso" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Decomposição', v: 'Quebrar problema em subproblemas tratáveis e independentes. Agent ajuda em cada pedaço; humano desenha o quebra-cabeça.' },
            { k: 'Leitura de sistema', v: 'Entrar em um repo de 300k linhas e mapear arquitetura, contratos, pontos frágeis em 1-2 horas.' },
            { k: 'Escrita de spec', v: 'Documento curto que vira código/teste: objetivo, requisitos, restrições, critérios de aceite, não-objetivos.' },
            { k: 'Code review crítico', v: 'Detectar invariante quebrada, race condition, N+1, memory leak, failure mode — não só estilo.' },
            { k: 'Trade-off consciente', v: 'Escolher entre consistency vs availability, monolito vs micro, sync vs async, com base em carga real.' },
            { k: 'Observabilidade', v: 'Pensar em log, métrica, traçado e SLO antes de shippar. Agent não pensa nisso sozinho.' },
            { k: 'Economia', v: 'Custo por request, custo de infra, custo de token, custo de vendor lock-in. A conta acaba na sua mesa.' },
            { k: 'Comunicação', v: 'Escrever RFC, conduzir review, alinhar expectativa. Texto é a nova linguagem de programação.' },
          ]}
        />
      </Section>

      <Section title="Skills que perdem peso" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Memorizar sintaxe', v: 'Agent lembra. Entender o modelo mental da linguagem segue valendo; decorar idioms não.' },
            { k: 'Código boilerplate', v: 'Setup de lib, CRUD, dao, dto, mapper, fixture. Agent gera em 30 segundos.' },
            { k: 'Refactor mecânico', v: 'Renomear, extrair função, converter API síncrona em async, migrar versão. Agent faz.' },
            { k: 'Tutorial surface-level', v: '&quot;Fiz um CRUD em Spring Boot&quot; já não impressiona ninguém — agent faz, testa e deploya.' },
            { k: 'Copiar do Stack Overflow', v: 'Vira anti-padrão agora — agent dá resposta contextualizada no seu repo.' },
          ]}
        />
        <Callout tone="warn">
          <strong>Cuidado com falso senso de segurança.</strong> &ldquo;Perde peso&rdquo; não é &ldquo;zero&rdquo;. Você ainda
          precisa saber o que agent está fazendo — senão aceita PR com vulnerabilidade, bug de concorrência ou decisão ruim.
          Quem não entende o que lê não consegue revisar.
        </Callout>
      </Section>

      <Section title="O novo ciclo de trabalho" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '🗣️', label: 'Conversa com stakeholder', sub: '1', detail: 'Entender dor real, não o que está escrito no ticket. Pergunta certa vale o dia todo.', connector: 'extrai' },
            { icon: '📝', label: 'Draft de spec', sub: '2', detail: 'Um markdown com objetivo, requisitos, não-objetivos, critérios de aceite, riscos.', connector: 'valida com par' },
            { icon: '🧠', label: 'Planejamento técnico', sub: '3', detail: 'Decomposição em tarefas, escolha de arquitetura, identificação de unknowns.', connector: 'delega' },
            { icon: '🤖', label: 'Agent gera código', sub: '4', detail: 'Com spec + contexto + tools certos. Você pilota, não digita.', connector: 'revisa' },
            { icon: '🔍', label: 'Review humano crítico', sub: '5', detail: 'Ler linha a linha as partes não triviais. Rejeitar quando suspeito.', connector: 'testa' },
            { icon: '🧪', label: 'Validação (testes reais)', sub: '6', detail: 'Unit, integração, property-based, edge case. Agent ajuda; humano checa que faz sentido.', connector: 'deploy' },
            { icon: '📊', label: 'Observa em produção', sub: '7', detail: 'Log, métrica, erro, latência, custo. Ajusta SLO e alerta. É aqui que você vira sênior.' },
          ]}
        />
      </Section>

      <Section title="Quatro cenários reais" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Migrar uma API Node de Express 4 para Fastify"
          winner="Agent faz, humano revisa"
          why="É refactor mecânico com pattern claro. Agent converte rotas, middlewares, handlers em 1 hora. Humano foca nas partes não triviais: testes de contrato, handlers com side-effect, ordem de registração."
          alternatives={[{ name: 'Humano sozinho', note: 'gasta 2-3 dias pra fazer o que agent faz em 1 hora.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Desenhar um sistema de idempotência para pagamentos"
          winner="Humano lidera, agent ajuda"
          why="Trade-off entre consistency, latência, custo e UX. Envolve entender fluxo de retry do cliente, idempotency key, locking, tempo de retenção. Agent gera código quando você já sabe o que quer."
          alternatives={[{ name: 'Agent sozinho', note: 'produz solução genérica que funciona em demo mas falha em escala real.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Debug de latência P99 que subiu em produção"
          winner="Humano com agent como pair"
          why="Requer contexto operacional (dashboards, traces, queries, infra) que só o humano tem. Agent ajuda a ler flamegraph, sugerir hipótese, escrever benchmark — mas o fio de raciocínio é humano."
          alternatives={[{ name: 'Agent sozinho', note: 'sem acesso ao ambiente ou traces reais, chuta.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Escrever 300 testes unitários de CRUD"
          winner="Agent faz"
          why="Trabalho mecânico, previsível e auditável via cobertura + PR review. Seu tempo rende mais em property-based test e em integração contra DB real."
          alternatives={[{ name: 'Estagiário', note: 'custa mais, entrega mais lento, e ainda usa o agent escondido.' }]}
        />
      </Section>

      <Section title="Armadilhas comuns do coder que quer virar engenheiro" accent={ACCENT}>
        <ul className="flex flex-col gap-2" style={{ color: 'var(--ffv-muted)' }}>
          <li>
            • <strong>&ldquo;Se agent escreveu, não preciso entender&rdquo;</strong> — maior receita pra bug em produção que
            existe hoje. Entenda tudo que você shippa.
          </li>
          <li>
            • <strong>&ldquo;Agent é mais inteligente que eu&rdquo;</strong> — modelo não sabe seu sistema, seu cliente, seu
            custo. Falar com autoridade ≠ estar certo.
          </li>
          <li>
            • <strong>&ldquo;Só uso agent pra ter produtividade&rdquo;</strong> — produtividade sem direção é dívida técnica em
            velocidade alta.
          </li>
          <li>
            • <strong>Ignorar operação</strong> — se você não entra em pager, não vê dashboard, não lê log, não vira sênior.
          </li>
          <li>
            • <strong>Evitar design doc</strong> — time maduro escreve RFC antes de código. Quem foge da escrita foge do pensar.
          </li>
        </ul>
      </Section>

      <Section title="Como se preparar (plano concreto de 6 meses)" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Mês 1', v: 'Leia 3 livros: Designing Data-Intensive Applications (Kleppmann), A Philosophy of Software Design (Ousterhout), The Pragmatic Engineer Guide (Orosz).' },
            { k: 'Mês 2', v: 'Escreva 3 RFCs na sua empresa. Qualquer decisão técnica não-trivial vira doc público pra discussão.' },
            { k: 'Mês 3', v: 'Participe de incident review. Escreva 1 postmortem. É onde operação vira intuição.' },
            { k: 'Mês 4', v: 'Faça code review sério em 50+ PRs. Foque em invariante, performance, segurança — não em estilo.' },
            { k: 'Mês 5', v: 'Implemente 1 projeto do zero usando SDD + agent: spec → plano → agent → review → deploy → observability.' },
            { k: 'Mês 6', v: 'Dê tech talk interno. Ensinar é a forma mais rápida de descobrir o que você ainda não entende.' },
          ]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Se agent faz tudo, por que ainda preciso aprender a programar?"
          a="Pra revisar. Pra decidir o trade-off. Pra identificar quando agent está errado. Programar é raciocinar sobre estado, mudança, invariante — isso não desapareceu, só mudou de forma."
        />
        <QAItem
          q="Meu chefe quer métrica de produtividade. Como mostro valor agora?"
          a="Outcome, não output. PRs mergeados não conta; bug em produção, SLO, MTTR, custo por request, NPS do dev team — sim. Se sua empresa só mede linha de código, vá embora."
        />
        <QAItem
          q="Vou ser substituído?"
          a="Se seu diferencial é volume de código: sim. Se é entendimento de problema, decisão e operação: não por uma década — e mesmo depois, resta o papel de accountability."
        />
        <QAItem
          q="Como saber se meu time tá fazendo isso certo?"
          a="Procure por: RFCs antes de código, review sério de PR, postmortems sem blame, custo monitorado, deploy frequente e seguro. Ausência desses sinais é time ainda no modo coder."
        />
        <QAItem
          q="O que faço pra começar amanhã?"
          a={
            <>
              Antes de escrever código, escreva 1 parágrafo respondendo: <em>qual o problema? qual a solução? qual o risco? como
              validar?</em> Essa é a spec mais simples — é aqui que a próxima aula entra.
            </>
          }
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) Coder vira commodity; engenheiro vira gargalo. (2) Valor migra para entender problema,
        escrever spec, revisar e operar. (3) Agent é multiplicador de intenção, não substituto de pensamento. (4) Responsabilidade
        pelo sistema é sempre humana. (5) A próxima aula (SDD) é onde o pensamento vira ferramenta.
      </Callout>
    </div>
  );
}
