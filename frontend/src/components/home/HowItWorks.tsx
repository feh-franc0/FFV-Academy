'use client';

const STEPS = [
  {
    n: '01',
    icon: '🎯',
    title: 'Escolha sua trilha',
    desc: 'IA na AWS, arquitetura de soluções, fundamentos de IA ou produção. Cada trilha vai do básico ao avançado, em ordem clara — você sabe exatamente onde está e o que vem depois.',
    color: '#58a6ff',
  },
  {
    n: '02',
    icon: '⚡',
    title: 'Aprenda + ganhe XP',
    desc: 'Cada artigo completo dá XP, badge e move sua barra de progresso. O quiz no final vira flashcard de revisão espaçada (SM-2) — você não só lê, memoriza de verdade.',
    color: '#a371f7',
  },
  {
    n: '03',
    icon: '🏆',
    title: 'Volte todo dia e suba no ranking',
    desc: 'Streak diário, badges raras, meta customizável e certificado ao completar a trilha. O ranking semanal mostra quem está no ritmo — e te puxa pra continuar.',
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
          Não é um blog que você lê e esquece. Cada módulo vira XP, quiz e card de revisão espaçada —
          o conhecimento fica de verdade. E você faz isso junto com uma comunidade que está na mesma
          jornada.
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
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = `${s.color}80`;
                e.currentTarget.style.boxShadow = `0 24px 50px -24px ${s.color}66`;
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.borderColor = `${s.color}25`;
                e.currentTarget.style.boxShadow = '';
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
