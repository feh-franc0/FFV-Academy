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

  // lastNotifiedCount is scoped to this watcher instance, not global.
  // Prevents state bleed if startDriftWatcher is called more than once.
  let lastNotifiedCount = -1;
  let timer: NodeJS.Timeout | undefined;
  let pendingScan = false;

  const trigger = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      // Prevent concurrent scans from the same watcher
      if (pendingScan) return;
      pendingScan = true;
      try {
        const scan = await scanProject(root);
        const report = await detectDrift(scan);
        const drifted = report.staleCount;
        onDriftChange(drifted);
        if (drifted > 0 && drifted !== lastNotifiedCount) {
          lastNotifiedCount = drifted;
          await notifyDrift(drifted);
        } else if (drifted === 0) {
          // reset so next drift triggers a notification again
          lastNotifiedCount = -1;
        }
      } catch (err) {
        logger.warn('Drift check failed', err);
      } finally {
        pendingScan = false;
      }
    }, DEBOUNCE_MS);
  };

  for (const pattern of WATCH_PATTERNS) {
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    watcher.onDidChange(trigger, undefined, context.subscriptions);
    watcher.onDidCreate(trigger, undefined, context.subscriptions);
    watcher.onDidDelete(trigger, undefined, context.subscriptions);
    context.subscriptions.push(watcher);
  }
}

async function notifyDrift(count: number): Promise<void> {
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
