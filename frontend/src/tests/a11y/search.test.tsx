import '@testing-library/jest-dom/vitest';
import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoCriticalA11yViolations } from './axe-helper';

vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
}));

import { SearchClient } from '@/app/search/SearchClient';

describe('a11y · <SearchClient>', () => {
  it('não tem violações de a11y críticas no estado inicial', async () => {
    const { container } = render(<SearchClient />);
    await expectNoCriticalA11yViolations(container);
  });
});
