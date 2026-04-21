import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('tls-1-3-deep-dive');

const accent = '#dc2626';

const quiz: QuizQuestion[] = [
  {
    question: 'O que o 1-RTT handshake do TLS 1.3 elimina em relação ao 1.2?',
    options: [
      'Nada, é só renomeação',
      'Elimina a round-trip de ServerHelloDone/ClientKeyExchange separadas. Client envia ClientHello com key share especulativo; server responde ServerHello + EncryptedExtensions + Certificate + CertificateVerify + Finished já cifrados. Um round-trip total vs dois no 1.2',
      'Elimina certificados',
      'Elimina cifra',
    ],
    correct: 1,
    explanation: 'TLS 1.3 (RFC 8446, 2018) simplificou o handshake removendo cipher suites fracas, renegociação, compressão e reduzindo round-trips. O client já aposta num grupo (X25519 é o default) e envia key share no primeiro flight. Se o server concorda, a resposta já vem cifrada sob chave handshake. Ganha latência e reduz superfície: adeus RC4, 3DES, SHA-1, RSA key exchange (sem PFS), CBC mode. Só AEAD (AES-GCM, ChaCha20-Poly1305) e PFS obrigatório.',
  },
  {
    question: 'Qual é o risco real do 0-RTT e como mitigar?',
    options: [
      'Não tem risco nenhum',
      'Replay attack: atacante captura early data cifrado e retransmite. TLS 1.3 não garante anti-replay em 0-RTT. Mitigações: aceitar apenas em requests idempotentes (GET sem side effect), usar anti-replay window single-use ticket, ou desabilitar 0-RTT em endpoints sensíveis',
      'Quebra a cifra',
      'Vaza a chave privada',
    ],
    correct: 1,
    explanation: '0-RTT permite que o cliente envie dados no primeiro flight usando PSK de sessão anterior. Problema: server não pode distinguir se é original ou replay. Cloudflare, Google e AWS deixam 0-RTT opt-in com whitelist de endpoints idempotentes. POST/PUT nunca deve aceitar early_data. nginx: ssl_early_data on + proxy_set_header Early-Data $ssl_early_data para app decidir. Se dúvida, mantenha desligado — economia de 1 RTT não compensa replay em /transfer.',
  },
  {
    question: 'Como a migração pós-quântica está sendo feita em TLS em 2026?',
    options: [
      'Troca tudo de uma vez por ML-KEM',
      'Hybrid key exchange: X25519+ML-KEM-768 (antes Kyber) no mesmo handshake. Se um dos dois for quebrado, o segredo ainda é seguro. Chrome ativou por default em 2024, AWS/Cloudflare também. Assinaturas (ML-DSA) ainda em experimentação por causa de tamanho',
      'Usa ainda RSA-4096',
      'Não está sendo feita',
    ],
    correct: 1,
    explanation: 'NIST padronizou FIPS 203 (ML-KEM, KEM) e FIPS 204 (ML-DSA, signatures) em agosto de 2024. Estratégia pragmática é hybrid: combinar curva clássica + kem pós-quântico em KDF. Atacante precisa quebrar os dois. Chrome habilitou X25519Kyber768Draft00 em 2023 e migrou para ML-KEM padronizado em 2024. Preocupação é "harvest now, decrypt later": tráfego capturado hoje pode ser decifrado em futuro quântico, então transporte sensível de longo prazo já deve estar em hybrid.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tls-1-3-deep-dive"
      title="TLS 1.3 deep: handshake, 0-RTT, cipher suites"
      icon="🔒"
      xp={60}
      readTime={14}
      trailName="Cryptography Applied"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O que TLS 1.3 matou" accent={accent}>
        <p>
          TLS 1.3 é menos "evolução" e mais "limpeza brutal". RC4, 3DES, AES-CBC, MD5, SHA-1, compressão, renegociação, RSA key exchange sem PFS, static DH — tudo fora. Sobrou um conjunto pequeno de primitivos modernos com PFS obrigatório.
        </p>
        <CodeBlock lang="yaml">{`# Cipher suites permitidas em TLS 1.3 (todas AEAD, todas PFS)
TLS_AES_128_GCM_SHA256         # AES-128-GCM + HKDF-SHA256
TLS_AES_256_GCM_SHA384         # AES-256-GCM + HKDF-SHA384
TLS_CHACHA20_POLY1305_SHA256   # default em mobile / ARM sem AES-NI
TLS_AES_128_CCM_SHA256         # IoT / constrained devices
TLS_AES_128_CCM_8_SHA256       # IoT, tag truncada

# Key exchange groups recomendados (2026)
x25519                         # default, Curve25519 ECDH
secp256r1                      # P-256, exigido por FIPS
x25519_kyber768_draft00        # hybrid pos-quantico (legacy name)
X25519MLKEM768                 # hybrid pos-quantico padronizado NIST`}</CodeBlock>
        <Callout tone="danger" icon="🚨">
          Never roll your own crypto: escolha cipher suites por exclusão (desligue o que é fraco) e deixe a biblioteca do SO/OpenSSL/BoringSSL escolher o resto. Não implemente handshake manual.
        </Callout>
      </Section>

      <Section title="Handshake 1-RTT ilustrado" accent={accent}>
        <CodeBlock lang="yaml">{`# Flight 1 (cliente -> servidor)
ClientHello
  supported_versions:     TLS 1.3
  cipher_suites:          TLS_AES_128_GCM_SHA256, ...
  key_share:              x25519 pub, ml_kem_768 pub (hybrid)
  signature_algorithms:   ecdsa_secp256r1_sha256, ed25519
  server_name:            fernandofrancovalle.com
  supported_groups:       x25519, X25519MLKEM768, secp256r1

# Flight 2 (servidor -> cliente, ja cifrado apos ServerHello)
ServerHello              { version, cipher_suite, key_share }
# --- chaves handshake derivadas via HKDF ---
EncryptedExtensions      (cifrado)
Certificate              (cifrado, cadeia X.509)
CertificateVerify        (cifrado, assinatura do transcript)
Finished                 (cifrado, HMAC do transcript)

# Flight 3 (cliente -> servidor)
Finished                 (cifrado)
[application data]       GET / HTTP/1.1 ...`}</CodeBlock>
      </Section>

      <Section title="Configuração de servidor em produção" accent={accent}>
        <CodeBlock lang="nginx">{`# nginx 1.25+ com TLS 1.3 only, PFS, stapling
server {
    listen 443 ssl http2;
    listen 443 quic reuseport;             # HTTP/3 via QUIC (TLS 1.3 embedded)
    http3 on;
    add_header Alt-Svc 'h3=":443"; ma=86400';

    ssl_certificate         /etc/letsencrypt/live/ffv/fullchain.pem;
    ssl_certificate_key     /etc/letsencrypt/live/ffv/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/ffv/chain.pem;

    ssl_protocols           TLSv1.3;
    ssl_ciphers             TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_tickets     off;           # force full handshake, evita replay
    ssl_early_data          off;           # 0-RTT desligado por default

    ssl_stapling on;
    ssl_stapling_verify on;

    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          SSL Labs (ssllabs.com/ssltest) e testssl.sh continuam sendo ferramentas canônicas de verificação. Em 2026, mozilla.github.io/ssl-config-generator produz configs "Modern" (TLS 1.3 only) aplicáveis direto.
        </Callout>
      </Section>

      <Section title="PFS, FS e por que session tickets são delicados" accent={accent}>
        <p>
          Perfect Forward Secrecy: se a chave privada do servidor vazar hoje, conexões antigas gravadas permanecem indecifráveis, porque cada sessão derivou segredo via ECDHE efêmero. TLS 1.3 tornou PFS obrigatório. Session tickets (PSK resumption) reintroduzem risco se a STEK (session ticket encryption key) não for rotacionada.
        </p>
        <Callout tone="warn" icon="⚠️">
          Se usar session resumption, rotacione STEK a cada 24h ou menos. CloudFront e nginx com ssl_session_tickets on + chave estática por anos é exatamente o anti-padrão que a NSA explorou em leaks documentados. Prefira resumption desligado ou STEK em HSM.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
