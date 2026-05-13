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

export const metadata = getModuleMetadata('jenkins-pipelines');

const ACCENT = '#d33833';

const quiz: QuizQuestion[] = [
  {
    question:
      'Por que um pipeline declarativo é preferido ao scripted pipeline em 2026?',
    options: [
      'Porque scripted foi descontinuado',
      'Porque declarativo tem estrutura fixa (pipeline → agent → stages → post), facilitando leitura, validação estática e integração com Blue Ocean. Scripted é Groovy livre — poderoso mas fácil de virar bagunça',
      'Porque declarativo roda mais rápido',
      'Porque scripted não aceita stages',
    ],
    correct: 1,
    explanation:
      'Declarativo força um shape previsível, permite lint (jenkinsfile-linter, CLI) e é renderizado melhor no Blue Ocean. Scripted ainda existe e é útil para fluxos muito dinâmicos, mas a regra prática é: declarativo por default, script { } como escape hatch quando preciso.',
  },
  {
    question:
      'Seu Jenkins tem 200 jobs, todos rodando no mesmo agent fixo (Linux + Java + Docker + Node). Qual a principal dor?',
    options: [
      'Não há dor, isso é normal',
      'Conflito de versões, "está poluído", manutenção do agent vira full-time job, e escala é linear (1 agent = 1 fila). Kubernetes Plugin resolve: cada job sobe seu próprio Pod-agent efêmero com a stack que precisa',
      'Jenkins não suporta mais que 50 jobs',
      'Agent fixo não pode rodar Docker',
    ],
    correct: 1,
    explanation:
      'Agents efêmeros no K8s (ou Docker) são o padrão moderno: cada pipeline declara a imagem que quer (Node 20, JDK 21, Python 3.12), o Pod sobe, roda, morre. Zero drift entre jobs, escala horizontal automática, custo só quando rodando. É a diferença entre "um Jenkins" e "Jenkins como plataforma".',
  },
  {
    question:
      'Você repete o mesmo bloco de 30 linhas em 40 Jenkinsfiles. Qual a solução profissional?',
    options: [
      'Copy-paste mesmo, é mais rápido',
      'Shared Library — código Groovy versionado em um repo próprio que todos os Jenkinsfiles importam com @Library. Centraliza lógica, tem teste unitário (JenkinsPipelineUnit), evoluiu pela plataforma',
      'Criar um plugin Jenkins do zero',
      'Usar só scripted pipeline',
    ],
    correct: 1,
    explanation:
      'Shared Libraries são Groovy em um repo (vars/, src/, resources/) carregado por @Library. Todo Jenkinsfile consome funções comuns: buildDockerImage(), deployToK8s(), notifySlack(). Mudança em um lugar reflete nos 40 pipelines. É a arma principal contra sprawl de YAML/Groovy em empresas grandes.',
  },
  {
    question:
      'Por que credenciais no Jenkinsfile direto (ex.: `sh "aws configure set aws_access_key_id AKIA..."`) é um anti-padrão fatal?',
    options: [
      'Porque aws configure não funciona no Jenkins',
      'Porque credenciais no código ficam no Git, aparecem em logs, não rotacionam. O correto é usar Jenkins Credentials + withCredentials() que injeta como env temporária, não fica em log e rotaciona pela UI',
      'Porque AWS bloqueia conexões do Jenkins',
      'Porque precisa ser sempre via IAM role',
    ],
    correct: 1,
    explanation:
      'Jenkins tem um Credential Store criptografado. withCredentials([string(credentialsId: "aws-key", variable: "AWS_ACCESS_KEY_ID")]) injeta só para aquele bloco, Jenkins masca em logs, e a rotação acontece na UI sem tocar no Jenkinsfile. Em cloud moderna, o passo seguinte é assumir IAM Role via OIDC/STS — zero credencial de longa duração no Jenkins.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="jenkins-pipelines"
      title="Jenkins Pipelines: o CI/CD da era enterprise"
      icon="🏛️"
      xp={85}
      readTime={19}
      trailName="DevOps & Containers"
      trailColor={ACCENT}
      nextSlug="azure-devops-pipelines"
      nextTitle="Azure DevOps Pipelines: CI/CD na Microsoft Cloud"
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
        Jenkins é o avô do CI/CD e continua rodando metade da indústria. Nasceu em 2004 como Hudson, virou Jenkins em 2011, tem
        ~2.000 plugins e uma comunidade enorme. GitHub Actions e GitLab CI vieram depois, com sintaxe mais limpa e integração
        SaaS. Mas Jenkins sobrevive porque: roda on-prem em rede isolada, integra com <em>qualquer</em> coisa (SVN, Perforce,
        Bitbucket, sistemas legados), tem governança fina de permissões, e uma empresa de 20 anos provavelmente já tem 300
        jobs investidos nele. Saber Jenkins é diferencial real em empresas de porte. Este guia cobre arquitetura moderna,
        Jenkinsfile declarativo, agents Kubernetes, shared libraries e migração de freestyle para pipeline-as-code.
      </p>

      <Section title="Por que Jenkins ainda existe em 2026" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Self-hosted sério', v: 'Roda em sua rede, sem depender de SaaS, sem dados saindo. Banco, saúde, governo exigem isso.' },
            { k: 'Plugin ecosystem', v: 'Integra com SVN, CVS, Perforce, TFS, Mercurial, sistemas SAP, mainframe. Coisas que GH Actions nem lista.' },
            { k: 'Neutralidade', v: 'Funciona igual com Bitbucket Server, GitLab self-hosted, GitHub Enterprise, Azure Repos.' },
            { k: 'Pipeline-as-code', v: 'Jenkinsfile versionado com o projeto — code review no pipeline, rollback via git revert.' },
            { k: 'Shared libraries', v: 'Padrão comum entre centenas de repos: função buildImage() igual em todos, mudança em um lugar.' },
            { k: 'Custo', v: 'Binário é grátis. Custo real é operação (VM + pessoa cuidando). Para grandes, diluído rápido.' },
          ]}
        />
        <Callout tone="info">
          Se você está começando hoje num stack 100% GitHub/cloud, provavelmente <strong>não</strong> deveria montar Jenkins.
          Mas se você trabalha em empresa com Jenkins legado, ou precisa de on-prem, esta é a plataforma — e dominar significa
          modernizar legado, não construir do zero.
        </Callout>
      </Section>

      <Section title="Arquitetura: controller + agents" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '🧑‍💻', label: 'Dev', sub: 'push', detail: 'Commit no repo (GitHub, Bitbucket, GitLab).', connector: 'webhook' },
            { icon: '🏛️', label: 'Jenkins Controller', sub: 'orquestra', detail: 'Recebe trigger, carrega Jenkinsfile, decide em qual agent rodar. NÃO deve executar builds pesados.', connector: 'agent protocol (JNLP/SSH)' },
            { icon: '🧩', label: 'Agents (workers)', sub: 'executam', detail: 'VMs, containers ou Pods K8s efêmeros. Cada stage pode rodar em um agent diferente.', connector: 'shell/powershell' },
            { icon: '📦', label: 'Stages', sub: 'build/test/deploy', detail: 'Passos declarados no Jenkinsfile. Post actions cuidam de notificação e cleanup.' },
          ]}
        />
        <Callout tone="warn">
          <strong>Erro clássico:</strong> usar o controller como agent (<InlineCode>agent any</InlineCode> apontando pro
          master). O controller carrega UI, schedule, gerencia estado — se o build consumir CPU/disco dele, a plataforma inteira
          engasga. Regra: controller não roda build. Nunca.
        </Callout>
      </Section>

      <Section title="Declarative vs Scripted Pipeline" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Critério', 'Declarative', 'Scripted']}
          rows={[
            ['Sintaxe', 'Estrutura fixa: pipeline { }, agent, stages, steps, post', 'Groovy livre: node { } + steps imperativos'],
            ['Validação', 'Linter oficial: jenkins-cli declarative-linter', 'Só roda no Jenkins pra saber se passa'],
            ['Legibilidade', 'Alta — shape consistente entre projetos', 'Depende do autor'],
            ['Poder', 'Suficiente pra 95% dos casos + escape hatch via script { }', 'Full Groovy — loops arbitrários, classes'],
            ['Blue Ocean', 'Renderiza bem (grid de stages)', 'Renderização limitada'],
            ['Uso recomendado', 'Default em 2026', 'Só quando lógica for realmente dinâmica'],
          ]}
        />
        <CodeBlock lang="groovy">{`// Jenkinsfile — declarativo, 100 linhas cobrem um pipeline real
pipeline {
  agent none                              // cada stage escolhe seu agent

  options {
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    IMAGE = "ghcr.io/me/api"
    SHA   = "\${GIT_COMMIT.take(7)}"
  }

  stages {
    stage('Checkout') {
      agent { label 'linux' }
      steps { checkout scm }
    }

    stage('Quality') {
      parallel {
        stage('Lint') {
          agent { docker 'node:20-alpine' }
          steps { sh 'npm ci && npm run lint' }
        }
        stage('Test') {
          agent { docker 'node:20-alpine' }
          steps { sh 'npm ci && npm test -- --ci' }
          post { always { junit 'junit.xml' } }
        }
      }
    }

    stage('Build & push image') {
      agent { label 'linux' }
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'ghcr',
          usernameVariable: 'USER', passwordVariable: 'TOKEN')]) {
          sh '''
            echo "$TOKEN" | docker login ghcr.io -u "$USER" --password-stdin
            docker buildx build --push --platform linux/amd64,linux/arm64 \\
              -t $IMAGE:$SHA -t $IMAGE:latest .
          '''
        }
      }
    }

    stage('Deploy staging') {
      agent { label 'kubectl' }
      when { branch 'main' }
      steps {
        sh '''
          kubectl set image deploy/api api=$IMAGE:$SHA -n staging
          kubectl rollout status deploy/api -n staging --timeout=5m
        '''
      }
    }

    stage('Deploy prod') {
      agent { label 'kubectl' }
      when { branch 'main' }
      input {
        message 'Promote to production?'
        ok 'Deploy'
        submitter 'sre,tech-lead'
      }
      steps {
        sh '''
          kubectl set image deploy/api api=$IMAGE:$SHA -n prod
          kubectl rollout status deploy/api -n prod --timeout=5m
        '''
      }
    }
  }

  post {
    success { slackSend channel: '#deploys', color: 'good',   message: "✅ \${env.JOB_NAME} \${env.BUILD_NUMBER} deployed" }
    failure { slackSend channel: '#deploys', color: 'danger', message: "❌ \${env.JOB_NAME} \${env.BUILD_NUMBER} failed" }
    always  { cleanWs() }
  }
}`}</CodeBlock>
      </Section>

      <Section title="Agents Kubernetes — o padrão moderno" accent={ACCENT}>
        <p>
          Plugin <strong>kubernetes</strong> permite que o Jenkins agende agents como Pods efêmeros em um cluster K8s. Cada
          pipeline declara qual imagem quer; o Pod sobe, roda, morre. Escala automática, zero drift, custo sob demanda.
        </p>
        <CodeBlock lang="groovy">{`pipeline {
  agent {
    kubernetes {
      yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: node
      image: node:20-alpine
      command: [cat]
      tty: true
    - name: docker
      image: docker:26-dind
      securityContext: { privileged: true }
    - name: kubectl
      image: bitnami/kubectl:1.30
      command: [cat]
      tty: true
      '''
      defaultContainer 'node'
    }
  }
  stages {
    stage('Install') { steps { sh 'npm ci' } }
    stage('Test')    { steps { sh 'npm test' } }
    stage('Build')   {
      steps {
        container('docker') {
          sh 'docker build -t me/api:$GIT_COMMIT .'
        }
      }
    }
    stage('Deploy') {
      steps {
        container('kubectl') {
          sh 'kubectl apply -f k8s/'
        }
      }
    }
  }
}`}</CodeBlock>
        <Callout tone="success">
          <strong>Ganho real:</strong> um agent sai de &ldquo;VM Linux com toda ferramenta pré-instalada&rdquo; para &ldquo;Pod
          com só o que esse pipeline precisa&rdquo;. Sem conflito entre Java 11 e Java 21. Sem disco enchendo com cache. Quando
          não há build, zero recurso consumido.
        </Callout>
      </Section>

      <Section title="Credentials — como não vazar segredo" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Credential Store', v: 'Manage Jenkins → Credentials. Tipos: Username/Password, Secret Text, SSH Key, Certificate, AWS, Vault.' },
            { k: 'withCredentials', v: 'Injeta credencial como env variable só durante o bloco. Jenkins masca em logs automaticamente.' },
            { k: 'Credential Binding plugin', v: 'Permite montar credencial como arquivo temporário (file()) — útil pra kubeconfig, service account key.' },
            { k: 'IAM Role via OIDC', v: 'Jenkins 2.400+ + plugin OIDC Token plugin permite federar STS sem static keys. É o estado da arte.' },
            { k: 'HashiCorp Vault', v: 'Plugin vault-plugin busca segredos em runtime do Vault, com lease curto. Melhor modelo de rotação.' },
            { k: 'Masking', v: 'Jenkins masca valores declarados. Segredo derivado (base64, JSON) pode escapar — evite print ou use maskPasswords plugin.' },
          ]}
        />
        <CodeBlock lang="groovy">{`stage('Deploy to AWS') {
  steps {
    withCredentials([[
      $class: 'AmazonWebServicesCredentialsBinding',
      credentialsId: 'aws-prod',
      accessKeyVariable: 'AWS_ACCESS_KEY_ID',
      secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
    ]]) {
      sh 'aws s3 sync ./dist s3://meu-bucket --delete'
    }
  }
}`}</CodeBlock>
      </Section>

      <Section title="Shared Libraries — DRY real na plataforma" accent={ACCENT}>
        <p>
          Shared Library é um repo Git com estrutura convencional:
        </p>
        <CodeBlock lang="bash">{`jenkins-shared-lib/
├── vars/
│   ├── buildDockerImage.groovy     # usado como: buildDockerImage(name: 'api', tag: env.GIT_COMMIT)
│   └── deployToK8s.groovy
├── src/
│   └── com/minhaorg/jenkins/
│       └── K8sClient.groovy        # classes Groovy reutilizáveis
└── resources/
    └── k8s/
        └── deployment.yaml.tpl`}</CodeBlock>
        <CodeBlock lang="groovy">{`// vars/buildDockerImage.groovy
def call(Map config) {
  def image = "\${config.registry}/\${config.name}:\${config.tag}"
  sh """
    docker build -t \${image} .
    docker push \${image}
  """
  return image
}`}</CodeBlock>
        <CodeBlock lang="groovy">{`// Jenkinsfile consome assim
@Library('jenkins-shared-lib@v2') _

pipeline {
  agent { label 'linux' }
  stages {
    stage('Build') {
      steps {
        script {
          def img = buildDockerImage(
            registry: 'ghcr.io/minha-org',
            name: 'api',
            tag: env.GIT_COMMIT.take(7)
          )
          echo "Built \${img}"
        }
      }
    }
  }
}`}</CodeBlock>
        <Callout tone="info">
          <strong>Versione a library:</strong> tag <InlineCode>v1</InlineCode>, <InlineCode>v2</InlineCode>. Pipelines pinam
          versão. Mudança breaking? Novo major. Library sem versão é bomba-relógio — uma linha mudada quebra 200 pipelines em
          produção ao mesmo tempo.
        </Callout>
      </Section>

      <Section title="Triggers e multibranch pipeline" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de job', 'O que cria', 'Quando usar']}
          rows={[
            ['Pipeline (single)', 'Um job que lê Jenkinsfile de um branch', 'Raramente — só se repo tem 1 branch'],
            ['Multibranch Pipeline', 'Descobre branches e PRs automaticamente, cria sub-job por branch', 'Default moderno'],
            ['Organization Folder', 'Descobre TODOS os repos de uma org/user com Jenkinsfile', 'Empresas com 50+ repos'],
            ['Freestyle', 'UI clicada, sem Jenkinsfile', 'Legado — não usar em projetos novos'],
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Webhook do GitHub', v: 'Configura no GitHub: Settings → Webhooks → https://jenkins/github-webhook/. Push/PR notifica Jenkins em segundos.' },
            { k: 'Poll SCM', v: 'Plano B quando webhook não pode ser feito (rede fechada). Cron pegando mudanças — poluente e lento.' },
            { k: 'Triggers cron', v: 'triggers { cron("H 2 * * *") } — H é hash por job (não sobrecarrega Jenkins todo mundo às 2h em ponto).' },
            { k: 'Evento upstream', v: 'triggers { upstream(upstreamProjects: "libA", threshold: SUCCESS) } — job B roda após A.' },
          ]}
        />
      </Section>

      <Section title="Blue Ocean + Pipeline Editor" accent={ACCENT}>
        <p>
          <strong>Blue Ocean</strong> é a UI moderna do Jenkins: grid visual de stages, logs limpos, trace de falha direto. É
          um plugin (um pouco desatualizado em 2026 mas ainda útil). Alternativa: UI oficial nova do Jenkins 2.4xx também tem
          visual de pipeline.
        </p>
        <Callout tone="warn">
          Blue Ocean <em>não</em> é onde você edita Jenkinsfile em produção. O editor visual é ótimo pra descobrir sintaxe, mas
          o artefato canônico é sempre <strong>Jenkinsfile no repo</strong>, commitado, revisado.
        </Callout>
      </Section>

      <Section title="Migração freestyle → pipeline" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '📋', label: '1. Documentar freestyle', sub: 'inventário', detail: 'Captura triggers, build steps, post actions e plugins usados em cada job.', connector: 'mapeia' },
            { icon: '🧪', label: '2. Prototipar Jenkinsfile', sub: 'em branch', detail: 'Cria pipeline equivalente num branch, roda multibranch em paralelo ao freestyle.', connector: 'valida' },
            { icon: '🔁', label: '3. Shadow run', sub: 'paralelo', detail: 'Por 1-2 semanas, freestyle e pipeline rodam lado a lado. Compare resultados.', connector: 'promove' },
            { icon: '🏁', label: '4. Cutover + disable', sub: 'go live', detail: 'Desabilita freestyle (sem deletar) e vira oficial. Deleta após 1 mês sem reclamação.' },
          ]}
        />
      </Section>

      <Section title="Performance e produção" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Controller high-available', v: 'Em escala, use CloudBees CI ou roda controller em K8s com persistent volume + backup do $JENKINS_HOME. Sem HA nativo no OSS.' },
            { k: 'Plugins: menos é mais', v: 'Plugin sem manutenção = CVE aberto. Audite bimestralmente. CloudBees Plugin Catalog ajuda a filtrar.' },
            { k: 'Job DSL / JCasC', v: 'Configuration-as-Code: jenkins.yaml descreve plugins, credentials (referência), agents, views. Reprovisão em 5 min.' },
            { k: 'Disco do controller', v: 'Logs e workspaces enchem rápido. Workspace em agent, não no controller. buildDiscarder mantém só N builds.' },
            { k: 'Upgrade discipline', v: 'Pula LTS → LTS (não weekly). Teste em controller de staging. Plugins atualizam junto.' },
            { k: 'Segurança', v: 'Matrix-based Authorization, Role-Based Strategy plugin, CSRF on, Script Approval fechado para não-admins.' },
          ]}
        />
      </Section>

      <Section title="Decisões" accent={ACCENT}>
        <DecisionBox
          scenario="Empresa nova, green field, tudo no GitHub"
          winner="GitHub Actions"
          winnerColor={ACCENT}
          why="Jenkins é força desnecessária pra quem não tem drag de legado. GH Actions já resolve 95% dos casos com 10% do esforço operacional."
          alternatives={[{ name: 'Jenkins', note: 'vire pra cá se crescer e precisar on-prem ou integração com sistemas exóticos.' }]}
        />
        <DecisionBox
          scenario="Banco/Seguradora com 500 jobs Jenkins, proibido SaaS, auditoria rigorosa"
          winner="Jenkins modernizado — K8s agents + JCasC + shared libraries"
          winnerColor={ACCENT}
          why="Migrar 500 jobs é projeto de meses. Modernizar sem trocar a plataforma dá retorno mais rápido: libraries padronizam, K8s agents resolvem escala, JCasC vira infra-as-code."
          alternatives={[{ name: 'GH Actions Enterprise Server', note: 'se a empresa aceita investir na migração. Horizonte de 1-2 anos.' }]}
        />
        <DecisionBox
          scenario="Time pequeno, repo híbrido (GitHub + SVN legado), precisa CI dos dois"
          winner="Jenkins com multibranch + SVN plugin"
          winnerColor={ACCENT}
          why="GH Actions nem enxerga SVN. Jenkins orquestra os dois, centraliza resultado, permite shared library comum."
          alternatives={[{ name: 'Dois CIs separados', note: 'duplica overhead, fragmenta cultura.' }]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Posso testar Jenkinsfile sem commitar 10 vezes?"
          a={
            <>
              Sim. <InlineCode>jenkins-cli declarative-linter</InlineCode> valida sintaxe.{' '}
              <InlineCode>Replay</InlineCode> na UI roda a mesma build com um Jenkinsfile editado sem commit. E{' '}
              <InlineCode>JenkinsPipelineUnit</InlineCode> permite teste unitário Groovy de shared library.
            </>
          }
        />
        <QAItem
          q="Como versionar a shared library?"
          a={
            <>
              Dois caminhos: (1) tag Git — <InlineCode>@Library(&apos;lib@v1.2.0&apos;)</InlineCode>; (2) branch — usa{' '}
              <InlineCode>@Library(&apos;lib@main&apos;)</InlineCode> para dev, tag em prod. Em ambiente regulado, pin por SHA é
              superior: <InlineCode>@Library(&apos;lib@abc123def&apos;)</InlineCode>.
            </>
          }
        />
        <QAItem
          q="Jenkins em containers Docker no próprio Docker (DinD) — faz sentido?"
          a="Sim pra desenvolvimento/testes locais. Em prod, prefira Jenkins controller em Kubernetes (sem DinD), e agents com docker: socket mount (dood) ou buildkit daemon. Docker-in-Docker tem custos de performance e problemas de cache."
        />
        <QAItem
          q="Como deploy de infra (Terraform) no Jenkins é diferente?"
          a={
            <>
              Estágios: <InlineCode>init → validate → plan → (approval) → apply</InlineCode>. O plan vira artefato; apply usa
              exatamente esse plan com <InlineCode>-lock-timeout</InlineCode>. Credenciais via OIDC/STS, estado no S3 com
              DynamoDB lock. Um webhook por repo de infra.
            </>
          }
        />
        <QAItem
          q="Como cuidar de flakiness em testes E2E no Jenkins?"
          a={
            <>
              Três camadas: (1) <InlineCode>retry(2)</InlineCode> em stages sabidamente flaky; (2) dashboard de flaky tests via
              Allure/Test Analytics; (3) quarentena — testes instáveis vão pra um stage que não falha o build, mas gera alerta.
              Corrigir a raiz é melhor que retry, mas retry salva deploy de sexta.
            </>
          }
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) Jenkins é plataforma — vale o investimento em empresa grande/regulada; overkill pra
        startup nova. (2) Declarative pipeline como padrão; scripted só pra dinâmica real. (3) Controller NÃO roda builds —
        agents (Kubernetes de preferência) sim. (4) Credenciais sempre via Credential Store + withCredentials; OIDC/STS é o
        estado da arte. (5) Shared Library versionada é o que mantém sanidade em 50+ repos. (6) Multibranch Pipeline + webhook
        é o default moderno — freestyle é legado. (7) JCasC + Job DSL transformam Jenkins em infra-as-code. (8) Upgrade LTS a
        LTS com cluster de staging — plugins são o ponto fraco.
      </Callout>
    </div>
  );
}
