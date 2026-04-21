/**
 * PrintLayout — elementos que aparecem APENAS quando o usuário "Salvar como PDF".
 *
 * Estrutura:
 *   1. Capa (cover) — page 1
 *   2. Resumo/metadata em destaque
 *   3. (O conteúdo do artigo renderiza entre cover e quiz)
 *   4. Gabarito de quiz — material de revisão
 *   5. Colofão — data, URL canônica, créditos
 *
 * Todo este componente é display:none em tela normal (.ffv-print-only).
 * Ativado via @media print + .ffv-printing.
 */

import type { QuizQuestion } from '@/components/ModuleLayout';

type Props = {
  title: string;
  slug: string;
  icon: string;
  trailName: string;
  trailColor: string;
  hubName?: string;
  readTime: number;
  xp: number;
  level?: string;
  quiz: QuizQuestion[];
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function PrintCover({
  title,
  icon,
  trailName,
  trailColor,
  hubName,
  readTime,
  xp,
  level,
  slug,
}: Omit<Props, 'quiz'>) {
  return (
    <div className="ffv-print-only ffv-print-cover" aria-hidden>
      {/* Barra decorativa superior (marca da trilha) */}
      <div className="ffv-print-cover-ribbon" style={{ background: trailColor }} />

      {/* Marca FFV */}
      <div className="ffv-print-cover-brand">
        <span className="ffv-print-cover-brand-logo">FFV</span>
        <span className="ffv-print-cover-brand-sub">Academy</span>
      </div>

      <div className="ffv-print-cover-tagline">Material oficial de estudo</div>

      {/* Trilha + hub */}
      <div className="ffv-print-cover-trail" style={{ color: trailColor }}>
        {hubName && <span>{hubName.toUpperCase()} · </span>}
        <span>{trailName.toUpperCase()}</span>
      </div>

      {/* Título principal */}
      <div className="ffv-print-cover-icon" aria-hidden>{icon}</div>
      <h1 className="ffv-print-cover-title">{title}</h1>

      {/* Metadados em grid */}
      <div className="ffv-print-cover-meta">
        <div className="ffv-print-cover-meta-item">
          <div className="ffv-print-cover-meta-label">Tempo de leitura</div>
          <div className="ffv-print-cover-meta-value">{readTime} min</div>
        </div>
        <div className="ffv-print-cover-meta-item">
          <div className="ffv-print-cover-meta-label">Experiência</div>
          <div className="ffv-print-cover-meta-value" style={{ color: trailColor }}>+{xp} XP</div>
        </div>
        {level && (
          <div className="ffv-print-cover-meta-item">
            <div className="ffv-print-cover-meta-label">Nível</div>
            <div className="ffv-print-cover-meta-value">{formatLevel(level)}</div>
          </div>
        )}
      </div>

      {/* Instruções de estudo */}
      <div className="ffv-print-cover-howto">
        <div className="ffv-print-cover-howto-title">Como usar este material</div>
        <ol>
          <li>Leia o conteúdo ativamente — sublinhe, anote, questione</li>
          <li>No final, responda o quiz sem consultar o texto</li>
          <li>Confira o gabarito comentado e revise os pontos que errou</li>
          <li>Volte ao FFV Academy para registrar progresso e ganhar XP</li>
        </ol>
      </div>

      {/* Rodapé da capa */}
      <div className="ffv-print-cover-footer">
        <div>fernandofrancovalle.com/aprenda/{slug}</div>
        <div>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      </div>
    </div>
  );
}

export function PrintQuizAnswerKey({ quiz, title, trailColor }: { quiz: QuizQuestion[]; title: string; trailColor: string }) {
  if (!quiz?.length) return null;
  return (
    <section className="ffv-print-only ffv-print-quiz" aria-hidden>
      <div className="ffv-print-section-header" style={{ borderColor: trailColor }}>
        <div className="ffv-print-section-kicker" style={{ color: trailColor }}>
          MATERIAL DE REVISÃO
        </div>
        <h2 className="ffv-print-section-title">Gabarito comentado — {title}</h2>
        <p className="ffv-print-section-desc">
          Responda primeiro sem consultar o texto. O gabarito traz a resposta correta com explicação densa — use como tutor offline.
        </p>
      </div>

      <ol className="ffv-print-quiz-list">
        {quiz.map((q, qi) => (
          <li key={qi} className="ffv-print-quiz-item">
            <div className="ffv-print-quiz-num" style={{ color: trailColor }}>Questão {qi + 1}</div>
            <p className="ffv-print-quiz-question">{q.question}</p>
            <ol className="ffv-print-quiz-options">
              {q.options.map((opt, oi) => (
                <li
                  key={oi}
                  className={`ffv-print-quiz-option ${oi === q.correct ? 'is-correct' : ''}`}
                  data-correct={oi === q.correct ? 'true' : undefined}
                >
                  <span className="ffv-print-quiz-letter">{OPTION_LETTERS[oi]}.</span>
                  <span className="ffv-print-quiz-text">{opt}</span>
                </li>
              ))}
            </ol>
            <div className="ffv-print-quiz-explain">
              <div className="ffv-print-quiz-explain-label">Resposta: {OPTION_LETTERS[q.correct]} · Explicação</div>
              <p>{q.explanation}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PrintColophon({ title, slug, trailName, trailColor }: { title: string; slug: string; trailName: string; trailColor: string }) {
  return (
    <section className="ffv-print-only ffv-print-colophon" aria-hidden>
      <div className="ffv-print-colophon-rule" style={{ background: trailColor }} />
      <div className="ffv-print-colophon-row">
        <div>
          <div className="ffv-print-colophon-brand">FFV Academy</div>
          <div className="ffv-print-colophon-sub">Escola de engenharia para a era da IA</div>
        </div>
        <div className="ffv-print-colophon-meta">
          <div>{title}</div>
          <div>{trailName}</div>
          <div>fernandofrancovalle.com/aprenda/{slug}</div>
          <div>Gerado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>
      <p className="ffv-print-colophon-license">
        Conteúdo editorial gratuito. Permitido estudo pessoal e uso em times. Não republicar em outros canais sem autorização escrita.
      </p>
    </section>
  );
}

function formatLevel(l: string): string {
  const map: Record<string, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  };
  return map[l] ?? l;
}
