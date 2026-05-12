'use client';

import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * FFV Button — variante editorial usada em hero, CTAs e cards de marketing.
 *
 * Diferente do Button shadcn (uso técnico), este aqui carrega o "gradient
 * azul→roxo" que é a assinatura visual da plataforma e variantes specíficas
 * (gold para ranking, ghost para secundários).
 *
 * Pode renderizar como `<a>` (Link interno ou href externo) ou `<button>`.
 */
const ffvButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all whitespace-nowrap select-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'text-white shadow-[0_10px_30px_-8px_color-mix(in_srgb,var(--ffv-blue)_50%,transparent)] hover:scale-[1.03]',
        gold:
          'shadow-[0_10px_30px_-8px_color-mix(in_srgb,var(--ffv-gold)_50%,transparent)] hover:scale-[1.03]',
        secondary:
          'bg-transparent border border-[var(--ffv-border)] text-[var(--foreground)] hover:bg-[var(--ffv-bg2)]',
        ghost:
          'bg-transparent text-[var(--ffv-muted)] hover:text-[var(--foreground)]',
      },
      size: {
        sm: 'px-4 py-2 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-sm',
        xl: 'px-8 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

const variantBackground: Record<string, string> = {
  primary: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
  gold: 'linear-gradient(90deg, var(--ffv-gold), #f59e0b)',
};

const variantColor: Record<string, string> = {
  primary: '#fff',
  gold: '#0d1117',
};

type FfvButtonProps = VariantProps<typeof ffvButtonVariants> & {
  children: ReactNode;
  className?: string;
};

type AsLink = FfvButtonProps & ComponentProps<typeof Link> & { href: string; external?: boolean };
type AsButton = FfvButtonProps & ComponentProps<'button'> & { href?: undefined };

export function FfvButton(props: AsLink | AsButton) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props;

  const styleProps =
    variant === 'primary' || variant === 'gold'
      ? {
          background: variantBackground[variant],
          color: variantColor[variant],
        }
      : undefined;

  if ('href' in rest && rest.href) {
    const { href, external, ...linkRest } = rest;
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(ffvButtonVariants({ variant, size }), className)}
          style={styleProps}
        >
          {children}
        </a>
      );
    }
    const { href: _hrefDup, ...restLink } = linkRest as ComponentProps<typeof Link> & { href?: string };
    void _hrefDup;
    return (
      <Link
        href={href}
        className={cn(ffvButtonVariants({ variant, size }), className)}
        style={styleProps}
        {...restLink}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cn(ffvButtonVariants({ variant, size }), className)}
      style={styleProps}
      {...(rest as ComponentProps<'button'>)}
    >
      {children}
    </button>
  );
}
