import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('pki-x509-certificates');

const accent = '#dc2626';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que uma chain típica de TLS tem root -> intermediate -> leaf em vez de root assinar o leaf direto?',
    options: [
      'Porque fica mais bonito no navegador',
      'Porque a root privada fica offline em HSM (air-gapped), reduzindo risco de comprometimento. Se uma intermediate vaza, revoga-se ela sem invalidar a root e todas as outras intermediates/sites. Delega também responsabilidade operacional a sub-CAs',
      'Porque o protocolo exige pelo menos 3 níveis',
      'Porque intermediate cifra e root apenas assina',
    ],
    correct: 1,
    explanation: 'A root é a âncora de confiança distribuída em trust stores (Mozilla, Apple, Microsoft, Google). Se vazasse, revogá-la significaria atualizar bilhões de dispositivos. Mantém-se offline em HSM e só assina intermediates com validade curta. Compromisso de intermediate é recuperável: revoga via CRL, emite nova, root continua intacta. Esse é o design que salvou o ecossistema quando DigiNotar e outras foram invadidas.',
  },
  {
    question: 'O que é OCSP stapling e por que virou default?',
    options: [
      'Um protocolo novo que substitui TLS',
      'Servidor consulta o OCSP responder da CA periodicamente, obtém resposta assinada de status e anexa (staple) durante o handshake TLS. Cliente não precisa falar com a CA, melhora latência e preserva privacidade do usuário',
      'Um tipo de CRL comprimida',
      'Uma forma de revogar a root',
    ],
    correct: 1,
    explanation: 'OCSP clássico tinha dois problemas: latência extra (cliente consulta CA a cada conexão) e leak de histórico de navegação para a CA. Stapling (RFC 6066) resolve ambos: o servidor já traz a prova fresca. Must-Staple (RFC 7633) na extensão do cert força o cliente a rejeitar se stapling faltar, fechando a brecha de fallback silencioso. Let Encrypt anunciou depreciação do OCSP em 2024 em favor de CRLs curtas (shortened CRLs) + validade reduzida.',
  },
  {
    question: 'Como o ACME do Let\'s Encrypt prova que você controla um domínio?',
    options: [
      'Envia um email para o whois',
      'Challenges: HTTP-01 (servir arquivo em /.well-known/acme-challenge/TOKEN), DNS-01 (TXT record _acme-challenge.dominio) ou TLS-ALPN-01. Cliente assina nonce com chave da conta, ACME server valida e emite cert em segundos',
      'Liga para o dono do domínio',
      'Exige documento em cartório',
    ],
    correct: 1,
    explanation: 'ACME (RFC 8555) automatiza validação de domínio. DNS-01 é o único que permite wildcard (*.exemplo.com) e funciona sem expor HTTP. HTTP-01 é mais simples para single-host. TLS-ALPN-01 evita abrir porta 80. certbot, acme.sh, Caddy e cert-manager (Kubernetes) implementam o protocolo. Renovação deve rodar em cron com margem de 30 dias antes da expiração (cert Let\'s Encrypt dura 90 dias).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="pki-x509-certificates"
      title="PKI + X.509 certificates"
      icon="📜"
      xp={55}
      readTime={13}
      trailName="Cryptography Applied"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Por que PKI existe" accent={accent}>
        <p>
          Cifrar com chave pública é fácil; a dificuldade é responder "esta chave pública realmente pertence ao dono de example.com?". PKI (Public Key Infrastructure) resolve via terceira parte confiável (CA) que assina um certificado amarrando chave pública a identidade. X.509 é o formato desse certificado, padronizado na RFC 5280.
        </p>
        <Callout tone="danger" icon="🚨">
          Never roll your own crypto — e never roll your own CA. Use Let\'s Encrypt, AWS Private CA, HashiCorp Vault PKI ou smallstep para emitir certificados. Implementar CA do zero é convite a desastre.
        </Callout>
      </Section>

      <Section title="Anatomia de um certificado X.509" accent={accent}>
        <CodeBlock lang="bash">{`# Inspecionar certificado com openssl
openssl s_client -connect fernandofrancovalle.com:443 -servername fernandofrancovalle.com < /dev/null \\
  | openssl x509 -noout -text

# Campos chave que voce vai ler:
# Subject:         CN=fernandofrancovalle.com
# Issuer:          C=US, O=Let's Encrypt, CN=R11
# Not Before:      Apr  1 10:00:00 2026 GMT
# Not After :      Jun 30 10:00:00 2026 GMT
# Subject Alt Name: DNS:fernandofrancovalle.com, DNS:www.fernandofrancovalle.com
# Key Usage:       Digital Signature, Key Encipherment
# Extended Key Usage: TLS Web Server Authentication
# Public Key:      ECDSA P-256 ou RSA 2048+

# Verificar chain inteira
openssl s_client -showcerts -connect example.com:443 < /dev/null

# Verificar contra trust store local
openssl verify -CAfile /etc/ssl/certs/ca-certificates.crt cert.pem`}</CodeBlock>
        <Callout tone="info" icon="💡">
          SAN (Subject Alternative Name) é obrigatório desde 2017; navegadores ignoram CN para validação de hostname há quase uma década. Sempre emita com SAN populado.
        </Callout>
      </Section>

      <Section title="Emissão via ACME / Let's Encrypt" accent={accent}>
        <CodeBlock lang="bash">{`# certbot classico
sudo certbot certonly --webroot -w /var/www/html \\
  -d fernandofrancovalle.com -d www.fernandofrancovalle.com \\
  --email fernandofv1110@gmail.com --agree-tos --no-eff-email

# Renovar automatico (rota recomendada: systemd timer ou cron)
0 3 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx"

# Caddy faz tudo sozinho: emite, renova, OCSP staple
# /etc/caddy/Caddyfile
fernandofrancovalle.com {
    tls fernandofv1110@gmail.com
    reverse_proxy localhost:3000
}

# Wildcard exige DNS-01
sudo certbot certonly --dns-cloudflare \\
  --dns-cloudflare-credentials ~/.secrets/cf.ini \\
  -d "*.fernandofrancovalle.com"`}</CodeBlock>
      </Section>

      <Section title="Revogação: CRL, OCSP, short-lived" accent={accent}>
        <p>
          Certificado comprometido antes da expiração precisa ser revogado. Três abordagens coexistem: CRL (lista assinada pela CA, cliente baixa e consulta localmente), OCSP (query online por cert) e OCSP stapling (servidor anexa prova no handshake). Tendência 2025+: validade curta (7-10 dias) com renovação automática, tornando revogação menos crítica.
        </p>
        <CodeBlock lang="nginx">{`# nginx com OCSP stapling
server {
    listen 443 ssl http2;
    server_name fernandofrancovalle.com;

    ssl_certificate         /etc/letsencrypt/live/ffv/fullchain.pem;
    ssl_certificate_key     /etc/letsencrypt/live/ffv/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/ffv/chain.pem;

    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 1.1.1.1 8.8.8.8 valid=300s;

    ssl_protocols TLSv1.3 TLSv1.2;
    ssl_prefer_server_ciphers off;
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          CT logs (Certificate Transparency, RFC 6962) obrigatórios desde 2018 em navegadores principais. Toda emissão de cert público vai para logs auditáveis (crt.sh). Use como detecção: monitore emissões estranhas para seu domínio.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
