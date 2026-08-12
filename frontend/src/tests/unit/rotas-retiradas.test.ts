import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HUBS, CURRICULUM } from '@/lib/curriculum';
import { ROTAS_RETIRADAS, REDIRECTS_RETIRADOS } from '@/lib/rotas-retiradas';

/**
 * O que este gate impede, e por que ele não é redundante com o build.
 *
 * O pivot de jul/2026 apagou 55 páginas que o site serve em produção. Auditoria
 * de 05/ago/2026: existiam **6 redirects** para essas 55 rotas. As outras 49 iam
 * virar 404 no dia do deploy, e nada no projeto reclamaria — `next build` não
 * sabe que uma URL existia ontem, e a varredura só visita rota que existe hoje.
 *
 * Três defeitos que só aparecem aqui:
 *
 *  1. **Destino que não existe.** Um 301 para `/python-engenhieros` (typo) é 404
 *     com passo extra. O build não valida `destination`: é string livre.
 *  2. **`source` sombreando página viva.** Redirect roda ANTES do roteamento. Se
 *     alguém recriar `/ds-algoritmos/page.tsx` sem tirar do inventário, a página
 *     nova nunca renderiza — e o sintoma é "minha página não aparece", sem erro.
 *  3. **Cadeia de redirect.** 301 para rota que também é 301 gasta um salto e
 *     dilui sinal. Aqui é fácil de criar sem perceber, porque as 55 origens e os
 *     destinos vivem na mesma tabela.
 */

const APP = join(process.cwd(), 'src', 'app');

/**
 * A rota resolve para uma página real? Aceita rota aninhada (`/revisar/maratona`)
 * e **segmento dinâmico**.
 *
 * O suporte a dinâmico foi acrescentado em ago/2026, quando `/temas/api-claude`
 * passou a redirecionar para `/temas/agentes`: a URL é servida (pré-renderizada
 * por `temas/[tema]`), mas não existe diretório literal com esse nome, e o
 * ajudante a declarava quebrada. O mesmo falso negativo atingiria qualquer
 * redirect para `/aprenda/<slug>`.
 *
 * A resolução continua exigindo `page.tsx` no nível final — literal primeiro,
 * e só então um único diretório `[...]` naquele nível. Sem isso o gate deixaria
 * de reprovar destino realmente inexistente, que é a razão de ele existir.
 */
function rotaExiste(rota: string): boolean {
  const partes = rota.replace(/^\//, '').split('/').filter(Boolean);
  let dir = APP;
  for (const parte of partes) {
    const literal = join(dir, parte);
    if (existsSync(literal)) {
      dir = literal;
      continue;
    }
    const dinamico = existsSync(dir)
      ? readdirSync(dir, { withFileTypes: true }).find(e => e.isDirectory() && e.name.startsWith('['))
      : undefined;
    if (!dinamico) return false;
    dir = join(dir, dinamico.name);
  }
  return existsSync(join(dir, 'page.tsx')) || existsSync(join(dir, 'page.ts'));
}

/**
 * Existe um diretório LITERAL com página para esta rota?
 *
 * A checagem de sombreamento precisa desta pergunta, e não da de cima. Sob rota
 * dinâmica, se uma URL é servida depende de `generateStaticParams`, não do
 * disco: `temas/[tema]` casaria QUALQUER nome, então usar a resolução dinâmica
 * aqui declararia `/temas/claude-code` como página viva depois de o tema ter
 * sido retirado da taxonomia — o oposto da verdade.
 *
 * Limite declarado: para rota dinâmica, este gate não verifica sombreamento.
 * Quem retira um parâmetro da lista gerada é quem tem de declarar a rota aqui.
 */
function rotaTemPaginaLiteral(rota: string): boolean {
  const dir = join(APP, ...rota.replace(/^\//, '').split('/').filter(Boolean));
  return existsSync(join(dir, 'page.tsx')) || existsSync(join(dir, 'page.ts'));
}

describe('rotas retiradas no pivot', () => {
  it('toda rota do inventário tem disposição completa', () => {
    const incompletas: string[] = [];
    for (const [rota, d] of Object.entries(ROTAS_RETIRADAS)) {
      if (!rota.startsWith('/')) incompletas.push(`${rota}: precisa começar com /`);
      if (!d.porque || d.porque.length < 20)
        incompletas.push(`${rota}: motivo ausente ou raso — escreva por que essa é a disposição certa`);
      if (d.tipo !== 'removido' && !d.destino) incompletas.push(`${rota}: ${d.tipo} sem destino`);
    }
    expect(incompletas).toEqual([]);
  });

  it('todo destino de redirect resolve para uma página que existe', () => {
    // O defeito 1: `destination` é string livre e o build não a valida.
    const quebrados = REDIRECTS_RETIRADOS.filter(r => !rotaExiste(r.destination)).map(
      r => `${r.source} -> ${r.destination} (destino sem page.tsx)`,
    );
    expect(quebrados).toEqual([]);
  });

  it('nenhuma rota retirada ainda tem página — redirect não pode sombrear página viva', () => {
    // O defeito 2: redirect roda antes do roteamento, então a página nova
    // simplesmente nunca renderiza, sem erro nenhum.
    const sombreadas = Object.keys(ROTAS_RETIRADAS)
      .filter(rotaTemPaginaLiteral)
      .map(r => `${r} tem page.tsx E está no inventário — tire do inventário ou apague a página`);
    expect(sombreadas).toEqual([]);
  });

  it('nenhum destino é ele mesmo uma rota retirada (sem cadeia de 301)', () => {
    const cadeias = REDIRECTS_RETIRADOS.filter(r => r.destination in ROTAS_RETIRADAS).map(
      r => `${r.source} -> ${r.destination}, que também é retirada`,
    );
    expect(cadeias).toEqual([]);
  });

  it('destino de disposição `hub` é hub de verdade ou índice navegável', () => {
    // Disciplina: `hub` significa "pai temático". Se o destino não é hub nem
    // índice, a disposição certa era `sucessor` — e o motivo teria de dizer qual
    // conteúdo cobre o assunto.
    const permitidos = new Set([...HUBS.map(h => h.href), '/explorar']);
    const errados = Object.entries(ROTAS_RETIRADAS)
      .filter(([, d]) => d.tipo === 'hub')
      .filter(([, d]) => !permitidos.has((d as { destino: string }).destino))
      .map(([r, d]) => `${r} -> ${(d as { destino: string }).destino} não é hub nem /explorar`);
    expect(errados).toEqual([]);
  });

  it('destino de disposição `sucessor` é trilha viva ou rota de feature', () => {
    // `sucessor` afirma "existe conteúdo sobre o mesmo assunto". Mandar para um
    // hub é afirmação mais fraca do que a etiqueta promete.
    const trilhas = new Set(CURRICULUM.map(t => t.href).filter(Boolean) as string[]);
    const hubs = new Set(HUBS.map(h => h.href));
    const suspeitos = Object.entries(ROTAS_RETIRADAS)
      .filter(([, d]) => d.tipo === 'sucessor')
      .filter(([, d]) => {
        const dest = (d as { destino: string }).destino;
        return hubs.has(dest) && !trilhas.has(dest);
      })
      .map(([r, d]) => `${r} -> ${(d as { destino: string }).destino} é hub, então a disposição é \`hub\`, não \`sucessor\``);
    expect(suspeitos).toEqual([]);
  });

  it('o inventário cobre as 64 rotas apagadas nos dois estreitamentos', () => {
    /**
     * Número fixado de propósito. Este gate NÃO descobre uma 56ª rota apagada:
     * comparar com `main` exige histórico e o checkout do CI é raso
     * (`fetch-depth` padrão = 1). O que ele garante é que ninguém encolhe o
     * inventário sem perceber — se cair para 54, alguém tirou uma entrada e
     * reabriu um 404 silencioso.
     */
    expect(Object.keys(ROTAS_RETIRADAS)).toHaveLength(64);
    const porTipo = Object.values(ROTAS_RETIRADAS).reduce<Record<string, number>>((acc, d) => {
      acc[d.tipo] = (acc[d.tipo] ?? 0) + 1;
      return acc;
    }, {});
    // 55 vieram do pivot de jul/2026 (34 redirects, 21 removidas). As 9 de
    // ago/2026 saíram com o eixo Claude-ferramenta e com a fusão de dois hubs:
    // 6 redirects e 3 removidas — Claude Code e o tema homônimo não têm destino
    // honesto, porque nenhuma página viva fala do assunto.
    expect(REDIRECTS_RETIRADOS).toHaveLength(40);
    expect(porTipo.removido).toBe(24);
  });

  it('next.config.ts consome o inventário em vez de manter tabela própria', () => {
    // Tabela duplicada foi como os 49 órfãos apareceram: a lista de redirects e
    // a lista de páginas apagadas viviam separadas e derivaram.
    const cfg = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8');
    expect(cfg).toMatch(/REDIRECTS_RETIRADOS/);
    const semComentario = cfg.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*/g, ' ');
    const literais = [...semComentario.matchAll(/source:\s*'\//g)];
    expect(
      literais.map(m => m[0]),
      'redirect escrito à mão no next.config.ts — declare no inventário',
    ).toEqual([]);
  });

  it('nenhuma rota retirada aparece no sitemap', () => {
    // O sitemap deriva de `trail.href` e `hub.href`. Se uma rota retirada
    // reaparecer lá, o site anuncia ao Google uma URL que responde 301 ou 404.
    const vivas = new Set([...CURRICULUM.map(t => t.href), ...HUBS.map(h => h.href)].filter(Boolean));
    const anunciadas = Object.keys(ROTAS_RETIRADAS).filter(r => vivas.has(r));
    expect(anunciadas).toEqual([]);
  });

  it('nenhuma rota retirada é referenciada por link interno vivo', () => {
    // Link interno para rota retirada faz o leitor pagar um salto de 301 — ou
    // cair num 404, se a disposição for `removido`.
    const arquivos: string[] = [];
    const andar = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name === 'tests' || e.name === 'node_modules') continue;
          andar(p);
        } else if (/\.tsx?$/.test(e.name)) arquivos.push(p);
      }
    };
    andar(join(process.cwd(), 'src'));

    const retiradas = new Set(Object.keys(ROTAS_RETIRADAS));
    const achados: string[] = [];
    for (const f of arquivos) {
      if (f.endsWith('rotas-retiradas.ts')) continue;
      const src = readFileSync(f, 'utf8');
      src.split('\n').forEach((l, i) => {
        for (const m of l.matchAll(/href\s*[:=]\s*[{]?\s*['"](\/[a-z0-9\-/]*)['"]/gi)) {
          if (retiradas.has(m[1]))
            achados.push(`${f.split('/src/')[1]}:${i + 1} -> ${m[1]}`);
        }
      });
    }
    expect(achados).toEqual([]);
  });
});
