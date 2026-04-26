import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { logger } from './core/logger';
import { computeReadiness, scanProject } from './scanner';
import { detectDrift } from './drift/detector';
import { startDriftWatcher } from './drift/watcher';
import { initStatusBar, updateDrift, updateScore } from './providers/status-bar';
import { ToolsTreeProvider } from './providers/tree-view';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  logger.info('AI Codebase Toolkit activating');

  const treeProvider = new ToolsTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('aiToolkit.toolsView', treeProvider)
  );

  initStatusBar(context);

  for (const cmd of registerCommands({ context, treeProvider })) {
    context.subscriptions.push(cmd);
  }

  // logger is disposed via context.subscriptions — deactivate() must NOT call it again
  context.subscriptions.push({ dispose: () => logger.dispose() });

  void scanInBackground();

  startDriftWatcher(context, (drifted) => updateDrift(drifted));

  await maybeShowWelcome(context);

  logger.info('AI Codebase Toolkit ready');
}

async function scanInBackground(): Promise<void> {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root) return;
  try {
    const scan = await scanProject(root);
    const report = computeReadiness(scan);
    updateScore(report.score, report.issues.length);
    const drift = await detectDrift(scan);
    updateDrift(drift.staleCount);
  } catch (err) {
    logger.error('Background scan failed', err);
    logger.show();
    void vscode.window.showWarningMessage(
      'AI Toolkit: project scan failed. Check the Output panel for details.',
      'Show Output'
    ).then((choice) => {
      if (choice === 'Show Output') logger.show();
    });
  }
}

async function maybeShowWelcome(context: vscode.ExtensionContext): Promise<void> {
  const KEY = 'aiToolkit.seenWelcome';
  if (context.globalState.get<boolean>(KEY)) return;
  await context.globalState.update(KEY, true);
  const choice = await vscode.window.showInformationMessage(
    'AI Codebase Toolkit installed. Generate AI instructions for this project to get started.',
    'Generate Instructions',
    'Show Walkthrough',
    'Later'
  );
  if (choice === 'Generate Instructions') {
    await vscode.commands.executeCommand('aiToolkit.generateInstructions');
  } else if (choice === 'Show Walkthrough') {
    await vscode.commands.executeCommand(
      'workbench.action.openWalkthrough',
      'feh-franc0.ai-codebase-toolkit#aiToolkit.gettingStarted',
      false
    );
  }
}

// deactivate() is called AFTER context.subscriptions are disposed.
// logger is already disposed there — do NOT call logger.dispose() here again.
export function deactivate(): void {
  // intentionally empty: all cleanup is via context.subscriptions
}
