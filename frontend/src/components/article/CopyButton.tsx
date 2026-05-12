'use client';

export function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      aria-label="Copiar código"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          const btn = e.currentTarget;
          const original = btn.textContent;
          btn.textContent = '✓ Copiado';
          setTimeout(() => { if (btn) btn.textContent = original; }, 1500);
        } catch {
          // clipboard pode estar bloqueado em http (não https) ou em sandbox
        }
      }}
      className="px-2 py-1 text-[10px] uppercase tracking-wider opacity-100 md:opacity-0 md:group-hover/code:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ffv-no-print rounded"
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--ffv-muted)',
        fontFamily: 'var(--font-roboto-mono)',
        cursor: 'pointer',
        outlineColor: 'var(--ffv-blue)',
      }}
    >
      Copy
    </button>
  );
}
