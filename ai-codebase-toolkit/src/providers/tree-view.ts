import * as vscode from 'vscode';
import { TOOLS } from '../tools/registry';
import { ToolDescriptor } from '../core/types';

class ToolItem extends vscode.TreeItem {
  constructor(public readonly tool: ToolDescriptor) {
    super(tool.label, vscode.TreeItemCollapsibleState.None);
    this.description = tool.category;
    this.tooltip = tool.description;
    this.iconPath = tool.icon ? new vscode.ThemeIcon(tool.icon) : undefined;
    this.command = { command: tool.command, title: tool.label };
    this.contextValue = 'aiToolkit.tool';
  }
}

class CategoryItem extends vscode.TreeItem {
  constructor(public readonly category: string, public readonly tools: ToolDescriptor[]) {
    super(label(category), vscode.TreeItemCollapsibleState.Expanded);
    this.iconPath = new vscode.ThemeIcon(icon(category));
  }
}

function label(category: string): string {
  switch (category) {
    case 'context':
      return 'Context';
    case 'docs':
      return 'Documentation';
    case 'scaffold':
      return 'Scaffold';
    case 'analysis':
      return 'Analysis';
    default:
      return category;
  }
}

function icon(category: string): string {
  switch (category) {
    case 'context':
      return 'symbol-namespace';
    case 'docs':
      return 'book';
    case 'scaffold':
      return 'tools';
    case 'analysis':
      return 'graph';
    default:
      return 'circle-outline';
  }
}

export class ToolsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private readonly _emitter = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._emitter.event;

  refresh(): void {
    this._emitter.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): vscode.TreeItem[] {
    if (!element) {
      const cats = [...new Set(TOOLS.map((t) => t.category))];
      return cats.map((c) => new CategoryItem(c, TOOLS.filter((t) => t.category === c)));
    }
    if (element instanceof CategoryItem) {
      return element.tools.map((t) => new ToolItem(t));
    }
    return [];
  }
}
