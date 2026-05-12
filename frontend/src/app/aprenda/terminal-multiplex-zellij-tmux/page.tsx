import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, CodeBlock, ComparisonTable, KeyValue, Kbd } from '@/components/article/primitives';

export const metadata = getModuleMetadata('terminal-multiplex-zellij-tmux');

const accent = '#94a3b8';

const quiz: QuizQuestion[] = [
  { question: 'tmux vs Zellij — diferença principal:', options: ['Idênticos', 'tmux: C, 20+ anos battle-tested, config em ~/.tmux.conf (Bourne-shell-like), padrão para SSH/persistence remoto. Zellij: Rust moderno (2020+), layouts default sensatos, plugins WASM, foco em UX. tmux ainda manda em SSH/server; Zellij ganha em workstation', 'tmux não funciona', 'Zellij é pago'], correct: 1, explanation: 'tmux é a "vi/emacs" de multiplexer — tudo lá, mas curva de aprendizado. Zellij vem com keybinds visíveis (status bar), layouts pré-prontos, plugins WASM. Para SSH em servidor remoto, tmux ainda preferred (compatibilidade); para local, Zellij é mais ergonômico.' },
  { question: 'Sessions vs Windows vs Panes:', options: ['Tudo igual', 'Session: container persistente (sobrevive a SSH disconnect). Window: tab dentro de session. Pane: split dentro de window. Você reattach a uma session, abre múltiplas windows, splits em panes', 'Apenas tabs', 'Apenas sessions'], correct: 1, explanation: 'Hierarquia: tmux session contains windows; windows contain panes. Session é a unidade de persistência (você reattach). Window é organização (uma por projeto/contexto). Pane é split tela.' },
  { question: 'tmuxinator / tmuxp serve para:', options: ['Substituir tmux', 'Project layouts versionáveis em YAML — define windows/panes/comandos por projeto, recreate com um comando. Útil para "abro projeto X → automaticamente terminal de dev server + logs + git status + vim"', 'Apenas para Mac', 'Configuração tmux'], correct: 1, explanation: 'tmuxinator (Ruby) e tmuxp (Python) automatizam setup. .tmuxinator/myproject.yml define o layout; mux myproject recria. Equivalente do Zellij: layouts em ~/.config/zellij/layouts/*.kdl' },
  { question: 'Atalhos mais úteis tmux:', options: ['Aleatórios', 'Prefix por default Ctrl+B (alguns mudam para Ctrl+A): prefix+c (new window), prefix+, (rename), prefix+% (split vertical), prefix+" (split horizontal), prefix+d (detach), prefix+s (list sessions), prefix+z (zoom pane)', 'Sem atalhos', 'Apenas mouse'], correct: 1, explanation: 'Esses 6-8 atalhos cobrem 90% do uso diário. Custom prefix Ctrl+A em ~/.tmux.conf comum (não conflita com Ctrl+B do shell editline).' },
  { question: 'Zellij plugins WASM:', options: ['Não existem', 'Plugins escritos em Rust/Go/JS compilados para WASM, rodam sandboxed. Permitem extensões custom (status-bar component, file-picker, AI assistant). Lançou em 2024, ecossistema crescendo', 'Apenas em Java', 'Apenas oficial'], correct: 1, explanation: 'Zellij innova com plugins WASM sandboxed — você compila Rust/Go/JS para WASM e Zellij carrega. Permite customização poderosa sem fork. Ecossistema ainda jovem mas promissor.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="terminal-multiplex-zellij-tmux" title="Terminal multiplex: tmux clássico vs Zellij moderno" icon="🪟" xp={55} readTime={11}
      trailName="DevTools & Productivity Sênior" trailColor={accent} nextSlug="shell-fish-zsh-nushell" nextTitle="Shell: fish vs zsh vs nushell" quiz={quiz}>
      <Section title="Por que terminal multiplexer importa" accent={accent}>
        <p className="text-sm leading-6">Em SSH, sua sessão morre quando rede cai → tudo perdido. Multiplexer = session persistente no servidor. Local, organiza workspace: dev server em uma pane, logs em outra, git em outra. Sem clicar Cmd+T cem vezes.</p>
      </Section>
      <Section title="tmux vs Zellij — escolha" accent={accent}>
        <ComparisonTable accent={accent} headers={['Aspecto', 'tmux', 'Zellij']} rows={[
          ['Idade', '2007+', '2020+'],
          ['Linguagem', 'C', 'Rust'],
          ['Config', '~/.tmux.conf (shell-like)', '~/.config/zellij/config.kdl (KDL)'],
          ['Atalhos visíveis?', 'Não — você decora', 'Sim, status bar mostra'],
          ['Layouts default', 'Vazio', 'compact, classic, pré-prontos'],
          ['Plugins', 'TPM (Tmux Plugin Manager)', 'WASM nativo'],
          ['SSH/remote', '✅ Padrão universal', '⚠️ Funciona, menos onipresente'],
          ['Curva de aprendizado', 'Íngreme', 'Suave'],
        ]} />
      </Section>
      <Section title="tmux essentials" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Prefix default', v: <><Kbd>Ctrl</Kbd>+<Kbd>B</Kbd> (mude para <Kbd>Ctrl</Kbd>+<Kbd>A</Kbd> em config)</> },
          { k: 'Nova window', v: <>prefix + <Kbd>c</Kbd></> },
          { k: 'Split vertical', v: <>prefix + <Kbd>%</Kbd></> },
          { k: 'Split horizontal', v: <>prefix + <Kbd>&quot;</Kbd></> },
          { k: 'Detach', v: <>prefix + <Kbd>d</Kbd></> },
          { k: 'Reattach', v: 'tmux attach -t session_name' },
          { k: 'List sessions', v: 'tmux ls' },
          { k: 'Kill session', v: 'tmux kill-session -t name' },
          { k: 'Zoom pane', v: <>prefix + <Kbd>z</Kbd></> },
          { k: 'Copy mode', v: <>prefix + <Kbd>[</Kbd></> },
        ]} />
      </Section>
      <Section title="~/.tmux.conf recomendado" accent={accent}>
        <CodeBlock lang="bash">{`# Prefix muda para Ctrl+A
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Mouse on
set -g mouse on

# Vim mode em copy
setw -g mode-keys vi

# Splits com letras mais memoráveis
unbind %
bind | split-window -h
unbind '"'
bind - split-window -v

# Reload config
bind r source-file ~/.tmux.conf \\; display "Reloaded!"

# Status bar
set -g status-bg colour234
set -g status-fg white
set -g status-left "[#S] "
set -g status-right "%H:%M %d-%b-%y"

# Plugins (TPM)
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-resurrect'  # restaura sessions após reboot
set -g @plugin 'tmux-plugins/tmux-continuum'  # auto-save sessions

run '~/.tmux/plugins/tpm/tpm'`}</CodeBlock>
      </Section>
      <Section title="Zellij — começa pronto" accent={accent}>
        <CodeBlock lang="bash">{`# Instalar
brew install zellij  # Mac
cargo install --locked zellij

# Rodar — atalhos visíveis na status bar
zellij

# Layouts pré-prontos
zellij --layout compact   # mínimo
zellij --layout default

# Layout custom (KDL)
# ~/.config/zellij/layouts/dev.kdl
layout {
  pane size=1 borderless=true { plugin location="zellij:tab-bar"; }
  pane split_direction="vertical" {
    pane name="editor" command="nvim"
    pane split_direction="horizontal" {
      pane name="shell"
      pane name="server" command="npm" { args "run"; "dev"; }
    }
  }
}

zellij --layout dev`}</CodeBlock>
      </Section>
      <Section title="Quando escolher cada" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Trabalha muito em SSH', v: 'tmux (universalmente instalado em servers)' },
          { k: 'Workstation local primária', v: 'Zellij (ergonomia visual)' },
          { k: 'Time em equipe, share configs', v: 'tmux (curva conhecida)' },
          { k: 'Quer aprender rápido', v: 'Zellij (status bar guia)' },
          { k: 'Pareamento remoto', v: 'tmux (tmate baseado em tmux para pair)' },
        ]} />
      </Section>
    </ModuleLayout>
  );
}
