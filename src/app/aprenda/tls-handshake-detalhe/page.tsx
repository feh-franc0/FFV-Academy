import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#1f6feb';

export const metadata = getModuleMetadata('tls-handshake-detalhe');

const quiz: QuizQuestion[] = [
  {
    question: 'O que é Perfect Forward Secrecy e por que TLS 1.3 o tornou obrigatório?',
    options: [
      'PFS é um modo de cifração mais rápido que AES',
      'PFS garante que comprometer a chave privada do servidor NO FUTURO não permite decriptar tráfego capturado NO PASSADO. TLS 1.2 com RSA: a chave de sessão é criptografada com a chave pública do servidor. Se o atacante gravou o tráfego e depois obtém a chave privada, consegue decriptar tudo. TLS 1.3 obriga ECDHE: gera chaves efêmeras por sessão, descartadas após o handshake — mesmo com a chave privada futura, sessões passadas não são decriptáveis.',
      'PFS protege contra ataques man-in-the-middle em tempo real',
      'PFS é uma feature opcional que deve ser habilitada manualmente no servidor',
    ],
    correct: 1,
    explanation: 'Casos reais: NSA/GCHQ gravavam tráfego HTTPS em massa esperando obter chaves no futuro. PFS torna isso ineficaz — cada sessão tem chaves únicas descartadas. ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) é o mecanismo: servidor e cliente geram pares de chaves temporários por sessão. TLS 1.3 removeu todos os cipher suites sem PFS (RSA key exchange, static DH).',
  },
  {
    question: 'O que é SNI e por que é necessário para HTTPS em servidores com múltiplos domínios?',
    options: [
      'SNI é o número de série do certificado TLS',
      'SNI (Server Name Indication): extensão do ClientHello TLS que informa qual hostname o cliente quer conectar. Sem SNI, o servidor não sabe qual certificado apresentar antes do handshake TLS (TLS ocorre antes do HTTP, logo antes do "Host:" header). Com SNI, o servidor lê o hostname no ClientHello e apresenta o certificado correto — permite hospedar centenas de domínios HTTPS em um único IP.',
      'SNI é necessário apenas para certificados wildcard',
      'SNI foi substituído pelo header Host no HTTP/2',
    ],
    correct: 1,
    explanation: 'SNI é enviado em texto plano (não criptografado) — redes corporativas e governos podem ver qual site você visita mesmo com HTTPS. ECH (Encrypted Client Hello, antigo ESNI) resolve isso: criptografa o SNI usando a chave pública do servidor publicada via DNS (HTTPS record). Cloudflare implementa ECH. ALPN (Application-Layer Protocol Negotiation) funciona similar ao SNI mas para negociar protocolo: "prefiro h2 ou http/1.1?".',
  },
  {
    question: 'Como um certificado TLS X.509 prova que um servidor é legítimo?',
    options: [
      'O certificado tem uma senha que o cliente verifica diretamente',
      'Uma CA (Certificate Authority) confiável assina o certificado do servidor com sua chave privada. O cliente verifica: (1) a assinatura digital usando a chave pública da CA, (2) que a CA está em sua lista de CAs raiz confiáveis, (3) que o SAN/CN do certificado corresponde ao hostname, (4) que a validade não expirou, (5) que o cert não está revogado (OCSP/CRL). PKI: confiança delegada de CA raiz → CA intermediária → certificado do site.',
      'O cliente verifica o certificado diretamente com o servidor por outro canal',
      'Certificados TLS são verificados apenas pelo DNS, não pelo cliente',
    ],
    correct: 1,
    explanation: 'Chain of trust: CA raiz (pré-instalada no OS/browser) → assina CA intermediária → assina certificado do site. Sem CA intermediária, revogar uma CA raiz quebraria toda a internet. OCSP Stapling: servidor inclui resposta OCSP assinada no handshake TLS — evita que o cliente faça request extra para verificar revogação. Certificate Transparency (CT): logs públicos de todos os certs emitidos — permite detectar certs fraudulentos.',
  },
];

export default function TlsHandshakeDetalhePage() {
  return (
    <ModuleLayout
      slug="tls-handshake-detalhe"
      title="TLS 1.3: handshake, chaves, certificados, SNI, ALPN"
      icon="🔐"
      xp={90}
      readTime={18}
      trailName="Redes & Web"
      trailColor="#1f6feb"
      nextSlug="dns-recursivo-autoritativo"
      nextTitle="DNS: recursivo, autoritativo, registros, TTL, DNSSEC"
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
        TLS é a camada que torna o HTTPS seguro — sem ele, qualquer roteador no caminho leria seus dados. Entender o handshake revela por que HTTPS é 1 RTT mais lento que HTTP e por que Perfect Forward Secrecy mudou a equação de vigilância em massa.
      </p>

      <Section accent={accent} title="TLS 1.3 handshake: 1 RTT">
        <CodeBlock>{`# TLS 1.3 handshake (1 RTT — metade do TLS 1.2):

# CLIENTE → SERVIDOR: ClientHello
#   TLS version: 1.3
#   Supported cipher suites: TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256
#   Key share: chave pública ECDHE gerada para esta sessão
#   SNI: "example.com" (extensão: qual hostname o cliente quer)
#   ALPN: ["h2", "http/1.1"] (qual protocolo prefere)
#   Supported groups: x25519, secp256r1 (curvas elípticas)

# SERVIDOR → CLIENTE: ServerHello + dados criptografados
#   ServerHello:
#     TLS version: 1.3
#     Cipher suite: TLS_AES_256_GCM_SHA384
#     Key share: chave pública ECDHE do servidor para esta sessão
#   [a partir daqui TUDO É CRIPTOGRAFADO]
#   EncryptedExtensions: ALPN selecionado ("h2"), etc.
#   Certificate: certificado X.509 do servidor
#   CertificateVerify: prova que servidor tem a chave privada
#   Finished: MAC de toda a transcrição do handshake

# CLIENTE → SERVIDOR: Finished + dados da aplicação
#   Finished: MAC de toda a transcrição
#   [dados da aplicação já podem ser enviados aqui!]

# Total: 1 RTT até começar a receber dados.
# TLS 1.2 com ECDHE: 2 RTTs. Com RSA: 2 RTTs.
# TLS 1.2 com session resumption: 1 RTT.
# TLS 1.3 com 0-RTT: 0 RTTs adicionais (apenas para reconexão).

# Verificar handshake TLS na prática:
# openssl s_client -connect example.com:443 -tls1_3 2>&1 | head -30
# Mostra: protocolo, cipher suite, certificado, chain`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Diffie-Hellman efêmero e Perfect Forward Secrecy">
        <CodeBlock>{`# ECDHE: Elliptic Curve Diffie-Hellman Ephemeral
# Matemática: gerar segredo compartilhado sem transmiti-lo

# Conceito DH simples (com números reais, não seguros):
g = 2      # gerador público
p = 23     # primo público

# Servidor e cliente geram segredos privados efêmeros:
privado_servidor = 6  # gerado aleatoriamente por sessão
privado_cliente  = 15 # gerado aleatoriamente por sessão

# Trocam chaves públicas:
pub_servidor = pow(g, privado_servidor, p)  # 2^6 mod 23 = 18
pub_cliente  = pow(g, privado_cliente,  p)  # 2^15 mod 23 = 19

# Calculam o segredo compartilhado (sem transmiti-lo!):
segredo_no_servidor = pow(pub_cliente, privado_servidor, p)   # 19^6 mod 23 = 2
segredo_no_cliente  = pow(pub_servidor, privado_cliente,  p)  # 18^15 mod 23 = 2
assert segredo_no_servidor == segredo_no_cliente  # sempre iguais por matemática

print(f"Segredo compartilhado: {segredo_no_servidor}")  # nunca trafegou pela rede!

# Em produção: curvas elípticas (x25519) em vez de DH inteiros
# x25519: chaves de 256 bits, ~128 bits de segurança, muito mais rápido que RSA-2048

# Por que "efêmero" é chave para PFS:
# Chaves privadas ECDHE são geradas POR SESSÃO e descartadas após o handshake.
# Se atacante grava tráfego hoje e obtém chave PRIVADA DO SERVIDOR no futuro:
# - TLS 1.2 RSA: consegue decriptar (chave privada decripta a chave de sessão)
# - TLS 1.3 ECDHE: NÃO consegue (chave efêmera já foi descartada)

# Derivação das chaves de sessão (HKDF):
# master_secret = ECDHE_shared_secret
# client_key    = HKDF-Expand(master_secret, "client write key", key_length)
# server_key    = HKDF-Expand(master_secret, "server write key", key_length)
# Cada direção usa chave diferente — comprometer uma não compromete a outra`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Certificados X.509 e PKI">
        <CodeBlock>{`import ssl
import socket
import datetime

def inspecionar_certificado(host: str, port: int = 443) -> dict:
    """Inspeciona certificado TLS de um host."""
    context = ssl.create_default_context()
    with socket.create_connection((host, port), timeout=10) as sock:
        with context.wrap_socket(sock, server_hostname=host) as ssock:
            cert = ssock.getpeercert()
            cipher = ssock.cipher()
            version = ssock.version()

    # Extrair campos relevantes:
    subject = dict(x[0] for x in cert.get("subject", []))
    issuer  = dict(x[0] for x in cert.get("issuer", []))
    san = [v for (t, v) in cert.get("subjectAltName", []) if t == "DNS"]
    not_after = datetime.datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z")
    dias_restantes = (not_after - datetime.datetime.utcnow()).days

    return {
        "cn": subject.get("commonName"),
        "san": san,
        "issuer": issuer.get("organizationName"),
        "not_after": not_after.isoformat(),
        "dias_restantes": dias_restantes,
        "tls_version": version,
        "cipher": cipher[0],
    }

info = inspecionar_certificado("example.com")
print(f"CN: {info['cn']}")
print(f"SANs: {info['san']}")
print(f"Emissor: {info['issuer']}")
print(f"Expira em: {info['dias_restantes']} dias")
print(f"TLS: {info['tls_version']}, Cipher: {info['cipher']}")

# Estrutura de um certificado X.509:
# - Subject: para quem foi emitido (CN=example.com)
# - SAN (Subject Alt Names): domínios cobertos (prefere SAN ao CN)
# - Issuer: quem assinou (Let's Encrypt, DigiCert, etc.)
# - Not Before / Not After: validade
# - Serial Number: único por CA
# - Public Key: RSA 2048+ ou EC P-256/P-384
# - Signature Algorithm: SHA256withRSAEncryption ou similar
# - Extensions: Key Usage, Extended Key Usage, OCSP URL, CRL URL`}</CodeBlock>
      </Section>

      <Section accent={accent} title="SNI, ALPN, OCSP Stapling e Certificate Transparency">
        <ComparisonTable
          headers={['Extensão TLS', 'Função', 'Enviada por']}
          rows={[
            ['SNI', 'Informa hostname para multi-tenant TLS', 'Cliente (ClientHello)'],
            ['ALPN', 'Negocia protocolo de aplicação (h2, http/1.1)', 'Cliente + Servidor'],
            ['OCSP Stapling', 'Prova de não-revogação incluída pelo servidor', 'Servidor'],
            ['Session Ticket', 'Resumption rápida de sessão (TLS 1.2)', 'Servidor'],
            ['ECH', 'Criptografa o SNI (privacidade de hostname)', 'Cliente'],
            ['Certificate Status', 'Solicita status OCSP ao servidor', 'Cliente'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# SNI: permite múltiplos domínios HTTPS no mesmo IP
# Sem SNI: servidor teria que usar IP diferente por domínio (IPv4 escasso)
# Com SNI: 1 IP → 10.000 domínios HTTPS diferentes

# Verificar SNI em uso:
# openssl s_client -servername example.com -connect example.com:443 2>/dev/null | grep "subject="

# ALPN: negocia protocolo de aplicação no handshake TLS
# ClientHello extension: ["h2", "http/1.1"] (order = preference)
# ServerHello extension: "h2" (servidor aceita HTTP/2)
# Sem ALPN: servidor responde HTTP/1.1 mesmo que suporte HTTP/2

# OCSP Stapling: evita round-trip extra de verificação de revogação
# Sem stapling: cliente faz request OCSP → CA (latência extra)
# Com stapling: servidor inclui resposta OCSP pré-assinada pela CA no handshake
# Nginx: ssl_stapling on; ssl_stapling_verify on;
# Apache: SSLUseStapling on

# Certificate Transparency (CT):
# Toda CA deve registrar certificados emitidos em CT logs públicos
# Browser verifica que o cert está em ≥2 CT logs antes de aceitar
# Permite detectar: cert fraudulento emitido sem autorização do dono do domínio
# Exemplo real: Symantec emitiu certs inválidos → Chrome exigiu CT → detectado

# Let's Encrypt: CA gratuita e automatizada
# ACME protocol: valida domínio e emite cert em ~30s
# Certbot ou acme.sh automatizam renovação (certs expiram em 90 dias)
# Wildcard certs: *.example.com via DNS-01 challenge (cria record TXT)

# Verificar chain completa:
# openssl s_client -connect example.com:443 -showcerts 2>/dev/null | openssl x509 -text -noout | grep -A2 "Issuer"`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> TLS 1.3 = 1 RTT de handshake (vs 2 do TLS 1.2). ECDHE garante Perfect Forward Secrecy — sessões passadas não podem ser decriptadas mesmo com a chave privada do servidor. SNI permite HTTPS multi-tenant no mesmo IP. ALPN negocia protocolo (h2/http1.1) no handshake. Certificados X.509 = confiança delegada: CA raiz → CA intermediária → seu domínio. Let's Encrypt automatiza emissão e renovação gratuitamente.
      </Callout>

      <Callout>
        Próximo: <strong>DNS</strong> — o sistema que converte "example.com" em IP e as vulnerabilidades que existem nessa tradução.
      </Callout>
    </div>
  );
}
