// Smoke test — sanity check antes dos cenários pesados.
// 1 VU por 30s batendo em /healthz e /readyz. Se isso falhar, não adianta rodar o resto.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from './lib/common.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    // Zero tolerância a erro em health check.
    http_req_failed: ['rate==0'],
    // Health é in-memory: deve ser quase instantâneo.
    http_req_duration: ['p(95)<50', 'p(99)<100'],
  },
};

export default function () {
  const liveness = http.get(`${BASE_URL}/healthz`);
  check(liveness, {
    'healthz 200': (r) => r.status === 200,
  });

  const readiness = http.get(`${BASE_URL}/readyz`);
  check(readiness, {
    'readyz 200': (r) => r.status === 200,
    // readiness pinga DB/Redis — se retornar 503 o ambiente está quebrado.
    'readyz not degraded': (r) => r.status !== 503,
  });

  sleep(1);
}
