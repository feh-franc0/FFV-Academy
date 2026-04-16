import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'Azure DevOps Pipelines: CI/CD na Microsoft Cloud — FFV Academy',
  description:
    'Azure Pipelines em PT-BR: YAML pipelines, stages, environments, approvals, service connections, variable groups, templates e deploy em AKS + App Service com gate.',
};

const ACCENT = '#0078d4';

const quiz: QuizQuestion[] = [
  {
    question:
      'Por que stages são o conceito-chave em Azure Pipelines, e não apenas jobs?',
    options: [
      'São sinônimos',
      'Stage é a unidade de promoção (build → test → stage → prod), cada um com seu environment e approvals. Jobs rodam dentro de um stage em um ou mais agents. Para um gate humano entre staging e prod, você precisa de stages — não dá pra fazer só com jobs',
      'Jobs não existem no Azure',
      'Stages rodam sempre em paralelo',
    ],
    correct: 1,
    explanation:
      'O modelo é Pipeline → Stages → Jobs → Steps. Stages representam fases de entrega e conectam a Environments (com approvals, checks, histórico de deploy). Sem stages, você perde a UI de rollout e o rastro de aprovação. Pipelines com jobs só sem stages é padrão antigo.',
  },
  {
    question:
      'Qual a diferença entre Variable Group e Pipeline Variable?',
    options: [
      'São a mesma coisa, só nome diferente',
      'Pipeline Variable vive no YAML (ou UI) de uma pipeline; Variable Group vive na Library, é compartilhado entre pipelines, integra com Azure Key Vault e separa secrets de valores normais',
      'Variable Group só aceita string',
      'Pipeline Variable é criptografado, Variable Group não',
    ],
    correct: 1,
    explanation:
      'Variable Groups centralizam valores (conn string, feature flags, API keys) compartilhados entre pipelines, com link direto pro Azure Key Vault (valores nunca aparecem na UI). Aprovações e permissões vivem no Group. Pipeline Variables são locais ao YAML — bom pra coisas efêmeras, ruim pra segredos cross-pipeline.',
  },
  {
    question:
      'Qual o risco prático de usar Service Connection com Service Principal de long-lived secret em 2026?',
    options: [
      'Nenhum — é o padrão',
      'Credencial estática vive no Azure DevOps; rotação é manual e se o secret vaza, atacante consegue acesso direto ao recurso. O padrão moderno é Workload Identity Federation (OIDC), que gera token por execução sem segredo armazenado',
      'Service Principal foi descontinuado',
      'Só funciona em Azure Government',
    ],
    correct: 1,
    explanation:
      'Workload Identity Federation (WIF) permite que o Azure DevOps autentique na Azure AD via OIDC — pipeline emite token assinado, Azure valida trust (org + project + pipeline) e devolve credencial de sessão. Zero secret estático, zero rotação manual. É o equivalente do OIDC no GitHub Actions, e já é o default recomendado pela Microsoft.',
  },
  {
    question:
      'Templates em Azure Pipelines servem pra quê?',
    options: [
      'Só decoração visual',
      'Parametrizar YAML reutilizável entre pipelines e repositórios (steps, jobs, stages, variáveis). Você evita copiar 200 linhas em 30 pipelines — muda o template, muda todo mundo que consome',
      'Criar pipelines visualmente',
      'Configurar agents',
    ],
    correct: 1,
    explanation:
      'Templates são YAML com parâmetros e expressões. O equivalente de "reusable workflow" do GH Actions ou "shared library" do Jenkins. Você referencia com `extends:` (template-type full pipeline) ou `template:` (fragmento) e pode fixar versão (ref de branch/tag) do repo que hospeda — padrão profissional pra governar dezenas de pipelines em uma org.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="azure-devops-pipelines"
      title="Azure DevOps Pipelines: CI/CD na Microsoft Cloud"
      icon="🔷"
      xp={80}
      readTime={18}
      trailName="DevOps & Containers"
      trailColor={ACCENT}
      nextSlug="rancher-multicluster"
      nextTitle="Rancher: gerenciando múltiplos clusters K8s sem sofrer"
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
        Azure DevOps é o guarda-chuva da Microsoft com 5 produtos: <strong>Boards</strong> (kanban/scrum),{' '}
        <strong>Repos</strong> (Git hosting), <strong>Pipelines</strong> (CI/CD), <strong>Test Plans</strong> (QA),{' '}
        <strong>Artifacts</strong> (package registry). Este módulo foca em <strong>Azure Pipelines</strong> — o motor de CI/CD,
        que evoluiu de &ldquo;classic pipelines&rdquo; (UI clicada) para <strong>YAML pipelines</strong> versionados no repo.
        Se seu stack é Microsoft (Azure AD, AKS, App Service, SQL Server), ou seu time já usa Azure Boards/Repos, é o caminho
        de menor atrito. A Microsoft também tem GitHub (compram em 2018), então GH Actions é a aposta estratégica de longo
        prazo — mas Azure Pipelines continua tendo diferenciais fortes em gate de aprovação, governança e integração com Azure.
      </p>

      <Section title="Azure DevOps em 30 segundos" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Organization', v: 'Top-level. Corresponde a uma empresa ou unidade.' },
            { k: 'Project', v: 'Dentro da org. Tem Repos, Boards, Pipelines, Artifacts próprios.' },
            { k: 'Agent Pool', v: 'Conjunto de workers que executam pipelines. Microsoft-hosted (Linux/Win/Mac) ou Self-hosted.' },
            { k: 'Service Connection', v: 'Credencial para serviços externos: Azure, AWS, Docker registry, Kubernetes, SonarCloud.' },
            { k: 'Environment', v: 'Alvo de deploy (staging, prod). Tem approvals, checks, histórico.' },
            { k: 'Library', v: 'Variable Groups + Secure Files + ligação com Key Vault.' },
          ]}
        />
      </Section>

      <Section title="Estrutura de um pipeline YAML" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '📄', label: 'azure-pipelines.yml', sub: 'root do repo', detail: 'Trigger + variables + stages. Versionado junto do código.', connector: 'evento' },
            { icon: '🎯', label: 'trigger / pr / schedules', sub: 'when', detail: 'branches, paths, schedules (cron), pull_request.', connector: 'executa' },
            { icon: '🏛️', label: 'stages', sub: 'fases', detail: 'Build → Test → Deploy_Staging → Deploy_Prod. Cada um com seu environment.', connector: 'contém' },
            { icon: '🧩', label: 'jobs', sub: 'paralelo', detail: 'Unidades que rodam em um agent. dependsOn orquestra.', connector: 'roda' },
            { icon: '🔢', label: 'steps', sub: 'sequencial', detail: 'script, task, checkout, template. Em ordem no mesmo agent.' },
          ]}
        />
        <CodeBlock lang="yaml">{`# azure-pipelines.yml — pipeline real de uma API Node
trigger:
  branches:
    include: [main, release/*]
  paths:
    exclude: [docs/*, README.md]

pr:
  branches:
    include: [main]

variables:
  - group: 'shared-config'          # Variable Group da Library
  - name: NODE_VERSION
    value: '20.x'

pool:
  vmImage: 'ubuntu-latest'

stages:
  - stage: Build
    jobs:
      - job: build_test
        displayName: 'Build & Test'
        steps:
          - task: NodeTool@0
            inputs: { versionSpec: $(NODE_VERSION) }

          - task: Cache@2
            inputs:
              key: 'npm | "$(Agent.OS)" | package-lock.json'
              restoreKeys: |
                npm | "$(Agent.OS)"
              path: $(Pipeline.Workspace)/.npm

          - script: npm ci --cache $(Pipeline.Workspace)/.npm
            displayName: 'Install deps'

          - script: npm run lint
            displayName: 'Lint'

          - script: npm test -- --ci --coverage
            displayName: 'Test'

          - task: PublishTestResults@2
            condition: succeededOrFailed()
            inputs: { testResultsFiles: 'junit.xml' }

          - task: PublishCodeCoverageResults@2
            inputs:
              summaryFileLocation: 'coverage/cobertura-coverage.xml'

          - script: npm run build
          - publish: dist
            artifact: app`}</CodeBlock>
      </Section>

      <Section title="Deploy em AKS com stage + approval" accent={ACCENT}>
        <CodeBlock lang="yaml">{`- stage: Deploy_Staging
  dependsOn: Build
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  variables:
    - group: aks-staging           # conn string, KV secrets
  jobs:
    - deployment: deploy_aks
      environment: 'staging.aks'   # environment com approval/checks
      strategy:
        runOnce:
          deploy:
            steps:
              - download: current
                artifact: app

              - task: KubernetesManifest@1
                displayName: 'Deploy to AKS'
                inputs:
                  action: 'deploy'
                  kubernetesServiceConnection: 'aks-staging-connection'
                  namespace: 'api'
                  manifests: |
                    k8s/deployment.yaml
                    k8s/service.yaml
                  containers: |
                    acrmeusite.azurecr.io/api:$(Build.BuildId)

- stage: Deploy_Prod
  dependsOn: Deploy_Staging
  jobs:
    - deployment: deploy_prod
      environment: 'production.aks'   # environment exige 2 approvers
      strategy:
        canary:
          increments: [10, 50, 100]
          preDeploy:
            steps:
              - script: echo "Starting canary rollout"
          deploy:
            steps:
              - task: KubernetesManifest@1
                inputs:
                  action: 'deploy'
                  kubernetesServiceConnection: 'aks-prod-connection'
                  namespace: 'api'
                  manifests: k8s/deployment.yaml
                  containers: acrmeusite.azurecr.io/api:$(Build.BuildId)
          postRouteTraffic:
            steps:
              - script: ./scripts/smoke-test.sh $(canary.percentage)
          on:
            failure:
              steps:
                - script: echo "Rollback automático"
            success:
              steps:
                - script: echo "Canary $(canary.percentage)% OK"`}</CodeBlock>
        <Callout tone="success">
          <strong>Canary nativo:</strong> o tipo <InlineCode>canary</InlineCode> da strategy faz rollout por porcentagem,
          executa smoke test entre incrementos, e reverte se falhar. GH Actions e Jenkins precisam de plugin ou script caseiro
          pra mesma coisa.
        </Callout>
      </Section>

      <Section title="Service Connections e Workload Identity Federation" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modo', 'Como funciona', 'Recomendação']}
          rows={[
            ['Azure Resource Manager (auto)', 'Azure DevOps cria Service Principal automaticamente', 'Evite — secret estático de 2 anos'],
            ['Service Principal manual', 'Você cria SP no Azure AD, coloca client secret no ADO', 'Legado — rotaciona à mão'],
            ['Managed Identity', 'Pipeline usa identidade do agente self-hosted em Azure VM', 'Ótimo para self-hosted em Azure'],
            ['Workload Identity Federation', 'OIDC: ADO emite token por run; Azure AD valida trust (org/project/pipeline) e dá STS', '🏆 Padrão moderno — zero secret'],
          ]}
        />
        <CodeBlock lang="yaml">{`# Com WIF, o YAML não muda muito — a mágica é na Service Connection
- task: AzureCLI@2
  inputs:
    azureSubscription: 'prod-wif'     # Service Connection configurada como WIF
    scriptType: bash
    scriptLocation: inlineScript
    inlineScript: |
      az aks get-credentials -n prod-cluster -g prod-rg
      kubectl get pods -A`}</CodeBlock>
      </Section>

      <Section title="Variable Groups + Key Vault" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Library → Variable Group', v: 'Nome + pares chave/valor. Marcar cadeado = secret (não visível depois de salvo).' },
            { k: 'Link com Azure Key Vault', v: 'Variable Group pode apontar pra um KV. Valores atualizam automaticamente; nada fica no ADO.' },
            { k: 'Permissão', v: 'Por Variable Group. Sem acesso, pipeline falha ao requisitar — evita vazamento cruzado entre times.' },
            { k: 'Uso no YAML', v: 'variables: [{ group: shared-config }, { name: SENTRY_DSN, value: "$(SENTRY_DSN)" }]' },
            { k: 'Secure Files', v: 'Arquivos (certificados, kubeconfig) que o pipeline baixa com DownloadSecureFile@1.' },
          ]}
        />
        <Callout tone="warn">
          Nunca use <InlineCode>echo $(DB_PASSWORD)</InlineCode>. ADO masca variáveis declaradas secret, mas derivados (base64,
          JSON) escapam. Em logs de falha, erros de ferramentas podem despejar env — use <InlineCode>##[command]</InlineCode>
          com parcimônia e configure retention curto pra logs sensíveis.
        </Callout>
      </Section>

      <Section title="Templates — reuso em escala" accent={ACCENT}>
        <CodeBlock lang="yaml">{`# templates/node-build.yml  (no repo pipelines-templates)
parameters:
  - name: nodeVersion
    type: string
    default: '20.x'
  - name: runCoverage
    type: boolean
    default: true

steps:
  - task: NodeTool@0
    inputs: { versionSpec: \${{ parameters.nodeVersion }} }
  - script: npm ci
  - script: npm run lint
  - script: npm test -- --ci
    displayName: 'Test'
  - \${{ if eq(parameters.runCoverage, true) }}:
    - task: PublishCodeCoverageResults@2
      inputs: { summaryFileLocation: 'coverage/cobertura-coverage.xml' }`}</CodeBlock>
        <CodeBlock lang="yaml">{`# pipeline consumidor
resources:
  repositories:
    - repository: templates
      type: git
      name: infra/pipelines-templates
      ref: refs/tags/v2.1.0        # pin de versão

jobs:
  - job: build
    steps:
      - template: templates/node-build.yml@templates
        parameters:
          nodeVersion: '22.x'
          runCoverage: true`}</CodeBlock>
      </Section>

      <Section title="Environments, checks e approvals" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Environment', v: 'Entidade em Pipelines → Environments. Tem histórico de deploys e status.' },
            { k: 'Approvals', v: 'Lista de approvers (pessoas ou grupos AAD). Pipeline pausa até aprovação.' },
            { k: 'Business Hours check', v: 'Deploy só permitido em janela (ex.: 9h-18h dias úteis). Evita deploy de sexta à noite acidental.' },
            { k: 'Invoke REST API check', v: 'Chama um endpoint externo (PagerDuty, ServiceNow) e só prossegue com status OK.' },
            { k: 'Exclusive Lock', v: 'Apenas um deploy por vez no mesmo environment — evita corrida.' },
            { k: 'Branch control', v: 'Deploy no environment "prod" só aceita de refs/heads/main.' },
          ]}
        />
      </Section>

      <Section title="Agents: Microsoft-hosted vs Self-hosted" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'Microsoft-hosted', 'Self-hosted']}
          rows={[
            ['Setup', 'Zero — usa vmImage: ubuntu-latest', 'Instala agent em VM/container/K8s'],
            ['Custo', 'Free tier limitado; paralelismo comprado', 'Sua infra'],
            ['Performance', 'VM compartilhada, sem estado', 'Disco persistente, cache local acelera'],
            ['Rede', 'Público', 'Acessa VPN/VNet — necessário pra recursos privados'],
            ['Ferramentas', 'Mudam por imagem (upgrades anuais)', 'Você escolhe'],
            ['Quando usar', 'Pipelines públicos ou sem rede privada', 'On-prem, integração com Azure private link'],
          ]}
        />
      </Section>

      <Section title="Monorepo, path filters e matriz" accent={ACCENT}>
        <CodeBlock lang="yaml">{`trigger:
  branches: { include: [main] }
  paths:
    include:
      - apps/api/**
      - libs/**
      - azure-pipelines-api.yml

jobs:
  - job: test_matrix
    strategy:
      matrix:
        node18_linux:
          NODE: '18.x'
          VMIMG: 'ubuntu-latest'
        node20_linux:
          NODE: '20.x'
          VMIMG: 'ubuntu-latest'
        node20_windows:
          NODE: '20.x'
          VMIMG: 'windows-latest'
    pool:
      vmImage: $(VMIMG)
    steps:
      - task: NodeTool@0
        inputs: { versionSpec: $(NODE) }
      - script: npm ci
      - script: npm test`}</CodeBlock>
      </Section>

      <Section title="Segurança e governança" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Branch policies', v: 'Repos → Branches → branch policy: exige PR, build success, minimum reviewers, linked work item.' },
            { k: 'Build validation', v: 'Policy que dispara pipeline no PR e bloqueia merge se falhar.' },
            { k: 'Project-level permissions', v: 'Groups: Readers, Contributors, Build Admins, Project Admins. Use grupos Azure AD, não users.' },
            { k: 'Approver ≠ autor', v: 'Environment check "require approvers from specific group" e policy do repo "disallow self-approval".' },
            { k: 'Secret rotation', v: 'WIF elimina. Se precisar Service Principal, rode playbook de rotação mensal via script automatizado.' },
            { k: 'Auditoria', v: 'Auditing API do ADO. Exporte pra SIEM — quem aprovou deploy, quem mudou environment, quem editou pipeline.' },
          ]}
        />
      </Section>

      <Section title="Azure DevOps vs GitHub Actions — o dilema Microsoft" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'Azure DevOps', 'GitHub Actions']}
          rows={[
            ['Foco', 'Suíte ALM completa (Boards, Repos, Pipelines, Test, Artifacts)', 'CI/CD dentro do GitHub'],
            ['Governança', 'Environments, approvals, checks, área/iteration paths', 'Environments + protection rules (mais simples)'],
            ['Gate de aprovação', '🏆 Flexível (REST check, business hours, exclusive lock)', 'Básico (required reviewers, wait)'],
            ['Integração Azure', '🏆 Nativa, WIF, tasks prontas', 'Boa (actions oficiais), mas menos profunda'],
            ['YAML', 'Mais verboso, stages explícitos', 'Mais enxuto, eventos amplos'],
            ['Estratégia Microsoft', 'Maintenance mode — evolui pouco', '🏆 Roadmap ativo (AI, Copilot)'],
            ['Startup/greenfield', 'Raro hoje', 'Default'],
            ['Enterprise Microsoft', '🏆 Onde está investimento existente', 'Alvo de migração futura'],
          ]}
        />
        <Callout tone="info">
          A Microsoft tem declarado que GitHub Actions é a plataforma estratégica e Azure DevOps está em modo de manutenção
          (sem novas features grandes). Para projetos novos, GH Actions com Azure OIDC é o caminho. Para times já investidos
          em ADO, continua valendo a pena — migração é trabalho de meses.
        </Callout>
      </Section>

      <Section title="Decisões" accent={ACCENT}>
        <DecisionBox
          scenario="Empresa Microsoft-shop com AD, AKS, App Service e 40 pipelines classic"
          winner="Modernizar para YAML + WIF + templates"
          winnerColor={ACCENT}
          why="Classic → YAML é conversão direta com Export to YAML. Introduzir WIF zera secrets. Templates centralizam padrão. Ganho sem mudar de plataforma."
          alternatives={[{ name: 'Migrar pra GH Actions', note: 'vale se já tiver decisão estratégica — aí planeje 6-12 meses.' }]}
        />
        <DecisionBox
          scenario="Startup usando Azure mas começando do zero"
          winner="GitHub Actions + Azure OIDC"
          winnerColor={ACCENT}
          why="Ir direto pro futuro. GH Actions + OIDC para AKS/ACR é setup de 1 dia, e você não cria dívida de Azure Boards que ninguém mais usa."
          alternatives={[{ name: 'Azure DevOps completo', note: 'só se quiser a suíte ALM integrada (Boards + Repos + Pipelines).' }]}
        />
        <DecisionBox
          scenario="Pipeline com aprovação rigorosa (Sarbanes-Oxley), múltiplos gates"
          winner="Azure DevOps Environments"
          winnerColor={ACCENT}
          why="Checks como Business Hours, Invoke REST, Exclusive Lock, e Required Approvers com grupos AAD atendem compliance sem script caseiro."
          alternatives={[{ name: 'GH Actions + action custom', note: 'possível mas exige código e manutenção próprios.' }]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Classic pipeline ou YAML?"
          a="YAML, sempre. Classic é legado. Export to YAML na UI gera um esqueleto — você limpa e versiona no repo. Código revisado = menos bugs em pipeline."
        />
        <QAItem
          q="Posso disparar um pipeline a partir de outro?"
          a={
            <>
              Sim, 3 formas: (1) <InlineCode>resources.pipelines</InlineCode> — pipeline B observa pipeline A e dispara quando A
              completa; (2) REST API — <InlineCode>az pipelines run</InlineCode>; (3) trigger no repo — mesmo repo consumido por
              múltiplos pipelines.
            </>
          }
        />
        <QAItem
          q="Como compartilhar artefato entre stages?"
          a={
            <>
              Use <InlineCode>publish</InlineCode> e <InlineCode>download</InlineCode> (ou{' '}
              <InlineCode>PublishPipelineArtifact@1</InlineCode> / <InlineCode>DownloadPipelineArtifact@2</InlineCode>). Stages
              posteriores podem baixar artefatos produzidos por stages anteriores, mesmo em jobs diferentes.
            </>
          }
        />
        <QAItem
          q="Dá para rodar pipeline só em PR que muda uma pasta?"
          a={
            <>
              Sim. <InlineCode>pr.paths.include</InlineCode> filtra por caminho. Útil em monorepos: pipeline da API só roda se
              mudou <InlineCode>apps/api/**</InlineCode> ou o próprio YAML.
            </>
          }
        />
        <QAItem
          q="Como fazer IaC (Terraform/Bicep) no Azure Pipelines?"
          a="Stages: init → validate → plan → (approval) → apply. WIF pra autenticar na Azure. Estado remoto em Storage Account com lock. Bicep tem vantagem no stack Microsoft por ser nativo; Terraform quando multi-cloud."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) Azure DevOps = 5 produtos; Pipelines é o CI/CD. (2) YAML versionado &gt; classic
        clicado. (3) Stages representam fases de entrega com environments, approvals e histórico — diferencial forte vs GH
        Actions. (4) Workload Identity Federation zera secrets estáticos — migre hoje. (5) Variable Group + Key Vault
        centraliza config e secret com rotação automática. (6) Templates + repos externos = reuso DRY com pin de versão.
        (7) Microsoft sinalizou GH Actions como futuro estratégico — planeje migração em horizonte de 1-3 anos se for
        greenfield, mantenha e modernize se for legado.
      </Callout>
    </div>
  );
}
