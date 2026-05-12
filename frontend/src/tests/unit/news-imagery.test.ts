import { describe, it, expect } from 'vitest';
import { imageForItem } from '@/lib/news-imagery';

describe('news-imagery', () => {
  it('retorna imageUrl quando item já tem um', () => {
    const item = {
      id: 'test-1',
      category: 'launch' as const,
      imageUrl: 'https://example.com/foo.jpg',
    };
    expect(imageForItem(item)).toBe('https://example.com/foo.jpg');
  });

  it('escolhe imagem da categoria quando item não tem imageUrl', () => {
    const item = { id: 'foo-launch-1', category: 'launch' as const };
    const url = imageForItem(item);
    expect(url).toContain('images.unsplash.com');
    expect(url).toContain('w=1200');
    expect(url).toContain('fm=webp');
  });

  it('retorna a mesma imagem para o mesmo id (estabilidade)', () => {
    const item = { id: 'consistent-id', category: 'research' as const };
    const a = imageForItem(item);
    const b = imageForItem(item);
    expect(a).toBe(b);
  });

  it('cobre todas as categorias sem crashar', () => {
    const cats = ['launch', 'research', 'business', 'safety', 'regulation'] as const;
    for (const c of cats) {
      const url = imageForItem({ id: `id-${c}`, category: c });
      expect(url).toContain('https://');
    }
  });

  it('múltiplos IDs cobrem variedade de imagens da pool', () => {
    // Pool tem 3 imagens por categoria. Com 12 IDs diversos, deve usar pelo
    // menos 2 imagens distintas (probabilística mas estável: hash bem distribuído).
    const ids = ['ai-launch', 'gpt-5-rumor', 'claude-opus', 'gemini-3', 'mistral-large',
                 'llama-4', 'deepseek-v4', 'qwen-3', 'grok-3', 'phi-5', 'o1-pro', 'sonnet-4-7'];
    const urls = ids.map(id => imageForItem({ id, category: 'launch' }));
    const distinct = new Set(urls);
    expect(distinct.size).toBeGreaterThanOrEqual(2);
  });
});
