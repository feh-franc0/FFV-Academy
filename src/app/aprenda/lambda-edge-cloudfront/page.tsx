import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('lambda-edge-cloudfront');
const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Diferença entre CloudFront Functions e Lambda@Edge?',
    options: [
      'Nenhuma',
      'CloudFront Functions: JS puro ES5-ish, 1ms CPU, 2KB memória, sub-ms latency — ideal pra rewrites simples, header manipulation. Lambda@Edge: Node/Python completo, 128MB-3GB, 5-30s, custa mais — ideal pra lógica rica (auth JWT validation, image transform)',
      'CF Functions é pago',
      'Lambda@Edge é mais rápido',
    ],
    correct: 1,
    explanation: 'CF Functions é ultra-lightweight, roda em cada POP, executa em 1ms. Serve pra: normalize headers, redirect /old → /new, A/B cookie setting, URL rewrite. Lambda@Edge roda em ~13 regiões edge, container completo, aceita libs Node, CPU/memory maiores. Preço: CF Functions ~$0.10/M invocations; Lambda@Edge ~$0.60/M + GB-s. Escolha o mais leve que cobre o caso.',
  },
  {
    question: 'Qual dos 4 triggers do Lambda@Edge você escolhe pra validar JWT antes de chegar no origin?',
    options: [
      'Origin Response',
      'Viewer Request — roda antes do cache, toda request passa; se token inválido, retorna 401 sem bater em origin nem em cache, economiza e protege; Origin Request só roda em cache miss (não bloqueia se já cacheado)',
      'Viewer Response',
      'Não importa',
    ],
    correct: 1,
    explanation: 'Os 4 eventos: Viewer Request (cliente → CF), Origin Request (CF → origin, em miss), Origin Response (origin → CF), Viewer Response (CF → cliente). Auth precisa ser Viewer Request senão tráfego cacheado pula a validação. Redireções e normalization também aqui. Imagem transformation tipicamente é Origin Response (manipula o que veio de S3 antes de cachear).',
  },
  {
    question: 'Quando AWS edge faz sentido versus Cloudflare?',
    options: [
      'Sempre AWS',
      'Quando infra já é AWS-native (VPC, IAM roles, S3 privado, EventBridge), quando compliance exige region específica com governança AWS, quando equipe tem expertise Lambda — aí integração é mais fluida que wrangler+workers num stack puramente AWS',
      'Nunca',
      'AWS é mais barato',
    ],
    correct: 1,
    explanation: 'Se todo o resto é AWS (DynamoDB, S3, RDS, Cognito), usar Lambda@Edge mantém IAM/VPC/observability unificado. Cloudflare obriga cross-cloud secrets management e observability separada. Em stack heterogêneo, CF Workers ganha em custo e DX; em stack AWS-all-in, Lambda@Edge + CloudFront Functions minimizam overhead operacional. Não é técnico puro — é org fit.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="lambda-edge-cloudfront"
      title="Lambda@Edge e CloudFront Functions"
      icon="📡"
      xp={55}
      readTime={13}
      trailName="Edge Computing & Workers"
      trailColor={accent}
      nextSlug="patterns-edge-first"
      nextTitle="Patterns edge-first: HTML streaming, data collocation"
      quiz={quiz}
    >
      <Section title="Edge compute da AWS" accent={accent}>
        <p>
          A AWS oferece duas camadas distintas de compute no edge: CloudFront Functions (ultra-leve, em todos os 600+ POPs) e Lambda@Edge (container-ish, em ~13 regiões edge). Ambos integram com distribuições CloudFront e disparam em eventos de request/response do CDN.
        </p>
      </Section>

      <Section title="CloudFront Functions: sub-ms, bem restrito" accent={accent}>
        <CodeBlock lang="js">{`// function.js — ES5-ish, sem async/await, sem fetch
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Rewrite /blog → /blog/index.html
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }

  // Normalize accept header
  var accept = request.headers['accept-language'];
  if (accept && accept.value.startsWith('pt')) {
    request.headers['x-locale'] = { value: 'pt-BR' };
  }

  return request;
}`}</CodeBlock>
        <Callout tone="warn">
          CF Functions não faz network I/O (nada de fetch, nada de DynamoDB). Só manipula request/response. Se precisar buscar algo externo, é Lambda@Edge.
        </Callout>
      </Section>

      <Section title="Lambda@Edge: Node completo" accent={accent}>
        <CodeBlock lang="ts">{`// index.ts — Lambda@Edge em viewer-request
import type { CloudFrontRequestEvent, CloudFrontRequestResult } from 'aws-lambda';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwks = createRemoteJWKSet(new URL('https://auth.ffv.com/.well-known/jwks.json'));

export const handler = async (
  event: CloudFrontRequestEvent,
): Promise<CloudFrontRequestResult> => {
  const request = event.Records[0].cf.request;

  const cookieHeader = (request.headers.cookie ?? [])[0]?.value ?? '';
  const token = cookieHeader.match(/session=([^;]+)/)?.[1];

  if (!token) {
    return {
      status: '401',
      statusDescription: 'Unauthorized',
      headers: { 'content-type': [{ key: 'Content-Type', value: 'text/plain' }] },
      body: 'auth required',
    };
  }

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: 'ffv' });
    request.headers['x-user-id'] = [{ key: 'X-User-Id', value: String(payload.sub) }];
    return request;
  } catch {
    return { status: '403', statusDescription: 'Forbidden' };
  }
};`}</CodeBlock>
      </Section>

      <Section title="Quatro triggers da CloudFront" accent={accent}>
        <CodeBlock lang="ts">{`// Viewer Request  — toda req, antes do cache check
//   Use pra: auth, normalize, redirect, header set
// Origin Request  — só em cache miss, antes de ir pro origin
//   Use pra: origin selection, request body transform
// Origin Response — resposta do origin, antes de cachear
//   Use pra: image transform (retornar WebP de JPEG), transform HTML
// Viewer Response — resposta final, antes do cliente
//   Use pra: security headers (CSP, HSTS), cookies pós-resposta`}</CodeBlock>
      </Section>

      <Section title="Imagem on-the-fly com Origin Response" accent={accent}>
        <CodeBlock lang="ts">{`// Lambda@Edge em origin-response
// Recebe imagem JPEG do S3, retorna WebP se browser suporta
import sharp from 'sharp';
import type { CloudFrontResponseEvent } from 'aws-lambda';

export const handler = async (event: CloudFrontResponseEvent) => {
  const { request, response } = event.Records[0].cf;
  const accept = (request.headers.accept ?? [])[0]?.value ?? '';

  if (!accept.includes('image/webp')) return response;
  if (!response.headers['content-type']?.[0]?.value.startsWith('image/jpeg')) return response;

  // Busca body original (Lambda@Edge não tem acesso direto; precisa request pro S3)
  // Estratégia real: usar CloudFront Functions + Lambda@Edge + S3 signed URL
  return response;
};`}</CodeBlock>
        <Callout tone="info">
          Lambda@Edge não recebe body da resposta automaticamente — precisa fetch direto do origin ou usar padrão write-through com S3. Custo e latência ficam altos; pra image transform, geralmente CloudFront + Image Handler ou Cloudflare Images compensam mais.
        </Callout>
      </Section>

      <Section title="Deploy e custo" accent={accent}>
        <CodeBlock lang="bash">{`# CF Functions: deploy inline na console ou via CloudFront API
aws cloudfront create-function --name rewrite --function-code fileb://function.js \\
  --function-config Comment=rewrite,Runtime=cloudfront-js-2.0

# Lambda@Edge: Lambda normal (us-east-1 obrigatório), publish version,
# associar à distribuição via event type
aws lambda publish-version --function-name edge-auth
aws cloudfront update-distribution --id DIST_ID ...`}</CodeBlock>
        <p>
          Preços aproximados 2026: CF Functions $0.10 por milhão de invocations. Lambda@Edge $0.60/M + $0.00000625125/GB-s. Cloudflare Workers Paid $5/mês + $0.30/M depois de 10M. Em volume alto, Cloudflare fica ordem de grandeza mais barato; em volume baixo, CF Functions é o mais econômico AWS-side.
        </p>
      </Section>

      <Section title="Quando escolher AWS edge" accent={accent}>
        <Callout tone="success" icon="✅">
          Stack já AWS-native, compliance exige AWS region (SOC2, HIPAA via BAA), integração com IAM/VPC privado, observability unificada em CloudWatch. Pra time que vive em AWS, CloudFront Functions + Lambda@Edge oferecem "edge sem sair do ecossistema". Pra time que quer edge barato e simples, Cloudflare ganha quase sempre.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
