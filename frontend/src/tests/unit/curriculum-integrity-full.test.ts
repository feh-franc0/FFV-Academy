/**
 * Full-curriculum integrity — cobre TODO o CURRICULUM (não só sprints).
 * Trava dois buracos que smoke tests estruturais não pegam:
 *  (a) todo `nextSuggested` aponta para slug que existe
 *  (b) todo módulo do catálogo tem arquivo `src/app/aprenda/<slug>/page.tsx`
 */

import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { CURRICULUM } from '../../lib/curriculum';

const allSlugs = new Set(CURRICULUM.flatMap(t => t.modules.map(m => m.slug)));
const allModules = CURRICULUM.flatMap(t => t.modules.map(m => ({ trailId: t.id, ...m })));

describe('Curriculum integrity — links e arquivos', () => {
  it('todo nextSuggested aponta pra slug existente', () => {
    const broken: string[] = [];
    for (const m of allModules) {
      const next = m.nextSuggested;
      if (!next) continue;
      for (const slug of next) {
        if (!allSlugs.has(slug)) broken.push(`${m.trailId}/${m.slug} → ${slug}`);
      }
    }
    expect(broken, `nextSuggested quebrado:\n${broken.join('\n')}`).toEqual([]);
  });

  it('todo prerequisites aponta pra slug existente', () => {
    const broken: string[] = [];
    for (const m of allModules) {
      const prereq = m.prerequisites;
      if (!prereq) continue;
      for (const slug of prereq) {
        if (!allSlugs.has(slug)) broken.push(`${m.trailId}/${m.slug} prereq → ${slug}`);
      }
    }
    expect(broken, `prerequisites quebrado:\n${broken.join('\n')}`).toEqual([]);
  });

  it('todo módulo tem arquivo src/app/aprenda/<slug>/page.tsx', () => {
    const root = resolve(__dirname, '../../..');
    const missing: string[] = [];
    for (const m of allModules) {
      const path = resolve(root, 'src/app/aprenda', m.slug, 'page.tsx');
      if (!existsSync(path)) missing.push(`${m.trailId}/${m.slug}`);
    }
    expect(missing, `artigos faltando (${missing.length}):\n${missing.join('\n')}`).toEqual([]);
  });

  it('toda trail com href tem landing page em src/app/<href>/page.tsx', () => {
    const root = resolve(__dirname, '../../..');
    const missing: string[] = [];
    for (const t of CURRICULUM) {
      if (!t.href) continue;
      const route = t.href.replace(/^\//, '');
      const path = resolve(root, 'src/app', route, 'page.tsx');
      if (!existsSync(path)) missing.push(`${t.id} → ${t.href}`);
    }
    expect(missing, `landings faltando:\n${missing.join('\n')}`).toEqual([]);
  });

  it('todo módulo tem XP > 0 e readTime > 0', () => {
    const bad = allModules.filter(m => m.xp <= 0 || m.readTime <= 0);
    expect(bad.map(m => m.slug)).toEqual([]);
  });

  it('zero ciclos em nextSuggested dentro da mesma trail', () => {
    const cycles: string[] = [];
    for (const trail of CURRICULUM) {
      const bySlug = new Map(trail.modules.map(m => [m.slug, m]));
      for (const start of trail.modules) {
        const seen = new Set<string>();
        let cur: string | undefined = start.slug;
        let steps = 0;
        while (cur && steps < trail.modules.length + 1) {
          if (seen.has(cur)) { cycles.push(`${trail.id}: ${start.slug} → ... → ${cur}`); break; }
          seen.add(cur);
          const mod = bySlug.get(cur);
          cur = mod?.nextSuggested?.[0];
          steps++;
        }
      }
    }
    expect(cycles, `ciclos:\n${cycles.join('\n')}`).toEqual([]);
  });
});
