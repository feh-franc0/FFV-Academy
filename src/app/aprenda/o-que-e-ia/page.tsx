import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';

export const metadata: Metadata = {
  title: 'O que é Inteligência Artificial? — FFV Academy',
  description: 'Entenda o que é IA de verdade, sem buzzwords. Definição clara, exemplos práticos e histórico.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'O que melhor define Inteligência Artificial?',
    options: [
      'Um robô que parece humano',
      'Sistemas que realizam tarefas que normalmente exigiriam inteligência humana',
      'Um computador muito rápido',
      'Software que nunca erra',
    ],
    correct: 1,
    explanation: 'IA é o campo que cria sistemas capazes de executar tarefas que, tipicamente, requerem inteligência humana — como reconhecer padrões, tomar decisões e aprender com dados.',
  },
  {
    question: 'Qual destes é um exemplo real de IA no dia a dia?',
    options: [
      'Uma calculadora somando números',
      'Um termostato que liga o ar quando faz calor',
      'Recomendações de filmes do Netflix',
      'Um relógio digital',
    ],
    correct: 2,
    explanation: 'O sistema de recomendação do Netflix aprende com seus hábitos e os de milhões de usuários para prever o que você vai querer assistir — isso é aprendizado de máquina.',
  },
  {
    question: 'Machine Learning é:',
    options: [
      'Um sinônimo exato de Inteligência Artificial',
      'Uma subárea da IA que aprende a partir de dados',
      'Programação tradicional com regras fixas',
      'Hardware especial para processar imagens',
    ],
    correct: 1,
    explanation: 'ML é um subconjunto da IA. Em vez de programar regras manualmente, o sistema aprende padrões a partir de exemplos (dados de treinamento).',
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
      trailColor="#58a6ff"
      nextSlug="dados-o-combustivel"
      nextTitle="Dados: o Combustível"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7" style={{ color: 'var(--foreground)' }}>
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        IA não é magia, não é ficção científica e não vai destruir o mundo amanhã. É tecnologia — e tecnologia que você pode entender de verdade.
      </p>

      <Section title="A definição real">
        <p>
          <strong>Inteligência Artificial</strong> é o campo da ciência da computação que cria sistemas capazes de executar tarefas que, normalmente, exigiriam inteligência humana. Reconhecer rostos, traduzir textos, jogar xadrez, gerar imagens, responder perguntas.
        </p>
        <p>
          A confusão começa porque IA é um <em>guarda-chuva enorme</em>. Dentro dele cabem coisas bem diferentes:
        </p>
        <ul className="flex flex-col gap-2 ml-4">
          <li>🔹 <strong>Machine Learning (ML)</strong> — sistemas que aprendem a partir de dados</li>
          <li>🔹 <strong>Deep Learning</strong> — ML usando redes neurais profundas</li>
          <li>🔹 <strong>LLMs</strong> — modelos de linguagem como GPT e Claude</li>
          <li>🔹 <strong>Computer Vision</strong> — IA que "enxerga" e interpreta imagens</li>
        </ul>
      </Section>

      <Section title="IA vs. programação tradicional">
        <p>Na programação clássica, você escreve as regras. Exemplo:</p>
        <CodeBlock>{`SE temperatura > 30°C
  ENTÃO ligar ar-condicionado`}</CodeBlock>
        <p>Na IA, você fornece <strong>exemplos</strong> e o sistema aprende as regras sozinho:</p>
        <CodeBlock>{`// Dados de treinamento (milhares de registros)
{ temperatura: 32, umidade: 80 } → ligar
{ temperatura: 20, umidade: 50 } → não ligar
// O modelo descobre o padrão por conta própria`}</CodeBlock>
        <p>
          Isso é poderoso porque existem problemas onde escrever as regras manualmente é impossível — como reconhecer um gato em 10 milhões de fotos diferentes.
        </p>
      </Section>

      <Section title="Por que agora?">
        <p>IA existe desde os anos 1950. O que mudou nos últimos anos foram três fatores combinados:</p>
        <div className="grid gap-3 mt-2">
          {[
            { icon: '💾', title: 'Dados', desc: 'A internet gerou quantidades absurdas de texto, imagens e comportamento humano para treinar modelos.' },
            { icon: '⚡', title: 'Poder computacional', desc: 'GPUs e TPUs tornaram viável treinar modelos com bilhões de parâmetros.' },
            { icon: '🧠', title: 'Algoritmos', desc: 'A arquitetura Transformer (2017) revolucionou como modelos processam linguagem.' },
          ].map(item => (
            <div key={item.title} className="flex gap-3 p-4 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <span className="text-xl">{item.icon}</span>
              <div>
                <strong className="text-sm">{item.title}</strong>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ffv-muted)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="O que IA não é">
        <p>Algumas coisas que você provavelmente já ouviu e são imprecisas:</p>
        <ul className="flex flex-col gap-2 ml-4">
          <li>❌ <strong>"IA pensa como humano"</strong> — não. Ela processa padrões estatísticos em dados.</li>
          <li>❌ <strong>"IA vai substituir tudo"</strong> — vai mudar muita coisa. Substituir tudo? Improvável.</li>
          <li>❌ <strong>"IA é sempre certa"</strong> — modelos alucinam, erram e têm vieses.</li>
          <li>✅ <strong>O que é real:</strong> IA é uma ferramenta extraordinariamente poderosa para tarefas específicas.</li>
        </ul>
      </Section>

      <Callout>
        No próximo módulo, vamos entender o ingrediente mais importante de qualquer IA: os <strong>dados</strong>. Sem dados bons, nenhum modelo funciona — não importa quão sofisticado seja o algoritmo.
      </Callout>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full inline-block" style={{ background: '#58a6ff' }} />
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="p-4 rounded-lg text-xs overflow-x-auto" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-green)', fontFamily: 'var(--font-geist-mono)' }}>
      {children}
    </pre>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl flex gap-3" style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)' }}>
      <span className="text-xl flex-shrink-0">💡</span>
      <p className="text-sm" style={{ color: 'var(--foreground)' }}>{children}</p>
    </div>
  );
}
