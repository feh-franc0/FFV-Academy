import { describe, expect, it } from 'vitest';

import { MINIMO_PARA_PAGINA, TEMAS, getTemaStats } from '@/lib/curriculum/temas';
import { PERGUNTAS_POR_TEMA } from '@/lib/curriculum/temas-perguntas';

/**
 * O contrato de resposta citável.
 *
 * ## Por que um teste sobre a FORMA do texto
 *
 * A pesquisa de ago/2026 mediu o que faz um trecho ser citado por resumo de IA, e
 * não é qualidade percebida: é forma. Cabeçalho em pergunta, resposta imediata,
 * conclusão na primeira frase. Um texto excelente que começa em "Antes de
 * entender X, vale lembrar que…" tem o preâmbulo extraído em vez da resposta.
 *
 * Forma verificável merece gate. As regras abaixo são as que dá para checar por
 * máquina; a correção do conteúdo continua sendo revisão humana, e o teste não
 * finge o contrário.
 */

const PUBLICADOS = TEMAS.filter(t => getTemaStats(t.id).modules >= MINIMO_PARA_PAGINA);

/**
 * Aberturas que jogam a resposta para depois.
 *
 * Não é lista de estilo: cada uma desloca a conclusão para fora do primeiro
 * trecho, que é justamente o que é extraído. "Depende" entra porque, sozinho,
 * não responde — e a resposta de conformidade que começa com "Depende de três
 * coisas verificáveis" passa, porque nomeia de quê.
 */
const PREAMBULOS = [
  /^antes de\b/i,
  /^neste?\s+(artigo|módulo|tema)/i,
  /^vamos\b/i,
  /^é importante (lembrar|entender|notar)/i,
  /^existem?\s+(vários|muitas|muitos|várias)\b/i,
  /^(atualmente|hoje em dia|nos dias de hoje)\b/i,
  /^como sabemos\b/i,
  /^primeiro(,|\s+de tudo)/i,
  /^depende\.?$/i,
];

describe('cobertura', () => {
  it('todo tema publicado responde ao menos 3 perguntas', () => {
    const semResposta = PUBLICADOS.filter(t => (PERGUNTAS_POR_TEMA[t.id] ?? []).length < 3)
      .map(t => t.id);
    expect(semResposta, 'tema publicado sem 3 perguntas respondidas').toEqual([]);
  });

  it('não há perguntas para tema que não existe', () => {
    const ids = new Set(TEMAS.map(t => t.id));
    for (const chave of Object.keys(PERGUNTAS_POR_TEMA)) {
      expect(ids, `tema desconhecido: ${chave}`).toContain(chave);
    }
  });

  it('não há pergunta repetida entre temas', () => {
    // Duas páginas respondendo a mesma pergunta competem entre si pela mesma
    // consulta — e a que perde não deixa de existir, só dilui.
    const todas = Object.values(PERGUNTAS_POR_TEMA).flatMap(ps => ps ?? []).map(p => p.q);
    const vistas = new Map<string, number>();
    for (const q of todas) vistas.set(q, (vistas.get(q) ?? 0) + 1);
    expect([...vistas].filter(([, n]) => n > 1).map(([q]) => q)).toEqual([]);
  });
});

describe('forma da pergunta', () => {
  it('toda pergunta termina em interrogação', () => {
    for (const [tema, ps] of Object.entries(PERGUNTAS_POR_TEMA)) {
      for (const p of ps ?? []) {
        expect(p.q.trim().endsWith('?'), `${tema}: ${p.q}`).toBe(true);
      }
    }
  });

  it('a pergunta é uma consulta, não um título de seção', () => {
    for (const [tema, ps] of Object.entries(PERGUNTAS_POR_TEMA)) {
      for (const p of ps ?? []) {
        // Curta demais é rótulo, não consulta ("ETL ou ELT?" virou "ETL ou ELT:
        // qual usar no meu pipeline?"). Longa demais não é o que se digita.
        //
        // O piso NÃO exige as 6+ palavras que mais acionam resumo de IA: consulta
        // curta de comparação ("Postgres ou DynamoDB?") é real e tem volume. A
        // faixa de 6–10 palavras diz onde o resumo APARECE mais, não o que vale
        // responder — o conjunto certo mistura as duas.
        expect(p.q.length, `${tema}: ${p.q}`).toBeGreaterThanOrEqual(20);
        expect(p.q.length, `${tema}: ${p.q}`).toBeLessThanOrEqual(90);
      }
    }
  });
});

describe('forma da resposta', () => {
  it('toda resposta tem substância', () => {
    for (const [tema, ps] of Object.entries(PERGUNTAS_POR_TEMA)) {
      for (const p of ps ?? []) {
        // 180 é o mesmo piso do gerador de perguntas frequentes dos módulos.
        expect(p.a.length, `${tema}: "${p.q}" tem ${p.a.length} chars`).toBeGreaterThanOrEqual(180);
      }
    }
  });

  it('nenhuma resposta começa por preâmbulo', () => {
    const falhas: string[] = [];
    for (const [tema, ps] of Object.entries(PERGUNTAS_POR_TEMA)) {
      for (const p of ps ?? []) {
        if (PREAMBULOS.some(re => re.test(p.a.trim()))) falhas.push(`${tema}: ${p.q}`);
      }
    }
    expect(falhas, 'resposta que adia a conclusão não é citada').toEqual([]);
  });

  it('a primeira frase é uma afirmação, não um parágrafo', () => {
    for (const [tema, ps] of Object.entries(PERGUNTAS_POR_TEMA)) {
      for (const p of ps ?? []) {
        const primeira = /^[^.!?]+[.!?]/.exec(p.a)?.[0] ?? p.a;
        // O trecho extraído por resumo de IA é curto. Conclusão que só fecha
        // depois de 300 caracteres não cabe nele.
        expect(primeira.length, `${tema}: "${p.q}" → 1ª frase com ${primeira.length} chars`)
          .toBeLessThanOrEqual(300);
      }
    }
  });

  it('nenhuma resposta vaza identificador interno nem promete conteúdo', () => {
    for (const [tema, ps] of Object.entries(PERGUNTAS_POR_TEMA)) {
      for (const p of ps ?? []) {
        expect(p.a, tema).not.toMatch(/\btrail\d|\bhub-[a-z]/);
        // "Veja o módulo X" no lugar da resposta é a promessa em vez da resposta
        // — exatamente o que a estratégia existe para não fazer.
        expect(p.a, `${tema}: ${p.q}`).not.toMatch(/\b(veja|confira|leia) (o|a|nosso|nossa)\b/i);
      }
    }
  });
});
