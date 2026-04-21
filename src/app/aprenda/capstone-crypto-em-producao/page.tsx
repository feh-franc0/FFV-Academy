import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-crypto-em-producao');

const accent = '#dc2626';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o sinal mais forte de que um engenheiro domina cripto aplicada em produção?',
    options: [
      'Implementa AES do zero',
      'Demonstra que chaves NUNCA saem do KMS/HSM em plaintext, que rotation é automatizada e testada em fire-drill, que incident response tem runbook de comprometimento, e que cada decisão é justificada com threat model escrito',
      'Usa a lib mais nova',
      'Decora nomes de algoritmos',
    ],
    correct: 1,
    explanation: 'Cripto em produção não é sobre escolher AES-256 vs ChaCha20 — é sobre operação: onde chaves nascem, vivem, rotacionam e morrem; quem tem acesso; como audit log prova que ninguém extraiu plaintext; o que acontece se um engenheiro sair amanhã. Threat model escrito (STRIDE, attack trees) separa senior de intermediate. Never roll your own crypto é só o começo — never roll your own key lifecycle é a versão completa.',
  },
  {
    question: 'O que deve aparecer no runbook de rotação de CA interna?',
    options: [
      'Nada, é automático',
      'Procedimento M-of-N para extrair antiga privada do HSM (se preciso), emissão de nova CA com overlap, cross-signing para transição, deploy gradual por cluster com health-check de handshake, janela de observação 72h+, revogação final da antiga, smoke tests pós-corte, rollback plan com antiga ainda válida',
      'Só reiniciar tudo',
      'Esperar expirar',
    ],
    correct: 1,
    explanation: 'Rotation de CA é cirurgia delicada: se você desliga a antiga antes que todos os clientes confiem na nova, tudo quebra. Cross-signing (nova CA assinada também pela antiga) permite migração gradual. Key ceremony formal (quorum, gravação, testemunhas) exige M-of-N via Shamir Secret Sharing. Observação de 72h confirma que nenhum workload esquecido ainda apresenta cert emitido pela antiga. Sem runbook escrito e testado, rotation vira incidente P0 em produção.',
  },
  {
    question: 'Qual dessas checklists representa um pentest crypto minimamente competente?',
    options: [
      'Rodar nmap e sair',
      'TLS via testssl.sh/SSL Labs, cert expiration/SAN check, OCSP stapling, HSTS preload, mTLS verification (reject sem cert), JWT alg confusion + none + weak key, PASETO footer tamper, session fixation, cookie flags, JWKS exposure, secrets em response headers, side-channel em error messages',
      'Só revisar dependências',
      'Rodar strings no binário',
    ],
    correct: 1,
    explanation: 'Pentest crypto cobre camadas: transporte (TLS config, cert hygiene), tokens (alg confusion, replay, tamper), secrets leak (error verboso, JWKS público demais, headers), key management (hardcoded em imagem Docker, em env var exposta). testssl.sh + burp suite + jwt_tool + custom scripts cobrem 80%. Relatório deve mapear cada finding para CWE/CVSS e mitigação concreta. Bug bounty interno ajuda a institucionalizar o hábito.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-crypto-em-producao"
      title="Capstone: cripto end-to-end em app real"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="Cryptography Applied"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Construa uma app real (pode ser um fork da FFV Academy, um mini-banco, um chat E2E) com cripto end-to-end operacional, não decorativa. Entregáveis provam domínio: threat model, infra de chaves, automação de rotation, observability de TLS/mTLS, relatório de pentest e runbooks. Recrutador senior lê o README e sabe em 10 minutos se você é o engenheiro certo para a vaga.
        </p>
        <Callout tone="danger" icon="🚨">
          Never roll your own crypto. Esse capstone é sobre orquestrar libs auditadas e KMS managed em pipeline defensivo, não sobre implementar AES em Python puro.
        </Callout>
      </Section>

      <Section title="Entregáveis obrigatórios" accent={accent}>
        <CodeBlock lang="yaml">{`# 1. Threat model escrito (STRIDE ou attack tree)
docs/THREAT_MODEL.md:
  - ativos protegidos (PII, tokens de sessao, chaves de assinatura)
  - adversarios (externo anonimo, insider, dependencia comprometida)
  - trust boundaries (browser <-> CDN <-> API <-> DB <-> KMS)
  - threats por componente (spoofing, tampering, repudiation, info disclosure, DoS, elevation)
  - mitigacoes mapeadas a controles concretos

# 2. Transporte
TLS_1_3:
  config:          mozilla modern via ssl-config-generator
  pfs:             obrigatorio
  hsts_preload:    enabled, submetido a hstspreload.org
  ocsp_stapling:   on, must-staple
  post_quantum:    X25519MLKEM768 habilitado (hybrid)
mTLS:
  mesh:            Istio STRICT em namespace ffv-prod
  peer_auth:       PeerAuthentication mode STRICT
  authz:           AuthorizationPolicy por SPIFFE identity

# 3. Tokens
jwt_ou_paseto:
  algoritmo:       EdDSA (Ed25519) ou PASETO v4.public
  ttl_access:      5 minutos
  refresh:         em cookie httponly+secure+samesite=lax, rotacionado, revogavel em Redis
  jwks:            endpoint publico com kid overlap (n-1 e n) para rotation zero-downtime
  teste_negativo:  alg=none rejeitado, HS256-com-pubkey rejeitado, tamper rejeitado

# 4. Key management
cmk:               AWS KMS com automatic annual rotation + encryption context
data_keys:         envelope encryption via AWS Encryption SDK
secrets_app:       AWS Secrets Manager ou Vault KV v2 (nunca .env em git)
db_credentials:    Vault dynamic secrets (lease 1h)
signing_key:       Vault transit (ed25519), app nunca ve plaintext

# 5. Certificados
ca_interna:        Vault PKI ou smallstep-ca
public_tls:        Let's Encrypt via cert-manager + DNS-01
rotation:          automatica, 30 dias antes de expirar
monitoring:        alerta em 14 dias se renew falhou

# 6. Pentest + validacao
testssl_report:    out/testssl-prod.html
jwt_tool_report:   out/jwt-pentest.md (alg confusion, none, weak key)
burp_scan:         out/burp-baseline.xml (auth/session/cookies)
ct_log_monitor:    crt.sh webhook em domain principal

# 7. Runbooks
docs/runbooks/:
  - rotate-ca.md             (M-of-N, cross-signing, observacao 72h)
  - revoke-leaked-key.md     (deteccao -> revoke KMS -> audit -> postmortem)
  - ca-compromise.md         (pior cenario: CA interna vazou)
  - cert-expiry-incident.md  (cliente nao renovou, o que fazer em 15 min)
  - jwt-signing-key-leak.md  (rotacao de kid, invalidacao de sessoes)`}</CodeBlock>
      </Section>

      <Section title="Exemplos de comandos que seu pipeline deve rodar em CI" accent={accent}>
        <CodeBlock lang="bash">{`# testssl.sh em CI (falha build se nota < A)
docker run --rm -ti drwetter/testssl.sh \\
  --protocols --ciphers --vulnerable --headers --jsonfile=out/testssl.json \\
  https://api.ffv.internal

# Verificar OCSP stapling real
echo | openssl s_client -connect fernandofrancovalle.com:443 \\
  -status -servername fernandofrancovalle.com 2>&1 | grep -A 5 "OCSP response"

# Verificar mTLS STRICT no Istio
istioctl authn tls-check billing-pod.ffv-prod api.ffv-prod.svc.cluster.local
# esperado: STATUS=OK  SERVER=STRICT  CLIENT=ISTIO_MUTUAL  AUTHN POLICY=default/ffv-prod

# JWT alg confusion test (precisa de jwt_tool.py)
python3 jwt_tool.py "$ACCESS_TOKEN" -X a      # alg=none
python3 jwt_tool.py "$ACCESS_TOKEN" -X k      # HS256 usando pubkey como secret
# esperado: API responde 401 em ambos

# Scan de secrets em imagem Docker
docker run --rm -v "$PWD":/src trufflesecurity/trufflehog filesystem /src
gitleaks detect --source . --redact

# Monitoring de CT logs via crt.sh (certspotter OSS)
certspotter -watchlist fernandofrancovalle.com -state_dir .certspotter`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Capstone entregue nesse nível põe você em percentil alto de security engineers pragmáticos em 2026. Não é sobre ser criptógrafo de pesquisa — é sobre saber operar cripto como infraestrutura crítica, com automação, observability, runbooks e threat model vivo. Recrutador vê o repo + writeup e marca entrevista.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
