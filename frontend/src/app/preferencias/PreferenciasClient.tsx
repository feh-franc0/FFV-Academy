'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { deleteAccount, updateMarketingConsent } from '@/lib/auth';
import { apiGet, hasBackend } from '@/lib/api-client';
import { getSimulado } from '@/lib/simulados';
import { clearAll } from '@/lib/storage';

export function PreferenciasClient() {
  const { user, refresh, logout, requireLogin } = useAuth();
  const [consent, setConsent] = useState(false);
  const [ocupado, setOcupado] = useState<'exportando' | 'excluindo' | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      requireLogin('gerenciar suas preferências').catch(() => {});
    } else {
      setConsent(user.marketingConsent);
    }
  }, [user, requireLogin]);

  if (!user) {
    return (
      <div className="px-6 py-20 text-center">
        {/* Título fora da condição — ver a nota em ProgressoClient.tsx. */}
        <h1 className="text-2xl font-bold mb-4">Preferências</h1>
        <p>Carregando…</p>
      </div>
    );
  }

  function toggleConsent() {
    const next = !consent;
    setConsent(next);
    updateMarketingConsent(next);
    refresh();
  }

  function baixarJson(dados: unknown, nome: string) {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /**
   * Exporta os dados pessoais (LGPD art. 18, II e V).
   *
   * Antes esta função serializava só o `user` que o cliente já tinha em memória —
   * um recorte do cache local apresentado como "meus dados". O servidor guarda
   * bem mais: tentativas de simulado, certificados, compras, snapshot de
   * progresso. O endpoint `GET /api/v1/me/export` devolve tudo isso e já
   * existia; ninguém o chamava.
   */
  async function handleExport() {
    const hoje = new Date().toISOString().slice(0, 10);
    setAviso(null);

    if (!hasBackend()) {
      baixarJson({ user, exportedAt: new Date().toISOString(), origem: 'somente-dispositivo' },
        `ffv-meus-dados-${hoje}.json`);
      setAviso('Exportado o que está neste navegador — o servidor não está configurado neste ambiente.');
      return;
    }

    setOcupado('exportando');
    try {
      const completo = await apiGet('/api/v1/me/export');
      baixarJson(completo, `ffv-meus-dados-${hoje}.json`);
    } catch {
      // Cai para o recorte local, mas dizendo que é um recorte. Um arquivo
      // incompleto entregue como completo é pior que uma falha declarada.
      baixarJson({ user, exportedAt: new Date().toISOString(), origem: 'somente-dispositivo' },
        `ffv-meus-dados-parcial-${hoje}.json`);
      setAviso(
        'Não conseguimos falar com o servidor, então o arquivo traz apenas os dados ' +
        'deste navegador. Tente de novo mais tarde para receber a exportação completa.',
      );
    } finally {
      setOcupado(null);
    }
  }

  /** Limpa só este navegador — não toca no servidor. */
  function handleLimparDispositivo() {
    if (!confirm(
      'Isto apaga o progresso guardado NESTE NAVEGADOR: XP, badges, streak, ' +
      'cartas de revisão e histórico de simulado. É irreversível.\n\n' +
      'Sua conta no servidor continua existindo — para excluí-la, use o botão ' +
      '"Excluir minha conta".\n\nConfirmar?'
    )) return;
    clearAll();
    logout();
    // Hard navigation de propósito: componentes de layout persistentes
    // (GameHUD) mantêm GameState em memória por cima do que acabou de ser
    // limpo do localStorage; router.push() não remonta esses componentes e
    // deixaria XP/streak velhos visíveis até a próxima ação do usuário.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/';
  }

  /**
   * Exclusão de conta (LGPD art. 18, VI).
   *
   * `deleteAccount()` já existia em `lib/auth.ts` e o backend já expunha
   * `DELETE /api/v1/me` — o que faltava era a interface chamar. Enquanto não
   * chamava, a única opção oferecida ao usuário limpava o localStorage, e a conta
   * seguia no servidor: e-mail, telefone, nome e a presença no ranking público.
   *
   * O texto do confirm descreve o recorte real do que o servidor apaga hoje
   * (ver o comentário de `UserRepo.SoftDelete`), sem prometer o que não faz.
   */
  async function handleExcluirConta() {
    if (!confirm(
      'Excluir sua conta na FFV Academy. Isto é irreversível.\n\n' +
      'Apagamos: seu e-mail e telefone do cadastro, seu nome, o progresso ' +
      'sincronizado (XP, streak, cartas de revisão) e sua presença no ranking ' +
      'público.\n\n' +
      'Mantemos: certificados já emitidos (terceiros podem estar conferindo-os) ' +
      'e registros de compra, por obrigação fiscal.\n\nConfirmar a exclusão?'
    )) return;

    setAviso(null);
    setOcupado('excluindo');
    const ok = await deleteAccount();
    if (!ok) {
      setOcupado(null);
      setAviso(
        'Não conseguimos concluir a exclusão agora — nada foi apagado. ' +
        'Tente novamente em alguns minutos; se persistir, use o contato da ' +
        'política de privacidade.',
      );
      return;
    }
    clearAll();
    // Hard navigation — mesmo motivo de handleLimparDispositivo acima.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/?conta=excluida';
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
          Sob a LGPD você tem direito de acessar, exportar e eliminar seus dados.
          Abaixo, o que você resolve sozinho — e o que hoje depende de pedido.
        </p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExport}
            disabled={ocupado !== null}
            className="text-sm px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
            style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
          >
            {ocupado === 'exportando' ? 'Preparando arquivo…' : '📥 Baixar meus dados'}
          </button>
          <button
            onClick={handleLimparDispositivo}
            disabled={ocupado !== null}
            className="text-sm px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
            style={{ border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          >
            🧹 Limpar este dispositivo
          </button>
          <button
            onClick={handleExcluirConta}
            disabled={ocupado !== null}
            className="text-sm px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
            style={{ background: 'transparent', color: 'var(--ffv-red)', border: '1px solid rgba(247,129,102,0.4)' }}
          >
            {ocupado === 'excluindo' ? 'Excluindo…' : '🗑 Excluir minha conta'}
          </button>
        </div>

        {/* aria-live: a resposta chega depois da ação e pode ser uma falha. */}
        <div aria-live="polite">
          {aviso && (
            <p className="text-xs mt-4 leading-relaxed" style={{ color: 'var(--ffv-yellow, #d29922)' }}>
              {aviso}
            </p>
          )}
        </div>

        <p className="text-xs mt-4 leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>
          <strong>Limpar este dispositivo</strong> apaga o progresso guardado neste
          navegador e mantém sua conta.{' '}
          <strong>Excluir minha conta</strong> apaga também os dados no servidor:
          e-mail, telefone, nome, progresso sincronizado e sua presença no ranking
          público. Certificados já emitidos e registros de compra são mantidos —
          o motivo de cada um está na{' '}
          <Link href="/privacidade" style={{ color: 'var(--ffv-blue)' }}>
            política de privacidade
          </Link>
          .
        </p>
      </section>

      <section className="text-center pt-4" style={{ borderTop: '1px solid var(--ffv-border)' }}>
        <button
          onClick={() => {
            logout();
            // Hard navigation — mesmo motivo de handleLimparDispositivo acima.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = '/';
          }}
          className="text-sm"
          style={{ color: 'var(--ffv-muted)' }}
        >
          Sair desta conta
        </button>
      </section>
    </div>
  );
}
