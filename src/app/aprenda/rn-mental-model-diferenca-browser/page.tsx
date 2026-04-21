import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('rn-mental-model-diferenca-browser');
const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que mudou na nova arquitetura RN (Fabric + JSI + TurboModules) versus bridge legado?',
    options: [
      'Nada relevante — continua igual',
      'Bridge JSON async virou JSI (chamadas sync JS↔native via pointers C++), Fabric renderer unifica diff tree, TurboModules carregam nativo lazy — elimina overhead do serializar/deserializar por frame',
      'JS virou Kotlin',
      'React sumiu',
    ],
    correct: 1,
    explanation: 'A bridge antiga serializava tudo em JSON entre threads JS e native, criando overhead em cada chamada. JSI expõe objetos native diretamente ao runtime JS via HostObject, Fabric reescreve o renderer em C++ compartilhado, TurboModules substituem o NativeModules registry. Resultado: interop sync barato, menos overhead por frame, possibilidade de renderer concorrente. Default em Expo SDK 51+.',
  },
  {
    question: 'Por que FlatList (ou FlashList) e não um map() sobre Views para listas longas?',
    options: [
      'Estilo',
      'FlatList virtualiza (só renderiza itens visíveis + janela), recicla células, suporta getItemLayout pra pular layout pass — map() renderiza tudo e trava UI em listas >200 itens',
      'FlatList é mais bonito',
      'Não tem diferença',
    ],
    correct: 1,
    explanation: 'Em mobile não existe scroll nativo do DOM com lazy rendering como no browser moderno. map() monta 10k Views na memória e em cada re-render reconcilia tudo. FlatList usa VirtualizedList por baixo: mantém windowSize, removeClippedSubviews, keyExtractor estável. Pra listas grandes, FlashList (Shopify) recicla views C++ e chega 10x mais rápido em p95.',
  },
  {
    question: 'O equivalente mental de position: fixed do browser em RN é…',
    options: [
      'position: fixed funciona igual',
      'Não existe direto — use SafeAreaView + absolute positioning dentro do container raiz, lembrando de StatusBar height e notch (useSafeAreaInsets do react-native-safe-area-context)',
      'z-index infinito',
      'display: sticky',
    ],
    correct: 1,
    explanation: 'RN tem Yoga (flexbox subset) e position: absolute/relative, mas não fixed/sticky. Pra header fixo: container flex column, header absolute top 0 com paddingTop do insets.top. Notch iPhone, barra de status Android, gesture bar — tudo precisa de SafeArea. Default flex-direction é column (web é row). Unidades são density-independent pixels, não px.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rn-mental-model-diferenca-browser"
      title="RN mental model: o que é diferente do browser"
      icon="🧠"
      xp={50}
      readTime={12}
      trailName="Mobile para Devs Web (React Native + Expo)"
      trailColor={accent}
      nextSlug="expo-e-quando-ejectar"
      nextTitle="Expo workflow e quando eject (EAS)"
      quiz={quiz}
    >
      <Section title="React no dispositivo, não no DOM" accent={accent}>
        <p>
          React Native compartilha reconciler, hooks e mental model do React web. O que muda é o renderer: em vez de DOM nodes (div, span), você compõe componentes que a plataforma traduz em UIView (iOS) ou android.view.View (Android). View é div, Text é span (obrigatório envolver qualquer string), Image é img, Pressable é button/anchor clicável.
        </p>
        <Callout tone="info">
          Regra número um: toda string precisa estar dentro de <code>&lt;Text&gt;</code>. Um literal solto dentro de uma View lança runtime error. Vem da limitação nativa: UIView não renderiza texto, só UILabel/UITextView.
        </Callout>
      </Section>

      <Section title="Nova arquitetura: JSI, Fabric, TurboModules" accent={accent}>
        <p>
          Até 2023 a comunicação JS↔native passava pela bridge: cada chamada virava mensagem JSON enfileirada em outra thread. Funcional, mas criava jank quando o tráfego era alto (animações, gestos, listas). A nova arquitetura (default no Expo SDK 51+) troca isso por três peças:
        </p>
        <CodeBlock lang="ts">{`// JSI — JavaScript Interface
// Expõe objetos C++ nativos ao runtime (Hermes/JSC) como HostObject.
// Chamada JS → native vira invocação direta de método C++, sync, sem JSON.

// Fabric — novo renderer
// Shadow tree compartilhada em C++. Layout (Yoga) calculado uma vez,
// mount/update sincronizado. Permite rendering concorrente (Suspense ok).

// TurboModules — substitui NativeModules
// Codegen TypeScript spec → interface C++. Carregamento lazy.
// Sem registry global; módulo só carrega quando primeiro acessado.`}</CodeBlock>
        <p>
          Na prática, você quase nunca escreve código JSI. O ganho aparece automaticamente: gestos (Reanimated 3 roda worklets direto na UI thread), listas grandes (FlashList chama métodos native sync), animações nunca mais travam por JS thread busy.
        </p>
      </Section>

      <Section title="Layout: Yoga, não CSS" accent={accent}>
        <p>
          Estilo em RN é um subset de CSS implementado pela engine Yoga (C++ da Meta). Diferenças que pegam desprevenido:
        </p>
        <CodeBlock lang="tsx">{`// 1. flexDirection default é "column", não "row" (web default).
// 2. Não existe grid, float, position: fixed/sticky.
// 3. Unidades são density-independent pixels (dp) — sem px, rem, vw.
// 4. Estilo vai em objeto JS, não string:
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0f172a' },
  title: { fontSize: 18, fontWeight: '600', color: 'white' },
});
// 5. StyleSheet.create faz freeze + id numérico — otimização do bridge.
// 6. Não existe cascade; cada componente recebe style explícito (ok com spread).`}</CodeBlock>
      </Section>

      <Section title="Safe area, notch e gestos do sistema" accent={accent}>
        <p>
          iPhone tem notch/Dynamic Island, Android tem status bar + navigation bar que pode ser gestual. O sistema operacional reserva áreas e quem ignora isso vê botão atrás do notch ou texto cortado pela barra de gestos. Use <code>react-native-safe-area-context</code>:
        </p>
        <CodeBlock lang="tsx">{`import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function Screen({ children }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {children}
    </View>
  );
}`}</CodeBlock>
        <Callout tone="warn">
          SafeAreaView é útil, mas useSafeAreaInsets dá mais controle — você aplica o padding só onde precisa (header sim, conteúdo scrollável não) e evita double-padding em navegadores com header próprio.
        </Callout>
      </Section>

      <Section title="Mapa mental dev-web → RN" accent={accent}>
        <CodeBlock lang="ts">{`// div           → View
// span / p      → Text (obrigatório pra strings)
// img           → Image / ExpoImage (cache melhor)
// button / a    → Pressable (ou TouchableOpacity)
// input         → TextInput
// ul + li loop  → FlatList / FlashList (virtualized)
// scroll div    → ScrollView (NÃO pra listas longas)
// fetch + swr   → fetch + @tanstack/react-query
// localStorage  → AsyncStorage / MMKV (sync, 10x+ rápido)
// CSS :hover    → não existe em mobile (só onPressIn/onPressOut)
// media queries → Dimensions.get('window') + useWindowDimensions`}</CodeBlock>
      </Section>

      <Section title="Quando RN não cabe" accent={accent}>
        <Callout tone="danger" icon="🚨">
          Apps de computação pesada em tempo real (edição de vídeo frame-by-frame, AR complexo, jogos com física), apps que precisam de UI 100% nativa idêntica a Swift/Kotlin (bancos premium, Apple Wallet-like), integração profunda com SDKs que só existem em nativo. Nesses casos, Swift/Kotlin ou Flutter competem melhor. RN brilha em CRUD + networking + formulários + listas + integrações com APIs REST — que é 80% dos apps.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
