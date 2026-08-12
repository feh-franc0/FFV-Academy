import '@testing-library/jest-dom/vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { BlockRenderer } from '@/components/article/BlockRenderer';
import { AWS_SERVICES } from '@/components/article/AwsIcon';

/**
 * Os testes de `AwsDiagram.test.tsx` provam que o componente funciona com dados
 * inventados no próprio arquivo. Isso não prova que os diagramas ESCRITOS
 * aparecem — e é exatamente essa distância que já custou caro nesta base: bloco
 * que falha o Zod volta `null` e some da página sem erro; adapter que não lê uma
 * chave renderiza a caixa vazia; ícone fora do catálogo vira cubo cinza.
 *
 * Aqui os dados vêm dos seeds de verdade. Se alguém escrever um diagrama com a
 * forma errada, ou mexer no adapter de um jeito que engula um campo, o texto
 * simplesmente não estará na tela e este teste falha — em vez de o defeito
 * chegar ao leitor como uma figura pela metade.
 */

const SEEDS = join(process.cwd(), '..', 'scripts', 'seeds', 'articles');

type No = { id: string; service: string; label?: string; note?: string };
type Grupo = { label?: string; kind?: string; nodes: No[] };
type Passo = { label: string; detail?: string; nodes?: string[]; edges?: string[] };
type Diagrama = { title: string; caption?: string; groups: Grupo[]; steps?: Passo[] };
type Bloco = { type: string; data: Diagrama; children?: Bloco[] };

// jsdom não implementa ResizeObserver — o componente o usa para medir arestas.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

function diagramasDe(slug: string): Bloco[] {
  const doc = JSON.parse(readFileSync(join(SEEDS, `${slug}.json`), 'utf-8'));
  const achados: Bloco[] = [];
  const andar = (bs: Bloco[]) => {
    for (const b of bs) {
      if (b.type === 'arch_diagram' || b.type === 'aws_diagram') achados.push(b);
      andar(b.children ?? []);
    }
  };
  andar(doc.blocks);
  return achados;
}

/** Todos os diagramas de todos os seeds, achatados. */
function todosOsDiagramas(): { slug: string; bloco: Bloco }[] {
  return readdirSync(SEEDS)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => {
      const slug = f.replace(/\.json$/, '');
      return diagramasDe(slug).map((bloco) => ({ slug, bloco }));
    });
}

describe('diagramas escritos nos seeds chegam à tela', () => {
  // Amostra deliberada: um diagrama de cada trilha que ganhou desenho em
  // ago/2026, para cobrir formas diferentes (com e sem passos, com aresta
  // pontilhada, com nó de conceito e de serviço AWS).
  const AMOSTRA = [
    'opentelemetry-stack',
    'sagas-2pc',
    'feature-stores-feast',
    'cdc-com-debezium',
    'dynamodb-design-patterns',
    'multi-agent-systems',
    'grpo-deepseek-r1',
  ];

  it.each(AMOSTRA)('%s — título, legenda e rótulos aparecem', (slug) => {
    const [bloco] = diagramasDe(slug);
    expect(bloco, `${slug} deveria ter um diagrama`).toBeDefined();

    const { container } = render(
      <BlockRenderer block={{ id: 'x', position: 0, ...bloco } as never} />,
    );

    // Bloco que falha o schema volta `null`: o sintoma é container vazio.
    expect(container.textContent).not.toBe('');

    const data = bloco.data;
    expect(screen.getByText(data.title)).toBeInTheDocument();
    if (data.caption) expect(screen.getByText(data.caption)).toBeInTheDocument();

    // Todo nó com rótulo próprio precisa estar visível: rótulo escrito e não
    // renderizado é o defeito que nenhum gate de validade pega.
    for (const grupo of data.groups) {
      for (const no of grupo.nodes) {
        if (no.label) expect(screen.getAllByText(no.label).length).toBeGreaterThan(0);
      }
    }
  });

  it('todo nó de todo diagrama usa um ícone que existe no catálogo', () => {
    const desconhecidos = new Map<string, string>();
    for (const { slug, bloco } of todosOsDiagramas()) {
      for (const grupo of bloco.data.groups ?? []) {
        for (const no of grupo.nodes ?? []) {
          if (no.service && !(no.service in AWS_SERVICES)) {
            desconhecidos.set(no.service, slug);
          }
        }
      }
    }
    // `serviceDef` tem fallback silencioso — chave errada vira cubo cinza sem
    // erro nenhum. Foi assim que 148 nós renderizaram na cor errada até ago/2026.
    expect(
      Object.fromEntries(desconhecidos),
      'chaves fora do catálogo caem no ícone genérico',
    ).toEqual({});
  });

  it('nenhum passo referencia nó que não existe no diagrama', () => {
    const quebrados: string[] = [];
    for (const { slug, bloco } of todosOsDiagramas()) {
      const data = bloco.data;
      const ids = new Set<string>(
        (data.groups ?? []).flatMap((g) => (g.nodes ?? []).map((n) => n.id)),
      );
      for (const passo of data.steps ?? []) {
        for (const id of passo.nodes ?? []) {
          if (!ids.has(id)) quebrados.push(`${slug}: passo "${passo.label}" → nó "${id}"`);
        }
      }
    }
    // O adapter filtra silenciosamente: o passo continua na tela, só não destaca
    // nada. Um passo que não acende nó nenhum é pior que passo ausente.
    expect(quebrados).toEqual([]);
  });
});
