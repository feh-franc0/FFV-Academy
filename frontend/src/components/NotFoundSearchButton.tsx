'use client';

/**
 * Botão de busca do 404 — abre o CommandPalette em vez de navegar.
 *
 * O palette já é o mecanismo de busca da plataforma (ele expõe
 * `window.__ffvOpenPalette`, mesmo canal que o MobileNav usa). Aqui a busca é a
 * saída mais provável: quem caiu num 404 geralmente sabe o que procurava.
 *
 * Se o palette ainda não montou, o botão não faz nada em vez de quebrar — por
 * isso a chamada opcional.
 */

export function NotFoundSearchButton() {
  return (
    <button
      type="button"
      onClick={() => {
        type W = Window & { __ffvOpenPalette?: () => void };
        (window as W).__ffvOpenPalette?.();
      }}
      className="rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
      style={{ border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
    >
      Buscar um módulo
    </button>
  );
}
