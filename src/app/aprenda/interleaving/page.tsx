import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, DecisionBox, QAItem, ArchDiagram } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Interleaving: por que misturar tópicos é melhor — FFV Academy',
  description: 'Interleaving vs blocking: a contraintuitiva descoberta de Rohrer & Taylor (2007) — misturar temas parece pior no curto prazo, mas é superior no longo. Como aplicar.',
};

const ACCENT = '#3fb950';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "blocking" e o que é "interleaving"?',
    options: [
      'São sinônimos',
      'Blocking = estudar um tópico até exaustão antes do próximo. Interleaving = alternar entre vários tópicos na mesma sessão',
      'Blocking é pra iniciante, interleaving pra avançado',
      'Interleaving é revisar antes de dormir',
    ],
    correct: 1,
    explanation: 'Blocking: 1h de A, depois 1h de B, depois 1h de C. Interleaving: blocos de 15 min alternando A-B-C-A-B-C. Parece menos eficiente mas forças o cérebro a discriminar contextos — isso gera retenção muito maior.',
  },
  {
    question: 'Por que interleaving se sente "pior" durante o estudo mas produz mais resultado?',
    options: [
      'Porque consome mais calorias',
      'Porque exige o cérebro identificar qual técnica/conceito aplicar a cada problema — esse esforço discriminatório é o que fixa',
      'Porque reduz a fadiga',
      'Porque quebra a monotonia',
    ],
    correct: 1,
    explanation: 'Em blocking, depois do 5º problema similar, seu cérebro automatiza a resposta sem pensar. Em interleaving, cada problema força "qual conceito se aplica aqui?" — essa recuperação do tipo certo é o skill real. Por isso desempenho de treino ↓ mas de prova ↑.',
  },
  {
    question: 'Qual foi o resultado do estudo de Rohrer & Taylor (2007) com problemas de matemática?',
    options: [
      'Blocking e interleaving deram o mesmo resultado',
      'Grupo blocking acertou 89% no treino e 20% no teste; grupo interleaving acertou 60% no treino e 63% no teste',
      'Interleaving só funciona para matemática',
      'Só diferença em adultos, não em crianças',
    ],
    correct: 1,
    explanation: 'Esse é o paradoxo clássico: blocking gera desempenho ALTO no treino (confunde com domínio) e desempenho BAIXO no teste. Interleaving parece medíocre no treino mas triplica a nota na prova. Foi replicado em música, esporte, medicina e ensino K-12.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="interleaving"
      title="Interleaving: por que misturar tópicos é melhor"
      icon="🔀"
      xp={45}
      readTime={8}
      trailName="Como Aprender"
      trailColor={ACCENT}
      nextSlug="deep-work-pomodoro"
      nextTitle="Deep Work + Pomodoro: foco real em mundo distraído"
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
        Você está estudando para uma prova de AWS. Tem 3 tópicos: IAM, VPC, S3. O instinto diz: <em>&ldquo;dedico 2 horas a cada um, separado, até
        dominar&rdquo;</em>. É o jeito mais confortável — e é cientificamente <strong>pior</strong>. A pesquisa mostra que alternar entre tópicos
        (<em>interleaving</em>) produz retenção e capacidade de aplicação significativamente maiores que estudar em blocos (<em>blocking</em>), apesar
        de parecer menos eficiente enquanto você pratica. É uma das descobertas mais contraintuitivas da psicologia do aprendizado — e uma das mais
        bem replicadas.
      </p>

      <Section title="O estudo que expôs o paradoxo" accent={ACCENT}>
        <p>
          Rohrer e Taylor (2007) deram a estudantes problemas de matemática sobre 4 figuras geométricas (cubo, cone, cilindro, pirâmide). Grupo A estudou
          por blocos (cubo-cubo-cubo-cubo, depois cone-cone-cone, etc.). Grupo B fez interleaving (cubo, cone, pirâmide, cilindro, cubo, cone...). No
          treino:
        </p>
        <ArchDiagram title="Desempenho: treino vs teste" accent={ACCENT}>{`
  Acerto (%)
  100 ┤ ●──── Blocking: 89%
      │    \\                          ● Interleaving: 63%
   80 ┤     \\                       /
      │      \\                     /
   60 ┤       \\                   ● Interleaving: 60%
      │        \\                 /
   40 ┤         \\               /
      │          \\             /
   20 ┤           ●── Blocking: 20%
      │
    0 ┼──────────┬─────────────┬─────→
           Durante o treino      Teste 1 semana depois
        `}</ArchDiagram>
        <Callout tone="warn">
          Blocking: 89% no treino → 20% no teste. <strong>Queda de 69 pontos.</strong><br/>
          Interleaving: 60% no treino → 63% no teste. <strong>Estável.</strong><br/>
          A sensação de &ldquo;estou indo bem&rdquo; em blocking é ilusão de domínio pura.
        </Callout>
      </Section>

      <Section title="Por que funciona: discriminação de contexto" accent={ACCENT}>
        <p>
          Saber resolver &ldquo;um problema de cone&rdquo; é fácil <em>quando você acabou de ver 5 problemas de cone</em>. O skill real é outro: dado um
          problema novo, identificar <strong>que é de cone</strong>, escolher a fórmula certa, aplicar. Blocking nunca treina essa identificação —
          você já sabe que é cone porque o bloco inteiro é. Interleaving força o cérebro a toda iteração perguntar: &ldquo;Qual categoria? Qual fórmula?
          Qual abordagem?&rdquo; Essa discriminação é exatamente o que a prova (e a vida real) exigem.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Em blocking você treina...', 'Em interleaving você treina...']}
          rows={[
            ['Aplicar a fórmula X com eficiência', 'Reconhecer QUANDO usar a fórmula X'],
            ['Automatizar a execução', 'Discriminar entre contextos parecidos'],
            ['Confiança (que pode ser falsa)', 'Flexibilidade cognitiva'],
            ['Ótimo pra decorar passo-a-passo fixo', 'Ótimo pra resolver problema inédito'],
          ]}
        />
      </Section>

      <Section title="Onde interleaving já foi comprovado" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Área', 'Estudo', 'Ganho vs blocking']}
          rows={[
            ['Matemática (volume de sólidos)', 'Rohrer & Taylor 2007', '+43 pontos no teste'],
            ['Música (reconhecer compositores)', 'Kornell & Bjork 2008', '+80% de acerto'],
            ['Beisebol (tipos de pitch)', 'Hall et al. 1994', '+57% em jogo real'],
            ['Medicina (diagnóstico de EKG)', 'Hatala et al. 2003', '+35% em casos novos'],
            ['Programação (padrões de design)', 'Eilam et al. 2014 (replicado em CS ed)', '+30% em tasks inéditos'],
          ]}
        />
        <Callout tone="info">
          Nenhum desses estudos falhou em replicação. É um dos achados mais robustos da pesquisa educacional — ainda assim, ~95% dos livros didáticos
          continuam organizados em blocos (porque blocking é mais fácil de ensinar e <em>parece</em> mais lógico).
        </Callout>
      </Section>

      <Section title="Como aplicar interleaving no seu estudo" accent={ACCENT}>
        <p>Regras práticas, da mais leve à mais agressiva:</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Intensidade', 'Como fazer', 'Onde cabe']}
          rows={[
            ['Leve', 'Alterne 3 tópicos em 1 sessão: 20 min A → 20 min B → 20 min C → 10 min A', 'Estudos diários'],
            ['Médio', 'Mistura de exercícios: faça lista com problemas de várias fontes, não apenas do capítulo atual', 'Resolução de exercícios'],
            ['Agressivo', 'Flashcards de tópicos diferentes no mesmo deck (AWS IAM + VPC + S3 + segurança misturados)', 'SRS diário — já é o default do Anki/Hub'],
            ['Máximo', 'Simulados completos com todos os tópicos a cada 2 semanas — vai mal, mas treina discriminação', 'Preparação p/ certificação'],
          ]}
        />
        <DecisionBox
          scenario="Preparando pra certificação AWS SAA-C03 em 60 dias"
          winner="Interleaving: 1 módulo novo de cada domínio/dia (computação, rede, storage, DB) + SRS misturado"
          winnerColor={ACCENT}
          why="SAA-C03 pergunta cenários que combinam VPC + S3 + IAM + Lambda simultâneo. Estudar em blocos te faz expert em cada ilha, mas ruim em problemas multi-domínio. Interleaving é isomorfo ao exame."
          alternatives={[{ name: 'Blocking (1 semana cada domínio)', note: 'passa na primeira leitura mas esquece os primeiros ao chegar no 4º.' }]}
        />
      </Section>

      <Section title="Quando NÃO usar interleaving" accent={ACCENT}>
        <p>
          Interleaving não substitui exposição inicial. Se você nunca viu um tópico, precisa de <strong>uma passagem em bloco</strong> pra entender a
          estrutura básica. Só aí vale alternar. A regra:
        </p>
        <Callout tone="info">
          <strong>Primeira passagem:</strong> blocking (conhecer o tópico) · <strong>Prática e revisão:</strong> interleaving · <strong>Automação de
          sub-skill muito específica:</strong> blocking curto (ex: decorar atalhos do Vim, fechar acorde no violão) · <strong>Revisão espaçada:</strong>
          sempre interleaved (SRS já faz isso).
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'Use']}
          rows={[
            ['Primeiro contato com o tópico', 'Blocking — estrutura primeiro'],
            ['Praticando exercícios após entender', 'Interleaving — discriminação'],
            ['Memorizando lista fixa (tabela periódica, atalhos)', 'Blocking curto + SRS'],
            ['Revisando conteúdo antigo', 'Interleaving sempre'],
            ['Prova/simulação', 'Interleaving máximo'],
          ]}
        />
      </Section>

      <Section title="Interleaving + spacing: o combo natural" accent={ACCENT}>
        <p>
          Quando você faz SRS (revisão espaçada), está automaticamente fazendo interleaving — a fila mistura cards de todos os tópicos que você já
          aprendeu. Essa é uma das razões pelas quais SRS é tão poderoso: você pensa que só está revisando, mas está treinando discriminação ao mesmo
          tempo. Adicionar Anki/Hub FFV na rotina é o caminho mais preguiçoso de ganhar interleaving automático.
        </p>
        <Callout tone="success">
          Um dia na sua fila do Hub: 1 card de IAM, 1 de Transformers, 1 de KV Cache, 1 de VPC, 1 de Feynman. Parece caos, é exatamente o ponto.
        </Callout>
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Interleaving é a mesma coisa que multitasking?"
          a="NÃO. Multitasking = dividir atenção entre 2 atividades simultâneas (degrada tudo). Interleaving = foco total em uma coisa, trocar depois de um bloco completo. É sequencial com variedade, não paralelo."
        />
        <QAItem
          q="Minha cabeça fica bagunçada misturando tópicos. Como lidar?"
          a={<>A bagunça é o ponto — é a &ldquo;desejável dificuldade&rdquo; do Bjork. Se está fácil, você não está aprendendo. Comece com 2 tópicos e expanda. Depois de 2-3 semanas, o &ldquo;cansaço&rdquo; vira fluência em troca de contexto.</>}
        />
        <QAItem
          q="Vale pra aprender um idioma?"
          a={<>Sim e é uma das aplicações mais fortes: misturar vocabulário de vários campos semânticos (comida + viagem + trabalho) retém muito mais que decorar 100 palavras de &ldquo;frutas&rdquo; de uma vez. Duolingo é interleaved by design.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> interleaving parece pior no treino, é melhor no teste · força o cérebro a discriminar contextos · use blocking só
        na primeira exposição · SRS já faz interleaving automaticamente · aceite a desconfortável sensação de estar indo mal — é o som de estar
        aprendendo. Misturar é a nova ordem.
      </Callout>
    </div>
  );
}
