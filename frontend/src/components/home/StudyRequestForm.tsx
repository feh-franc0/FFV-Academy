'use client';

import { useRef, useState } from 'react';

import {
  STUDY_REQUEST_LIMITS,
  StudyRequestError,
  submitStudyRequest,
  type StudyRequestResult,
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
  | { kind: 'success'; message: string; result: StudyRequestResult; email: string }
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
      setState({ kind: 'success', message: result.message, result, email });
    } catch (err) {
      const detail = err instanceof StudyRequestError
        ? err.detail
        : err instanceof Error
          ? err.message
          : 'Falha ao enviar. Tente novamente em instantes.';
      setState({ kind: 'error', message: detail });
    }
  }

  // Tela de sucesso — SLA tracker visível em 3 etapas + ID + email + ETA.
  // Diferencial competitivo vs NotebookLM: transforma a espera de 24h em
  // prova de qualidade (curadoria humana) em vez de gargalo.
  if (state.kind === 'success') {
    const shortId = state.result.id.slice(0, 8).toUpperCase();
    return (
      <div
        className="rounded-2xl p-7"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px solid color-mix(in srgb, var(--ffv-green) 35%, var(--ffv-border))',
          boxShadow: 'var(--ffv-shadow-soft)',
          color: 'var(--foreground)',
        }}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3 mb-5">
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 44,
              height: 44,
              background: 'color-mix(in srgb, var(--ffv-green) 16%, transparent)',
              border: '1px solid color-mix(in srgb, var(--ffv-green) 40%, transparent)',
              color: 'var(--ffv-green)',
              fontSize: 22,
              fontWeight: 800,
            }}
            aria-hidden
          >
            ✓
          </div>
          <div>
            <h3
              style={{
                fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: 4,
                color: 'var(--foreground)',
              }}
            >
              Solicitação recebida.
            </h3>
            <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
              {state.message}
            </p>
          </div>
        </div>

        {/* SLA tracker — 3 etapas visíveis pra desarmar ansiedade da espera */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{
            background: 'var(--ffv-bg)',
            border: '1px solid var(--ffv-border)',
          }}
        >
          <p
            className="font-mono uppercase text-[10px] mb-3"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.12em', fontWeight: 700 }}
          >
            Status da sua base
          </p>
          <ol className="flex flex-col gap-3 list-none p-0 m-0" aria-label="Etapas da geração da base">
            <StatusStep
              n="01"
              title="Recebida"
              desc="Análise inicial em fila"
              state="done"
            />
            <StatusStep
              n="02"
              title="Curadoria humana"
              desc="Engenheiro revisa material + monta trilha · em média 8-12h"
              state="active"
            />
            <StatusStep
              n="03"
              title="Trilha pronta"
              desc="Você recebe e-mail e WhatsApp com link · até 24h"
              state="pending"
            />
          </ol>
        </div>

        {/* Identidade da solicitação — dá sensação de "isso é real" */}
        <dl
          className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 text-xs mb-5"
          style={{ color: 'var(--ffv-muted)' }}
        >
          <dt className="font-semibold">ID:</dt>
          <dd className="font-mono" style={{ color: 'var(--foreground)' }}>
            #{shortId}
          </dd>
          <dt className="font-semibold">Confirmação por e-mail:</dt>
          <dd style={{ color: 'var(--foreground)' }} className="truncate">{state.email}</dd>
          {state.result.attachmentCount > 0 && (
            <>
              <dt className="font-semibold">Anexos recebidos:</dt>
              <dd style={{ color: 'var(--foreground)' }}>
                {state.result.attachmentCount} arquivo{state.result.attachmentCount === 1 ? '' : 's'}
              </dd>
            </>
          )}
        </dl>

        {/* Garantia honesta — fecha a venda emocionalmente */}
        <p
          className="text-xs px-3 py-2.5 rounded-lg mb-4"
          style={{
            background: 'color-mix(in srgb, var(--ffv-blue) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ffv-blue) 22%, transparent)',
            color: 'var(--foreground)',
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: 'var(--ffv-blue)' }}>Garantia honesta:</strong>{' '}
          se a trilha não te servir, responde o e-mail que a gente refaz. Não usamos seu material pra treinar IA.
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
          className="w-full py-3 rounded-xl text-sm font-semibold"
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

// StatusStep — etapa visual do SLA tracker. Cada estado tem semântica única:
//  - done: bolinha preenchida verde, número/check, texto normal
//  - active: bolinha pulsando azul, número, texto bold
//  - pending: bolinha vazia cinza, número fade, texto fade
function StatusStep({
  n,
  title,
  desc,
  state,
}: {
  n: string;
  title: string;
  desc: string;
  state: 'done' | 'active' | 'pending';
}) {
  const isActive = state === 'active';
  const isDone = state === 'done';
  const dotBg = isDone
    ? 'var(--ffv-green)'
    : isActive
      ? 'var(--ffv-blue)'
      : 'transparent';
  const dotColor = isDone || isActive ? '#fff' : 'var(--ffv-muted)';
  const dotBorder = isDone || isActive
    ? `1px solid ${dotBg}`
    : '1px dashed var(--ffv-border)';
  const titleColor = state === 'pending' ? 'var(--ffv-muted)' : 'var(--foreground)';
  const titleWeight = isActive ? 700 : 600;

  return (
    <li className="flex items-start gap-3">
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          minWidth: 26,
          borderRadius: '50%',
          background: dotBg,
          border: dotBorder,
          color: dotColor,
          fontSize: 10,
          fontWeight: 700,
          fontFamily: 'var(--font-inter)',
          letterSpacing: '0.04em',
          marginTop: 1,
          // pulse sutil quando ativo — atende a expectativa de "andando agora"
          boxShadow: isActive
            ? '0 0 0 4px color-mix(in srgb, var(--ffv-blue) 16%, transparent)'
            : 'none',
          animation: isActive ? 'ffv-sla-pulse 2s ease-in-out infinite' : 'none',
        }}
        aria-hidden
      >
        {isDone ? '✓' : n}
      </span>
      <div className="flex flex-col">
        <span
          className="text-sm"
          style={{
            fontWeight: titleWeight,
            color: titleColor,
            letterSpacing: '-0.005em',
          }}
        >
          {title}
          {isActive && (
            <span
              className="ml-2 text-[10px] font-mono uppercase"
              style={{
                color: 'var(--ffv-blue)',
                letterSpacing: '0.1em',
              }}
            >
              · em andamento
            </span>
          )}
        </span>
        <span className="text-xs" style={{ color: 'var(--ffv-muted)', lineHeight: 1.4 }}>
          {desc}
        </span>
      </div>
    </li>
  );
}

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
