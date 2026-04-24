import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata = getModuleMetadata('git-de-verdade');

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o staging area (index) do Git e por que ele existe?',
    options: [
      'É onde o Git guarda o histórico de commits',
      'É uma camada intermediária entre o working directory e o repositório. Permite construir commits precisos: você pode adicionar partes de um arquivo (`git add -p`), manter outras mudanças fora do commit, e revisar exatamente o que vai ser commitado com `git diff --staged`.',
      'É um servidor remoto onde o código é armazenado',
      'É o mesmo que o diretório .git/',
    ],
    correct: 1,
    explanation: 'O staging area (também chamado de index) é o que diferencia Git de outros VCS. Enquanto SVN commitava "tudo que mudou", Git te dá controle granular: você escolhe exatamente quais mudanças entram em cada commit. `git add -p` (ou `--patch`) permite selecionar hunks individuais dentro de um arquivo.',
  },
  {
    question: 'Qual a diferença fundamental entre `git merge` e `git rebase`?',
    options: [
      'Merge é mais rápido que rebase',
      'Merge preserva o histórico real — cria um commit de merge com dois pais. Rebase reescreve o histórico — move os commits para um novo ponto base, criando commits novos com os mesmos changes mas SHAs diferentes. Merge = não-destrutivo; Rebase = reescrita de histórico.',
      'Rebase é para branches locais, merge é para branches remotas',
      'São equivalentes — apenas sintaxes diferentes para a mesma operação',
    ],
    correct: 1,
    explanation: 'Regra de ouro do rebase: nunca faça rebase de branches que outros já baixaram (push -f é sinal de perigo). Use rebase para limpar histórico local antes do merge/push. Use merge para integrar branches públicas — preserva o "o que realmente aconteceu". Muitas equipes usam: rebase local + merge (ou squash merge) para main.',
  },
  {
    question: 'Você fez `git reset --hard HEAD~3` acidentalmente. Como recuperar os commits perdidos?',
    options: [
      'Os commits são irrecuperáveis — precisa reescrever',
      'Use `git reflog` para encontrar o SHA do commit antes do reset, depois `git reset --hard SHA` ou `git checkout -b recuperado SHA`. O reflog mantém registro de todos os movimentos do HEAD por 90 dias.',
      'Use `git revert` para desfazer o reset',
      'Use `git stash pop` para recuperar o código',
    ],
    correct: 1,
    explanation: 'O reflog (reference log) é a rede de segurança do Git. Mantém histórico de para onde HEAD apontou, mesmo após resets, rebases e amends. `git reflog` lista as entradas, `git reset --hard SHA` restaura. Objetos Git são mantidos até o garbage collector rodar (~90 dias por padrão para refs não referenciadas).',
  },
];

export default function GitDeVerdadePage() {
  return (
    <ModuleLayout
      slug="git-de-verdade"
      title="Git de verdade: commit, branch, merge, rebase, reflog"
      icon="🌿"
      xp={80}
      readTime={16}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="github-fluxo-profissional"
      nextTitle="GitHub profissional: PR, review, issues, Actions básico"
      relatedSlugs={['github-actions-cicd','github-fluxo-profissional','docker-completo']}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Git é o sistema de controle de versão mais usado do mundo — e também o mais mal-entendido. A maioria aprende os comandos sem entender o modelo mental subjacente. Quando você entende o que Git realmente armazena, tudo faz sentido: merge, rebase, reset, cherry-pick viram operações previsíveis.
      </p>

      <Section accent={accent} title="O que Git realmente armazena: objetos e o DAG">
        <p>
          Git não armazena <em>diffs</em> — armazena <strong>snapshots</strong>. Cada commit é uma foto completa do projeto naquele momento. Git é eficiente porque objetos idênticos (mesmo conteúdo → mesmo hash SHA-1) são armazenados apenas uma vez.
        </p>
        <p>
          Existem 4 tipos de objetos no Git:
        </p>
        <CodeBlock>{`# Blob — conteúdo de um arquivo (sem nome, sem permissão)
git cat-file -p a1b2c3   # mostra conteúdo de um blob

# Tree — diretório (lista de blobs e outras trees com nomes e permissões)
# 100644 blob a1b2c3   README.md
# 100755 blob d4e5f6   script.sh
# 040000 tree 789abc   src/

# Commit — aponta para uma tree + metadados + referências ao(s) pai(s)
# tree 789abc...
# parent def012...   ← SHA do commit anterior
# author Fernando ...
# committer Fernando ...
# (linha em branco)
# Mensagem do commit

# Tag — aponta para um commit com anotação

# O histórico é um DAG (Directed Acyclic Graph) de commits:
#   A ← B ← C ← D (main)
#               ↖
#             E ← F (feature)
# D e F são a mesma base C. Após merge: A ← B ← C ← D ← G
#                                                   ↗
#                                             E ← F`}</CodeBlock>
        <CodeBlock>{`# Explorar os objetos internamente
git log --oneline --graph --all   # visualiza o DAG
git cat-file -t SHA               # tipo do objeto (blob/tree/commit/tag)
git cat-file -p SHA               # conteúdo do objeto
ls .git/objects/                  # os arquivos físicos no disco`}</CodeBlock>
      </Section>

      <Section accent={accent} title="As três áreas do Git">
        <CodeBlock>{`# Working Directory → Staging Area (Index) → Repository (.git/)

# Estado das mudanças
git status                    # resumo das três áreas
git diff                      # working directory vs staging area
git diff --staged             # staging area vs último commit
git diff HEAD                 # working directory vs último commit

# Movendo mudanças para staging
git add arquivo.txt           # adiciona arquivo inteiro
git add src/                  # adiciona diretório
git add -p                    # interativo: seleciona hunks (partes) a adicionar
git add -A                    # todos os arquivos (novos, modificados, deletados)

# Commit: salva staging no repositório
git commit -m "feat: adiciona autenticação JWT"
git commit --amend            # modifica o ÚLTIMO commit (não use se já fez push)
git commit -v                 # abre editor com o diff completo visível

# Desfazendo staging (sem perder mudanças)
git restore --staged arquivo.txt   # retira do staging, mantém no working dir
git reset HEAD arquivo.txt         # equivalente (forma antiga)

# Desfazendo mudanças no working directory (DESTRUTIVO)
git restore arquivo.txt            # descarta mudanças locais (irrecuperável)
git checkout -- arquivo.txt        # equivalente (forma antiga)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Branches: são só ponteiros para commits">
        <p>
          Uma branch no Git é literalmente um arquivo de texto com 40 caracteres: o SHA do commit que ela aponta. Criar uma branch é instantâneo — não copia nada. HEAD é um ponteiro para a branch atual (ou diretamente para um commit, "detached HEAD state").
        </p>
        <CodeBlock>{`# Criar e navegar branches
git branch feature/auth           # cria branch no commit atual
git checkout feature/auth         # muda para ela
git checkout -b feature/auth      # cria E muda (atalho)
git switch -c feature/auth        # forma moderna (Git 2.23+)

# Ver branches
git branch                        # branches locais
git branch -r                     # branches remotas
git branch -a                     # todas
git branch -v                     # com último commit de cada

# Deletar branch
git branch -d feature/auth        # deleta se já mergeada
git branch -D feature/auth        # força delete (mesmo sem merge)

# Renomear
git branch -m nome-novo           # renomeia branch atual
git branch -m nome-velho nome-novo

# Mudar de branch (com mudanças em andamento)
git stash                         # salva mudanças temporariamente
git switch outra-branch
git stash pop                     # recupera as mudanças`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Merge vs Rebase: qual escolher">
        <ComparisonTable
          headers={['Aspecto', 'git merge', 'git rebase']}
          rows={[
            ['Histórico', 'Preserva — cria commit de merge', 'Reescreve — commits novos com mesmos changes'],
            ['Resultado', 'Commit com 2 pais (não-linear)', 'Histórico linear'],
            ['Conflitos', 'Resolve uma vez no merge commit', 'Resolve em cada commit rebased'],
            ['Seguro para push', 'Sempre', 'Somente para branches não compartilhadas'],
            ['Quando usar', 'Integrar branches públicas (main)', 'Limpar histórico local antes do push'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# MERGE — preserva histórico real
git checkout main
git merge feature/auth
# Cria: main → ... → merge-commit (tem dois pais: ultimo-main e ultimo-feature)

# REBASE — reescreve o histórico da feature sobre main
git checkout feature/auth
git rebase main
# Move commits da feature para após o último commit do main
# Os commits da feature são NOVOS (SHAs diferentes), mas com os mesmos changes

# MERGE SQUASH — todos os commits da feature viram 1 commit só em main
git checkout main
git merge --squash feature/auth
git commit -m "feat: autenticação JWT (squash de 5 commits)"
# Útil para manter main com histórico limpo

# INTERACTIVE REBASE — editar, reordenar, squash, fixup commits
git rebase -i HEAD~5    # edita últimos 5 commits
# pick   SHA1  commit 1     → manter
# squash SHA2  commit 2     → juntar com anterior
# fixup  SHA3  commit 3     → juntar sem preservar mensagem
# reword SHA4  commit 4     → mudar mensagem
# drop   SHA5  commit 5     → deletar`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Reflog: a rede de segurança do Git">
        <p>
          O reflog registra para onde HEAD aponta a cada operação. É local (não vai para o remote) e mantém objetos por ~90 dias. É o que salva quando você faz reset --hard acidentalmente.
        </p>
        <CodeBlock>{`# Ver o reflog
git reflog              # últimas ~100 entradas do HEAD
git reflog show main    # reflog de uma branch específica

# Saída típica:
# abc1234 HEAD@{0}: reset: moving to HEAD~3
# def5678 HEAD@{1}: commit: feat: adiciona login
# ghi9012 HEAD@{2}: commit: fix: corrige validação
# jkl3456 HEAD@{3}: checkout: moving from main to feature/auth

# RECUPERAR após reset --hard acidental
git reflog              # encontra SHA antes do reset
git reset --hard def5678   # volta para lá
# ou: criar nova branch naquele ponto
git checkout -b recuperado def5678

# RECUPERAR commit que nunca foi commitado em nenhuma branch
git fsck --lost-found   # lista dangling objects
ls .git/lost-found/     # blobs e commits "perdidos"`}</CodeBlock>
        <Callout tone="info">
          <code>git stash</code> também aparece no reflog como <code>stash@{0}</code>. Se fizer <code>git stash drop</code> por acidente, <code>git stash show stash@{0}</code> e <code>git stash apply stash@{0}</code> podem recuperar se o objeto ainda não foi coletado.
        </Callout>
      </Section>

      <Section accent={accent} title="Operações avançadas do dia-a-dia">
        <CodeBlock>{`# cherry-pick: aplicar um commit específico em outra branch
git checkout main
git cherry-pick abc1234   # aplica as mudanças desse commit em main

# Desfazer um commit de forma segura (não-destrutivo)
git revert abc1234        # cria um novo commit que desfaz as mudanças

# Bisect: encontra qual commit introduziu um bug (busca binária)
git bisect start
git bisect bad            # commit atual tem o bug
git bisect good v2.1.0    # esta versão estava OK
# Git faz checkout automático de commits intermediários
# Você testa e informa: git bisect good / git bisect bad
git bisect reset          # termina

# Tags: marcar releases
git tag v1.0.0            # tag leve (só aponta para commit)
git tag -a v1.0.0 -m "Release 1.0.0"  # tag anotada (com metadados)
git push origin v1.0.0    # tags não sobem com push padrão
git push origin --tags    # sobe todas as tags

# Stash avançado
git stash push -m "WIP: auth endpoint"  # com nome
git stash list            # lista todos os stashes
git stash apply stash@{2} # aplica sem remover da lista
git stash pop             # aplica e remove`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Regras que evitam desastres:</strong> (1) Nunca force-push em branches compartilhadas. (2) Antes de reset --hard, crie uma branch no ponto atual. (3) Se perdeu algo, cheque git reflog antes de entrar em pânico. (4) Commits pequenos e focados — mais fácil de reverter e entender.
      </Callout>

      <Callout>
        Próximo: <strong>GitHub profissional</strong> — Pull Requests, code review, issues, e GitHub Actions para CI/CD básico.
      </Callout>
    </div>
  );
}
