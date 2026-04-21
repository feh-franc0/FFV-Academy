import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail33')!;

export const metadata: Metadata = {
  title: 'Testing Engineering — FFV Academy',
  description:
    'Testing como disciplina em PT-BR: test pyramid/trophy/diamond, TDD e BDD, test doubles rigorosos (mock/stub/fake/spy), property-based com fast-check, mutation testing (Stryker), integration vs contract (Pact) vs e2e, performance testing (k6), capstone harness completo.',
  keywords:
    'testing engineering, test pyramid, tdd bdd, test doubles meszaros, property based fast-check, mutation stryker, pact contract, playwright e2e, k6 load test',
};

export default function TestingEngineeringPage() {
  return <TrailBlogClient trail={trail} />;
}
