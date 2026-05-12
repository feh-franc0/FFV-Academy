import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Web Audio API antes de importar o módulo
const mockOscillator = {
  connect: vi.fn(),
  type: 'sine' as OscillatorType,
  frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  start: vi.fn(),
  stop: vi.fn(),
};
const mockGain = {
  connect: vi.fn(),
  gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
};
const mockCtx = {
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGain),
  destination: {},
  currentTime: 0,
  state: 'running' as AudioContextState,
  resume: vi.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  vi.stubGlobal('AudioContext', vi.fn(() => mockCtx));
  vi.clearAllMocks();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sounds module', () => {
  it('unlockAudio não joga erro sem contexto audio', async () => {
    const { unlockAudio } = await import('@/lib/sounds');
    expect(() => unlockAudio()).not.toThrow();
  });

  it('playXPCoin não joga erro com contexto mockado', async () => {
    const { unlockAudio, playXPCoin } = await import('@/lib/sounds');
    unlockAudio();
    expect(() => playXPCoin()).not.toThrow();
  });

  it('playLevelUp não joga erro', async () => {
    const { unlockAudio, playLevelUp } = await import('@/lib/sounds');
    unlockAudio();
    expect(() => playLevelUp()).not.toThrow();
  });

  it('playBadge não joga erro', async () => {
    const { unlockAudio, playBadge } = await import('@/lib/sounds');
    unlockAudio();
    expect(() => playBadge()).not.toThrow();
  });

  it('playPop não joga erro', async () => {
    const { unlockAudio, playPop } = await import('@/lib/sounds');
    unlockAudio();
    expect(() => playPop()).not.toThrow();
  });

  it('sons não tocam sem unlockAudio chamado primeiro', async () => {
    // Reimport module em estado limpo
    vi.resetModules();
    const { playXPCoin } = await import('@/lib/sounds');
    playXPCoin(); // não deve criar oscilador pois unlocked=false
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });
});
