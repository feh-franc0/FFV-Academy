import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#8b949e';

export const metadata = getModuleMetadata('http-do-zero');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença semântica entre PUT e PATCH?',
    options: [
      'São equivalentes — qualquer um serve para atualizar',
      'PUT substitui o recurso INTEIRO (idempotente: PUT com o mesmo body sempre resulta no mesmo estado). PATCH aplica atualização PARCIAL. Ex: PATCH /users/1 com {name: "novo"} muda só o nome; PUT /users/1 substitui o usuário inteiro pelo body enviado.',
      'PATCH é mais eficiente porque envia menos dados',
      'PUT é para criar, PATCH é para atualizar',
    ],
    correct: 1,
    explanation: 'Idempotência em HTTP: GET, PUT, DELETE são idempotentes (múltiplas chamadas iguais = mesmo resultado). POST e PATCH não necessariamente. Isso importa para retry logic: se uma PUT falhou, você pode retentar com segurança. Se uma POST falhou, retentar pode criar duplicatas — por isso use idempotency keys.',
  },
  {
    question: 'O que é CORS e por que o browser o aplica (mas curl não)?',
    options: [
      'CORS é uma proteção do servidor contra ataques',
      'CORS (Cross-Origin Resource Sharing) é uma política implementada pelo BROWSER para proteger o usuário. O servidor define quais origens podem acessar seus recursos via headers (Access-Control-Allow-Origin). curl não é um browser e não tem same-origin policy — não tem usuário autenticado para proteger.',
      'CORS é um protocolo de criptografia para APIs',
      'CORS é aplicado igualmente por browsers e ferramentas de linha de comando',
    ],
    correct: 1,
    explanation: 'Same-origin policy existe porque browsers mantêm cookies de autenticação. Sem ela, um site malicioso poderia fazer sua API bancária: os cookies do banco seriam enviados automaticamente. CORS é o mecanismo para relaxar essa política de forma controlada. curl não tem esse contexto de segurança.',
  },
  {
    question: 'Qual a diferença entre os status 401 e 403?',
    options: [
      'São equivalentes — ambos indicam acesso negado',
      '401 Unauthorized = não autenticado (quem é você?). O cliente deve autenticar e tentar novamente. 403 Forbidden = autenticado, mas sem permissão (sei quem você é, mas não pode). Retentar com as mesmas credenciais não vai ajudar.',
      '401 é para erros no cliente, 403 é para erros no servidor',
      '401 é HTTP/1.1, 403 é HTTP/2',
    ],
    correct: 1,
    explanation: 'A distinção 401 vs 403 é semântica mas importante para UX: 401 → mostrar tela de login. 403 → mostrar mensagem "sem permissão" ou esconder o elemento. Muitas APIs retornam 403 mesmo para não-autenticados (para não revelar que o recurso existe) — é um trade-off de segurança vs usabilidade.',
  },
];

export default function HttpDoZeroPage() {
  return (
    <ModuleLayout
      slug="http-do-zero"
      title="HTTP do zero: request, response, status, headers, cookies"
      icon="🌐"
      xp={70}
      readTime={14}
      trailName="Fundamentos Técnicos"
      trailColor="#8b949e"
      nextSlug="dns-tls-certificados"
      nextTitle="DNS, TLS e certificados: o que acontece antes do seu request"
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
        HTTP (HyperText Transfer Protocol) é o protocolo que move a web inteira. APIs REST, webhooks, browsers, apps mobile — tudo fala HTTP. Entender sua estrutura real não é opcional para quem desenvolve software moderno.
      </p>

      <Section accent={accent} title="Anatomia de uma request e response HTTP">
        <CodeBlock>{`# Request HTTP/1.1 completa (o que vai pelo fio):
GET /api/users/42 HTTP/1.1
Host: api.exemplo.com
Accept: application/json
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
User-Agent: curl/8.4.0
Connection: keep-alive

# Request POST com body:
POST /api/users HTTP/1.1
Host: api.exemplo.com
Content-Type: application/json
Content-Length: 52
Authorization: Bearer eyJhbGci...

{"name": "Fernando", "email": "f@exemplo.com"}

# Response HTTP/1.1 completa:
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 89
Location: /api/users/43
X-Request-Id: abc-123-def
Cache-Control: no-store
Date: Thu, 17 Apr 2026 10:00:00 GMT

{"id": 43, "name": "Fernando", "email": "f@exemplo.com", "created_at": "..."}`}</CodeBlock>
        <p>
          Toda request tem: <strong>método + path + versão</strong> na primeira linha, <strong>headers</strong> (um por linha, formato <code>Nome: Valor</code>), linha em branco, e opcionalmente um <strong>body</strong>. Response tem: <strong>versão + status code + reason phrase</strong>, headers, linha em branco, e o body da resposta.
        </p>
      </Section>

      <Section accent={accent} title="Métodos HTTP: semântica importa">
        <ComparisonTable
          headers={['Método', 'Semântica', 'Idempotente?', 'Tem body?']}
          rows={[
            ['GET', 'Leitura — nunca modifica', 'Sim', 'Não (prática)'],
            ['POST', 'Criação / ação não-idempotente', 'Não', 'Sim'],
            ['PUT', 'Substituição completa do recurso', 'Sim', 'Sim'],
            ['PATCH', 'Atualização parcial', 'Não necessariamente', 'Sim'],
            ['DELETE', 'Remoção do recurso', 'Sim', 'Não (prática)'],
            ['HEAD', 'Igual GET, mas sem body na response', 'Sim', 'Não'],
            ['OPTIONS', 'Quais métodos são suportados? (CORS preflight)', 'Sim', 'Não'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Idempotência na prática:
# PUT /users/42 com body completo → mesmo resultado toda vez = idempotente
# DELETE /users/42 → mesmo resultado (404 na 2ª vez, mas o estado final é igual)
# POST /orders → cria um novo pedido a cada chamada = NÃO idempotente

# Idempotency key para POST seguro (padrão stripe/paypal):
POST /api/payments
Idempotency-Key: client-generated-uuid-abc123
{"amount": 100, "currency": "BRL"}
# Servidor: se já processou esta key, retorna o resultado original sem processar novamente`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Status codes: o que cada faixa significa">
        <ComparisonTable
          headers={['Faixa', 'Categoria', 'Exemplos importantes']}
          rows={[
            ['1xx', 'Informacional', '101 Switching Protocols (WebSocket upgrade)'],
            ['2xx', 'Sucesso', '200 OK, 201 Created, 204 No Content'],
            ['3xx', 'Redirecionamento', '301 Moved Permanently, 302 Found, 304 Not Modified'],
            ['4xx', 'Erro do cliente', '400 Bad Request, 401 Unauth, 403 Forbidden, 404 Not Found, 429 Too Many Requests'],
            ['5xx', 'Erro do servidor', '500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Status codes que todo dev confunde:

# 200 vs 201 vs 204:
GET /users/42    → 200 OK + body
POST /users      → 201 Created + body + header Location: /users/43
DELETE /users/42 → 204 No Content (sem body)

# 301 vs 302 vs 307 vs 308:
# 301 Moved Permanently  → browser e crawlers atualizam a URL (SEO redirect)
# 302 Found              → redirect temporário (crawlers não atualizam)
# 307 Temporary Redirect → como 302, mas garante manter o método HTTP
# 308 Permanent Redirect → como 301, mas garante manter o método HTTP

# 400 vs 422:
# 400 Bad Request  → request malformada (JSON inválido, campos obrigatórios faltando)
# 422 Unprocessable Entity → sintaxe OK, mas semanticamente inválido
#     (email formatado corretamente mas já cadastrado)

# 401 vs 403:
# 401 → não autenticado → mostre tela de login
# 403 → autenticado mas sem permissão → mostre "acesso negado"

# 429 Too Many Requests → rate limited
# Boas APIs incluem: Retry-After: 60 (segundos para aguardar)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Headers: metadados que controlam tudo">
        <CodeBlock>{`# Headers de Autenticação
Authorization: Bearer <JWT-token>
Authorization: Basic <base64(user:pass)>
X-API-Key: abc123                    # padrão de APIs simples

# Headers de Conteúdo
Content-Type: application/json       # formato do BODY enviado
Content-Type: multipart/form-data    # upload de arquivo
Accept: application/json             # formato que o cliente ACEITA na resposta
Content-Length: 1234                 # tamanho em bytes do body
Content-Encoding: gzip               # body está comprimido

# Headers de Cache
Cache-Control: no-cache              # sempre revalida com o servidor
Cache-Control: no-store              # não cacheia (dados sensíveis)
Cache-Control: max-age=3600          # cacheia por 1 hora
Cache-Control: public, max-age=86400 # cacheia em CDN por 1 dia
ETag: "abc123"                       # identifier da versão do recurso
If-None-Match: "abc123"              # request condicional → 304 se não mudou

# Headers de Rate Limiting (de facto padrão)
X-RateLimit-Limit: 1000              # total de requests permitidas
X-RateLimit-Remaining: 999           # quanto sobra na janela atual
X-RateLimit-Reset: 1713350400        # quando a janela reseta (Unix timestamp)
Retry-After: 60                      # segundos para aguardar (em 429)

# Headers de Segurança (response)
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Cookies: persistência do lado do cliente">
        <CodeBlock>{`# Server seta cookie via header Set-Cookie:
HTTP/1.1 200 OK
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600

# Atributos importantes:
# Path=/          → cookie enviado em qualquer path do domínio
# HttpOnly        → JavaScript não pode acessar (proteção contra XSS)
# Secure          → só enviado em HTTPS
# SameSite=Strict → não enviado em requests cross-site (proteção CSRF)
# SameSite=Lax    → enviado em navegação top-level (clique em link)
# SameSite=None   → enviado em qualquer contexto (necessita Secure)
# Max-Age=3600    → expira em 1 hora (0 = deleta o cookie)
# Domain=.exemplo.com → válido em todos os subdomínios

# Browser envia automaticamente cookies do domínio em todas as requests:
GET /api/perfil HTTP/1.1
Host: api.exemplo.com
Cookie: session_id=abc123; preferencia=dark-mode`}</CodeBlock>
        <Callout tone="warn">
          Cookies sem <code>HttpOnly</code> são acessíveis via JavaScript — vulneráveis a XSS. Sem <code>SameSite=Strict/Lax</code> são vulneráveis a CSRF. Sem <code>Secure</code> trafegam em HTTP. Sempre use os três para cookies de sessão.
        </Callout>
      </Section>

      <Section accent={accent} title="CORS: por que o browser bloqueia, mas curl não">
        <CodeBlock>{`# CORS: Cross-Origin Resource Sharing
# Origin = protocolo + host + porta: https://app.com vs https://api.com = origens diferentes

# 1. PREFLIGHT (request OPTIONS automática do browser antes de POST/PUT/custom headers):
OPTIONS /api/users HTTP/1.1
Origin: https://app.meusite.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization, Content-Type

# 2. Server responde ao preflight:
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.meusite.com  # ou: * para qualquer origem
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400        # cacheia o preflight por 1 dia

# 3. Browser envia a request real
# Se Access-Control-Allow-Origin não incluir a origem → browser bloqueia

# Configuração em Express.js:
app.use(cors({
  origin: ['https://app.meusite.com', 'https://admin.meusite.com'],
  credentials: true,   // necessário para enviar cookies cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

# CORS com credentials (cookies/auth headers cross-origin):
# Server: Access-Control-Allow-Credentials: true + Access-Control-Allow-Origin NÃO pode ser *
# Client: fetch(url, { credentials: 'include' })`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Ferramentas para explorar HTTP:</strong> <code>curl -v</code> (veja headers completos), <code>httpie</code> (syntax mais amigável), <code>Postman/Insomnia</code> (GUI), DevTools → Network (browser) → clique na request → Headers.
      </Callout>

      <Callout>
        Próximo: <strong>DNS, TLS e certificados</strong> — o que acontece nos milissegundos antes do seu request HTTP chegar ao servidor.
      </Callout>
    </div>
  );
}
