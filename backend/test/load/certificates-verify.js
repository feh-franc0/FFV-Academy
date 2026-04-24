// Lookup público de certificado. 200 VUs batendo em hashes inválidos por 2min.
// Objetivo: garantir que 404 é rápido e não degrada sob carga (sem ir no DB? ou
// com query otimizada via índice único em hash). Se p95 disparar, investigar
// se o lookup está sem índice ou se está faltando cache negativo.

import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, fakeCertHash } from './lib/common.js';

export const options = {
  vus: 200,
  duration: '2m',
  thresholds: {
    http_req_failed: ['rate<0.01'], // 404 não conta como http_req_failed (só 5xx)
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    'checks{check:returns 404}': ['rate>0.99'],
  },
};

export default function () {
  const hash = fakeCertHash();
  const res = http.get(`${BASE_URL}/api/v1/certificates/${hash}`);
  check(res, {
    'returns 404': (r) => r.status === 404,
    'nao 5xx': (r) => r.status < 500,
  });
}
