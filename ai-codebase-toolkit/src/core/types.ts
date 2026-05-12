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
  | 'cpp'
  | 'c'
  | 'unknown';

export type Framework =
  | 'next'
  | 'remix'
  | 'angular'
  | 'vite'
  | 'react'
  | 'vue'
  | 'svelte'
  | 'nest'
  | 'express'
  | 'fastify'
  | 'hono'
  | 'django'
  | 'flask'
  | 'fastapi'
  | 'laravel'
  | 'spring'
  | 'quarkus'
  | 'aspnet'
  | 'blazor'
  | 'rails'
  | 'expo'
  | 'react-native'
  | 'unknown';

export type PackageManager =
  | 'npm'
  | 'yarn'
  | 'pnpm'
  | 'bun'
  | 'pip'
  | 'poetry'
  | 'go'
  | 'cargo'
  | 'composer'
  | 'maven'
  | 'gradle'
  | 'dotnet'
  | 'make'
  | 'cmake'
  | 'unknown';

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
  uncoveredFilesCount?: number;
}

export interface ConventionInfo {
  fileNaming: NamingConvention;
  consistency: number; // 0..1
  importStyle: 'absolute' | 'relative' | 'mixed';
  identifierNaming?: string;   // e.g. "camelCase vars, PascalCase classes"
  formatter?: string;          // e.g. "prettier", "black", "gofmt"
  indentStyle?: 'tabs' | 'spaces';
  indentSize?: number;
}

export interface GitHistoryInfo {
  isGitRepo: boolean;
  hotFiles: string[];            // top changed files (relative paths)
  commitFrequency: 'high' | 'medium' | 'low';
  conventionalCommits: boolean;
  lastActivity: string;          // ISO date of last commit
  totalCommits: number;
}

export interface MonorepoPackage {
  name: string;
  path: string;  // relative path from root
  language: Language;
}

export interface MonorepoInfo {
  type: 'npm-workspaces' | 'turborepo' | 'nx' | 'lerna' | 'maven-multi' | 'go-multi' | 'none';
  packages: MonorepoPackage[];
}

export interface ScanResult {
  rootPath: string;
  stack: StackInfo;
  structure: StructureInfo;
  conventions: ConventionInfo;
  detectedAITools: AIToolPresence;
  gitHistory?: GitHistoryInfo;
  monorepo?: MonorepoInfo;
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
  autoFixable?: boolean;
}

export interface LocalMetricEntry {
  date: string;
  score: number;
  issues: number;
  command: string;
}

export interface LocalMetrics {
  history: LocalMetricEntry[];
  aiCalls: { date: string; command: string; model: string; rejected: boolean }[];
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

export interface AIInsights {
  modelId: string;
  analyzedAt: string;
  architecturalStyle: string;
  errorHandling: string;
  asyncPattern: string;
  validationPattern: string;
  internalNaming: string;
  knownDebt: string[];
  additionalPatterns: string;
}

export interface ToolDescriptor {
  id: string;
  label: string;
  description: string;
  command: string;
  icon?: string;
  category: 'context' | 'docs' | 'scaffold' | 'analysis';
}
