'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { Share2 } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { Breadcrumb } from '@/components/Breadcrumb';
import { exportState, importState } from '@/lib/engine';
import { ShareCard } from '@/components/ShareCard';
import { getTrilhasConcluidasLeve } from '@/lib/curriculum/queries-leves';
import { MyRankCard } from '@/components/MyRankCard';
import { QuestsCard } from '@/components/QuestsCard';
import {
  BADGES_DEF,
  CURRICULUM,
  HUBS,
  LEVELS,
  getHubStats,
  getHubTrails,
  getLevelInfo,
  getTrailHref,
  getTrailProgress,
  type Hub,
  type Trail,
} from '@/lib/curriculum';
import { StudyHeatmap } from '@/components/StudyHeatmap';
import { TrailStatsTable } from '@/components/TrailStatsTable';
import { toast } from '@/lib/toast';

// `next/dynamic`: o gerador de certificado (canvas + currículo completo, para
// o texto de compartilhar) só é necessário quando o usuário abre um
// certificado — não em toda visita a /progresso.
const Certificate = dynamic(() => import('@/components/Certificate').then(m => ({ default: m.Certificate })), { ssr: false });

export function ProgressoClient() {
  const { state, levelInfo, dueCards, refresh, weeklyStats, recommendations } = useGameState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showShare, setShowShare] = useState(false);
  const [certificateTrailId, setCertificateTrailId] = useState<string | null>(null);

  function handleExport() {
    const json = exportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ffv-academy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      const json = ev.target?.result as string;
      const result = await importState(json);
      if (result.ok) {
        refresh();
        toast.success('Dados importados com sucesso!');
      } else {
        toast.error(`Arquivo inválido: ${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  if (!state) {
    return (
      <section className="max-w-5xl mx-auto px-6 py-16">
        {/* O título fica FORA da condição de carregamento: a varredura de rotas
            de ago/2026 mostrou esta página respondendo 200 sem nenhum <h1> no
            HTML servido. Rastreador e leitor de tela recebem a página sem
            cabeçalho — o título só aparecia depois da hidratação. O nome da
            página é verdade independentemente de o estado ter carregado. */}
        <h1 className="text-2xl font-bold mb-6">Seu progresso</h1>
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          <div className="text-4xl mb-3">📊</div>
          <p style={{ color: 'var(--ffv-muted)' }}>Carregando seu progresso…</p>
        </div>
      </section>
    );
  }

  const completed = state.completedModules;

  // Primeira visita: `state` já carregou (não é mais o branch acima), mas o
  // usuário não tem nenhum módulo concluído. Sem isto, o novato caía direto
  // no dashboard completo — heatmap vazio, hub stats zeradas, tabela de
  // trilha sem linha — sem nenhuma ação sugerida.
  if (completed.length === 0) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 8 }}>
          Seu progresso está esperando por você
        </h1>
        <p style={{ color: 'var(--ffv-muted)', maxWidth: 420, margin: '0 auto 24px' }}>
          Complete seu primeiro módulo para começar a ganhar XP, subir de nível e ver seu
          progresso por trilha aqui.
        </p>
        <Link
          href="/explorar"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)', textDecoration: 'none' }}
        >
          Escolher minha primeira trilha →
        </Link>
      </section>
    );
  }

  const totalModules = CURRICULUM.reduce((acc, t) => acc + t.modules.length, 0);
  const overallPct = totalModules === 0 ? 0 : Math.round((completed.length / totalModules) * 100);
  const totalXpPossible = CURRICULUM.reduce(
    (acc, t) => acc + t.modules.reduce((a, m) => a + m.xp, 0),
    0
  );

  const nextLevel = LEVELS.find(l => l.level === state.level + 1);
  const xpInLevel = state.xp - (levelInfo?.xpMin ?? 0);
  const xpNeeded = (nextLevel?.xpMin ?? levelInfo?.xpMax ?? 9999) - (levelInfo?.xpMin ?? 0);
  const levelPct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <Hero state={state} levelInfo={levelInfo ?? getLevelInfo(state.xp)} levelPct={levelPct} xpInLevel={xpInLevel} xpNeeded={xpNeeded} />

      {showShare && <ShareCard onClose={() => setShowShare(false)} />}

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-0">
          <SectionLabel>VISÃO GERAL</SectionLabel>
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{
              background: 'color-mix(in srgb, var(--ffv-blue) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)',
              color: 'var(--ffv-blue)',
            }}
          >
            <Share2 size={14} />
            Compartilhar
          </button>
        </div>
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <Stat label="Artigos lidos" value={`${completed.length}`} sub={`de ${totalModules} · ${overallPct}%`} accent="var(--ffv-blue)" />
          <Stat label="XP total" value={state.xp.toLocaleString('pt-BR')} sub={`de ${totalXpPossible.toLocaleString('pt-BR')} disponíveis`} accent="var(--ffv-yellow)" />
          <Stat label="Streak atual" value={`${state.streak}d`} sub={state.freezes > 0 ? `🧊 ${state.freezes} freeze${state.freezes !== 1 ? 's' : ''}` : 'Volte amanhã'} accent="var(--ffv-orange)" />
          <Stat label="Badges" value={`${state.badges.length}`} sub={`de ${BADGES_DEF.length} conquistas`} accent="var(--ffv-purple)" />
          <Stat label="Cards devidos" value={`${dueCards.length}`} sub={dueCards.length > 0 ? 'revisar agora' : 'em dia'} accent="var(--ffv-green)" link={dueCards.length > 0 ? '/revisar' : undefined} />
        </div>
      </section>

      {/* Esta semana */}
      {weeklyStats.activeDays > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-8">
          <SectionLabel>ESTA SEMANA</SectionLabel>
          <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <WeeklyStat icon="📅" value={`${weeklyStats.activeDays}d`} label="dias ativos" color="var(--ffv-blue)" />
            <WeeklyStat icon="⚡" value={weeklyStats.xp.toLocaleString('pt-BR')} label="XP ganhos" color="var(--ffv-yellow)" />
            <WeeklyStat icon="⏱" value={weeklyStats.minutes >= 60 ? `${Math.floor(weeklyStats.minutes / 60)}h ${weeklyStats.minutes % 60}min` : `${weeklyStats.minutes}min`} label="de estudo" color="var(--ffv-green)" />
            <WeeklyStat icon="🧠" value={`${weeklyStats.cards}`} label="cards revisados" color="var(--ffv-purple)" />
          </div>
        </section>
      )}

      {/* Continue de onde parou */}
      {state.lastArticle && !completed.includes(state.lastArticle.slug) && (
        <section className="max-w-5xl mx-auto px-6 pb-8">
          <SectionLabel>CONTINUE DE ONDE PAROU</SectionLabel>
          <Link
            href={state.lastArticle.href}
            className="flex items-center gap-4 mt-4 p-4 rounded-xl transition-all hover:opacity-90"
            style={{
              background: `color-mix(in srgb, ${state.lastArticle.trailColor} 8%, var(--ffv-bg2))`,
              border: `1px solid ${state.lastArticle.trailColor}40`,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{ width: 48, height: 48, borderRadius: 12, background: `${state.lastArticle.trailColor}20`, fontSize: 24 }}
            >
              ▶
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{state.lastArticle.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--ffv-muted)' }}>
                {state.lastArticle.trailName} · {state.lastArticle.readTime} min ·{' '}
                <span style={{ color: state.lastArticle.trailColor }}>+{state.lastArticle.xp} XP</span>
                {state.lastArticle.progress > 0.05 && (
                  <> · {Math.round(state.lastArticle.progress * 100)}% lido</>
                )}
              </p>
            </div>
            <span className="flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: state.lastArticle.trailColor, color: '#0d1117' }}>
              Continuar →
            </span>
          </Link>
        </section>
      )}

      {/* Próximos para você */}
      {recommendations.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-8">
          <SectionLabel>PRÓXIMOS PARA VOCÊ</SectionLabel>
          <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {recommendations.map(r => (
              <Link
                key={r.slug}
                href={r.href}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  className="p-4 rounded-xl h-full flex flex-col gap-2 transition-all hover:opacity-90"
                  style={{
                    background: `color-mix(in srgb, ${r.trailColor} 6%, var(--ffv-bg2))`,
                    border: `1px solid ${r.trailColor}30`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 18 }}>{r.trailIcon}</span>
                    <span style={{ fontSize: 10, color: r.trailColor, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.trailName}</span>
                  </div>
                  <p className="font-semibold text-sm flex-1">{r.title}</p>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--ffv-muted)' }}>
                    <span>⏱ {r.readTime} min</span>
                    <span>·</span>
                    <span style={{ color: r.trailColor }}>+{r.xp} XP</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <StudyHeatmap studyDays={state.studyDays} />
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <TrailStatsTable />
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <SectionLabel>QUESTS</SectionLabel>
        <div className="mt-4 grid md:grid-cols-2 gap-4 items-start">
          <QuestsCard />
          <div
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 18 }}>⚡</span>
              <span className="font-bold text-sm">Ações rápidas</span>
            </div>
            <Link
              href="/revisar/maratona"
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-2">
                <span>🏃</span>
                <div>
                  <div className="font-semibold">Maratona de Revisão</div>
                  <div className="text-xs" style={{ color: 'var(--ffv-muted)' }}>Sessão SRS configurável</div>
                </div>
              </div>
              <span style={{ color: 'var(--ffv-blue)' }}>→</span>
            </Link>
            <Link
              href="/devcard"
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)', textDecoration: 'none' }}
            >
              <div className="flex items-center gap-2">
                <span>🃏</span>
                <div>
                  <div className="font-semibold">Meu Dev Card</div>
                  <div className="text-xs" style={{ color: 'var(--ffv-muted)' }}>Compartilhe no LinkedIn</div>
                </div>
              </div>
              <span style={{ color: 'var(--ffv-purple)' }}>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <MyRankCard />
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <SectionLabel>PERFORMANCE POR TRILHA</SectionLabel>
        <TrailPerformanceGrid completedSlugs={completed} quizScores={state.quizScores} />
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <SectionLabel>PROGRESSO POR HUB</SectionLabel>
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {HUBS.map(h => (
            <HubProgressCard key={h.id} hub={h} completedSlugs={completed} />
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <SectionLabel>TRILHAS</SectionLabel>
        <div className="flex flex-col gap-3 mt-4">
          {CURRICULUM.map(t => (
            <TrailProgressRow key={t.id} trail={t} completedSlugs={completed} />
          ))}
        </div>
      </section>

      {/* Certificate modal */}
      {certificateTrailId && (
        <Certificate
          trailId={certificateTrailId}
          onClose={() => setCertificateTrailId(null)}
        />
      )}

      {/* Certificados de trilhas concluídas */}
      {(() => {
        const completedTrails = getTrilhasConcluidasLeve(completed);
        if (completedTrails.length === 0) return null;
        return (
          <section className="max-w-5xl mx-auto px-6 pb-20">
            <SectionLabel>CERTIFICADOS DE CONCLUSÃO</SectionLabel>
            <p className="text-xs mt-2 mb-4" style={{ color: 'var(--ffv-muted)' }}>
              Você concluiu {completedTrails.length} trilha{completedTrails.length === 1 ? '' : 's'}. Gere o certificado em PNG e compartilhe no LinkedIn.
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {completedTrails.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCertificateTrailId(t.id)}
                  className="text-left p-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{
                    background: `color-mix(in srgb, ${t.color} 8%, var(--ffv-bg2))`,
                    border: `1px solid ${t.color}40`,
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: 22 }}>{t.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ffv-acento-texto" style={{ background: `${t.color}20`, '--ffv-acento': t.color, border: `1px solid ${t.color}40` } as React.CSSProperties}>
                      🎓 Certificado
                    </span>
                  </div>
                  <p className="text-sm font-bold mb-1 ffv-acento-texto" style={{ '--ffv-acento': t.color } as React.CSSProperties}>{t.name}</p>
                  <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                    {t.modules.length} módulos · {t.modules.reduce((acc, m) => acc + m.xp, 0)} XP
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: t.color, color: '#0d1117' }}>
                    Gerar PNG →
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Módulos salvos */}
      {state.bookmarks.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-12">
          <SectionLabel>MÓDULOS SALVOS — {state.bookmarks.length}</SectionLabel>
          <div className="flex flex-col gap-2 mt-4">
            {state.bookmarks.map(slug => {
              const found = CURRICULUM.flatMap(t => t.modules.map(m => ({ ...m, trail: t }))).find(m => m.slug === slug);
              if (!found) return null;
              const isDone = completed.includes(slug);
              return (
                <Link
                  key={slug}
                  href={`/aprenda/${slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-90"
                    style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
                  >
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{found.trail.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{found.title}</p>
                      <p className="text-xs mt-0.5 ffv-acento-texto" style={{ color: 'var(--ffv-muted)' }}>
                        {found.trail.name} · {found.readTime} min · <span style={{ '--ffv-acento': found.trail.color } as React.CSSProperties}>+{found.xp} XP</span>
                      </p>
                    </div>
                    {isDone && (
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(63,185,80,0.12)', color: 'var(--ffv-green)', border: '1px solid rgba(63,185,80,0.3)' }}>✓</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <SectionLabel>BADGES</SectionLabel>
        <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {BADGES_DEF.map(b => {
            const owned = state.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className="p-4 rounded-xl"
                style={{
                  background: owned ? 'color-mix(in srgb, var(--ffv-yellow) 10%, transparent)' : 'var(--ffv-bg2)',
                  border: owned
                    ? '1px solid color-mix(in srgb, var(--ffv-yellow) 35%, transparent)'
                    : '1px solid var(--ffv-border)',
                  opacity: owned ? 1 : 0.55,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 20 }}>{b.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>{b.name}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--ffv-muted)', lineHeight: 1.5 }}>{b.desc}</p>
                {owned && (
                  <span
                    className="font-mono uppercase"
                    style={{
                      fontSize: 9,
                      color: 'var(--ffv-yellow)',
                      letterSpacing: '0.1em',
                      marginTop: 6,
                      display: 'inline-block',
                    }}
                  >
                    desbloqueada · +{b.xpBonus} XP
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <SectionLabel>DADOS</SectionLabel>
        <div
          className="mt-4 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-6"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          <div className="flex-1 min-w-0">
            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Backup do seu progresso</p>
            <p style={{ fontSize: 12, color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
              Seu progresso fica salvo no navegador. Exporte para não perder nada ao limpar o cache
              ou trocar de dispositivo.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-80"
              style={{
                background: 'color-mix(in srgb, var(--ffv-blue) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--ffv-blue) 40%, transparent)',
                color: 'var(--ffv-blue)',
              }}
            >
              Exportar backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-80"
              style={{
                background: 'color-mix(in srgb, var(--ffv-muted) 10%, transparent)',
                border: '1px solid var(--ffv-border)',
                color: 'var(--ffv-muted)',
              }}
            >
              Importar backup
            </button>
            {/*
              O campo é acionado pelo botão acima e nunca recebe foco — mas
              precisa de nome acessível assim mesmo. Ele depende de `display:
              none` vindo de uma classe utilitária para sair da árvore de
              acessibilidade; se a folha de estilo falhar ou for adiada, o
              campo reaparece SEM rótulo nenhum. O atributo custa uma linha e
              não depende de CSS carregar.
            */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              aria-label="Selecionar arquivo de backup para importar"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────── HERO ───────── */
function Hero({
  state,
  levelInfo,
  levelPct,
  xpInLevel,
  xpNeeded,
}: {
  state: ReturnType<typeof useGameState>['state'];
  levelInfo: NonNullable<ReturnType<typeof useGameState>['levelInfo']>;
  levelPct: number;
  xpInLevel: number;
  xpNeeded: number;
}) {
  if (!state) return null;
  return (
    <section className="relative px-6 pt-14 pb-12" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, ${levelInfo.color} 20%, transparent) 0%, transparent 65%)`,
        }}
      />
      <div className="relative max-w-5xl mx-auto">
        <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Seu progresso' }]} className="mb-4" />
        <div className="flex items-center gap-2 mb-5">
          <SectionLabel color={levelInfo.color}>SEU DASHBOARD</SectionLabel>
        </div>
        <div className="flex items-center gap-5">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: `color-mix(in srgb, ${levelInfo.color} 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${levelInfo.color} 40%, transparent)`,
              fontSize: 36,
            }}
          >
            {levelInfo.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              Nível {state.level} · <span className="ffv-acento-texto" style={{ '--ffv-acento': levelInfo.color } as React.CSSProperties}>{levelInfo.name}</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ffv-muted)', marginTop: 6 }}>
              {state.xp.toLocaleString('pt-BR')} XP · {xpInLevel}/{xpNeeded} para o próximo nível
            </p>
            <div className="mt-4" style={{ maxWidth: 520 }}>
              <div style={{ height: 6, background: 'var(--ffv-bg3)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${levelPct}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${levelInfo.color}, color-mix(in srgb, ${levelInfo.color} 60%, white))`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Hub card ───────── */
function HubProgressCard({ hub, completedSlugs }: { hub: Hub; completedSlugs: string[] }) {
  const stats = getHubStats(hub, completedSlugs);
  const trails = getHubTrails(hub);
  return (
    <Link
      href={hub.href}
      className="block"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        className="rounded-2xl p-5 h-full flex flex-col"
        style={{
          background: 'var(--ffv-bg2)',
          border: `1px solid color-mix(in srgb, ${hub.color} 22%, transparent)`,
          transition: 'border-color 0.2s ease',
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${hub.color} 55%, transparent)`; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${hub.color} 22%, transparent)`; }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: 20 }}>{hub.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)' }}>{hub.name}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 12, color: 'var(--ffv-muted)' }}>{stats.done}/{stats.moduleCount} artigos</span>
          <span className="font-mono ffv-acento-texto" style={{ fontSize: 11, '--ffv-acento': hub.color, fontWeight: 700 } as React.CSSProperties}>{stats.pct}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--ffv-bg3)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              width: `${stats.pct}%`,
              height: '100%',
              background: hub.color,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {trails.map(t => {
            const tp = getTrailProgress(t.modules, completedSlugs);
            return (
              <span
                key={t.id}
                className="ffv-acento-texto" style={{
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 999,
                  border: `1px solid color-mix(in srgb, ${t.color} 30%, transparent)`,
                  '--ffv-acento': t.color,
                  fontWeight: 600,
                } as React.CSSProperties}
              >
                {t.icon} {tp.done}/{tp.total}
              </span>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

/* ───────── Trail row ───────── */
function TrailProgressRow({ trail, completedSlugs }: { trail: Trail; completedSlugs: string[] }) {
  const tp = getTrailProgress(trail.modules, completedSlugs);
  const href = getTrailHref(trail.id);
  return (
    <Link href={href} className="block" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        className="rounded-xl p-4 flex items-center gap-4"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          transition: 'border-color 0.2s ease',
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = `color-mix(in srgb, ${trail.color} 55%, transparent)`; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--ffv-border)'; }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `color-mix(in srgb, ${trail.color} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${trail.color} 30%, transparent)`,
            fontSize: 18,
          }}
        >
          {trail.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--foreground)' }}>{trail.name}</span>
            <span className="font-mono ffv-acento-texto" style={{ fontSize: 11, '--ffv-acento': trail.color, fontWeight: 700 } as React.CSSProperties}>
              {tp.done}/{tp.total} · {tp.pct}%
            </span>
          </div>
          <div style={{ height: 3, background: 'var(--ffv-bg3)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${tp.pct}%`,
                height: '100%',
                background: trail.color,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ───────── WeeklyStat ───────── */
function WeeklyStat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <div
      className="rounded-xl p-3 flex items-center gap-3"
      style={{
        background: `color-mix(in srgb, ${color} 8%, var(--ffv-bg2))`,
        border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--ffv-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

/* ───────── Primitives ───────── */
function SectionLabel({ children, color = 'var(--ffv-muted)' }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="font-mono uppercase"
      style={{
        fontSize: 10,
        letterSpacing: '0.14em',
        color,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  link,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  link?: string;
}) {
  const inner = (
    <div
      className="rounded-xl p-4 h-full"
      style={{
        background: 'var(--ffv-bg2)',
        border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)`,
        transition: 'border-color 0.2s ease',
      }}
    >
      <div
        className="font-mono uppercase"
        style={{ fontSize: 10, color: accent, letterSpacing: '0.12em', fontWeight: 700 }}
      >
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 4, color: 'var(--foreground)' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
  if (link) {
    return (
      <Link href={link} style={{ textDecoration: 'none', color: 'inherit' }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

/* ───────── Trail Performance Grid ───────── */
function TrailPerformanceGrid({
  completedSlugs,
  quizScores,
}: {
  completedSlugs: string[];
  quizScores: Record<string, { score: number; total: number; perfect: boolean }>;
}) {
  const trails = CURRICULUM.filter(t => {
    const done = t.modules.filter(m => completedSlugs.includes(m.slug)).length;
    return done > 0;
  });

  if (trails.length === 0) {
    return (
      <p className="text-sm mt-4" style={{ color: 'var(--ffv-muted)' }}>
        Complete módulos para ver sua performance por trilha.
      </p>
    );
  }

  return (
    <div
      className="mt-4 rounded-2xl overflow-hidden"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      {trails.map((trail, i) => {
        const tp = getTrailProgress(trail.modules, completedSlugs);
        const trailSlugs = trail.modules.map(m => m.slug);
        const scores = trailSlugs
          .filter(s => quizScores[s])
          .map(s => quizScores[s]);
        const totalAnswered = scores.reduce((a, s) => a + s.total, 0);
        const totalCorrect = scores.reduce((a, s) => a + s.score, 0);
        const accuracy = totalAnswered === 0 ? null : Math.round((totalCorrect / totalAnswered) * 100);
        const perfects = scores.filter(s => s.perfect).length;
        const xpEarned = trail.modules
          .filter(m => completedSlugs.includes(m.slug))
          .reduce((a, m) => a + m.xp, 0);

        return (
          <div
            key={trail.id}
            className="px-5 py-4 flex items-center gap-4"
            style={{ borderTop: i === 0 ? undefined : '1px solid var(--ffv-border)' }}
          >
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `color-mix(in srgb, ${trail.color} 14%, transparent)`,
                border: `1px solid color-mix(in srgb, ${trail.color} 30%, transparent)`,
                fontSize: 18,
              }}
            >
              {trail.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-sm truncate">{trail.name}</span>
                <span className="font-mono text-xs flex-shrink-0 ffv-acento-texto" style={{ '--ffv-acento': trail.color } as React.CSSProperties}>{tp.done}/{tp.total}</span>
              </div>
              <div style={{ height: 3, background: 'var(--ffv-bg3)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ width: `${tp.pct}%`, height: '100%', background: trail.color, transition: 'width 0.3s ease' }} />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {accuracy !== null && (
                  <span className="text-xs" style={{ color: accuracy >= 80 ? 'var(--ffv-green)' : accuracy >= 50 ? 'var(--ffv-gold)' : '#f78166' }}>
                    {accuracy}% precisão
                  </span>
                )}
                {perfects > 0 && (
                  <span className="text-xs" style={{ color: 'var(--ffv-gold)' }}>
                    ⭐ {perfects} perfeito{perfects !== 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-xs font-mono ffv-acento-texto" style={{ '--ffv-acento': trail.color } as React.CSSProperties}>
                  +{xpEarned.toLocaleString('pt-BR')} XP
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
