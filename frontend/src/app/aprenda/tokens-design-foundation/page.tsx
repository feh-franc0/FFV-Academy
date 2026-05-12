import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  DecisionBox,
  StackFlow,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('tokens-design-foundation');
const accent = '#a855f7';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença real entre primitive tokens, semantic tokens e component tokens?',
    options: [
      'São apenas três nomes para a mesma coisa — escolha um e siga',
      'Primitive tokens são valores brutos sem contexto (color.blue.500 = #2563eb). Semantic tokens dão significado de uso (color.action.primary = {color.blue.500}). Component tokens parametrizam um componente específico (button.bg.default = {color.action.primary}). A indireção em 3 camadas permite trocar tema sem renomear nada nos componentes',
      'Primitive e semantic são iguais; component token é um CSS variable',
      'Primitive token é só pra dark mode',
    ],
    correct: 1,
    explanation:
      'Esse 3-tier model é o padrão consolidado por Nathan Curtis (EightShapes) e adotado pela W3C Design Tokens Community Group. A regra: componente NUNCA referencia primitive direto, sempre semantic. Isso permite trocar `color.action.primary` de blue.500 para indigo.500 em rebrand sem tocar em nenhum componente.',
  },
  {
    question: 'Por que a W3C Design Tokens Community Group escolheu JSON com $value/$type em vez de YAML ou TOML?',
    options: [
      'Por moda, sem razão técnica',
      'JSON é universal (qualquer linguagem lê), tipável estaticamente (TypeScript), suporta referências via { } e ferramentas como Figma já exportam JSON nativamente. $type discrimina valor (color, dimension, shadow) para validação. $value carrega o valor real. Convenção $-prefix evita conflito com chaves de usuário',
      'Porque é mais bonito',
      'Porque YAML não suporta cores',
    ],
    correct: 1,
    explanation:
      'A spec DTCG (https://tr.designtokens.org/format/) padronizou JSON em 2023 justamente porque era o menor denominador comum entre Figma, Sketch, ferramentas web e CI. $type é load-bearing: permite Style Dictionary saber que `color` precisa ir para HSL no iOS mas hex no web, e que `dimension` precisa virar dp no Android.',
  },
  {
    question: 'Por que tokens devem ser distribuídos em múltiplas plataformas (web, iOS, Android) e não só CSS?',
    options: [
      'Não precisam, CSS é suficiente',
      'Porque um Design System sério atende várias plataformas (web, app nativo, email transacional, marketing site). A mesma fonte (tokens.json) gera CSS custom properties para web, .swift para iOS, .xml ou Compose para Android, .json para React Native. Style Dictionary (Amazon) e Theo (Salesforce) automatizam isso. Sem isso, paridade visual quebra rapidamente',
      'Só importa em empresas grandes',
      'iOS e Android usam o mesmo CSS',
    ],
    correct: 1,
    explanation:
      'Esse é o argumento original da Amazon ao publicar Style Dictionary em 2017: tinham 5 plataformas e cada uma reimplementava as cores. O custo de paridade manual é exponencial. Hoje, ferramentas como TokensStudio (Figma plugin) + Style Dictionary + CI fazem o pipeline completo: designer altera token no Figma → PR auto-aberto → build gera artifacts para todas plataformas.',
  },
  {
    question: 'O que é "token aliasing" e por que importa para dark mode?',
    options: [
      'É renomear uma variável CSS',
      'Aliasing é quando um token aponta para outro via referência (ex: {color.action.primary} → {color.blue.500}). Para dark mode, você troca apenas o alias da camada semantic: no tema dark, color.action.primary → blue.400 (não 500). Componentes não mudam. Sem aliasing, você precisa de N variáveis CSS por tema duplicadas',
      'É um erro de tipagem',
      'É exclusivo de Tailwind',
    ],
    correct: 1,
    explanation:
      'Aliasing é a feature mais poderosa de tokens. Brad Frost cunhou: "the value of a token is rarely the value itself; it is the relationship". É justamente o alias que permite multi-theme, multi-brand white-label e A/B test de tema sem refactor.',
  },
  {
    question: 'Quando NÃO criar um token novo?',
    options: [
      'Sempre criar — quanto mais, melhor',
      'Quando o valor é one-off (usado só em um componente específico, sem repetição esperada), quando é decisão de layout pontual (gap entre dois elementos específicos), ou quando criaria mais ruído cognitivo que valor. Token só compensa se houver reuso ou se for contrato semântico (cor de erro, espaço entre cards). Token de tudo gera "tokens spaghetti" — Nathan Curtis fala sobre isso',
      'Nunca — sempre usar hardcoded',
      'Só criar tokens em modo dark',
    ],
    correct: 1,
    explanation:
      'O anti-pattern mais comum em DS imaturos: tokenizar absolutamente tudo, incluindo valores únicos. Resultado: 800 tokens onde 80% têm 1 uso. Curtis recomenda: token = decisão reutilizável OU contrato de significado. Caso contrário, hardcoded está ok.',
  },
  {
    question: 'Como tokens se relacionam com Tailwind CSS v4 e CSS custom properties?',
    options: [
      'Não se relacionam — são alternativas mutuamente exclusivas',
      'Tokens são a fonte (tokens.json). CSS custom properties são o output em runtime (--color-action-primary: #2563eb). Tailwind v4 (@theme directive) consome custom properties e gera utility classes (bg-action-primary). O fluxo: tokens.json → Style Dictionary → CSS custom properties → Tailwind @theme → utility classes. Tudo derivado da mesma fonte',
      'Tailwind substitui tokens',
      'CSS custom properties não suportam tokens',
    ],
    correct: 1,
    explanation:
      'Esse é o stack moderno consolidado em 2025-26. Tailwind v4 abraçou explicitamente CSS-first: você define `--color-action-primary` no @theme e ganha `bg-action-primary` automaticamente. Tokens viram a fonte upstream, Tailwind o consumidor downstream. Sem duplicação.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tokens-design-foundation"
      title="Design tokens: a fundação de qualquer DS sério"
      icon="🎯"
      xp={60}
      readTime={12}
      trailName="Design Systems Engineering"
      trailColor={accent}
      nextSlug="theming-dark-mode-automacao"
      nextTitle="Theming + dark mode: prefers-color-scheme + system + manual"
      quiz={quiz}
    >
      <Section title="Por que tokens existem (e por que não é só renomear cores)" accent={accent}>
        <p>
          Antes de Design Tokens existirem como conceito, equipes de produto vivenciaram o mesmo
          fracasso recorrente: um designer altera a cor primária no Figma, o time mobile entende
          uma coisa, o time web outra, marketing usa um terceiro hex, e o produto fica visualmente
          incoerente. Tokens nasceram como resposta engenheiril a esse problema — não como
          variável CSS bonita, mas como <strong>contrato compartilhado entre design e código</strong>,
          versionável, tipável e distribuível em múltiplas plataformas.
        </p>
        <p>
          A W3C Design Tokens Community Group (DTCG), liderada por Jina Anne, Daniel Banks (Amazon),
          Jonathan Levine e outros, formalizou em 2023 a especificação{' '}
          <a
            href="https://tr.designtokens.org/format/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Design Tokens Format Module
          </a>
          . O documento define como tokens devem ser serializados (JSON), tipados (<InlineCode>$type</InlineCode>), referenciados via aliasing e
          versionados. Hoje, Figma Variables exporta nesse formato. Style Dictionary (Amazon),
          Theo (Salesforce) e TokensStudio leem nesse formato. É o lingua franca.
        </p>
        <Callout tone="info" icon="📜">
          Histórico curto: Salesforce publicou Theo em 2014, Amazon publicou Style Dictionary em
          2017, Brad Frost cunhou "atomic design" (foundations → atoms → molecules) em 2013, e
          Nathan Curtis (EightShapes) publicou em 2016 o artigo seminal{' '}
          <em>"Naming Tokens in Design Systems"</em> que estabeleceu o vocabulário moderno. A
          DTCG consolidou tudo em standard formal a partir de 2021.
        </Callout>
      </Section>

      <Section title="O 3-tier model: primitives → semantic → component" accent={accent}>
        <p>
          A arquitetura canônica de tokens — defendida por Curtis, adotada pelo Material 3,
          Polaris (Shopify), Spectrum (Adobe), Carbon (IBM) e praticamente todo DS sério — usa
          três camadas com responsabilidades distintas. Cada camada existe para isolar um tipo
          de decisão.
        </p>
        <StackFlow
          title="Hierarquia de tokens (de baixo para cima)"
          accent={accent}
          items={[
            {
              label: 'Tier 1 — Primitive (Reference) tokens',
              sub: 'color.blue.500 = #2563eb',
              detail:
                'Valores brutos sem contexto de uso. spacing.4 = 16px, font.size.lg = 1.125rem. Inventário cru da paleta.',
            },
            {
              label: 'Tier 2 — Semantic (System) tokens',
              sub: 'color.action.primary = {color.blue.500}',
              detail:
                'Significado de uso. color.surface.danger, space.layout.section. É aqui que tema dark/light/multi-brand pivota.',
            },
            {
              label: 'Tier 3 — Component tokens',
              sub: 'button.primary.bg = {color.action.primary}',
              detail:
                'Parâmetros de um componente específico. card.padding = {space.layout.cardInner}. Permite ajustar componente sem mexer no sistema.',
            },
          ]}
        />
        <p>
          A regra de ouro: <strong>nenhum componente deve referenciar um primitive token
          diretamente</strong>. Se você vê <InlineCode>background: var(--color-blue-500)</InlineCode> no CSS
          do botão, está errado — deveria ser <InlineCode>var(--color-action-primary)</InlineCode>. Essa
          regra é o que permite trocar a cor primária de azul para roxo no rebrand sem abrir o
          código dos 80 componentes.
        </p>
        <CodeBlock lang="json">{`{
  "color": {
    "blue": {
      "500": { "$value": "#2563eb", "$type": "color" },
      "600": { "$value": "#1d4ed8", "$type": "color" }
    },
    "neutral": {
      "0":   { "$value": "#ffffff", "$type": "color" },
      "900": { "$value": "#0f172a", "$type": "color" }
    },
    "action": {
      "primary":       { "$value": "{color.blue.500}", "$type": "color" },
      "primary-hover": { "$value": "{color.blue.600}", "$type": "color" }
    },
    "surface": {
      "background": { "$value": "{color.neutral.0}",   "$type": "color" },
      "foreground": { "$value": "{color.neutral.900}", "$type": "color" }
    }
  },
  "button": {
    "primary": {
      "bg":    { "$value": "{color.action.primary}",       "$type": "color" },
      "bg-hover": { "$value": "{color.action.primary-hover}", "$type": "color" },
      "fg":    { "$value": "{color.neutral.0}",            "$type": "color" }
    }
  }
}`}</CodeBlock>
      </Section>

      <Section title="A especificação DTCG na prática" accent={accent}>
        <p>
          Três conceitos da spec que você precisa internalizar antes de mexer em qualquer
          ferramenta:
        </p>
        <KeyValue
          accent={accent}
          items={[
            {
              k: '$value',
              v: 'Valor real do token. Pode ser literal ("#2563eb") ou referência via chaves ("{color.blue.500}"). Referências são resolvidas em build time pelo transformer.',
            },
            {
              k: '$type',
              v: 'Tipo do token. Valores válidos: color, dimension, fontFamily, fontWeight, duration, cubicBezier, number, shadow, gradient, typography (composite), border, transition. Discrimina como transformar para cada plataforma.',
            },
            {
              k: '$description',
              v: 'Documentação inline do token. Aparece em ferramentas (Figma, Storybook docs) — Curtis recomenda incluir "quando usar / quando não usar".',
            },
            {
              k: 'Aliasing',
              v: 'Token aponta para outro via {path.to.token}. Permite multi-theme com troca atômica na camada semantic. Cycle detection é obrigatória no transformer.',
            },
            {
              k: 'Composite tokens',
              v: 'Tokens compostos (typography, shadow, border) agrupam múltiplas propriedades em um único token. Ex: typography.heading.1 = { fontFamily, fontSize, fontWeight, lineHeight }.',
            },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          A spec DTCG ainda está em status "Working Draft" (não Recommendation). Ferramentas
          podem divergir em detalhes (TokensStudio adiciona <InlineCode>$extensions</InlineCode> para metadata
          proprietária). Antes de adotar, leia a versão atual da spec — ela evolui.
        </Callout>
      </Section>

      <Section title="Style Dictionary: o transformer dominante" accent={accent}>
        <p>
          Style Dictionary, criado por Danny Banks na Amazon e mantido como projeto Amazon
          open-source, é o transformer mais usado em 2025-26. A ideia: ele lê seu{' '}
          <InlineCode>tokens.json</InlineCode> (no formato DTCG) e gera artefatos para qualquer
          plataforma — CSS custom properties, SCSS variables, JS/TS objects, Swift classes,
          Android XML, Compose Color objects, Flutter Dart, JSON achatado, etc.
        </p>
        <FlowDiagram
          title="Pipeline Style Dictionary"
          accent={accent}
          steps={[
            { label: 'tokens.json', desc: 'Fonte DTCG (commitada no monorepo)' },
            { label: 'parsers', desc: 'Lê tokens, resolve aliases' },
            { label: 'transforms', desc: 'Converte valores (hex → HSL, px → dp)' },
            { label: 'formats', desc: 'Gera output específico por plataforma' },
            { label: 'artifacts', desc: 'tokens.css, tokens.swift, tokens.kt' },
          ]}
        />
        <CodeBlock lang="javascript">{`// style-dictionary.config.mjs
export default {
  source: ['tokens/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: { outputReferences: true } // mantém var() em vez de inline
      }]
    },
    ts: {
      transformGroup: 'js',
      buildPath: 'dist/ts/',
      files: [{
        destination: 'tokens.ts',
        format: 'javascript/es6'
      }]
    },
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'dist/ios/',
      files: [{
        destination: 'StyleDictionary.swift',
        format: 'ios-swift/class.swift',
        className: 'StyleDictionary'
      }]
    },
    android: {
      transformGroup: 'android',
      buildPath: 'dist/android/',
      files: [{
        destination: 'colors.xml',
        format: 'android/colors'
      }]
    }
  }
};`}</CodeBlock>
        <p>
          Após <InlineCode>npx style-dictionary build</InlineCode>, você tem <InlineCode>tokens.css</InlineCode>{' '}
          com todas as custom properties prontas para serem importadas pela aplicação web,{' '}
          <InlineCode>tokens.ts</InlineCode> para uso em JS/TS, e os equivalentes nativos. Tudo
          derivado da mesma fonte.
        </p>
      </Section>

      <Section title="TokensStudio: ponte com Figma" accent={accent}>
        <p>
          TokensStudio (antes "Figma Tokens", de Jan Six) é o plugin que conecta designers ao
          mundo de tokens. Designer cria tokens no plugin (ou usa Figma Variables nativos), e o
          plugin exporta JSON DTCG-compatível. Acoplado a GitHub Actions, vira pipeline:
        </p>
        <CodeBlock lang="yaml">{`# .github/workflows/tokens-sync.yml
name: Tokens sync
on:
  push:
    paths: ['tokens/**/*.json']
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - name: Build Style Dictionary
        run: npx style-dictionary build
      - name: Visual diff
        run: npx chromatic --only-changed
      - name: Open PR with rebuilt artifacts
        uses: peter-evans/create-pull-request@v6
        with:
          title: 'chore(tokens): sync from design'
          branch: tokens/sync
          commit-message: 'chore(tokens): rebuild artifacts'`}</CodeBlock>
        <p>
          Resultado: designer altera token no Figma → push automático para repo → CI roda Style
          Dictionary → PR aberto com diff visual no Chromatic → engineer aprova ou rejeita.
          Esse fluxo elimina a tradução manual "designer Slack-ou um Figma frame" que é onde
          quase todo erro de paridade nasce.
        </p>
      </Section>

      <Section title="Naming: o problema mais difícil de tokens" accent={accent}>
        <p>
          Nathan Curtis tem um aforismo clássico:{' '}
          <em>"Naming tokens is the hardest problem in design systems — harder than the tokens
          themselves."</em> A razão é que nome carrega convenção, e convenção carrega
          interpretação cultural do time. Algumas regras consolidadas:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Padrão', 'Exemplo bom', 'Exemplo ruim', 'Por quê']}
          rows={[
            [
              'Primitive: descreva valor',
              'color.blue.500',
              'color.primary',
              '"Primary" muda com rebrand; "blue.500" é imutável',
            ],
            [
              'Semantic: descreva uso',
              'color.action.primary',
              'color.blueButton',
              'Uso é estável; visual ("blue") é variável',
            ],
            [
              'Spacing: descreva escala',
              'space.4 ou space.md',
              'space.16px',
              'Hardcoded em px morre quando muda a base (4px → 8px)',
            ],
            [
              'Estado: sufixo claro',
              'action.primary-hover',
              'action.primary2',
              'Estado é semântico, número não diz nada',
            ],
            [
              'Hierarquia: domínio.uso.modificador',
              'surface.background.subtle',
              'subtleBg',
              'Hierarquia permite tooling (auto-complete, agrupamento)',
            ],
          ]}
        />
        <Callout tone="success" icon="✅">
          Brad Frost recomenda: comece com poucos tokens e nomes longos. É mais fácil renomear
          50 tokens cedo do que 500 tokens tarde. Token name é parte do contrato — mudar nome
          quebra consumers, então trate como API pública.
        </Callout>
      </Section>

      <Section title="Composite tokens: typography, shadow, border" accent={accent}>
        <p>
          Tokens compostos agrupam múltiplas propriedades relacionadas em uma unidade
          semântica. Não é só conveniência — evita combinações inválidas (typography heading
          com font-size de body, line-height inconsistente).
        </p>
        <CodeBlock lang="json">{`{
  "typography": {
    "heading-1": {
      "$type": "typography",
      "$value": {
        "fontFamily": "{font.family.display}",
        "fontSize":   "{font.size.4xl}",
        "fontWeight": "{font.weight.bold}",
        "lineHeight": "{font.lineHeight.tight}",
        "letterSpacing": "{font.letterSpacing.tight}"
      }
    },
    "body": {
      "$type": "typography",
      "$value": {
        "fontFamily": "{font.family.text}",
        "fontSize":   "{font.size.base}",
        "fontWeight": "{font.weight.regular}",
        "lineHeight": "{font.lineHeight.relaxed}"
      }
    }
  },
  "shadow": {
    "card": {
      "$type": "shadow",
      "$value": [
        { "color": "{color.neutral.900-alpha-10}", "offsetX": "0", "offsetY": "1px",  "blur": "2px",  "spread": "0" },
        { "color": "{color.neutral.900-alpha-06}", "offsetX": "0", "offsetY": "4px",  "blur": "8px",  "spread": "-2px" }
      ]
    }
  }
}`}</CodeBlock>
        <p>
          Em CSS, a composite vira um conjunto de custom properties relacionadas
          (<InlineCode>--typography-heading-1-fontSize</InlineCode>, etc.) ou um mixin se você usar SCSS.
          Storybook docs auto-gera previews de cada composite usando o type information.
        </p>
      </Section>

      <Section title="Quando NÃO criar um token" accent={accent}>
        <DecisionBox
          scenario="Devo criar um novo token para esse valor?"
          winner="Crie token quando há reuso real ou contrato semântico"
          winnerColor={accent}
          why="Token só compensa se há repetição esperada (2+ componentes), se representa significado estável (cor de erro, espaçamento de seção) ou se você espera que mude em rebrand/dark mode/multi-brand. Valor único pontual deve ficar hardcoded — token de 'padding desse modal específico' é ruído cognitivo."
          alternatives={[
            { name: 'Hardcoded inline', when: 'Valor one-off, sem reuso esperado e sem semântica estável' },
            { name: 'Primitive direto', when: 'Valor da paleta usado uma vez, sem necessidade de aliasing por tema' },
            { name: 'Tokenizar tudo', when: 'Antipattern — gera "token spaghetti", 1.200 tokens com 70% de uso único' },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          Antipattern comum em DS jovens: tokenizar tudo. Resultado: 1.200 tokens onde 70% têm
          uso único. Curtis chama de "token spaghetti". Comece com poucos tokens essenciais
          (cores semânticas, escala de espaço, tipografia base) e cresça por demanda real, não
          por aspiração.
        </Callout>
      </Section>

      <Section title="Tokens vs CSS custom properties vs Tailwind v4" accent={accent}>
        <p>
          Confusão recorrente: "se eu tenho CSS custom properties, preciso de tokens? Se uso
          Tailwind v4 com <InlineCode>@theme</InlineCode>, preciso de tokens?" A resposta é{' '}
          <strong>tokens são a fonte; o resto é output</strong>:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Camada', 'O que é', 'Onde vive', 'Quem consome']}
          rows={[
            [
              'tokens.json (DTCG)',
              'Fonte canônica, multi-plataforma',
              'monorepo, versionado',
              'Style Dictionary',
            ],
            [
              'CSS custom properties',
              'Output web (--color-action-primary)',
              'tokens.css gerado',
              'CSS, browser, runtime theming',
            ],
            [
              'Tailwind @theme',
              'Mapeamento custom props → utilities',
              'tailwind.css',
              'JSX/HTML com utility classes',
            ],
            [
              'iOS/Android tokens',
              'Output mobile (.swift, .xml)',
              'tokens.swift gerado',
              'componentes nativos',
            ],
          ]}
        />
        <p>
          Fluxo completo: <InlineCode>tokens.json</InlineCode> → Style Dictionary →{' '}
          <InlineCode>tokens.css</InlineCode> com custom properties → Tailwind v4 lê custom
          properties via <InlineCode>@theme</InlineCode> → gera utility classes. Tudo derivado da mesma
          fonte. Sem duplicação. Esse stack é o que será aprofundado no módulo de Tailwind v4.
        </p>
      </Section>

      <Section title="Q&A rápido" accent={accent}>
        <QAItem
          q="Tokens substituem variáveis SCSS?"
          a="Substituem com vantagens: multi-plataforma, runtime-swappable (custom properties), versionados, tipados. SCSS variables são build-time apenas — não permitem dark mode dinâmico. Migrar SCSS vars para tokens é refactor recomendado."
        />
        <QAItem
          q="Preciso de Style Dictionary se só tenho web?"
          a="Não obrigatoriamente — você pode escrever CSS custom properties à mão. Mas perde: validação ($type), aliasing checagem, futuro multi-plataforma, ferramental (Figma sync). Custo de Style Dictionary é baixo; benefício cresce com tempo."
        />
        <QAItem
          q="Como versionar tokens?"
          a="Mesma estratégia de qualquer biblioteca: semver. Adicionar token é minor, mudar valor de semantic token (rebrand) é minor, remover token é major (breaking change). Vide módulo de DS versioning com changesets."
        />
        <QAItem
          q="Onde Figma Variables se encaixam?"
          a="Figma Variables (lançado nativamente em 2023) são o equivalente Figma de tokens, com aliasing e modes (themes). TokensStudio plugin agora tem opção de sync direto com Variables. Em 2026, Variables é a fonte no Figma, e o pipeline exporta para DTCG."
        />
      </Section>

      <Section title="Leituras canônicas" accent={accent}>
        <Callout tone="info" icon="📚">
          Para aprofundar: <strong>W3C Design Tokens Format Module</strong> (tr.designtokens.org/format/),{' '}
          <strong>Nathan Curtis — "Naming Tokens in Design Systems"</strong> (EightShapes/Medium),{' '}
          <strong>Brad Frost — "Atomic Design"</strong> (atomicdesign.bradfrost.com), Style
          Dictionary docs (amzn.github.io/style-dictionary), TokensStudio docs
          (tokens.studio/docs), e o livro <em>"Design Systems"</em> de Alla Kholmatova
          (Smashing Magazine) — capítulo 4 sobre patterns funcionais.
        </Callout>
      </Section>

      <Section title="Postura operacional" accent={accent}>
        <Callout tone="success" icon="✅">
          Leve deste módulo: tokens são contrato entre design e código, não variável CSS bonita.
          3-tier (primitive → semantic → component) é o padrão; componente nunca referencia
          primitive direto. DTCG JSON é o lingua franca; Style Dictionary é o transformer
          dominante. Nomear bem é mais difícil que escolher valor. Token só existe se há reuso
          real ou contrato semântico — caso contrário, é ruído. Próximo módulo aplica tudo isso
          em theming + dark mode + multi-brand sem FOUC.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
