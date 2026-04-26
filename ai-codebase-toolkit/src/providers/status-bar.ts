import * as vscode from 'vscode';

// Status bar items are module-level but only written once inside initStatusBar.
// updateScore / updateDrift guard against calls before init — they are no-ops if
// initStatusBar was never called (e.g. if extension activated without a workspace).
let item: vscode.StatusBarItem | undefined;
let driftItem: vscode.StatusBarItem | undefined;
let driftVisible = false;

export function initStatusBar(context: vscode.ExtensionContext): void {
  if (item || driftItem) {
    // Guard against double-init if activate() is somehow called twice
    item?.dispose();
    driftItem?.dispose();
    driftVisible = false;
  }

  item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = 'aiToolkit.showReadinessScore';
  item.text = '$(rocket) AI Toolkit';
  item.tooltip = 'Click to view AI-Readiness score';
  item.show();
  context.subscriptions.push(item);

  driftItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
  driftItem.command = 'aiToolkit.checkDrift';
  context.subscriptions.push(driftItem);
}

export function updateDrift(staleCount: number): void {
  if (!driftItem) return;

  if (staleCount === 0) {
    if (driftVisible) {
      driftItem.hide();
      driftVisible = false;
    }
    return;
  }

  driftItem.text = `$(sync~spin) ${staleCount} stale`;
  driftItem.tooltip = `${staleCount} AI instruction file${staleCount === 1 ? '' : 's'} drifted from project. Click to inspect.`;
  driftItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');

  if (!driftVisible) {
    driftItem.show();
    driftVisible = true;
  }
}

export function updateScore(score: number, issues: number): void {
  if (!item) return;
  const icon = score >= 80 ? '$(pass-filled)' : score >= 50 ? '$(warning)' : '$(error)';
  item.text = `${icon} AI ${score}/100`;
  item.tooltip = new vscode.MarkdownString(
    `**AI-Readiness Score:** ${score}/100\n\n` +
      `${issues} issue${issues === 1 ? '' : 's'} to fix.\n\nClick to open the report.`
  );
  item.backgroundColor =
    score >= 50 ? undefined : new vscode.ThemeColor('statusBarItem.warningBackground');
}
