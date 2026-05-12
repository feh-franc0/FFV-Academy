import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('origin-private-fs');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é Origin Private File System (OPFS)?',
    options: [
      'Acesso ao disco do usuário sem permissão',
      'Filesystem privado por origin (uma "pasta" virtual só vista pela própria origin), sem prompt de permissão, com performance perto de IndexedDB-NG e API similar a node:fs. Substitui boa parte dos casos de IndexedDB',
      'Sinônimo de localStorage',
      'API de impressão',
    ],
    correct: 1,
    explanation: 'OPFS (parte da File System Access API) é o "disco privado" que toda origin recebe automaticamente. Sem permissão, sem prompt. Performance excelente (mais rápido que IndexedDB em muitos benchmarks). Disponível em Workers para máxima performance (acesso síncrono via FileSystemSyncAccessHandle).',
  },
  {
    question: 'Para que serve SQLite WASM em OPFS?',
    options: [
      'Substituir banco no servidor',
      'Rodar SQLite real no browser com persistência em OPFS — útil para apps que precisam de queries SQL complexas, full-text search local, offline-first sério. sql.js + wa-sqlite OPFS VFS são as libs',
      'Apenas para testes',
      'Apenas para games',
    ],
    correct: 1,
    explanation: 'SQLite no browser sobre OPFS é o stack que destrava apps "real database client-side" — notion-like, linear-like, qualquer app com search/query complexa local. wa-sqlite com OPFS VFS é a referência (Roy Hashimoto). Performance: comparável a SQLite nativo.',
  },
  {
    question: 'Qual a diferença entre OPFS e File System Access API "completa"?',
    options: [
      'São a mesma coisa',
      'OPFS: sandbox privado por origin, sem permissão. File System Access: pedir ao usuário para escolher arquivo/pasta no disco real (showOpenFilePicker, showDirectoryPicker) com prompt de permissão',
      'OPFS é mais antiga',
      'File System Access não existe',
    ],
    correct: 1,
    explanation: 'Duas APIs irmãs com casos de uso distintos. OPFS = storage privado do app. File System Access = leitor/escritor de arquivos do disco real do usuário (com permissão). Você pode usar ambas no mesmo app — ex: importar arquivo via File System Access, processar e salvar local no OPFS.',
  },
  {
    question: 'Por que FileSystemSyncAccessHandle só existe em Workers?',
    options: [
      'Falha de design',
      'Operações síncronas no main thread bloqueariam UI; em Worker é seguro. Por isso a API mais performática (acesso file-like síncrono direto) só está disponível em Web Workers. No main thread, OPFS funciona mas com API assíncrona',
      'Limitação do Chrome apenas',
      'Não existe',
    ],
    correct: 1,
    explanation: 'Decisão deliberada de spec. Sync I/O no main thread = UI travada. Em Worker, sync I/O é OK porque não impacta o thread principal. Para máxima performance (SQLite WASM, processing pesado), você naturalmente roda em Worker — e ganha sync access ao OPFS de graça.',
  },
  {
    question: 'Quando NÃO usar OPFS?',
    options: [
      'Quando precisa de muito espaço',
      'Quando o dado precisa ser visível ao usuário fora do app (use File System Access pickers), quando precisa sincronizar entre devices (use backend), ou quando precisa de transactions complexas com isolation forte (use IndexedDB ou SQLite-on-OPFS)',
      'Sempre',
      'Quando suporte ainda for limitado',
    ],
    correct: 1,
    explanation: 'OPFS é storage privado e local. Não substitui backend (sync entre devices). Não substitui Downloads folder (dado visível ao usuário). E o file API direto não tem transactions — para isso, ponha SQLite WASM em cima.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="origin-private-fs"
      title="Origin Private File System & File System Access"
      icon="💾"
      xp={55}
      readTime={11}
      trailName="Browser & Web Internals Profundo"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O storage que ninguém te contou que existe" accent={accent}>
        <p className="text-sm leading-6">
          IndexedDB sempre foi a API mais reclamada do browser — verbosa, lenta, transações esquisitas, schema flexível demais. OPFS (Origin Private File System) chega como o storage moderno para apps client-side sérios: API limpa, performance excelente, sem prompt de permissão. Em maio/2026, suporte em todos os browsers majoritários (Chrome, Firefox, Safari).
        </p>
        <Callout tone="success">
          Para apps offline-first ou que processam muito dado local (Figma-like, Notion-like, editores), OPFS é fundação. Spotify, Photoshop Web, AutoCAD Web — todos usam OPFS.
        </Callout>
      </Section>

      <Section title="API básica — async no main thread" accent={accent}>
        <CodeBlock lang="typescript">{`// Acessar o root do OPFS
const root = await navigator.storage.getDirectory();

// Criar/abrir arquivo
const fileHandle = await root.getFileHandle('user-data.bin', { create: true });

// Escrever
const writable = await fileHandle.createWritable();
await writable.write(new Uint8Array([0xff, 0x00, 0x01]));
await writable.close();

// Ler
const file = await fileHandle.getFile();
const buffer = await file.arrayBuffer();

// Listar dir
for await (const [name, handle] of root) {
  console.log(name, handle.kind); // 'file' | 'directory'
}

// Deletar
await root.removeEntry('user-data.bin');`}</CodeBlock>
      </Section>

      <Section title="A API síncrona — só em Worker" accent={accent}>
        <CodeBlock lang="typescript">{`// Em worker.js (Web Worker)
const root = await navigator.storage.getDirectory();
const fileHandle = await root.getFileHandle('db.sqlite', { create: true });

// Acesso síncrono — só em Worker!
const access = await fileHandle.createSyncAccessHandle();

const buffer = new ArrayBuffer(1024);
access.read(buffer, { at: 0 });    // SYNC read
access.write(new Uint8Array([1, 2, 3]), { at: 0 });  // SYNC write
access.flush();
access.close();`}</CodeBlock>
        <Callout tone="info">
          SyncAccessHandle é o que destrava SQLite WASM em OPFS. SQLite faz I/O síncrono historicamente — sync handle no Worker permite que ele rode com performance nativa.
        </Callout>
      </Section>

      <Section title="SQLite WASM em OPFS — o stack" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Lib', 'Foco', 'Quando usar']}
          rows={[
            ['sql.js', 'SQLite WASM clássico, sem persistência', 'Apenas in-memory, leve'],
            ['wa-sqlite (Roy Hashimoto)', 'SQLite WASM + OPFS VFS, async e sync', 'Apps Sério — Notion-like, Linear-like'],
            ['sqlite-wasm (oficial, sqlite.org)', 'Build oficial do projeto SQLite', 'Quer suporte oficial'],
            ['absurd-sql', 'SQLite sobre IndexedDB (legado)', 'Browsers antigos sem OPFS'],
            ['SQLocal', 'Wrapper TS sobre sqlite-wasm com queries tipadas', 'DX moderna'],
          ]}
        />
      </Section>

      <Section title="Quotas e limites" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Quota por origin', v: 'Tipicamente ~60% do disco livre, limitado pelo browser. Use navigator.storage.estimate() para checar.' },
            { k: 'Eviction policy', v: 'Best-effort: pode ser limpo se disco encher. Use navigator.storage.persist() para pedir storage persistente.' },
            { k: 'Quota exceeded', v: 'Pegue DOMException com name === "QuotaExceededError"' },
            { k: 'Backup do usuário', v: 'OPFS não é backup-amigável — ofereça export explícito (File System Access showSaveFilePicker)' },
            { k: 'Multi-tab', v: 'Vários tabs da mesma origin compartilham OPFS — use Web Locks API para sincronizar' },
          ]}
        />
      </Section>

      <Section title="File System Access — o irmão completo" accent={accent}>
        <p className="text-sm leading-6">
          Para escrever no disco "real" do usuário (Documents, Downloads, qualquer pasta), use File System Access:
        </p>
        <CodeBlock lang="typescript">{`// Abrir um arquivo do disco do usuário
const [fileHandle] = await window.showOpenFilePicker({
  types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
});
const file = await fileHandle.getFile();
const text = await file.text();

// Salvar um arquivo (com prompt)
const saveHandle = await window.showSaveFilePicker({
  suggestedName: 'export.json',
  types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
});
const writable = await saveHandle.createWritable();
await writable.write(JSON.stringify(data));
await writable.close();

// Abrir uma pasta inteira
const dirHandle = await window.showDirectoryPicker();
for await (const entry of dirHandle.values()) {
  console.log(entry.name);
}`}</CodeBlock>
        <Callout tone="warn">
          File System Access exige interação do usuário (clique para abrir o picker). Não funciona em Firefox/Safari sem polyfill (showOpenFilePicker pode estar atrás de flag em Firefox).
        </Callout>
      </Section>

      <Section title="Compatibilidade em maio/2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Browser', 'OPFS (async)', 'OPFS Sync (Worker)', 'File System Access']}
          rows={[
            ['Chrome / Edge', '✅ Stable 86+', '✅ Stable 102+', '✅ Stable'],
            ['Safari', '✅ Stable 15.2+', '✅ Stable 17+', '⚠️ Parcial'],
            ['Firefox', '✅ Stable 111+', '✅ Stable 121+', '⚠️ Behind flag'],
          ]}
        />
      </Section>

      <Section title="Encerrando a trilha — Browser & Web Internals" accent={accent}>
        <p className="text-sm leading-6">
          Você atravessou os 12 módulos: V8 JIT, GC Orinoco, event loop, rendering pipeline, Web Workers, Service Workers, WebAssembly, WebGPU, WebRTC, WebTransport, View Transitions e agora OPFS. Esses são os primitivos que separam o front-end pleno do sênior — e que destravam apps web modernos (Figma, Photoshop Web, AutoCAD Web, GitHub.dev) que antes pareciam impossíveis no browser.
        </p>
        <Callout tone="success" icon="🎓">
          Badge <b>Browser Wizard</b> desbloqueado. Próximo nível: contribuir para uma spec ou um browser engine.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
