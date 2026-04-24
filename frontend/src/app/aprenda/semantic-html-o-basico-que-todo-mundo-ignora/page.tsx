import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('semantic-html-o-basico-que-todo-mundo-ignora');

const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o problema de &lt;div onClick={...}&gt; em vez de &lt;button&gt;?',
    options: [
      'Estético',
      'div não é focável por keyboard (sem tabindex), não anuncia role="button" pra screen reader, não reage a Enter/Space, não tem states default (hover, focus, active). Usar button resolve tudo grátis',
      'div é mais rápido',
      'Nenhuma diferença',
    ],
    correct: 1,
    explanation: 'button elemento nativo: focável, role button, Enter/Space ativa, states CSS. div é layout — sem semântica interativa. Adicionar tabindex="0" + role="button" + onKeyDown(Enter/Space) imita, mas erra em detalhes (disabled state, form submit, etc). Use o elemento certo.',
  },
  {
    question: 'Por que heading hierarchy (h1-h6 em ordem) importa?',
    options: [
      'SEO apenas',
      'Screen readers navegam POR HEADINGS (shortcut H). Skip a level (h1→h3 sem h2) quebra navegação. User cego entra na página, aperta "1" vai pros h1, depois "2" pra h2, etc — arquitetura navegável',
      'Só estético',
      'Não importa',
    ],
    correct: 1,
    explanation: 'NVDA/VoiceOver/JAWS têm modo "navegar por headings". Estrutura: um h1 (título da página), hs2 pra seções, h3 pra subseções. Pular (h2→h4) confunde navegação. React/Next: use NivelHeading props ou aria-level pra flex pattern de componentes.',
  },
  {
    question: 'O que &lt;label for="input-id"&gt; faz além de estética?',
    options: [
      'Estilo',
      'Associa label programaticamente ao input — screen reader anuncia label junto, click no label foca input, user pode tocar maior área (touch target), assistive tech entende relação',
      'Só visual',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'for/id associa. htmlFor no React. Alternativa: aninhar &lt;label&gt;&lt;input&gt;&lt;/label&gt; (implícito). Sem label associado, screen reader só lê "input edit" — user não sabe o quê. CRÍTICO em forms. placeholder NÃO substitui label (some ao digitar, baixo contrast, não é anunciado).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="semantic-html-o-basico-que-todo-mundo-ignora"
      title="Semantic HTML: o básico que todo mundo ignora"
      icon="🏗️"
      xp={45}
      readTime={10}
      trailName="Accessibility & Inclusive Engineering"
      trailColor={accent}
      nextSlug="aria-quando-usar-quando-nao"
      nextTitle="ARIA: quando usar, quando NÃO usar"
      quiz={quiz}
    >
      <Section title="Landmarks" accent={accent}>
        <CodeBlock lang="html">{`<!-- Estrutura padrão (cada um é "landmark") -->
<header>
  <nav aria-label="Main">...</nav>
</header>
<main>
  <h1>Página title</h1>
  <article>
    <h2>Seção</h2>
  </article>
  <aside aria-label="Related">...</aside>
</main>
<footer>...</footer>

<!-- Screen reader: shortcut D/R lista landmarks -->`}</CodeBlock>
      </Section>

      <Section title="Elementos corretos por função" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Ação → <code>button</code> (não div)</li>
          <li>Navegação → <code>a href</code> (não button ou div)</li>
          <li>Lista → <code>ul/ol</code> (não div com ::before)</li>
          <li>Form input → <code>input</code> com <code>label for</code></li>
          <li>Select → <code>select/option</code> (custom combobox exige ARIA complexo)</li>
          <li>Table → <code>table/th/td</code> com <code>scope</code> (dados, não layout)</li>
          <li>Modal → <code>dialog</code> (showModal nativo, trap focus automático)</li>
        </ul>
      </Section>

      <Section title="Exemplo: form acessível" accent={accent}>
        <CodeBlock lang="html">{`<form>
  <div>
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required
           aria-describedby="email-help email-error" />
    <span id="email-help">Usaremos só para login</span>
    <span id="email-error" role="alert"></span>
  </div>
  <button type="submit">Entrar</button>
</form>

<!-- aria-describedby liga help + error ao input -->
<!-- role="alert" faz screen reader anunciar erro ao aparecer -->
<!-- required (HTML5) + validação nativa -->`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Regra de ouro: &quot;HTML semântico antes de ARIA&quot;. O elemento certo resolve 80% dos problemas de a11y de graça.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
