import type { Metadata } from 'next';
import Link from 'next/link';
import { SIMULADOS_CATALOG } from '@/lib/simulados-catalog';
import { SimuladoCard } from '@/components/SimuladoCard';

export const metadata: Metadata = {
  title: 'Simulados com Tutor IA — FFV Academy',
  description: 'Simulados profissionais para certificações AWS, com tutor IA que explica cada questão por dentro. 10 questões grátis, depois desbloqueie o simulado completo.',
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
          Questões desenhadas pra você <b>entender</b>, não só memorizar. Cada resposta traz explicação no estilo tutor — por que a certa é certa e por que cada distrator não. Comece grátis com 10 questões.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-5 mb-12">
        {SIMULADOS_CATALOG.map(s => (
          <SimuladoCard key={s.id} simulado={s} />
        ))}
      </section>

      <section className="p-6 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-3">Como funciona</h2>
        <ol className="text-sm space-y-2 list-decimal pl-5">
          <li>Faça login rápido (email + SMS, zero spam).</li>
          <li>As primeiras 10 questões são grátis pra você experimentar.</li>
          <li>Na 11ª, desbloqueia o simulado completo com pagamento único.</li>
          <li>Tutor IA explica cada questão em linguagem natural, sem jargão desnecessário.</li>
          <li>Atinja a nota mínima e emita seu certificado de conclusão.</li>
        </ol>
      </section>
    </div>
  );
}
