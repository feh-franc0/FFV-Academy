import '@testing-library/jest-dom/vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { BlockRenderer } from '@/components/article/BlockRenderer';
import { BLOCK_DATA_SCHEMAS } from '@/components/article/blocks/schemas';

/**
 * Cobertura do 2º elo da cadeia de render, dirigida pelos seeds reais.
 *
 *     seed JSON  →  adapter  →  primitive  →  tela
 *                ↑           ↑
 *   validate_primitives_render.py    ESTE TESTE + validate_adapter_primitive.py
 *
 * Três defeitos da mesma família atravessaram esse elo sem que nada reclamasse,
 * porque cada um mantinha o bloco VÁLIDO — o Zod passava, o adapter rodava, e o
 * texto escrito pelo autor simplesmente não chegava à tela:
 *
 *     decision_box       82 de 391 alternativas, 120 módulos  (`downside` não lido)
 *     annotated_formula  148 de 197 anotações, 19 módulos      (`symbol`/`description`)
 *     stack_flow         282 de 367 itens                       (`text` vs `detail`)
 *
 * Escrever 25 testes à mão não resolveria: quem escreve o teste do primitive
 * passa props tipadas e acerta o nome por construção. O que pega o defeito é
 * usar o shape REAL do conteúdo e afirmar que a prosa escrita aparece.
 *
 * Por isso a lista de tipos não é escrita aqui: ela sai de `BLOCK_DATA_SCHEMAS`.
 * Tipo novo entra na cobertura no commit em que nasce, sem ninguém lembrar.
 */

const SEEDS = join(process.cwd(), '..', 'scripts', 'seeds', 'articles');

type Bloco = { type: string; data: Record<string, unknown>; children?: Bloco[] };

// jsdom não implementa ResizeObserver — `AwsDiagram` o usa para medir arestas.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

/**
 * Chaves que carregam ESTRUTURA, não texto para o leitor.
 *
 * Cada uma tem de estar aqui por um motivo verificável, senão a lista se torna o
 * lugar onde o defeito se esconde: bastaria acrescentar `downside` para o teste
 * parar de acusar o defeito que ele existe para pegar.
 */
const CHAVES_ESTRUTURAIS = new Set([
  'id',           // identificador de nó, referenciado por aresta e passo
  'service',      // chave do catálogo de ícones — coberto por diagramas-de-seed
  'kind',         // plain|vpc|region|account — vira classe, não texto
  'variant',      // tom do callout, vira cor
  'orientation',  // horizontal|vertical, vira layout
  'tone',         // vira cor
  'color',        // vira cor
  'from', 'to',   // extremos de aresta, referenciam `id`
  'nodes', 'edges',  // referências de passo, viram destaque visual
  'lang', 'language',  // linguagem do bloco de código, vira atributo
  'src',          // URL de imagem, vira atributo
  'ordered',      // ol vs ul
  'highlight',    // booleano de ênfase
  'separatorAfter',
  'style',        // sólido|pontilhado na aresta
  'position', 'type', 'level',
  'weight',       // peso de domínio de exame — número em string
  'icon',         // emoji, some no textContent normalizado
]);

/**
 * Um valor é PROSA quando foi escrito para o leitor ler.
 *
 * O corte em espaço + 12 caracteres é o que separa `"pool de conexão esgotado"`
 * de `"ecs"` e de `"#f59e0b"`. Identificador não tem espaço; cor tampouco.
 */
function ehProsa(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length >= 12 && /\s/.test(v.trim());
}

/** Toda prosa escrita dentro do bloco, com o caminho até ela. */
function prosaDe(data: unknown, caminho = ''): { caminho: string; texto: string }[] {
  if (ehProsa(data)) return [{ caminho: caminho || '(raiz)', texto: data.trim() }];
  if (Array.isArray(data)) {
    return data.flatMap((v, i) => prosaDe(v, `${caminho}[${i}]`));
  }
  if (data && typeof data === 'object') {
    return Object.entries(data).flatMap(([k, v]) =>
      CHAVES_ESTRUTURAIS.has(k) ? [] : prosaDe(v, caminho ? `${caminho}.${k}` : k),
    );
  }
  return [];
}

function normalizar(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** Índice tipo de bloco → blocos reais, com o slug de origem. */
function indexarSeeds(): Map<string, { slug: string; bloco: Bloco }[]> {
  const indice = new Map<string, { slug: string; bloco: Bloco }[]>();
  for (const arquivo of readdirSync(SEEDS).filter((f) => f.endsWith('.json')).sort()) {
    const slug = arquivo.replace(/\.json$/, '');
    const doc = JSON.parse(readFileSync(join(SEEDS, arquivo), 'utf-8'));
    const andar = (bs: Bloco[]) => {
      for (const b of bs ?? []) {
        if (!indice.has(b.type)) indice.set(b.type, []);
        indice.get(b.type)!.push({ slug, bloco: b });
        andar(b.children ?? []);
      }
    };
    andar(doc.blocks);
  }
  return indice;
}

const INDICE = indexarSeeds();
const TIPOS = Object.keys(BLOCK_DATA_SCHEMAS).sort();

/**
 * Tipo registrado no schema e sem nenhuma ocorrência nos seeds.
 *
 * Não é falha: `aws_diagram` é alias legado mantido de propósito (sem ele, um
 * seed antigo cairia em "no schema" e o bloco desapareceria), e `image` existe
 * para conteúdo vindo do admin. Mas cada um precisa de motivo escrito — tipo sem
 * uso e sem motivo é código morto que finge estar coberto.
 */
const SEM_SEED: Record<string, string> = {
  aws_diagram: 'alias legado de arch_diagram; mantido para seed antigo não sumir da página',
  image: 'bloco criado pelo editor do admin, não por seed — coberto pelo schema Zod',
};

describe('cobertura de render por tipo de bloco', () => {
  it('todo tipo de BLOCK_DATA_SCHEMAS tem seed real ou motivo escrito', () => {
    const descobertos = TIPOS.filter((t) => !INDICE.has(t) && !(t in SEM_SEED));
    expect(
      descobertos,
      'tipo registrado, sem conteúdo e sem motivo — declare em SEM_SEED com o porquê',
    ).toEqual([]);
  });

  it('nenhum bloco escrito nos seeds usa tipo sem schema registrado', () => {
    // Tipo sem schema cai no `console.warn` e renderiza cru; tipo sem ADAPTER
    // volta `null` e o bloco DESAPARECE da página sem erro. É a falha mais
    // perigosa desta base, e é silenciosa nas duas pontas.
    const orfaos = [...INDICE.keys()].filter((t) => !(t in BLOCK_DATA_SCHEMAS)).sort();
    expect(orfaos).toEqual([]);
  });

  it('imprime a cobertura medida, para a proporção ficar visível', () => {
    const linhas = TIPOS.map((t) => {
      const ocorrencias = INDICE.get(t) ?? [];
      const modulos = new Set(ocorrencias.map((o) => o.slug)).size;
      return `${t.padEnd(20)} ${String(ocorrencias.length).padStart(5)} blocos  ${String(modulos).padStart(3)} módulos`;
    });
    // eslint-disable-next-line no-console -- o número medido é o produto deste teste
    console.log(`\ncobertura de blocos (${TIPOS.length} tipos):\n${linhas.join('\n')}`);
    expect(TIPOS.length).toBeGreaterThan(20);
  });
});

/**
 * A amostra por tipo: 6 blocos de módulos distintos, em ordem estável.
 *
 * Módulos distintos importa mais que quantidade — dez `decision_box` do mesmo
 * seed exercitam um único jeito de escrever. Ordem estável importa porque teste
 * que amostra ao acaso falha em dias alternados e ninguém confia nele.
 */
function amostraDe(tipo: string, n = 6): { slug: string; bloco: Bloco }[] {
  const todos = INDICE.get(tipo) ?? [];
  const vistos = new Set<string>();
  const amostra: { slug: string; bloco: Bloco }[] = [];
  for (const o of todos) {
    if (vistos.has(o.slug)) continue;
    vistos.add(o.slug);
    amostra.push(o);
    if (amostra.length >= n) break;
  }
  // Faltando módulos distintos, completa com repetição do mesmo — melhor
  // exercitar duas vezes o mesmo seed que deixar o tipo sem teste.
  for (const o of todos) {
    if (amostra.length >= n) break;
    if (!amostra.includes(o)) amostra.push(o);
  }
  return amostra;
}

/**
 * `quiz` sai da varredura estática porque a explicação **existe e está correta**,
 * só não aparece antes de responder — ela vive no ramo `submitted` do
 * `QuizBlock`. Isto já foi diagnosticado errado uma vez nesta base: a conclusão
 * "a explicação não renderiza" veio de uma checagem que parou antes do botão
 * *Responder*. O app estava certo; a medição estava incompleta.
 *
 * Então em vez de excluir o campo, o teste abaixo clica e afirma. Excluir
 * deixaria sem cobertura justamente a parte que mais ensina.
 */
const TIPOS_COM_SEED = TIPOS.filter((t) => INDICE.has(t) && t !== 'quiz');

describe.each(TIPOS_COM_SEED)('bloco `%s` — o que foi escrito chega à tela', (tipo) => {
  const amostra = amostraDe(tipo);

  it.each(amostra.map((a, i) => [i, a.slug, a.bloco] as const))(
    '#%i em %s',
    (_i, slug, bloco) => {
      const { container } = render(
        <BlockRenderer block={{ id: 'x', position: 0, ...bloco } as never} />,
      );

      // Bloco que falha o Zod volta `null`: o sintoma é container vazio, e é
      // assim que o defeito chega ao leitor — sem erro nenhum.
      const naTela = normalizar(container.textContent ?? '');
      expect(naTela, `${slug}: bloco \`${tipo}\` renderizou vazio`).not.toBe('');

      // O núcleo: toda prosa escrita no bloco tem de estar visível. É a
      // afirmação que os três defeitos de ago/2026 violavam.
      const ausentes = prosaDe(bloco.data)
        .filter(({ texto }) => !naTela.includes(normalizar(texto)))
        .map(({ caminho, texto }) => `${caminho}: "${texto.slice(0, 70)}"`);

      expect(
        ausentes,
        `${slug}: campos escritos que não chegaram à tela — o adapter entrega uma ` +
          `chave que o primitive não lê, ou o primitive descarta o valor`,
      ).toEqual([]);
    },
  );
});

describe('bloco `quiz` — a explicação chega à tela depois de responder', () => {
  const amostra = amostraDe('quiz', 6);

  it.each(amostra.map((a, i) => [i, a.slug, a.bloco] as const))(
    '#%i em %s',
    async (_i, slug, bloco) => {
      const { container } = render(
        <BlockRenderer block={{ id: 'x', position: 0, ...bloco } as never} />,
      );

      const pergunta = (bloco.data as { question?: string }).question ?? '';
      expect(normalizar(container.textContent ?? '')).toContain(normalizar(pergunta));

      // O seletor correto é `[role="radio"]`. Adivinhar o seletor já devolveu
      // 0 alternativas nesta base e produziu o diagnóstico errado de que as
      // alternativas não renderizavam.
      const alternativas = container.querySelectorAll('[role="radio"]');
      const opcoes = (bloco.data as { options?: string[] }).options ?? [];
      expect(alternativas.length).toBe(opcoes.length);

      // `fireEvent`, não `.click()` cru: o clique direto no nó não passa pelo
      // `act()` e o estado do React não é processado — o componente fica no
      // ramo anterior e o teste conclui, errado, que a explicação não renderiza.
      fireEvent.click(alternativas[0] as HTMLElement);
      const botao = [...container.querySelectorAll('button')].find(
        (b) => normalizar(b.textContent ?? '') === 'Responder',
      );
      expect(botao, `${slug}: botão Responder não encontrado`).toBeDefined();
      fireEvent.click(botao!);

      const explicacao = (bloco.data as { explanation?: string }).explanation ?? '';
      if (ehProsa(explicacao)) {
        expect(
          normalizar(container.textContent ?? ''),
          `${slug}: explicação escrita e não exibida depois de responder`,
        ).toContain(normalizar(explicacao));
      }
    },
  );
});

describe('separador não fica pendurado quando falta o segundo texto', () => {
  /**
   * Pontuação que promete um texto ausente é o mesmo sinal que
   * `validate_texto_sem_lacuna.py` procura na prosa dos seeds. A diferença é que
   * ali quem escreve é o autor, e aqui quem produz é o componente — nenhum gate
   * de conteúdo alcança este caso.
   *
   * A regra é só sobre o **travessão**, e isso é decisão, não descuido. Dois
   * pontos no fim de um parágrafo que apresenta a lista seguinte é português
   * corrente — "A regra de ouro:" precede a regra. Reprovar isso produziria um
   * gate com dezenas de falsos positivos, e gate que erra é gate que se desliga.
   * O travessão pendurado não tem uso legítimo: ele junta duas partes, e sem a
   * segunda ele é o rastro de um campo que não chegou.
   *
   * Mede no ELEMENTO INTEIRO, não na folha: `<span>Alt: </span><span>nome</span>`
   * tem uma folha terminando em `:`, e o texto completo do pai lê "Alt: nome".
   */
  it('nenhum elemento renderizado termina em travessão', () => {
    const pendurados: string[] = [];
    for (const tipo of TIPOS_COM_SEED) {
      for (const { slug, bloco } of amostraDe(tipo, 10)) {
        const { container } = render(
          <BlockRenderer block={{ id: 'x', position: 0, ...bloco } as never} />,
        );
        for (const el of container.querySelectorAll('p, li, td, div, span')) {
          const t = normalizar(el.textContent ?? '');
          if (/[—–]$/.test(t) && t.length > 1) {
            pendurados.push(`${slug} (${tipo}): "${t.slice(-60)}"`);
          }
        }
      }
    }
    expect(
      [...new Set(pendurados)],
      'travessão anunciando texto que não veio — torne o separador condicional',
    ).toEqual([]);
  });
});
