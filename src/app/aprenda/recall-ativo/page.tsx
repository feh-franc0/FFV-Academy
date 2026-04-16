import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, DecisionBox, QAItem, ArchDiagram } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Recall Ativo: por que reler é quase inútil — FFV Academy',
  description: 'Recall ativo vs reler: a ciência por trás dos quizzes e flashcards. Testing effect de Roediger & Karpicke, retrieval practice e o protégé effect.',
};

const ACCENT = '#3fb950';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre reconhecer e lembrar?',
    options: [
      'São sinônimos',
      'Reconhecer é passar o olho e achar familiar; lembrar é trazer da memória sem pista visual — e só lembrar constrói retenção',
      'Reconhecer dá mais XP que lembrar',
      'Reconhecer é mais difícil que lembrar',
    ],
    correct: 1,
    explanation: 'Reler gera sensação de familiaridade (reconhecimento) que o cérebro confunde com domínio — é a "ilusão de fluência". Recall ativo (fechar o livro e tentar reproduzir o conceito) é o teste real: se conseguiu lembrar sem pista, está lá.',
  },
  {
    question: 'No estudo clássico de Roediger & Karpicke (2006), estudantes que estudaram + fizeram quizzes retiveram, em 1 semana, aproximadamente:',
    options: [
      'O mesmo que quem só releu',
      'Metade do que quem só releu (recall causa estresse)',
      'Quase o dobro do que quem só releu o mesmo conteúdo o mesmo número de vezes',
      'Só 10% a mais',
    ],
    correct: 2,
    explanation: 'No experimento original, 80% vs 42% de retenção em 7 dias. Grupo "testado" (quiz) > grupo "relido" (re-estudo) apesar de ambos terem o mesmo tempo de exposição. Esse é o testing effect — um dos achados mais replicados da psicologia cognitiva.',
  },
  {
    question: 'O que é o "protégé effect"?',
    options: [
      'Um algoritmo de recomendação',
      'Ensinar algo força organização mental superior — aprende-se mais preparando-se para ensinar do que estudando para uma prova',
      'Um bug comum em estudantes iniciantes',
      'Uma técnica de motivação externa',
    ],
    correct: 1,
    explanation: 'Quando você estuda "para ensinar alguém", sua mente organiza melhor, busca analogias, identifica lacunas. Experimentos mostram que mesmo só acreditar que ensinará produz maior aprendizado (Nestojko et al., 2014). Base da Técnica Feynman.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="recall-ativo"
      title="Recall Ativo: por que reler é quase inútil"
      icon="🎯"
      xp={45}
      readTime={8}
      trailName="Como Aprender"
      trailColor={ACCENT}
      nextSlug="tecnica-feynman"
      nextTitle="Técnica Feynman: se não explica, não entendeu"
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
        Você já terminou um livro e, três dias depois, não conseguia explicar o capítulo 4 sem abri-lo? Bem-vindo à <strong>ilusão de fluência</strong>.
        Reler, grifar e até tomar nota geram uma sensação enganosa de que você sabe — porque o texto parece <em>familiar</em>. Mas familiaridade não é
        conhecimento. O cérebro só consolida de verdade o que <strong>recupera</strong>, não o que reconhece. Esse é o núcleo do <em>recall ativo</em>, a
        técnica mais poderosa depois da revisão espaçada — e a que pavimenta o caminho pra ela funcionar.
      </p>

      <Section title="O experimento que deveria ter mudado a escola" accent={ACCENT}>
        <p>
          Roediger e Karpicke (2006) dividiram estudantes em dois grupos. Ambos estudaram um texto. Depois, um grupo <strong>releu</strong> o texto;
          outro <strong>fez mini-testes</strong> sobre ele. Cinco minutos depois, o grupo que releu lembrava mais. Uma semana depois, a situação
          inverteu drasticamente:
        </p>
        <ArchDiagram title="Retenção em função do tempo e da técnica" accent={ACCENT}>{`
  Retenção (%)
  100 ┤    ●───╮
      │         ╲
   80 ┤          ●─────── Testing group (quiz) ──────────●  80%
      │           ╲                                       │
   60 ┤            ╲                                      │
      │             ╲                                     │
   40 ┤              ●──── Reread group ──────────────────●  42%
      │
   20 ┤
      │
    0 ┼─────┬────────────────────────┬──────────────────────→
      5 min                        2 dias                 7 dias
        `}</ArchDiagram>
        <Callout tone="info">
          Os grupos tiveram <strong>o mesmo tempo de exposição</strong> ao conteúdo. A diferença foi só o modo de processar: recuperação ativa (testing)
          vs re-estudo. O <strong>testing effect</strong> foi replicado centenas de vezes desde então.
        </Callout>
      </Section>

      <Section title="Por que reler é tão tentador (e tão ruim)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Você sente', 'O que realmente aconteceu', 'Retenção real']}
          rows={[
            ['"Já sei isso, reconheci rápido"', 'Familiaridade visual — cérebro registrou que JÁ VIU, não que SABE', '~25% em 7 dias'],
            ['"Grifei o importante"', 'Transferiu atenção para marca-texto, mas não processou', '~30%'],
            ['"Fiz resumo"', 'Melhor que reler — se for do zero, sem consultar', '~55%'],
            ['"Fechei o livro e tentei explicar"', 'Recall ativo puro — força reconstrução', '~75%'],
            ['"Respondi quiz após estudar"', 'Testing effect + spacing', '~85-95% com SRS'],
          ]}
        />
      </Section>

      <Section title="Como praticar recall ativo na vida real" accent={ACCENT}>
        <p>Você não precisa de ferramenta nenhuma. As 4 formas mais eficazes, do mais leve ao mais intenso:</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Quando', 'Esforço']}
          rows={[
            ['Blurting', 'Ao fim de cada capítulo, feche o livro e escreva tudo que lembra', 'Baixo'],
            ['Pergunta-resposta', 'Enquanto estuda, converta cada parágrafo em 1 pergunta e responda no dia seguinte', 'Médio'],
            ['Flashcards (Anki, Hub)', 'Pra conceitos discretos que precisam virar automático', 'Médio'],
            ['Ensinar para alguém real ou imaginário', 'Ao fim de um tópico grande — expõe TODOS os buracos', 'Alto'],
          ]}
        />
        <Callout tone="warn">
          <strong>Armadilha clássica:</strong> ler o capítulo, sentir que entendeu, passar pro próximo. Sem recall no meio, você só aumenta a ilusão.
          Faça sempre o <em>blurting</em> antes de virar página.
        </Callout>
      </Section>

      <Section title="O protégé effect: aprender pra ensinar" accent={ACCENT}>
        <p>
          Nestojko et al. (2014) pediram a dois grupos que estudassem um texto. Grupo A foi dito &ldquo;depois vai responder um teste&rdquo;. Grupo B: &ldquo;depois
          vai ensinar esse conteúdo a outro aluno&rdquo;. <strong>Nenhum dos dois grupos de fato ensinou ou foi testado.</strong> Mas o grupo que
          acreditava que ensinaria reteve significativamente mais. Só a <em>intenção</em> de ensinar reorganizou o processamento mental.
        </p>
        <Callout tone="success">
          Aplicação prática: antes de estudar qualquer coisa nova, diga em voz alta &ldquo;vou explicar isso para [alguém específico] amanhã&rdquo;. Seu
          cérebro passa a processar com outro filtro — busca conexões, analogias, pontos fracos.
        </Callout>
      </Section>

      <Section title="Recall ativo + revisão espaçada = combo imbatível" accent={ACCENT}>
        <p>
          Recall ativo fixa <em>mais forte</em>. Revisão espaçada fixa <em>pelo tempo certo</em>. Juntos, formam o método com maior evidência científica
          já estudado. É o que Anki, SuperMemo, RemNote e o seu Hub FFV fazem: cada revisão é uma pergunta (recall ativo) agendada no intervalo ótimo
          (spacing effect).
        </p>
        <DecisionBox
          scenario="Tenho 1 hora por semana pra estudar um tópico novo"
          winner="50 min lendo/processando novo + 10 min blurting + 5 min/dia SRS"
          winnerColor={ACCENT}
          why="Melhor um estudo inicial denso + recall frequente curto que 60 min lineares de leitura. Retenção vs esforço é brutalmente favorável."
          alternatives={[{ name: '60 min de leitura', note: '~30% retido em 1 semana.' }, { name: '1h Pomodoro sem recall', note: 'cansa mais, retém pouco.' }]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Fazer quiz dá medo de errar — prejudica o aprendizado?"
          a="Errar é a parte onde mais se aprende — desde que veja a resposta certa em seguida (feedback imediato). Carpenter (2009) mostrou que errar + ver resposta > acertar sem esforço. O estresse é sobre avaliação externa, não sobre o processo."
        />
        <QAItem
          q="Posso só reler textos que escrevi (resumos, notas)?"
          a={<>Reler suas próprias notas cai na mesma armadilha da ilusão de fluência — você reconhece SEU texto. O truque é usar as notas como <strong>base para gerar perguntas</strong>, responder sem consultar, e depois checar.</>}
        />
        <QAItem
          q="Vale a pena fazer quiz antes de estudar o material?"
          a={<>SIM — é a <strong>pretestagem</strong>. Errar tudo antes de ler parece inútil mas ativa um modo de &ldquo;procurar resposta&rdquo; durante a leitura, aumentando retenção (Richland et al., 2009). Quizzes de entrada funcionam bem.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> reconhecer ≠ lembrar · reler cria ilusão de domínio · recall ativo dobra retenção · combine com SRS pra efeito máximo
        · ensinar (real ou imaginário) é a forma mais densa de recall. Comece simples: feche o livro ao fim de cada seção e escreva do zero o que lembra.
      </Callout>
    </div>
  );
}
