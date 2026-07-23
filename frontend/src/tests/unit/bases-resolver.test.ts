import { describe, it, expect } from 'vitest';
import { resolveBaseConfig } from '@/lib/bases/resolver';

describe('resolveBaseConfig', () => {
  it('rotas marketing retornam isMarketing=true e base=null', () => {
    for (const p of ['/', '/sobre', '/comunidade', '/newsletter', '/bases']) {
      const r = resolveBaseConfig(p);
      expect(r.isMarketing).toBe(true);
      expect(r.base).toBeNull();
      expect(r.isAppGlobal).toBe(false);
    }
  });

  it('/tecnologia e subrotas resolvem para a base tech', () => {
    const r = resolveBaseConfig('/tecnologia');
    expect(r.isMarketing).toBe(false);
    expect(r.base?.slug).toBe('tecnologia');

    const r2 = resolveBaseConfig('/tecnologia/algum-modulo');
    expect(r2.base?.slug).toBe('tecnologia');
  });

  it('/medicina-veterinaria e subrotas resolvem para medvet', () => {
    const r = resolveBaseConfig('/medicina-veterinaria');
    expect(r.base?.slug).toBe('medicina-veterinaria');

    const r2 = resolveBaseConfig('/medicina-veterinaria/genetica-de-populacoes');
    expect(r2.base?.slug).toBe('medicina-veterinaria');
  });

  it('rotas tech legadas (/ia, /aws, /aprenda) caem em tech', () => {
    for (const p of ['/ia', '/aws/cloud-practitioner', '/aprenda/postgresql-mvcc', '/engenharia']) {
      const r = resolveBaseConfig(p);
      expect(r.base?.slug).toBe('tecnologia');
    }
  });

  it('rotas globais de app (/progresso, /ranking, /revisar) usam tech como fallback mas marcam isAppGlobal', () => {
    const r = resolveBaseConfig('/progresso');
    expect(r.isAppGlobal).toBe(true);
    expect(r.base?.slug).toBe('tecnologia');
  });

  it('rotas com trailing slash normalizam corretamente', () => {
    const a = resolveBaseConfig('/medicina-veterinaria/');
    const b = resolveBaseConfig('/medicina-veterinaria');
    expect(a.base?.slug).toBe(b.base?.slug);
  });

  it('rotas desconhecidas caem no default (tech) marcadas como app-global', () => {
    const r = resolveBaseConfig('/uma-rota-que-nao-existe');
    expect(r.isAppGlobal).toBe(true);
    expect(r.base?.slug).toBe('tecnologia');
  });
});
