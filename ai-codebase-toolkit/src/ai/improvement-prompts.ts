import { GeneratedFile } from '../core/types';

function fileTypeHint(filePath: string): string {
  const base = filePath.split('/').pop() ?? filePath;
  if (base === 'CLAUDE.md') return 'project context file for the Claude AI assistant';
  if (base === '.cursorrules') return 'project rules file for Cursor AI IDE';
  if (base === 'AGENTS.md') return 'project context file for AI coding agents';
  if (base.includes('copilot-instructions')) return 'GitHub Copilot instructions file';
  if (base.endsWith('.test.ts') || base.endsWith('.spec.ts') || base.endsWith('.test.js') || base.endsWith('.spec.js'))
    return 'test file';
  if (filePath.includes('adr/') && base.endsWith('.md')) return 'Architecture Decision Record';
  if (filePath.includes('specs/') && base.endsWith('.md')) return 'Software Design Document spec';
  if (filePath.includes('architecture') && (base.endsWith('.md') || base.endsWith('.mermaid')))
    return 'architecture diagram';
  if (base.endsWith('.ts') || base.endsWith('.tsx') || base.endsWith('.js') || base.endsWith('.jsx'))
    return 'TypeScript/JavaScript source file';
  if (base.endsWith('.go')) return 'Go source file';
  if (base.endsWith('.py')) return 'Python source file';
  if (base.endsWith('.java')) return 'Java source file';
  if (base.endsWith('.cs')) return 'C# source file';
  if (base.endsWith('.cpp') || base.endsWith('.cc') || base.endsWith('.cxx')) return 'C++ source file';
  if (base.endsWith('.c') || base.endsWith('.h')) return 'C source file';
  return 'generated file';
}

// --- Route helpers ---

function isTestFile(filePath: string): boolean {
  const base = filePath.split('/').pop() ?? filePath;
  return (
    base.endsWith('.test.ts') ||
    base.endsWith('.spec.ts') ||
    base.endsWith('.test.js') ||
    base.endsWith('.spec.js') ||
    base.endsWith('.test.tsx') ||
    base.endsWith('.spec.tsx') ||
    filePath.includes('__tests__') ||
    filePath.includes('/tests/') ||
    filePath.startsWith('tests/')
  );
}

function isInstructionFile(filePath: string): boolean {
  const base = filePath.split('/').pop() ?? filePath;
  return (
    base === 'CLAUDE.md' ||
    base === '.cursorrules' ||
    base === 'AGENTS.md' ||
    base.includes('copilot-instructions') ||
    base === 'ONBOARDING.md' ||
    base === 'pr-brief.md'
  );
}

function isDiagram(filePath: string): boolean {
  const base = filePath.split('/').pop() ?? filePath;
  return (
    base.endsWith('.mermaid') ||
    (filePath.includes('architecture') && base.endsWith('.md')) ||
    base.includes('diagram')
  );
}

// --- Specialized prompts ---

function testImprovementPrompt(file: GeneratedFile, fileBlock: string): string {
  const hint = fileTypeHint(file.path);
  const fileName = file.path.split('/').pop() ?? file.path;

  // Extract the "TARGET FILE" block if present in fileBlock (set by improver for test files)
  return `You are a senior software engineer improving an auto-generated ${hint}.
The scaffold below was produced by static analysis. Your task is to replace all placeholder assertions with real, meaningful test cases.

GENERATED TEST FILE — ${file.path}:
${file.content}

PROJECT FILES (use these to understand real types, functions, and behavior):
${fileBlock || '(no project files were sampled)'}

Improvement rules:
1. Keep every \`describe\` and \`it\` block — do NOT remove test cases.
2. Replace every \`expect(true).toBe(true)\` and every \`/* TODO */\` with a real assertion that tests the actual exported function or class behavior.
3. For each exported function, generate at least one meaningful test case: happy path, edge case, or error case.
4. Use the correct import names from the source file — do NOT leave \`/* TODO */\` in the import.
5. Do NOT wrap your response in markdown code fences or add any explanation.
6. Do NOT add new \`describe\` blocks that were not in the original file.
7. Return ONLY the improved file content, ready to be written to disk.

Improved ${fileName}:`;
}

function instructionImprovementPrompt(file: GeneratedFile, fileBlock: string): string {
  const hint = fileTypeHint(file.path);
  const fileName = file.path.split('/').pop() ?? file.path;
  return `You are a senior software engineer improving an auto-generated ${hint}.
A static-analysis tool produced the file below. Your task is to replace generic placeholders with specific, accurate details based on the actual project files provided.

GENERATED FILE — ${file.path}:
${file.content}

PROJECT FILES (use these to infer real patterns, file paths, entry points, and conventions):
${fileBlock || '(no project files were sampled)'}

Improvement rules:
1. Keep the EXACT same document structure and ALL existing section headers — do NOT remove any heading.
2. Keep the manifest comment tag (e.g. \`<!-- aitk-manifest: ... -->\`) exactly as-is at the top.
3. Replace "TODO", "unknown", and vague descriptions with concrete observations from the project files (real file paths, function names, type names, patterns).
4. Replace placeholder paths like \`src/index.ts\` with the actual paths visible in the sampled files.
5. Do NOT add new sections that were not in the original file.
6. Do NOT wrap your response in markdown code fences or add any explanation.
7. Return ONLY the improved file content, ready to be written to disk.

Improved ${fileName}:`;
}

function diagramImprovementPrompt(file: GeneratedFile, fileBlock: string): string {
  const fileName = file.path.split('/').pop() ?? file.path;
  return `You are a senior software engineer improving an auto-generated architecture diagram.
The Mermaid diagram below was produced by static folder-structure analysis. Your task is to update it to reflect the REAL module dependencies visible in the sampled project files.

GENERATED DIAGRAM — ${file.path}:
${file.content}

PROJECT FILES (use import/require statements to infer real dependencies):
${fileBlock || '(no project files were sampled)'}

Improvement rules:
1. Update the Mermaid diagram nodes and edges to reflect actual module dependencies (imports/requires) visible in the sampled files.
2. Remove nodes that represent folders with no code (empty or purely structural).
3. Do NOT add nodes or edges that are not evidenced by the sampled files.
4. Keep the same Mermaid diagram type (graph, flowchart, etc.).
5. Do NOT wrap your response in markdown code fences or add any explanation.
6. Return ONLY the improved file content, ready to be written to disk.

Improved ${fileName}:`;
}

function genericImprovementPrompt(file: GeneratedFile, fileBlock: string): string {
  const hint = fileTypeHint(file.path);
  const fileName = file.path.split('/').pop() ?? file.path;
  return `You are a senior software engineer reviewing an auto-generated ${hint}.
A static-analysis tool produced the file below. Your task is to improve it by replacing generic placeholders with specific, accurate details based on the actual project files provided.

GENERATED FILE — ${file.path}:
${file.content}

PROJECT FILES (use these to infer real patterns, types, entry points, and structure):
${fileBlock || '(no project files were sampled)'}

Improvement rules:
1. Keep the same document structure and all existing section headers.
2. Replace "TODO", "unknown", and vague descriptions with concrete observations from the project files (real file paths, function names, type names, patterns).
3. Remove or label as "N/A" any sections that clearly do not apply to this project.
4. Do NOT add new sections that were not in the original file.
5. Do NOT wrap your response in markdown code fences or add any explanation.
6. Return ONLY the improved file content, ready to be written to disk.

Improved ${fileName}:`;
}

// --- Public router ---

/**
 * Routes to a specialized improvement prompt based on the file type,
 * then falls back to the generic prompt.
 */
export function IMPROVEMENT_PROMPT(file: GeneratedFile, fileBlock: string): string {
  if (isTestFile(file.path)) return testImprovementPrompt(file, fileBlock);
  if (isInstructionFile(file.path)) return instructionImprovementPrompt(file, fileBlock);
  if (isDiagram(file.path)) return diagramImprovementPrompt(file, fileBlock);
  return genericImprovementPrompt(file, fileBlock);
}
