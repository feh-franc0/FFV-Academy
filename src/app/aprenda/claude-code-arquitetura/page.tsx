import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Claude Code: Arquitetura por Dentro — FFV Academy',
  description: 'QueryEngine, Session/Harness/Sandbox, auto-compact a 98%, Tier 1/2 de permissões, prompt caching — o que o código do Claude Code realmente faz e por que isso explica seu desempenho em benchmark.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O Claude Code tem cerca de quantas ferramentas disponíveis para o modelo e onde fica o núcleo da lógica?',
    options: [
      'Umas 5 ferramentas, toda a lógica no modelo',
      '~40 ferramentas (Read, Edit, Write, Bash, Glob, Grep, WebFetch, Task, MCP, etc.), com ~46k linhas no QueryEngine cuidando de loop, permissões e compactação',
      'Mais de 200 ferramentas — uma por linguagem',
      'Nenhuma — o modelo só responde texto',
    ],
    correct: 1,
    explanation: 'O núcleo é o QueryEngine (≈46k linhas no código vazado em 2026), orquestrando ~40 ferramentas agrupadas em File ops, Search, Execution, Web e Code intelligence. O modelo NÃO faz o loop — ele só propõe a próxima ação; a máquina que executa, valida permissões e recompacta contexto é código determinístico.',
  },
  {
    question: 'O que acontece quando o contexto do Claude Code chega a ~98% da janela?',
    options: [
      'Ele cai e pede pra você começar de novo',
      'Dispara auto-compact: reescreve o histórico em um resumo mais curto, preservando o que é relevante para a tarefa em andamento, e continua sem intervenção',
      'Ele trunca o histórico pelo meio',
      'Ele pede pra você pagar mais',
    ],
    correct: 1,
    explanation: 'Quando o contexto chega a ~98% da janela do modelo, o QueryEngine dispara auto-compact: produz um resumo fiel do histórico, mantém artefatos chave (arquivos editados, testes rodados, erros encontrados) e reinicia com contexto limpo. É o que permite sessões de horas em codebases grandes.',
  },
  {
    question: 'Qual é a diferença entre permissões Tier 1 e Tier 2 no Claude Code?',
    options: [
      'Tier 1 é gratuito, Tier 2 é pago',
      'Tier 1 são ações reversíveis (Read, Grep) que rodam sem confirmação; Tier 2 são ações com efeito persistente (Write, Edit, Bash destrutivo) que exigem confirmação no modo Default',
      'Tier 1 é para iniciantes, Tier 2 para experts',
      'Tier 1 local, Tier 2 remoto',
    ],
    correct: 1,
    explanation: 'O modelo de permissões separa operações por blast radius. Tier 1: ler arquivos, buscar, listar — pode rodar em loop sem pedir. Tier 2: escrever, editar, executar bash — pede confirmação no modo Default, autoriza tudo no modo Accept/Auto. Existe ainda o Plan Mode que desliga tudo de Tier 2 para exploração segura.',
  },
];

export default function ClaudeCodeArquiteturaPage() {
  return (
    <ModuleLayout
      slug="claude-code-arquitetura"
      title="Claude Code: Filosofia e Arquitetura"
      icon="🤖"
      xp={70}
      readTime={12}
      trailName="Ferramentas de IA para Código"
      trailColor="#ffa657"
      nextSlug="openai-codex-cloud"
      nextTitle="OpenAI Codex: o Agente na Nuvem"
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
        Em março-abril de 2026, partes significativas do código-fonte do Claude Code vazaram publicamente. Isso transformou o que era especulação em arquitetura documentada. Este módulo usa essas fontes (além da documentação oficial da Anthropic) para descrever o que está de fato por trás do CLI, sem marketing.
      </p>

      <Section title="Separação Session / Harness / Sandbox">
        <p>
          O código organiza a execução em três camadas distintas — essa separação é o que permite o mesmo binário funcionar em terminal local, IDE, CI/CD e como SDK:
        </p>
        <div className="flex flex-col gap-2">
          {[
            { layer: 'Session', desc: 'Mantém o estado da conversa, o histórico de mensagens e ferramentas chamadas, e o orçamento de tokens. É serializável — por isso você pode pausar e retomar uma sessão.', color: '#58a6ff' },
            { layer: 'Harness (QueryEngine)', desc: '~46.000 linhas. Decide a próxima ação, aplica políticas de permissão, dispara o modelo, interpreta a saída, chama ferramentas, compacta contexto. É aqui que o loop agêntico vive.', color: '#ffa657' },
            { layer: 'Sandbox', desc: 'A camada que faz contato com o mundo real: lê/escreve arquivos, roda bash, faz fetch HTTP. Respeita as restrições de permissão que o Harness valida antes.', color: '#3fb950' },
          ].map(item => (
            <div key={item.layer} className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${item.color}30` }}>
              <p className="font-mono font-semibold text-xs mb-1" style={{ color: item.color }}>{item.layer}</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <p>
          O modelo NÃO roda o loop. O modelo é <em>um dos atores</em> no loop. Quem decide "agora leio o arquivo X, agora compacto contexto, agora peço confirmação ao usuário" é código determinístico — não o LLM.
        </p>
      </Section>

      <Section title="O catálogo real de ferramentas">
        <p>
          A documentação oficial agrupa as ferramentas em cinco categorias. No código vazado os schemas completos ocupam cerca de 29.000 linhas:
        </p>
        <div className="flex flex-col gap-2">
          {[
            { cat: 'File operations', tools: 'Read, Write, Edit, NotebookEdit', note: 'Read exige leitura antes de escrever — prevenção de sobrescrita acidental.' },
            { cat: 'Search', tools: 'Glob, Grep (ripgrep-powered)', note: 'Grep é multiline-capable. Glob ordena por mtime.' },
            { cat: 'Execution', tools: 'Bash, BashOutput, KillShell', note: 'Suporta processos em background com monitoramento assíncrono.' },
            { cat: 'Web', tools: 'WebFetch, WebSearch', note: 'WebFetch aceita prompt de extração — resume HTML direto para Markdown focado.' },
            { cat: 'Code intelligence', tools: 'Task (subagents), SlashCommand, TodoWrite, MCP tools', note: 'MCP expõe ferramentas externas (Sentry, Linear, Drive) via protocolo padronizado.' },
          ].map(item => (
            <div key={item.cat} className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold text-xs mb-1" style={{ color: 'var(--ffv-orange)' }}>{item.cat}</p>
              <p className="text-xs mb-1" style={{ color: 'var(--ffv-green)', fontFamily: 'var(--font-roboto-mono)' }}>{item.tools}</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{item.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Auto-compact: por que sessões de horas não estouram contexto">
        <p>
          O detalhe técnico mais importante do Claude Code — e o que explica por que ele vence em tarefas longas — é o <strong>auto-compact</strong>. Quando a conversa chega a ≈98% da janela do modelo, o harness dispara:
        </p>
        <CodeBlock>{`// Pseudo-código do auto-compact
if (contextTokens >= windowSize * 0.98) {
  const summary = await model.summarize({
    history,
    preserve: [
      "objetivo original do usuário",
      "arquivos tocados e seus estados finais",
      "comandos executados com seus resultados",
      "decisões de design feitas até agora",
      "erros encontrados e como foram resolvidos",
    ],
    discard: [
      "tool calls exploratórias já resolvidas",
      "conteúdo de arquivos lidos mas não modificados",
      "tentativas falhadas depois corrigidas",
    ],
  });

  session.replaceHistory(summary);
  // continua a tarefa sem o usuário perceber
}`}</CodeBlock>
        <p>
          Isso é fundamentalmente diferente de "truncar as mensagens mais antigas" (o que perderia contexto crítico) ou "passar tudo toda vez" (que estoura a janela). É o que permite uma sessão de 6 horas em uma codebase com milhares de arquivos.
        </p>
      </Section>

      <Section title="Prompt caching: onde os 60-90% de latência somem">
        <p>
          O system prompt do Claude Code é pesado — dezenas de milhares de tokens entre instruções, definições de ferramentas e CLAUDE.md carregados. Mandar tudo de novo a cada turno seria insustentável.
        </p>
        <p>
          A Anthropic documentou publicamente que, com o <code className="px-1 rounded text-xs" style={{ background: 'var(--ffv-bg3)', color: 'var(--ffv-green)' }}>cache_control</code> aplicado corretamente, os times internos de managed-agents reduziram <strong>p50 de time-to-first-token em ~60%</strong> e <strong>p95 em mais de 90%</strong>. O Claude Code usa os mesmos breakpoints de cache:
        </p>
        <div className="flex flex-col gap-2 text-xs">
          {[
            { bp: 'Breakpoint 1', content: 'System prompt + definições de ferramentas (imutável na sessão)' },
            { bp: 'Breakpoint 2', content: 'CLAUDE.md + contexto do projeto (muda raramente)' },
            { bp: 'Breakpoint 3', content: 'Histórico estável da conversa (cresce em append-only)' },
            { bp: 'Sem cache', content: 'Última mensagem do usuário + tool calls novas' },
          ].map(item => (
            <div key={item.bp} className="flex gap-3 p-2 rounded" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <span className="font-mono font-semibold flex-shrink-0" style={{ color: 'var(--ffv-orange)', minWidth: 110 }}>{item.bp}</span>
              <span style={{ color: 'var(--ffv-muted)' }}>{item.content}</span>
            </div>
          ))}
        </div>
        <Callout>
          Cache hits custam ~10% do preço de tokens novos. Isso não é otimização cosmética — é a diferença entre o produto ser economicamente viável ou não em sessões longas.
        </Callout>
      </Section>

      <Section title="Tier 1 vs Tier 2: o modelo de permissões">
        <p>
          Cada ferramenta é classificada por blast radius. O harness valida a tier antes de executar — é o que permite você rodar Claude Code em CI sem se preocupar que ele vai dar <code className="px-1 rounded text-xs" style={{ background: 'var(--ffv-bg3)', color: 'var(--ffv-red)' }}>rm -rf</code> por acidente.
        </p>
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(63,185,80,0.3)' }}>
            <p className="font-semibold text-xs mb-1" style={{ color: 'var(--ffv-green)' }}>Tier 1 — Reversível (auto-execute)</p>
            <p className="text-xs mb-1" style={{ color: 'var(--ffv-muted)' }}>Read, Grep, Glob, WebFetch, WebSearch, Task (read-only)</p>
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>Rodam em loop sem confirmação. Não alteram estado do sistema.</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(247,129,102,0.3)' }}>
            <p className="font-semibold text-xs mb-1" style={{ color: 'var(--ffv-red)' }}>Tier 2 — Com efeito (confirmação no Default)</p>
            <p className="text-xs mb-1" style={{ color: 'var(--ffv-muted)' }}>Write, Edit, Bash (destrutivo), MCP que alteram estado externo</p>
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>No modo Default pede confirmação. No Accept Edits aceita writes mas confirma bash. No Auto libera tudo. No Plan Mode bloqueia tudo — só explora.</p>
          </div>
        </div>
        <CodeBlock>{`# Os 4 modos de permissão
Default         → Pergunta antes de qualquer Tier 2
Accept Edits    → Aceita Write/Edit, pergunta Bash
Plan Mode       → Só Tier 1. Produz plano sem executar
Auto (yolo)     → Autoriza tudo. Use em CI ou sandbox isolado`}</CodeBlock>
      </Section>

      <Section title="MCP: ferramentas sem recompilar o agente">
        <p>
          O Claude Code implementa o <strong>Model Context Protocol</strong>, padrão aberto da Anthropic para expor ferramentas externas ao agente sem precisar alterar o binário. Você configura um servidor MCP em <code className="px-1 rounded text-xs" style={{ background: 'var(--ffv-bg3)', color: 'var(--ffv-green)' }}>~/.claude/mcp.json</code> e as ferramentas aparecem no próximo turno.
        </p>
        <p>
          Limite técnico interessante: o harness expõe <strong>25.000 tokens</strong> de saída MCP direto para o modelo. Acima disso, grava em disco (até <strong>500.000 tokens</strong>) e passa só um ponteiro — o modelo pode usar Read para puxar o que precisar. Isso evita que um servidor MCP mal-comportado entupa o contexto.
        </p>
      </Section>

      <Section title="Fluxo completo de um turno">
        <p>
          Quando você escreve <code className="px-1 rounded text-xs" style={{ background: 'var(--ffv-bg3)', color: 'var(--ffv-green)' }}>claude "adiciona validação de email no formulário"</code>, o QueryEngine faz:
        </p>
        <CodeBlock>{`1. SESSION: carrega sessão (ou cria nova)
   - Lê CLAUDE.md hierárquico (repo → subpasta → cwd)
   - Monta system prompt com cache breakpoints

2. HARNESS: entra no loop
   a. Envia request ao modelo (com prompt caching)
   b. Modelo responde com text + tool_use blocks
   c. Para cada tool_use:
      - Valida tier (Tier 1 auto, Tier 2 respeita modo)
      - Confirma com usuário se necessário
   d. SANDBOX executa: lê arquivo, roda bash, faz grep
   e. Resultado volta como tool_result
   f. Se tokens > 98% janela → auto-compact
   g. Volta ao passo (a) até o modelo emitir stop_reason

3. SESSION: persiste histórico serializado em ~/.claude/`}</CodeBlock>
      </Section>

      <Section title="CLAUDE.md hierárquico: o canal pra mudar comportamento">
        <p>
          O CLAUDE.md não é um arquivo só — o harness busca e empilha do repo até o cwd. Isso permite convenções por subprojeto:
        </p>
        <CodeBlock>{`~/projetos/empresa/
├── CLAUDE.md                # convenções gerais da empresa
├── backend/
│   └── CLAUDE.md            # Go, testes em table-driven
└── frontend/
    └── CLAUDE.md            # TS strict, Tailwind, nunca usar any
        └── CLAUDE.md        # (cwd) regras do sub-app específico

// Ao rodar em frontend/app-x/, o harness injeta os 3 CLAUDE.md
// no system prompt, mais específico tem precedência.`}</CodeBlock>
        <Callout>
          O CLAUDE.md é um canal de <em>override comportamental</em>. Regras nele têm peso alto no prompt — "NUNCA use fallbacks silenciosos" realmente muda o comportamento nas próximas sessões.
        </Callout>
      </Section>

      <Section title="Modelos disponíveis e economia de roteamento">
        <p>
          O Claude Code é desacoplado do modelo. O usuário pode escolher:
        </p>
        <div className="flex flex-col gap-2 text-xs">
          {[
            { m: 'claude-haiku-4-5', use: 'Mais barato e rápido. Bom para tarefas simples em grande volume (rotulação, grep semântico, pequenas edições).' },
            { m: 'claude-sonnet-4-6', use: 'Default. Equilíbrio de custo vs qualidade. Resolve a grande maioria das tarefas de engenharia de software.' },
            { m: 'claude-opus-4-6', use: 'Maior capacidade. ~5x o preço, ~2x o tempo. Reservar para problemas de raciocínio duro, debug obscuro, refatorações arquiteturais.' },
          ].map(item => (
            <div key={item.m} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <span className="font-mono font-bold flex-shrink-0" style={{ color: 'var(--ffv-orange)', minWidth: 160 }}>{item.m}</span>
              <span style={{ color: 'var(--ffv-muted)' }}>{item.use}</span>
            </div>
          ))}
        </div>
        <p>
          Flag <code className="px-1 rounded text-xs" style={{ background: 'var(--ffv-bg3)', color: 'var(--ffv-green)' }}>--model</code> ou <code className="px-1 rounded text-xs" style={{ background: 'var(--ffv-bg3)', color: 'var(--ffv-green)' }}>/model</code> dentro da sessão. O dispatch de subagents (Task) pode usar modelo diferente do principal — um padrão comum é main=Sonnet, subagents=Haiku para grunt work paralelo.
        </p>
      </Section>

      <Callout>
        No próximo módulo: <strong>OpenAI Codex</strong> — por que um produto com praticamente a mesma arquitetura conceitual (loop + tools + sandbox) produz resultados tão diferentes, e a resposta honesta à pergunta "o harness parsing derruba performance?".
      </Callout>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full inline-block" style={{ background: '#ffa657' }} />
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-green)', fontFamily: 'var(--font-roboto-mono)' }}>
      {children}
    </pre>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl flex gap-3" style={{ background: 'rgba(255,166,87,0.08)', border: '1px solid rgba(255,166,87,0.2)' }}>
      <span className="text-xl flex-shrink-0">💡</span>
      <p className="text-sm">{children}</p>
    </div>
  );
}
