'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCertificate, type CertificateRecord } from '@/lib/certificates';
import { getSimulado } from '@/lib/simulados';

/**
 * Verificação client-side de certificado.
 *
 * URL: /verificar?h=<hash> — busca no localStorage do próprio visitante.
 *
 * LIMITAÇÃO MVP: como tudo vive no dispositivo, só verificamos certificados
 * emitidos por ESTE dispositivo. Quando tivermos backend, a verificação vira
 * um GET /api/certificates/<hash> que valida em todo o mundo.
 */
export function VerificarClient() {
  const [hash, setHash] = useState<string | null>(null);
  const [record, setRecord] = useState<CertificateRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const h = params.get('h');
    if (!h || !/^[a-f0-9]{16,128}$/.test(h)) {
      setReady(true);
      return;
    }
    setHash(h);
    setRecord(getCertificate(h));
    setReady(true);
  }, []);

  if (!ready) {
    return <p className="px-6 py-20 text-center">Verificando…</p>;
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Verificar certificado</span>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Verificação de certificado</h1>

      {!hash ? (
        <div className="p-6 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p className="text-sm mb-4">Informe o hash do certificado na URL:</p>
          <p className="text-xs font-mono p-3 rounded-lg" style={{ background: 'var(--ffv-bg)', color: 'var(--ffv-muted)' }}>
            /verificar?h=<b style={{ color: 'var(--ffv-blue)' }}>HASH</b>
          </p>
        </div>
      ) : record ? (
        <section
          className="p-6 rounded-xl"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(63,185,80,0.35)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--ffv-green)' }}>Certificado válido</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                Emitido pela FFV Academy
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt style={{ color: 'var(--ffv-muted)' }}>Titular</dt>
            <dd>{record.name}</dd>
            <dt style={{ color: 'var(--ffv-muted)' }}>Certificação</dt>
            <dd>{getSimulado(record.simuladoId)?.certification ?? record.simuladoId}</dd>
            <dt style={{ color: 'var(--ffv-muted)' }}>Pontuação</dt>
            <dd>{record.score}%</dd>
            <dt style={{ color: 'var(--ffv-muted)' }}>Emitido em</dt>
            <dd>{new Date(record.issuedAt).toLocaleDateString('pt-BR')}</dd>
          </dl>
        </section>
      ) : (
        <section
          className="p-6 rounded-xl"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid rgba(247,129,102,0.35)' }}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="text-sm font-bold" style={{ color: '#f78166' }}>Certificado não encontrado</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                Este hash não consta nos registros deste dispositivo.
              </p>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--ffv-muted)' }}>
            🧪 <b>Nota MVP:</b> certificados FFV Academy ficam registrados no dispositivo onde foram emitidos. Se o certificado foi emitido em outro navegador/computador, não aparecerá aqui. Quando tivermos backend, a verificação será global.
          </p>
        </section>
      )}
    </div>
  );
}
