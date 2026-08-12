import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Exatamente um landmark <main> por página.
 *
 * `src/app/layout.tsx` já renderiza `<main id="main-content">`, alvo do skip
 * link. Mas 8 arquivos abriam um segundo `<main>` dentro dele — incluindo
 * `/aprenda/[slug]`, a rota de maior tráfego, com 388 páginas. `<main>` aninhado
 * é HTML inválido e cria dois landmarks principais: o leitor de tela anuncia dois
 * "main" e o skip link leva ao externo enquanto o conteúdo está no interno.
 *
 * Este teste é estático de propósito: pega o problema no arquivo, antes de virar
 * DOM, e cobre as 388 rotas de artigo de uma vez — coisa que um teste de render
 * por página não faria.
 */

const SRC = join(process.cwd(), 'src');

function arquivosTsx(dir: string): string[] {
  const achados: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const caminho = join(dir, e.name);
    if (e.isDirectory()) achados.push(...arquivosTsx(caminho));
    else if (e.name.endsWith('.tsx')) achados.push(caminho);
  }
  return achados;
}

describe('landmarks', () => {
  const todos = arquivosTsx(SRC);

  it('só o layout raiz declara <main>', () => {
    const infratores = todos
      .filter(f => /<main\b/.test(readFileSync(f, 'utf8')))
      .map(f => f.replace(process.cwd() + '/', ''))
      .filter(f => f !== 'src/app/layout.tsx')
      // Arquivo de teste não entra em página nenhuma, então não pode criar um
      // segundo landmark em lugar nenhum. Ficavam no escopo por acidente, e a
      // varredura é textual: bastava um teste MENCIONAR a tag num comentário —
      // ao documentar esta própria regra, por exemplo — para acusar violação.
      // Recortar o escopo não afrouxa a proteção: a regra vale sobre o que é
      // servido, e nenhum arquivo servido está fora do filtro.
      .filter(f => !f.startsWith('src/tests/'));

    expect(
      infratores,
      'o layout raiz já fornece o landmark — use <article> ou <div> aqui',
    ).toEqual([]);
  });

  it('o layout raiz declara o <main> com o id do skip link', () => {
    const layout = readFileSync(join(SRC, 'app', 'layout.tsx'), 'utf8');
    expect(layout).toMatch(/<main[^>]*id="main-content"/);
    expect((layout.match(/<main\b/g) ?? []).length).toBe(1);
  });

  it('existe skip link apontando para o landmark', () => {
    const layout = readFileSync(join(SRC, 'app', 'layout.tsx'), 'utf8');
    expect(layout).toContain('#main-content');
  });
});
