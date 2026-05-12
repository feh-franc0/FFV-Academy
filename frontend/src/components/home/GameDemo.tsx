'use client';

/**
 * Mini visual da gamificação para o Hero.
 * Mostra: card do módulo + ganho de XP + badge desbloqueando + streak.
 * Animações são CSS-only (sem JS) para zero overhead.
 */

export function GameDemo({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="relative"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
        borderRadius: 'var(--radius-xl)',
        padding: compact ? 18 : 24,
        boxShadow: '0 30px 80px -30px color-mix(in srgb, var(--ffv-blue) 30%, transparent)',
      }}
    >
      <style>{`
        @keyframes ffv-xp-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.95; }
          15% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes ffv-bar-fill {
          0% { width: 30%; }
          50% { width: 78%; }
          100% { width: 78%; }
        }
        @keyframes ffv-badge-pop {
          0%, 70% { transform: scale(0.6) rotate(-12deg); opacity: 0; }
          80% { transform: scale(1.18) rotate(8deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes ffv-streak {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 22 }}>🤖</span>
          <span className="font-mono text-xs font-bold" style={{ letterSpacing: '0.05em' }}>
            MÓDULO ATUAL
          </span>
        </div>
        <span
          className="font-mono text-[10px] px-2 py-1 rounded-full"
          style={{
            background: 'color-mix(in srgb, var(--ffv-green) 15%, transparent)',
            color: 'var(--ffv-green)',
            letterSpacing: '0.06em',
          }}
        >
          ATIVO
        </span>
      </div>

      <h3 className="font-bold text-base mb-1">RAG do zero ao production-ready</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>
        Trilha: Engenharia AI-Native · 16min de leitura
      </p>

      {/* Barra de XP animada */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] font-bold" style={{ letterSpacing: '0.05em' }}>
            XP DO MÓDULO
          </span>
          <span
            className="font-mono text-xs font-bold"
            style={{
              color: 'var(--ffv-blue)',
              animation: 'ffv-xp-bounce 3s ease-in-out infinite',
              display: 'inline-block',
            }}
          >
            +75 XP
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--ffv-border)' }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
              animation: 'ffv-bar-fill 3s ease-out infinite',
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      {/* Stats em row */}
      <div
        className="grid grid-cols-3 gap-2 mt-5"
        style={{
          background: 'var(--ffv-bg)',
          padding: 12,
          borderRadius: 12,
          border: '1px solid var(--ffv-border)',
        }}
      >
        <Stat label="NÍVEL" value="7" color="var(--ffv-blue)" />
        <Stat label="STREAK" value="🔥 12d" color="var(--ffv-orange, #fb923c)" pulse />
        <Stat label="BADGES" value="14" color="var(--ffv-purple)" />
      </div>

      {/* Badge desbloqueada — escondida no compact mobile */}
      {!compact && <div
        className="mt-4 flex items-center gap-3 p-3 rounded-xl"
        style={{
          background: 'color-mix(in srgb, var(--ffv-purple) 8%, transparent)',
          border: '1px solid color-mix(in srgb, var(--ffv-purple) 30%, transparent)',
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{
            background: 'linear-gradient(135deg, var(--ffv-purple), var(--ffv-blue))',
            animation: 'ffv-badge-pop 4s ease-in-out infinite',
            boxShadow: '0 6px 20px -4px color-mix(in srgb, var(--ffv-purple) 50%, transparent)',
          }}
        >
          🏆
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold">Badge desbloqueada!</div>
          <div className="text-[11px]" style={{ color: 'var(--ffv-muted)' }}>
            "Especialista em RAG"
          </div>
        </div>
      </div>}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  pulse = false,
}: {
  label: string;
  value: string;
  color: string;
  pulse?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className="text-base font-bold"
        style={{
          color,
          animation: pulse ? 'ffv-streak 2s ease-in-out infinite' : undefined,
        }}
      >
        {value}
      </div>
      <div
        className="font-mono text-[9px] mt-1"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.07em' }}
      >
        {label}
      </div>
    </div>
  );
}
