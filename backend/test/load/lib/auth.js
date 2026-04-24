// Helper de autenticação para scripts k6.
//
// Estratégia atual: usuário exporta TEST_JWT antes de rodar o k6. Tokens reais
// exigem o fluxo magic-link (Resend + 6 dígitos), o que inviabiliza load test
// automatizado sem infra mock.
//
// TODOs (para o backend time destravar load tests autenticados de forma trivial):
//   1. Endpoint /api/v1/dev/token habilitado só com APP_ENV=test que retorna
//      JWT para um user fake (bypass magic link). Ideal ficar atrás de um
//      middleware que fecha em production.
//   2. CLI `go run ./cmd/api/tools/token --email foo@bar.com` que usa o mesmo
//      JWTService da infra para mintar um JWT sem passar pelo HTTP.
//
// Por ora: placeholder via env var.

export function getAuthHeaders() {
  const jwt = __ENV.TEST_JWT || '';
  return {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };
}

export function requireJWT() {
  if (!__ENV.TEST_JWT) {
    throw new Error(
      'TEST_JWT não definido. Export antes de rodar: export TEST_JWT="eyJ...". ' +
      'Veja test/load/README.md seção "Autenticação em testes".'
    );
  }
  return __ENV.TEST_JWT;
}
