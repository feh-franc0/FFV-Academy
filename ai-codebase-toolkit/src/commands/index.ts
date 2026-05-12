import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { logger } from '../core/logger';
import { GeneratedFile, InstructionTarget, ScanResult } from '../core/types';
import { recordAICall, recordScore } from '../core/metrics';
import { getAvailableModel, isAIAvailable } from '../ai/lm-client';
import { analyzeProjectWithAI } from '../ai/project-analyzer';
import { sampleProjectFiles } from '../ai/file-sampler';
import { improveGeneratedFiles } from '../ai/improver';
import { generateAdr } from '../generators/adr';
import { generateArchitectureDiagram } from '../generators/architecture-diagram';
import { generateDocsSite } from '../generators/docs-site';
import { generateFeatureScaffold } from '../generators/feature-scaffold';
import { generateInstructions } from '../generators/instructions';
import { generateOnboarding } from '../generators/onboarding';
import { generatePRContext } from '../generators/pr-context';
import { generateSddSpec } from '../generators/sdd';
import { generateTestSuite } from '../generators/test-suite';
import { analyzeDocGaps } from '../analyzers/doc-gap';
import { computeReadiness, scanProject } from '../scanner';
import { detectDrift } from '../drift/detector';
import { getMetrics } from '../core/metrics';
import { readText, writeFiles } from '../utils/fs';
import { currentBranch, defaultBaseBranch, diffAgainst, isGitRepo } from '../utils/git';
import { ToolsTreeProvider } from '../providers/tree-view';
import { showScoreWebview } from '../providers/score-webview';
import { showDriftWebview } from '../providers/drift-webview';
import { showMetricsWebview } from '../providers/metrics-webview';
import { presentDiffAndConfirm } from '../providers/diff-webview';
import { updateScore } from '../providers/status-bar';
import { pickInstructionTargets } from '../providers/quickpicks';
import { mergeWithExisting } from '../generators/instructions/merger';
import { pathExists } from '../utils/fs';

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

/** Run AI improvement pass, record metrics, return improved files (or originals on any failure). */
async function withAIImprovement(
  root: string,
  scan: ScanResult,
  files: GeneratedFile[]
): Promise<GeneratedFile[]> {
  if (!(await isAIAvailable())) return files;
  const model = await getAvailableModel();
  if (!model) return files;
  try {
    const sampled = await sampleProjectFiles(root, scan);
    const improved = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `AI Toolkit: refining with ${model.id}…`,
        cancellable: true,
      },
      (_, token) => improveGeneratedFiles(files, sampled, model, token, root)
    );
    if (improved.length !== files.length) {
      logger.warn(`AI improver returned ${improved.length} files for ${files.length} inputs — skipping improvement`);
      return files;
    }
    const rejected = improved.filter((f, i) => f.content === files[i].content).length;
    await recordAICall(root, 'withAIImprovement', model.id, rejected > 0);
    return improved;
  } catch {
    return files;
  }
}

/** Merge generated files with existing files on disk (non-destructive). */
async function mergeFiles(root: string, files: GeneratedFile[]): Promise<GeneratedFile[]> {
  const merged: GeneratedFile[] = [];
  for (const file of files) {
    const abs = path.join(root, file.path);
    if (await pathExists(abs)) {
      const existing = (await readText(abs)) ?? '';
      if (existing.trim()) {
        const { content } = mergeWithExisting(file.content, existing);
        merged.push({ path: file.path, content });
        continue;
      }
    }
    merged.push(file);
  }
  return merged;
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
        await recordScore(root, { date: new Date().toISOString(), score: report.score, issues: report.issues.length, command: 'scanProject' });
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
        const draft = generateInstructions(scan, targets);
        const merged = await mergeFiles(root, draft);
        const improved = await withAIImprovement(root, scan, merged);
        const { accepted } = await presentDiffAndConfirm(root, improved, deps.context);
        if (accepted.length === 0) return;
        const written = await writeFiles(root, accepted);
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
        const title = await vscode.window.showInputBox({ prompt: 'Spec title', placeHolder: 'e.g. Checkout flow' });
        if (!title) return;
        const folder = vscode.workspace.getConfiguration('aiToolkit').get<string>('sdd.docsFolder', 'docs/specs');
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
        const title = await vscode.window.showInputBox({ prompt: 'ADR title', placeHolder: 'e.g. Adopt PostgreSQL over MySQL' });
        if (!title) return;
        const folder = vscode.workspace.getConfiguration('aiToolkit').get<string>('adr.docsFolder', 'docs/adr');
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
        const target = uri?.fsPath ?? vscode.window.activeTextEditor?.document.uri.fsPath;
        if (!target) {
          void vscode.window.showWarningMessage('Open or right-click a source file first.');
          return;
        }
        const scan = await scanProject(root);
        const rel = path.relative(root, target);
        let targetContent: string | undefined;
        try { targetContent = await fs.readFile(target, 'utf-8'); } catch { /* ignore */ }
        const draft = generateTestSuite({ scan, targetFile: rel, targetContent });
        const improved = await withAIImprovement(root, scan, draft);
        const { accepted } = await presentDiffAndConfirm(root, improved, deps.context);
        if (accepted.length === 0) return;
        const written = await writeFiles(root, accepted);
        void vscode.window.showInformationMessage(`Generated ${written.length} test file(s) for ${path.basename(target)}.`);
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.generateArchitectureDiagram', () =>
      withRoot(async (root) => {
        const scan = await scanProject(root);
        const folder = vscode.workspace.getConfiguration('aiToolkit').get<string>('diagrams.folder', 'docs/architecture');
        const draft = [await generateArchitectureDiagram(scan, folder)];
        const improved = await withAIImprovement(root, scan, draft);
        const { accepted } = await presentDiffAndConfirm(root, improved, deps.context);
        if (accepted.length === 0) return;
        const [absPath] = await writeFiles(root, accepted);
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
          validateInput: (v) => /^[a-z][a-z0-9-]*$/.test(v) ? null : 'Use kebab-case starting with a letter.',
        });
        if (!featureName) return;
        const scan = await scanProject(root);
        const draft = generateFeatureScaffold({ scan, parentDir, featureName });
        const improved = await withAIImprovement(root, scan, draft);
        const { accepted } = await presentDiffAndConfirm(root, improved, deps.context);
        if (accepted.length === 0) return;
        const written = await writeFiles(root, accepted);
        void vscode.window.showInformationMessage(`Scaffolded feature "${featureName}" (${written.length} files).`);
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
        const draft = generateDocsSite(scan);
        const improved = await withAIImprovement(root, scan, draft);
        const { accepted } = await presentDiffAndConfirm(root, improved, deps.context);
        if (accepted.length === 0) return;
        const written = await writeFiles(root, accepted);
        void vscode.window.showInformationMessage(`Documentation site generated (${written.length} files). Run "cd docs && npm install && npm run docs:dev".`);
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.enrichWithAI', () =>
      withRoot(async (root) => {
        if (!(await isAIAvailable())) {
          void vscode.window.showInformationMessage(
            'No AI model found in your IDE. Install GitHub Copilot or Claude Code to use this feature.',
            'Learn More'
          ).then((choice) => {
            if (choice === 'Learn More') {
              void vscode.env.openExternal(vscode.Uri.parse('https://marketplace.visualstudio.com/items?itemName=GitHub.copilot'));
            }
          });
          return;
        }
        const model = await getAvailableModel();
        if (!model) return;

        const scan = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: 'AI Toolkit: scanning project...' },
          () => scanProject(root)
        );

        const insights = await vscode.window.withProgress(
          { location: vscode.ProgressLocation.Notification, title: `AI Toolkit: analyzing with ${model.id}...`, cancellable: true },
          (_, token) => analyzeProjectWithAI(scan, model, token)
        );

        await recordAICall(root, 'enrichWithAI', model.id, false);

        const draft = generateInstructions(scan, ['claude'], insights);
        const merged = await mergeFiles(root, draft);
        const { accepted } = await presentDiffAndConfirm(root, merged, deps.context);
        if (accepted.length === 0) return;
        const written = await writeFiles(root, accepted);

        const choice = await vscode.window.showInformationMessage('CLAUDE.md enriched with AI-detected patterns.', 'Open CLAUDE.md');
        if (choice === 'Open CLAUDE.md' && written[0]) {
          const doc = await vscode.workspace.openTextDocument(written[0]);
          await vscode.window.showTextDocument(doc);
        }
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.generateOnboarding', () =>
      withRoot(async (root) => {
        const scan = await scanProject(root);
        const draft = [generateOnboarding(scan)];
        const improved = await withAIImprovement(root, scan, draft);
        const { accepted } = await presentDiffAndConfirm(root, improved, deps.context);
        if (accepted.length === 0) return;
        const [absPath] = await writeFiles(root, accepted);
        const doc = await vscode.workspace.openTextDocument(absPath);
        await vscode.window.showTextDocument(doc);
        void vscode.window.showInformationMessage('ONBOARDING.md generated.');
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.generatePRContext', () =>
      withRoot(async (root) => {
        if (!(await isGitRepo(root))) {
          void vscode.window.showWarningMessage('This command requires a git repository.');
          return;
        }
        const detected = await currentBranch(root);
        const branch = await vscode.window.showInputBox({
          prompt: 'Branch name',
          value: detected ?? undefined,
          placeHolder: 'feature/my-feature',
        });
        if (!branch) return;
        const base = await defaultBaseBranch(root);
        const diffStat = (await diffAgainst(base, root)) ?? '(no diff available)';
        const scan = await scanProject(root);
        const file = generatePRContext(scan, diffStat, branch);
        const [absPath] = await writeFiles(root, [file]);
        const doc = await vscode.workspace.openTextDocument(absPath);
        await vscode.window.showTextDocument(doc);
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.detectDocGaps', () =>
      withRoot(async (root) => {
        const scan = await scanProject(root);
        const claudeMdPath = path.join(root, 'CLAUDE.md');
        const claudeContent = (await readText(claudeMdPath)) ?? '';
        if (!claudeContent) {
          void vscode.window.showWarningMessage('CLAUDE.md not found. Generate it first with "AI Toolkit: Generate AI Instructions".');
          return;
        }
        const report = await analyzeDocGaps(scan, claudeContent);
        if (report.gaps.length === 0) {
          void vscode.window.showInformationMessage(`Documentation is up-to-date. Score: ${report.score}/100.`);
          return;
        }
        logger.info(`=== Documentation gaps (score: ${report.score}/100) ===`);
        for (const g of report.gaps) {
          logger.info(`[${g.severity.toUpperCase()}] ${g.description}`);
        }
        void vscode.window.showWarningMessage(
          `Found ${report.gaps.length} documentation gap(s). Score: ${report.score}/100.`,
          'Show Details'
        ).then((choice) => {
          if (choice === 'Show Details') logger.show();
        });
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.showMetrics', () =>
      withRoot(async (root) => {
        const metrics = await getMetrics(root);
        showMetricsWebview(metrics, deps.context);
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.editOverrides', () =>
      withRoot(async (root) => {
        const overridesPath = path.join(root, '.aitoolkit', 'overrides.json');
        try {
          await fs.access(overridesPath);
        } catch {
          const dir = path.dirname(overridesPath);
          const dirExisted = await fs.access(dir).then(() => true).catch(() => false);
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(overridesPath, JSON.stringify({
            conventions: {},
            frameworks: [],
            hotspots: { exclude: [] },
            patterns: {},
          }, null, 2), 'utf-8');
          if (!dirExisted) {
            const { ensureGitignoreEntry } = await import('../utils/fs');
            await ensureGitignoreEntry(root, '.aitoolkit/').catch(() => { /* best-effort */ });
          }
        }
        const doc = await vscode.workspace.openTextDocument(overridesPath);
        await vscode.window.showTextDocument(doc);
      })
    )
  );

  subs.push(
    vscode.commands.registerCommand('aiToolkit.compareWithAI', () =>
      withRoot(async (root) => {
        if (!(await isAIAvailable())) {
          void vscode.window.showInformationMessage('No AI model found in your IDE.');
          return;
        }
        const model = await getAvailableModel();
        if (!model) return;

        const question = await vscode.window.showInputBox({
          prompt: 'Ask a question about your project',
          placeHolder: 'e.g. How should I add authentication?',
        });
        if (!question) return;

        const claudeMdPath = path.join(root, 'CLAUDE.md');
        const context = (await readText(claudeMdPath)) ?? '';

        const { sendPrompt } = await import('../ai/lm-client');
        const cts = new vscode.CancellationTokenSource();

        const [withCtx, withoutCtx] = await Promise.all([
          context
            ? sendPrompt(model, `Project context:\n${context}\n\n---\n\nQuestion: ${question}`, cts.token)
            : Promise.resolve('(no CLAUDE.md found — generate one first)'),
          sendPrompt(model, question, cts.token),
        ]);

        const panel = vscode.window.createWebviewPanel(
          'aiToolkit.compare',
          'AI Response: With vs. Without Context',
          vscode.ViewColumn.Active,
          { enableScripts: false, localResourceRoots: [] }
        );

        const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        panel.webview.html = `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
<style>
body{font-family:-apple-system,sans-serif;padding:20px;color:var(--vscode-foreground);background:var(--vscode-editor-background);}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
h2{font-size:13px;text-transform:uppercase;opacity:.6;margin:0 0 12px;}
.box{background:var(--vscode-panel-background,#1e1e1e);border:1px solid var(--vscode-panel-border);border-radius:8px;padding:16px;}
pre{white-space:pre-wrap;font-family:inherit;margin:0;font-size:13px;}
</style></head><body>
<h1 style="font-size:14px;opacity:.7;text-transform:uppercase;margin:0 0 20px">Question: ${esc(question)}</h1>
<div class="grid">
<div class="box"><h2>✓ With CLAUDE.md</h2><pre>${esc(withCtx)}</pre></div>
<div class="box"><h2>✗ Without context</h2><pre>${esc(withoutCtx)}</pre></div>
</div></body></html>`;
      })
    )
  );

  return subs;
}
