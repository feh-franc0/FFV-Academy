import type { BaseNavItem } from '@/components/base/BaseNavContext';

/**
 * Nav items da base de Medicina Veterinária.
 *
 * Não usa hubs no header (acesso aos hubs temáticos fica na home /medicina-veterinaria
 * na seção Explorar). Adiciona um link rápido pro simulado de 100 questões.
 *
 * Adicione aqui qualquer atalho extra que faça sentido — o header é
 * configurável por base.
 */
export const MEDVET_NAV_ITEMS: BaseNavItem[] = [
  {
    href: '/medicina-veterinaria/simulado-genetica',
    label: 'Simulado',
    color: '#b08968',
    iconName: 'target',
  },
];
