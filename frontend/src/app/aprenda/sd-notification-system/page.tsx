import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sd-notification-system');
const accent = '#ea580c';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o ponto central de "Case: sistema de notificações em escala"?',
    options: [
      'Apenas detalhe de implementação — pouco relevante',
      'Push (APNs/FCM), email (SES/Sendgrid), SMS. Templates, user preferences, quiet hours. Priority queues, rate limiting por user. Delivery tracking.',
      'Moda passageira sem aplicação em produção',
      'Receita universal que resolve todo problema',
    ],
    correct: 1,
    explanation: 'Push (APNs/FCM), email (SES/Sendgrid), SMS. Templates, user preferences, quiet hours. Priority queues, rate limiting por user. Delivery tracking. Este é o núcleo pedagógico do módulo.',
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
      'Aplicar quando o problema casar com as palavras-chave do módulo (notification system, push notification design, delivery tracking); fora desse contexto, soluções mais simples servem melhor',
      'Sempre, independente do contexto',
      'Apenas em projetos greenfield sem legado',
    ],
    correct: 1,
    explanation: 'Aplicação real casa características do problema com a ferramenta/técnica do módulo. Palavras-chave (notification system, push notification design, delivery tracking) indicam quando o tema é relevante. Fora desse contexto, complexidade extra custa sem ganho.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sd-notification-system"
      title="Case: sistema de notificações em escala"
      icon="🔔"
      xp={55}
      readTime={13}
      trailName="System Design Interview Prep"
      trailColor={accent}
      nextSlug="sd-distributed-cache"
      nextTitle="Case: distributed cache (Redis/Memcached)"
      quiz={quiz}
    >
      <Section title="Mental model" accent={accent}>
        <p>Push (APNs/FCM), email (SES/Sendgrid), SMS.</p>
      </Section>

      <Section title="Em detalhes técnicos" accent={accent}>
        <p>Templates, user preferences, quiet hours.</p>
        <p>
          <strong>Palavras-chave do módulo:</strong> notification system, push notification design, delivery tracking.
        </p>
      </Section>

      <Section title="Take-aways" accent={accent}>
        <p>Priority queues, rate limiting por user. Delivery tracking.</p>
        <Callout tone="success" icon="✅">
          Notification system design push email SMS — PT-BR.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
