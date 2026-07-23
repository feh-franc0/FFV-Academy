import type { BaseNavItem } from '@/components/base/BaseNavContext';

/**
 * Nav items da base de Tecnologia — 4 hubs primários no header.
 * Os outros hubs (Fundamentos, Programação, Dados, Profissional Digital) ficam
 * no Cmd+K e no MobileNav.
 */
export const TECH_NAV_ITEMS: BaseNavItem[] = [
  { href: '/ia', label: 'IA', color: '#58a6ff', iconName: 'brain' },
  { href: '/aws', label: 'AWS', color: '#ff9900', iconName: 'cloud' },
  { href: '/engenharia', label: 'Engenharia', color: '#e3b341', iconName: 'wrench' },
  { href: '/claude-anthropic', label: 'Claude', color: '#cc785c', iconName: 'bot' },
];
