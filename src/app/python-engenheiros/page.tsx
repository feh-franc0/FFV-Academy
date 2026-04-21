import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail36')!;

export const metadata: Metadata = {
  title: 'Python para Engenheiros — FFV Academy',
  description:
    'Python pra devs TypeScript em PT-BR: diferenças mentais críticas, uv e Python moderno, type hints rigorosos (PEP 695, Protocol, TypedDict), Pydantic v2, asyncio sem dor, FastAPI, Jupyter pra engenharia, capstone agent Python com Claude SDK.',
  keywords:
    'python para engenheiros, python para dev typescript, uv python, pyproject, pydantic v2, fastapi profissional, python asyncio, claude sdk python, agent python',
};

export default function PythonEngenheirosPage() {
  return <TrailBlogClient trail={trail} />;
}
