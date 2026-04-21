import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('kms-encryption-dev');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é envelope encryption?',
    options: [
      'Criptografia envelope-shaped',
      'Padrão: CMK (master key) criptografa DEK (data encryption key); DEK criptografa os dados. Dados nunca saem de plaintext no KMS. Rotaciona CMK → só re-encrypt DEKs (rápido), não todos os dados',
      'Algoritmo específico',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Envelope: data → encrypted by DEK (local) → DEK itself encrypted by CMK (KMS). Dados armazenados com EncryptedDEK attached. Pra ler: call KMS pra decrypt DEK → decrypt data local. Padrão AWS inteiro (S3 SSE-KMS, RDS, EBS).',
  },
  {
    question: 'Qual a diferença entre AWS-managed key e CMK?',
    options: [
      'Cosmético',
      'AWS-managed: criado/rotacionado pela AWS, visível como "aws/s3" etc. Gratuito. CMK (customer-managed): você cria, controla policy, rotation (anual opcional), logs em CloudTrail. Cobra $1/mês + $0.03/10k calls',
      'Mesma coisa em 2026',
      'CMK é só enterprise',
    ],
    correct: 1,
    explanation: 'AWS-managed é default implícito (transparente pro dev). CMK você precisa quando: compliance exige ownership da key, precisa controlar quem usa (KMS policy), rotation schedule próprio, imports de key material (BYOK) ou CloudHSM.',
  },
  {
    question: 'Como KMS policy interage com IAM policy?',
    options: [
      'KMS overrides IAM',
      'AMBOS devem permitir (intersecção). KMS key policy é OBRIGATÓRIA (default grant a root da conta). IAM policy adiciona permissão mas não pode conceder o que key policy nega',
      'IAM é único',
      'KMS ignora IAM',
    ],
    correct: 1,
    explanation: 'Key policy default: só root da conta. Pra outros principals usarem, precisa EITHER key policy grant OR (key policy delegate to IAM + IAM permit). Clássico pegadinha DVA: IAM allow kms:Decrypt mas key policy não permite → access denied.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="kms-encryption-dev"
      title="KMS: envelope encryption e quando usar CMK"
      icon="🔏"
      xp={50}
      readTime={11}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="cicd-aws-nativo"
      nextTitle="CI/CD AWS-nativo: CodeBuild, CodeDeploy e CodePipeline"
      quiz={quiz}
    >
      <Section title="Operações essenciais" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>GenerateDataKey</strong>: KMS retorna plaintext DEK + encrypted DEK. Use DEK local pra criptografar (AES-256-GCM), armazene encrypted DEK junto.</li>
          <li><strong>Encrypt</strong>: KMS criptografa payload pequeno (max 4KB). Uso raro — quase sempre envelope via GenerateDataKey.</li>
          <li><strong>Decrypt</strong>: KMS descriptografa encrypted DEK (ou encrypted payload pequeno). Retorna plaintext.</li>
          <li><strong>Rotate</strong>: automática yearly opcional. AWS mantém histórico pra decrypt antigos. Zero impact em dados existentes.</li>
        </ul>
      </Section>

      <Section title="Quando CloudHSM" accent={accent}>
        <Callout tone="info" icon="💡">
          KMS é multi-tenant FIPS 140-2 Level 2. CloudHSM é single-tenant Level 3 — sua HSM dedicada, FIPS nível hardware. Caro ($1.60/hora). Uso: compliance PCI/financial estrito, custom algorithms, TLS offloading com key material próprio.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
