import * as vscode from 'vscode';
import { InstructionTarget } from '../core/types';

interface TargetItem extends vscode.QuickPickItem {
  target: InstructionTarget;
}

const ALL: TargetItem[] = [
  { target: 'claude',  label: '$(sparkle) CLAUDE.md',                            description: 'Claude Code',     picked: true },
  { target: 'cursor',  label: '$(edit) .cursorrules',                            description: 'Cursor',          picked: true },
  { target: 'copilot', label: '$(github) .github/copilot-instructions.md',       description: 'GitHub Copilot',  picked: true },
  { target: 'amazonq', label: '$(cloud) .amazonq/rules/project.md',              description: 'Amazon Q',        picked: true },
  { target: 'agents',  label: '$(organization) AGENTS.md',                       description: 'Cline / Continue / Aider', picked: true },
];

export async function pickInstructionTargets(
  defaults: InstructionTarget[]
): Promise<InstructionTarget[] | undefined> {
  const items = ALL.map((i) => ({ ...i, picked: defaults.includes(i.target) }));
  const picked = await vscode.window.showQuickPick(items, {
    canPickMany: true,
    title: 'Generate AI instructions',
    placeHolder: 'Select which AI assistant files to generate or update',
  });
  if (!picked || picked.length === 0) return undefined;
  return picked.map((p) => p.target);
}
