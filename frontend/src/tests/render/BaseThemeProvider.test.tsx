import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';

import { BaseThemeProvider } from '@/components/base/BaseThemeProvider';
import { MEDVET_THEME } from '@/lib/bases/medvet/theme';
import { TECH_THEME } from '@/lib/bases/tecnologia/theme';

describe('<BaseThemeProvider>', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.cssText = '';
  });

  afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.cssText = '';
  });

  it('força data-theme="light" no html ao montar', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    render(
      <BaseThemeProvider theme={MEDVET_THEME}>
        <div>conteúdo</div>
      </BaseThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('aplica CSS vars do tema no html', () => {
    render(
      <BaseThemeProvider theme={MEDVET_THEME}>
        <div>x</div>
      </BaseThemeProvider>,
    );
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--ffv-blue')).toBe(MEDVET_THEME.accent);
    expect(root.style.getPropertyValue('--ffv-bg')).toBe(MEDVET_THEME.paper);
    expect(root.style.getPropertyValue('--foreground')).toBe(MEDVET_THEME.ink);
  });

  it('restaura tema anterior ao desmontar', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const { unmount } = render(
      <BaseThemeProvider theme={MEDVET_THEME}>
        <div>x</div>
      </BaseThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    unmount();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.getPropertyValue('--ffv-blue')).toBe('');
  });

  it('TECH_THEME e MEDVET_THEME são distintos visualmente', () => {
    expect(TECH_THEME.accent).not.toBe(MEDVET_THEME.accent);
    expect(TECH_THEME.ink).not.toBe(MEDVET_THEME.ink);
  });

  it('MEDVET_THEME tem paleta sage/cream (cores definidas)', () => {
    expect(MEDVET_THEME.accent).toBe('#8a9b7e');         // sage
    expect(MEDVET_THEME.paper).toBe('#fbf7f0');          // warm ivory
    expect(MEDVET_THEME.ink).toBe('#2d4a3e');            // forest sage
    expect(MEDVET_THEME.hubColors).toHaveLength(4);
  });
});
