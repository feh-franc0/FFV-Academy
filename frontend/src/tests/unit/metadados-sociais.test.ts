import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Dois defeitos de `<head>` que só aparecem no HTML servido — e que já voltaram
 * uma vez depois de consertados à mão.
 *
 * ## 1. `openGraph` declarado sem `images` apaga a imagem da raiz
 *
 * No Next, `openGraph` de uma página **substitui** o do layout — não faz merge
 * campo a campo. Então o bloco quase-inofensivo
 * `openGraph: { title, description, type, url }` deixa a página **sem
 * `og:image`**. Auditoria de 05/ago/2026 consertou `/aprenda/<slug>` à mão; a de
 * 06/ago, medindo 100 rotas servidas, encontrou **outras 11 iguais** —
 * `/temas`, `/temas/<tema>`, `/news`, `/perguntas`, `/simulados`,
 * `/certificacoes`, `/cheatsheet` e as duas landings de aquisição.
 *
 * O remédio é o helper `social()` de `src/lib/metadata-social.ts`: quem chama não
 * esquece o campo porque não escreve o campo. Este teste é o que impede alguém de
 * voltar a escrever o bloco à mão.
 *
 * ## 2. O sufixo da marca escrito à mão duplica
 *
 * O layout raiz declara `title.template = '%s — FFV Academy'`. Escrever
 * `title: 'X — FFV Academy'` numa página produz
 * `<title>X — FFV Academy — FFV Academy</title>` — medido em **12 rotas**, entre
 * elas os seis hubs, `/explorar`, `/news`, `/temas` e as páginas de simulado.
 *
 * `openGraph.title` é o caso oposto: NÃO passa pelo template, então ali o sufixo
 * é necessário. Por isso o teste só olha o `title` de nível superior.
 */

const APP = join(process.cwd(), 'src', 'app');

function paginas(): string[] {
  const achadas: string[] = [];
  const andar = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) andar(p);
      else if (e.name === 'page.tsx' || e.name === 'layout.tsx') achadas.push(p);
    }
  };
  andar(APP);
  return achadas;
}

/** Comentário fora antes de casar — já foi causa de gate reprovando pela própria documentação. */
function semComentario(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
}

const rel = (p: string) => p.split('/src/')[1];

describe('metadados sociais', () => {
  it('nenhuma página declara openGraph à mão sem images', () => {
    const faltando: string[] = [];
    for (const p of paginas()) {
      const src = semComentario(readFileSync(p, 'utf8'));
      // O layout raiz é a definição do padrão e declara `images` — ele pode.
      if (p.endsWith(join('src', 'app', 'layout.tsx'))) continue;
      // Casa o bloco `openGraph: { … }` até o fecho no mesmo nível de indentação.
      for (const m of src.matchAll(/openGraph:\s*\{([\s\S]*?)\n(\s*)\},/g)) {
        if (!/images\s*:/.test(m[1])) {
          faltando.push(rel(p));
        }
      }
    }
    expect(
      [...new Set(faltando)],
      'openGraph sem `images` apaga a imagem da raiz — use `social()` de @/lib/metadata-social',
    ).toEqual([]);
  });

  it('nenhuma página escreve o sufixo da marca no title de nível superior', () => {
    /**
     * O `title` do layout raiz é o dono do sufixo; página que o repete duplica.
     * `openGraph.title` e `twitter.title` estão fora desta regra porque não passam
     * pelo template — a verificação abaixo só olha `title:` com dois espaços de
     * indentação (nível superior do objeto de metadados) ou dentro do `return` de
     * um `generateMetadata`, que também é nível superior.
     */
    const duplicando: string[] = [];
    for (const p of paginas()) {
      const src = semComentario(readFileSync(p, 'utf8'));
      if (p.endsWith(join('src', 'app', 'layout.tsx'))) continue;
      /**
       * `app/page.tsx` está no MESMO segmento que `app/layout.tsx`, e o template
       * do Next só se aplica a segmentos FILHOS — então o título da home não
       * recebe o sufixo e precisa trazê-lo. Medido no HTML servido em
       * 06/ago/2026: `<title>FFV Academy — Aprenda IA, Claude e AWS como
       * engenheiro</title>`, uma ocorrência só. A primeira versão deste teste
       * acusava a home; era falso positivo meu.
       */
      if (p.endsWith(join('src', 'app', 'page.tsx'))) continue;
      for (const m of src.matchAll(/^(\s*)title:\s*([`'"][^`'"\n]*[`'"]),?\s*$/gm)) {
        const indent = m[1].length;
        const valor = m[2];
        // 2 espaços = objeto `metadata`; 4 = dentro do `return {` de generateMetadata.
        if (indent > 4) continue;
        if (/FFV Academy/.test(valor)) duplicando.push(`${rel(p)} → ${valor}`);
      }
    }
    expect(
      duplicando,
      'o template `%s — FFV Academy` do layout raiz já aplica o sufixo — não escreva à mão',
    ).toEqual([]);
  });

  it('o helper social() entrega og:image, og:url e o par twitter completo', async () => {
    const { social } = await import('@/lib/metadata-social');
    const m = social({ titulo: 'T', descricao: 'D', caminho: '/x' });
    expect(m.openGraph?.images).toBeTruthy();
    expect(m.openGraph).toMatchObject({ title: 'T', description: 'D', siteName: 'FFV Academy', locale: 'pt_BR' });
    expect((m.openGraph as { url?: string }).url).toBe('https://fernandofrancovalle.com/x');
    // `twitter` não herda de `openGraph` — tem de vir preenchido.
    expect(m.twitter).toMatchObject({ card: 'summary_large_image', title: 'T', description: 'D' });
    expect((m.twitter as { images?: unknown[] }).images?.length).toBe(1);
  });

  it('a base do site tem uma definição só', async () => {
    // `BASE` de metadata-social é apelido de `BASE_URL` de site-jsonld. Duas
    // constantes com a mesma URL derivam no dia em que o domínio muda.
    const { BASE } = await import('@/lib/metadata-social');
    const { BASE_URL } = await import('@/lib/site-jsonld');
    expect(BASE).toBe(BASE_URL);
    const src = readFileSync(join(process.cwd(), 'src', 'lib', 'metadata-social.ts'), 'utf8');
    expect(
      semComentario(src),
      'metadata-social não pode redeclarar a URL — importe de site-jsonld',
    ).not.toMatch(/=\s*'https:\/\/fernandofrancovalle\.com'/);
  });
});
