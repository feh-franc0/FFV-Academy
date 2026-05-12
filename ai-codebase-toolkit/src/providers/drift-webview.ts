import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { DriftReport } from '../drift/detector';

export function showDriftWebview(report: DriftReport, context: vscode.ExtensionContext): void {
  const panel = vscode.window.createWebviewPanel(
    'aiToolkit.drift',
    `AI Instructions Drift (${report.staleCount} stale)`,
    vscode.ViewColumn.Active,
    { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [] }
  );

  const nonce = crypto.randomBytes(16).toString('hex');
  panel.webview.html = render(report, nonce);

  panel.webview.onDidReceiveMessage(
    async (msg) => {
      if (msg?.type === 'regenerate') {
        await vscode.commands.executeCommand('aiToolkit.generateInstructions');
      }
    },
    undefined,
    context.subscriptions
  );
}

function render(report: DriftReport, nonce: string): string {
  const rows = report.files
    .map((f) => {
      const badge =
        f.status === 'in-sync'
          ? '<span class="b ok">in sync</span>'
          : f.status === 'project-stale'
            ? '<span class="b warn">project stale</span>'
            : f.status === 'user-edited'
              ? '<span class="b info">user edited</span>'
              : f.status === 'both-stale'
                ? '<span class="b warn">both stale</span>'
                : f.status === 'missing'
                  ? '<span class="b miss">missing</span>'
                  : '<span class="b info">untagged</span>';
      return `<tr><td><code>${escape(f.relPath)}</code></td><td>${badge}</td><td><code>${f.projectManifest ?? '—'}</code></td></tr>`;
    })
    .join('');

  const allInSync = report.staleCount === 0 && report.missingCount === 0;

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body{font-family:-apple-system,system-ui,sans-serif;padding:24px;color:var(--vscode-foreground);background:var(--vscode-editor-background);}
  h1{font-size:14px;text-transform:uppercase;letter-spacing:.08em;opacity:.7;margin:0 0 4px;}
  .stat{font-size:32px;font-weight:700;margin-bottom:8px;}
  .stat.ok{color:#22c55e;}
  .meta{font-size:12px;opacity:.6;margin-bottom:16px;}
  table{width:100%;border-collapse:collapse;margin-bottom:16px;}
  td,th{padding:8px;border-bottom:1px solid var(--vscode-panel-border);text-align:left;font-size:13px;}
  th{opacity:.6;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}
  .b{font-size:10px;padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:.04em;}
  .ok{background:#22c55e;color:#000;}
  .warn{background:#eab308;color:#000;}
  .miss{background:#ef4444;color:#fff;}
  .info{background:#3b82f6;color:#fff;}
  button{background:var(--vscode-button-background);color:var(--vscode-button-foreground);border:0;padding:8px 14px;border-radius:4px;cursor:pointer;font-size:13px;}
  button:hover{opacity:.85;}
</style></head><body>
  <h1>Drift report</h1>
  <div class="stat ${allInSync ? 'ok' : ''}">${allInSync ? 'All in sync' : `${report.staleCount} stale · ${report.missingCount} missing`}</div>
  <div class="meta">Project manifest: <code>${escape(report.currentManifest)}</code></div>
  <table>
    <thead><tr><th>File</th><th>Status</th><th>Embedded manifest</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="3" style="opacity:.5;text-align:center">No AI instruction files found.</td></tr>'}</tbody>
  </table>
  ${!allInSync ? `<button id="regen">Regenerate all</button>` : ''}
  <script nonce="${nonce}">
    (function() {
      var btn = document.getElementById('regen');
      if (btn) {
        var vscode = acquireVsCodeApi();
        btn.addEventListener('click', function() {
          vscode.postMessage({ type: 'regenerate' });
        });
      }
    })();
  </script>
</body></html>`;
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
