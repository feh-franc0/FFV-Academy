import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { CURRICULUM, getTrailByHref } from '@/lib/curriculum';

/**
 * Página de trilha nunca pode renderizar a trilha errada.
 *
 * 16 páginas indexavam `CURRICULUM` por POSIÇÃO (`CURRICULUM[9]`). O pivot de
 * jul/2026 removeu 49 trilhas, os índices deslizaram, e **11 dessas páginas
 * passaram a exibir outra trilha sob o título correto** — `/observabilidade-sre`
 * mostrando "Claude Code: do zero ao poder total", `/sql-databases` mostrando
 * "Claude Code Pro", `/redes-web` mostrando "Security Engineering".
 *
 * Nada quebrava: HTTP 200, layout certo, conteúdo de outra coisa. É o tipo de
 * defeito que só um teste como este pega, porque não gera erro nenhum.
 */

const APP = join(process.cwd(), 'src', 'app');

describe('páginas de trilha', () => {
  it('nenhuma página indexa CURRICULUM por posição', () => {
    const infratores: string[] = [];
    const varrer = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const caminho = join(dir, e.name);
        if (e.isDirectory()) varrer(caminho);
        else if (e.name.endsWith('.tsx')) {
          const src = readFileSync(caminho, 'utf8');
          if (/CURRICULUM\[\d+\]/.test(src)) {
            infratores.push(caminho.replace(process.cwd() + '/', ''));
          }
        }
      }
    };
    varrer(APP);
    expect(
      infratores,
      'use getTrailByHref(rota) — índice numérico desliza quando trilha é removida',
    ).toEqual([]);
  });

  it('toda trilha com href tem página, e a página resolve para ela mesma', () => {
    const problemas: string[] = [];
    for (const trail of CURRICULUM) {
      if (!trail.href) continue;
      const dir = join(APP, trail.href.replace(/^\//, '').replace(/\/$/, ''));
      if (!existsSync(join(dir, 'page.tsx'))) {
        problemas.push(`${trail.name}: href ${trail.href} sem page.tsx`);
        continue;
      }
      const resolvida = getTrailByHref(trail.href);
      if (resolvida?.id !== trail.id) {
        problemas.push(
          `${trail.href} resolve para ${resolvida?.name ?? 'nada'}, deveria ser ${trail.name}`,
        );
      }
    }
    expect(problemas).toEqual([]);
  });

  it('getTrailByHref devolve undefined para rota sem trilha, em vez de chutar', () => {
    expect(getTrailByHref('/rota-que-nao-existe')).toBeUndefined();
    expect(getTrailByHref('/devops-containers')).toBeUndefined();
  });

  it('getTrailByHref tolera barra final', () => {
    const comBarra = getTrailByHref('/observabilidade-sre/');
    const semBarra = getTrailByHref('/observabilidade-sre');
    expect(comBarra?.id).toBe(semBarra?.id);
    expect(comBarra).toBeDefined();
  });
});
