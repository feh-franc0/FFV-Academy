import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicStatsClient } from './PublicStatsClient';

export const metadata: Metadata = {
  title: 'Estatísticas públicas — FFV Academy',
  description:
    'Honestidade radical: SLA real, custo por base, AB30 (% de bases com >50% de conclusão em 30d) e pipeline ao vivo. O que nenhum concorrente mostra.',
};

/**
 * /stats-publicas — Open Admin radical.
 *
 * Estratégico: do EXECUTIVE_PLAN_2026-05.md, ação #1 do playbook "chegar
 * chegando". Mostrar publicamente as métricas que nenhum concorrente
 * (NotebookLM, ChatGPT, Stoodi, Brilliant) abre — SLA cumprido,
 * AB30 (% conclusão >50% em 30d), custo unitário por base, volume mês.
 *
 * V1: valores são estimativas honestas dos primeiros dias de operação,
 * marcados como "estimativa preliminar". V2: plugar em endpoint Go que
 * deriva dos events e rollup de engagement (PERSONALIZATION_PLAN Fase 4).
 */
export default function PublicStatsPage() {
  return (
    <div style={{ background: 'var(--ffv-paper)', color: 'var(--ffv-ink)', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-10" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p
          className="font-mono uppercase text-[11px] mb-3"
          style={{ color: 'var(--ffv-amber)', letterSpacing: '0.16em', fontWeight: 700 }}
        >
          Honestidade radical
        </p>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4.5vw, 3.8rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            marginBottom: 18,
          }}
        >
          O que nenhum concorrente mostra.
        </h1>

        <p
          className="max-w-2xl"
          style={{
            fontSize: 'clamp(1rem, 1.25vw, 1.15rem)',
            color: '#44403c',
            lineHeight: 1.65,
            marginBottom: 40,
          }}
        >
          NotebookLM esconde o tempo de geração. ChatGPT esconde o custo. Stoodi esconde a taxa de
          conclusão. A FFV mostra tudo aqui — porque a aposta é honestidade, não promessa.
        </p>

        <PublicStatsClient />

        {/* Bloco de transparência: como medimos */}
        <section
          className="mt-16 p-6 rounded-2xl"
          style={{
            background: '#ffffff',
            border: '1px solid var(--ffv-border)',
            boxShadow: '0 8px 24px -12px rgba(28,25,23,0.08)',
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
              marginBottom: 16,
              letterSpacing: '-0.015em',
            }}
          >
            Como a gente mede isso?
          </h2>

          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5 text-sm" style={{ color: '#44403c', lineHeight: 1.6 }}>
            <div>
              <dt style={{ fontWeight: 700, color: 'var(--ffv-ink)', marginBottom: 4 }}>
                SLA cumprido
              </dt>
              <dd>
                % das últimas 30 bases entregues em até 24h depois do submit. Se a média subir, a gente para de aceitar pedidos novos até estabilizar.
              </dd>
            </div>

            <div>
              <dt style={{ fontWeight: 700, color: 'var(--ffv-ink)', marginBottom: 4 }}>
                AB30 — Aprendizado real em 30 dias
              </dt>
              <dd>
                % de bases entregues que tiveram &gt;50% da trilha concluída pelo aluno em 30 dias. É a métrica que mostra que a base é útil, não só bonita. Meta: 35%.
              </dd>
            </div>

            <div>
              <dt style={{ fontWeight: 700, color: 'var(--ffv-ink)', marginBottom: 4 }}>
                Custo por base
              </dt>
              <dd>
                API Claude + storage + tempo de curadoria humana, dividido pelas bases entregues. Reportado em R$. Quando crescer, mostramos.
              </dd>
            </div>

            <div>
              <dt style={{ fontWeight: 700, color: 'var(--ffv-ink)', marginBottom: 4 }}>
                NPS
              </dt>
              <dd>
                Pergunta única no e-mail de 30 dias pós-entrega: &ldquo;Você indicaria a FFV?&rdquo;. Sem coleta enviesada. Sem polir.
              </dd>
            </div>
          </dl>

          <p
            className="text-xs mt-6"
            style={{
              color: 'var(--ffv-muted)',
              borderLeft: '2px solid var(--ffv-amber)',
              paddingLeft: 12,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: 'var(--ffv-ink)' }}>Compromisso público:</strong> esta página é
            atualizada toda segunda-feira. Se a métrica cair, ela cai aqui também. Sem maquiagem.
          </p>
        </section>

        {/* CTA pra voltar pra landing */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              background: 'var(--ffv-ink)',
              color: '#fff',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            ← Voltar pra solicitar minha base
          </Link>
        </div>
      </div>
    </div>
  );
}
