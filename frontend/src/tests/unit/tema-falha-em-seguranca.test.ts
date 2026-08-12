import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Regra de tema tem de falhar em SEGURANÇA quando `data-theme` não existe.
 *
 * ## O defeito real — e ele foi meu, no conserto de acessibilidade
 *
 * O utilitário `.ffv-acento-texto` nasceu escurecendo por padrão e restaurando a
 * cor viva em `:root[data-theme="dark"]`. Parece simétrico e não é: neste arquivo
 * o tema ESCURO é o padrão (`:root, :root[data-theme="dark"]`), e `data-theme` só
 * aparece depois do script de tema — que precisa de JavaScript.
 *
 * Medido com JS desligado, em 06/ago/2026: `data-theme` nulo, fundo `#0d1117` e o
 * acento escurecido para `#325F91`. **O contraste caiu de 7,49:1 para 2,87:1** —
 * eu havia trocado um defeito de tema claro por um pior no tema padrão.
 *
 * ## A regra que este teste impõe
 *
 * Valor que serve ao tema ESCURO é o padrão; o ajuste de tema claro é opt-in por
 * `[data-theme="light"]`. Assim, ausência de `data-theme` — JS desligado, script
 * bloqueado por CSP, falha de rede no primeiro paint — cai no escuro, que é o que
 * o resto do arquivo já assume.
 *
 * O teste é de FORMA, sobre o CSS: seletor `[data-theme="dark"]` que só existe
 * para DESFAZER um padrão de tema claro é a assinatura do defeito.
 */

const CSS = join(process.cwd(), 'src', 'app', 'globals.css');

/**
 * Comentário FORA antes de casar. O comentário do próprio utilitário contém o
 * exemplo de uso em JSX — `style={{ '--ffv-acento': cor }}` — e essas chaves
 * quebram qualquer parser ingênuo de regra CSS. A primeira versão deste teste
 * reprovou por isso, não por defeito no CSS. Terceira vez nesta base que um gate
 * casa com a documentação em vez do código.
 */
function semComentario(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

/** Corpo de cada regra cujo seletor casa com o padrão dado. */
function regras(cssBruto: string, seletor: RegExp): { seletor: string; corpo: string }[] {
  const css = semComentario(cssBruto);
  const achadas: { seletor: string; corpo: string }[] = [];
  // Suficiente para as regras chatas deste arquivo: sem aninhamento de bloco.
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = m[1].trim();
    if (seletor.test(sel)) achadas.push({ seletor: sel, corpo: m[2] });
  }
  return achadas;
}

describe('tema: o padrão é o escuro, e o claro é opt-in', () => {
  const css = readFileSync(CSS, 'utf8');

  it('o utilitário de acento existe e tem as duas regras', () => {
    // Sem esta guarda, apagar o utilitário faria as checagens abaixo passar vazias.
    const base = regras(css, /^\.ffv-acento-texto$/);
    const claro = regras(css, /\[data-theme="light"\]\s+\.ffv-acento-texto/);
    expect(base, 'regra base de .ffv-acento-texto ausente').toHaveLength(1);
    expect(claro, 'regra de tema claro de .ffv-acento-texto ausente').toHaveLength(1);
  });

  it('a regra BASE do acento entrega a cor viva, não a escurecida', () => {
    // É a regra que vale quando `data-theme` não existe — e aí o fundo é escuro.
    const [base] = regras(css, /^\.ffv-acento-texto$/);
    expect(base.corpo).toMatch(/color:\s*var\(--ffv-acento/);
    expect(
      base.corpo,
      'a base não pode escurecer: sem `data-theme` o fundo é escuro (contraste caiu ' +
      'de 7,49:1 para 2,87:1 quando isto aconteceu)',
    ).not.toMatch(/color-mix/);
  });

  it('o escurecimento é opt-in pelo tema claro', () => {
    const [claro] = regras(css, /\[data-theme="light"\]\s+\.ffv-acento-texto/);
    expect(claro.corpo).toMatch(/color-mix\(in srgb, var\(--ffv-acento/);
    // O fator é calculado, não escolhido: 57% é o menor que leva as 43 cores de
    // acento a 4,5:1 contra `#ffffff` e `#f6f8fa`. Mudá-lo exige recalcular.
    expect(claro.corpo).toMatch(/57%/);
  });

  it('todo uso de .ffv-acento-texto define --ffv-acento', () => {
    /**
     * O utilitário tem `var(--ffv-acento, currentColor)` como valor. O fallback
     * existe para não pintar `transparent` se a variável faltar — mas se ela
     * faltar em tema claro, o resultado é `currentColor` escurecido 57%, ou seja
     * o texto normal fica mais escuro sem motivo. É silencioso: nada quebra.
     *
     * CSS não tem como exigir a variável, então a exigência vive aqui.
     */
    const arquivos: string[] = [];
    const andar = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const caminho = join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name === 'tests' || e.name === 'node_modules') continue;
          andar(caminho);
        } else if (/\.tsx$/.test(e.name)) arquivos.push(caminho);
      }
    };
    andar(join(process.cwd(), 'src'));

    const semVar: string[] = [];
    let usos = 0;
    for (const caminho of arquivos) {
      const src = readFileSync(caminho, 'utf8');
      if (!src.includes('ffv-acento-texto')) continue;
      // Cada elemento que usa a classe precisa declarar a variável por perto.
      for (const m of src.matchAll(/ffv-acento-texto/g)) {
        usos++;
        const janela = src.slice(m.index, m.index + 400);
        if (!janela.includes('--ffv-acento')) {
          const linha = src.slice(0, m.index).split('\n').length;
          semVar.push(`${caminho.split('/src/')[1]}:${linha}`);
        }
      }
    }
    expect(usos, 'ninguém usa o utilitário — ele foi aplicado?').toBeGreaterThan(0);
    expect(semVar, 'uso de .ffv-acento-texto sem definir --ffv-acento').toEqual([]);
  });

  it('nenhum seletor de tema escuro existe só para desfazer um padrão de tema claro', () => {
    /**
     * A assinatura do defeito, generalizada: uma regra `[data-theme="dark"] X`
     * cujo par sem seletor de tema define a MESMA propriedade. Isso significa que
     * o padrão foi escrito para o tema claro e o escuro o corrige — invertido em
     * relação ao resto do arquivo, e frágil quando `data-theme` falta.
     *
     * As definições de variável em `:root[data-theme="dark"]` não contam: aquele
     * bloco é o próprio padrão, declarado junto de `:root`.
     */
     const suspeitos: string[] = [];
    for (const { seletor, corpo } of regras(css, /\[data-theme="dark"\]\s+\S/)) {
      const alvo = seletor.replace(/^.*\[data-theme="dark"\]\s+/, '').trim();
      const props = [...corpo.matchAll(/([a-z-]+)\s*:/g)].map(m => m[1]);
      const base = regras(css, new RegExp(`^${alvo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
      if (!base.length) continue;
      for (const p of props) {
        if (new RegExp(`${p}\\s*:`).test(base[0].corpo)) {
          suspeitos.push(`${seletor} desfaz "${p}" do padrão "${alvo}"`);
        }
      }
    }
    expect(
      suspeitos,
      'escreva o padrão para o tema ESCURO e trate o claro como opt-in — sem ' +
      '`data-theme` (JS desligado) o fundo é escuro',
    ).toEqual([]);
  });
});
