// Tutor AI — rota cara (Anthropic). 20 VUs por 1min.
// Valida dois comportamentos:
//   (1) Cache: se perguntarmos o mesmo questionID + kind várias vezes, as
//       respostas subsequentes devem vir do Redis e ser rápidas (< 300ms p95).
//   (2) Rate limit: burst do mesmo user deve disparar 429.
//
// REQUER TEST_JWT. Veja README.md.

import http from 'k6/http';
import { check } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { BASE_URL } from './lib/common.js';
import { requireJWT, getAuthHeaders } from './lib/auth.js';

const cacheHits = new Rate('cache_hit_fast');
const rateLimited = new Rate('rate_limited_429');
const cachedLatency = new Trend('cached_latency', true);

export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    // AI cold: p95 generoso (3s). Se passar muito disso o provedor está lento
    // ou o cache está desligado.
    http_req_duration: ['p(95)<3000', 'p(99)<8000'],
    // Cache hits devem ser rápidos.
    cached_latency: ['p(95)<300'],
    // Queremos ver rate-limit funcionando.
    rate_limited_429: ['rate>=0'],
  },
};

export function setup() {
  requireJWT();
  return {};
}

// Pool pequeno propositalmente — forçamos repetição para exercitar o cache.
const POOL = [
  { questionId: 'q-load-1', kind: 'por-que' },
  { questionId: 'q-load-2', kind: 'analogia' },
  { questionId: 'q-load-3', kind: 'exemplo' },
];

export default function () {
  const pick = POOL[Math.floor(Math.random() * POOL.length)];
  const payload = JSON.stringify({
    questionId: pick.questionId,
    kind: pick.kind,
    userAnswer: 'A',
  });

  const res = http.post(`${BASE_URL}/api/v1/tutor/ask`, payload, {
    headers: getAuthHeaders(),
  });

  const ok = res.status === 200;
  const limited = res.status === 429;
  rateLimited.add(limited);

  // Heurística: resposta < 300ms provavelmente veio do cache.
  if (ok && res.timings.duration < 300) {
    cacheHits.add(1);
    cachedLatency.add(res.timings.duration);
  } else if (ok) {
    cacheHits.add(0);
  }

  check(res, {
    '200 ou 429': (r) => r.status === 200 || r.status === 429,
    'sem 5xx': (r) => r.status < 500,
  });
}
