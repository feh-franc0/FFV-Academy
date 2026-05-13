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
  StackFlow,
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('speculative-decoding');

const ACCENT = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a intuição central do speculative decoding (Leviathan et al., ICML 2023)?',
    options: [
      'Treinar um modelo melhor',
      'Decoding autoregressive gera 1 token por forward; um modelo pequeno "draft" gera N tokens candidatos rápido; o modelo grande "target" valida TODOS os N em um único forward (paraleliza com KV cache estendido). Tokens aceitos = ganho. Tokens rejeitados = paga o custo do draft mas mantém qualidade exata',
      'Cache mais agressivo',
      'Quantização extra',
    ],
    correct: 1,
    explanation:
      'Leviathan, Kalman, Matias (Google, ICML 2023). A genialidade: validar N tokens via 1 forward é igual em custo a validar 1 token (FLOPs dominados pelos pesos lidos uma vez). Se draft acerta a maioria, o speedup é ~N. O algoritmo de aceitação preserva exatamente a distribuição do target — sem perda de qualidade.',
  },
  {
    question: 'Como funciona o critério de aceitação que garante "exact same distribution"?',
    options: [
      'Aceita se draft é igual ao argmax target',
      'Aceita token i com probabilidade min(1, p_target(x_i) / p_draft(x_i)); se rejeita, sample do residual (p_target - p_draft)+ — Leviathan provou que essa regra de rejection sampling produz distribuição idêntica ao target puro, independente do draft',
      'Sempre aceita os primeiros 3 tokens',
      'Usa beam search',
    ],
    correct: 1,
    explanation:
      'Esse é o coração matemático do paper. Rejection sampling clássico aplicado token a token. Resultado: a saída do speculative decoding é estatisticamente indistinguível da saída do target sozinho — só mais rápida. Não é aproximação, não é trade-off de qualidade.',
  },
  {
    question: 'O que é EAGLE-2 e como difere de speculative decoding clássico?',
    options: [
      'Um modelo maior treinado pela Google',
      'Treina um draft head específico em cima das hidden states da camada penúltima do target (não um modelo separado) — usa árvore de tokens candidatos (não cadeia linear) com dynamic tree expansion baseada em confidence. Resultado: 3-5× speedup vs 1.5-2× do clássico',
      'Apenas EAGLE original com bug fix',
      'Variant de Medusa',
    ],
    correct: 1,
    explanation:
      'EAGLE (Li et al., 2024) e EAGLE-2/3 (Beijing+Stanford 2024) representam o estado da arte 2025-2026 em speculative. Em vez de draft model separado, treinam um "auto-regression head" que prediz a próxima hidden state (não token), recombinando com lm_head do target. Tree-based: cada step expande múltiplas continuações concorrentes, validando todas em paralelo.',
  },
  {
    question: 'Medusa (Cai et al., 2024) — qual a diferença?',
    options: [
      'Igual a EAGLE',
      'Adiciona N "Medusa heads" ao modelo target — cada head prediz o token N posições à frente (não próxima hidden state). Não precisa de modelo draft separado, mas precisa fine-tune do target para treinar os heads. Speedup 2-3×',
      'Apenas para vision models',
      'Quantização agressiva',
    ],
    correct: 1,
    explanation:
      'Medusa (Cai et al., Princeton/Together AI 2024) adiciona heads paralelos no top do target. Mais simples que EAGLE (não precisa modelar hidden states). Custa fine-tune do modelo final. Tree attention escolhe a melhor continuação entre as predições paralelas. Boa opção quando você controla o modelo e pode treinar os heads.',
  },
  {
    question: 'Quando speculative decoding NÃO ajuda?',
    options: [
      'Sempre ajuda',
      'Texto altamente imprevisível para o draft (criptografia, código random, idiomas raros para o draft), draft muito pesado em relação ao target (>~1/15 dos params anula o ganho), batch size grande onde GPU já está saturada (não há FLOPs ociosos para "pagar" os candidatos)',
      'Apenas em modelos pequenos',
      'Em FP16',
    ],
    correct: 1,
    explanation:
      'Speculative explora FLOPs ociosos: em decoding single-batch, GPU usa 5-15% dos FLOPs (memory-bound). Em batch grande já saturado, validar N candidatos custa proporcional. Em texto não-previsível (low draft acceptance rate), o overhead do draft come o ganho. Acceptance rate <40% costuma virar overhead líquido.',
  },
  {
    question: 'Como ativar speculative em vLLM, llama.cpp e MLX?',
    options: [
      'Só funciona em transformers HuggingFace',
      'vLLM: --speculative-model + --num-speculative-tokens; llama.cpp: binário llama-speculative com -md draft.gguf --draft N; MLX: mlx_lm.server com --draft-model. Em todos, draft e target devem compartilhar tokenizer',
      'Apenas via API OpenAI',
      'Não é suportado em produção',
    ],
    correct: 1,
    explanation:
      'Todos os engines mainstream suportam. Requisito-chave: mesmo tokenizer (Llama 3.2 1B + Llama 3.1 70B funciona; Llama + Mistral não). Configurações ótimas variam: vLLM ~5 tokens, llama.cpp ~8, MLX ~4-6. Sempre validar acceptance rate (vLLM expõe via /metrics).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="speculative-decoding"
      title="Speculative decoding: 2-3x speedup grátis"
      icon="🎯"
      xp={70}
      readTime={14}
      trailName="Local LLMs & Edge AI"
      trailColor={ACCENT}
      nextSlug="mlx-apple-silicon"
      nextTitle="MLX: rodar LLM nativo em M3/M4 Apple Silicon"
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
        Em julho de 2023, Leviathan, Kalman e Matias (Google Research) publicaram{' '}
        <em>"Fast Inference from Transformers via Speculative Decoding"</em> na ICML. O paper resolveu um problema
        que parecia fundamental: decoding autoregressive é inerentemente sequencial — cada token depende do
        anterior. A genialidade foi notar que <strong>a maioria dos tokens é fácil</strong>: um modelo 50× menor
        consegue prever a continuação correta na maior parte do tempo. Validar essa previsão custa quase nada.
        Resultado: 2-3× speedup sem mexer no modelo, sem perder qualidade.
      </p>

      <Section title="Por que decoding é lento" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em uma GPU H100 com Llama 3.1 70B em FP16, gerar 1 token leva ~30ms. Disso, <strong>99% é tempo de
          mover pesos da HBM para SRAM</strong> — apenas 1% é compute real. A GPU está ociosa 99% do tempo
          processando matemática que cabe num celular. É memory-bound, não compute-bound.
        </p>
        <AnnotatedFormula
          title="Arithmetic intensity (FLOPs / bytes lidos)"
          accent={ACCENT}
          formula="AI_decode ≈ 2 (1 multiply-add por peso lido por token);  AI_GPU ≈ 200+"
          parts={[
            { text: 'AI_decode', annotation: 'baixíssimo — 2 FLOPs/byte' },
            { text: 'AI_GPU', annotation: 'H100 precisa 200+ para saturar', highlight: true },
            { text: 'ratio 1:100', annotation: '99% do tempo movendo pesos', highlight: true },
          ]}
        />
        <Callout tone="info">
          Essa diferença é o que speculative explora. Validar 5 tokens em paralelo via 1 forward não custa 5× — os
          pesos são lidos UMA vez e fazem 5× mais trabalho. O custo extra é desprezível em decoding single-batch.
        </Callout>
      </Section>

      <Section title="Algoritmo: draft + validate + accept" accent={ACCENT}>
        <FlowDiagram
          accent={ACCENT}
          title="Speculative decoding clássico (Leviathan, ICML 2023)"
          orientation="vertical"
          steps={[
            { icon: '⚡', label: '1. Draft gera N tokens', desc: 'modelo pequeno (ex: 1B) gera tokens x₁..xₙ sequencialmente, rapidamente' },
            { icon: '🔍', label: '2. Target valida em 1 forward', desc: 'target (ex: 70B) processa x₀, x₁..xₙ; retorna prob_target para cada posição' },
            { icon: '🎲', label: '3. Aceita por rejection sampling', desc: 'para cada i: aceita com prob min(1, p_t/p_d). Para o primeiro rejeitado, sample do residual' },
            { icon: '➕', label: '4. Bonus token', desc: 'se aceitou todos N, gera grátis o (n+1)-ésimo via prob target já computada' },
            { icon: '🔁', label: '5. Repete', desc: 'novo ciclo de draft+validate' },
          ]}
        />
        <CodeBlock lang="python">{`# Speculative decoding — implementação conceitual
import torch

def speculative_decode(target, draft, prompt, max_tokens=200, gamma=5):
    """gamma = quantos tokens o draft propõe por iteração"""
    tokens = prompt.clone()
    generated = 0

    while generated < max_tokens:
        # 1. Draft gera gamma tokens auto-regressivamente
        draft_tokens = []
        draft_probs = []
        x = tokens.clone()
        for _ in range(gamma):
            logits = draft(x)[:, -1]
            probs = logits.softmax(-1)
            tok = torch.multinomial(probs, 1)
            draft_tokens.append(tok)
            draft_probs.append(probs.gather(-1, tok))
            x = torch.cat([x, tok], dim=-1)

        draft_tokens = torch.cat(draft_tokens, dim=-1)  # [batch, gamma]

        # 2. Target valida todos em 1 forward
        candidate = torch.cat([tokens, draft_tokens], dim=-1)
        target_logits = target(candidate)[:, -gamma-1:]  # logits nas posições candidatas
        target_probs = target_logits.softmax(-1)

        # 3. Aceitação token a token
        accepted = 0
        for i in range(gamma):
            tok = draft_tokens[:, i]
            p_t = target_probs[:, i].gather(-1, tok.unsqueeze(-1)).squeeze()
            p_d = draft_probs[i].squeeze()
            r = torch.rand_like(p_t)

            if r < min(1.0, p_t / p_d):
                # aceita
                tokens = torch.cat([tokens, tok.unsqueeze(-1)], dim=-1)
                accepted += 1
                generated += 1
            else:
                # rejeita: sample do residual (p_t - p_d)+
                residual = torch.relu(target_probs[:, i] - draft_probs[i])
                residual = residual / residual.sum()
                new_tok = torch.multinomial(residual, 1)
                tokens = torch.cat([tokens, new_tok], dim=-1)
                generated += 1
                break

        # 4. Bonus token se aceitou todos
        if accepted == gamma and generated < max_tokens:
            bonus = torch.multinomial(target_probs[:, -1], 1)
            tokens = torch.cat([tokens, bonus], dim=-1)
            generated += 1

    return tokens`}</CodeBlock>
        <Callout tone="warn">
          A regra <InlineCode>min(1, p_t/p_d)</InlineCode> é o que preserva a distribuição. Não é "aceite se draft
          está confiante" ou "aceite se top-1 bate" — é rejection sampling probabilístico exato. Qualquer outra
          regra introduz viés de qualidade.
        </Callout>
      </Section>

      <Section title="Escolha do draft model" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Target', 'Draft recomendado', 'Acceptance rate típica', 'Speedup esperado']}
          rows={[
            ['Llama 3.1 70B', 'Llama 3.2 1B-Instruct (Q8)', '70-85% em texto técnico', '2.2-2.8×'],
            ['Llama 3.1 70B', 'Llama 3.2 3B-Instruct', '78-90%', '2.0-2.5× (draft mais pesado)'],
            ['Llama 3.1 405B', 'Llama 3.1 8B', '60-75%', '1.8-2.4×'],
            ['Qwen 2.5 72B', 'Qwen 2.5 0.5B ou 1.5B', '65-80%', '2.0-2.7×'],
            ['Mistral Large 2', 'Mistral 7B (mesmo tokenizer)', '55-70%', '1.5-2.0×'],
            ['DeepSeek V3 (MoE)', 'EAGLE head treinado', '80-92%', '3-5× (EAGLE)'],
          ]}
        />
        <Callout tone="info">
          <strong>Regra prática</strong>: draft com 1-3% dos parâmetros do target costuma ser o sweet spot. Draft
          muito pequeno (0.1%) tem acceptance rate baixa; muito grande (10%) come o ganho com seu próprio custo.
          Sempre meça com tráfego real antes de fixar gamma.
        </Callout>
      </Section>

      <Section title="EAGLE: state of the art 2025-2026" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>EAGLE</strong> (Li et al., 2024; v2/v3 em 2024-2025) representa o estado da arte. Em vez de
          treinar um modelo draft inteiro separado, treina um <strong>auto-regression head</strong> compacto que
          prediz a próxima <strong>hidden state</strong> (não token) baseada em hidden states anteriores e
          embeddings de tokens já gerados. Compartilha o lm_head do target.
        </p>
        <StackFlow
          title="EAGLE-2 — arquitetura"
          accent={ACCENT}
          items={[
            { icon: '🎯', label: 'Target model (frozen)', sub: 'Llama 70B, Qwen 72B, DeepSeek V3 — extrai hidden states' },
            { icon: '🪶', label: 'EAGLE head (~10-20M params)', sub: 'pequena rede que prediz próxima hidden state' },
            { icon: '🌳', label: 'Tree expansion', sub: 'cada step propõe múltiplas continuações via top-k branching' },
            { icon: '⚡', label: 'Tree attention validation', sub: 'target valida toda a árvore em 1 forward com attention masked' },
            { icon: '✂️', label: 'Path selection', sub: 'escolhe melhor caminho válido por rejection sampling' },
          ]}
        />
        <Callout tone="info">
          EAGLE-3 (2025) chega a 4-6× speedup em Llama 3.1 70B com acceptance rate de 90%+. vLLM 0.6+ suporta
          EAGLE nativamente. O custo: treinar o head (~1 GPU-day numa A100). Para quem controla o modelo final,
          é o ganho mais barato disponível.
        </Callout>
      </Section>

      <Section title="Medusa: heads paralelos no target" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Cai et al. (Princeton, Together AI 2024)</strong> propuseram Medusa: adicionar K heads ao
          target. Head 1 prediz token na posição t+1 (normal). Head 2 prediz t+2 dado o estado em t. Head k
          prediz t+k. Em decoding: target faz 1 forward, todos K heads geram em paralelo — produzindo K
          candidatos. Tree attention seleciona a continuação válida.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Draft separado?', 'Treina target?', 'Speedup típico', 'Quando preferir']}
          rows={[
            ['Speculative clássico', 'Sim (modelo menor)', 'Não', '1.5-2.5×', 'Modelos OSS já existentes; gratuito'],
            ['Medusa', 'Não (heads no target)', 'Sim (fine-tune heads)', '2-3×', 'Você controla o target; simples'],
            ['EAGLE-2/3', 'Não (head compacto)', 'Sim (treina head)', '3-6×', 'Quer ganho máximo; tem GPU para treinar'],
            ['Lookahead decoding', 'N-grams locais', 'Não', '1.3-1.8×', 'Zero treino; speedup modesto'],
            ['SpS / Self-speculation', 'Mesmo modelo com layers skip', 'Não', '1.3-1.7×', 'Não tem modelo draft compatível'],
          ]}
        />
      </Section>

      <Section title="Ativação prática nos engines" accent={ACCENT}>
        <CodeBlock lang="bash">{`# vLLM com speculative decoding clássico
vllm serve meta-llama/Meta-Llama-3.1-70B-Instruct \\
    --tensor-parallel-size 4 \\
    --speculative-model meta-llama/Llama-3.2-1B-Instruct \\
    --num-speculative-tokens 5 \\
    --use-v2-block-manager \\
    --enable-prefix-caching

# vLLM com EAGLE
vllm serve meta-llama/Meta-Llama-3.1-70B-Instruct \\
    --speculative-model yuhuili/EAGLE-LLaMA3.1-70B \\
    --speculative-draft-tensor-parallel-size 1 \\
    --num-speculative-tokens 5

# llama.cpp — binário dedicado
./llama-speculative \\
    -m models/llama-3.1-70b-Q4_K_M.gguf \\
    -md models/llama-3.2-1b-Q8_0.gguf \\
    --draft 8 \\
    --gpu-layers 80 --gpu-layers-draft 16 \\
    -p "Explique consenso Raft em sistemas distribuídos."

# MLX (Apple Silicon)
mlx_lm.server \\
    --model mlx-community/Meta-Llama-3.1-70B-Instruct-4bit \\
    --draft-model mlx-community/Llama-3.2-1B-Instruct-4bit \\
    --num-draft-tokens 5`}</CodeBlock>
      </Section>

      <Section title="Métricas: o que medir" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Acceptance rate (α)', v: 'fração de tokens draft aceitos. <40% = overhead líquido, ajustar draft' },
            { k: 'Mean accepted length', v: 'tokens aceitos por iteração. Esperado: γ·α + 1 (bonus)' },
            { k: 'Speedup vs baseline', v: 'tokens/s com spec / tokens/s sem spec; ground truth do ganho' },
            { k: 'Latency overhead per rejection', v: 'em rejeições altas, custa o draft sem ganhar; medir p99' },
            { k: 'Draft compute fraction', v: 'tempo no draft / tempo total. <10% ideal' },
            { k: 'Output distribution drift', v: 'KS test ou MMD em outputs com/sem spec — DEVE ser ~0' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Speculative funciona em batch size grande?"
          a="Não tão bem. Em batch grande, a GPU já está saturada e validar N candidatos extras custa proporcional ao N. Speculative brilha em batch=1 ou pequeno, onde há FLOPs ociosos. vLLM por default desativa speculative quando batch atinge certo threshold."
        />
        <QAItem
          q="Como saber se draft e target compartilham tokenizer?"
          a={<>Cheque <InlineCode>tokenizer.json</InlineCode> ou <InlineCode>tokenizer.model</InlineCode> — deve ter mesmo vocab size e mesmas merges. Llama 3.x family compartilha (1B, 3B, 8B, 70B, 405B). Llama 3 ≠ Llama 2 (vocab diferente: 128k vs 32k). Sempre validar com hash do tokenizer antes de prod.</>}
        />
        <QAItem
          q="Speculative + quantização?"
          a="Compatíveis. Target em INT4 (AWQ/GPTQ) com draft em INT8 ou FP16 funciona — quantização afeta as probabilities mas o critério de aceitação se ajusta. Speedups combinam multiplicativamente: 4× de INT4 × 2.2× de spec ≈ 8.8× tokens/s vs FP16 sem spec."
        />
        <QAItem
          q="Speculative reduz custo OU latência?"
          a="Ambos, mas principalmente latência (TTFT e ITL). Custo por token cai proporcional ao speedup, então sim — custo também cai. Em serving SaaS, isso significa mais requests/GPU sem trocar hardware."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Speculative paper', v: 'Leviathan, Kalman, Matias, "Fast Inference from Transformers via Speculative Decoding", ICML 2023, arXiv:2211.17192' },
            { k: 'Concurrent work (DeepMind)', v: 'Chen et al., "Accelerating LLM Inference with Speculative Sampling", arXiv:2302.01318' },
            { k: 'Medusa', v: 'Cai et al., "Medusa: Simple LLM Inference Acceleration Framework with Multiple Decoding Heads", arXiv:2401.10774' },
            { k: 'EAGLE', v: 'Li et al., "EAGLE: Speculative Sampling Requires Rethinking Feature Uncertainty", arXiv:2401.15077' },
            { k: 'EAGLE-2', v: 'Li et al., "EAGLE-2: Faster Inference of Language Models with Dynamic Draft Trees", arXiv:2406.16858' },
            { k: 'Lookahead decoding', v: 'Fu et al., "Break the Sequential Dependency of LLM Inference Using Lookahead Decoding", arXiv:2402.02057' },
          ]}
        />
      </Section>
    </div>
  );
}
