import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  FlowDiagram,
  ArchFlow,
  CodeBlock,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Redes Neurais: o Cérebro Artificial — FFV Academy',
  description: 'Como redes neurais funcionam por dentro: neurônio, forward pass, backpropagation, loss functions, overfitting, regularização e funções de ativação.',
};

const ACCENT = '#58a6ff';

const quiz: QuizQuestion[] = [
  {
    question: 'Durante o backpropagation, o que acontece quando o gradiente de uma camada profunda fica muito pequeno (vanishing gradient)?',
    options: [
      'A rede converge mais rápido porque os pesos mudam menos',
      'As camadas iniciais quase não atualizam seus pesos, efetivamente parando de aprender — o sinal de erro se dissipa antes de chegar lá',
      'O learning rate é automaticamente aumentado pelo otimizador',
      'As camadas iniciais aprendem mais rápido que as finais',
    ],
    correct: 1,
    explanation: 'Vanishing gradient é o fenômeno onde o gradiente encolhe exponencialmente a cada camada durante a chain rule. Camadas próximas da entrada recebem gradientes ínfimos e efetivamente param de treinar. ReLU e skip connections (ResNet) são soluções diretas.',
  },
  {
    question: 'Seu modelo atinge 99% de acurácia no treino mas apenas 72% no conjunto de validação. Qual é o diagnóstico mais provável?',
    options: [
      'Underfitting — o modelo é simples demais e precisa de mais camadas',
      'O dataset de validação está corrompido',
      'Overfitting — o modelo decorou o treino e não generaliza para dados novos',
      'O learning rate está alto demais',
    ],
    correct: 2,
    explanation: 'Gap grande entre acurácia de treino e validação é a assinatura clássica de overfitting. O modelo memorizou ruídos e particularidades do treino. Remédios: dropout, regularização L2, early stopping, mais dados, data augmentation.',
  },
  {
    question: 'Por que ReLU (f(x) = max(0, x)) se tornou a função de ativação padrão substituindo sigmoid?',
    options: [
      'ReLU produz saídas entre 0 e 1, o que normaliza automaticamente',
      'ReLU tem gradiente constante (1) para inputs positivos, evitando vanishing gradient, e é computacionalmente trivial — sigmoid satura em valores extremos e tem gradiente máximo de 0,25',
      'ReLU foi inventada mais recentemente e por isso é melhor',
      'Sigmoid não funciona com GPUs modernas',
    ],
    correct: 1,
    explanation: 'Sigmoid satura para inputs muito negativos ou positivos (gradiente → 0), causando vanishing gradient em redes profundas. ReLU tem gradiente = 1 para todo x > 0 (sem saturação) e é baratíssima de computar (um max). Desvantagem: "dying ReLU" (neurônios que nunca ativam) — Leaky ReLU resolve isso.',
  },
  {
    question: 'Se uma rede tem camada de entrada com 784 neurônios, uma hidden layer de 256 e saída de 10, quantos pesos (sem contar biases) existem?',
    options: [
      '784 + 256 + 10 = 1.050',
      '784 × 256 + 256 × 10 = 203.264',
      '784 × 10 = 7.840',
      '256 × 256 = 65.536',
    ],
    correct: 1,
    explanation: 'Cada neurônio de uma camada se conecta a todos da próxima (fully connected). Input→Hidden: 784×256 = 200.704 pesos. Hidden→Output: 256×10 = 2.560 pesos. Total: 203.264 pesos (+ 266 biases). Um modelo "pequeno" já tem 200k parâmetros.',
  },
];

export default function RedesNeuraisPage() {
  return (
    <ModuleLayout
      slug="redes-neurais"
      title="Redes Neurais: o Cérebro Artificial"
      icon="🕸️"
      xp={50}
      readTime={10}
      trailName="Fundamentos da IA"
      trailColor={ACCENT}
      nextSlug="o-que-e-llm"
      nextTitle="O que é um LLM?"
      quiz={quiz}
      seoDesc="Como redes neurais funcionam por dentro: neurônio, forward pass, backpropagation, loss functions, overfitting, regularização e funções de ativação."
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Redes neurais são inspiradas (vagamente) no cérebro humano. Mas não se deixe enganar pela analogia — o que realmente
        importa é a <strong>matemática por trás</strong>. Um neurônio artificial é uma função: recebe números, multiplica por pesos,
        soma e passa por uma não-linearidade. Empilhe milhões desses e você tem o sistema que reconhece rostos, traduz idiomas e gera
        texto. Neste módulo, vamos <em>abrir</em> essa caixa preta: do neurônio individual até backpropagation, loss functions,
        overfitting e as técnicas de regularização que fazem tudo funcionar.
      </p>

      <Section title="O neurônio artificial, de verdade" accent={ACCENT}>
        <FlowDiagram
          title="Anatomia de um neurônio (perceptron)"
          accent={ACCENT}
          steps={[
            { icon: '📥', label: 'Entradas', desc: 'x₁, x₂, x₃ (valores numéricos)' },
            { icon: '✖️', label: 'Pesos × Soma', desc: 'z = w₁x₁ + w₂x₂ + w₃x₃ + b' },
            { icon: '⚡', label: 'Ativação f(z)', desc: 'ReLU, sigmoid, tanh — introduz não-linearidade' },
            { icon: '📤', label: 'Saída a', desc: 'Valor propagado para próxima camada' },
          ]}
        />
        <p>
          <strong>Pesos</strong> (<InlineCode>w</InlineCode>) são os números que o modelo aprende durante o treino. <strong>Bias</strong> (<InlineCode>b</InlineCode>)
          é um deslocamento que permite ao neurônio ativar mesmo quando todas as entradas são zero. A <strong>função de ativação</strong> (<InlineCode>f</InlineCode>)
          introduz não-linearidade — sem ela, empilhar 100 camadas seria o mesmo que ter uma só (composição de lineares é linear).
        </p>
      </Section>

      <Section title="Arquitetura: camadas empilhadas" accent={ACCENT}>
        <ArchFlow
          title="Rede fully-connected (MLP) — classificação de imagens"
          accent={ACCENT}
          columns={[
            {
              header: 'INPUT LAYER',
              headerColor: ACCENT,
              items: ['784 neurônios', 'Um por pixel (28×28)', 'Dados brutos: 0–255'],
              footer: 'dados brutos',
            },
            {
              header: 'HIDDEN LAYERS',
              headerColor: 'var(--ffv-purple)',
              items: ['Camada 1: bordas, texturas', 'Camada 2: partes (olho, orelha)', 'Camada N: conceitos abstratos', 'Cada camada: matmul + ativação'],
              footer: 'aprendem padrões',
            },
            {
              header: 'OUTPUT LAYER',
              headerColor: 'var(--ffv-green)',
              items: ['10 neurônios (classes)', 'Softmax → probabilidades', '"gato" 87% · "cachorro" 9%'],
              footer: 'predição final',
              useCases: ['gato', 'cachorro', 'pássaro', '...'],
            },
          ]}
        />
        <p>
          A <strong>profundidade</strong> (número de hidden layers) dá nome ao <em>deep learning</em>. Camadas iniciais aprendem
          features simples (bordas, texturas); camadas profundas compõem essas features em representações abstratas (rostos, objetos, conceitos).
          Cada camada faz a mesma coisa: multiplicação matricial + bias + ativação.
        </p>
        <Callout tone="info">
          <strong>Universal Approximation Theorem:</strong> uma rede com uma única hidden layer e neurônios suficientes pode
          aproximar <em>qualquer</em> função contínua. Na prática, redes mais profundas (deep) são mais eficientes: aprendem
          as mesmas funções com <strong>menos parâmetros</strong> do que redes rasas e largas.
        </Callout>
      </Section>

      <Section title="Forward pass e loss function" accent={ACCENT}>
        <p>
          O <strong>forward pass</strong> é simplesmente passar os dados pela rede da entrada até a saída, camada por camada.
          O resultado é uma previsão. A <strong>loss function</strong> mede quão longe essa previsão está do valor correto:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Loss Function', 'Quando usar', 'Fórmula (intuição)']}
          rows={[
            ['MSE (Mean Squared Error)', 'Regressão (prever um número)', 'Média de (predição - real)². Penaliza erros grandes mais que pequenos.'],
            ['Cross-Entropy', 'Classificação (prever uma classe)', '-Σ(y_real × log(y_pred)). Se a rede diz 90% gato e era gato, loss baixa. Se diz 10%, loss altíssima.'],
            ['Binary Cross-Entropy', 'Classificação binária (sim/não)', 'Caso especial da cross-entropy com 2 classes.'],
          ]}
        />
        <p>
          A loss é o <strong>único número</strong> que a rede tenta minimizar. Tudo que o modelo "aprende" durante o treino é
          ajustar os pesos para reduzir essa loss. A escolha da loss function errada pode fazer o modelo convergir para algo inútil.
        </p>
      </Section>

      <Section title="Backpropagation: como o modelo aprende" accent={ACCENT}>
        <p>
          Backpropagation é o algoritmo que calcula <strong>quanto cada peso contribuiu para o erro</strong> e em que direção
          ajustá-lo. Funciona em 3 passos:
        </p>
        <FlowDiagram
          title="Backpropagation — 3 passos"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '→', label: '1. Forward Pass', desc: 'Dados → Camada 1 → Camada 2 → ... → Saída → Loss calculada' },
            { icon: '←', label: '2. Backward Pass (chain rule)', desc: 'Loss → ∂L/∂w_saída → ∂L/∂w_cam2 → ... → ∂L/∂w_cam1 — gradientes propagados para trás' },
            { icon: '⟳', label: '3. Atualização de pesos', desc: 'w_novo = w_antigo − learning_rate × gradiente — todos os pesos ajustados' },
          ]}
        />
        <p>
          A <strong>chain rule</strong> do cálculo é o coração: o gradiente de cada camada depende do gradiente da camada seguinte,
          multiplicado pelas derivadas locais. Assim o erro se propaga da saída até a entrada — cada peso sabe exatamente quanto
          e em que direção se mover.
        </p>
        <Callout tone="warn">
          <strong>Vanishing gradient:</strong> em redes muito profundas com sigmoid/tanh, os gradientes são multiplicados por valores {'< 1'} em
          cada camada, encolhendo exponencialmente. Camadas iniciais mal treinam. Soluções: ReLU, skip connections (ResNet), batch
          normalization.
        </Callout>
      </Section>

      <Section title="Learning rate: o passo do aprendizado" accent={ACCENT}>
        <ArchFlow
          title="Efeito do learning rate na convergência"
          accent={ACCENT}
          columns={[
            {
              header: 'LR MUITO ALTO',
              headerColor: 'var(--ffv-red)',
              items: ['Oscila ao redor do mínimo', 'Pode divergir (loss sobe)', 'Passo tão grande que ultrapassa', 'Ex: lr = 1.0'],
              footer: '❌ não converge',
            },
            {
              header: 'LR IDEAL',
              headerColor: 'var(--ffv-green)',
              items: ['Converge suavemente', 'Diminui gradualmente', 'Atinge mínimo com estabilidade', 'Ex: lr = 0.001'],
              footer: '✅ converge bem',
            },
            {
              header: 'LR MUITO BAIXO',
              headerColor: 'var(--ffv-muted)',
              items: ['Converge, mas muito devagar', 'Pode precisar de 10x mais épocas', 'Não prático em produção', 'Ex: lr = 0.00001'],
              footer: '⚠️ lento demais',
            },
          ]}
        />
        <p>
          O <strong>learning rate</strong> (<InlineCode>lr</InlineCode>) controla o tamanho do passo em cada atualização.
          <InlineCode>lr = 0.001</InlineCode> é um ponto de partida comum. Alto demais: o treino oscila e diverge. Baixo demais:
          converge tão devagar que parece não aprender. Otimizadores modernos (Adam, AdamW) adaptam o learning rate por parâmetro,
          mas o valor inicial ainda importa muito.
        </p>
      </Section>

      <Section title="Funções de ativação comparadas" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ativação', 'Fórmula', 'Range', 'Gradiente', 'Quando usar']}
          rows={[
            ['Sigmoid', '1 / (1 + e^(-x))', '(0, 1)', 'Máx 0.25 — satura', 'Saída binária (probabilidade)'],
            ['Tanh', '(e^x - e^(-x)) / (e^x + e^(-x))', '(-1, 1)', 'Máx 1.0 — satura', 'Saída centrada em zero (raro hoje)'],
            ['ReLU', 'max(0, x)', '[0, ∞)', '0 ou 1 — sem saturação', 'Default para hidden layers ✅'],
            ['Leaky ReLU', 'max(0.01x, x)', '(-∞, ∞)', '0.01 ou 1', 'Quando dying ReLU é problema'],
            ['GELU', 'x × Φ(x)', '(-∞, ∞)', 'Suave', 'Transformers (GPT, BERT)'],
            ['Softmax', 'e^xᵢ / Σe^xⱼ', '(0, 1) soma=1', '—', 'Última camada de classificação multi-classe'],
          ]}
        />
        <Callout tone="info">
          <strong>Regra prática:</strong> use ReLU nas hidden layers (ou GELU se estiver em Transformers). Use sigmoid na saída de
          classificação binária. Use softmax na saída multi-classe. Nunca use sigmoid em hidden layers profundas.
        </Callout>
      </Section>

      <Section title="Skip connections: o segredo das redes profundas" accent={ACCENT}>
        <p>
          Redes muito profundas (100+ camadas) sofriam com um problema fundamental: o gradiente desaparecia antes de chegar
          às camadas iniciais (vanishing gradient), e as camadas extras não ajudavam — ou até pioravam o desempenho.
          A <strong>ResNet</strong> (2015) resolveu isso com uma ideia elegante: <em>skip connections</em> (ou residual connections).
        </p>
        <FlowDiagram
          title="Residual block — a ideia central da ResNet"
          orientation="vertical"
          accent={ACCENT}
          steps={[
            { icon: '📥', label: 'Input x', desc: 'Dado de entrada do bloco' },
            { icon: '⚙️', label: 'Camadas normais: Conv → BN → ReLU → Conv', desc: 'Aprende a transformação F(x)' },
            { icon: '➕', label: 'Soma: F(x) + x (skip connection)', desc: 'O input original é somado à saída das camadas' },
            { icon: '📤', label: 'Saída: H(x) = F(x) + x', desc: 'O bloco aprende o resíduo, não a transformação completa' },
          ]}
        />
        <p>
          A insight: em vez do bloco aprender a transformação completa <InlineCode>H(x)</InlineCode>, ele aprende apenas o
          <strong> resíduo</strong> <InlineCode>F(x) = H(x) - x</InlineCode>. Se o bloco não for necessário,
          <InlineCode>F(x) → 0</InlineCode> e a rede simplesmente passa o input adiante (identidade).
          Com isso, o gradiente tem um caminho direto da saída até as camadas iniciais — sem multiplicações que o encolhem.
        </p>
        <Callout tone="info">
          Skip connections são a razão pela qual LLMs funcionam com 96+ camadas. Sem elas, GPT-4 não existiria. Toda arquitetura
          Transformer moderna usa residual connections em cada bloco de atenção e feed-forward.
        </Callout>
      </Section>

      <Section title="Normalização: BatchNorm vs LayerNorm" accent={ACCENT}>
        <p>
          Durante o treino, as distribuições das ativações mudam a cada batch (covariate shift interno). Isso instabiliza
          o treino e exige learning rates menores. <strong>Normalização</strong> resolve: padroniza as ativações para
          média≈0, desvio≈1 em um determinado eixo.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['', 'Batch Normalization (BN)', 'Layer Normalization (LN)']}
          rows={[
            ['Normaliza ao longo de', 'Dimensão do batch (ex: 32 exemplos)', 'Dimensão das features (dentro de 1 exemplo)'],
            ['Funciona bem com', 'Batch grande (CNNs, redes densas)', 'Batch pequeno ou tamanho variável (Transformers, NLP)'],
            ['Durante inferência', 'Usa estatísticas do treino (rolling mean/var)', 'Sem diferença — só usa o exemplo atual'],
            ['Usado em', 'ResNet, VGG, MobileNet', 'GPT, BERT, LLaMA, toda arquitetura Transformer'],
            ['Problema com', 'Batch size 1 ou sequências variáveis', 'Menos eficaz com features altamente correlacionadas'],
          ]}
        />
        <Callout tone="warn">
          Se você está construindo ou fine-tunando um Transformer (LLM, BERT, etc.), vai ver LayerNorm em todo lugar —
          geralmente <em>antes</em> de cada sub-camada (pre-norm), não depois. GPT-2 e versões mais antigas usam post-norm;
          LLaMA e modelos modernos usam pre-norm (mais estável).
        </Callout>
      </Section>

      <Section title="Overfitting: o inimigo número 1" accent={ACCENT}>
        <p>
          <strong>Overfitting</strong> é quando o modelo decora o dataset de treino — incluindo o ruído — e perde a capacidade
          de generalizar para dados novos. É a diferença entre um estudante que entende a matéria e um que decora as respostas
          da prova anterior.
        </p>
        <ArchFlow
          title="Train loss vs Validation loss — diagnóstico de overfitting"
          accent={ACCENT}
          columns={[
            {
              header: 'TREINO NORMAL',
              headerColor: 'var(--ffv-green)',
              items: ['Train loss: cai consistentemente', 'Val loss: cai junto com train', 'Gap pequeno entre as duas', 'Modelo generaliza bem'],
              footer: '✅ sem overfitting',
              useCases: ['Continuar treinando', 'Resultado confiável'],
            },
            {
              header: 'OVERFITTING',
              headerColor: 'var(--ffv-red)',
              items: ['Train loss: continua caindo', 'Val loss: começa a SUBIR', 'Gap cresce = memorização', 'Early stopping aqui!'],
              footer: '❌ parar o treino',
              useCases: ['Dropout', 'L2 regularização', 'Mais dados'],
            },
          ]}
        />
        <p>
          <strong>Diagnóstico:</strong> loss de treino cai mas loss de validação sobe (ou estagna). <strong>Soluções:</strong>
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Como funciona', 'Quando usar']}
          rows={[
            ['Dropout', 'Desativa aleatoriamente X% dos neurônios em cada batch de treino — força redundância', 'Default em redes densas (p=0.2–0.5)'],
            ['Regularização L2 (weight decay)', 'Adiciona penalidade λ×Σw² à loss — pesos grandes são punidos', 'Quase sempre, especialmente AdamW'],
            ['Regularização L1', 'Adiciona λ×Σ|w| — empurra pesos pra zero (sparsity)', 'Quando quer feature selection automática'],
            ['Early stopping', 'Para o treino quando validation loss começa a subir', 'Sempre — é grátis'],
            ['Data augmentation', 'Gera variações artificiais dos dados (rotação, flip, crop)', 'Quando tem poucos dados'],
            ['Batch normalization', 'Normaliza ativações entre camadas — estabiliza treino', 'Redes convolucionais, redes profundas'],
          ]}
        />
      </Section>

      <Section title="Train, Validation e Test: os 3 conjuntos" accent={ACCENT}>
        <ArchFlow
          title="Divisão do dataset — 100.000 exemplos"
          accent={ACCENT}
          columns={[
            {
              header: 'TRAIN (70–80%)',
              headerColor: ACCENT,
              items: ['70–80k exemplos', 'Treina os pesos (backprop)', 'Usado em cada época', 'Modelo vê repetidamente'],
              footer: 'usado toda época',
            },
            {
              header: 'VALIDATION (10–15%)',
              headerColor: 'var(--ffv-orange)',
              items: ['10–15k exemplos', 'Ajusta hiperparâmetros', 'Early stopping', 'Avalia generalização'],
              footer: 'monitoramento',
            },
            {
              header: 'TEST (10–15%)',
              headerColor: 'var(--ffv-green)',
              items: ['10–15k exemplos', 'Resultado final do modelo', 'Não tocar durante treino!', 'Avalia uma única vez'],
              footer: '⚠️ usado UMA vez',
            },
          ]}
        />
        <p>
          <strong>Nunca</strong> use o test set pra tomar decisões durante o treino. Se fizer isso, está implicitamente overfittando
          no test — e o número final não vale nada. O validation set existe exatamente pra isso: tomar decisões (learning rate,
          quando parar, qual modelo é melhor) sem contaminar a avaliação final.
        </p>
      </Section>

      <Section title="Parâmetros vs hiperparâmetros" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['', 'Parâmetros', 'Hiperparâmetros']}
          rows={[
            ['O que são', 'Pesos e biases da rede', 'Learning rate, batch size, dropout rate, nº de camadas'],
            ['Quem define', 'O treino (backprop)', 'Você (humano ou search automático)'],
            ['Quantidade', 'Milhões a trilhões', 'Dezenas'],
            ['Exemplos', 'w₁, w₂, b₁, b₂', 'lr=0.001, dropout=0.3, epochs=100, batch=32'],
          ]}
        />
      </Section>

      <Section title="Tipos de rede neural" accent={ACCENT}>
        <DecisionBox
          scenario="Classificar imagens (gato, cachorro, carro)"
          winner="CNN (Convolutional Neural Network)"
          winnerColor={ACCENT}
          why="CNNs têm camadas convolucionais que detectam padrões espaciais (bordas, texturas, formas) sem precisar de cada pixel como input independente. Muito mais eficiente que MLP para imagens."
          alternatives={[{ name: 'MLP (fully connected)', note: 'funciona mas é extremamente ineficiente — trata cada pixel como feature independente, ignora vizinhança.' }]}
        />
        <DecisionBox
          scenario="Prever próxima palavra em uma sequência"
          winner="Transformer (atenção)"
          winnerColor={ACCENT}
          why="Transformers processam toda a sequência em paralelo com mecanismo de atenção — superam RNNs em escala e qualidade. São a base de todos os LLMs."
          alternatives={[{ name: 'RNN/LSTM', note: 'processa sequencialmente (lento), sofre com vanishing gradient em sequências longas.' }]}
        />
      </Section>

      <Section title="Na prática: treino em Python" accent={ACCENT}>
        <CodeBlock lang="python">{`import torch
import torch.nn as nn

# Rede simples: 784 inputs → 256 hidden → 10 classes
model = nn.Sequential(
    nn.Linear(784, 256),   # camada 1: 784×256 + 256 = 200.960 params
    nn.ReLU(),             # ativação
    nn.Dropout(0.3),       # regularização: desliga 30% por batch
    nn.Linear(256, 10),    # camada de saída: 256×10 + 10 = 2.570 params
)

loss_fn = nn.CrossEntropyLoss()   # loss pra classificação
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# 1 epoch de treino
for images, labels in train_loader:
    pred = model(images)           # forward pass
    loss = loss_fn(pred, labels)   # calcula loss
    loss.backward()                # backpropagation (calcula gradientes)
    optimizer.step()               # atualiza pesos
    optimizer.zero_grad()          # limpa gradientes pro próximo batch`}</CodeBlock>
        <p>
          São 14 linhas. É isso que acontece debaixo de todo framework de ML. <InlineCode>loss.backward()</InlineCode> é o
          backpropagation. <InlineCode>optimizer.step()</InlineCode> é <InlineCode>w = w - lr × grad</InlineCode>.
        </p>
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Mais camadas é sempre melhor?"
          a="Não. Mais camadas aumentam capacidade mas também risco de overfitting e custo de treino. ResNets com 152 camadas funcionam, mas 1000 camadas sem skip connections não treinam. A profundidade certa depende do problema — imagens complexas precisam de mais camadas que classificação tabular."
        />
        <QAItem
          q="Batch normalization e dropout podem ser usados juntos?"
          a="Podem, mas com cuidado. BatchNorm normaliza ativações; dropout desativa neurônios aleatoriamente — as estatísticas de BatchNorm ficam instáveis com dropout alto. Na prática: BatchNorm + dropout baixo (0.1-0.2) funciona. Em Transformers, usa-se LayerNorm sem dropout nas camadas de atenção."
        />
        <QAItem
          q="Qual a diferença entre epoch, batch e iteration?"
          a={<>
            <strong>Epoch:</strong> uma passada completa pelo dataset inteiro. <strong>Batch:</strong> subconjunto de dados processados
            juntos (ex: 32 imagens). <strong>Iteration:</strong> um forward + backward pass em um batch. Se tem 10.000 imagens e
            batch=100, são 100 iterations por epoch.
          </>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> (1) Um neurônio = soma ponderada + ativação. (2) Backpropagation propaga o erro da saída
        à entrada via chain rule. (3) A loss function define o que o modelo otimiza — escolha errada, resultado errado.
        (4) Overfitting é o inimigo #1 — dropout, regularização L2, early stopping e data augmentation são suas armas.
        (5) ReLU é o default em hidden layers; sigmoid/softmax só na saída. No próximo módulo: como tudo isso resultou nos LLMs.
      </Callout>
    </div>
  );
}
