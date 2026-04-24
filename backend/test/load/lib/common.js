// Constantes e helpers compartilhados entre scripts k6.

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// Gera email sintético. Usar prefixo "loadtest+" facilita limpeza depois.
export function randomEmail() {
  const n = Math.floor(Math.random() * 1e9);
  return `loadtest+${n}@ffv.test`;
}

// Email intencionalmente inválido — deve ser rejeitado com 400 antes de
// qualquer IO (SMTP/Resend). Usado para medir latência de validação pura.
export function invalidEmail() {
  return `bad-email-no-at-${Math.random()}`;
}

// Hash de certificado com formato válido (64 hex) mas que não existe no DB.
// Deve retornar 404 consistentemente.
export function fakeCertHash() {
  const chars = '0123456789abcdef';
  let h = '';
  for (let i = 0; i < 64; i++) h += chars[Math.floor(Math.random() * 16)];
  return h;
}
