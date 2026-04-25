import * as vscode from 'vscode';

let channel: vscode.OutputChannel | undefined;

function getChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel('AI Toolkit');
  }
  return channel;
}

function format(level: string, message: string, meta?: unknown): string {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level}] ${message}`;
  if (meta === undefined) return base;
  try {
    return `${base} ${JSON.stringify(meta)}`;
  } catch {
    return `${base} <unserializable meta>`;
  }
}

export const logger = {
  info(message: string, meta?: unknown): void {
    getChannel().appendLine(format('INFO', message, meta));
  },
  warn(message: string, meta?: unknown): void {
    getChannel().appendLine(format('WARN', message, meta));
  },
  error(message: string, error?: unknown): void {
    const detail = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : error;
    getChannel().appendLine(format('ERROR', message, detail));
  },
  show(): void {
    getChannel().show(true);
  },
  dispose(): void {
    channel?.dispose();
    channel = undefined;
  },
};
