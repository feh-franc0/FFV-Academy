import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata: Metadata = {
  title: 'DNS, TLS e certificados: o que acontece antes do seu request — FFV Academy',
  description: 'Resolução DNS recursiva, handshake TLS 1.3, certificados X.509, Let\'s Encrypt — tudo que acontece antes do seu HTTP request chegar ao servidor.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que é um DNS TTL e por que ele importa ao trocar o IP de um servidor?',
    options: [
      'TTL é o tempo de vida do servidor DNS',
      'TTL (Time To Live) é por quantos segundos resolvers e browsers podem cachear a resposta DNS. Se TTL=3600, troca de IP pode levar até 1 hora para propagar. Antes de uma migração, reduzir TTL para 60s (e aguardar o TTL antigo expirar) garante propagação rápida depois.',
      'TTL indica quantos saltos (hops) o pacote DNS pode fazer',
      'TTL é o tempo máximo que o servidor DNS fica online',
    ],
    correct: 1,
    explanation: 'Estratégia de migração de DNS: 1 semana antes → reduzir TTL de 3600 para 60. Aguardar TTL antigo expirar (3600s = 1h). Na migração → trocar o IP. Propagação agora acontece em 60 segundos. Após migração bem-sucedida → aumentar TTL de volta para 3600.',
  },
  {
    question: 'O que o handshake TLS 1.3 garante que o HTTP simples não garante?',
    options: [
      'Que o servidor é mais rápido',
      'Três propriedades: Confidencialidade (ninguém no caminho lê o conteúdo), Integridade (conteúdo não foi alterado em trânsito — HMAC), e Autenticidade (o servidor é quem diz ser — verificado pelo certificado X.509 assinado por uma CA confiável). HTTP simples não garante nenhuma das três.',
      'Que o servidor fica disponível 100% do tempo',
      'Que a conexão é mais rápida que HTTP',
    ],
    correct: 1,
    explanation: 'TLS 1.3 adicionou Perfect Forward Secrecy (PFS) por padrão: chaves de sessão efêmeras via ECDHE. Mesmo que a chave privada do servidor vaze no futuro, conversas passadas não podem ser descriptografadas. TLS 1.3 também reduziu o handshake de 2 roundtrips (TLS 1.2) para 1 roundtrip — impacto real na latência.',
  },
  {
    question: 'Por que um certificado autoassinado (self-signed) não é confiável por browsers mas funciona em testes?',
    options: [
      'Porque não usa criptografia real',
      'Porque não há uma CA (Certificate Authority) confiável que o assinou. Browsers têm uma lista de CAs raiz pré-instaladas (Mozilla NSS, Apple, Microsoft). Um certificado autoassinado é assinado pela própria chave privada do servidor — sem âncora de confiança. Em testes você pode adicionar o cert como trusted manualmente.',
      'Porque autoassinados usam algoritmos antigos de criptografia',
      'Porque autoassinados expiram mais rápido',
    ],
    correct: 1,
    explanation: 'A cadeia de confiança TLS: Root CA (confiada pelo SO/browser) → Intermediate CA → Leaf certificate (do seu servidor). Você confia no Root CA e, por extensão, em tudo que ele assinou. Let\'s Encrypt é uma CA intermediária gratuita, cujo Root CA está na lista de confiança de todos os browsers modernos.',
  },
];

export default function DnsTlsCertificadosPage() {
  return (
    <ModuleLayout
      slug="dns-tls-certificados"
      title="DNS, TLS e certificados: o que acontece antes do seu request"
      icon="🔒"
      xp={60}
      readTime={12}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="json-yaml-env"
      nextTitle="JSON, YAML e variáveis de ambiente: config moderna"
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
        Antes do seu request HTTP chegar ao servidor, dois processos críticos acontecem: o DNS resolve o nome para um IP, e o TLS estabelece um canal seguro. Entender esses dois mecanismos é essencial para depurar problemas de rede e configurar infraestrutura corretamente.
      </p>

      <Section accent={accent} title="DNS: do nome ao IP">
        <p>
          DNS (Domain Name System) é o "catálogo telefônico" da internet — traduz nomes legíveis (<code>google.com</code>) em endereços IP (<code>142.250.79.46</code>). A resolução acontece em vários passos:
        </p>
        <CodeBlock>{`# O que acontece quando você digita "google.com" no browser:

1. CACHE LOCAL — browser verifica cache DNS do SO
   (TTL não expirou? → resposta imediata)

2. RESOLVER RECURSIVO — geralmente o DNS do seu ISP ou do roteador
   (8.8.8.8 = Google, 1.1.1.1 = Cloudflare são resolvers públicos)

3. ROOT NAMESERVERS (.) — 13 clusters de servidores ao redor do mundo
   Resposta: "não sei, mas para .com pergunte ao nameserver TLD: X.X.X.X"

4. TLD NAMESERVER (.com) — gerenciado pela Verisign
   Resposta: "não sei, mas google.com usa nameserver: ns1.google.com"

5. AUTHORITATIVE NAMESERVER (ns1.google.com) — gerenciado pelo Google
   Resposta: "google.com = 142.250.79.46, TTL=300" ← resposta final!

6. RESPOSTA CACHEADA pelo resolver e devolvida para você
   Válida por TTL=300 segundos (5 minutos)

# Tempo total desse processo: ~50-200ms na primeira vez
# Com cache: <1ms`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Tipos de registro DNS">
        <ComparisonTable
          headers={['Tipo', 'O que armazena', 'Exemplo']}
          rows={[
            ['A', 'IPv4 address', 'exemplo.com → 203.0.113.10'],
            ['AAAA', 'IPv6 address', 'exemplo.com → 2001:db8::1'],
            ['CNAME', 'Alias para outro nome', 'www.exemplo.com → exemplo.com'],
            ['MX', 'Mail server', 'exemplo.com MX → mail.google.com (prio 10)'],
            ['TXT', 'Texto livre (SPF, DKIM, verificação)', '"v=spf1 include:_spf.google.com ~all"'],
            ['NS', 'Nameserver autoritativo', 'exemplo.com NS → ns1.cloudflare.com'],
            ['PTR', 'Reverse DNS (IP → nome)', '10.113.0.203.in-addr.arpa → servidor.com'],
            ['SOA', 'Start of Authority (metadados da zona)', 'TTL padrão, email do admin'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Ferramentas de diagnóstico DNS
dig exemplo.com              # query A record
dig exemplo.com MX           # query MX records
dig exemplo.com NS           # nameservers autoritativos
dig @8.8.8.8 exemplo.com     # query usando resolver específico (Google)
dig +trace exemplo.com       # mostra toda a cadeia de resolução
dig -x 203.0.113.10          # reverse DNS lookup

nslookup exemplo.com         # alternativa mais simples (disponível no Windows)
host exemplo.com             # ainda mais simples

# Ver TTL atual de um registro:
dig exemplo.com | grep -A1 "ANSWER SECTION"
# → exemplo.com.   300   IN   A   203.0.113.10
#                  ↑ TTL em segundos`}</CodeBlock>
      </Section>

      <Section accent={accent} title="TLS: como a comunicação é protegida">
        <p>
          TLS (Transport Layer Security) garante que a comunicação entre cliente e servidor seja confidencial, íntegra e autenticada. Desde 2018, TLS 1.3 é o padrão.
        </p>
        <CodeBlock>{`# Handshake TLS 1.3 (simplificado — 1 round-trip):

Cliente → Servidor:
  ClientHello:
  - Versão: TLS 1.3
  - Cipher suites suportados: TLS_AES_256_GCM_SHA384, ...
  - Chave pública efêmera (ECDHE) — para estabelecer a chave de sessão
  - SNI (Server Name Indication): "quero falar com api.exemplo.com"
    ↑ SNI é o hostname na camada TLS — permite múltiplos certs no mesmo IP

Servidor → Cliente:
  ServerHello:
  - Cipher suite escolhido
  - Chave pública efêmera do servidor (ECDHE)
  - Certificado X.509 do servidor (contém a chave pública RSA/ECDSA)
  - Assinatura que prova que o servidor tem a chave privada

Ambos derivam a mesma chave de sessão simétrica (AES-256-GCM):
  - A partir de: client_ephemeral_private × server_ephemeral_public (ECDH)
  - A chave de sessão NUNCA trafega pela rede → Perfect Forward Secrecy

Handshake completo! Comunicação cifrada com AES-256-GCM começa.`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Certificados X.509 e a cadeia de confiança">
        <p>
          Um certificado TLS é um documento assinado digitalmente que associa uma chave pública a um nome de domínio. A validade do certificado depende da <strong>cadeia de confiança</strong>.
        </p>
        <CodeBlock>{`# Estrutura de um certificado X.509
openssl x509 -in certificado.pem -text -noout

# Campos importantes:
Subject: CN=exemplo.com, O=Empresa Ltda, C=BR  ← quem é o dono
Issuer: CN=Let's Encrypt R3, O=Let's Encrypt, C=US  ← quem assinou
Validity:
  Not Before: Jan  1 00:00:00 2026 GMT
  Not After:  Apr  1 00:00:00 2026 GMT   ← expira em 90 dias (Let's Encrypt)
Subject Alternative Names:
  DNS:exemplo.com
  DNS:www.exemplo.com                    ← wildcard: *.exemplo.com seria todos os subdomínios
Public Key Algorithm: id-ecPublicKey     ← ECDSA P-256

# Cadeia de confiança:
# Root CA (ISRG Root X1) → Intermediária (R3) → Leaf (exemplo.com)
# O Root CA está no trust store do seu SO/browser
# O browser valida a cadeia completa: leaf assinado por R3? R3 assinado por ISRG Root X1? Root confiado?`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Let's Encrypt: certificados gratuitos em produção">
        <CodeBlock>{`# Let's Encrypt + certbot: gratuito, automático, confiável
# https://letsencrypt.org — CA sem fins lucrativos

# Instalar certbot (Ubuntu/Debian)
sudo apt install certbot python3-certbot-nginx

# Obter certificado para nginx
sudo certbot --nginx -d exemplo.com -d www.exemplo.com

# Apenas obter o cert (sem configurar o servidor):
sudo certbot certonly --webroot -w /var/www/html -d exemplo.com

# Renovação automática (cron já configurado pelo certbot)
sudo certbot renew --dry-run    # testa renovação sem executar

# Arquivos gerados em /etc/letsencrypt/live/exemplo.com/:
# cert.pem       → certificado do seu domínio
# chain.pem      → certificados intermediários
# fullchain.pem  → cert.pem + chain.pem (o que o nginx/apache usa)
# privkey.pem    → sua chave privada (600 perms, nunca compartilhar)

# Configuração nginx mínima com TLS:
server {
    listen 443 ssl;
    server_name exemplo.com www.exemplo.com;

    ssl_certificate /etc/letsencrypt/live/exemplo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/exemplo.com/privkey.pem;

    # Redirect HTTP para HTTPS
    # (em outro bloco server listen 80)
}`}</CodeBlock>
        <Callout tone="info">
          Let's Encrypt usa o protocolo ACME para verificar que você controla o domínio. Método mais comum: <strong>HTTP-01</strong> (serve um arquivo em <code>/.well-known/acme-challenge/</code>). Para wildcards: <strong>DNS-01</strong> (cria um registro TXT no DNS do domínio).
        </Callout>
      </Section>

      <Section accent={accent} title="Depurando problemas de DNS e TLS">
        <CodeBlock>{`# Diagnóstico TLS
openssl s_client -connect exemplo.com:443 -servername exemplo.com
# Mostra: certificado completo, cadeia, datas de validade, cipher suite

# Verificar expiração do certificado
echo | openssl s_client -connect exemplo.com:443 2>/dev/null \
  | openssl x509 -noout -dates

# Testar renovação sem downtime
curl -I https://exemplo.com  # headers incluem informações do TLS

# Verificar se o hostname está no cert (SAN):
openssl s_client -connect exemplo.com:443 -servername exemplo.com \
  | openssl x509 -noout -text | grep -A1 "Subject Alternative"

# Problemas comuns:
# ERR_CERT_COMMON_NAME_INVALID → hostname não está no SAN do certificado
# ERR_CERT_DATE_INVALID → certificado expirado (renovar!)
# ERR_CERT_AUTHORITY_INVALID → cadeia incompleta ou CA não confiável
# SSL_ERROR_RX_RECORD_TOO_LONG → servidor não está falando TLS na porta (HTTP na porta 443)`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Checklist de HTTPS em produção:</strong> certificado válido e não expirado, renovação automática configurada (certbot), redirect HTTP→HTTPS (301), HSTS habilitado, TLS 1.2/1.3 apenas (desabilitar 1.0/1.1), testar com SSL Labs (ssllabs.com/ssltest).
      </Callout>

      <Callout>
        Próximo: <strong>JSON, YAML e variáveis de ambiente</strong> — os formatos de configuração que todo sistema moderno usa.
      </Callout>
    </div>
  );
}
