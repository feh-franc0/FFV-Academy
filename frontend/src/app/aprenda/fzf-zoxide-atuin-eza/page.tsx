import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, Kbd } from '@/components/article/primitives';

export const metadata = getModuleMetadata('fzf-zoxide-atuin-eza');

const accent = '#94a3b8';

const quiz: QuizQuestion[] = [
  { question: 'fzf é:', options: ['Editor de texto', 'Fuzzy finder universal — pipe qualquer lista para fzf e ele filtra interativamente. Atalhos integram com shell: Ctrl+R (history), Ctrl+T (files), Alt+C (cd). Usado também dentro de Vim, lazygit, etc', 'Apenas para Git', 'Linguagem'], correct: 1, explanation: 'fzf (Junegunn Choi) é "Cmd+P do VS Code para o terminal inteiro". Ctrl+R no shell vira buscador fuzzy de histórico. Integra com qualquer comando: kill $(ps | fzf). Padrão sênior 2026.' },
  { question: 'zoxide substitui:', options: ['ls', 'cd — comando z aprende diretórios visitados e permite "z proj" pular para qualquer subset do path. Sucessor moderno de autojump e z-shell-z, escrito em Rust', 'Substitui Git', 'Apenas history'], correct: 1, explanation: 'zoxide é o "smart cd". z react = pula para ~/code/work/react sem digitar path completo. Aprende frequency × recency (frecency). Lib em Rust, instala em qualquer shell.' },
  { question: 'atuin diferencia-se de history default por:', options: ['Idêntico', 'Database SQLite persistente, syncável entre máquinas, busca fulltext + filter por dir/exit-code/host/data, encryption end-to-end no sync server. Não apenas append-only.', 'Apenas mostra', 'Não persiste'], correct: 1, explanation: 'atuin (atuin.sh) revolucionou shell history. SQLite local, syncs criptografados via servidor (self-host ou cloud). Search Ctrl+R fica poderosa: filter por context, time, exit-code, machine. Para devs com múltiplas máquinas, essencial.' },
  { question: 'eza vs ls:', options: ['ls é melhor', 'eza (fork de exa, mantido em 2024+): ls colorido com icons, git status integrado, tree mode embedded, output mais legível. Drop-in replacement', 'eza é o mesmo', 'eza não funciona em Mac'], correct: 1, explanation: 'eza (eza-community.github.io/eza/) substituiu exa após exa stop. ls com features modernos: --git mostra status na listagem, --icons, --tree. Padrão moderno: alias ls=eza.' },
  { question: 'ripgrep (rg), bat, fd — qual a relação?', options: ['Sem relação', 'Trinity de substitutos modernos em Rust: ripgrep > grep (10x+ rápido, .gitignore-aware), bat > cat (syntax highlight, git diff), fd > find (sintaxe humana, .gitignore-aware). Estado-da-arte 2026', 'Linguagens', 'Apenas Mac'], correct: 1, explanation: 'Três ferramentas Rust que rebooted CLI: ripgrep (rg) — busca, bat — view file colorido, fd — find amigável. Cada uma 5-10x mais rápida que a original, com defaults sensatos (respeita .gitignore).' },
];

export default function Page() {
  return (
    <ModuleLayout slug="fzf-zoxide-atuin-eza" title="CLI essentials: fzf, zoxide, atuin, eza, ripgrep, bat, fd" icon="🔍" xp={60} readTime={12}
      trailName="DevTools & Productivity Sênior" trailColor={accent} nextSlug="ai-assisted-cli-2026" nextTitle="AI no terminal" quiz={quiz}>
      <Section title="O rebrand de CLI em Rust" accent={accent}>
        <p className="text-sm leading-6">A última década viu reescrita massiva de utilitários CLI clássicos em Rust/Go. Mais rápidos, mais ergonômicos, com defaults sensatos. Aprender e adotar = 30-40% de produtividade de terminal. As 7 essenciais:</p>
      </Section>
      <Section title="As 7 ferramentas em uma tabela" accent={accent}>
        <ComparisonTable accent={accent} headers={['Tool', 'Substitui', 'Killer feature']} rows={[
          ['fzf', '—', 'Fuzzy finder universal, integra Ctrl+R history'],
          ['zoxide (z)', 'cd', 'Pula para qualquer dir conhecido com substring'],
          ['atuin', 'history', 'Histórico SQLite syncronizável criptografado'],
          ['eza', 'ls', 'Cores + icons + git status na listagem'],
          ['ripgrep (rg)', 'grep', '10x+ rápido, respeita .gitignore'],
          ['bat', 'cat', 'Syntax highlight + line numbers + git diff'],
          ['fd', 'find', 'Sintaxe humana, .gitignore-aware'],
        ]} />
      </Section>
      <Section title="Setup completo (Mac/Linux)" accent={accent}>
        <CodeBlock lang="bash">{`# Mac (Homebrew) ou Linux (cargo/apt/dnf)
brew install fzf zoxide atuin eza ripgrep bat fd

# Configurar (zsh — ajuste para fish/bash)
# ~/.zshrc

# fzf (Ctrl+R, Ctrl+T, Alt+C)
source <(fzf --zsh)

# zoxide (z command)
eval "$(zoxide init zsh)"

# atuin (substitui Ctrl+R do shell)
eval "$(atuin init zsh)"

# eza aliases
alias ls='eza --icons --git'
alias ll='eza -lh --icons --git'
alias tree='eza --tree --icons'

# ripgrep/bat/fd usam nomes próprios
alias cat='bat'
# grep e find — opcional aliasar (pode quebrar scripts)`}</CodeBlock>
      </Section>
      <Section title="fzf em ação" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: <><Kbd>Ctrl</Kbd>+<Kbd>R</Kbd></>, v: 'Busca fuzzy no histórico' },
          { k: <><Kbd>Ctrl</Kbd>+<Kbd>T</Kbd></>, v: 'Busca files no diretório atual, insere path no comando' },
          { k: <><Kbd>Alt</Kbd>+<Kbd>C</Kbd></>, v: 'cd para diretório selecionado fuzzy' },
          { k: 'kill $(ps | fzf)', v: 'Mate processo selecionado interactively' },
          { k: 'git checkout $(git branch | fzf)', v: 'Checkout branch fuzzy' },
        ]} />
      </Section>
      <Section title="atuin sync configurado" accent={accent}>
        <CodeBlock lang="bash">{`# Sign up (self-host opcional)
atuin register -u myuser -e me@example.com

# Sync inicial
atuin import auto      # importa histórico shell existente
atuin sync

# Em outra máquina:
atuin login -u myuser
atuin sync  # baixa histórico

# Buscar com filters
atuin search --cwd /code/project --exit 0  # comandos rodados nesse dir que sucederam`}</CodeBlock>
      </Section>
      <Section title="ripgrep / fd em workflows reais" accent={accent}>
        <CodeBlock lang="bash">{`# Buscar string em codebase (respeita .gitignore)
rg "useState"                          # grep recursivo
rg "useState" --type ts                # só TypeScript
rg -i "TODO|FIXME" --type-not lock     # case-insensitive, exclui lockfiles

# Find arquivos
fd '\\.tsx$'                            # regex amigável
fd -e tsx                              # por extension
fd -e tsx -x prettier --write {}       # exec comando para cada match

# bat com syntax highlight
bat README.md
bat -A app.ts                          # mostra whitespace
git diff | bat --lang=diff         # melhor que diff plain`}</CodeBlock>
      </Section>
      <Section title="Workflow integrado" accent={accent}>
        <CodeBlock lang="bash">{`# Achar arquivo, editar
nvim $(fd -e ts | fzf)

# Buscar string, abrir arquivos com matches
fzf --preview 'bat --color=always {}' <(rg -l "useEffect")

# Histórico para clipboard
atuin search | head -1 | pbcopy

# z + fuzzy
z $(z -l | fzf | awk '{print $2}')

# Função: "abrir o último arquivo TS editado"
recent-ts() {
  fd -e ts -e tsx | xargs ls -t | head -1 | xargs nvim
}`}</CodeBlock>
      </Section>
      <Callout tone="success">Esses 7 substitutos sozinhos justificam migrar para shell moderno. Curva: ~1 semana adaptação, ganho permanente. Comece com fzf + zoxide; adicione os outros gradualmente.</Callout>
    </ModuleLayout>
  );
}
