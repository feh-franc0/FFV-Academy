/**
 * Playlists curadas — jornadas pré-montadas atravessando múltiplas trilhas.
 *
 * Cada playlist agrupa módulos específicos pra um perfil ("já sei Python, quero IA",
 * "Cloud Architect"). Não substitui trilhas; complementa com um recorte
 * orientado a objetivo.
 *
 * O DADO (`PLAYLISTS`) mora em `playlists-data.ts`, sem dependência do
 * currículo — só `resolvePlaylist`, abaixo, precisa de `CURRICULUM` completo
 * (~92 KB gz), para expandir slugs em módulos reais com trilha/cor/href.
 */

import { CURRICULUM, type Module, type Trail } from './curriculum';
import { PLAYLISTS, type Playlist } from './playlists-data';

export { PLAYLISTS };
export type { Playlist };

export interface ResolvedPlaylistModule extends Module {
  trailName: string;
  trailColor: string;
  trailHref?: string;
}

/** Resolve uma playlist em módulos reais do currículo (drop slugs não encontrados). */
export function resolvePlaylist(playlist: Playlist): ResolvedPlaylistModule[] {
  const out: ResolvedPlaylistModule[] = [];
  for (const slug of playlist.moduleSlugs) {
    let found: { mod: Module; trail: Trail } | null = null;
    for (const trail of CURRICULUM) {
      const mod = trail.modules.find(m => m.slug === slug);
      if (mod) { found = { mod, trail }; break; }
    }
    if (!found) continue;
    out.push({
      ...found.mod,
      trailName: found.trail.name,
      trailColor: found.trail.color,
      trailHref: found.trail.href,
    });
  }
  return out;
}

export function getPlaylist(id: string): Playlist | undefined {
  return PLAYLISTS.find(p => p.id === id);
}
