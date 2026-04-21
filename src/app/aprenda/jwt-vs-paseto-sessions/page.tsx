import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('jwt-vs-paseto-sessions');

const accent = '#dc2626';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a armadilha mais clássica de JWT que ainda aparece em CVEs em 2026?',
    options: [
      'Tokens muito longos',
      'alg confusion: server aceita o header alg do token sem validar whitelist. Atacante envia alg=none (sem assinatura) ou troca RS256 por HS256 usando a chave pública como segredo HMAC. Mitigação: nunca deixar a lib inferir alg, sempre passar explicitamente o esperado',
      'Base64 vaza senhas',
      'JWT não funciona em HTTPS',
    ],
    correct: 1,
    explanation: 'A vulnerabilidade clássica (CVE-2015-9235 e herdeiras) vem da RFC 7519 permitir que o header declare o algoritmo. Libs antigas faziam jwt.verify(token, key) e usavam o alg do token. Se atacante envia alg=none, a lib pula verificação. Se server esperava RS256 e atacante manda HS256 usando a pub key em PEM como segredo HMAC, assina válido. Todo verify em 2026 deve receber allowed_algorithms explicitamente ([RS256] ou [EdDSA]). Ainda melhor: use PASETO, que elimina a armadilha estruturalmente.',
  },
  {
    question: 'Por que PASETO v4 é considerado superior a JWT em design?',
    options: [
      'É mais rápido',
      'Versionamento rígido: v4.public usa Ed25519, v4.local usa XChaCha20-Blake2b, sem negociação. Sem alg=none, sem confusão RSA/HMAC, sem cipher suites opcionais. Payload é JSON mas os primitivos de cripto são fixos por versão. Menos pé-no-próprio-pé',
      'PASETO não tem assinatura',
      'PASETO é open source e JWT não',
    ],
    correct: 1,
    explanation: 'PASETO (Platform-Agnostic Security Tokens) foi desenhado por Scott Arciszewski como resposta às armadilhas do JOSE (JWT/JWS/JWE). Cada versão (v1, v2, v3, v4) fixa cipher suite única: v4.public é Ed25519 (signed, leitura pública), v4.local é XChaCha20-Blake2b-MAC (symmetric encrypted). Não há negociação de alg. Impossível fazer alg confusion. Payload é o mesmo JSON claims estilo JWT, então migração é plug-and-play em muitos casos.',
  },
  {
    question: 'Quando escolher sessions server-side (Redis) em vez de JWT/PASETO?',
    options: [
      'Nunca',
      'Quando precisa revogar rápido (logout, banir usuário, mudar permissão). Sessions são lookup stateful: deletou do Redis, acesso morre no próximo request. JWT stateless só expira no TTL ou exige denylist externa, que anula a vantagem stateless',
      'Sempre que houver Redis',
      'Só em apps mobile',
    ],
    correct: 1,
    explanation: 'JWT brilha em micro-services onde você quer validação sem round-trip ao auth service, e TTL curto (5-15 min) com refresh token é aceitável. Sessions server-side brilham quando revogação imediata é requisito (financeiro, admin, compliance). Padrão híbrido comum em 2026: access token JWT curto (5 min) + refresh token em Redis (com revogação) + logout invalida refresh. BFF (Backend-For-Frontend) com cookie httponly+secure+samesite=lax + session Redis é o default recomendado por OWASP ASVS para apps web tradicionais.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="jwt-vs-paseto-sessions"
      title="JWT vs PASETO vs sessions"
      icon="🎫"
      xp={50}
      readTime={12}
      trailName="Cryptography Applied"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Três caminhos, decisão de arquitetura" accent={accent}>
        <p>
          Autenticação de sessão tem três famílias: token stateless assinado (JWT), token stateless com cripto moderna fixa (PASETO) e session id opaco + storage stateful (Redis/DB). Escolher errado custa performance ou, pior, segurança.
        </p>
        <Callout tone="danger" icon="🚨">
          Never roll your own auth. Use lib madura (jose, pyjwt com allowed_algorithms, paseto-rs, auth.js, lucia-auth, Ory Kratos). A lista de CVEs em auth caseiro é lendária.
        </Callout>
      </Section>

      <Section title="JWT: potente, perigoso, ubíquo" accent={accent}>
        <CodeBlock lang="ts">{`// jose (padrao em 2026 para Node/Deno/Bun)
import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose';

const priv = await importPKCS8(process.env.JWT_PRIV_PEM!, 'EdDSA');
const pub  = await importSPKI(process.env.JWT_PUB_PEM!, 'EdDSA');

const token = await new SignJWT({ sub: 'user_123', role: 'admin' })
  .setProtectedHeader({ alg: 'EdDSA', kid: 'ffv-2026-04' })
  .setIssuer('https://fernandofrancovalle.com')
  .setAudience('ffv-api')
  .setIssuedAt()
  .setExpirationTime('5m')           // TTL CURTO sempre
  .sign(priv);

// Verify COM allowed algorithms explicito
const { payload } = await jwtVerify(token, pub, {
  issuer: 'https://fernandofrancovalle.com',
  audience: 'ffv-api',
  algorithms: ['EdDSA'],             // whitelist fecha alg confusion
});`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Checklist obrigatório de JWT: (1) alg allowlist explícito, (2) iss/aud validados, (3) TTL máximo 15 min, (4) assinatura com Ed25519 ou RS256/ES256 (nunca HS256 com segredo curto), (5) chave em KMS/Vault, (6) kid com rotação via JWKS, (7) nunca guardar em localStorage (use cookie httponly), (8) refresh token em storage revogável.
        </Callout>
      </Section>

      <Section title="PASETO: JOSE feito direito" accent={accent}>
        <CodeBlock lang="python">{`# paseto v4 em Python - sem armadilhas de alg
from pyseto import Key, Paseto

# v4.public = Ed25519 fixo
priv = Key.new(version=4, purpose="public", key=ed25519_private_pem)
pub  = Key.new(version=4, purpose="public", key=ed25519_public_pem)

paseto = Paseto.new(exp=300, including_iat=True)

token = paseto.encode(
    priv,
    payload={"sub": "user_123", "role": "admin"},
    footer={"kid": "ffv-2026-04"},
    implicit_assertion=b"aud=ffv-api",   # AAD, amarra ao contexto
)

# Nao ha allowed_algorithms porque a versao JA fixa o algoritmo
decoded = paseto.decode(pub, token, implicit_assertion=b"aud=ffv-api")`}</CodeBlock>
        <CodeBlock lang="yaml">{`# Comparacao rapida
JWT (JOSE):
  algorithms_negociaveis:   sim (HS256, RS256, ES256, EdDSA, none...)
  armadilha_alg_confusion:  sim (se lib mal usada)
  ecosistema:               gigantesco (auth0, keycloak, supabase, clerk)
  interop:                  padrao de facto na industria

PASETO v4:
  algorithms_negociaveis:   NAO (v4.local=XChaCha20, v4.public=Ed25519)
  armadilha_alg_confusion:  impossivel por design
  ecosistema:               menor mas crescente (paseto-rs, paseto-go, pyseto)
  interop:                  limitado fora de apps que voce controla

Sessions (Redis):
  revogacao_instantanea:    sim
  escala:                   depende de Redis; add 1-2ms por request
  uso_ideal:                app web monolitico, BFF, flows sensitivos`}</CodeBlock>
      </Section>

      <Section title="Sessions server-side: low-tech, alto valor" accent={accent}>
        <CodeBlock lang="ts">{`// express-session + Redis, padrao OWASP-friendly
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

app.use(session({
  store: new RedisStore({ client: redis, prefix: 'ffv:sess:' }),
  secret: process.env.SESSION_SECRET!,       // >= 32 bytes random
  resave: false,
  saveUninitialized: false,
  rolling: true,                              // renova TTL em cada req
  cookie: {
    httpOnly: true,                           // JS nao acessa
    secure: true,                             // HTTPS only
    sameSite: 'lax',                          // CSRF mitigado
    maxAge: 60 * 60 * 1000,                   // 1h idle timeout
  },
}));

// Logout efetivo
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.clearCookie('connect.sid').sendStatus(204));
});`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Padrão pragmático 2026: SPA/mobile usa access token (JWT/PASETO) curto + refresh token rotacionado via cookie httponly. App web tradicional (Rails, Django, Laravel) usa session Redis. Não brigue com a stack: Django session middleware é mais seguro que JWT caseiro.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
