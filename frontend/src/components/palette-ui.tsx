'use client';

import { useEffect, useState } from 'react';

/**
 * Peças leves do palette, compartilhadas entre a casca (layout raiz) e o
 * corpo carregado sob demanda. Ficam aqui porque nada nelas depende do
 * currículo — e se voltassem para o corpo, a casca o arrastaria de volta
 * para o primeiro carregamento, desfazendo a divisão.
 */
export function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPod|iPad/.test(navigator.platform));
  }, []);
  return isMac;
}

export function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--ffv-muted)', flexShrink: 0 }}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  );
}
