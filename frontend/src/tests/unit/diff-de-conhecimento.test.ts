import { describe, it, expect } from 'vitest';
import {
  computeDiffSummary,
  MOCK_DIFF_ENTRIES,
  type QuizDiffEntry,
} from '@/lib/diff-de-conhecimento';

describe('computeDiffSummary', () => {
  it('lista vazia → zeros', () => {
    const s = computeDiffSummary([]);
    expect(s.totalQuizzes).toBe(0);
    expect(s.studentAvg).toBe(0);
    expect(s.vsChatGPT).toBe('tied');
  });

  it('1 quiz onde aluno está claramente acima do ChatGPT', () => {
    const e: QuizDiffEntry = {
      moduleSlug: 'x',
      moduleTitle: 'X',
      baseSlug: 'medvet',
      studentScore: 90,
      chatgptScore: 70,
      geminiScore: 75,
      studentEdge: [],
      studentGap: [],
    };
    const s = computeDiffSummary([e]);
    expect(s.vsChatGPT).toBe('ahead');
    expect(s.pointsAheadOfChatGPT).toBe(20);
  });

  it('aluno empata (diff ≤2 pontos) → "tied"', () => {
    const e: QuizDiffEntry = {
      moduleSlug: 'x',
      moduleTitle: 'X',
      baseSlug: 'medvet',
      studentScore: 80,
      chatgptScore: 79,
      geminiScore: 80,
      studentEdge: [],
      studentGap: [],
    };
    const s = computeDiffSummary([e]);
    expect(s.vsChatGPT).toBe('tied');
    expect(s.vsGemini).toBe('tied');
  });

  it('aluno claramente atrás → "behind"', () => {
    const e: QuizDiffEntry = {
      moduleSlug: 'x',
      moduleTitle: 'X',
      baseSlug: 'medvet',
      studentScore: 50,
      chatgptScore: 85,
      geminiScore: 90,
      studentEdge: [],
      studentGap: [],
    };
    const s = computeDiffSummary([e]);
    expect(s.vsChatGPT).toBe('behind');
    expect(s.pointsAheadOfChatGPT).toBe(-35);
  });

  it('MOCK_DIFF_ENTRIES tem 3 entradas com baseSlug medvet', () => {
    expect(MOCK_DIFF_ENTRIES.length).toBe(3);
    MOCK_DIFF_ENTRIES.forEach(e => {
      expect(e.baseSlug).toBe('medicina-veterinaria');
    });
  });

  it('média do MOCK reflete narrativa "aluno geralmente competitivo"', () => {
    const s = computeDiffSummary(MOCK_DIFF_ENTRIES);
    // Mock student avg: (90+80+70)/3 = 80
    // Mock chatgpt avg: (88+72+92)/3 = 84
    // Mock gemini avg: (85+75+90)/3 = 83.3 → 83
    expect(s.studentAvg).toBe(80);
    expect(s.chatgptAvg).toBe(84);
    expect(s.geminiAvg).toBe(83);
  });
});
