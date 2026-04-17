import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section, Callout, ComparisonTable,
  QAItem, CodeBlock, FlowDiagram, ArchFlow, ComparisonFlow,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Tokens e Tokenizacao — FFV Academy',
  description: 'BPE passo a passo, por que "morango" vira 3 tokens, tokenizer com tiktoken em Python, custo real por token e impacto em context windows.',
};

const accent = '#58a6ff';

const quiz: QuizQuestion[] = [
  {
    question: 'No BPE, o vocabulario e construido iterativamente. Qual e o criterio para decidir qual par de bytes/subwords fundir a cada passo?',
    options: [
      'O par que aparece mais vezes no corpus de treinamento (maior frequencia)',
      'O par que produz tokens mais curtos em caracteres',
      'O par cujos tokens individuais tem menor frequencia (priorizando tokens raros)',
      'Pares sao fundidos aleatoriamente ate atingir o tamanho de vocabulario desejado',
    ],
    correct: 0,
    explanation: 'BPE funde o par mais frequente a cada iteracao. Isso garante que sequencias comuns ("th", "the", "ing") virem tokens unicos cedo, enquanto sequencias raras permanecem como subtokens. Vocabularios de 50k-100k tokens cobrem a maioria das palavras comuns em uma unica unidade.',
  },
  {
    question: 'A mesma frase em portugues tipicamente usa mais tokens que em ingles. Por que?',
    options: [
      'Portugues tem mais letras no alfabeto que ingles',
      'O tokenizer foi treinado com muito mais texto em ingles, entao palavras inglesas sao tokens unicos mas palavras portuguesas sao quebradas em subtokens',
      'Portugues tem palavras mais longas, e cada caracter conta como um token',
      'APIs cobram mais por tokens em portugues como taxa de localizacao',
    ],
    correct: 1,
    explanation: 'Tokenizadores de LLMs sao treinados em corpus dominado por ingles (~60-70%). "the" e um token unico; "desenvolvimento" pode virar 3-4 tokens. Resultado: mesmo conteudo em PT usa ~20-40% mais tokens que em EN — custando proporcionalmente mais nas APIs.',
  },
  {
    question: 'Claude Sonnet 4 cobra $3/M tokens de input e $15/M de output. Se voce envia 10k tokens de contexto e recebe 2k tokens de resposta, quanto custa?',
    options: [
      '$0.003 input + $0.015 output = $0.018 por request',
      '$0.03 input + $0.03 output = $0.06 por request',
      '$0.15 input + $0.15 output = $0.30 por request',
      '$3.00 input + $15.00 output = $18.00 por request',
    ],
    correct: 1,
    explanation: '10k tokens x $3/1M = $0.03 de input. 2k tokens x $15/1M = $0.03 de output. Total: $0.06 por request. Em producao com 100k requests/dia, isso e ~$6.000/dia. Otimizar tokens impacta diretamente o custo.',
  },
  {
    question: 'Qual e a relacao entre tokens e o context window de um LLM?',
    options: [
      'Context window limita o numero de palavras; tokens sao irrelevantes',
      'Context window define o maximo de tokens que o modelo processa por vez — prompt + resposta juntos. Mais tokens = fica mais perto do limite',
      'Context window e fixo em 4096 tokens para todos os modelos modernos',
      'Context window limita apenas o output; o input pode ser ilimitado',
    ],
    correct: 1,
    explanation: 'Context window e medido em tokens, nao palavras. Claude Opus 4: 200k tokens. GPT-4 Turbo: 128k. O prompt inteiro (system + user + historico) + a resposta devem caber nesse limite. Por isso contar tokens antes de enviar e essencial em producao.',
  },
];

export default function TokensPage() {
  return (
    <ModuleLayout
      slug="tokens"
      title="Tokens e Tokenizacao"
      icon="🔤"
      xp={40}
      readTime={7}
      trailName="Fundamentos da IA"
      trailColor={accent}
      nextSlug="transformers"
      nextTitle="Transformers e Atencao"
      seoDesc="BPE passo a passo, tokenizer com tiktoken, custo real por token e impacto em context windows."
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
        A IA nao le texto como voce. Ela le <strong>tokens</strong> — pedacos de texto que podem ser uma palavra, parte de uma palavra, ou um unico caracter. Entender tokenizacao muda como voce escreve prompts, estima custos, e compreende os limites dos modelos. Este artigo mostra o algoritmo BPE passo a passo, o impacto de idiomas no custo, e como contar tokens na pratica.
      </p>

      <Section title="O que e um token?" accent={accent}>
        <p>
          Um token e a <strong>unidade atomica</strong> que o modelo processa. O LLM nao ve letras individuais nem palavras inteiras — ve tokens, que sao pedacos de texto definidos por um algoritmo de tokenizacao.
        </p>
        <ArchFlow
          title="Tokenização na prática — 'Machine learning é incrível!'"
          accent={accent}
          columns={[
            {
              header: 'TOKENS',
              headerColor: accent,
              items: ['Machine (t1)', 'learning (t2)', 'e (t3)', 'incr (t4)', 'ivel (t5)', '! (t6)'],
              footer: '6 tokens para 4 palavras',
            },
            {
              header: 'IDs NUMÉRICOS',
              headerColor: 'var(--ffv-purple)',
              items: ['22137', '6975', '3772', '42618', '48391', '0'],
              footer: 'cada token = 1 inteiro',
            },
            {
              header: 'OBSERVAÇÕES',
              headerColor: 'var(--ffv-green)',
              items: [
                '"Machine" = 1 token (inglês eficiente)',
                '" learning" inclui o espaço',
                '"incrível" = 2 tokens (PT fragmentado)',
                'Pontuação = token separado',
              ],
              footer: 'espaço faz parte do token',
            },
          ]}
        />
        <Callout tone="info">
          O espaco antes de &ldquo;learning&rdquo; faz parte do token. Tokenizadores BPE tratam espacos como parte da sequencia — &ldquo; learning&rdquo; (com espaco) e &ldquo;learning&rdquo; (sem espaco) sao tokens diferentes.
        </Callout>
      </Section>

      <Section title="BPE passo a passo" accent={accent}>
        <p>
          A maioria dos LLMs usa <strong>Byte Pair Encoding (BPE)</strong> — um algoritmo elegante que constroi o vocabulario de tokens a partir de um corpus de texto. Veja como funciona:
        </p>
        <FlowDiagram
          title="BPE — construção iterativa do vocabulário"
          orientation="vertical"
          accent={accent}
          steps={[
            { icon: '🔤', label: 'Passo 0: caracteres individuais', desc: 'Corpus "aba abab bab" → vocab {a, b, espaço}' },
            { icon: '🔍', label: 'Passo 1: par mais frequente', desc: '"a"+"b" aparece 5× → funde em novo token "ab"' },
            { icon: '🔗', label: 'Passo N: repetir até o tamanho alvo', desc: 'Funde pares frequentes: "ab"+"a" → "aba", etc.' },
            { icon: '✅', label: 'Vocabulário final (modelos reais)', desc: 'GPT-2: 50k · GPT-4: 100k · LLaMA 3: 128k · Claude: ~100k tokens' },
          ]}
        />
        <p>
          O resultado: palavras comuns em ingles (&ldquo;the&rdquo;, &ldquo;is&rdquo;, &ldquo;function&rdquo;) viram <strong>um unico token</strong>. Palavras raras ou de outros idiomas sao quebradas em <strong>subtokens</strong>.
        </p>
      </Section>

      <Section title="Por que 'morango' vira 3 tokens?" accent={accent}>
        <p>
          Uma pergunta famosa: por que LLMs erram ao contar letras em palavras? Porque eles nao veem letras — veem tokens:
        </p>
        <ComparisonFlow
          title="Humano vs modelo — 'Quantos r tem em strawberry?'"
          accent={accent}
          left={{
            label: 'O QUE O HUMANO VÊ',
            steps: [
              's · t · r · a · w · b · e · r · r · y',
              'Conta 3 letras "r" sem esforço',
              'Acesso direto a cada caractere',
              '"morango" → m-o-r-a-n-g-o',
            ],
          }}
          right={{
            label: 'O QUE O MODELO VÊ',
            steps: [
              '[str] [aw] [berry] — 3 tokens',
              '"str" é unidade atômica: não sabe que tem "r"',
              'Sem acesso direto a letras individuais',
              '"morango" → [mor][ango] (2 tokens)',
            ],
          }}
        />
        <Callout tone="warn">
          Essa e uma <strong>limitacao fundamental</strong> de LLMs baseados em tokens BPE. Tarefas que exigem raciocinio no nivel de caracteres individuais (contar letras, palindromos, anagramas) sao inerentemente dificeis porque a granularidade do modelo e o token, nao a letra.
        </Callout>
      </Section>

      <Section title="Impacto do idioma: portugues custa mais" accent={accent}>
        <p>
          Tokenizadores de LLMs sao treinados em corpus dominado por ingles (~60-70% dos dados). Consequencia:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Frase', 'Tokens (EN)', 'Tokens (PT)', 'Diferenca']}
          rows={[
            ['"Hello, how are you?"', '~6', '—', '—'],
            ['"Ola, como voce esta?"', '—', '~9', '+50%'],
            ['"The cat sat on the mat"', '~7', '—', '—'],
            ['"O gato sentou no tapete"', '—', '~9', '+29%'],
            ['Documento de 1000 palavras', '~1300', '~1700', '+30%'],
          ]}
        />
        <p>
          Isso tem impacto direto em <strong>tres coisas</strong>:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Impacto', 'Explicacao']}
          rows={[
            ['Custo', 'APIs cobram por token. Mesmo conteudo em PT custa ~30% mais que em EN.'],
            ['Context window', '200k tokens cabem ~150k palavras em EN, mas so ~120k palavras em PT.'],
            ['Velocidade', 'Mais tokens = mais passos de geracao = resposta mais lenta.'],
          ]}
        />
      </Section>

      <Section title="Tokenizer na pratica: tiktoken" accent={accent}>
        <CodeBlock lang="python">
{`import tiktoken

# Carregar tokenizer do GPT-4
enc = tiktoken.get_encoding("cl100k_base")

# Tokenizar texto
text = "Machine learning e incrivel!"
tokens = enc.encode(text)
print(f"Texto: {text}")
print(f"Tokens: {tokens}")
print(f"Total: {len(tokens)} tokens")
# → Texto: Machine learning e incrivel!
# → Tokens: [22137, 6975, 3772, 42618, 48391, 0]
# → Total: 6 tokens

# Decodificar token por token
for t in tokens:
    print(f"  {t:>6} → '{enc.decode([t])}'")
# → 22137 → 'Machine'
# → 6975  → ' learning'
# → 3772  → ' e'
# → 42618 → 'incr'
# → 48391 → 'ivel'
# → 0     → '!'

# Comparar idiomas
en = enc.encode("The cat sat on the mat")
pt = enc.encode("O gato sentou no tapete")
print(f"EN: {len(en)} tokens, PT: {len(pt)} tokens")
# → EN: 7 tokens, PT: 9 tokens`}
        </CodeBlock>
        <Callout tone="info">
          <strong>Instalar:</strong> <code style={{ fontFamily: 'var(--font-roboto-mono)', fontSize: 12 }}>pip install tiktoken</code>. Para Claude, use o tokenizer do Anthropic ou estime ~1.3 tokens/palavra em EN, ~1.7 em PT.
        </Callout>
      </Section>

      <Section title="Tokens e custo de API" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Input (por 1M tokens)', 'Output (por 1M tokens)', 'Context window']}
          rows={[
            ['Claude Sonnet 4', '$3', '$15', '200k tokens'],
            ['Claude Opus 4', '$15', '$75', '200k tokens'],
            ['Claude Haiku 3.5', '$0.80', '$4', '200k tokens'],
            ['GPT-4o', '$2.50', '$10', '128k tokens'],
            ['GPT-4o mini', '$0.15', '$0.60', '128k tokens'],
            ['LLaMA 3.1 405B (self-hosted)', 'Custo de GPU', 'Custo de GPU', '128k tokens'],
          ]}
        />
        <ArchFlow
          title="Cálculo de custo real — chatbot de atendimento"
          accent={accent}
          columns={[
            {
              header: 'COMPOSIÇÃO DO PROMPT',
              headerColor: accent,
              items: [
                'System prompt: 500 tokens (fixo)',
                'Histórico: 2000 tokens (média)',
                'Mensagem do usuário: 200 tokens',
                'Resposta do modelo: 800 tokens',
                'Total input: 2700 · output: 800',
              ],
              footer: 'Claude Sonnet 4: $0.02/request',
            },
            {
              header: '50K REQUESTS/DIA',
              headerColor: 'var(--ffv-orange)',
              items: [
                'Input: 2700 × $3/1M = $0.0081',
                'Output: 800 × $15/1M = $0.012',
                'Por request: ~$0.02',
                'Por dia: 50k × $0.02 = $1.000',
                'Por mês: ~$30.000',
              ],
              footer: 'escala rápido',
            },
            {
              header: 'OTIMIZAÇÕES',
              headerColor: 'var(--ffv-green)',
              items: [
                'Prompt caching: -40% input',
                'Resumir histórico: -60% input',
                'Haiku p/ triagem + Sonnet: -70%',
                'Resultado: ~$9.000/mês (−70%)',
              ],
              footer: 'tokens × preço × volume = custo',
            },
          ]}
        />
      </Section>

      <Section title="Vocabularios especiais" accent={accent}>
        <p>
          Alem de tokens de texto, tokenizadores incluem tokens especiais que controlam o comportamento do modelo:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Token especial', 'Funcao', 'Exemplo']}
          rows={[
            ['<|endoftext|>', 'Marca fim de documento no pre-treino', 'O modelo aprende que apos esse token comeca conteudo novo'],
            ['<|im_start|> / <|im_end|>', 'Delimitam mensagens no chat format', '<|im_start|>user\\n Ola<|im_end|>'],
            ['[PAD]', 'Padding para igualar comprimento de sequencias em batch', 'Tokens de padding sao ignorados pela attention mask'],
            ['[UNK]', 'Token desconhecido (raro em BPE moderno)', 'BPE com bytes como base nunca produz UNK — tudo e representavel'],
          ]}
        />
      </Section>

      <Section title="Perguntas e respostas" accent={accent}>
        <QAItem
          q="Se o modelo nao ve letras, como ele consegue escrever texto correto?"
          a={<>Porque o modelo aprende que o token &ldquo;learning&rdquo; e frequentemente seguido por tokens como &ldquo; is&rdquo;, &ldquo; algorithms&rdquo;, etc. Ele opera no nivel de tokens, nao de letras, mas como tokens correspondem a pedacos de palavras/palavras inteiras, o texto gerado e gramaticalmente correto na maioria das vezes. Onde ele falha: tarefas de nivel sub-token (soletrar, contar letras, rimas exatas).</>}
        />
        <QAItem
          q="Por que nao usar caracteres individuais como tokens?"
          a={<>Sequencias ficam muito longas. &ldquo;Hello world&rdquo; = 11 tokens (caracteres) vs 2 tokens (BPE). Self-attention e O(n2) — dobrar o comprimento quadruplica o custo. BPE e um compromisso: vocabulario grande o suficiente para que palavras comuns sejam 1 token, mas pequeno o suficiente para que o embedding table caiba na memoria.</>}
        />
        <QAItem
          q="Posso trocar o tokenizer de um modelo treinado?"
          a={<>Nao sem retreinar. Os embeddings (vetores que representam cada token) sao aprendidos durante o treino. Trocar o tokenizer muda os IDs → todos os embeddings ficam errados. Por isso cada familia de modelos tem seu proprio tokenizer: GPT-4 usa cl100k_base, LLaMA 3 usa SentencePiece com 128k tokens, etc.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>O que voce aprendeu:</strong> tokens sao a unidade atomica que LLMs processam. BPE constroi vocabularios fundindo pares frequentes. Portugues usa ~30% mais tokens que ingles para o mesmo conteudo (impacto em custo e context window). Voce sabe usar tiktoken para contar tokens e calcular custo de API. Proximo passo: entender <strong>o que o modelo faz</strong> com esses tokens — a arquitetura <strong>Transformer</strong>.
      </Callout>
    </div>
  );
}
