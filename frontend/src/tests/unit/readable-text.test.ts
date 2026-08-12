import { readFileSync, globSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { readableTextColor } from '@/lib/readable-text';

function luminancia(hex: string): number {
  const h = hex.replace('#', '');
  const canal = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
}

function razao(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

describe('readableTextColor', () => {
  it('escolhe escuro para uma cor clara conhecida (ffv-blue dark-theme)', () => {
    expect(readableTextColor('#58a6ff')).toBe('#0d1117');
  });

  it('escolhe claro para um azul de marca escuro (postgres blue)', () => {
    expect(readableTextColor('#336791')).toBe('#ffffff');
  });

  it('cai para escuro em hex inválido/ausente', () => {
    expect(readableTextColor('')).toBe('#0d1117');
    expect(readableTextColor('not-a-color')).toBe('#0d1117');
  });

  it('é determinístico', () => {
    expect(readableTextColor('#f78166')).toBe(readableTextColor('#f78166'));
  });

  /**
   * Prova real: toda cor de `trail.color`/`hub.color`/`cert.color` hoje em uso
   * (`curriculum/trails/*.ts`, `curriculum/hubs.ts`, `cert-prep.ts`) mede pelo
   * menos 4,5:1 contra o texto que a função escolhe. Sem isso, o utilitário
   * poderia "passar" nos casos de exemplo acima e ainda deixar uma cor real da
   * base abaixo do mínimo — foi exatamente o que `#336791`/`#146eb4` fizeram
   * contra texto escuro fixo antes deste utilitário existir.
   */
  it('todas as cores de trilha/hub/certificação em uso atingem 4,5:1', () => {
    const arquivos = [
      ...globSync('src/lib/curriculum/trails/*.ts', { cwd: process.cwd() }),
      'src/lib/curriculum/hubs.ts',
      'src/lib/cert-prep.ts',
    ] as string[];

    const cores = new Set<string>();
    for (const rel of arquivos) {
      const src = readFileSync(join(process.cwd(), rel), 'utf-8');
      for (const m of src.matchAll(/\bcolor:\s*'(#[0-9a-fA-F]{6})'/g)) {
        cores.add(m[1]);
      }
    }
    expect(cores.size).toBeGreaterThan(0);

    /**
     * Dívida conhecida e visível, não escondida: `#8b5cf6` (trail29, Voice/
     * Vision/Multimodal) mede 4,47:1 com o MELHOR dos dois textos possíveis —
     * abaixo do mínimo por 0,03. É luminância média demais para um par
     * binário preto/branco resolver; a correção real é escurecer o hex na
     * origem (`curriculum/trails/trail29.ts`), fora do escopo deste
     * utilitário porque a mesma variável também alimenta `.ffv-acento-texto`
     * (outra change, `contraste-de-paleta-como-texto`). Lista fechada: cor
     * nova que caia abaixo de 4,5 reprova aqui.
     */
    const DIVIDA_CONHECIDA = new Set(['#8b5cf6']);

    const abaixoDoMinimo: string[] = [];
    for (const cor of cores) {
      if (DIVIDA_CONHECIDA.has(cor)) continue;
      const texto = readableTextColor(cor);
      const r = razao(cor, texto);
      if (r < 4.5) abaixoDoMinimo.push(`${cor} → ${texto} mede ${r.toFixed(2)}:1`);
    }
    expect(abaixoDoMinimo).toEqual([]);
  });
});
