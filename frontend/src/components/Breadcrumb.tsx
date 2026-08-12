import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  /** Omitido no último item — ele é o "você está aqui", marcado `aria-current="page"`. */
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb único — `nav > ol`, item atual com `aria-current="page"`.
 *
 * Medido em 11/ago/2026: 24 instâncias copiadas à mão em ~23 arquivos, três
 * formatos (só `<span>/</span>` sem `aria-label`; flex com `aria-label` mas
 * sem `aria-current`; e o `nav>ol` de `/aprenda/[slug]` — o único semântico,
 * mas também sem `aria-current`). Nenhum marcava a página atual.
 *
 * NÃO se aplica a `/aprenda/[slug]/page.tsx`: aquele breadcrumb casa com o
 * `BreadcrumbList` do JSON-LD da página (hub · trilha · módulo, separador
 * `·`) e alimenta 426 páginas — trocar o separador ali é risco desproporcional
 * ao ganho. Este componente é para as demais rotas, a começar pelas 6 rotas
 * pessoais que não tinham breadcrumb nenhum.
 */
export function Breadcrumb({ items, className }: Props) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs" style={{ color: 'var(--ffv-muted)' }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href ?? item.label} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {isLast || !item.href ? (
                <span aria-current={isLast ? 'page' : undefined} style={{ color: isLast ? 'var(--foreground)' : undefined }}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:underline" style={{ color: 'inherit' }}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
