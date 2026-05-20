import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_ENGAGEMENT,
  loadEngagement,
  clearEngagement,
  emit,
} from '@/lib/personalization/engagement-store';

describe('engagement-store', () => {
  beforeEach(() => window.localStorage.clear());

  it('loadEngagement retorna DEFAULT quando vazio', () => {
    expect(loadEngagement()).toEqual(DEFAULT_ENGAGEMENT);
  });

  it('emit visit_base incrementa contagem + atualiza lastAccess', () => {
    const now = new Date('2026-05-19T10:00:00Z');
    const snap = emit({ kind: 'visit_base', baseSlug: 'tecnologia' }, now);
    expect(snap.visitedBases['tecnologia']).toBe(1);
    expect(snap.lastAccessByBase['tecnologia']).toBe(now.toISOString());
  });

  it('emit múltiplas vezes acumula contagem', () => {
    emit({ kind: 'visit_base', baseSlug: 'tecnologia' });
    emit({ kind: 'visit_base', baseSlug: 'tecnologia' });
    emit({ kind: 'visit_base', baseSlug: 'tecnologia' });
    expect(loadEngagement().visitedBases['tecnologia']).toBe(3);
  });

  it('emit open_module incrementa openedModulesByBase', () => {
    const snap = emit({ kind: 'open_module', baseSlug: 'medicina-veterinaria', moduleSlug: 'mod-1' });
    expect(snap.openedModulesByBase['medicina-veterinaria']).toBe(1);
    expect(snap.lastAccessByBase['medicina-veterinaria']).toBeTruthy();
  });

  it('emit em bases diferentes mantém contagens isoladas', () => {
    emit({ kind: 'visit_base', baseSlug: 'tecnologia' });
    emit({ kind: 'visit_base', baseSlug: 'medicina-veterinaria' });
    emit({ kind: 'visit_base', baseSlug: 'tecnologia' });
    const snap = loadEngagement();
    expect(snap.visitedBases['tecnologia']).toBe(2);
    expect(snap.visitedBases['medicina-veterinaria']).toBe(1);
  });

  it('persiste entre chamadas (localStorage round-trip)', () => {
    emit({ kind: 'visit_base', baseSlug: 'x' });
    emit({ kind: 'open_module', baseSlug: 'x', moduleSlug: 'mod' });
    // Simula novo render: load do storage
    const snap = loadEngagement();
    expect(snap.visitedBases['x']).toBe(1);
    expect(snap.openedModulesByBase['x']).toBe(1);
  });

  it('clearEngagement zera tudo', () => {
    emit({ kind: 'visit_base', baseSlug: 'x' });
    clearEngagement();
    expect(loadEngagement()).toEqual(DEFAULT_ENGAGEMENT);
  });

  it('rejeita JSON corrompido + limpa storage', () => {
    window.localStorage.setItem('ffv_engagement_v1', '{not json');
    expect(loadEngagement()).toEqual(DEFAULT_ENGAGEMENT);
    expect(window.localStorage.getItem('ffv_engagement_v1')).toBeNull();
  });

  it('rejeita shape inválido (zod)', () => {
    window.localStorage.setItem(
      'ffv_engagement_v1',
      JSON.stringify({ visitedBases: 'not an object' }),
    );
    expect(loadEngagement()).toEqual(DEFAULT_ENGAGEMENT);
  });
});
