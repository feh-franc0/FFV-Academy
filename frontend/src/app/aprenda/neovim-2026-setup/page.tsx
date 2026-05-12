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
  StackFlow,
  QAItem,
  Kbd,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('neovim-2026-setup');

const accent = '#57A143';

const quiz: QuizQuestion[] = [
  {
    question: 'Você é dev sênior, nunca usou Neovim, quer setup moderno em 1 hora sem virar mantenedor de config. Qual o caminho recomendado em 2026?',
    options: [
      'Começar do zero com init.lua vazio e adicionar plugin por plugin via vim.cmd, lendo :help diariamente',
      'Instalar LazyVim — uma distro pronta sobre lazy.nvim que entrega LSP, Treesitter, Telescope, Mason e ~80 plugins curados, mas mantém init.lua editável e seu config sobrescrevível em lua/plugins/*.lua',
      'Usar SpaceVim ou AstroNvim — são as únicas distros que ainda funcionam com Neovim 0.10+',
      'Compilar Neovim do master e copiar a config do ThePrimeagen direto do GitHub, é o que todos fazem',
    ],
    correct: 1,
    explanation: 'LazyVim (github.com/LazyVim/LazyVim) virou padrão pragmático em 2026 — Folke (mantenedor de lazy.nvim, which-key, tokyonight) curou uma stack coerente. Você instala uma vez, ganha LSP+DAP+Treesitter+Mason+Telescope+Neo-tree configurados, e customiza por arquivos em lua/plugins/. É o equivalente Neovim de "Next.js create-next-app" — distro opinionada mas customizável. Quem quer aprender de baixo segue kickstart.nvim (TJ DeVries) — ~700 linhas comentadas. SpaceVim/AstroNvim perderam tração; init.lua vazio só faz sentido se você for fazer carreira de mantenedor de dotfiles.',
  },
  {
    question: 'O que exatamente Mason faz no ecossistema Neovim 2026, e qual a diferença para nvim-lspconfig?',
    options: [
      'Mason e nvim-lspconfig fazem a mesma coisa — Mason é a versão antiga sendo descontinuada',
      'Mason gerencia instalação de LSP servers, DAP adapters, linters e formatters como package manager (substitui apt/brew/npm install pra essas ferramentas, isolado em ~/.local/share/nvim/mason); nvim-lspconfig só configura como o Neovim fala com um LSP já instalado. Você usa os dois juntos: Mason instala gopls, nvim-lspconfig diz "rode gopls em buffers .go com essas settings"',
      'Mason é só uma UI bonita pra :LspInstall — internamente chama o nvim-lspconfig',
      'Mason instala plugins Lua e lspconfig instala servidores LSP — são complementares mas independentes',
    ],
    correct: 1,
    explanation: 'Mason (williamboman/mason.nvim) é package manager pra ferramentas externas: LSPs (gopls, tsserver, pyright, rust-analyzer), DAP adapters (debugpy, codelldb), linters (eslint_d, ruff), formatters (prettier, stylua, gofumpt). Instala em ~/.local/share/nvim/mason/, não polui sistema. nvim-lspconfig (neovim/nvim-lspconfig) é coleção de configs declarativas — diz "pra rust-analyzer, use root_dir Cargo.toml, settings X". mason-lspconfig.nvim conecta os dois (autoinstala servers definidos no lspconfig). LazyVim já junta tudo. Diferença essencial: Mason = instalação; lspconfig = integração.',
  },
  {
    question: 'Por que Treesitter substituiu o highlight tradicional do Vim baseado em regex?',
    options: [
      'Treesitter é só mais rápido — o resultado visual é idêntico ao regex highlight',
      'Treesitter gera uma AST incremental do arquivo (parser por linguagem, escrito em C, atualizado em cada keystroke em ms), permitindo highlight semântico (distinguir parâmetro de variável local de campo de struct), indent inteligente, text objects estruturais (selecionar função inteira, próxima classe), e folding por estrutura — coisas impossíveis de fazer com regex confiável',
      'Treesitter é apenas um syntax highlighter mais bonito — performance e features são iguais',
      'Treesitter funciona offline e regex precisa de internet pra buscar regras de sintaxe atualizadas',
    ],
    correct: 1,
    explanation: 'tree-sitter (Max Brunsfeld, Atom/GitHub origin, agora padrão Neovim/Helix/Zed) é parser incremental: cada linguagem tem grammar em src/parser.c gerado de grammar.js, produz AST atualizada em <5ms a cada edição. Isso destrava: (1) highlight semântico real — "x" é parameter? local var? type? campo? (2) text objects estruturais via nvim-treesitter-textobjects (vaf = around function, vif = inner function, ]f = next function); (3) indent baseado em AST; (4) folding por nó; (5) injection (highlight SQL dentro de string Python). Regex highlight é heurística — quebra em construções complexas. nvim-treesitter é o plugin que conecta.',
  },
  {
    question: 'Quando você abre um .py em LazyVim 2026, qual a sequência típica do que acontece?',
    options: [
      'Neovim só carrega buffer — todo o resto roda manualmente via comandos',
      'Lazy.nvim carrega plugins lazy associados a filetype=python (lspconfig + treesitter parser python já estavam instalados via Mason); nvim-treesitter aplica highlight via AST; mason-lspconfig dispara pyright (ou basedpyright) como cliente LSP; blink.cmp (ou nvim-cmp) liga completion source ao LSP; null-ls/conform.nvim prepara ruff/black como formatter — tudo em <100ms, lazy por filetype',
      'Neovim spawn um processo Docker com Python pré-configurado',
      'Plugins carregam todos no startup, por isso Neovim é lento — não importa o filetype',
    ],
    correct: 1,
    explanation: 'A graça de lazy.nvim é justamente carregar plugins sob demanda (event = "BufReadPost", ft = "python", keys = ..., cmd = ...). Em LazyVim, ao abrir .py: lazy resolve dependencies, carrega nvim-lspconfig + nvim-treesitter + cmp/blink, dispara pyright via mason-lspconfig, treesitter aplica highlight pelo parser instalado, conform.nvim/none-ls registra ruff como formatter on save. blink.cmp (Saghen/blink.cmp, Rust, 2025) substituiu nvim-cmp em LazyVim por ser ~10× mais rápido. Startup fica em <50ms porque nada disso carrega até abrir o arquivo. :Lazy profile mostra cada plugin.',
  },
  {
    question: 'TJ DeVries é mantenedor do Neovim e criador do kickstart.nvim. Qual a filosofia oposta entre kickstart e LazyVim?',
    options: [
      'Não há diferença — kickstart e LazyVim são forks um do outro',
      'kickstart.nvim é educacional (~700 linhas em init.lua, todos os plugins explicados em comentários, você lê e entende cada decisão antes de adotar); LazyVim é produto (distro pronta, ~80 plugins curados, você opta in/out por arquivo) — kickstart treina você pra fazer sua própria config; LazyVim te entrega "Neovim funcional" sem ter que entender tudo',
      'kickstart só funciona em Linux e LazyVim só em macOS',
      'kickstart é versão paga do LazyVim',
    ],
    correct: 1,
    explanation: 'kickstart.nvim (github.com/nvim-lua/kickstart.nvim, mantido por TJ DeVries e comunidade) é um init.lua único, exaustivamente comentado, que mostra como configurar Mason+lspconfig+telescope+treesitter+cmp do zero — você fork, lê, edita, aprende. LazyVim (LazyVim/LazyVim) é distro: você instala como dependência, configura por overrides em lua/plugins/*.lua, herda updates do upstream. Kickstart = "ensina a pescar" (caminho longo, mas você fica autônomo). LazyVim = "te entrega o peixe" (caminho curto, ótimo pra adoção rápida). Ambos respeitáveis. ThePrimeagen tem dotfiles próprios (ThePrimeagen/init.lua), populares mas opinativos demais pra adotar inteiros.',
  },
  {
    question: 'Você está editando, quer renomear um símbolo em todos os arquivos do projeto. Qual o atalho idiomático em LazyVim 2026?',
    options: [
      'Sair do Neovim, abrir VS Code, fazer rename, voltar',
      'Em normal mode, com cursor no símbolo: <leader>cr (LazyVim mapeia para vim.lsp.buf.rename()) — abre prompt com nome atual; ao confirmar, LSP server faz workspace-wide rename refatorando todos os arquivos relevantes. Funciona porque pyright/gopls/tsserver/rust-analyzer entendem semântica, não texto',
      'Usar :%s/antigo/novo/g — sempre seguro',
      ':!sed -i s/antigo/novo/g **/*.py — workaround universal',
    ],
    correct: 1,
    explanation: '<leader>cr em LazyVim chama vim.lsp.buf.rename(). LSP server (pyright, gopls, tsserver, rust-analyzer) recebe a posição do cursor, identifica o símbolo na AST e devolve WorkspaceEdit cobrindo todos os arquivos afetados — incluindo arquivos não abertos. Neovim aplica as edições, marca buffers como modified, você revisa e salva com :wa. Difere de %s (regex burro — renomeia "user" em "username" também) e de sed (sem entender escopo: variável local com mesmo nome de função vira bagunça). Outros úteis: <leader>ca code action, gd definition, gr references, K hover. Tudo via LSP.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="neovim-2026-setup"
      title="Neovim 2026: LazyVim, Mason, Treesitter, LSP — setup sênior sem virar mantenedor de config"
      icon="⌨️"
      xp={65}
      readTime={13}
      trailName="DevTools & Productivity Sênior"
      trailColor={accent}
      nextSlug="zed-editor-deep"
      nextTitle="Zed editor: o desafiante de VS Code em 2026"
      quiz={quiz}
    >
      <Section title="Por que Neovim ainda importa em 2026" accent={accent}>
        <p>
          Em 2026, Neovim continua sendo o editor preferido de uma camada específica e
          influente de devs sênior — mantenedores de kernel Linux, core engineers de
          databases, autores de compilers, e qualquer um que passa &gt;6h/dia editando texto e
          se recusa a tirar as mãos do home row. Não é nostalgia: Neovim 0.10+ tem LSP
          nativo, Treesitter nativo, Lua como linguagem de config, e um ecossistema de
          plugins que rivaliza VS Code em capacidade — superando-o em velocidade bruta.
        </p>
        <Callout tone="info" icon="ℹ️">
          Vim original (Bram Moolenaar, 1991, RIP 2023) ainda existe e funciona, mas o
          ecossistema de inovação migrou pra Neovim (fork de 2014, focado em
          arquitetura: jobs assíncronos, embed-friendly, Lua-first). Em 2026, quando
          alguém fala &quot;Vim&quot; profissionalmente, geralmente é Neovim.
        </Callout>
        <p>
          Este módulo te dá o caminho mais curto de &quot;nunca usei Neovim&quot; para &quot;tenho
          setup moderno produtivo em 1 hora&quot; — sem virar mantenedor de dotfiles em tempo
          integral.
        </p>
      </Section>

      <Section title="A escolha estratégica: kickstart vs LazyVim vs from scratch" accent={accent}>
        <p>
          A primeira decisão é a mais importante. Existem três caminhos legítimos pra
          começar com Neovim em 2026.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'kickstart.nvim', 'LazyVim', 'init.lua from scratch']}
          rows={[
            ['Mantenedor', 'TJ DeVries + comunidade', 'Folke (LazyVim/LazyVim)', 'Você'],
            ['Linhas iniciais', '~700 (1 arquivo comentado)', '~30 (importa distro)', '0 (você escreve tudo)'],
            ['Plugins inclusos', '~15 essenciais', '~80 curados', 'Nenhum'],
            ['Tempo para produtivo', '2-3h estudando', '30min', '20-60h'],
            ['Update upstream', 'Você faz merge manual', 'lazy sync atualiza distro', 'N/A'],
            ['Customização', 'Editar init.lua direto', 'lua/plugins/*.lua override', 'Tudo seu'],
            ['Pra quem', 'Quer aprender de baixo, vai escrever sua própria config', 'Quer Neovim funcional rápido, customiza pontual', 'Tem tempo, quer controle total'],
          ]}
        />
        <DecisionBox
          scenario="Você é dev sênior, nunca usou Neovim, tem 1h pra setup e quer voltar a entregar features amanhã"
          winner="LazyVim"
          winnerColor={accent}
          why="Distro curada por Folke (autor de lazy.nvim, which-key, tokyonight). Você ganha LSP+DAP+Treesitter+Mason+Telescope+Neo-tree+blink.cmp configurados, com keymaps coerentes (<leader>f para find, <leader>c para code, <leader>g para git). Customização por override em lua/plugins/."
          alternatives={[
            { name: 'kickstart.nvim', when: 'Quer entender cada plugin antes de adotar, vai construir sua própria distro depois' },
            { name: 'init.lua from scratch', when: 'Vai contribuir pro core do Neovim, escrever plugin, ou é seu hobby manter dotfiles' },
          ]}
        />
        <p>
          O resto deste módulo assume LazyVim como base, mas as ideias (Mason,
          Treesitter, LSP) são idênticas em qualquer setup.
        </p>
      </Section>

      <Section title="Instalação em 5 minutos: do zero ao LazyVim funcional" accent={accent}>
        <p>
          O bootstrap oficial está em <InlineCode>lazyvim.org/installation</InlineCode>.
          Resumo executivo:
        </p>
        <CodeBlock lang="bash">{`# 1. Dependências (macOS exemplo — Linux usa apt/dnf/pacman)
brew install neovim ripgrep fd lazygit gcc node
# Neovim >= 0.10, ripgrep+fd pra Telescope, lazygit pra <leader>gg,
# gcc pra compilar parsers Treesitter, node pra alguns LSPs (tsserver, pyright via npm)

# 2. Backup config anterior (importante se já tinha algo)
mv ~/.config/nvim ~/.config/nvim.bak 2>/dev/null
mv ~/.local/share/nvim ~/.local/share/nvim.bak 2>/dev/null
mv ~/.local/state/nvim ~/.local/state/nvim.bak 2>/dev/null
mv ~/.cache/nvim ~/.cache/nvim.bak 2>/dev/null

# 3. Clonar starter
git clone https://github.com/LazyVim/starter ~/.config/nvim
rm -rf ~/.config/nvim/.git    # você vai gitar a sua própria config

# 4. Primeira execução — lazy.nvim faz bootstrap
nvim
# Tela do Lazy abre, instala ~80 plugins, baixa parsers Treesitter,
# Mason instala LSPs base. Espere ~2min na primeira vez. :q quando terminar.

# 5. Abrir um arquivo .py / .ts / .go e ver acontecer:
# - highlight via Treesitter
# - LSP server iniciando (Mason auto-instala se faltando)
# - completion via blink.cmp
nvim hello.py`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Em 5 minutos você tem um setup com LSP, Treesitter, fuzzy finder, file tree, git
          integration e ~80 plugins curados. Seu init.lua segue em ~/.config/nvim,
          editável.
        </Callout>
      </Section>

      <Section title="Mason: package manager para ferramentas externas" accent={accent}>
        <p>
          Mason (<InlineCode>williamboman/mason.nvim</InlineCode>) é o package manager do
          ecossistema Neovim — instala LSPs, DAP adapters, linters e formatters numa pasta
          isolada (<InlineCode>~/.local/share/nvim/mason/</InlineCode>) sem poluir o
          sistema. Equivalente conceitual: &quot;npm/brew, mas só pra ferramentas que o
          editor consome&quot;.
        </p>
        <StackFlow
          accent={accent}
          title="Stack Mason → LSP → você"
          items={[
            'Mason — Baixa binários (gopls, pyright, rust-analyzer, eslint_d, ruff, stylua) em ~/.local/share/nvim/mason/bin/',
            'mason-lspconfig.nvim — Bridge: lista de LSPs em ensure_installed = {...} dispara instalação automática',
            'nvim-lspconfig — Diz ao Neovim "pra .go use gopls com root_dir go.mod, settings X',
            'Neovim core (vim.lsp) — Cliente LSP nativo — fala protocolo com o server, gerencia diagnostics, code actions, hover',
            'Você — <leader>cr renomear, gd ir pra definição, K hover, <leader>ca code action',
          ]}
        />
        <CodeBlock lang="lua">{`-- ~/.config/nvim/lua/plugins/mason.lua
-- Override em LazyVim: adicionar LSPs específicos do seu stack

return {
  {
    "williamboman/mason.nvim",
    opts = {
      ensure_installed = {
        -- LSPs (também podem vir via lspconfig opts)
        "stylua",         -- formatter Lua
        "shfmt",          -- formatter shell
        "ruff",           -- linter+formatter Python
        "gofumpt",        -- formatter Go (stricter gofmt)
        "goimports",      -- organize imports Go
        -- linters
        "eslint_d",
        "shellcheck",
      },
    },
  },
  -- LSPs declarados via lspconfig — auto-installam via mason-lspconfig
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        gopls = {
          settings = {
            gopls = {
              gofumpt = true,
              staticcheck = true,
            },
          },
        },
        basedpyright = {},  -- pyright fork mais ativo em 2026
        rust_analyzer = {},
      },
    },
  },
}`}</CodeBlock>
        <p>
          UI interativa: <InlineCode>:Mason</InlineCode> abre tela com lista de tudo
          instalável, filtrável por categoria (<Kbd>2</Kbd> LSP, <Kbd>3</Kbd> DAP,{' '}
          <Kbd>4</Kbd> linter, <Kbd>5</Kbd> formatter). <Kbd>i</Kbd> instala, <Kbd>X</Kbd>{' '}
          remove.
        </p>
      </Section>

      <Section title="Treesitter: parser incremental, highlight semântico, text objects estruturais" accent={accent}>
        <p>
          tree-sitter (Max Brunsfeld, origem Atom/GitHub) é parser incremental por
          linguagem. Cada grammar (<InlineCode>tree-sitter-python</InlineCode>,{' '}
          <InlineCode>tree-sitter-go</InlineCode>, etc.) é gerado de{' '}
          <InlineCode>grammar.js</InlineCode>, compilado em C, atualiza AST em
          &lt;5ms por keystroke. nvim-treesitter conecta isso ao Neovim.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Capacidade', 'Regex highlight (Vim clássico)', 'Treesitter (Neovim moderno)']}
          rows={[
            ['Acurácia em código complexo', 'Quebra em template literals aninhados, JSX, macros', 'AST real — entende escopo, contexto'],
            ['Distinguir param vs local var vs field', 'Não (tudo é "identifier")', 'Sim — @parameter, @variable.local, @field'],
            ['Text objects', 'vaw (word), vap (paragraph)', '+ vaf (around function), vif (inner function), vac (around class)'],
            ['Folding', 'Por indent ou marcadores', 'Por estrutura AST (função, classe, if, loop)'],
            ['Injection (SQL em string Python)', 'Não', 'Sim, com syntax próprio dentro da string'],
            ['Performance em arquivo 10k linhas', 'Recompila regex toda hora', 'Diff incremental, sub-ms'],
          ]}
        />
        <CodeBlock lang="lua">{`-- ~/.config/nvim/lua/plugins/treesitter.lua
return {
  {
    "nvim-treesitter/nvim-treesitter",
    opts = {
      ensure_installed = {
        "bash", "c", "cpp", "go", "lua", "python", "rust", "typescript",
        "tsx", "javascript", "json", "yaml", "toml", "markdown", "vim",
        "regex", "sql", "dockerfile", "gitignore", "html", "css",
      },
      highlight = { enable = true },
      indent = { enable = true },
      incremental_selection = {
        enable = true,
        keymaps = {
          init_selection = "<C-space>",  -- expande pra próximo nó AST
          node_incremental = "<C-space>",
          node_decremental = "<bs>",
        },
      },
    },
  },
  -- Text objects estruturais
  {
    "nvim-treesitter/nvim-treesitter-textobjects",
    config = function()
      require("nvim-treesitter.configs").setup({
        textobjects = {
          select = {
            enable = true,
            lookahead = true,
            keymaps = {
              ["af"] = "@function.outer",  -- vaf = around function
              ["if"] = "@function.inner",  -- vif = inner function
              ["ac"] = "@class.outer",
              ["ic"] = "@class.inner",
              ["aa"] = "@parameter.outer",
              ["ia"] = "@parameter.inner",
            },
          },
          move = {
            enable = true,
            goto_next_start = { ["]f"] = "@function.outer", ["]c"] = "@class.outer" },
            goto_previous_start = { ["[f"] = "@function.outer", ["[c"] = "@class.outer" },
          },
        },
      })
    end,
  },
}`}</CodeBlock>
        <Callout tone="success" icon="🌳">
          Depois de habituar <Kbd>vaf</Kbd>, <Kbd>vif</Kbd>, <Kbd>]f</Kbd>, <Kbd>[f</Kbd>{' '}
          você não consegue mais voltar pra editor sem text objects estruturais. É a
          feature que mais aumenta produtividade objetiva.
        </Callout>
      </Section>

      <Section title="LSP nativo: completion, rename, code actions sem mágica" accent={accent}>
        <p>
          Neovim 0.5+ tem cliente LSP no core (<InlineCode>vim.lsp.*</InlineCode>) — não
          precisa de plugin pra isso. O que o plugin{' '}
          <InlineCode>nvim-lspconfig</InlineCode> faz é fornecer presets declarativos
          (root_dir, settings padrão) pra cada server. <InlineCode>blink.cmp</InlineCode>{' '}
          (Saghen, Rust, 2025) virou completion engine padrão em LazyVim — substituiu
          nvim-cmp por ser ~10× mais rápido em filtragem fuzzy.
        </p>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Fluxo de uma completion request"
          steps={[
            { label: 'Você digita', desc: 'Em arquivo .go: "ctx." + Ctrl-Space (ou trigger automático)' },
            { label: 'blink.cmp', desc: 'Coleta sources (lsp, snippets, path, buffer), envia textDocument/completion ao gopls via vim.lsp' },
            { label: 'gopls', desc: 'Analisa AST do projeto (cache em ~/.cache/gopls), retorna lista ranked com signatures' },
            { label: 'blink.cmp', desc: 'Fuzzy filter em Rust, renderiza menu com docs preview' },
            { label: 'Você', desc: 'Tab/Enter aceita, vim.lsp insere texto + import auto via code action' },
          ]}
        />
        <KeyValue
          accent={accent}
          items={[
            { k: 'gd', v: 'go-to-definition (vim.lsp.buf.definition)' },
            { k: 'gr', v: 'find references (vim.lsp.buf.references)' },
            { k: 'K', v: 'hover documentation (vim.lsp.buf.hover)' },
            { k: '<leader>cr', v: 'rename symbol workspace-wide (vim.lsp.buf.rename)' },
            { k: '<leader>ca', v: 'code action (quick fix, refactor, add import)' },
            { k: '<leader>cf', v: 'format buffer (via conform.nvim usando stylua/ruff/gofumpt)' },
            { k: '[d / ]d', v: 'previous/next diagnostic' },
            { k: '<leader>cd', v: 'show line diagnostic em popup' },
          ]}
        />
      </Section>

      <Section title="O resto: Telescope, Neo-tree, lazygit, which-key" accent={accent}>
        <p>
          LazyVim já vem com os plugins de produtividade essenciais. Os 4 que você usa
          todo dia:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Plugin', 'O que faz', 'Atalho LazyVim']}
          rows={[
            ['Telescope', 'Fuzzy finder universal — arquivos, buffers, grep, símbolos LSP, git commits, help', '<leader>ff (files), <leader>fg (grep), <leader>fb (buffers), <leader>fs (LSP symbols)'],
            ['Neo-tree', 'File explorer lateral (NERDTree moderno) — Git status, ícones, hidden files toggle', '<leader>e (toggle)'],
            ['lazygit', 'TUI git completa (não é plugin neovim, é binário Jesse Duffield) integrada via janela flutuante', '<leader>gg'],
            ['which-key', 'Mostra popup com keymaps disponíveis quando você pressiona <leader> e espera', 'automático após <leader> + 1s'],
          ]}
        />
        <Callout tone="info" icon="🔭">
          Telescope substitui <InlineCode>:e</InlineCode>, <InlineCode>:b</InlineCode>,{' '}
          <InlineCode>:grep</InlineCode> e <InlineCode>:help</InlineCode> num único UX
          fuzzy. <Kbd>&lt;leader&gt;</Kbd><Kbd>f</Kbd><Kbd>g</Kbd> grep no projeto inteiro
          via ripgrep. <Kbd>&lt;leader&gt;</Kbd><Kbd>f</Kbd><Kbd>s</Kbd> lista todos os
          símbolos do arquivo via LSP. Velocidade incomparável.
        </Callout>
      </Section>

      <Section title="Dotfiles de referência: o que estudar" accent={accent}>
        <p>
          Em vez de copiar config de alguém inteira, leia para entender padrões e adote
          peças. Os três repositórios mais influentes em 2026:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'tjdevries/config_manager', v: 'TJ DeVries (core team Neovim, criador kickstart, telescope.nvim) — dotfiles educativos, comentados, evoluem com features do Neovim. Estudo de caso de boas práticas Lua.' },
            { k: 'ThePrimeagen/init.lua', v: 'Streamer/educador. Config opinionada (vim style, harpoon.nvim como navegação), úteis pra ver keymaps eficientes mesmo que você não adote tudo.' },
            { k: 'folke/dot', v: 'Mantenedor do LazyVim, lazy.nvim, tokyonight, which-key, noice.nvim, trouble.nvim — o estado da arte de quem criou metade do ecossistema.' },
            { k: 'craftzdog/dotfiles-public', v: 'Takuya Matsuyama (DevAsLife). Tsx/Next.js focused, esteticamente cuidado, ótimo para front-end devs.' },
            { k: 'LazyVim/starter', v: 'Ponto de partida oficial. Leia uma vez antes de customizar.' },
          ]}
        />
      </Section>

      <Section title="Linha do tempo: como o Neovim chegou aqui" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '1991', label: 'Vim 1.0 (Bram Moolenaar)', detail: 'Vi Improved no Amiga, depois portado pra Unix. Vimscript próprio, single-threaded, sem job control.' },
            { when: '2014', label: 'Neovim fork', detail: 'Thiago de Arruda começa Neovim com objetivo: arquitetura embed-friendly, jobs async, refactor do core. Comunidade adota.' },
            { when: '2017', label: 'Lua embed', detail: 'Neovim 0.2 embute LuaJIT. Devs começam a escrever plugins em Lua em vez de Vimscript — 10-50× mais rápido.' },
            { when: '2021', label: 'LSP + Treesitter nativos', detail: 'Neovim 0.5 ganha cliente LSP no core e integração Treesitter. Define a era moderna.' },
            { when: '2023', label: 'Bram Moolenaar morre', detail: 'Vim original passa pra Christian Brabandt. Inovação central segue Neovim.' },
            { when: '2024', label: 'LazyVim ascende', detail: 'Folke lança LazyVim sobre lazy.nvim — distros viram caminho padrão de adoção sênior.' },
            { when: '2025', label: 'blink.cmp + Snacks.nvim', detail: 'Completion em Rust (Saghen) e plugin meta (folke/snacks.nvim) consolidam o stack moderno.' },
            { when: '2026', label: 'Estado atual', detail: 'Neovim 0.11+, LazyVim como padrão de facto pra adoção corporativa, Helix/Zed pressionando como competição saudável.' },
          ]}
        />
      </Section>

      <Section title="FAQ rápido" accent={accent}>
        <QAItem
          q="Vou perder produtividade nas primeiras 2 semanas?"
          a="Sim. Espere 60-80% da sua velocidade VS Code por ~2 semanas. Depois disso, ultrapassa — texto puro, sem latência GUI, atalhos rápidos. O fator decisivo é não desistir na primeira semana."
        />
        <QAItem
          q="LazyVim é 'too magic' tipo Spring Boot — perco controle?"
          a="Não. Tudo é Lua editável em ~/.config/nvim/lua/plugins/. :LazyExtras lista módulos opcionais. Você pode desinstalar LazyVim e ficar só com lazy.nvim a qualquer momento."
        />
        <QAItem
          q="Devo aprender Vimscript ainda?"
          a="Não pra config (use Lua). Sim pra ler help de comandos antigos e plugins legados. :h :command e :h pattern são essenciais — mas é só leitura."
        />
        <QAItem
          q="Neovim é mais rápido que VS Code mesmo?"
          a="Sim em medições objetivas: startup ~30ms vs ~2s, abrir arquivo de 100k linhas ~50ms vs vários segundos. Treesitter highlight é instantâneo. O custo é a curva de aprendizado."
        />
        <QAItem
          q="E se eu quiser GUI?"
          a="Neovide (Rust, GPU-rendered) ou Goneovim. Mesmo Neovim por baixo, GUI bonita com smooth scroll. Mas o terminal é o caminho idiomático."
        />
      </Section>

      <Callout tone="success" icon="🎯">
        <strong>Próximo passo</strong>: instale LazyVim hoje, force-se a usar por 1 semana
        no projeto que você está. No próximo módulo veremos Zed — o desafiante moderno
        que tenta unir produtividade Vim-like com UX gráfica em Rust nativo.
      </Callout>
    </ModuleLayout>
  );
}
