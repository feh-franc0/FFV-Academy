import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  KeyValue,
  StackFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('github-actions-cicd');

const ACCENT = '#2496ed';

const quiz: QuizQuestion[] = [
  {
    question:
      'Por que OIDC (OpenID Connect) é melhor que colocar AWS_ACCESS_KEY_ID em GitHub Secrets?',
    options: [
      'Porque OIDC roda mais rápido',
      'Porque OIDC gera credenciais temporárias (STS) por execução, sem segredo estático no repo. Se um workflow vazar logs, não há chave permanente para ser roubada',
      'Porque GH Secrets tem limite de tamanho',
      'Porque OIDC não precisa de IAM',
    ],
    correct: 1,
    explanation:
      'OIDC federa a identidade do workflow com AWS/Azure/GCP via trust policy. A cada run o GitHub emite um JWT assinado, o cloud provider valida (conferindo repo, branch, environment) e devolve credenciais temporárias de sessão. Zero segredo estático — rotação automática, revogação imediata mudando só a IAM role.',
  },
  {
    question:
      'Qual é a diferença prática entre um workflow, um job e uma step?',
    options: [
      'São sinônimos',
      'Workflow é o arquivo YAML (um evento). Job é uma unidade paralelizável que roda em um runner. Step é um comando ou uma action dentro de um job, executada sequencialmente no mesmo runner',
      'Job e workflow são iguais, só muda o nome',
      'Step roda em paralelo, job em série',
    ],
    correct: 1,
    explanation:
      'A hierarquia é: Workflow → Jobs (paralelos por default, dependem via needs) → Steps (sequenciais no mesmo runner). Entender isso muda como você estrutura o pipeline: paralelize jobs independentes (test + lint), e use needs + outputs para orquestrar (build → deploy).',
  },
  {
    question:
      'Você usa `uses: actions/checkout@v4` em 40 workflows. Por que isso ainda é um risco de supply-chain?',
    options: [
      'Não é risco nenhum — actions oficiais são imutáveis',
      '@v4 é uma tag móvel. Um atacante que comprometa o repo da action (ou um mantenedor) pode mover v4 para um commit malicioso. O mitigante é pinar por SHA (@SHA) e revisar antes de atualizar',
      'Todo workflow precisa de @master',
      'Tags são sempre imutáveis no Git',
    ],
    correct: 1,
    explanation:
      'Tags e branches no Git podem ser movidos. SHA de commit é criptograficamente imutável. Actions de terceiros (e idealmente as oficiais em projetos críticos) devem ser pinadas por SHA: `uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1`. Ferramentas como Dependabot ou pin-github-action automatizam.',
  },
  {
    question:
      'Seu build Node de 8 min caiu pra 2 min com cache. Mas em prod o build continua 8 min. Qual a causa mais provável?',
    options: [
      'Cache quebrou globalmente',
      'Branch prod faz push diferente — cache no GH Actions é escopado por branch (com fallback); se a key muda ou o branch não herda o cache, o hit não acontece',
      'Node 20 é mais lento em prod',
      'Runners do GH são aleatórios',
    ],
    correct: 1,
    explanation:
      'Cache no GH Actions é escopado por branch. O branch que pede cache procura (1) key exata; (2) restore-keys em ordem; (3) fallback no branch default. Se a key inclui hash de package-lock que mudou ou restore-keys estão errados, você perde o cache. Debug: abrir Actions → Caches no repo pra ver o que existe e com que key.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="github-actions-cicd"
      title="GitHub Actions: CI/CD profissional do zero"
      icon="🐙"
      xp={90}
      readTime={20}
      trailName="DevOps & Containers"
      trailColor={ACCENT}
      nextSlug="jenkins-pipelines"
      nextTitle="Jenkins Pipelines: o CI/CD da era enterprise"
      relatedSlugs={['docker-completo','kubernetes-completo','claude-code-primeiros-passos']}
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
        CI/CD é o sistema que transforma &ldquo;push no main&rdquo; em &ldquo;versão rodando em produção&rdquo; sem ninguém arrastar
        arquivo por SSH. <strong>Integração contínua (CI)</strong> roda testes, lint, build e scanners a cada commit.{' '}
        <strong>Entrega contínua (CD)</strong> pega o artefato aprovado e publica em staging/prod. GitHub Actions é a
        implementação nativa do GitHub: workflows em YAML, runners hospedados (ou self-hosted), ecossistema enorme de actions
        reutilizáveis, e integração profunda com PRs, issues, releases. Para projetos que vivem no GitHub, é o caminho default
        — barato (2.000 min/mês grátis em repos privados pessoais, ilimitado em públicos) e fácil de começar.
      </p>

      <Section title="Por que CI/CD existe" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Feedback rápido', v: 'Teste quebra em 3 min, não em 3 dias quando QA abre o tíquete. Bug barato = bug corrigido rápido.' },
            { k: 'Reprodutibilidade', v: 'Build roda igual no runner limpo — sem "na minha máquina funciona".' },
            { k: 'Integração contínua', v: 'Branches longos morrem. Todo dia junta no main, com merge pequeno e revisado.' },
            { k: 'Deploy sem drama', v: 'Release passa a ser "PR merged → pipeline empurra", não "sexta 18h Fernando precisa ficar".' },
            { k: 'Auditoria', v: 'Cada deploy tem commit, timestamp, autor, logs. Compliance e rollback ficam simples.' },
          ]}
        />
      </Section>

      <Section title="Anatomia de um workflow" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '📂', label: '.github/workflows/*.yml', sub: 'arquivo', detail: 'Um ou mais YAMLs. Nome do arquivo vira nome do workflow na UI.', connector: 'evento dispara' },
            { icon: '⚡', label: 'on: [push, pull_request, schedule, ...]', sub: 'trigger', detail: 'push, PR, cron, manual (workflow_dispatch), release, issue etc.', connector: 'agenda jobs' },
            { icon: '🧱', label: 'jobs', sub: 'paralelo', detail: 'Unidades de trabalho. Rodam em paralelo por default; use needs para ordenar.', connector: 'aloca runner' },
            { icon: '🖥️', label: 'runs-on: ubuntu-latest', sub: 'runner', detail: 'VM efêmera do GitHub (Linux/Mac/Win) ou self-hosted seu.', connector: 'executa' },
            { icon: '🔢', label: 'steps', sub: 'sequencial', detail: 'Comandos (run:) ou actions (uses:) executados em ordem no mesmo runner.' },
          ]}
        />
        <CodeBlock lang="yaml">{`# .github/workflows/ci.yml — o menor workflow útil
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --ci
      - run: npm run build`}</CodeBlock>
      </Section>

      <Section title="Jobs em paralelo + needs (o mapa real de um pipeline)" accent={ACCENT}>
        <p>
          Jobs independentes devem rodar em paralelo. O <InlineCode>needs</InlineCode> declara dependência — o deploy só começa
          quando test + lint + build terminam com sucesso.
        </p>
        <CodeBlock lang="yaml">{`jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        with: { text: coverage, path: coverage/ }

  build:
    needs: [lint, test]          # só roda se lint E test passarem
    runs-on: ubuntu-latest
    outputs:
      image: \${'$'}{{ steps.meta.outputs.image }}
    steps:
      - uses: actions/checkout@v4
      - id: meta
        run: echo "image=ghcr.io/\${'$'}{{ github.repository }}:\${'$'}{{ github.sha }}" >> "$GITHUB_OUTPUT"
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${'$'}{{ github.actor }}
          password: \${'$'}{{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: \${'$'}{{ steps.meta.outputs.image }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: staging         # ativa gate de aprovação se configurado
    steps:
      - run: echo "Deploying \${'$'}{{ needs.build.outputs.image }}"`}</CodeBlock>
      </Section>

      <Section title="Matrix builds — testar em N versões sem duplicar YAML" accent={ACCENT}>
        <CodeBlock lang="yaml">{`jobs:
  test:
    runs-on: \${'$'}{{ matrix.os }}
    strategy:
      fail-fast: false           # não derruba os outros se um falhar
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20, 22]
        include:
          - os: ubuntu-latest
            node: 20
            coverage: true       # só essa combinação sobe coverage
        exclude:
          - os: windows-latest
            node: 18              # não suportamos essa combinação
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: \${'$'}{{ matrix.node }} }
      - run: npm ci
      - run: npm test
      - if: matrix.coverage
        uses: codecov/codecov-action@v4`}</CodeBlock>
        <Callout tone="info">
          Matrix × 3 OS × 3 Node = 9 jobs em paralelo. Em repo público você paga zero. Em privado isso consome minutos rápido —
          use <InlineCode>fail-fast</InlineCode> com cuidado e restrinja a matrix no branch <InlineCode>main</InlineCode>.
        </Callout>
      </Section>

      <Section title="Secrets e OIDC — a parte mais crítica de segurança" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Abordagem', 'Como funciona', 'Risco']}
          rows={[
            ['Static secret', 'AWS_ACCESS_KEY_ID fixo em Settings → Secrets', 'Alto — chave permanente, rotação manual, vaza no log se você der echo'],
            ['OIDC Federation', 'GitHub assina JWT por run; cloud valida trust policy e emite STS temporário', 'Baixo — credencial vive só durante o run, trust policy amarra a repo/branch/env'],
            ['Reusable workflow + env', 'Secrets centralizados em um único ponto, herdado via secrets: inherit', 'Médio — melhor que espalhar, ainda estático'],
            ['HashiCorp Vault / AWS Secrets Manager', 'Action busca segredo em runtime', 'Baixo — quando OIDC não existe para o provider'],
          ]}
        />
        <CodeBlock lang="yaml">{`# OIDC para AWS (zero static keys)
permissions:
  id-token: write          # <<< necessário pra emitir o JWT OIDC
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-deployer
          role-session-name: gha-\${'$'}{{ github.run_id }}
          aws-region: us-east-1
      - run: aws s3 sync ./dist s3://meu-bucket --delete`}</CodeBlock>
        <Callout tone="success">
          Para habilitar OIDC na AWS: criar um Identity Provider do tipo OIDC apontando para{' '}
          <InlineCode>token.actions.githubusercontent.com</InlineCode>, criar uma IAM Role com{' '}
          <em>trust policy</em> restrita a <InlineCode>repo:me/meu-repo:ref:refs/heads/main</InlineCode>. Assim essa role
          <em> só</em> pode ser assumida por workflows desse repo, nesse branch. Se um fork fizer PR, não consegue deploy.
        </Callout>
        <Callout tone="danger">
          Nunca ecoe segredo. <InlineCode>run: echo $SECRET</InlineCode> = segredo em log em texto claro. GitHub faz mask de
          segredos declarados, mas derivados (base64, JSON encoded) passam batido. Use <InlineCode>::add-mask::</InlineCode> ou
          evite qualquer print.
        </Callout>
      </Section>

      <Section title="Cache — transforme build de 8min em 2min" accent={ACCENT}>
        <p>
          <InlineCode>actions/cache</InlineCode> salva pastas entre runs. A chave (<InlineCode>key</InlineCode>) determina
          se há <em>hit</em>. A boa prática: colocar um hash do lockfile na key e definir restore-keys em cascata.
        </p>
        <CodeBlock lang="yaml">{`- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: \${'$'}{{ runner.os }}-node-\${'$'}{{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${'$'}{{ runner.os }}-node-

# Melhor ainda: use o cache embutido do setup-node (atrás é actions/cache)
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'     # detecta package-lock.json e cacheia ~/.npm`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Cache de imagem Docker', v: 'Use type=gha no buildx (cache-from: type=gha, cache-to: type=gha,mode=max). Cache de layers direto nos artifacts do GH.' },
            { k: 'Cache de dependência', v: 'npm → ~/.npm, pnpm → ~/.pnpm-store, pip → ~/.cache/pip, cargo → ~/.cargo + target/, gradle → ~/.gradle.' },
            { k: 'Invalidação', v: 'Key com hash do lockfile invalida quando deps mudam. restore-keys pega cache de commit anterior se key exata não existe.' },
          ]}
        />
      </Section>

      <Section title="Reusable workflows — DRY em escala" accent={ACCENT}>
        <p>
          Copiar o mesmo workflow em 30 repos é receita para drift. <strong>Reusable workflows</strong> são workflows chamados
          por outros workflows com <InlineCode>uses:</InlineCode> — parametrizáveis com <InlineCode>inputs</InlineCode> e{' '}
          <InlineCode>secrets</InlineCode>.
        </p>
        <CodeBlock lang="yaml">{`# org/.github/.github/workflows/build-and-push.yml  (o "definido")
on:
  workflow_call:
    inputs:
      image-name:
        required: true
        type: string
      platforms:
        default: 'linux/amd64'
        type: string
    secrets:
      REGISTRY_TOKEN:
        required: true

jobs:
  build-push:
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: \${'$'}{{ inputs.image-name }}:\${'$'}{{ github.sha }}
          platforms: \${'$'}{{ inputs.platforms }}
          cache-from: type=gha
          cache-to: type=gha,mode=max`}</CodeBlock>
        <CodeBlock lang="yaml">{`# no repo que consome:
jobs:
  build:
    uses: minha-org/.github/.github/workflows/build-and-push.yml@v1
    with:
      image-name: ghcr.io/minha-org/minha-api
      platforms: 'linux/amd64,linux/arm64'
    secrets:
      REGISTRY_TOKEN: \${'$'}{{ secrets.GITHUB_TOKEN }}`}</CodeBlock>
        <Callout tone="info">
          Versione reusable workflows com tag (<InlineCode>@v1</InlineCode>, <InlineCode>@v2</InlineCode>). Mudanças breaking só
          num major novo. Pin por SHA em repos regulados.
        </Callout>
      </Section>

      <Section title="Environments, protection rules e approvals" accent={ACCENT}>
        <p>
          <strong>Environments</strong> (Settings → Environments) são grupos lógicos (staging, prod) com regras:{' '}
          <em>required reviewers</em>, <em>wait timer</em>, <em>deployment branches</em>, e secrets próprios. Quando um job
          tem <InlineCode>environment: prod</InlineCode>, a execução pausa até reviewers aprovarem.
        </p>
        <CodeBlock lang="yaml">{`jobs:
  deploy-prod:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.meusite.com    # aparece na UI
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::111:role/prod-deployer
          aws-region: us-east-1
      - run: ./scripts/deploy.sh prod`}</CodeBlock>
      </Section>

      <Section title="Release automatizado com semantic versioning" accent={ACCENT}>
        <CodeBlock lang="yaml">{`name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        id: rp
        with:
          release-type: node        # lê commits convencionais e cria PR de release
    outputs:
      release_created: \${'$'}{{ steps.rp.outputs.release_created }}
      tag_name: \${'$'}{{ steps.rp.outputs.tag_name }}

  build-and-publish:
    needs: release-please
    if: needs.release-please.outputs.release_created == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, registry-url: 'https://registry.npmjs.org' }
      - run: npm ci
      - run: npm run build
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: \${'$'}{{ secrets.NPM_TOKEN }}`}</CodeBlock>
        <Callout tone="success">
          <strong>Provenance (<InlineCode>--provenance</InlineCode>):</strong> o npm registra no Sigstore que aquele pacote veio
          desse workflow, desse SHA. Consumidores podem verificar — quebra categoria inteira de ataque de supply chain.
        </Callout>
      </Section>

      <Section title="Deploy em Kubernetes — fluxo completo" accent={ACCENT}>
        <CodeBlock lang="yaml">{`name: Deploy

on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  build:
    uses: ./.github/workflows/build-and-push.yml
    with:
      image-name: ghcr.io/me/api
    secrets: inherit

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::111:role/eks-deployer
          aws-region: us-east-1

      - name: Setup kubectl + kubeconfig
        run: |
          aws eks update-kubeconfig --name prod-cluster --region us-east-1
          kubectl version --client

      - name: Apply manifests com image atualizada
        run: |
          cd k8s/
          kustomize edit set image api=ghcr.io/me/api:\${'$'}{{ github.sha }}
          kubectl apply -k .
          kubectl rollout status deploy/api --timeout=5m

      - name: Smoke test
        run: |
          ENDPOINT=$(kubectl get ing api -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
          curl -fsS "https://$ENDPOINT/health" || exit 1`}</CodeBlock>
      </Section>

      <Section title="Self-hosted runners — quando usar" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'GitHub-hosted', 'Self-hosted']}
          rows={[
            ['Setup', 'Zero — já existe', 'Você provisiona VM/K8s + instala agent'],
            ['Custo', 'Grátis em públicos; minutos pagos em privados', 'Seus recursos (VM, K8s) + operação'],
            ['Segurança', 'VM descartada após cada job', 'Você garante isolamento entre jobs'],
            ['Custom tooling', 'Instala a cada run (lento)', 'Imagem pré-configurada — rápido'],
            ['Rede privada', 'Não acessa sua VPC/on-prem', 'Acessa — runner está na sua rede'],
            ['Quando usar', 'Default para 95% dos casos', 'On-prem, builds GPU, compliance, caches pesados'],
          ]}
        />
        <Callout tone="warn">
          <strong>Nunca</strong> rode self-hosted runner em repo público sem configurar &ldquo;fork pull request approval&rdquo;.
          Fork pode rodar código arbitrário no runner — é o equivalente a dar shell root em sua máquina para qualquer um do mundo.
        </Callout>
      </Section>

      <Section title="Supply chain: pinning, least privilege, scanners" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Pin por SHA', v: 'uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1 — tag é móvel, SHA não é.' },
            { k: 'Dependabot para actions', v: '.github/dependabot.yml com package-ecosystem: "github-actions" — Dependabot atualiza pins automaticamente.' },
            { k: 'permissions: restritivas', v: 'Começa com permissions: {} no topo do workflow e vai adicionando só o necessário (contents: read, packages: write).' },
            { k: 'GITHUB_TOKEN granular', v: 'Token default tem menos escopo se permissions é declarado. Workflow sem declaração herda permissões antigas (amplas) — perigoso.' },
            { k: 'CodeQL / Trivy / Snyk', v: 'SAST e scan de dependência no próprio workflow. CodeQL é nativo do GitHub (Security tab).' },
            { k: 'Secret scanning', v: 'Push protection bloqueia commit com segredo conhecido. Habilite em Settings → Security.' },
          ]}
        />
        <CodeBlock lang="yaml">{`permissions:
  contents: read     # default mínimo

jobs:
  release:
    permissions:
      contents: write         # cria tag/release
      id-token: write         # OIDC
      packages: write         # publica no GHCR
      # nada mais`}</CodeBlock>
      </Section>

      <Section title="Debugging prático" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Re-run com debug', v: 'UI: Re-run jobs → Enable debug logging. Adiciona ACTIONS_RUNNER_DEBUG e ACTIONS_STEP_DEBUG.' },
            { k: 'tmate — shell remoto', v: 'Step com mxschmitt/action-tmate@v3 abre shell SSH num runner vivo — útil para debugar Windows ou passos misteriosos.' },
            { k: 'act — rodar local', v: 'nektos/act simula workflows no Docker. Não 100% fiel, mas salva muito tempo.' },
            { k: 'Logs por step', v: 'Cada step tem artifacts de log; upload-artifact pra guardar coverage/screenshots do Playwright.' },
          ]}
        />
      </Section>

      <Section title="Decisão: GH Actions vs Jenkins vs Azure DevOps" accent={ACCENT}>
        <DecisionBox
          scenario="Startup de 10 devs, tudo no GitHub"
          winner="GitHub Actions"
          winnerColor={ACCENT}
          why="Zero setup, integração nativa com PR/issues, OIDC pra cloud. Custo baixo, curva rasa. Migrar depois se crescer de verdade."
          alternatives={[{ name: 'Jenkins', note: 'overkill e custo operacional alto.' }]}
        />
        <DecisionBox
          scenario="Empresa enterprise, repos distribuídos em Bitbucket/GitLab/GitHub, compliance apertado"
          winner="Jenkins (ou GitLab CI se tudo é GitLab)"
          winnerColor={ACCENT}
          why="Jenkins é plataforma-agnóstica, roda on-prem, plugin pra qualquer coisa, shared libraries organizam padrão comum. Cobra em sofrimento operacional, mas atende requisitos que GH Actions não cumpre."
          alternatives={[{ name: 'GH Actions Enterprise Server', note: 'se o norte é consolidar tudo no GitHub.' }]}
        />
        <DecisionBox
          scenario="Time Microsoft, cloud Azure, integração com Azure AD e Boards"
          winner="Azure DevOps Pipelines"
          winnerColor={ACCENT}
          why="Integração nativa com Azure (service connections, environments, AKS), governança com Azure AD groups, Boards + Repos + Pipelines no mesmo produto."
          alternatives={[{ name: 'GH Actions', note: 'Microsoft empurra pra lá em projetos novos — migração eventual.' }]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Workflow passou local no act mas falha no GitHub. Por quê?"
          a={
            <>
              act usa imagens Docker que não batem 100% com runners reais. Coisas que divergem: ferramentas pré-instaladas,
              versão de sudo, montagem de <InlineCode>GITHUB_WORKSPACE</InlineCode>, secrets. Use act pra iterar rápido, mas
              valide sempre no runner real antes de declarar pronto.
            </>
          }
        />
        <QAItem
          q="Como fazer um workflow rodar só quando certas pastas mudam?"
          a={
            <>
              <InlineCode>on.push.paths</InlineCode> e <InlineCode>on.pull_request.paths</InlineCode> aceitam glob. Ex.:{' '}
              <InlineCode>paths: [&apos;apps/api/**&apos;, &apos;.github/workflows/ci-api.yml&apos;]</InlineCode>. Útil em monorepos pra não rodar CI da API quando só o frontend muda.
            </>
          }
        />
        <QAItem
          q="Posso compartilhar uma action que escrevi entre repos?"
          a="Sim. Crie repo próprio com action.yml na raiz. Outros repos consomem com uses: me/minha-action@v1. Use composite actions pra empacotar vários steps YAML, JavaScript actions pra lógica complexa, Docker actions pra quando precisa de ambiente específico."
        />
        <QAItem
          q="Tem como cancelar runs antigas quando um novo push chega?"
          a={
            <>
              <InlineCode>concurrency: {'{'} group: ci-${'{{ github.ref }}'}, cancel-in-progress: true {'}'}</InlineCode>. Cada
              branch tem grupo próprio; novo push no mesmo branch cancela o run anterior. Economiza minutos e evita deploy de
              versão já desatualizada.
            </>
          }
        />
        <QAItem
          q="Workflows em monorepo com 20 apps ficam lentos. Como otimizar?"
          a="Três técnicas: (1) paths filter por app; (2) reusable workflow por linguagem/tipo de app; (3) detector de mudanças (dorny/paths-filter) que dispara jobs dinâmicos. Em escala real, nx/turbo/bazel + cache remoto resolvem mais do que YAML tuning."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) Workflow = arquivo YAML, jobs = paralelos, steps = sequenciais no mesmo runner.
        (2) <InlineCode>needs</InlineCode> orquestra; <InlineCode>outputs</InlineCode> comunica entre jobs. (3) OIDC &gt; static
        secrets — trust policy amarra a repo/branch/env. (4) Cache via <InlineCode>setup-*</InlineCode> ou{' '}
        <InlineCode>actions/cache</InlineCode> com key baseada no lockfile. (5) Reusable workflows para DRY em escala —
        versione com tag ou SHA. (6) Environments + protection rules = gate de aprovação real. (7) Pin por SHA em actions
        sensíveis, declare <InlineCode>permissions</InlineCode> mínimos, use Dependabot. (8) Próximo salto: deploy em K8s com
        OIDC + kubectl + smoke test pós-rollout.
      </Callout>
    </div>
  );
}
