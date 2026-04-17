import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section, Callout, ComparisonTable, DecisionBox,
  FlowDiagram, ArchFlow, ComparisonFlow, QAItem, CodeBlock, StackFlow,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'KV Cache: Memoria Eficiente — FFV Academy',
  description: 'Por que atencao e O(n2) sem cache, como KV Cache funciona token a token, GQA, MQA, PagedAttention (vLLM), Flash Attention e custos de memoria reais.',
};

const accent = '#d2a8ff';

const quiz: QuizQuestion[] = [
  {
    question: 'Sem KV Cache, gerar N tokens de output em um contexto de comprimento C exige recalcular a atencao quantas vezes?',
    options: [
      'N vezes, cada uma custando O(C)',
      'N vezes, com custo cumulativo O(N x C2) porque cada novo token recalcula K e V de todos os tokens anteriores',
      'Uma unica vez, custando O(C2)',
      'N2 vezes, porque cada par de tokens precisa ser comparado',
    ],
    correct: 1,
    explanation: 'Sem cache, para gerar o token i, o modelo recalcula K e V de todos os tokens 1 ate i. Para N tokens de output com contexto C, o custo total e proporcional a N x C2 no pior caso. Com KV Cache, cai para O(N x C) — K e V de tokens anteriores sao reutilizados.',
  },
  {
    question: 'Um modelo de 70B params (80 layers, dim=8192) com contexto de 128k tokens em FP16: quanto de VRAM o KV Cache ocupa?',
    options: [
      '~20 GB — menor que o modelo',
      '~80 GB — aproximadamente o tamanho do modelo',
      '~320 GB — varias vezes o tamanho do modelo, exigindo multiplas GPUs so para o cache',
      '~1 TB — impraticavel com hardware atual',
    ],
    correct: 2,
    explanation: 'KV Cache = 2 (K+V) x 80 layers x 128k tokens x 8192 dim x 2 bytes (FP16) = ~320 GB. O modelo em si ocupa ~140 GB em FP16. O cache pode ser 2x+ o modelo! Por isso GQA, MQA e quantizacao do cache sao criticos.',
  },
  {
    question: 'Grouped Query Attention (GQA) reduz o tamanho do KV Cache como?',
    options: [
      'Removendo camadas inteiras do modelo para ter menos K e V',
      'Compartilhando K e V entre grupos de cabecas de atencao — em vez de h pares K/V, usa h/g pares (g = tamanho do grupo)',
      'Comprimindo K e V com algoritmos de compressao lossless tipo gzip',
      'Usando FP8 em vez de FP16 para K e V automaticamente',
    ],
    correct: 1,
    explanation: 'GQA divide as h cabecas em g grupos. Cada grupo compartilha um unico par K/V. LLaMA 3 usa GQA com 8 grupos de KV para 32 cabecas de query → 4x menos memoria de cache que MHA padrao, com perda minima de qualidade.',
  },
  {
    question: 'O que Prompt Caching (ex: API do Claude) faz na pratica?',
    options: [
      'Salva a resposta do modelo em disco para nao gerar de novo',
      'Comprime o prompt para usar menos tokens antes de enviar',
      'Reutiliza o KV Cache de um prefixo identico entre requests diferentes, evitando recalcular K/V do system prompt a cada chamada',
      'Cacheia o modelo inteiro na GPU para que requests subsequentes nao precisem carrega-lo',
    ],
    correct: 2,
    explanation: 'Se duas requests compartilham o mesmo system prompt de 2000 tokens, o Prompt Caching reutiliza o KV Cache desses 2000 tokens na segunda request. Resultado: menos compute (so processa a parte nova), menor latencia e menor custo.',
  },
];

export default function KVCachePage() {
  return (
    <ModuleLayout
      slug="kv-cache"
      title="KV Cache: Memoria Eficiente"
      icon="⚡"
      xp={60}
      readTime={8}
      trailName="IA Alem do LLM"
      trailColor={accent}
      nextSlug="mixture-of-experts"
      nextTitle="Mixture of Experts"
      seoDesc="KV Cache, GQA, MQA, PagedAttention, Flash Attention e custos de memoria reais em LLMs."
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
        Por que um modelo de 30GB de parametros pode precisar de 60GB+ de VRAM? Por que gerar o primeiro token e lento mas os seguintes sao rapidos? A resposta e o <strong>KV Cache</strong> — uma das otimizacoes mais importantes (e menos explicadas) da inferencia de LLMs. Neste artigo, voce vai entender como ele funciona, quanto de memoria consome, e como tecnicas modernas (GQA, Flash Attention, PagedAttention) lidam com seus limites.
      </p>

      <Callout tone="warn">
        Pre-requisito: voce precisa entender <strong>self-attention</strong> (Q, K, V) e como o Transformer gera tokens autorregressivamente. Se nao leu o artigo de Transformers, leia antes.
      </Callout>

      <Section title="O problema: atencao autorregressiva e redundante" accent={accent}>
        <p>
          Na geracao autorregressiva, o modelo gera <strong>um token por vez</strong>. Para gerar o token na posicao t, ele precisa calcular a atencao entre Q(t) e os Keys de <em>todos os tokens anteriores</em> (1 ate t-1), e combinar com os Values correspondentes.
        </p>
        <FlowDiagram
          title='Sem KV Cache: recalculo redundante (gerando "O gato sentou")'
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '1️⃣', label: 'Token "O"', desc: 'Calcula K(O), V(O) → atenção vs K(O)' },
            { icon: '2️⃣', label: 'Token "gato"', desc: 'Recalcula K(O), V(O) ← REDUNDANTE! + K(gato)' },
            { icon: '3️⃣', label: 'Token "sentou"', desc: 'Recalcula K(O), K(gato) ← REDUNDANTE! + K(sentou)' },
          ]}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
          Para N tokens: recalcula N(N+1)/2 pares K/V — custo O(N²) em compute redundante.
        </p>
      </Section>

      <Section title="A solucao: KV Cache" accent={accent}>
        <p>
          A ideia e simples: <strong>calcule K e V de cada token uma unica vez e guarde em memoria</strong>. Quando o proximo token chegar, so calcule K e V <em>dele</em> e concatene com o cache.
        </p>
        <FlowDiagram
          title="Com KV Cache: calcula cada K/V exatamente UMA vez"
          accent="var(--ffv-green)"
          orientation="vertical"
          steps={[
            { icon: '1️⃣', label: 'Token "O"', desc: 'Calcula K(O), V(O) → salva no cache' },
            { icon: '2️⃣', label: 'Token "gato"', desc: 'Calcula K(gato), V(gato) APENAS → concatena ao cache' },
            { icon: '3️⃣', label: 'Token "sentou"', desc: 'Calcula K(sentou), V(sentou) APENAS → concatena ao cache' },
          ]}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
          Para N tokens: calcula exatamente N pares K/V — custo O(N) em vez de O(N²).
        </p>
        <Callout tone="info">
          O trade-off e classico: <strong>compute vs memoria</strong>. KV Cache troca recalculo (compute) por armazenamento (memoria VRAM). A geracao fica muito mais rapida, mas o cache ocupa espaco — e quanto maior o contexto, mais espaco.
        </Callout>
      </Section>

      <Section title="Prefill vs Decode: as duas fases da inferencia" accent={accent}>
        <StackFlow
          title="Inferencia de um LLM"
          accent={accent}
          items={[
            {
              icon: '📥',
              label: 'Prefill (prompt processing)',
              sub: 'compute-bound',
              detail: 'Processa todo o prompt de uma vez (paralelo). Calcula K e V para todos os tokens do prompt e preenche o cache. Pode levar segundos para prompts longos.',
              connector: 'CACHE PREENCHIDO',
            },
            {
              icon: '🔄',
              label: 'Decode (geracao autorregressiva)',
              sub: 'memory-bound',
              detail: 'Gera um token por vez. Cada passo: (1) calcula Q/K/V do novo token, (2) concatena K/V ao cache, (3) atencao do Q contra todo o cache, (4) prediz proximo token. Bottleneck: leitura do cache da VRAM.',
              connector: 'REPETIR',
            },
            {
              icon: '📤',
              label: 'Output completo',
              sub: 'fim',
              detail: 'Quando o modelo gera <|end|> ou atinge o limite de tokens, a geracao para. O cache e descartado (a menos que prompt caching esteja ativo).',
            },
          ]}
        />
        <p>
          Por isso o <strong>primeiro token</strong> demora mais (prefill inteiro) e os seguintes sao rapidos (so decode incremental). Voce ja percebeu isso ao usar ChatGPT ou Claude — aquela pausa inicial seguida de streaming rapido.
        </p>
      </Section>

      <Section title="Quanto de memoria o cache consome?" accent={accent}>
        <p className="text-xs font-mono p-4 rounded-lg mb-3" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${accent}30`, color: 'var(--foreground)' }}>
          KV Cache (bytes) = 2 × layers × seq_len × d_model × bytes_per_param
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Layers', 'Dim', 'Cache 4k ctx', 'Cache 128k ctx']}
          rows={[
            ['LLaMA 3 8B', '32', '4096', '2 GB', '64 GB'],
            ['LLaMA 3 70B', '80', '8192', '10 GB', '320 GB'],
            ['GPT-4 (est.)', '~120', '~12k', '~23 GB', '~750 GB'],
          ]}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
          LLaMA 3 70B em FP16: modelo ~140 GB + cache 128k = 320 GB → <strong>~460 GB de VRAM para UM request</strong> = 6× H100 80GB apenas para servir 1 usuário.
        </p>
      </Section>

      <Section title="GQA e MQA: compartilhando K/V entre cabecas" accent={accent}>
        <p>
          Multi-Head Attention (MHA) padrao gera K/V independentes para cada cabeca de atencao. Mas K/V consomem muito mais memoria que Q (cache!). Solucao: <strong>compartilhar K/V entre cabecas</strong>.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Tecnica', 'Q heads', 'K/V heads', 'Reducao de cache', 'Usado em']}
          rows={[
            ['MHA (padrao)', '32', '32', '0% (baseline)', 'GPT-2, BERT, Transformer original'],
            ['GQA (Grouped)', '32', '8', '75%', 'LLaMA 3, Gemma 2, Mistral'],
            ['MQA (Multi-Query)', '32', '1', '97%', 'PaLM, Falcon, StarCoder'],
          ]}
        />
        <ArchFlow
          title="MHA vs GQA vs MQA — compartilhamento de K/V entre cabeças"
          accent={accent}
          columns={[
            {
              header: 'MHA (Multi-Head)',
              headerColor: 'var(--ffv-red)',
              items: ['32 Q heads', '32 K/V heads', 'Cada cabeça tem seu K/V', 'Cache baseline (100%)'],
              footer: 'GPT-2, BERT, Transformer original',
              useCases: ['Máxima qualidade', 'Alto custo de memória'],
            },
            {
              header: 'GQA (Grouped)',
              headerColor: accent,
              items: ['32 Q heads', '8 K/V heads', '4 Q heads compartilham 1 K/V', 'Cache 75% menor'],
              footer: 'LLaMA 3, Gemma 2, Mistral',
              useCases: ['Compromisso ideal', 'Quase qualidade de MHA'],
            },
            {
              header: 'MQA (Multi-Query)',
              headerColor: 'var(--ffv-green)',
              items: ['32 Q heads', '1 K/V head', 'TODAS as Q usam mesmo K/V', 'Cache 97% menor'],
              footer: 'PaLM, Falcon, StarCoder',
              useCases: ['Máxima economia', 'Pode perder qualidade'],
            },
          ]}
        />
      </Section>

      <Section title="Flash Attention: compute eficiente, nao menos compute" accent={accent}>
        <p>
          Flash Attention nao reduz a complexidade O(n2) — reduz os <strong>acessos a memoria</strong>. GPUs tem dois tipos de memoria:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Memoria', 'Tamanho (H100)', 'Velocidade', 'Papel']}
          rows={[
            ['SRAM (on-chip)', '~50 MB', '~19 TB/s', 'Rapida mas minuscula — usada como cache de trabalho'],
            ['HBM (VRAM)', '80 GB', '~3.4 TB/s', 'Grande mas ~6x mais lenta — onde modelo e KV Cache vivem'],
          ]}
        />
        <p>
          A atencao padrao materializa a matriz n x n inteira na HBM. Flash Attention calcula a atencao em <strong>blocos</strong> (tiles) que cabem na SRAM, sem nunca materializar a matriz completa. Resultado:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Metrica', 'Atencao padrao', 'Flash Attention v2']}
          rows={[
            ['Memoria de pico', 'O(n2) — materializa matriz n x n', 'O(n) — so armazena tiles parciais'],
            ['Acessos HBM', 'Muitos — le e escreve matriz inteira', 'Poucos — tudo fica na SRAM o maximo possivel'],
            ['Speedup tipico', 'Baseline', '2-4x mais rapido'],
            ['Complexidade', 'O(n2)', 'O(n2) — mesma! So reordena os calculos'],
          ]}
        />
      </Section>

      <Section title="PagedAttention: servindo multiplos usuarios" accent={accent}>
        <p>
          Em producao, um servidor serve <strong>multiplos usuarios simultaneamente</strong>. Cada request tem um KV Cache de tamanho diferente. Alocar memoria contiguamente causa <strong>fragmentacao</strong>: espacos vazios entre caches de tamanhos diferentes.
        </p>
        <ComparisonFlow
          title="PagedAttention — antes e depois (inspirado em virtual memory do OS)"
          accent={accent}
          left={{
            label: 'SEM PagedAttention (fragmentação)',
            steps: ['Cache A: 2k tokens', '[VAZIO — fragmentação]', 'Cache B: 8k tokens', '[VAZIO]', 'Cache C: 1k tokens', '→ ~40% da VRAM desperdiçada'],
          }}
          right={{
            label: 'COM PagedAttention (páginas fixas)',
            steps: ['VRAM dividida em páginas de tamanho fixo', 'pág1:A · pág2:B · pág3:A · pág4:B', 'Páginas não precisam ser contíguas!', 'Fragmentação quase zero', '→ Throughput 2–4× maior em batch'],
          }}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
          vLLM (UC Berkeley) implementa PagedAttention. Padrão na indústria para servir LLMs em produção.
        </p>
      </Section>

      <Section title="Prompt Caching: reutilizando o prefill" accent={accent}>
        <p>
          Se 100 requests usam o mesmo system prompt de 2000 tokens, por que recalcular K/V desses 2000 tokens 100 vezes? <strong>Prompt Caching</strong> resolve: o KV Cache do prefixo comum e calculado uma vez e reutilizado.
        </p>
        <FlowDiagram
          title="Prompt Caching — como o prefill é reutilizado"
          accent={accent}
          steps={[
            { icon: '1️⃣', label: 'Request 1', desc: 'Processa 2000 tokens (system) + 200 (user) → salva KV Cache do system' },
            { icon: '2️⃣', label: 'Request 2', desc: 'Reutiliza cache dos 2000 tokens! Processa só 300 novos → 86% mais barato' },
            { icon: '🔄', label: 'Requests N', desc: 'Todos reutilizam o cache → ~95% de economia em prefill' },
          ]}
        />
        <p className="text-xs mt-2" style={{ color: 'var(--ffv-muted)' }}>
          Requisitos: prefixo idêntico byte a byte · TTL ~5 min (Anthropic) · Preços: cache write = normal, cache read = ~10% do preço.
        </p>
        <DecisionBox
          scenario="Quando usar Prompt Caching?"
          winner="Sempre que system prompt > 1000 tokens e requests sao frequentes"
          winnerColor={accent}
          why="O custo de cache write e negligivel comparado com a economia em cache reads. Qualquer chatbot, RAG pipeline ou agent com system prompt longo se beneficia."
          alternatives={[
            { name: 'Sem cache', note: 'Apenas para requests unicos com prompts sempre diferentes (raro em producao).' },
          ]}
        />
      </Section>

      <Section title="MLA: a próxima geração de eficiência de cache" accent={accent}>
        <p>
          GQA e MQA compartilham K/V entre cabeças — mas ainda armazenam K e V separadamente.
          <strong> Multi-head Latent Attention (MLA)</strong>, introduzido pelo DeepSeek v2/v3 (2024),
          vai além: comprime K e V num espaço latente de dimensão muito menor antes de armazenar.
        </p>
        <ComparisonFlow
          title="MHA / GQA vs MLA — o que é armazenado no cache"
          accent={accent}
          left={{
            label: 'MHA / GQA (padrão)',
            steps: [
              'Armazena K e V explicitamente',
              'Dimensão por token: 2 × d_head × n_kv_heads',
              'LLaMA 3 70B com GQA 8: ~1.1 GB por 1k tokens',
              'Cache cresce linearmente com seq_len',
            ],
          }}
          right={{
            label: 'MLA (DeepSeek v3)',
            steps: [
              'Comprime K, V em vetor latente c (dim muito menor)',
              'Armazena c, não K e V separados',
              'Na atenção: projeta c de volta para K/V on-the-fly',
              '~5-10× menos cache que MHA equivalente',
            ],
          }}
        />
        <Callout tone="info">
          <strong>Trade-off do MLA:</strong> menos VRAM de cache, mas mais compute na atenção
          (re-projeção latente → K/V a cada step). Na prática, GPUs modernas têm compute sobrando
          mas VRAM escassa — MLA é o trade-off certo. É a razão pela qual DeepSeek v3 pode rodar
          contextos de 128k tokens com muito menos VRAM que LLaMA 3 equivalente.
        </Callout>
        <ComparisonTable
          accent={accent}
          headers={['Técnica', 'Redução de cache', 'Custo', 'Adoção']}
          rows={[
            ['MQA (Multi-Query)', '1 K/V pair total → 8× menos (vs MHA 8h)', 'Perda de qualidade pequena-média', 'GPT-3.5, Falcon'],
            ['GQA (Grouped Query)', '1 K/V por grupo → 2-8× menos', 'Perda mínima (LLaMA 3 usa)', 'LLaMA 3, Mistral, Gemma'],
            ['MLA (Latent Attention)', '5-10× menos que MHA', 'Compute extra para re-projeção', 'DeepSeek v2/v3 (emergente)'],
            ['Cache Quantization (FP8)', '2× menos que FP16', 'Ruído mínimo em V, moderado em K', 'TensorRT-LLM, vLLM recente'],
          ]}
        />
      </Section>

      <Section title="Perguntas e respostas" accent={accent}>
        <QAItem
          q="KV Cache existe durante o treinamento?"
          a={<>Nao. Durante o treinamento, todo o contexto e processado de uma vez (teacher forcing) — nao ha geracao autorregressiva, entao nao ha necessidade de cache incremental. KV Cache e puramente uma otimizacao de <strong>inferencia</strong>.</>}
        />
        <QAItem
          q="Quantizar o KV Cache ajuda?"
          a={<>Sim. Armazenar K/V em FP8 ou INT8 em vez de FP16 reduz o cache pela metade com perda minima de qualidade. Pesquisas recentes (KV Cache quantization) mostram que INT4 e viavel para V mas nao para K (K e mais sensivel a precisao porque afeta os scores de atencao diretamente).</>}
        />
        <QAItem
          q="O que e sliding window attention?"
          a={<>Em vez de cachear K/V de TODOS os tokens anteriores, cada camada so atende aos ultimos W tokens (ex: W=4096). Memoria do cache fica fixa em O(W) independente do contexto. Mistral usa isso. A perda: tokens muito distantes nao se &ldquo;veem&rdquo; diretamente, mas informacao flui indiretamente pelas camadas empilhadas.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>O que voce aprendeu:</strong> KV Cache elimina recalculo redundante na geracao autorregressiva (O(n2) → O(n) por token). O custo e memoria VRAM — que pode superar o tamanho do modelo. GQA compartilha K/V entre cabecas (4x menos cache). Flash Attention reordena calculos para minimizar acessos a HBM (2-4x mais rapido). PagedAttention resolve fragmentacao em batch serving. Prompt Caching reutiliza o prefill entre requests. Proximo: como modelos com 1T+ parametros rodam sem carregar tudo na memoria — <strong>Mixture of Experts</strong>.
      </Callout>
    </div>
  );
}
