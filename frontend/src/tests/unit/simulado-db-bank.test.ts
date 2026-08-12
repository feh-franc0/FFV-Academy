import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';

const APP = join(process.cwd(), 'src', 'app');

/**
 * A rota resolve para uma página real? Aceita segmento dinâmico (`[slug]`) —
 * sem isso, `/simulados/aws-aif/estudo`, servida por
 * `simulados/[slug]/estudo/page.tsx`, seria acusada de 404 por engano. Mesmo
 * ajudante de `rotas-retiradas.test.ts`, para os dois testes não divergirem.
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
 * A ponte entre o catálogo e o banco de questões no Postgres.
 *
 * ## O defeito que isto impede de voltar
 *
 * O catálogo usa ids históricos (`simulado-aws-practitioner`); o banco usa os
 * ids da tabela `certs` do gerador (`aws-clf`). Até 09/ago/2026 o
 * `SimuladoRunner` consultava a API com o id do CATÁLOGO: a query
 * `simulado_id = $1` voltava vazia SEM erro, e o fluxo cronometrado mostrava
 * "banco vazio" com 1.015 questões no banco. Nenhum tipo pega, porque os dois
 * ids são strings válidas — a ponte precisa ser declarada e cobrada.
 */
describe('ponte catálogo → banco de questões', () => {
  const semInline = SIMULADOS_CATALOG.filter(s => s.questions.length === 0 && !s.comingSoon);

  it('todo simulado sem questões inline declara dbBankId', () => {
    const sem = semInline.filter(s => !s.dbBankId).map(s => s.id);
    expect(sem, 'simulado servido pelo Postgres sem a ponte de id — o runner consultaria vazio').toEqual([]);
  });

  it('todo dbBankId existe na tabela `certs` do gerador de migration', () => {
    // A tabela Go é a fonte: prefixo/simulado_id novos entram lá primeiro.
    const go = readFileSync(
      join(process.cwd(), '..', 'backend', 'cmd', 'gen-seed-migration', 'main.go'),
      'utf-8',
    );
    const bloco = go.match(/var certs = \[\]cert\{([\s\S]*?)\n\}/);
    expect(bloco, 'tabela `certs` não encontrada — se renomeou, ajuste este teste junto').toBeTruthy();
    const ids = [...bloco![1].matchAll(/\{"[a-z0-9-]+", "([a-z0-9-]+)"/g)].map(m => m[1]);
    expect(ids.length).toBeGreaterThan(0);
    for (const s of semInline) {
      expect(ids, `${s.id}: dbBankId "${s.dbBankId}" não existe no gerador — as questões nunca chegariam ao banco`).toContain(s.dbBankId!);
    }
  });

  it('nenhum simulado anuncia studyModeUrl para rota que não existe', () => {
    const quebrados = SIMULADOS_CATALOG.filter(s => s.studyModeUrl && !rotaExiste(s.studyModeUrl))
      .map(s => `${s.id} -> ${s.studyModeUrl}`);
    expect(quebrados, 'studyModeUrl apontando para 404 — a AIF fez isso até ago/2026').toEqual([]);
  });

  it('todo simulado com studyModeUrl tem dbBankId — a página de estudo não teria o que buscar', () => {
    const sem = SIMULADOS_CATALOG.filter(s => s.studyModeUrl && !s.dbBankId).map(s => s.id);
    expect(sem).toEqual([]);
  });
});
