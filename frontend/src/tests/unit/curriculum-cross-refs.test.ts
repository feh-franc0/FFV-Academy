/**
 * Integridade cruzada do CURRICULUM (fonte de verdade dos slugs).
 *
 * Pós-migração CMS, os artigos vivem no backend (não como arquivos .tsx).
 * Este teste cobre só as cross-refs internas do CURRICULUM. A integridade
 * "todo slug do currículo está no banco" é validada pela suíte de auditoria
 * gated em CMS_AUDIT=1 (src/tests/integration/cms-backend-audit.test.ts).
 */
import { describe, it, expect } from 'vitest';
import { CURRICULUM } from '@/lib/curriculum';

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
});
