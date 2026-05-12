/**
 * Regression: StudyHeatmap usava toISOString() (UTC) enquanto engine usa
 * isoDate() (local). Em timezones atrás de UTC, isso fazia o heatmap nunca
 * casar com studyDays.date. Este teste trava a convenção: TODO date string
 * em src/components/StudyHeatmap.tsx vem de isoDate() (lib/srs).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { isoDate } from '@/lib/srs';

describe('Convenção de data — UTC vs local', () => {
  it('StudyHeatmap não usa toISOString() para chaves de data', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/components/StudyHeatmap.tsx'),
      'utf8'
    );
    expect(src).not.toMatch(/\.toISOString\(\)\.slice\(0,\s*10\)/);
    expect(src).toContain('isoDate(');
  });

  it('isoDate retorna data local (não UTC) — formato YYYY-MM-DD', () => {
    const d = new Date(2026, 0, 5, 23, 59, 59); // 5 jan 2026 às 23:59 local
    expect(isoDate(d)).toBe('2026-01-05');
  });

  it('isoDate é estável dentro do mesmo dia local independente da hora', () => {
    const morning = new Date(2026, 5, 10, 0, 0, 1);
    const evening = new Date(2026, 5, 10, 23, 59, 59);
    expect(isoDate(morning)).toBe(isoDate(evening));
  });
});
