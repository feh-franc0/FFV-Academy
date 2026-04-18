import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section, Callout, ComparisonTable, DecisionBox,
  QAItem, StackFlow, CodeBlock, FlowDiagram, ArchFlow, ComparisonFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('como-ia-aprende');

const accent = '#58a6ff';

const quiz: QuizQuestion[] = [
  {
    question: 'O gradiente descendente atualiza pesos com: w = w - lr × gradiente. Se a learning rate for muito grande, o que acontece?',
    options: [
      'O modelo converge mais rápido e atinge loss zero',
      'Os pesos oscilam em volta do mínimo ou divergem — a loss cresce em vez de diminuir',
      'O modelo ignora o gradiente e mantém os pesos iniciais',
      'O treinamento fica mais lento mas sempre converge para o mínimo global',
    ],
    correct: 1,
    explanation: 'Learning rate grande faz o modelo "pular" o mínimo. Em casos extremos, os pesos divergem: a loss explode em vez de diminuir. Por isso otimizadores adaptativos como Adam ajustam a lr por parâmetro.',
  },
  {
    question: 'Qual a diferença fundamental entre aprendizado supervisionado e não-supervisionado?',
    options: [
      'Supervisionado usa mais dados; não-supervisionado usa menos',
      'Supervisionado treina com pares (input, label correto); não-supervisionado descobre estrutura nos dados sem labels',
      'Supervisionado é mais preciso; não-supervisionado é sempre inferior',
      'Supervisionado roda em GPUs; não-supervisionado roda em CPUs',
    ],
    correct: 1,
    explanation: 'A diferença é a presença de labels (respostas corretas). Supervisionado: imagem→"gato", preço→valor. Não-supervisionado: encontra clusters, padrões, representações sem ninguém dizer o que é certo.',
  },
  {
    question: 'Por que usamos mini-batches em vez de calcular o gradiente no dataset inteiro (batch gradient descent)?',
    options: [
      'Mini-batches são matematicamente mais precisos que o gradiente exato',
      'O gradiente no dataset inteiro não converge — só mini-batches convergem',
      'Mini-batches cabem na memória da GPU, introduzem ruído que ajuda a escapar mínimos locais, e permitem atualizar pesos mais vezes por época',
      'Mini-batches são usados apenas por questão de velocidade — o resultado final é idêntico',
    ],
    correct: 2,
    explanation: 'Três razões: (1) memória — 1M exemplos não cabem na GPU de uma vez; (2) o ruído estocástico do mini-batch ajuda a escapar mínimos locais rasos; (3) mais atualizações por época = convergência mais rápida na prática.',
  },
  {
    question: 'O que o otimizador Adam faz que SGD puro não faz?',
    options: [
      'Adam calcula gradientes de segunda ordem (Hessiana completa) para convergência mais rápida',
      'Adam mantém médias móveis do gradiente (momento) e do gradiente ao quadrado, adaptando a learning rate individualmente para cada parâmetro',
      'Adam elimina a necessidade de learning rate — o valor é sempre 1.0',
      'Adam impede overfitting automaticamente adicionando regularização L2',
    ],
    correct: 1,
    explanation: 'Adam combina momentum (média móvel do gradiente, para suavizar oscilações) com RMSProp (média móvel do gradiente², para normalizar a escala). Resultado: lr adaptativa por parâmetro, convergência mais estável que SGD em quase todos os cenários.',
  },
];

export default function ComoIaAprendePage() {
  return (
    <ModuleLayout
      slug="como-ia-aprende"
      title="Como a IA Aprende (Machine Learning)"
      icon="📈"
      xp={40}
      readTime={8}
      trailName="Fundamentos da IA"
      trailColor={accent}
      nextSlug="redes-neurais"
      nextTitle="Redes Neurais"
      seoDesc="Supervisionado, não-supervisionado e RL. Gradiente descendente, loss function, backpropagation e otimizadores."
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
        Machine Learning não é mágica — é <strong>matemática iterativa</strong>. O modelo começa chutando (pesos aleatórios), mede o quanto errou (loss function), calcula como ajustar cada peso (backpropagation), ajusta (gradiente descendente) e repete. Bilhões de vezes. Neste artigo, você vai entender cada peça desse ciclo e por que ele funciona.
      </p>

      <Section title="Os três paradigmas de aprendizado" accent={accent}>
        <p>
          Antes de entrar em como o modelo treina, é preciso entender <em>que tipo de problema</em> ele resolve. Existem três paradigmas fundamentais:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Paradigma', 'Dados de treino', 'O que aprende', 'Exemplos reais']}
          rows={[
            ['Supervisionado', 'Pares (input, label correto)', 'Mapear input → output correto', 'Classificação de imagem, previsão de preço, diagnóstico médico, tradução'],
            ['Não-supervisionado', 'Dados sem labels', 'Estrutura, clusters, representações', 'Clustering de clientes, redução de dimensão, detecção de anomalias, autoencoders'],
            ['Reinforcement Learning', 'Ambiente + recompensas', 'Política: sequência de ações que maximiza recompensa', 'AlphaGo, robótica, RLHF em LLMs, jogos Atari'],
          ]}
        />
        <Callout tone="info">
          LLMs como GPT e Claude usam <strong>os três</strong>: pré-treino é não-supervisionado (prever próximo token), fine-tuning é supervisionado (pares pergunta/resposta), e RLHF é reinforcement learning (recompensa por respostas úteis e seguras).
        </Callout>
      </Section>

      <Section title="Loss function: medindo o erro" accent={accent}>
        <p>
          Para aprender, o modelo precisa de uma <strong>métrica numérica de quão errado está</strong>. Essa métrica é a loss function (função de perda). Objetivo: minimizá-la.
        </p>
        <ArchFlow
          title="Loss functions comuns"
          accent={accent}
          columns={[
            {
              header: 'REGRESSÃO',
              headerColor: 'var(--ffv-blue)',
              items: [
                'Prever valores contínuos',
                'MSE = (1/n) Σ (yᵢ - ŷᵢ)²',
                'Previsão: 0.3 · Real: 1.0',
                'MSE = (1.0 - 0.3)² = 0.49',
              ],
              footer: 'Penaliza erros grandes exponencialmente',
            },
            {
              header: 'CLASSIFICAÇÃO',
              headerColor: 'var(--ffv-purple)',
              items: [
                'Prever categorias discretas',
                'Cross-Entropy = -Σ yᵢ·log(ŷᵢ)',
                'Pred [0.1, 0.7, 0.2] → loss 0.36',
                'Pred [0.01, 0.98, 0.01] → loss 0.02',
              ],
              footer: 'Quanto mais confiante e certo, menor a loss',
            },
            {
              header: 'LLMs',
              headerColor: 'var(--ffv-orange)',
              items: [
                'Prever próximo token',
                'Cross-Entropy sobre ~100k tokens',
                'Para cada posição: -log P(token correto)',
                'GPT-3 final: loss ≈ 1.7 (perplexidade ≈ 5.5)',
              ],
              footer: 'Dataset: internet inteira, sem labels humanos',
            },
          ]}
        />
        <p>
          A loss é um <strong>número único</strong> que resume o desempenho do modelo em um batch. Todo o treinamento se resume a: <em>ajustar pesos para diminuir esse número</em>.
        </p>
      </Section>

      <Section title="Gradiente descendente: encontrando o mínimo" accent={accent}>
        <p>
          Imagine a loss function como uma paisagem montanhosa. Cada peso do modelo é uma dimensão. O modelo está em algum ponto dessa paisagem e quer chegar ao vale (mínimo da loss). Ele não enxerga a paisagem toda — só sente a inclinação onde está.
        </p>
        <FlowDiagram
          title="Gradiente descendente — um passo de treino"
          orientation="vertical"
          accent={accent}
          steps={[
            { icon: '🎲', label: 'Pesos aleatórios', desc: 'Ponto inicial na paisagem de loss (alta, longe do mínimo)' },
            { icon: '📐', label: 'Calcular gradiente ∂Loss/∂w', desc: 'Direção de maior subida da loss (via backprop)' },
            { icon: '⬇️', label: 'Dar passo na direção oposta', desc: 'w_novo = w_atual − lr × gradiente' },
            { icon: '🔁', label: 'Repetir por N iterações', desc: 'Cada passo reduz a loss — convergência rumo ao mínimo' },
            { icon: '🎯', label: 'Mínimo (ou mínimo local)', desc: 'Gradiente ≈ 0: atualização quase nula, treino parou de progredir' },
          ]}
        />
        <p>
          O <strong>gradiente</strong> (∂Loss/∂w) é a derivada parcial da loss em relação a cada peso. Ele aponta na direção de <em>aumento</em> da loss. Movemos na direção <em>oposta</em> (por isso o sinal negativo).
        </p>
      </Section>

      <Section title="Learning rate: o hiperparâmetro mais importante" accent={accent}>
        <p>
          A learning rate (lr) controla o tamanho do passo. É o hiperparâmetro mais impactante do treinamento:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Learning Rate', 'Comportamento', 'Resultado']}
          rows={[
            ['Muito grande (ex: 0.1)', 'Pesos oscilam violentamente, loss sobe e desce', 'Divergência — modelo não aprende'],
            ['Grande (ex: 0.01)', 'Converge rápido no início, mas instável perto do mínimo', 'Pode funcionar com lr decay'],
            ['Ideal (ex: 3e-4)', 'Converge de forma suave e estável', 'O sweet spot — achar esse valor é arte + ciência'],
            ['Muito pequena (ex: 1e-6)', 'Convergência extremamente lenta', 'Desperdiça compute; pode ficar preso em mínimo local'],
          ]}
        />
        <Callout tone="warn">
          Na prática, a learning rate <strong>não é fixa</strong>. Usamos <em>schedulers</em>: warmup (começa pequena, sobe), cosine decay (desce suavemente), step decay (corta a cada N épocas). LLMs modernos usam warmup + cosine decay quase universalmente.
        </Callout>
      </Section>

      <Section title="Backpropagation: como calcular bilhões de gradientes" accent={accent}>
        <p>
          Um modelo com 7 bilhões de parâmetros precisa de 7 bilhões de gradientes <em>a cada passo</em>. Calcular cada um individualmente seria inviável. <strong>Backpropagation</strong> resolve isso usando a <strong>regra da cadeia</strong> do cálculo.
        </p>
        <StackFlow
          title="Forward Pass + Backward Pass"
          accent={accent}
          items={[
            {
              icon: '→',
              label: 'Forward Pass',
              sub: 'calcular predição',
              detail: 'Input passa por cada camada sequencialmente. Cada camada aplica pesos + ativação. No final, temos a predição e a loss.',
              connector: 'LOSS CALCULADA',
            },
            {
              icon: '←',
              label: 'Backward Pass (backprop)',
              sub: 'calcular gradientes',
              detail: 'O erro (loss) é propagado de trás para frente. Regra da cadeia: ∂Loss/∂w₁ = ∂Loss/∂out × ∂out/∂hidden × ∂hidden/∂w₁. Cada camada recebe o gradiente da próxima e calcula o seu.',
              connector: 'GRADIENTES PRONTOS',
            },
            {
              icon: '🔧',
              label: 'Atualização de pesos',
              sub: 'otimizador',
              detail: 'O otimizador (SGD, Adam, AdamW) usa os gradientes para atualizar cada peso: w = w - lr × gradiente. Pesos novos → próximo forward pass.',
            },
          ]}
        />
        <ArchFlow
          title="Regra da cadeia — rede de 3 camadas"
          accent={accent}
          columns={[
            {
              header: 'FORWARD PASS',
              headerColor: 'var(--ffv-green)',
              items: [
                'x → [W₁] → h₁',
                'h₁ → [W₂] → h₂',
                'h₂ → [W₃] → ŷ',
                'ŷ → Loss calculada',
              ],
              footer: 'Cada camada grava saída intermediária',
            },
            {
              header: 'BACKWARD PASS',
              headerColor: 'var(--ffv-orange)',
              items: [
                '∂Loss/∂W₃ = ∂Loss/∂ŷ × ∂ŷ/∂W₃',
                '∂Loss/∂W₂ = … × ∂h₂/∂W₂',
                '∂Loss/∂W₁ = … × ∂h₁/∂W₁',
                'Reutiliza gradientes já computados',
              ],
              footer: 'Custo O(n) — não O(n²)',
            },
            {
              header: 'POR QUÊ É EFICIENTE',
              headerColor: 'var(--ffv-blue)',
              items: [
                'Cada gradiente calculado 1× apenas',
                'Armazenado e reutilizado pelas camadas anteriores',
                '7B params = 7B gradientes em O(7B) ops',
                'Sem backprop: O(49B²) — inviável',
              ],
              footer: 'A regra da cadeia é o que torna DL possível',
            },
          ]}
        />
      </Section>

      <Section title="Épocas, batches e iterações" accent={accent}>
        <p>
          O treinamento não processa todos os dados de uma vez. Três conceitos definem a granularidade:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Conceito', 'Definição', 'Exemplo (100k amostras, batch 256)']}
          rows={[
            ['Iteração', '1 forward + backward + update em 1 mini-batch', '1 iteração = 256 amostras processadas'],
            ['Época', '1 passagem completa pelo dataset inteiro', '100k / 256 ≈ 390 iterações = 1 época'],
            ['Mini-batch', 'Subconjunto dos dados processado de uma vez', 'Tamanhos comuns: 32, 64, 128, 256, 512'],
          ]}
        />
        <ArchFlow
          title="Batch GD vs Mini-Batch GD vs SGD"
          accent={accent}
          columns={[
            {
              header: 'BATCH GD',
              headerColor: 'var(--ffv-red)',
              items: [
                'Processa 100k exemplos de uma vez',
                '→ 1 atualização por época',
                '✓ Gradiente matematicamente preciso',
                '✗ Não cabe na VRAM da GPU',
                '✗ Convergência lenta (poucas updates)',
              ],
              footer: 'Inviável em datasets reais',
            },
            {
              header: 'MINI-BATCH GD ← PADRÃO',
              headerColor: 'var(--ffv-green)',
              items: [
                'batch_size = 32-512 exemplos',
                '→ ~390 atualizações por época',
                '✓ Cabe na VRAM da GPU',
                '✓ Ruído ajuda a escapar mínimos rasos',
                '✓ Melhor trade-off velocidade/precisão',
              ],
              footer: 'PyTorch/JAX/TF: default em 95% dos casos',
            },
            {
              header: 'SGD ESTOCÁSTICO',
              headerColor: 'var(--ffv-muted)',
              items: [
                'batch_size = 1 exemplo',
                '→ 100k atualizações por época',
                '✓ Atualiza com frequência máxima',
                '✗ Gradiente extremamente ruidoso',
                '✗ Não usa paralelismo da GPU',
              ],
              footer: 'Raramente usado em produção moderna',
            },
          ]}
        />
      </Section>

      <Section title="Otimizadores: além do SGD" accent={accent}>
        <p>
          SGD (Stochastic Gradient Descent) é o algoritmo base, mas tem limitações: a mesma learning rate para todos os parâmetros, sem memória de gradientes anteriores. Otimizadores modernos resolvem isso:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Otimizador', 'Ideia central', 'Usado em']}
          rows={[
            ['SGD', 'w = w - lr × g. Simples, sem estado.', 'Baseline, CNNs com fine-tuning'],
            ['SGD + Momentum', 'Mantém velocidade (média móvel do gradiente). Suaviza oscilações.', 'CNNs, ResNets'],
            ['RMSProp', 'Divide lr pela média móvel de g². Normaliza a escala por parâmetro.', 'RNNs (historicamente)'],
            ['Adam', 'Combina Momentum + RMSProp. lr adaptativa por parâmetro.', 'Default na maioria dos cenários'],
            ['AdamW', 'Adam + weight decay desacoplado. Regularização mais correta.', 'LLMs (GPT, LLaMA, Claude)'],
          ]}
        />
        <CodeBlock lang="python">
{`# Adam em pseudocódigo:
# m = média móvel do gradiente (momento)
# v = média móvel do gradiente² (variância)
# beta1=0.9, beta2=0.999, eps=1e-8

m = beta1 * m + (1 - beta1) * g          # atualiza momento
v = beta2 * v + (1 - beta2) * g**2       # atualiza variância
m_hat = m / (1 - beta1**t)          # correção de bias
v_hat = v / (1 - beta2**t)          # correção de bias
w = w - lr * m_hat / (sqrt(v_hat) + eps)  # atualiza peso

# Intuição: parâmetros com gradientes grandes e consistentes
# recebem steps menores. Parâmetros com gradientes pequenos
# recebem steps proporcionalmente maiores.`}
        </CodeBlock>
        <DecisionBox
          scenario="Qual otimizador usar?"
          winner="AdamW"
          winnerColor={accent}
          why="Default seguro para 90% dos casos. lr=3e-4 com warmup + cosine decay é o ponto de partida mais testado. Todos os LLMs modernos usam AdamW."
          alternatives={[
            { name: 'SGD + Momentum', note: 'Quando você tem compute sobrando e quer explorar a paisagem de loss com mais cuidado (pesquisa, fine-tuning delicado).' },
          ]}
        />
      </Section>

      <Section title="O ciclo completo: treinamento end-to-end" accent={accent}>
        <StackFlow
          title="Loop de treinamento"
          accent={accent}
          items={[
            {
              icon: '📦',
              label: 'Dataset',
              sub: 'preparação',
              detail: 'Dividir em train/val/test. Shuffle. Criar DataLoader com mini-batches.',
              connector: 'PARA CADA ÉPOCA',
            },
            {
              icon: '→',
              label: 'Forward Pass',
              sub: 'inferência',
              detail: 'Input passa pelas camadas → predição → loss calculada.',
              connector: 'BACKPROP',
            },
            {
              icon: '←',
              label: 'Backward Pass',
              sub: 'gradientes',
              detail: 'Loss propagada de trás para frente. Gradiente de cada peso calculado via regra da cadeia.',
              connector: 'OTIMIZADOR',
            },
            {
              icon: '🔧',
              label: 'Atualização',
              sub: 'Adam/AdamW',
              detail: 'Pesos atualizados usando os gradientes. lr ajustada pelo scheduler.',
              connector: 'REPETIR',
            },
            {
              icon: '📊',
              label: 'Validação',
              sub: 'a cada N steps',
              detail: 'Avaliar no val set sem atualizar pesos. Se val loss parar de cair: early stopping ou reduzir lr.',
            },
          ]}
        />
      </Section>

      <Section title="Quando parar? Underfitting vs Overfitting" accent={accent}>
        <ComparisonFlow
          title="As duas falhas do treinamento"
          accent={accent}
          left={{
            label: 'UNDERFITTING',
            steps: [
              'Train loss alta — modelo não aprendeu',
              'Val loss alta — não generaliza',
              'Gap pequeno (ambas altas)',
              'Causa: modelo pequeno demais, poucas épocas, lr baixa, features ruins',
              'Fix: modelo maior, mais épocas, features melhores',
            ],
          }}
          right={{
            label: 'OVERFITTING',
            steps: [
              'Train loss baixa — modelo decorou treino',
              'Val loss sobe após certo ponto',
              'Gap grande (train ≠ val)',
              'Causa: modelo grande, dataset pequeno, sem regularização',
              'Fix: mais dados, dropout, weight decay, early stopping',
            ],
          }}
        />
        <ComparisonTable
          accent={accent}
          headers={['Problema', 'Sintoma', 'Solução']}
          rows={[
            ['Underfitting', 'Train loss alta, val loss alta', 'Modelo maior, mais épocas, lr maior, features melhores'],
            ['Overfitting', 'Train loss baixa, val loss sobe', 'Mais dados, dropout, weight decay, early stopping, data augmentation'],
            ['Bom fit', 'Ambas baixas, gap pequeno', 'Manter — esse é o objetivo'],
          ]}
        />
      </Section>

      <Section title="Perguntas e respostas" accent={accent}>
        <QAItem
          q="Pré-treino de LLMs usa qual paradigma?"
          a={<>Não-supervisionado (self-supervised, mais precisamente). O modelo recebe texto e tenta prever o próximo token. O &ldquo;label&rdquo; é o próprio texto deslocado uma posição. Não precisa de anotação humana — o dataset é a internet inteira. Depois vem fine-tuning (supervisionado) e RLHF (reinforcement learning).</>}
        />
        <QAItem
          q="O que é gradient clipping e por que LLMs precisam?"
          a={<>Gradient clipping limita a magnitude do gradiente antes da atualização. Se a norma de g excede um threshold, escala g proporcionalmente. Em modelos profundos (96+ camadas), gradientes podem explodir durante backprop (exploding gradients). Clipping estabiliza o treinamento. Valor típico: max_norm=1.0.</>}
        />
        <QAItem
          q="Por que não usar learning rate alta com scheduler e pronto?"
          a={<>Porque com lr muito alta, os primeiros passos são destrutivos — os pesos divergem antes do scheduler ter chance de reduzir. Por isso usamos <strong>warmup</strong>: lr começa próxima de zero e sobe linearmente por ~1-5% dos steps, então o cosine decay começa a partir do pico. Isso dá tempo para o modelo &ldquo;se orientar&rdquo; antes de acelerar.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>O que você aprendeu:</strong> os três paradigmas de ML (supervisionado, não-supervisionado, RL), como loss functions medem o erro, como gradiente descendente minimiza a loss, o papel crítico da learning rate e dos schedulers, como backpropagation calcula bilhões de gradientes eficientemente, a diferença entre batch/mini-batch/SGD, e otimizadores modernos (Adam, AdamW). Próximo passo: entender a <strong>estrutura</strong> que torna tudo isso possível — as <strong>redes neurais</strong>.
      </Callout>
    </div>
  );
}
