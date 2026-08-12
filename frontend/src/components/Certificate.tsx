'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, X, Share2 } from 'lucide-react';
import { CURRICULUM } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';
import { awardBadge } from '@/lib/engine';
import { STORAGE_KEYS } from '@/lib/constants';
import { getRaw, setRaw } from '@/lib/storage';
import { readableTextColor } from '@/lib/readable-text';

interface CertificateProps {
  trailId: string;
  onClose: () => void;
}

const CERT_W = 1200;
const CERT_H = 675;

/**
 * Gerador de certificado de conclusão de trilha (PNG via Canvas).
 * Usa o nome local salvo em localStorage (ou pede na hora).
 */
export function Certificate({ trailId, onClose }: CertificateProps) {
  const { state } = useGameState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>(() => getRaw(STORAGE_KEYS.USER_NAME) ?? '');
  const [editingName, setEditingName] = useState(false);

  const trail = CURRICULUM.find(t => t.id === trailId);

  const generateImage = useCallback(() => {
    if (!trail || !state || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background com gradient
    const bg = ctx.createLinearGradient(0, 0, CERT_W, CERT_H);
    bg.addColorStop(0, '#0d1117');
    bg.addColorStop(1, '#161b22');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CERT_W, CERT_H);

    // Border ornamental
    ctx.strokeStyle = trail.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, CERT_W - 80, CERT_H - 80);
    ctx.lineWidth = 1;
    ctx.strokeRect(56, 56, CERT_W - 112, CERT_H - 112);

    // Top brand
    ctx.fillStyle = '#e6edf3';
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FFV ACADEMY', CERT_W / 2, 130);

    ctx.fillStyle = '#8b949e';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText('Escola de Engenharia para a Era da IA', CERT_W / 2, 156);

    // Linha separadora
    ctx.strokeStyle = `${trail.color}55`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CERT_W / 2 - 60, 175);
    ctx.lineTo(CERT_W / 2 + 60, 175);
    ctx.stroke();

    // Tipo de certificado
    ctx.fillStyle = trail.color;
    ctx.font = 'bold 20px Inter, system-ui, sans-serif';
    ctx.fillText('CERTIFICADO DE CONCLUSÃO', CERT_W / 2, 225);

    // "Conferimos a"
    ctx.fillStyle = '#8b949e';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillText('Certificamos que', CERT_W / 2, 280);

    // Nome do aluno
    ctx.fillStyle = '#e6edf3';
    ctx.font = 'bold 56px Poppins, Inter, system-ui, sans-serif';
    const displayName = (name || 'Aluno(a) FFV Academy').slice(0, 80);
    ctx.fillText(displayName, CERT_W / 2, 350);

    // Concluiu a trilha
    ctx.fillStyle = '#8b949e';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillText('concluiu com sucesso a trilha', CERT_W / 2, 395);

    // Nome da trilha
    ctx.fillStyle = trail.color;
    ctx.font = 'bold 36px Poppins, Inter, system-ui, sans-serif';
    ctx.fillText(trail.name, CERT_W / 2, 450);

    // Stats
    const totalXp = trail.modules.reduce((acc, m) => acc + m.xp, 0);
    const totalMin = trail.modules.reduce((acc, m) => acc + m.readTime, 0);
    ctx.fillStyle = '#e6edf3';
    ctx.font = '15px Inter, system-ui, sans-serif';
    const statsText = `${trail.modules.length} módulos · ${totalXp} XP · ${totalMin} min de estudo`;
    ctx.fillText(statsText, CERT_W / 2, 495);

    // Data
    const date = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    ctx.fillStyle = '#8b949e';
    ctx.font = '13px Inter, system-ui, sans-serif';
    ctx.fillText(`Concluído em ${date}`, CERT_W / 2, 540);

    // Footer
    ctx.fillStyle = '#484f58';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('fernandofrancovalle.com', 80, CERT_H - 70);

    // Selo / hash
    ctx.textAlign = 'right';
    const hash = simpleHash(`${name}|${trail.id}|${date}`).toString(36).slice(0, 8).toUpperCase();
    ctx.fillText(`Verificação: ${hash}`, CERT_W - 80, CERT_H - 70);

    // Assinatura
    ctx.fillStyle = '#8b949e';
    ctx.font = 'italic 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fernando Franco Valle', CERT_W / 2, CERT_H - 100);
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.fillText('Autor da FFV Academy', CERT_W / 2, CERT_H - 84);

    setImageUrl(canvas.toDataURL('image/png'));
  }, [name, state, trail]);

  useEffect(() => {
    const t = setTimeout(generateImage, 50);
    return () => clearTimeout(t);
  }, [generateImage]);

  function handleNameSave() {
    setRaw(STORAGE_KEYS.USER_NAME, name);
    setEditingName(false);
    setTimeout(generateImage, 50);
  }

  function handleDownload() {
    if (!imageUrl || !trail) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `certificado-ffv-${trail.id}-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
    track('download');
    awardBadge('cert_first');
    const trailsCompleted = CURRICULUM.filter(t =>
      t.modules.every(m => state?.completedModules.includes(m.slug))
    ).length;
    if (trailsCompleted >= 3) awardBadge('cert_three');
  }

  async function handleShare() {
    if (!imageUrl || !trail) return;
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], 'certificado-ffv.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Certificado: ${trail.name}`,
            text: `Acabei de concluir a trilha "${trail.name}" na FFV Academy 🎓`,
            files: [file],
          });
          track('native-share');
          return;
        }
      } catch {}
    }
    handleDownload();
  }

  function handleLinkedIn() {
    if (!trail) return;
    handleDownload();
    const text = `Concluí a trilha "${trail.name}" na FFV Academy 🎓\n\n${trail.modules.length} módulos sobre ${trail.desc.slice(0, 80)}...\n\nFFV Academy é uma escola gratuita de engenharia para a era da IA.`;
    const url = trail.href ? `https://fernandofrancovalle.com${trail.href}` : 'https://fernandofrancovalle.com';
    const intent = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`;
    window.open(intent, '_blank', 'noopener,noreferrer');
    track('linkedin');
  }

  function track(action: string) {
    try {
      window.plausible?.(
        'certificate',
        { props: { action, trailId } }
      );
    } catch {}
  }

  if (!trail) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{
        background: 'color-mix(in srgb, #000 65%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl max-w-3xl w-full"
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

        <h3 className="text-lg font-bold mb-1">Certificado de conclusão</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>
          Trilha: <strong>{trail.name}</strong>
        </p>

        {/* Nome do aluno */}
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>Nome no certificado:</span>
          {editingName ? (
            <>
              <input
                type="text"
                aria-label="Nome no certificado"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                maxLength={80}
                className="text-sm px-3 py-1 rounded-md flex-1 max-w-xs"
                style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)', minHeight: 44 }}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleNameSave()}
              />
              <button
                onClick={handleNameSave}
                className="text-xs px-3 py-1 rounded-md font-semibold"
                style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)', minHeight: 44 }}
              >
                Salvar
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-sm font-semibold underline"
              style={{ color: 'var(--ffv-blue)', minHeight: 44 }}
            >
              {name || 'definir nome'} ✎
            </button>
          )}
        </div>

        <canvas
          ref={canvasRef}
          width={CERT_W}
          height={CERT_H}
          className="hidden"
        />

        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- src is a data URL from canvas, next/image doesn't support data URIs
          <img
            src={imageUrl}
            alt={`Certificado: ${trail.name}`}
            className="w-full rounded-lg mb-4"
            style={{ border: '1px solid var(--ffv-border)' }}
          />
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--ffv-bg3)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)', minHeight: 44 }}
          >
            <Download size={16} />
            Baixar PNG
          </button>
          <button
            type="button"
            onClick={handleLinkedIn}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: '#0a66c2', color: '#fff', minHeight: 44 }}
          >
            <span aria-hidden className="font-bold">in</span>
            Compartilhar no LinkedIn
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: trail.color, color: readableTextColor(trail.color), minHeight: 44 }}
          >
            <Share2 size={16} />
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
}

function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// `getCompletedTrailIds` morava aqui e foi para `queries-leves.ts` como
// `getTrilhasConcluidasLeve` em 11/ago/2026 — precisava do currículo leve, não
// deste componente (que é `next/dynamic` a partir daqui, carregado só quando
// o usuário abre um certificado).
