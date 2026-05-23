/**
 * /admin/study-requests/[id] — Detalhe de solicitação.
 *
 * Mostra dados completos do lead, permite mudar status (com confirmação),
 * editar notas internas, baixar anexos (com auth via cookie/token).
 *
 * Mudar status dispara email ao estudante (orquestrado no use case do backend).
 */
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  fetchStudyRequest,
  studyRequestDownloadUrl,
  studyRequestZipUrl,
  STUDY_REQUEST_STATUS_COLOR,
  STUDY_REQUEST_STATUS_LABEL,
  STUDY_REQUEST_STATUSES,
  type StudyRequestDetail,
  type StudyRequestStatus,
  updateStudyRequest,
} from '@/lib/admin-api';

export default function AdminStudyRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [data, setData] = useState<StudyRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state (controlled)
  const [status, setStatus] = useState<StudyRequestStatus>('pending');
  const [internalNotes, setInternalNotes] = useState('');
  const [deliveredUrl, setDeliveredUrl] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchStudyRequest(id)
      .then(res => {
        if (cancelled) return;
        if (!res) {
          setError('Solicitação não encontrada ou erro ao carregar.');
        } else {
          setData(res);
          setStatus(res.status);
          setInternalNotes(res.internalNotes ?? '');
          setDeliveredUrl(res.deliveredUrl ?? '');
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function save() {
    if (!data || saving) return;
    setSaving(true);
    setError(null);
    const patch: { status?: StudyRequestStatus; internalNotes?: string; deliveredUrl?: string } = {};
    if (status !== data.status) patch.status = status;
    if (internalNotes !== (data.internalNotes ?? '')) patch.internalNotes = internalNotes;
    if (deliveredUrl !== (data.deliveredUrl ?? '')) patch.deliveredUrl = deliveredUrl;

    const updated = await updateStudyRequest(id, patch);
    setSaving(false);
    if (!updated) {
      setError('Falha ao salvar. Tente novamente.');
      return;
    }
    setData(updated);
    setStatus(updated.status);
    setInternalNotes(updated.internalNotes ?? '');
    setDeliveredUrl(updated.deliveredUrl ?? '');
    setDirty(false);
    setSavedAt(new Date());
  }

  /**
   * finalizeWithLink — ação dedicada do fluxo "entregar trilha".
   * Valida URL, manda PATCH com status=ready + deliveredUrl numa mesma request.
   * O backend dispara o email celebrativo com o CTA grande pro estudante.
   */
  async function finalizeWithLink() {
    if (!data || finalizing) return;
    const url = deliveredUrl.trim();
    if (!url) {
      setError('Cole a URL da trilha gerada antes de finalizar.');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('A URL precisa começar com http:// ou https://');
      return;
    }
    const confirmMsg = `Confirmar entrega para ${data.email}?\n\nIsso vai:\n• Mudar status para "Pronto"\n• Enviar email celebrativo com o link clicável\n\nLink: ${url}`;
    if (!window.confirm(confirmMsg)) return;

    setFinalizing(true);
    setError(null);
    const updated = await updateStudyRequest(id, { status: 'ready', deliveredUrl: url });
    setFinalizing(false);
    if (!updated) {
      setError('Falha ao finalizar. Tente novamente.');
      return;
    }
    setData(updated);
    setStatus(updated.status);
    setDeliveredUrl(updated.deliveredUrl ?? '');
    setDirty(false);
    setSavedAt(new Date());
  }

  /**
   * notifyCurationStarted — atalho do botão "Iniciar curadoria": muda status
   * pra in_production. Backend dispara email "Curadoria iniciada" automaticamente.
   */
  async function notifyCurationStarted() {
    if (!data || saving) return;
    if (data.status === 'in_production') {
      setError('Status já está em "em produção".');
      return;
    }
    const confirmMsg = `Avisar ${data.email} que a curadoria começou?\n\nIsso vai mudar status para "Em produção" e enviar email automático.`;
    if (!window.confirm(confirmMsg)) return;

    setSaving(true);
    setError(null);
    const updated = await updateStudyRequest(id, { status: 'in_production' });
    setSaving(false);
    if (!updated) {
      setError('Falha ao notificar. Tente novamente.');
      return;
    }
    setData(updated);
    setStatus(updated.status);
    setDirty(false);
    setSavedAt(new Date());
  }

  if (loading) {
    return <div style={{ color: 'var(--ffv-muted)' }}>Carregando…</div>;
  }
  if (error && !data) {
    return (
      <div className="flex flex-col gap-3">
        <p style={{ color: 'var(--ffv-red)' }}>{error}</p>
        <Link
          href="/admin/study-requests"
          className="text-sm underline"
          style={{ color: 'var(--ffv-blue)' }}
        >
          ← Voltar para lista
        </Link>
      </div>
    );
  }
  if (!data) return null;

  const accent = STUDY_REQUEST_STATUS_COLOR[data.status];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <nav className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/admin/study-requests" style={{ color: 'var(--ffv-blue)' }}>
          ← Voltar para lista
        </Link>
      </nav>

      <header className="flex flex-wrap items-start gap-4 justify-between">
        <div>
          <p
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: 'var(--ffv-muted)' }}
          >
            Solicitação
          </p>
          <h1 className="text-2xl font-bold mt-1">{data.subject}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ffv-muted)' }}>
            Recebida em {new Date(data.createdAt).toLocaleString('pt-BR')} · Última
            atualização {new Date(data.updatedAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <span
          className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide"
          style={{
            background: `color-mix(in srgb, ${accent} 18%, transparent)`,
            color: accent,
            border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`,
          }}
        >
          {STUDY_REQUEST_STATUS_LABEL[data.status]}
        </span>
      </header>

      <div className="grid lg:grid-cols-[1.4fr,1fr] gap-6">
        {/* Coluna principal */}
        <div className="flex flex-col gap-5">
          <Card title="Estudante">
            <KV label="Nome" value={data.name} />
            <KV
              label="Email"
              value={
                <a
                  href={`mailto:${data.email}`}
                  style={{ color: 'var(--ffv-blue)' }}
                >
                  {data.email}
                </a>
              }
            />
            <KV
              label="WhatsApp"
              value={
                data.phone ? (
                  <a
                    href={`https://wa.me/${data.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--ffv-blue)' }}
                  >
                    {data.phone}
                  </a>
                ) : (
                  <Muted>—</Muted>
                )
              }
            />
            <KV
              label="Conta FFV"
              value={
                data.userId ? (
                  <span style={{ color: 'var(--ffv-green)' }}>
                    ● Vinculada (user_id: <code>{data.userId.slice(0, 8)}…</code>)
                  </span>
                ) : (
                  <Muted>Lead anônimo (sem conta vinculada)</Muted>
                )
              }
            />
            <KV
              label="Marketing"
              value={data.marketingConsent ? 'Consentiu receber updates' : 'Não autorizou'}
            />
          </Card>

          <Card title="Conteúdo solicitado">
            <KV label="Área" value={data.studyArea} />
            <KV
              label="Instituição"
              value={data.institution || <Muted>—</Muted>}
            />
            <KV label="Matéria / tema" value={data.subject} />
            <KV label="Objetivo" value={data.goal || <Muted>—</Muted>} />
            <div className="mt-3">
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: 'var(--ffv-muted)' }}
              >
                DESCRIÇÃO LIVRE
              </p>
              <p
                className="text-sm whitespace-pre-wrap rounded-md p-3"
                style={{
                  background: 'var(--ffv-bg2)',
                  border: '1px solid var(--ffv-border)',
                  lineHeight: 1.7,
                }}
              >
                {data.description}
              </p>
            </div>
          </Card>

          <Card title={`Anexos (${data.attachments.length})`}>
            {data.attachments.length === 0 ? (
              <Muted>Estudante não enviou arquivos.</Muted>
            ) : (
              <>
                <a
                  href={studyRequestZipUrl(data.id)}
                  className="self-start inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold mb-3"
                  style={{
                    background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                    color: '#fff',
                  }}
                >
                  ⬇ Baixar tudo (.zip)
                </a>
              <ul className="flex flex-col gap-2">
                {data.attachments.map(a => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm"
                    style={{
                      background: 'var(--ffv-bg2)',
                      border: '1px solid var(--ffv-border)',
                    }}
                  >
                    <span className="text-xl">{iconForContentType(a.contentType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{a.fileName}</p>
                      <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                        {a.contentType} · {formatBytes(a.sizeBytes)}
                      </p>
                    </div>
                    <a
                      href={studyRequestDownloadUrl(a.downloadUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold px-3 py-1.5 rounded-md"
                      style={{
                        background: 'var(--ffv-blue)',
                        color: '#fff',
                      }}
                    >
                      Baixar
                    </a>
                  </li>
                ))}
              </ul>
              </>
            )}
          </Card>
        </div>

        {/* Coluna lateral: workflow */}
        <aside className="flex flex-col gap-5">
          <Card title="Status">
            <p className="text-xs mb-2" style={{ color: 'var(--ffv-muted)' }}>
              Mudar o status envia um email automático ao estudante (exceto pendente
              ↔ pendente, que é idempotente).
            </p>
            <div className="flex flex-col gap-1.5 mt-3">
              {STUDY_REQUEST_STATUSES.map(s => {
                const active = status === s;
                const c = STUDY_REQUEST_STATUS_COLOR[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStatus(s);
                      setDirty(true);
                    }}
                    className="text-left text-sm px-3 py-2 rounded-md transition-colors"
                    style={{
                      background: active
                        ? `color-mix(in srgb, ${c} 22%, transparent)`
                        : 'var(--ffv-bg2)',
                      border: `1px solid ${active ? c : 'var(--ffv-border)'}`,
                      color: active ? c : 'var(--foreground)',
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {STUDY_REQUEST_STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Workflow de entrega">
            <p className="text-xs mb-3" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
              Use estes 2 atalhos pra avisar o estudante. Cada ação dispara
              email automático com o template certo (curadoria iniciada ou trilha pronta).
            </p>

            <button
              type="button"
              onClick={notifyCurationStarted}
              disabled={saving || data.status === 'in_production' || data.status === 'ready'}
              className="w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors mb-3"
              style={{
                background: data.status === 'in_production' || data.status === 'ready'
                  ? 'var(--ffv-bg2)'
                  : 'color-mix(in srgb, var(--ffv-cyan) 14%, transparent)',
                border: `1px solid ${
                  data.status === 'in_production' || data.status === 'ready'
                    ? 'var(--ffv-border)'
                    : 'var(--ffv-cyan)'
                }`,
                color: data.status === 'in_production' || data.status === 'ready'
                  ? 'var(--ffv-muted)'
                  : 'var(--ffv-cyan)',
                fontWeight: 600,
                cursor: saving || data.status === 'in_production' || data.status === 'ready'
                  ? 'not-allowed'
                  : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {data.status === 'in_production' || data.status === 'ready'
                ? '✓ Curadoria já iniciada'
                : '🛠 Iniciar curadoria + avisar estudante'}
            </button>

            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--ffv-muted)' }}>
              URL DA TRILHA GERADA
            </label>
            <input
              type="url"
              value={deliveredUrl}
              onChange={e => {
                setDeliveredUrl(e.target.value);
                setDirty(true);
              }}
              placeholder="https://fernandofrancovalle.com/aprenda/..."
              className="w-full px-3 py-2 rounded-md text-sm font-mono mb-3"
              style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid var(--ffv-border)',
                color: 'var(--foreground)',
              }}
            />

            <button
              type="button"
              onClick={finalizeWithLink}
              disabled={finalizing || !deliveredUrl.trim()}
              className="w-full text-center px-3 py-3 rounded-md text-sm font-bold transition-colors"
              style={{
                background: deliveredUrl.trim()
                  ? 'linear-gradient(90deg, #059669, #047857)'
                  : 'var(--ffv-bg2)',
                color: deliveredUrl.trim() ? '#fff' : 'var(--ffv-muted)',
                border: '1px solid var(--ffv-border)',
                cursor: finalizing || !deliveredUrl.trim() ? 'not-allowed' : 'pointer',
                opacity: finalizing ? 0.6 : 1,
              }}
            >
              {finalizing ? 'Finalizando…' : '🎉 Finalizar + enviar email com link'}
            </button>
            <p className="text-[11px] mt-2" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
              Muda o status para "Pronto" e envia o email celebrativo com botão clicável.
            </p>
          </Card>

          <Card title="Notas internas">
            <textarea
              rows={6}
              value={internalNotes}
              onChange={e => {
                setInternalNotes(e.target.value);
                setDirty(true);
              }}
              placeholder="Anotações do time — não são enviadas ao estudante."
              className="w-full px-3 py-2 rounded-md text-sm"
              style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid var(--ffv-border)',
                color: 'var(--foreground)',
                resize: 'vertical',
                minHeight: 140,
              }}
            />
            <p className="text-[11px] mt-2" style={{ color: 'var(--ffv-muted)' }}>
              {internalNotes.length}/10.000 caracteres
            </p>
          </Card>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{
                background: dirty
                  ? 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))'
                  : 'var(--ffv-bg2)',
                color: dirty ? '#fff' : 'var(--ffv-muted)',
                border: '1px solid var(--ffv-border)',
                opacity: saving ? 0.6 : 1,
                cursor: dirty && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Salvando…' : 'Salvar alterações'}
            </button>
            {savedAt && !dirty && (
              <span className="text-xs" style={{ color: 'var(--ffv-green)' }}>
                ✓ Salvo {savedAt.toLocaleTimeString('pt-BR')}
              </span>
            )}
            {error && (
              <span className="text-xs" style={{ color: 'var(--ffv-red)' }}>
                {error}
              </span>
            )}
          </div>

          <Card title="ID da solicitação">
            <code
              className="text-xs px-2 py-1 rounded"
              style={{
                background: 'var(--ffv-bg2)',
                border: '1px solid var(--ffv-border)',
              }}
            >
              {data.id}
            </code>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl p-4"
      style={{
        background: 'var(--ffv-bg)',
        border: '1px solid var(--ffv-border)',
      }}
    >
      <h2
        className="text-xs font-mono uppercase tracking-widest mb-3"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.12em' }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px,1fr] gap-3 text-sm">
      <span style={{ color: 'var(--ffv-muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--ffv-muted)' }}>{children}</span>;
}

function iconForContentType(ct: string): string {
  if (ct.startsWith('image/')) return '🖼️';
  if (ct === 'application/pdf') return '📄';
  if (ct.includes('word')) return '📝';
  if (ct === 'text/plain') return '📃';
  return '📎';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
