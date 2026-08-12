'use client';

/**
 * AnkiExport — botão que baixa os Q&As do artigo como TSV.
 *
 * Anki importa arquivos `.tsv` (tab-separated) com 2 colunas (front, back)
 * nativamente — sem dependência de bibliotecas. Fonte dos cards: blocks do
 * tipo `qa_item` (pergunta + resposta), já extraídos pelo SERVER COMPONENT
 * (`extractQA`, de `@/lib/article-extract`) — este componente recebia
 * `blocks: Block[]` (a árvore INTEIRA do artigo) até 11/ago/2026, e por ser
 * `'use client'` isso obrigava o RSC a serializar o conteúdo do módulo de
 * novo no payload (ele já está no HTML via `<BlockTree>`), contribuindo pro
 * payload RSC grande das páginas `lab-*`.
 *
 * Suficiente para 90% dos casos. Para algo mais elaborado (decks múltiplos,
 * tags, imagens), trocaríamos por geração de `.apkg` server-side.
 */
import { useState } from 'react';

function escapeTsvCell(s: string): string {
  // Anki TSV: substitui tabs e quebras de linha por espaços.
  return s.replace(/\t/g, ' ').replace(/\r?\n/g, ' ').trim();
}

export function AnkiExport({
  slug,
  title,
  items,
}: {
  slug: string;
  title: string;
  /** Já extraído pelo Server Component — não `blocks` inteiro. */
  items: Array<{ q: string; a: string }>;
}) {
  const [count] = useState(items.length);

  if (count === 0) return null;

  function handleDownload() {
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
