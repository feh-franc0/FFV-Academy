'use client';

/**
 * /admin/news/edit?slug=xxx — editor de news. Modo "new" se slug ausente.
 */
import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createNews, updateNews, type NewsInput } from '@/lib/admin-content-api';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export default function NewsEditPage() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [source, setSource] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<NewsInput['category']>('launch');
  const [hot, setHot] = useState(false);
  const [tags, setTags] = useState('');
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<NewsInput['status']>('published');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('slug') ?? '';
    if (!s) return;
    setEditingSlug(s);
    setSlug(s);
    if (!API_BASE) return;
    fetch(`${API_BASE}/api/v1/news/${encodeURIComponent(s)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(n => {
        if (!n) return;
        setTitle(n.title ?? '');
        setSummary(n.summary ?? '');
        setSource(n.source ?? '');
        setSourceUrl(n.sourceUrl ?? '');
        setImageUrl(n.imageUrl ?? '');
        setCategory(n.category ?? 'launch');
        setHot(!!n.hot);
        setTags((n.tags ?? []).join(', '));
        setPublishedAt(n.publishedAt ?? new Date().toISOString().slice(0, 10));
        setStatus(n.status ?? 'published');
      });
  }, []);

  async function handleSave() {
    setError(null);
    setBusy(true);
    const input: NewsInput = {
      slug,
      title,
      summary,
      source,
      sourceUrl,
      imageUrl: imageUrl || undefined,
      category,
      hot,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      publishedAt,
      status,
    };
    const ok = editingSlug ? await updateNews(editingSlug, input) : await createNews(input);
    setBusy(false);
    if (!ok) {
      setError('Falha ao salvar — verifique campos (sourceUrl deve ser https, summary ≥ 20 chars).');
      return;
    }
    router.push('/admin/news');
  }

  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <Link href="/admin/news" className="text-xs underline" style={{ color: 'var(--ffv-muted)' }}>← Voltar</Link>
      <h1 className="text-2xl font-bold">{editingSlug ? `Editar: ${editingSlug}` : 'Nova notícia'}</h1>

      <Input label="Slug (kebab-case)" value={slug} onChange={setSlug} disabled={!!editingSlug} />
      <Input label="Título (10–200 chars)" value={title} onChange={setTitle} />
      <Textarea label="Resumo (20–500 chars)" value={summary} onChange={setSummary} rows={3} />
      <Input label="Fonte (ex: OpenAI)" value={source} onChange={setSource} />
      <Input label="Source URL (https://)" value={sourceUrl} onChange={setSourceUrl} />
      <Input label="Image URL (opcional, https://)" value={imageUrl} onChange={setImageUrl} />

      <div className="grid grid-cols-2 gap-3">
        <Select label="Categoria" value={category} onChange={v => setCategory(v as NewsInput['category'])} options={['launch', 'research', 'business', 'safety', 'regulation']} />
        <Input label="Data (YYYY-MM-DD)" value={publishedAt} onChange={setPublishedAt} />
      </div>

      <Input label="Tags (separadas por vírgula)" value={tags} onChange={setTags} />
      <Select label="Status" value={status ?? 'published'} onChange={v => setStatus(v as NewsInput['status'])} options={['draft', 'published', 'archived']} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={hot} onChange={e => setHot(e.target.checked)} />
        <span>🔥 Hot — destaca na home</span>
      </label>

      <div className="flex gap-3 pt-3 border-t" style={{ borderColor: 'var(--ffv-border)' }}>
        <button onClick={handleSave} disabled={busy} className="px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-50" style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}>
          {busy ? 'Salvando…' : (editingSlug ? 'Salvar' : 'Criar')}
        </button>
        {error && <span className="text-sm" style={{ color: 'var(--ffv-red, #dc2626)' }}>{error}</span>}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-widest font-semibold mb-1 block" style={{ color: 'var(--ffv-muted)' }}>{label}</label>
      <input id={id} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className="w-full px-3 py-2 rounded-md text-sm disabled:opacity-50"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }} />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-widest font-semibold mb-1 block" style={{ color: 'var(--ffv-muted)' }}>{label}</label>
      <textarea id={id} value={value} onChange={e => onChange(e.target.value)} rows={rows}
        className="w-full p-3 rounded-md text-sm"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }} />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-widest font-semibold mb-1 block" style={{ color: 'var(--ffv-muted)' }}>{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-sm"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
