/**
 * Segurança — tamper de simulados e paidProducts.
 *
 * Usuário malicioso pode editar localStorage via DevTools e tentar:
 * 1. Marcar paidProducts manualmente
 * 2. Fabricar um attempt com score 100% sem responder nada
 * 3. Forjar certificado hash
 *
 * No MVP client-side, qualquer um pode tamperar (é só localStorage). A defesa
 * real vem com backend. Mas Zod mantém a integridade da camada APP — dados
 * malformados não derrubam a aplicação.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { importState } from '../../lib/engine';
import { UserProfileSchema } from '../../lib/schemas';
import { getUser, setUser } from '../../lib/storage';

beforeEach(() => localStorage.clear());

describe('Tamper em UserProfile via localStorage', () => {
  it('UserProfileSchema rejeita paidProducts com shape errado em leitura', () => {
    // Simula tamper: grava direto no localStorage com paidProducts inválidos
    localStorage.setItem('ffv_user', JSON.stringify({
      name: 'X', email: 'x@x.com', phone: '+5511987654321',
      createdAt: '2026-04-20T00:00:00Z',
      marketingConsent: false,
      paidProducts: ['<script>alert(1)</script>'],
    }));
    expect(getUser()).toBeNull(); // regex de paidProduct rejeita
  });

  it('setUser rejeita perfil com injection em paidProducts', () => {
    const bad = {
      name: 'X', email: 'x@x.com', phone: '+5511987654321',
      createdAt: '2026-04-20T00:00:00Z',
      marketingConsent: false,
      paidProducts: ['<iframe>'],
    } as Parameters<typeof setUser>[0];
    expect(setUser(bad)).toBe(false);
  });

  it('setUser rejeita campos extras (strict)', () => {
    const sneaky = {
      name: 'X', email: 'x@x.com', phone: '+5511987654321',
      createdAt: '2026-04-20T00:00:00Z',
      marketingConsent: false,
      paidProducts: [],
      isAdmin: true, // campo extra → strict rejeita
    } as unknown as Parameters<typeof setUser>[0];
    expect(setUser(sneaky)).toBe(false);
  });
});

describe('Tamper via importState', () => {
  it('importState rejeita JSON que injeta campo desconhecido isAdmin', () => {
    const evil = JSON.stringify({
      xp: 9999, level: 20, streak: 0, lastStudyDate: null,
      completedModules: [], quizScores: {}, badges: [],
      totalStudyTime: 0, startedAt: null,
      reviewCards: [], archivedCards: [], studyDays: [],
      freezes: 0, dailyGoal: 3,
      lastReviewDate: null, lastArticle: null,
      preferredHub: null, onboardedAt: null,
      articleProgress: {},
      isAdmin: true,
    });
    const r = importState(evil);
    expect(r.ok).toBe(false);
  });

  it('importState rejeita payload com campo proibido', () => {
    const evil = JSON.stringify({
      xp: 100, level: 1, streak: 0, lastStudyDate: null,
      completedModules: [], quizScores: {}, badges: [],
      totalStudyTime: 0, startedAt: null,
      reviewCards: [], archivedCards: [], studyDays: [],
      freezes: 0, dailyGoal: 3,
      lastReviewDate: null, lastArticle: null,
      preferredHub: null, onboardedAt: null,
      articleProgress: {},
      // paidProducts aqui seria um tamper tentando dar acesso pago
      paidProducts: ['simulado-aws-practitioner'],
    });
    const r = importState(evil);
    // GameStateSchema não tem paidProducts → strict() rejeita
    expect(r.ok).toBe(false);
  });
});

describe('UserProfileSchema — garantias básicas', () => {
  it('aceita paidProducts vazio', () => {
    const r = UserProfileSchema.safeParse({
      name: 'X', email: 'x@x.com', phone: '+5511987654321',
      createdAt: '2026-04-20T00:00:00Z',
      marketingConsent: false, paidProducts: [],
    });
    expect(r.success).toBe(true);
  });

  it('aceita lista de slugs válidos', () => {
    const r = UserProfileSchema.safeParse({
      name: 'X', email: 'x@x.com', phone: '+5511987654321',
      createdAt: '2026-04-20T00:00:00Z',
      marketingConsent: false,
      paidProducts: ['simulado-aws-practitioner', 'simulado-aws-saa'],
    });
    expect(r.success).toBe(true);
  });
});
