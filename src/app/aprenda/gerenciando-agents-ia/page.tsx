import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  KeyValue,
  StackFlow,
  SplitFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('gerenciando-agents-ia');

const ACCENT = '#e3b341';

const quiz: QuizQuestion[] = [
  {
    question:
      'O que costuma ser o recurso MAIS limitado ao rodar um agent em produção?',
    options: [
      'CPU',
      'Janela de contexto (tokens) — e não memória RAM. A qualidade do output despenca quando o contexto vira sopa de informação irrelevante',
      'Disco',
      'Número de processos',
    ],
    correct: 1,
    explanation:
      'Contexto é o recurso escasso. Mesmo modelos com 200k-1M tokens perdem qualidade quando recebem lixo, documentos contraditórios ou histórico longo sem curadoria. Gerenciar contexto = curar o que entra (RAG, sumarização, subagents).',
  },
  {
    question:
      'Por que rodar "um agent gigantão pra tudo" costuma ser pior que múltiplos subagents especializados?',
    options: [
      'Porque um agent só fica triste',
      'Subagents isolam contexto e responsabilidade: o orquestrador não polui seu contexto com detalhes de cada tarefa, cada sub carrega apenas o que precisa, e o resultado volta como sumário. Custa menos e tem qualidade maior',
      'Porque agents não sabem trabalhar sozinhos',
      'Porque o modelo cobra por agent ativo',
    ],
    correct: 1,
    explanation:
      'Padrão de sub-agent: orchestrator mantém visão geral (decidir, revisar, juntar); subagents (research, testing, review, security) rodam em janelas próprias e retornam resumos. Reduz custo de token, evita perda de qualidade, ainda permite paralelizar.',
  },
  {
    question:
      'Qual prática zera o maior risco de segurança quando agent executa comandos?',
    options: [
      'Confiar no modelo',
      'Permissões granulares por tool (read-only por default, write só quando humano aprova) + sandbox de execução + auditoria de todo command executado — não há atalho',
      'Rodar só um agent por vez',
      'Desligar a internet',
    ],
    correct: 1,
    explanation:
      'Agent com acesso ilimitado a rm/write/network em produção é incidente esperando pra acontecer. Regras: (1) menor privilégio; (2) confirmação humana em tool destrutivo; (3) log de toda ação; (4) sandbox (container, worktree, VM). Todos os agents profissionais já suportam.',
  },
  {
    question:
      'Como medir se um agent está "dando certo" na sua organização?',
    options: [
      'Contando PRs abertos',
      'Métricas de outcome: taxa de PR aceito sem pedir mudança grande, bug em produção por PR de agent vs humano, lead time, custo por feature, satisfação do dev. Volume isolado não diz nada',
      'Pela velocidade do modelo',
      'Pelo orçamento gasto',
    ],
    correct: 1,
    explanation:
      'Bom agent fecha ticket sem retrabalho, com baixo bug em produção, dentro de custo. Mau agent produz PR enorme, mal revisado, quebra em produção. Medir taxa de aceite, incidentes pós-deploy e custo por feature é o único jeito de saber onde agent está ajudando vs onde está virando dívida.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="gerenciando-agents-ia"
      title="Gerenciando Agents: orquestração, contexto e custo"
      icon="🎛️"
      xp={80}
      readTime={17}
      trailName="Engenharia de Software Moderna"
      trailColor={ACCENT}
      nextSlug="criando-agents-customizados"
      nextTitle="Criando Agents Customizados: do subagent ao MCP"
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
        Agent não é botão mágico. É <strong>processo</strong> com <em>contexto, memória, ferramentas, orçamento e política</em>.
        Gerenciar agents em organização séria é mais parecido com orquestrar serviços distribuídos do que com pedir ajuda num
        chat: você define limites, observa comportamento, mede outcome, corta custo, auditoria em cima. Quem trata agent como
        chatbot paga em bug de produção.
      </p>

      <Section title="As 5 dimensões de gestão de agent" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: '1. Contexto', v: 'O que entra na janela. Quanto mais denso e relevante, melhor o output. RAG, sumarização, subagents e CLAUDE.md são ferramentas pra curar contexto.' },
            { k: '2. Memória', v: 'O que persiste entre sessões. Memória de projeto (CLAUDE.md), memória de usuário (prefs), memória global (docs). Muita memória vira ruído.' },
            { k: '3. Tools', v: 'O que o agent pode fazer: ler, escrever, executar comando, chamar API, MCP server. Menor privilégio por padrão.' },
            { k: '4. Orçamento', v: 'Tokens por run, custo por tarefa, timeout. Sem orçamento, um loop de agent pode custar $100 num loop acidental.' },
            { k: '5. Política', v: 'Regras: "nunca faça X", "sempre peça confirmação pra Y", "em caso de Z, pare". Vive em CLAUDE.md, policy files, ou hooks.' },
          ]}
        />
      </Section>

      <Section title="Orquestração: quando usar múltiplos agents" accent={ACCENT}>
        <SplitFlow
          accent={ACCENT}
          title="Padrão Orchestrator + Subagents"
          left={{
            label: 'Orchestrator',
            items: [
              { icon: '🧠', label: 'Decide tarefas', sub: 'plano' },
              { icon: '📋', label: 'Delega a subs', sub: 'prompt + tools' },
              { icon: '📊', label: 'Revisa resultado', sub: 'sumário' },
              { icon: '✅', label: 'Entrega ao humano', sub: 'PR final' },
            ],
          }}
          center={'spawn'}
          right={{
            label: 'Subagents',
            items: [
              { icon: '🔬', label: 'Research agent', sub: 'lê repo, gera sumário' },
              { icon: '🧪', label: 'Testing agent', sub: 'escreve e roda testes' },
              { icon: '🛡️', label: 'Security agent', sub: 'revisa vuln' },
              { icon: '🏗️', label: 'Architect agent', sub: 'planeja trade-off' },
            ],
          }}
        />
        <Callout tone="info">
          <strong>Por que subagents vencem &ldquo;um agent faz tudo&rdquo;.</strong> (1) Contexto isolado — research agent não
          polui janela do orquestrador com 20 arquivos lidos; só retorna o sumário. (2) Paralelização — rodar research+security
          ao mesmo tempo acelera lead time. (3) Especialização — subagent com system prompt específico performa melhor. (4)
          Custo — cada subagent paga só pelo próprio contexto.
        </Callout>
      </Section>

      <Section title="Contexto: o recurso mais escasso" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '📥', label: 'Entrada bruta', sub: 'repo + web + docs', detail: 'Tudo que poderia ser relevante. Mas não cabe na janela e confunde o modelo.', connector: 'filtra' },
            { icon: '🧠', label: 'RAG / search', sub: 'recall', detail: 'Busca semântica por chunks relevantes. BM25 + embeddings + reranker.', connector: 'sumariza' },
            { icon: '📝', label: 'Sumarização por subagent', sub: 'compress', detail: 'Research agent lê 20 arquivos, retorna 500 tokens de essência.', connector: 'injeta' },
            { icon: '🎯', label: 'Prompt final enxuto', sub: 'focused', detail: 'Spec + contexto filtrado + regras. Modelo trabalha com clareza.' },
          ]}
        />
        <Callout tone="warn">
          <strong>Armadilha do &ldquo;coloca tudo na janela&rdquo;.</strong> Jogar o repo inteiro num modelo de 1M tokens não é
          estratégia — é preguiça. Qualidade cai. Latência sobe. Custo explode. Contexto é curado como query em banco de dados,
          não como despejo.
        </Callout>
      </Section>

      <Section title="Memória: o que persiste, o que expira" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Onde vive', 'Escopo', 'Exemplo']}
          rows={[
            ['Projeto', 'CLAUDE.md na raiz do repo', 'Um repositório', 'Stack, padrões, gotchas, comandos de build'],
            ['Usuário', 'Arquivo de memória do agent', 'Uma pessoa', 'Prefs de estilo, feedback recorrente ("não use emoji")'],
            ['Global', 'Docs externos citados em prompts', 'Toda org', 'Guias de segurança, políticas, SLAs'],
            ['Session', 'Contexto da conversa atual', 'Uma execução', 'Raciocínio intermediário, desaparece ao terminar'],
          ]}
        />
        <Callout tone="info">
          <strong>CLAUDE.md é o gerente de memória.</strong> É o arquivo que o agent lê sempre ao abrir o projeto. Boa regra: 200
          linhas max, seções claras (Stack, Comandos, Gotchas, Padrões). Mais que isso vira ruído e o agent começa a ignorar.
        </Callout>
      </Section>

      <Section title="Controle de custo (token budget)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Custo de agent é linear com tokens. Uma tarefa &ldquo;pequena&rdquo; pode virar $5 em um loop de ferramenta. Gerenciar
          custo é operacional:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Token budget por run', v: 'Ex.: 100k tokens por tarefa. Agent para antes de estourar e pede decisão ao humano.' },
            { k: 'Modelo certo pra tarefa', v: 'Haiku pra task trivial (sumário, lint), Sonnet pra maioria, Opus só quando precisa raciocínio pesado (trade-off, código crítico).' },
            { k: 'Cache prompt', v: 'Usa prompt caching do provider. Prefixo estável (system + CLAUDE.md) vira ~90% mais barato.' },
            { k: 'Evite loops', v: 'Tool call que loopa é custo exponencial. Ponha timeout e max_iterations.' },
            { k: 'Observe uso real', v: 'Dashboard com tokens por dev, por projeto, por tipo de tarefa. Conversa com time quando sobe injustificado.' },
          ]}
        />
        <CodeBlock lang="bash">{`# Exemplo: política de custo por agent em .agent/policy.yaml
models:
  default: claude-sonnet-4-6
  heavy: claude-opus-4-6
  light: claude-haiku-4-5

budget:
  per_task_max_tokens: 100000
  per_day_max_usd: 50
  alert_threshold_usd: 40

policy:
  require_approval_above_usd: 5
  kill_switch_above_usd: 20`}</CodeBlock>
      </Section>

      <Section title="Segurança: menor privilégio" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '👁️', label: 'Read-only default', sub: 'sempre', detail: 'Agent começa podendo ler. Qualquer write requer permissão explícita.', connector: 'autoriza' },
            { icon: '📝', label: 'Write em sandbox', sub: 'área isolada', detail: 'Worktree, container, VM. Agent nunca toca em main branch direto.', connector: 'revisa' },
            { icon: '✅', label: 'Humano aprova', sub: 'PR ou prompt', detail: 'Merge, deploy, chamada paga, drop de tabela: humano confirma.', connector: 'audita' },
            { icon: '📋', label: 'Audit log', sub: 'tudo', detail: 'Cada comando executado vira log imutável. SIEM consome.' },
          ]}
        />
        <Callout tone="danger">
          <strong>Nunca.</strong> (1) Dar credencial de produção pra agent sem HSM/vault intermediando. (2) Rodar{' '}
          <InlineCode>rm -rf</InlineCode>, <InlineCode>DROP TABLE</InlineCode>, <InlineCode>git push --force</InlineCode> sem
          confirmação humana. (3) Permitir chamada a endpoint caro (OpenAI, SMS, Twilio) sem budget cap. (4) Deixar agent com
          acesso a webhook público executar código arbitrário.
        </Callout>
      </Section>

      <Section title="Política escrita (prompt engineering operacional)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Boa política mora em CLAUDE.md e é clara, curta, com exemplo:
        </p>
        <CodeBlock lang="markdown">{`# Policies (em CLAUDE.md)

## O que agent NUNCA faz sem confirmação humana
- git push --force, git reset --hard
- DROP TABLE / ALTER TABLE destrutivo
- Apagar arquivo fora de /tmp ou worktree
- Chamar API externa paga (LLM, SMS, pagamento)
- Alterar .env, credentials.json, secrets

## Estilo de código
- TypeScript strict. Nunca "any".
- Componentes React: named export, function component.
- Testes: vitest + msw; não mockar banco.

## Fluxo de PR
- Sempre abrir PR, nunca commit direto em main.
- PR deve linkar a spec (docs/specs/<slug>.md).
- Descrição: 1 parágrafo do "o que e por quê".

## Onde achar contexto
- Ticket em Linear/INGEST = bugs de pipeline.
- SLOs em grafana.internal/d/api-latency.
- Runbook em ops/RUNBOOK.md.`}</CodeBlock>
      </Section>

      <Section title="Observabilidade do agent" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Taxa de sucesso', v: '% de tarefas em que agent entregou PR aceito sem pedir mudança grande.' },
            { k: 'Lead time', v: 'Do início da tarefa até merge. Agent deve reduzir vs baseline humano.' },
            { k: 'Custo por feature', v: 'Soma de tokens * preço modelo. Compare com horas-humano equivalentes.' },
            { k: 'Bug escape rate', v: '% de PRs de agent que geraram incidente em <30 dias pós-deploy. Baseline humano é ~5-10%.' },
            { k: 'Cobertura de teste', v: 'Agent tende a escrever mais testes; verifique se são úteis (mutation score, não só cobertura).' },
            { k: 'Tempo de review humano', v: 'Se reviewer gasta mais tempo lendo PR de agent do que escreveria sozinho, algo está errado.' },
          ]}
        />
      </Section>

      <Section title="Cenários reais de decisão" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Migrar 200 endpoints de Express pra Fastify num monorepo"
          winner="Orchestrator + subagents paralelos"
          why="Orchestrator quebra em batches de 20 endpoints por subagent; cada sub carrega contexto mínimo (seu batch + utils compartilhados), retorna PR. Humano revisa cada PR com checklist — agent faz o que agent faz bem."
          alternatives={[{ name: 'Um agent pra tudo', note: 'contexto estoura, qualidade cai do endpoint 50 em diante.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Debug de latência P99 intermitente em API crítica"
          winner="Humano lidera, agent assistente"
          why="Exige intuição operacional, traces, correlação com deploys. Agent lê flamegraph, sugere hipótese, escreve benchmark. Decisão é humana — você responde pelo incidente."
          alternatives={[{ name: 'Agent sozinho', note: 'sem acesso a traces reais e SRE judgment, chuta.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Feature nova com impacto em 30 arquivos e integração com stripe"
          winner="SDD + subagent de security obrigatório"
          why="Spec na mão. Security subagent roda antes do merge (scan de vulns, review de chamadas ao stripe, verificação de idempotência). Sem esse gate, dívida cresce em silêncio."
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Meu time tem 10 devs. Posso usar o mesmo CLAUDE.md pra todos?"
          a={
            <>
              Sim. CLAUDE.md é do projeto. Prefs individuais vão em arquivo de memória do usuário (por exemplo{' '}
              <InlineCode>~/.claude/memory/</InlineCode>). Regra do time vai no CLAUDE.md do repo.
            </>
          }
        />
        <QAItem
          q="Como evito que agent mexa em arquivo que não é da tarefa?"
          a="Especifique arquivos-alvo no prompt + policy no CLAUDE.md + review crítico. Se agent mexe em 20 arquivos quando a tarefa era 2, rejeita o PR e ajusta o prompt/policy."
        />
        <QAItem
          q="Agent é confiável pra merge automático?"
          a="Não em produção ainda. Em 2026 o padrão é: agent abre PR, humano (ou LGTM automático com CI verde + score de review assistido por IA) merge."
        />
        <QAItem
          q="Quando não usar agent?"
          a="Quando você não entende o problema (vai só mascarar sua confusão); quando a stack é desconhecida do modelo (contexto ruim); quando o risco é alto e custo de erro é grande (migrations críticas, produção sem canary)."
        />
        <QAItem
          q="Como prevenir um agent quebrar um agent (loop)?"
          a="Timeouts por tool call, limite de iterações, circuit breaker no orchestrator, e validação do output de cada subagent antes de continuar. Sem isso, um bug trivial vira bill de $500."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) Agent é processo: contexto + memória + tools + orçamento + política. (2) Orchestrator +
        subagents ganham de &ldquo;um agent pra tudo&rdquo;. (3) Contexto é curado, não despejado. (4) Menor privilégio é
        inegociável. (5) Mede outcome (lead time, bug escape, custo), não volume. (6) Próximo: você vai <em>criar</em> um agent
        customizado.
      </Callout>
    </div>
  );
}
