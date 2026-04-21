import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('build-deploy-ios-android');
const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que EAS Build resolve certificados iOS automaticamente?',
    options: [
      'Mágica',
      'Você dá credenciais Apple Developer uma vez (ou deixa a Expo gerenciar pela API); EAS pega/cria Distribution Certificate e Provisioning Profile, armazena em cofre seguro e reutiliza em builds subsequentes — elimina o inferno manual do Xcode',
      'Não resolve',
      'Só paga',
    ],
    correct: 1,
    explanation: 'Signing iOS é notoriamente doloroso: Distribution Certificate (1 por conta), Provisioning Profile (1 por app/ambiente), App ID, capabilities. EAS expõe `eas credentials` pra ver/rotacionar tudo, e `eas build` usa transparente. Alternativa: fastlane match — funciona mas exige repo git próprio pros certificados. Pra time pequeno-médio, EAS economiza horas por release.',
  },
  {
    question: 'EAS Update (OTA) substitui submissão à loja?',
    options: [
      'Substitui tudo',
      'Não: EAS Update só entrega bundle JS novo (app já instalado); submissão é obrigatória sempre que muda código nativo, ícone, permissões ou versão do SDK. OTA é pra hotfix rápido de lógica/UI sem passar review',
      'Sim, totalmente',
      'Nunca use OTA',
    ],
    correct: 1,
    explanation: 'Diretrizes Apple (2.5.2) + Play permitem update remoto só do código executado pela engine JS embarcada; nativo tem que ir pela loja. Na prática: bug em botão = eas update (5min, sem review). Mudança de ícone/permission = eas build + submit (review 1-2 dias). Mantenha runtimeVersion e channels separados por ambiente pra nunca entregar JS incompatível com binary antigo.',
  },
  {
    question: 'Qual a cadeia recomendada pra pré-lançamento?',
    options: [
      'Build → loja',
      'EAS build preview → distribuição interna (TestFlight iOS / Play Internal Testing Android) → feedback time/QA → build production → submit. Cada etapa com channel OTA próprio, release notes e versionamento semântico. Crash reports via Sentry desde preview',
      'Só build prod',
      'Versão única',
    ],
    correct: 1,
    explanation: 'Pular distribuição interna = descobrir bug de produção em prod. TestFlight aceita até 100 internal testers sem review e 10k externals com review leve; Play Internal Testing é instantâneo pra até 100. Canais (preview, production) + autoIncrement no eas.json + Sentry com source maps dão loop rápido: crash aparece, você mapeia stack trace, eas update sobe fix.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="build-deploy-ios-android"
      title="Build + deploy: EAS Build, TestFlight, Play Console"
      icon="🚀"
      xp={55}
      readTime={13}
      trailName="Mobile para Devs Web (React Native + Expo)"
      trailColor={accent}
      nextSlug="performance-em-rn"
      nextTitle="Performance em RN: Hermes, lists, profiling"
      quiz={quiz}
    >
      <Section title="EAS como CI/CD padrão" accent={accent}>
        <p>
          EAS (Expo Application Services) engloba Build (compila IPA/AAB na nuvem), Submit (manda pras lojas via API), Update (OTA), Credentials (cofre de certificados). O grande valor é remover 80% do atrito histórico de release mobile.
        </p>
      </Section>

      <Section title="eas.json completo" accent={accent}>
        <CodeBlock lang="json">{`{
  "cli": { "version": ">= 7.0.0", "appVersionSource": "remote" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "env": { "API_URL": "https://staging.ffv.com" }
    },
    "production": {
      "channel": "production",
      "autoIncrement": true,
      "env": { "API_URL": "https://api.ffv.com" },
      "ios": { "resourceClass": "m-large" }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "dev@ffv.com", "ascAppId": "1234567890" },
      "android": { "serviceAccountKeyPath": "./pc-api.json", "track": "internal" }
    }
  }
}`}</CodeBlock>
      </Section>

      <Section title="Fluxo de release completo" accent={accent}>
        <CodeBlock lang="bash">{`# 1. Dev build (uma vez por device)
eas build --profile development --platform all

# 2. Preview interno (TestFlight + Play Internal)
eas build --profile preview --platform all
eas submit --profile production --platform ios
# Android: baixa AAB do build e sobe em Play Console > Internal testing

# 3. OTA rápido pra preview
eas update --channel preview --message 'fix: crash no checkout'

# 4. Release produção
eas build --profile production --platform all --auto-submit
# Apple review: 1-3 dias. Play review: 1-24h.

# 5. Hotfix depois do release
eas update --channel production --message 'fix: typo label'`}</CodeBlock>
      </Section>

      <Section title="runtimeVersion e canais OTA" accent={accent}>
        <CodeBlock lang="ts">{`// app.config.ts
export default {
  runtimeVersion: { policy: 'appVersion' }, // ou 'fingerprint'
  updates: {
    url: 'https://u.expo.dev/<project-id>',
    requestHeaders: { 'expo-runtime-version': '<auto>' },
  },
};`}</CodeBlock>
        <Callout tone="warn">
          Mudou código nativo (config plugin novo, dep nativa) sem bumpar runtimeVersion = crash silencioso em produção (JS chama API nativa que não existe no binary). Use <code>policy: 'fingerprint'</code> pra a Expo calcular hash do nativo e invalidar OTA automaticamente quando necessário.
        </Callout>
      </Section>

      <Section title="Versionamento e release notes" accent={accent}>
        <p>
          Mantenha versionName semântico (1.4.2) e deixe EAS cuidar do build number incremental (<code>autoIncrement: true</code>). Em app stores, a versão visível ao usuário é <code>version</code>; o build number é controle interno pra re-submit sem bump de versão.
        </p>
        <CodeBlock lang="bash">{`# Versão app visível
npx expo config --type introspect | grep version

# Push release notes em ambas as lojas:
# iOS: App Store Connect > What's New
# Android: Play Console > Production > Release notes`}</CodeBlock>
      </Section>

      <Section title="Monitoramento pós-release" accent={accent}>
        <CodeBlock lang="ts">{`// Sentry + source maps automáticos via EAS
// eas.json:
// "build": { "production": { "env": { "SENTRY_AUTH_TOKEN": "xxx" } } }

import * as Sentry from '@sentry/react-native';
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,
  enableAutoPerformanceTracing: true,
});`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Com source maps uploaded, crash stack trace aparece com nome da função e linha do TS (não minificado). Loop de release vira: crash → Sentry alerta → fix → eas update → 5min pra usuários receberem.
        </Callout>
      </Section>

      <Section title="Checklist antes do primeiro submit" accent={accent}>
        <Callout tone="info">
          (1) Ícones em todos os tamanhos (expo-icon-set checker). (2) Launch screen configurado (splash screen, evita flash branco). (3) Permissions com strings descritivas no Info.plist (rejeição comum Apple). (4) Privacy Policy URL hospedada. (5) Screenshots nos tamanhos exigidos (6.7" iPhone + 12.9" iPad + Android phone/tablet). (6) Descrição, keywords, categoria. (7) Dado de tracking (App Privacy Report). (8) Versão mínima iOS e Android compatível com SDK da Expo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
