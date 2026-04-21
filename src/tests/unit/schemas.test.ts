/**
 * Zod schemas — validação estrita de boundaries.
 *
 * Garantimos que:
 * - Valores válidos passam
 * - Valores com tipo errado falham
 * - Payload oversize é recusado com mensagem clara
 * - Campos desconhecidos (prototype pollution) são rejeitados em strict()
 */

import { describe, it, expect } from 'vitest';
import {
  GameStateSchema, ReferralRecordSchema, DailyModuleStoredSchema, safeParseJSON,
  emailSchema, phoneBRSchema, UserProfileSchema, SimuladoAttemptSchema,
  CertificateRecordSchema,
} from '../../lib/schemas';

const VALID_STATE = {
  schemaVersion: 2,
  xp: 100, level: 2, streak: 3,
  lastStudyDate: null,
  completedModules: ['o-que-e-ia'],
  quizScores: {},
  badges: [], totalStudyTime: 0, startedAt: null,
  reviewCards: [], archivedCards: [], studyDays: [],
  freezes: 0, dailyGoal: 3,
  lastReviewDate: null, lastArticle: null,
  preferredHub: null, onboardedAt: null,
  articleProgress: {},
};

describe('GameStateSchema', () => {
  it('aceita estado válido', () => {
    const r = GameStateSchema.safeParse(VALID_STATE);
    expect(r.success).toBe(true);
  });

  it('rejeita xp string', () => {
    const r = GameStateSchema.safeParse({ ...VALID_STATE, xp: 'muito' });
    expect(r.success).toBe(false);
  });

  it('rejeita xp negativo', () => {
    const r = GameStateSchema.safeParse({ ...VALID_STATE, xp: -5 });
    expect(r.success).toBe(false);
  });

  it('rejeita completedModules não-array', () => {
    const r = GameStateSchema.safeParse({ ...VALID_STATE, completedModules: 'foo' });
    expect(r.success).toBe(false);
  });

  it('rejeita campos desconhecidos (strict) — bloqueio de prototype pollution', () => {
    const r = GameStateSchema.safeParse({ ...VALID_STATE, __proto__: { evil: 1 } });
    // Em strict(), __proto__ é tratado como chave desconhecida
    // (objetos literais em JS não propagam __proto__ como own-property, mas
    // strict rejeita qualquer campo não declarado)
    expect(r.success).toBe(false);
  });

  it('rejeita quizScores com shape errado', () => {
    const r = GameStateSchema.safeParse({
      ...VALID_STATE,
      quizScores: { slug: { score: 'a', total: 3, perfect: true } },
    });
    expect(r.success).toBe(false);
  });

  it('rejeita articleProgress com valor > 1', () => {
    const r = GameStateSchema.safeParse({
      ...VALID_STATE,
      articleProgress: { x: 1.5 },
    });
    expect(r.success).toBe(false);
  });
});

describe('ReferralRecordSchema', () => {
  it('aceita refId lowercase alfanumérico', () => {
    const r = ReferralRecordSchema.safeParse({
      refId: 'abc123',
      receivedAt: '2026-04-20T00:00:00Z',
      bonusGranted: false,
    });
    expect(r.success).toBe(true);
  });

  it('rejeita refId com injection', () => {
    const r = ReferralRecordSchema.safeParse({
      refId: '<script>',
      receivedAt: 'x',
      bonusGranted: false,
    });
    expect(r.success).toBe(false);
  });
});

describe('DailyModuleStoredSchema', () => {
  it('aceita formato válido', () => {
    const r = DailyModuleStoredSchema.safeParse({ date: '2026-04-20', slug: 'o-que-e-ia' });
    expect(r.success).toBe(true);
  });

  it('rejeita date mal formatado', () => {
    const r = DailyModuleStoredSchema.safeParse({ date: '20/04/2026', slug: 'x' });
    expect(r.success).toBe(false);
  });

  it('rejeita slug com caracteres inválidos', () => {
    const r = DailyModuleStoredSchema.safeParse({ date: '2026-04-20', slug: '<evil>' });
    expect(r.success).toBe(false);
  });
});

describe('safeParseJSON', () => {
  it('ok: true em payload válido dentro do limite', () => {
    const r = safeParseJSON(GameStateSchema, JSON.stringify(VALID_STATE), 10_000);
    expect(r.ok).toBe(true);
  });

  it('ok: false em JSON inválido', () => {
    const r = safeParseJSON(GameStateSchema, '{{{não-json', 10_000);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('JSON inválido');
  });

  it('ok: false quando payload excede maxBytes', () => {
    const big = JSON.stringify(VALID_STATE) + ' '.repeat(10_000);
    const r = safeParseJSON(GameStateSchema, big, 1_000);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('excede');
  });
});

// ─────────────────────────────────────────────────────────────────
// Auth / user schemas (adicionados em abril/2026)
// ─────────────────────────────────────────────────────────────────

describe('emailSchema', () => {
  it('aceita emails válidos', () => {
    ['a@b.co', 'fulano.da.silva@exemplo.com.br', 'test+tag@domain.io'].forEach(e => {
      expect(emailSchema.safeParse(e).success).toBe(true);
    });
  });

  it('rejeita inválidos', () => {
    ['', 'sem-arroba', 'a@', '@b.co', 'a b@c.com', 'a@<script>', 'a"@b.com'].forEach(e => {
      expect(emailSchema.safeParse(e).success).toBe(false);
    });
  });
});

describe('phoneBRSchema', () => {
  it('aceita com +55 DDI', () => {
    expect(phoneBRSchema.safeParse('+5511987654321').success).toBe(true);
  });

  it('aceita 55 sem + (ambíguo mas válido no regex)', () => {
    expect(phoneBRSchema.safeParse('5511987654321').success).toBe(true);
  });

  it('regex atual exige "5" ou "55" antes dos dígitos (DDI explícito)', () => {
    // O regex do brief é ^\+?55?\d{10,11}$ — o `55?` força "5" ou "55".
    // Phone sem DDI ("11987654321" — começa com "1") é rejeitado por isso.
    expect(phoneBRSchema.safeParse('11987654321').success).toBe(false);
    expect(phoneBRSchema.safeParse('5511987654321').success).toBe(true);
    // "5" sozinho + 10-11 dígitos também passa:
    expect(phoneBRSchema.safeParse('511987654321').success).toBe(true);
  });

  it('rejeita letras / caracteres especiais', () => {
    ['(11) 98765-4321', '+55 11 9xxxx', '11abc', '+55<script>'].forEach(p => {
      expect(phoneBRSchema.safeParse(p).success).toBe(false);
    });
  });
});

describe('UserProfileSchema', () => {
  const valid = {
    name: 'Fulano',
    email: 'fulano@exemplo.com',
    phone: '+5511987654321',
    createdAt: '2026-04-20T00:00:00Z',
    marketingConsent: false,
    paidProducts: ['simulado-aws-practitioner'],
  };

  it('aceita perfil válido', () => {
    expect(UserProfileSchema.safeParse(valid).success).toBe(true);
  });

  it('rejeita paidProducts com caracteres inválidos (injection)', () => {
    const bad = { ...valid, paidProducts: ['<script>'] };
    expect(UserProfileSchema.safeParse(bad).success).toBe(false);
  });

  it('rejeita marketingConsent como string', () => {
    const bad = { ...valid, marketingConsent: 'sim' };
    expect(UserProfileSchema.safeParse(bad).success).toBe(false);
  });

  it('strict bloqueia campo extra (prototype pollution)', () => {
    const bad = { ...valid, isAdmin: true };
    expect(UserProfileSchema.safeParse(bad).success).toBe(false);
  });
});

describe('SimuladoAttemptSchema', () => {
  it('aceita attempt válido', () => {
    expect(SimuladoAttemptSchema.safeParse({
      simuladoId: 'simulado-aws-practitioner',
      startedAt: '2026-04-20T00:00:00Z',
      answers: { 'clf-q1': 'A' },
    }).success).toBe(true);
  });

  it('rejeita optionId fora de A-E', () => {
    expect(SimuladoAttemptSchema.safeParse({
      simuladoId: 'simulado-aws-practitioner',
      startedAt: '2026-04-20T00:00:00Z',
      answers: { 'clf-q1': 'F' },
    }).success).toBe(false);
  });

  it('rejeita score > 100', () => {
    expect(SimuladoAttemptSchema.safeParse({
      simuladoId: 'simulado-aws-practitioner',
      startedAt: '2026-04-20T00:00:00Z',
      answers: {},
      score: 150,
    }).success).toBe(false);
  });
});

describe('CertificateRecordSchema', () => {
  it('aceita record válido', () => {
    expect(CertificateRecordSchema.safeParse({
      hash: 'a1b2c3d4e5f67890',
      name: 'Fulano',
      simuladoId: 'simulado-aws-practitioner',
      score: 85,
      issuedAt: '2026-04-20T00:00:00Z',
    }).success).toBe(true);
  });

  it('rejeita hash não-hex', () => {
    expect(CertificateRecordSchema.safeParse({
      hash: 'ZZZ-INVALID',
      name: 'x', simuladoId: 'x', score: 80, issuedAt: 'x',
    }).success).toBe(false);
  });
});
