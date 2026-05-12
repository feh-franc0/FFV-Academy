import * as vscode from 'vscode';
import { AIInsights, ScanResult } from '../core/types';
import { buildPromptBlock, fallback, parseAIInsightsResponse, sampleProjectFiles } from './file-sampler';
import { sendPrompt } from './lm-client';
import { PATTERN_ANALYSIS_PROMPT } from './prompts';

export async function analyzeProjectWithAI(
  scan: ScanResult,
  model: vscode.LanguageModelChat,
  token: vscode.CancellationToken
): Promise<AIInsights> {
  const files = await sampleProjectFiles(scan.rootPath, scan);
  const fileBlock = buildPromptBlock(files);
  const prompt = PATTERN_ANALYSIS_PROMPT(fileBlock);

  let raw: string;
  try {
    raw = await sendPrompt(model, prompt, token);
  } catch {
    return fallback(model.id);
  }

  return parseAIInsightsResponse(raw, model.id);
}
