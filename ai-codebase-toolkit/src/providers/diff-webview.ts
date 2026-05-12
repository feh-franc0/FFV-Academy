import * as crypto from 'crypto';
import * as path from 'path';
import * as vscode from 'vscode';
import { GeneratedFile } from '../core/types';
import { pathExists, readText } from '../utils/fs';

export interface DiffResult {
  accepted: GeneratedFile[];
  rejected: GeneratedFile[];
}

/**
 * Show a diff webview for each generated file that differs from what's on disk.
 * Returns the user's accept/reject decisions.
 *
 * Files with no existing counterpart on disk are accepted automatically
 * (they're new files, nothing to diff against).
 */
export async function presentDiffAndConfirm(
  root: string,
  files: GeneratedFile[],
  context: vscode.ExtensionContext
): Promise<DiffResult> {
  const toReview: { file: GeneratedFile; existing: string }[] = [];
  const accepted: GeneratedFile[] = [];

  for (const file of files) {
    const abs = path.join(root, file.path);
    if (!(await pathExists(abs))) {
      accepted.push(file); // new file — auto-accept
      continue;
    }
    const existing = (await readText(abs)) ?? '';
    if (existing.trim() === file.content.trim()) {
      accepted.push(file); // identical — auto-accept
      continue;
    }
    toReview.push({ file, existing });
  }

  if (toReview.length === 0) return { accepted, rejected: [] };

  // Show diff for each file that needs review
  return new Promise<DiffResult>((resolve) => {
    let remaining = toReview.length;
    const userAccepted: GeneratedFile[] = [...accepted];
    const userRejected: GeneratedFile[] = [];

    function onDecision(file: GeneratedFile, accept: boolean): void {
      if (accept) userAccepted.push(file);
      else userRejected.push(file);
      remaining--;
      if (remaining === 0) resolve({ accepted: userAccepted, rejected: userRejected });
    }

    for (const { file, existing } of toReview) {
      showSingleDiff(file, existing, context, (accept) => onDecision(file, accept));
    }
  });
}

function showSingleDiff(
  file: GeneratedFile,
  existing: string,
  context: vscode.ExtensionContext,
  callback: (accept: boolean) => void
): void {
  const nonce = crypto.randomBytes(16).toString('hex');
  const panel = vscode.window.createWebviewPanel(
    'aiToolkit.diff',
    `Review: ${path.basename(file.path)}`,
    vscode.ViewColumn.Active,
    { enableScripts: true, retainContextWhenHidden: false, localResourceRoots: [] }
  );

  panel.webview.html = renderDiff(file, existing, nonce);

  let decided = false;
  panel.webview.onDidReceiveMessage(
    (msg: { type: string }) => {
      if (decided) return;
      if (msg.type === 'accept' || msg.type === 'reject') {
        decided = true;
        panel.dispose();
        callback(msg.type === 'accept');
      }
    },
    undefined,
    context.subscriptions
  );

  panel.onDidDispose(() => {
    if (!decided) {
      decided = true;
      callback(false); // closed without deciding = reject
    }
  });
}

function renderDiff(file: GeneratedFile, existing: string, nonce: string): string {
  const newLines = file.content.split('\n');
  const oldLines = existing.split('\n');
  const diffHtml = buildDiffHtml(oldLines, newLines);
  const fileName = path.basename(file.path);

  return /* html */ `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: -apple-system, system-ui, sans-serif; padding: 0; margin: 0; color: var(--vscode-foreground); background: var(--vscode-editor-background); }
  .header { padding: 12px 20px; border-bottom: 1px solid var(--vscode-panel-border); display: flex; align-items: center; gap: 12px; }
  .header h1 { font-size: 14px; margin: 0; flex: 1; }
  .btn { padding: 6px 16px; border: 0; border-radius: 4px; cursor: pointer; font-size: 13px; }
  .btn-accept { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
  .btn-reject { background: var(--vscode-button-secondaryBackground, #555); color: var(--vscode-button-secondaryForeground, #fff); }
  .diff { font-family: var(--vscode-editor-font-family, monospace); font-size: 12px; overflow: auto; }
  .line { display: flex; }
  .ln { width: 3em; text-align: right; padding-right: 8px; opacity: 0.4; user-select: none; flex-shrink: 0; }
  .code { white-space: pre; flex: 1; padding-left: 8px; }
  .add { background: rgba(0,200,80,0.12); }
  .del { background: rgba(255,60,60,0.12); }
  .add .code::before { content: '+'; opacity: 0.6; }
  .del .code::before { content: '-'; opacity: 0.6; }
  .neu .code::before { content: ' '; }
</style>
</head><body>
  <div class="header">
    <h1>Review changes to <strong>${escapeHtml(fileName)}</strong></h1>
    <button class="btn btn-reject" id="btn-reject">✗ Reject</button>
    <button class="btn btn-accept" id="btn-accept">✓ Accept</button>
  </div>
  <div class="diff">${diffHtml}</div>
  <script nonce="${nonce}">
    (function() {
      const vscode = acquireVsCodeApi();
      document.getElementById('btn-accept').addEventListener('click', () => vscode.postMessage({ type: 'accept' }));
      document.getElementById('btn-reject').addEventListener('click', () => vscode.postMessage({ type: 'reject' }));
    })();
  </script>
</body></html>`;
}

function buildDiffHtml(oldLines: string[], newLines: string[]): string {
  // Simple unified diff: show deletions and additions using LCS
  const hunks = computeHunks(oldLines, newLines);
  return hunks.map(({ type, content, lineNo }) => {
    const cls = type === 'add' ? 'add' : type === 'del' ? 'del' : 'neu';
    return `<div class="line ${cls}"><span class="ln">${lineNo}</span><span class="code">${escapeHtml(content)}</span></div>`;
  }).join('');
}

interface HunkLine { type: 'add' | 'del' | 'ctx'; content: string; lineNo: number; }

function computeHunks(oldLines: string[], newLines: string[]): HunkLine[] {
  // Simple greedy diff — not Myers, but good enough for display
  const result: HunkLine[] = [];
  let o = 0; let n = 0;
  while (o < oldLines.length || n < newLines.length) {
    if (o < oldLines.length && n < newLines.length && oldLines[o] === newLines[n]) {
      result.push({ type: 'ctx', content: oldLines[o], lineNo: n + 1 });
      o++; n++;
    } else if (n < newLines.length && (o >= oldLines.length || oldLines[o] !== newLines[n])) {
      result.push({ type: 'add', content: newLines[n], lineNo: n + 1 });
      n++;
    } else {
      result.push({ type: 'del', content: oldLines[o], lineNo: o + 1 });
      o++;
    }
  }
  return result;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
