'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { BADGES_DEF, CURRICULUM, LEVELS, getLevelInfo } from '@/lib/curriculum';
import { getRaw, setRaw } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { BackButton } from '@/components/BackButton';

const CARD_W = 800;
const CARD_H = 420;

export function DevCardClient() {
  const { state } = useGameState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>(() => getRaw(STORAGE_KEYS.USER_NAME) ?? '');
  const [editingName, setEditingName] = useState(!name);

  const levelInfo = state ? getLevelInfo(state.xp) : LEVELS[0];

  const generateCard = useCallback(() => {
    if (!state || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displayName = name || 'Desenvolvedor';
    const totalModules = CURRICULUM.reduce((a, t) => a + t.modules.length, 0);
    const completedPct = totalModules === 0 ? 0 : Math.round((state.completedModules.length / totalModules) * 100);
    const topBadges = state.badges.slice(0, 5).map(id => BADGES_DEF.find(b => b.id === id)).filter(Boolean);
    const color = levelInfo.color;

    // Background
    const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    bg.addColorStop(0, '#0d1117');
    bg.addColorStop(1, '#161b22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Accent glow at top-left
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 350);
    glow.addColorStop(0, `${color}20`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Border
    ctx.strokeStyle = `${color}60`;
    ctx.lineWidth = 2;
    ctx.roundRect(16, 16, CARD_W - 32, CARD_H - 32, 20);
    ctx.stroke();

    // Logo
    ctx.fillStyle = color;
    ctx.font = 'bold 13px monospace';
    ctx.fillText('FFV ACADEMY', 48, 60);

    // Level badge
    ctx.fillStyle = `${color}25`;
    ctx.roundRect(48, 80, 180, 44, 10);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`${levelInfo.icon}  Nível ${state.level} · ${levelInfo.name}`, 64, 108);

    // Name
    ctx.fillStyle = '#e6edf3';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(displayName, 48, 185);

    // XP
    ctx.fillStyle = '#8b949e';
    ctx.font = '15px monospace';
    ctx.fillText(`${state.xp.toLocaleString('pt-BR')} XP`, 48, 215);

    // Divider
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(48, 240);
    ctx.lineTo(CARD_W - 48, 240);
    ctx.stroke();

    // Stats row
    const stats = [
      { label: 'STREAK', value: `${state.streak}d 🔥` },
      { label: 'MÓDULOS', value: `${state.completedModules.length}` },
      { label: 'CONCLUÍDO', value: `${completedPct}%` },
      { label: 'BADGES', value: `${state.badges.length}` },
    ];
    stats.forEach((s, i) => {
      const x = 48 + i * 180;
      ctx.fillStyle = '#8b949e';
      ctx.font = '10px monospace';
      ctx.fillText(s.label, x, 278);
      ctx.fillStyle = '#e6edf3';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(s.value, x, 308);
    });

    // Badges row
    if (topBadges.length > 0) {
      ctx.fillStyle = '#8b949e';
      ctx.font = '10px monospace';
      ctx.fillText('BADGES', 48, 360);
      topBadges.forEach((b, i) => {
        if (!b) return;
        ctx.font = '22px sans-serif';
        ctx.fillText(b.icon, 48 + i * 40, 386);
      });
    }

    // Domain watermark
    ctx.fillStyle = '#30363d';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('ffv.academy/devcard', CARD_W - 48, CARD_H - 32);
    ctx.textAlign = 'left';

    setImageUrl(canvas.toDataURL('image/png'));
  }, [state, name, levelInfo]);

  useEffect(() => {
    if (state) generateCard();
  }, [state, generateCard]);

  function handleDownload() {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `ffv-devcard-${name || 'dev'}.png`;
    a.click();
  }

  function handleShare() {
    const text = `Meu dev card na FFV Academy 🚀 — Nível ${state?.level}, ${state?.xp.toLocaleString('pt-BR')} XP, ${state?.streak} dias de streak. Aprenda IA como engenheiro: ffv.academy`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://ffv.academy/devcard')}&summary=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  }

  if (!state) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        {/* Título fora da condição de carregamento — ver a nota em ProgressoClient.tsx:
           sem isto, o HTML servido responde 200 sem nenhum <h1>. */}
        <h1 className="text-2xl font-bold mb-4">Meu Dev Card</h1>
        <div className="text-4xl mb-4">🃏</div>
        <p style={{ color: 'var(--ffv-muted)' }}>Carregando seu dev card…</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--ffv-bg)', minHeight: '100vh', color: 'var(--foreground)' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <BackButton href="/progresso" className="text-xs font-mono mb-6 transition-opacity hover:opacity-70 inline-flex items-center gap-1.5">
          PROGRESSO
        </BackButton>

        <div className="flex items-center gap-3 mb-8">
          <span style={{ fontSize: 36 }}>🃏</span>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Seu Dev Card
            </h1>
            <p style={{ fontSize: 13, color: 'var(--ffv-muted)' }}>Exporte e compartilhe suas conquistas no LinkedIn</p>
          </div>
        </div>

        {/* Name input */}
        {editingName ? (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <label htmlFor="devcard-name" className="block text-sm font-semibold mb-2">Seu nome no card</label>
            <div className="flex gap-3">
              <input
                id="devcard-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Digite seu nome..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                style={{
                  background: 'var(--ffv-bg)',
                  border: '1px solid var(--ffv-border)',
                  color: 'var(--foreground)',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setRaw(STORAGE_KEYS.USER_NAME, name);
                  setEditingName(false);
                  setTimeout(generateCard, 100);
                }}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)', border: 'none', cursor: 'pointer' }}
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium">{name || 'Sem nome'}</span>
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-muted)', cursor: 'pointer' }}
            >
              Editar
            </button>
          </div>
        )}

        {/* Canvas (hidden) + preview */}
        <canvas ref={canvasRef} width={CARD_W} height={CARD_H} className="hidden" />

        {imageUrl && (
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- canvas data URL, not optimizable */}
            <img
              src={imageUrl}
              alt="Dev Card"
              className="w-full rounded-2xl"
              style={{ border: '1px solid var(--ffv-border)', maxWidth: CARD_W }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)', border: 'none', cursor: 'pointer' }}
          >
            <Download size={16} />
            Download PNG
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
            style={{ background: '#0a66c2', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            <Share2 size={16} />
            Compartilhar no LinkedIn
          </button>
          <button
            type="button"
            onClick={generateCard}
            className="px-5 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)', cursor: 'pointer' }}
          >
            Regenerar
          </button>
        </div>

        {/* Stats grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Nível', value: state.level.toString(), sub: levelInfo.name, accent: levelInfo.color },
            { label: 'XP total', value: state.xp.toLocaleString('pt-BR'), sub: 'pontos de experiência', accent: 'var(--ffv-gold)' },
            { label: 'Streak', value: `${state.streak}d`, sub: state.streak >= 7 ? 'Incrível 🔥' : 'Continue!', accent: '#f78166' },
            { label: 'Badges', value: state.badges.length.toString(), sub: `de ${BADGES_DEF.length} possíveis`, accent: 'var(--ffv-purple)' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{ background: 'var(--ffv-bg2)', border: `1px solid color-mix(in srgb, ${s.accent} 20%, transparent)` }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: s.accent, letterSpacing: '0.12em' }}>
                {s.label}
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--ffv-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
