import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { BLOCK_DATA_SCHEMAS, BlockTypeSchema } from '@/components/article/blocks/schemas';

/**
 * Gate de conteúdo: todo bloco de todo seed precisa passar o schema Zod.
 *
 * Por que isso importa mais do que parece: quando `safeParse` falha, o
 * BlockRenderer devolve `null` e loga um `console.warn` no servidor. O bloco
 * simplesmente não aparece na página. Não há erro, não há tela vermelha, não há
 * nada no navegador — o leitor perde um parágrafo, uma tabela ou uma seção
 * inteira e ninguém fica sabendo.
 *
 * Foi assim que 8 blocos ficaram invisíveis em produção em 7 módulos: duas
 * tabelas com 7 colunas (o cap era 6), quatro com o cabeçalho de canto vazio
 * (`columns[0] === ''`) e dois callouts sem `content`. Nenhum teste pegou porque
 * os testes cobriam os componentes, não o conteúdo que o CMS entrega a eles.
 *
 * Este teste lê os seeds do disco — a mesma fonte que o importer Go carrega
 * para o Postgres. Se ele passa, nenhum bloco desaparece calado.
 */

const SEEDS = join(process.cwd(), '..', 'scripts', 'seeds', 'articles');

type Bloco = { type: string; data?: unknown; children?: Bloco[] };

function achatar(blocos: Bloco[] | undefined, caminho: string): { bloco: Bloco; caminho: string }[] {
  return (blocos ?? []).flatMap((bloco, i) => [
    { bloco, caminho: `${caminho}[${i}]` },
    ...achatar(bloco.children, `${caminho}[${i}].children`),
  ]);
}

const arquivos = readdirSync(SEEDS)
  .filter(f => f.endsWith('.json') && !f.startsWith('_'))
  .sort();

const todos = arquivos.flatMap(arquivo => {
  const slug = arquivo.replace(/\.json$/, '');
  const doc = JSON.parse(readFileSync(join(SEEDS, arquivo), 'utf8')) as { blocks?: Bloco[] };
  return achatar(doc.blocks, 'blocks').map(({ bloco, caminho }) => ({ slug, caminho, bloco }));
});

describe('seeds de conteúdo × schemas de bloco', () => {
  it('existem seeds para validar (protege contra path errado passar vazio)', () => {
    expect(arquivos.length).toBeGreaterThan(300);
    expect(todos.length).toBeGreaterThan(5000);
  });

  it('todo tipo de bloco usado está declarado no BlockTypeSchema', () => {
    const desconhecidos = [
      ...new Set(
        todos
          .filter(({ bloco }) => !BlockTypeSchema.safeParse(bloco.type).success)
          .map(({ slug, bloco }) => `${slug}: ${bloco.type}`),
      ),
    ];
    expect(desconhecidos).toEqual([]);
  });

  it('todo tipo de bloco usado tem schema de data registrado', () => {
    const semSchema = [
      ...new Set(
        todos
          .filter(({ bloco }) => !(bloco.type in BLOCK_DATA_SCHEMAS))
          .map(({ bloco }) => bloco.type),
      ),
    ];
    expect(semSchema).toEqual([]);
  });

  it('todo bloco passa o schema — bloco inválido vira null e desaparece da página', () => {
    const falhas: string[] = [];

    for (const { slug, caminho, bloco } of todos) {
      const schema = BLOCK_DATA_SCHEMAS[bloco.type as keyof typeof BLOCK_DATA_SCHEMAS];
      if (!schema) continue; // coberto pelo teste acima

      const r = schema.safeParse(bloco.data ?? {});
      if (!r.success) {
        const motivo = r.error.issues
          .slice(0, 2)
          .map(i => `${i.path.join('.') || '(raiz)'}: ${i.message}`)
          .join(' | ');
        falhas.push(`${slug} ${caminho} [${bloco.type}] → ${motivo}`);
      }
    }

    expect(falhas).toEqual([]);
  });

  it('os tipos que já têm schema real não voltam a ser PassthroughObject', () => {
    // Até ago/2026, oito tipos estavam registrados como PassthroughObject
    // enquanto existia, no mesmo arquivo, um schema com a forma ERRADA — que
    // nenhum adapter consumia. Consequência: escrever um bloco na forma
    // declarada não era rejeitado; ele renderizava com os campos vazios. Falha
    // silenciosa, no arquivo onde um autor vai procurar o contrato.
    //
    // Este teste trava a correção. Se alguém devolver um destes tipos a
    // passthrough, a proteção desaparece sem nada quebrar — exatamente o modo de
    // falha que este projeto já pagou três vezes.
    const comSchemaReal = [
      'decision_box', 'flow_diagram', 'arch_flow', 'matrix_diagram',
      'stack_flow', 'timeline', 'node_graph', 'annotated_formula',
    ] as const;

    const frouxos = comSchemaReal.filter(tipo => {
      const schema = BLOCK_DATA_SCHEMAS[tipo];
      if (!schema) return true;
      // PassthroughObject aceita objeto vazio; um schema real desses tipos exige
      // ao menos um campo obrigatório, então o objeto vazio tem de falhar.
      return schema.safeParse({}).success;
    });

    expect(frouxos).toEqual([]);
  });
});
