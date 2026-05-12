import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('crdts-colab-editing');

const accent = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a propriedade matemática central de um CRDT?',
    options: [
      'Criptografia',
      'Convergência: dado qualquer conjunto de operações aplicadas em qualquer ordem em cada réplica, todas convergem para o mesmo estado final (associatividade, comutatividade, idempotência nas merges). Isso elimina a necessidade de um servidor árbitro',
      'Compression',
      'Imutabilidade',
    ],
    correct: 1,
    explanation: 'CRDT (Conflict-free Replicated Data Type) garante strong eventual consistency por construção matemática. Operações formam um semilattice com join associativo/comutativo/idempotente. Merges podem ser aplicadas em qualquer ordem; todas as réplicas terminam iguais sem coordenação central, apenas com gossip.',
  },
  {
    question: 'Op-based vs state-based CRDT: qual a diferença prática?',
    options: [
      'Só nome',
      'Op-based (CmRDT) propaga cada operação individual via canal reliable broadcast; menor payload mas exige entrega exatamente uma vez ou idempotência. State-based (CvRDT) propaga o estado (ou delta), merge na recepção; mais robusto a perdas mas payload maior. Yjs usa op-based + encoding binário eficiente',
      'Nenhuma',
      'State-based é obsoleto',
    ],
    correct: 1,
    explanation: 'Op-based envia deltas de ops (ex: "insert X at pos 5 com client id 7"); receiver integra. Exige broadcast confiável ou ops idempotentes. State-based envia vetor do estado completo ou delta-state; merge é join do semilattice, tolera reordering e perda. Yjs combina: op-based em wire, Y-protocol lida com sync.',
  },
  {
    question: 'Por que Google Docs usa Operational Transform (OT) e não CRDT histórico?',
    options: [
      'CRDT não existia',
      'Docs foi construído pré-CRDT popular (2006-2010), OT precisa de server árbitro que transforma ops contra histórico para chegar a estado consistente. CRDT moderno (Yjs) dispensa server árbitro, fez OT parecer legado em 2020+. Novos produtos (Figma, Linear, Notion parcial) são CRDT',
      'OT é mais rápido sempre',
      'CRDT não funciona em texto',
    ],
    correct: 1,
    explanation: 'OT: toda operação passa por server que transforma contra ops concorrentes, garantindo ordem total. Bug histórico de OT era complexidade das transform functions (Marc Shapiro mostrou falhas). CRDT moderno elimina o árbitro; qualquer peer pode receber ops em qualquer ordem. Por isso colab editors novos preferem Yjs/Automerge.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="crdts-colab-editing"
      title="CRDTs: Yjs, Automerge"
      icon="🧬"
      xp={60}
      readTime={14}
      trailName="Real-time Systems"
      trailColor={accent}
      nextSlug="presence-sistemas"
      nextTitle="Presence systems em escala"
      quiz={quiz}
    >
      <Section title="Problema que CRDT resolve" accent={accent}>
        <p>
          Dois usuários editam o mesmo documento offline. Ao reconectar, como converger sem perder trabalho e sem server árbitro? CRDT entrega isso por estrutura: cada operação carrega metadata (client id + lamport clock) e as merges são comutativas. Qualquer ordem de chegada dá o mesmo resultado final.
        </p>
      </Section>

      <Section title="Yjs: CRDT prático e binário" accent={accent}>
        <CodeBlock lang="ts">{`import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const ydoc = new Y.Doc();
const provider = new WebsocketProvider('wss://ws.ffv.com', 'doc-42', ydoc);

const ytext = ydoc.getText('content');
const yarray = ydoc.getArray('comments');
const ymap = ydoc.getMap('metadata');

// Edit local: broadcast automático via provider
ytext.insert(0, 'Olá, ');
ytext.insert(6, 'mundo!');

// Observar mudanças (locais ou remotas)
ytext.observe((ev) =&gt; {
  console.log('texto agora:', ytext.toString());
  console.log('deltas:', ev.changes.delta);
});

// Awareness: presence (cursor, selection, nome do usuário)
provider.awareness.setLocalState({ user: { text: 'Fernando', color: '#3b82f6' },
                                    cursor: { index: ytext.length } });`}</CodeBlock>
        <Callout tone="info">
          Yjs representa texto como Y.Text (uma sequência CRDT baseada em YATA), arrays como Y.Array, objetos como Y.Map. Tudo binário, diffs pequenos, integração pronta com ProseMirror/TipTap/Monaco/CodeMirror.
        </Callout>
      </Section>

      <Section title="Automerge: foco em JSON CRDT" accent={accent}>
        <CodeBlock lang="ts">{`import * as Automerge from '@automerge/automerge';

let doc = Automerge.init&lt;{ items: string[]; title: string }&gt;();

doc = Automerge.change(doc, 'adiciona item', (d) =&gt; {
  d.title = 'Lista de compras';
  d.items = ['café', 'pão'];
});

// Propagar delta
const changes = Automerge.getAllChanges(doc);
sendOverNetwork(changes);

// Do outro lado
let remoteDoc = Automerge.init&lt;typeof doc&gt;();
[remoteDoc] = Automerge.applyChanges(remoteDoc, changes);`}</CodeBlock>
      </Section>

      <Section title="Sync com y-websocket server" accent={accent}>
        <CodeBlock lang="ts">{`// Server simples (Node + ws + y-websocket/bin/utils)
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';

const wss = new WebSocketServer({ port: 1234 });
wss.on('connection', (conn, req) =&gt; setupWSConnection(conn, req));`}</CodeBlock>
        <Callout tone="warn">
          Em produção você quer persistência: y-leveldb, y-redis ou y-postgres plugam storage no y-websocket. Sem isso, documento vive só em memória dos clients e some se ninguém estiver conectado.
        </Callout>
      </Section>

      <Section title="Bind com editor real (TipTap + Yjs)" accent={accent}>
        <CodeBlock lang="ts">{`import { Editor } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import StarterKit from '@tiptap/starter-kit';

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [
    StarterKit.configure({ history: false }), // history vem do Yjs
    Collaboration.configure({ document: ydoc }),
    CollaborationCursor.configure({ provider, user: { text: 'Fernando', color: '#3b82f6' } }),
  ],
});`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Yjs + TipTap/Monaco/CodeMirror é o stack de colab moderno em 2026. Offline-first nativo, sem server árbitro, cursor e selection sincronizados via awareness.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
