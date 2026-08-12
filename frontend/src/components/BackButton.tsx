import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Botão "voltar" único — ícone `ArrowLeft` (lucide-react), não o glifo `←`
 * cru. Medido em 11/ago/2026: ~12 redações à mão, todas `<Link>` com `←`
 * como texto. `aria-hidden` no ícone: o texto do link já descreve o destino.
 */
export function BackButton({ href, children, className }: Props) {
  return (
    <Link
      href={href}
      className={className ?? 'inline-flex items-center gap-1.5 text-sm font-semibold hover:underline'}
      style={{ color: 'var(--ffv-muted)', minHeight: 44 }}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      {children}
    </Link>
  );
}
