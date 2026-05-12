import * as fs from 'fs/promises';
import * as path from 'path';
import { LocalMetricEntry, LocalMetrics } from './types';
import { ensureGitignoreEntry } from '../utils/fs';

const METRICS_DIR = '.aitoolkit';
const METRICS_FILE = 'metrics.json';
const MAX_HISTORY = 90; // keep 90 entries max

async function metricsPath(rootPath: string): Promise<string> {
  return path.join(rootPath, METRICS_DIR, METRICS_FILE);
}

async function loadMetrics(rootPath: string): Promise<LocalMetrics> {
  try {
    const p = await metricsPath(rootPath);
    const raw = await fs.readFile(p, 'utf-8');
    return JSON.parse(raw) as LocalMetrics;
  } catch {
    return { history: [], aiCalls: [] };
  }
}

async function saveMetrics(rootPath: string, m: LocalMetrics): Promise<void> {
  const p = await metricsPath(rootPath);
  const dir = path.dirname(p);
  const dirExisted = await fs.access(dir).then(() => true).catch(() => false);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(p, JSON.stringify(m, null, 2), 'utf-8');
  if (!dirExisted) {
    // First time creating .aitoolkit — add it to .gitignore so local metrics stay local
    await ensureGitignoreEntry(rootPath, '.aitoolkit/').catch(() => { /* best-effort */ });
  }
}

export async function recordScore(rootPath: string, entry: LocalMetricEntry): Promise<void> {
  try {
    const m = await loadMetrics(rootPath);
    m.history.push(entry);
    if (m.history.length > MAX_HISTORY) m.history = m.history.slice(-MAX_HISTORY);
    await saveMetrics(rootPath, m);
  } catch {
    // metrics are best-effort
  }
}

export async function recordAICall(
  rootPath: string,
  command: string,
  model: string,
  rejected: boolean
): Promise<void> {
  try {
    const m = await loadMetrics(rootPath);
    m.aiCalls.push({ date: new Date().toISOString(), command, model, rejected });
    if (m.aiCalls.length > MAX_HISTORY) m.aiCalls = m.aiCalls.slice(-MAX_HISTORY);
    await saveMetrics(rootPath, m);
  } catch {
    // metrics are best-effort
  }
}

export async function getMetrics(rootPath: string): Promise<LocalMetrics> {
  return loadMetrics(rootPath);
}
