import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('shell-zsh-bash-serios');
const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que scripts de produção devem usar #!/usr/bin/env bash com set -euo pipefail?',
    options: [
      'Convenção estética',
      'set -e aborta em erro, -u trata variável não-definida como erro, -o pipefail propaga falha em pipe (senão comando pipeado falha silenciosamente porque só o último exit code conta). Juntos transformam bash permissivo em bash strict',
      'Evita warning do shellcheck',
      'Só funciona no Linux',
    ],
    correct: 1,
    explanation: 'Bash default é terrivelmente permissivo: variável não existe vira string vazia, erro num pipe é ignorado, comando falha e script continua. set -euo pipefail é a primeira linha obrigatória em qualquer script sério. Adicione também IFS=$\'\\n\\t\' pra evitar bugs de word-splitting em paths com espaço. shellcheck valida o resto — rode em CI.',
  },
  {
    question: 'Qual o papel do Starship prompt cross-shell?',
    options: [
      'Só estilo visual',
      'Prompt escrito em Rust que funciona identicamente em zsh/bash/fish/pwsh, configurável via toml único, mostra contexto relevante (git branch, versão do runtime, status de comando) com latência sub-20ms. Uniformiza experiência entre dev local e SSH',
      'Alternativa ao bash',
      'Framework de plugin',
    ],
    correct: 1,
    explanation: 'Prompts elaborados em zsh puro (como powerlevel10k) são rápidos mas trancam você no zsh; oh-my-posh é legal no PowerShell mas requer .NET. Starship é single binary Rust portável: mesma config ~/.config/starship.toml no Mac, Linux, servidor, container. Latência mínima é crítica — prompt lento destrói UX. Configurável por módulo (git, kubernetes, aws profile, node version).',
  },
  {
    question: 'Qual a forma idiomática de encadear comandos com segurança em shell?',
    options: [
      'cmd1; cmd2; cmd3',
      'cmd1 && cmd2 && cmd3: segundo só roda se primeiro OK. Use || pra fallback. Em pipes, cuidado com cat arquivo | grep | sort — shellcheck pega useless use of cat. Para capturar erro em pipe, use pipefail',
      'Sempre em linha única',
      'Só com ponto-e-vírgula',
    ],
    correct: 1,
    explanation: '; executa incondicionalmente — comando 1 falha, comando 2 roda mesmo assim, erro passa despercebido. && faz short-circuit adequado. || pra fallback: cmd || echo "falhou". Pipes precisam pipefail ou retorno do penúltimo comando é perdido. Scripts de CI/CD com ; em vez de && são fonte comum de bugs silenciosos que só aparecem em produção.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="shell-zsh-bash-serios"
      title="Shell zsh/bash sérios"
      icon="💻"
      xp={50}
      readTime={12}
      trailName="DX & Developer Productivity"
      trailColor={accent}
      nextSlug="dotfiles-reproduziveis"
      nextTitle="Dotfiles reproduzíveis: chezmoi + GNU Stow"
      quiz={quiz}
    >
      <Section title="Shell é tool primário, não decoração" accent={accent}>
        <p>
          Engenheiro senior passa horas por dia no terminal: rodar testes, inspecionar logs, git, ssh, kubectl, docker. Shell produtivo — aliases úteis, prompt informativo, histórico pesquisável — multiplica output diário. Shell lento ou sujo (config desordenada, plugins conflitantes) cobra imposto invisível toda hora.
        </p>
      </Section>

      <Section title="POSIX vs bash vs zsh" accent={accent}>
        <CodeBlock lang="bash">{`# POSIX sh (/bin/sh): subset mínimo, portável universal
# Use pra scripts que rodam em Alpine, BusyBox, sistemas mínimos.
# Não tem arrays, [[ ]], processo substitution.

# bash: superset POSIX, padrão de facto em Linux desde 90s
# Tem arrays, [[ ]], <( ), =~, readarray, mapfile
# Shebang: #!/usr/bin/env bash

# zsh: padrão no macOS desde Catalina, superset com QoL
# Globs melhores (**), param expansion rica, tipagem leve
# Ideal pra shell interativo. Scripts portáveis: use bash.

# Regra prática:
# - Scripts em repo: bash com set -euo pipefail + shellcheck CI
# - Shell interativo pessoal: zsh com starship
# - Container minimal: POSIX sh`}</CodeBlock>
      </Section>

      <Section title="Scripts bash strict mode" accent={accent}>
        <CodeBlock lang="bash">{`#!/usr/bin/env bash
set -euo pipefail
IFS=$'\\n\\t'

# -e  : aborta em erro (exit code != 0)
# -u  : variável não-definida é erro, não string vazia
# -o pipefail : falha em pipe propaga

# Exemplo do bug que pipefail resolve:
# curl bad-url | grep important  # exit 0 sem pipefail!
# Com pipefail, exit do curl aparece.

deploy() {
  local env="\${1:?env obrigatório: staging|prod}"
  local tag="\${2:-latest}"

  echo "deploy env=\$env tag=\$tag"
  docker pull "myapp:\$tag"
  kubectl -n "\$env" set image deploy/app app="myapp:\$tag"
  kubectl -n "\$env" rollout status deploy/app --timeout=3m
}

deploy "\$@"`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Rode <code>shellcheck</code> em CI. Pega 90% dos bugs sutis: word-splitting em paths com espaço, aspas faltando, useless use of cat, exit codes ignorados.
        </Callout>
      </Section>

      <Section title="Starship + ferramentas modernas" accent={accent}>
        <CodeBlock lang="bash">{`# Instalar ferramentas modernas (Rust/Go, rápidas, cross-platform)
brew install starship fzf ripgrep fd bat eza zoxide jq yq

# ~/.zshrc (essencial)
eval "\$(starship init zsh)"
eval "\$(zoxide init zsh)"   # z em vez de cd, aprende frequência
eval "\$(fzf --zsh)"          # Ctrl-R pesquisável, Ctrl-T arquivo

alias ls='eza --icons --group-directories-first'
alias ll='eza -l --icons --git'
alias cat='bat --paging=never --style=plain'
alias grep='rg'
alias find='fd'

# ~/.config/starship.toml
# format = ...custom modules
# [git_branch] style = "bold purple"
# [kubernetes] disabled = false`}</CodeBlock>
      </Section>

      <Section title="Funções úteis no dia-a-dia" accent={accent}>
        <CodeBlock lang="bash">{`# Pular pra diretório git root
alias gr='cd "$(git rev-parse --show-toplevel)"'

# Matar processo por porta
killport() {
  lsof -ti :"$1" | xargs -r kill -9
}

# Backup rápido antes de experimento
bak() {
  cp -a "$1" "$1.bak-$(date +%Y%m%d-%H%M%S)"
}

# Extrair JSON de log
alias jl='jq -r .'

# Grep colorido com contexto
alias g='rg --context 2 --smart-case'

# Exit codes last command (útil em pipeline)
alias lec='echo "$?"'`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Sinal de shell maduro: qualquer máquina que você entra (via SSH, container, colega) você consegue trabalhar — porque os fundamentos POSIX e bash strict mode funcionam em qualquer lugar, não dependem das suas customizações locais.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
