import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, KeyValue, DecisionBox } from '@/components/article/primitives';

export const metadata = getModuleMetadata('hardware-llm-comparativo');

const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Mac M3/M4 Ultra é competitivo para LLMs locais?',
    options: [
      'Tem mais GPUs',
      'Unified memory (até 192GB no M3 Ultra) — CPU e GPU compartilham mesma RAM com bandwidth altíssimo (~800 GB/s). Permite rodar modelos 70B+ que não cabem em VRAM de RTX. Trade-off: tokens/s menor que NVIDIA top-tier',
      'Custa menos que um Raspberry Pi',
      'Não é competitivo',
    ],
    correct: 1,
    explanation: 'Apple Silicon é a opção para "rodar modelo grande" sem comprar H100. M3 Ultra 192GB ($7k) roda Llama 3.3 70B em FP16 confortavelmente. Velocidade ~30-50 tok/s — menor que RTX 5090 para modelos pequenos, mas RTX 5090 nem cabe Llama 70B FP16 (32GB VRAM).',
  },
  {
    question: 'RTX 5090 (32GB VRAM) é melhor que A100 40GB para LLM local?',
    options: [
      'Sempre',
      'Para modelos quantizados que cabem em 32GB (Qwen 2.5 14B Q4, Llama 3.3 8B FP16): sim, frequentemente — Blackwell architecture, mais tokens/s, US$2k. Para modelos maiores ou treino: A100/H100 com mais VRAM e ECC ganha.',
      'Nunca',
      'Apenas para gaming',
    ],
    correct: 1,
    explanation: 'RTX 5090 (Blackwell, 32GB GDDR7) é o sweet spot indie 2026: barato (~$2k), rápido (~150 tok/s em modelos médios). Limitação: 32GB VRAM corta modelos 70B+ FP16. Use quantizado ou parta para A100/H100/Apple Silicon.',
  },
  {
    question: 'AMD Ryzen AI Max+ (até 128GB unified) é alternativa real?',
    options: [
      'Não existe',
      'Sim — chip APU AMD com unified memory similar à Apple, mas em x86. Roda Llama 70B Q4 confortavelmente, custo ~50% do Mac equivalente, mas ROCm/HIP ainda menos maduro que CUDA. Bom valor para quem aceita curva',
      'Apenas em servidor',
      'Mais caro que H100',
    ],
    correct: 1,
    explanation: 'AMD Strix Halo (Ryzen AI Max+) lançou 2025 com unified memory até 128GB. Hardware sólido, software ecosystem ROCm/HIP ainda imaturo vs CUDA. llama.cpp roda bem; vLLM tem suporte limitado. Boa opção valor.',
  },
  {
    question: 'DGX Spark / DGX Station 2026 é para qual perfil?',
    options: [
      'Hobby',
      'Workstation high-end / lab: Blackwell GPU + memória unificada larga + ECC + suporte NVIDIA. Preço $30k-100k+. Para empresas que querem treinar/inferir modelos grandes em casa sem usar cloud. Indie/SaaS solo não precisa.',
      'Smartphones',
      'Servidor web',
    ],
    correct: 1,
    explanation: 'DGX Spark (anunciado 2025) é o "personal AI supercomputer" da NVIDIA — combina GB10 Grace-Blackwell, NVLink, memória robusta. Faz sentido para lab corporativo. Solo founder/hobbyista é overkill.',
  },
  {
    question: 'Quando NÃO comprar GPU própria em 2026?',
    options: [
      'Sempre comprar',
      'Quando uso é intermitente (<4h/dia GPU equivalente), quando você testa muitos modelos diferentes (catálogo > posse), quando latência cold-start é tolerável, quando time é pequeno e tempo de operação custa caro',
      'Nunca comprar',
      'Apenas em fim de ano',
    ],
    correct: 1,
    explanation: 'Cálculo real: GPU própria amortiza em 12-18 meses para uso sustentado >12h/dia. Abaixo disso, APIs (Replicate, fal.ai, RunPod) ganham. Considere também: depreciação rápida (Blackwell B100/B200 saiu, A100 perdeu valor).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="hardware-llm-comparativo"
      title="Hardware LLM 2026: Mac M3 Ultra vs RTX 5090 vs DGX"
      icon="🔌"
      xp={55}
      readTime={11}
      trailName="Local LLMs & Edge AI"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O cenário em maio/2026" accent={accent}>
        <p className="text-sm leading-6">
          Você quer rodar LLM local sério. Quatro caminhos principais: Apple Silicon (unified memory), RTX consumer (CUDA performance), AMD APU (alternativa valor), data center NVIDIA (A100/H100/B200). Escolha errada custa caro — literal e em tempo perdido com driver issues.
        </p>
      </Section>

      <Section title="A tabela definitiva" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Hardware', 'RAM/VRAM', 'Bandwidth', 'Modelo max prático', 'Tok/s típico', 'Preço (USD)']}
          rows={[
            ['MacBook M4 Pro 48GB', '48GB unified', '~273 GB/s', 'Qwen 2.5 32B Q4', '~30 tok/s', '~$3k'],
            ['Mac Studio M3 Ultra 96GB', '96GB unified', '~800 GB/s', 'Llama 3.3 70B Q4', '~25 tok/s', '~$5k'],
            ['Mac Studio M3 Ultra 192GB', '192GB unified', '~800 GB/s', 'Llama 3.3 70B FP16', '~15 tok/s', '~$7k'],
            ['RTX 4090 24GB', '24GB VRAM', '1008 GB/s', 'Qwen 2.5 14B Q4', '~120 tok/s', '~$1.6k (used)'],
            ['RTX 5090 32GB', '32GB VRAM (GDDR7)', '~1.8 TB/s', 'Qwen 2.5 32B Q4', '~150 tok/s', '~$2k'],
            ['AMD Ryzen AI Max+ 128GB', '128GB unified', '~256 GB/s', 'Llama 3.3 70B Q4', '~15 tok/s', '~$3k'],
            ['NVIDIA A100 80GB', '80GB HBM', '2 TB/s', 'Llama 3.3 70B FP16', '~60 tok/s', '~$10k (used)'],
            ['NVIDIA H100 80GB', '80GB HBM3', '3.35 TB/s', 'Llama 3.3 70B FP16', '~100 tok/s', '~$25-30k'],
            ['DGX Spark / GB10', '128GB unified', '~700+ GB/s', 'Llama 3.3 70B FP16+', '~80 tok/s', '~$3-4k'],
          ]}
        />
        <Callout tone="info">
          Bandwidth importa mais que TFLOPs para inferência LLM em batch-1 (decoding bottleneck = memory bandwidth, não compute).
        </Callout>
      </Section>

      <Section title="Decisão por perfil" accent={accent}>
        <DecisionBox
          scenario="Indie / dev solo, modelo único, < $3k"
          winner="MacBook M4 Pro 48GB ou Mac Mini M4 Pro"
          winnerColor={accent}
          why="Silencioso, portátil, unified memory, dev experience perfeita, fan barato"
          alternatives={[
            { name: 'RTX 5090 + PC', note: 'Se já tem PC, mais tok/s mas barulho/calor' },
            { name: 'Cloud (Replicate/fal)', note: 'Se uso < 4h/dia' },
          ]}
        />
        <DecisionBox
          scenario="Quero rodar Llama 70B FP16 em casa"
          winner="Mac Studio M3 Ultra 192GB"
          winnerColor={accent}
          why="Único hardware <$10k que roda 70B FP16 confortavelmente, baixo ruído"
          alternatives={[
            { name: 'A100 80GB usado', note: 'Mais tok/s, mas ruidoso, caro de operar' },
            { name: 'AMD Ryzen AI Max+ 128GB', note: '50% do preço; ROCm imaturo' },
          ]}
        />
        <DecisionBox
          scenario="Time pequeno fazendo fine-tune"
          winner="RTX 5090 (treina até ~14B com tricks)"
          winnerColor={accent}
          why="Blackwell + tensor cores otimizados, bom valor"
          alternatives={[
            { name: 'Cloud (Modal, RunPod)', note: 'Treina em A100/H100 pay-per-second' },
            { name: 'A100 80GB usado', note: 'Mais VRAM, treina modelos maiores' },
          ]}
        />
      </Section>

      <Section title="Pitfalls de hardware" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Apple Silicon não treina bem ainda', v: 'MLX melhorou mas vLLM/Axolotl ainda preferem CUDA. Treino sério → NVIDIA' },
            { k: 'PSU para RTX 5090', v: '1000W+ 80+ Gold. Subdimensionar = shutdown em load' },
            { k: 'Cooling em rack home', v: 'A100 / H100 são turbinas — case adequado + AC' },
            { k: 'Driver hell Linux', v: 'NVIDIA driver + CUDA + cuDNN — versões importam. Use containers' },
            { k: 'Apple Silicon limites de framework', v: 'PyTorch MPS backend vs CUDA: ainda gaps em alguns ops' },
            { k: 'Custo de energia', v: 'H100 sustained = ~700W contínuo. Some kWh × meses → conta de luz cresce' },
          ]}
        />
      </Section>

      <Section title="Encerrando — trilha Local LLMs & Edge AI" accent={accent}>
        <Callout tone="success" icon="🎓">
          Badge <b>Edge AI Engineer</b> desbloqueado. Você conhece quantização, motores de inferência, hardware, RAG local, avaliação offline — stack completa para rodar LLM sério sem depender de API externa.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
