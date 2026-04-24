// SM-2 inspired spaced repetition algorithm
// Based on the SuperMemo-2 algorithm by Piotr Wozniak
// Simplified for 4-option quizzes: binary outcome (acertou / errou)

export interface ReviewCard {
  id: string;              // `${slug}_q${index}`
  slug: string;            // module slug
  title: string;           // module title (for display)
  trailColor: string;      // for UI consistency with trail
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  easeFactor: number;      // SM-2 ease (default 2.5, min 1.3)
  interval: number;        // current interval in days
  repetition: number;      // successful reviews in a row
  dueDate: string;         // ISO date (YYYY-MM-DD) when card becomes due
  lastReview: string | null;
}

export type ReviewQuality = 'hard' | 'good' | 'easy' | 'again';
// again = errou / esqueceu (quality 0-1)
// hard  = acertou com esforço (quality 3)
// good  = acertou bem (quality 4)
// easy  = acertou com facilidade (quality 5)

const QUALITY_MAP: Record<ReviewQuality, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export function createCard(
  slug: string,
  title: string,
  trailColor: string,
  index: number,
  question: string,
  options: string[],
  correct: number,
  explanation: string,
): ReviewCard {
  return {
    id: `${slug}_q${index}`,
    slug,
    title,
    trailColor,
    question,
    options,
    correct,
    explanation,
    easeFactor: 2.5,
    interval: 0,
    repetition: 0,
    dueDate: todayISO(),
    lastReview: null,
  };
}

export function reviewCard(card: ReviewCard, outcome: ReviewQuality): ReviewCard {
  const q = QUALITY_MAP[outcome];
  let { easeFactor, interval, repetition } = card;

  if (q < 3) {
    repetition = 0;
    interval = 1;
  } else {
    repetition += 1;
    if (repetition === 1) interval = 1;
    else if (repetition === 2) interval = 3;
    else interval = Math.round(interval * easeFactor);
  }

  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(today);
  due.setDate(due.getDate() + interval);

  return {
    ...card,
    easeFactor,
    interval,
    repetition,
    dueDate: isoDate(due),
    lastReview: todayISO(),
  };
}

export function getDueCards(cards: ReviewCard[]): ReviewCard[] {
  const today = todayISO();
  return cards.filter(c => c.dueDate <= today);
}

export function getUpcomingCards(cards: ReviewCard[], withinDays: number): ReviewCard[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + withinDays);
  return cards.filter(c => {
    const d = new Date(c.dueDate);
    return d > today && d <= limit;
  });
}

export function todayISO(): string {
  const d = new Date();
  return isoDate(d);
}

export function isoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}
