// Progress sync — PUT /api/v1/progress com payload pequeno (< 10KB).
// 30 VUs por 1min. SLO: p95 < 300ms (escrita em JSONB com LWW).
//
// REQUER TEST_JWT. Veja README.md.

import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from './lib/common.js';
import { requireJWT, getAuthHeaders } from './lib/auth.js';

export const options = {
  vus: 30,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.02'],
    // JSONB write deve ser rápido. Se p95 > 300ms, investigar lock contention
    // ou falta de índice em user_id.
    http_req_duration: ['p(95)<300', 'p(99)<800'],
  },
};

export function setup() {
  requireJWT();
  return {};
}

// Payload de progresso típico — alguns módulos completos, alguns em andamento.
function buildPayload() {
  return JSON.stringify({
    clientUpdatedAt: new Date().toISOString(),
    data: {
      modulesCompleted: ['m-01', 'm-02', 'm-03'],
      trailsProgress: {
        'trail-ia': 0.42,
        'trail-backend': 0.17,
      },
      lastSeenAt: new Date().toISOString(),
      xp: Math.floor(Math.random() * 5000),
    },
  });
}

export default function () {
  const res = http.put(`${BASE_URL}/api/v1/progress`, buildPayload(), {
    headers: getAuthHeaders(),
  });

  check(res, {
    // 200 (ok), 204 (ok sem body), 409 (LWW conflict, ainda é comportamento válido)
    'status aceitável': (r) => [200, 204, 409].includes(r.status),
    'sem 5xx': (r) => r.status < 500,
  });
}
