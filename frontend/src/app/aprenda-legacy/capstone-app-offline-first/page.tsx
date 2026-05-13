import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-app-offline-first');
const accent = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia "offline-first" real de "funciona mal sem internet"?',
    options: [
      'Só cache',
      'Offline-first: toda escrita é local primeiro (SQLite), fila de mutations sync quando online, leitura sempre do local; conflict resolution explícito (LWW, CRDT ou manual). Usuário não percebe quando está on/off — UX idêntico',
      'Usar PWA',
      'Não salvar nada',
    ],
    correct: 1,
    explanation: 'Offline-first invertir o default: "online é bônus". Escrita → SQLite local → optimistic UI → fila de sync → reconcilia server. Leitura → sempre SQLite → atualizado em background. Usuário no metrô sem sinal continua marcando tarefas, upload acontece depois. Contraste com "cache simples": mostra dados velhos mas não aceita escrita → frustrante.',
  },
  {
    question: 'Estratégia de conflito recomendada pra capstone simples?',
    options: [
      'Ignorar',
      'Last-Write-Wins (LWW) com timestamp + updated_at do cliente enviado junto; server resolve. Pra dados críticos, estender com version number + rejection+merge manual. CRDT só em colaboração tempo real (Google Docs-like)',
      'Bloqueio',
      'Travar sync',
    ],
    correct: 1,
    explanation: 'LWW é 90% dos casos e simples: cada record tem updated_at; quem mandou último ganha. Suficiente pra to-do, notas, tracking pessoal. Se múltiplos usuários editam mesmo record simultâneo, version number + 409 Conflict no server permite client decidir merge. CRDT (Yjs, Automerge) só quando é requisito de produto colaborativo — complexidade alta pra benefício específico.',
  },
  {
    question: 'Como evitar que fila de mutations corrompa durante crash/restart do app?',
    options: [
      'Nada',
      'Persistir fila em SQLite (não memória), usar transactions atômicas pra adicionar/remover, idempotency key em cada mutation (server dedup), retry exponencial com cap, limpar só após confirmação server. App kill no meio retoma fila intacta',
      'Try/catch',
      'Só otimismo',
    ],
    correct: 1,
    explanation: 'Fila em memória some quando OS mata o app (comum em Android low-memory). Fila em SQLite com PRAGMA journal_mode=WAL sobrevive crash. Transação por mutation: INSERT na fila em uma tx, execução + DELETE em outra. Idempotency key (UUID v4 do cliente) garante que retry não duplica no server. Retry com backoff: 1s, 2s, 4s, 8s, cap em 5min.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-app-offline-first"
      title="Capstone: app offline-first com sync"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Mobile para Devs Web (React Native + Expo)"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto: app de notas/tarefas offline-first" accent={accent}>
        <p>
          Escopo concreto: app de notas (CRUD, tags, busca) ou tracking (hábitos, timer). Todo usuário consegue ler e editar sem conectividade; sync em background quando online; export dos dados em JSON. Deploy em TestFlight + Play Internal.
        </p>
      </Section>

      <Section title="Arquitetura de dados" accent={accent}>
        <CodeBlock lang="ts">{`// Camadas de dados (baixo → alto):
// 1. SQLite local (expo-sqlite) — fonte de verdade local
// 2. Fila de mutations — operations pending pra sync
// 3. React Query — cache em memória + subscriptions UI
// 4. API REST/GraphQL remota — eventual consistency

// Schema SQLite:
// CREATE TABLE notes (
//   id TEXT PRIMARY KEY,         -- UUID v4 gerado client
//   title TEXT NOT NULL,
//   body TEXT,
//   updated_at INTEGER NOT NULL, -- epoch ms, pra LWW
//   deleted_at INTEGER,          -- soft delete
//   synced_at INTEGER            -- última sync bem-sucedida
// );
// CREATE INDEX idx_updated ON notes(updated_at DESC);
//
// CREATE TABLE mutations (
//   id TEXT PRIMARY KEY,         -- idempotency key
//   kind TEXT NOT NULL,          -- 'upsert' | 'delete'
//   payload TEXT NOT NULL,       -- JSON
//   attempts INTEGER DEFAULT 0,
//   next_at INTEGER              -- quando retry
// );`}</CodeBlock>
      </Section>

      <Section title="Entregáveis do capstone" accent={accent}>
        <CodeBlock lang="markdown">{`# Capstone offline-first — checklist

## 1. Setup
- [ ] Expo SDK 51+ com dev build
- [ ] expo-sqlite, @tanstack/react-query, react-native-mmkv
- [ ] Expo Router com tabs (Listas | Criar | Config)

## 2. Data layer
- [ ] SQLite schema versionado (migrations numeradas)
- [ ] DAO por tabela (insert/update/delete/query) em funções puras
- [ ] Hooks useNotes / useNote(id) wrapping SQLite em useQuery

## 3. Escrita offline-first
- [ ] Criar/editar → UPSERT local imediato + enqueue mutation
- [ ] UI reflete instantâneo (React Query setQueryData)
- [ ] Delete soft (deleted_at), purge após sync confirmada

## 4. Sync engine
- [ ] Background worker (expo-task-manager) ou on-focus sync
- [ ] Pull: GET /notes?since={lastSync} → merge LWW local
- [ ] Push: pop fila → POST /notes com idempotency key → on 2xx remove fila
- [ ] Retry exponencial, cap 5min, network-aware (NetInfo)

## 5. Conflict resolution
- [ ] LWW por updated_at (server + client timestamps)
- [ ] Testes unitários: edit offline + edit outro device → último ganha

## 6. Observabilidade
- [ ] Tela /sync-status com fila atual, último sync, errors
- [ ] Sentry breadcrumbs pra cada mutation + sync attempt
- [ ] Export JSON de todos os dados (LGPD friendly)

## 7. Deploy
- [ ] EAS build preview + TestFlight + Play Internal
- [ ] 3+ testers reais com dispositivos distintos
- [ ] Teste: modo avião durante 1h criando notas, voltar online, verificar sync
- [ ] README com screenshots + architecture diagram`}</CodeBlock>
      </Section>

      <Section title="Esqueleto do sync engine" accent={accent}>
        <CodeBlock lang="ts">{`import NetInfo from '@react-native-community/netinfo';
import { openDatabaseAsync } from 'expo-sqlite';

const BACKOFF = [1000, 2000, 4000, 8000, 16000, 60_000, 300_000];

export async function processQueue(apiBase: string, token: string) {
  const online = (await NetInfo.fetch()).isConnected;
  if (!online) return;

  const db = await openDatabaseAsync('app.db');
  const now = Date.now();
  const pending = await db.getAllAsync<any>(
    'SELECT * FROM mutations WHERE next_at IS NULL OR next_at <= ? ORDER BY id LIMIT 20',
    [now],
  );

  for (const m of pending) {
    try {
      const res = await fetch(apiBase + '/mutations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
          'Idempotency-Key': m.id,
        },
        body: m.payload,
      });
      if (res.ok) {
        await db.runAsync('DELETE FROM mutations WHERE id = ?', [m.id]);
      } else if (res.status >= 500) {
        await scheduleRetry(db, m);
      } else {
        // 4xx — não é retryable, logar e remover
        await db.runAsync('DELETE FROM mutations WHERE id = ?', [m.id]);
      }
    } catch {
      await scheduleRetry(db, m);
    }
  }
}

async function scheduleRetry(db: any, m: any) {
  const attempts = m.attempts + 1;
  const delay = BACKOFF[Math.min(attempts, BACKOFF.length - 1)];
  await db.runAsync(
    'UPDATE mutations SET attempts = ?, next_at = ? WHERE id = ?',
    [attempts, Date.now() + delay, m.id],
  );
}`}</CodeBlock>
      </Section>

      <Section title="Critérios de aceitação" accent={accent}>
        <Callout tone="success" icon="✅">
          (1) Modo avião por 1h criando/editando 50+ itens — zero perda ao voltar online. (2) Kill do app durante sync — retomada limpa sem duplicação. (3) Dois devices mesma conta editando offline — reconciliação correta ao sync. (4) Cold start &lt; 1s em Android mid-range. (5) Bundle app &lt; 40MB. (6) Crash-free rate &gt; 99.5% em 3 dias de beta com 10+ usuários.
        </Callout>
      </Section>

      <Section title="Armadilhas que vão aparecer" accent={accent}>
        <Callout tone="warn">
          Clock skew entre devices (sempre confie no server pra timestamp final), soft delete vs hard delete (não purge antes de confirmar), SQLite journal mode WAL (melhor concorrência, mas tem arquivo -wal), migrations com ALTER TABLE (SQLite tem limitações — use estratégia create-copy-drop se necessário), throttle de background tasks iOS (máx ~30s por execução).
        </Callout>
      </Section>

      <Section title="Entrega final pro portfólio" accent={accent}>
        <Callout tone="info">
          Grave vídeo de 90s: modo avião, criar notas, voltar online, mostrar sync. Poste no LinkedIn com link do TestFlight + repo público. README com architecture diagram (Mermaid), decisões (por que LWW, por que SQLite, por que MMKV), próximos passos (CRDT, E2E encryption). Esse tipo de entregável diferencia dev web-que-tocou-mobile de engenheiro mobile competente.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
