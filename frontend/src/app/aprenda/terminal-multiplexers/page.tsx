import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('terminal-multiplexers');
const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual problema tmux resolve que "abrir várias abas do terminal" não resolve?',
    options: [
      'Organização visual',
      'Sessões persistentes sobreviventes à desconexão: SSH cai, rede muda, laptop fecha — tmux detach mantém processos rodando no servidor, attach retoma exatamente onde parou. Essencial em dev remoto e servidores long-running',
      'Cores',
      'Só reinicia processos',
    ],
    correct: 1,
    explanation: 'Abrir abas é local ao emulador; se fecha terminal, processos morrem. tmux (ou screen/zellij) roda como daemon no host: você pode dar Ctrl+b d (detach), disconnectar SSH, voltar em 1h — ssh de volta, tmux attach, tudo exatamente como deixou. Build de 2h rodando, log de prod, script experimental — nunca mais você perde porque VPN caiu.',
  },
  {
    question: 'Zellij vs tmux em 2026 — quando escolher zellij?',
    options: [
      'Nunca',
      'Zellij tem UX modelo "descobrível" (menu de atalhos visível, layouts declarativos em KDL, plugins em WASM, sessions-as-config), latência baixa escrito em Rust. tmux vence onde ubiquidade importa (em qualquer servidor Unix há 10 anos; zellij precisa instalar)',
      'Sempre',
      'Só em macOS',
    ],
    correct: 1,
    explanation: 'zellij (2021+) é reimaginação moderna: status bar mostra atalhos contextuais (elimina cheat sheet mental), layouts em arquivo KDL versionáveis, plugin system em WASM, tabs/panes com UX de IDE. tmux é plato-padrão Unix: está em qualquer máquina, Vim-like bindings decorados, enorme acervo de plugins via TPM. Muitos usam zellij local, tmux em servidores alheios.',
  },
  {
    question: 'Qual é a regra de ouro de workflow tmux/zellij em dev remoto?',
    options: [
      'Abra sessão nova sempre',
      'Uma sessão nomeada por projeto/contexto (session "ffv", "client-x", "infra"), N janelas dentro dela por subtarefa (code, tests, logs), attach/detach conforme muda de foco. Nunca perde estado entre conexões, produtividade real em ssh/VPN instável',
      'Use só panes',
      'Evite nomes',
    ],
    correct: 1,
    explanation: 'Anti-padrão: criar sessão anônima cada vez (tmux new → perde o track). Padrão pro: tmux new -s ffv criando sessão nomeada; windows por contexto; tmux a -t ffv para reattach. Quando VPN cai, ssh volta, tmux a -t ffv e está como antes. Em servidor compartilhado, cada dev tem sessão própria. Scripts: tmuxinator ou .tmux.conf para layouts automáticos; zellij tem layouts KDL nativos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="terminal-multiplexers"
      title="Terminal multiplexers: tmux, zellij"
      icon="🪟"
      xp={45}
      readTime={11}
      trailName="DX & Developer Productivity"
      trailColor={accent}
      nextSlug="capstone-dev-setup-do-zero"
      nextTitle="Capstone: dev setup do zero em 20min"
      quiz={quiz}
    >
      <Section title="Por que multiplexer é essencial" accent={accent}>
        <p>
          Três cenários obrigatórios: (1) SSH em servidor — queda de rede mata a sessão se não há multiplexer; (2) múltiplas janelas de trabalho (logs, testes, editor, shell) organizadas em uma tela; (3) compartilhar sessão com colega (pair programming remoto). Dev backend/DevOps sem multiplexer é dev com a mão atada.
        </p>
      </Section>

      <Section title="tmux essencial" accent={accent}>
        <CodeBlock lang="bash">{`# Instalar
brew install tmux

# Conceito: sessões > janelas > panes
# Prefix default: Ctrl+b (muita gente remapeia pra Ctrl+a)

# Criar sessão nomeada
tmux new -s ffv

# Dentro da sessão (após Ctrl+b):
#   c    criar janela nova
#   n/p  próxima/anterior janela
#   ,    renomear janela
#   "    split horizontal
#   %    split vertical
#   arrows  mover entre panes
#   x    fechar pane
#   d    detach (mantém rodando)
#   [    modo scroll (q pra sair)

# Listar sessões
tmux ls

# Reattach
tmux a -t ffv

# Matar sessão
tmux kill-session -t ffv`}</CodeBlock>
      </Section>

      <Section title="~/.tmux.conf recomendado" accent={accent}>
        <CodeBlock lang="bash">{`# Remap prefix pra Ctrl+a (mais ergonômico)
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Base 1 (index começa em 1, não 0)
set -g base-index 1
setw -g pane-base-index 1

# Mouse (scroll, resize, select)
set -g mouse on

# Reload config
bind r source-file ~/.tmux.conf \\; display "Config reloaded"

# Splits mantendo CWD
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# Vim-style navigation
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# Status bar limpa
set -g status-style "bg=default,fg=white"
set -g status-right "#[fg=cyan]%H:%M #[fg=yellow]%d-%b"`}</CodeBlock>
      </Section>

      <Section title="zellij: UX moderna" accent={accent}>
        <CodeBlock lang="bash">{`brew install zellij
zellij    # abre com status bar de atalhos visível

# Defaults:
#   Ctrl+p   modo pane
#   Ctrl+t   modo tab
#   Ctrl+s   modo scroll
#   Ctrl+o   modo session
#   Ctrl+q   quit

# Layouts declarativos (KDL)
# ~/.config/zellij/layouts/dev.kdl
# layout {
#   pane split_orientation="vertical" {
#     pane command="nvim"
#     pane split_orientation="horizontal" {
#       pane command="npm" { args "run" "dev" }
#       pane
#     }
#   }
# }

zellij --layout dev

# Plugins em WASM:
# - status-bar (default)
# - tab-bar
# - compact-bar
# - custom plugins possíveis`}</CodeBlock>
      </Section>

      <Section title="Workflow completo com pair remoto" accent={accent}>
        <CodeBlock lang="bash">{`# Pair programming com tmate (fork tmux com share)
brew install tmate
tmate
# → gera link tmate.io/x/abc123 — colega entra com ssh
# Mesma sessão, ambos digitam. Ideal pra onboarding remoto.

# Ou tmux nativo em servidor compartilhado
# Usuário A: tmux new -s pair
# Usuário B: tmux a -t pair
# (mesmo usuário Unix ou socket -S /tmp/shared)

# Para gravação:
asciinema rec demo.cast  # grava terminal como texto
asciinema play demo.cast # replay

# Combina bem: tmux sessão longa + asciinema pra snippets específicos`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Uma tarde aprendendo tmux/zellij é o melhor ROI de produtividade devops. Sessões persistentes + splits + status line = experiência de workstation completa via single SSH. Vale investir.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
