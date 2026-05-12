import * as vscode from 'vscode';
import { GeneratedFile } from '../core/types';
import { SampledFile } from './file-sampler';
import { IMPROVEMENT_PROMPT } from './improvement-prompts';
import { sendPrompt } from './lm-client';
import { runValidators } from './validators/index';
import { validateLengthAgainstOriginal } from './validators/length';

export async function improveGeneratedFile(
  file: GeneratedFile,
  sampledFiles: SampledFile[],
  model: vscode.LanguageModelChat,
  token: vscode.CancellationToken,
  rootPath: string
): Promise<GeneratedFile> {
  const fileBlock = sampledFiles.map((f) => `=== ${f.rel} ===\n${f.content}`).join('\n\n');
  const prompt = IMPROVEMENT_PROMPT(file, fileBlock);
  try {
    const raw = await sendPrompt(model, prompt, token);
    const improved = raw.trim();
    // If the model returned nothing meaningful, keep the original
    if (!improved || improved.length < 20) return file;

    // Validate: reject if AI response is drastically shorter than the original
    const lengthCheck = validateLengthAgainstOriginal(improved, file.content);
    if (!lengthCheck.valid) return file;

    // Run structural/path validators
    const validationResult = await runValidators({ path: file.path, content: improved }, rootPath);
    if (!validationResult.valid) return file;

    const content = improved.endsWith('\n') ? improved : improved + '\n';
    return { path: file.path, content };
  } catch {
    return file;
  }
}

export async function improveGeneratedFiles(
  files: GeneratedFile[],
  sampledFiles: SampledFile[],
  model: vscode.LanguageModelChat,
  token: vscode.CancellationToken,
  rootPath: string
): Promise<GeneratedFile[]> {
  const results: GeneratedFile[] = [];
  for (const file of files) {
    if (token.isCancellationRequested) {
      results.push(file);
    } else {
      results.push(await improveGeneratedFile(file, sampledFiles, model, token, rootPath));
    }
  }
  return results;
}
