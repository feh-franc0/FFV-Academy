// Rota pública e cacheável — deve aguentar tráfego alto com baixa latência.
// 50 VUs por 2min simulando visitantes anônimos navegando a home.

import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './lib/common.js';

export const options = {
  vus: 50,
  duration: '2m',
  thresholds: {
    http_req_failed: ['rate<0.01'], // < 1% erro
    // Rota pública: p95 < 200ms é o SLO. Se passar disso, investigar cache.
    http_req_duration: ['p(95)<200', 'p(99)<500'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/v1/simulados`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'body tem simulados': (r) => {
      try {
        const body = r.json();
        return Array.isArray(body) || Array.isArray(body.simulados) || Array.isArray(body.items);
      } catch (_) {
        return false;
      }
    },
  });
}
