'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { issueCertificate, type CertificateRecord } from '@/lib/certificates';
import type { Simulado } from '@/lib/simulados';
import type { UserProfile } from '@/lib/auth';

interface Props {
  simulado: Simulado;
  user: UserProfile;
  score: number;
  onClose: () => void;
}

const W = 1200;
const H = 780;

/**
 * Modal de emissão de certificado.
 * - Gera record via crypto.subtle.digest (hash SHA-256)
 * - Desenha PDF via canvas → toDataURL (PNG, simples, evita dep extra)
 * - Botão "Baixar" exporta PNG; "Copiar link de verificação" copia URL
 */
export function CertificateModal({ simulado, user, score, onClose }: Props) {
  const [name, setName] = useState(user.name);
  const [record, setRecord] = useState<CertificateRecord | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    issueCertificate({
      email: user.email,
      name: user.name,
      simuladoId: simulado.id,
      score,
    }).then(setRecord).catch(() => {});
  }, [simulado.id, user.email, user.name, score]);

  const draw = useCallback(() => {
    if (!record || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // BG
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#0d1117');
    g.addColorStop(1, '#1a2230');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Borda
    ctx.strokeStyle = '#f78166';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // Título
    ctx.fillStyle = '#f78166';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FFV ACADEMY · CERTIFICADO DE CONCLUSÃO', W / 2, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
    ctx.fillText('Certificado de Conclusão', W / 2, 200);

    // Name
    ctx.fillStyle = '#58a6ff';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText(name.toUpperCase(), W / 2, 340);

    // Subtitle
    ctx.fillStyle = '#9aa5b1';
    ctx.font = '22px system-ui, -apple-system, sans-serif';
    ctx.fillText('concluiu com aproveitamento o simulado', W / 2, 400);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillText(simulado.certification, W / 2, 460);

    // Score + date
    ctx.fillStyle = '#f78166';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Pontuação: ${score}%`, W / 2, 560);

    ctx.fillStyle = '#9aa5b1';
    ctx.font = '18px system-ui, -apple-system, sans-serif';
    const date = new Date(record.issuedAt).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    ctx.fillText(`Emitido em ${date}`, W / 2, 620);

    // Hash
    ctx.fillStyle = '#58a6ff';
    ctx.font = '14px "Roboto Mono", monospace';
    ctx.fillText(
      `Verifique em fernandofrancovalle.com/verificar?h=${record.hash}`,
      W / 2,
      700,
    );

    // Signature
    ctx.fillStyle = '#9aa5b1';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('Fernando Franco Valle — Fundador, FFV Academy', W / 2, 740);

    setImageUrl(canvasRef.current.toDataURL('image/png'));
  }, [record, name, simulado.certification, score]);

  useEffect(() => {
    if (record) {
      const t = setTimeout(draw, 50);
      return () => clearTimeout(t);
    }
  }, [record, draw]);

  function handleDownload() {
    if (!imageUrl || !record) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `certificado-${simulado.id}-${record.hash}.png`;
    a.click();
  }

  function handleCopyLink() {
    if (!record) return;
    const url = `${window.location.origin}/verificar?h=${record.hash}`;
    navigator.clipboard?.writeText(url);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl rounded-2xl p-6 my-8"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">🎓 Seu certificado</h2>
          <button onClick={onClose} style={{ color: 'var(--ffv-muted)' }}>✕</button>
        </div>

        <label className="block text-xs font-semibold mb-4" style={{ color: 'var(--ffv-muted)' }}>
          Nome que aparecerá no certificado
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.slice(0, 80))}
            onBlur={() => draw()}
            className="mt-1 w-full px-3 py-2 rounded-lg text-sm font-normal"
            style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          />
        </label>

        <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid var(--ffv-border)' }}>
          <canvas ref={canvasRef} width={W} height={H} className="w-full h-auto" />
        </div>

        {record && (
          <p className="text-[11px] font-mono mb-4" style={{ color: 'var(--ffv-muted)' }}>
            Hash de verificação: <span style={{ color: 'var(--ffv-blue)' }}>{record.hash}</span>
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="flex-1 px-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
            style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
          >
            📥 Baixar PNG
          </button>
          <button
            onClick={handleCopyLink}
            disabled={!record}
            className="px-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
            style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)' }}
          >
            🔗 Copiar link
          </button>
        </div>

        <p className="text-[10px] mt-3" style={{ color: 'var(--ffv-muted)' }}>
          🧪 MVP: certificado emitido localmente neste dispositivo. Quando tivermos backend, será emitido via servidor com autoridade de verificação.
        </p>
      </div>
    </div>
  );
}
