#!/usr/bin/env node
/**
 * Gera `frontend/src/lib/curriculum/indice-leve.ts` a partir das trilhas.
 *
 * ## Por que existe, com o número medido
 *
 * `useGameState` calcula progresso por trilha e recomendações, e para isso
 * precisa da lista de trilhas e módulos. Ele vive no layout raiz (via
 * `SyncBanner`), então importar `CURRICULUM` colocava os 224 KB do currículo
 * completo no primeiro carregamento das 95 rotas — incluindo `/verificar` e
 * `/sobre`, que não têm progresso nenhum na tela.
 *
 * Só que o hook não usa nem `desc` nem `keywords`, e esses dois campos são
 * ~124 KB dos 265 KB de fonte das trilhas. O índice leve mantém exatamente o
 * que o cálculo de progresso consome e descarta o resto.
 *
 * ## Por que gerado, e não escrito à mão
 *
 * Índice paralelo mantido à mão diverge — é questão de tempo. Gerado, ele é
 * derivado por construção, e `indice-leve-fresco.test.ts` falha se alguém
 * mexer numa trilha e esquecer de regerar.
 *
 * Uso:
 *   node scripts/gerar-indice-leve.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR_TRILHAS = join(RAIZ, 'frontend', 'src', 'lib', 'curriculum', 'trails');
const SAIDA = join(RAIZ, 'frontend', 'src', 'lib', 'curriculum', 'indice-leve.ts');

/** Campos que o cálculo de progresso e as recomendações realmente usam. */
function extrair(src) {
  const trilha = {
    id: campo(src, 'id'),
    name: campo(src, 'name'),
    color: campo(src, 'color'),
    icon: campo(src, 'icon'),
    href: campo(src, 'href'),
    modules: [],
  };

  // Cada módulo começa em `slug:`; pegamos até o próximo `slug:` ou o fim.
  const pos = [...src.matchAll(/slug: '([a-z0-9-]+)'/g)];
  for (let i = 0; i < pos.length; i++) {
    const ini = pos[i].index;
    const fim = i + 1 < pos.length ? pos[i + 1].index : src.length;
    const bloco = src.slice(ini, fim);
    trilha.modules.push({
      slug: pos[i][1],
      title: campo(bloco, 'title'),
      icon: campo(bloco, 'icon') ?? '📄',
      xp: Number(campo(bloco, 'xp', /(\w+): (\d+)/g) ?? 0),
      readTime: Number(campo(bloco, 'readTime', /(\w+): (\d+)/g) ?? 0),
    });
  }
  return trilha;
}

function campo(src, nome, _re) {
  if (nome === 'xp' || nome === 'readTime') {
    const m = src.match(new RegExp(`\\b${nome}: (\\d+)`));
    return m ? m[1] : null;
  }
  const m = src.match(new RegExp(`\\b${nome}: '([^']*)'`));
  return m ? m[1] : null;
}

const arquivos = readdirSync(DIR_TRILHAS)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts');

// A ORDEM tem de ser a mesma do CURRICULUM, e ela vive em trails/index.ts.
const indice = readFileSync(join(DIR_TRILHAS, 'index.ts'), 'utf8');
const ordem = [...indice.matchAll(/from '\.\/(trail[a-z0-9-]*)'/g)].map(m => m[1]);

const faltando = arquivos.map(f => f.replace(/\.ts$/, '')).filter(t => !ordem.includes(t));
if (faltando.length) {
  console.error(`✗ trilha(s) sem import em trails/index.ts: ${faltando.join(', ')}`);
  process.exit(1);
}

const trilhas = ordem.map(t => extrair(readFileSync(join(DIR_TRILHAS, `${t}.ts`), 'utf8')));
const totalModulos = trilhas.reduce((a, t) => a + t.modules.length, 0);

const corpo = `// GERADO por scripts/gerar-indice-leve.mjs — não edite à mão.
//
// Índice enxuto do currículo para uso no CLIENTE. Contém apenas o que o cálculo
// de progresso e as recomendações consomem: identidade da trilha e, por módulo,
// slug, título, ícone, XP e tempo de leitura.
//
// Fora daqui, de propósito: \`desc\`, \`keywords\`, \`prerequisites\` e
// \`nextSuggested\`. São ~124 KB dos 265 KB de fonte das trilhas, e nenhum deles
// participa de progresso — só de metadados de SEO e de busca, que têm seus
// próprios caminhos.
//
// Regenerar após mexer em qualquer trilha:
//     node scripts/gerar-indice-leve.mjs

export interface ModuloLeve {
  slug: string;
  title: string;
  icon: string;
  xp: number;
  readTime: number;
}

export interface TrilhaLeve {
  id: string;
  name: string;
  color: string;
  icon: string;
  href: string;
  modules: ModuloLeve[];
}

/** ${trilhas.length} trilhas · ${totalModulos} módulos */
export const CURRICULO_LEVE: TrilhaLeve[] = ${JSON.stringify(trilhas, null, 2)};

export const TOTAL_MODULOS = ${totalModulos};
`;

writeFileSync(SAIDA, corpo);
console.log(`✓ indice-leve.ts: ${trilhas.length} trilhas, ${totalModulos} módulos, `
  + `${(corpo.length / 1024).toFixed(0)} KB de fonte`);
