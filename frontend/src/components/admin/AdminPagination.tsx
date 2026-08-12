'use client';

interface Props {
  total: number;
  page: number; // 0-indexed
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (ps: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 50, 100];

/**
 * AdminPagination — barra de paginação reutilizável para o portal admin.
 *
 * - Mostra "Página X de Y" no centro
 * - Botão Anterior (disabled na página 0)
 * - Botão Próxima (disabled na última página)
 * - Seletor de itens por página: 10 / 50 / 100
 * - Retorna null se total <= pageSize (sem necessidade de paginação)
 */
export function AdminPagination({ total, page, pageSize, onPage, onPageSize }: Props) {
  if (total <= pageSize) return null;

  const totalPages = Math.ceil(total / pageSize);
  const isFirst = page === 0;
  const isLast = (page + 1) * pageSize >= total;

  const btnStyle: React.CSSProperties = {
    background: 'var(--ffv-bg2)',
    border: '1px solid var(--ffv-border)',
    color: 'var(--foreground)',
    borderRadius: 6,
    padding: '4px 12px',
    fontSize: 13,
    cursor: 'pointer',
  };

  const selectStyle: React.CSSProperties = {
    background: 'var(--ffv-bg2)',
    border: '1px solid var(--ffv-border)',
    color: 'var(--foreground)',
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 13,
    cursor: 'pointer',
  };

  return (
    <div className="flex items-center gap-3 text-sm flex-wrap">
      <button
        onClick={() => onPage(Math.max(0, page - 1))}
        disabled={isFirst}
        style={btnStyle}
        className="disabled:opacity-40"
      >
        ← Anterior
      </button>

      <span style={{ color: 'var(--ffv-muted)' }}>
        Página {page + 1} de {totalPages}
      </span>

      <button
        onClick={() => onPage(page + 1)}
        disabled={isLast}
        style={btnStyle}
        className="disabled:opacity-40"
      >
        Próxima →
      </button>

      <div className="flex items-center gap-1 ml-auto">
        <span style={{ color: 'var(--ffv-muted)', fontSize: 12 }}>por página:</span>
        <select
          aria-label="Itens por página"
          value={pageSize}
          onChange={e => {
            onPage(0);
            onPageSize(Number(e.target.value));
          }}
          style={selectStyle}
        >
          {PAGE_SIZE_OPTIONS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
