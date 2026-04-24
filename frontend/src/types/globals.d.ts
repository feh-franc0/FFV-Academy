/**
 * Tipos globais injetados no runtime (scripts externos carregados via <script>).
 * Declarar aqui evita `as unknown as { ... }` espalhado pelo código.
 */

export {};

declare global {
  interface Window {
    /**
     * Plausible Analytics — carregado via layout.tsx.
     * Chamar como: window.plausible?.('event', { props: { ... } })
     */
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}
