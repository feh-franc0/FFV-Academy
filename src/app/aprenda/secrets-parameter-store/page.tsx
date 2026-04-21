import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, ComparisonTable, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('secrets-parameter-store');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando escolher Secrets Manager em vez de Parameter Store?',
    options: [
      'Sempre',
      'Quando precisa rotation automática (RDS/Redshift native rotation), cross-account sharing, replication cross-region. $0.40/secret/mês vs Parameter Store gratuito (std) — vale pagar se rotation é requisito',
      'Apenas em Lambda',
      'Nunca',
    ],
    correct: 1,
    explanation: 'Secrets Manager tem rotation Lambda nativa pra RDS/Redshift/DocDB. Parameter Store é mais barato mas não tem rotation automática. Para secrets dinâmicos (DB passwords rotating), use Secrets Manager; para config estática, Parameter Store.',
  },
  {
    question: 'Qual a diferença entre Parameter Store String vs SecureString?',
    options: [
      'Nome',
      'String: plaintext (OK pra config não sensível: feature flag, URL, env). SecureString: encrypted com KMS — só principals com kms:Decrypt lêem',
      'SecureString é deprecated',
      'Ambos encrypted',
    ],
    correct: 1,
    explanation: 'String armazenado em plaintext em DynamoDB underlying. SecureString: cliente criptografa com KMS key (default aws/ssm ou CMK). Lê com WithDecryption=true. Parameter Store advanced tier permite $ maiores.',
  },
  {
    question: 'Como Lambda Extensions ajuda secrets?',
    options: [
      'Nada',
      'AWS Parameters and Secrets Lambda Extension (2021) cacheia secrets/params localmente — drasticamente reduz latency + cost (evita call a cada invocation)',
      'Só em Java',
      'Substitui Secrets Manager',
    ],
    correct: 1,
    explanation: 'Sem extension: cada Lambda invocation chama Secrets Manager (50-200ms extra + API cost). Extension roda HTTP local, cacheia secret (TTL configurável). Lambda faz GET localhost:2773 → blazingly fast. Ideal pra rotation graceful (TTL curto).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="secrets-parameter-store"
      title="Secrets Manager vs Parameter Store: escolha"
      icon="🔐"
      xp={45}
      readTime={10}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="ecs-fargate-para-dev"
      nextTitle="ECS Fargate pra dev: quando escolher vs Lambda"
      quiz={quiz}
    >
      <Section title="Comparação" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Feature', 'Parameter Store (std)', 'Parameter Store (adv)', 'Secrets Manager']}
          rows={[
            ['Preço', 'Grátis', '$0.05/param/mês', '$0.40/secret/mês'],
            ['Tamanho', '4KB', '8KB', '64KB'],
            ['Rotation nativa', 'Não', 'Não', 'Sim (RDS/etc)'],
            ['Cross-account', 'Limitado', 'Limitado', 'Sim (resource policy)'],
            ['Replication', 'Não', 'Não', 'Sim (cross-region)'],
            ['TTL', 'Não', 'Não', 'N/A'],
            ['CloudFormation/CDK', 'Sim', 'Sim', 'Sim'],
          ]}
        />
      </Section>

      <Section title="Hierarchy organizada" accent={accent}>
        <Callout tone="info" icon="💡">
          Parameter Store suporta hierarchy: <code>/app/prod/db/host</code>. Get-parameters-by-path puxa tudo de um prefix. Padrão pra config env-aware. Combine com IAM resource-level permissions.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
