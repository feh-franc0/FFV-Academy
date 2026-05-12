'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import {
  CERTIFICATIONS,
  getCertReadiness,
  buildStudyPlan,
  type Certification,
  type CertReadiness,
} from '@/lib/cert-prep';
import { CURRICULUM } from '@/lib/curriculum';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function readinessColor(pct: number): string {
  if (pct >= 70) return 'var(--ffv-green)';
  if (pct >= 40) return 'var(--ffv-yellow)';
  return 'var(--ffv-red)';
}

function readinessLabel(pct: number): string {
  if (pct >= 70) return 'Pronto para agendar';
  if (pct >= 40) return 'Em progresso';
  return 'Iniciante';
}

function domainBarColor(pct: number): string {
  if (pct >= 70) return 'var(--ffv-green)';
  if (pct >= 50) return 'var(--ffv-yellow)';
  return 'var(--ffv-red)';
}

function getModuleTitle(slug: string): string {
  for (const trail of CURRICULUM) {
    for (const mod of trail.modules) {
      if (mod.slug === slug) return mod.title;
    }
  }
  return slug;
}

// ─────────────────────────────────────────────────────────────
// Readiness gauge
// ─────────────────────────────────────────────────────────────

function ReadinessGauge({ pct, weeksToReady }: { pct: number; weeksToReady: number }) {
  const color = readinessColor(pct);
  const label = readinessLabel(pct);

  // SVG arc gauge
  const radius = 54;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-20 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          {/* Track */}
          <path
            d="M 8,60 A 52,52 0 0,1 112,60"
            fill="none"
            stroke="var(--ffv-border)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d="M 8,60 A 52,52 0 0,1 112,60"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* Center text */}
        <div
          className="absolute bottom-0 left-0 right-0 text-center"
          style={{ lineHeight: 1 }}
        >
          <span className="text-3xl font-black" style={{ color }}>
            {pct}%
          </span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>
        {label}
      </span>
      <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
        Estimativa: {weeksToReady} {weeksToReady === 1 ? 'semana' : 'semanas'} para estar pronto
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Domain breakdown row
// ─────────────────────────────────────────────────────────────

function DomainRow({
  name,
  weight,
  coverage,
  avgQuizScore,
}: {
  name: string;
  weight: number;
  coverage: number;
  avgQuizScore: number;
}) {
  return (
    <div className="py-3" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
      <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
        <span className="text-sm font-medium">{name}</span>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--ffv-muted)' }}>
          <span>{weight}% da prova</span>
          {avgQuizScore > 0 && (
            <span
              className="px-1.5 py-0.5 rounded font-semibold"
              style={{
                background: avgQuizScore >= 70 ? 'color-mix(in srgb, var(--ffv-green) 15%, transparent)' : 'color-mix(in srgb, var(--ffv-yellow) 15%, transparent)',
                color: avgQuizScore >= 70 ? 'var(--ffv-green)' : 'var(--ffv-yellow)',
              }}
            >
              Quiz: {avgQuizScore}%
            </span>
          )}
        </div>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--ffv-border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${coverage}%`,
            background: domainBarColor(coverage),
          }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
        <span>Cobertura: {coverage}%</span>
        <span style={{ color: domainBarColor(coverage) }}>
          {coverage >= 70 ? 'Forte' : coverage >= 50 ? 'Parcial' : 'Lacuna'}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Module recommendation card
// ─────────────────────────────────────────────────────────────

function ModuleCard({ slug }: { slug: string }) {
  const title = getModuleTitle(slug);
  return (
    <Link
      href={`/aprenda/${slug}`}
      className="block p-3 rounded-lg transition-colors hover:opacity-90"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
      }}
    >
      <span className="text-sm font-medium line-clamp-2">{title}</span>
      <span className="text-xs mt-1 block" style={{ color: 'var(--ffv-blue)' }}>
        Estudar agora →
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// Quiz history mini chart (CSS bars)
// ─────────────────────────────────────────────────────────────

function QuizHistoryChart({
  certModuleSlugs,
  quizScores,
}: {
  certModuleSlugs: string[];
  quizScores: Record<string, { score: number; total: number; perfect: boolean }>;
}) {
  const entries = certModuleSlugs
    .filter(s => quizScores[s])
    .map(s => ({
      slug: s,
      pct: Math.round((quizScores[s].score / quizScores[s].total) * 100),
      perfect: quizScores[s].perfect,
    }));

  if (entries.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Histórico de Quizzes</h3>
      <div className="flex items-end gap-1.5 h-16">
        {entries.map(e => (
          <div key={e.slug} className="flex flex-col items-center gap-1 flex-1 min-w-0">
            <div
              className="w-full rounded-t transition-all"
              style={{
                height: `${Math.max(4, (e.pct / 100) * 48)}px`,
                background: e.perfect
                  ? 'var(--ffv-green)'
                  : e.pct >= 70
                    ? 'var(--ffv-blue)'
                    : e.pct >= 50
                      ? 'var(--ffv-yellow)'
                      : 'var(--ffv-red)',
              }}
              title={`${getModuleTitle(e.slug)}: ${e.pct}%`}
            />
            <span
              className="text-xs font-medium"
              style={{ color: e.pct >= 70 ? 'var(--ffv-green)' : 'var(--ffv-muted)' }}
            >
              {e.pct}%
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
        {entries.length} quiz{entries.length !== 1 ? 'zes' : ''} registrado{entries.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Certification card (list view)
// ─────────────────────────────────────────────────────────────

function CertCard({
  readiness,
  onSelect,
}: {
  readiness: CertReadiness;
  onSelect: () => void;
}) {
  const { cert, overallPct, weakDomains, strongDomains } = readiness;
  const color = readinessColor(overallPct);

  return (
    <div
      className="p-5 rounded-xl flex flex-col gap-4"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{cert.icon}</span>
          <div>
            <h3 className="font-bold leading-tight">{cert.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ background: 'var(--ffv-bg3)', border: '1px solid var(--ffv-border)' }}
              >
                {cert.code}
              </span>
              <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                {cert.provider}
              </span>
            </div>
          </div>
        </div>

        {/* Readiness badge */}
        <div className="shrink-0 text-right">
          <span className="text-2xl font-black" style={{ color }}>
            {overallPct}%
          </span>
          <p className="text-xs" style={{ color }}>
            {readinessLabel(overallPct)}
          </p>
        </div>
      </div>

      {/* Mini readiness bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--ffv-border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${overallPct}%`, background: color }}
        />
      </div>

      {/* Domains summary */}
      <div className="flex gap-4 text-xs">
        <div>
          <span className="font-semibold" style={{ color: 'var(--ffv-green)' }}>
            {strongDomains.length}
          </span>
          <span style={{ color: 'var(--ffv-muted)' }}> fortes</span>
        </div>
        <div>
          <span className="font-semibold" style={{ color: 'var(--ffv-red)' }}>
            {weakDomains.length}
          </span>
          <span style={{ color: 'var(--ffv-muted)' }}> lacunas</span>
        </div>
        <div style={{ color: 'var(--ffv-muted)' }}>{cert.examCost}</div>
      </div>

      {/* CTA */}
      <button
        onClick={onSelect}
        className="w-full py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
        style={{ background: cert.color, color: '#fff' }}
      >
        Começar prep
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export function CertPrepClient() {
  const { state } = useGameState();
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  const readinessList = useMemo(
    () =>
      CERTIFICATIONS.map(cert =>
        getCertReadiness(cert, state?.completedModules ?? [], state?.quizScores ?? {}),
      ),
    [state?.completedModules, state?.quizScores],
  );

  const selectedReadiness = useMemo(
    () => readinessList.find(r => r.cert.id === selectedCert?.id) ?? null,
    [readinessList, selectedCert],
  );

  // Inject real quizScores into QuizHistoryChart via detail view
  if (selectedReadiness) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <CertDetailWithScores
          readiness={selectedReadiness}
          quizScores={state?.quizScores ?? {}}
          onBack={() => setSelectedCert(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Page header */}
      <nav className="text-xs mb-8" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>
          FFV Academy
        </Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Certificações</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Prep para Certificações</h1>
        <p className="text-base" style={{ color: 'var(--ffv-muted)' }}>
          Identifique lacunas, estude os módulos certos e feche o loop com revisão espaçada.
          Seu progresso real alimenta a análise — não é chute.
        </p>
      </header>

      {/* Cert grid */}
      <div className="grid sm:grid-cols-2 gap-5">
        {readinessList.map(r => (
          <CertCard
            key={r.cert.id}
            readiness={r}
            onSelect={() => setSelectedCert(r.cert)}
          />
        ))}
      </div>

      {/* Foot note */}
      <p className="text-xs mt-8 text-center" style={{ color: 'var(--ffv-muted)' }}>
        A prontidão é calculada com base nos módulos que você completou e nas notas dos quizzes.{' '}
        <Link href="/progresso" className="underline hover:opacity-80">
          Ver progresso completo
        </Link>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CertDetail with injected quiz scores
// ─────────────────────────────────────────────────────────────

function CertDetailWithScores({
  readiness,
  quizScores,
  onBack,
}: {
  readiness: CertReadiness;
  quizScores: Record<string, { score: number; total: number; perfect: boolean }>;
  onBack: () => void;
}) {
  const { cert, overallPct, domainScores, estimatedWeeksToReady, recommendedModules } = readiness;
  const studyPlan = useMemo(() => buildStudyPlan(readiness), [readiness]);
  const allCertSlugs = useMemo(
    () => [...new Set(cert.domains.flatMap(d => d.moduleSlugs))],
    [cert],
  );
  const hasQuizHistory = allCertSlugs.some(s => quizScores[s]);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-xs mb-6" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>
          FFV Academy
        </Link>
        <span className="mx-1">/</span>
        <button
          onClick={onBack}
          className="hover:underline"
          style={{ color: 'var(--ffv-muted)' }}
        >
          Certificações
        </button>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>{cert.code}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{cert.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{cert.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ background: 'var(--ffv-bg3)', border: '1px solid var(--ffv-border)' }}
              >
                {cert.code}
              </span>
              <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                {cert.provider}
              </span>
              <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                · Exame: {cert.examCost}
              </span>
              <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                · Aprovação: {cert.passingScore}%
              </span>
            </div>
          </div>
        </div>

        <div className="md:ml-auto flex gap-3">
          {cert.simuladoId ? (
            <Link
              href={`/simulados/${cert.simuladoId}`}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
              style={{ background: 'var(--ffv-blue)', color: '#fff' }}
            >
              Fazer simulado
            </Link>
          ) : (
            <span
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: 'var(--ffv-bg3)',
                color: 'var(--ffv-muted)',
                border: '1px solid var(--ffv-border)',
              }}
            >
              Simulado em breve
            </span>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: readiness + study plan */}
        <div className="md:col-span-1 flex flex-col gap-6">
          {/* Readiness gauge */}
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <h2 className="text-sm font-semibold mb-4 text-center">Prontidão Geral</h2>
            <ReadinessGauge pct={overallPct} weeksToReady={estimatedWeeksToReady} />
          </div>

          {/* Study plan */}
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <h2 className="text-sm font-semibold mb-3">Plano de Estudos</h2>
            <ol className="space-y-2">
              {studyPlan.map((week, i) => (
                <li key={i} className="flex gap-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ background: 'var(--ffv-bg3)', color: 'var(--foreground)' }}
                  >
                    {i + 1}
                  </span>
                  <span>{week}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: domain breakdown + recommendations + history */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Domain breakdown */}
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <h2 className="text-sm font-semibold mb-1">Domínios do Exame</h2>
            <div>
              {domainScores.map(({ domain, coverage, avgQuizScore }) => (
                <DomainRow
                  key={domain.name}
                  name={domain.name}
                  weight={domain.weight}
                  coverage={coverage}
                  avgQuizScore={avgQuizScore}
                />
              ))}
            </div>
          </div>

          {/* Foco desta semana */}
          {recommendedModules.length > 0 && (
            <div
              className="p-5 rounded-xl"
              style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
            >
              <h2 className="text-sm font-semibold mb-1">Foco desta Semana</h2>
              <p className="text-xs mb-3" style={{ color: 'var(--ffv-muted)' }}>
                Módulos prioritários com base nas suas lacunas
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {recommendedModules.map(slug => (
                  <ModuleCard key={slug} slug={slug} />
                ))}
              </div>
            </div>
          )}

          {/* Quiz history */}
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            {hasQuizHistory ? (
              <QuizHistoryChart certModuleSlugs={allCertSlugs} quizScores={quizScores} />
            ) : (
              <div>
                <h3 className="text-sm font-semibold mb-2">Histórico de Quizzes</h3>
                <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                  Nenhum quiz registrado ainda. Complete módulos para ver seu desempenho aqui.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
