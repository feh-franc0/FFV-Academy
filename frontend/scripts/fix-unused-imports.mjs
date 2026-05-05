/**
 * fix-unused-imports.mjs
 *
 * Removes unused named imports reported by @typescript-eslint/no-unused-vars
 * from files under src/app/aprenda/ (and anywhere else ESLint finds them).
 *
 * Usage: node scripts/fix-unused-imports.mjs
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// 1. Run ESLint and collect unused symbols per file
// ---------------------------------------------------------------------------
console.log('Running ESLint to collect unused vars…');

let raw;
try {
  raw = execSync(
    'npx eslint src/ --ext .ts,.tsx --format json 2>/dev/null',
    {
      cwd: path.resolve(import.meta.dirname, '..'),
      maxBuffer: 50 * 1024 * 1024,
    }
  ).toString();
} catch (err) {
  // ESLint exits non-zero when there are warnings/errors — that's fine, read stdout
  raw = err.stdout?.toString() ?? '[]';
}

const json = JSON.parse(raw);

/** @type {Map<string, Set<string>>} */
const fileSymbols = new Map();

for (const result of json) {
  for (const msg of result.messages) {
    if (msg.ruleId !== '@typescript-eslint/no-unused-vars') continue;
    const match = msg.message.match(/'([^']+)' is defined but never used/);
    if (!match) continue;
    const symbol = match[1];
    if (!fileSymbols.has(result.filePath)) fileSymbols.set(result.filePath, new Set());
    fileSymbols.get(result.filePath).add(symbol);
  }
}

console.log(`Found unused symbols in ${fileSymbols.size} files.`);

// ---------------------------------------------------------------------------
// 2. For each file, remove the unused symbols from import declarations
// ---------------------------------------------------------------------------

let totalFixed = 0;

for (const [filePath, symbols] of fileSymbols) {
  let content = readFileSync(filePath, 'utf8');
  let modified = false;

  // We process every import statement that matches:
  //   import { ... } from 'some-module';
  // (single-line or multi-line)
  //
  // Strategy: find each `import {` block, extract the specifier list,
  // remove the symbols, then reconstruct.

  const importRegex =
    /^import\s*\{([^}]*)\}\s*from\s*(['"][^'"]+['"])\s*;/gm;

  content = content.replace(importRegex, (fullMatch, specifiers, moduleSpec) => {
    // Parse individual specifiers (handle aliases: foo as bar)
    const parts = specifiers
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Determine which parts to keep
    const kept = parts.filter((part) => {
      // part may be "SomeName", "type SomeName", "SomeName as Alias", or "type SomeName as Alias"
      let localPart = part.trim();
      // Strip leading "type " keyword (inline type-only import specifier)
      if (localPart.startsWith('type ')) localPart = localPart.slice(5).trim();
      const localName = localPart.includes(' as ') ? localPart.split(' as ')[1].trim() : localPart;
      return !symbols.has(localName);
    });

    if (kept.length === parts.length) {
      // Nothing removed — leave untouched
      return fullMatch;
    }

    modified = true;

    if (kept.length === 0) {
      // Remove the entire import
      return '';
    }

    if (kept.length === 1) {
      // Collapse to single line
      return `import { ${kept[0]} } from ${moduleSpec};`;
    }

    // Multi-item: decide formatting
    // If original was multi-line, keep multi-line; otherwise single-line
    const wasMultiLine = fullMatch.includes('\n');
    if (wasMultiLine) {
      const lines = kept.map((k) => `  ${k},`);
      return `import {\n${lines.join('\n')}\n} from ${moduleSpec};`;
    } else {
      return `import { ${kept.join(', ')} } from ${moduleSpec};`;
    }
  });

  if (modified) {
    // Clean up any blank lines left by removed imports (collapse 2+ consecutive blanks to 1)
    content = content.replace(/\n{3,}/g, '\n\n');
    writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    console.log(`  fixed: ${path.relative(process.cwd(), filePath)} (removed: ${[...symbols].join(', ')})`);
  }
}

console.log(`\nDone. Modified ${totalFixed} files.`);
