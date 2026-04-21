import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sd-chat-system');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Case: chat / messaging (WhatsApp-like)"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'WebSocket connections, long polling fallback. Delivery semantics (at-least-once + idempotency). Read receipts. Group chat fan-out. Encryption at-rest + E2E.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'WebSocket connections, long polling fallback. Delivery semantics (at-least-once + idempotency). Read receipts. Group chat fan-out. Encryption at-rest + E2E. Este é o núcleo pedagógico do módulo.',
  },
  {
    question: 'Qual é o anti-pattern mais comum relacionado a este tema?',
    options: [
      'Seguir especificação à risca sem desvios',
      'Copiar receita sem entender contexto, otimizar cedo sem medir, ou ignorar trade-offs reais — os três canônicos em engenharia sênior',
      'Documentar demais',
      'Estudar fundamentos antes de implementar',
    ],
    correct: 1,
    explanation: 'Engenharia sênior é sobre decisão consciente baseada em restrições reais, não receita mágica. O módulo destaca os cuidados específicos do tema. Medir antes de otimizar, conhecer o contexto antes de copiar padrão.',
  },
  {
    question: 'Quando aplicar o conteúdo deste módulo em produção?',
    options: [
      'Nunca — é só acadêmico',
      'Aplicar quando o problema casar com as palavras-chave do módulo (chat system design, websocket chat, delivery semantics, e2e encryption); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (chat system design, websocket chat, delivery semantics, e2e encryption) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sd-chat-system"
      title="Case: chat / messaging (WhatsApp-like)"
      icon="💬"
      xp={60}
      readTime={14}
      trailName="System Design Interview Prep"
      trailColor={accent}
      nextSlug="sd-notification-system"
      nextTitle="Case: sistema de notificações em escala"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>WebSocket connections, long polling fallback.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Delivery semantics (at-least-once + idempotency).</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> chat system design, websocket chat, delivery semantics, e2e encryption.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Read receipts. Group chat fan-out. Encryption at-rest + E2E.</p>
        <Callout tone="success" icon="✅">
          Chat system design WhatsApp WebSocket E2E — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
