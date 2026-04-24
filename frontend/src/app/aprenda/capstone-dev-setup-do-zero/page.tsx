import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-dev-setup-do-zero');
const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que cronometrar de fato o setup (não "achar que é rápido") é importante?',
    options: [
      'Vaidade',
      'Cronometrar revela gaps reais: comandos manuais esquecidos, interações GUI necessárias, prompts inesperados, passos fora do script. Meta < 20min força automatizar o que "parecia fácil" e expõe a diferença entre "teoria" e "prático"',
      'Não importa',
      'É só exibição',
    ],
    correct: 1,
    explanation: 'Setup que você acha "20min" na prática leva 2h na primeira vez: Xcode license prompt, GitHub 2FA, SSH keys, permissions, senhas do 1Password, rede corporativa, VPN pré-instalação. Cronômetro expõe cada fricção. Iterar até chegar sob 20min real em máquina virgem é exercício que produz script de valor — usável no onboarding do time.',
  },
  {
    question: 'O que deve estar no script bootstrap e o que deve estar no chezmoi apply?',
    options: [
      'Tudo no script',
      'Bootstrap (bash curto): instalar Xcode CLT, Homebrew, 1Password CLI, chezmoi. chezmoi apply: dotfiles, aliases, instalar Brewfile (todas as ferramentas), configurar languages via asdf/mise, SSH keys via op inject. Separação torna bootstrap reutilizável e chezmoi versionável',
      'Tudo no chezmoi',
      'Não importa divisão',
    ],
    correct: 1,
    explanation: 'Bootstrap é mínimo irredutível: precisa existir antes do chezmoi rodar. 10 linhas de bash, publicado em gist com URL curta. chezmoi apply faz o trabalho grande: ler Brewfile, instalar tudo, escrever config, baixar plugins. Divisão correta: bootstrap estável anos a fio; chezmoi evolui com o seu gosto. Nunca misture — Brewfile dentro do bootstrap é anti-padrão.',
  },
  {
    question: 'Qual o entregável final que prova o capstone?',
    options: [
      'Só o código',
      'Vídeo ou asciinema de 20min mostrando máquina virgem → ambiente funcional (teste real: clona repo, roda npm dev, funciona) + repositório público dos dotfiles + README explicando bootstrap. Demonstra domínio real, não só documentação',
      'Post blog',
      'Slide deck',
    ],
    correct: 1,
    explanation: 'Dotfiles em repo público + bootstrap.sh em gist + asciinema ou screencast mostrando do zero ao funcional. Próximo dev contratado clona e roda — em 20min produtivo. Artefato vira portfólio: recrutador DevOps/platform engineer vê e reconhece senioridade imediatamente. Bônus: README honesto listando gotchas descobertos e o que ainda é manual.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-dev-setup-do-zero"
      title="Capstone: dev setup do zero em 20min"
      icon="🏁"
      xp={80}
      readTime={18}
      trailName="DX & Developer Productivity"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Em laptop virgem (ou VM macOS/Linux limpa), chegue de zero a ambiente de desenvolvimento 100% funcional — código clonado, testes rodando, build passando — em menos de 20 minutos. Zero toques manuais além de senhas obrigatórias. Artefato: repositório público de dotfiles + bootstrap script + screencast cronometrado.
        </p>
      </Section>

      <Section title="Entregáveis" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone DX — Checklist

## 1. Bootstrap script
- [ ] Gist público com URL curta
- [ ] Instala Xcode CLT / build-essential
- [ ] Instala Homebrew (macOS) ou equivalente (Linux)
- [ ] Instala: git, chezmoi, 1password-cli
- [ ] Faz chezmoi init --apply do seu repo
- [ ] Idempotente: rodar 2x não quebra

## 2. Dotfiles repo público
- [ ] chezmoi-compatible
- [ ] Brewfile com todas as ferramentas
- [ ] .zshrc / .bashrc com aliases e starship
- [ ] .gitconfig templatizado por máquina
- [ ] .tmux.conf ou .config/zellij
- [ ] .config para ferramentas (fzf, bat, eza, ripgrep)
- [ ] VS Code settings.json e extensions.txt
- [ ] Zero segredos em plaintext

## 3. Language managers
- [ ] asdf ou mise configurado
- [ ] Versions lockadas em .tool-versions por repo
- [ ] Node, Python, Go, Rust instalados via manager

## 4. Teste real de chegada
- [ ] Clona repo de projeto real
- [ ] npm install / poetry install roda limpo
- [ ] Testes passam
- [ ] Build produz artefato
- [ ] Editor (VS Code ou Neovim) abre com LSP ativo

## 5. Artefatos de prova
- [ ] Screencast ou asciinema do setup completo
- [ ] Cronômetro visível (< 20min)
- [ ] README com gotchas honestos
- [ ] Link pros repos no perfil GitHub`}</CodeBlock>
      </Section>

      <Section title="Bootstrap script de referência" accent={accent}>
        <CodeBlock lang="bash">{`#!/usr/bin/env bash
# bootstrap.sh — coloque em gist, use URL curta
set -euo pipefail

echo "🚀 FFV dev bootstrap starting..."

# 1. Xcode CLT (macOS) — prompt GUI inevitável
if [[ "\$OSTYPE" == "darwin"* ]]; then
  xcode-select --install 2>/dev/null || true
  until xcode-select -p &>/dev/null; do sleep 5; done
fi

# 2. Homebrew
if ! command -v brew &>/dev/null; then
  /bin/bash -c "\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  eval "\$(/opt/homebrew/bin/brew shellenv)"
fi

# 3. Ferramentas base (mínimo pra chezmoi funcionar)
brew install chezmoi 1password-cli git gh

# 4. Login rápido no 1Password CLI (pra injetar secrets)
op signin || true

# 5. chezmoi aplica dotfiles + Brewfile + tudo mais
chezmoi init --apply github.com/\$GITHUB_USER/dotfiles

echo "✅ Bootstrap concluído. Reinicie o shell."`}</CodeBlock>
      </Section>

      <Section title="Brewfile como fonte de verdade de ferramentas" accent={accent}>
        <CodeBlock lang="ruby">{`# ~/.local/share/chezmoi/dot_Brewfile (gerenciado por chezmoi)

# CLI essencial
brew "git"
brew "gh"
brew "jq"
brew "yq"
brew "curl"
brew "wget"

# Shell moderno
brew "starship"
brew "fzf"
brew "ripgrep"
brew "fd"
brew "bat"
brew "eza"
brew "zoxide"

# Editor
brew "neovim"
cask "visual-studio-code"

# Runtime managers
brew "mise"  # substitui asdf + direnv

# Containers e k8s
brew "docker"
brew "kubectl"
brew "helm"

# Productivity
brew "tmux"
brew "zellij"

# Fonts
cask "font-jetbrains-mono-nerd-font"

# Aplicar: brew bundle --file ~/.Brewfile
# chezmoi faz isso no run_onchange_brew_bundle.sh`}</CodeBlock>
      </Section>

      <Section title="Teste final de aceitação" accent={accent}>
        <CodeBlock lang="bash">{`# Em VM/máquina virgem, cronômetro ligado:
time (curl -fsSL https://gist.github.com/you/bootstrap.sh | bash)

# Critério passou:
# [ ] < 20min de wall-clock
# [ ] Terminal abre com starship + aliases
# [ ] git clone pessoal funciona (SSH keys OK)
# [ ] VS Code abre com extensions instaladas
# [ ] LSP ativo em arquivo .ts (autocomplete funciona)
# [ ] docker ps roda
# [ ] kubectl version conecta (se aplicável)

# Se falhou um critério: documente gotcha no README,
# ajuste script/chezmoi, rode novamente em VM fresh.`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Engenheiro platform/DevOps que mantém dotfiles públicos e setup reproduzível é reconhecido instantaneamente. Vale mais que certificação no LinkedIn — é prova funcional de rigor. Este capstone é cartão de visita durável.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
