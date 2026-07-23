import '@testing-library/jest-dom/vitest';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { FloatingTrailMenuButton } from '@/components/base/FloatingTrailMenuButton';

describe('<FloatingTrailMenuButton> sem TrailProvider', () => {
  afterEach(cleanup);

  it('não renderiza nada quando montado fora de um TrailProvider', () => {
    const { container } = render(<FloatingTrailMenuButton />);
    expect(container.innerHTML).toBe('');
  });
});
