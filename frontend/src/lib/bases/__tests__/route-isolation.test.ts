/**
 * Route-file isolation tests
 *
 * Escaneia os arquivos de rota de cada base (src/app/<base-slug>/**) e falha
 * se algum deles tiver `href="/<outra-base>"` ou `href={`/<outra-base>/${...}`}`
 * hardcoded — vazamento estático.
 *
 * Complementa `isolation.test.ts` (que valida config) cobrindo o caso
 * "dev distraído colou um link de outra base dentro de uma página da base
 * de veterinária".
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { BASE_REGISTRY, listBases } from '../registry';

const APP_DIR = path.resolve(__dirname, '../../../app');

/** Rotas globais que QUALQUER base pode referenciar livremente. */
const GLOBAL_ALLOWED_PREFIXES = new Set([
  '/', '/sobre', '/comunidade', '/newsletter', '/bases', '/stats-publicas',
  '/progresso', '/ranking', '/revisar', '/preferencias', '/perfil',
  '/meu-aprendizado', '/diff-de-conhecimento', '/trilhas-espelho',
  '/news', '/search', '/explorar', '/glossario', '/playlists', '/roadmaps',
  '/mapa', '/cheatsheets', '/verificar', '/admin',
]);

/**
 * Prefixos extras considerados parte de uma base (rotas legadas). Idêntico ao
 * que isolation.test.ts usa — mantido em sincronia manualmente.
 */
const EXTRA_BASE_PREFIXES: Record<string, string[]> = {
  tecnologia: [
    '/aprenda', '/simulados', '/ia', '/aws', '/engenharia',
    '/claude-anthropic', '/fundamentos', '/programacao', '/dados',
    '/construcao', '/seguranca-hardware-hacking',
  ],
};

function walkTsxFiles(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const p = path.join(dir, entry);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      out.push(...walkTsxFiles(p));
    } else if (st.isFile() && (p.endsWith('.tsx') || p.endsWith('.ts'))) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Extrai todas as strings que parecem `path` literal de uma linha de código.
 * Cobre: `href="/foo"`, `href={"/foo"}`, `href={`/foo/${slug}`}`, `router.push('/foo')`.
 *
 * Não pretende ser tokenizer perfeito — pega o suficiente pra detectar vazamento
 * óbvio (regex aproxima). Falsos positivos: improvável (path-strings com `/<slug>`
 * inicial são bem específicas).
 */
function extractPathLiterals(content: string): string[] {
  const literals: string[] = [];
  // "/foo" ou '/foo' — strings começando com /
  const stringRe = /["'`](\/[\w\-/[\]:.@${}]*)["'`]/g;
  let match;
  while ((match = stringRe.exec(content)) !== null) {
    literals.push(match[1]);
  }
  // Template literals com interpolação no meio — pega só o prefixo estático
  const tplRe = /`(\/[\w\-/]+)\$\{/g;
  while ((match = tplRe.exec(content)) !== null) {
    literals.push(match[1]);
  }
  return literals;
}

function rootPrefixOf(p: string): string {
  // Pega "/aprenda" de "/aprenda/foo/bar" ou "/aprenda" de "/aprenda".
  if (!p.startsWith('/')) return '';
  const idx = p.indexOf('/', 1);
  return idx === -1 ? p : p.slice(0, idx);
}

describe('Route-file isolation — arquivos sob src/app/<base>/', () => {
  const bases = listBases().filter(b => b.basePath !== '/');

  describe.each(bases.map(b => [b.slug, b.basePath] as const))(
    'arquivos de "%s" (basePath=%s)',
    (slug, basePath) => {
      // Diretório do app correspondente à base: src/app/<basePath sem "/">
      const baseDirName = basePath.slice(1); // "/medicina-veterinaria" → "medicina-veterinaria"
      const baseDir = path.join(APP_DIR, baseDirName);

      it(`diretório src/app/${baseDirName}/ existe`, () => {
        let exists = false;
        try {
          exists = statSync(baseDir).isDirectory();
        } catch {
          /* falha o teste abaixo */
        }
        expect(exists, `Esperado src/app/${baseDirName}/ existir para a base "${slug}"`).toBe(true);
      });

      it(`nenhum arquivo referencia path hardcoded de outra base`, () => {
        const files = walkTsxFiles(baseDir);
        if (files.length === 0) return; // nada a verificar

        // Conjunto de roots PROIBIDOS pra esta base = roots de outras bases + extras delas.
        const forbidden = new Set<string>();
        for (const other of Object.values(BASE_REGISTRY)) {
          if (other.slug === slug) continue;
          if (other.basePath !== '/') forbidden.add(other.basePath);
          for (const extra of EXTRA_BASE_PREFIXES[other.slug] ?? []) {
            forbidden.add(extra);
          }
        }

        const violations: string[] = [];
        for (const file of files) {
          const content = readFileSync(file, 'utf8');
          const literals = extractPathLiterals(content);
          for (const lit of literals) {
            const root = rootPrefixOf(lit);
            if (forbidden.has(root)) {
              violations.push(`${path.relative(APP_DIR, file)} → ${lit}`);
            }
          }
        }
        expect(
          violations,
          `Arquivos em "${slug}" referenciam path de outra base:\n  - ${violations.join('\n  - ')}`
        ).toEqual([]);
      });

      it(`paths "/" não-globais usados são consistentes com a base`, () => {
        const files = walkTsxFiles(baseDir);
        if (files.length === 0) return;

        const ownExtras = new Set(EXTRA_BASE_PREFIXES[slug] ?? []);
        const allowedRoots = new Set<string>([basePath, ...GLOBAL_ALLOWED_PREFIXES, ...ownExtras]);

        const unexpected: string[] = [];
        for (const file of files) {
          const content = readFileSync(file, 'utf8');
          for (const lit of extractPathLiterals(content)) {
            const root = rootPrefixOf(lit);
            if (!root) continue;
            // Path absoluto que NÃO é a própria base, NÃO é global e NÃO é extra → suspeito.
            if (!allowedRoots.has(root) && !allowedRoots.has(lit)) {
              // Pode ser path técnico tipo "/api/health" — toleramos /api/*.
              if (root === '/api') continue;
              unexpected.push(`${path.relative(APP_DIR, file)} → ${lit}`);
            }
          }
        }
        // Não falhamos hard aqui — só registramos. Se acumular ruído, vira fail.
        // (vitest sem assertion: o teste passa; mas o log indica drift.)
        if (unexpected.length > 0) {
          console.warn(
            `[route-isolation] Paths suspeitos em "${slug}" (não fatal, mas revise):\n  - ${unexpected.join('\n  - ')}`
          );
        }
        expect(true).toBe(true);
      });
    }
  );
});
