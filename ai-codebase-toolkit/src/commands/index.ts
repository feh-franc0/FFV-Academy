import * as path from 'path';
import * as vscode from 'vscode';
import { logger } from '../core/logger';
import { InstructionTarget } from '../core/types';
import { generateAdr } from '../generators/adr';
import { generateArchitectureDiagram } from '../generators/architecture-diagram';
import { generateDocsSite } from '../generators/docs-site';
import { generateFeatureScaffold } from '../generators/feature-scaffold';
import { generateInstructions } from '../generators/instructions';
import { generateSddSpec } from '../generators/sdd';
import { generateTestSuite } from '../generators/test-suite';
import { computeReadiness, scanProject } from '../scanner';
import { detectDrift } from '../drift/detector';
import { writeFiles } from '../utils/fs';
import { ToolsTreeProvider } from '../providers/tree-view';
import { showScoreWebview } from '../providers/score-webview';
import { showDriftWebview } from '../providers/drift-webview';
import { updateScore } from '../providers/status-bar';
import { pickInstructionTargets } from '../providers/quickpicks';

export interface CommandDeps {
  context: vscode.ExtensionContext;
  treeProvider: ToolsTreeProvider;
}

function workspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function readTargets(): InstructionTarget[] {
  const cfg = vscode.workspace.getConfiguration('aiToolkit');
  const all: InstructionTarget[] = ['claude', 'cursor', 'copilot', 'amazonq', 'agents'];
  return all.filter((t) => cfg.get<boolean>(`targets.${t}`, true));
}

async function withRoot<T>(fn: (root: string) => Promise<T>): Promise<T | undefined> {
  const root = workspaceRoot();
  if (!root) {
    void vscode.window.showWarningMessage('Open a folder first.');
    return undefined;
  }
  try {
    return await fn(root);
  } catch (err) {
    logger.error('Command failed', err);
    void vscode.window.showErrorMessage(`AI Toolkit: ${(err as Error).message}`);
    return undefined;
  }
}

async function nextSequence(folder: string): Promise<number> {
  try {
    const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(folder));
    const numbers = entries
      .map(([name]) => Number(name.match(/^(\d+)/)?.[1] ?? 0))
      .filter((n) => Number.isFinite(n));
    return (numbers.length ? Math.max(...numbers) : 0) + 1;
  } catch {
    return 1;
  }
}

export function registerCommands(deps: CommandDeps): vscode.Disposable[] {
  const subs: vscode.Disposable[] = [];

  subs.push(
    vscode.commands.registerCommand('aiToolkit.scanProject', () =>
      withRoot(async (root) => {
        const scan = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: 'AI Toolkit: scanning...', cancellable: false },
          (progress) => {
            progress.report({ message: 'analyzing stack & structure' });
            return scanProject(root);
          }
        );
        const report = computeReadiness(scan);
        updateScore(report.score, report.issues.length);
        showScoreWebview(report, deps.context);
        deps.treeProvider.refresh();
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.showReadinessScore', () =>
      withRoot(async (root) => {
        const scan = await scanProject(root);
        const report = computeReadiness(scan);
        showScoreWebview(report, deps.context);
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.generateInstructions', () =>
      withRoot(async (root) => {
        const targets = await pickInstructionTargets(readTargets());
        if (!targets) return;
        const scan = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: 'Generating AI instructions...' },
          () => scanProject(root)
        );
        const files = generateInstructions(scan, targets);
        const written = await writeFiles(root, files);
        const choice = await vscode.window.showInformationMessage(
          `Generated ${written.length} AI instruction file${written.length === 1 ? '' : 's'}.`,
          'Open CLAUDE.md',
          'Show All'
        );
        if (choice === 'Open CLAUDE.md') {
          const claude = written.find((p) => p.endsWith('CLAUDE.md'));
          if (claude) {
            const doc = await vscode.workspace.openTextDocument(claude);
            await vscode.window.showTextDocument(doc);
          }
        } else if (choice === 'Show All') {
          for (const p of written) {
            const doc = await vscode.workspace.openTextDocument(p);
            await vscode.window.showTextDocument(doc, { preview: false });
          }
        }
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.generateSdd', () =>
      withRoot(async (root) => {
        const title = await vscode.window.showInputBox({
          prompt: 'Spec title',
          placeHolder: 'e.g. Checkout flow',
        });
        if (!title) return;
        const folder = vscode.workspace
          .getConfiguration('aiToolkit')
          .get<string>('sdd.docsFolder', 'docs/specs');
        const number = await nextSequence(path.join(root, folder));
        const file = generateSddSpec({ title, folder, number });
        const [absPath] = await writeFiles(root, [file]);
        const doc = await vscode.workspace.openTextDocument(absPath);
        await vscode.window.showTextDocument(doc);
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.generateAdr', () =>
      withRoot(async (root) => {
        const title = await vscode.window.showInputBox({
          prompt: 'ADR title',
          placeHolder: 'e.g. Adopt PostgreSQL over MySQL',
        });
        if (!title) return;
        const folder = vscode.workspace
          .getConfiguration('aiToolkit')
          .get<string>('adr.docsFolder', 'docs/adr');
        const number = await nextSequence(path.join(root, folder));
        const file = generateAdr({ title, folder, number });
        const [absPath] = await writeFiles(root, [file]);
        const doc = await vscode.workspace.openTextDocument(absPath);
        await vscode.window.showTextDocument(doc);
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.generateTestSuite', (uri?: vscode.Uri) =>
      withRoot(async (root) => {
        const target =
          uri?.fsPath ?? vscode.window.activeTextEditor?.document.uri.fsPath;
        if (!target) {
          void vscode.window.showWarningMessage('Open or right-click a source file first.');
          return;
        }
        const scan = await scanProject(root);
        const rel = path.relative(root, target);
        const files = generateTestSuite({ scan, targetFile: rel });
        const written = await writeFiles(root, files);
        void vscode.window.showInformationMessage(
          `Generated ${written.length} test file(s) for ${path.basename(target)}.`
        );
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.generateArchitectureDiagram', () =>
      withRoot(async (root) => {
        const scan = await scanProject(root);
        const folder = vscode.workspace
          .getConfiguration('aiToolkit')
          .get<string>('diagrams.folder', 'docs/architecture');
        const file = await generateArchitectureDiagram(scan, folder);
        const [absPath] = await writeFiles(root, [file]);
        const doc = await vscode.workspace.openTextDocument(absPath);
        await vscode.window.showTextDocument(doc);
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.scaffoldFeature', (uri?: vscode.Uri) =>
      withRoot(async (root) => {
        const parentDir = uri?.fsPath ?? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? root;
        const featureName = await vscode.window.showInputBox({
          prompt: 'Feature name (kebab-case)',
          placeHolder: 'e.g. checkout',
          validateInput: (v) =>
            /^[a-z][a-z0-9-]*$/.test(v) ? null : 'Use kebab-case starting with a letter.',
        });
        if (!featureName) return;
        const scan = await scanProject(root);
        const files = generateFeatureScaffold({ scan, parentDir, featureName });
        const written = await writeFiles(root, files);
        void vscode.window.showInformationMessage(
          `Scaffolded feature "${featureName}" (${written.length} files).`
        );
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.checkDrift', () =>
      withRoot(async (root) => {
        const scan = await scanProject(root);
        const report = await detectDrift(scan);
        showDriftWebview(report, deps.context);
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.generateDocsSite', () =>
      withRoot(async (root) => {
        const scan = await scanProject(root);
        const files = generateDocsSite(scan);
        const written = await writeFiles(root, files);
        void vscode.window.showInformationMessage(
          `Documentation site generated (${written.length} files). Run "cd docs && npm install && npm run docs:dev".`
        );
      })
    )
  );

  return subs;
}
