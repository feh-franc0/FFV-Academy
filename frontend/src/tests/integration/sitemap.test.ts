import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import sitemap, { PAGINAS_ESTATICAS } from '@/app/sitemap';
import manifesto from '@/lib/content-manifest.json';

/**
 * O sitemap é a única parte da plataforma cujo público é um robô — e por isso
 * apodrece sem ninguém notar. Ele tinha `/acessibilidade`, `/ds-algoritmos` e
 * `/testing-engineering`, três rotas deletadas no pivot, anunciando 404 para o
 * Google. E mapeava todos os 415 módulos declarados, incluindo os 27 sem
 * conteúdo.
 *
 * Este teste faz a verificação que ninguém faz à mão: toda URL anunciada precisa
 * corresponder a uma rota que existe em src/app/ e, no caso de módulo, a um slug
 * com conteúdo escrito.
 */

const APP = join(process.cwd(), 'src', 'app');
const BASE = 'https://fernandofrancovalle.com';

/** Rotas estáticas reais: todo diretório de src/app/ com page.tsx, sem [param]. */
function rotasEstaticas(dir = APP, prefixo = ''): Set<string> {
  const achadas = new Set<string>();
  for (const entrada of readdirSync(dir)) {
    const caminho = join(dir, entrada);
    if (entrada === 'page.tsx') {
      achadas.add(prefixo || '/');
      continue;
    }
    if (!statSync(caminho).isDirectory()) continue;
    // route groups (grupo) não aparecem na URL
    const seg = entrada.startsWith('(') ? '' : `/${entrada}`;
    for (const r of rotasEstaticas(caminho, prefixo + seg)) achadas.add(r);
  }
  return achadas;
}

const ROTAS = rotasEstaticas();

describe('sitemap', () => {
  const entradas = sitemap();

  it('gera um número plausível de URLs', () => {
    expect(entradas.length).toBeGreaterThan(400);
  });

  it('toda página estática declarada corresponde a uma rota existente', () => {
    const mortas = PAGINAS_ESTATICAS
      .map(p => p.path)
      .filter(p => !ROTAS.has(p === '/' ? '/' : p));
    expect(mortas).toEqual([]);
  });

  it('nenhuma URL de módulo aponta para slug sem conteúdo', () => {
    const comConteudo = new Set(manifesto.slugs);
    const semConteudo = entradas
      .map(e => e.url)
      .filter(u => u.includes('/aprenda/'))
      .map(u => u.split('/aprenda/')[1].replace(/\/$/, ''))
      .filter(slug => !comConteudo.has(slug));
    expect(semConteudo).toEqual([]);
  });

  it('o manifesto de conteúdo está em sincronia com os seeds no disco', () => {
    // Roda só onde scripts/seeds existe (dev e CI do monorepo); no build Docker
    // do frontend a pasta não é copiada, e aí não há o que comparar.
    const SEEDS = join(process.cwd(), '..', 'scripts', 'seeds', 'articles');
    if (!existsSync(SEEDS)) return;

    const noDisco = new Set(
      readdirSync(SEEDS)
        .filter(f => f.endsWith('.json') && !f.startsWith('_'))
        .map(f => f.replace(/\.json$/, '')),
    );
    const desatualizados = manifesto.slugs.filter(s => !noDisco.has(s));
    expect(
      desatualizados,
      'manifesto lista slug sem seed — rode extract-curriculum.ts',
    ).toEqual([]);
  });

  it('não há URL duplicada', () => {
    const urls = entradas.map(e => e.url);
    const dups = urls.filter((u, i) => urls.indexOf(u) !== i);
    expect([...new Set(dups)]).toEqual([]);
  });

  it('toda URL usa o domínio canônico e não tem barra dupla', () => {
    for (const e of entradas) {
      expect(e.url.startsWith(BASE)).toBe(true);
      expect(e.url.slice(BASE.length)).not.toMatch(/\/\//);
    }
  });
});

/**
 * ## `lastModified` — as três regras, provadas nos dois sentidos
 *
 * O campo voltou em 07/ago/2026, depois que a migration 000045 e o `contentHash`
 * do importador tornaram `curriculum_articles.updated_at` uma data real. Antes
 * dele, 520 URLs traziam a data do build — sinal uniforme, que o Google ignora
 * inclusive onde seria verdade.
 *
 * Estes testes cobrem o caminho de código. A distinção das datas em si é medida
 * sobre o XML servido, na 15ª checagem da varredura.
 */
describe('sitemap — lastModified só onde há data real', () => {
  it('sem datas, nenhuma URL declara lastModified', () => {
    // Estado de hoje: `content-dates.json` vazio, porque o build não tem banco.
    // Ausência é a resposta honesta, e é o comportamento de 06/ago.
    const entradas = sitemap();
    const comData = entradas.filter(e => e.lastModified !== undefined);
    expect(
      comData.map(e => e.url),
      'com content-dates.json vazio, nenhuma URL pode afirmar data',
    ).toEqual([]);
  });

  it('nenhuma URL fora de /aprenda/ pode declarar lastModified', () => {
    // Página estática, hub, trilha, tema e simulado são derivados do currículo:
    // a data deles seria a do build, que é o defeito de origem.
    const forasteiras = sitemap()
      .filter(e => e.lastModified !== undefined && !e.url.includes('/aprenda/'));
    expect(forasteiras.map(e => e.url)).toEqual([]);
  });
});
