/**
 * Playlists curadas — integridade referencial e estabilidade.
 */

import { describe, it, expect } from 'vitest';
import { PLAYLISTS, resolvePlaylist, getPlaylist } from '../../lib/playlists';
import { CURRICULUM } from '../../lib/curriculum';

describe('PLAYLISTS — integridade', () => {
  it('todas as playlists têm id, título, emoji, color e pelo menos 1 slug', () => {
    for (const pl of PLAYLISTS) {
      expect(pl.id).toMatch(/^[a-z0-9-]+$/);
      expect(pl.title.length).toBeGreaterThan(0);
      expect(pl.emoji.length).toBeGreaterThan(0);
      expect(pl.color).toMatch(/^#/);
      expect(pl.moduleSlugs.length).toBeGreaterThan(0);
    }
  });

  it('ids são únicos', () => {
    const ids = PLAYLISTS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todos os slugs referenciados existem no CURRICULUM', () => {
    const allSlugs = new Set(CURRICULUM.flatMap(t => t.modules.map(m => m.slug)));
    for (const pl of PLAYLISTS) {
      for (const slug of pl.moduleSlugs) {
        expect(allSlugs.has(slug)).toBe(true);
      }
    }
  });
});

describe('resolvePlaylist', () => {
  it('anexa trailName/trailColor a cada módulo resolvido', () => {
    const pl = PLAYLISTS[0];
    const modules = resolvePlaylist(pl);
    expect(modules.length).toBeGreaterThan(0);
    for (const m of modules) {
      expect(m.trailName).toBeTruthy();
      expect(m.trailColor).toBeTruthy();
    }
  });

  it('dropa silenciosamente slugs inexistentes', () => {
    const fake = { ...PLAYLISTS[0], moduleSlugs: [...PLAYLISTS[0].moduleSlugs, 'slug-zzz-inexistente'] };
    const modules = resolvePlaylist(fake);
    expect(modules.length).toBe(PLAYLISTS[0].moduleSlugs.length);
    expect(modules.find(m => m.slug === 'slug-zzz-inexistente')).toBeUndefined();
  });
});

describe('getPlaylist', () => {
  it('retorna a playlist por id', () => {
    const pl = PLAYLISTS[0];
    expect(getPlaylist(pl.id)?.id).toBe(pl.id);
  });

  it('retorna undefined para id desconhecido', () => {
    expect(getPlaylist('xxxx')).toBeUndefined();
  });
});
