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

export const metadata = getModuleMetadata('rancher-multicluster');

const ACCENT = '#0075a8';

const quiz: QuizQuestion[] = [
  {
    question:
      'Qual é a função real do Rancher Manager dentro de uma estratégia multi-cluster?',
    options: [
      'Substituir o Kubernetes por uma API própria',
      'Ser um painel central que importa/provisiona vários clusters K8s (qualquer vendor) e unifica RBAC, monitoring, GitOps (Fleet) e políticas acima deles — os clusters continuam sendo K8s padrão por baixo',
      'Rodar pods mais rápido que o K8s nativo',
      'Substituir Helm',
    ],
    correct: 1,
    explanation:
      'Rancher é uma camada de management: fala com o API server de cada cluster (importado ou provisionado) e adiciona um plano de controle acima — RBAC agregado, Projects, GitOps via Fleet, catálogos, observabilidade. Nunca substitui o K8s; orquestra vários K8s.',
  },
  {
    question:
      'O que diferencia o RKE2 do kubeadm em 2026?',
    options: [
      'Nada — são o mesmo produto',
      'RKE2 é distro K8s opinionada da SUSE/Rancher: bundle único (kube-apiserver, etcd, containerd, CNI já configurados), foco em hardening CIS, Air Gap fácil e suporte comercial — kubeadm é bootstrap bare-bones que exige você montar CNI, storage class, etc.',
      'RKE2 não usa containers',
      'kubeadm é fechado',
    ],
    correct: 1,
    explanation:
      'RKE2 (também chamado "RKE Government") é uma distribuição production-ready: um único binário instala control plane + kubelet + containerd + Canal/Calico/Cilium. Hardening CIS ativado por default, FIPS-ready e roda bem em Edge/Air Gap. kubeadm dá só o bootstrap — CNI, CSI, ingress ficam por sua conta.',
  },
  {
    question:
      'Por que usar Fleet em vez de só Argo CD quando se tem 40 clusters?',
    options: [
      'Argo CD não suporta K8s',
      'Fleet foi desenhado do zero para multi-cluster: um GitRepo + targets rotulados implanta nos clusters marcados (ex.: env=prod, region=eu); escala para milhares de clusters com menor overhead. Argo CD é ótimo por cluster — multi-cluster exige Hub + ApplicationSets; Fleet já é hub-first',
      'Argo CD só funciona na Amazon',
      'Fleet é obrigatório no Rancher',
    ],
    correct: 1,
    explanation:
      'Fleet (da SUSE) escala naturalmente em dezenas/centenas de clusters porque o hub só agenda bundles; cada cluster tem um agent leve que aplica. Argo CD continua excelente em deploy por app e por cluster — muitos times rodam Argo CD por cluster + Fleet como layer de distribuição. Não é OR, é AND.',
  },
  {
    question:
      'O que é um "Project" em Rancher e como ele muda RBAC?',
    options: [
      'Sinônimo de namespace',
      'Uma abstração acima de namespaces: agrupa N namespaces do mesmo cluster sob políticas comuns (RBAC, resource quota, pod security, network policy). Usuários ganham permissão no Project e herdam nos namespaces. Simplifica RBAC em clusters grandes',
      'Uma tela de dashboard sem efeito no cluster',
      'Só existe em RKE2',
    ],
    correct: 1,
    explanation:
      'Projects é conceito exclusivo do Rancher (não existe no K8s puro). Exemplo: projeto payments agrega namespaces payments-api, payments-worker, payments-db. Define o role de dev-leader uma vez no Project e vale nos três namespaces. Remove tantas regras RBAC duplicadas quanto namespaces houver.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rancher-multicluster"
      title="Rancher: gerenciando múltiplos clusters K8s sem sofrer"
      icon="🐄"
      xp={75}
      readTime={16}
      trailName="DevOps & Containers"
      trailColor={ACCENT}
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
        Um cluster Kubernetes já é complexo. Agora imagine <strong>20, 40, 200 clusters</strong>: dev, staging, prod, Edge na fábrica,
        branch office no banco, ambiente cliente em tenant. Cada um com RBAC, logging, backup, ingress, Helm chart, monitoring,
        política de segurança. Quem cuida disso só com <InlineCode>kubectl</InlineCode> em terminal vira refém do caos.{' '}
        <strong>Rancher</strong> (SUSE, antes independente) nasceu pra esse problema: é o <em>plano de controle de planos de
        controle</em>. Você vê todos os clusters em uma UI, roda GitOps centralizado (Fleet), aplica RBAC unificado, instala apps
        de um catálogo e mantém auditoria consolidada — sem abrir mão do K8s puro por baixo.
      </p>

      <Section title="O que Rancher é (e o que não é)" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'É', v: 'UI + API de management que fala com N clusters (importados ou provisionados). Open source (Apache 2.0), mantido pela SUSE desde 2020.' },
            { k: 'É', v: 'Conjunto de produtos: Rancher Manager, RKE2/K3s, Fleet (GitOps), NeuVector (security), Longhorn (storage), Harvester (HCI/VM).' },
            { k: 'Não é', v: 'Um fork do Kubernetes. Os clusters geridos continuam K8s padrão (CNCF-certified) — pode sair do Rancher e manter tudo.' },
            { k: 'Não é', v: 'Substituto de Argo CD, Prometheus ou Vault. É a cola que integra esses componentes em um único painel.' },
            { k: 'Quando brilha', v: 'Dezenas de clusters heterogêneos (on-prem + EKS + Edge), times não especialistas em K8s, Edge com rede restrita, bancos/governo que precisam de painel auditável.' },
            { k: 'Quando atrapalha', v: '1 ou 2 clusters em uma única cloud. Você paga overhead sem ganho — melhor ir direto no EKS/GKE/AKS + GitOps simples.' },
          ]}
        />
      </Section>

      <Section title="Arquitetura: quem fala com quem" accent={ACCENT}>
        <SplitFlow
          accent={ACCENT}
          title="Rancher em 1 diagrama"
          left={{
            label: 'Management Cluster',
            items: [
              { icon: '🖥️', label: 'Rancher Manager', sub: 'UI + API' },
              { icon: '🗄️', label: 'Embedded etcd', sub: 'state do Rancher' },
              { icon: '🚚', label: 'Fleet Controller', sub: 'GitOps' },
              { icon: '🛡️', label: 'Auth Provider', sub: 'SAML/OIDC/LDAP' },
            ],
          }}
          center={'HTTPS + WebSocket'}
          right={{
            label: 'Downstream Clusters',
            items: [
              { icon: '☸️', label: 'Cluster A (EKS)', sub: 'importado' },
              { icon: '☸️', label: 'Cluster B (RKE2)', sub: 'on-prem' },
              { icon: '☸️', label: 'Cluster C (K3s)', sub: 'Edge / filial' },
              { icon: '🤖', label: 'cattle-cluster-agent', sub: 'em cada cluster' },
            ],
          }}
        />
        <Callout tone="info">
          <strong>Como o agent funciona.</strong> Em cada cluster importado, o Rancher instala um Deployment chamado{' '}
          <InlineCode>cattle-cluster-agent</InlineCode>. Ele abre uma conexão <strong>WebSocket de saída</strong> pro Rancher
          Manager (cluster em rede privada não precisa abrir porta de entrada). Comandos (kubectl via UI, apply de bundles do
          Fleet) trafegam por essa conexão. Por isso Rancher funciona em Edge/filial mesmo atrás de NAT.
        </Callout>
      </Section>

      <Section title="Instalando o Rancher Manager (HA) com Helm" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Padrão de produção: Rancher Manager em um cluster K8s dedicado (3 nodes, HA). Helm é o jeito oficial. Em teste local,{' '}
          <InlineCode>k3d</InlineCode> ou <InlineCode>kind</InlineCode> servem bem.
        </p>
        <CodeBlock lang="bash">{`# 1) cert-manager (Rancher usa pra emitir certificados internos)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.15.3/cert-manager.crds.yaml

helm repo add jetstack https://charts.jetstack.io
helm upgrade --install cert-manager jetstack/cert-manager \\
  --namespace cert-manager --create-namespace \\
  --version v1.15.3

# 2) Rancher Manager (stable channel)
helm repo add rancher-stable https://releases.rancher.com/server-charts/stable

kubectl create namespace cattle-system

helm upgrade --install rancher rancher-stable/rancher \\
  --namespace cattle-system \\
  --set hostname=rancher.empresa.com \\
  --set bootstrapPassword=ChangeMeOnFirstLogin \\
  --set ingress.tls.source=letsEncrypt \\
  --set letsEncrypt.email=ops@empresa.com \\
  --set replicas=3

# 3) Verifica rollout
kubectl -n cattle-system rollout status deploy/rancher
kubectl -n cattle-system get ing`}</CodeBlock>
        <Callout tone="warn">
          <strong>Escolhendo a distro do management cluster.</strong> Em ambiente com suporte SUSE: RKE2. Em EKS/GKE/AKS: qualquer
          cluster gerenciado funciona — mas lembre que se ele cai, todos os Rancher agents perdem o controlador (pods seguem
          rodando; só o management fica offline). HA com 3 nodes e etcd backup é obrigatório em produção.
        </Callout>
      </Section>

      <Section title="RKE2 em 3 comandos (cluster downstream)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          RKE2 é a distro opinionada da SUSE. Instala tudo em um binário. Vantagem: bootstrap reprodutível, hardening CIS padrão,
          Air Gap suportado.
        </p>
        <CodeBlock lang="bash">{`# No primeiro server node
curl -sfL https://get.rke2.io | sh -
systemctl enable --now rke2-server.service

# Pega kubeconfig
sudo cp /etc/rancher/rke2/rke2.yaml ~/.kube/config
sudo chown $USER ~/.kube/config

# Pega o token (pra adicionar novos nodes)
sudo cat /var/lib/rancher/rke2/server/node-token

# Em um segundo server node (HA control plane)
mkdir -p /etc/rancher/rke2
cat <<'EOF' | sudo tee /etc/rancher/rke2/config.yaml
server: https://10.0.0.10:9345
token: K10<TOKEN-DO-PRIMEIRO-NODE>
EOF
curl -sfL https://get.rke2.io | sh -
systemctl enable --now rke2-server.service

# Em um agent (worker)
cat <<'EOF' | sudo tee /etc/rancher/rke2/config.yaml
server: https://10.0.0.10:9345
token: K10<TOKEN>
EOF
curl -sfL https://get.rke2.io | INSTALL_RKE2_TYPE=agent sh -
systemctl enable --now rke2-agent.service`}</CodeBlock>
        <Callout tone="info">
          <strong>RKE2 vs K3s.</strong> Mesmo time da SUSE. <strong>K3s</strong> é minimalista: binário de ~60MB, SQLite no lugar
          do etcd por padrão, roda até em Raspberry Pi — ideal para Edge. <strong>RKE2</strong> é a versão hardened, com etcd,
          hardening CIS e certificação FedRAMP/FIPS — ideal para datacenter e governo. Rancher gerencia os dois.
        </Callout>
      </Section>

      <Section title="Importando um cluster EKS no Rancher" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Você tem um EKS já existente. Não precisa destruir nada. Rancher importa via agent.
        </p>
        <StackFlow
          accent={ACCENT}
          items={[
            { icon: '🖱️', label: 'UI: Cluster Management → Import Existing', sub: 'step 1', detail: 'Escolhe Generic. Dá um nome (ex.: eks-prod-eu-west-1).', connector: 'gera' },
            { icon: '📜', label: 'Rancher gera um kubectl apply com URL + token', sub: 'step 2', detail: 'Comando único, pode copiar pra pipeline.', connector: 'executa no EKS' },
            { icon: '🤖', label: 'cattle-cluster-agent é instalado no EKS', sub: 'step 3', detail: 'Namespace cattle-system. Connect-back via WebSocket.', connector: 'aguarda' },
            { icon: '✅', label: 'Cluster aparece como Active', sub: 'step 4', detail: 'Agora dá pra fazer kubectl via UI, criar Projects, instalar monitoring, conectar Fleet.' },
          ]}
        />
        <CodeBlock lang="bash">{`# Comando gerado pelo Rancher (colado em quem tem kubectl no EKS)
kubectl apply -f https://rancher.empresa.com/v3/import/abc123xyz_c-xxxxx.yaml

# Verifica
kubectl -n cattle-system get pods
# NAME                                    READY   STATUS
# cattle-cluster-agent-7d4c9b5b6c-xxxxx   1/1     Running`}</CodeBlock>
        <Callout tone="warn">
          <strong>Segurança.</strong> O YAML de import contém um token. Quem aplica no cluster ganha write no K8s via Rancher.
          Use pipeline protegido e rotacione o token via <InlineCode>Cluster Registration Token</InlineCode> após o import.
        </Callout>
      </Section>

      <Section title="Fleet: GitOps multi-cluster" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Fleet é a arma secreta do Rancher em escala. Você versiona manifests + Helm no Git, define{' '}
          <strong>targets por label</strong> e Fleet propaga pros clusters certos.
        </p>
        <StackFlow
          accent={ACCENT}
          title="Fluxo do Fleet"
          items={[
            { icon: '📦', label: 'GitRepo CRD no Rancher', sub: 'define repo + branch', detail: 'Aponta para um repositório Git com bundles (fleet.yaml + manifests).', connector: 'observa' },
            { icon: '🎯', label: 'Target Selector', sub: 'matchLabels', detail: 'Seleciona clusters com labels (env=prod, region=eu-west).', connector: 'empacota' },
            { icon: '📨', label: 'Bundle gerado', sub: 'pronto', detail: 'Rancher gera um Bundle com os manifests finais.', connector: 'deploy via agent' },
            { icon: '🤖', label: 'fleet-agent em cada cluster', sub: 'aplica', detail: 'Pull-based: agent do cluster busca bundle e aplica. Saudável pra Edge.' },
          ]}
        />
        <CodeBlock lang="yaml">{`# fleet-gitrepo.yaml — apply no management cluster do Rancher
apiVersion: fleet.cattle.io/v1alpha1
kind: GitRepo
metadata:
  name: apps-prod
  namespace: fleet-default
spec:
  repo: https://github.com/empresa/k8s-gitops
  branch: main
  paths:
    - apps/payments
    - apps/orders
  targets:
    - name: prod-eu
      clusterSelector:
        matchLabels:
          env: prod
          region: eu-west
    - name: prod-us
      clusterSelector:
        matchLabels:
          env: prod
          region: us-east`}</CodeBlock>
        <CodeBlock lang="yaml">{`# apps/payments/fleet.yaml — customizações por target
defaultNamespace: payments
helm:
  chart: ./chart
  values:
    replicas: 2

targetCustomizations:
  - name: prod-eu
    helm:
      values:
        replicas: 5
        region: eu-west-1
  - name: prod-us
    helm:
      values:
        replicas: 5
        region: us-east-1`}</CodeBlock>
        <Callout tone="success">
          <strong>Por que Fleet escala.</strong> Cada cluster tem um agent leve que <em>puxa</em> bundles. O hub não mantém
          conexão push a 1000 clusters. Perda de rede? O agent retoma quando volta. Rollback? Reverte o commit no Git. É a
          forma mais honesta de fazer GitOps em escala.
        </Callout>
      </Section>

      <Section title="Projects: RBAC que não dá nó" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em um cluster grande, um time pode ter 5-10 namespaces (api, worker, db, cache, staging). Configurar RBAC namespace a
          namespace é receita pra erro. <strong>Project</strong> (conceito Rancher) agrupa namespaces sob uma política comum.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'Sem Project (K8s puro)', 'Com Project (Rancher)']}
          rows={[
            ['Granularidade', 'RoleBinding por namespace', 'Binding no Project, herda em todos namespaces'],
            ['Resource Quota', 'ResourceQuota por namespace', 'Quota total do Project, fatiada entre namespaces'],
            ['Network Policy', 'NetworkPolicy em cada ns', 'Project Network Isolation: auto-aplica policy'],
            ['Pod Security', 'Label/anotação por ns', 'Pod Security Admission herdado no Project'],
            ['Adicionar ns', 'Reconfigurar RBAC + quotas', 'Move pra dentro do Project, herda tudo'],
            ['Auditoria', 'Spread em N namespaces', 'Dashboard agregado do Project'],
          ]}
        />
        <CodeBlock lang="yaml">{`# Exemplo: Project "payments" agrega 3 namespaces e aplica quota+rbac
apiVersion: management.cattle.io/v3
kind: Project
metadata:
  name: p-payments
  namespace: c-m-xxxxx        # id interno do cluster no Rancher
spec:
  displayName: payments
  description: "Time de pagamentos — payments-api, payments-worker, payments-db"
  resourceQuota:
    limit:
      limitsCpu: "20"
      limitsMemory: "40Gi"
      pods: "50"
  namespaceDefaultResourceQuota:
    limit:
      requestsCpu: "2"
      requestsMemory: "4Gi"

---
apiVersion: management.cattle.io/v3
kind: ProjectRoleTemplateBinding
metadata:
  name: prb-payments-lead
  namespace: c-m-xxxxx
projectName: c-m-xxxxx:p-payments
subjectKind: User
subjectName: alice@empresa.com
roleTemplateName: project-owner`}</CodeBlock>
      </Section>

      <Section title="Auth central + RBAC global" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Auth Providers', v: 'SAML (Okta, Azure AD, Google), OIDC, LDAP, GitHub, local. Configura uma vez, vale em todos clusters downstream.' },
            { k: 'Global Roles', v: 'Role válido em todos os clusters (ex.: cluster-admin global para o time de platform).' },
            { k: 'Cluster Roles', v: 'Role em um cluster específico (view, owner, custom).' },
            { k: 'Project Roles', v: 'Role dentro de um Project (read-only, member, owner).' },
            { k: 'Auditoria', v: 'API Audit logs com quem fez o quê, quando, em qual cluster. Exporta pra SIEM (Splunk, Elastic).' },
          ]}
        />
        <Callout tone="info">
          <strong>Impersonation.</strong> Rancher autentica o usuário com seu Auth Provider, gera um JWT interno e quando o
          usuário faz kubectl via UI ou via kubeconfig gerado pelo Rancher, o API server de cada cluster recebe como{' '}
          <InlineCode>user: alice@empresa.com</InlineCode> (via impersonation). Assim os audit logs do K8s também têm o nome real,
          não só &quot;cattle-cluster-agent&quot;.
        </Callout>
      </Section>

      <Section title="Monitoring e Logging" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Rancher embala catálogos de apps mas monitoring merece destaque:
        </p>
        <ul className="flex flex-col gap-2" style={{ color: 'var(--ffv-muted)' }}>
          <li>
            • <strong>Rancher Monitoring</strong> — Helm chart oficial com kube-prometheus-stack (Prometheus, Grafana, Alertmanager)
            pronto, com dashboards de cluster/node/workload.
          </li>
          <li>
            • <strong>Rancher Logging</strong> — Integração com <InlineCode>logging-operator</InlineCode> (Banzai Cloud): define{' '}
            <InlineCode>ClusterFlow</InlineCode>/<InlineCode>Output</InlineCode> e manda logs pra Loki, Elastic, S3, Splunk.
          </li>
          <li>
            • <strong>Observability stack externo</strong> — Nada impede você de usar Datadog/New Relic. Rancher não força.
          </li>
        </ul>
        <CodeBlock lang="bash">{`# Install Rancher Monitoring (no cluster downstream)
helm repo add rancher-charts https://charts.rancher.io
kubectl create namespace cattle-monitoring-system

helm upgrade --install rancher-monitoring rancher-charts/rancher-monitoring \\
  --namespace cattle-monitoring-system \\
  --set prometheus.prometheusSpec.retention=15d \\
  --set grafana.persistence.enabled=true`}</CodeBlock>
      </Section>

      <Section title="Rancher vs alternativas reais" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'Rancher', 'Red Hat OCM/ACM', 'Crossplane', 'Só Argo CD']}
          rows={[
            ['Multi-cluster UI', 'Sim, pronta', 'Sim (OpenShift)', 'Não tem UI', 'Por app, não por cluster'],
            ['Provisiona clusters', 'Sim (RKE2, K3s, EKS, AKS, GKE via UI)', 'Sim (OpenShift, managed)', 'Sim, via APIs', 'Não'],
            ['GitOps multi-cluster', 'Fleet (hub-first)', 'ACM Applications + ArgoCD', 'Configurations', 'Argo CD + ApplicationSets'],
            ['RBAC global', 'Sim (Global Roles)', 'Sim (Cluster Role mgmt)', 'Via IaC', 'Por cluster, manual'],
            ['Licença / vendor', 'Open source / SUSE', 'Comercial Red Hat', 'Open source / CNCF', 'Open source / CNCF'],
            ['Melhor para', 'Heterogêneo, Edge, on-prem + cloud', 'Empresa já em OpenShift', 'IaC avant-garde, cloud nativa', '1-5 clusters, time avançado'],
          ]}
        />
      </Section>

      <Section title="Quando Rancher (não) vale a pena" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Indústria com 50 fábricas, cada uma precisa de K8s local (Edge) com sensores/MES conectados"
          winner="Rancher + K3s"
          why="K3s roda em hardware modesto; Rancher importa os 50 via agent outbound (NAT friendly); Fleet distribui o app central. Um time de 2 pessoas consegue manter."
          alternatives={[{ name: 'K3s puro', note: 'funciona mas sem visibilidade central vira pesadelo.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="SaaS B2B com 1 cluster EKS multi-tenant na AWS"
          winner="EKS puro + Argo CD"
          why="Rancher aqui vira overhead. Você não tem problema multi-cluster — tem problema multi-tenant dentro de 1 cluster (Namespace/Project K8s puro resolve)."
          alternatives={[{ name: 'Rancher', note: 'instale só se crescer pra multi-region com 5+ clusters.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Banco com compliance PCI — clusters dev/hml/prod + DR em outra região"
          winner="Rancher + RKE2 hardened"
          why="RKE2 já entrega hardening CIS e FIPS. Rancher dá painel auditável, RBAC integrado com AD, Projects pra segregar ambientes. Auditores adoram ver tudo em um lugar."
          alternatives={[{ name: 'OpenShift', note: 'equivalente funcional mas com licença comercial cara.' }]}
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Startup com 1 cluster GKE e 4 devs"
          winner="GKE + Argo CD"
          why="Rancher vira peso. O plano gratuito do GKE + Argo CD resolve CI/CD, RBAC via Google IAM. Adote Rancher só depois que o número de clusters passar de 5."
        />
      </Section>

      <Section title="Backup e Disaster Recovery do Rancher" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Se o Rancher Manager morrer, os clusters downstream continuam rodando (K8s é K8s). Mas você perde histórico, Projects,
          RBAC customizado, Fleet state. Backup é obrigatório.
        </p>
        <ul className="flex flex-col gap-2" style={{ color: 'var(--ffv-muted)' }}>
          <li>
            • <strong>rancher-backup operator</strong> — Chart oficial. Define{' '}
            <InlineCode>Backup</InlineCode> (cron) e <InlineCode>Restore</InlineCode> como CRDs. Destino: S3, PVC, MinIO.
          </li>
          <li>
            • <strong>etcd snapshot</strong> — Em RKE2, <InlineCode>rke2 etcd-snapshot save</InlineCode> automatiza. Em cluster
            gerenciado (EKS), o provedor já backupa etcd do control plane.
          </li>
          <li>
            • <strong>Velero</strong> — Complementa para backup de PVs e recursos K8s por namespace/label.
          </li>
        </ul>
        <CodeBlock lang="yaml">{`apiVersion: resources.cattle.io/v1
kind: Backup
metadata:
  name: rancher-nightly
spec:
  storageLocation:
    s3:
      bucketName: rancher-backups
      region: us-east-1
      credentialSecretName: s3-creds
      credentialSecretNamespace: cattle-resources-system
  schedule: "0 3 * * *"       # 03:00 UTC
  retentionCount: 14
  encryptionConfigSecretName: encryptionconfig`}</CodeBlock>
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Rancher trava em uma versão de Kubernetes?"
          a="Não. Ele suporta uma matriz de versões por release (ver docs). Clusters RKE2/K3s têm upgrade 1-clique via Rancher; EKS/GKE/AKS você atualiza pelo provedor e o Rancher acompanha."
        />
        <QAItem
          q="Posso usar Rancher só para visualização?"
          a="Pode. Importar clusters read-only funciona — só que você perde RBAC agregado e Fleet. Muitos começam por aí e expandem depois."
        />
        <QAItem
          q="Rancher Desktop é a mesma coisa?"
          a={
            <>
              Não. <strong>Rancher Desktop</strong> é app local (Mac/Win/Linux) que roda K8s via K3s + containerd, alternativa ao
              Docker Desktop. Rancher <em>Manager</em> é o painel multi-cluster. São produtos distintos da SUSE.
            </>
          }
        />
        <QAItem
          q="Fleet substitui Argo CD?"
          a="Não no caso geral. Fleet é superior em distribuir pra muitos clusters; Argo CD é superior em UI por aplicação, sync-waves, hooks, rollback manual. Em ambientes maduros rodam os dois."
        />
        <QAItem
          q="Rancher tem suporte comercial?"
          a={
            <>
              Sim. SUSE oferece <InlineCode>SUSE Rancher Prime</InlineCode> (subscription). Em on-prem banco/governo costuma ser
              obrigatório pela política de suporte 24×7. Mantém-se 100% open source mesmo com subscription.
            </>
          }
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> (1) Rancher é plano de controle de clusters — não é fork de K8s. (2) RKE2/K3s são distros
        opinionadas da SUSE para datacenter e Edge. (3) Fleet faz GitOps hub-first escalando a milhares de clusters. (4) Projects
        salvam RBAC em clusters grandes. (5) Auth + audit centralizados reduzem compliance a uma tela. (6) Em 1-2 clusters, não
        use Rancher — você paga overhead sem ganho. (7) Backup do Rancher é obrigatório: use rancher-backup + etcd snapshot + S3
        fora do cluster.
      </Callout>
    </div>
  );
}
