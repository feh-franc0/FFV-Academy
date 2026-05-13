import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('carreira-tecnica-vs-gestao');
const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "dual ladder" e por que empresas sérias adotam?',
    options: [
      'Programa de treinamento',
      'Duas trilhas de carreira paralelas com salário e impacto equivalentes: IC (Staff/Principal/Distinguished) e Manager (EM/Director/VP). Sem ela, senior que quer crescer é forçado a virar gestor — perde engenheiro, ganha gestor ruim',
      'Escada de promoção dupla',
      'Política de RH apenas',
    ],
    correct: 1,
    explanation: 'Sem dual ladder, a única forma de progredir compensação é virar manager. Resultado: engenheiro sênior que ama código e odeia gerenciar pessoas vira gestor medíocre por salário, perdendo dois papéis ao mesmo tempo. Empresas como Google, Meta, Stripe reconhecem desde IC3 até Distinguished/Fellow com pacotes iguais ou superiores ao management track equivalente. Staff engineer top em 2026 ganha mais que muito VP.',
  },
  {
    question: 'Qual é o principal indicador de que você se encaixa melhor no IC track que no Manager?',
    options: [
      'Não gostar de pessoas',
      'Sua energia vem de resolver problema técnico profundo; sua pior semana é aquela cheia de 1:1s sem tempo de código; você se frustra mais com decisão errada de arquitetura do que com processo mal rodado. Gerenciar drena, codar recarrega',
      'Ser tímido',
      'Ganhar mais',
    ],
    correct: 1,
    explanation: 'Teste honesto: qual atividade te deixa com energia ao final da semana? Manager energiza-se em conversas, desbloquear pessoas, alinhamento político. IC energiza em flow técnico, design profundo, pairing em problema difícil. Não é sobre capacidade (bom IC PODE ser bom manager), é sobre o que sustenta sua motivação em 5 anos. Gestão feita sem gostar é castigo pra você e pra quem você gerencia.',
  },
  {
    question: 'Como Staff/Principal engineer "entrega impacto" sem escrever tanto código quanto antes?',
    options: [
      'Só dá opinião',
      'Alavancagem via: ADRs que orientam N times, code reviews que ensinam padrões, mentoria que multiplica seniors, documentos técnicos que alinham decisões, protótipos que destravam, code crítico estratégico (não rotineiro). Escreve menos linhas, cada uma com mais peso',
      'Só vai a reunião',
      'Perde produtividade',
    ],
    correct: 1,
    explanation: 'Mudança de função: de "executor direto" pra "multiplicador". 1000 linhas de protótipo que destrava uma decisão de $2M valem 10000 linhas de feature normal. Framework "technical radar" que guia 5 times por 6 meses vale mais que 3 meses codando solo. ADR que evita migração errada de DB economiza trimestre inteiro. Se Staff continua codando no mesmo volume de Senior, provavelmente não está sendo Staff.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="carreira-tecnica-vs-gestao"
      title="Carreira técnica vs gestão: escolha consciente"
      icon="🛤️"
      xp={50}
      readTime={12}
      trailName="Tech Leadership & Staff Engineering"
      trailColor={accent}
      nextSlug="capstone-adr-completo"
      nextTitle="Capstone: ADR completo de decisão real"
      quiz={quiz}
    >
      <Section title="O falso dilema histórico" accent={accent}>
        <p>
          Até ~2010, carreira técnica em empresa grande tinha teto baixo: pra crescer salário, tinha que virar gestor. Resultado: exército de gestores que não queriam gerenciar e engenheiros frustrados. Empresas de tecnologia modernas — Google, Meta, Stripe, Netflix, e hoje muitas brasileiras — operam com <strong>dual ladder</strong>: IC track (Individual Contributor) e Manager track com progressão e compensação equivalentes.
        </p>
      </Section>

      <Section title="Dual ladder típico" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Nível', 'IC Track', 'Manager Track']}
          rows={[
            ['L4', 'Engineer (mid)', '—'],
            ['L5', 'Senior Engineer', 'Engineering Manager'],
            ['L6', 'Staff Engineer', 'Senior Manager'],
            ['L7', 'Senior Staff / Principal', 'Director'],
            ['L8', 'Distinguished / Fellow', 'Senior Director / VP'],
          ]}
        />
        <Callout tone="info" icon="📊">
          Compensação em 2026 (BR remoto em big tech USA): Staff ~$280k–400k, Principal ~$400k–600k total. Director equivalente. Fellow/Distinguished: $600k+. IC track não é carreira menor — é carreira diferente.
        </Callout>
      </Section>

      <Section title="O que realmente muda dia-a-dia" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Dimensão', 'IC senior (Staff/Principal)', 'Manager (EM/Director)']}
          rows={[
            ['Output primário', 'Decisões técnicas, ADRs, mentoria', 'Pessoas produtivas, processo saudável'],
            ['% de código', '30–60% (Staff) → 10–30% (Principal)', '0–10%'],
            ['Reuniões', 'Revisões técnicas, design, arquitetura', '1:1s, all-hands, stakeholders'],
            ['Avaliado por', 'Impacto técnico multi-time', 'Saúde do time, delivery, retention'],
            ['Recarrega com', 'Deep work, pairing, design', 'Conversas, desbloqueios, alinhamento'],
            ['Drena com', 'Política, reuniões intermináveis', 'Conflito interpessoal, performance issues'],
          ]}
        />
      </Section>

      <Section title="Teste honesto consigo" accent={accent}>
        <p>
          Responda sem filtro social. Olhando sua última semana, quais dias tiveram mais energia ao fim? Os com reunião e gente? Ou os com código e problema difícil? Responda uma sexta no espelho. É o sinal mais confiável.
        </p>
        <Callout tone="warn" icon="⚠️">
          Armadilha comum: aceitar promoção pra manager por pressão (dinheiro, status, &quot;todo mundo faz isso&quot;) sem gostar. Em 12–18 meses aparece burn-out, performance de time cai, sua saúde mental também. Voltar pra IC é possível mas custa — melhor recusar no começo.
        </Callout>
      </Section>

      <Section title="Caminho não é linear" accent={accent}>
        <p>
          Muita gente alterna: 3 anos Staff, 2 anos EM, volta pra Principal. Chamam &quot;engineering manager / tech lead manager&quot; em algumas empresas. Não é fraqueza — é autoconhecimento. Carreira longa (30+ anos) cabe experimentação. Só não fique preso num track que drena.
        </p>
        <Callout tone="success" icon="✅">
          Staff/Principal engineer reconhecido em 2026 é figura respeitada: voz em arquitetura, mentor público, escreve ADRs lidos pelo org inteiro. Vale tanto quanto Director — e evita call de 6 feira com stakeholder irritado.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
