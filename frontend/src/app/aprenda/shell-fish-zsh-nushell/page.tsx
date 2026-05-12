import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('shell-fish-zsh-nushell');

const accent = '#94a3b8';

const quiz: QuizQuestion[] = [
  { question: 'POSIX compatibility — qual shell respeita?', options: ['Todos', 'bash e zsh são (zsh com extras compatíveis). fish NÃO é POSIX (sintaxe própria mais limpa). nushell NÃO é POSIX (pipeline de dados estruturados). Para scripts portáveis: bash/zsh. Para shell interativo: qualquer um', 'Apenas fish', 'Apenas nushell'], correct: 1, explanation: 'Diferenciação importante: scripts /bin/sh ou /bin/bash precisam ser POSIX-friendly. fish e nushell são shells interativos modernos, não substitutos de bash para scripts. Use bash/zsh para scripts, qualquer um interativo.' },
  { question: 'fish destaca-se por:', options: ['Velocidade', 'Defaults sensatos sem config — autosuggestions (Fish suggests from history), syntax highlighting embedded, abbreviations (não aliases — expand on space), tab completion contextual rica. "Just works" out of the box', 'POSIX', 'Apenas mainframe'], correct: 1, explanation: 'fish (friendly interactive shell) é o "Apple do shell" — opinionated, sem config necessária. Quem detesta configurar pode trocar e ser produtivo dia 1. Sintaxe diferente é o preço.' },
  { question: 'zsh + plugins (oh-my-zsh, zinit, starship):', options: ['Default Mac', 'zsh sozinho é zsh; oh-my-zsh adiciona framework de plugins + themes mas pesado. zinit é mais rápido (lazy load). starship é prompt cross-shell em Rust — substitui themes. Stack moderna: zsh + zinit + starship', 'Apenas oh-my-zsh', 'Pesado sempre'], correct: 1, explanation: 'oh-my-zsh é o ecosystem grande mas pesado (slow startup). zinit (znudo/zsh-snap successors) faz lazy load — startup rápido. starship (Rust) é prompt portable funcionar em qualquer shell. Stack 2026: zsh + zinit (ou direto) + starship.' },
  { question: 'nushell trabalha com:', options: ['Strings', 'Pipelines de DADOS estruturados — comandos retornam tables/records/lists, você opera com SQL-like syntax (where, select, sort-by, group-by). "PowerShell of Linux" mais ergonômico. Mais lento que bash em scripts pequenos, mas elegante para data manipulation', 'Apenas hash', 'Não pipe'], correct: 1, explanation: 'nushell (nu) é radical: ls retorna table, não texto. ls | where size > 1mb | sort-by modified. Pipeline real de dados. Curva de aprendizado nova mas paga em workflows complexos.' },
  { question: 'Starship prompt:', options: ['Só Mac', 'Prompt cross-shell em Rust, config em TOML, modules para git status, language version, AWS profile, k8s context — segmentos renderizados condicionalmente. Funciona em bash/zsh/fish/PowerShell igual. Padrão moderno', 'Lento', 'Apenas bash'], correct: 1, explanation: 'Starship (starship.rs) é o "Mantine do shell prompt" — bonito, rápido, configurável via TOML simples. Switch entre shells sem perder prompt. Default moderno.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="shell-fish-zsh-nushell" title="Shell: fish vs zsh vs nushell — qual usar em 2026" icon="🐚" xp={55} readTime={11}
      trailName="DevTools & Productivity Sênior" trailColor={accent} nextSlug="fzf-zoxide-atuin-eza" nextTitle="CLI essentials Rust" quiz={quiz}>
      <Section title="A escolha de shell" accent={accent}>
        <p className="text-sm leading-6">Você passa horas todo dia no shell. Trocar bash padrão por algo moderno é high-ROI. Três caminhos modernos: <b>fish</b> (sem config, autosuggest), <b>zsh + customização</b> (mais flexível), <b>nushell</b> (radical, dados estruturados). Cada um tem perfil ideal.</p>
      </Section>
      <Section title="Comparativo" accent={accent}>
        <ComparisonTable accent={accent} headers={['Shell', 'Curva', 'Config', 'POSIX', 'Quando']} rows={[
          ['bash', '—', 'Mínima', '✅', 'Default em servers; scripts portáveis'],
          ['zsh + zinit + starship', 'Média', 'Customização rica', '✅ (compatível)', 'Default macOS, devs sêniores'],
          ['fish', 'Baixa', 'Quase zero', '❌', 'Quem quer "just works"'],
          ['nushell', 'Alta', 'TOML', '❌', 'Data engineers, cloud admins'],
          ['PowerShell', 'Alta', 'PS1', '❌', 'Windows admin, .NET devs'],
        ]} />
      </Section>
      <Section title="fish em uma página" accent={accent}>
        <CodeBlock lang="bash">{`# Instalar
brew install fish

# Tornar default
echo /opt/homebrew/bin/fish | sudo tee -a /etc/shells
chsh -s /opt/homebrew/bin/fish

# Tudo já funciona — autosuggest, syntax highlight, tab completion

# Aliases / abbreviations (use abbr, melhor que alias)
abbr -a gco git checkout
abbr -a gst git status
# Expand on space — você vê o comando real, melhor pra aprender

# Functions (substitui shell functions tradicionais)
function mkcd
    mkdir -p $argv && cd $argv
end

# Config em ~/.config/fish/config.fish`}</CodeBlock>
      </Section>
      <Section title="zsh moderno (zinit + starship)" accent={accent}>
        <CodeBlock lang="bash">{`# ~/.zshrc minimal moderno

# zinit (plugin manager rápido)
source ~/.zinit/bin/zinit.zsh

# Sintaxe highlight + autosuggest + completions
zinit light zsh-users/zsh-autosuggestions
zinit light zsh-users/zsh-syntax-highlighting
zinit light zsh-users/zsh-completions

# History config
HISTSIZE=50000
SAVEHIST=50000
setopt INC_APPEND_HISTORY
setopt HIST_IGNORE_DUPS

# Starship prompt (cross-shell)
eval "$(starship init zsh)"

# Aliases
alias ls='eza --icons --git'
alias cat='bat'
alias find='fd'
alias grep='rg'`}</CodeBlock>
        <CodeBlock lang="toml">{`# ~/.config/starship.toml
format = """
$directory$git_branch$git_status$nodejs$python$rust$line_break$character"""

[directory]
truncation_length = 3
style = "bold cyan"

[git_branch]
symbol = "🌿 "

[character]
success_symbol = "[➜](bold green)"
error_symbol = "[➜](bold red)"`}</CodeBlock>
      </Section>
      <Section title="nushell — o radical" accent={accent}>
        <CodeBlock lang="bash">{`# Instalar
brew install nushell

# Comandos retornam DADOS, não strings
ls | where size > 1mb | sort-by modified | first 5

# Pipeline tipo SQL
ps | where cpu > 50 | sort-by mem -r | first 10

# JSON nativo
open package.json | get dependencies | columns

# CSV / Excel
open data.csv | where age > 30 | save filtered.csv

# Concatenar com SQL real (se quiser)
open events.csv | query db "SELECT * FROM input WHERE country = 'BR'"`}</CodeBlock>
        <Callout tone="info">nushell é poderoso para data wrangling no terminal. Use junto com bash/zsh — não substitua tudo dia um.</Callout>
      </Section>
      <Section title="Recomendação por perfil" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Dev senior macOS', v: 'zsh + zinit + starship — flexibilidade máxima, compatível POSIX' },
          { k: 'Quer produtividade sem config', v: 'fish — defaults sensatos' },
          { k: 'Data engineer / cloud admin', v: 'zsh primary + nushell para data tasks' },
          { k: 'SSH em servers', v: 'Manter bash/zsh local pra match servers (menos friction)' },
          { k: 'Times grandes', v: 'zsh — sintaxe próxima a bash facilita docs/scripts compartilhados' },
        ]} />
      </Section>
    </ModuleLayout>
  );
}
