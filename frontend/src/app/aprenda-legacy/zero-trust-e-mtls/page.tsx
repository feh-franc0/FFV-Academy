import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('zero-trust-e-mtls');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o princípio central de Zero Trust?',
    options: [
      'Criptografar tudo',
      '"Never trust, always verify" — cada request é autenticada e autorizada independentemente da rede. Estar dentro da VPC NÃO concede confiança implícita',
      'Não confiar em usuários',
      'Desligar a internet',
    ],
    correct: 1,
    explanation: 'Zero Trust (NIST 800-207) abandona o modelo "castelo + fosso" (dentro é seguro). Toda comunicação precisa: (1) identity verificada (authn explícita), (2) least privilege (authz mínima), (3) assume breach (monitoring como se já estivesse comprometido). Google BeyondCorp foi o pioneiro.',
  },
  {
    question: 'O que mTLS adiciona sobre TLS regular?',
    options: [
      'Mais algoritmos',
      'Autenticação BILATERAL — não só o cliente verifica o cert do server, mas o server também verifica o cert do cliente. Cada serviço tem identidade criptográfica',
      'Compressão',
      'HTTP/3 obrigatório',
    ],
    correct: 1,
    explanation: 'TLS regular: só server autentica (cliente anônimo). mTLS (mutual TLS): ambos lados apresentam cert; peer verifica. Útil em service-to-service — cada microservice prova quem é. SPIFFE/SPIRE automatiza emissão/rotação de certs (SVID).',
  },
  {
    question: 'Qual é a função do SPIFFE/SPIRE em Zero Trust?',
    options: [
      'VPN alternativa',
      'SPIFFE é o PADRÃO de identidade universal pra workload (SVID = SPIFFE Verifiable Identity Document); SPIRE é a IMPLEMENTAÇÃO que emite e rotaciona essas identidades automaticamente',
      'Apenas logging',
      'Substitui Kubernetes',
    ],
    correct: 1,
    explanation: 'SPIFFE define "spiffe://exemplo.com/ns/prod/sa/api" como identidade. SPIRE roda em cada nó, verifica workload (via atributos: namespace, service account, labels) e emite cert SVID de curta duração. Service mesh (Istio) usa SPIFFE por baixo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="zero-trust-e-mtls"
      title="Zero Trust e mTLS: verificar sempre, nunca confiar na rede"
      icon="🚪"
      xp={55}
      readTime={12}
      trailName="Security Engineering"
      trailColor={accent}
      nextSlug="capstone-pentest-em-app-proprio"
      nextTitle="Capstone: pentest em app próprio (ético)"
      quiz={quiz}
    >
      <Section title="Castelo + fosso vs Zero Trust" accent={accent}>
        <p>
          Modelo tradicional: firewall perimetral; dentro da VPC tudo é &quot;confiável&quot;. Problema: uma vez dentro (VPN comprometida, insider, pod hackeado), atacante tem acesso lateral pleno. Exemplos: Target 2013 (vendor HVAC → POS), Capital One 2019 (SSRF → metadata → IAM).
        </p>
        <p>
          Zero Trust: <strong>cada request é tratada como se viesse da internet hostil</strong>, independente de origem. Identidade + autorização explícita em cada hop.
        </p>
      </Section>

      <Section title="Os 3 pilares (NIST)" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Verify explicitly</strong>: autenticar e autorizar cada request com máximo de contexto (identidade, device, localização, behavior).</li>
          <li><strong>Least privilege</strong>: permissões mínimas pelo menor tempo (just-in-time access, just-enough-access).</li>
          <li><strong>Assume breach</strong>: minimize blast radius com segmentação, criptografia end-to-end, logging granular.</li>
        </ul>
      </Section>

      <Section title="mTLS em service mesh" accent={accent}>
        <CodeBlock lang="yaml">{`# Istio — mTLS STRICT em todo namespace
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: prod
spec:
  mtls:
    mode: STRICT  # Só aceita mTLS

# Authorization: service A pode falar com service B
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata:
  name: b-from-a-only
  namespace: prod
spec:
  selector: { matchLabels: { app: service-b } }
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/prod/sa/service-a"]`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Istio/Linkerd injetam sidecar (Envoy) que cuida de TLS termination + cert rotation. App não vê complexidade. Linkerd é mais leve; Istio mais features.
        </Callout>
      </Section>

      <Section title="Alternativas práticas pra dev/time menor" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Tailscale</strong>: WireGuard + identidade via OIDC. Dev acessa prod read-only só com Google/GitHub login, ACL via tags, auto-expira.</li>
          <li><strong>Cloudflare Zero Trust (Access + Warp)</strong>: proteger apps internos sem VPN. User autentica via IdP; Access valida; sem VPN.</li>
          <li><strong>AWS VPC Lattice / PrivateLink</strong>: comunicação entre VPCs sem IGW, com IAM authz.</li>
          <li><strong>Teleport</strong>: bastion + identity-aware SSH/kubectl.</li>
        </ul>
      </Section>

      <Section title="Checklist Zero Trust-ish pra time pequeno" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>☐ VPN empresarial → Tailscale (identidade em cada device).</li>
          <li>☐ Bastion SSH → Teleport ou AWS SSM Session Manager.</li>
          <li>☐ Acessos admin → Just-in-time elevation com aprovação (ex: JIRA+PR).</li>
          <li>☐ Serviço-pra-serviço → mTLS via service mesh ou proxy.</li>
          <li>☐ Secrets → Vault/AWS SM (sem long-lived em env).</li>
          <li>☐ Audit log de TODA admin action, replicado imutável.</li>
          <li>☐ Device trust check (MFA + device posture).</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
