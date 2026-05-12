/**
 * Integridade cruzada estrita:
 * - Todo prerequisites/nextSuggested em MÓDULO aponta para slug de módulo válido
 * - Todo prerequisites em TRILHA aponta para id de trilha válido
 * - Toda página em /aprenda tem entrada correspondente no CURRICULUM
 * - Todo nextSlug em page.tsx aponta para um slug do CURRICULUM
 */
import { describe, it, expect } from 'vitest';
import { CURRICULUM } from '@/lib/curriculum';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const APRENDA_DIR = join(process.cwd(), 'src/app/aprenda');

describe('Curriculum cross-references — integridade referencial', () => {
  const allSlugs = new Set(CURRICULUM.flatMap(t => t.modules.map(m => m.slug)));
  const allTrailIds = new Set(CURRICULUM.map(t => t.id));

  it('todo prerequisites de MÓDULO aponta para slug existente', () => {
    const broken: string[] = [];
    for (const trail of CURRICULUM) {
      for (const m of trail.modules) {
        for (const ref of m.prerequisites ?? []) {
          if (!allSlugs.has(ref)) broken.push(`${trail.id}/${m.slug} → prereq '${ref}'`);
        }
      }
    }
    expect(broken, `${broken.length} prereqs de módulo quebrados:\n${broken.join('\n')}`).toEqual([]);
  });

  it('todo nextSuggested de MÓDULO aponta para slug existente', () => {
    const broken: string[] = [];
    for (const trail of CURRICULUM) {
      for (const m of trail.modules) {
        for (const ref of m.nextSuggested ?? []) {
          if (!allSlugs.has(ref)) broken.push(`${trail.id}/${m.slug} → next '${ref}'`);
        }
      }
    }
    expect(broken, `${broken.length} nextSuggested de módulo quebrados:\n${broken.join('\n')}`).toEqual([]);
  });

  it('todo prerequisites de TRILHA aponta para trail.id ou slug de módulo existente', () => {
    const broken: string[] = [];
    for (const trail of CURRICULUM) {
      const tp = (trail as { prerequisites?: string[] }).prerequisites;
      for (const ref of tp ?? []) {
        if (!allTrailIds.has(ref) && !allSlugs.has(ref)) {
          broken.push(`${trail.id} → trail prereq '${ref}'`);
        }
      }
    }
    expect(broken, `${broken.length} prereqs de trilha quebrados:\n${broken.join('\n')}`).toEqual([]);
  });

  it('toda página em /aprenda corresponde a um slug do currículo (sem órfãs)', () => {
    const dirs = readdirSync(APRENDA_DIR, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name);
    const orphans = dirs.filter(d => !allSlugs.has(d));
    expect(orphans, `${orphans.length} páginas órfãs:\n${orphans.join('\n')}`).toEqual([]);
  });

  it('todo nextSlug em page.tsx aponta para slug existente', () => {
    const broken: { page: string; ref: string }[] = [];
    const dirs = readdirSync(APRENDA_DIR, { withFileTypes: true }).filter(e => e.isDirectory());
    for (const d of dirs) {
      const p = join(APRENDA_DIR, d.name, 'page.tsx');
      if (!existsSync(p)) continue;
      const text = readFileSync(p, 'utf8');
      const re = /nextSlug=["']([^"']+)["']/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        if (!allSlugs.has(m[1])) broken.push({ page: d.name, ref: m[1] });
      }
    }
    expect(broken, `${broken.length} nextSlug quebrados:\n${broken.map(b => `${b.page} → ${b.ref}`).join('\n')}`).toEqual([]);
  });
});
