import * as vscode from 'vscode';
import { logger } from '../core/logger';
import { scanProject } from '../scanner';
import { detectDrift } from './detector';

const WATCH_PATTERNS = [
  '**/package.json',
  '**/tsconfig.json',
  '**/pyproject.toml',
  '**/go.mod',
  '**/Cargo.toml',
];

const DEBOUNCE_MS = 1500;

export function startDriftWatcher(
  context: vscode.ExtensionContext,
  onDriftChange: (count: number) => void
): void {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!root) return;

  const cfg = vscode.workspace.getConfiguration('aiToolkit');
  if (!cfg.get<boolean>('autoSync', true)) return;

  let timer: NodeJS.Timeout | undefined;
  const trigger = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const scan = await scanProject(root);
        const report = await detectDrift(scan);
        const drifted = report.staleCount;
        onDriftChange(drifted);
        if (drifted > 0) {
          notifyDrift(drifted);
        }
      } catch (err) {
        logger.warn('Drift check failed', err);
      }
    }, DEBOUNCE_MS);
  };

  for (const pattern of WATCH_PATTERNS) {
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    watcher.onDidChange(trigger);
    watcher.onDidCreate(trigger);
    watcher.onDidDelete(trigger);
    context.subscriptions.push(watcher);
  }
}

let lastNotifiedCount = -1;

async function notifyDrift(count: number): Promise<void> {
  if (count === lastNotifiedCount) return;
  lastNotifiedCount = count;
  const choice = await vscode.window.showWarningMessage(
    `${count} AI instruction file${count === 1 ? ' is' : 's are'} out of sync with your project.`,
    'Regenerate',
    'Show Details',
    'Dismiss'
  );
  if (choice === 'Regenerate') {
    await vscode.commands.executeCommand('aiToolkit.generateInstructions');
  } else if (choice === 'Show Details') {
    await vscode.commands.executeCommand('aiToolkit.checkDrift');
  }
}
