'use client';

import { useCallback, useRef, useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { CURRICULUM, HUBS, getLevelInfo, getHubStats } from '@/lib/curriculum';

interface ShareCardProps {
  onClose: () => void;
}

const CARD_W = 600;
const CARD_H = 340;

export function ShareCard({ onClose }: ShareCardProps) {
  const { state } = useGameState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateImage = useCallback(() => {
    if (!state || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const level = getLevelInfo(state.xp);
    const totalModules = CURRICULUM.reduce((acc, t) => acc + t.modules.length, 0);
    const completedCount = state.completedModules.length;
    const pct = Math.round((completedCount / totalModules) * 100);
    const trailsDone = CURRICULUM.filter(t =>
      t.modules.every(m => state.completedModules.includes(m.slug))
    ).length;

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Border
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, CARD_W - 1, CARD_H - 1);

    // Top accent bar
    const gradient = ctx.createLinearGradient(0, 0, CARD_W, 0);
    gradient.addColorStop(0, '#58a6ff');
    gradient.addColorStop(0.33, '#3fb950');
    gradient.addColorStop(0.66, '#d2a8ff');
    gradient.addColorStop(1, '#ffa657');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_W, 3);

    // Logo area
    ctx.fillStyle = '#e6edf3';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillText('FFV', 28, 40);
    ctx.fillStyle = '#58a6ff';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillText(' Academy', 28 + ctx.measureText('FFV').width, 40);

    // Level badge
    ctx.fillStyle = level?.color ?? '#58a6ff';
    ctx.font = 'bold 11px Inter, system-ui, sans-serif';
    const levelText = `Nv.${state.level} · ${level?.name ?? 'Curioso'}`;
    const levelW = ctx.measureText(levelText).width + 20;
    roundRect(ctx, CARD_W - levelW - 24, 24, levelW, 26, 13);
    ctx.fillStyle = `${level?.color ?? '#58a6ff'}22`;
    ctx.fill();
    ctx.fillStyle = level?.color ?? '#58a6ff';
    ctx.fillText(levelText, CARD_W - levelW - 14, 42);

    // Main stats
    const statsY = 90;

    // XP
    ctx.fillStyle = '#e6edf3';
    ctx.font = 'bold 42px Inter, system-ui, sans-serif';
    ctx.fillText(`${state.xp.toLocaleString()}`, 28, statsY + 40);
    ctx.fillStyle = '#8b949e';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText('XP total', 28, statsY + 58);

    // Streak
    ctx.fillStyle = '#ffa657';
    ctx.font = 'bold 32px Inter, system-ui, sans-serif';
    const streakX = 240;
    ctx.fillText(`${state.streak}`, streakX, statsY + 36);
    ctx.fillStyle = '#8b949e';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText('dias de streak', streakX, statsY + 58);

    // Modules
    ctx.fillStyle = '#3fb950';
    ctx.font = 'bold 32px Inter, system-ui, sans-serif';
    const modX = 420;
    ctx.fillText(`${completedCount}`, modX, statsY + 36);
    ctx.fillStyle = '#8b949e';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText(`de ${totalModules} módulos`, modX, statsY + 58);

    // Progress bar
    const barY = statsY + 80;
    ctx.fillStyle = '#21262d';
    roundRect(ctx, 28, barY, CARD_W - 56, 10, 5);
    ctx.fill();
    if (pct > 0) {
      const barGrad = ctx.createLinearGradient(28, 0, 28 + (CARD_W - 56) * (pct / 100), 0);
      barGrad.addColorStop(0, '#58a6ff');
      barGrad.addColorStop(1, '#3fb950');
      ctx.fillStyle = barGrad;
      roundRect(ctx, 28, barY, Math.max(10, (CARD_W - 56) * (pct / 100)), 10, 5);
      ctx.fill();
    }
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText(`${pct}% completo · ${trailsDone} trilhas concluídas · ${state.badges.length} badges`, 28, barY + 26);

    // Hubs progress
    const hubY = barY + 48;
    ctx.fillStyle = '#8b949e';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText('HUBS', 28, hubY);

    HUBS.forEach((hub, i) => {
      const hx = 28 + i * 140;
      const stats = getHubStats(hub, state.completedModules);
      ctx.fillStyle = hub.color;
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.fillText(hub.shortName, hx, hubY + 20);
      ctx.fillStyle = '#8b949e';
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.fillText(`${stats.pct}%`, hx + ctx.measureText(hub.shortName).width + 6, hubY + 20);
    });

    // Footer
    ctx.fillStyle = '#30363d';
    ctx.fillRect(28, CARD_H - 40, CARD_W - 56, 1);
    ctx.fillStyle = '#484f58';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText('fernandofrancovalle.com', 28, CARD_H - 16);
    ctx.fillStyle = '#484f58';
    ctx.textAlign = 'right';
    ctx.fillText('100% gratuito · zero cadastro', CARD_W - 28, CARD_H - 16);
    ctx.textAlign = 'left';

    const url = canvas.toDataURL('image/png');
    setImageUrl(url);
  }, [state]);

  // Generate on mount
  if (!imageUrl && state) {
    setTimeout(generateImage, 50);
  }

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `ffv-academy-progresso-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  }, [imageUrl]);

  const handleShare = useCallback(async () => {
    if (!imageUrl) return;

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], 'ffv-academy-progresso.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Meu progresso na FFV Academy',
            text: 'Confira meu progresso na FFV Academy — escola gratuita de engenharia para a era da IA!',
            files: [file],
          });
          return;
        }
      } catch {
        // Fallback to clipboard
      }
    }

    // Fallback: copy URL
    try {
      await navigator.clipboard.writeText('https://fernandofrancovalle.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [imageUrl]);

  if (!state) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{
        background: 'color-mix(in srgb, #000 55%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl max-w-[640px] w-full"
        style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', padding: 24 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md"
          style={{ color: 'var(--ffv-muted)' }}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold mb-1">Compartilhar progresso</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>
          Salve a imagem ou compartilhe nas redes sociais
        </p>

        <canvas
          ref={canvasRef}
          width={CARD_W}
          height={CARD_H}
          className="hidden"
        />

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Card de progresso FFV Academy"
            className="w-full rounded-lg mb-4"
            style={{ border: '1px solid var(--ffv-border)' }}
          />
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--ffv-bg3)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)' }}
          >
            <Download size={16} />
            Salvar imagem
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
          >
            <Share2 size={16} />
            {copied ? 'Link copiado!' : 'Compartilhar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
