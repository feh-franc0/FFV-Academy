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
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

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
    const patch: { status?: StudyRequestStatus; internalNotes?: string } = {};
    if (status !== data.status) patch.status = status;
    if (internalNotes !== (data.internalNotes ?? '')) patch.internalNotes = internalNotes;

    const updated = await updateStudyRequest(id, patch);
    setSaving(false);
    if (!updated) {
      setError('Falha ao salvar. Tente novamente.');
      return;
    }
    setData(updated);
    setStatus(updated.status);
    setInternalNotes(updated.internalNotes ?? '');
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
