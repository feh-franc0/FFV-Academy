import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('navegacao-moderna');
const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que Expo Router faz diferente de React Navigation puro?',
    options: [
      'Só estiliza',
      'Mapeia a árvore de arquivos em app/ para rotas (igual Next.js), gera tipos automáticos, suporta deep links declarativos via scheme/host em app.config.ts — por baixo ainda usa React Navigation',
      'Substitui React totalmente',
      'Só funciona em iOS',
    ],
    correct: 1,
    explanation: 'Expo Router é uma camada file-based em cima do React Navigation. app/(tabs)/index.tsx vira a home, app/perfil/[id].tsx vira rota dinâmica, _layout.tsx define stack/tabs/drawer. Ganhos: menos boilerplate de navigator setup, tipos de rota gerados via TS codegen, Linking API automática. Por baixo ainda são os mesmos navigators (@react-navigation/native-stack etc.).',
  },
  {
    question: 'Diferença entre Stack, Tabs e Modal navigator?',
    options: [
      'Só nome',
      'Stack empilha telas (push/pop com animação de deslize, back nativo), Tabs mantém todas montadas e troca via bottom bar (cada aba com seu estado), Modal sobe por cima com gesture de fechar — cada um com affordance de UX distinta',
      'Todos iguais',
      'Modal não existe',
    ],
    correct: 1,
    explanation: 'Stack é hierárquico: produto → detalhe → avaliações. Tabs é lateral, estado preservado: Home | Busca | Perfil — trocar de aba não reseta a anterior. Modal é transitório: apresentação modal iOS (slide up com "puxar pra baixo") ou dialog Android. Escolher errado quebra affordance: botão "voltar" em aba confunde; modal pra conteúdo principal perde contexto.',
  },
  {
    question: 'Como você configura um deep link meuapp://produto/42 que abre a tela certa?',
    options: [
      'Não dá',
      'Declara scheme: "meuapp" em app.config.ts; em Expo Router, basta existir app/produto/[id].tsx — Linking API resolve automático. Em React Navigation puro, define linking prop no NavigationContainer com mapa de rotas',
      'Só com backend',
      'Só iOS',
    ],
    correct: 1,
    explanation: 'Deep link custom scheme é o caso simples. Universal Links (https://meuapp.com/produto/42 abrindo o app) exige AASA file no servidor pra iOS e assetlinks.json pra Android, além de intent-filter/associated-domains configurados. Expo Router gera tudo se você declarar associatedDomains no plugin. Teste com `npx uri-scheme open meuapp://produto/42 --ios`.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="navegacao-moderna"
      title="Navegação moderna: Expo Router / React Navigation"
      icon="🗺️"
      xp={55}
      readTime={13}
      trailName="Mobile para Devs Web (React Native + Expo)"
      trailColor={accent}
      nextSlug="estado-e-async-em-rn"
      nextTitle="Estado e async em RN: React Query + Zustand"
      quiz={quiz}
    >
      <Section title="Duas opções, mesma base" accent={accent}>
        <p>
          Em 2026 existem dois caminhos mainstream: Expo Router (file-based, estilo Next.js App Router) e React Navigation (imperativo, configurável). Expo Router é o default novo; React Navigation continua sendo o motor — Router é açúcar declarativo em cima. Escolha Router em projeto novo; fique com React Navigation em base legada ou cenários com navegador totalmente dinâmico.
        </p>
      </Section>

      <Section title="Expo Router: árvore de arquivos vira rotas" accent={accent}>
        <CodeBlock lang="tsx">{`// app/_layout.tsx — layout raiz
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerTintColor: '#14b8a6' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="produto/[id]" options={{ label: 'Produto' }} />
      <Stack.Screen name="checkout" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

// app/(tabs)/_layout.tsx — grupo de tabs (parênteses = rota invisível)
import { Tabs } from 'expo-router';
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ label: 'Home' }} />
      <Tabs.Screen name="busca" options={{ label: 'Busca' }} />
      <Tabs.Screen name="perfil" options={{ label: 'Perfil' }} />
    </Tabs>
  );
}

// app/produto/[id].tsx — rota dinâmica tipada
import { useLocalSearchParams } from 'expo-router';
export default function Produto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Text>Produto {id}</Text>;
}`}</CodeBlock>
      </Section>

      <Section title="Navegar: router.push vs Link" accent={accent}>
        <CodeBlock lang="tsx">{`import { Link, router } from 'expo-router';

// Declarativo (preferido pra UI estática):
<Link href={'/produto/' + id} asChild>
  <Pressable><Text>Ver produto</Text></Pressable>
</Link>

// Imperativo (em handlers, async flows):
async function submit() {
  const id = await criarPedido();
  router.push('/pedido/' + id);
}

router.back();
router.replace('/login');  // sem empilhar na stack
router.dismissAll();       // fecha modais`}</CodeBlock>
      </Section>

      <Section title="Deep linking e universal links" accent={accent}>
        <CodeBlock lang="ts">{`// app.config.ts
export default {
  scheme: 'meuapp',
  ios: {
    bundleIdentifier: 'com.ffv.meuapp',
    associatedDomains: ['applinks:meuapp.com'],
  },
  android: {
    package: 'com.ffv.meuapp',
    intentFilters: [{
      action: 'VIEW',
      autoVerify: true,
      data: [{ scheme: 'https', host: 'meuapp.com' }],
      category: ['BROWSABLE', 'DEFAULT'],
    }],
  },
};`}</CodeBlock>
        <p>
          Com isso, <code>meuapp://produto/42</code> abre direto <code>app/produto/[id].tsx</code>. Pra universal links HTTPS, hospede <code>/.well-known/apple-app-site-association</code> e <code>/.well-known/assetlinks.json</code> no domínio.
        </p>
        <Callout tone="warn">
          Universal links falham em silêncio se o AASA não tiver Content-Type application/json ou se o domínio estiver em CDN que stripa. Teste sempre com <code>curl -I https://meuapp.com/.well-known/apple-app-site-association</code>.
        </Callout>
      </Section>

      <Section title="React Navigation puro quando faz sentido" accent={accent}>
        <CodeBlock lang="tsx">{`import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

type RootStack = { Home: undefined; Produto: { id: string } };
const Stack = createNativeStackNavigator<RootStack>();

export default function App() {
  return (
    <NavigationContainer
      linking={{
        prefixes: ['meuapp://', 'https://meuapp.com'],
        config: { screens: { Home: '', Produto: 'produto/:id' } },
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Produto" component={Produto} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}`}</CodeBlock>
        <Callout tone="info">
          Use React Navigation puro quando as rotas são geradas de dados (CMS dinâmico), quando você integra navegação com state machine externo (XState) ou quando a base de código legada já gira em torno dele.
        </Callout>
      </Section>

      <Section title="Armadilhas comuns" accent={accent}>
        <Callout tone="danger" icon="🚨">
          (1) Passar objeto pesado como param — só string/number, use ID e busque no store. (2) Esquecer headerShown: false em grupo (tabs) e ter header dobrado. (3) Navegar em useEffect sem guard — loop infinito. (4) Testar deep link só no simulador: valide em device real porque iOS filtra scheme no ambiente dev.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
