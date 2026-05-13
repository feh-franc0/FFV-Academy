'use client';

/**
 * AnkiExport — botão que extrai Q&As do artigo e baixa um TSV.
 *
 * Anki importa arquivos `.tsv` (tab-separated) com 2 colunas (front, back)
 * nativamente — sem dependência de bibliotecas. Fonte dos cards:
 *   - blocks do tipo `qa_item` (pergunta + resposta)
 *
 * Suficiente para 90% dos casos. Para algo mais elaborado (decks múltiplos,
 * tags, imagens), trocaríamos por geração de `.apkg` server-side.
 */
import { useState } from 'react';
import type { Block } from '@/components/article/blocks/schemas';

function asText(v: unknown): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) return v.map(asText).join(' ');
  if (v && typeof v === 'object' && 'text' in (v as Record<string, unknown>)) {
    return asText((v as { text: unknown }).text);
  }
  return '';
}

function extractQA(blocks: Block[]): Array<{ q: string; a: string }> {
  const out: Array<{ q: string; a: string }> = [];
  function walk(arr: Block[]) {
    for (const b of arr) {
      if (b.type === 'qa_item') {
        const data = (b.data ?? {}) as Record<string, unknown>;
        const q = asText(data.question).trim();
        const a = asText(data.answer).trim();
        if (q && a) out.push({ q, a });
      }
      if (b.children?.length) walk(b.children);
    }
  }
  walk(blocks);
  return out;
}

function escapeTsvCell(s: string): string {
  // Anki TSV: substitui tabs e quebras de linha por espaços.
  return s.replace(/\t/g, ' ').replace(/\r?\n/g, ' ').trim();
}

export function AnkiExport({ slug, title, blocks }: { slug: string; title: string; blocks: Block[] }) {
  const [count, setCount] = useState(() => extractQA(blocks).length);

  if (count === 0) return null;

  function handleDownload() {
    const items = extractQA(blocks);
    setCount(items.length);
    if (items.length === 0) {
      alert('Este módulo não tem itens Q&A exportáveis.');
      return;
    }
    const lines = [
      `#separator:tab`,
      `#html:false`,
      `#deck:FFV Academy::${escapeTsvCell(title)}`,
      `#tags column:3`,
      ...items.map(it => `${escapeTsvCell(it.q)}\t${escapeTsvCell(it.a)}\tffv ${slug}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}.tsv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
        color: 'var(--foreground)',
      }}
      title="Baixa um arquivo .tsv que o Anki importa nativamente (Import → Tab separated)"
    >
      📥 Exportar p/ Anki ({count})
    </button>
  );
}
