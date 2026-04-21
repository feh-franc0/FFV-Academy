'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateMarketingConsent } from '@/lib/auth';
import { getSimulado } from '@/lib/simulados';
import { clearAll } from '@/lib/storage';

export function PreferenciasClient() {
  const { user, refresh, logout, requireLogin } = useAuth();
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!user) {
      requireLogin('gerenciar suas preferências').catch(() => {});
    } else {
      setConsent(user.marketingConsent);
    }
  }, [user, requireLogin]);

  if (!user) {
    return <p className="px-6 py-20 text-center">Carregando…</p>;
  }

  function toggleConsent() {
    const next = !consent;
    setConsent(next);
    updateMarketingConsent(next);
    refresh();
  }

  function handleExport() {
    // Exporta APENAS os dados do próprio usuário + seus produtos pagos.
    // Progresso gamificado já tem seu próprio export em /progresso.
    const payload = {
      user,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ffv-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function handleDelete() {
    if (!confirm('Excluir a conta apagará TODOS os seus dados deste dispositivo: progresso, badges, simulados, certificados. Essa ação é irreversível. Confirmar?')) return;
    clearAll();
    logout();
    window.location.href = '/';
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Preferências</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Preferências</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Seus dados, consentimentos e produtos pagos.
        </p>
      </header>

      <section className="mb-8 p-5 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-4">👤 Seus dados</h2>
        <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
          <dt style={{ color: 'var(--ffv-muted)' }}>Nome</dt>
          <dd>{user.name}</dd>
          <dt style={{ color: 'var(--ffv-muted)' }}>Email</dt>
          <dd>{user.email}</dd>
          <dt style={{ color: 'var(--ffv-muted)' }}>Telefone</dt>
          <dd>{user.phone}</dd>
          <dt style={{ color: 'var(--ffv-muted)' }}>Desde</dt>
          <dd>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</dd>
        </dl>
      </section>

      <section className="mb-8 p-5 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-4">📬 Comunicações</h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={toggleConsent}
            className="mt-1"
          />
          <div className="text-sm">
            <p className="font-semibold">Receber emails e SMS da FFV Academy</p>
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              Novos simulados, conteúdos e atualizações. Podemos enviar no máximo 2x por mês. Você pode desmarcar a qualquer momento.
            </p>
          </div>
        </label>
      </section>

      <section className="mb-8 p-5 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-4">🎯 Produtos pagos</h2>
        {user.paidProducts.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>Nenhum produto pago ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {user.paidProducts.map(id => {
              const sim = getSimulado(id);
              return (
                <li key={id} className="flex items-center justify-between text-sm p-3 rounded-lg" style={{ background: 'var(--ffv-bg)' }}>
                  <span>{sim?.title ?? id}</span>
                  <span className="text-xs" style={{ color: 'var(--ffv-green)' }}>✓ Acesso vitalício</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mb-8 p-5 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-4">📦 Seus dados (LGPD)</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--ffv-muted)' }}>
          Sob a LGPD, você tem direito de acessar, exportar e deletar seus dados a qualquer momento.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExport}
            className="text-sm px-4 py-2 rounded-lg font-semibold"
            style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
          >
            📥 Baixar meus dados
          </button>
          <button
            onClick={handleDelete}
            className="text-sm px-4 py-2 rounded-lg font-semibold"
            style={{ background: 'transparent', color: 'var(--ffv-red)', border: '1px solid rgba(247,129,102,0.4)' }}
          >
            🗑 Excluir minha conta
          </button>
        </div>
      </section>

      <section className="text-center pt-4" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <button
          onClick={() => { logout(); window.location.href = '/'; }}
          className="text-sm"
          style={{ color: 'var(--ffv-muted)' }}
        >
          Sair desta conta
        </button>
      </section>
    </div>
  );
}
