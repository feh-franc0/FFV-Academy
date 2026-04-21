import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('estado-e-async-em-rn');
const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que separar server state (React Query) de client state (Zustand)?',
    options: [
      'Gosto pessoal',
      'São problemas diferentes: server state é cópia remota (precisa de cache, stale, refetch, retry, dedupe); client state é UI efêmera (filtros, modais, wizard step) que não sobrevive ao server. Misturar em Redux único vira boilerplate e bugs de sincronização',
      'Performance idêntica',
      'Só um funciona',
    ],
    correct: 1,
    explanation: 'Server state tem características: vem de fonte remota, fica stale com o tempo, requer invalidation em mutations, pode falhar. React Query resolve tudo isso. Client state é local e síncrono: qual aba tá ativa, filtro selecionado, input não submetido. Zustand (ou useState/context) cabe perfeitamente. Um Redux global pra tudo obriga você a escrever reducer pra cada fetch, duplicar loading/error, invalidar manual.',
  },
  {
    question: 'MMKV versus AsyncStorage — por que mudar?',
    options: [
      'Moda',
      'AsyncStorage é async + serializa JSON em cada read/write (lento em objetos grandes); MMKV (Tencent, nativo C++) é sync, mmap-backed, 10-30x mais rápido, suporta encryption built-in e tipos nativos (number, boolean, string, bytes)',
      'AsyncStorage sumiu',
      'MMKV só iOS',
    ],
    correct: 1,
    explanation: 'Benchmark clássico: salvar 1000 keys em AsyncStorage leva ~800ms; em MMKV ~30ms. AsyncStorage ainda é útil pra cross-platform simples e quando tamanho não importa, mas hoje (2026) MMKV é o default em apps sérios. Bibliotecas de state (Zustand persist, redux-persist) têm adapter pronto pra MMKV.',
  },
  {
    question: 'staleTime: 0 vs staleTime: 60_000 em React Query no mobile — qual diferença prática?',
    options: [
      'Nenhuma',
      'staleTime 0 (default) refetch toda vez que componente monta ou app volta ao foreground (drena bateria e dados móveis); staleTime maior mantém cache fresco pelo período, evitando refetch agressivo — no mobile quase sempre você quer 30s–5min',
      'Sempre use 0',
      'É flag de produção',
    ],
    correct: 1,
    explanation: 'No mobile, focus refetch + mount refetch + reconnect refetch disparam juntos e consomem pacote de dados. Ajustar staleTime e gcTime pelo tipo de query (feed: 30s; perfil: 5min; catálogo: 1h) reduz requests em 70%+ sem impactar UX. Combine com placeholderData pra transições suaves e networkMode pra controlar retry offline.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="estado-e-async-em-rn"
      title="Estado e async em RN: React Query + Zustand"
      icon="🔄"
      xp={50}
      readTime={12}
      trailName="Mobile para Devs Web (React Native + Expo)"
      trailColor={accent}
      nextSlug="native-modules-basicos"
      nextTitle="Native modules: quando Kotlin/Swift mínimo"
      quiz={quiz}
    >
      <Section title="Dois tipos de estado, duas ferramentas" accent={accent}>
        <p>
          Em mobile vale ainda mais que no web separar server state de client state. Mobile tem conectividade intermitente, app suspende e volta, bateria importa. Você quer cache agressivo, retry inteligente e invalidation pontual pra server; quer reatividade simples pra client UI.
        </p>
      </Section>

      <Section title="React Query configurado pra mobile" accent={accent}>
        <CodeBlock lang="tsx">{`import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Foco: iOS/Android têm AppState, não document.visibility.
AppState.addEventListener('change', (state) => {
  focusManager.setFocused(state === 'active');
});

// Online/offline: NetInfo no lugar de navigator.onLine.
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((s) => setOnline(!!s.isConnected));
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,           // 1min antes de revalidar
      gcTime: 5 * 60_000,          // 5min em cache antes de descartar
      retry: 2,
      networkMode: 'offlineFirst', // entrega cache mesmo offline
    },
    mutations: { retry: 1, networkMode: 'offlineFirst' },
  },
});`}</CodeBlock>
        <Callout tone="info">
          <code>networkMode: 'offlineFirst'</code> é a config mobile-friendly: queries retornam dados cacheados sem ficar travadas aguardando rede, e mutations são enfileiradas pra retry quando voltar online.
        </Callout>
      </Section>

      <Section title="Persist do cache entre sessões" accent={accent}>
        <CodeBlock lang="ts">{`import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const persister = createSyncStoragePersister({
  storage: {
    getItem: (k) => storage.getString(k) ?? null,
    setItem: (k, v) => storage.set(k, v),
    removeItem: (k) => storage.delete(k),
  },
});

persistQueryClient({ queryClient, persister, maxAge: 24 * 60 * 60 * 1000 });`}</CodeBlock>
        <p>
          Com isso, abrir o app com 3G ruim mostra conteúdo instantâneo (cache do MMKV) e revalida em background. A diferença percebida é enorme — de "app travado" pra "app rápido com sync silencioso".
        </p>
      </Section>

      <Section title="Zustand pra client state" accent={accent}>
        <CodeBlock lang="ts">{`import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const mmkvAdapter = {
  getItem: (k: string) => storage.getString(k) ?? null,
  setItem: (k: string, v: string) => storage.set(k, v),
  removeItem: (k: string) => storage.delete(k),
};

interface UIState {
  theme: 'light' | 'dark';
  filtrosAtivos: string[];
  setTheme: (t: UIState['theme']) => void;
  toggleFiltro: (f: string) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      filtrosAtivos: [],
      setTheme: (theme) => set({ theme }),
      toggleFiltro: (f) => set((s) => ({
        filtrosAtivos: s.filtrosAtivos.includes(f)
          ? s.filtrosAtivos.filter(x => x !== f)
          : [...s.filtrosAtivos, f],
      })),
    }),
    { name: 'ui', storage: createJSONStorage(() => mmkvAdapter) },
  ),
);`}</CodeBlock>
      </Section>

      <Section title="Optimistic updates em mutation" accent={accent}>
        <CodeBlock lang="tsx">{`const toggleLike = useMutation({
  mutationFn: (postId: string) => api.toggleLike(postId),
  onMutate: async (postId) => {
    await queryClient.cancelQueries({ queryKey: ['post', postId] });
    const prev = queryClient.getQueryData(['post', postId]);
    queryClient.setQueryData(['post', postId], (old: any) => ({
      ...old, liked: !old.liked, likes: old.likes + (old.liked ? -1 : 1),
    }));
    return { prev };
  },
  onError: (_err, postId, ctx) => {
    if (ctx?.prev) queryClient.setQueryData(['post', postId], ctx.prev);
  },
  onSettled: (_d, _e, postId) => {
    queryClient.invalidateQueries({ queryKey: ['post', postId] });
  },
});`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Padrão onMutate/onError/onSettled é a base de UX mobile-first: tap no coração atualiza a UI em 0ms, rollback só se servidor rejeitar. Garante app que parece instantâneo mesmo em 3G.
        </Callout>
      </Section>

      <Section title="Armadilhas" accent={accent}>
        <Callout tone="warn">
          (1) Usar Context pra server state — re-renderiza tudo em cascata. (2) Esquecer de configurar focusManager/onlineManager e ter comportamento errado de refetch. (3) Salvar token em AsyncStorage não-criptografado — use Expo SecureStore ou MMKV com encryptionKey. (4) Objetos grandes em Zustand persist — particione store ou use Zustand slice pattern.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
