'use client';

const STEPS = [
  {
    n: '01',
    icon: '🎯',
    title: 'Escolha sua trilha',
    desc: 'IA, AWS, engenharia, comunicação, carreira ou empreendedorismo. Cada trilha tem ordem clara — começa do básico, vai ao avançado.',
    color: '#58a6ff',
  },
  {
    n: '02',
    icon: '⚡',
    title: 'Aprenda + ganhe XP',
    desc: 'Cada artigo completo dá XP, badge, e move sua barra de progresso. Quiz no final reforça aprendizado e libera próximo módulo.',
    color: '#a371f7',
  },
  {
    n: '03',
    icon: '🏆',
    title: 'Conquiste e suba no ranking',
    desc: 'Streak diário, badges raras, certificados ao completar trilha. Ranking semanal mostra quem está estudando mais.',
    color: 'var(--ffv-gold)',
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-20" style={{ borderTop: '1px solid var(--ffv-border)' }}>
      <div className="max-w-6xl mx-auto">
        <p
          className="font-mono uppercase tracking-widest text-xs mb-3"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.12em' }}
        >
          Como funciona
        </p>
        <h2
          style={{
            fontSize: 'var(--text-4xl-r)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 12,
            lineHeight: 1.15,
          }}
        >
          Aprender de verdade, não só ler artigo.
        </h2>
        <p
          style={{
            fontSize: 15,
            color: 'var(--ffv-muted)',
            maxWidth: 640,
            lineHeight: 1.7,
            marginBottom: 48,
          }}
        >
          Plataforma gamificada com XP, badges, streak e ranking. Você aprende e ainda compete consigo
          mesmo (e com a comunidade).
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(s => (
            <article
              key={s.n}
              className="relative p-6 rounded-2xl"
              style={{
                background: 'var(--ffv-bg2)',
                border: `1px solid ${s.color}25`,
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = `${s.color}80`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = `${s.color}25`;
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: 36 }}>{s.icon}</span>
                <span
                  className="font-mono text-2xl font-bold"
                  style={{ color: `${s.color}30`, letterSpacing: '-0.02em' }}
                >
                  {s.n}
                </span>
              </div>
              <h3 className="font-bold text-base mb-2">{s.title}</h3>
              <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.7 }}>
                {s.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
