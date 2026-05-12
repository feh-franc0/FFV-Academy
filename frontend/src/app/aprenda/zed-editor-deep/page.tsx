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
  DecisionBox,
  StackFlow,
  QAItem,
  Kbd,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('zed-editor-deep');

const accent = '#0E84F3';

const quiz: QuizQuestion[] = [
  {
    question: 'Quem fundou o Zed e por que isso importa para a credibilidade técnica do projeto?',
    options: [
      'Foi um projeto solo de um ex-googler, sem track record relevante em editores',
      'Foi fundado por Nathan Sobo, Antonio Scandurra e Max Brunsfeld — os mesmos engenheiros que criaram o Atom (GitHub/Microsoft) e tree-sitter; eles aprenderam o que estava errado em Electron-based editors e decidiram reescrever do zero em Rust nativo com GPU rendering (GPUI framework próprio)',
      'É um fork do VS Code com tema diferente, sem reescrita real',
      'Foi criado pela Microsoft como sucessor secreto do VS Code',
    ],
    correct: 1,
    explanation: 'Zed (zed.dev) foi fundado pelos ex-engenheiros do Atom — Nathan Sobo (criador do Atom), Antonio Scandurra e Max Brunsfeld (criador do tree-sitter). Saíram do GitHub/Microsoft sabendo exatamente onde Electron+JS falhava (latência de input, RAM excessiva, scrolling travado) e reescreveram tudo em Rust com GPUI (framework GUI próprio, GPU-accelerated via Metal/Vulkan/DirectX). Por isso o latency typing-to-pixel é ~5ms (vs ~50-100ms em VS Code) e o editor abre em <100ms. Track record direto importa: tree-sitter já tinha sido adotado por Neovim, Helix, e o próprio GitHub.',
  },
  {
    question: 'Qual é o feature de colaboração que o Zed traz built-in e que nem VS Code com Live Share consegue replicar plenamente?',
    options: [
      'Apenas screen sharing tradicional via webcam',
      'Multiplayer real-time editing nativo (não plugin) com voz integrada — cada participante tem cursor, seleção e seu próprio cliente LSP; channels persistentes funcionam como "salas" onde projetos ficam compartilhados continuamente, sem precisar de host online; tudo via servidor Zed (collab.zed.dev) com CRDT por trás',
      'Suporta git pull/push compartilhado',
      'Comentários assíncronos em PR',
    ],
    correct: 1,
    explanation: 'Zed nasceu com collab built-in: multiplayer cursors, real-time editing via CRDT (tipo Google Docs), voz integrada (sem precisar Zoom/Meet à parte), e channels — "salas" persistentes onde projetos ficam compartilhados mesmo com host offline (cada participante tem clone local sincronizado). VS Code Live Share exige host online e tem latência maior. Pair programming remoto no Zed é qualitativamente diferente — você sente como se estivessem no mesmo terminal. Documentado em zed.dev/docs/collaboration.',
  },
  {
    question: 'Como o Zed lida com extensões em 2026, dado que ele não roda Node.js como o VS Code?',
    options: [
      'Não tem extensões — você usa só o que vem built-in',
      'Extensões são compiladas para WebAssembly (Wasm) com WIT interface — escritas em Rust majoritariamente (mas qualquer linguagem que compila pra Wasm serve); o Zed executa as extensions num runtime Wasm isolado, expondo API limitada (themes, language servers, slash commands). Trade-off: menos poderoso que VS Code/Node, mas zero overhead e seguro por sandbox',
      'Roda Node.js embarcado escondido como o VS Code mas chama de Wasm pra marketing',
      'Aceita apenas extensões oficiais publicadas pelo time do Zed',
    ],
    correct: 1,
    explanation: 'Zed extensions são Wasm modules (zed.dev/docs/extensions). O SDK é em Rust principalmente — exposta API via WIT (wit-bindgen). Extensions registram: themes, language servers (config + binário externo), grammars Treesitter, slash commands, indexed docs providers (pra context AI), e context servers (MCP). O sandbox Wasm é deliberadamente limitado — não tem File System completo nem rede arbitrária; mais seguro que VS Code (onde uma extension malicious lê /etc/passwd). Tradeoff aceito: ecosystem menor mas auditável. Em 2026 o registry tem ~500 extensions úteis.',
  },
  {
    question: 'Você é dev sênior de Vim/Neovim há 10 anos. Por que considerar Zed em 2026?',
    options: [
      'Não há motivo — Zed é pra iniciantes que querem GUI',
      'Zed tem modo vim de altíssima fidelidade (mantido por colaboradores que usam vim diariamente, suporta operators, text objects, marks, registers, macros, ex commands); soma a isso GPU rendering com latência menor que terminal-Neovim em alguns benchmarks, AI assistant integrado, multibuffer (editar múltiplos arquivos numa view só), e collab nativa — você ganha produtividade Vim sem perder UX moderna',
      'Zed só funciona com mouse — não tem modal editing',
      'O modo vim do Zed é só decoração visual sem semântica real',
    ],
    correct: 1,
    explanation: 'O modo vim do Zed (settings: "vim_mode": true) é levado a sério — operators (d, c, y), text objects (iw, ap, ib + treesitter-aware af/if), marks (m, "), registers (", ", 0), macros (q/Q), ex commands básicos (:w, :s/old/new/g), visual modes. Settings vim-specific em "vim" key. Para sênior Vim, o Zed entrega "Vim em GUI moderna" sem trade-offs: GPU rendering com input latency ~5ms (competitivo com terminal puro), multibuffer (editar 4 arquivos lado a lado como buffers únicos), AI inline editing, collab built-in, file finder e LSP nativos. É a alternativa séria pra quem cansou de manter init.lua.',
  },
  {
    question: 'Qual é o ponto fraco honesto do Zed em 2026 que deve te fazer pensar duas vezes?',
    options: [
      'Não tem suporte a syntax highlighting',
      'Ecossistema de extensions ainda é ~10% do VS Code, alguns LSPs/debuggers populares não têm support pleno (DAP foi adicionado tarde), Windows ainda é experimental (Linux e macOS são first-class), e plugin com lógica complexa fora do que o Wasm SDK expõe simplesmente não dá pra portar',
      'É proprietário e fechado — você não pode auditar o código',
      'Não funciona offline',
    ],
    correct: 1,
    explanation: 'Honestidade técnica: Zed é open source (GPL-3.0, github.com/zed-industries/zed), Linux+macOS são first-class, mas Windows entrou em beta tarde e ainda tem rough edges em 2026. Ecossistema de extensions é uma fração do VS Code — algumas integrações específicas (Salesforce DX, Unity, certos debuggers DAP) ainda não migraram. Wasm SDK por design é limitado: extension que precise rodar processo arbitrário, abrir socket próprio ou injetar UI HTML rica é impossível. Para 80% do trabalho dev típico (TS, Python, Go, Rust, React) o Zed é completo. Para nichos específicos, VS Code ainda ganha.',
  },
  {
    question: 'O AI assistant nativo do Zed se diferencia como em 2026?',
    options: [
      'É só um wrapper do Copilot — exatamente igual',
      'Zed Agent panel suporta múltiplos providers (Anthropic, OpenAI, local via Ollama, custom OpenAI-compatible endpoints), tem inline assistant (Ctrl-Enter) que edita seleção in-place sem janela à parte, prompt library com slash commands customizáveis (/file, /diagnostics, /docs), context servers via MCP, e profiles que limitam que ferramentas o agent pode chamar — tudo configurado em settings.json sem precisar de extension',
      'Só funciona com modelos OpenAI e custa $20/mês obrigatório',
      'É experimental e não pode ser usado em produção',
    ],
    correct: 1,
    explanation: 'O Zed AI (zed.dev/docs/ai) é nativo, multi-provider e configurável: agent panel pra conversações persistent, inline assistant (Ctrl-Enter na seleção pra edição diff inline), prompt library com slash commands editáveis pelo usuário (.zed/prompts.toml), MCP server integration (mesma spec do Claude Desktop) pra context customizado, profiles (read-only, ask, write) limitando o que o agent invoca. Suporta Claude Sonnet/Opus, GPT, Gemini, e local via Ollama com mesma UX. Diferente do Copilot (single-provider, inline-only) ou Cursor (proprietário, opinionado). Tudo configurável em ~/.config/zed/settings.json.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="zed-editor-deep"
      title="Zed editor: o desafiante de VS Code em 2026 (Rust, GPU, collab nativa)"
      icon="⚡"
      xp={60}
      readTime={12}
      trailName="DevTools & Productivity Sênior"
      trailColor={accent}
      nextSlug="cursor-pro-workflows"
      nextTitle="Cursor pro: rules, composer, agent mode 2026"
      quiz={quiz}
    >
      <Section title="Quem fez o Zed e por que isso importa" accent={accent}>
        <p>
          Em 2026, quando alguém diz &quot;testei o Zed esse fim de semana e voltei pro VS
          Code&quot;, é fácil descartar como editor-do-mês. Mas o Zed merece avaliação
          séria pelo time que o construiu: Nathan Sobo (criador do Atom), Antonio
          Scandurra e Max Brunsfeld (autor do tree-sitter). São as pessoas que viveram em
          carne própria os problemas do Electron como base para editores de código —
          latência de input, RAM excessiva, scrolling travado, eventos UI atrasados em
          centenas de ms.
        </p>
        <Callout tone="info" icon="🛠️">
          O Atom foi descontinuado em 2022. Pouco depois, Sobo e equipe fundaram a Zed
          Industries. A apresentação inaugural foi clara: &quot;vamos reescrever um editor
          em Rust, com GPU rendering, sem Electron, sem JavaScript no path crítico.&quot;
        </Callout>
        <p>
          O resultado é um editor com latência typing-to-pixel medida em <strong>~5ms</strong>
          {' '}(vs ~50–100ms em VS Code), startup em &lt;100ms, e consumo de RAM uma fração
          do esperado para um editor moderno. Não é &quot;mais um Electron com tema novo&quot;:
          é arquitetura radicalmente diferente.
        </p>
      </Section>

      <Section title="GPUI: o framework GUI que torna o Zed possível" accent={accent}>
        <p>
          O Zed não usa Electron, Tauri, GTK ou Qt. Usa <InlineCode>GPUI</InlineCode>,
          framework próprio escrito em Rust, com renderização via GPU nativa de cada
          plataforma — Metal no macOS, Vulkan no Linux, DirectX no Windows.
        </p>
        <StackFlow
          accent={accent}
          title="Stack do Zed por baixo"
          items={[
            'Aplicação (Zed) — Lógica do editor em Rust — buffers, LSP client, collaboration, AI, vim mode',
            'GPUI — Framework GUI próprio em Rust — declarativo (similar a SwiftUI), layout flexbox-like, animations',
            'wgpu / abstraction — Camada que abstrai shaders e draw calls para cada backend gráfico',
            'Metal / Vulkan / DirectX — API gráfica nativa do SO — GPU desenha texto, scrolling e UI direto, sem DOM intermediário',
            'GPU — Renderiza frames a 120Hz com latência sub-frame — input chega quase imediatamente no pixel',
          ]}
        />
        <p>
          Implicação prática: scrolling em arquivos de 100k linhas, com syntax highlight e
          múltiplos cursores, fica fluido como uma webpage estática. Inputs respondem no
          mesmo frame em monitores 120Hz+.
        </p>
      </Section>

      <Section title="Multibuffer: a feature que muda a forma de editar" accent={accent}>
        <p>
          Multibuffer é a feature mais distintiva do Zed em 2026. Conceitualmente: você
          edita várias regiões de arquivos diferentes numa única &quot;view&quot;, como se
          fossem partes do mesmo arquivo, com cada região mantendo seu LSP, syntax,
          undo/redo independentes.
        </p>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Casos onde multibuffer brilha"
          steps={[
            { label: 'Find &amp; Replace global', desc: 'Resultados aparecem como multibuffer — você navega entre matches editando inline; mudança commita em todos os arquivos ao salvar' },
            { label: 'Project diagnostics', desc: 'Cmd+Shift+M abre multibuffer com TODAS as warnings/errors do projeto, agrupadas; você corrige todas numa única tela' },
            { label: 'References LSP', desc: 'gd / find all references abre multibuffer com cada uso do símbolo no contexto — refactor coordenado é muito mais fácil' },
            { label: 'Git conflicts', desc: 'Múltiplos arquivos em conflito viram multibuffer, edite tudo de uma vez' },
          ]}
        />
        <Callout tone="success" icon="🪟">
          Multibuffer não tem equivalente direto em VS Code. É a feature que faz devs
          sêniors falarem &quot;ah, é por isso&quot; depois de 1 semana usando.
        </Callout>
      </Section>

      <Section title="Colaboração nativa: multiplayer real, channels persistentes" accent={accent}>
        <p>
          O Zed nasceu com collab built-in (não plugin). Múltiplos devs editam o mesmo
          buffer em real-time, com cursores, seleções e diff visíveis. Voz integrada
          dispensa Zoom/Meet à parte para pair programming. Channels — &quot;salas&quot;
          persistentes — permitem que projetos fiquem compartilhados continuamente, mesmo
          com host offline (cada participante tem seu clone sincronizado).
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Capacidade', 'Zed nativo', 'VS Code Live Share']}
          rows={[
            ['Latência cursors/edits', '~30ms percebida (CRDT)', '100-500ms via WebRTC peer-to-peer'],
            ['Host precisa estar online', 'Não (channels persistem)', 'Sim — sessão termina se host fechar'],
            ['Voz integrada', 'Sim, embutido', 'Não (precisa Discord/Meet)'],
            ['Multi-projetos paralelos', 'Sim, channels', 'Um host = uma sessão'],
            ['Setup', 'Login Zed → "share" → fim', 'Extensão Live Share + auth + share'],
            ['Servidor', 'collab.zed.dev gerido pela Zed Industries', 'Servidor Microsoft + relay'],
          ]}
        />
      </Section>

      <Section title="Extensions: WebAssembly em vez de Node.js" accent={accent}>
        <p>
          O Zed não embute Node.js (decisão deliberada de manter footprint pequeno).
          Extensions são compiladas para WebAssembly, executadas num runtime Wasm isolado.
          O SDK é em Rust principalmente, com interface WIT (wit-bindgen).
        </p>
        <CodeBlock lang="toml">{`# Exemplo: extension.toml de uma extension de language
id = "minha-linguagem"
name = "Minha Linguagem"
version = "0.1.0"
authors = ["Dev FFV <dev@ffv.academy>"]

[language_servers.minha-lsp]
name = "Minha LSP"
languages = ["MinhaLinguagem"]

[grammars.minha-linguagem]
repository = "https://github.com/exemplo/tree-sitter-minha-linguagem"
commit = "abc123"`}</CodeBlock>
        <CodeBlock lang="rust">{`// src/lib.rs — código Rust compilado pra Wasm
use zed_extension_api as zed;

struct MinhaExtension;

impl zed::Extension for MinhaExtension {
    fn new() -> Self { Self }

    fn language_server_command(
        &mut self,
        _: &zed::LanguageServerId,
        _: &zed::Worktree,
    ) -> zed::Result<zed::Command> {
        Ok(zed::Command {
            command: "minha-lsp".to_string(),
            args: vec![],
            env: Default::default(),
        })
    }
}

zed::register_extension!(MinhaExtension);`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          O SDK Wasm é deliberadamente limitado — sem FS arbitrário, sem rede livre, sem
          injeção de UI HTML rica. Trade-off aceito: ecosystem menor que VS Code, mas
          extensions auditáveis e seguras por sandbox.
        </Callout>
      </Section>

      <Section title="AI nativo: agent panel, inline assistant, MCP" accent={accent}>
        <p>
          O Zed entrega AI sem precisar de extension. Três superfícies principais:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Agent panel', v: 'Cmd+? abre painel lateral com conversa persistente, profiles (read-only, ask, write), context customizado via slash commands' },
            { k: 'Inline assistant', v: 'Ctrl+Enter na seleção: pede edição inline com diff visível; aceitar/rejeitar por chunk' },
            { k: 'Slash commands', v: '/file path, /diagnostics, /tab, /symbols, /docs — injeta contexto no prompt; customizáveis em ~/.config/zed/prompts/' },
            { k: 'MCP servers', v: 'Configure context servers (mesma spec do Claude Desktop) em settings.json — Zed lista as tools no agent' },
            { k: 'Providers', v: 'Anthropic (Claude), OpenAI, Google, Ollama local, OpenAI-compatible custom endpoints — escolha por model em settings' },
          ]}
        />
        <CodeBlock lang="json">{`// ~/.config/zed/settings.json — configuração AI multi-provider
{
  "agent": {
    "default_model": {
      "provider": "anthropic",
      "model": "claude-opus-4-7"
    },
    "always_allow_tool_actions": false,
    "version": "2"
  },
  "language_models": {
    "ollama": {
      "api_url": "http://localhost:11434"
    },
    "openai_compatible": {
      "X-AI": {
        "api_url": "https://api.x.ai/v1",
        "available_models": [
          { "name": "grok-4", "display_name": "Grok 4", "max_tokens": 131072 }
        ]
      }
    }
  },
  "context_servers": {
    "github-mcp": {
      "command": {
        "path": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"]
      },
      "env": { "GITHUB_TOKEN": "ghp_..." }
    }
  }
}`}</CodeBlock>
      </Section>

      <Section title="Vim mode: levado a sério, não decorativo" accent={accent}>
        <p>
          Para devs sêniors vindos de Vim/Neovim, o vim mode do Zed é o desbloqueador
          principal. É mantido por contributors que usam vim diariamente, e suporta a
          maior parte do dialeto:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Modes', v: 'Normal, Insert, Visual (char/line/block), Replace, Operator-pending — fielmente reproduzidos' },
            { k: 'Operators', v: 'd, c, y, p, &gt;, &lt;, =, gu, gU, ~ — todos com motions e text objects' },
            { k: 'Text objects', v: 'iw/aw, ip/ap, ib/ab, i&quot;/a&quot; + treesitter-aware: af/if (around/inner function), ac/ic (class)' },
            { k: 'Marks &amp; registers', v: 'm[a-z], `[a-z], &quot;[a-z], &quot;0, &quot;+ — completos' },
            { k: 'Macros', v: 'q[a-z] gravar, @[a-z] reproduzir, @@ último — funcionam normalmente' },
            { k: 'Ex commands', v: ':w, :q, :s/old/new/g, :%s, :e, :b, :sp, :vsp — coberto o básico' },
            { k: 'Custom', v: 'keymaps customizadas em keymap.json com contexto VimControl, Editor, etc' },
          ]}
        />
        <CodeBlock lang="json">{`// ~/.config/zed/keymap.json — exemplos vim-friendly
[
  {
    "context": "Editor && vim_mode == normal",
    "bindings": {
      "space f f": "file_finder::Toggle",
      "space f g": "project_search::ToggleFocus",
      "space e": "project_panel::ToggleFocus",
      "space g g": "git_panel::ToggleFocus",
      "shift-h": "pane::ActivatePrevItem",
      "shift-l": "pane::ActivateNextItem"
    }
  }
]`}</CodeBlock>
      </Section>

      <Section title="Quando NÃO usar Zed em 2026 (honestidade técnica)" accent={accent}>
        <DecisionBox
          scenario="Você trabalha com Salesforce DX, Unity C#, ou nicho que tem extension complexa custom em VS Code"
          winner="VS Code"
          winnerColor="#007ACC"
          why="Algumas integrações pesadas (Salesforce, Unity, certos DAP debuggers) ainda não têm equivalente Zed porque o Wasm SDK não permite o tipo de injeção que essas extensions fazem (UI HTML embutida, processo arbitrário, debugger inline avançado)."
          alternatives={[
            { name: 'Zed', when: 'Stack mainstream (TS, Python, Go, Rust, React, etc) — Zed entrega 100% do que você precisa' },
            { name: 'Neovim', when: 'Você quer extensibilidade total via Lua, terminal-first, SSH-heavy' },
          ]}
        />
        <p>Outros pontos honestos:</p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Windows', v: 'Beta — funciona mas com rough edges. macOS/Linux são first-class.' },
            { k: 'Ecosystem', v: '~500 extensions úteis em 2026 (vs ~50k em VS Code). 80% das stacks mainstream cobertas.' },
            { k: 'DAP', v: 'Adicionado tarde (2024). Debugger pra Rust/Go/Python funciona bem; debuggers exóticos podem faltar.' },
            { k: 'Telemetria', v: 'Coleta usage data por padrão. Configurável em settings ("telemetry": { "metrics": false }).' },
            { k: 'Pricing', v: 'Editor gratuito open source; Zed Pro paga pela infra de AI (subscription para usar modelos via servidores Zed).' },
          ]}
        />
      </Section>

      <Section title="Decisão final: Zed, Neovim ou VS Code em 2026?" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Critério', 'Zed', 'Neovim', 'VS Code']}
          rows={[
            ['Latência input', '~5ms (GPU)', '~5ms (terminal)', '~50-100ms (Electron)'],
            ['Startup', '<100ms', '<50ms', '~2s'],
            ['Curva aprendizado', 'Baixa-média', 'Alta', 'Baixa'],
            ['Vim mode', 'Excelente', 'Nativo', 'Bom (extension)'],
            ['Collab nativa', 'Sim, classe S', 'Não', 'Live Share (médio)'],
            ['AI built-in', 'Sim, multi-provider', 'Plugins (avante.nvim)', 'Copilot/Cursor'],
            ['Multibuffer', 'Sim, único', 'Quickfix-like', 'Search results'],
            ['Ecossistema extensions', '~500 (Wasm)', 'Milhares (Lua)', 'Dezenas de milhares (Node)'],
            ['Windows suporte', 'Beta', 'Pleno', 'Pleno'],
            ['Custo', 'Free + Pro opcional AI', 'Free', 'Free'],
          ]}
        />
      </Section>

      <Section title="FAQ rápido" accent={accent}>
        <QAItem
          q="Vale migrar de VS Code agora?"
          a="Se seu stack é mainstream (TS, Python, Go, Rust, React) e você valoriza performance: sim, teste por 1 semana. Se depende de extensions complexas de nicho: monitore o ecossistema e migre quando aparecer paridade."
        />
        <QAItem
          q="Zed substitui Neovim para devs sênior vim-natives?"
          a="Substitui parcialmente. Você ganha GUI e collab; perde controle total via Lua e SSH-friendly (Zed remote dev existe mas é mais limitado). Muitos devs sêniors mantêm os dois: Zed local, Neovim em servidores."
        />
        <QAItem
          q="É open source mesmo?"
          a="Sim. Repo em github.com/zed-industries/zed sob GPL-3.0. Build local funciona. A parte de servidor de collab e AI hosted é proprietária."
        />
        <QAItem
          q="Posso usar minha API key da Anthropic/OpenAI direto sem Zed Pro?"
          a="Sim. Settings → Agent → providers → cole sua key. Zed Pro é só conveniência (billing + usage tracking)."
        />
        <QAItem
          q="Funciona em chromebook ou ARM?"
          a="Linux ARM64 sim. Chromebook depende — funciona dentro do Crostini (Linux container)."
        />
      </Section>

      <Callout tone="success" icon="🎯">
        <strong>Próximo passo</strong>: instale o Zed (<InlineCode>brew install --cask zed</InlineCode>{' '}
        ou <InlineCode>zed.dev/download</InlineCode>), ative <InlineCode>{`"vim_mode": true`}</InlineCode>,
        teste multibuffer em <Kbd>Cmd</Kbd>+<Kbd>Shift</Kbd>+<Kbd>F</Kbd> e veja por que o
        time do Atom/tree-sitter merece sua atenção. No próximo módulo: Cursor pro
        workflows — AI-first com filosofia diferente.
      </Callout>
    </ModuleLayout>
  );
}
