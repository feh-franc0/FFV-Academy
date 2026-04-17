/**
 * build-deploy.mjs
 *
 * Script automatizado de deploy para Hostinger.
 * Lê CURRICULUM e HUBS dinamicamente — sem rotas hardcoded.
 *
 * Uso:
 *   node scripts/build-deploy.mjs          → apenas prepara hostinger/
 *   node scripts/build-deploy.mjs --zip    → prepara + gera ffv-academy-hostinger.zip
 *   node scripts/build-deploy.mjs --build  → npm build + prepara + zip
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const DEST = path.join(ROOT, 'hostinger');

const args = process.argv.slice(2);
const doBuild = args.includes('--build');
const doZip = args.includes('--zip') || doBuild;

// ─── 1. Build opcional ───────────────────────────────────────────────────────
if (doBuild) {
  console.log('\n[1/3] Building…');
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
}

// ─── 2. Derivar rotas do CURRICULUM ─────────────────────────────────────────
// Importamos o JSON compilado em vez do TS para evitar dep de ts-node.
// next build exporta os módulos como chunks — aqui lemos o curriculum.ts
// diretamente via regex (mais simples e sem deps extras).

function extractHrefs(source) {
  const hrefs = [];
  // Captura href: '/alguma-coisa'
  const re = /href:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const h = m[1].trim();
    if (h.startsWith('/') && !hrefs.includes(h)) {
      hrefs.push(h);
    }
  }
  return hrefs;
}

const curriculumSrc = fs.readFileSync(path.join(ROOT, 'src/lib/curriculum.ts'), 'utf8');
const allHrefs = extractHrefs(curriculumSrc);

// Filtra apenas rotas de trilha/hub (slug real — não é artigo /aprenda/*)
const routes = allHrefs
  .filter(h => !h.startsWith('/aprenda'))
  .map(h => h.replace(/^\//, ''))   // remove leading /
  .filter(r => r.length > 0);

// Rotas fixas que não estão no curriculum
const FIXED_ROUTES = ['progresso', 'revisar', 'glossario', 'fundamentos', 'ai-native'];
FIXED_ROUTES.forEach(r => {
  if (!routes.includes(r)) routes.push(r);
});

// Artigos /aprenda/*
const APRENDA_SRC = path.join(OUT, 'aprenda');

console.log(`\n[2/3] Preparing hostinger/ …`);
console.log(`  → ${routes.length} static routes detected from curriculum`);

// ─── 3. Montar estrutura hostinger/ ─────────────────────────────────────────
// Limpa e recria
if (fs.existsSync(DEST)) fs.rmSync(DEST, { recursive: true });
fs.mkdirSync(DEST, { recursive: true });

// Copia _next/
cp(path.join(OUT, '_next'), path.join(DEST, '_next'));

// Copia raiz (favicon, robots, sitemap, etc.)
for (const file of ['favicon.ico', 'robots.txt', 'sitemap.xml', '404.html']) {
  const src = path.join(OUT, file);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DEST, file));
}

// index.html (home)
fs.copyFileSync(path.join(OUT, 'index.html'), path.join(DEST, 'index.html'));

// Trilhas e hubs: rota.html → rota/index.html
for (const route of routes) {
  const htmlSrc = path.join(OUT, `${route}.html`);
  if (!fs.existsSync(htmlSrc)) {
    console.warn(`  ! Skipping missing: ${route}.html`);
    continue;
  }
  const dir = path.join(DEST, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(htmlSrc, path.join(dir, 'index.html'));
}

// Artigos /aprenda/*
if (fs.existsSync(APRENDA_SRC)) {
  const aprFiles = fs.readdirSync(APRENDA_SRC).filter(f => f.endsWith('.html'));
  for (const file of aprFiles) {
    const slug = file.replace(/\.html$/, '');
    const dir = path.join(DEST, 'aprenda', slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(path.join(APRENDA_SRC, file), path.join(dir, 'index.html'));
  }
  console.log(`  → ${aprFiles.length} /aprenda/* articles copied`);
}

// .htaccess
const htaccess = `Options -Indexes

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule ^ index.html [L]
</IfModule>
`;
fs.writeFileSync(path.join(DEST, '.htaccess'), htaccess);

console.log('  → hostinger/ ready');

// ─── 4. Zip opcional ────────────────────────────────────────────────────────
if (doZip) {
  const ZIP = path.join(ROOT, 'ffv-academy-hostinger.zip');
  if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP);
  console.log('\n[3/3] Zipping…');
  execSync(`zip -r "${ZIP}" hostinger/ -x "*.DS_Store"`, { cwd: ROOT, stdio: 'inherit' });
  console.log(`\nZIP gerado: ffv-academy-hostinger.zip`);
  console.log('Próximo passo: upload manual na Hostinger (File Manager → public_html → Extract).');
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function cp(src, dest) {
  if (!fs.existsSync(src)) return;
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      cp(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}
