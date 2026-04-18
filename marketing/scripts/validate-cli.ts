/**
 * validate-cli.ts — Roda todas as validacoes e imprime relatorio
 *
 * Uso: npx tsx scripts/validate-cli.ts
 */

import {
  validateSetup,
  validateScreenshots,
  validateComposition,
  validateAudio,
  validateRender,
  validateKeyFrames,
  printResult,
} from './validate.ts';

console.log('\n🔍 FFV Academy Marketing — Validacao Completa\n');

const results = [
  validateSetup(),
  validateScreenshots(),
  validateComposition(),
  validateAudio(),
  validateRender(),
  validateKeyFrames(),
];

for (const r of results) {
  printResult(r);
}

console.log('\n' + '═'.repeat(60));
console.log('  RESUMO');
console.log('═'.repeat(60));

for (const r of results) {
  console.log(`  ${r.pass ? '✅' : '❌'} ${r.phase}`);
}

const allPassed = results.every(r => r.pass);
const passCount = results.filter(r => r.pass).length;

console.log(`\n  ${passCount}/${results.length} fases passaram`);

if (allPassed) {
  console.log('  🎉 Tudo OK — pronto para render/distribuicao\n');
} else {
  console.log('  ⚠️  Corrija os problemas acima antes de continuar\n');
}

process.exit(allPassed ? 0 : 1);
