/**
 * Mini markdown renderer — subset suficiente para cheatsheets.
 *
 * Suporta:
 *   - # H1, ## H2, ### H3
 *   - ```lang\ncode\n``` (fenced code blocks)
 *   - Listas com -, *, +
 *   - Listas numeradas 1.
 *   - Parágrafos
 *   - **bold**, *italic*, `code inline`, [text](url)
 *
 * Escape HTML antes de renderizar — todos os chars perigosos viram entities.
 * Sem dependência externa: alternativa a marked/remark mantendo bundle pequeno.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(text: string): string {
  let out = escapeHtml(text);
  // [text](url) — link
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, url) => {
    const safeUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') ? url : '#';
    return `<a href="${safeUrl}" rel="noopener noreferrer">${t}</a>`;
  });
  // `inline code`
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // **bold**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // *italic* — evita conflito com bold (já consumido acima)
  out = out.replace(/(^|[^*])\*([^*\s][^*]*[^*\s]|[^*\s])\*(?!\*)/g, '$1<em>$2</em>');
  return out;
}

/**
 * Converte markdown → HTML. Output é seguro pra usar em
 * dangerouslySetInnerHTML pois escapeHtml é chamado antes de qualquer
 * substituição estrutural.
 */
export function renderMarkdown(md: string): string {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Fenced code blocks ```lang
    const fenceMatch = line.match(/^```(\w*)/);
    if (fenceMatch) {
      const lang = fenceMatch[1];
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        buf.push(lines[i]);
        i++;
      }
      i++; // pula fechamento
      out.push(
        `<pre><code class="language-${escapeHtml(lang)}">${escapeHtml(buf.join('\n'))}</code></pre>`,
      );
      continue;
    }

    // Headings
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) {
      out.push(`<h3>${renderInline(h3[1])}</h3>`);
      i++;
      continue;
    }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      out.push(`<h2>${renderInline(h2[1])}</h2>`);
      i++;
      continue;
    }
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) {
      out.push(`<h1>${renderInline(h1[1])}</h1>`);
      i++;
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(renderInline(lines[i].replace(/^\s*[-*+]\s+/, '')));
        i++;
      }
      out.push('<ul>' + items.map(it => `<li>${it}</li>`).join('') + '</ul>');
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(renderInline(lines[i].replace(/^\s*\d+\.\s+/, '')));
        i++;
      }
      out.push('<ol>' + items.map(it => `<li>${it}</li>`).join('') + '</ol>');
      continue;
    }

    // Blank line — separa parágrafos
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Parágrafo — agrupa linhas consecutivas
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^#+\s/) &&
      !lines[i].startsWith('```') &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(`<p>${renderInline(para.join(' '))}</p>`);
  }

  return out.join('\n');
}
