import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('css-layout-moderno');
const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando usar Grid vs Flexbox em 2026?',
    options: [
      'Grid é sempre melhor',
      'Grid para layout 2D (define linhas E colunas ao mesmo tempo) — páginas, galerias, dashboards. Flexbox para layout 1D (eixo único) — navbar, toolbar, lista de tags. Dica: se você está escrevendo flex com wrap complexo para simular grid, use grid',
      'Flexbox é sempre melhor',
      'Ambos são idênticos',
    ],
    correct: 1,
    explanation: 'Critério funcional: Grid alinha em duas dimensões simultâneas; Flexbox em uma. Dashboard com cards alinhados em rows E cols = Grid. Navbar horizontal = Flex. Misturar é saudável: container Grid de página, dentro de cada célula Flex para conteúdo.',
  },
  {
    question: 'Qual vantagem real de subgrid?',
    options: [
      'Nenhuma',
      'Permite que o grid interno herde as tracks do grid pai. Resolve alinhamento entre "cards" onde cada card tem título, corpo e footer que precisam estar na mesma linha em TODOS os cards, mesmo com tamanhos de título diferentes. Antes exigia container único ou JS — agora é display: subgrid',
      'Só estético',
      'Só funciona em Chrome',
    ],
    correct: 1,
    explanation: 'Subgrid (widely supported desde 2024) é o que faltava para grid "de verdade". Sem subgrid, alinhar 3 linhas internas de N cards independentes era impossível sem grid compartilhado. Hoje é display: grid no card + grid-template-rows: subgrid herdando do pai.',
  },
  {
    question: 'Por que container queries substituem parte do media query?',
    options: [
      'Não substituem',
      'Media query reage ao viewport inteiro — ruim para componentes reutilizáveis que têm contextos diferentes (sidebar vs main). Container query reage ao tamanho do container pai do componente: o mesmo card se comporta diferente sidebar (estreito) vs main (largo). Componentes viram realmente portáteis',
      'São visuais',
      'São lentas',
    ],
    correct: 1,
    explanation: 'Container queries (wide support desde 2023) resolvem o "componente não sabe onde vai viver" do design system. Com @container, um Card responde ao próprio container — sem precisar saber se está em grid de 4 colunas ou em drawer estreito. Bibliotecas de UI modernas usam extensivamente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="css-layout-moderno"
      title="CSS layout: Grid, Flexbox, Subgrid, Container queries"
      icon="📐"
      xp={55}
      readTime={13}
      trailName="Frontend Moderno — HTML, CSS, JS e React"
      trailColor={accent}
      nextSlug="css-moderno-layers-has"
      nextTitle="CSS moderno: Cascade Layers, :has, View Transitions"
      quiz={quiz}
    >
      <Section title="A escolha certa por dimensão" accent={accent}>
        <p>
          Flexbox e Grid não competem — cobrem dimensões diferentes. <strong>Flex</strong> alinha ao longo de um eixo (main axis). <strong>Grid</strong> define tracks em dois eixos ao mesmo tempo. Na prática, um site bem feito usa os dois: Grid define o layout macro; Flex resolve o micro.
        </p>
      </Section>

      <Section title="Grid: layout macro da página" accent={accent}>
        <CodeBlock lang="css">{`/* Layout clássico: header / sidebar / main / footer */
.app {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "side   main"
    "footer footer";
  min-height: 100dvh; /* dynamic vh evita problema com barras móveis */
}

.app > header { grid-area: header; }
.app > aside  { grid-area: side; }
.app > main   { grid-area: main; }
.app > footer { grid-area: footer; }

/* Grid auto-fit: cria colunas dinâmicas sem media query */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}`}</CodeBlock>
      </Section>

      <Section title="Flexbox: o micro" accent={accent}>
        <CodeBlock lang="css">{`.toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;           /* gap funciona em flex desde 2021 */
  padding-inline: 1rem;   /* logical property: horizontal em ltr/rtl */
}

.toolbar .spacer { flex: 1; } /* empurra o resto para a direita */

/* Flex wrap com tracks iguais — use grid em vez disso */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Se você está escrevendo <code>flex-wrap + flex-basis: calc(33% - gap)</code> para simular 3 colunas, pare — use <code>grid-template-columns: repeat(3, 1fr)</code>. Flex wrap é para listas fluídas sem alinhamento entre linhas; grid é para alinhamento real.
        </Callout>
      </Section>

      <Section title="Subgrid: o que faltava" accent={accent}>
        <p>
          Problema clássico: lista de cards, cada um com título, corpo e footer que precisam estar na mesma linha entre cards, mesmo com títulos de tamanhos diferentes.
        </p>
        <CodeBlock lang="html">{`<ul class="cards">
  <li class="card">
    <h3>Título curto</h3>
    <p>Corpo ...</p>
    <footer>R$ 10</footer>
  </li>
  <li class="card">
    <h3>Título bem mais longo que ocupa duas linhas</h3>
    <p>Corpo ...</p>
    <footer>R$ 20</footer>
  </li>
</ul>

<style>
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    grid-template-rows: auto 1fr auto; /* definido no pai */
    gap: 1rem;
  }

  .card {
    display: grid;
    grid-template-rows: subgrid;     /* herda tracks do pai */
    grid-row: span 3;                /* ocupa as 3 rows */
    padding: 1rem;
    border: 1px solid #e5e7eb;
  }
</style>`}</CodeBlock>
      </Section>

      <Section title="Container queries: componente consciente do container" accent={accent}>
        <CodeBlock lang="css">{`/* Define container no pai do componente */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* Card reage ao próprio container, não ao viewport */
.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

@container card (min-width: 400px) {
  .card {
    grid-template-columns: 120px 1fr; /* imagem + conteúdo lado a lado */
  }
}

@container card (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr auto; /* imagem + conteúdo + preço */
  }
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Container queries transformam design system: um Card publicado numa lib pode ser usado em sidebar estreita E em main largo sem saber. Antes, cada consumer aplicava classes modificadoras. Agora o componente é auto-consciente.
        </Callout>
      </Section>

      <Section title="Logical properties: i18n pronto" accent={accent}>
        <p>
          Projetos sérios (e-commerce global, apps RTL) usam logical properties. <code>margin-inline-start</code> é "margin-left em ltr e margin-right em rtl" — o navegador resolve. Trocar o idioma não exige rescrever CSS.
        </p>
        <CodeBlock lang="css">{`/* Evite */
.btn { margin-left: 8px; padding-left: 12px; }

/* Prefira */
.btn {
  margin-inline-start: 8px;
  padding-inline: 12px;       /* horizontal = inline em qualquer direção */
  padding-block: 8px;          /* vertical = block */
  border-inline-start: 2px solid currentColor;
}`}</CodeBlock>
      </Section>

      <Section title="Aspect-ratio: fim do padding-hack" accent={accent}>
        <CodeBlock lang="css">{`/* Vídeo 16:9 responsivo — sem padding-bottom: 56.25% */
.video-wrapper {
  aspect-ratio: 16 / 9;
  width: 100%;
}

/* Thumbnail quadrada que cresce mantendo proporção */
.thumb {
  aspect-ratio: 1;
  width: 100%;
  object-fit: cover;
}`}</CodeBlock>
      </Section>

      <Section title="Checklist operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          Grid para layout 2D, Flex para 1D, Subgrid para alinhamento entre cards, Container queries para componentes portáteis, logical properties para i18n. Use gap (nunca mais margin entre filhos), min-height 100dvh (nunca mais 100vh), aspect-ratio (nunca mais padding-hack). CSS moderno entrega em 10 linhas o que ontem exigia 100.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
