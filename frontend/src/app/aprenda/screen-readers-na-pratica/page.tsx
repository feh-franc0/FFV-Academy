import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('screen-readers-na-pratica');

const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual screen reader é free e padrão no Windows?',
    options: [
      'JAWS',
      'NVDA (NonVisual Desktop Access) — free, open source. JAWS é proprietário ($1300) mas dominante em enterprise. Testing em ambos é ideal',
      'Narrator',
      'VoiceOver',
    ],
    correct: 1,
    explanation: 'NVDA (NV Access) é free e excelente — similar capability a JAWS. Instale e aprenda. Shortcuts: INS+DOWN read all, INS+F7 lista elements. Narrator (built-in Windows) é básico. JAWS ainda é dominante em grandes empresas/gov, fonte principal de tickets de a11y.',
  },
  {
    question: 'Qual screen reader vem built-in no macOS e iOS?',
    options: [
      'NVDA',
      'VoiceOver — ativa com Cmd+F5 (mac) ou triple-click home (iOS). Free, parte do sistema. User primary em Apple — teste se seu app tem usuário Apple',
      'JAWS',
      'TalkBack',
    ],
    correct: 1,
    explanation: 'VoiceOver é standard Apple. Rotor (VO+U) navega por headings, landmarks, links. Mobile: 1-finger swipe right avança, double-tap ativa. TalkBack é o equivalente Android. Teste mobile a11y = VoiceOver + TalkBack.',
  },
  {
    question: 'Qual é a diferença entre "browse mode" e "focus mode" em screen reader?',
    options: [
      'Cosmético',
      'Browse mode: screen reader controla, usuário lê página (setas, headings nav). Focus mode: interação com forms/widgets (digitação flui pro campo). Alternar automaticamente é principal desafio de UX de screen reader',
      'São iguais',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Screen readers têm dois modos. Browse (ou "virtual cursor"): user lê com setas, search, anuncia cada elemento. Focus: quando tab entra em input, vira focus mode — teclas vão pro input. ARIA applications/dialogs forçam focus mode. Dev precisa entender pra debugar "screen reader não me deixa digitar".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="screen-readers-na-pratica"
      title="Screen readers na prática: NVDA, JAWS, VoiceOver"
      icon="🔊"
      xp={55}
      readTime={12}
      trailName="Accessibility & Inclusive Engineering"
      trailColor={accent}
      nextSlug="automated-a11y-testing"
      nextTitle="Automated a11y testing: axe, Lighthouse, Pa11y"
      quiz={quiz}
    >
      <Section title="Ferramenta por plataforma" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Screen Reader', 'Plataforma', 'Custo', 'Market share']}
          rows={[
            ['NVDA', 'Windows', 'Free', '~40%'],
            ['JAWS', 'Windows', '$1300 (enterprise)', '~50%'],
            ['VoiceOver', 'macOS / iOS', 'Built-in', '100% Apple'],
            ['TalkBack', 'Android', 'Built-in', '100% Android'],
            ['Narrator', 'Windows', 'Built-in', 'Baixo'],
            ['Orca', 'Linux', 'Free', '~5%'],
          ]}
        />
      </Section>

      <Section title="NVDA — 10 shortcuts essenciais" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>INS + DOWN</strong>: read all</li>
          <li><strong>H</strong>: next heading</li>
          <li><strong>1-6</strong>: next heading level N</li>
          <li><strong>K</strong>: next link</li>
          <li><strong>F</strong>: next form field</li>
          <li><strong>B</strong>: next button</li>
          <li><strong>D</strong>: next landmark</li>
          <li><strong>INS + F7</strong>: abre lista de elementos (headings, links, landmarks)</li>
          <li><strong>Tab</strong>: focus mode (navegação de form)</li>
          <li><strong>Esc</strong>: back to browse mode</li>
        </ul>
      </Section>

      <Section title="Testing workflow" accent={accent}>
        <Callout tone="success" icon="✅">
          <strong>1.</strong> Desligue monitor (literalmente — fio).
          <strong>2.</strong> Ative NVDA/VoiceOver.
          <strong>3.</strong> Navegue seu app só com teclado + audio.
          <strong>4.</strong> Complete tarefa crítica (signup, checkout).
          Se você não conseguir, um user cego não consegue. É o teste mais didático.
        </Callout>
      </Section>

      <Section title="Common gotchas" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Animação</strong>: se elemento pisca/anima, screen reader re-anuncia — irritante. aria-live polite, not assertive pra toasts.</li>
          <li><strong>SPA routing</strong>: mudança de rota sem page reload não é anunciada. Dispare aria-live ao mudar rota.</li>
          <li><strong>Loading state</strong>: spinner visual mas screen reader diz nada. aria-busy="true" + aria-live sincronizado.</li>
          <li><strong>Modal sem focus</strong>: user abre modal, focus fica no trigger — escondido. Force focus no primeiro item focável do modal ao abrir.</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
