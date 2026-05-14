'use client';

/**
 * /admin/playlists/edit?slug=xxx — editor de playlist.
 *
 * Module slugs ficam num textarea separado por linha — simples e auditável.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPlaylist, updatePlaylist, type PlaylistInput } from '@/lib/admin-content-api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export default function PlaylistEditPage() {
  const router = useRouter();
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [audience, setAudience] = useState('');
  const [color, setColor] = useState('#58a6ff');
  const [emoji, setEmoji] = useState('🎯');
  const [moduleSlugsText, setModuleSlugsText] = useState('');
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState<PlaylistInput['status']>('published');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('slug') ?? '';
    if (!s) return;
    setEditingSlug(s);
    setSlug(s);
    if (!API_BASE) return;
    fetch(`${API_BASE}/api/v1/playlists/${encodeURIComponent(s)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(p => {
        if (!p) return;
        setTitle(p.title ?? '');
        setSubtitle(p.subtitle ?? '');
        setAudience(p.audience ?? '');
        setColor(p.color ?? '#58a6ff');
        setEmoji(p.emoji ?? '');
        setModuleSlugsText((p.moduleSlugs ?? []).join('\n'));
        setOrder(p.order ?? 0);
        setStatus(p.status ?? 'published');
      });
  }, []);

  async function handleSave() {
    setError(null);
    setBusy(true);
    const moduleSlugs = moduleSlugsText.split('\n').map(s => s.trim()).filter(Boolean);
    const input: PlaylistInput = { slug, title, subtitle, audience, color, emoji, moduleSlugs, order, status };
    const ok = editingSlug ? await updatePlaylist(editingSlug, input) : await createPlaylist(input);
    setBusy(false);
    if (!ok) {
      setError('Falha ao salvar.');
      return;
    }
    router.push('/admin/playlists');
  }

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <Link href="/admin/playlists" className="text-xs underline" style={{ color: 'var(--ffv-muted)' }}>← Voltar</Link>
      <h1 className="text-2xl font-bold">{editingSlug ? `Editar: ${editingSlug}` : 'Nova playlist'}</h1>

      <div className="grid grid-cols-2 gap-3">
        <Inp label="Slug" value={slug} onChange={setSlug} disabled={!!editingSlug} />
        <Inp label="Order" value={String(order)} onChange={v => setOrder(Number(v) || 0)} type="number" />
      </div>
      <Inp label="Título" value={title} onChange={setTitle} />
      <Inp label="Subtítulo" value={subtitle} onChange={setSubtitle} />
      <Inp label="Audience (pra quem?)" value={audience} onChange={setAudience} />

      <div className="grid grid-cols-3 gap-3">
        <Inp label="Emoji" value={emoji} onChange={setEmoji} />
        <Inp label="Cor (hex)" value={color} onChange={setColor} />
        <Sel label="Status" value={status ?? 'published'} onChange={v => setStatus(v as PlaylistInput['status'])} options={['draft', 'published', 'archived']} />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest font-semibold mb-1 block" style={{ color: 'var(--ffv-muted)' }}>
          Module slugs (1 por linha, ordem importa)
        </label>
        <textarea value={moduleSlugsText} onChange={e => setModuleSlugsText(e.target.value)} rows={12} spellCheck={false}
          className="w-full p-3 rounded-md text-sm font-mono"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }} />
        <p className="text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>
          Máximo 50 slugs. Confira em /admin/curriculum se cada slug existe.
        </p>
      </div>

      <div className="flex gap-3 pt-3 border-t" style={{ borderColor: 'var(--ffv-border)' }}>
        <button onClick={handleSave} disabled={busy} className="px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-50" style={{ background: 'var(--ffv-blue)', color: 'white' }}>
          {busy ? 'Salvando…' : (editingSlug ? 'Salvar' : 'Criar')}
        </button>
        {error && <span className="text-sm" style={{ color: 'var(--ffv-red, #dc2626)' }}>{error}</span>}
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, disabled, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean; type?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest font-semibold mb-1 block" style={{ color: 'var(--ffv-muted)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className="w-full px-3 py-2 rounded-md text-sm disabled:opacity-50"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }} />
    </div>
  );
}

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest font-semibold mb-1 block" style={{ color: 'var(--ffv-muted)' }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-sm"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
