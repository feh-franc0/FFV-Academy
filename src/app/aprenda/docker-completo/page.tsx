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
  SplitFlow,
  LayerStack,
  Timeline,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Docker Completo: do zero ao production-ready — FFV Academy',
  description:
    'Guia denso e profissional de Docker em PT-BR: containers vs VMs, arquitetura (dockerd, containerd, runc, OCI), imagens, layers, Dockerfile, multi-stage, Compose, volumes, redes, segurança e otimização.',
};

const ACCENT = '#2496ed';

const quiz: QuizQuestion[] = [
  {
    question:
      'Por que containers são mais leves que VMs, mesmo rodando no "mesmo hardware"?',
    options: [
      'Porque containers não usam CPU — só RAM',
      'Porque containers compartilham o kernel do host e isolam apenas o userspace via namespaces e cgroups, enquanto VMs carregam um kernel inteiro por instância',
      'Porque Docker compila o código em binário nativo',
      'Porque containers rodam sem sistema operacional',
    ],
    correct: 1,
    explanation:
      'Uma VM sobe um kernel Linux completo (centenas de MB, boot em segundos a minutos) via hypervisor. Um container é só um processo no kernel do host isolado por namespaces (PID, NET, MNT, UTS, IPC, USER) + cgroups (limites de CPU/mem). Boot em milissegundos, overhead quase zero.',
  },
  {
    question:
      'Por que o Dockerfile abaixo vai invalidar cache a cada mudança de código? `FROM node:20` → `COPY . .` → `RUN npm install` → `CMD ["node","app.js"]`',
    options: [
      'Porque node:20 é uma tag instável',
      'Porque COPY . . copia tudo (inclusive o código-fonte) antes do npm install, então qualquer edição de código invalida o layer do install e força reinstalar dependências',
      'Porque falta um EXPOSE',
      'Porque npm install nunca pode estar em cache',
    ],
    correct: 1,
    explanation:
      'Ordem correta: COPY package*.json ./ → RUN npm ci → COPY . . → CMD. Assim o layer caro (instalar deps) só invalida quando package.json muda de verdade, não a cada commit de código. Regra geral: coisas que mudam raramente primeiro, coisas que mudam sempre por último.',
  },
  {
    question:
      'Qual a diferença prática entre CMD e ENTRYPOINT no Dockerfile?',
    options: [
      'São sinônimos',
      'ENTRYPOINT define o binário que sempre será executado e CMD passa argumentos default; ao rodar `docker run imagem arg1`, arg1 substitui o CMD mas mantém o ENTRYPOINT',
      'CMD só funciona em shell form e ENTRYPOINT em exec form',
      'ENTRYPOINT só roda em containers privilegiados',
    ],
    correct: 1,
    explanation:
      'O padrão profissional é `ENTRYPOINT ["./app"]` + `CMD ["--default-flag"]`. Assim a imagem tem comportamento default mas o usuário pode sobrescrever flags sem sobrescrever o binário. Usar só CMD deixa o container "programável" como um runner genérico — bom pra imagens base, ruim pra aplicações.',
  },
  {
    question:
      'Você tem uma imagem Node de 1.2 GB. Qual estratégia entrega o maior ganho de tamanho com menor risco?',
    options: [
      'Trocar FROM node:20 por FROM node:20-alpine e rezar',
      'Multi-stage build: um stage "builder" com node:20 pra instalar e compilar, e um stage final node:20-alpine (ou distroless) com apenas o dist/ e node_modules de produção',
      'Rodar docker image prune',
      'Comprimir o binário com upx',
    ],
    correct: 1,
    explanation:
      'Multi-stage é o padrão-ouro: o stage final só recebe os artefatos (dist, node_modules --omit=dev), sem toolchain, sem cache do npm, sem source maps. Ganho típico: 1.2 GB → 150-250 MB (alpine) ou 80-120 MB (distroless). Trocar só a tag base resolve parte, mas sem multi-stage você ainda carrega fontes e devDependencies.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="docker-completo"
      title="Docker Completo: do zero ao production-ready"
      icon="🐳"
      xp={100}
      readTime={22}
      trailName="DevOps & Containers"
      trailColor={ACCENT}
      nextSlug="kubernetes-completo"
      nextTitle="Kubernetes Completo: do Pod ao cluster de produção"
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
        Docker resolveu um problema velho e chato: <strong>&ldquo;na minha máquina funciona&rdquo;</strong>. Antes dele, subir uma aplicação em
        outro servidor era um ritual — instalar a versão certa da linguagem, as libs do sistema, configurar permissões, rezar. Container empacota
        o código junto com todo o ambiente que ele precisa, gera um artefato imutável (a <em>imagem</em>) e executa esse artefato em
        qualquer lugar que tenha um runtime Docker. Este guia vai do porquê dos containers existirem até Dockerfiles profissionais,
        multi-stage, redes, volumes, segurança e otimização. É denso de propósito — leia sem pressa, cole os comandos no terminal, teste.
      </p>

      <Section title="De onde veio tudo isso: uma linha do tempo de 25 anos" accent={ACCENT}>
        <p>
          Docker não inventou containers. Inventou a <strong>experiência de uso</strong>. A ideia de isolar processos é velha:
        </p>
        <Timeline
          accent={ACCENT}
          events={[
            { when: '1979', label: 'chroot (Unix V7)', detail: 'Isola filesystem de um processo.' },
            { when: '2000', label: 'FreeBSD Jails', detail: 'Isola rede, filesystem e usuários.' },
            { when: '2005', label: 'Solaris Zones', detail: 'VMs leves no Solaris.' },
            { when: '2006', label: 'cgroups (Google)', detail: 'Limita CPU e memória por grupo de processos.' },
            { when: '2008', label: 'LXC', detail: 'Namespaces + cgroups = "container Linux" completo.' },
            { when: '2013', label: 'Docker 0.1', detail: 'CLI amigável em cima do LXC — mudou o jogo.', highlight: true },
            { when: '2015', label: 'OCI / runc', detail: 'Padrão aberto para imagens e runtime.' },
            { when: '2016', label: 'containerd', detail: 'Runtime de alto nível extraído do Docker.' },
            { when: '2018', label: 'Kubernetes domina', detail: 'Docker deixa de ser obrigatório em K8s.' },
          ]}
        />
        <p>
          A revolução do Docker não foi técnica — foi de <strong>interface</strong>. Antes dele, usar LXC exigia conhecimento profundo
          de namespaces e cgroups. Docker entregou três comandos (<InlineCode>build</InlineCode>, <InlineCode>run</InlineCode>,{' '}
          <InlineCode>push</InlineCode>), um formato de imagem versionável e um registry público (Docker Hub). Desenvolvedores
          adotaram em massa.
        </p>
      </Section>

      <Section title="Container vs VM — a diferença que todo dev precisa entender" accent={ACCENT}>
        <div className="grid md:grid-cols-2 gap-3">
          <LayerStack
            title="Virtual Machine"
            accent="#f78166"
            variant="compact"
            layers={[
              { label: 'apps', content: 'App A · App B · App C', tone: 'writable' },
              { label: 'libs', content: 'Libs A · Libs B · Libs C', tone: 'writable' },
              { label: 'guest OS', content: 'Kernel completo × N (Linux/Win)', note: 'overhead real por VM' },
              { label: 'hypervisor', content: 'ESXi · KVM · Hyper-V · Xen' },
              { label: 'host OS', content: 'Sistema operacional do bare-metal' },
              { label: 'hardware', content: 'CPU · RAM · Disco · Rede', tone: 'base' },
            ]}
          />
          <LayerStack
            title="Container"
            accent={ACCENT}
            variant="compact"
            layers={[
              { label: 'apps', content: 'App A · App B · App C · ...', tone: 'writable' },
              { label: 'libs', content: 'Libs por container (camadas)', tone: 'writable' },
              { label: 'engine', content: 'Docker Engine · containerd · runc' },
              { label: 'host OS', content: 'Kernel Linux único', note: 'namespaces + cgroups isolam tudo' },
              { label: 'hardware', content: 'CPU · RAM · Disco · Rede', tone: 'base' },
            ]}
          />
        </div>
        <ComparisonTable
          accent={ACCENT}
          headers={['Critério', 'Container', 'VM']}
          rows={[
            ['Kernel', 'Compartilhado com o host', 'Próprio (duplica kernel)'],
            ['Boot', '50-500 ms', '30 s - vários minutos'],
            ['Tamanho', '~10 MB - 500 MB', '~500 MB - 20 GB'],
            ['Overhead de CPU/RAM', 'Quase zero', 'Significativo (5-15%)'],
            ['Densidade', 'Centenas por host', 'Dezenas por host'],
            ['Isolamento', 'Namespaces + cgroups (software)', 'Hardware (ring -1)'],
            ['Multi-OS', 'Só mesmo kernel (Linux/Win separados)', 'Qualquer OS em cima do host'],
            ['Uso típico', 'Microserviços, CI, dev envs', 'Tenants hostis, compliance, legacy'],
          ]}
        />
        <Callout tone="info">
          <strong>Resumo:</strong> container é isolamento feito em <em>software</em> pelo kernel do Linux (namespaces isolam o que o
          processo vê; cgroups limitam o que ele consome). VM é isolamento feito em <em>hardware</em> pelo hypervisor. Por isso
          container é leve e VM é forte — use VM quando precisar rodar código de terceiros que você não confia; use container pra
          tudo mais.
        </Callout>
      </Section>

      <Section title="A arquitetura real do Docker" accent={ACCENT}>
        <p>
          Quando você digita <InlineCode>docker run</InlineCode>, não é um binário mágico. Tem uma cadeia de processos colaborando:
        </p>
        <StackFlow
          title="O stack completo"
          accent={ACCENT}
          items={[
            {
              icon: '🖥️',
              label: 'docker CLI',
              sub: 'cliente',
              detail: 'Só um cliente HTTP. Roda como seu usuário. Nada de mágico.',
              connector: 'REST · /var/run/docker.sock',
            },
            {
              icon: '⚙️',
              label: 'dockerd',
              sub: 'daemon',
              detail: 'Roda como root. Gerencia images, networks e volumes. Fala com containerd.',
              connector: 'gRPC',
            },
            {
              icon: '📦',
              label: 'containerd',
              sub: 'runtime CNCF',
              detail: 'Runtime de alto nível. Pull/push de imagens, snapshotting, lifecycle.',
              connector: 'exec',
            },
            {
              icon: '🧬',
              label: 'runc',
              sub: 'runtime OCI',
              detail: 'Runtime de baixo nível. clone() + namespaces + cgroups + pivot_root.',
              connector: 'syscalls',
            },
            {
              icon: '🐧',
              label: 'Kernel Linux',
              sub: 'host',
              detail: 'Namespaces, cgroups, seccomp, LSM — o isolamento real acontece aqui.',
            },
          ]}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'docker CLI', v: 'Só um cliente HTTP. Roda como seu usuário. Não tem nada de mágico.' },
            { k: 'dockerd', v: 'Daemon. Recebe comandos do CLI. Historicamente monolítico, foi sendo dividido.' },
            { k: 'containerd', v: 'Runtime de alto nível. Cuida do ciclo de vida dos containers. É usado também por Kubernetes sem Docker.' },
            { k: 'runc', v: 'Runtime de baixo nível. Implementa o padrão OCI. Faz as chamadas de sistema que materializam o container.' },
            { k: 'OCI', v: 'Open Container Initiative: padrão aberto de formato de imagem e runtime. Docker doou o runc pra OCI em 2015.' },
          ]}
        />
        <Callout tone="warn">
          <strong>Por que isso importa:</strong> quando Kubernetes &ldquo;removeu o Docker&rdquo; em 2022, o que ele removeu foi o
          <em> dockerd</em>. Containers continuam rodando via containerd + runc. Imagens feitas com <InlineCode>docker build</InlineCode>
          continuam funcionando — elas são OCI, não &ldquo;Docker&rdquo;.
        </Callout>
      </Section>

      <Section title="Os 4 objetos que você precisa dominar" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Objeto', 'O que é', 'Ciclo de vida']}
          rows={[
            ['Image', 'Template imutável de um filesystem + metadata (cmd, env, ports)', 'Build → push → pull → run'],
            ['Container', 'Instância em execução (ou parada) de uma imagem + camada R/W', 'create → start → stop → rm'],
            ['Volume', 'Armazenamento persistente gerenciado pelo Docker (fora da imagem)', 'create → mount em N containers → rm'],
            ['Network', 'Rede virtual que conecta containers (com DNS embutido)', 'create → attach → disconnect → rm'],
          ]}
        />
        <p>
          Uma forma útil de pensar: <strong>imagem é uma classe, container é um objeto instanciado</strong>. Volume é estado
          persistente injetado; network é o &ldquo;barramento&rdquo; que permite containers conversarem por nome.
        </p>
      </Section>

      <Section title="Imagens: o truque das camadas (UnionFS)" accent={ACCENT}>
        <p>
          Uma imagem Docker não é um blob único. É uma <strong>pilha de camadas read-only</strong>, cada uma com um diff do
          filesystem, montadas por cima via UnionFS (overlay2 é o driver padrão hoje). Quando o container inicia, Docker coloca uma
          camada <strong>read-write</strong> no topo (&ldquo;container layer&rdquo;). Mudanças no runtime ficam lá.
        </p>
        <LayerStack
          title="Um container nginx na prática"
          accent={ACCENT}
          separatorLabel="UnionFS · overlay2"
          layers={[
            {
              label: 'camada R/W',
              content: '/var/log/nginx/*.log',
              note: 'descartada ao dar rm',
              tone: 'writable',
              separatorAfter: true,
            },
            { label: 'camada 4', instruction: 'CMD ["nginx","-g","daemon off;"]' },
            { label: 'camada 3', instruction: 'COPY nginx.conf /etc/nginx/' },
            { label: 'camada 2', instruction: 'RUN apt-get install nginx' },
            { label: 'camada 1', instruction: 'FROM debian:12-slim' },
            {
              label: 'base OS',
              content: 'Debian 12 · ~80 MB',
              note: 'read-only · compartilhada',
              tone: 'base',
            },
          ]}
        />
        <Callout tone="success">
          <strong>Consequência prática:</strong> se 10 containers usam a mesma imagem base, o Docker só armazena a base uma vez no
          disco. A mesma lógica vale para o registry — um <InlineCode>docker pull</InlineCode> só baixa camadas que você ainda não
          tem localmente. Isso é o que faz &ldquo;rebuild + push&rdquo; ser rápido quando você mudou só a última camada.
        </Callout>
      </Section>

      <Section title="Dockerfile — o DNA da imagem" accent={ACCENT}>
        <p>
          Dockerfile é um script declarativo que descreve como construir a imagem. Cada instrução de topo de linha gera uma camada
          (exceto <InlineCode>FROM</InlineCode>, <InlineCode>LABEL</InlineCode>, <InlineCode>ARG</InlineCode>, etc., que afetam
          metadata). As instruções mais usadas:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'FROM', v: 'Imagem base. Sempre a primeira linha (ou depois de ARG). Ex.: FROM node:20-alpine' },
            { k: 'WORKDIR', v: 'Muda o diretório (equivale a cd + mkdir -p). Use SEMPRE ao invés de RUN cd ...' },
            { k: 'COPY / ADD', v: 'Copia arquivos do contexto de build. Prefira COPY (ADD tem mágica de URL e tar que raramente você quer).' },
            { k: 'RUN', v: 'Executa comando no build. Cada RUN gera camada — agrupe com && para reduzir tamanho.' },
            { k: 'ENV', v: 'Variável de ambiente persistida na imagem final.' },
            { k: 'ARG', v: 'Variável só no build (não persiste no runtime).' },
            { k: 'EXPOSE', v: 'Documenta a porta que o processo usa. NÃO abre porta — só documenta (docker run -p faz o port mapping).' },
            { k: 'USER', v: 'Define o usuário do processo. Sempre use um não-root em produção.' },
            { k: 'CMD', v: 'Comando default. Pode ser sobrescrito por docker run imagem <novo-cmd>.' },
            { k: 'ENTRYPOINT', v: 'Binário fixo. docker run imagem arg1 passa arg1 como argumento, não substitui o binário.' },
            { k: 'HEALTHCHECK', v: 'Comando que o Docker roda periodicamente para saber se o container está saudável.' },
          ]}
        />
        <CodeBlock lang="dockerfile">{`# ❌ RUIM — 3 camadas, 3 passos de cache invalidados por coisas que não deveriam
FROM ubuntu:24.04
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git

# ✅ BOM — 1 camada, limpeza de cache do apt no final, menor
FROM ubuntu:24.04
RUN apt-get update \\
 && apt-get install -y --no-install-recommends curl git \\
 && rm -rf /var/lib/apt/lists/*`}</CodeBlock>
      </Section>

      <Section title="Layer caching — a diferença entre build de 3s e 3min" accent={ACCENT}>
        <p>
          Docker tenta reusar cache de cada instrução. Regra de ouro: <strong>coisas que mudam pouco primeiro; coisas que mudam
          sempre por último.</strong> Um Dockerfile comum de Node mal escrito reinstala node_modules a cada commit porque o cache
          do <InlineCode>RUN npm ci</InlineCode> é invalidado antes.
        </p>
        <CodeBlock lang="dockerfile">{`# ❌ Reinstala dependências a cada mudança de código
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
CMD ["node", "server.js"]

# ✅ Cache-friendly — deps só reinstalam quando package.json muda
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
CMD ["node", "server.js"]`}</CodeBlock>
        <Callout tone="info">
          <strong>Como ver o que invalidou o cache:</strong> rode <InlineCode>docker build --progress=plain .</InlineCode> — o BuildKit
          (default hoje) mostra CACHED vs executado para cada step.
        </Callout>
      </Section>

      <Section title="Multi-stage builds — imagens pequenas de verdade" accent={ACCENT}>
        <p>
          A ideia: <strong>um stage para compilar, outro só para rodar</strong>. O stage final recebe apenas os artefatos, sem
          toolchain, cache do gerenciador de pacotes ou fontes. Exemplos canônicos:
        </p>
        <CodeBlock lang="dockerfile">{`# ─── Node.js / TypeScript ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]`}</CodeBlock>
        <CodeBlock lang="dockerfile">{`# ─── Go (imagem final "scratch" = ~6 MB) ────────────────────────
FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/app ./cmd/api

FROM scratch
COPY --from=builder /bin/app /app
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8080
ENTRYPOINT ["/app"]`}</CodeBlock>
        <CodeBlock lang="dockerfile">{`# ─── Python (com distroless — sem shell, sem apt, ~40 MB) ───────
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM gcr.io/distroless/python3-debian12
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["server.py"]`}</CodeBlock>
        <Callout tone="success">
          <strong>Ganhos reais:</strong> uma API Node típica sai de ~1.2 GB (node + devDeps + source) para 150-250 MB (node:alpine)
          ou ~100 MB (distroless). Uma API Go sai de 900 MB para 6-12 MB (scratch). Menor imagem = pull mais rápido no deploy,
          superfície de ataque menor, menos CVEs pra triar.
        </Callout>
      </Section>

      <Section title="Escolhendo a imagem base" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Base', 'Tamanho', 'Tem shell?', 'Quando usar']}
          rows={[
            ['ubuntu / debian', '~80 MB', 'Sim (bash, apt)', 'Dev/debug, apps que exigem libs glibc completas'],
            ['*-slim', '~30-50 MB', 'Sim, enxuto', 'Default seguro pra prod quando precisa de glibc'],
            ['alpine', '~5-10 MB', 'Sim (ash, apk)', 'Prod, mas cuidado: usa musl libc (quebra libs com binários glibc)'],
            ['distroless', '~20-50 MB', 'Não', 'Prod — maior segurança, sem shell pra atacante explorar'],
            ['scratch', '0 MB', 'Não', 'Binários estáticos (Go, Rust) — o menor possível'],
          ]}
        />
        <Callout tone="warn">
          <strong>Alpine + Python/Node nativo = dor.</strong> Alpine usa <em>musl libc</em>, não glibc. Libs Python com bindings
          C (<InlineCode>psycopg2</InlineCode>, <InlineCode>pillow</InlineCode>, <InlineCode>numpy</InlineCode>) e algumas libs Node
          (<InlineCode>sharp</InlineCode>, <InlineCode>bcrypt</InlineCode>) podem precisar recompilar ou até quebrar. Em produção
          Node/Python, <InlineCode>-slim</InlineCode> costuma ser mais previsível que <InlineCode>-alpine</InlineCode>.
        </Callout>
      </Section>

      <Section title="CMD vs ENTRYPOINT — o ponto que 90% erra" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Instrução', 'Propósito', 'Sobrescrito por docker run?']}
          rows={[
            ['CMD', 'Comando default', 'Sim — docker run imagem <novo-cmd> substitui'],
            ['ENTRYPOINT', 'Binário fixo da imagem', 'Não (exceto com --entrypoint)'],
            ['ENTRYPOINT + CMD', 'Binário + args default', 'Args sobrescritos, binário mantido'],
          ]}
        />
        <CodeBlock lang="dockerfile">{`# Padrão profissional: ENTRYPOINT é o binário, CMD são flags default
ENTRYPOINT ["./myapp"]
CMD ["--port=8080", "--log-level=info"]

# docker run img              → roda: ./myapp --port=8080 --log-level=info
# docker run img --log=debug  → roda: ./myapp --log=debug
# docker run --entrypoint=sh img  → abre shell (útil pra debug)`}</CodeBlock>
        <Callout tone="danger">
          <strong>Gotcha do shell form:</strong> <InlineCode>CMD node server.js</InlineCode> (sem colchetes) roda{' '}
          <InlineCode>/bin/sh -c &quot;node server.js&quot;</InlineCode>. O <em>sh</em> vira PID 1 e não repassa SIGTERM ao node —
          seu container demora 10s pra morrer no <InlineCode>docker stop</InlineCode>. Sempre use a forma exec (JSON array):{' '}
          <InlineCode>CMD [&quot;node&quot;, &quot;server.js&quot;]</InlineCode>.
        </Callout>
      </Section>

      <Section title="Docker Compose — multi-container sem sofrimento" accent={ACCENT}>
        <p>
          Quando a aplicação tem mais de um container (app + db + cache), escrever <InlineCode>docker run</InlineCode> à mão vira
          tortura. Compose descreve tudo num YAML declarativo e sobe com <InlineCode>docker compose up</InlineCode>.
        </p>
        <CodeBlock lang="yaml">{`# compose.yaml — app Node + Postgres + Redis com healthchecks e volumes
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/app
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'docker compose up -d', v: 'Sobe tudo em background. Cria rede compose_default automaticamente.' },
            { k: 'docker compose logs -f web', v: 'Segue logs de um serviço. Use -t pra timestamps.' },
            { k: 'docker compose exec web sh', v: 'Shell dentro de um container em execução.' },
            { k: 'docker compose down -v', v: 'Para tudo e apaga volumes. Cuidado — perde dados do db.' },
            { k: 'depends_on + condition', v: 'Espera db ficar healthy antes de subir web. Evita a corrida clássica "db not ready yet".' },
          ]}
        />
        <Callout tone="info">
          <strong>DNS interno:</strong> no Compose, cada serviço é um hostname. A app Node conecta em <InlineCode>db:5432</InlineCode> —
          não precisa de IP. O Docker mantém um DNS embutido na rede bridge que resolve nomes de serviço.
        </Callout>
      </Section>

      <Section title="Redes — como containers se falam (e se isolam)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Driver', 'Uso', 'Quando escolher']}
          rows={[
            ['bridge', 'Default. Rede virtual isolada no host.', 'Dev local, Compose, single-host'],
            ['host', 'Container usa a stack de rede do host.', 'Quando precisa de perf máxima ou monitorar rede do host'],
            ['none', 'Sem rede.', 'Batch jobs isolados, compliance'],
            ['overlay', 'Rede distribuída entre múltiplos hosts.', 'Swarm ou multi-host (hoje quase sempre K8s resolve isso)'],
            ['macvlan', 'Container com IP/MAC próprios na rede física.', 'Integrar container como se fosse um host físico'],
          ]}
        />
        <CodeBlock lang="bash">{`# Criar rede bridge customizada (com DNS entre containers por nome)
docker network create backend

# Subir containers nela
docker run -d --name db --network backend postgres:16-alpine
docker run -d --name api --network backend -p 3000:3000 my-api:1.0

# Dentro do container api, conectar em "db:5432" funciona por DNS.
# O bridge default (sem --network) NÃO tem DNS por nome — sempre crie uma rede.`}</CodeBlock>
        <Callout tone="warn">
          <strong>-p host:container não &ldquo;abre porta na rede&rdquo;</strong> — ele cria um NAT no kernel do host. O container
          continua só na rede bridge interna. Isso importa quando você tem firewall: em algumas configs, <InlineCode>-p</InlineCode>{' '}
          bypassa o ufw/iptables do host porque Docker mexe direto no netfilter.
        </Callout>
      </Section>

      <Section title="Volumes — onde o estado persiste" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Origem', 'Quando usar']}
          rows={[
            ['Named volume', 'Gerenciado pelo Docker em /var/lib/docker/volumes/', 'Prod — dados do db, cache, uploads'],
            ['Bind mount', 'Caminho explícito do host', 'Dev — montar código-fonte pra hot reload'],
            ['tmpfs', 'Memória (não persiste)', 'Segredos temporários, caches de sessão'],
          ]}
        />
        <CodeBlock lang="bash">{`# Named volume (recomendado em prod)
docker run -d --name db -v pgdata:/var/lib/postgresql/data postgres:16-alpine

# Bind mount (dev — código refletindo no container)
docker run -d --name dev -v "$(pwd):/app" -w /app node:20 npm run dev

# tmpfs (dados sensíveis que não devem tocar o disco)
docker run -d --tmpfs /run/secrets:size=10M my-app:1.0

# Backup de um named volume
docker run --rm -v pgdata:/data -v "$(pwd):/backup" alpine \\
  tar czf /backup/pgdata-$(date +%F).tgz -C /data .`}</CodeBlock>
        <Callout tone="danger">
          <strong>Regra de ouro:</strong> qualquer coisa que você não pode perder fica em volume. A camada R/W do container é
          descartada no <InlineCode>docker rm</InlineCode>. Sobrescrever volume com bind mount por acidente em produção é um dos
          desastres mais comuns — cuidado com caminhos relativos em <InlineCode>compose.yaml</InlineCode>.
        </Callout>
      </Section>

      <Section title="Registries — onde as imagens vivem" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Registry', 'Hospedeiro', 'Quando usar']}
          rows={[
            ['Docker Hub', 'docker.io', 'Images públicas, OSS, prototipagem'],
            ['GHCR', 'ghcr.io (GitHub)', 'Projetos hospedados no GitHub, integra com Actions'],
            ['ECR', 'AWS', 'Prod na AWS — IAM, scanning, regional'],
            ['GCR / Artifact Registry', 'Google Cloud', 'Prod no GCP'],
            ['ACR', 'Azure', 'Prod no Azure'],
            ['Harbor / self-hosted', 'Seu cluster', 'Air-gapped, compliance, custo'],
          ]}
        />
        <CodeBlock lang="bash">{`# Tag + push pro GHCR
docker build -t ghcr.io/me/app:1.2.0 -t ghcr.io/me/app:latest .
echo "$GH_TOKEN" | docker login ghcr.io -u me --password-stdin
docker push ghcr.io/me/app:1.2.0
docker push ghcr.io/me/app:latest`}</CodeBlock>
        <Callout tone="info">
          <strong>Tag imutável:</strong> evite fazer deploy baseado em <InlineCode>:latest</InlineCode> — é uma referência móvel.
          Prod deve apontar para tags versionadas (<InlineCode>:1.2.0</InlineCode>) ou digests (<InlineCode>@sha256:abc...</InlineCode>),
          que são criptograficamente imutáveis.
        </Callout>
      </Section>

      <Section title="Segurança — checklist mínimo de produção" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Não rode como root', v: 'Crie um user no Dockerfile (USER appuser) ou --user 1000:1000 no run. Container root = root no kernel do host em muitas situações.' },
            { k: 'Filesystem read-only', v: 'docker run --read-only + --tmpfs /tmp. App não consegue escrever em /etc, /usr, /bin.' },
            { k: 'Drop capabilities', v: '--cap-drop=ALL --cap-add=NET_BIND_SERVICE. Container sem capabilities desnecessárias é muito mais difícil de escalar.' },
            { k: 'Seccomp profile', v: 'Docker tem um profile default que bloqueia ~40 syscalls perigosas. Não desabilite com --security-opt seccomp=unconfined em prod.' },
            { k: 'Sem --privileged', v: '--privileged desliga quase todo o isolamento. Use --cap-add específico se precisar de permissão fina.' },
            { k: 'Scan de imagem', v: 'docker scout cves minha-img:1.0 ou Trivy. Rode no CI e falhe builds com CVE High/Critical.' },
            { k: 'Não copie segredos pra imagem', v: 'Nunca COPY .env. Use --secret do BuildKit ou secrets do Compose. Segredo na imagem vaza no registry.' },
            { k: 'Rootless Docker', v: 'Alternativa: rodar dockerd como usuário não-root. Mitiga boa parte do risco de escape.' },
          ]}
        />
        <CodeBlock lang="dockerfile">{`# Padrão production-hardened (Node)
FROM node:20-alpine AS runner
WORKDIR /app

# Usuário não-root
RUN addgroup -S app && adduser -S app -G app
COPY --chown=app:app . .
RUN npm ci --omit=dev

USER app
EXPOSE 3000

# Healthcheck pra orquestrador reiniciar container travado
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["node"]
CMD ["server.js"]`}</CodeBlock>
      </Section>

      <Section title="CLI essencial — os comandos que você usa toda semana" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Imagens
docker build -t app:1.0 .           # build do diretório atual
docker images                       # lista imagens locais
docker tag app:1.0 ghcr.io/me/app:1.0
docker push ghcr.io/me/app:1.0
docker pull nginx:1.27-alpine
docker rmi app:0.9                  # remove imagem

# Containers
docker run -d --name web -p 80:80 nginx:1.27-alpine
docker ps                           # containers em execução
docker ps -a                        # inclui parados
docker logs -f --tail 100 web       # logs ao vivo
docker exec -it web sh              # shell dentro
docker stop web && docker rm web    # para e remove
docker restart web

# Inspeção / debug
docker inspect web                  # JSON com tudo (rede, mounts, env)
docker stats                        # top de CPU/mem por container
docker top web                      # processos dentro do container
docker diff web                     # o que mudou na camada R/W
docker port web                     # mapa de portas

# Limpeza (cuidado em prod — apaga de verdade)
docker system df                    # quanto disco está sendo usado
docker system prune -a --volumes    # apaga imagens, containers, volumes não usados
docker builder prune                # só o cache do BuildKit`}</CodeBlock>
      </Section>

      <Section title="BuildKit — o build moderno" accent={ACCENT}>
        <p>
          Desde o Docker 23, BuildKit é o builder default. Habilita recursos que o build antigo não tinha:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Build paralelo', v: 'Stages independentes compilam em paralelo.' },
            { k: 'Cache mounts', v: 'RUN --mount=type=cache,target=/root/.npm npm ci — persiste o cache do npm entre builds.' },
            { k: 'Secret mounts', v: 'RUN --mount=type=secret,id=npmrc npm ci — segredo some após o RUN, não fica na camada.' },
            { k: 'SSH mount', v: 'RUN --mount=type=ssh git clone ... — usa sua chave sem copiá-la pra imagem.' },
            { k: 'Build multi-arch', v: 'docker buildx build --platform linux/amd64,linux/arm64 — uma imagem pra Mac M-series + servers x86.' },
          ]}
        />
        <CodeBlock lang="dockerfile">{`# Cache mount: npm ci fica MUITO mais rápido em rebuilds
# syntax=docker/dockerfile:1.7
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev
COPY . .
CMD ["node", "server.js"]`}</CodeBlock>
      </Section>

      <Section title="Armadilhas comuns (que você vai encontrar mais cedo ou mais tarde)" accent={ACCENT}>
        <Callout tone="warn" icon="🪤">
          <strong>1. PID 1 e sinais.</strong> Se você roda <InlineCode>CMD bash script.sh</InlineCode> (shell form), o <em>bash</em> vira
          PID 1 e não propaga SIGTERM. Container demora 10s pra morrer. Use forma exec ou adicione um init como{' '}
          <InlineCode>tini</InlineCode> (flag <InlineCode>--init</InlineCode> do <InlineCode>docker run</InlineCode>).
        </Callout>
        <Callout tone="warn" icon="🪤">
          <strong>2. Zombies em Node/Python.</strong> Mesma causa do PID 1. Node não faz <InlineCode>wait()</InlineCode> em filhos
          órfãos. Rode com <InlineCode>--init</InlineCode> ou use <InlineCode>dumb-init</InlineCode> como ENTRYPOINT.
        </Callout>
        <Callout tone="warn" icon="🪤">
          <strong>3. node_modules do host vazando pro container.</strong> Num bind mount de dev,{' '}
          <InlineCode>-v $(pwd):/app</InlineCode> sobrescreve <InlineCode>/app/node_modules</InlineCode> com o do Mac (que pode ter
          binários macOS). Solução: volume anônimo em cima — <InlineCode>-v /app/node_modules</InlineCode>.
        </Callout>
        <Callout tone="warn" icon="🪤">
          <strong>4. .dockerignore esquecido.</strong> Sem ele, o Docker manda <InlineCode>node_modules</InlineCode>,{' '}
          <InlineCode>.git</InlineCode>, <InlineCode>.env</InlineCode> e dumps de db pro contexto de build. Lentidão + potencial
          vazamento de segredo.
        </Callout>
        <Callout tone="warn" icon="🪤">
          <strong>5. localhost dentro do container não é localhost do host.</strong> App dentro do container que faz fetch em{' '}
          <InlineCode>http://localhost:5432</InlineCode> está chamando ele mesmo. Pra acessar o host, use{' '}
          <InlineCode>host.docker.internal</InlineCode> (Docker Desktop) ou <InlineCode>--add-host</InlineCode>.
        </Callout>
        <Callout tone="warn" icon="🪤">
          <strong>6. Imagens multi-arch e Mac M-series.</strong> Uma imagem só para <InlineCode>linux/amd64</InlineCode> roda em Mac
          M via emulação Rosetta — lenta. Use <InlineCode>buildx</InlineCode> com <InlineCode>--platform</InlineCode> e publique
          multi-arch.
        </Callout>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="API Node 20 para produção: qual base usar?"
          winner="node:20-slim + multi-stage"
          winnerColor={ACCENT}
          why="Slim tem glibc (compatível com toda lib nativa do npm), é ~60 MB, e num multi-stage o stage final só recebe dist + node_modules --omit=dev. Prod roda em ~180 MB, previsível."
          alternatives={[
            { name: 'node:20-alpine', note: 'menor (~30 MB), mas musl libc quebra bcrypt/sharp/node-gyp em casos comuns — investir em troubleshooting.' },
            { name: 'distroless', note: 'mais seguro (sem shell), mas dificulta debug. Use quando maturidade de ops for alta.' },
          ]}
        />
        <DecisionBox
          scenario="Preciso de hot reload no dev, mas o código está no Mac e o container em Linux"
          winner="Bind mount + volume anônimo em node_modules"
          winnerColor={ACCENT}
          why="-v $(pwd):/app monta o código (hot reload funciona). -v /app/node_modules cria volume anônimo em cima, preservando os módulos instalados no build (evita conflito de binários Mac vs Linux)."
          alternatives={[{ name: 'Sem bind, rebuild a cada mudança', note: 'lento demais pra DX — inviável.' }]}
        />
        <DecisionBox
          scenario="Meu CI demora 8 min no build de uma API Python"
          winner="Cache mount do pip via BuildKit + ordem correta de COPY"
          winnerColor={ACCENT}
          why="RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt reusa cache entre builds. Com COPY requirements.txt antes do COPY . ., deps só reinstalam quando requirements muda."
          alternatives={[{ name: 'Só multi-stage', note: 'reduz imagem final mas não reduz o tempo de build — ataca problema diferente.' }]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Docker vai morrer porque Kubernetes &ldquo;removeu&rdquo; o Docker?"
          a={
            <>
              Não. O K8s deixou de usar <InlineCode>dockershim</InlineCode> (a camada que falava com o dockerd); agora usa
              containerd direto. Mas <strong>imagens Docker continuam rodando</strong> — elas são OCI. Pra desenvolvedor,{' '}
              <InlineCode>docker build</InlineCode> e <InlineCode>docker push</InlineCode> seguem sendo o fluxo padrão.
            </>
          }
        />
        <QAItem
          q="Qual a diferença entre COPY e ADD?"
          a="COPY só copia arquivos. ADD também extrai tar.gz automaticamente e aceita URL — comportamento mágico que quase ninguém quer. Regra prática: use COPY, use ADD só se precisar do comportamento extra de propósito."
        />
        <QAItem
          q="Por que minha imagem está 1.5 GB se meu binário tem 20 MB?"
          a="Quase sempre é (1) base grande (ubuntu puro vs slim) + (2) toolchain no stage final (gcc, make, headers) + (3) cache de package manager não limpo (/var/lib/apt/lists/, /root/.npm). Solução: base slim/alpine + multi-stage + limpar cache no mesmo RUN do install."
        />
        <QAItem
          q="É seguro rodar docker em prod?"
          a={
            <>
              Sim, desde que você trate container como &ldquo;processo privilegiado&rdquo;, não como VM. Use usuário não-root, drop
              de capabilities, filesystem read-only, scan de CVE, registry privado. O maior risco não é o Docker em si — é
              desenvolvedor rodando <InlineCode>--privileged</InlineCode> em produção porque &ldquo;funcionou no dev&rdquo;.
            </>
          }
        />
        <QAItem
          q="Preciso aprender Docker antes de Kubernetes?"
          a="Sim, com folga. K8s orquestra containers — você precisa entender imagem, Dockerfile, volume e rede primeiro. Pular direto pra K8s é aprender a dirigir antes de saber o que é um carro."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) Container é processo isolado por namespaces+cgroups, não VM. (2) Imagem é pilha de camadas
        — cacheie agressivamente (muda-raro primeiro, muda-sempre depois). (3) Multi-stage é obrigatório em prod — separa builder
        do runner. (4) Use imagem base certa (slim/alpine/distroless/scratch) pro seu caso; alpine quebra libs nativas com frequência.
        (5) ENTRYPOINT pro binário, CMD pros args default; sempre forma exec. (6) Volume pra tudo que não pode perder; bind mount só
        pra dev. (7) Rede bridge customizada dá DNS entre containers; porta com -p é NAT, não exposição real. (8) Segurança = não-root,
        read-only FS, drop caps, scan de CVE, secrets via BuildKit. O próximo módulo (Kubernetes) orquestra tudo isso em escala.
      </Callout>
    </div>
  );
}
