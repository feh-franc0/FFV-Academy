import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('expo-e-quando-ejectar');
const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre Expo Go e development build?',
    options: [
      'Nenhuma',
      'Expo Go é o app shell da Expo com SDK pré-instalado (serve pra demos rápidos, só libs do SDK); development build é seu app compilado com todos os native modules que você declarou, instalável via EAS — é o workflow real',
      'Dev build é pago',
      'Expo Go tem mais features',
    ],
    correct: 1,
    explanation: 'Expo Go é útil por 10 minutos: você abre, escaneia QR e vê a UI. Mas só carrega libs que estão no SDK da Expo. Assim que você adiciona react-native-mmkv, react-native-vision-camera ou qualquer config plugin custom, precisa de development build — equivalente a instalar o APK/IPA de debug do seu próprio app. eas build --profile development gera isso.',
  },
  {
    question: 'Config plugins existem pra quê?',
    options: [
      'Estilizar componente',
      'Modificar arquivos nativos (Info.plist, AndroidManifest.xml, Xcode pbxproj) de forma declarativa em app.config.ts — você adiciona permissions, URL schemes, entitlements sem editar código nativo na mão e sem precisar eject',
      'Traduzir app',
      'Gerar ícone',
    ],
    correct: 1,
    explanation: 'Antes, pra pedir permissão de câmera ou adicionar um URL scheme, você precisava abrir Xcode/Android Studio e editar XMLs. Config plugin é uma função JS que recebe a config do app e retorna modificações. Libs como expo-camera declaram seu plugin; no prebuild, a Expo regenera os arquivos nativos com essas modificações. Eliminou 80% dos casos que antes forçavam eject.',
  },
  {
    question: 'Quando "eject" / prebuild permanente realmente se justifica?',
    options: [
      'Sempre que der',
      'Nunca',
      'Quando você precisa de código nativo custom que nenhum config plugin cobre (ex.: SDK proprietário de pagamento sem wrapper), ou quer total controle de Xcode/Android Studio pra otimizações específicas — caso contrário, managed + dev builds cobrem 95% dos apps',
      'Quando app fica popular',
    ],
    correct: 2,
    explanation: 'A Expo hoje (SDK 51+) recomenda "Continuous Native Generation": você sempre gera android/ios a partir de app.config.ts e plugins, mesmo pra builds de produção. Ejetar permanente (prebuild --clean então versionar android/ios) só vale quando o custo de manter native patches próprios é menor que o de esperar um config plugin. Na prática: raramente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="expo-e-quando-ejectar"
      title="Expo workflow e quando eject (EAS)"
      icon="🏗️"
      xp={50}
      readTime={12}
      trailName="Mobile para Devs Web (React Native + Expo)"
      trailColor={accent}
      nextSlug="navegacao-moderna"
      nextTitle="Navegação moderna: Expo Router / React Navigation"
      quiz={quiz}
    >
      <Section title="Expo = toolchain, não framework paralelo" accent={accent}>
        <p>
          Expo é React Native por baixo — mesmo reconciler, mesma runtime Hermes, mesmos componentes. O que a Expo agrega é a cadeia de build, release e libs comuns (câmera, notifications, file system, secure store) empacotadas de forma que você não precisa abrir Xcode pra usar. Hoje é o default recomendado pela própria Meta pra novos apps.
        </p>
      </Section>

      <Section title="Managed workflow moderno" accent={accent}>
        <p>
          O fluxo do Expo gira em torno de <code>app.config.ts</code>, <code>eas.json</code> e <code>npx expo</code>:
        </p>
        <CodeBlock lang="bash">{`npx create-expo-app@latest meu-app
cd meu-app
npx expo start               # dev server, abre em Expo Go ou dev build
npx expo install expo-camera # instala lib compatível com seu SDK
npx expo prebuild            # gera android/ios conforme config plugins
eas build --profile development --platform ios  # dev build instalável`}</CodeBlock>
        <p>
          Você não versiona <code>android/</code> nem <code>ios/</code>. Eles são regenerados no prebuild, do mesmo jeito que <code>node_modules</code>. Isso é Continuous Native Generation (CNG) — filosofia oficial da Expo.
        </p>
      </Section>

      <Section title="Config plugins na prática" accent={accent}>
        <CodeBlock lang="ts">{`// app.config.ts
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Meu App',
  slug: 'meu-app',
  scheme: 'meuapp',
  ios: { bundleIdentifier: 'com.ffv.meuapp', supportsTablet: true },
  android: { package: 'com.ffv.meuapp', adaptiveIcon: { foregroundImage: './assets/icon.png' } },
  plugins: [
    'expo-router',
    ['expo-camera', { cameraPermission: 'Precisamos da câmera pra ler o QR do check-in.' }],
    ['expo-notifications', { icon: './assets/notif.png', color: '#14b8a6' }],
  ],
};

export default config;`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Cada plugin é uma função JS que recebe ExpoConfig e modifica Info.plist/AndroidManifest/etc. No prebuild, tudo é aplicado determinísticamente. Um <code>git diff</code> entre dois prebuilds mostra exatamente o que mudou no nativo.
        </Callout>
      </Section>

      <Section title="EAS Build e EAS Update" accent={accent}>
        <p>
          EAS (Expo Application Services) é a CI/CD oficial. <code>eas build</code> compila na nuvem da Expo e entrega IPA/AAB assinado. <code>eas update</code> publica bundle JavaScript OTA — fix de texto ou lógica chega sem review da App Store, desde que não toque em nativo.
        </p>
        <CodeBlock lang="json">{`// eas.json
{
  "cli": { "version": ">= 7.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":     { "distribution": "internal", "channel": "preview" },
    "production":  { "channel": "production", "autoIncrement": true }
  },
  "submit": {
    "production": { "ios": { "appleId": "fernando@ffv.com" } }
  }
}`}</CodeBlock>
      </Section>

      <Section title="Quando dev build em vez de Expo Go" accent={accent}>
        <Callout tone="info">
          Regra simples: <strong>Expo Go</strong> pra experimentar um componente novo sem instalar nada. <strong>Dev build</strong> pra qualquer projeto real — você garante que a versão que roda no seu simulador é a mesma que vai produção (mesmos native modules, mesma assinatura). Crie dev build cedo, antes de 50 linhas de código.
        </Callout>
      </Section>

      <Section title="Quando prebuild permanente (o antigo eject)" accent={accent}>
        <p>
          Três cenários realistas em 2026:
        </p>
        <CodeBlock lang="ts">{`// 1. SDK nativo proprietário sem config plugin oficial nem comunidade.
//    Ex.: integração com um banco legado que entrega .xcframework + .aar.

// 2. Modificação profunda em AppDelegate.swift ou MainApplication.kt
//    (custom bootstrapping, SDKs que precisam rodar antes do JS).

// 3. Build settings que o plugin não expõe (stripping, bitcode, ABI filters).

// Em qualquer outro caso: continue em managed + dev build. CNG é o padrão.`}</CodeBlock>
        <Callout tone="warn">
          Uma vez que você versiona <code>android/</code> e <code>ios/</code>, perde atualizações automáticas do template ao bumpar SDK. Cada upgrade vira merge manual. É custo real — pague só se o benefício for claro.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
