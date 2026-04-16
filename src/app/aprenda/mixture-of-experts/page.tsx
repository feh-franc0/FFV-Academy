import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'Mixture of Experts (MoE) — FFV Academy',
  description: 'O que é Mixture of Experts, como funciona o roteamento de experts, Mixtral e modelos MoE explicados.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a principal vantagem do Mixture of Experts?',
    options: [
      'Reduz o número total de parâmetros do modelo',
      'Ativa apenas uma fração dos parâmetros por token, tornando modelos grandes mais eficientes',
      'Elimina a necessidade de GPU',
      'Permite treinar modelos sem dados',
    ],
    correct: 1,
    explanation: 'MoE tem muitos parâmetros no total, mas ativa apenas alguns "experts" por token. Um modelo de 200B parâmetros pode ter custo computacional equivalente a 20B parâmetros densos.',
  },
  {
    question: 'O que é o "router" em um modelo MoE?',
    options: [
      'Um componente de rede que conecta servidores',
      'A camada que decide quais experts são ativados para cada token',
      'O otimizador que treina os experts',
      'Um tipo de função de ativação',
    ],
    correct: 1,
    explanation: 'O router é uma pequena rede que recebe o token e decide quais experts (geralmente 2 de N) vão processá-lo. O router também é treinado — aprende a rotear bem.',
  },
  {
    question: 'Por que MoE é mais barato para rodar mesmo tendo mais parâmetros?',
    options: [
      'Porque usa menos memória RAM',
      'Porque cada token ativa apenas uma fração dos parâmetros (sparse activation)',
      'Porque os experts compartilham todos os pesos',
      'Porque usa quantização automática',
    ],
    correct: 1,
    explanation: 'Ativação esparsa: para cada token, apenas 2-8 experts são ativados de dezenas ou centenas. O custo computacional é proporcional aos experts ativados, não ao total de parâmetros.',
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
      trailName="IA Além do LLM"
      trailColor="#d2a8ff"
      nextSlug="tool-calling"
      nextTitle="Tool Calling e Agentes"
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
        Um modelo com 200 bilhões de parâmetros que não cabe numa GPU de 3090? Com Mixture of Experts, isso não é um problema — porque o modelo nunca ativa tudo ao mesmo tempo.
      </p>

      <Section title="O problema: modelos ficaram grandes demais">
        <p>
          Um modelo denso ("dense") usa <em>todos</em> os parâmetros para processar cada token. Um modelo de 200B parâmetros em fp16 precisa de ~400GB de VRAM — impossível para uma ou mesmo várias GPUs consumer.
        </p>
        <div className="p-3 rounded text-xs" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p style={{ color: 'var(--ffv-orange)' }}>Modelo denso 200B: 200B × 2 bytes = ~400GB VRAM</p>
          <p className="mt-1" style={{ color: 'var(--ffv-green)' }}>Mesmo com 4-bit quant: ~100GB — ainda requer múltiplas GPUs topo</p>
        </div>
      </Section>

      <Section title="A solução: divisão de trabalho">
        <p>
          MoE substitui as camadas Feed-Forward densas por um conjunto de <strong>experts especializados</strong> + um <strong>router</strong>. Para cada token, o router escolhe apenas 2-8 experts dos N disponíveis.
        </p>
        <div className="p-4 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <div className="text-xs font-mono" style={{ color: 'var(--ffv-muted)' }}>
            <p>Token: "fotossíntese"</p>
            <p className="mt-2">Router ativa:</p>
            <p style={{ color: 'var(--ffv-purple)' }}>  → Expert 3 (biologia/ciências)  · peso: 0.7</p>
            <p style={{ color: 'var(--ffv-purple)' }}>  → Expert 11 (química/reações)   · peso: 0.3</p>
            <p className="mt-1" style={{ color: 'var(--ffv-muted)' }}>  Experts 1,2,4-10,12-N: ignorados ✗</p>
          </div>
        </div>
      </Section>

      <Section title="Mixtral: o primeiro MoE open source de sucesso">
        <p>
          O <strong>Mixtral 8x7B</strong> (Mistral AI, 2023) demonstrou MoE na prática:
        </p>
        <div className="flex flex-col gap-2 text-xs">
          {[
            { label: 'Total de parâmetros', val: '~47B', color: '#ffa657' },
            { label: 'Parâmetros ativos por token', val: '~13B (2 de 8 experts)', color: '#58a6ff' },
            { label: 'Custo computacional equivalente', val: 'modelo ~13B denso', color: '#3fb950' },
            { label: 'Performance', val: 'supera LLaMA 2 70B em benchmarks', color: '#d2a8ff' },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center p-2 rounded" style={{ background: 'var(--ffv-bg3)' }}>
              <span style={{ color: 'var(--ffv-muted)' }}>{item.label}</span>
              <span className="font-semibold" style={{ color: item.color }}>{item.val}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Desafios do MoE">
        <p>MoE não é perfeito:</p>
        <ul className="flex flex-col gap-2 ml-4">
          <li>⚠️ <strong>Memória:</strong> todos os parâmetros precisam estar na VRAM (só a computação é esparsa)</li>
          <li>⚠️ <strong>Load balancing:</strong> o router pode sobrecarregar alguns experts e ignorar outros</li>
          <li>⚠️ <strong>Treinamento instável:</strong> mais difícil de treinar que modelos densos</li>
        </ul>
        <Callout>
          Suspeita-se que o GPT-4 e o Gemini Ultra usem arquitetura MoE internamente — embora a OpenAI e a Google não confirmem oficialmente.
        </Callout>
      </Section>

      <Callout>
        No próximo módulo: <strong>Tool Calling</strong> — como a IA aprendeu a usar ferramentas externas e se transformou em agentes.
      </Callout>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full inline-block" style={{ background: '#d2a8ff' }} />
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl flex gap-3" style={{ background: 'rgba(210,168,255,0.08)', border: '1px solid rgba(210,168,255,0.2)' }}>
      <span className="text-xl flex-shrink-0">💡</span>
      <p className="text-sm">{children}</p>
    </div>
  );
}
