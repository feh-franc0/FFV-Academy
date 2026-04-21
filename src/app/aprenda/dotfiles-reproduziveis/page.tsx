import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('dotfiles-reproduziveis');
const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença conceitual entre chezmoi e GNU Stow?',
    options: [
      'São idênticos',
      'Stow cria symlinks de uma pasta pro $HOME (simples, zero template). chezmoi trata dotfiles como templates com variáveis por máquina, managed encrypted secrets e estado idempotente — o comando "chezmoi apply" reconcilia estado desejado com atual',
      'Stow é mais moderno',
      'chezmoi é só GUI',
    ],
    correct: 1,
    explanation: 'Stow: 90s, symlink-based, clássico. Perfeito se seus dotfiles são idênticos em todas as máquinas. chezmoi: moderno, template-aware. Resolve o problema real: mesmo ~/.gitconfig precisa de email pessoal no laptop e email corporativo no work machine. chezmoi usa Go templates, gerencia secrets via age/gpg, e "apply" é idempotente — roda N vezes, mesmo resultado.',
  },
  {
    question: 'Por que dotfiles em repo público são práticos mesmo contendo config sensível?',
    options: [
      'Não são seguros',
      'Porque segredos (tokens, chaves SSH) NUNCA vão no repo: ficam em gerenciador de segredo local (1Password CLI, age, macOS keychain) e o template injeta no apply. Repo só tem estrutura + placeholders; público permite compartilhar, clonar em máquina nova em 1 comando',
      'Porque segredos não importam',
      'Devem ser sempre privados',
    ],
    correct: 1,
    explanation: 'Dotfiles públicos famosos (Mathias Bynens, Paul Irish) foram referência da indústria. Segredo não entra no repo: chezmoi tem "chezmoi-encrypt" + age; 1Password CLI tem "op inject"; ou simplesmente .env.local fora do repo referenciado. Public repo permite aprender de outros, mostrar setup, e "git clone + chezmoi init + chezmoi apply" em 10 minutos em máquina nova.',
  },
  {
    question: 'O que significa "idempotente" nesse contexto e por que importa?',
    options: [
      'Executar uma vez só',
      'chezmoi apply pode rodar 10 vezes seguidas, resultado é o mesmo. Permite rodar em cron, em provisioning de máquina nova, depois de qualquer update — sem medo de duplicar aliases, sobrescrever config manual sem checar, ou corromper estado',
      'É um bug',
      'Sinônimo de atômico',
    ],
    correct: 1,
    explanation: 'Idempotência é pilar de infra moderna (Ansible, Terraform, Kubernetes). Aplicado a dotfiles: onboarding de máquina nova é "instalar chezmoi, init repo, apply" — e pronto. Máquina 3 meses depois: rodar apply de novo pega mudanças do repo sem duplicar. Shell scripts custom raramente são idempotentes (cat >> .zshrc rodado 5x duplica 5x). chezmoi resolve.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dotfiles-reproduziveis"
      title="Dotfiles reproduzíveis: chezmoi + GNU Stow"
      icon="📁"
      xp={50}
      readTime={12}
      trailName="DX & Developer Productivity"
      trailColor={accent}
      nextSlug="devcontainers-codespaces"
      nextTitle="Devcontainers + Codespaces: dev env efêmero"
      quiz={quiz}
    >
      <Section title="O problema" accent={accent}>
        <p>
          Máquina nova, setup de 3 dias. Máquina perdida, reconstrução de memória. Laptop pessoal e do trabalho divergem silenciosamente. Colega pergunta &quot;como você fez aquele alias?&quot; — você não lembra. Dotfiles em Git resolvem: configuração como código, versionada, portátil, reproduzível em comandos contados.
        </p>
      </Section>

      <Section title="GNU Stow — abordagem clássica" accent={accent}>
        <CodeBlock lang="bash">{`# Estrutura do repo
~/dotfiles/
├── zsh/
│   └── .zshrc           # será symlinked pra ~/.zshrc
├── git/
│   └── .gitconfig
├── vim/
│   └── .vimrc
└── starship/
    └── .config/
        └── starship.toml

# Aplicar: de dentro de ~/dotfiles
stow zsh git vim starship

# Symlinks criados:
# ~/.zshrc -> ~/dotfiles/zsh/.zshrc
# ~/.gitconfig -> ~/dotfiles/git/.gitconfig
# ~/.config/starship.toml -> ~/dotfiles/starship/.config/starship.toml

# Editar o arquivo no repo reflete imediatamente.
# stow -D zsh para remover.`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Stow é ideal quando seus dotfiles são iguais em todas as máquinas. Simples, zero dependência (Perl), funciona em qualquer Unix desde 1993.
        </Callout>
      </Section>

      <Section title="chezmoi — templates + secrets + idempotência" accent={accent}>
        <CodeBlock lang="bash">{`# Setup em máquina nova
brew install chezmoi
chezmoi init --apply fernando@github.com/dotfiles

# Estrutura gerenciada
chezmoi cd   # entra em ~/.local/share/chezmoi

# Template com variáveis por máquina
# dot_gitconfig.tmpl
[user]
  name = Fernando Franco Valle
  email = {{ .email }}
{{- if eq .chezmoi.hostname "work-mbp" }}
[url "git@github.com:empresa"]
  insteadOf = https://github.com/empresa
{{- end }}

# Variáveis definidas em ~/.config/chezmoi/chezmoi.toml
# [data]
# email = "fernando@pessoal.com"`}</CodeBlock>
      </Section>

      <Section title="Secrets sem comprometer" accent={accent}>
        <CodeBlock lang="bash">{`# Opção 1: 1Password CLI + chezmoi
# Template lê do vault em apply-time
export GITHUB_TOKEN={{ onepasswordRead "op://Private/GitHub/token" }}

# Opção 2: age encryption nativa
chezmoi encrypt ~/.secret-keys > \$(chezmoi source-path ~/.secret-keys).age
# No apply: chezmoi descripta on-the-fly

# Opção 3: macOS keychain
security find-generic-password -a "\$USER" -s "aws-key" -w

# REGRA ABSOLUTA: nada em plaintext no repo.
# chezmoi tem hook 'verify' que falha se detecta segredo exposto.`}</CodeBlock>
      </Section>

      <Section title="Onboarding de máquina nova em 10 minutos" accent={accent}>
        <CodeBlock lang="bash">{`# Bootstrap script (guardado em gist público)
#!/usr/bin/env bash
set -euo pipefail

# 1. Xcode CLT (macOS) ou build-essential (Linux)
xcode-select --install 2>/dev/null || true

# 2. Homebrew
/bin/bash -c "\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. Ferramentas base
brew install chezmoi 1password-cli git

# 4. Chezmoi aplica tudo
chezmoi init --apply fernando

# 5. Pronto. zshrc, git, editor, starship, tudo funcionando.`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Meta realista: laptop do zero → ambiente 100% funcional em menos de 20 minutos, sem toque manual em config. Isso é DX de adulto. Empresas boas entregam laptop assim em onboarding.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
