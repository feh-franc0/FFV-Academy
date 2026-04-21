import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('programacao')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Programação & Algoritmos: TypeScript profissional de verdade e estruturas de dados & algoritmos que aparecem em código real. Anti-LeetCode, pró-produção.',
  keywords:
    'typescript profissional, narrowing discriminated unions, generics typescript, estruturas de dados devs, algoritmos na pratica, anti leetcode',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
