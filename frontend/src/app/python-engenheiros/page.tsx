import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail36')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Python pra devs TypeScript em PT-BR: diferenças mentais críticas, uv e Python moderno, type hints rigorosos (PEP 695, Protocol, TypedDict), Pydantic v2, asyncio sem dor, FastAPI, Jupyter pra engenharia, capstone agent Python com Claude SDK.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/python-engenheiros` },
  ...social({ titulo: `Python para Engenheiros — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/python-engenheiros' }),
  title: 'Python para Engenheiros',
  description: DESCRICAO_CARTAO,
  keywords:
    'python para engenheiros, python para dev typescript, uv python, pyproject, pydantic v2, fastapi profissional, python asyncio, claude sdk python, agent python',
};

export default function PythonEngenheirosPage() {
  return <TrailBlogClient trail={trail} />;
}
