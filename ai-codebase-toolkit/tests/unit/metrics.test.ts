import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { getMetrics, recordAICall, recordScore } from '../../src/core/metrics';

describe('metrics', () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'aitk-metrics-'));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it('getMetrics returns empty arrays when no file exists', async () => {
    const m = await getMetrics(tmp);
    expect(m.history).toEqual([]);
    expect(m.aiCalls).toEqual([]);
  });

  it('recordScore writes a history entry', async () => {
    await recordScore(tmp, { date: '2026-01-01T00:00:00Z', score: 75, issues: 3, command: 'scanProject' });
    const m = await getMetrics(tmp);
    expect(m.history).toHaveLength(1);
    expect(m.history[0].score).toBe(75);
  });

  it('recordScore appends to existing history', async () => {
    await recordScore(tmp, { date: '2026-01-01T00:00:00Z', score: 70, issues: 4, command: 'scanProject' });
    await recordScore(tmp, { date: '2026-01-02T00:00:00Z', score: 80, issues: 2, command: 'scanProject' });
    const m = await getMetrics(tmp);
    expect(m.history).toHaveLength(2);
    expect(m.history[1].score).toBe(80);
  });

  it('recordAICall writes a call entry', async () => {
    await recordAICall(tmp, 'enrichWithAI', 'claude-3-5-sonnet', false);
    const m = await getMetrics(tmp);
    expect(m.aiCalls).toHaveLength(1);
    expect(m.aiCalls[0].command).toBe('enrichWithAI');
    expect(m.aiCalls[0].model).toBe('claude-3-5-sonnet');
    expect(m.aiCalls[0].rejected).toBe(false);
  });

  it('recordAICall date is a valid ISO string', async () => {
    await recordAICall(tmp, 'enrichWithAI', 'm', false);
    const m = await getMetrics(tmp);
    expect(Number.isNaN(Date.parse(m.aiCalls[0].date))).toBe(false);
  });

  it('history and aiCalls are independent', async () => {
    await recordScore(tmp, { date: '2026-01-01T00:00:00Z', score: 90, issues: 0, command: 'scanProject' });
    await recordAICall(tmp, 'enrichWithAI', 'm', true);
    const m = await getMetrics(tmp);
    expect(m.history).toHaveLength(1);
    expect(m.aiCalls).toHaveLength(1);
  });

  it('creates the .aitoolkit directory if it does not exist', async () => {
    await recordScore(tmp, { date: '2026-01-01T00:00:00Z', score: 60, issues: 5, command: 'scanProject' });
    const exists = await fs.access(path.join(tmp, '.aitoolkit', 'metrics.json')).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });
});
