'use client';

import { useRef, useState } from 'react';

import {
  STUDY_REQUEST_LIMITS,
  StudyRequestError,
  submitStudyRequest,
} from '@/lib/study-request-api';

// StudyRequestForm — formulário público de captação para o pivot 2026-05.
//
// Estados:
//   idle       — usuário preenchendo
//   submitting — request em voo
//   success    — confirmação inline (sem redirect)
//   error      — mensagem amigável + permite retry
//
// O upload de arquivos é OPCIONAL mas destacado como recomendado.
// Validações de tamanho / tipo / quantidade são espelhadas do backend.

const STUDY_AREAS = [
  { value: 'tecnologia',           label: 'Tecnologia / Desenvolvimento' },
  { value: 'medicina-veterinaria', label: 'Medicina Veterinária' },
  { value: 'medicina',             label: 'Medicina' },
  { value: 'engenharia',           label: 'Engenharia' },
  { value: 'direito',              label: 'Direito' },
  { value: 'administracao',        label: 'Administração / Negócios' },
  { value: 'saude',                label: 'Outras áreas da Saúde' },
  { value: 'concursos',            label: 'Concursos públicos' },
  { value: 'faculdade-geral',      label: 'Faculdade em geral' },
  { value: 'curso-livre',          label: 'Curso livre / Aperfeiçoamento' },
  { value: 'outro',                label: 'Outra área' },
] as const;

type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function StudyRequestForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studyArea, setStudyArea] = useState('');
  const [institution, setInstitution] = useState('');
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [state, setState] = useState<FormState>({ kind: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(list: FileList | null) {
    setFileError(null);
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const next: File[] = [...files];
    for (const f of incoming) {
      if (next.length >= STUDY_REQUEST_LIMITS.maxAttachments) {
        setFileError(`Máximo ${STUDY_REQUEST_LIMITS.maxAttachments} arquivos.`);
        break;
      }
      if (f.size > STUDY_REQUEST_LIMITS.maxAttachmentBytes) {
        setFileError(`"${f.name}" excede ${STUDY_REQUEST_LIMITS.maxAttachmentBytes / 1024 / 1024} MB.`);
        continue;
      }
      // Validamos por extensão pra abrir mais navegadores; o backend revalida MIME.
      const lower = f.name.toLowerCase();
      const allowed = STUDY_REQUEST_LIMITS.allowedExtensions.some(ext => lower.endsWith(ext));
      if (!allowed) {
        setFileError(`"${f.name}" não é um tipo permitido (PDF, DOCX, TXT, PNG, JPG).`);
        continue;
      }
      next.push(f);
    }
    setFiles(next);
  }

  function removeFile(idx: number) {
    setFiles(files.filter((_, i) => i !== idx));
    setFileError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: 'submitting' });
    try {
      const result = await submitStudyRequest({
        name,
        email,
        phone: phone || undefined,
        studyArea,
        institution: institution || undefined,
        subject,
        goal: goal || undefined,
        description,
        marketingConsent,
        attachments: files,
      });
      setState({ kind: 'success', message: result.message });
    } catch (err) {
      const detail = err instanceof StudyRequestError
        ? err.detail
        : err instanceof Error
          ? err.message
          : 'Falha ao enviar. Tente novamente em instantes.';
      setState({ kind: 'error', message: detail });
    }
  }

  // Tela de sucesso (substitui o form inteiro pra dar foco à confirmação)
  if (state.kind === 'success') {
    return (
      <div
        className="rounded-2xl p-7"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px solid color-mix(in srgb, var(--ffv-green) 35%, var(--ffv-border))',
          boxShadow: 'var(--ffv-shadow-soft)',
        }}
        role="status"
        aria-live="polite"
      >
        <div className="text-4xl mb-4">✅</div>
        <h3
          style={{
            fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          Solicitação recebida!
        </h3>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
          {state.message}
        </p>
        <p className="text-xs mt-4" style={{ color: 'var(--ffv-muted)' }}>
          Você pode fechar essa janela ou enviar outra solicitação se quiser.
        </p>
        <button
          type="button"
          onClick={() => {
            setName('');
            setEmail('');
            setPhone('');
            setStudyArea('');
            setInstitution('');
            setSubject('');
            setGoal('');
            setDescription('');
            setFiles([]);
            setState({ kind: 'idle' });
          }}
          className="mt-5 w-full py-3 rounded-xl text-sm font-semibold"
          style={{
            background: 'var(--ffv-bg)',
            border: '1px solid var(--ffv-border)',
            color: 'var(--foreground)',
          }}
        >
          Enviar outra solicitação
        </button>
      </div>
    );
  }

  const submitting = state.kind === 'submitting';

  return (
    <div
      className="rounded-2xl p-7"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
        boxShadow: '0 24px 60px -12px rgba(0,0,0,0.35)',
        // Card é claro mas vive dentro de uma section com fundo escuro (color
        // herdada = cream). Resetamos a cor de texto pra ink — senão o título
        // fica invisível.
        color: 'var(--foreground)',
      }}
    >
      <div
        className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg text-xs font-semibold"
        style={{
          background: 'color-mix(in srgb, var(--ffv-blue) 10%, transparent)',
          border: '1px solid color-mix(in srgb, var(--ffv-blue) 25%, transparent)',
          color: 'var(--ffv-blue)',
        }}
      >
        <span>✨</span>
        <span>SLA 24h · revisão humana · gratuita na V1</span>
      </div>

      <h3
        style={{
          fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          marginBottom: 8,
          color: 'var(--foreground)',
        }}
      >
        Solicitar minha base de estudo
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
        Diga o que você precisa estudar. Quanto mais detalhes e materiais você enviar, mais aderente fica sua base — e mais rápido a curadoria entrega.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={submitting}>
        <Field label="Nome" required>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Como podemos te chamar?"
            className={inputClass}
            style={inputStyle}
            disabled={submitting}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="E-mail" required>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className={inputClass}
              style={inputStyle}
              disabled={submitting}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(opcional)"
              className={inputClass}
              style={inputStyle}
              disabled={submitting}
            />
          </Field>
        </div>

        <Field label="Área de estudo" required>
          <select
            required
            value={studyArea}
            onChange={e => setStudyArea(e.target.value)}
            className={inputClass}
            style={{ ...inputStyle, appearance: 'none' }}
            disabled={submitting}
          >
            <option value="" disabled>Selecione uma área</option>
            {STUDY_AREAS.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Faculdade, curso ou instituição">
          <input
            type="text"
            value={institution}
            onChange={e => setInstitution(e.target.value)}
            placeholder="(opcional)"
            className={inputClass}
            style={inputStyle}
            disabled={submitting}
          />
        </Field>

        <Field label="Matéria ou tema" required>
          <input
            type="text"
            required
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Ex.: Genética animal, Cálculo I, Direito Constitucional…"
            className={inputClass}
            style={inputStyle}
            disabled={submitting}
          />
        </Field>

        <Field label="Objetivo">
          <input
            type="text"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="Ex.: Passar na prova, revisar antes do estágio, dominar o tema…"
            className={inputClass}
            style={inputStyle}
            disabled={submitting}
          />
        </Field>

        <Field label="O que você quer aprender?" required>
          <textarea
            required
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descreva o que precisa estudar com o máximo de detalhes — o que sabe, o que falta, prazos, dúvidas."
            className={inputClass}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 96 }}
            disabled={submitting}
          />
        </Field>

        {/* Upload opcional (recomendado) */}
        <div>
          <label className="text-xs font-semibold flex items-center gap-2" style={{ color: 'var(--ffv-muted)' }}>
            <span>Anexar materiais</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{
                background: 'color-mix(in srgb, var(--ffv-cyan) 14%, transparent)',
                color: 'var(--ffv-cyan)',
              }}
            >
              RECOMENDADO
            </span>
          </label>
          <p className="text-[11px] mt-1" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
            PDFs, DOCX, TXT, PNG ou JPG da sua faculdade, curso ou anotações. Até {STUDY_REQUEST_LIMITS.maxAttachments} arquivos,{' '}
            {STUDY_REQUEST_LIMITS.maxAttachmentBytes / 1024 / 1024} MB cada.
          </p>

          <div
            className="mt-2 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer"
            style={{
              background: 'var(--ffv-bg)',
              border: '1px dashed var(--ffv-border)',
              minHeight: 80,
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--ffv-blue)';
            }}
            onDragLeave={e => {
              e.currentTarget.style.borderColor = 'var(--ffv-border)';
            }}
            onDrop={e => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--ffv-border)';
              handleFiles(e.dataTransfer.files);
            }}
          >
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              <strong style={{ color: 'var(--foreground)' }}>Clique aqui</strong> ou arraste arquivos para anexar
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={STUDY_REQUEST_LIMITS.allowedExtensions.join(',')}
              className="sr-only"
              aria-label="Anexar materiais (PDF, DOCX, TXT, PNG, JPG)"
              onChange={e => handleFiles(e.target.files)}
              disabled={submitting}
            />
          </div>

          {files.length > 0 && (
            <ul className="mt-3 space-y-1.5" aria-label="Arquivos anexados">
              {files.map((f, idx) => (
                <li
                  key={`${f.name}-${idx}`}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
                >
                  <span className="truncate flex-1">{f.name}</span>
                  <span style={{ color: 'var(--ffv-muted)' }}>{Math.round(f.size / 1024)} KB</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    aria-label={`Remover ${f.name}`}
                    style={{ color: 'var(--ffv-red)' }}
                    className="font-bold px-1"
                    disabled={submitting}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {fileError && (
            <p className="text-xs mt-2" style={{ color: 'var(--ffv-red)' }}>
              {fileError}
            </p>
          )}
        </div>

        <label className="flex items-start gap-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={e => setMarketingConsent(e.target.checked)}
            style={{ marginTop: 2 }}
            disabled={submitting}
          />
          <span>
            Aceito receber updates sobre minha solicitação por e-mail ou WhatsApp.
            Você pode cancelar quando quiser.
          </span>
        </label>

        {state.kind === 'error' && (
          <p
            className="text-xs px-3 py-2 rounded-lg"
            role="alert"
            style={{
              background: 'color-mix(in srgb, var(--ffv-red) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--ffv-red) 30%, transparent)',
              color: 'var(--ffv-red)',
            }}
          >
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all"
          style={{
            background: 'var(--ffv-blue)',
            color: '#fff',
            boxShadow: '0 8px 24px -6px color-mix(in srgb, var(--ffv-blue) 50%, transparent)',
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? 'progress' : 'pointer',
          }}
        >
          {submitting ? 'Enviando...' : 'Enviar minha solicitação →'}
        </button>

        <p
          className="text-[11px] text-center"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.03em' }}
        >
          🔒 LGPD · Seus dados ficam com a gente, sem spam.
        </p>
      </form>
    </div>
  );
}

const inputClass = 'w-full px-4 py-3 rounded-xl text-sm font-normal';

const inputStyle: React.CSSProperties = {
  background: 'var(--ffv-bg)',
  border: '1px solid var(--ffv-border)',
  color: 'var(--foreground)',
  outline: 'none',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--ffv-muted)' }}>
        {label}
        {required && <span style={{ color: 'var(--ffv-red)' }} aria-hidden>*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
