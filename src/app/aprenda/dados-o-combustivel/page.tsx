import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section, Callout, ComparisonTable, DecisionBox,
  ArchFlow, FlowDiagram, QAItem, CodeBlock,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('dados-o-combustivel');

const accent = '#58a6ff';

const quiz: QuizQuestion[] = [
  {
    question: 'Você treinou um modelo que acerta 99% no test set. Parece excelente, mas o dataset tem 99% da classe A e 1% da classe B. O que provavelmente aconteceu?',
    options: [
      'O modelo aprendeu perfeitamente — 99% é um resultado excelente',
      'O modelo simplesmente prevê "classe A" para tudo e ignora a classe B (class imbalance)',
      'O modelo está com overfitting porque 99% é alto demais',
      'O test set está contaminado com dados de treino',
    ],
    correct: 1,
    explanation: 'Com 99% da classe A, um modelo que sempre prevê A acerta 99% sem aprender nada. A accuracy mascara que ele erra 100% da classe B. Solução: usar métricas como F1, precision/recall por classe, ou balancear o dataset.',
  },
  {
    question: 'O que é data leakage e por que é perigoso?',
    options: [
      'Quando dados pessoais vazam na internet — é um problema de privacidade',
      'Quando informação do test/validation set contamina o treinamento, inflando métricas artificialmente — o modelo parece bom mas falha em produção',
      'Quando o dataset é grande demais para caber na memória',
      'Quando o modelo gera dados falsos que parecem reais',
    ],
    correct: 1,
    explanation: 'Data leakage acontece quando o modelo tem acesso direto ou indireto a informação que não teria em produção. Exemplo: normalizar antes de splittar (estatísticas do test set vazam pro treino) ou features que contêm a resposta disfarçada.',
  },
  {
    question: 'Por que o set de teste deve ser tocado apenas UMA vez, no final?',
    options: [
      'Porque rodar o modelo muitas vezes no test set gasta muito compute',
      'Porque se você ajustar hiperparâmetros olhando o test set, está fazendo overfitting no test — ele deixa de medir generalização real',
      'Porque o test set fica "gasto" e precisa ser substituído por dados novos',
      'Porque o framework de ML trava se você rodar o test set mais de uma vez',
    ],
    correct: 1,
    explanation: 'Cada vez que você olha o resultado no test set e ajusta algo, está indiretamente otimizando para ele. Isso transforma o test em validation. Para medir generalização real, o test set deve ser um "juiz final" que nunca influencia decisões de design.',
  },
  {
    question: 'GPT-4 foi treinado em dados da internet. Qual o maior risco desse tipo de fonte?',
    options: [
      'A internet é lenta, então o download demora',
      'O conteúdo da internet é sempre de baixa qualidade',
      'Dados da web contêm vieses, informações incorretas, conteúdo duplicado e material protegido por copyright — tudo isso afeta o modelo',
      'Modelos treinados na internet só funcionam online',
    ],
    correct: 2,
    explanation: 'A web é a maior fonte de texto do mundo, mas vem com vieses culturais, desinformação, spam, duplicatas e questões legais de copyright. Por isso empresas investem fortemente em filtragem, deduplicação e curadoria — o pipeline de dados é tão importante quanto a arquitetura.',
  },
];

export default function DadosCombustivelPage() {
  return (
    <ModuleLayout
      slug="dados-o-combustivel"
      title="Dados: o Combustível da IA"
      icon="⛽"
      xp={30}
      readTime={8}
      trailName="Fundamentos da IA"
      trailColor={accent}
      nextSlug="como-ia-aprende"
      nextTitle="Como a IA Aprende"
      seoDesc="Qualidade vs quantidade de dados, data leakage, class imbalance, train/val/test split e pipelines de dados."
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
        &ldquo;Dados são o novo petróleo&rdquo; — mas petróleo bruto não move carro. Precisa ser extraído, refinado e distribuído. Com dados é igual: a qualidade, o balanceamento e a forma como você divide o dataset determinam se o modelo vai aprender de verdade ou decorar lixo. Neste artigo, você vai entender o <strong>pipeline de dados</strong> que sustenta toda IA moderna — da coleta ao train/val/test split, passando por data leakage, class imbalance e augmentation.
      </p>

      <Section title="O que são dados de treinamento" accent={accent}>
        <p>
          Para aprender, um modelo precisa de <strong>exemplos</strong>. Cada exemplo é um par: uma entrada e uma saída esperada (no caso supervisionado), ou simplesmente uma amostra da distribuição que queremos modelar (não-supervisionado).
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Tipo de tarefa', 'Input', 'Label (saída)', 'Dataset famoso']}
          rows={[
            ['Classificação de imagem', 'Foto 224×224 pixels', '"gato", "cachorro", "carro"', 'ImageNet (14M imagens, 21k classes)'],
            ['Tradução', '"Que horas são?" (pt-BR)', '"What time is it?" (en)', 'WMT (milhões de pares paralelos)'],
            ['LLM (pré-treino)', 'Sequência de tokens', 'Próximo token', 'Common Crawl (~15T tokens)'],
            ['Detecção de fraude', 'Transação bancária (features)', '"fraude" ou "legítima"', 'Proprietário (bancos não compartilham)'],
            ['Speech-to-text', 'Áudio em chunks', 'Transcrição texto', 'LibriSpeech (960h de áudio)'],
          ]}
        />
        <p>
          Note que para LLMs, os dados <em>não são rotulados por humanos</em> — o label é simplesmente o próximo token no texto original. Isso é o que tornou o pré-treino em escala possível: a internet é um dataset auto-rotulado de trilhões de exemplos.
        </p>
      </Section>

      <Section title="Qualidade vs Quantidade: os 5 pilares" accent={accent}>
        <p>
          A intuição &ldquo;mais dados = melhor modelo&rdquo; é parcialmente verdade, mas <strong>dados ruins em escala ensinam coisas erradas em escala</strong>. O modelo aprende exatamente o que está nos dados — incluindo vieses, erros e inconsistências.
        </p>
        <ArchFlow
          title="Os 5 pilares da qualidade de dados"
          accent={accent}
          columns={[
            {
              header: '1. RELEVÂNCIA',
              headerColor: accent,
              items: ['Os dados representam o problema real?', 'Treinar detector de gatos com fotos de estúdio não funciona em fotos de celular.', 'Distribuição de treino ≠ produção = falha.'],
            },
            {
              header: '2. DIVERSIDADE',
              headerColor: 'var(--ffv-purple)',
              items: ['Cobre todos os cenários de produção?', 'Rostos: todas etnias, idades, iluminações', 'Modelos de reconhecimento falharam em grupos sub-representados (MIT/NIST 2019)'],
            },
            {
              header: '3. LIMPEZA',
              headerColor: 'var(--ffv-green)',
              items: ['Sem duplicatas, labels errados, ruído excessivo ou dados corrompidos.', 'Garbage in = garbage out.', 'Até 30% dos labels em crowdsourcing são erros.'],
            },
            {
              header: '4. BALANCEAMENTO',
              headerColor: 'var(--ffv-orange)',
              items: ['Classes equilibradas?', '99% gato + 1% cachorro ensina "tudo é gato".', 'Detecção de fraude: 0.1% positivo.'],
            },
            {
              header: '5. ATUALIDADE',
              headerColor: 'var(--ffv-red)',
              items: ['Dados refletem o estado atual?', 'Modelo de preços de 2019 não sabe sobre inflação pós-pandemia.', 'LLMs com cutoff de 2023 não sabem de 2025.'],
            },
          ]}
        />
        <Callout tone="warn">
          <strong>Exemplo real:</strong> modelos de reconhecimento facial treinados predominantemente com rostos brancos têm taxa de erro até 34× maior em rostos de mulheres negras (Gender Shades, Joy Buolamwini 2018). O viés estava nos dados de treinamento. Diversidade não é política — é requisito técnico.
        </Callout>
      </Section>

      <Section title="Train / Validation / Test: a divisão sagrada" accent={accent}>
        <p>
          Treinar e avaliar nos <strong>mesmos dados</strong> é como dar a prova pro aluno estudar. Ele vai se sair bem, mas não aprendeu de verdade. A solução é dividir o dataset em três partes com papéis distintos:
        </p>
        <ArchFlow
          title="Split padrão e papel de cada conjunto — 100k exemplos"
          accent={accent}
          columns={[
            {
              header: 'TRAIN SET (70–80%)',
              headerColor: accent,
              items: ['70k exemplos', 'O modelo aprende aqui', 'Forward pass → loss → backprop → update pesos', 'Pode ser visto múltiplas vezes (épocas)'],
              footer: 'usado toda época',
            },
            {
              header: 'VALIDATION SET (10–15%)',
              headerColor: 'var(--ffv-orange)',
              items: ['15k exemplos', 'Ajusta hiperparâmetros (lr, epochs, batch)', 'NÃO atualiza pesos', 'Detecta overfitting: val loss sobe enquanto train cai'],
              footer: 'monitoramento contínuo',
            },
            {
              header: 'TEST SET (10–15%)',
              headerColor: 'var(--ffv-green)',
              items: ['15k exemplos', 'JUIZ FINAL — tocado UMA única vez', 'Mede performance em dados nunca vistos', 'Tocar e ajustar = contaminar'],
              footer: '⚠️ Uma vez no final',
            },
          ]}
        />
        <Callout tone="danger">
          <strong>Armadilha clássica:</strong> normalizar os dados (calcular média/std) <em>antes</em> de fazer o split. A média do dataset inteiro inclui informação do test set — isso é <strong>data leakage</strong>. O correto: calcular estatísticas <em>apenas no train set</em> e aplicar (transform) nos outros conjuntos.
        </Callout>
      </Section>

      <Section title="Data Leakage: o assassino silencioso" accent={accent}>
        <p>
          Data leakage acontece quando o modelo tem acesso, direto ou indireto, a informação que <strong>não teria em produção</strong>. As métricas ficam excelentes no lab e o modelo quebra no mundo real — às vezes sem nenhum aviso.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Tipo de leakage', 'Exemplo concreto', 'Como prevenir']}
          rows={[
            ['Target leakage', '"Data do diagnóstico" como feature para prever "tem doença?" — a data já pressupõe o diagnóstico', 'Analisar correlação feature-target; remover features que revelam a resposta'],
            ['Train-test contamination', 'Mesmo paciente aparece no train e no test — o modelo aprendeu aquele indivíduo', 'Group split: garantir que a mesma unidade (paciente, sessão) não cruza conjuntos'],
            ['Temporal leakage', 'Usar dados de julho para prever o que aconteceu em junho', 'Time-based split: train em dados mais antigos, test em dados mais recentes'],
            ['Preprocessing leakage', 'StandardScaler.fit() em todo o dataset antes do split', 'Fit apenas no train; transform nos demais com os mesmos parâmetros'],
          ]}
        />
        <CodeBlock lang="python">{`# ❌ ERRADO — leakage: fit no dataset inteiro
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)  # inclui test set!
X_train, X_test = train_test_split(X_scaled)

# ✅ CORRETO — fit apenas no train
X_train, X_test, y_train, y_test = train_test_split(X, y)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)   # aprende stats do train
X_test = scaler.transform(X_test)         # aplica as mesmas stats`}</CodeBlock>
        <p>
          O erro de preprocessing leakage é tão comum que frameworks modernos como scikit-learn tem o <strong>Pipeline</strong> exatamente para forçar o fit/transform correto durante cross-validation.
        </p>
      </Section>

      <Section title="Class Imbalance: quando 99% não significa nada" accent={accent}>
        <p>
          Detecção de fraude: 99.9% das transações são legítimas. Se o modelo prevê &ldquo;legítima&rdquo; para tudo, acerta 99.9%. Mas erra 100% das fraudes — exatamente o que deveria detectar. Isso é <strong>class imbalance</strong> e é um dos problemas mais comuns em ML de produção.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Técnica', 'Como funciona', 'Quando usar']}
          rows={[
            ['Class weights', 'Aumenta o peso da loss para a classe rara — o modelo é "punido mais" por errar a minoria', 'Imbalance moderado (1–10%); mais simples'],
            ['Oversampling (SMOTE)', 'Gera exemplos sintéticos da classe minoritária interpolando vizinhos reais', 'Tabular data com poucos exemplos da classe rara'],
            ['Undersampling', 'Remove exemplos da classe majoritária aleatoriamente', 'Dataset enorme onde perder dados não prejudica'],
            ['Focal Loss', 'Reduz loss de exemplos fáceis, foca nos difíceis', 'Imbalance extremo; usado no RetinaNet (object detection)'],
            ['Métricas corretas', 'F1, precision, recall, AUROC em vez de accuracy', 'SEMPRE — accuracy mascara imbalance'],
          ]}
        />
        <DecisionBox
          scenario="Dataset com 5% da classe positiva — qual técnica?"
          winner="Class weights + F1 como métrica"
          winnerColor={accent}
          why="Mais simples de implementar, não altera o dataset, e funciona bem para imbalance moderado (1–10%). Para imbalance extremo (0.1%), combinar com SMOTE para gerar mais exemplos da classe rara."
          alternatives={[
            { name: 'SMOTE', note: 'Quando a classe rara tem poucos exemplos e você precisa gerar mais para o modelo aprender a fronteira de decisão.' },
            { name: 'Focal Loss', note: 'Para imbalance extremo em imagens/object detection onde SMOTE não se aplica.' },
          ]}
        />
      </Section>

      <Section title="Data Augmentation: criar dados a partir de dados" accent={accent}>
        <p>
          Quando dados reais são escassos ou caros, podemos gerar <strong>variações dos dados existentes sem mudar o significado</strong>. Uma foto de gato rotacionada 15° ainda é um gato — mas agora é um novo exemplo de treino.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Domínio', 'Técnicas', 'Exemplo concreto']}
          rows={[
            ['Imagens', 'Flip, rotação, crop, color jitter, mixup, cutout, CutMix', 'Foto de gato flipada horizontalmente ainda é gato; mixup combina 2 imagens com label misto'],
            ['Texto', 'Back-translation, sinônimos, paráfrase via LLM, word dropout', '"O cão é grande" → inglês → "The dog is big" → pt-BR → "O cachorro é grande"'],
            ['Áudio', 'Time stretch, pitch shift, adição de ruído de fundo, reverb', 'Voz com eco de ambiente ainda é a mesma frase'],
            ['Tabular', 'SMOTE, noise injection, feature crossover, Gaussian noise', 'Transação de fraude com valor ±2% ainda é fraude'],
          ]}
        />
        <Callout tone="info">
          <strong>Dados sintéticos com LLMs (2024–2025):</strong> uma prática crescente é usar GPT-4/Claude para gerar dados de treino para modelos menores. O Phi-3 da Microsoft foi treinado parcialmente em &ldquo;textbooks&rdquo; gerados por GPT-4. O risco: cada geração de &ldquo;modelo treinado em output de modelo&rdquo; degrada a qualidade — isso é <strong>model collapse</strong>. Dados reais servem de âncora.
        </Callout>
      </Section>

      <Section title="De onde vêm os dados dos LLMs" accent={accent}>
        <p>
          O pipeline de dados de um LLM moderno começa com coleta bruta em escala de terabytes e termina em um dataset curado de alta qualidade — o que sobra depois de filtrar o lixo:
        </p>
        <FlowDiagram
          title="Pipeline de dados de um LLM moderno"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🌐', label: 'Coleta bruta', desc: 'Common Crawl (250B páginas) · GitHub (1T tokens) · Wikipedia · Livros · Reddit · StackOverflow' },
            { icon: '🔍', label: 'Deduplicação', desc: 'Remover duplicatas exatas e near-duplicates (MinHash + LSH) — até 30% do Common Crawl é duplicado' },
            { icon: '🧹', label: 'Filtragem de qualidade', desc: 'Remover spam, boilerplate, conteúdo adulto, PII, toxicidade — classificadores treinados nessa tarefa' },
            { icon: '⚖️', label: 'Balanceamento', desc: 'Proporcional por língua, domínio, tipo de conteúdo — sobrerepresentar código e ciência' },
            { icon: '📦', label: 'Dataset final', desc: '2–15T tokens de alta qualidade · Custo de processamento: ~$2–5M · Custo de treino: $30–100M+' },
          ]}
        />
        <ComparisonTable
          accent={accent}
          headers={['Fonte', 'Volume estimado', 'Prós', 'Contras']}
          rows={[
            ['Common Crawl', '~15T tokens brutos → ~2T após filtro', 'Enorme, diverso, gratuito', 'Muito ruído, spam, duplicatas, vieses de quem escreve na web'],
            ['Wikipedia', '~4B tokens (en)', 'Alta qualidade, factual, estruturado', 'Viés enciclopédico; pouca linguagem informal'],
            ['GitHub', '~1T tokens de código', 'Código real, multilinguagem, comentários', 'Muitos repos abandonados; código de má qualidade'],
            ['Livros', 'Milhões de livros', 'Prosa longa e bem escrita; raciocínio elaborado', 'Copyright questionável (NYT vs OpenAI, Authors Guild)'],
            ['Dados sintéticos', 'Ilimitado em teoria', 'Curadoria controlável; útil para nichos', 'Risco de model collapse em gerações subsequentes'],
          ]}
        />
      </Section>

      <Section title="Feature engineering: preparando os dados para o modelo" accent={accent}>
        <p>
          Dados brutos raramente entram direto no modelo. Precisam ser transformados em <strong>features</strong> — representações numéricas que o modelo consegue processar:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Transformação', 'O que faz', 'Quando usar']}
          rows={[
            ['Normalização (min-max)', 'Escala valores para [0, 1]: (x - min) / (max - min)', 'Features com ranges muito diferentes (ex: idade vs salário)'],
            ['Padronização (z-score)', 'Transforma para média=0, std=1: (x - μ) / σ', 'Quando a distribuição importa (regressão, SVM, PCA)'],
            ['One-hot encoding', 'Categoria → vetor binário: "gato" → [1,0,0], "cão" → [0,1,0]', 'Features categóricas com baixa cardinalidade (<50 categorias)'],
            ['Tokenização', 'Texto → sequência de IDs inteiros via BPE/WordPiece', 'Qualquer input textual para Transformers e LLMs'],
            ['Embedding lookup', 'ID inteiro → vetor denso de dimensão d (aprendido no treino)', 'Alta cardinalidade (cidades, produtos, usuários)'],
          ]}
        />
        <Callout tone="info">
          Para <strong>LLMs</strong>, feature engineering é quase zero — o Transformer aprende suas próprias representações (embeddings) do zero. Mas para ML clássico (tabular, séries temporais), engenharia de features continua sendo o fator #1 de performance. Competições Kaggle são ganhas por features, não por arquiteturas.
        </Callout>
      </Section>

      <Section title="Perguntas e respostas" accent={accent}>
        <QAItem
          q="Se dados sintéticos são baratos, por que não usar só eles?"
          a={<>Porque dados sintéticos gerados por um modelo herdam os vieses e limitações desse modelo. Se você treinar o modelo B em outputs do modelo A, e depois treinar C em outputs de B, a qualidade degrada a cada geração — isso é <strong>model collapse</strong> (demonstrado por Shumailov et al., 2024). Dados reais servem como &ldquo;âncora de realidade&rdquo;. A melhor estratégia: <strong>misturar</strong> dados reais curados com sintéticos gerados por modelos mais capazes.</>}
        />
        <QAItem
          q="Cross-validation substitui o test set?"
          a={<>Não. Cross-validation (k-fold) substitui o <strong>validation set</strong>: divide o train em k partes, treina em k-1, valida em 1, rotaciona k vezes e faz média. Dá estimativa mais robusta de generalização — especialmente com datasets pequenos onde separar 15% para validation &ldquo;dói&rdquo;. Mas o test set <em>continua reservado</em> como juiz final e deve ser tocado apenas uma vez.</>}
        />
        <QAItem
          q="Quanto dado preciso para treinar um modelo bom?"
          a={<>Depende radicalmente da tarefa e do approach. Regras práticas: (1) fine-tuning de LLM com LoRA: 1k–10k exemplos curados são suficientes; (2) treinamento do zero de NLP: 100k–1M; (3) LLM do zero competitivo: 1–15 trilhões de tokens; (4) imagem com transfer learning de ImageNet: 100–1k por classe. Mais importante que quantidade: <strong>diversidade e qualidade</strong> — um dataset pequeno e limpo frequentemente supera um grande e sujo.</>}
        />
        <QAItem
          q="O que é dataset shift e por que minha performance cai em produção?"
          a={<>Dataset shift acontece quando a distribuição dos dados de produção difere do train. Três tipos: (1) <strong>covariate shift</strong> — distribuição de X muda, mas relação X→Y não; (2) <strong>label shift</strong> — frequência das classes muda; (3) <strong>concept drift</strong> — a própria relação X→Y muda com o tempo. Solução: monitorar distribuição de features em produção, retreinar periodicamente, usar técnicas de domain adaptation.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>O que você aprendeu:</strong> dados de treinamento são a base de toda IA — e qualidade importa mais que quantidade. Você sabe dividir dados em train/val/test sem leakage, identificar e tratar class imbalance, usar augmentation para expandir datasets, e entender o pipeline de dados que alimenta LLMs. Você também conhece os 5 pilares da qualidade (relevância, diversidade, limpeza, balanceamento, atualidade) e como data leakage silenciosamente destrói métricas de produção. No próximo artigo: <strong>como a IA realmente aprende</strong> — loss function, gradiente descendente e backpropagation.
      </Callout>
    </div>
  );
}
