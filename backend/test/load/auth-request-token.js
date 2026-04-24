// Testa defesa contra abuso em /auth/request-token.
// Dois cenários em paralelo:
//   (a) emails válidos aleatórios — throughput geral, deve aguentar carga
//       mas rate limit por email bate em 429 se o mesmo email for repetido.
//   (b) emails inválidos — devem retornar 400 em < 50ms p95 (validação pura,
//       sem IO de email).

import http from 'k6/http';
import { check, group } from 'k6';
import { Rate } from 'k6/metrics';
import { BASE_URL, randomEmail, invalidEmail } from './lib/common.js';

const rateLimited = new Rate('rate_limited_429');
const validationFast = new Rate('validation_fast_400');

export const options = {
  scenarios: {
    flood_valid: {
      executor: 'constant-vus',
      vus: 80,
      duration: '1m',
      exec: 'floodValid',
    },
    flood_invalid: {
      executor: 'constant-vus',
      vus: 20,
      duration: '1m',
      exec: 'floodInvalid',
    },
  },
  thresholds: {
    // Aceita qualquer status — o teste valida comportamento específico via checks.
    'http_req_duration{scenario:flood_invalid}': ['p(95)<50'],
    // Queremos VER 429s (prova que rate limit funciona); se não aparecer, falha.
    rate_limited_429: ['rate>0.01'],
    // Emails inválidos devem ser todos 400.
    validation_fast_400: ['rate>0.95'],
  },
};

export function floodValid() {
  // Reusa o mesmo email por VU para forçar rate limit acionar.
  const email = __VU % 5 === 0 ? `hot-${__VU}@ffv.test` : randomEmail();
  const res = http.post(
    `${BASE_URL}/api/v1/auth/request-token`,
    JSON.stringify({ email }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  rateLimited.add(res.status === 429);
  check(res, {
    'accepted or rate-limited': (r) => r.status === 202 || r.status === 200 || r.status === 429,
  });
}

export function floodInvalid() {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/request-token`,
    JSON.stringify({ email: invalidEmail() }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  validationFast.add(res.status === 400);
  check(res, {
    'rejeitado com 400': (r) => r.status === 400,
  });
}
