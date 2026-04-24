import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('performance-em-rn');
const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'Hermes vs JSC — por que Hermes virou default?',
    options: [
      'Marketing',
      'Hermes é bytecode compilado AOT (não parse JS no startup), tem GC otimizado pra mobile, usa menos RAM, cold start 2-3x mais rápido que JSC — crítico em devices low-end e antes da primeira tela aparecer',
      'Só por tamanho',
      'Roda em servidor',
    ],
    correct: 1,
    explanation: 'Hermes foi desenvolvido pela Meta justamente pra mobile: bytecode pré-compilado no build (não interpretado em runtime), GC generacional eficiente, menor footprint de heap. Benchmark: cold start em Android mid-range cai de ~2000ms (JSC) pra ~700ms (Hermes). Default em 2024+. JSC ainda é opção em cenários raríssimos (debugger legado).',
  },
  {
    question: 'FlashList > FlatList — qual o ganho real?',
    options: [
      'Nenhum',
      'FlashList recicla células de forma similar a RecyclerView (Android) e UITableView (iOS) — estimatedItemSize permite prever layout, menos re-renders, scroll 60fps garantido em 10k+ itens; FlatList tende a jank em listas heterogêneas',
      'Só em iOS',
      'É mais lento',
    ],
    correct: 1,
    explanation: 'FlatList usa VirtualizedList JS-side; cada célula nova ainda monta via bridge. FlashList (Shopify) implementa recycling em C++ + heurísticas de estimatedItemSize/estimatedItemType, aproximando-se de listas nativas. Em listas com items de alturas variáveis (feed de posts), diferença é dramática: 55fps vs 60fps estáveis, menos GC, scroll sem stutter.',
  },
  {
    question: 'Onde useMemo / React.memo realmente ajuda em RN?',
    options: [
      'Sempre',
      'Em componente filho dentro de lista renderizada com frequência (re-render do pai disparava re-render caro de centenas de filhos) ou cálculos pesados derivados de state. Uso indiscriminado adiciona comparações e piora — meça antes',
      'Nunca usar',
      'Só em web',
    ],
    correct: 1,
    explanation: 'memoization tem custo: comparar props/deps + manter valor anterior. Pra componente simples com poucas props, o overhead do compare é maior que o render em si. Ganho real aparece em (a) linhas de lista com shape complexo, (b) child components com lógica pesada (gráfico, mapa), (c) derivação de grande array. Meça com Flipper/Perf Monitor antes de pulverizar useMemo no projeto.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="performance-em-rn"
      title="Performance em RN: Hermes, lists, profiling"
      icon="⚡"
      xp={55}
      readTime={13}
      trailName="Mobile para Devs Web (React Native + Expo)"
      trailColor={accent}
      nextSlug="capstone-app-offline-first"
      nextTitle="Capstone: app offline-first com sync"
      quiz={quiz}
    >
      <Section title="Perf em mobile é assunto diferente" accent={accent}>
        <p>
          60fps significa cada frame em 16.6ms. Se a JS thread trava mais que isso por qualquer motivo (parsing JSON grande, render massivo, cálculo síncrono), você vê jank. Em mobile existe ainda bridge/JSI, main thread native, UI thread — cada um com seu orçamento. Otimização aqui não é sobre re-render à toa; é sobre manter orçamento.
        </p>
      </Section>

      <Section title="Hermes, sempre" accent={accent}>
        <CodeBlock lang="ts">{`// app.config.ts — default em Expo SDK 51+
export default {
  jsEngine: 'hermes', // deixe explícito em doc
};

// Verificar no runtime:
// global.HermesInternal != null → rodando Hermes
console.log('engine', (global as any).HermesInternal ? 'hermes' : 'jsc');`}</CodeBlock>
        <Callout tone="info">
          Hermes tem <code>hbc</code> (Hermes bytecode). Você consegue inspecionar bundle gerado pra ver size e funções exportadas. Em geral reduz ~30% do APK size e ~50% do startup time em low-end Android.
        </Callout>
      </Section>

      <Section title="Listas: a fronte mais comum de jank" accent={accent}>
        <CodeBlock lang="tsx">{`// Errado — map() em array longo
{posts.map(p => <Post key={p.id} post={p} />)}

// OK — FlatList com keyExtractor e getItemLayout (quando altura é fixa)
<FlatList
  data={posts}
  keyExtractor={(p) => p.id}
  getItemLayout={(_, i) => ({ length: 120, offset: 120 * i, index: i })}
  renderItem={({ item }) => <Post post={item} />}
  removeClippedSubviews
  maxToRenderPerBatch={8}
  windowSize={10}
/>

// Melhor — FlashList (Shopify) quando alturas variam
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={posts}
  keyExtractor={(p) => p.id}
  estimatedItemSize={180}
  renderItem={({ item }) => <Post post={item} />}
  getItemType={(item) => item.tipo}  // ajuda reciclagem
/>`}</CodeBlock>
      </Section>

      <Section title="Animações: Reanimated 3 + worklets" accent={accent}>
        <CodeBlock lang="tsx">{`import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export function Card() {
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const pan = Gesture.Pan()
    .onChange((e) => { x.value = e.translationX; })
    .onEnd(() => { x.value = withSpring(0); });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, style]} />
    </GestureDetector>
  );
}`}</CodeBlock>
        <p>
          Worklets rodam na UI thread via JSI, sem tocar JS thread — gesture acompanha dedo em 120Hz (iPhone ProMotion) mesmo se JS estiver em GC. Gestos e animações pesadas devem sempre morar em Reanimated, nunca em <code>Animated</code> clássico da RN core.
        </p>
      </Section>

      <Section title="Profiling: Flipper, Perf Monitor, systrace" accent={accent}>
        <CodeBlock lang="bash">{`# Perf Monitor (Dev Menu > Show Perf Monitor)
# Mostra fps JS thread e UI thread em tempo real.

# React DevTools Profiler (funciona embedded)
# Grava render tree, identifica re-renders caros.

# Android systrace — profiling baixo nível
adb shell atrace --async_start -c sched gfx view
# ... interage com app ...
adb shell atrace --async_stop -z -o /tmp/trace.html

# iOS Instruments (Xcode > Open Developer Tool > Instruments)
# Time Profiler pra CPU, Allocations pra memory, Core Animation pra frames.`}</CodeBlock>
      </Section>

      <Section title="Checklist de performance" accent={accent}>
        <Callout tone="success" icon="✅">
          (1) Hermes ativo. (2) Listas usam FlatList/FlashList virtualizado. (3) Imagens com expo-image (cache, blurhash, transition). (4) Reanimated + Gesture Handler pra qualquer gesto/animação. (5) InteractionManager.runAfterInteractions pra trabalho pesado depois de transição. (6) No bundle prod: InternalsTurboModule, remove console.log, set __DEV__ correto. (7) Bundle analyzer (npx expo-atlas ou source-map-explorer) pra cortar libs pesadas.
        </Callout>
      </Section>

      <Section title="Armadilhas de memória" accent={accent}>
        <Callout tone="danger" icon="🚨">
          Imagens grandes não descarregadas (use expo-image com recyclingKey), listeners de evento não removidos (AppState, Dimensions), closures em useEffect que capturam objetos gigantes, cache infinito em React Query (ajuste gcTime). Use Xcode Instruments Allocations pra ver heap crescer; tela com leak geralmente mostra growth monotônico.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
