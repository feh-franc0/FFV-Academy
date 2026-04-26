import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { ReadinessReport } from '../core/types';

const ALLOWED_COMMANDS = new Set([
  'aiToolkit.generateInstructions',
  'aiToolkit.scanProject',
  'aiToolkit.generateTestSuite',
  'aiToolkit.generateAdr',
  'aiToolkit.generateSdd',
  'aiToolkit.generateDocsSite',
  'aiToolkit.generateArchitectureDiagram',
  'aiToolkit.scaffoldFeature',
]);

export function showScoreWebview(report: ReadinessReport, context: vscode.ExtensionContext): void {
  const panel = vscode.window.createWebviewPanel(
    'aiToolkit.score',
    `AI-Readiness Score: ${report.score}/100`,
    vscode.ViewColumn.Active,
    { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [] }
  );

  const nonce = crypto.randomBytes(16).toString('hex');
  panel.webview.html = render(report, nonce);

  panel.webview.onDidReceiveMessage(async (msg) => {
    if (msg?.type === 'runCommand' && typeof msg.command === 'string') {
      if (!ALLOWED_COMMANDS.has(msg.command)) return;
      await vscode.commands.executeCommand(msg.command);
    }
  }, undefined, context.subscriptions);
}

function render(report: ReadinessReport, nonce: string): string {
  const color =
    report.score >= 80 ? '#22c55e' : report.score >= 50 ? '#eab308' : '#ef4444';

  const issues = report.issues
    .map(
      (i) => `
        <li class="issue ${i.severity}">
          <div class="row">
            <span class="badge ${i.severity}">${i.severity}</span>
            <strong>${escape(i.title)}</strong>
            ${i.fixCommand ? `<button data-cmd="${escape(i.fixCommand)}">Fix</button>` : ''}
          </div>
          <p>${escape(i.description)}</p>
        </li>`
    )
    .join('');

  const passed = report.passed.map((i) => `<li>✓ ${escape(i.title)}</li>`).join('');

  return /* html */ `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: -apple-system, system-ui, sans-serif; padding: 24px; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
  h1 { font-size: 14px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px; }
  .score { font-size: 64px; font-weight: 700; color: ${color}; line-height: 1; margin-bottom: 4px; }
  .meta  { font-size: 12px; opacity: 0.6; margin-bottom: 24px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; margin: 24px 0 8px; }
  ul { list-style: none; padding: 0; margin: 0; }
  li.issue { border: 1px solid var(--vscode-panel-border); border-radius: 6px; padding: 12px; margin-bottom: 8px; }
  .row { display: flex; align-items: center; gap: 8px; }
  .row strong { flex: 1; }
  .badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
  .badge.critical { background: #ef4444; color: white; }
  .badge.warning  { background: #eab308; color: #111; }
  .badge.info     { background: #3b82f6; color: white; }
  p { margin: 6px 0 0; opacity: 0.85; font-size: 13px; }
  button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: 0; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
  button:hover { opacity: 0.85; }
  .passed li { padding: 4px 0; opacity: 0.7; font-size: 13px; }
</style>
</head><body>
  <h1>AI-Readiness Score</h1>
  <div class="score">${report.score}<span style="font-size:24px;opacity:0.5">/100</span></div>
  <div class="meta">Scanned ${escape(report.scannedAt)}</div>

  <h2>Issues (${report.issues.length})</h2>
  <ul>${issues || '<li style="opacity:0.6;padding:8px 0">No issues. All checks passed.</li>'}</ul>

  <h2>Passed (${report.passed.length})</h2>
  <ul class="passed">${passed}</ul>

  <script nonce="${nonce}">
    (function() {
      const vscode = acquireVsCodeApi();
      document.querySelectorAll('button[data-cmd]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          vscode.postMessage({ type: 'runCommand', command: btn.getAttribute('data-cmd') });
        });
      });
    })();
  </script>
</body></html>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
