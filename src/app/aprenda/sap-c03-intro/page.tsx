import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('sap-c03-intro');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Como os 4 domínios do SAP-C03 se distribuem em peso?',
    options: [
      'Todos 25%',
      'Design Solutions 26%, New Solutions 29%, Migration Planning 20%, Continuous Improvement 25% — sem domínio abaixo de 20%, exige estudo equilibrado',
      'Design 50%',
      'Migration 60%',
    ],
    correct: 1,
    explanation: 'A banca balanceia pra evitar que candidato decore só um eixo. New Solutions (29%) puxa levemente porque é onde entram decisões arquiteturais greenfield. Migration (20%) é o menor mas cai sempre — ignorar 7 Rs, DMS e Migration Hub é recorrente motivo de reprovação.',
  },
  {
    question: 'Qual é a estratégia de tempo correta no SAP-C03?',
    options: [
      'Ler rápido e chutar',
      '75 questões em 180min ≈ 2min20s por questão. Primeira passada elimina distratores óbvios, marca dúvidas; segunda passada foca nas marcadas. Questões de 250+ palavras exigem ler requisitos (RPO, RTO, custo, compliance) antes das opções',
      'Resolver tudo em ordem',
      'Pular longas',
    ],
    correct: 1,
    explanation: 'A armadilha do SAP é questão densa com 4 opções todas tecnicamente válidas — o diferencial está em "most cost-effective", "least operational overhead" ou "meets RPO of 5 minutes". Ler requisitos antes das opções evita viés de confirmação na primeira alternativa que pareceu boa.',
  },
  {
    question: 'Qual pré-requisito realista antes de encarar SAP-C03?',
    options: [
      'Nenhum',
      'SAA-C03 sólido (não só aprovado, compreendido) + 2 anos hands-on AWS cobrindo multi-account, networking, IAM avançado. Estudo dedicado 3-6 meses com labs reais, não só flashcards',
      'Só cloud practitioner',
      'Curso de 1 semana',
    ],
    correct: 1,
    explanation: 'SAP é a prova mais densa do catálogo AWS. Quem tenta sem base em SAA + experiência em produção cai em questões sobre Transit Gateway routing, SCP inheritance, Landing Zone customization — conceitos que não se decoram, se internalizam usando.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="sap-c03-intro"
      title="SAP-C03 intro: domínios, pesos e estratégia"
      icon="🎯"
      xp={40}
      readTime={10}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="organizations-control-tower"
      nextTitle="Organizations, Control Tower e Landing Zone"
      quiz={quiz}
    >
      <Section title="Anatomia do exame" accent={accent}>
        <p>
          O SAP-C03 tem 75 questões, 180 minutos, passing score 750/1000 (escala não-linear). Idioma disponível em PT-BR, mas a qualidade da tradução varia — candidatos experientes preferem fazer em inglês pra evitar ambiguidade em termos como "pilot light" ou "warm standby" que perdem nuance traduzidos.
        </p>
        <CodeBlock lang="yaml">{`Domínios e pesos (oficial AWS):
  Design Solutions for Organizational Complexity: 26%
  Design for New Solutions:                        29%
  Continuous Improvement for Existing Solutions:   25%
  Accelerate Workload Migration & Modernization:   20%

Duração:         180 minutos
Questões:        75 (multiple choice + multiple response)
Passing score:   750 / 1000
Validade:        3 anos
Preço:           USD 300 (ou equivalente em BRL)`}</CodeBlock>
      </Section>

      <Section title="Como o SAP pensa diferente do SAA" accent={accent}>
        <p>
          SAA pergunta "qual serviço AWS resolve X?". SAP pergunta "dado cenário multi-account com 3 regiões, requisitos de RPO 1h, orçamento X, compliance HIPAA, qual combinação de serviços entrega com menor overhead operacional e trade-off justificado?". Raramente há uma única resposta objetivamente correta — há a menos ruim dado o contexto.
        </p>
        <Callout tone="warn" icon="⚠️">
          Leia os requisitos antes das opções. Marque em papel rascunho: RPO, RTO, budget constraint, compliance, número de contas. Depois leia as 4 opções filtrando por esses critérios. Invertendo a ordem você se apaixona pela primeira alternativa plausível.
        </Callout>
      </Section>

      <Section title="Plano de estudos 3-6 meses" accent={accent}>
        <p>
          Semanas 1-4: revisão profunda de SAA (não flashcards — construir VPCs, rodar Organizations em sandbox). Semanas 5-12: cada domínio do SAP em profundidade, com labs (Control Tower deployment, Transit Gateway hub-and-spoke, DMS migration real). Semanas 13-18: simulados cronometrados (Tutorials Dojo, AWS Official Practice) + review de erros com documentação oficial. Semana final: revisar Well-Architected whitepapers.
        </p>
        <Callout tone="success" icon="📚">
          O currículo desta trilha mapeia 1:1 com os domínios do SAP-C03. Cada módulo termina com cenário estilo exame. Capstone final é simulado comentado cobrindo os 4 domínios.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
