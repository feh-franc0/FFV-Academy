import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';
import { SimuladoRunner } from '@/components/simulado/SimuladoRunner';
import { RequireAuth } from '@/components/auth/RequireAuth';

interface Params { slug: string; }

export function generateStaticParams(): Params[] {
  return SIMULADOS_CATALOG.map(s => ({ slug: s.id.replace(/^simulado-/, '') }));
}

export const metadata = {
  title: 'Fazendo simulado',
  robots: { index: false, follow: false },
};

export default async function FazerPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return (
    <>
      {/* Título fora do guarda de auth — visível ao rastreador/leitor de tela
          antes da hidratação, mesmo padrão de /estudo. */}
      <h1 className="sr-only">Fazendo simulado</h1>
      <RequireAuth
        reason="fazer o simulado"
        title="Login necessário para fazer o simulado"
        description="Faça login para iniciar a prova cronometrada e ter seu resultado salvo. É gratuito."
      >
        <SimuladoRunner slug={slug} />
      </RequireAuth>
    </>
  );
}
