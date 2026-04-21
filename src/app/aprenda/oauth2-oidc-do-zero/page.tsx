import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('oauth2-oidc-do-zero');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o único fluxo OAuth2 recomendado pra app web/mobile em 2026?',
    options: [
      'Implicit flow',
      'Authorization Code + PKCE (Proof Key for Code Exchange) — elimina necessidade de client secret em clients públicos',
      'Resource Owner Password Credentials (ROPC)',
      'Client Credentials',
    ],
    correct: 1,
    explanation: 'RFC 7636 (PKCE). O code_verifier (random 43-128 chars) é gerado no cliente; code_challenge = SHA256(code_verifier). Server só aceita exchange se verifier bater. Mata ataque de interceptação de authorization code. Implicit foi deprecated em OAuth2.1. ROPC passa senha raw — crime em 2026.',
  },
  {
    question: 'Qual fluxo OAuth2 é apropriado pra backend-to-backend (sem usuário)?',
    options: [
      'Authorization Code',
      'Client Credentials — client envia client_id + client_secret diretamente, recebe access token. Sem user envolvido',
      'Device Code',
      'Implicit',
    ],
    correct: 1,
    explanation: 'Client Credentials é pra M2M: seu backend chamando API externa em nome DELE mesmo, não de um user. Ex: sua API consumindo Stripe/Sendgrid. Secret fica em env var/secrets manager.',
  },
  {
    question: 'Qual a diferença essencial entre OAuth2 e OIDC?',
    options: [
      'São a mesma coisa',
      'OAuth2 é protocolo de AUTORIZAÇÃO (authorize access to resource). OIDC é camada de AUTENTICAÇÃO em cima do OAuth2 — adiciona id_token (JWT com claims sobre o user) e o endpoint /userinfo',
      'OIDC é só pra SAML',
      'OAuth2 é mais novo',
    ],
    correct: 1,
    explanation: 'OAuth2 responde "pode acessar meus dados?". OIDC (OpenID Connect) estende pra responder "quem é esse user?" via id_token (JWT assinado com iss, sub, aud, exp, iat + claims). Se precisa logar user, use OIDC (que inclui OAuth2).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="oauth2-oidc-do-zero"
      title="OAuth2 e OIDC do zero: fluxos e PKCE"
      icon="🔐"
      xp={65}
      readTime={15}
      trailName="Security Engineering"
      trailColor={accent}
      nextSlug="jwt-paseto-sessions"
      nextTitle="JWT, Paseto ou sessions: quando cada um"
      quiz={quiz}
    >
      <Section title="Os 4 fluxos que importam em 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Fluxo', 'Quando usar', 'Status']}
          rows={[
            ['Authorization Code + PKCE', 'Web app, SPA, mobile (qualquer user-facing)', '✅ Obrigatório'],
            ['Client Credentials', 'Backend-to-backend (M2M)', '✅ OK'],
            ['Device Code', 'CLI, Smart TV, dispositivos sem browser', '✅ OK'],
            ['Refresh Token (com rotation)', 'Renovar access token sem novo login', '✅ Com cuidado'],
            ['Implicit', 'Legacy SPA pré-PKCE', '❌ Deprecated'],
            ['ROPC (Password)', 'Só pra migrar de sistemas legados', '❌ Crime em 2026'],
          ]}
        />
      </Section>

      <Section title="Authorization Code + PKCE em 8 passos" accent={accent}>
        <CodeBlock lang="text">{`1. Client gera code_verifier (random 43-128 chars)
   code_verifier = "ubvfKJsWq...random..."

2. Client calcula code_challenge = BASE64URL(SHA256(code_verifier))

3. Client redireciona pro Authorization Server (/authorize):
   ?response_type=code
   &client_id=abc
   &redirect_uri=https://app.com/callback
   &code_challenge=<hash>
   &code_challenge_method=S256
   &state=<csrf-token>
   &scope=openid profile email

4. User loga, consente. Server redireciona de volta:
   https://app.com/callback?code=<authz_code>&state=<csrf>

5. Client verifica state (CSRF), extrai code.

6. Client troca code por token em /token (POST):
   grant_type=authorization_code
   code=<authz_code>
   code_verifier=<original_verifier>
   client_id=abc
   redirect_uri=...

7. Server valida: SHA256(code_verifier) === code_challenge?
   Se sim, retorna access_token + refresh_token + id_token.

8. Client guarda tokens (ideal: memory + refresh em httpOnly cookie).`}</CodeBlock>
      </Section>

      <Section title="OIDC: o id_token" accent={accent}>
        <CodeBlock lang="json">{`// id_token decoded (JWT)
{
  "iss": "https://accounts.google.com",
  "sub": "110169484474386276334",  // user ID único no issuer
  "aud": "abc.apps.googleusercontent.com",  // seu client_id
  "exp": 1735689600,
  "iat": 1735686000,
  "email": "user@example.com",
  "email_verified": true,
  "name": "Ana Silva",
  "picture": "https://..."
}`}</CodeBlock>
        <p>
          <strong>Validar id_token</strong>: verificar assinatura com JWKS (endpoint público do issuer), <InlineCode>iss</InlineCode> bate, <InlineCode>aud</InlineCode> é seu client_id, <InlineCode>exp</InlineCode> no futuro, <InlineCode>nonce</InlineCode> bate se você enviou. Lib: <InlineCode>jose</InlineCode> (TS/JS).
        </p>
      </Section>

      <Section title="Device Code — CLI login" accent={accent}>
        <CodeBlock lang="text">{`# Ex: "gh auth login" faz isso
CLI POST /device/authorize
Response: { device_code, user_code: "WGKP-QVNX", verification_uri }

CLI mostra: "Open https://github.com/login/device and enter WGKP-QVNX"
CLI faz polling em /token com device_code.

Quando user aprova no browser, /token retorna access_token.`}</CodeBlock>
      </Section>

      <Section title="Implementação prática TS" accent={accent}>
        <CodeBlock lang="typescript">{`import * as openid from 'openid-client';

// 1. Discovery
const issuer = await openid.Issuer.discover('https://accounts.google.com');
const client = new issuer.Client({
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  redirect_uris: ['https://app.com/callback'],
  response_types: ['code'],
});

// 2. Build authorize URL com PKCE
const codeVerifier = openid.generators.codeVerifier();
const codeChallenge = openid.generators.codeChallenge(codeVerifier);
const state = openid.generators.state();

const url = client.authorizationUrl({
  scope: 'openid profile email',
  code_challenge: codeChallenge,
  code_challenge_method: 'S256',
  state,
});

// 3. No callback: trocar code por tokens
const params = client.callbackParams(req);
const tokenSet = await client.callback(
  'https://app.com/callback',
  params,
  { code_verifier: codeVerifier, state }
);

// tokenSet.id_token (JWT), tokenSet.access_token
const claims = tokenSet.claims();`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Nunca armazene <InlineCode>access_token</InlineCode> em localStorage (XSS lê). Use httpOnly cookie pra refresh token, memória pra access token.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
