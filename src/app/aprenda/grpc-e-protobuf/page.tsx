import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('grpc-e-protobuf');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que Protobuf é mais eficiente que JSON na wire?',
    options: [
      'Não é — é igual',
      'Binário com field tags numéricos — nomes de campo não vão na wire. Tipos compactados (varint), sem aspas, sem colchetes. Ganho típico: 3–10x menor',
      'Usa gzip automático',
      'Só funciona em C++',
    ],
    correct: 1,
    explanation: 'Protobuf: cada campo tem número (tag) + tipo + valor. JSON envia "userId":123 = 11 bytes só no nome. Protobuf envia 0x08 0x7B (3 bytes total). Em agregado com milhões de RPCs/s, economia é brutal.',
  },
  {
    question: 'Quais são os 4 modos de streaming em gRPC?',
    options: [
      'Só request-response',
      'Unary, Server Streaming, Client Streaming, Bidirectional — baseados em HTTP/2 multiplexing',
      'TCP e UDP',
      'Sync e async',
    ],
    correct: 1,
    explanation: 'Unary: 1 request, 1 response (normal). Server streaming: 1 request, N responses (tail -f, feed). Client streaming: N requests, 1 response (upload em chunks). Bidi: N x N (chat, jogos). Tudo multiplexado numa única conexão HTTP/2.',
  },
  {
    question: 'Quando gRPC NÃO é boa escolha?',
    options: [
      'Nunca é ruim',
      'APIs browser-facing (proxy grpc-web não é 100% equivalente), infra com stacks heterogêneas sem suporte protobuf, equipe sem experiência em IDL',
      'Em microservices',
      'Em Go',
    ],
    correct: 1,
    explanation: 'gRPC brilha em microservices internos (latência baixa, tipagem forte, streaming). Em browser precisa de grpc-web via proxy (perde streaming bidi). Em APIs públicas B2B, REST+OpenAPI costuma ser mais amigável por convenção.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="grpc-e-protobuf"
      title="gRPC + Protobuf: RPC tipado e streaming bidirecional"
      icon="⚡"
      xp={55}
      readTime={12}
      trailName="API Design & Contratos"
      trailColor={accent}
      nextSlug="openapi-como-contrato-vivo"
      nextTitle="OpenAPI como contrato vivo: codegen, mock server e contract testing"
      quiz={quiz}
    >
      <Section title="Protobuf: IDL compacto" accent={accent}>
        <CodeBlock lang="protobuf">{`syntax = "proto3";
package users.v1;

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (stream User);  // server stream
}

message GetUserRequest {
  string id = 1;  // field tag — usado na wire
}

message User {
  string id = 1;
  string email = 2;
  int32 age = 3;
  repeated string roles = 4;
}`}</CodeBlock>
        <p>
          Os números (1, 2, 3) são <strong>permanentes</strong>. Remover um campo = reservar o número pra sempre (<InlineCode>reserved 3;</InlineCode>) pra não reusar e corromper clients antigos.
        </p>
      </Section>

      <Section title="Schema evolution" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Adicionar campo</strong> com novo tag → seguro (clients antigos ignoram).</li>
          <li><strong>Remover campo</strong> → reserve o tag: <InlineCode>reserved 3; reserved &quot;email&quot;;</InlineCode></li>
          <li><strong>Renomear campo</strong> → OK na wire (só o tag importa), mas breaking em código.</li>
          <li><strong>Mudar tipo</strong> de <InlineCode>int32</InlineCode> pra <InlineCode>string</InlineCode> → BREAKING. Crie novo campo com novo tag.</li>
        </ul>
      </Section>

      <Section title="Exemplo TS client" accent={accent}>
        <CodeBlock lang="typescript">{`// Após proto + codegen (protoc ou buf)
import { createClient } from '@connectrpc/connect';
import { UserService } from './gen/users_connect.js';
import { createGrpcTransport } from '@connectrpc/connect-node';

const transport = createGrpcTransport({
  baseUrl: 'https://api.example.com',
  httpVersion: '2',
});
const client = createClient(UserService, transport);

const user = await client.getUser({ id: '123' });
console.log(user.email); // tipado

// Server streaming
for await (const u of client.listUsers({ page: 1 })) {
  console.log(u.id);
}`}</CodeBlock>
      </Section>

      <Section title="Quando gRPC vale o custo" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Microservices internos</strong>: latência baixa, tipagem forte cross-language.</li>
          <li><strong>Streaming bidirecional</strong>: chat, jogos, pub/sub — HTTP/2 multiplexa nativamente.</li>
          <li><strong>Polyglot</strong>: Go + Python + TS + Rust falando o mesmo IDL.</li>
        </ul>
        <Callout tone="info" icon="💡">
          Alternativa moderna: <strong>Connect</strong> (connectrpc.com). gRPC-compatible mas funciona nativo em browser via Connect Protocol (JSON over HTTP/1.1). Quando você quer gRPC-style DX sem proxy.
        </Callout>
      </Section>

      <Section title="Ferramentas" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><InlineCode>buf</InlineCode> — linter + build + breaking change detector pra Protobuf. É o que você quer em vez de protoc cru.</li>
          <li><InlineCode>grpcurl</InlineCode> — curl pra gRPC. Debug em CLI.</li>
          <li><InlineCode>ghz</InlineCode> — load testing pra gRPC.</li>
          <li><InlineCode>protovalidate</InlineCode> — validação declarativa em protobuf (equivalente Zod).</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
