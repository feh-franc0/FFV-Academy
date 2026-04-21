import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cognito-fluxos');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre User Pool e Identity Pool?',
    options: [
      'Sinônimos',
      'User Pool: authn (signup/signin/MFA) — emite JWT (id_token). Identity Pool: federação — troca id_token por credenciais AWS temporárias pra acessar S3/DynamoDB direto do cliente',
      'Ambos servem pra S3',
      'User Pool é legacy',
    ],
    correct: 1,
    explanation: 'User Pool gerencia users (diretório). Identity Pool dá credentials AWS (usadas raramente hoje — prefere-se BFF). Em 99% dos casos, você só usa User Pool + API Gateway authorizer Cognito.',
  },
  {
    question: 'O que é "Custom Auth Challenge" em Cognito?',
    options: [
      'Impossível customizar',
      'Fluxo de auth próprio via Lambda triggers (DefineAuthChallenge, CreateAuthChallenge, VerifyAuthChallengeResponse) — ex: magic link, biometria, TOTP custom',
      'Só pra enterprise',
      'Deprecated',
    ],
    correct: 1,
    explanation: '3 Lambda triggers compõem flow custom. Uso típico: magic link email (envia código via SNS, verifica retorno). Mais complexo que SRP padrão mas totalmente extensível. DVA-C02 gosta de testar isso.',
  },
  {
    question: 'Como integrar Cognito com API Gateway?',
    options: [
      'Via Lambda authorizer sempre',
      'Cognito User Pool Authorizer nativo — API GW valida id_token automaticamente. Claims ficam em context. Mais simples que Lambda authorizer',
      'Impossível',
      'Só em REST API',
    ],
    correct: 1,
    explanation: 'Authorizer type COGNITO_USER_POOLS no API GW: só colar pool ARN. Client manda Authorization: Bearer {id_token}, API GW valida sig + exp + aud. Claims em $context.authorizer.claims.sub pra usar em integração.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cognito-fluxos"
      title="Cognito: user pools vs identity pools"
      icon="👥"
      xp={50}
      readTime={11}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="kms-encryption-dev"
      nextTitle="KMS: envelope encryption e quando usar CMK"
      quiz={quiz}
    >
      <Section title="Auth flows" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>USER_SRP_AUTH</strong> (Secure Remote Password): default, senha NUNCA viaja em rede. Use em app clients.</li>
          <li><strong>USER_PASSWORD_AUTH</strong>: senha cleartext — só pra ambiente server-to-server confiável.</li>
          <li><strong>ADMIN_USER_PASSWORD_AUTH</strong>: admin API, requires credentials.</li>
          <li><strong>CUSTOM_AUTH</strong>: fluxo próprio com Lambda triggers.</li>
          <li><strong>REFRESH_TOKEN_AUTH</strong>: renovar access token.</li>
        </ul>
      </Section>

      <Section title="Integração com SAML/OIDC (federação)" accent={accent}>
        <Callout tone="info" icon="💡">
          Cognito User Pool aceita Identity Providers externos: Google/Facebook/Apple (social), Okta/Auth0 (SAML), Azure AD. User loga no provider externo; User Pool cria user local mapped. Hosted UI pronta. Útil pra empresas com SSO existente.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
