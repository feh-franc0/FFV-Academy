export function PATTERN_ANALYSIS_PROMPT(fileBlock: string): string {
  return `You are analyzing a software project to help an AI assistant understand it better.
Below are sampled files from the project. Based ONLY on what you can observe in these files, describe the patterns you find.

IMPORTANT: Respond with ONLY a valid JSON object. No markdown, no explanation, no code fences.
The JSON must have exactly these fields:

{
  "architecturalStyle": "short description of the architecture (e.g. 'layered: services in src/services/, controllers in src/controllers/', 'MVC', 'hexagonal', 'flat scripts')",
  "errorHandling": "how errors are handled (e.g. 'centralized middleware in src/middleware/error.ts', 'try/catch in every handler', 'Result type pattern', 'not visible in sampled files')",
  "asyncPattern": "async convention (e.g. 'async/await throughout', 'callback-based', 'mixed Promise chains and await', 'not applicable')",
  "validationPattern": "input validation approach (e.g. 'Zod schemas at route layer', 'class-validator DTOs', 'manual checks', 'none detected')",
  "internalNaming": "naming conventions inside files for variables, functions, classes, constants (e.g. 'camelCase functions, PascalCase classes, UPPER_SNAKE_CASE constants')",
  "knownDebt": ["array of strings — each a specific technical debt item or inconsistency detected; empty array if none found"],
  "additionalPatterns": "any other pattern, convention, or constraint an AI assistant working on this codebase should know — empty string if nothing additional"
}

PROJECT FILES:
${fileBlock}`;
}
