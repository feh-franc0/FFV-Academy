/**
 * /admin/curriculum/edit?slug=xxx — editor de artigo CMS-driven.
 *
 * MVP: metadata via formulário + blocks via editor JSON. Visual block
 * editor fica pra Sprint 7+. Usa query param porque static export não
 * permite dynamicParams com 765 slugs sem pré-gerar tudo.
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchArticleWithBlocks } from '@/lib/curriculum-api';
import { updateArticleMetadata, saveArticleBlocks, deleteArticle, revalidarModulo, type BlockInput } from '@/lib/admin-curriculum-api';
import type { ArticleWithBlocks } from '@/components/article/blocks/schemas';

export default function EditPage() {
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSlug(params.get('slug') ?? '');
  }, []);

  if (!slug) {
    return (
      <div>
        <Link href="/admin/curriculum" className="text-sm underline">← Voltar</Link>
        <p className="mt-4 text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Slug ausente na URL. Use <code>/admin/curriculum/edit?slug=NOME-DO-SLUG</code>.
        </p>
      </div>
    );
  }
  return <EditClient slug={slug} />;
}

function EditClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [article, setArticle] = useState<ArticleWithBlocks | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [xp, setXp] = useState(10);
  const [readTime, setReadTime] = useState(5);
  const [order, setOrder] = useState(0);
  const [published, setPublished] = useState(true);
  const [blocksJson, setBlocksJson] = useState('[]');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchArticleWithBlocks(slug)
      .then(a => {
        if (cancelled || !a) {
          if (!cancelled) setError('Artigo não encontrado no backend.');
          return;
        }
        setArticle(a);
        setTitle(a.title);
        setDifficulty(a.difficulty);
        setXp(a.xp);
        setReadTime(a.read_time);
        setOrder(a.order);
        setPublished(true);
        setBlocksJson(JSON.stringify(a.blocks, null, 2));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleSave = useCallback(async () => {
    if (!article) return;
    setSaving(true);
    setError(null);
    setStatus('Salvando metadata…');

    let parsedBlocks: BlockInput[];
    try {
      parsedBlocks = JSON.parse(blocksJson);
      if (!Array.isArray(parsedBlocks)) throw new Error('blocks deve ser um array');
    } catch (e) {
      setError(`JSON inválido: ${(e as Error).message}`);
      setSaving(false);
      setStatus(null);
      return;
    }

    const okMeta = await updateArticleMetadata(slug, {
      title,
      difficulty,
      xp,
      readTime,
      order,
      published,
    });
    if (!okMeta) {
      setError('Falha ao salvar metadata (verifique sua permissão admin).');
      setSaving(false);
      setStatus(null);
      return;
    }

    setStatus('Salvando blocks…');
    const blocksResult = await saveArticleBlocks(slug, parsedBlocks);
    if (!blocksResult) {
      setError('Metadata salvo, mas falha ao gravar blocks (revise o JSON).');
      setSaving(false);
      setStatus(null);
      return;
    }

    // O conteúdo JÁ está gravado. A revalidação só encurta a espera de até 1h
    // do ISR — por isso a falha dela vira aviso, e nunca erro de salvamento:
    // dizer "falhou" aqui faria alguém salvar de novo achando que perdeu a
    // edição.
    setStatus('Publicando…');
    const revalidou = await revalidarModulo(slug);

    setStatus(
      revalidou
        ? `✓ Salvo e publicado (${blocksResult.count} blocks)`
        : `✓ Salvo (${blocksResult.count} blocks) — a página pública atualiza em até 1h`,
    );
    setSaving(false);
    setTimeout(() => setStatus(null), revalidou ? 2500 : 6000);
  }, [article, slug, title, difficulty, xp, readTime, order, published, blocksJson]);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Deletar o artigo "${slug}"? Isso é soft-delete, mas a página deixa de existir publicamente.`)) return;
    setSaving(true);
    const ok = await deleteArticle(slug);
    setSaving(false);
    if (ok) {
      router.push('/admin/curriculum');
    } else {
      setError('Falha ao deletar.');
    }
  }, [slug, router]);

  if (loading) {
    return <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>Carregando artigo…</p>;
  }
  if (error && !article) {
    return (
      <div>
        <Link href="/admin/curriculum" className="text-sm underline">← Voltar</Link>
        <p className="mt-4 text-sm" style={{ color: 'var(--ffv-red, #dc2626)' }}>{error}</p>
      </div>
    );
  }
  if (!article) return null;

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/curriculum" className="text-xs underline" style={{ color: 'var(--ffv-muted)' }}>
            ← Voltar para lista
          </Link>
          <h1 className="text-2xl font-bold mt-1">{title || slug}</h1>
          <p className="text-xs font-mono" style={{ color: 'var(--ffv-muted)' }}>
            slug: {slug} · hub: {article.hub_id} · trail: {article.trail_id}
          </p>
        </div>
        <a
          href={`/aprenda/${slug}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-md whitespace-nowrap"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          Ver público ↗
        </a>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Título">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          />
        </Field>
        <Field label="Dificuldade">
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          >
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
        </Field>
        <Field label="XP">
          <input
            type="number"
            value={xp}
            onChange={e => setXp(Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          />
        </Field>
        <Field label="Read time (min)">
          <input
            type="number"
            value={readTime}
            onChange={e => setReadTime(Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          />
        </Field>
        <Field label="Order">
          <input
            type="number"
            value={order}
            onChange={e => setOrder(Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 rounded-md text-sm"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          />
        </Field>
        <Field label="Publicado">
          <label className="flex items-center gap-2 text-sm pt-2">
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
            <span>visível publicamente</span>
          </label>
        </Field>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--ffv-muted)' }}>
            Blocks (JSON)
          </label>
          <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
            {(blocksJson.length / 1024).toFixed(1)} KB
          </span>
        </div>
        <textarea
          value={blocksJson}
          onChange={e => setBlocksJson(e.target.value)}
          rows={24}
          spellCheck={false}
          className="w-full p-3 rounded-md text-xs font-mono"
          style={{
            background: 'var(--ffv-bg2)',
            border: '1px solid var(--ffv-border)',
            color: 'var(--foreground)',
            minHeight: 420,
          }}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
          Estrutura: cada bloco precisa de <code>id</code>, <code>type</code>, <code>position</code>, <code>data</code>. Backend valida o tipo contra os 24 conhecidos.
        </p>
      </section>

      <footer className="flex flex-wrap items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--ffv-border)' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-50"
          style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
        >
          {saving ? 'Salvando…' : 'Salvar mudanças'}
        </button>
        <button
          onClick={handleDelete}
          disabled={saving}
          className="px-4 py-2 rounded-md text-sm disabled:opacity-50"
          style={{ background: 'transparent', border: '1px solid var(--ffv-red, #dc2626)', color: 'var(--ffv-red, #dc2626)' }}
        >
          Deletar artigo
        </button>
        {status && (
          <span className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {status}
          </span>
        )}
        {error && (
          <span className="text-sm" style={{ color: 'var(--ffv-red, #dc2626)' }}>
            {error}
          </span>
        )}
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  // `<fieldset>`+`<legend>`, não `<div>`+`<label>` solto: `Field` recebe o
  // controle pronto via `children` (input/select/textarea de cada call
  // site), então `<label>` sem `htmlFor` não associa nada — 6 controles sem
  // nome acessível, medido em 11/ago/2026. `<legend>` nomeia o grupo sem
  // precisar tocar cada call site.
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-xs uppercase tracking-widest font-semibold mb-1 block" style={{ color: 'var(--ffv-muted)' }}>
        {label}
      </legend>
      {children}
    </fieldset>
  );
}
