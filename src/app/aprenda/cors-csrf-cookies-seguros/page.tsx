import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#1f6feb';

export const metadata: Metadata = {
  title: 'CORS, CSRF, cookies seguros: segurança web fundamental — FFV Academy',
  description: 'Same-origin policy, CORS preflight, CSRF tokens vs SameSite cookies, atributos HttpOnly e Secure. Como atacantes exploram e como defender.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que CORS existe? O que a Same-Origin Policy protege?',
    options: [
      'CORS é uma configuração de firewall para bloquear IPs suspeitos',
      'Same-Origin Policy (SOP): browsers bloqueiam JavaScript de ler respostas de requests feitos para origens diferentes (protocolo+host+porta). Sem SOP: site malicioso evil.com poderia executar JS que faz request para bank.com (com suas credenciais já logadas via cookie) e ler sua conta. CORS é o mecanismo para RELAXAR o SOP de forma controlada — o servidor autoriza explicitamente origens específicas a ler suas respostas.',
      'CORS bloqueia XSS — ataques de script cross-site',
      'CORS protege o servidor de sobrecarga por limitar requests de outras origens',
    ],
    correct: 1,
    explanation: 'SOP bloqueia LEITURA da resposta, não o envio da request. evil.com pode enviar um POST para bank.com (cross-origin) — SOP não impede. O que impede é CSRF protection. CORS adiciona Access-Control-Allow-Origin no servidor: "autorizo app.example.com a ler minhas respostas". Para cookies automáticos cross-origin: Access-Control-Allow-Credentials: true + Access-Control-Allow-Origin não pode ser *.',
  },
  {
    question: 'O que é um CSRF attack e como SameSite=Strict nos cookies previne?',
    options: [
      'CSRF é o mesmo que XSS — ambos injetam scripts maliciosos',
      'CSRF (Cross-Site Request Forgery): site malicioso force o browser autenticado da vítima a fazer request para outro site. Exemplo: evil.com tem <img src="bank.com/transfer?to=hacker&amount=1000"> — o browser envia automaticamente o cookie de sessão do bank.com junto. SameSite=Strict: cookie NUNCA é enviado em requests cross-site, mesmo GET. SameSite=Lax: enviado apenas em navegação top-level GET. Sem SameSite (default antigo): enviado sempre.',
      'CSRF attacks roubam cookies via JavaScript para reutilizá-los',
      'CSRF só funciona em sites sem HTTPS',
    ],
    correct: 1,
    explanation: 'CSRF token (alternativa ao SameSite): servidor gera token aleatório na sessão, embute no form como campo hidden, valida no POST. Atacante não tem acesso ao token (SOP impede leitura). Double Submit Cookie: token no cookie + token no form/header — servidor compara os dois. SameSite=Lax (padrão moderno desde Chrome 80, 2020) mitiga a maioria dos ataques CSRF sem tokens. SameSite=Strict pode quebrar flows de OAuth (redirect cross-site).',
  },
  {
    question: 'Qual a diferença entre HttpOnly e Secure nos atributos de cookie?',
    options: [
      'HttpOnly bloqueia HTTPS; Secure bloqueia HTTP',
      'HttpOnly: JavaScript NÃO pode acessar o cookie (document.cookie não o retorna). Previne que XSS roube o cookie de sessão. O cookie ainda é enviado automaticamente em requests HTTP/HTTPS. Secure: cookie SÓ é enviado em conexões HTTPS. Previne que o cookie seja interceptado em conexão HTTP (man-in-the-middle em redes inseguras). Produção obrigatório: sempre ambos para cookies de sessão.',
      'São equivalentes — usam nomes diferentes por questões históricas',
      'Secure criptografa o valor do cookie; HttpOnly garante unicidade',
    ],
    correct: 1,
    explanation: 'Atributos completos de um cookie seguro: Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400; Domain=.example.com. HttpOnly → defende de XSS. Secure → defende de rede insegura. SameSite=Lax → defende de CSRF. Path=/ → disponível em todo o site. Domain=.example.com → válido para subdomínios. Evite Domain=example.com sem ponto (só para o host exato) e __Host- prefix (requer Secure + Path=/ + sem Domain).',
  },
];

export default function CorsCsrfCookiesSeguropPage() {
  return (
    <ModuleLayout
      slug="cors-csrf-cookies-seguros"
      title="CORS, CSRF, cookies seguros: segurança web fundamental"
      icon="🔒"
      xp={70}
      readTime={14}
      trailName="Redes & Web"
      trailColor="#1f6feb"
      nextSlug="modelo-osi-tcp-ip"
      nextTitle="OSI e TCP/IP: as camadas que explicam tudo"
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
        CORS, CSRF e configuração de cookies são as defesas de segurança que mais desenvolvedores configuram errado — seja abrindo demais (CORS: *) ou esquecendo atributos críticos em cookies de sessão. Entender o modelo de ameaça por trás de cada um evita configurações de boa vontade mas inseguras.
      </p>

      <Section accent={accent} title="Same-Origin Policy e CORS">
        <CodeBlock>{`# Origin = protocolo + host + porta
# https://app.example.com:443 ← origem completa
# http://app.example.com:80   ← origem DIFERENTE (http vs https)
# https://api.example.com:443 ← origem DIFERENTE (host diferente)
# https://app.example.com:8443 ← origem DIFERENTE (porta diferente)

# Preflight (OPTIONS) é enviado para requests "não simples":
# Não-simples: método != GET/POST/HEAD, ou headers customizados, ou Content-Type != form/text

# Exemplo de preflight:
# OPTIONS /api/users HTTP/1.1
# Origin: https://app.example.com
# Access-Control-Request-Method: POST
# Access-Control-Request-Headers: Content-Type, Authorization

# Resposta do servidor:
# HTTP/1.1 200 OK
# Access-Control-Allow-Origin: https://app.example.com
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE
# Access-Control-Allow-Headers: Content-Type, Authorization
# Access-Control-Max-Age: 86400   ← cacheia o preflight por 24h

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS middleware — configuração CORRETA para produção:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.example.com",
        "https://admin.example.com",
    ],  # NUNCA "*" se usar credentials
    allow_credentials=True,         # permite cookies cross-origin
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
    max_age=86400,                  # cache do preflight
)

# Armadilha: allow_origins=["*"] + allow_credentials=True = INVÁLIDO
# Browser recusa se origin for * e credentials estiver true
# Deve ser origem específica quando credentials=True

# CORS NÃO protege de CSRF!
# CORS bloqueia LEITURA da resposta, não o ENVIO da request
# Um form HTML pode fazer POST cross-origin sem CORS (é "simples")
# → CSRF protection é separada de CORS`}</CodeBlock>
      </Section>

      <Section accent={accent} title="CSRF: ataques e defesas">
        <CodeBlock>{`# Cenário de ataque CSRF:
# 1. Vítima logada em bank.com (cookie de sessão ativo)
# 2. Vítima visita evil.com
# 3. evil.com tem: <form action="https://bank.com/transfer" method="POST">
#                    <input name="to" value="hacker_account">
#                    <input name="amount" value="10000">
#                  </form>
#                  <script>document.forms[0].submit();</script>
# 4. Browser envia o POST para bank.com COM O COOKIE DA VÍTIMA
# 5. bank.com processa a transferência como se fosse a vítima

# Defesa 1: SameSite Cookie (recomendado, mais simples)
# SameSite=Strict: cookie nunca enviado cross-site (nem em links externos)
# SameSite=Lax:   cookie enviado em navegação top-level GET (links externos)
#                 MAS não em POST/PUT/DELETE cross-site → mitiga CSRF
# SameSite=None:  enviado sempre (deve ter Secure obrigatoriamente)

from fastapi.responses import Response
import secrets

def set_session_cookie(response: Response, session_id: str):
    """Cookie de sessão com todos os atributos de segurança."""
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,              # JS não acessa
        secure=True,                # apenas HTTPS
        samesite="lax",             # mitiga CSRF, permite OAuth flows
        max_age=86400,              # 24h
        path="/",                   # todo o site
        # domain=".example.com",    # subdomínios (use com cuidado)
    )

# Defesa 2: CSRF Token (necessário quando SameSite não é suficiente)
from fastapi import Cookie, Form, HTTPException

def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)

@app.post("/transfer")
async def transfer(
    to: str = Form(...),
    amount: float = Form(...),
    csrf_token: str = Form(...),        # token no body do form
    session_csrf: str = Cookie(None),  # mesmo token no cookie
):
    # Valida que o token do form = token do cookie:
    if not secrets.compare_digest(csrf_token, session_csrf):
        raise HTTPException(status_code=403, detail="CSRF token inválido")
    # Processa transferência...

# Defesa 3: Custom header (para SPAs com JSON API)
# Browser impede JS de adicionar headers customizados em requests cross-origin
# sem aprovação CORS — então se a API exige X-Requested-With, CSRF é impossível
@app.post("/api/transfer")
async def api_transfer(request: Request, ...):
    if not request.headers.get("X-Requested-With"):
        raise HTTPException(403, "Missing X-Requested-With header")
    # Não precisa de CSRF token — custom header é proteção suficiente para JSON APIs`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Cookies seguros: todos os atributos">
        <ComparisonTable
          headers={['Atributo', 'Função', 'Recomendação']}
          rows={[
            ['HttpOnly', 'Bloqueia acesso via JS', 'Sempre para cookies de sessão'],
            ['Secure', 'Só envia em HTTPS', 'Sempre em produção'],
            ['SameSite=Lax', 'Mitiga CSRF', 'Padrão recomendado'],
            ['SameSite=Strict', 'Previne CSRF total', 'Se não precisa de OAuth/link externo'],
            ['SameSite=None', 'Cross-site explícito', 'Apenas com Secure, para iframes/OAuth'],
            ['Max-Age / Expires', 'Define expiração', 'Sem = session cookie (fecha browser)'],
            ['Path=/', 'Escopo de caminho', '/ para toda a aplicação'],
            ['Domain=.example.com', 'Inclui subdomínios', 'Use com cuidado — inclui todos os subdomínios'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Prefixes especiais de cookies:
# __Secure- prefix: browser exige Secure + HTTPS (protege de override por subdomínio)
# __Host- prefix:   browser exige Secure + Path=/ + sem Domain (mais restrito)

# Set-Cookie: __Host-session=abc; Secure; Path=/; HttpOnly; SameSite=Lax

# Cookie Theft via XSS — por que HttpOnly importa:
# Sem HttpOnly: <script>document.cookie</script> retorna "session=abc123"
# Com HttpOnly: <script>document.cookie</script> retorna "" (cookie ausente)
# Mas: XSS ainda pode fazer fetch() autenticado — HttpOnly não é suficiente sozinho
# → Content Security Policy (CSP) reduz a superfície de XSS

# Content-Security-Policy (headers de segurança complementares):
security_headers = {
    # Restringe de onde scripts podem ser carregados:
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",

    # Impede o browser de "adivinhar" o Content-Type:
    "X-Content-Type-Options": "nosniff",

    # Controla como a página pode ser embarcada em iframe:
    "X-Frame-Options": "DENY",  # ou "SAMEORIGIN"

    # Força HTTPS por 1 ano:
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    # Controla referrer em links externos:
    "Referrer-Policy": "strict-origin-when-cross-origin",

    # Permissões de browser APIs:
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

# FastAPI: adicionar todos os security headers:
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        for header, value in security_headers.items():
            response.headers[header] = value
        return response

app.add_middleware(SecurityHeadersMiddleware)`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> Same-Origin Policy protege de leitura cross-origin. CORS relaxa o SOP de forma controlada — nunca use *, apenas origens explícitas, especialmente com credentials. CSRF explora que browsers enviam cookies automaticamente em requests cross-site — mitigado com SameSite=Lax (default moderno) ou CSRF tokens. HttpOnly bloqueia roubo de cookie por XSS. Secure garante transmissão apenas em HTTPS. Use sempre os quatro juntos para cookies de sessão: HttpOnly + Secure + SameSite=Lax + Max-Age.
      </Callout>

      <Callout>
        Trilha concluída! Próxima trilha: <strong>OSI e TCP/IP</strong> — volte ao início para revisar as camadas de rede.
      </Callout>
    </div>
  );
}
