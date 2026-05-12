import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata = getModuleMetadata('github-fluxo-profissional');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre fork e clone no GitHub?',
    options: [
      'São a mesma operação — fork é o nome no GitHub, clone é o nome no Git',
      'Fork cria uma cópia do repositório na SUA conta GitHub (servidor). Clone baixa um repositório para sua máquina local. Para contribuir com um projeto open-source: fork → clone do fork → mudanças → push no fork → PR para o original.',
      'Clone é para repositórios privados, fork é para públicos',
      'Fork copia apenas a branch main, clone copia tudo',
    ],
    correct: 1,
    explanation: 'Fork é uma operação do GitHub (não do Git puro). Cria um repositório independente na sua conta, mas com referência ao original. Você tem push access no seu fork. Clone é Git puro — baixa qualquer repositório localmente. Para projetos onde você tem acesso direto: clone direto. Para projetos de terceiros: fork + clone do fork.',
  },
  {
    question: 'O que é um "review bloqueante" vs "review de aprovação" num Pull Request?',
    options: [
      'São termos informais sem significado técnico no GitHub',
      'O GitHub tem três tipos de review: Comment (observação sem bloquear), Approve (aprova o PR), Request Changes (bloqueia o merge até o autor fazer alterações). Com branch protection rules, você pode exigir N aprovações e que nenhum "Request Changes" esteja pendente antes do merge.',
      'Review bloqueante significa que o reviewer deletou o PR',
      'Apenas admins do repositório podem fazer reviews bloqueantes',
    ],
    correct: 1,
    explanation: 'Branch protection rules no GitHub permitem configurar: N approvals necessários, dismissal de approvals quando novos commits são adicionados, required status checks (CI passou?), e bloquear force push. Com isso, o processo de review vira uma garantia técnica, não apenas uma convenção.',
  },
  {
    question: 'No GitHub Actions, o que significa `needs: [test, lint]` em um job?',
    options: [
      'O job precisa instalar as dependências test e lint',
      'O job só executa depois que os jobs "test" e "lint" completarem com sucesso. Cria uma dependência entre jobs no mesmo workflow. Se test ou lint falhar, este job é cancelado.',
      'O job executa em paralelo com test e lint',
      'É uma lista de permissões necessárias para o job rodar',
    ],
    correct: 1,
    explanation: 'GitHub Actions permite definir DAGs de jobs: `needs` cria dependências. Jobs sem `needs` rodam em paralelo automaticamente. Com `needs`, rodam em sequência. `needs: [test, lint]` significa: espere test E lint passarem antes de rodar este job. Útil para: rodar deploy apenas se CI passou.',
  },
];

export default function GithubFluxoProfissionalPage() {
  return (
    <ModuleLayout
      slug="github-fluxo-profissional"
      title="GitHub profissional: PR, review, issues, Actions básico"
      icon="🐙"
      xp={60}
      readTime={12}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="http-do-zero"
      nextTitle="HTTP do zero: request, response, status, headers, cookies"
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
        GitHub não é apenas hospedagem de código — é a plataforma de colaboração que define como equipes profissionais desenvolvem software. Pull Requests, code review e Actions automatizando CI/CD são o padrão da indústria.
      </p>

      <Section accent={accent} title="Fork vs Clone: quando usar cada um">
        <ComparisonTable
          headers={['Situação', 'Abordagem', 'Por quê']}
          rows={[
            ['Repositório onde você tem acesso', 'Clone direto', 'Push direto para o repo'],
            ['Projeto open-source de terceiros', 'Fork → clone do fork', 'Você não tem push access no original'],
            ['Experimento isolado de um projeto', 'Fork', 'Mudanças não afetam o original'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Fluxo para contribuir com open-source:

# 1. Fork no GitHub (botão Fork na interface)
# 2. Clone do SEU fork (não do original)
git clone git@github.com:SEU-USER/projeto.git
cd projeto

# 3. Adicionar o original como "upstream"
git remote add upstream git@github.com:DONO-ORIGINAL/projeto.git
git remote -v
# origin  git@github.com:SEU-USER/projeto.git (fetch)
# upstream git@github.com:DONO-ORIGINAL/projeto.git (fetch)

# 4. Manter fork atualizado com o original
git fetch upstream
git checkout main
git merge upstream/main     # ou: git rebase upstream/main

# 5. Criar branch para sua mudança
git checkout -b fix/bug-de-login

# 6. Push para SEU fork
git push origin fix/bug-de-login

# 7. Abrir PR no GitHub: seu fork → repositório original`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Pull Requests: o coração da colaboração">
        <p>
          Um Pull Request (PR) é um pedido para integrar mudanças de uma branch para outra. No GitHub, serve tanto para code review quanto para documentar o que foi feito e por quê.
        </p>
        <div className="flex flex-col gap-2">
          {[
            { title: 'Título', desc: 'Deve descrever o QUÊ foi feito em uma linha. Prefixos comuns: feat:, fix:, chore:, docs:, refactor:' },
            { title: 'Descrição', desc: 'Por que essa mudança? O que ela resolve? Como testar? Screenshots para mudanças visuais. Links para issues relacionadas.' },
            { title: 'Reviewers', desc: 'Quem deve revisar? Pelo menos alguém que conheça a área do código.' },
            { title: 'Labels', desc: 'bug, enhancement, breaking change, needs-review — facilitam filtrar e priorizar PRs.' },
            { title: 'Linked issues', desc: 'Fixes #123 ou Closes #123 na descrição fecha a issue automaticamente quando o PR for mergeado.' },
          ].map(item => (
            <div key={item.title} className="p-3 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <p className="font-semibold text-xs mb-1" style={{ color: accent }}>{item.title}</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <CodeBlock>{`# Template de PR (/github/PULL_REQUEST_TEMPLATE.md no repo)
## O que essa mudança faz?
Adiciona autenticação JWT na API. Substitui sessões em memória.

## Por quê?
Preparação para múltiplos servidores — sessões em memória não funcionam com load balancer.
Closes #89

## Como testar?
1. npm run dev
2. POST /auth/login com {"email": "test@test.com", "password": "123"}
3. Usar o token retornado no header Authorization: Bearer <token>
4. GET /profile deve retornar dados do usuário

## Checklist
- [x] Testes adicionados/atualizados
- [x] Documentação atualizada
- [ ] Migration necessária? Não`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Code Review: como dar e receber feedback">
        <p>
          Code review é uma conversa técnica, não uma auditoria. O objetivo é melhorar o código e disseminar conhecimento — não provar quem é mais esperto.
        </p>
        <CodeBlock>{`# Como dar review no GitHub:
# 1. Files Changed → ver diff completo
# 2. Click na linha → adicionar comentário inline
# 3. "Start a review" → acumula comentários antes de submeter
# 4. Submit review: Comment / Approve / Request Changes

# Tipos de comentário (boa prática nomear explicitamente):
# "nit: " — nitpick menor, pode ignorar ou não
# "suggestion: " — sugestão não-bloqueante
# "must: " — bloqueante, precisa resolver antes do merge
# "question: " — só pedindo explicação, não bloqueante

# Exemplos de comentários construtivos:
# ❌ "Isso está errado"
# ✅ "Esta query pode ter N+1 — que tal usar um JOIN aqui? [link para docs]"

# ❌ "Por que você fez assim?"
# ✅ "Tenho curiosidade sobre a escolha de X sobre Y — tem alguma razão específica?
#     Pensei que Y seria mais simples aqui."

# Ao receber review:
# - Responder cada comentário (mesmo com "feito" ou "concordo/discordo porque...")
# - Resolve conversation após resolver
# - Re-request review quando pronto`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Issues, Labels e Milestones">
        <CodeBlock>{`# Issues: rastrear bugs, features, tarefas
# Boas práticas:
# - Título descritivo: não "Bug login", sim "Login falha com email com +alias (ex: user+tag@mail.com)"
# - Reprodução mínima para bugs (OS, versão, passos exatos)
# - Expected vs Actual behavior
# - Labels para categorizar
# - Assign para responsável

# Labels úteis (criar no repo: Settings → Labels)
bug           # comportamento incorreto
enhancement   # nova funcionalidade
good first issue  # adequado para contribuintes novos
help wanted   # contribuições externas bem-vindas
breaking change  # muda API ou comportamento existente
needs-triage  # ainda não avaliado
blocked       # aguardando outra coisa

# Milestones: agrupar issues em um objetivo/release
# Settings → Milestones → New Milestone
# "v2.0 — autenticação multi-tenant" com due date
# Associar issues ao milestone → ver progresso

# Linking issues nos commits/PRs
git commit -m "fix: corrige login com email alias\n\nFixes #42"
# GitHub linkará automaticamente e fechará ao merge`}</CodeBlock>
      </Section>

      <Section accent={accent} title="GitHub Actions: CI/CD básico">
        <p>
          GitHub Actions é o sistema de automação do GitHub. Workflows são arquivos YAML em <code>.github/workflows/</code> que rodam em resposta a eventos (push, PR, schedule, etc).
        </p>
        <CodeBlock>{`# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  deploy:
    runs-on: ubuntu-latest
    needs: [lint, test]          # só roda se lint e test passaram
    if: github.ref == 'refs/heads/main'  # só na branch main
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - name: Deploy para produção
        env:
          DEPLOY_KEY: \${'$'}{{ secrets.DEPLOY_KEY }}  # segredo armazenado no repo
        run: ./scripts/deploy.sh`}</CodeBlock>
        <Callout tone="info">
          Secrets ficam em <strong>Settings → Secrets and variables → Actions</strong>. Nunca coloque senhas, tokens ou chaves diretamente no YAML — use <code>{'\${{ secrets.NOME }}'}</code>. O GitHub redacta valores de secrets nos logs automaticamente.
        </Callout>
      </Section>

      <Section accent={accent} title="Branch protection rules: tornando o processo obrigatório">
        <CodeBlock>{`# Settings → Branches → Add branch protection rule
# Branch name pattern: main (ou usar glob: release/*)

# Configurações recomendadas para equipes:
✅ Require a pull request before merging
   ✅ Require approvals: 1 (ou 2 para times maiores)
   ✅ Dismiss stale pull request approvals when new commits are pushed
   ✅ Require review from Code Owners (se tiver .github/CODEOWNERS)

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Status checks: lint, test (os jobs do CI)

✅ Require conversation resolution before merging

✅ Do not allow bypassing the above settings
   (mesmo admins precisam seguir as regras — importante!)

# CODEOWNERS: definir quem deve revisar arquivos específicos
# .github/CODEOWNERS
*.go          @time-backend
src/api/      @time-api
*.sql         @dba-team
docs/         @tech-writers`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Checklist para repositório profissional:</strong> branch protection em main, CI obrigatório para merge, PR template, CODEOWNERS, labels configurados, issue templates para bug e feature request.
      </Callout>

      <Callout>
        Próximo: <strong>HTTP do zero</strong> — o protocolo que move a web inteira: request, response, status codes, headers, cookies.
      </Callout>
    </div>
  );
}
