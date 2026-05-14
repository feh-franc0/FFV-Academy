'use client';

/**
 * /admin/cheatsheets/edit?slug=xxx — editor de cheatsheet (markdown body).
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCheatsheet, updateCheatsheet, type CheatsheetInput } from '@/lib/admin-content-api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export default function CheatsheetEditPage() {
  const router = useRouter();
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [accent, setAccent] = useState('#58a6ff');
  const [emoji, setEmoji] = useState('📋');
  const [bodyMd, setBodyMd] = useState('# Cheatsheet\n\nConteúdo em markdown.');
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState<CheatsheetInput['status']>('published');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('slug') ?? '';
    if (!s) return;
    setEditingSlug(s);
    setSlug(s);
    if (!API_BASE) return;
    fetch(`${API_BASE}/api/v1/cheatsheets/${encodeURIComponent(s)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(c => {
        if (!c) return;
        setTitle(c.title ?? '');
        setSubtitle(c.subtitle ?? '');
        setDescription(c.description ?? '');
        setAccent(c.accent ?? '#58a6ff');
        setEmoji(c.emoji ?? '');
        setBodyMd(c.bodyMd ?? '');
        setOrder(c.order ?? 0);
        setStatus(c.status ?? 'published');
      });
  }, []);

  async function handleSave() {
    setError(null);
    setBusy(true);
    const input: CheatsheetInput = { slug, title, subtitle, description, accent, emoji, bodyMd, order, status };
    const ok = editingSlug ? await updateCheatsheet(editingSlug, input) : await createCheatsheet(input);
    setBusy(false);
    if (!ok) {
      setError('Falha ao salvar — verifique tamanho dos campos.');
      return;
    }
    router.push('/admin/cheatsheets');
  }

  return (
    <div className="max-w-4xl flex flex-col gap-4">
      <Link href="/admin/cheatsheets" className="text-xs underline" style={{ color: 'var(--ffv-muted)' }}>← Voltar</Link>
      <h1 className="text-2xl font-bold">{editingSlug ? `Editar: ${editingSlug}` : 'Novo cheatsheet'}</h1>

      <div className="grid grid-cols-2 gap-3">
        <Inp label="Slug" value={slug} onChange={setSlug} disabled={!!editingSlug} />
        <Inp label="Order" value={String(order)} onChange={v => setOrder(Number(v) || 0)} type="number" />
      </div>
      <Inp label="Título" value={title} onChange={setTitle} />
      <Inp label="Subtítulo" value={subtitle} onChange={setSubtitle} />
      <Inp label="Descrição (para a lista pública)" value={description} onChange={setDescription} />

      <div className="grid grid-cols-3 gap-3">
        <Inp label="Emoji" value={emoji} onChange={setEmoji} />
        <Inp label="Accent (hex)" value={accent} onChange={setAccent} />
        <Sel label="Status" value={status ?? 'published'} onChange={v => setStatus(v as CheatsheetInput['status'])} options={['draft', 'published', 'archived']} />
      </div>

      <div>
        <label className="text-xs uppercase tracking-widest font-semibold mb-1 block" style={{ color: 'var(--ffv-muted)' }}>
          Corpo em markdown
        </label>
        <textarea value={bodyMd} onChange={e => setBodyMd(e.target.value)} rows={24} spellCheck={false}
          className="w-full p-3 rounded-md text-xs font-mono"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)', minHeight: 480 }} />
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
