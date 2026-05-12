import * as vscode from 'vscode';

export async function getAvailableModel(): Promise<vscode.LanguageModelChat | null> {
  const models = await vscode.lm.selectChatModels();
  return models[0] ?? null;
}

export async function isAIAvailable(): Promise<boolean> {
  const models = await vscode.lm.selectChatModels();
  return models.length > 0;
}

export async function sendPrompt(
  model: vscode.LanguageModelChat,
  prompt: string,
  token: vscode.CancellationToken
): Promise<string> {
  const messages = [vscode.LanguageModelChatMessage.User(prompt)];
  const response = await model.sendRequest(messages, {}, token);
  let text = '';
  for await (const chunk of response.text) {
    text += chunk;
  }
  return text;
}
