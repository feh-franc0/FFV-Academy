import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('editor-produtividade');
const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o maior ganho de produtividade que multi-cursor (Alt+Click / Cmd+D) traz em editor moderno?',
    options: [
      'Visual',
      'Edita N ocorrências simultaneamente em tempo linear: renomear variável local em 10 lugares, prefixar imports em bloco, transformar padrão em outro. O que seria 30 keystrokes + risco de erro vira 3–5 keystrokes em 2 segundos',
      'Só serve para copiar',
      'Substitui find & replace',
    ],
    correct: 1,
    explanation: 'Multi-cursor é ferramenta diária: Cmd+D seleciona próxima ocorrência, Cmd+Shift+L seleciona todas, Alt+Click adiciona cursor arbitrário. Combinado com movimento (Home, End, Ctrl+arrow), edita padrões complexos em segundos. Desenvolvedores que dominam multi-cursor produzem 20–30% mais em tarefas de edição mecânica — toda semana, toda sprint, toda carreira.',
  },
  {
    question: 'Por que LSP (Language Server Protocol) é ganho fundamental para editor escolhido?',
    options: [
      'É só sintaxe',
      'Cria separação entre análise de linguagem e UI: mesmo LSP (TypeScript, gopls, rust-analyzer, pyright) funciona em VS Code, Neovim, Helix, JetBrains. Escolha do editor vira preferência de UI, features ficam paritárias',
      'É lento',
      'Substitui compilador',
    ],
    correct: 1,
    explanation: 'Antes do LSP (Microsoft 2016), cada editor implementava autocomplete/go-to-definition/rename per linguagem — sempre inferior a IDEs dedicadas. Com LSP: rust-analyzer é o mesmo binary em VS Code, Neovim, Helix. Muda editor sem perder intelligence. Justifica a escolha por UX: VS Code (ecossistema, GUI), Neovim (modal, CLI-first), JetBrains (profundidade em Java/Kotlin). Feature set de análise é paridade.',
  },
  {
    question: 'Qual o valor real de Neovim distros como LazyVim/LunarVim para dev que não quer passar 2 semanas configurando?',
    options: [
      'Nenhum',
      'Setup "batteries included" com LSP, fuzzy finder, git UI, tree-sitter, autocomplete, formatadores — tudo pré-configurado e gerenciado como Lua plugins atualizáveis. Dá 90% da experiência de Vim power user em ~30min, permite customização incremental depois',
      'Só pra iniciantes',
      'Vim é melhor',
    ],
    correct: 1,
    explanation: 'Neovim puro é brinquedo. Neovim configurado manualmente (Mason + nvim-lspconfig + telescope + treesitter + null-ls...) leva semanas pra chegar em paridade com VS Code. LazyVim/LunarVim empacotam a configuração maturada pela comunidade: mesma experiência Neovim power user, instalação em minutos. Você aprende os bindings e padrões, depois customiza. Vale a pena pra quem trabalha muito em SSH ou ama modal editing.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="editor-produtividade"
      title="Editor produtividade: VS Code power + Neovim"
      icon="⌨️"
      xp={55}
      readTime={13}
      trailName="DX & Developer Productivity"
      trailColor={accent}
      nextSlug="terminal-multiplexers"
      nextTitle="Terminal multiplexers: tmux, zellij"
      quiz={quiz}
    >
      <Section title="Editor não é guerra santa" accent={accent}>
        <p>
          VS Code, Neovim, JetBrains, Helix, Zed — todos viáveis em 2026. O que diferencia produtividade não é qual você usa, é o quão fundo você foi nele. Dev que mal sabe atalhos do seu editor por 5 anos perde 30min/dia contra quem dominou. Em 10 anos isso é 1250h — 30+ semanas trabalhando.
        </p>
      </Section>

      <Section title="VS Code power user" accent={accent}>
        <CodeBlock lang="json">{`// settings.json essencial
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit",
    "source.fixAll.eslint": "explicit"
  },
  "editor.cursorSmoothCaretAnimation": "on",
  "editor.multiCursorModifier": "alt",
  "editor.suggestSelection": "first",
  "files.autoSave": "onFocusChange",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,

  "workbench.editor.enablePreview": false,
  "workbench.startupEditor": "none",

  "terminal.integrated.scrollback": 10000,

  "telemetry.telemetryLevel": "off"
}`}</CodeBlock>
        <Callout tone="info" icon="⌨️">
          Atalhos que mudam a vida: <strong>Cmd+P</strong> quick file, <strong>Cmd+Shift+P</strong> command palette, <strong>Cmd+D</strong> multi-cursor próxima, <strong>Cmd+Shift+L</strong> todas, <strong>F2</strong> rename symbol (via LSP), <strong>F12</strong> go to definition, <strong>Alt+↑/↓</strong> mover linha, <strong>Cmd+/</strong> comment. Memorize. Repete 200x/dia.
        </Callout>
      </Section>

      <Section title="Profiles e workspaces separados" accent={accent}>
        <CodeBlock lang="bash">{`# Profiles (VS Code feature desde 2023)
# Code → Preferences → Profiles → New

# Profile pessoal: Prettier, Copilot, temas coloridos
# Profile trabalho: ESLint strict, sem Copilot por política, tema sóbrio
# Profile web: Tailwind CSS, PostCSS, Live Server
# Profile rust: rust-analyzer, crates, CodeLLDB

# Cada workspace/repo associa profile; switch transparente.
# Extensions e settings isoladas — sem poluição cruzada.`}</CodeBlock>
      </Section>

      <Section title="Neovim com distro moderna" accent={accent}>
        <CodeBlock lang="bash">{`# LazyVim — distro moderna mantida, Lua-first
brew install neovim
git clone https://github.com/LazyVim/starter ~/.config/nvim
rm -rf ~/.config/nvim/.git
nvim   # primeira abertura instala todos os plugins

# O que você ganha imediatamente:
# - LSP (TypeScript, Rust, Go, Python, etc) via Mason
# - Fuzzy finder (Telescope) — files, grep, git, diagnostics
# - Tree-sitter syntax (muito melhor que regex)
# - Completion (nvim-cmp + LuaSnip)
# - Git UI (gitsigns + neogit / lazygit integration)
# - File tree (neo-tree), buffer line, status line

# Bindings sensatos, "leader" em espaço
# <space>ff  → find file
# <space>fg  → live grep
# <space>gg  → lazygit
# gd         → go to definition (LSP)
# K          → hover docs`}</CodeBlock>
      </Section>

      <Section title="Snippets custom economizam digitação" accent={accent}>
        <CodeBlock lang="json">{`// .vscode/typescriptreact.json (ou via UI)
{
  "React functional component": {
    "prefix": "rfc",
    "body": [
      "interface \${1:\${TM_FILENAME_BASE}}Props {}",
      "",
      "export function \${1}(props: \${1}Props) {",
      "  return <div>\$0</div>;",
      "}"
    ]
  },
  "FFV article section": {
    "prefix": "ffvsec",
    "body": [
      "<Section title=\"\$1\" accent={accent}>",
      "  <p>\$0</p>",
      "</Section>"
    ]
  }
}`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Não importa qual editor você escolhe. Importa: aprender 20 atalhos core, configurar format-on-save + lint-on-save, usar multi-cursor diariamente, criar 5–10 snippets pros seus padrões mais repetidos. Produtividade explode.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
