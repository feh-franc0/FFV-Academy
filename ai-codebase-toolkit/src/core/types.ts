/**
 * Shared domain types.
 * Keep this file framework-agnostic — no vscode imports here.
 */

export type Language =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'java'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'csharp'
  | 'unknown';

export type Framework =
  | 'next'
  | 'react'
  | 'vue'
  | 'svelte'
  | 'nest'
  | 'express'
  | 'fastify'
  | 'django'
  | 'flask'
  | 'fastapi'
  | 'laravel'
  | 'spring'
  | 'rails'
  | 'expo'
  | 'react-native'
  | 'unknown';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'pip' | 'poetry' | 'go' | 'cargo' | 'composer' | 'unknown';

export type NamingConvention = 'kebab-case' | 'camelCase' | 'PascalCase' | 'snake_case' | 'mixed';

export interface ProjectScripts {
  build?: string;
  test?: string;
  lint?: string;
  format?: string;
  dev?: string;
  start?: string;
}

export interface StackInfo {
  language: Language;
  frameworks: Framework[];
  packageManager: PackageManager;
  scripts: ProjectScripts;
  hasTypeScript: boolean;
  isMonorepo: boolean;
  testFramework?: string;
}

export interface StructureInfo {
  rootFolders: string[];
  sourceRoot: string;
  hasTests: boolean;
  hasDocs: boolean;
  hasAdr: boolean;
  hasSpecs: boolean;
  fileCount: number;
  largeFolders: { path: string; count: number }[];
}

export interface ConventionInfo {
  fileNaming: NamingConvention;
  consistency: number; // 0..1
  importStyle: 'absolute' | 'relative' | 'mixed';
}

export interface ScanResult {
  rootPath: string;
  stack: StackInfo;
  structure: StructureInfo;
  conventions: ConventionInfo;
  detectedAITools: AIToolPresence;
}

export interface AIToolPresence {
  claude: boolean;
  cursor: boolean;
  copilot: boolean;
  amazonq: boolean;
  agents: boolean;
}

export interface ReadinessIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  fixCommand?: string;
}

export interface ReadinessReport {
  score: number; // 0..100
  passed: ReadinessIssue[];
  issues: ReadinessIssue[];
  scannedAt: string;
}

export type InstructionTarget = 'claude' | 'cursor' | 'copilot' | 'amazonq' | 'agents';

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface ToolDescriptor {
  id: string;
  label: string;
  description: string;
  command: string;
  icon?: string;
  category: 'context' | 'docs' | 'scaffold' | 'analysis';
}
