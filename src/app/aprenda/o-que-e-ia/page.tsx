import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section, Callout, ComparisonTable, DecisionBox,
  HierarchyDiagram, ComparisonFlow, QAItem, Timeline, CodeBlock,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('o-que-e-ia');

const accent = '#58a6ff';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença fundamental entre programação tradicional e Machine Learning?',
    options: [
      'ML usa GPUs, programação tradicional usa CPUs',
      'Em programação tradicional você escreve as regras; em ML o sistema descobre as regras a partir de dados',
      'ML é mais preciso que programação tradicional em todos os cenários',
      'Programação tradicional não usa dados; ML usa apenas dados',
    ],
    correct: 1,
    explanation: 'Na programação clássica: regras + dados → resultado. Em ML: dados + resultados esperados → regras (modelo treinado). O modelo descobre o padrão — você fornece os exemplos.',
  },
  {
    question: 'Qual destas afirmações sobre IA é VERDADEIRA?',
    options: [
      'IA pensa e tem consciência como humanos — apenas mais rápido',
      'AGI (IA que iguala humanos em qualquer tarefa) já existe em modelos como GPT-4',
      'A IA que usamos hoje (ANI) é extremamente competente em tarefas específicas mas não tem compreensão geral do mundo',
      'IA sempre produz resultados corretos quando treinada com dados suficientes',
    ],
    correct: 2,
    explanation: 'Toda IA atual é ANI (Artificial Narrow Intelligence): especialista em tarefas específicas. GPT-4 é incrível em texto mas não consegue, por exemplo, sentir cheiro ou andar de bicicleta. AGI — uma IA geral como nos filmes — não existe ainda.',
  },
  {
    question: 'Os três fatores que fizeram IA explodir após 2012 foram:',
    options: [
      'Computadores quânticos, blockchain e 5G',
      'GPUs baratas, internet gerando dados massivos, e avanços em arquiteturas (CNNs, depois Transformers)',
      'Investimento do governo, regulamentação favorável e computação em nuvem',
      'Criptografia avançada, edge computing e IoT',
    ],
    correct: 1,
    explanation: 'Dados (internet gera bilhões de exemplos), compute (GPUs NVIDIA tornaram deep learning viável) e algoritmos (AlexNet 2012 → Transformer 2017) — a convergência desses três fatores causou a explosão.',
  },
  {
    question: 'Deep Learning é um subconjunto de Machine Learning. O que o torna "deep"?',
    options: [
      'Usa análise profunda dos dados, examinando cada exemplo por mais tempo',
      'Usa redes neurais com muitas camadas empilhadas, permitindo aprender representações hierárquicas dos dados',
      'Usa mais dados de treino que ML tradicional — "deep" se refere à profundidade do dataset',
      'Usa processamento profundo em GPUs com mais núcleos CUDA',
    ],
    correct: 1,
    explanation: '"Deep" vem das muitas camadas (layers) da rede neural. Cada camada aprende representações mais abstratas: bordas → texturas → partes → objetos. ML clássico (regressão, SVM, árvores) não tem essa hierarquia — Deep Learning, sim.',
  },
];

export default function OQueEIAPage() {
  return (
    <ModuleLayout
      slug="o-que-e-ia"
      title="O que é Inteligência Artificial?"
      icon="🤖"
      xp={30}
      readTime={6}
      trailName="Fundamentos da IA"
      trailColor={accent}
      nextSlug="dados-o-combustivel"
      nextTitle="Dados: o Combustível"
      seoDesc="Definição real de IA, história dos AI winters, ANI vs AGI, ML vs DL vs LLMs, e aplicações atuais."
      relatedSlugs={['o-que-e-llm', 'como-ia-aprende', 'o-que-e-cloud']}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        IA não é magia, não é ficção científica e não vai destruir o mundo amanhã. Também não é &ldquo;só estatística&rdquo;. É um campo de engenharia com 70 anos de história, dois invernos, e uma explosão recente que mudou tudo. Neste artigo, você vai entender <strong>o que IA realmente é</strong>, o que não é, e por que ela importa agora.
      </p>

      <Section title="A definição real" accent={accent}>
        <p>
          <strong>Inteligência Artificial</strong> é o campo da ciência da computação que cria sistemas capazes de executar tarefas que, normalmente, exigiriam inteligência humana — reconhecer padrões, tomar decisões, aprender com experiência, gerar linguagem.
        </p>
        <p>
          A confusão começa porque IA é um <em>guarda-chuva enorme</em>. Dentro dele cabem coisas bem diferentes:
        </p>
        <HierarchyDiagram
          title="Hierarquia da IA"
          accent={accent}
          levels={[
            { label: 'INTELIGÊNCIA ARTIFICIAL', desc: 'Sistemas que realizam tarefas "inteligentes"' },
            { label: 'MACHINE LEARNING', desc: 'Sistemas que aprendem a partir de dados' },
            { label: 'DEEP LEARNING', desc: 'ML com redes neurais profundas (muitas camadas)' },
            { label: 'LLMs', desc: 'Transformers treinados em linguagem em escala massiva' },
          ]}
        />
        <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
          Também dentro de IA (fora de ML): sistemas baseados em regras (expert systems), busca e planejamento (A*, minimax), lógica fuzzy, algoritmos genéticos.
        </p>
      </Section>

      <Section title="IA vs. programação tradicional" accent={accent}>
        <p>
          A diferença fundamental é <strong>quem escreve as regras</strong>:
        </p>
        <ComparisonFlow
          title="Dois paradigmas"
          accent={accent}
          left={{
            label: 'PROGRAMAÇÃO TRADICIONAL',
            steps: ['REGRAS (humano escreve)', 'DADOS', 'RESULTADO'],
          }}
          right={{
            label: 'MACHINE LEARNING',
            steps: ['DADOS', 'RESULTADOS (exemplos)', 'REGRAS (modelo aprende)'],
          }}
        />
        <CodeBlock lang="pseudo">
{`// Programação tradicional: VOCÊ escreve as regras
function isSpam(email) {
  if (email.contains("ganhe dinheiro")) return true
  if (email.sender in blacklist) return true
  return false  // e as 10.000 variações que você não previu?
}

// Machine Learning: o MODELO aprende as regras
model = train(emails_labeled_spam_or_not)  // 500k exemplos
model.predict(new_email)  // funciona para variações nunca vistas`}
        </CodeBlock>
        <p>
          ML é poderoso para problemas onde escrever regras manualmente é <strong>impossível ou impraticável</strong>: reconhecer rostos em 10M fotos, traduzir 100 idiomas, detectar fraudes em padrões que mudam toda semana.
        </p>
      </Section>

      <Section title="ANI vs AGI: o estado real da IA" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tipo', 'O que significa', 'Existe hoje?', 'Exemplos']}
          rows={[
            ['ANI (Narrow)', 'IA especialista em UMA tarefa ou domínio', 'Sim — toda IA atual', 'GPT-4 (texto), DALL-E (imagem), AlphaFold (proteínas)'],
            ['AGI (General)', 'IA que iguala humanos em QUALQUER tarefa intelectual', 'Nao', 'Nenhum. Debatido se GPT-5/6/7 chegam la.'],
            ['ASI (Super)', 'IA que supera humanos em tudo', 'Nao', 'Pura especulacao. Cenario de ficao cientifica.'],
          ]}
        />
        <Callout tone="warn">
          <strong>Realidade:</strong> GPT-4 é incrivel em texto, mas nao sabe sentir cheiro, andar de bicicleta ou entender sarcasmo em 100% dos contextos. Claude gera codigo excelente, mas nao tem modelo mental persistente do mundo. Toda IA atual e ANI — e isso ja e extraordinariamente util.
        </Callout>
      </Section>

      <Section title="Historia: dos AI winters a explosao" accent={accent}>
        <Timeline
          title="70 anos de IA"
          accent={accent}
          events={[
            { when: '1950', label: 'Alan Turing publica "Computing Machinery and Intelligence"', detail: 'Propoe o Teste de Turing. "Maquinas podem pensar?"' },
            { when: '1956', label: 'Conferencia de Dartmouth', detail: 'Termo "Artificial Intelligence" e cunhado. Otimismo extremo: "resolvemos em uma geracao".' },
            { when: '1969', label: 'Primeiro AI Winter', detail: 'Perceptrons nao resolvem XOR. Financiamento corta. Promessas nao cumpridas.', highlight: true },
            { when: '1980s', label: 'Expert Systems + segundo boom', detail: 'Sistemas de regras (MYCIN, XCON). Lucrativos no inicio, rigidos demais depois.' },
            { when: '1987', label: 'Segundo AI Winter', detail: 'Expert systems caros demais para manter. Financiamento corta de novo.', highlight: true },
            { when: '1997', label: 'Deep Blue vence Kasparov no xadrez', detail: 'Marco simbolico. Mas era busca por forca bruta, nao "inteligencia".' },
            { when: '2012', label: 'AlexNet vence o ImageNet', detail: 'CNN + GPU. Erro cai de 26% para 16%. Deep learning explode.', highlight: true },
            { when: '2017', label: 'Attention is All You Need', detail: 'Transformer. A arquitetura que deu origem a GPT, BERT, Claude.', highlight: true },
            { when: '2022', label: 'ChatGPT', detail: '100M usuarios em 2 meses. IA sai do laboratorio para o mainstream.' },
            { when: '2024+', label: 'Era dos agents e reasoning', detail: 'Claude Code, tool use, MCP, multi-agent systems. IA integrada ao workflow.' },
          ]}
        />
        <p>
          Padrao claro: <strong>hype → promessas exageradas → desilusao → inverno → avancos reais → novo ciclo</strong>. O que mudou agora e que os avancos sao <em>demonstravelmente uteis</em> em escala (bilhoes de usuarios).
        </p>
      </Section>

      <Section title="Os tres fatores da explosao (2012+)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Fator', 'O que mudou', 'Numero concreto']}
          rows={[
            ['Dados', 'Internet gera bilhoes de exemplos: texto, imagem, video, codigo', 'Common Crawl: ~250B paginas web; GitHub: ~1T tokens de codigo'],
            ['Compute', 'GPUs NVIDIA tornaram deep learning viavel; clusters de milhares de GPUs', 'GPT-4: ~25.000 A100s por 3 meses (~$100M estimado)'],
            ['Algoritmos', 'AlexNet (2012) → ResNet → Transformer (2017) → scaling laws', 'Transformer: mesma arquitetura de 65M a 1.7T parametros'],
          ]}
        />
        <p>
          Nenhum fator sozinho explica a explosao. Transformers existiriam sem GPUs? Sim, mas nao treinariam em escala. GPUs sem dados? Inúteis. Dados sem algoritmos? Barulho. E a <strong>convergencia dos tres</strong> que criou o momento atual.
        </p>
      </Section>

      <Section title="ML Clássico vs Deep Learning: quando usar cada um" accent={accent}>
        <p>
          Nem todo problema precisa de rede neural. ML clássico continua relevante e frequentemente
          superior em datasets pequenos, problemas tabulares e cenários onde interpretabilidade é crítica.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Algoritmo', 'Quando usar', 'Não usar quando']}
          rows={[
            ['Regressão Logística', 'Classificação binária, baseline rápido, interpretabilidade total', 'Dados não-lineares, alta dimensionalidade sem engenharia de features'],
            ['Random Forest / Gradient Boosting (XGBoost)', 'Dados tabulares, datasets médios (~1M rows), features numéricas/categóricas', 'Imagens, texto, áudio — precisa de features manuais'],
            ['SVM', 'Alta dimensionalidade com poucos dados (texto com TF-IDF)', 'Datasets muito grandes (escala mal), deep learning costuma superar'],
            ['Redes Neurais / Deep Learning', 'Imagem, áudio, texto bruto, sequências — quando dados são abundantes', 'Dataset pequeno (<10k), quando interpretabilidade é obrigatória'],
            ['Transformers / LLMs', 'Linguagem, multimodal, raciocínio geral com fine-tuning', 'Predição tabular simples — XGBoost ainda vence em Kaggle tabular'],
          ]}
        />
        <Callout tone="info">
          <strong>Regra prática para 2026:</strong> para dados tabulares, comece com XGBoost/LightGBM.
          Para imagem, texto ou áudio, comece com um modelo pré-treinado (fine-tuning).
          Deep learning do zero só se você tem dados enormes e uma razão específica.
        </Callout>
      </Section>

      <Section title="IA Generativa: o que mudou em 2022" accent={accent}>
        <p>
          Antes de 2022, IA era principalmente <em>discriminativa</em> — classificava, detectava, previa.
          Com GPT-3 (2020) e especialmente ChatGPT (2022), surgiu uma nova categoria: <strong>IA generativa</strong>.
          A diferença é fundamental:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['', 'IA Discriminativa (antes)', 'IA Generativa (depois de 2022)']}
          rows={[
            ['O que faz', 'Classifica ou prevê a partir de input dado', 'Cria conteúdo novo: texto, imagem, código, áudio'],
            ['Pergunta central', '"Isso é spam ou não?" "Qual preço amanhã?"', '"Escreva um email. Gere uma imagem. Explique isso."'],
            ['Output', 'Categoria ou número', 'Sequência arbitrária de tokens/pixels/áudio'],
            ['Exemplos', 'Detecção de fraude, diagnóstico médico, recomendação', 'ChatGPT, Claude, DALL-E, Sora, GitHub Copilot'],
            ['Interface', 'API com input/output estruturado', 'Chat em linguagem natural, instrução em prosa'],
          ]}
        />
        <p>
          A IA generativa não substituiu a discriminativa — ela <strong>democratizou</strong> o acesso à IA.
          Qualquer pessoa pode dar uma instrução em linguagem natural e obter código, análise, tradução,
          síntese de dados. A curva de entrada passou de "precisa saber ML" para "precisa saber fazer boas perguntas".
        </p>
      </Section>

      <Section title="Onde IA funciona de verdade hoje" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Dominio', 'Aplicacao', 'Tecnologia']}
          rows={[
            ['Linguagem', 'Chatbots, traducao, sumarizacao, geracao de codigo', 'LLMs (GPT, Claude, LLaMA)'],
            ['Visao', 'Reconhecimento facial, carros autonomos, diagnostico medico', 'CNNs, Vision Transformers'],
            ['Fala', 'Transcrição, assistentes de voz, legendas em tempo real', 'Whisper, Wav2Vec'],
            ['Recomendacao', 'Netflix, Spotify, YouTube, ads', 'Embeddings + filtragem colaborativa'],
            ['Ciencia', 'Descoberta de medicamentos, estrutura de proteinas', 'AlphaFold, diffusion models'],
            ['Codigo', 'Assistentes de programacao, code review, debugging', 'Claude Code, Copilot, Cursor'],
          ]}
        />
      </Section>

      <Section title="Quando IA falha: viés e limitações sistêmicas" accent={accent}>
        <p>
          IA aprende o que existe nos dados — incluindo <strong>vieses humanos históricos</strong>.
          Esse problema não é teórico: resultados com viés real já causaram danos documentados.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Tipo de falha', 'Exemplo real', 'Causa técnica']}
          rows={[
            ['Viés de representação', 'Sistema de reconhecimento facial com >30% de erro em mulheres negras (estudo Buolamwini/Gebru, 2018)', 'Dataset dominado por rostos de homens brancos — modelo não generalizou'],
            ['Amplificação de estereótipos', 'Modelos de tradução usando "she" para enfermeira, "he" para engenheiro', 'Correlações no corpus refletem divisões históricas de gênero'],
            ['Drift de distribuição', 'Modelo de COVID funcionou no inverno mas falhou no verão (sintomas mudaram com variantes)', 'Dados de treino vs distribuição real divergiram'],
            ['Viés de confirmação', 'Sistema de crédito recusando mais empréstimos em bairros historicamente redlinados', 'Código postal correlaciona com etnia — proxy discrimination'],
            ['Alucinação em domínios críticos', 'Advogado citou jurisprudência inventada por ChatGPT em petição real (caso 2023)', 'LLMs maximizam plausibilidade, não facticidade'],
          ]}
        />
        <Callout tone="danger">
          <strong>Não existe IA "objetiva".</strong> Todo modelo reflete escolhas: quais dados coletar,
          quais métricas otimizar, quais trade-offs aceitar. Reconhecer isso não é pessimismo — é o
          primeiro passo para construir sistemas mais justos e confiáveis.
        </Callout>
      </Section>

      <Section title="O que IA NAO e" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Mito', 'Realidade']}
          rows={[
            ['"IA pensa como humano"', 'Nao. Processa padroes estatisticos em dados. Nao tem consciencia, intencao ou emocao.'],
            ['"IA vai substituir todos os empregos"', 'Vai transformar muitas funcoes. Substituir todas? Improvavel. Tarefas que exigem julgamento humano, empatia e contexto fisico resistem.'],
            ['"IA e sempre certa"', 'Modelos alucinam, erram, e refletem vieses dos dados de treino. Confianca cega e perigosa.'],
            ['"So precisa de mais dados"', 'Dados ruins em escala produzem vieses em escala. Qualidade > quantidade.'],
            ['"IA e so para Big Tech"', 'Modelos open-source (LLaMA, Mistral) e APIs acessiveis democratizaram acesso. Um dev solo pode usar IA em producao.'],
          ]}
        />
      </Section>

      <Section title="Perguntas e respostas" accent={accent}>
        <QAItem
          q="Preciso saber matematica para entender IA?"
          a={<>Depende do nivel. Para <strong>usar</strong> IA (APIs, prompts, agents): nao. Para <strong>entender como funciona</strong> (este curso): algebra linear basica, calculo (derivadas) e probabilidade ajudam. Para <strong>pesquisar</strong>: sim, matematica profunda e essencial. Nesta trilha, explicamos os conceitos matematicos quando aparecem — voce nao precisa chegar sabendo.</>}
        />
        <QAItem
          q="IA e so hype? Vai ter um terceiro inverno?"
          a={<>Possivel, mas improvavel na mesma escala. Os invernos anteriores aconteceram porque as promessas nao tinham aplicacao pratica. Hoje, ChatGPT tem 200M+ usuarios, Claude Code escreve codigo em producao, AlphaFold revolucionou biologia. O uso real sustenta o investimento. O risco e mais sutil: saturacao de startups que vendem "IA" sem substancia.</>}
        />
        <QAItem
          q="Por onde comeco se quero trabalhar com IA?"
          a={<>Este curso. Serio. A sequencia: (1) entenda o que IA e (voce esta aqui); (2) dados; (3) como ML aprende; (4) redes neurais; (5) LLMs; (6) Transformers. Depois disso voce tera base para escolher: quer usar IA (Trilha 3 — coding agents), construir com IA (Trilha 9 — RAG, agents), ou ir para ML engineering (Python + frameworks).</>}
        />
      </Section>

      <Callout tone="success">
        <strong>O que voce aprendeu:</strong> IA e o campo que cria sistemas capazes de tarefas inteligentes. ML e o subconjunto que aprende de dados. Deep Learning usa redes neurais profundas. LLMs sao Transformers treinados em texto. Toda IA atual e ANI (especialista), nao AGI (geral). A explosao veio da convergencia de dados + compute + algoritmos. Proximo passo: entender o ingrediente mais importante — os <strong>dados</strong>.
      </Callout>
    </div>
  );
}
