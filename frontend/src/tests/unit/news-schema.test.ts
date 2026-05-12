import { describe, it, expect } from 'vitest';
import { NewsItemSchema, loadNewsFeed } from '@/lib/news';

/**
 * Tests de segurança para news.json — boundary input que pode ser editado por
 * humano ou pipeline externa. Schema Zod previne XSS, URLs mal formadas e
 * dados inválidos antes de chegarem aos componentes.
 */
describe('news schema validation (security)', () => {
  const validItem = {
    id: 'test-news',
    title: 'Título Válido — pelo menos 10 chars',
    summary: 'Summary válido com pelo menos 20 caracteres exigidos pelo schema.',
    source: 'Anthropic',
    sourceUrl: 'https://example.com/news',
    publishedAt: '2026-05-04',
    category: 'launch' as const,
  };

  describe('aceita inputs válidos', () => {
    it('item completo válido', () => {
      const result = NewsItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('item com todos os campos opcionais', () => {
      const result = NewsItemSchema.safeParse({
        ...validItem,
        hot: true,
        tags: ['ai', 'launch'],
        imageUrl: 'https://images.unsplash.com/photo-x?w=1200',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('rejeita inputs inválidos', () => {
    it('id com caracteres especiais (XSS prevention)', () => {
      const r = NewsItemSchema.safeParse({ ...validItem, id: '<script>alert(1)</script>' });
      expect(r.success).toBe(false);
    });

    it('URL não-HTTPS', () => {
      const r = NewsItemSchema.safeParse({ ...validItem, sourceUrl: 'http://example.com' });
      expect(r.success).toBe(false);
    });

    it('javascript: URL (XSS prevention)', () => {
      const r = NewsItemSchema.safeParse({ ...validItem, sourceUrl: 'javascript:alert(1)' });
      expect(r.success).toBe(false);
    });

    it('título muito curto (<10 chars)', () => {
      const r = NewsItemSchema.safeParse({ ...validItem, title: 'curto' });
      expect(r.success).toBe(false);
    });

    it('título excessivamente longo (>140 chars)', () => {
      const r = NewsItemSchema.safeParse({ ...validItem, title: 'X'.repeat(141) });
      expect(r.success).toBe(false);
    });

    it('summary muito curto (<20 chars)', () => {
      const r = NewsItemSchema.safeParse({ ...validItem, summary: 'curto' });
      expect(r.success).toBe(false);
    });

    it('data em formato inválido', () => {
      const r = NewsItemSchema.safeParse({ ...validItem, publishedAt: '04/05/2026' });
      expect(r.success).toBe(false);
    });

    it('categoria desconhecida', () => {
      const r = NewsItemSchema.safeParse({ ...validItem, category: 'random' });
      expect(r.success).toBe(false);
    });

    it('imageUrl não-HTTPS', () => {
      const r = NewsItemSchema.safeParse({ ...validItem, imageUrl: 'http://insecure.com/img' });
      expect(r.success).toBe(false);
    });

    it('mais de 6 tags', () => {
      const r = NewsItemSchema.safeParse({
        ...validItem,
        tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      });
      expect(r.success).toBe(false);
    });
  });

  describe('feed completo carrega sem erros', () => {
    it('loadNewsFeed retorna feed válido', () => {
      const feed = loadNewsFeed();
      expect(feed.items.length).toBeGreaterThan(0);
      expect(feed.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('todos os itens passam no schema', () => {
      const feed = loadNewsFeed();
      for (const item of feed.items) {
        const r = NewsItemSchema.safeParse(item);
        expect(r.success).toBe(true);
      }
    });
  });
});
