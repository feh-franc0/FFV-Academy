import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section, Callout, ComparisonTable, DecisionBox,
  ArchFlow, FlowDiagram, QAItem, CodeBlock,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Mixture of Experts (MoE) — FFV Academy',
  description: 'Como MoE funciona: router, top-k experts, load balancing, Mixtral, DeepSeek v3, GPT-4. Trade-off memoria vs compute.',
};

const accent = '#d2a8ff';

const quiz: QuizQuestion[] = [
  {
    question: 'Um modelo MoE tem 200B parametros totais mas so ativa 20B por token. Qual e o custo computacional por token?',
    options: [
      '200B FLOPs — todos os parametros sao usados no calculo',
      '~20B FLOPs — apenas os experts ativados contribuem para o compute',
      '100B FLOPs — metade dos parametros e sempre ativa',
      '~20B FLOPs no prefill mas 200B no decode',
    ],
    correct: 1,
    explanation: 'O compute e proporcional aos parametros ATIVADOS (20B), nao ao total (200B). Mas a MEMORIA precisa armazenar todos os 200B parametros — esse e o trade-off fundamental do MoE: compute de modelo pequeno, memoria de modelo grande.',
  },
  {
    question: 'O que acontece se o router enviar todos os tokens para os mesmos 2 experts (de 8 disponiveis)?',
    options: [
      'O modelo fica mais rapido porque so 2 experts precisam estar na memoria',
      'Os 2 experts ficam sobrecarregados e os outros 6 nao treinam — "expert collapse". O modelo desperica capacidade massiva.',
      'Nada muda — o router e deterministico e distribui igualmente',
      'Os experts nao usados sao automaticamente removidos do modelo (pruning)',
    ],
    correct: 1,
    explanation: 'Expert collapse e o problema central do treinamento MoE. Se o router prefere poucos experts, os outros nao recebem gradientes e nao aprendem. Solucao: auxiliary load balancing loss que penaliza distribuicao desigual.',
  },
  {
    question: 'Por que MoE exige mais VRAM do que um modelo denso com o mesmo custo computacional?',
    options: [
      'Porque o router e muito grande e ocupa a maior parte da memoria',
      'Porque todos os experts precisam estar na memoria mesmo que so 2 sejam usados por token — a VRAM armazena parametros totais, nao parametros ativos',
      'Porque MoE usa FP32 obrigatoriamente enquanto modelos densos usam FP16',
      'Porque o KV Cache de MoE e maior (cada expert tem seu proprio cache)',
    ],
    correct: 1,
    explanation: 'Um MoE de 200B params com top-2 de 8 experts: compute ~ modelo denso de 50B, mas VRAM = modelo denso de 200B. Todos os pesos ficam na GPU porque qualquer token pode ativar qualquer expert. O KV Cache e compartilhado (nao por expert).',
  },
  {
    question: 'DeepSeek v3 usa MoE com 671B params totais e ~37B ativos. Qual inovacao permitiu treinar esse modelo por ~$5.5M (vs GPT-4 ~$100M)?',
    options: [
      'Usaram GPUs mais baratas fabricadas na China',
      'Multi-head Latent Attention (MLA) que reduz KV Cache drasticamente + auxiliary-loss-free load balancing + FP8 training',
      'Treinaram com menos dados (500B tokens vs 15T)',
      'Usaram modelo denso fingindo ser MoE no paper',
    ],
    correct: 1,
    explanation: 'DeepSeek v3 combinou varias inovacoes: MLA comprime K/V em latent space (cache muito menor), o load balancing nao precisa de loss auxiliar (nao distorce o gradiente principal), e FP8 training reduz memoria e compute. Resultado: modelo competitivo com GPT-4 por fração do custo.',
  },
];

export default function MoEPage() {
  return (
    <ModuleLayout
      slug="mixture-of-experts"
      title="Mixture of Experts (MoE)"
      icon="🧩"
      xp={70}
      readTime={10}
      trailName="IA Alem do LLM"
      trailColor={accent}
      nextSlug="tool-calling"
      nextTitle="Tool Calling e Agentes"
      seoDesc="MoE: router, top-k experts, load balancing, Mixtral, DeepSeek v3, GPT-4. Trade-off memoria vs compute."
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
        GPT-4 tem estimados 1.7 trilhoes de parametros — mas ativar todos a cada token seria computacionalmente impossivel. A solucao: <strong>Mixture of Experts (MoE)</strong>, uma arquitetura que escala parametros sem escalar compute proporcionalmente. Neste artigo, voce vai entender como o router seleciona experts, o problema de load balancing, e por que MoE dominou os modelos frontier.
      </p>

      <Section title="A ideia: parametros abundantes, compute seletivo" accent={accent}>
        <p>
          Em um Transformer denso (como LLaMA), <strong>todos os parametros</strong> sao usados para processar cada token. Em MoE, a camada FFN (feed-forward network) e substituida por <strong>multiplos experts</strong> — cada um e um FFN independente — e um <strong>router</strong> decide quais ativar.
        </p>
        <ArchFlow
          title="Dense vs MoE — arquitetura comparada"
          accent={accent}
          columns={[
            {
              header: 'TRANSFORMER DENSO (LLaMA 3 70B)',
              headerColor: 'var(--ffv-blue)',
              items: ['Token → Self-Attention → FFN → output', 'FFN usa 100% dos parâmetros', 'Todo token passa por todos os pesos', '70B params totais · 70B ativos/token'],
              footer: 'compute = params totais',
              useCases: ['Simples de servir', 'VRAM = modelo todo', 'Fine-tuning padrão'],
            },
            {
              header: 'TRANSFORMER MoE (Mixtral 8×7B)',
              headerColor: accent,
              items: ['Token → Self-Attention → Router → top-2 experts', 'Router seleciona 2 de 8 experts', 'Expert 1 + Expert 2 ativados', 'Expert 3..8 dormindo (gradiente zero)', '47B params totais · ~13B ativos/token'],
              footer: 'compute ≪ params totais',
              useCases: ['VRAM = modelo todo (todos os experts)', 'Compute = só experts ativos', 'Escalável para 1T+ params'],
            },
          ]}
        />
        <Callout tone="info">
          <strong>O trade-off fundamental:</strong> MoE tem <em>compute de modelo pequeno</em> mas <em>memoria de modelo grande</em>. Todos os experts precisam estar na VRAM mesmo que so 2 de 8 sejam usados por token.
        </Callout>
      </Section>

      <Section title="O Router: como escolher experts" accent={accent}>
        <p>
          O router e uma pequena rede (geralmente uma camada linear + softmax) que recebe a representacao do token e produz uma distribuicao de probabilidade sobre os experts.
        </p>
        <FlowDiagram
          title='Router top-k — token "implementação" → seleção de experts'
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '📥', label: 'Token "implementação"', desc: 'Representação vetorial d-dimensional do token atual' },
            { icon: '🎯', label: 'Router: W_gate × token', desc: 'Scores: Expert1=0.05 · Expert2=0.41★ · Expert3=0.02 · Expert4=0.31★ · Expert5–8=0.08–0.03' },
            { icon: '🔝', label: 'Top-2 selecionados', desc: 'Expert 2 (0.41) + Expert 4 (0.31) → normalizados: 0.57 e 0.43' },
            { icon: '📤', label: 'Output combinado', desc: '0.57 × Expert2(token) + 0.43 × Expert4(token) — experts 1,3,5–8: gradiente ZERO' },
          ]}
        />
        <CodeBlock lang="python">
{`# Router simplificado em PyTorch
import torch
import torch.nn.functional as F

class Router(torch.nn.Module):
    def __init__(self, d_model, num_experts, top_k=2):
        super().__init__()
        self.gate = torch.nn.Linear(d_model, num_experts, bias=False)
        self.top_k = top_k

    def forward(self, x):
        # x: (batch, seq_len, d_model)
        logits = self.gate(x)              # (batch, seq_len, num_experts)
        scores = F.softmax(logits, dim=-1)
        top_scores, top_indices = scores.topk(self.top_k, dim=-1)
        top_scores = top_scores / top_scores.sum(dim=-1, keepdim=True)
        return top_scores, top_indices`}
        </CodeBlock>
      </Section>

      <Section title="Load Balancing: o problema central" accent={accent}>
        <p>
          Se o router prefere poucos experts, os outros <strong>nao recebem gradientes e nao treinam</strong>. Isso e <strong>expert collapse</strong> — o modelo desperica a maioria da sua capacidade.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Tecnica', 'Como funciona', 'Usado em']}
          rows={[
            ['Auxiliary load balancing loss', 'Adiciona um termo a loss que penaliza distribuicao desigual de tokens entre experts', 'Switch Transformer, Mixtral, GPT-4 (provavel)'],
            ['Expert capacity', 'Limita o numero maximo de tokens que cada expert pode processar. Excedente e descartado ou roteado para outro.', 'Switch Transformer, GShard'],
            ['Noise in router', 'Adiciona ruido gaussiano aos logits do router durante treino para explorar experts menos usados', 'ST-MoE, Mixtral'],
            ['Auxiliary-loss-free balancing', 'Bias adaptativo no router sem distorcer a loss principal', 'DeepSeek v3 (inovacao chave)'],
          ]}
        />
      </Section>

      <Section title="Modelos MoE reais" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Params totais', 'Params ativos', 'Experts', 'Top-k', 'Performance']}
          rows={[
            ['Mixtral 8x7B', '47B', '~13B', '8', '2', '~ LLaMA 2 70B (dense) com 5x menos compute'],
            ['Mixtral 8x22B', '176B', '~44B', '8', '2', 'Compete com GPT-3.5 Turbo'],
            ['GPT-4 (estimado)', '~1.7T', '~220B', '~16', '~2', 'Frontier (ate mar/2024)'],
            ['DeepSeek v3', '671B', '~37B', '256', '8', 'Compete com GPT-4o por ~$5.5M de treino'],
            ['Grok-1 (xAI)', '314B', '~79B', '8', '2', 'Open-source, competitivo com Mixtral'],
          ]}
        />
        <Callout tone="info">
          <strong>DeepSeek v3</strong> e notavel: 256 experts com top-8 ativacao + 1 expert compartilhado (sempre ativo). O expert compartilhado captura conhecimento geral; os especializados cobrem dominios. MLA (Multi-head Latent Attention) comprime K/V em latent space, reduzindo o KV Cache drasticamente.
        </Callout>
      </Section>

      <Section title="Expert Parallelism: como servir MoE em clusters" accent={accent}>
        <p>
          Um MoE de 671B params (DeepSeek v3) não cabe em uma única GPU — nem em 8. O serving requer
          estratégias específicas de paralelismo. Em modelos densos, o padrão é <em>tensor parallelism</em>
          (dividir matrizes entre GPUs). Em MoE, adiciona-se <strong>expert parallelism</strong>: cada GPU
          hospeda um subconjunto de experts.
        </p>
        <ArchFlow
          title="Expert Parallelism — 8 experts em 4 GPUs"
          accent={accent}
          columns={[
            {
              header: 'GPU 0',
              headerColor: accent,
              items: ['Expert 1 (hospedado)', 'Expert 2 (hospedado)', 'Attention layers (compartilhadas)', 'Recebe tokens roteados p/ E1/E2'],
            },
            {
              header: 'GPU 1',
              headerColor: accent,
              items: ['Expert 3 (hospedado)', 'Expert 4 (hospedado)', 'Attention layers (compartilhadas)', 'Recebe tokens roteados p/ E3/E4'],
            },
            {
              header: 'GPU 2',
              headerColor: accent,
              items: ['Expert 5 (hospedado)', 'Expert 6 (hospedado)', 'Attention layers (compartilhadas)', 'Recebe tokens roteados p/ E5/E6'],
            },
            {
              header: 'GPU 3',
              headerColor: accent,
              items: ['Expert 7 (hospedado)', 'Expert 8 (hospedado)', 'Attention layers (compartilhadas)', 'Recebe tokens roteados p/ E7/E8'],
            },
          ]}
        />
        <ComparisonTable
          accent={accent}
          headers={['Estratégia', 'O que faz', 'Trade-off']}
          rows={[
            ['Expert Parallelism', 'Diferentes GPUs hospedam diferentes experts. All-to-all communication move tokens entre GPUs.', 'Alta largura de banda inter-GPU necessária (NVLink)'],
            ['Tensor Parallelism', 'Divide cada camada entre GPUs (matrizes particionadas).', 'Funciona bem para attention; usado em conjunto com EP'],
            ['Expert Offloading', 'Experts inativos ficam na RAM CPU; carregados na GPU quando chamados.', 'Latência alta (PCIe ~10x mais lento que HBM)'],
            ['Token Dropping', 'Se um expert excede capacidade, tokens em excesso são descartados (skip).', 'Perda de qualidade controlável com buffer capacity'],
          ]}
        />
        <Callout tone="warn">
          O gargalo real em MoE serving é o <strong>all-to-all communication</strong>: cada token precisa ser
          enviado para a GPU que hospeda o expert selecionado. Com batch grande, isso gera tráfego massivo
          entre GPUs. Por isso NVLink (600 GB/s) é praticamente obrigatório para clusters MoE eficientes —
          Ethernet (100 Gbps) causa degradação severa de throughput.
        </Callout>
      </Section>

      <Section title="Fine-tuning MoE: complexidades práticas" accent={accent}>
        <p>
          Fine-tuning de modelos MoE é mais complexo que modelos densos. A principal questão:
          o router deve ser atualizado? E se sim, como evitar que o fine-tuning colapse a especialização
          aprendida no pré-treino?
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Abordagem', 'O que congela', 'Quando usar', 'Risco']}
          rows={[
            ['Full fine-tuning', 'Nada — atualiza tudo incluindo router', 'Quando tem dados suficientes (>100k exemplos)', 'Router pode colapsar especializações do pré-treino'],
            ['LoRA nos experts', 'Pesos base dos experts; treina adaptadores LoRA', 'Fine-tuning eficiente em domínio específico', 'LoRA pode conflitar se expert não for ativado para o domínio'],
            ['Congelar router', 'Router congelado; atualiza apenas experts', 'Preservar routing do pré-treino ao especializar', 'Router pré-treino pode não ser ótimo para nova tarefa'],
            ['Congelar experts inativos', 'Só atualiza experts ativados para o domínio', 'Máxima eficiência; mínima interferência', 'Identificar quais experts são relevantes é não-trivial'],
          ]}
        />
        <Callout tone="info">
          <strong>MoE + LoRA na prática:</strong> a implementação mais comum aplica LoRA em <em>todos</em>
          os experts com rank baixo (r=8 ou r=16). Durante o fine-tuning, apenas os adaptadores LoRA dos
          experts ativados recebem gradiente — comportamento análogo ao routing normal. O router
          geralmente é congelado. Custo: ~2% dos parâmetros treináveis de um full fine-tune.
        </Callout>
        <QAItem
          q="Vale a pena fazer fine-tuning de Mixtral 8x7B vs LLaMA 3 70B para o mesmo caso de uso?"
          a={<>Depende do compute disponível. Mixtral 8x7B tem ~13B params ativos (compute similar a um denso de 13B) mas precisa de 47B na VRAM. LLaMA 3 70B requer 70B na VRAM. Se VRAM é o gargalo: Mixtral vence (mais qualidade por VRAM com offloading). Se latência é crítica: LLaMA 3 70B em tensor-parallel costuma ser mais previsível. Para a maioria dos casos de uso empresariais, <strong>LLaMA 3 70B dense</strong> é mais simples e suficiente.</>}
        />
      </Section>

      <Section title="MoE vs Dense: quando usar cada um" accent={accent}>
        <DecisionBox
          scenario="Qual arquitetura para um LLM de uso geral em producao?"
          winner="MoE"
          winnerColor={accent}
          why="Para modelos frontier (>100B params), MoE e essencial. O custo de servir um modelo denso de 1.7T params seria astronomico. MoE permite escalara parametros sem escalar compute linearmente."
          alternatives={[
            { name: 'Dense', note: 'Modelos menores (<70B params) onde a complexidade do MoE nao compensa. LLaMA 3 70B dense e mais simples de servir que um MoE de 70B params.' },
          ]}
        />
        <ComparisonTable
          accent={accent}
          headers={['Fator', 'Dense', 'MoE']}
          rows={[
            ['Compute por token', 'Proporcional aos params totais', 'Proporcional aos params ATIVOS (muito menor)'],
            ['VRAM necessaria', 'Proporcional aos params totais', 'Proporcional aos params TOTAIS (todos os experts na memoria)'],
            ['Complexidade de servir', 'Simples — sharding padrao', 'Complexo — expert parallelism + routing overhead'],
            ['Escalabilidade', 'Linear: 2x params = 2x compute', 'Sublinear: 2x params pode ser apenas 1.2x compute'],
            ['Treinamento', 'Estavel, bem compreendido', 'Load balancing e instabilidade sao desafios ativos'],
            ['Fine-tuning', 'Simples — LoRA/QLoRA padrao', 'Complexo — quais experts atualizar? Router muda?'],
          ]}
        />
      </Section>

      <Section title="DeepSeek v3: anatomia de um MoE de fronteira barato" accent={accent}>
        <p>
          DeepSeek v3 (dezembro 2024) abalou a indústria ao demonstrar que um modelo competitivo com GPT-4o
          podia ser treinado por ~$5,5M — enquanto estimativas de GPT-4 falam em $100M+. As inovações
          técnicas foram específicas e complementares:
        </p>
        <ArchFlow
          title="As 4 inovações-chave do DeepSeek v3"
          accent={accent}
          columns={[
            {
              header: 'MLA (Multi-head Latent Attention)',
              headerColor: accent,
              items: [
                'Comprime K/V em latent space antes de armazenar no KV Cache',
                'KV Cache ~90% menor que Multi-Head Attention padrão',
                'Crítico: KV Cache é o gargalo de memória em long contexts',
                'Projeta K,V de d_model para d_latent (muito menor)',
              ],
              footer: 'maior economia de memória',
            },
            {
              header: 'Auxiliary-Loss-Free Balancing',
              headerColor: 'var(--ffv-green)',
              items: [
                'MoE padrão adiciona load balancing loss',
                'Essa loss distorce o gradiente principal',
                'DeepSeek v3: bias adaptativo por expert no router',
                'Sem loss auxiliar: gradiente limpo, convergência melhor',
              ],
              footer: 'melhor qualidade de treino',
            },
            {
              header: 'FP8 Mixed Precision Training',
              headerColor: 'var(--ffv-orange)',
              items: [
                'Maioria das operações em FP8 (8-bit float)',
                'FP16 só onde numericamente crítico',
                'Reduz memória e compute ~2x vs FP16',
                'Requer calibração cuidadosa para evitar divergência',
              ],
              footer: '2× eficiência de compute',
            },
            {
              header: '256 Experts + 1 Shared',
              headerColor: 'var(--ffv-blue)',
              items: [
                '256 routed experts + 1 expert compartilhado',
                'Expert compartilhado sempre ativado: captura geral',
                'Top-8 de 256 routed: especialização fina',
                '671B total · ~37B ativos por token',
              ],
              footer: 'granularidade de especialização',
            },
          ]}
        />
        <Callout tone="info">
          O resultado: DeepSeek v3 treinou 14.8T tokens em ~2.788 GPU-days (H800 SXM). Modelos concorrentes
          estimam 30-50× mais compute para qualidade similar. A lição não é "GPUs baratas" — é
          <strong> eficiência de algoritmo compensa hardware</strong>. O paper completo está disponível no
          arXiv e é uma leitura obrigatória para quem trabalha com infraestrutura de LLMs.
        </Callout>
      </Section>

      <Section title="Perguntas e respostas" accent={accent}>
        <QAItem
          q="Cada expert se especializa em um dominio (codigo, matematica, etc.)?"
          a={<>Na teoria, sim. Na pratica, a especializacao e mais sutil: experts tendem a se especializar em <em>padroes sintaticos</em> (tokens de pontuacao, inicio de frase, numeros) mais do que em dominios semanticos. Analises do Mixtral mostram que a maioria dos experts e &ldquo;generalista&rdquo; com leves preferencias, nao especialistas puros.</>}
        />
        <QAItem
          q="Posso rodar um MoE em hardware menor se so carregar 2 experts?"
          a={<>Em teoria parcialmente — e o conceito de &ldquo;expert offloading&rdquo;: manter experts inativos na RAM e carregar na GPU sob demanda. Funciona mas adiciona latencia significativa (PCIe e ~10x mais lento que HBM). Mixtral 8x7B com offloading roda em GPUs de 24GB mas com throughput muito menor que carregar tudo na VRAM.</>}
        />
        <QAItem
          q="O router e treinado junto com os experts?"
          a={<>Sim. O router e uma camada linear cujos pesos sao aprendidos end-to-end via backpropagation. O gradiente flui do output, passa pelos experts ativados, e volta ao router. O desafio: o gradiente so flui pelos top-k experts selecionados — os outros nao recebem sinal, o que pode causar collapse sem a load balancing loss.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>O que voce aprendeu:</strong> MoE substitui o FFN por multiplos experts + router. Apenas top-k experts sao ativados por token — compute de modelo pequeno, memoria de modelo grande. Load balancing e critico para evitar expert collapse. Modelos frontier (GPT-4, DeepSeek v3) usam MoE massivo. DeepSeek v3 mostrou que inovacao em training efficiency (MLA + auxiliary-loss-free balancing + FP8) pode competir com budgets 20x maiores. Proximo: como LLMs interagem com o mundo real — <strong>Tool Calling</strong>.
      </Callout>
    </div>
  );
}
