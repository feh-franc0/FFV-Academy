'use client';

import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { AuthContext } from '@/hooks/useAuth';
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

/**
 * 3-step wizard: identidade → conteúdo → revisão+submit.
 *
 * Step 1: nome + email + whatsapp (pulado quando user já logado)
 * Step 2: área + faculdade + tema + objetivo + descrição + anexos
 * Step 3: resumo do pedido + termos + submit
 *
 * Quando o user está logado, step 1 é pulado: name/email/phone vêm do
 * UserProfile, mostra um banner "Olá, Maria · maria@gmail.com" e o user
 * só preenche o conteúdo + confirma. Reduz drasticamente a fricção pra
 * quem já é registrado.
 */
type Step = 1 | 2 | 3;

/**
 * Props opcionais. `__testInitialStep` é um escape hatch SÓ pra testes —
 * permite pular pra um passo específico sem precisar navegar pela UI.
 * O underscore-duplo deixa claro que não é API pública.
 */
interface Props {
  /** @internal — usado só por testes (jsdom) pra pular pra um passo. */
  __testInitialStep?: Step;
}

export function StudyRequestForm({ __testInitialStep }: Props = {}) {
  // Auth é opcional: form funciona em landing pública (sem AuthProvider em
  // alguns mocks de teste) e dentro do app (com AuthProvider). Quando há
  // provider, pré-popula identidade; sem provider, comporta como anônimo.
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const isLoggedIn = !!auth?.isLoggedIn;

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

  // Passo atual do wizard. Quando logado, começa direto no 2 (conteúdo) já que
  // identidade vem do perfil. Compute lazy pra usar valor inicial certo no SSR.
  // `__testInitialStep` sobrescreve pra testes (jsdom).
  const [currentStep, setCurrentStep] = useState<Step>(
    () => __testInitialStep ?? (isLoggedIn ? 2 : 1),
  );

  // Pré-preenche identidade quando user logado. useEffect porque user pode
  // hidratar async (AuthProvider faz pull do /me ao montar).
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(maskBrazilianPhone(user.phone));
      // Se estava no passo 1 e o user logou no meio, salta pro passo 2.
      // (Cenário: user abre form anônimo, clica em "logar" no header, volta.)
      if (currentStep === 1) setCurrentStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
        // Detecta a extensão real pra dar uma mensagem específica em vez de
        // genérica. Ex: "ZIP não é aceito" é melhor que "não é tipo permitido".
        const dot = f.name.lastIndexOf('.');
        const ext = dot >= 0 ? f.name.slice(dot).toLowerCase() : '';
        const extLabel = ext ? `formato ${ext.replace('.', '').toUpperCase()}` : 'arquivo sem extensão';
        setFileError(
          `"${f.name}" não é aceito (${extLabel}). ` +
          `Aceitamos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, CSV, TXT, MD, PNG, JPG, JPEG, WebP, GIF.`,
        );
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

  // ── Validação por passo ────────────────────────────────────────────────────
  // Bloqueia avanço se o passo não tem o mínimo necessário. Mensagem amigável.
  // useMemo pra não recalcular a cada render e ter ref estável pro botão disabled.
  const step1Valid = useMemo(() => {
    if (!name.trim()) return { ok: false, error: 'Preencha seu nome pra continuar' };
    const emailTrim = email.trim();
    if (!emailTrim) return { ok: false, error: 'Preencha seu e-mail pra continuar' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      return { ok: false, error: 'E-mail parece inválido — confere a digitação?' };
    }
    return { ok: true as const };
  }, [name, email]);

  const step2Valid = useMemo(() => {
    if (!studyArea) return { ok: false, error: 'Escolha uma área de estudo' };
    if (!subject.trim()) return { ok: false, error: 'Diga qual matéria ou tema' };
    if (!description.trim()) {
      return { ok: false, error: 'Conte o que você quer aprender — quanto mais detalhe, melhor a trilha' };
    }
    return { ok: true as const };
  }, [studyArea, subject, description]);

  function goToStep(target: Step) {
    // Não deixa pular passo pra frente sem validar; pra trás é livre.
    if (target > currentStep) {
      if (currentStep === 1 && !step1Valid.ok) return;
      if (currentStep === 2 && !step2Valid.ok) return;
    }
    setCurrentStep(target);
    // Scroll suave pro topo do form ao trocar de passo. Em jsdom (testes)
    // scrollIntoView não existe — try/catch silencioso evita unhandled error.
    if (typeof window !== 'undefined') {
      const top = document.getElementById('study-request-form-top');
      if (top && typeof top.scrollIntoView === 'function') {
        try {
          top.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch { /* jsdom não implementa — ignora */ }
      }
    }
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
              📬 Recebemos seu pedido!
            </h3>
            <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
              Em até 24h sua trilha vai estar pronta. Pra acompanhar o status
              em tempo real, confirme seu email aqui embaixo.
            </p>
          </div>
        </div>

        {/* CTA principal pós-submit: confirmar email pra ativar a conta + acompanhar
            status. Esse é o ponto-chave do fluxo — sem clicar aqui, o admin vê o
            lead como "🟡 aguardando confirmação" e a curadoria fica em fila menor. */}
        <div
          className="rounded-xl p-4 mb-5"
          style={{
            background: 'color-mix(in srgb, var(--ffv-blue) 8%, var(--ffv-bg))',
            border: '1px dashed color-mix(in srgb, var(--ffv-blue) 45%, var(--ffv-border))',
          }}
        >
          <div className="flex items-start gap-3">
            <span style={{ fontSize: 22 }} aria-hidden>📩</span>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: 'var(--foreground)', letterSpacing: '-0.01em' }}
              >
                Abra seu email pra confirmar e acompanhar
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--ffv-muted)', lineHeight: 1.6, marginBottom: 8 }}
              >
                Enviamos um link pra <strong style={{ color: 'var(--foreground)' }}>{state.email}</strong>{' '}
                com um código de acesso (6 dígitos). Clique no botão{' '}
                <em>&ldquo;Confirmar e acompanhar status&rdquo;</em> no email — você entra direto
                no seu painel com o status em tempo real.
              </p>
              <p
                className="text-[11px]"
                style={{ color: 'var(--ffv-muted)', fontStyle: 'italic' }}
              >
                Demora 30s a 2min pra chegar. Cheque também a pasta de spam.
              </p>
            </div>
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

  // Quantos passos efetivamente o user vê. Logado pula o 1, fica em 2 passos
  // (conteúdo → revisar). Anônimo passa pelos 3.
  const visibleSteps: Step[] = isLoggedIn ? [2, 3] : [1, 2, 3];
  const stepLabels: Record<Step, string> = {
    1: 'Identidade',
    2: 'Conteúdo',
    3: 'Confirmar',
  };

  return (
    <div
      id="study-request-form-top"
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
      <p className="text-sm mb-5" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
        Diga o que você precisa estudar. Quanto mais detalhes e materiais você enviar,
        mais aderente fica sua base — e mais rápido a curadoria entrega.
      </p>

      {/* Banner pro user logado — confirma identidade e contextualiza o "atalho"
          (pulou direto pro passo 2). Não-clicável: pra trocar de conta, faz
          logout no header. */}
      {isLoggedIn && user && currentStep !== 1 && (
        <div
          className="flex items-center gap-3 mb-5 px-3.5 py-2.5 rounded-xl"
          style={{
            background: 'color-mix(in srgb, var(--ffv-green) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--ffv-green) 28%, transparent)',
          }}
        >
          <span style={{ fontSize: 18 }} aria-hidden>👋</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
              Olá, {user.name.split(' ')[0] || 'estudante'}!
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--ffv-muted)' }}>
              Conectado como {user.email}
            </p>
          </div>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
            style={{
              background: 'color-mix(in srgb, var(--ffv-green) 18%, transparent)',
              color: 'var(--ffv-green)',
            }}
            aria-hidden
          >
            ✓ identificado
          </span>
        </div>
      )}

      {/* Indicador de progresso — chips clicáveis dos passos visíveis. Mostra
          posição atual e permite voltar livremente (avançar só se passo atual
          válido). Acessível: role=tablist com aria-selected. */}
      <StepIndicator
        steps={visibleSteps}
        labels={stepLabels}
        current={currentStep}
        onChange={goToStep}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-5" aria-busy={submitting}>
        {/* ───────────── PASSO 1 — Identidade ───────────── */}
        {currentStep === 1 && (
          <fieldset className="flex flex-col gap-4 m-0 p-0 border-0">
            <legend className="sr-only">Passo 1: identifique-se</legend>

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

            {/* Mensagem amigável de validação — só aparece quando user tenta
                avançar com algo errado. Mostra dica específica do que falta. */}
            {!step1Valid.ok && (name || email) && (
              <p
                className="text-xs"
                style={{ color: 'var(--ffv-amber)', marginTop: -4 }}
              >
                {step1Valid.error}
              </p>
            )}

            <p
              className="text-[11px] mt-2 px-3 py-2 rounded-lg"
              style={{
                color: 'var(--ffv-muted)',
                background: 'var(--ffv-bg)',
                border: '1px solid var(--ffv-border)',
                lineHeight: 1.55,
              }}
            >
              💡 <strong style={{ color: 'var(--foreground)' }}>Sem senha, sem cartão.</strong>{' '}
              Criamos uma conta passwordless pra você acompanhar o status. Enviamos
              um link mágico no seu e-mail.
            </p>

            <StepNav
              onNext={() => goToStep(2)}
              canNext={step1Valid.ok}
              currentStep={1}
              totalSteps={visibleSteps.length}
            />
          </fieldset>
        )}

        {/* ───────────── PASSO 2 — Conteúdo ───────────── */}
        {currentStep === 2 && (
          <fieldset className="flex flex-col gap-4 m-0 p-0 border-0">
            <legend className="sr-only">Passo 2: o que você quer estudar</legend>

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

            {/* Aviso amigável de validação do passo 2 */}
            {!step2Valid.ok && (studyArea || subject || description) && (
              <p
                className="text-xs"
                style={{ color: 'var(--ffv-amber)', marginTop: -4 }}
              >
                {step2Valid.error}
              </p>
            )}

            <StepNav
              onBack={isLoggedIn ? undefined : () => goToStep(1)}
              onNext={() => goToStep(3)}
              canNext={step2Valid.ok}
              currentStep={isLoggedIn ? 1 : 2}
              totalSteps={visibleSteps.length}
            />
          </fieldset>
        )}

        {/* ───────────── PASSO 3 — Confirmar e enviar ───────────── */}
        {currentStep === 3 && (
          <fieldset className="flex flex-col gap-4 m-0 p-0 border-0">
            <legend className="sr-only">Passo 3: confira e envie</legend>

            <div
              className="rounded-xl p-4"
              style={{
                background: 'var(--ffv-bg)',
                border: '1px solid var(--ffv-border)',
              }}
            >
              <p
                className="font-mono uppercase text-[10px] mb-3"
                style={{ color: 'var(--ffv-muted)', letterSpacing: '0.12em', fontWeight: 700 }}
              >
                Resumo do seu pedido
              </p>
              <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-2 text-xs">
                <ReviewRow label="Nome" value={name} />
                <ReviewRow label="E-mail" value={email} />
                {phone && <ReviewRow label="WhatsApp" value={phone} />}
                <ReviewRow
                  label="Área"
                  value={STUDY_AREAS.find(a => a.value === studyArea)?.label ?? studyArea}
                />
                {institution && <ReviewRow label="Instituição" value={institution} />}
                <ReviewRow label="Matéria/tema" value={subject} />
                {goal && <ReviewRow label="Objetivo" value={goal} />}
                <ReviewRow label="Descrição" value={truncate(description, 160)} />
                {files.length > 0 && (
                  <ReviewRow
                    label="Anexos"
                    value={`${files.length} arquivo${files.length === 1 ? '' : 's'} · ${formatFileSize(
                      files.reduce((acc, f) => acc + f.size, 0),
                    )}`}
                  />
                )}
              </dl>
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

            <div className="flex gap-2 items-stretch">
              <button
                type="button"
                onClick={() => goToStep(2)}
                disabled={submitting}
                className="px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'transparent',
                  color: 'var(--foreground)',
                  border: '1px solid var(--ffv-border)',
                  flexShrink: 0,
                }}
                aria-label="Voltar pra editar o conteúdo"
              >
                ← Voltar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden"
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
                    : '🎉 Criar minha jornada →'}
                </span>
              </button>
            </div>

            <p
              className="text-[11px] text-center"
              style={{ color: 'var(--ffv-muted)', letterSpacing: '0.03em' }}
            >
              🔒 LGPD · Seus dados ficam com a gente, sem spam.
            </p>
          </fieldset>
        )}
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

/**
 * StepIndicator — chips numerados dos passos visíveis. Mostra posição atual
 * (chip preenchido) e permite navegar pra trás clicando. Pra frente só via
 * botão Próximo (que valida).
 */
function StepIndicator({
  steps,
  labels,
  current,
  onChange,
}: {
  steps: Step[];
  labels: Record<Step, string>;
  current: Step;
  onChange: (s: Step) => void;
}) {
  return (
    <div className="flex items-center gap-2" role="tablist" aria-label="Passos do formulário">
      {steps.map((s, idx) => {
        const isCurrent = s === current;
        const isPast = s < current;
        const canClick = isPast; // só permite voltar
        return (
          <div key={s} className="flex items-center gap-2 flex-1 min-w-0">
            <button
              type="button"
              role="tab"
              aria-selected={isCurrent}
              onClick={() => canClick && onChange(s)}
              disabled={!canClick && !isCurrent}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap"
              style={{
                background: isCurrent
                  ? 'var(--ffv-blue)'
                  : isPast
                    ? 'color-mix(in srgb, var(--ffv-green) 18%, transparent)'
                    : 'var(--ffv-bg)',
                color: isCurrent ? '#fff' : isPast ? 'var(--ffv-green)' : 'var(--ffv-muted)',
                border: isCurrent
                  ? 'none'
                  : isPast
                    ? '1px solid color-mix(in srgb, var(--ffv-green) 38%, transparent)'
                    : '1px solid var(--ffv-border)',
                cursor: canClick ? 'pointer' : isCurrent ? 'default' : 'not-allowed',
                opacity: !canClick && !isCurrent ? 0.7 : 1,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: isCurrent ? 'rgba(255,255,255,0.25)' : 'transparent',
                  border: isPast ? 'none' : '1px solid currentColor',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 800,
                }}
                aria-hidden
              >
                {isPast ? '✓' : steps.indexOf(s) + 1}
              </span>
              <span className="hidden sm:inline">{labels[s]}</span>
            </button>
            {idx < steps.length - 1 && (
              <span
                aria-hidden
                style={{
                  flex: 1,
                  height: 2,
                  background: isPast ? 'var(--ffv-green)' : 'var(--ffv-border)',
                  borderRadius: 2,
                  minWidth: 8,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * StepNav — barra de navegação Voltar/Próximo no rodapé de cada passo.
 * Próximo bloqueado quando canNext=false (mostra disabled + tooltip).
 * Voltar omitido quando onBack=undefined (passo 1 do anônimo; passo 2
 * do logado, já que ele não tem passo 1 acessível).
 */
function StepNav({
  onBack,
  onNext,
  canNext,
  currentStep,
  totalSteps,
}: {
  onBack?: () => void;
  onNext: () => void;
  canNext: boolean;
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex gap-2 items-stretch mt-2">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: 'transparent',
            color: 'var(--foreground)',
            border: '1px solid var(--ffv-border)',
            flexShrink: 0,
          }}
        >
          ← Voltar
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all"
        style={{
          background: canNext ? 'var(--ffv-blue)' : 'var(--ffv-border)',
          color: canNext ? '#fff' : 'var(--ffv-muted)',
          boxShadow: canNext
            ? '0 8px 24px -6px color-mix(in srgb, var(--ffv-blue) 50%, transparent)'
            : 'none',
          cursor: canNext ? 'pointer' : 'not-allowed',
        }}
        title={canNext ? undefined : 'Preencha os campos obrigatórios pra continuar'}
      >
        Próximo · passo {currentStep + 1} de {totalSteps} →
      </button>
    </div>
  );
}

/**
 * ReviewRow — linha de resumo no passo 3. Usa <dt>/<dd> pra semântica.
 * Value pode ser longo (description) — o caller deve truncar.
 */
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-semibold" style={{ color: 'var(--ffv-muted)' }}>
        {label}:
      </dt>
      <dd style={{ color: 'var(--foreground)' }} className="break-words">
        {value || '—'}
      </dd>
    </>
  );
}

/** truncate — usado no resumo do passo 3 pra description longa. */
function truncate(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : t.slice(0, max - 1) + '…';
}
