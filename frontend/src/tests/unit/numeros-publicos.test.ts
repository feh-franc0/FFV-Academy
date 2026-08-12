import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CURRICULUM, HUBS } from '@/lib/curriculum';
import manifesto from '@/lib/content-manifest.json';

/**
 * Número que o site anuncia sobre si mesmo tem de ser o número real.
 *
 * ## O defeito real
 *
 * Em 05/ago/2026, o `og:image` do site — a imagem que TODO link compartilhado
 * exibe — anunciava **"17 trilhas"** e **"570+ módulos"**. O real era 40 e 426.
 * O `og:description` e o `twitter:description` do layout raiz diziam 17 também.
 *
 * Errado nas duas direções, o que é pior que errado numa: o catálogo tinha
 * crescido em trilhas (17 → 40) e encolhido em módulos no pivô de julho
 * (570 → 426). Ninguém percebeu porque número em string não tem quem o verifique
 * — e é conteúdo de marketing, que é justamente o que menos passa por revisão
 * técnica.
 *
 * ## Por que o teste tem esta forma
 *
 * O layout raiz NÃO pode importar o currículo — `layout-sem-curriculo.test.ts`
 * proíbe, porque é código que toda rota carrega. Então o número fica escrito à
 * mão no arquivo e a verdade é imposta aqui, em CI, onde ler o currículo inteiro
 * não custa nada ao usuário.
 *
 * O teste é deliberadamente TOLERANTE com a redação: ele extrai `N trilhas` e
 * `N módulos` por regex e compara o número. Reescrever a frase continua livre;
 * mentir sobre a contagem, não.
 */

const APP = join(process.cwd(), 'src', 'app');

const REAIS = {
  trilhas: CURRICULUM.length,
  modulos: manifesto.slugs.length,
  hubs: HUBS.length,
};

/**
 * Varre `src/app` e `src/components` inteiros em vez de manter uma lista.
 *
 * A lição é do próprio `sitemap.ts`: "lista escrita à mão sempre apodrece". Uma
 * lista de vitrines provaria que os dois arquivos que eu já conheço estão certos
 * — e é justamente o arquivo que eu não conheço que vai anunciar 570 módulos no
 * ano que vem.
 */
const RAIZES = [
  join(process.cwd(), 'src', 'app'),
  join(process.cwd(), 'src', 'components'),
  // As descrições de trilha aparecem na página de hub e na de trilha — são texto
  // público. `trail-bedrock` dizia "31 módulos" com 32.
  join(process.cwd(), 'src', 'lib', 'curriculum', 'trails'),
];

/**
 * Contagem que NÃO é do catálogo, com o motivo. Sem esta lista o teste acusaria
 * a meta diária ("10 módulos por dia") e o tamanho da playlist ("5-10 módulos"),
 * que são configuração de produto e não afirmação sobre o acervo.
 */
const EXCECOES: Record<string, string> = {
  'components/OnboardingModal.tsx':
    'meta diária e tamanho de playlist — configuração do usuário, não contagem do acervo',
};

/**
 * Remove comentário antes de casar — e não é detalhe: a primeira execução deste
 * teste acusou os DOIS arquivos por causa dos comentários que eu mesmo escrevi
 * ao consertar, que citam os números antigos ("Diziam 17 trilhas quando havia
 * 40"). Gate que acusa a própria documentação do conserto ensina a apagar a
 * documentação. É a mesma lição já registrada em `sem-ramo-por-ambiente.test.ts`.
 */
function semComentario(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, ' ')
    .replace(/\/\/.*$/gm, ' ');
}

function arquivos(dir: string): string[] {
  const achados: string[] = [];
  for (const e of readdirSync(dir)) {
    const caminho = join(dir, e);
    if (statSync(caminho).isDirectory()) achados.push(...arquivos(caminho));
    else if (/\.(tsx|ts)$/.test(e)) achados.push(caminho);
  }
  return achados;
}

/**
 * "Top 10 trilhas (30d)" é ranking, não contagem de acervo — e o painel de admin
 * tem dois desses. Excluir por prefixo é melhor que exceção por arquivo: a regra
 * vale para qualquer painel futuro, e não autoriza o resto do arquivo.
 */
const RANKING = /\b(top|as|os|primeir[oa]s|últim[oa]s)\s*$/i;

function numerosDe(src: string, unidade: 'trilhas' | 'módulos' | 'artigos' | 'hubs'): number[] {
  const limpo = semComentario(src);
  const re = new RegExp(`(\\d+)\\+?\\s*${unidade}`, 'gi');
  const achados: number[] = [];
  for (const m of limpo.matchAll(re)) {
    const antes = limpo.slice(Math.max(0, m.index - 24), m.index);
    if (RANKING.test(antes)) continue;
    achados.push(Number(m[1]));
  }
  return achados;
}

describe('números que o site anuncia sobre si', () => {
  it('o currículo tem os números que este teste usa como verdade', () => {
    // Guarda contra o teste virar tautologia se o currículo esvaziar.
    expect(REAIS.trilhas).toBeGreaterThan(30);
    expect(REAIS.modulos).toBeGreaterThan(400);
    // 5 hubs desde a consolidação de ago/2026 (eram 7; `dados` e `programacao`
    // foram absorvidos). O piso é 4 para pegar remoção acidental sem travar fusão
    // deliberada de hub, que é decisão editorial e não regressão.
    expect(REAIS.hubs).toBeGreaterThanOrEqual(4);
  });

  it('nenhum arquivo de app ou componente anuncia contagem defasada', () => {
    const errados: string[] = [];

    for (const raiz of RAIZES) {
      for (const caminho of arquivos(raiz)) {
        const rel = caminho.slice(caminho.indexOf(`${sep}src${sep}`) + 5).split(sep).join('/');
        if (EXCECOES[rel]) continue;
        const limpo = semComentario(readFileSync(caminho, 'utf8'));

        /**
         * Arquivo que fala de UMA trilha conta os módulos DELA, e "32 módulos" ali
         * é correto mesmo com 426 no acervo. Comparar contra o total acusaria a
         * contagem certa — o erro que a primeira versão deste teste cometeu.
         *
         * Quem cobra esses é o teste dedicado logo abaixo, contra
         * `t.modules.length`. Aqui eles só saem do escopo global de módulos.
         */
        const falaDeUmaTrilha =
          rel.startsWith('lib/curriculum/trails/') ||
          /CURRICULUM\.find\(\s*t\s*=>\s*t\.id\s*===/.test(limpo);

        for (const n of numerosDe(limpo, 'trilhas')) {
          // Tolera arredondamento para baixo com "+": "30+ trilhas" com 40 é honesto.
          const comMais = new RegExp(`${n}\\+\\s*trilhas`, 'i').test(limpo);
          if (!(n === REAIS.trilhas || (comMais && n <= REAIS.trilhas))) {
            errados.push(`${rel}: diz "${n} trilhas", são ${REAIS.trilhas}`);
          }
        }
        for (const n of falaDeUmaTrilha ? [] : numerosDe(limpo, 'módulos')) {
          const comMais = new RegExp(`${n}\\+\\s*módulos`, 'i').test(limpo);
          if (!(n === REAIS.modulos || (comMais && n <= REAIS.modulos))) {
            errados.push(`${rel}: diz "${n} módulos", são ${REAIS.modulos}`);
          }
        }
        for (const n of falaDeUmaTrilha ? [] : numerosDe(limpo, 'artigos')) {
          const comMais = new RegExp(`${n}\\+\\s*artigos`, 'i').test(limpo);
          if (!(n === REAIS.modulos || (comMais && n <= REAIS.modulos))) {
            errados.push(`${rel}: diz "${n} artigos", são ${REAIS.modulos}`);
          }
        }
        for (const n of numerosDe(limpo, 'hubs')) {
          if (n !== REAIS.hubs) errados.push(`${rel}: diz "${n} hubs", são ${REAIS.hubs}`);
        }
      }
    }

    expect(errados, 'número anunciado ao público que não corresponde ao currículo').toEqual([]);
  });

  it('a imagem social da raiz cita trilhas e módulos — senão não há o que verificar', () => {
    // Sem esta checagem, apagar as frases faria o teste acima passar vazio: zero
    // afirmações produz zero divergências, e o gate viraria decoração.
    const src = semComentario(readFileSync(join(APP, 'opengraph-image.tsx'), 'utf8'));
    expect(src).toMatch(/\d+\s*trilhas/i);
    expect(src).toMatch(/\d+\+?\s*módulos/i);
  });


  it('descrição de trilha que cita número de módulos cita o número certo', () => {
    // Este é o caso em que a contagem NÃO é global: cada trilha fala de si. Por
    // isso a comparação é contra `t.modules.length`, não contra o total.
    const erradas = CURRICULUM.flatMap(t => {
      const m = /(\d+)\s*m[óo]dulos/i.exec(t.desc);
      if (!m) return [];
      const n = Number(m[1]);
      const comMais = /\d+\+\s*m[óo]dulos/i.test(t.desc);
      const ok = n === t.modules.length || (comMais && n <= t.modules.length);
      return ok ? [] : [`${t.id}: desc diz ${n}, a trilha tem ${t.modules.length}`];
    });
    expect(erradas).toEqual([]);
  });

  it('toda exceção aponta para arquivo existente', () => {
    // Exceção órfã autoriza silenciosamente um arquivo que já não existe.
    for (const rel of Object.keys(EXCECOES)) {
      expect(existsSync(join(process.cwd(), 'src', rel)), `exceção órfã: ${rel}`).toBe(true);
    }
  });
});
