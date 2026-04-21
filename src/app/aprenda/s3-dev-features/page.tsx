import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('s3-dev-features');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é Presigned URL em S3?',
    options: [
      'URL pré-compilada',
      'URL assinada temporariamente que permite upload/download direto do client sem expor credenciais AWS. Server gera, client usa por tempo limitado (min/horas)',
      'URL criptografada',
      'URL encurtada',
    ],
    correct: 1,
    explanation: 'Padrão de upload de user no S3: não envie arquivo via seu server (lento, cara de banda). Server gera presigned URL → client faz PUT direto pro S3. Download idem (preview, profile pic). Usa SigV4, expira. Em TS: @aws-sdk/s3-request-presigner.',
  },
  {
    question: 'Quando multipart upload é obrigatório?',
    options: [
      'Sempre',
      'Arquivos > 100MB (recomendado) e > 5GB (obrigatório). Permite parts paralelos, resume se cair rede, melhor performance. UploadId agrupa parts; CompleteMultipartUpload fecha',
      'Só em S3 Glacier',
      'Nunca',
    ],
    correct: 1,
    explanation: 'S3 PUT limit é 5GB single object. Multipart: CreateMultipartUpload → N UploadPart em paralelo → CompleteMultipartUpload. Se cair, retry só parts falhadas. AWS SDK fazem automaticamente pra uploads grandes.',
  },
  {
    question: 'S3 Event Notifications acionam o quê?',
    options: [
      'Só email',
      'Lambda, SQS, SNS, EventBridge quando ObjectCreated, ObjectRemoved, etc. Base de event-driven processing (thumbnail em upload, transcode, dedup)',
      'Apenas CloudWatch',
      'Nada',
    ],
    correct: 1,
    explanation: 'Upload foto → S3 Event → Lambda → Sharp resize → salva thumbnails em prefixo /thumbs. Padrão serverless clássico. Filter por prefix/suffix (só .jpg) + tipo de event. Use EventBridge quando precisa routing/fan-out avançado.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="s3-dev-features"
      title="S3 features pra dev: presigned URLs, multipart e events"
      icon="🪣"
      xp={50}
      readTime={11}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="step-functions-workflows"
      nextTitle="Step Functions: orquestração de workflows"
      quiz={quiz}
    >
      <Section title="Presigned URL upload" accent={accent}>
        <CodeBlock lang="typescript">{`import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'us-east-1' });

// Server: gera URL
export async function uploadUrl(key: string) {
  const cmd = new PutObjectCommand({
    Bucket: 'uploads',
    Key: key,
    ContentType: 'image/jpeg',
  });
  return getSignedUrl(s3, cmd, { expiresIn: 600 }); // 10min
}

// Client: usa URL
await fetch(url, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': 'image/jpeg' },
});`}</CodeBlock>
      </Section>

      <Section title="Durabilidade + features" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Versioning</strong>: mantém versions antigas, protege de delete acidental.</li>
          <li><strong>Object Lock</strong>: WORM (write once read many), compliance (SEC, HIPAA).</li>
          <li><strong>Lifecycle rules</strong>: move pra IA/Glacier após N dias, delete após M.</li>
          <li><strong>Cross-Region Replication</strong>: async replication pra DR.</li>
          <li><strong>Transfer Acceleration</strong>: upload via CloudFront edge (rápido pra remote clients).</li>
          <li><strong>Encryption</strong>: SSE-S3 (AWS-managed), SSE-KMS (sua CMK), SSE-C (cliente fornece chave).</li>
        </ul>
        <Callout tone="info" icon="💡">
          S3 é o objeto storage mais usado do mundo por um motivo: barato, durável (11 noves), event-driven nativo. Domine que resolve ~30% de problemas de arquitetura serverless.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
