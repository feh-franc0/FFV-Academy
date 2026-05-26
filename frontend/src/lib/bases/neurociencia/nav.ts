import type { BaseNavItem } from '@/components/base/BaseNavContext';

/**
 * Nav items da base de Neurociência.
 *
 * Atalho rápido pro primeiro módulo da trilha — é como a usuária Lara entra
 * direto no conteúdo principal sem precisar passar pela home. Hubs ficam na
 * home /neurociencia (seção Explorar).
 */
export const NEUROCIENCIA_NAV_ITEMS: BaseNavItem[] = [
  {
    href: '/neurociencia/triuno-cerebro-do-consumidor',
    label: 'Começar trilha',
    color: '#7c3aed',
    iconName: 'brain',
  },
];
