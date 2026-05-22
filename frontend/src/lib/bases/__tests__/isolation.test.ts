/**
 * Cross-base isolation tests
 *
 * Trava o invariante crítico da plataforma: dentro de uma base de conhecimento,
 * NENHUM link de nav/footer/simulado pode levar o usuário pra outra base.
 *
 * O usuário só pode "sair" da base por links GLOBAIS conhecidos (progresso,
 * ranking, revisar, perfil, ajustes…) ou pela landing (`/`).
 *
 * Quando adicionar uma base nova: registra em `BASE_REGISTRY` e estes testes
 * passam a rodar automaticamente contra ela. Se algum link vazar pra fora,
 * o teste falha indicando exatamente qual link e em qual base.
 */
import { describe, it, expect } from 'vitest';
import { BASE_REGISTRY, listBases } from '../registry';
import { resolveBaseConfig } from '../resolver';
import type { BaseConfig, FooterLinkItem, BaseNavItem } from '../types';

/**
 * Rotas globais — pertencem a TODAS as bases (perfil único do usuário,
 * gamificação cross-base, marketing). Linkar pra elas a partir de qualquer
 * base é OK.
 */
const GLOBAL_SAFE_PREFIXES = [
  '/',
  // Marketing
  '/sobre', '/comunidade', '/newsletter', '/bases', '/stats-publicas',
  // Perfil / gamificação cross-base
  '/progresso', '/ranking', '/revisar', '/preferencias', '/perfil',
  '/meu-aprendizado', '/diff-de-conhecimento', '/trilhas-espelho',
  // Conteúdo global / discovery
  '/news', '/search', '/explorar', '/glossario', '/playlists', '/roadmaps',
  '/mapa', '/cheatsheets', '/verificar',
];

/**
 * Prefixos extras considerados parte de uma base (rotas legadas que pertencem
 * à base mas não vivem sob `basePath`). HOJE só tech tem isso; bases novas
 * devem viver SOMENTE sob `basePath` e não precisam de entrada aqui.
 */
const EXTRA_BASE_PREFIXES: Record<string, string[]> = {
  tecnologia: [
    '/aprenda', '/simulados', '/ia', '/aws', '/engenharia',
    '/claude-anthropic', '/fundamentos', '/programacao', '/dados',
    '/construcao', '/seguranca-hardware-hacking',
    // Hubs do Profissional Digital — saíram do listing de /tecnologia mas
    // continuam compartilhando chrome/gamificação com a base default.
    '/carreira', '/comunicacao', '/marketing', '/conteudo',
    '/empreendedorismo', '/ingles',
  ],
};

function isExternalOrAnchor(href: string): boolean {
  return (
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('#')
  );
}

function matchesPrefix(href: string, prefix: string): boolean {
  if (href === prefix) return true;
  if (prefix === '/') return false; // só `/` exato conta como root
  return (
    href.startsWith(prefix + '/') ||
    href.startsWith(prefix + '#') ||
    href.startsWith(prefix + '?')
  );
}

function isLinkSafeForBase(href: string, base: BaseConfig): boolean {
  if (isExternalOrAnchor(href)) return true;
  if (href === base.basePath || matchesPrefix(href, base.basePath)) return true;

  const extras = EXTRA_BASE_PREFIXES[base.slug] ?? [];
  if (extras.some(p => matchesPrefix(href, p))) return true;

  return GLOBAL_SAFE_PREFIXES.some(p => href === p || matchesPrefix(href, p));
}

function collectAllLinks(base: BaseConfig): Array<{ source: string; item: FooterLinkItem | BaseNavItem }> {
  const links: Array<{ source: string; item: FooterLinkItem | BaseNavItem }> = [];
  base.footer.hubLinks.forEach(l => links.push({ source: 'footer.hubLinks', item: l }));
  base.footer.contentLinks.forEach(l => links.push({ source: 'footer.contentLinks', item: l }));
  base.footer.mobilePrimary.forEach(l => links.push({ source: 'footer.mobilePrimary', item: l }));
  (base.footer.socialLinks ?? []).forEach(l => links.push({ source: 'footer.socialLinks', item: l }));
  base.nav.hubNavItems.forEach(l => links.push({ source: 'nav.hubNavItems', item: l }));
  (base.simulados ?? []).forEach(l => links.push({ source: 'simulados', item: { label: l.title, href: l.href } }));
  return links;
}

describe('Cross-base isolation — BaseConfig invariants', () => {
  const bases = listBases();

  it('registry tem ao menos uma base', () => {
    expect(bases.length).toBeGreaterThanOrEqual(1);
  });

  describe.each(bases.map(b => [b.slug, b] as const))('base "%s"', (_slug, base) => {
    it('basePath começa com "/" e não termina com "/"', () => {
      expect(base.basePath.startsWith('/')).toBe(true);
      if (base.basePath !== '/') {
        expect(base.basePath.endsWith('/')).toBe(false);
      }
    });

    it('resolver(basePath) volta pra esta base', () => {
      const resolved = resolveBaseConfig(base.basePath);
      expect(resolved.base?.slug).toBe(base.slug);
    });

    it('resolver(basePath + "/<slug-qualquer>") volta pra esta base', () => {
      const resolved = resolveBaseConfig(`${base.basePath}/some-deep-module`);
      expect(resolved.base?.slug).toBe(base.slug);
    });

    it('TODOS os links de nav/footer/simulado ficam dentro da base ou em rota global', () => {
      const links = collectAllLinks(base);
      const violations = links
        .filter(({ item }) => !isLinkSafeForBase(item.href, base))
        .map(({ source, item }) => `${source}: "${item.label}" → ${item.href}`);

      expect(violations, `Links que vazam para outra base em "${base.slug}":\n  - ${violations.join('\n  - ')}`).toEqual([]);
    });

    it('hubNavItems não duplicam href', () => {
      const hrefs = base.nav.hubNavItems.map(i => i.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    });
  });
});

describe('Cross-base isolation — entre bases', () => {
  const bases = listBases();

  it('bases têm slugs únicos', () => {
    const slugs = bases.map(b => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('bases têm basePaths únicos', () => {
    const paths = bases.map(b => b.basePath);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('nenhum basePath é prefixo de outro (evita ambiguidade de roteamento)', () => {
    const paths = bases.map(b => b.basePath).filter(p => p !== '/');
    const conflicts: string[] = [];
    for (const a of paths) {
      for (const b of paths) {
        if (a === b) continue;
        if (b.startsWith(a + '/')) {
          conflicts.push(`"${a}" é prefixo de "${b}"`);
        }
      }
    }
    expect(conflicts, conflicts.join('; ')).toEqual([]);
  });

  it('nenhuma base referencia o basePath de OUTRA base nos seus links', () => {
    const baseEntries = bases.map(b => ({ slug: b.slug, basePath: b.basePath, links: collectAllLinks(b) }));

    const violations: string[] = [];
    for (const me of baseEntries) {
      for (const other of bases) {
        if (other.slug === me.slug) continue;
        // tecnologia tem rotas legadas (/aprenda, /ia…) que medvet não pode referenciar.
        const forbiddenPrefixes = [other.basePath, ...(EXTRA_BASE_PREFIXES[other.slug] ?? [])];
        for (const { source, item } of me.links) {
          if (isExternalOrAnchor(item.href)) continue;
          for (const fp of forbiddenPrefixes) {
            if (matchesPrefix(item.href, fp) || item.href === fp) {
              violations.push(
                `base "${me.slug}" vaza para "${other.slug}" via ${source}: "${item.label}" → ${item.href}`
              );
            }
          }
        }
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });
});

describe('Cross-base isolation — resolver behavior', () => {
  it('rotas marketing não resolvem para uma base (isMarketing=true)', () => {
    const marketingPaths = ['/', '/sobre', '/comunidade', '/newsletter', '/bases'];
    for (const p of marketingPaths) {
      const r = resolveBaseConfig(p);
      expect(r.isMarketing, `${p} deveria ser marketing`).toBe(true);
      expect(r.base, `${p} não deveria ter base associada`).toBeNull();
    }
  });

  it('rotas globais de app caem em isAppGlobal=true (mantém chrome mas não trava microcopy da base)', () => {
    const globalAppPaths = ['/progresso', '/ranking', '/revisar', '/perfil'];
    for (const p of globalAppPaths) {
      const r = resolveBaseConfig(p);
      expect(r.isAppGlobal, `${p} deveria ser app-global`).toBe(true);
    }
  });

  it('cada base no registry é resolvível pelo seu basePath', () => {
    for (const slug of Object.keys(BASE_REGISTRY)) {
      const cfg = BASE_REGISTRY[slug];
      const r = resolveBaseConfig(cfg.basePath);
      expect(r.base?.slug, `resolveBaseConfig(${cfg.basePath}) deveria devolver ${slug}`).toBe(slug);
    }
  });
});
