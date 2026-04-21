import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('mtls-zero-trust-pratica');

const accent = '#dc2626';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença prática entre TLS e mTLS?',
    options: [
      'mTLS é mais novo',
      'TLS autentica só o servidor (cliente valida cert do server). mTLS adiciona CertificateRequest: server exige que o cliente apresente também cert assinado por CA confiável. Resultado: ambos os lados autenticados criptograficamente por chave privada + cadeia X.509',
      'mTLS não cifra',
      'mTLS usa UDP',
    ],
    correct: 1,
    explanation: 'Em TLS normal, o cliente é anônimo ou autentica via bearer token/cookie na camada de aplicação. Em mTLS, o handshake exige que o cliente prove posse de chave privada via CertificateVerify — nada passa se ele não tiver cert válido. É autenticação forte e phishing-resistant no transporte, fundamento de zero-trust entre serviços. Usado em service mesh (Istio, Linkerd), VPN moderna (WireGuard não usa X.509 mas tem princípio similar) e IoT enterprise.',
  },
  {
    question: 'Como o Istio implementa mTLS automático entre pods em 2026?',
    options: [
      'Cada dev gera cert manual',
      'Sidecar Envoy intercepta tráfego; istiod é CA interna que emite certs SPIFFE (spiffe://cluster/ns/default/sa/app) rotacionados a cada 24h via gRPC SDS. PeerAuthentication no namespace força STRICT mTLS — tráfego sem cert é rejeitado',
      'Usa SSH',
      'É opcional e raramente ligado',
    ],
    correct: 1,
    explanation: 'Istio automatiza o que manualmente seria inviável: milhares de pods precisariam de cert rotation individual. istiod atua como CA interna, emite certs X.509 com identity SPIFFE baseada em ServiceAccount do Kubernetes, distribui via Secret Discovery Service para Envoy. PeerAuthentication mode STRICT exige mTLS em todo tráfego do mesh; PERMISSIVE aceita plaintext durante migração. AuthorizationPolicy permite ACL fine-grained por identity SPIFFE. Linkerd e Cilium Service Mesh oferecem padrões similares.',
  },
  {
    question: 'O que é SPIFFE/SPIRE e por que importa em zero-trust?',
    options: [
      'Um framework de testes',
      'SPIFFE (Secure Production Identity Framework For Everyone) define URI padrão de identidade de workload (spiffe://trust-domain/path) e SVID (SPIFFE Verifiable Identity Document) em X.509 ou JWT. SPIRE é o reference runtime: attesta nó e workload (via K8s SA, AWS IAM, Kubernetes PSAT) e emite SVID curto. Dá identidade cryptografica portável entre clouds e on-prem',
      'Um protocolo obsoleto',
      'Só funciona em Java',
    ],
    correct: 1,
    explanation: 'SPIFFE resolve "como dar identity criptográfica a workload sem humano no loop". Em vez de shared secrets ou long-lived certs, SPIRE usa node attestation (o nó prova que é o nó via cloud metadata, TPM, ou K8s) + workload attestation (o processo prova que é o processo via UID, K8s labels, selinux). Emite SVID curto. Istio usa o modelo SPIFFE embutido; em multi-cluster/multi-cloud, SPIRE dedicado é o jeito de federar trust domains. BeyondCorp (Google) popularizou filosofia: perímetro morreu, identity é o novo firewall.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mtls-zero-trust-pratica"
      title="mTLS + zero-trust na prática"
      icon="🛡️"
      xp={55}
      readTime={13}
      trailName="Cryptography Applied"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Perímetro morreu, identity é o novo firewall" accent={accent}>
        <p>
          BeyondCorp (whitepaper Google, 2014) formalizou o que breaches repetidos provaram: VPN corporativa + firewall de perímetro não escalam e falham catastroficamente quando atacante entra por phishing ou dependência comprometida. Zero-trust inverte: cada request, de qualquer origem, é autenticado via identity forte e autorizado por policy granular. mTLS é o transporte dessa autenticação entre serviços.
        </p>
        <Callout tone="danger" icon="🚨">
          Never roll your own mTLS infra. Use Istio, Linkerd, Consul Connect, Cilium Service Mesh ou SPIRE + envoy. Emitir e rotacionar milhares de certs manualmente é receita para downtime.
        </Callout>
      </Section>

      <Section title="mTLS manual com openssl (para entender)" accent={accent}>
        <CodeBlock lang="bash">{`# 1. CA interna
openssl genpkey -algorithm ED25519 -out ca.key
openssl req -x509 -new -key ca.key -days 3650 -out ca.crt \\
  -subj "/CN=FFV Internal CA"

# 2. Cert do servidor
openssl genpkey -algorithm ED25519 -out server.key
openssl req -new -key server.key -out server.csr -subj "/CN=api.ffv.internal"
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \\
  -out server.crt -days 30 \\
  -extfile <(echo "subjectAltName=DNS:api.ffv.internal")

# 3. Cert do cliente
openssl genpkey -algorithm ED25519 -out client.key
openssl req -new -key client.key -out client.csr -subj "/CN=billing-service"
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial \\
  -out client.crt -days 1

# 4. Teste com curl (cliente apresenta cert)
curl --cacert ca.crt --cert client.crt --key client.key \\
  https://api.ffv.internal/health`}</CodeBlock>
      </Section>

      <Section title="Istio PeerAuthentication STRICT" accent={accent}>
        <CodeBlock lang="yaml">{`# Forca mTLS em todo trafego do namespace
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: ffv-prod
spec:
  mtls:
    mode: STRICT          # PERMISSIVE apenas durante migracao

---
# ACL fine-grained por identity SPIFFE
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: api-allow-billing
  namespace: ffv-prod
spec:
  selector:
    matchLabels:
      app: api
  action: ALLOW
  rules:
  - from:
    - source:
        principals:
        - "cluster.local/ns/ffv-prod/sa/billing-service"
        - "cluster.local/ns/ffv-prod/sa/audit-service"
    to:
    - operation:
        methods: ["POST"]
        paths: ["/v1/charges"]

---
# Verificar que esta STRICT
# kubectl exec -n ffv-prod deploy/api -c istio-proxy -- \\
#   pilot-agent request GET /stats/config_dump | jq '.configs[] | ...'
# ou:
# istioctl authn tls-check billing-pod.ffv-prod api.ffv-prod.svc.cluster.local`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Migração típica: comece em PERMISSIVE em namespace piloto, monitore que nenhum tráfego plaintext legítimo existe (via métricas istio_request_total com connection_security_policy="none"), só então vire STRICT. Falha em ligar STRICT com workload externo não-mesh é o bug mais comum.
        </Callout>
      </Section>

      <Section title="SPIFFE/SPIRE fora do Kubernetes" accent={accent}>
        <CodeBlock lang="bash">{`# Registrar workload no SPIRE server (on-prem AWS EC2)
spire-server entry create \\
  -spiffeID spiffe://ffv.internal/billing \\
  -parentID spiffe://ffv.internal/spire/agent/aws_iid/i-0abc123 \\
  -selector aws_iid:tag:Role:billing \\
  -selector unix:uid:10001 \\
  -ttl 3600

# Workload pega SVID via Workload API (socket Unix, sem senha)
spire-agent api fetch x509 -socketPath /tmp/agent.sock \\
  -write /run/ffv/svid/

# Rotacao transparente: SPIRE agent re-emite antes da expiracao
# Workload le do diretorio, sem downtime`}</CodeBlock>
      </Section>

      <Section title="Checklist zero-trust pragmático 2026" accent={accent}>
        <Callout tone="success" icon="✅">
          (1) mTLS STRICT no mesh. (2) Identity SPIFFE (não IP, não hostname). (3) AuthorizationPolicy por identity, deny-by-default. (4) Cert rotation &lt;= 24h. (5) CA interna em HSM/Vault PKI. (6) Logs de handshake em SIEM. (7) Egress gateway bloqueia tráfego lateral inesperado. (8) Human access via SSO + short-lived cert (Teleport, smallstep, AWS IAM SSO).
        </Callout>
        <Callout tone="warn" icon="⚠️">
          mTLS não é substituto de authorization de aplicação. Identity do transporte prova "quem fala", authz prova "o que pode fazer". Os dois convivem. Serviço comprometido com cert válido ainda precisa falhar autz de aplicação em operações sensíveis.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
