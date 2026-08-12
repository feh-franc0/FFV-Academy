import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Contraste das variáveis de paleta, medido nos DOIS temas.
 *
 * Este teste existe porque o defeito era da variável, não do componente. Em
 * 07/ago/2026, cinco cores do tema claro ficavam entre 4,17:1 e 4,45:1 como
 * texto — logo abaixo do mínimo — e eram a causa raiz dos 308 nós de contraste
 * que sobravam depois de aplicar `.ffv-acento-texto` nas páginas de listagem.
 *
 * A varredura mede o resultado no HTML servido, com teto por rota. Aqui a
 * medição é da FONTE, sem teto: variável de texto abaixo de 4,5:1 reprova, e não
 * há dívida aceitável — porque consertar a variável conserta todos os usos de uma
 * vez, incluindo os que ainda não existem.
 */

const CSS = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf-8');

function luminancia(hex: string): number {
  const h = hex.replace('#', '');
  const canal = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
}

function razao(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/**
 * Lê as variáveis de um bloco do CSS. O bloco importa: o mesmo nome tem valor
 * diferente no escuro e no claro, e medir a mistura dos dois daria um número que
 * não corresponde a nenhuma tela.
 */
function variaveisDoBloco(seletor: string): Record<string, string> {
  const i = CSS.indexOf(seletor);
  expect(i, `bloco "${seletor}" não encontrado em globals.css`).toBeGreaterThan(-1);
  const fim = CSS.indexOf('\n}', i);
  const bloco = CSS.slice(i, fim);
  const achados: Record<string, string> = {};
  for (const m of bloco.matchAll(/--(ffv-[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    achados[m[1]] = m[2];
  }
  return achados;
}

/**
 * Variáveis que servem de cor de TEXTO. `border` fica fora de propósito: ele é
 * cor de borda (1,22:1 no claro, 1,25:1 no escuro), e clareá-lo para virar texto
 * legível destruiria a função dele. Usá-lo como texto é o defeito do
 * `DecisionBox`, e a correção é trocar a variável no componente.
 */
const DE_TEXTO = [
  'ffv-blue', 'ffv-green', 'ffv-purple', 'ffv-orange', 'ffv-red',
  'ffv-yellow', 'ffv-muted',
];

/** Os três fundos de PÁGINA de cada tema. */
const FUNDOS = ['ffv-bg', 'ffv-bg2', 'ffv-bg3'];

/**
 * As tintas usadas na base: `color-mix(in srgb, var(--ffv-X) N%, transparent)`
 * como fundo de chip, com a cor por cima.
 *
 * Medir só os fundos de página deixou 67 nós de contraste de pé depois da primeira
 * correção — e todos com a mesma medida. `/explorar` tinha 61 nós de `#0964cf`
 * sobre `#dae6f5`, que não é fundo de página nenhum: é a tinta de 12% do próprio
 * azul. Ela é mais CLARA que `--ffv-bg3`, então o pior caso real ficava fora da
 * conta e a paleta passava no teste e reprovava na tela.
 */
/*
 * O escopo importa tanto quanto a régua. A base usa `color-mix` de 4% a 96%, mas
 * acima de ~20% a tinta é BORDA ou brilho, nunca fundo de texto — exigir 4,5:1
 * sobre uma tinta de 96% faria o fator explodir sem corrigir nada real. As duas
 * abaixo são as que o axe acusou, sobre `--ffv-bg` e `--ffv-bg2`.
 *
 * Este teste é o piso na FONTE. A medição autoritativa de qualquer combinação de
 * fundo continua sendo o axe sobre o build servido.
 */
const TINTAS = [12, 14];

/** `color-mix(in srgb, cor N%, transparent)` composto sobre um fundo opaco. */
function compor(cor: string, pct: number, fundo: string): string {
  const canais = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [cr, cg, cb] = canais(cor);
  const [fr, fg, fb] = canais(fundo);
  const a = pct / 100;
  const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${hex(cr * a + fr * (1 - a))}${hex(cg * a + fg * (1 - a))}${hex(cb * a + fb * (1 - a))}`;
}

/**
 * Os seletores exatos, e a razão de não serem `:root {`.
 *
 * O bloco escuro é `:root,\n:root[data-theme="dark"] {` — os dois seletores
 * juntos, e é essa forma que faz o escuro valer sem JavaScript. Procurar
 * `:root {` casa um bloco POSTERIOR do arquivo (uma regra de `@media print`), e
 * a primeira versão deste teste mediu variáveis que não existem lá.
 */
describe.each([
  ['tema escuro (padrão)', ':root,\n:root[data-theme="dark"] {'],
  ['tema claro (opt-in)', ':root[data-theme="light"] {'],
])('%s — variável de texto atinge 4,5:1', (_nome, seletor) => {
  const vars = variaveisDoBloco(seletor);

  it.each(DE_TEXTO)('--%s', (nome) => {
    const cor = vars[nome];
    expect(cor, `--${nome} não declarada em "${seletor}"`).toBeDefined();

    // 21 fundos: os 3 de página, mais as 3 tintas da própria cor sobre cada um
    // (a mesma cor sobre um chip tingido dela mesma é o caso mais frequente na
    // base, e o que a primeira medição deixou de fora).
    const medidas = [
      ...FUNDOS.map(f => ({ nome: `--${f}`, fundo: vars[f] })),
      // Chip tingido assenta sobre `bg` ou `bg2`; sobre `bg3` não ocorre na base.
      ...TINTAS.flatMap(t => ['ffv-bg', 'ffv-bg2'].map(f => ({
        nome: `tinta ${t}% sobre --${f}`,
        fundo: compor(cor, t, vars[f]),
      }))),
    ].map(x => ({ ...x, r: razao(cor, x.fundo) }));
    const pior = medidas.reduce((a, b) => (a.r < b.r ? a : b));

    expect(
      pior.r,
      `--${nome} (${cor}) mede ${pior.r.toFixed(2)}:1 sobre ${pior.nome} ` +
      `(${pior.fundo}). Corrija a VARIÁVEL, não o componente: quem usa é o desenho ` +
      `inteiro, e ajustar ponto de uso deixa o próximo nascer errado.`,
    ).toBeGreaterThanOrEqual(4.5);
  });
});

describe('a ordem dos temas continua falhando em segurança', () => {
  it('o bloco padrão é o ESCURO, e o claro é opt-in por data-theme', () => {
    // `data-theme` só existe depois do script de tema, que precisa de JavaScript.
    // Se o padrão fosse o claro, a primeira pintura sem JS daria texto claro sobre
    // fundo escuro. Medido na primeira versão do utilitário de acento: 7,49:1
    // caiu para 2,87:1.
    const iPadrao = CSS.indexOf(':root,\n:root[data-theme="dark"] {');
    const iClaro = CSS.indexOf(':root[data-theme="light"] {');
    expect(
      iPadrao,
      'o escuro tem de estar em `:root, :root[data-theme="dark"]` — com o `:root` ' +
      'nu, que é o que vale antes do script de tema rodar',
    ).toBeGreaterThan(-1);
    expect(iClaro, 'o claro tem de vir DEPOIS, como opt-in').toBeGreaterThan(iPadrao);

    const padrao = variaveisDoBloco(':root,\n:root[data-theme="dark"] {');
    expect(
      padrao['ffv-bg'],
      'o fundo do bloco padrão tem de ser o escuro — sem JS, é ele que vale',
    ).toBe('#0d1117');
  });
});

describe('cor de borda não é cor de texto', () => {
  it('nenhum componente pinta texto com --ffv-border', async () => {
    // O caso medido: `DecisionBox` usava `color: var(--ffv-border)` no rótulo
    // `Alt:` — 1,34:1 em tema claro, num rótulo que carrega significado. O `<p>`
    // pai já era `--ffv-muted`; o span existia para apagar mais, e apagou até
    // desaparecer.
    const { globSync } = await import('node:fs');
    const arquivos = globSync('src/**/*.tsx', { cwd: process.cwd() }) as string[];
    const culpados: string[] = [];
    for (const rel of arquivos) {
      const src = readFileSync(join(process.cwd(), rel), 'utf-8');
      for (const m of src.matchAll(/color:\s*'var\(--ffv-border\)'/g)) {
        const linha = src.slice(0, m.index).split('\n').length;
        culpados.push(`${rel}:${linha}`);
      }
    }
    expect(
      culpados,
      'use --ffv-muted, que é a variável de texto de menor ênfase (5,24:1 no claro, ' +
      '4,95:1 no escuro). --ffv-border mede 1,22:1 e existe para desenhar linha.',
    ).toEqual([]);
  });
});

describe('cor de identidade como texto passa pelo utilitário', () => {
  /**
   * O gate que fecha a porta. A dívida de contraste caiu de 479 para 308 nós em
   * 07/ago/2026 aplicando `.ffv-acento-texto` onde ele faltava — e voltaria pelo
   * mesmo caminho, porque `style={{ color: trail.color }}` é o que qualquer pessoa
   * escreve primeiro. Ele não produz erro nem aviso: só um texto com 1,57:1 a
   * 4,35:1 em tema claro, que quem desenvolve no escuro nunca vê.
   *
   * A regra vale para TEXTO. Em `background`, `border` ou gradiente a mesma cor é
   * permitida direta: WCAG de contraste de texto não se aplica ali, e passar pelo
   * utilitário mudaria o desenho sem motivo.
   */
  it('nenhum componente escreve style={{ color: X.color }} sem o utilitário', async () => {
    const { globSync } = await import('node:fs');
    const arquivos = (globSync('src/**/*.tsx', { cwd: process.cwd() }) as string[])
      // `opengraph-image.tsx` roda no runtime do `next/og`, que NÃO carrega CSS:
      // o utilitário não existe lá, e a cor tem de ir direta na prop.
      .filter(f => !f.endsWith('opengraph-image.tsx'));

    const culpados: string[] = [];
    for (const rel of arquivos) {
      const src = readFileSync(join(process.cwd(), rel), 'utf-8');
      // `[\s\S]*?` cobre `style` quebrado em várias linhas — havia um caso assim
      // em `HubPageClient.tsx:615`, que a versão de linha única deixou passar.
      for (const m of src.matchAll(/style=\{\{[\s\S]{0,80}?\bcolor:\s*([A-Za-z_][\w]*(?:\.[\w]+)*\.(?:color|cor))\s*[,}]/g)) {
        const linha = src.slice(0, m.index).split('\n').length;
        culpados.push(`${rel}:${linha} → ${m[1]}`);
      }
    }
    expect(
      culpados,
      "troque por: className=\"… ffv-acento-texto\" e " +
      "style={{ '--ffv-acento': cor } as React.CSSProperties}. As paletas de " +
      'trilha/hub/tema/nível vêm da linhagem GitHub dark: 41 das 43 cores medem ' +
      'entre 1,57:1 e 4,35:1 como texto sobre fundo claro.',
    ).toEqual([]);
  });
});

describe('branco sobre fundo acentuado (controle, não texto de categoria)', () => {
  /**
   * Complementa o describe acima, que trata cor de categoria como TEXTO. Este
   * aqui é o defeito irmão medido em 10/ago/2026: ~35 controles primários
   * (botão "Fazer login", "Comentar", os dois CTAs de captação da home) com
   * `background: var(--ffv-blue)`/`--ffv-red`/gradiente dos dois e
   * `color: 'white'`/`'#fff'` — 2,5:1 medido, porque `--ffv-blue` no tema
   * escuro (padrão) é uma cor CLARA (#58a6ff), pensada para texto sobre fundo
   * escuro, não para ser ela mesma o fundo de um texto branco.
   *
   * O par correto é `var(--primary-foreground)`, que inverte por tema junto
   * com a variável de acento (ver `tema-falha-em-seguranca` acima): claro no
   * tema claro (onde `--ffv-blue` fica escuro, #0969da), escuro no tema
   * escuro (onde `--ffv-blue` fica claro, #58a6ff) — os dois medem acima de
   * 4,5:1, verificado em `readable-text.test.ts` para a paleta de
   * trilha/hub/certificação, que é hex fixo e por isso NÃO pode usar este
   * token (ver `src/lib/readable-text.ts`).
   */
  it('nenhum background var(--ffv-*) usa color literal branco', async () => {
    const { globSync } = await import('node:fs');
    const arquivos = (globSync('src/**/*.tsx', { cwd: process.cwd() }) as string[])
      .filter(f => !f.endsWith('opengraph-image.tsx'));

    const culpados: string[] = [];
    for (const rel of arquivos) {
      const src = readFileSync(join(process.cwd(), rel), 'utf-8');
      // Janela generosa: o `background` (var direta ou gradiente com var
      // dentro) e o `color` costumam ficar em linhas separadas do mesmo
      // style={{}}, às vezes com outras props entre os dois.
      for (const m of src.matchAll(
        /style=\{\{[\s\S]{0,10}background:\s*['"][^'"]*var\(--ffv-(?:blue|red|purple|gold|green|orange|yellow)\)[^'"]*['"][\s\S]{0,120}?\bcolor:\s*['"](#fff\b|#ffffff|white)['"]/gi,
      )) {
        const linha = src.slice(0, m.index).split('\n').length;
        culpados.push(`${rel}:${linha}`);
      }
    }
    expect(
      culpados,
      "branco sobre acento claro não se lê (2,5:1). Troque color por " +
      "'var(--primary-foreground)'.",
    ).toEqual([]);
  });
});
