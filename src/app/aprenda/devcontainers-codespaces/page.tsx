import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('devcontainers-codespaces');
const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual problema devcontainers resolve que Docker Compose sozinho não resolve?',
    options: [
      'Performance',
      'Devcontainer é contrato padronizado (devcontainer.json — CNCF/Microsoft) que especifica não só containers mas IDE (VS Code/JetBrains), extensions, settings, postCreate commands e features reutilizáveis — IDE conecta dentro do container, experiência indistinguível de local, portável entre Codespaces/Gitpod/local',
      'É mais leve',
      'Substitui Docker',
    ],
    correct: 1,
    explanation: 'Compose orquestra serviços — não especifica experiência de desenvolvimento. Devcontainer é spec superior que agrega: imagem base, features (Node, Python, AWS CLI como building blocks), mounts, portas forwarded, VS Code settings/extensions, ciclo de vida (onCreate, postCreate, postStart). IDE conecta-se remotamente ao container — linter, debugger, terminal, tudo dentro. "Funciona na minha máquina" finalmente desaparece.',
  },
  {
    question: 'Qual a principal vantagem de Codespaces sobre ambiente local para onboarding?',
    options: [
      'É mais barato',
      'Novo contratado clona repo em browser, em 60–90 segundos tem ambiente completo rodando — mesma versão de linguagem, banco seed, extensions, tudo pronto. Elimina 1–3 dias de setup e remove inconsistência "funciona no laptop do Pedro mas não no da Maria"',
      'É obrigatório',
      'Não há vantagem',
    ],
    correct: 1,
    explanation: 'Onboarding clássico: 2–3 dias instalando dependências, descobrindo versão certa de Node, ajustando env vars, pedindo acesso a DB. Com Codespaces/Gitpod: clique no repo, novo ambiente provisionado em 1 minuto, ambiente idêntico ao dev senior do time. Eng Manager feliz, contratado produtivo no dia 1. Custo Codespaces (~$0.18/h, desliga sozinho) é irrelevante frente ao ganho.',
  },
  {
    question: 'Quando devcontainers NÃO é a escolha certa?',
    options: [
      'Em projetos pessoais',
      'Apps que dependem pesadamente de integração com OS host (notificações desktop nativas, hardware GPU local pra ML, testes que exigem browsers desktop completos). Também é overkill em scripts simples ou bibliotecas puras sem deps externas',
      'Sempre deve ser usado',
      'Em times grandes',
    ],
    correct: 1,
    explanation: 'Devcontainer shines onde ambiente é complexo (múltiplos serviços, dep versões frescas, DB seed, secrets) — web apps, APIs, serviços de dados. Não brilha em dev de UI desktop nativo (Electron/Tauri requer host), ML com GPU local dedicada, ou libs Node/Python puras (criar overhead sem ganho). Regra: devcontainer quando "onboarding leva > 1h hoje". Se é 5min em qualquer laptop, não precisa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="devcontainers-codespaces"
      title="Devcontainers + Codespaces: dev env efêmero"
      icon="📦"
      xp={55}
      readTime={13}
      trailName="DX & Developer Productivity"
      trailColor={accent}
      nextSlug="makefiles-task-runners"
      nextTitle="Makefiles e task runners: make, just, task"
      quiz={quiz}
    >
      <Section title="O fim definitivo do 'funciona na minha máquina'" accent={accent}>
        <p>
          Há 20 anos tentamos resolver reprodutibilidade de dev env: Vagrant (2010), Docker Compose (2014), Nix (sempre). Devcontainers (Microsoft 2019, hoje spec aberta CNCF) ganhou porque pega no contrato prático: <strong>container + integração de IDE + lifecycle</strong> em JSON declarativo dentro do repo.
        </p>
      </Section>

      <Section title="devcontainer.json essencial" accent={accent}>
        <CodeBlock lang="json">{`{
  "name": "ffv-academy",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",

  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/aws-cli:1": {}
  },

  "forwardPorts": [3000, 5432],
  "portsAttributes": {
    "3000": { "label": "Next.js dev" },
    "5432": { "label": "Postgres" }
  },

  "postCreateCommand": "npm install && npm run db:seed",
  "postStartCommand": "npm run dev:bg",

  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "typescript.tsdk": "node_modules/typescript/lib"
      }
    }
  },

  "remoteUser": "node"
}`}</CodeBlock>
      </Section>

      <Section title="Features: blocos reutilizáveis" accent={accent}>
        <p>
          Features do spec (<code>ghcr.io/devcontainers/features/*</code>) são mini-instaladores versionados: Node, Python, AWS CLI, kubectl, Terraform, Rust. Em vez de Dockerfile artesanal com 30 apt-get, compõe features. Mantidas pela comunidade, atualizam versões rapidamente.
        </p>
        <Callout tone="info" icon="🧩">
          Catálogo em containers.dev/features. Suas próprias features podem ser publicadas em GitHub Registry — reutilizar entre repos é trivial.
        </Callout>
      </Section>

      <Section title="Compose multi-serviço" accent={accent}>
        <CodeBlock lang="json">{`// .devcontainer/devcontainer.json
{
  "name": "ffv-stack",
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": "/workspace",
  "forwardPorts": [3000, 5432, 6379]
}

// .devcontainer/docker-compose.yml
// services:
//   app:        (container onde o dev trabalha)
//     image: mcr.microsoft.com/devcontainers/typescript-node:20
//     volumes: [..:/workspace]
//     command: sleep infinity
//   db:
//     image: postgres:16
//     environment: { POSTGRES_PASSWORD: dev }
//   cache:
//     image: redis:7`}</CodeBlock>
      </Section>

      <Section title="Codespaces, Gitpod, local" accent={accent}>
        <p>
          Mesmo <code>devcontainer.json</code> funciona em:
        </p>
        <CodeBlock lang="bash">{`# Local (VS Code Dev Containers extension)
code . → "Reopen in Container"

# GitHub Codespaces (browser ou VS Code)
gh codespace create -r owner/repo
# Startup: 60–90s; hibernação auto em inatividade

# Gitpod (self-hosted possível)
gitpod.io/#https://github.com/owner/repo

# JetBrains Space / Fleet também suportam devcontainer spec

# Portabilidade real: mesmo .json, ambientes diferentes.`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Onboarding moderno ideal: contratação → clica &quot;Open in Codespaces&quot; no README → 90s depois está codando. Zero setup manual, zero troubleshoot específico de máquina. Essa é a régua em 2026.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
