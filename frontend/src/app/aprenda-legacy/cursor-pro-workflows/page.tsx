import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, StackFlow, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cursor-pro-workflows');

const accent = '#7C3AED';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o sistema de rules no Cursor 2026 e por que ele substituiu o .cursorrules de arquivo único?',
    options: [
      '.cursorrules continua sendo o único formato — não houve mudança',
      'Cursor agora usa Project Rules em .cursor/rules/*.mdc — cada arquivo MDC tem frontmatter com globs (where it applies) e tipo (Always, Auto, Manual, Agent-requested); permite organizar regras por contexto (frontend rules para src/app/**, backend rules para api/**), versionar granularmente, e o AI só carrega rules relevantes ao contexto atual em vez de injetar tudo sempre',
      'Rules foram descontinuadas — Cursor decide tudo via vector search',
      'Rules são apenas comentários no código que o Cursor ignora',
    ],
    correct: 1,
    explanation: 'Project Rules em .cursor/rules/*.mdc (Markdown Components) é o formato canônico em 2026. Cada arquivo tem frontmatter YAML com: description (resumo), globs (quais paths ativam — ex "src/components/**/*.tsx"), e alwaysApply (boolean) ou tipo (Always sempre, Auto baseado em globs, Manual via @rule-name, Agent-requested quando o agent decide). Isso resolve o problema do .cursorrules monolítico que crescia indefinidamente, era difícil de manter, e injetava regras irrelevantes em cada prompt. User Rules globais ficam em settings; .cursorignore controla exclusão de arquivos.',
  },
  {
    question: 'O Composer multi-file do Cursor 2026 evoluiu para o Agent. Qual a diferença essencial entre Chat, Inline Edit (Cmd+K) e Agent?',
    options: [
      'São nomes diferentes pra mesma feature',
      'Chat é Q&A read-only sobre código (Cmd+L); Inline Edit (Cmd+K) faz uma edição focada num arquivo aberto com diff inline; Agent (Cmd+I no Composer panel) é multi-file autônomo — itera tool calls (read, edit, run terminal, search web) até completar tarefa complexa, pode editar dezenas de arquivos numa rodada, com checkpoint para reverter',
      'Apenas Agent faz edits — Chat e Inline são read-only',
      'Inline e Composer são pagos enterprise; Chat é grátis',
    ],
    correct: 1,
    explanation: 'Três superfícies distintas em 2026: (1) Chat (Cmd+L) — ask mode, conversa lateral com contexto do file/codebase atual, ótimo pra entender código; (2) Inline Edit (Cmd+K) — pede edição focada no arquivo aberto/seleção, diff inline pra aceitar/rejeitar; (3) Agent (Cmd+I no Composer) — loop autônomo de tool calls: lê arquivos, busca codebase, edita multiplos files, roda terminal, opcional web search; tem checkpoint pra reverter mudanças se algo der errado. Modes do Agent: Ask (read-only), Manual (você aprova cada tool), Auto (executa sem interrupção). Decisão de uso: quanto mais escopo, mais Agent; uma linha, Inline; pergunta, Chat.',
  },
  {
    question: 'Agent Mode background do Cursor permite executar tarefas longas. Como funciona em 2026?',
    options: [
      'Não existe — Cursor só roda foreground',
      'Background Agents rodam em ambientes remotos (Cursor cloud) com seu repositório clonado, executam tarefas longas (refactor, migração, adicionar testes) por minutos/horas, e abrem pull request automático quando terminam; você acompanha pelo dashboard ou recebe notificação; útil para tarefas paralelas que não bloqueiem seu fluxo principal',
      'Background Agent é só uma fila de prompts locais em sequência',
      'Roda apenas localmente em background processes do seu Mac',
    ],
    correct: 1,
    explanation: 'Background Agents (cursor.com/docs/background-agents) executam em sandboxes remotos da Cursor (geralmente Linux containers), com clone do seu repo, credenciais delegadas, e ambiente reproduzível. Você dispara: "adicione testes para todos os módulos em src/utils/" e o agent trabalha por 30min sem você precisar manter o Cursor aberto. Ao terminar, abre PR no GitHub. Bom pra: migrar dependência major, adicionar coverage, refactor mecânico em larga escala. Não substitui agent local (que tem latência menor e mais contexto), complementa. Cost: usage based, conta como tokens da assinatura.',
  },
  {
    question: 'Cursor agora suporta MCP. Como isso integra ao agent?',
    options: [
      'MCP no Cursor é só configurar URL e pronto, sem implicação prática',
      'Cursor lê .cursor/mcp.json (project) e ~/.cursor/mcp.json (global) com config de MCP servers — stdio ou SSE; ao iniciar o Agent, Cursor inicializa esses servers e suas tools/resources/prompts ficam disponíveis ao modelo (ex: GitHub MCP server expõe tools de criar PR, ler issues; Postgres MCP server expõe tool de query); compatível com a spec da Anthropic, então mesmos servers funcionam em Claude Desktop, Zed, Cursor',
      'Cursor tem MCP proprietário incompatível com Claude Desktop',
      'MCP no Cursor só funciona em modo enterprise pago',
    ],
    correct: 1,
    explanation: 'Cursor adotou Model Context Protocol (spec aberta da Anthropic) em 2024/2025. Config em .cursor/mcp.json no projeto (commitable) ou ~/.cursor/mcp.json global. Cada server expõe tools (ações), resources (dados read-only) e prompts (templates). Cursor inicia os servers no startup do agent, registra as tools, e o LLM pode invocá-las. Exemplos comuns: @modelcontextprotocol/server-github (criar PR, comentar issue), server-postgres (query banco), server-filesystem (acesso controlado a paths), server-puppeteer (web automation). Mesmos servers que rodam no Claude Desktop. Permite extender o agent com domain-specific tools sem precisar criar extension Cursor.',
  },
  {
    question: 'Cursor vs Claude Code: quando usar cada um em 2026?',
    options: [
      'Cursor é sempre melhor — não há motivo pra Claude Code',
      'Cursor é editor com agent embutido (IDE-first): você edita arquivos manualmente E pede agent help quando precisa; ideal para fluxo "60% código manual, 40% AI". Claude Code é agent-first CLI/headless: você delega tarefas inteiras ("implemente feature X, rode testes, abra PR"); ideal para fluxo "20% manual, 80% delegação". Muitos sêniors usam ambos — Cursor para edição quotidiana, Claude Code para tarefas multi-arquivo ou em CI/headless',
      'Claude Code só funciona em servidores; Cursor só funciona local',
      'São o mesmo produto com nomes diferentes',
    ],
    correct: 1,
    explanation: 'Filosofias complementares: Cursor (cursor.com) é IDE forkado do VS Code com AI integrado profundamente — você é o principal autor, AI é assistente próximo. Claude Code (claude.com/code) é CLI/headless agent — você descreve tarefas, ele executa em loop com tool calls, opera por minutos sem interrupção, e roda perfeitamente em CI/SSH. Padrão prático sênior 2026: Cursor pra edição quotidiana (autocomplete, refactor inline, exploração); Claude Code pra delegar features inteiras, gerar boilerplate de testes em massa, automation em pipeline. Não são exclusivos: usar ambos é comum.',
  },
  {
    question: 'O que são Custom Modes no Cursor 2026 e quando criar um?',
    options: [
      'Não existem — Cursor tem só Ask e Agent fixos',
      'Custom Modes permitem definir personas/comportamentos persistentes do agent: você nomeia o mode ("Refactorer", "TDD", "Doc writer"), define quais tools habilita (read, edit, terminal, web search), modelo padrão, e prompt system base; switch rápido entre modes pelo dropdown; útil pra workflows recorrentes — ex Mode "TDD" só habilita edit em arquivos *.test.*, força regra "escreva teste antes de implementação"',
      'Custom Modes são apenas themes visuais diferentes',
      'É feature deprecada da v0.30',
    ],
    correct: 1,
    explanation: 'Custom Modes (Cursor settings → Modes → Add) são presets configuráveis do agent: nome, ícone, modelo (Claude/GPT/Gemini), tools habilitadas (read, edit, terminal, web, MCP servers específicos), e system prompt base. Permite criar workflows: "TDD" só edita arquivos *.test.*, "Refactorer" só edit + read sem terminal (refactor seguro), "Researcher" só web + read (analista sem editar), "Doc writer" só edita .md. Switch via dropdown no agent panel. Reduz prompt repetitivo e força disciplina por contexto. Tem builtin: Ask (read-only), Agent (full), Manual (aprova cada tool).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cursor-pro-workflows"
      title="Cursor pro: rules, composer, agent mode 2026 — workflows que funcionam"
      icon="🤖"
      xp={65}
      readTime={13}
      trailName="DevTools & Productivity Sênior"
      trailColor={accent}
      nextSlug="dotfiles-managed"
      nextTitle="Dotfiles managed: chezmoi, GNU Stow, yadm"
      quiz={quiz}
    >
      <Section title="O que é o Cursor em 2026" accent={accent}>
        <p>
          Cursor (<InlineCode>cursor.com</InlineCode>) é um fork do VS Code com AI
          integrada profundamente — não como extension (tipo Copilot), mas como cidadão
          de primeira classe no editor. Em 2026, depois de várias rodadas Series A/B/C,
          virou referência prática para devs que querem &quot;VS Code, mas com AI que
          entende o codebase inteiro&quot;.
        </p>
        <Callout tone="info" icon="ℹ️">
          Cursor não é open source (a parte de AI é proprietária). O editor base ainda é
          VS Code, então extensions VS Code (em sua maioria) funcionam. Trade-off
          deliberado: você troca abertura por integração AI mais profunda.
        </Callout>
        <p>
          Este módulo cobre o fluxo profissional sênior 2026: <strong>rules</strong>{' '}
          (substituiu .cursorrules), <strong>composer/agent</strong> (multi-file
          autônomo), <strong>agent mode background</strong> (tarefas remotas longas),
          <strong>MCP integration</strong> (extensões via Model Context Protocol), e{' '}
          <strong>custom modes</strong> (personas configuráveis).
        </p>
      </Section>

      <Section title="As três superfícies de AI no Cursor" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Superfície', 'Atalho', 'Para quê', 'Custo cognitivo']}
          rows={[
            ['Chat', 'Cmd+L', 'Perguntas read-only sobre código: "o que essa função faz", "onde isso é chamado"', 'Baixo — você dirige'],
            ['Inline Edit', 'Cmd+K', 'Edição focada no arquivo/seleção atual: "renomeie isso", "extraia em hook", "adicione tipos"', 'Médio — você revisa diff inline'],
            ['Agent (Composer)', 'Cmd+I', 'Multi-file autônomo: "implemente feature X", "migre lib Y", "adicione testes pra todos os componentes"', 'Alto — você define escopo, AI executa loop tool calls'],
          ]}
        />
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Quando usar cada superfície"
          steps={[
            { label: 'Pergunta sobre código existente?', desc: 'Chat (Cmd+L) — não modifica nada, ideal pra explorar codebase' },
            { label: 'Edição focada num arquivo aberto?', desc: 'Inline Edit (Cmd+K) — diff inline rápido, aceita/rejeita por chunk' },
            { label: 'Tarefa que toca múltiplos arquivos?', desc: 'Agent (Cmd+I) — loop autônomo, checkpoint pra reverter' },
            { label: 'Tarefa que demora 30min+?', desc: 'Background Agent — roda remoto, abre PR ao terminar' },
          ]}
        />
      </Section>

      <Section title="Project Rules: a base de todo workflow sério" accent={accent}>
        <p>
          O <InlineCode>.cursorrules</InlineCode> antigo (arquivo único na raiz)
          continuou funcionando por compatibilidade, mas o formato canônico em 2026 é{' '}
          <InlineCode>.cursor/rules/*.mdc</InlineCode> — múltiplos arquivos MDC com
          frontmatter, organizados por contexto.
        </p>
        <CodeBlock lang="markdown">{`---
description: Padrões do frontend Next.js da FFV Academy
globs:
  - "frontend/src/**/*.tsx"
  - "frontend/src/**/*.ts"
alwaysApply: false
---

# Frontend FFV — Convenções

## Server vs Client Components
- Default: Server Component. Use "use client" SOMENTE com interatividade real.
- Não use 'use client' em componentes que só renderizam props estáticas.

## Estilo
- Tailwind v4 + CSS vars (--ffv-*). Nunca importar Tailwind v3 syntax.
- Cores: var(--ffv-blue), var(--ffv-orange), var(--ffv-green).

## Testes
- Vitest + @testing-library/react. Sempre cobrir hooks e edge cases.
- Mock localStorage com helper de tests/setup.ts, não inline.

## Gotchas
- Após mudar GameState: atualizar engine.ts + schemas.ts + DEFAULT_STATE + migrateState().
- public/sitemap.xml e public/robots.txt causam 500 em static export — não recriar.`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'alwaysApply: true', v: 'Carrega em todo prompt — use para regras universais (security, formatting)' },
            { k: 'globs', v: 'Carrega quando arquivos no contexto match — escopo por área (frontend/, backend/, tests/)' },
            { k: 'Auto', v: 'Cursor decide baseado em path + descrição — meio termo' },
            { k: 'Manual', v: 'Você invoca via @rule-name no prompt — pra regras opcionais' },
            { k: 'Agent-requested', v: 'O agent decide carregar baseado no contexto da tarefa' },
          ]}
        />
        <Callout tone="success" icon="📋">
          Boas práticas: 5-10 arquivos MDC granulares &gt; 1 cursorrules de 500 linhas.
          Cada arquivo deve ter propósito claro. Versione no git para o time todo
          herdar as regras.
        </Callout>
      </Section>

      <Section title="Agent mode: o coração do Cursor 2026" accent={accent}>
        <p>
          Agent (antigo Composer, evoluído) é o loop autônomo. Você descreve uma tarefa
          em alto nível, o agent itera tool calls (read, edit, terminal, search) até
          completar. Tem três modos de execução:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Modo', 'Aprovação de tools', 'Quando usar']}
          rows={[
            ['Ask', 'Não edita — read-only', 'Explorar codebase, planejar refactor antes de executar'],
            ['Manual', 'Aprova cada tool call', 'Tarefas críticas, paths sensíveis (auth, migrations, infra)'],
            ['Auto', 'Executa sem interrupção', 'Tarefas de baixo risco em scratch branch, geração de testes, boilerplate'],
          ]}
        />
        <StackFlow
          accent={accent}
          title="Anatomia de uma session do Agent"
          items={[
            'Você descreve tarefa — Adicione paginação ao componente UserList com URL params e preserve estado de filtro',
            'Contexto inicial — Cursor injeta rules relevantes (.cursor/rules/*.mdc match), arquivos abertos, terminal output recente',
            'Loop de tool calls — read_file UserList.tsx → search_codebase "pagination" → read_file Pagination.tsx existente → edit UserList → run_terminal "npm test" → loop até sucesso',
            'Checkpoint — A cada mudança, Cursor cria checkpoint reversível (toolbar mostra timeline)',
            'Revisão — Você vê diff completo, aceita/rejeita por arquivo, pede ajustes',
          ]}
        />
      </Section>

      <Section title="Background Agents: tarefas longas sem bloquear" accent={accent}>
        <p>
          Background Agents (<InlineCode>cursor.com/docs/background-agents</InlineCode>)
          executam em sandboxes remotos da Cursor — Linux containers com clone do seu
          repo, credenciais delegadas, e ambiente reproduzível. Você dispara, fecha o
          Cursor, vai almoçar, volta e o PR está aberto.
        </p>
        <CodeBlock lang="text">{`Exemplos de tarefas adequadas para Background Agent:

1. "Migrar todos os arquivos de api/v1/ para usar o novo client gerado do OpenAPI spec"
   → muda ~30 arquivos, valida com testes, abre PR

2. "Adicionar testes Vitest para todos os hooks em src/hooks/ com cobertura >80%"
   → roda hora+, abre PR com testes novos

3. "Refatorar imports relativos longos (../../../) para alias @/* em todo src/"
   → mecânico, mas tedioso manualmente

4. "Audit de acessibilidade: rodar axe-core em todas as pages, listar issues, criar issues no GitHub"
   → integra com GitHub via MCP

5. "Atualizar Tailwind v3 → v4 (config, classes deprecadas, plugin migrations)"
   → grande, mas estruturado`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Background Agents consomem créditos da sua subscription. Para tarefas de
          rotina que vão demorar &gt;30min e podem rodar overnight, vale muito. Para
          tarefas de 5min, use Agent local (latência menor, mais contexto).
        </Callout>
      </Section>

      <Section title="MCP no Cursor: estendendo o agent com tools externas" accent={accent}>
        <p>
          Cursor adotou Model Context Protocol — mesma spec aberta da Anthropic usada em
          Claude Desktop, Zed, Continue. Você configura MCP servers em{' '}
          <InlineCode>.cursor/mcp.json</InlineCode> (projeto) ou{' '}
          <InlineCode>~/.cursor/mcp.json</InlineCode> (global). O agent ganha acesso às
          tools expostas por esses servers.
        </p>
        <CodeBlock lang="json">{`// .cursor/mcp.json — config de MCP servers do projeto
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_TOKEN": "ghp_..." }
    },
    "postgres-staging": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:pass@staging.db:5432/myapp"
      ]
    },
    "filesystem-docs": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/me/docs/architecture"
      ]
    },
    "ffv-curriculum": {
      "command": "node",
      "args": ["/Users/me/Developer/ffv/mcp/dist/index.js"],
      "env": {}
    }
  }
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'server-github', v: 'Tools pra ler issues, criar PRs, comentar — agent pode "abra issue com X, label bug"' },
            { k: 'server-postgres', v: 'Query read-only ao banco — agent pode "verificar quantos usuários estão na tabela X"' },
            { k: 'server-filesystem', v: 'Acesso controlado a paths fora do workspace — útil pra docs/specs externas' },
            { k: 'server-puppeteer', v: 'Automação web — agent pode abrir Chrome, navegar, capturar screenshot' },
            { k: 'custom (MCP FFV)', v: 'Você escreve seu próprio MCP server pro domínio do seu time (ex: tools pra ler currículo, criar trilhas)' },
          ]}
        />
      </Section>

      <Section title="Custom Modes: presets para workflows recorrentes" accent={accent}>
        <p>
          Custom Modes deixam você criar &quot;personas&quot; reusáveis do agent. Settings
          → Modes → Add. Cada mode define: nome, ícone, modelo padrão, tools habilitadas,
          system prompt base.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Mode', 'Tools habilitadas', 'System prompt resumido']}
          rows={[
            ['TDD', 'read, edit (*.test.*), terminal (npm test)', 'Escreva teste failing primeiro, depois implementação mínima, sempre rode os testes'],
            ['Refactorer', 'read, edit (sem terminal)', 'Refatore preservando comportamento. Não adicione features. Mantenha testes passando.'],
            ['Researcher', 'read, web_search (sem edit, sem terminal)', 'Pesquise, sintetize, cite fontes. Não modifique código.'],
            ['Doc writer', 'read, edit (apenas *.md)', 'Escreva documentação clara, exemplos práticos, sem editar código.'],
            ['Security review', 'read, web_search (sem edit)', 'Analise vulnerabilidades: injection, auth bypass, secrets em código, deps com CVE.'],
          ]}
        />
        <Callout tone="success" icon="🎭">
          Custom Modes reduzem prompt repetitivo. Em vez de digitar &quot;não toque em
          código de produção, só escreva testes&quot; toda vez, switch pro mode TDD e
          economize.
        </Callout>
      </Section>

      <Section title="Cursor vs Claude Code: filosofias complementares" accent={accent}>
        <DecisionBox
          scenario="Você está editando manualmente 60-70% do tempo, AI ajuda em momentos pontuais (autocomplete, refactor de hook, explicar erro de tipo)"
          winner="Cursor"
          winnerColor={accent}
          why="Cursor é IDE-first: você está no driver seat o tempo todo, AI é copiloto próximo. Inline Edit (Cmd+K) e Tab autocomplete cabem perfeitamente nesse fluxo."
          alternatives={[
            { name: 'Claude Code', when: 'Você quer delegar features inteiras ou está em CI/SSH/headless — agent-first vence' },
            { name: 'Usar ambos', when: 'Padrão sênior 2026: Cursor pra edição quotidiana, Claude Code para tarefas multi-arquivo ou pipelines' },
          ]}
        />
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Cursor', 'Claude Code']}
          rows={[
            ['Forma', 'IDE (fork VS Code) com AI integrado', 'CLI/headless agent — terminal nativo'],
            ['Filosofia', 'Você edita + AI assiste', 'Você descreve + AI executa loop'],
            ['Latência interação', 'Imediata (autocomplete, inline)', 'Maior (loop tool calls leva segundos/minutos)'],
            ['Edição manual', 'Primária', 'Secundária (você revisa diffs)'],
            ['CI / headless', 'Não — UI dependente', 'Sim — roda em runner, SSH, pipeline'],
            ['Worktrees / paralelismo', 'Limitado (uma janela por workspace)', 'Excelente (múltiplas sessões em paralelo)'],
            ['Pricing 2026', 'Subscription Cursor Pro (~$20/mês)', 'Subscription Claude Pro/Max ou API usage'],
            ['Best fit sênior', 'Edição cotidiana com AI assist', 'Delegação de features, automation, batch'],
          ]}
        />
      </Section>

      <Section title="Setup recomendado para o time" accent={accent}>
        <CodeBlock lang="text">{`# Estrutura recomendada do repo
.cursor/
├── rules/
│   ├── 00-always.mdc          # alwaysApply: true (LGPD, security, conventions)
│   ├── 10-frontend.mdc         # globs: frontend/**
│   ├── 20-backend.mdc          # globs: backend/**
│   ├── 30-tests.mdc            # globs: **/*.test.*
│   └── 99-architecture.mdc     # Manual via @architecture
├── mcp.json                    # MCP servers do projeto
└── modes.json                  # Custom modes do time (opcional)
.cursorignore                   # arquivos ignorados (build, node_modules)
.cursorindexignore              # arquivos não indexados (logs, snapshots gigantes)`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: '.cursorignore', v: 'Arquivos NUNCA enviados ao modelo (secrets, .env, snapshots binários)' },
            { k: '.cursorindexignore', v: 'Arquivos não indexados pra @-mention (mas ainda podem ser lidos manualmente)' },
            { k: 'Privacy Mode', v: 'Settings → enable para opt-out de coleta de prompts pela Cursor' },
            { k: 'Codebase indexing', v: 'Cursor indexa todo o repo em background — usa embeddings pra @-mention e busca semântica' },
            { k: 'Team rules', v: 'Versione .cursor/rules no git — time todo herda padrões automaticamente' },
          ]}
        />
      </Section>

      <Section title="FAQ rápido" accent={accent}>
        <QAItem
          q=".cursorrules antigo ainda funciona?"
          a="Sim, por compatibilidade. Mas .cursor/rules/*.mdc é o caminho recomendado em 2026. Migração: separe seu .cursorrules em arquivos por contexto."
        />
        <QAItem
          q="Cursor envia meu código para os servidores?"
          a="Sim, por default, durante prompts de AI. Privacy Mode (settings) limita ao mínimo. Cursor Enterprise tem zero data retention."
        />
        <QAItem
          q="Funciona offline?"
          a="Edição sim (é VS Code). AI não — depende de servidores remotos (Anthropic/OpenAI via proxy Cursor)."
        />
        <QAItem
          q="Posso usar minha própria API key?"
          a="Sim — settings → models → adicione key (Anthropic, OpenAI, Google). Útil pra contornar limite de subscription."
        />
        <QAItem
          q="Como debugar quando o agent faz besteira?"
          a="Toolbar de checkpoints — reverta a um ponto antes. Ative Manual mode pra aprovar cada tool. Revise os tool calls expandindo no painel pra entender contexto recebido."
        />
      </Section>

      <Callout tone="success" icon="🎯">
        <strong>Próximo passo</strong>: estruture <InlineCode>.cursor/rules/</InlineCode>{' '}
        no seu repo principal, crie 2-3 Custom Modes pros seus workflows recorrentes, e
        teste 1 Background Agent na semana. No próximo módulo: dotfiles managed — como
        versionar e sincronizar essa config toda entre máquinas sem virar mantenedor.
      </Callout>
    </ModuleLayout>
  );
}
