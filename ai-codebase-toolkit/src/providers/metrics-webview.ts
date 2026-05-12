import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { LocalMetrics } from '../core/types';

export function showMetricsWebview(metrics: LocalMetrics, _context: vscode.ExtensionContext): void {
  const panel = vscode.window.createWebviewPanel(
    'aiToolkit.metrics',
    'AI Toolkit: Quality Metrics',
    vscode.ViewColumn.Active,
    { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [] }
  );

  const nonce = crypto.randomBytes(16).toString('hex');
  panel.webview.html = render(metrics, nonce);
}

function render(metrics: LocalMetrics, nonce: string): string {
  const history = metrics.history.slice(-30); // last 30 entries
  const scores = history.map((h) => h.score);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const trend = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;
  const trendStr = trend > 0 ? `+${trend}` : `${trend}`;
  const trendColor = trend >= 0 ? '#22c55e' : '#ef4444';

  const aiCalls = metrics.aiCalls.slice(-20);
  const rejected = aiCalls.filter((c) => c.rejected).length;
  const accepted = aiCalls.length - rejected;

  const historyRows = history.map((h) => `
    <tr>
      <td>${esc(h.date.slice(0, 10))}</td>
      <td><span style="color:${scoreColor(h.score)}">${h.score}</span></td>
      <td>${esc(h.issues.toString())}</td>
      <td>${esc(h.command.replace('aiToolkit.', ''))}</td>
    </tr>`).join('');

  const aiRows = aiCalls.map((c) => `
    <tr>
      <td>${esc(c.date.slice(0, 10))}</td>
      <td>${esc(c.command.replace('aiToolkit.', ''))}</td>
      <td>${esc(c.model)}</td>
      <td>${c.rejected ? '<span style="color:#ef4444">Rejected</span>' : '<span style="color:#22c55e">Accepted</span>'}</td>
    </tr>`).join('');

  return /* html */`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: -apple-system,system-ui,sans-serif; padding: 24px; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
  h1 { font-size: 14px; opacity: .7; text-transform: uppercase; letter-spacing: .08em; margin: 0 0 20px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .06em; opacity: .7; margin: 24px 0 8px; }
  .stats { display: flex; gap: 24px; margin-bottom: 24px; }
  .stat { background: var(--vscode-panel-background,#1e1e1e); border: 1px solid var(--vscode-panel-border); border-radius: 8px; padding: 16px 24px; text-align: center; }
  .stat-val { font-size: 36px; font-weight: 700; line-height: 1; }
  .stat-label { font-size: 11px; opacity: .6; text-transform: uppercase; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 6px 8px; opacity: .6; font-weight: 500; border-bottom: 1px solid var(--vscode-panel-border); }
  td { padding: 6px 8px; border-bottom: 1px solid var(--vscode-panel-border,#333); opacity: .85; }
  .empty { opacity: .5; text-align: center; padding: 16px; }
</style>
</head><body>
<h1>Quality Metrics</h1>
<div class="stats">
  <div class="stat"><div class="stat-val" style="color:${scoreColor(avgScore)}">${avgScore}</div><div class="stat-label">Avg score (last ${history.length})</div></div>
  <div class="stat"><div class="stat-val" style="color:${trendColor}">${trendStr}</div><div class="stat-label">Score trend</div></div>
  <div class="stat"><div class="stat-val">${aiCalls.length}</div><div class="stat-label">AI calls</div></div>
  <div class="stat"><div class="stat-val" style="color:#22c55e">${accepted}</div><div class="stat-label">AI accepted</div></div>
</div>

<h2>Score history</h2>
${history.length ? `<table><tr><th>Date</th><th>Score</th><th>Issues</th><th>Command</th></tr>${historyRows}</table>` : '<div class="empty">No history yet. Run a scan to start tracking.</div>'}

<h2>AI improvement calls</h2>
${aiCalls.length ? `<table><tr><th>Date</th><th>Command</th><th>Model</th><th>Result</th></tr>${aiRows}</table>` : '<div class="empty">No AI calls recorded yet.</div>'}

<script nonce="${nonce}">(function(){})()</script>
</body></html>`;
}

function scoreColor(score: number): string {
  return score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
