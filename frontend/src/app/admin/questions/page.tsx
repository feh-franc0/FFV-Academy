'use client';

/**
 * /admin/questions — gerenciamento de questões do simulado CLF-C02.
 *
 * CRUD completo: listar, criar, editar, deletar questões do banco AWS CLF.
 * Filtros: domain, difficulty, busca por stem.
 * Paginação em lotes de 50.
 *
 * Auth: o layout pai (/admin/layout.tsx) já garante role='admin'.
 * Os requests usam apiFetch que injeta Bearer automaticamente.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { apiFetch } from '@/lib/api-client';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { BigNumberCard } from '@/components/admin/BigNumberCard';

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuestionOption {
  id: string; // A | B | C | D
  text: string;
}

interface Explanation {
  summary: string;
  whyCorrect: string;
  whyWrong: Record<string, string>; // keyed by option id
  keyConcept: string;
}

interface Question {
  id: string;
  simuladoId: string;
  stem: string;
  options: QuestionOption[];
  correctId: string;
  domain: string;
  difficulty: string;
  explanation: Explanation;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface QuestionsResponse {
  data: Question[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const SIMULADO_ID = 'aws-clf';

const DOMAINS = [
  'Cloud Concepts',
  'Security & Compliance',
  'Cloud Technology & Services',
  'Billing, Pricing & Support',
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const EMPTY_FORM: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> = {
  simuladoId: SIMULADO_ID,
  stem: '',
  options: [
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
  ],
  correctId: 'A',
  domain: DOMAINS[0],
  difficulty: 'easy',
  explanation: {
    summary: '',
    whyCorrect: '',
    whyWrong: { A: '', B: '', C: '', D: '' },
    keyConcept: '',
  },
  tags: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: 'var(--ffv-bg)',
    border: '1px solid var(--ffv-border)',
    color: 'var(--foreground)',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    width: '100%',
    boxSizing: 'border-box',
    ...extra,
  };
}

function labelStyle(): React.CSSProperties {
  return { fontSize: 12, fontWeight: 600, color: 'var(--ffv-muted)', marginBottom: 3, display: 'block' };
}

function difficultyColor(d: string) {
  if (d === 'easy') return '#22c55e';
  if (d === 'medium') return '#f59e0b';
  return '#ef4444';
}

// ─── QuestionCard ─────────────────────────────────────────────────────────

interface QuestionCardProps {
  q: Question;
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}

function QuestionCard({ q, onEdit, onDelete, deleting }: QuestionCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--ffv-bg)', color: 'var(--ffv-muted)' }}>
            {q.id.slice(0, 8)}…
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--ffv-bg)', color: 'var(--ffv-muted)' }}>
            {q.domain}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: difficultyColor(q.difficulty) + '22', color: difficultyColor(q.difficulty) }}
          >
            {q.difficulty}
          </span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(q)}
            className="px-3 py-1 rounded-lg text-xs font-semibold"
            style={{ background: '#f7816622', color: '#f78166' }}
          >
            Editar
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{ background: '#ef444422', color: '#ef4444' }}
            >
              Excluir
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => { onDelete(q.id); setConfirmDelete(false); }}
                disabled={deleting}
                className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                style={{ background: '#ef4444', color: 'white' }}
              >
                {deleting ? '…' : 'Confirmar'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 rounded-lg text-xs"
                style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm leading-snug line-clamp-2">{q.stem.slice(0, 160)}{q.stem.length > 160 ? '…' : ''}</p>
      {q.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {q.tags.map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--ffv-bg)', color: 'var(--ffv-muted)' }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── QuestionForm ─────────────────────────────────────────────────────────

interface FormData {
  simuladoId: string;
  stem: string;
  options: QuestionOption[];
  correctId: string;
  domain: string;
  difficulty: string;
  explanation: Explanation;
  tagsInput: string; // comma-separated
}

function formToQuestion(f: FormData): Omit<Question, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    simuladoId: f.simuladoId,
    stem: f.stem.trim(),
    options: f.options.map(o => ({ id: o.id, text: o.text.trim() })),
    correctId: f.correctId,
    domain: f.domain,
    difficulty: f.difficulty,
    explanation: {
      summary: f.explanation.summary.trim(),
      whyCorrect: f.explanation.whyCorrect.trim(),
      whyWrong: Object.fromEntries(
        Object.entries(f.explanation.whyWrong).map(([k, v]) => [k, v.trim()])
      ),
      keyConcept: f.explanation.keyConcept.trim(),
    },
    tags: f.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean),
  };
}

function questionToForm(q: Question): FormData {
  const whyWrong: Record<string, string> = { A: '', B: '', C: '', D: '' };
  if (q.explanation?.whyWrong) {
    Object.assign(whyWrong, q.explanation.whyWrong);
  }
  return {
    simuladoId: q.simuladoId ?? SIMULADO_ID,
    stem: q.stem ?? '',
    options: q.options?.length === 4
      ? q.options
      : [{ id: 'A', text: '' }, { id: 'B', text: '' }, { id: 'C', text: '' }, { id: 'D', text: '' }],
    correctId: q.correctId ?? 'A',
    domain: q.domain ?? DOMAINS[0],
    difficulty: q.difficulty ?? 'easy',
    explanation: {
      summary: q.explanation?.summary ?? '',
      whyCorrect: q.explanation?.whyCorrect ?? '',
      whyWrong,
      keyConcept: q.explanation?.keyConcept ?? '',
    },
    tagsInput: (q.tags ?? []).join(', '),
  };
}

interface QuestionFormProps {
  initial?: Question | null;
  onSave: (data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}

function QuestionForm({ initial, onSave, onCancel, saving, error }: QuestionFormProps) {
  const [form, setForm] = useState<FormData>(() =>
    initial ? questionToForm(initial) : {
      ...EMPTY_FORM,
      explanation: { ...EMPTY_FORM.explanation, whyWrong: { A: '', B: '', C: '', D: '' } },
      tagsInput: '',
    }
  );

  function setOption(idx: number, text: string) {
    setForm(f => ({
      ...f,
      options: f.options.map((o, i) => i === idx ? { ...o, text } : o),
    }));
  }

  function setWhyWrong(id: string, text: string) {
    setForm(f => ({
      ...f,
      explanation: {
        ...f.explanation,
        whyWrong: { ...f.explanation.whyWrong, [id]: text },
      },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(formToQuestion(form));
  }

  const sectionTitle = (t: string) => (
    <h3 className="text-sm font-bold mb-3 mt-5 pb-1" style={{ borderBottom: '1px solid var(--ffv-border)', color: 'var(--ffv-muted)' }}>
      {t}
    </h3>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {sectionTitle('Identificação')}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label style={labelStyle()}>Simulado</label>
          <select
            value={form.simuladoId}
            onChange={e => setForm(f => ({ ...f, simuladoId: e.target.value }))}
            style={inputStyle()}
          >
            <option value="aws-clf">aws-clf</option>
          </select>
        </div>
        <div>
          <label style={labelStyle()}>Domínio</label>
          <select
            value={form.domain}
            onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
            style={inputStyle()}
          >
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle()}>Dificuldade</label>
          <select
            value={form.difficulty}
            onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
            style={inputStyle()}
          >
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {sectionTitle('Questão')}
      <div>
        <label style={labelStyle()}>Enunciado (stem)</label>
        <textarea
          required
          rows={4}
          value={form.stem}
          onChange={e => setForm(f => ({ ...f, stem: e.target.value }))}
          style={inputStyle({ resize: 'vertical' })}
          placeholder="Texto da pergunta…"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {form.options.map((opt, idx) => (
          <div key={opt.id}>
            <label style={labelStyle()}>Opção {opt.id}</label>
            <input
              required
              type="text"
              value={opt.text}
              onChange={e => setOption(idx, e.target.value)}
              style={inputStyle()}
              placeholder={`Texto da opção ${opt.id}…`}
            />
          </div>
        ))}
      </div>

      <div>
        <label style={labelStyle()}>Resposta correta</label>
        <select
          value={form.correctId}
          onChange={e => setForm(f => ({ ...f, correctId: e.target.value }))}
          style={inputStyle({ width: 'auto' })}
        >
          {['A', 'B', 'C', 'D'].map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </div>

      {sectionTitle('Explicação')}
      <div>
        <label style={labelStyle()}>Resumo geral (summary)</label>
        <textarea
          rows={3}
          value={form.explanation.summary}
          onChange={e => setForm(f => ({ ...f, explanation: { ...f.explanation, summary: e.target.value } }))}
          style={inputStyle({ resize: 'vertical' })}
          placeholder="Explicação geral da questão…"
        />
      </div>
      <div>
        <label style={labelStyle()}>Por que a resposta correta está certa (whyCorrect)</label>
        <textarea
          rows={3}
          value={form.explanation.whyCorrect}
          onChange={e => setForm(f => ({ ...f, explanation: { ...f.explanation, whyCorrect: e.target.value } }))}
          style={inputStyle({ resize: 'vertical' })}
          placeholder="Explique por que a opção correta está certa…"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(['A', 'B', 'C', 'D'] as const).filter(id => id !== form.correctId).map(id => (
          <div key={id}>
            <label style={labelStyle()}>Por que opção {id} está errada (whyWrong.{id})</label>
            <textarea
              rows={2}
              value={form.explanation.whyWrong[id] ?? ''}
              onChange={e => setWhyWrong(id, e.target.value)}
              style={inputStyle({ resize: 'vertical' })}
              placeholder={`Motivo pelo qual a opção ${id} é distratora…`}
            />
          </div>
        ))}
      </div>

      <div>
        <label style={labelStyle()}>Conceito-chave (keyConcept)</label>
        <input
          type="text"
          value={form.explanation.keyConcept}
          onChange={e => setForm(f => ({ ...f, explanation: { ...f.explanation, keyConcept: e.target.value } }))}
          style={inputStyle()}
          placeholder="Ex: S3 Lifecycle Policies"
        />
      </div>

      {sectionTitle('Metadados')}
      <div>
        <label style={labelStyle()}>Tags (separadas por vírgula)</label>
        <input
          type="text"
          value={form.tagsInput}
          onChange={e => setForm(f => ({ ...f, tagsInput: e.target.value }))}
          style={inputStyle()}
          placeholder="s3, storage, lifecycle"
        />
      </div>

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ background: '#ef444422', color: '#ef4444' }}>
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
          style={{ background: '#f78166', color: 'white' }}
        >
          {saving ? 'Salvando…' : initial ? 'Salvar alterações' : 'Criar questão'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2 rounded-xl text-sm disabled:opacity-60"
          style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Panel = 'list' | 'create' | 'edit';

export default function AdminQuestionsPage() {
  const [data, setData] = useState<QuestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [domain, setDomain] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  // Panel state
  const [panel, setPanel] = useState<Panel>('list');
  const [editTarget, setEditTarget] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [deleting, setDeleting] = useState<string | null>(null); // id being deleted

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setFetchError(null);

    const q = new URLSearchParams({
      simulado_id: SIMULADO_ID,
      limit: String(pageSize),
      offset: String(page * pageSize),
    });
    if (domain) q.set('domain', domain);
    if (difficulty) q.set('difficulty', difficulty);
    if (search) q.set('search', search);

    try {
      const res = await apiFetch<QuestionsResponse>(
        `/api/v1/admin/questions?${q.toString()}`,
        { signal: ctrl.signal },
        true,
      );
      if (!ctrl.signal.aborted) setData(res);
    } catch (err: unknown) {
      if (ctrl.signal.aborted) return;
      const msg = err instanceof Error ? err.message : 'Erro ao carregar questões';
      setFetchError(msg);
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [domain, difficulty, search, page, pageSize]);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  async function handleSave(body: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) {
    setSaving(true);
    setSaveError(null);
    try {
      if (panel === 'edit' && editTarget) {
        await apiFetch(`/api/v1/admin/questions/${editTarget.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        }, true);
      } else {
        await apiFetch('/api/v1/admin/questions', {
          method: 'POST',
          body: JSON.stringify(body),
        }, true);
      }
      setPanel('list');
      setEditTarget(null);
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar questão';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await apiFetch(`/api/v1/admin/questions/${id}`, { method: 'DELETE' }, true);
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir questão';
      setFetchError(msg);
    } finally {
      setDeleting(null);
    }
  }

  function openEdit(q: Question) {
    setEditTarget(q);
    setSaveError(null);
    setPanel('edit');
  }

  function openCreate() {
    setEditTarget(null);
    setSaveError(null);
    setPanel('create');
  }

  function closePanel() {
    setPanel('list');
    setEditTarget(null);
    setSaveError(null);
  }

  // ─── Form panel ─────────────────────────────────────────────────────────
  if (panel === 'create' || panel === 'edit') {
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <header className="flex items-center gap-3">
          <button
            onClick={closePanel}
            className="text-sm px-3 py-1 rounded-lg"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            ← Voltar
          </button>
          <h1 className="text-xl font-bold">
            {panel === 'create' ? 'Nova questão CLF' : 'Editar questão'}
          </h1>
        </header>

        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          <QuestionForm
            initial={editTarget}
            onSave={handleSave}
            onCancel={closePanel}
            saving={saving}
            error={saveError}
          />
        </div>
      </div>
    );
  }

  // ─── List panel ──────────────────────────────────────────────────────────
  const items = data?.data ?? [];
  const byDifficulty = items.reduce<Record<string, number>>((acc, q) => {
    const d = q.difficulty ?? 'unspecified';
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Questões CLF-C02</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {data ? `Página ${page + 1} · ${items.length} de ${data.total.toLocaleString('pt-BR')} questões no total` : '…'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: '#f78166', color: 'white' }}
        >
          + Criar questão
        </button>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BigNumberCard label="Questões no total" value={data?.total ?? 0} hint="banco AWS CLF-C02" />
        <BigNumberCard label="Fácil (nesta página)" value={byDifficulty.easy ?? 0} hint="difficulty=easy" />
        <BigNumberCard label="Média (nesta página)" value={byDifficulty.medium ?? 0} hint="difficulty=medium" />
        <BigNumberCard label="Difícil (nesta página)" value={byDifficulty.hard ?? 0} hint="difficulty=hard" />
      </section>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Buscar no enunciado…"
          value={search}
          onChange={e => { setPage(0); setSearch(e.target.value); }}
          className="flex-1 min-w-[160px] max-w-sm"
          style={inputStyle()}
        />
        <select
          value={domain}
          onChange={e => { setPage(0); setDomain(e.target.value); }}
          style={inputStyle({ width: 'auto' })}
        >
          <option value="">Todos os domínios</option>
          {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={difficulty}
          onChange={e => { setPage(0); setDifficulty(e.target.value); }}
          style={inputStyle({ width: 'auto' })}
        >
          <option value="">Todas as dificuldades</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Error banner */}
      {fetchError && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ background: '#ef444422', color: '#ef4444' }}>
          {fetchError}
        </p>
      )}

      {/* List */}
      {loading && (
        <p className="text-sm text-center py-8" style={{ color: 'var(--ffv-muted)' }}>
          Carregando questões…
        </p>
      )}

      {!loading && data?.data.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'var(--ffv-muted)' }}>
          Nenhuma questão encontrada para os filtros selecionados.
        </p>
      )}

      {!loading && data && data.data.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.data.map(q => (
            <QuestionCard
              key={q.id}
              q={q}
              onEdit={openEdit}
              onDelete={handleDelete}
              deleting={deleting === q.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && (
        <AdminPagination
          total={data.total}
          page={page}
          pageSize={pageSize}
          onPage={setPage}
          onPageSize={ps => { setPage(0); setPageSize(ps); }}
        />
      )}
    </div>
  );
}
