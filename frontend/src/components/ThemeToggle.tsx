'use client';

import { useTheme } from '@/hooks/useTheme';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme();

  if (!mounted) {
    return <div style={{ width: 32, height: 32 }} aria-hidden />;
  }

  const isDark = theme === 'dark';

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={toggle}
            aria-label={`Trocar para tema ${isDark ? 'claro' : 'escuro'}`}
            className="flex items-center justify-center rounded-md transition-colors"
            style={{
              width: 32,
              height: 32,
              background: 'transparent',
              border: '1px solid var(--ffv-border)',
              color: 'var(--ffv-muted)',
              cursor: 'pointer',
            }}
            onMouseOver={e => {
              e.currentTarget.style.color = 'var(--foreground)';
              e.currentTarget.style.borderColor = 'var(--ffv-blue)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.color = 'var(--ffv-muted)';
              e.currentTarget.style.borderColor = 'var(--ffv-border)';
            }}
          />
        }
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>{isDark ? 'Tema claro' : 'Tema escuro'}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
