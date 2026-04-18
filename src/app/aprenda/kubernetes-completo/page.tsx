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
  SplitFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('kubernetes-completo');

const ACCENT = '#326ce5';

const quiz: QuizQuestion[] = [
  {
    question:
      'Por que quase nunca você cria um Pod diretamente em produção?',
    options: [
      'Porque Pod é ilegal em clusters com RBAC',
      'Porque Pod sozinho é mortal: se o node cai, o Pod é perdido e ninguém o recria. Deployment (ou StatefulSet/DaemonSet) é quem garante réplicas, rolling updates e self-healing',
      'Porque Pod só roda um container',
      'Porque Pod não tem IP',
    ],
    correct: 1,
    explanation:
      'Pod é a unidade atômica de execução, mas é "descartável". Deployment cria ReplicaSet, que garante N Pods rodando sempre. Se um Pod morre, o controller sobe outro em outro node. Criar Pod direto é útil só pra debug (kubectl run --rm -it).',
  },
  {
    question:
      'Qual Service você usa para expor um app HTTP interno para o mundo, com TLS e roteamento por host/path?',
    options: [
      'Service type=LoadBalancer em cada app',
      'Ingress (com um Ingress Controller como nginx-ingress ou Traefik) roteando para Services ClusterIP internos',
      'Service type=NodePort e firewall no node',
      'Pod com hostNetwork=true',
    ],
    correct: 1,
    explanation:
      'Ingress é a camada L7 (HTTP) do K8s: regras por host/path, TLS, reescrita de URL. Ele roteia para Services ClusterIP (internos). Usar LoadBalancer por app na AWS cria um ELB por serviço — caro e mal indexado. O padrão é 1 LoadBalancer → Ingress Controller → muitos Services.',
  },
  {
    question:
      'O que acontece quando você roda `kubectl apply -f deployment.yaml` alterando a imagem de v1 para v2?',
    options: [
      'K8s mata todos os Pods e cria novos — downtime total',
      'Deployment dispara rolling update: cria Pods v2 um a um, espera readiness probe passar, e só então derruba Pods v1 na mesma proporção (maxSurge/maxUnavailable)',
      'Só o Service é atualizado, Pods ficam na v1',
      'K8s pede confirmação manual',
    ],
    correct: 1,
    explanation:
      'Rolling update é o default. maxSurge (quantos a mais podem existir) e maxUnavailable (quantos podem estar indisponíveis) controlam o ritmo. Se a readiness probe falha no v2, o rollout pausa e você pode dar `kubectl rollout undo`. É zero-downtime se os probes estiverem bem configurados.',
  },
  {
    question:
      'Você tem um ConfigMap com 50 variáveis de ambiente e precisa garantir que mudanças nele reflitam no Pod. Qual é a pegadinha?',
    options: [
      'K8s recria o Pod automaticamente quando o ConfigMap muda',
      'Variáveis de ambiente vindas de ConfigMap são injetadas só no start do Pod — mudanças no ConfigMap NÃO propagam. Você precisa disparar rollout (kubectl rollout restart) ou usar o ConfigMap como volume (que sim, é atualizado)',
      'ConfigMap não suporta 50 variáveis',
      'Precisa reiniciar o kubelet',
    ],
    correct: 1,
    explanation:
      'Essa é uma das armadilhas mais comuns. envFrom.configMapRef = snapshot no start. Mount como volume = arquivo atualizado dinamicamente (alguns segundos de delay), mas seu app precisa re-ler. Padrão profissional: usar annotation com hash do ConfigMap no PodTemplate pra forçar rollout quando muda.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="kubernetes-completo"
      title="Kubernetes Completo: do Pod ao cluster de produção"
      icon="☸️"
      xp={120}
      readTime={28}
      trailName="DevOps & Containers"
      trailColor={ACCENT}
      nextSlug=""
      nextTitle=""
      relatedSlugs={['docker-completo','github-actions-cicd','observability-pilares']}
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
        Kubernetes é um orquestrador de containers. Tradução: ele pega centenas de containers, distribui em dezenas de servidores,
        garante que o número certo esteja rodando, reinicia os que quebram, escala por carga, faz deploy sem downtime, roteia
        tráfego e cuida de estado persistente. É gigante porque os problemas que ele resolve são gigantes. Este guia cobre
        arquitetura do control plane, todos os objetos que você realmente usa (Pod, Deployment, Service, Ingress, ConfigMap,
        Secret, PVC, Namespace), RBAC, autoscaling, Helm, observabilidade e os comandos de <InlineCode>kubectl</InlineCode> que
        resolvem 95% dos casos. Pré-requisito: entender Docker (se não entende, volte um módulo).
      </p>

      <Section title="Por que K8s existe: o problema que ele resolve" accent={ACCENT}>
        <p>
          Com Docker você sobe um container numa máquina. Mas produção real tem perguntas chatas:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Como ter N réplicas?', v: 'Se um container cai às 3h da manhã, quem sobe outro?' },
            { k: 'Como distribuir em vários hosts?', v: 'Meu app não cabe num único server — onde cada container roda?' },
            { k: 'Como fazer deploy sem downtime?', v: 'Rolling update, canary, blue/green — precisa de alguém coordenando.' },
            { k: 'Como escalar com a carga?', v: 'Sexta 18h bate 10x o tráfego — alguém precisa subir réplicas sozinho.' },
            { k: 'Como rotear tráfego?', v: 'Um endpoint público pra 50 services internos, com TLS e load balancing.' },
            { k: 'Como cuidar de estado?', v: 'Banco, cache, fila — precisa de volume persistente que sobrevive reschedule de Pod.' },
            { k: 'Como falar entre services?', v: 'DNS, descoberta, retries — infra de service mesh.' },
            { k: 'Como gerenciar config e segredo?', v: 'Rotação, separação por ambiente, sem vazar em repo.' },
          ]}
        />
        <p>
          K8s responde todas essas. O custo é complexidade e uma curva de aprendizado real. Para apps pequenos um único
          container num servidor basta; K8s começa a valer a pena quando você tem múltiplos serviços, SLA de uptime, ou precisa
          de escalabilidade elástica.
        </p>
      </Section>

      <Section title="A arquitetura: Control Plane + Data Plane" accent={ACCENT}>
        <SplitFlow
          title="Anatomia de um cluster"
          accent={ACCENT}
          center="watch / exec"
          left={{
            label: 'Control Plane (cérebro)',
            items: [
              { icon: '🛡️', label: 'kube-apiserver', sub: 'única porta de entrada — REST/gRPC' },
              { icon: '💾', label: 'etcd', sub: 'estado do cluster (Raft)' },
              { icon: '🎯', label: 'scheduler', sub: 'decide qual node roda qual Pod' },
              { icon: '🔁', label: 'controller-manager', sub: 'loops de reconciliação' },
            ],
          }}
          right={{
            label: 'Data Plane (nodes)',
            items: [
              { icon: '🤖', label: 'kubelet', sub: 'agente em cada node' },
              { icon: '🔀', label: 'kube-proxy', sub: 'regras iptables/ipvs para Services' },
              { icon: '📦', label: 'container runtime', sub: 'containerd → runc' },
              { icon: '🧩', label: 'Pods', sub: 'as cargas de trabalho' },
            ],
          }}
        />
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'kube-apiserver', v: 'A única porta de entrada. Tudo (kubectl, controllers, kubelet) fala com ele. REST + gRPC.' },
            { k: 'etcd', v: 'Key-value distribuído (Raft) onde vive o estado desejado do cluster. Se perde etcd, perde o cluster.' },
            { k: 'scheduler', v: 'Observa Pods sem node atribuído e decide em qual node rodar (afinidade, recursos, taints).' },
            { k: 'controller-manager', v: 'Loop de reconciliação: "estado atual ≠ estado desejado? ajustar". Dezenas de controllers (Deployment, Node, Endpoint...).' },
            { k: 'cloud-controller', v: 'Integra com a cloud (load balancer, volume, node). Separado para clouds customizarem.' },
            { k: 'kubelet', v: 'Agente em cada node. Recebe do apiserver quais Pods rodar e fala com o runtime (containerd).' },
            { k: 'kube-proxy', v: 'Programa regras iptables/ipvs que implementam Services. É o "roteamento" interno do cluster.' },
            { k: 'container runtime', v: 'containerd (default moderno) ou CRI-O. Quem realmente cria os containers via runc.' },
          ]}
        />
        <Callout tone="info">
          <strong>Mental model:</strong> K8s é um <em>loop de reconciliação</em>. Você declara o desejado (YAML com &ldquo;quero 3
          réplicas da v2&rdquo;), salva no etcd via apiserver, e controllers trabalham em loop infinito pra fazer a realidade bater
          com o desejo. Não é um scheduler de jobs — é um sistema de &ldquo;convergência contínua&rdquo;.
        </Callout>
      </Section>

      <Section title="Pod — a unidade atômica" accent={ACCENT}>
        <p>
          Pod é o menor objeto que o K8s agenda. Um Pod é <strong>um ou mais containers</strong> que compartilham rede (mesmo IP,
          localhost entre eles), volumes e ciclo de vida. Na prática, 95% dos Pods têm 1 container. Multi-container Pod é o padrão
          &ldquo;sidecar&rdquo; (ex.: app + proxy Envoy, app + log shipper).
        </p>
        <CodeBlock lang="yaml">{`apiVersion: v1
kind: Pod
metadata:
  name: nginx
  labels:
    app: web
spec:
  containers:
    - name: nginx
      image: nginx:1.27-alpine
      ports:
        - containerPort: 80
      resources:
        requests: { cpu: 100m, memory: 64Mi }
        limits:   { cpu: 500m, memory: 256Mi }`}</CodeBlock>
        <ComparisonTable
          accent={ACCENT}
          headers={['Coisa', 'Entre containers DO mesmo Pod', 'Entre Pods']}
          rows={[
            ['Rede', 'localhost, mesma IP', 'IP próprio, via Service'],
            ['Volume', 'Podem montar o mesmo', 'Não compartilham (use PVC)'],
            ['Ciclo de vida', 'Pod cai, todos caem juntos', 'Independente'],
          ]}
        />
        <Callout tone="warn">
          <strong>Não crie Pod direto em prod.</strong> Se o node morre, o Pod é perdido e ninguém o recria — Pod não tem
          &ldquo;controller&rdquo;. Use Deployment (stateless), StatefulSet (stateful), DaemonSet (um por node), Job/CronJob
          (batch). Pod nu é só pra debug: <InlineCode>kubectl run --rm -it debug --image=alpine -- sh</InlineCode>.
        </Callout>
      </Section>

      <Section title="Deployment + ReplicaSet — como apps stateless rodam" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          items={[
            {
              icon: '📝',
              label: 'Deployment',
              sub: 'você escreve',
              detail: 'YAML declarativo com a imagem, réplicas, estratégia de update. A única coisa que a equipe edita.',
              connector: 'gera e controla',
            },
            {
              icon: '🧬',
              label: 'ReplicaSets',
              sub: 'histórico + atual',
              detail: 'v1 (antiga) permanece como histórico pra rollback; v2 (atual) é a versão alvo sendo aplicada.',
              connector: 'rolling update',
            },
            {
              icon: '📦',
              label: 'Pods',
              sub: 'rodam de fato',
              detail: 'v1 são derrubados gradualmente enquanto v2 sobem. Tráfego segue via Service sem interrupção.',
            },
          ]}
        />
        <CodeBlock lang="yaml">{`apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels: { app: api }
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1            # 1 a mais pode existir durante o rollout
      maxUnavailable: 0      # nenhum pode estar indisponível
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: ghcr.io/me/api:1.2.0
          ports: [{ containerPort: 3000 }]
          env:
            - name: DATABASE_URL
              valueFrom: { secretKeyRef: { name: api-secrets, key: db-url } }
          readinessProbe:
            httpGet: { path: /health, port: 3000 }
            initialDelaySeconds: 3
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /health, port: 3000 }
            initialDelaySeconds: 15
            periodSeconds: 20
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { cpu: 500m, memory: 512Mi }`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'replicas', v: 'Quantos Pods o ReplicaSet mantém.' },
            { k: 'selector + labels', v: 'Como o Deployment sabe quais Pods são dele. Nunca mude labels de um Deployment vivo.' },
            { k: 'strategy', v: 'RollingUpdate (default) ou Recreate (derruba tudo, sobe v2). Recreate = downtime.' },
            { k: 'readinessProbe', v: 'Quando o Pod está pronto para receber tráfego. Falhou = removido do Service (mas não morto).' },
            { k: 'livenessProbe', v: 'Quando o Pod está vivo. Falhou = kubelet reinicia o container.' },
            { k: 'resources.requests', v: 'Scheduler usa pra decidir em qual node cabe.' },
            { k: 'resources.limits', v: 'Kernel mata o Pod (OOMKill) se passar de memória; throttle em CPU.' },
          ]}
        />
        <Callout tone="success">
          <strong>Comandos de rollout essenciais:</strong>{' '}
          <InlineCode>kubectl rollout status deploy/api</InlineCode>,{' '}
          <InlineCode>kubectl rollout history deploy/api</InlineCode>,{' '}
          <InlineCode>kubectl rollout undo deploy/api</InlineCode>.
        </Callout>
      </Section>

      <Section title="StatefulSet, DaemonSet, Job — quando usar cada um" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Controller', 'Propósito', 'Exemplos']}
          rows={[
            ['Deployment', 'Apps stateless com N réplicas intercambiáveis', 'API HTTP, worker de fila, frontend'],
            ['StatefulSet', 'Pods com identidade estável (pod-0, pod-1) e PVC por Pod', 'Postgres, Kafka, Elasticsearch, Redis cluster'],
            ['DaemonSet', 'Um Pod por node (ou subset via nodeSelector)', 'Log collector (fluentd), node exporter, CNI'],
            ['Job', 'Roda até completar N vezes com sucesso', 'Migração de schema, export de dados'],
            ['CronJob', 'Job em schedule cron', 'Backup noturno, cleanup de lixo, relatório diário'],
          ]}
        />
        <Callout tone="info">
          <strong>StatefulSet vs Deployment:</strong> StatefulSet garante nomes estáveis (<InlineCode>db-0</InlineCode>,{' '}
          <InlineCode>db-1</InlineCode>) e volume persistente por Pod (<InlineCode>volumeClaimTemplates</InlineCode>). Se{' '}
          <InlineCode>db-0</InlineCode> morre e volta, reengancha no <strong>mesmo</strong> PVC. Essencial pra bancos e sistemas
          distribuídos que precisam saber quem é o líder/follower.
        </Callout>
      </Section>

      <Section title="Services — 4 tipos, 4 propósitos" accent={ACCENT}>
        <p>
          Service é o objeto que dá <strong>endpoint estável</strong> pra um conjunto de Pods. Pods morrem e nascem com IPs
          diferentes; Service tem um IP virtual (ClusterIP) e um nome DNS (<InlineCode>api.default.svc.cluster.local</InlineCode>)
          que persistem.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Escopo', 'Quando usar']}
          rows={[
            ['ClusterIP', 'Só dentro do cluster', 'Default. Comunicação entre services.'],
            ['NodePort', 'Expõe em uma porta 30000-32767 de cada node', 'Dev, on-prem sem LoadBalancer, debug'],
            ['LoadBalancer', 'Pede LB externo à cloud (ELB, GLB, Azure LB)', 'Produção cloud — expõe um service ao mundo'],
            ['ExternalName', 'DNS CNAME pra fora do cluster', 'Apontar pra RDS externo, API parceira'],
            ['Headless (clusterIP: None)', 'Sem IP virtual, só DNS de Pods', 'StatefulSet — cada Pod precisa ser endereçado'],
          ]}
        />
        <CodeBlock lang="yaml">{`apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  type: ClusterIP
  selector: { app: api }
  ports:
    - port: 80           # a porta do Service
      targetPort: 3000   # a porta do container nos Pods`}</CodeBlock>
        <Callout tone="warn">
          <strong>LoadBalancer por service fica caro.</strong> Cada Service type=LoadBalancer na AWS cria um ELB = US$ ~16/mês
          + tráfego. Em vez disso, o padrão é: 1 LoadBalancer → Ingress Controller → muitos Services ClusterIP. Um LB só,
          roteamento L7.
        </Callout>
      </Section>

      <Section title="Ingress — o roteamento HTTP do cluster" accent={ACCENT}>
        <p>
          Service opera em L4 (TCP/UDP). Pra roteamento HTTP/S por host ou path com TLS, você quer{' '}
          <strong>Ingress</strong>. Mas Ingress por si só é só uma <em>regra</em> — precisa de um <strong>Ingress Controller</strong>
          (pod que efetivamente faz o roteamento). Os mais comuns: <InlineCode>nginx-ingress</InlineCode>,{' '}
          <InlineCode>Traefik</InlineCode>, <InlineCode>HAProxy</InlineCode>, <InlineCode>AWS ALB Controller</InlineCode>.
        </p>
        <StackFlow
          accent={ACCENT}
          items={[
            {
              icon: '🌐',
              label: 'Internet',
              sub: 'cliente',
              detail: 'Browser ou API externa resolve api.meusite.com via DNS.',
              connector: 'DNS → IP do LB',
            },
            {
              icon: '⚖️',
              label: 'LoadBalancer',
              sub: '1 por cluster',
              detail: 'NLB/ALB/ELB provisionado pelo cloud provider quando você cria Service type=LoadBalancer.',
              connector: 'TCP/HTTPS',
            },
            {
              icon: '🚪',
              label: 'Ingress Controller',
              sub: 'pod nginx/traefik',
              detail: 'host=api.meusite.com /v1/* → api-v1 · /v2/* → api-v2 · host=app.meusite.com /* → frontend',
              connector: 'roteia por host/path',
            },
            {
              icon: '🧭',
              label: 'Service ClusterIP',
              sub: 'selector',
              detail: 'IP virtual estável que faz balanceamento interno entre os Pods que bate o label selector.',
              connector: 'encaminha',
            },
            {
              icon: '📦',
              label: 'Pods',
              sub: 'alvo final',
              detail: 'Containers da aplicação recebem o tráfego. Escalam horizontalmente via HPA.',
            },
          ]}
        />
        <CodeBlock lang="yaml">{`apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts: [api.meusite.com]
      secretName: api-tls
  rules:
    - host: api.meusite.com
      http:
        paths:
          - path: /v1
            pathType: Prefix
            backend:
              service: { name: api-v1, port: { number: 80 } }
          - path: /v2
            pathType: Prefix
            backend:
              service: { name: api-v2, port: { number: 80 } }`}</CodeBlock>
      </Section>

      <Section title="ConfigMap e Secret — separar código de config" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Objeto', 'Conteúdo', 'Como injetar']}
          rows={[
            ['ConfigMap', 'Config não-sensível (feature flags, URLs, tunings)', 'env var, volume de arquivo, argv'],
            ['Secret', 'Segredo (senha de db, API key, TLS cert)', 'env var ou volume (preferível volume)'],
          ]}
        />
        <CodeBlock lang="yaml">{`apiVersion: v1
kind: ConfigMap
metadata: { name: app-config }
data:
  LOG_LEVEL: info
  FEATURE_NEW_DASHBOARD: "true"
---
apiVersion: v1
kind: Secret
metadata: { name: app-secrets }
type: Opaque
stringData:
  db-url: postgres://user:pass@db:5432/app
  jwt-key: "super-secret-change-me"
---
# no Pod spec
spec:
  containers:
    - name: app
      image: me/app:1.0
      envFrom:
        - configMapRef: { name: app-config }
      env:
        - name: DB_URL
          valueFrom: { secretKeyRef: { name: app-secrets, key: db-url } }`}</CodeBlock>
        <Callout tone="danger">
          <strong>Secret NÃO é criptografado por default no etcd</strong> — só codificado em base64. Habilite{' '}
          <em>encryption-at-rest</em> no kube-apiserver (KMS provider) em produção. Para segredos críticos, use{' '}
          <InlineCode>External Secrets Operator</InlineCode> + Vault / AWS Secrets Manager / Azure Key Vault — o Secret no cluster
          fica sincronizado do cofre real, nunca em plaintext no git.
        </Callout>
        <Callout tone="warn">
          <strong>Mudança de ConfigMap não reinicia Pod automaticamente.</strong> Se você usa{' '}
          <InlineCode>envFrom</InlineCode>, o valor é congelado no start. Soluções: (1) mount como volume (atualiza sozinho) e o
          app faz re-load; (2) adicionar annotation com hash do ConfigMap no PodTemplate (<InlineCode>Reloader</InlineCode> é um
          operator que faz isso automaticamente).
        </Callout>
      </Section>

      <Section title="Storage — PV, PVC, StorageClass" accent={ACCENT}>
        <p>
          Volumes em K8s são uma abstração em 3 camadas:
        </p>
        <StackFlow
          accent={ACCENT}
          items={[
            {
              icon: '⚙️',
              label: 'StorageClass',
              sub: 'admin cria 1x',
              detail: 'Define como provisionar: driver (EBS gp3, NFS, Ceph…), parâmetros, reclaim policy.',
              connector: 'referenciado por',
            },
            {
              icon: '📮',
              label: 'PersistentVolumeClaim',
              sub: 'app pede',
              detail: '"Quero 20Gi ReadWriteOnce do storageClass=gp3." É a demanda escrita pela aplicação.',
              connector: 'bound em',
            },
            {
              icon: '💾',
              label: 'PersistentVolume',
              sub: 'recurso real',
              detail: 'Volume provisionado dinamicamente (ex: EBS vol-abc123) que atende o PVC.',
              connector: 'mount em',
            },
            {
              icon: '📦',
              label: 'Pod',
              sub: 'consome',
              detail: 'Monta o PV em /var/lib/postgresql/data — filesystem persistente entre restarts.',
            },
          ]}
        />
        <CodeBlock lang="yaml">{`# PVC dinâmico: o StorageClass provisiona o PV sozinho
apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: pg-data }
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: gp3
  resources:
    requests: { storage: 20Gi }
---
apiVersion: v1
kind: Pod
metadata: { name: postgres }
spec:
  containers:
    - name: pg
      image: postgres:16-alpine
      volumeMounts:
        - { name: data, mountPath: /var/lib/postgresql/data }
  volumes:
    - name: data
      persistentVolumeClaim: { claimName: pg-data }`}</CodeBlock>
        <ComparisonTable
          accent={ACCENT}
          headers={['accessMode', 'Significado', 'Backends típicos']}
          rows={[
            ['ReadWriteOnce (RWO)', 'Montado R/W em um node por vez', 'EBS, disk volumes'],
            ['ReadOnlyMany (ROX)', 'Vários Pods, só leitura', 'Config/assets em NFS'],
            ['ReadWriteMany (RWX)', 'Vários Pods, todos R/W', 'EFS, CephFS, GlusterFS'],
            ['ReadWriteOncePod (RWOP)', 'Um único Pod R/W (mais forte que RWO)', 'PV para Pods únicos'],
          ]}
        />
      </Section>

      <Section title="Namespaces — multi-tenancy dentro do cluster" accent={ACCENT}>
        <p>
          Namespace é um agrupamento lógico. Recursos com o mesmo nome podem coexistir em namespaces diferentes. Default quando
          você não define: <InlineCode>default</InlineCode>. Do sistema: <InlineCode>kube-system</InlineCode> (control plane),{' '}
          <InlineCode>kube-public</InlineCode>.
        </p>
        <CodeBlock lang="bash">{`kubectl create namespace staging
kubectl apply -f deployment.yaml -n staging
kubectl get pods -n staging
kubectl config set-context --current --namespace=staging   # fica no ns`}</CodeBlock>
        <Callout tone="info">
          Namespace <strong>não é barreira de segurança forte</strong>. Serve pra organizar, aplicar quota (<InlineCode>ResourceQuota</InlineCode>),
          e anexar políticas (RBAC, NetworkPolicy). Pra isolamento forte (tenants hostis), use clusters separados.
        </Callout>
      </Section>

      <Section title="RBAC — controle de acesso" accent={ACCENT}>
        <p>
          4 objetos:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Role', v: 'Coleção de permissões (verbos: get, list, watch, create, update, delete) sobre recursos em UM namespace.' },
            { k: 'ClusterRole', v: 'Igual, mas cluster-wide. Nodes, PVs, CRDs vivem aqui.' },
            { k: 'RoleBinding', v: 'Liga uma Role a um Subject (User, Group, ServiceAccount) num namespace.' },
            { k: 'ClusterRoleBinding', v: 'Liga ClusterRole a Subject cluster-wide.' },
          ]}
        />
        <CodeBlock lang="yaml">{`# Permite que o SA "deployer" faça qualquer coisa com Deployments em prod
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deployer
  namespace: prod
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployer-bind
  namespace: prod
subjects:
  - kind: ServiceAccount
    name: ci-bot
    namespace: ci
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: deployer`}</CodeBlock>
      </Section>

      <Section title="Autoscaling — HPA, VPA, Cluster Autoscaler" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Autoscaler', 'O que escala', 'Baseado em']}
          rows={[
            ['HorizontalPodAutoscaler (HPA)', 'Número de réplicas do Deployment', 'CPU, memória, custom metrics (Prometheus)'],
            ['VerticalPodAutoscaler (VPA)', 'Requests/limits do Pod', 'Histórico de uso — recomenda ou ajusta'],
            ['Cluster Autoscaler', 'Número de nodes', 'Pods pendentes que não cabem nos nodes atuais'],
            ['KEDA', 'Réplicas, baseado em eventos (fila SQS, Kafka lag)', 'Event-driven (0 → N)'],
          ]}
        />
        <CodeBlock lang="yaml">{`apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: api-hpa }
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 70 }
    - type: Resource
      resource:
        name: memory
        target: { type: Utilization, averageUtilization: 80 }`}</CodeBlock>
        <Callout tone="warn">
          <strong>HPA precisa de <InlineCode>metrics-server</InlineCode> instalado no cluster</strong> — não vem por default em
          clusters DIY. Em EKS/GKE/AKS geralmente já vem. Sem metrics-server, HPA reporta <InlineCode>&lt;unknown&gt;</InlineCode> nos
          targets e não escala nada.
        </Callout>
      </Section>

      <Section title="Helm — package manager do K8s" accent={ACCENT}>
        <p>
          Aplicar 15 YAMLs à mão, com valores diferentes por ambiente, vira pesadelo. Helm empacota isso em um{' '}
          <strong>Chart</strong>: templates Go com valores parametrizáveis + um <InlineCode>values.yaml</InlineCode> por ambiente.
        </p>
        <CodeBlock lang="bash">{`# instalar um chart público (Postgres oficial do Bitnami)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-pg bitnami/postgresql \\
  --namespace data \\
  --set auth.postgresPassword=secret \\
  --set primary.persistence.size=20Gi

# seu próprio chart
helm create minhaapp          # scaffolds templates/
helm install meuapp ./minhaapp -f values.prod.yaml
helm upgrade meuapp ./minhaapp -f values.prod.yaml
helm rollback meuapp 3        # volta pra revisão 3
helm uninstall meuapp`}</CodeBlock>
        <Callout tone="info">
          <strong>Alternativas ao Helm:</strong> <InlineCode>Kustomize</InlineCode> (embutido no kubectl — overlays em YAML puro,
          sem templating); <InlineCode>Argo CD</InlineCode> (GitOps pull-based). Em produção profissional, o padrão hoje é{' '}
          <strong>Helm + Argo CD</strong>: Helm empacota, Argo CD reconcilia do git pro cluster.
        </Callout>
      </Section>

      <Section title="Observabilidade — o que você precisa pra dormir à noite" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Logs', v: 'kubectl logs pra debug. Em prod: Loki / Elasticsearch / CloudWatch via DaemonSet (fluent-bit, vector).' },
            { k: 'Métricas', v: 'Prometheus (pull) + Grafana. kube-state-metrics expõe estado do cluster; node-exporter expõe nodes.' },
            { k: 'Traces', v: 'OpenTelemetry + Jaeger/Tempo. Essencial em microservices.' },
            { k: 'Eventos', v: 'kubectl get events --sort-by=.lastTimestamp. Onde você descobre por que o Pod não subiu.' },
            { k: 'Probes', v: 'liveness + readiness + startup (para apps de boot lento). Tunados errado = causa #1 de flakiness.' },
          ]}
        />
      </Section>

      <Section title="kubectl — o CLI que resolve 95% do dia-a-dia" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Contexto e namespace
kubectl config get-contexts
kubectl config use-context prod
kubectl config set-context --current --namespace=default

# Inspeção
kubectl get pods                      # lista pods no ns atual
kubectl get pods -A                   # todos os namespaces
kubectl get pods -o wide              # + node, IP
kubectl get pods -w                   # watch (live)
kubectl describe pod api-xyz          # tudo sobre o pod (eventos!)
kubectl get events --sort-by=.lastTimestamp

# Logs e exec
kubectl logs -f deploy/api            # segue logs do Deployment
kubectl logs -p pod/api-xyz           # logs do container que morreu (--previous)
kubectl exec -it pod/api-xyz -- sh    # shell no container

# Debug de rede
kubectl run -it --rm curl --image=curlimages/curl -- sh
kubectl port-forward svc/api 8080:80  # acessa service local em http://localhost:8080

# Mudanças rápidas
kubectl scale deploy/api --replicas=5
kubectl set image deploy/api api=me/api:1.3.0
kubectl rollout status deploy/api
kubectl rollout undo deploy/api

# Apply, diff, explain
kubectl apply -f manifests/
kubectl diff -f manifests/            # o que vai mudar
kubectl explain deployment.spec.strategy  # docs do schema direto do cluster

# Copy e debug effêmero
kubectl cp api-xyz:/app/log.txt ./log.txt
kubectl debug pod/api-xyz --image=nicolaka/netshoot  # sidecar de debug`}</CodeBlock>
      </Section>

      <Section title="Troubleshooting — o checklist quando algo quebra" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Pod Pending', v: 'kubectl describe — falta CPU/mem nos nodes, ou PVC não bindou, ou taint/toleration.' },
            { k: 'Pod CrashLoopBackOff', v: 'kubectl logs -p — logs do crash anterior. Quase sempre app morre no start (config errada, DB inacessível).' },
            { k: 'Pod ImagePullBackOff', v: 'Tag errada, registry privado sem imagePullSecret, ou rate limit do Docker Hub.' },
            { k: 'OOMKilled', v: 'kubectl describe mostra Last State: OOMKilled. Aumente memory.limits ou corrija memory leak.' },
            { k: 'Service não roteia', v: 'Labels do Service não batem com labels dos Pods. kubectl get endpoints svc/xyz — se está vazio, é isso.' },
            { k: 'Ingress 502/503', v: 'Service ok mas Pod não responde na porta esperada. kubectl port-forward direto no Pod pra confirmar.' },
            { k: 'Rollout travado', v: 'readinessProbe falhando nos Pods novos. kubectl describe nos Pods da nova versão.' },
          ]}
        />
        <Callout tone="danger">
          <strong>Regra número 1 do K8s:</strong> sempre rode <InlineCode>kubectl describe</InlineCode> antes de{' '}
          <InlineCode>kubectl logs</InlineCode>. A seção <em>Events</em> no final do describe mostra o que aconteceu, em ordem, com
          timestamp. 90% dos problemas aparecem ali.
        </Callout>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Equipe de 6 devs, 3 microservices, SLA baixo. Precisa de K8s?"
          winner="Não — comece com docker-compose + 1 VM (ou ECS Fargate)"
          winnerColor={ACCENT}
          why="K8s introduz complexidade enorme (RBAC, ingress, helm, observabilidade). Pra 3 apps stateless com tráfego moderado, compose + systemd resolve. Mude pra K8s quando tiver 10+ services e time de ops."
          alternatives={[
            { name: 'K3s (K8s leve)', note: 'se a equipe já sabe K8s e quer uniformidade.' },
            { name: 'ECS/Fargate', note: 'orquestração gerenciada AWS sem a curva do K8s.' },
          ]}
        />
        <DecisionBox
          scenario="20 microservices, 3 ambientes, vários times. Expor cada um?"
          winner="Ingress Controller + cert-manager + 1 LoadBalancer cloud"
          winnerColor={ACCENT}
          why="Um LB só cloud (caro) → Ingress → 20 services ClusterIP. cert-manager renova TLS Let's Encrypt automaticamente. Roteamento L7 por host/path. Custo previsível, governança centralizada."
          alternatives={[{ name: 'LoadBalancer por service', note: '20 × US$16/mês + complexidade de DNS. Evite.' }]}
        />
        <DecisionBox
          scenario="Preciso rodar Postgres HA dentro do K8s — é boa ideia?"
          winner="Depende — use um Operator (CloudNativePG, Zalando) ou RDS"
          winnerColor={ACCENT}
          why="StatefulSet cru não faz HA de Postgres — backup, failover, PITR são não-triviais. Operators encapsulam esse know-how. RDS/Aurora terceirizam o problema inteiro. Só 'Postgres artesanal' se o time entende muito bem."
          alternatives={[{ name: 'RDS/Cloud SQL', note: 'menos controle, muito menos dor operacional.' }]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Posso começar a aprender K8s sem ter um cluster pago?"
          a={
            <>
              Sim. <InlineCode>kind</InlineCode> (Kubernetes-in-Docker) ou <InlineCode>minikube</InlineCode> sobem um cluster
              inteiro na sua máquina em 30 segundos. Depois, clusters gratuitos na cloud com free tier (EKS tem custo da control
              plane; GKE Autopilot e AKS têm camadas gratuitas). Pra treino puro, kind é o melhor.
            </>
          }
        />
        <QAItem
          q="Qual a diferença entre EKS, GKE e AKS?"
          a={
            <>
              Todos entregam Kubernetes gerenciado — a control plane fica sob responsabilidade do cloud provider. Diferenças
              práticas: GKE é considerado o mais maduro (Google inventou K8s); EKS tem integração profunda com IAM/ELB/VPC da AWS;
              AKS integra com Azure AD/ARM. Para SAA-C03 e trabalho AWS, foque em EKS.
            </>
          }
        />
        <QAItem
          q="Preciso escrever YAML todo dia?"
          a={
            <>
              Você lê YAML todo dia. Escreve cada vez menos — helm chart, kustomize overlays, ou ferramentas como{' '}
              <InlineCode>cdk8s</InlineCode> (YAML via TypeScript/Python) geram. YAML continua sendo o formato de cabo final, mas
              quase nunca você digita do zero depois dos primeiros meses.
            </>
          }
        />
        <QAItem
          q="K8s faz CI/CD?"
          a={
            <>
              Não por si só. K8s é o <em>destino</em>. Ferramentas rodam em cima: <InlineCode>Argo CD</InlineCode> (GitOps
              pull-based — manifestos no git, Argo sincroniza), <InlineCode>Flux</InlineCode>, ou pipelines tradicionais
              (GitHub Actions, GitLab, Jenkins) que rodam <InlineCode>kubectl apply</InlineCode> ou <InlineCode>helm upgrade</InlineCode>.
            </>
          }
        />
        <QAItem
          q="O que é um Operator?"
          a={
            <>
              Um controller custom que entende de um domínio específico (Postgres, Kafka, Elasticsearch). Você cria um CRD
              (Custom Resource Definition) — ex.: <InlineCode>kind: PostgresCluster</InlineCode> — e o operator watcheia esses
              CRDs e faz a mágica (provisionar réplicas, failover, backup). É como &ldquo;transformar know-how humano em
              controller&rdquo;.
            </>
          }
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) K8s é loop de reconciliação: você declara desejado, controllers convergem. (2) Control
        plane (apiserver + etcd + scheduler + controller-manager) é o cérebro; data plane (kubelet + kube-proxy + runtime) roda
        as cargas. (3) Pod é átomo, mas você nunca cria Pod direto — use Deployment/StatefulSet/DaemonSet/Job. (4) Service é IP
        estável; Ingress é roteamento HTTP com TLS. (5) ConfigMap/Secret separam config de código — cuidado com mudança que não
        propaga. (6) PVC dá volume persistente; StatefulSet garante que cada Pod mantenha o dele. (7) RBAC é obrigatório em prod.
        (8) HPA escala Pods, Cluster Autoscaler escala nodes, Helm+Argo CD gerencia releases. (9) Sempre{' '}
        <InlineCode>kubectl describe</InlineCode> antes de <InlineCode>kubectl logs</InlineCode>. (10) K8s resolve problemas
        grandes e cobra complexidade — só adote quando o retorno compensar.
      </Callout>
    </div>
  );
}
