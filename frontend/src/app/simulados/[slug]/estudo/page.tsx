import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EstudoClient } from '@/components/simulado/EstudoClient';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';
import { BASE, social } from '@/lib/metadata-social';

/**
 * Estudo livre por certificação — rota dinâmica.
 *
 * A CLF-C02 continua servida por `/simulados/cloud-practitioner/estudo`
 * (rota estática, sem mudança de comportamento — Next.js prioriza o segmento
 * literal sobre o dinâmico quando os dois coexistem). Esta rota cobre as
 * demais certificações que têm banco no Postgres: hoje AIF-C01 e DVA-C02.
 *
 * Só gera página para simulado com `dbBankId` — sem banco não há o que
 * estudar livremente, e a página existiria só para dar erro em runtime.
 */

interface Params { slug: string; }

function comBanco() {
  return SIMULADOS_CATALOG.filter(s => s.dbBankId && s.id !== 'simulado-aws-practitioner');
}

export function generateStaticParams(): Params[] {
  return comBanco().map(s => ({ slug: s.id.replace(/^simulado-/, '') }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const simulado = comBanco().find(s => s.id === `simulado-${slug}`);
  if (!simulado) return {};
  const titulo = `Estudo livre — ${simulado.certification}`;
  const descricao = `Modo de estudo livre para a certificação ${simulado.certification}. Questões sorteadas do banco no Postgres com explicações ricas — por que está certo, por que cada distrator erra. Gratuito, sem timer.`;
  return {
    robots: { index: false, follow: false },
    title: titulo,
    description: descricao,
    alternates: { canonical: `${BASE}/simulados/${slug}/estudo` },
    ...social({ titulo: `${titulo} · FFV Academy`, descricao, caminho: `/simulados/${slug}/estudo` }),
  };
}

export default async function EstudoCertificacaoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const simulado = comBanco().find(s => s.id === `simulado-${slug}`);
  if (!simulado) notFound();

  return (
    <>
      {/* Mesmo motivo do CLF: título fora do guarda de auth, visível ao
          rastreador e ao leitor de tela antes da hidratação. */}
      <h1 className="sr-only">Modo de estudo — {simulado.certification}</h1>
      <RequireAuth
        reason="acessar os simulados"
        title="Login necessário para o modo de estudo"
        description={`Faça login para praticar as questões de ${simulado.certification} e usar o tutor IA. É gratuito.`}
      >
        <EstudoClient
          dbBankId={simulado.dbBankId}
          badgeLabel={`${simulado.certification} · Estudo livre`}
          title={`Estudo livre — ${simulado.title.replace(/^Simulado\s+/, '')}`}
          subtitle={`Sem timer. Sem score. Sem pressão. Questões sorteadas do banco de ${simulado.certification} no Postgres, com explicação rica.`}
          breadcrumbLabel={`Estudo livre ${simulado.certification}`}
        />
      </RequireAuth>
    </>
  );
}
