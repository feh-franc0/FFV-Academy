import { describe, it, expect } from 'vitest';
import { createCard, reviewCard, getDueCards, daysBetween, isoDate, todayISO } from '../lib/srs';

function makeCard() {
  return createCard('test-slug', 'Test Module', '#58a6ff', 0, 'What is X?', ['A', 'B', 'C', 'D'], 2, 'Because X.');
}

describe('createCard', () => {
  it('cria card com valores padrão corretos', () => {
    const card = makeCard();
    expect(card.id).toBe('test-slug_q0');
    expect(card.easeFactor).toBe(2.5);
    expect(card.interval).toBe(0);
    expect(card.repetition).toBe(0);
    expect(card.lastReview).toBeNull();
    expect(card.dueDate).toBe(todayISO());
  });

  it('ID é composto por slug + índice', () => {
    const c1 = createCard('mod', 'T', '#fff', 0, 'Q', [], 0, '');
    const c2 = createCard('mod', 'T', '#fff', 3, 'Q', [], 0, '');
    expect(c1.id).toBe('mod_q0');
    expect(c2.id).toBe('mod_q3');
  });
});

describe('reviewCard', () => {
  it("'again' reseta repetição e seta intervalo 1", () => {
    const card = makeCard();
    const reviewed = reviewCard(card, 'again');
    expect(reviewed.repetition).toBe(0);
    expect(reviewed.interval).toBe(1);
    expect(reviewed.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("'good' na primeira revisão seta intervalo 1", () => {
    const card = makeCard();
    const reviewed = reviewCard(card, 'good');
    expect(reviewed.repetition).toBe(1);
    expect(reviewed.interval).toBe(1);
  });

  it("'good' na segunda revisão seta intervalo 3", () => {
    const card = makeCard();
    const r1 = reviewCard(card, 'good');
    const r2 = reviewCard(r1, 'good');
    expect(r2.repetition).toBe(2);
    expect(r2.interval).toBe(3);
  });

  it("'easy' aumenta easeFactor acima de 2.5", () => {
    const card = makeCard();
    const reviewed = reviewCard(card, 'easy');
    expect(reviewed.easeFactor).toBeGreaterThan(2.5);
  });

  it("'hard' diminui easeFactor abaixo de 2.5", () => {
    const card = makeCard();
    const reviewed = reviewCard(card, 'hard');
    expect(reviewed.easeFactor).toBeLessThan(2.5);
  });

  it('easeFactor nunca cai abaixo de 1.3', () => {
    let card = makeCard();
    // Muitas respostas "again" devem clampar em 1.3
    for (let i = 0; i < 20; i++) {
      card = reviewCard(card, 'again');
    }
    expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('dueDate é atualizado para o futuro após revisão positiva', () => {
    const card = makeCard();
    const r1 = reviewCard(card, 'good');
    const r2 = reviewCard(r1, 'good'); // repetition 2 → interval 3
    // dueDate é string ISO — comparação lexicográfica funciona para YYYY-MM-DD
    expect(r2.dueDate > todayISO()).toBe(true);
  });

  it('lastReview é preenchido após revisão', () => {
    const card = makeCard();
    const reviewed = reviewCard(card, 'good');
    expect(reviewed.lastReview).toBe(todayISO());
  });
});

describe('getDueCards', () => {
  it('retorna cards com dueDate <= hoje', () => {
    const card = makeCard(); // dueDate = hoje
    expect(getDueCards([card])).toHaveLength(1);
  });

  it('não retorna cards com dueDate no futuro', () => {
    const card = makeCard();
    const future = new Date();
    future.setDate(future.getDate() + 5);
    const futureCard = { ...card, dueDate: isoDate(future) };
    expect(getDueCards([futureCard])).toHaveLength(0);
  });

  it('filtra corretamente uma lista mista', () => {
    const due = makeCard();
    const future = new Date();
    future.setDate(future.getDate() + 2);
    const notDue = { ...makeCard(), id: 'test-slug_q1', dueDate: isoDate(future) };
    expect(getDueCards([due, notDue])).toHaveLength(1);
  });
});

describe('daysBetween', () => {
  it('calcula diferença correta entre datas', () => {
    expect(daysBetween('2026-01-01', '2026-01-11')).toBe(10);
  });

  it('retorna 0 para a mesma data', () => {
    expect(daysBetween('2026-04-17', '2026-04-17')).toBe(0);
  });

  it('funciona com datas em ordem inversa (retorna negativo)', () => {
    expect(daysBetween('2026-01-11', '2026-01-01')).toBe(-10);
  });
});
