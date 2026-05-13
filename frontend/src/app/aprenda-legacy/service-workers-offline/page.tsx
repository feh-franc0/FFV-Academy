import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, Timeline, DecisionBox, StackFlow, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('service-workers-offline');

const ACCENT = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'O lifecycle de um Service Worker tem 3 fases canônicas: instalar, ativar, fetch. Qual é uma característica única do install?',
    options: [
      'Roda toda vez que o usuário visita a página',
      'Só roda quando há um SW novo ou atualizado. Aqui você precarrega assets críticos em cache; se falhar, install falha e SW não é ativado',
      'Bloqueia o navegador até completar',
      'Não pode acessar Cache API',
    ],
    correct: 1,
    explanation:
      'Install é único: browser baixa o SW, byte-compara com o existente. Se diferente, executa install. Tipicamente você faz `event.waitUntil(cache.addAll([...]))` precaching assets. Se a promise rejeitar, install falha — SW antigo continua. Activate só dispara quando install completa e SW antigo é descartado.',
  },
  {
    question: 'O que `event.waitUntil(promise)` faz dentro do install ou activate?',
    options: [
      'Bloqueia o thread por até 30s',
      'Estende a vida do evento até a promise resolver. Sem isso, o browser pode encerrar o SW após o handler retornar sincronamente, abortando trabalho async',
      'Adiciona um timeout configurável',
      'Apenas para debugging',
    ],
    correct: 1,
    explanation:
      'SW pode ser encerrado pelo browser a qualquer momento entre eventos para economizar memória. `event.waitUntil(p)` sinaliza “mantenha o SW vivo até essa promise resolver”. Crítico em install (precaching), activate (limpar caches antigos), fetch (responder com resposta async), sync (background sync), push (mostrar notificação).',
  },
  {
    question: 'Quais são os 4 padrões básicos de cache do Workbox?',
    options: [
      'GET, POST, PUT, DELETE',
      'Cache-First, Network-First, Stale-While-Revalidate, Network-Only / Cache-Only',
      'Eager, Lazy, Persistent, Volatile',
      'Layer1, Layer2, Layer3, Layer4',
    ],
    correct: 1,
    explanation:
      'Cache-First: serve cache, network só se faltar. Bom para assets imutáveis (hashed JS/CSS). Network-First: tenta network, cache se offline. Bom para APIs com fallback. Stale-While-Revalidate: serve cache + atualiza em background. Bom para fontes/imagens não-críticas. Network-Only/Cache-Only: extremos. Workbox encapsula tudo em strategies.',
  },
  {
    question: 'Para que serve a Background Sync API?',
    options: [
      'Sincronizar dados entre múltiplas abas',
      'Diferir trabalho até o usuário ter conectividade. Você faz `registration.sync.register("send-tags")` e o SW recebe evento `sync` quando há rede — útil para enviar mensagens compostas offline',
      'API legacy substituída por Web Locks',
      'Sincronizar service workers entre browsers',
    ],
    correct: 1,
    explanation:
      'Background Sync (Chrome only por anos, agora amplamente suportado) permite “quando voltar online, faça isso”. Útil para: send queue de mensagens, upload de fotos, retry de POSTs. SW handler: self.addEventListener("sync", e => e.waitUntil(sendPending())). Periodic Background Sync é variante para sincronização agendada (ex: atualizar feed a cada hora).',
  },
  {
    question: 'O que a Push API faz e qual sua diferença para Notifications API?',
    options: [
      'São a mesma coisa',
      'Push: receber mensagens do servidor mesmo com aba fechada via push service (FCM, Mozilla, etc.) + VAPID auth. Notifications: mostrar notificação na tela. Geralmente combinadas: push acorda SW → mostra notification',
      'Push só funciona em iOS',
      'Notifications é parte da Web Bluetooth',
    ],
    correct: 1,
    explanation:
      'Push API estabelece subscription com push service do browser, recebe mensagens criptografadas. SW recebe evento "push" mesmo offline/sem aba. Para visibilidade: SW chama self.registration.showNotification (Notifications API). VAPID é o protocolo de identificação do servidor. Web Push Protocol (RFC 8030) é o padrão. iOS Safari ganhou suporte em 16.4 (2023) mas só para PWAs instalados.',
  },
  {
    question: 'Por que SW deve ser servido com `Service-Worker-Allowed` header em alguns casos?',
    options: [
      'É opcional sempre',
      'O scope default de um SW é seu próprio diretório. Para escopo maior (ex: SW em /sw.js controlando /, ou em /assets/sw.js controlando /), o servidor precisa enviar Service-Worker-Allowed: / autorizando explicitamente',
      'Para passar pelo firewall',
      'Apenas necessário em Firefox',
    ],
    correct: 1,
    explanation:
      'Scope é restrito ao diretório do SW. Para ampliar, header Service-Worker-Allowed declara escopo permitido pelo servidor. Útil quando bundler coloca SW em /static/sw.js mas você quer que controle /. Ver “The Service Worker Lifecycle” em web.dev/articles/service-worker-lifecycle.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="service-workers-offline"
      title="Service Workers: offline-first, background sync, push"
      icon="📡"
      xp={65}
      readTime={13}
      trailName="Browser & Web Internals Profundo"
      trailColor={ACCENT}
      nextSlug="wasm-do-typescript"
      nextTitle="WebAssembly do dev TypeScript: Rust, Go, AssemblyScript"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Service Worker é o proxy programável entre seu app e a network. Vive além das abas,
        intercepta requests, serve do cache, sincroniza em background, recebe push. PWA séria
        sem SW não existe. Mas o lifecycle é cheio de armadilhas — entender é evitar “meu SW
        antigo está preso no cache de produção”.
      </p>

      <Section title="Anatomia básica" accent={ACCENT}>
        <CodeBlock lang="javascript" filename="register-sw.js">{`// main.js (no app)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'module',  // ES modules em SW (Chrome 91+, Safari 15.4+)
        updateViaCache: 'none',  // não cache do próprio SW
      });
      console.log('SW registered, scope:', reg.scope);
    } catch (e) {
      console.error('SW failed:', e);
    }
  });
}`}</CodeBlock>
        <CodeBlock lang="javascript" filename="sw.js">{`const CACHE = 'app-v3';
const PRECACHE = ['/', '/app.js', '/style.css', '/offline.html'];

self.addEventListener('install', (event) => {
  // pula a fase "waiting" — novo SW assume controle assim que pronto
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
  );
});

self.addEventListener('activate', (event) => {
  // limpa caches antigos
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())  // assume controle de clients existentes
  );
});

self.addEventListener('fetch', (event) => {
  // padrão: network-first com fallback para cache
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then(r => r || caches.match('/offline.html'))
    )
  );
});`}</CodeBlock>
        <Callout tone="info" icon="📚">
          Spec: <InlineCode>w3c.github.io/ServiceWorker</InlineCode>. Guides:{' '}
          <InlineCode>web.dev/articles/service-worker-lifecycle</InlineCode> e
          “Service Workers: an Introduction” por Matt Gaunt.
        </Callout>
      </Section>

      <Section title="O lifecycle — onde mora o dragão" accent={ACCENT}>
        <StackFlow
          title="Lifecycle de um Service Worker"
          accent={ACCENT}
          items={[
            {
              icon: '⬇️',
              label: '1. Download',
              sub: 'Byte-compare',
              detail: 'Browser baixa o sw.js e compara com o existente. Se idêntico, nada acontece. Se diferente, segue para install.',
              connector: 'diff detected',
            },
            {
              icon: '🔧',
              label: '2. Install',
              sub: 'Uma vez por versão',
              detail: 'Evento install dispara. Tipicamente: cache.addAll(precache list). event.waitUntil mantém vivo. Se rejeitar, SW antigo permanece ativo.',
              connector: 'install ok',
            },
            {
              icon: '⏳',
              label: '3. Waiting',
              sub: 'Até abas fecharem',
              detail: 'Por padrão, SW novo espera todas as abas controladas pelo antigo fecharem. Skip com self.skipWaiting() no install.',
              connector: 'antigo morre',
            },
            {
              icon: '✅',
              label: '4. Activate',
              sub: 'Cleanup',
              detail: 'Limpa caches antigos. event.waitUntil + clients.claim() para assumir controle de abas já abertas (não fariam isso até refresh).',
              connector: 'rodando',
            },
            {
              icon: '🌐',
              label: '5. Idle ↔ Fetch/Push/Sync',
              sub: 'On-demand',
              detail: 'SW dorme entre eventos. Acorda quando há fetch interceptado, push msg recebida, sync disparado. Browser pode terminar SW a qualquer momento (cap ~30s por evento).',
            },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          O ciclo waiting é a fonte de 90% dos bugs “SW antigo preso”. Em dev, sempre use{' '}
          <InlineCode>self.skipWaiting()</InlineCode> + <InlineCode>self.clients.claim()</InlineCode>.
          Em produção, considere prompt “Nova versão disponível, atualizar?” em vez de
          skipWaiting automático.
        </Callout>
      </Section>

      <Section title="Cache strategies (Workbox patterns)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Strategy', 'Lógica', 'Use case']}
          rows={[
            ['Cache-First', 'Cache → fallback network → atualiza cache', 'Assets imutáveis (hashed JS/CSS), fontes'],
            ['Network-First', 'Network → fallback cache → fallback offline page', 'HTML navegações, APIs com dado fresco'],
            ['Stale-While-Revalidate', 'Cache (rápido) + revalida em background', 'Imagens, avatars, conteúdo que pode estar desatualizado'],
            ['Network-Only', 'Sempre network, sem cache', 'Analytics POST, mutations'],
            ['Cache-Only', 'Sempre cache, sem network', 'Precache imutável (versionar manual)'],
          ]}
        />
        <CodeBlock lang="javascript" filename="workbox-strategies.js">{`// Com Workbox v7 (recomendado vs implementar à mão)
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// JS/CSS hasheados: cache-first com longa expiração
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

// Imagens: stale-while-revalidate
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 100 })],
  })
);

// HTML: network-first com timeout
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html',
    networkTimeoutSeconds: 3,
  })
);`}</CodeBlock>
      </Section>

      <Section title="Background Sync" accent={ACCENT}>
        <p>
          Usuário escreve algo, clica enviar, está offline. Sem Background Sync, dado se perde
          ao fechar a aba. Com, o SW envia quando rede voltar.
        </p>
        <CodeBlock lang="javascript" filename="background-sync.js">{`// App: registrar uma sync tag
async function sendMessage(msg) {
  await db.outbox.add(msg);   // queue local (IndexedDB)
  const reg = await navigator.serviceWorker.ready;
  await reg.sync.register('send-outbox');
}

// sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-outbox') {
    event.waitUntil(sendAllPending());
  }
});

async function sendAllPending() {
  const messages = await db.outbox.toArray();
  for (const m of messages) {
    try {
      await fetch('/api/messages', { method: 'POST', detail: JSON.stringify(m) });
      await db.outbox.delete(m.id);
    } catch {
      // browser vai retentar — tag fica registrada
      throw new Error('retry');
    }
  }
}`}</CodeBlock>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'sync', v: 'One-shot quando online — Chrome/Edge/Opera, Safari ainda não' },
            { k: 'periodicsync', v: 'Agendado (ex: a cada 12h). Requer permissão, só PWAs instaladas com alta engagement' },
            { k: 'Retry', v: 'Browser retry exponencial até sucesso ou ~24h. Você não precisa implementar retry.' },
          ]}
        />
      </Section>

      <Section title="Push API + Notifications" accent={ACCENT}>
        <CodeBlock lang="javascript" filename="push-subscribe.js">{`// app: pedir permissão e subscribar
const reg = await navigator.serviceWorker.ready;
const permission = await Notification.requestPermission();
if (permission !== 'granted') return;

const subscription = await reg.pushManager.subscribe({
  userVisibleOnly: true,            // obriga mostrar notif por push
  applicationServerKey: VAPID_PUBLIC_KEY,
});
// envie subscription.endpoint + keys ao seu backend

// sw.js: receber push
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { label: 'Nova mensagem' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge.png',
      data: { url: data.url },
      actions: [
        { action: 'open', title: 'Abrir' },
        { action: 'dismiss', title: 'Dispensar' }
      ],
    })
  );
});

// Clique na notificação → focar/abrir aba
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const url = event.notification.data?.url ?? '/';
      const existing = clients.find(c => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});`}</CodeBlock>
        <Callout tone="info" icon="🍎">
          iOS Safari ganhou Web Push em 16.4 (março 2023), mas só para apps instalados como
          PWA (Add to Home Screen). Em macOS Safari também funciona, em qualquer site.
        </Callout>
      </Section>

      <Section title="Timeline do Service Worker" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: '2014', label: 'Spec inicial', detail: 'Alex Russell, Jake Archibald, Andrew Betts — “Service Workers Explained”' },
            { when: '2015', label: 'Chrome 40 ship', detail: 'Primeira implementação estável' },
            { when: '2018', label: 'Workbox 3', detail: 'Google lança Workbox como abstração canônica para SW patterns' },
            { when: '2018', label: 'Safari 11.1 + iOS', detail: 'Apple adiciona suporte parcial (sem push)' },
            { when: '2022', label: 'Background Fetch', detail: 'API para downloads/uploads longos resilientes' },
            { when: '2023', label: 'iOS 16.4 Push', detail: 'Apple destrava Web Push em PWAs no iPhone', highlight: true },
            { when: '2024–26', label: 'Periodic Sync + Web Locks', detail: 'Aumenta gradualmente em browsers além do Chrome' },
          ]}
        />
      </Section>

      <Section title="Antipatterns comuns" accent={ACCENT}>
        <DecisionBox
          scenario="Você usa SW para servir API JSON sempre do cache para “performance”"
          winner="EVITE — quase certamente errado"
          winnerColor={ACCENT}
          why="APIs mudam. Servir cache stale de API leva a UI mostrando dados zumbis. Use Network-First com timeout curto (~3s) e fallback cache. Para dados que podem ser stale, Stale-While-Revalidate, mostrando indicador “atualizando” no UI."
          alternatives={[
            { name: 'Cache-First para HTML', when: 'Errado — usuário vê versão antiga por dias' },
            { name: 'Sem versionar cache name', when: 'Errado — não há como invalidar; sempre versione (app-v3)' },
            { name: 'skipWaiting sem warn user', when: 'Pode quebrar abas abertas se houver mudança de schema' },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          “SW preso em prod” é o pesadelo. Sempre tenha um “kill switch” — SW que se
          unregistre ele mesmo se receber flag específica do server. Já salvou muita gente.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Next.js 16 tem suporte oficial a Service Worker?"
          a={
            <span>
              Não direto. Use <InlineCode>next-pwa</InlineCode> ou{' '}
              <InlineCode>@serwist/next</InlineCode> (sucessor moderno). Ambos integram
              Workbox no build, gerando sw.js com precache de assets gerados.
            </span>
          }
        />
        <QAItem
          q="Service Worker funciona em localhost sem HTTPS?"
          a={
            <span>
              Sim — localhost é exceção de segurança (Chrome, Firefox, Safari). Em qualquer
              outro host, HTTPS é obrigatório. ngrok com HTTPS é prático para testar em
              dispositivos.
            </span>
          }
        />
        <QAItem
          q="Como limpar Service Worker durante dev?"
          a={
            <span>
              DevTools → Application → Service Workers → Unregister. Também: “Update on
              reload” checkbox força reinstall a cada F5. Em código:{' '}
              <InlineCode>{`navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))`}</InlineCode>.
            </span>
          }
        />
        <QAItem
          q="Workbox vs implementar à mão?"
          a={
            <span>
              Workbox para 95% dos casos. Implementar à mão só vale para casos muito
              específicos (ex: streaming responses customizados). Workbox v7 é tree-shakable e
              pequeno.
            </span>
          }
        />
      </Section>

      <Callout tone="success" icon="✅">
        Próximo: rodar Rust/Go no browser para CPU-bound real — WebAssembly. Veja{' '}
        <InlineCode>wasm-do-typescript</InlineCode>.
      </Callout>
    </div>
  );
}
