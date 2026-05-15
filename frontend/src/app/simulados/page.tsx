import type { Metadata } from 'next';
import Link from 'next/link';
import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';
import { SimuladoCard } from '@/components/SimuladoCard';

export const metadata: Metadata = {
  title: 'Simulados com Tutor IA — FFV Academy',
  description: 'Simulados profissionais para certificações AWS, com tutor IA que explica cada questão por dentro. Gratuito — acesso completo para todos os usuários.',
  keywords: 'simulado aws, aws cloud practitioner simulado, aws saa simulado, simulado com tutor ia, certificação aws preparação',
  alternates: { canonical: 'https://fernandofrancovalle.com/simulados' },
  openGraph: {
    title: 'Simulados com Tutor IA — FFV Academy',
    description: 'Prepare-se para certificações AWS com simulados que ensinam.',
    type: 'website',
    url: 'https://fernandofrancovalle.com/simulados',
  },
};

export default function SimuladosPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Simulados</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Simulados com Tutor IA</h1>
        <p className="text-base md:text-lg" style={{ color: 'var(--ffv-muted)' }}>
          Questões desenhadas pra você <b>entender</b>, não só memorizar. Cada resposta traz explicação no estilo tutor — por que a certa é certa e por que cada distrator não. Gratuito, acesso completo.
        </p>
      </header>

      <Link
        href="/simulados/cloud-practitioner/estudo"
        className="block p-6 rounded-xl mb-8 transition-transform hover:scale-[1.005]"
        style={{ background: 'linear-gradient(135deg, rgba(247,129,102,0.15), rgba(247,129,102,0.05))', border: '1px solid #f78166' }}
      >
        <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: '#f78166' }}>
          Novo · Modo de estudo livre
        </p>
        <h2 className="text-xl md:text-2xl font-bold mb-2">Estudo livre Cloud Practitioner</h2>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          335+ questões reais do banco CLF-C02, sorteadas com distribuição oficial do blueprint AWS. Modo livre, sem timer, com tutor IA para tirar dúvidas. Gratuito.
        </p>
        <p className="text-xs mt-3 font-medium" style={{ color: '#f78166' }}>
          Começar a estudar →
        </p>
      </Link>

      <section className="grid md:grid-cols-2 gap-5 mb-12">
        {SIMULADOS_CATALOG.map(s => (
          <SimuladoCard key={s.id} simulado={s} />
        ))}
      </section>

      <section className="p-6 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-3">Como funciona</h2>
        <ol className="text-sm space-y-2 list-decimal pl-5">
          <li>Faça login rápido (email, zero spam).</li>
          <li>Acesso completo ao simulado — todas as questões, sem limite.</li>
          <li>Tutor IA explica cada questão em linguagem natural, sem jargão desnecessário.</li>
          <li>Atinja a nota mínima e emita seu certificado de conclusão.</li>
        </ol>
      </section>
    </div>
  );
}
