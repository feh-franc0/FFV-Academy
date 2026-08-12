'use client';

/**
 * TopicMarquee — faixa infinita rolando com os tópicos que a plataforma cobre.
 * Adiciona movimento e comunica a amplitude/foco do conteúdo de relance.
 * CSS-only (.ffv-marquee-track) — pausa no hover, respeita reduced-motion.
 */

const TOPICS: { label: string; color: string }[] = [
  { label: 'Claude Code', color: '#cc785c' },
  { label: 'Agents', color: '#58a6ff' },
  { label: 'RAG', color: '#3fb950' },
  { label: 'MCP', color: '#d2a8ff' },
  { label: 'Amazon Bedrock', color: '#ff9900' },
  { label: 'Transformers', color: '#58a6ff' },
  { label: 'Prompt Caching', color: '#d2a8ff' },
  { label: 'Extended Thinking', color: '#34d399' },
  { label: 'LLM Evals', color: '#e3b341' },
  { label: 'Fine-tuning', color: '#f472b6' },
  { label: 'AI Safety', color: '#f78166' },
  { label: 'Vector Databases', color: '#3fb950' },
  { label: 'Tool Use', color: '#58a6ff' },
  { label: 'Context Engineering', color: '#cc785c' },
  { label: 'AWS SAA-C03', color: '#ff9900' },
  { label: 'MLOps', color: '#d2a8ff' },
  { label: 'Diffusion Models', color: '#f472b6' },
  { label: 'Sistemas Distribuídos', color: '#e3b341' },
];

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap mx-1.5"
      style={{
        background: 'var(--ffv-bg2)',
        border: `1px solid ${color}33`,
        color: 'var(--foreground)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {label}
    </span>
  );
}

export function TopicMarquee() {
  const loop = [...TOPICS, ...TOPICS];
  return (
    <section
      aria-label="Tópicos cobertos pela plataforma"
      className="py-10 overflow-hidden"
      style={{ borderBottom: '1px solid var(--ffv-border)' }}
    >
      <p
        className="text-center font-mono uppercase tracking-widest text-xs mb-5"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.14em' }}
      >
        O que você vai dominar
      </p>
      <div className="ffv-marquee-mask">
        <div className="ffv-marquee-track">
          {loop.map((t, i) => (
            <Pill key={i} label={t.label} color={t.color} />
          ))}
        </div>
      </div>
    </section>
  );
}
