import * as vscode from 'vscode';

let item: vscode.StatusBarItem | undefined;
let driftItem: vscode.StatusBarItem | undefined;

export function initStatusBar(context: vscode.ExtensionContext): vscode.StatusBarItem {
  item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = 'aiToolkit.showReadinessScore';
  item.text = '$(rocket) AI Toolkit';
  item.tooltip = 'Click to view AI-Readiness score';
  item.show();
  context.subscriptions.push(item);

  driftItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
  driftItem.command = 'aiToolkit.checkDrift';
  context.subscriptions.push(driftItem);

  return item;
}

export function updateDrift(staleCount: number): void {
  if (!driftItem) return;
  if (staleCount === 0) {
    driftItem.hide();
    return;
  }
  driftItem.text = `$(sync~spin) ${staleCount} stale`;
  driftItem.tooltip = `${staleCount} AI instruction file${staleCount === 1 ? '' : 's'} drifted from project. Click to inspect.`;
  driftItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
  driftItem.show();
}

export function updateScore(score: number, issues: number): void {
  if (!item) return;
  const icon = score >= 80 ? '$(pass-filled)' : score >= 50 ? '$(warning)' : '$(error)';
  item.text = `${icon} AI ${score}/100`;
  item.tooltip = new vscode.MarkdownString(
    `**AI-Readiness Score:** ${score}/100\n\n` +
      `${issues} issue${issues === 1 ? '' : 's'} to improve.\n\nClick to open the report.`
  );
  item.backgroundColor =
    score >= 50
      ? undefined
      : new vscode.ThemeColor('statusBarItem.warningBackground');
}
