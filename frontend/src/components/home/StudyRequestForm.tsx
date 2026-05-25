'use client';

import { useEffect, useRef, useState } from 'react';

import {
  STUDY_REQUEST_LIMITS,
  StudyRequestError,
  submitStudyRequest,
  type StudyRequestResult,
} from '@/lib/study-request-api';
import { maskBrazilianPhone, unmaskPhone, suggestEmailDomain } from '@/lib/form-helpers';
import {
  clearActiveRequest,
  deriveSlaStep,
  fetchStudyRequestStatus,
  humanizeElapsed,
  loadActiveRequest,
  saveActiveRequest,
  StatusNotFoundError,
  type SlaStep,
} from '@/lib/study-request-tracking';

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
  | {
      kind: 'submitting';
      /** % do upload (0-100). undefined até o primeiro onprogress. */
      progress?: number;
      /** Tentativa atual — usado pra mostrar "Tentativa 2 de 2" em retry. */
      attempt?: number;
    }
  | {
      kind: 'success';
      message: string;
      result: StudyRequestResult;
      email: string;
      /** ISO timestamp do submit — usado pra calcular etapa atual do SLA tracker. */
      submittedAt: string;
      /** Status canônico vindo do backend (override do cálculo por tempo). */
      serverStatus?: SlaStep;
    }
  | { kind: 'error'; message: string };

export function StudyRequestForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
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

  // Hidratar solicitação ativa (mesmo device, sessão anterior).
  // Se o usuário voltar 4h depois, vê o SLA tracker no estado correto
  // em vez do form vazio. SLA tracker re-renderiza a cada minuto pra
  // refletir tempo decorrido.
  useEffect(() => {
    const active = loadActiveRequest();
    if (active) {
      setState({
        kind: 'success',
        message: 'Solicitação em andamento — acompanhe o status abaixo.',
        result: {
          id: active.id,
          status: active.status ?? 'received',
          attachmentCount: active.attachmentCount,
          message: '',
        },
        email: active.email,
        submittedAt: active.submittedAt,
      });
    }
  }, []);

  // Tick a cada 60s pra atualizar "há X horas" e re-derivar etapa do SLA.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (state.kind !== 'success') return;
    const interval = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(interval);
  }, [state.kind]);
  void tick; // forçar re-render — deriveSlaStep usa Date.now()

  // Poll backend a cada 5min pra status canônico. Substitui derivação por
  // tempo quando o servidor responder. Se 404 (id inválido) ou rede off,
  // mantém o fallback gracioso (deriveSlaStep só com tempo).
  const activeRequestId = state.kind === 'success' ? state.result.id : null;
  useEffect(() => {
    if (!activeRequestId) return;

    let cancelled = false;

    async function pollStatus() {
      try {
        const status = await fetchStudyRequestStatus(activeRequestId!);
        if (cancelled) return;
        setState(curr => {
          if (curr.kind !== 'success') return curr;
          return { ...curr, serverStatus: status.status };
        });
      } catch (err) {
        if (err instanceof StatusNotFoundError) {
          // ID inválido — provavelmente localStorage stale. Limpa.
          clearActiveRequest();
          return;
        }
        // Rede off ou outro erro — fica em fallback de tempo. Silencioso.
      }
    }

    // Primeira chamada imediata, depois a cada 5min.
    pollStatus();
    const interval = setInterval(pollStatus, 5 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeRequestId]);

  /**
   * Identidade de arquivo robusta — usada pra detectar duplicatas reais.
   * Considera nome + tamanho + lastModified, porque o JS pode ter múltiplas
   * referências File a "mesma" coisa (drag duplo, browse duplo, etc).
   * Dois arquivos com mesmo nome MAS tamanho/data diferente NÃO são duplicatas
   * (ex: aluno renomeia duas aulas como "aula.pdf").
   */
  function fileIdentity(f: File): string {
    return `${f.name}::${f.size}::${f.lastModified}`;
  }

  function handleFiles(list: FileList | null) {
    setFileError(null);
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const next: File[] = [...files];
    const existingIds = new Set(next.map(fileIdentity));
    const duplicateNames: string[] = [];
    let currentTotal = next.reduce((acc, f) => acc + f.size, 0);

    for (const f of incoming) {
      if (next.length >= STUDY_REQUEST_LIMITS.maxAttachments) {
        setFileError(`Máximo ${STUDY_REQUEST_LIMITS.maxAttachments} arquivos.`);
        break;
      }
      // Arquivo vazio (0 bytes) — pode ser deletado do disco entre o select
      // e o ler, ou um arquivo realmente vazio. Avisa em vez de submeter
      // (backend rejeita com 400 "arquivo vazio").
      if (f.size === 0) {
        setFileError(`"${f.name}" está vazio (0 bytes). Verifique se o arquivo existe e não foi movido/deletado.`);
        continue;
      }
      if (f.size > STUDY_REQUEST_LIMITS.maxAttachmentBytes) {
        setFileError(`"${f.name}" excede ${STUDY_REQUEST_LIMITS.maxAttachmentBytes / 1024 / 1024} MB.`);
        continue;
      }
      // Soma total — evita 413/connection-reset do nginx (vira "Failed to fetch").
      if (currentTotal + f.size > STUDY_REQUEST_LIMITS.maxTotalUploadBytes) {
        setFileError(
          `Soma dos anexos ultrapassaria ${STUDY_REQUEST_LIMITS.maxTotalUploadBytes / 1024 / 1024} MB. ` +
          `Remova algum arquivo antes de adicionar "${f.name}".`,
        );
        continue;
      }
      // Validamos por extensão pra abrir mais navegadores; o backend revalida MIME.
      const lower = f.name.toLowerCase();
      const allowed = STUDY_REQUEST_LIMITS.allowedExtensions.some(ext => lower.endsWith(ext));
      if (!allowed) {
        setFileError(`"${f.name}" não é um tipo permitido (PDF, DOCX, XLSX, PPTX, CSV, TXT, MD, imagens).`);
        continue;
      }
      // Dedupação: mesmo nome + tamanho + lastModified = mesmo arquivo.
      // UX-friendly: avisa o usuário em vez de adicionar silenciosamente.
      const id = fileIdentity(f);
      if (existingIds.has(id)) {
        duplicateNames.push(f.name);
        continue;
      }
      existingIds.add(id);
      next.push(f);
      currentTotal += f.size;
    }

    setFiles(next);

    // Mensagem agregada se houve duplicatas — só mostra se nenhum outro erro.
    if (duplicateNames.length > 0) {
      const names = duplicateNames.length === 1
        ? `"${duplicateNames[0]}"`
        : `${duplicateNames.length} arquivos`;
      setFileError(`${names} já foi adicionado — ignorado pra evitar envio duplicado. Se for outro arquivo com mesmo nome, renomeie antes.`);
    }
  }

  function removeFile(idx: number) {
    setFiles(files.filter((_, i) => i !== idx));
    setFileError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Idempotência client-side: se já está submitting, ignora segundo click
    // (defesa em profundidade — disabled do botão já bloqueia, mas evita
    // re-entrancy se alguém disparar via Enter).
    if (state.kind === 'submitting') return;

    // Re-valida arquivos AGORA — usuário pode ter selecionado e depois
    // movido/deletado o arquivo do disco. Sem isso, o submit dispara um
    // request com partes vazias e o backend devolve 400.
    if (files.length > 0) {
      const emptyFile = files.find(f => f.size === 0);
      if (emptyFile) {
        setFileError(
          `"${emptyFile.name}" parece ter sumido do disco (0 bytes). Remova e adicione de novo.`,
        );
        setState({
          kind: 'error',
          message: `O arquivo "${emptyFile.name}" não pode ser lido. Remova-o e tente de novo.`,
        });
        return;
      }
      const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
      if (totalBytes > STUDY_REQUEST_LIMITS.maxTotalUploadBytes) {
        setState({
          kind: 'error',
          message: `Soma dos anexos (${Math.round(totalBytes / 1024 / 1024)} MB) ultrapassa o limite de ${STUDY_REQUEST_LIMITS.maxTotalUploadBytes / 1024 / 1024} MB. Remova arquivos antes de enviar.`,
        });
        return;
      }
    }

    setState({ kind: 'submitting', progress: 0 });
    try {
      const result = await submitStudyRequest(
        {
          name,
          email,
          // Envia número limpo (só dígitos) — backend processa, frontend formata.
          phone: phone ? unmaskPhone(phone) : undefined,
          studyArea,
          institution: institution || undefined,
          subject,
          goal: goal || undefined,
          description,
          marketingConsent,
          attachments: files,
        },
        {
          onProgress: pct => {
            setState(curr => (curr.kind === 'submitting' ? { ...curr, progress: pct } : curr));
          },
        },
      );
      const submittedAt = new Date().toISOString();
      // Persiste localmente pra usuário ver SLA tracker se voltar.
      saveActiveRequest({
        id: result.id,
        email,
        attachmentCount: result.attachmentCount,
        submittedAt,
      });
      setState({ kind: 'success', message: result.message, result, email, submittedAt });
    } catch (err) {
      const detail = err instanceof StudyRequestError
        ? err.detail
        : err instanceof Error
          ? err.message
          : 'Falha ao enviar. Tente novamente em instantes.';
      setState({ kind: 'error', message: detail });
    }
  }

  // Tela de sucesso — SLA tracker DINÂMICO baseado em tempo decorrido + ID + email.
  // Diferencial competitivo vs NotebookLM: transforma a espera de 24h em
  // prova de qualidade (curadoria humana) em vez de gargalo. Re-renderiza
  // a cada 60s pra atualizar etapa atual e timestamp humanizado.
  if (state.kind === 'success') {
    const shortId = state.result.id.slice(0, 8).toUpperCase();
    const sla = deriveSlaStep({
      id: state.result.id,
      email: state.email,
      attachmentCount: state.result.attachmentCount,
      submittedAt: state.submittedAt,
      // Status canônico do servidor (quando disponível) — override do
      // cálculo por tempo. Polling de 5min no useEffect acima atualiza.
      status: state.serverStatus,
    });
    const elapsed = humanizeElapsed(state.submittedAt);
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
              desc={`Análise inicial em fila · ${elapsed}`}
              state={sla === 'received' ? 'active' : 'done'}
            />
            <StatusStep
              n="02"
              title="Curadoria humana"
              desc="Engenheiro revisa material + monta trilha · em média 8-12h"
              state={
                sla === 'curating'
                  ? 'active'
                  : sla === 'delivered'
                    ? 'done'
                    : 'pending'
              }
            />
            <StatusStep
              n="03"
              title="Trilha pronta"
              desc={
                sla === 'delivered'
                  ? 'Confira seu e-mail e WhatsApp — link de acesso enviado'
                  : 'Você recebe e-mail e WhatsApp com link · até 24h'
              }
              state={sla === 'delivered' ? 'active' : 'pending'}
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

        {/* Enquanto espera — não deixa o usuário em dead air. Direciona pra
            base de tech como prova viva do que vai vir. */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            background: 'color-mix(in srgb, var(--ffv-green) 8%, var(--ffv-bg))',
            border: '1px solid color-mix(in srgb, var(--ffv-green) 22%, transparent)',
          }}
        >
          <p
            className="font-mono uppercase text-[10px] mb-2"
            style={{ color: 'var(--ffv-green)', letterSpacing: '0.12em', fontWeight: 700 }}
          >
            Enquanto espera
          </p>
          <p className="text-sm mb-3" style={{ lineHeight: 1.5 }}>
            <strong>Conheça nossa base de Tecnologia</strong> — mesmo padrão, mesma estrutura.
            157 módulos prontos no ar, igual ao que vai chegar pra você no mesmo dia.
          </p>
          <a
            href="/tecnologia"
            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
            style={{ color: 'var(--ffv-green)' }}
          >
            Explorar Tecnologia agora →
          </a>
        </div>

        <button
          type="button"
          onClick={() => {
            clearActiveRequest();
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
              onChange={e => {
                setEmail(e.target.value);
                // Limpa sugestão enquanto digita pra não atrapalhar.
                if (emailSuggestion) setEmailSuggestion(null);
              }}
              onBlur={() => setEmailSuggestion(suggestEmailDomain(email))}
              placeholder="voce@email.com"
              className={inputClass}
              style={inputStyle}
              disabled={submitting}
              aria-describedby={emailSuggestion ? 'email-suggestion' : undefined}
            />
            {emailSuggestion && (
              <p
                id="email-suggestion"
                className="text-[11px] mt-1.5"
                style={{ color: 'var(--ffv-blue)', lineHeight: 1.4 }}
              >
                Você quis dizer{' '}
                <button
                  type="button"
                  onClick={() => {
                    setEmail(emailSuggestion);
                    setEmailSuggestion(null);
                  }}
                  className="underline font-semibold"
                  style={{ color: 'var(--ffv-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {emailSuggestion}
                </button>?
              </p>
            )}
          </Field>
          <Field label="WhatsApp">
            <input
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => setPhone(maskBrazilianPhone(e.target.value))}
              placeholder="(11) 98765-4321"
              maxLength={15}
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
            PDF, DOCX, XLSX, PPTX, CSV, TXT, MD ou imagens (PNG/JPG/WebP) — apostilas, slides, planilhas, anotações. Até {STUDY_REQUEST_LIMITS.maxAttachments} arquivos,{' '}
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
              aria-label="Anexar materiais (PDF, DOCX, XLSX, PPTX, CSV, TXT, MD, imagens)"
              onChange={e => handleFiles(e.target.files)}
              disabled={submitting}
            />
          </div>

          {files.length > 0 && (
            <>
              <ul className="mt-3 space-y-1.5" aria-label="Arquivos anexados">
                {files.map((f, idx) => (
                  <li
                    key={`${f.name}-${idx}`}
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                    style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
                  >
                    <span className="truncate flex-1">{f.name}</span>
                    <span style={{ color: 'var(--ffv-muted)' }}>{formatFileSize(f.size)}</span>
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
              <p
                className="text-[11px] mt-2"
                style={{ color: 'var(--ffv-muted)' }}
                data-testid="upload-summary"
              >
                {files.length} arquivo{files.length === 1 ? '' : 's'} ·{' '}
                {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))} no total
              </p>
            </>
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
          <div
            className="px-3.5 py-3 rounded-lg flex gap-2.5 items-start"
            role="alert"
            data-testid="submit-error"
            style={{
              background: 'color-mix(in srgb, var(--ffv-red) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--ffv-red) 30%, transparent)',
              color: 'var(--ffv-red)',
            }}
          >
            <span aria-hidden style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>⚠️</span>
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ marginBottom: 2 }}>
                Não conseguimos enviar sua solicitação
              </p>
              <p className="text-xs" style={{ lineHeight: 1.5, color: 'var(--foreground)' }}>
                {state.message}
              </p>
              <p
                className="text-[11px] mt-1.5"
                style={{ color: 'var(--ffv-muted)', lineHeight: 1.45 }}
              >
                Seus dados continuam preenchidos — só clicar em <strong>Enviar</strong> de novo.
                Se persistir, escreva direto pra <a href="mailto:fernandofv1110@gmail.com" style={{ color: 'var(--ffv-blue)', textDecoration: 'underline' }}>fernandofv1110@gmail.com</a>.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden"
          style={{
            background: 'var(--ffv-blue)',
            color: '#fff',
            boxShadow: '0 8px 24px -6px color-mix(in srgb, var(--ffv-blue) 50%, transparent)',
            opacity: submitting ? 0.85 : 1,
            cursor: submitting ? 'progress' : 'pointer',
          }}
          data-testid="submit-button"
        >
          {/* Barra de progresso visual dentro do botão */}
          {state.kind === 'submitting' && state.progress !== undefined && (
            <span
              aria-hidden
              data-testid="upload-progress-bar"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'color-mix(in srgb, #fff 20%, transparent)',
                width: `${state.progress}%`,
                transition: 'width 200ms ease-out',
              }}
            />
          )}
          <span style={{ position: 'relative' }}>
            {state.kind === 'submitting'
              ? state.progress !== undefined && state.progress < 100
                ? `Enviando arquivos... ${state.progress}%`
                : state.progress === 100
                  ? 'Processando no servidor...'
                  : 'Enviando...'
              : 'Enviar minha solicitação →'}
          </span>
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

/**
 * formatFileSize — exibe bytes de forma legível: 800 KB · 1.2 MB · 24 MB.
 * Usamos base binária (1024) pra bater com o limite do backend (25 MiB).
 */
function formatFileSize(bytes: number): string {
  if (bytes < 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  // <10 MB mostra 1 decimal (ex 2.4 MB); >=10 MB arredonda (ex 24 MB).
  return mb < 10 ? `${mb.toFixed(1)} MB` : `${Math.round(mb)} MB`;
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
