import type { Metadata } from 'next';
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
  ArchDiagram,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Context Engineering: prompt caching, subagents e skills — FFV Academy',
  description:
    'Context engineering em 2026: prompt caching (Anthropic/OpenAI), compaction, subagent delegation, Agent Skills, CLAUDE.md/AGENTS.md, context window budget e lost-in-the-middle.',
};

const ACCENT = '#ff7eb6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que "context engineering" virou disciplina própria, separada de "prompt engineering"?',
    options: [
      'São sinônimos',
      'Porque aplicações reais lidam com contextos de 50k-1M tokens (docs + tools + trace + memória), não prompts curtos. Gerenciar o que entra, em que ordem, o que cachear, o que truncar e o que resumir vira um problema de arquitetura — não mais de redação de prompt',
      'Por marketing',
      'Por exigência de compliance',
    ],
    correct: 1,
    explanation:
      'Prompt engineering era sobre "como escrever a instrução". Context engineering é sobre "como gerenciar a janela inteira" — system prompt, tools, RAG results, histórico, memória persistente, trace, skills. Janelas grandes não eliminam o problema; multiplicam. Saber o que manter, o que resumir e o que cachear é onde o custo e a qualidade se decidem.',
  },
  {
    question: 'O que prompt caching (Anthropic) otimiza exatamente?',
    options: [
      'Latência somente',
      'Custo e latência quando você repete prefixos grandes (system + tools + docs fixos) entre chamadas. O provider armazena internamente o KV cache daquele prefixo por ~5 min; próximas chamadas pagam 10% (write) ou usam cache por ~10% do preço de input. Economia típica: 50-90% em agents com system prompt pesado',
      'Só o retorno do modelo',
      'Só em treino',
    ],
    correct: 1,
    explanation:
      'Prompt caching reutiliza o KV cache do prefixo entre chamadas. Para agents que repetem sistema + tools + exemplos, isso corta drasticamente o custo de input (que costuma ser 80%+ do custo total). TTL curto (~5 min) força chamadas repetidas em janela curta. OpenAI tem equivalente automático para prefixos repetidos. Estrutura seus prompts do estável (cacheável) para o volátil (não cacheável).',
  },
  {
    question: 'Qual o risco do "lost in the middle" em contextos grandes?',
    options: [
      'Não existe',
      'LLMs tendem a usar melhor conteúdo posicionado no início ou no fim do contexto; informação no meio de janelas grandes é sub-utilizada. Resultado: RAG com 50 chunks pode ignorar justo o chunk certo. Mitigação: ranking do reranker no topo, limite de K recolocado no fim, evaluation explícita por posição',
      'Só modelos pequenos sofrem',
      'Resolvido por completo',
    ],
    correct: 1,
    explanation:
      'Liu et al. 2023 mostraram queda em "needle-in-haystack" no meio de contextos longos. Modelos mais novos (Claude 3.5+, GPT-4.1, Gemini 1.5 Pro) mitigaram bastante, mas o efeito ainda aparece em janelas muito grandes. Best practice: colocar trechos críticos no início ou fim do contexto, e medir recall por posição no seu eval harness.',
  },
  {
    question: 'Quando delegar para subagent em vez de incluir tudo no contexto principal?',
    options: [
      'Sempre',
      'Quando (a) a sub-tarefa exige muito contexto próprio que poluiria o principal, (b) você quer isolamento de tools/permissions, (c) a resposta desejada é um resumo estruturado, não o trace. Subagent roda em janela própria, retorna só o output — o principal fica limpo',
      'Só quando tem budget',
      'Nunca, custa caro',
    ],
    correct: 1,
    explanation:
      'Subagents (Task tool no Claude Code, sub-agents em Agents SDK) são a primitiva para manter o contexto principal enxuto. Research task que exigiria ler 20 arquivos? Delega para subagent e recebe só o resumo. Principal não paga o custo de contexto, e o trace fica limpo. Regra: se você puder resumir o resultado em ≤200 palavras, delegue.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="context-engineering"
      title="Context Engineering: prompt caching, subagents e skills"
      icon="🧠"
      xp={80}
      readTime={16}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="mcp-servers"
      nextTitle="MCP Deep Dive: construindo um servidor profissional"
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
        Em 2026, janelas de 1M tokens são commodity — mas "enfiar tudo" continua sendo a forma mais cara e lenta de
        usar um LLM. Context engineering é a disciplina de <strong>gerenciar o que entra na janela</strong>: o que
        cachear, o que resumir, o que delegar, em que ordem posicionar, quando truncar. É onde um agent de US$5/query
        vira US$0.30/query sem perder qualidade.
      </p>

      <Section title="A janela não é grátis" accent={ACCENT}>
        <Callout tone="info">
          Preço típico (abril 2026): input em torno de US$3/1M tokens (Sonnet), US$0.25/1M (Haiku). Contextos de 100k
          tokens a cada chamada, em agent com loop de 10 passos, custam <strong>US$3 por execução</strong>. Em
          produto com 10k usuários/mês → US$30k/mês só de input. Cortar 50% do contexto = US$15k economizados.
          Context engineering paga salário.
        </Callout>
        <ArchDiagram title="Anatomia de uma chamada LLM em agent" accent={ACCENT}>{`
 ┌──────────────────────────────────────────────────────────┐
 │ INPUT (janela)                                           │
 │ ┌────────────────────┐                                   │
 │ │ System prompt      │   ← estável, CACHEÁVEL            │
 │ │ Tool definitions   │   ← estável, CACHEÁVEL            │
 │ │ Few-shot examples  │   ← estável, CACHEÁVEL            │
 │ ├────────────────────┤                                   │
 │ │ RAG context        │   ← volátil por query             │
 │ │ Conversation hist. │   ← volátil, cresce               │
 │ │ Tool results       │   ← volátil, podem ser grandes    │
 │ └────────────────────┘                                   │
 └──────────────────────────────────────────────────────────┘
                           │
                           ▼
 ┌──────────────────────────────────────────────────────────┐
 │ OUTPUT (tokens gerados)                                  │
 │ + thought / tool_use / final answer                      │
 └──────────────────────────────────────────────────────────┘
`}</ArchDiagram>
        <Callout tone="success">
          Ordem importa: coloque o <strong>estável primeiro</strong>. Prompt caching só funciona em prefixos
          idênticos — qualquer mudança invalida o cache dali pra frente.
        </Callout>
      </Section>

      <Section title="Prompt caching: o ganho de 90% que poucos usam" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Anthropic, OpenAI e Google oferecem caching de prefixo. A mecânica: você marca blocos "cacheáveis" no
          início; o provider armazena o KV cache por ~5 min; chamadas dentro dessa janela pagam muito menos pelo
          prefixo.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Provider', 'Como ativar', 'Preço cacheado vs normal']}
          rows={[
            ['Anthropic', 'cache_control: { type: "ephemeral" } nos blocos', 'Write 125% / read 10%'],
            ['OpenAI', 'Automático para prefixos repetidos (>1024 tok)', 'Read ~50% do preço normal'],
            ['Google Gemini', 'cachedContent API — criar cache explícito', 'Read ~25% do preço + taxa de storage'],
          ]}
        />
        <CodeBlock lang="python">{`# Anthropic: marcar blocos cacheáveis
from anthropic import Anthropic
client = Anthropic()

r = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": LONG_SYSTEM_PROMPT,      # 5k tokens
            "cache_control": {"type": "ephemeral"},
        },
    ],
    tools=[
        # tools também podem entrar no cache
        *TOOL_DEFS,
    ],
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": LARGE_DOC,       # 50k tokens, revisitado em várias queries
                    "cache_control": {"type": "ephemeral"},
                },
                {
                    "type": "text",
                    "text": user_query,      # volátil, NÃO cacheado
                },
            ],
        },
    ],
)
# r.usage.cache_creation_input_tokens: primeira chamada, escreve o cache
# r.usage.cache_read_input_tokens:     chamadas seguintes, leem o cache`}</CodeBlock>
        <DecisionBox
          scenario="Agent que faz 20 chamadas por sessão repetindo system prompt de 8k tokens"
          winner="Ativar prompt caching em system + tools"
          winnerColor={ACCENT}
          why="Sem cache: 20 × 8k = 160k tokens de input repetido. Com cache: 1 write + 19 reads ≈ 10% do custo. Economia ~90% em um item só."
          alternatives={[
            { name: 'Reduzir system prompt', note: 'útil, mas tem limite de quanto dá pra cortar' },
            { name: 'Mudar para Haiku', note: 'ganha preço mas perde qualidade em tarefas complexas' },
          ]}
        />
      </Section>

      <Section title="Compaction: resumo de conversa para janela cresce sem estourar" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Conversas longas estouram janela rapidamente. A estratégia padrão é <strong>compaction</strong>: quando a
          janela atinge X% do limite, um LLM barato resume a conversa mais antiga em uma mensagem "system summary",
          e apaga as originais. O agent continua como se nada tivesse acontecido.
        </p>
        <CodeBlock lang="python">{`# Compaction simples — mantém últimas N mensagens + summary do resto
def compact_if_needed(messages: list[dict], max_tokens: int = 100_000) -> list[dict]:
    total = sum(estimate_tokens(m) for m in messages)
    if total < max_tokens * 0.7:
        return messages                # ainda cabe folgado

    keep_tail = 8                       # mantém últimas 8 em original
    to_summarize = messages[:-keep_tail]
    tail = messages[-keep_tail:]

    summary_text = llm_call(
        model="claude-haiku-4-5-20251001",
        system="Resuma a conversa em 300 palavras, mantendo fatos, decisões e tool results relevantes para continuar.",
        messages=to_summarize,
    )
    summary_msg = {
        "role": "user",
        "content": f"<conversation_summary>\\n{summary_text}\\n</conversation_summary>",
    }
    return [summary_msg] + tail`}</CodeBlock>
        <Callout tone="warn">
          Compaction é lossy. Tudo que foi resumido perde fidelidade. Para ações críticas (auditoria, decisão
          financeira), persista o trace original fora da janela e use summary apenas como contexto de continuação,
          não como verdade.
        </Callout>
      </Section>

      <Section title="Subagent delegation: manter o principal limpo" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Subagents rodam em janela isolada. O principal os invoca via Task tool (Claude Code) ou sub-agent (OpenAI
          Agents SDK), recebe apenas o <em>output estruturado</em> e continua. Isso mantém a janela principal enxuta
          e permite paralelismo.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Incluir no contexto principal', 'Delegar a subagent']}
          rows={[
            ['Fato curto e relevante sempre', 'Pesquisa que exige ler 10+ arquivos'],
            ['Instrução global do sistema', 'Geração de sub-relatório com contexto próprio'],
            ['Resultado já sintetizado', 'Exploração cujo output é um resumo'],
            ['Tool pequena e frequente', 'Tool que gera outputs grandes (grep em monorepo)'],
          ]}
        />
        <Callout tone="info">
          Padrão Anthropic: dar ao subagent uma task clara, contexto necessário (não o histórico), e o formato
          esperado de retorno. O principal deve conseguir "entender o output sem ler como o subagent chegou lá".
        </Callout>
      </Section>

      <Section title="Agent Skills: instruções carregadas sob demanda" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Skills (Anthropic, 2024+) são módulos de instruções + scripts que o agent carrega quando a situação o
          exige. Cada skill tem uma <InlineCode>description</InlineCode> curta no índice; o agent decide invocar a
          skill completa apenas quando a task corresponder. Alternativa a enfiar todas as políticas no system prompt.
        </p>
        <CodeBlock lang="markdown">{`---
name: pdf-extraction
description: Extrai texto e tabelas de PDFs complexos usando pdfplumber + VLM para imagens.
allowed-tools: Read, Bash, Write
---

# PDF Extraction

Quando o usuário pedir para extrair dados de PDF:

1. Use \`pdfplumber\` para texto e tabelas limpas.
2. Para PDFs escaneados, rode OCR (\`tesseract\`) ou envie a página como imagem para Claude Vision.
3. Sempre valide que a extração preservou estrutura (tabelas não podem virar texto corrido).
4. Salve output em \`extracted/\` com mesmo nome do PDF + \`.md\`.

Exemplo de script:

\`\`\`bash
pdfplumber dump tables input.pdf > tables.json
\`\`\`
`}</CodeBlock>
        <Callout tone="success">
          Skills viram o anti-padrão "system prompt gigante". Em vez de 20 políticas para 20 tipos de task, você tem
          20 skills curtas com descriptions, carregadas on-demand. Contexto médio cai drasticamente.
        </Callout>
      </Section>

      <Section title="CLAUDE.md / AGENTS.md: instruções do projeto" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Instruções persistentes por repo/projeto vivem em arquivos-guia: <InlineCode>CLAUDE.md</InlineCode>{' '}
          (Claude Code), <InlineCode>AGENTS.md</InlineCode> (Codex/OpenAI), <InlineCode>.cursor/rules/</InlineCode>{' '}
          (Cursor). Esses arquivos entram automaticamente no contexto quando o agent abre o projeto.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Deve entrar', 'Não deve entrar']}
          rows={[
            ['Comandos de build/test/lint específicos', 'Documentação que o agent consegue derivar lendo código'],
            ['Padrões de commit/PR', 'Histórico de decisões (vai pra ADR, não aqui)'],
            ['Gotchas conhecidos (bugs, conflitos)', 'Todo o manual do projeto'],
            ['Estrutura de pastas não-óbvia', 'README completo duplicado'],
            ['Scripts de deploy, env vars importantes', 'Segredos, tokens'],
          ]}
        />
        <Callout tone="warn">
          CLAUDE.md "gigante" (&gt;300 linhas) começa a competir por atenção com o próprio código. Mantenha enxuto
          (≤ 200 linhas em 90% dos casos). Se não couber, divida em skills carregadas sob demanda.
        </Callout>
      </Section>

      <Section title="Ordem, posição e formato" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Princípio', 'Por que', 'Consequência prática']}
          rows={[
            ['Estável antes do volátil', 'Prompt caching exige prefixo idêntico', 'System → tools → few-shots → dados fixos → query'],
            ['Crítico no início ou fim', 'Lost in the middle', 'Resposta direta no topo; confirmação no fim'],
            ['Tags estruturadas (XML)', 'Claude/GPT-4+ respeitam delimitadores', '<contexto>...</contexto>, <pergunta>...</pergunta>'],
            ['Evite repetição', 'Cada token pago, cada token atenção', 'Se já está em system, não repita em user'],
            ['Tool result compacto', 'Tool que retorna 50k tokens destrói contexto', 'Truncar, agregar ou delegar para subagent'],
          ]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Contexto de 1M tokens não elimina tudo isso?"
          a={<>Não. Custos sobem linearmente com input, latência cresce, e lost-in-the-middle continua existindo (menor que em 128k, mas existe). Janela grande é seguro-rede, não estratégia. Contexto bem curado de 30k costuma ganhar de 500k "enfiado" em qualidade e custo.</>}
        />
        <QAItem
          q="Prompt caching funciona entre usuários diferentes?"
          a={<>Depende do provider. Anthropic: cache é escopado por organização — chamadas com o mesmo prefixo de qualquer usuário da sua API key compartilham cache. OpenAI: cache automático, não precisa preocupar. Google Gemini: cache explícito por API. Em todos, o TTL curto (~5min) significa que baixo volume perde o benefício.</>}
        />
        <QAItem
          q="Como meço o impacto de context engineering?"
          a={<>Duas métricas principais: (1) cost per task (tokens × preço / query), (2) p95 latency. Instrumente ambos por versão do pipeline. Rode A/B test de 100 queries comparando versão antiga vs nova. Ganho abaixo de 10% não justifica refactor; acima de 30% é quase sempre vitória.</>}
        />
        <QAItem
          q="Skills vs tools — qual a diferença?"
          a={<>Tool é uma função executável (código). Skill é um conjunto de instruções + (opcional) scripts que guiam o agent em um tipo de tarefa. Tool responde "como chamar X"; skill responde "como lidar com situação Y". Em produção, você combina: skill "analisar PDF" usa tool "read_file" + tool "ocr". Skills mudam contexto, tools mudam estado.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Context engineering = gerenciar janela como recurso. Prompt caching corta 50-90%
        do custo em agents repetitivos — ordene estável antes do volátil. Compaction mantém conversas longas
        viáveis. Subagents isolam contexto pesado. Skills e CLAUDE.md/AGENTS.md carregam instruções sob demanda.
        Lost-in-the-middle ainda existe; posicione o crítico no início ou fim. Próximo: MCP deep dive — o protocolo
        que padronizou como agents acessam ferramentas e dados externos.
      </Callout>
    </div>
  );
}
