import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#1f6feb';

export const metadata = getModuleMetadata('websocket-sse-streaming');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que SSE é preferível a WebSocket para streaming de responses de LLM?',
    options: [
      'SSE é mais rápido que WebSocket por usar protocolo binário',
      'LLM streaming é unidirecional: servidor envia tokens progressivamente, cliente só recebe. SSE é exatamente isso — HTTP padrão com stream de texto, funciona com qualquer proxy/CDN/balanceador sem configuração especial. WebSocket exige upgrade de protocolo, bidirecionalidade que não é usada, e muitos proxies/firewalls precisam de configuração explícita para manter a conexão aberta.',
      'SSE suporta mais conexões simultâneas por servidor',
      'WebSocket não suporta streaming de texto',
    ],
    correct: 1,
    explanation: 'SSE (Server-Sent Events): HTTP padrão com Content-Type: text/event-stream. Reconexão automática pelo browser (EventSource.onmessage). Funciona com Nginx/Cloudflare sem config. Limitação: máximo 6 conexões SSE por domínio no browser (mesmo limite HTTP/1.1). HTTP/2 não tem esse limite. WebSocket: bidirecional, binário ou texto, protocolo próprio, sem limite de conexões, mas exige configuração de proxy (Upgrade: websocket).',
  },
  {
    question: 'O que é long polling e por que foi substituído por SSE e WebSocket?',
    options: [
      'Long polling é uma técnica moderna mais eficiente que WebSocket',
      'Long polling: cliente faz request HTTP → servidor segura a conexão aberta até ter dados (ou timeout) → cliente recebe → faz outro request imediatamente. Simula push do servidor sobre HTTP padrão. Desvantagens: latência de 1 RTT extra entre mensagens (tempo de "reconectar"), overhead de headers HTTP em cada round-trip, mais difícil de escalar (cada cliente ocupa 1 conexão + 1 thread/process muitas vezes).',
      'Long polling é a forma moderna de fazer requests assíncronos',
      'Long polling foi inventado após SSE — é mais recente e complexo',
    ],
    correct: 1,
    explanation: 'Comet (2006) popularizou long polling antes de SSE (2004 spec, amplo suporte ~2009). Evolução: polling (cliente pergunta a cada N segundos) → long polling (cliente fica pendurado esperando) → SSE (HTTP stream, reconexão automática) → WebSocket (full-duplex). Hoje: SSE para servidor → cliente; WebSocket para bidirecional real (chat, jogos, colaboração em tempo real). gRPC streaming é WebSocket moderno para APIs.',
  },
  {
    question: 'Como implementar autenticação em WebSocket sem cookies?',
    options: [
      'WebSocket não suporta autenticação — deve ser combinado com HTTP Basic Auth',
      'WebSocket não suporta headers customizados no handshake inicial (especificação limita a cookies e Sec-WebSocket-Protocol). Estratégias: (1) Token na URL: ws://host/ws?token=JWT — simples mas o token aparece em logs do servidor; (2) Primeiro mensaje de autenticação: conecta sem auth, primeiro frame é {"type":"auth","token":"JWT"} — mais limpo; (3) Cookie HttpOnly — funciona mas requer mesma origem ou CORS configurado.',
      'WebSocket usa o header Authorization como HTTP padrão',
      'WebSocket autentica via certificado TLS do cliente',
    ],
    correct: 1,
    explanation: 'Padrão recomendado: short-lived one-time token. API REST gera token temporário (exp: 30s), cliente conecta WebSocket com token na URL ou no primeiro frame. O token é trocado por credenciais de sessão no servidor. Vantagem: URL token expira rápido (logs não são problema se TTL é 30s). FastAPI WebSocket: `await websocket.receive_json()` para o frame inicial de auth.',
  },
];

export default function WebsocketSseStreamingPage() {
  return (
    <ModuleLayout
      slug="websocket-sse-streaming"
      title="WebSocket, SSE, streaming: comunicação bidirecional"
      icon="📡"
      xp={60}
      readTime={12}
      trailName="Redes & Web"
      trailColor="#1f6feb"
      nextSlug="cors-csrf-cookies-seguros"
      nextTitle="CORS, CSRF, cookies seguros: segurança web fundamental"
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
        HTTP foi projetado para request-response. Quando você precisa que o servidor envie dados sem o cliente pedir — notificações, chat, streaming de IA — existem três abordagens com trade-offs bem distintos.
      </p>

      <Section accent={accent} title="Comparação: long polling vs SSE vs WebSocket">
        <ComparisonTable
          headers={['Técnica', 'Direção', 'Protocolo', 'Overhead', 'Casos de uso']}
          rows={[
            ['Polling', 'Cliente → Servidor', 'HTTP', 'Alto (um req/s)', 'Evitar sempre'],
            ['Long polling', 'Bidirecional (simulado)', 'HTTP', 'Médio (1 RTT por msg)', 'Fallback legado'],
            ['SSE', 'Servidor → Cliente', 'HTTP', 'Baixo (stream HTTP)', 'Notificações, LLM streaming'],
            ['WebSocket', 'Bidirecional', 'WS/WSS', 'Mínimo (frames binários)', 'Chat, jogos, colaboração'],
            ['gRPC streaming', 'Bidirecional', 'HTTP/2', 'Mínimo + schema', 'Microserviços bidirecional'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="SSE: streaming de LLM e notificações">
        <CodeBlock>{`# SSE (Server-Sent Events): stream HTTP com formato especial
# Content-Type: text/event-stream
# Cada evento: "data: conteúdo\\n\\n" (linha vazia = fim do evento)

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import anthropic

app = FastAPI()

# Streaming de LLM com SSE:
@app.get("/stream")
async def stream_llm(prompt: str):
    async def generate():
        client = anthropic.Anthropic()
        with client.messages.stream(
            model="claude-opus-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        ) as stream:
            for text in stream.text_stream:
                # Formato SSE: "data: texto\\n\\n"
                yield f"data: {text}\\n\\n"
        yield "data: [DONE]\\n\\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # desabilita buffer do Nginx!
        }
    )

# Notificações com SSE e ID para reconexão:
@app.get("/notifications")
async def notifications(user_id: str):
    async def event_stream():
        event_id = 0
        while True:
            # Checar por notificações novas:
            notifications = await get_notifications(user_id)  # busca no DB/Redis
            for notif in notifications:
                event_id += 1
                # SSE com ID permite que o browser retome após reconexão:
                yield f"id: {event_id}\\n"
                yield f"event: notification\\n"
                yield f"data: {notif.to_json()}\\n\\n"

            # Heartbeat a cada 30s (evita timeout de proxies):
            yield ": ping\\n\\n"
            await asyncio.sleep(30)

    return StreamingResponse(event_stream(), media_type="text/event-stream")

# No cliente (JavaScript):
# const es = new EventSource('/notifications?user_id=123');
# es.addEventListener('notification', (e) => {
#   const data = JSON.parse(e.data);
#   showNotification(data);
# });
# es.onerror = () => { /* EventSource reconecta automaticamente! */ };
# // Last-Event-ID header é enviado automaticamente na reconexão`}</CodeBlock>
      </Section>

      <Section accent={accent} title="WebSocket: full-duplex bidirecional">
        <CodeBlock>{`# WebSocket: upgrade HTTP → protocolo WS próprio
# Handshake HTTP:
# GET /ws HTTP/1.1
# Upgrade: websocket
# Connection: Upgrade
# Sec-WebSocket-Key: base64(random 16 bytes)
# Sec-WebSocket-Version: 13
#
# Resposta do servidor:
# HTTP/1.1 101 Switching Protocols
# Upgrade: websocket
# Connection: Upgrade
# Sec-WebSocket-Accept: base64(SHA1(key + GUID))
#
# Após isso: frames WS diretamente sobre TCP (sem HTTP)

from fastapi import WebSocket, WebSocketDisconnect
import json

# Servidor WebSocket com FastAPI:
class ConnectionManager:
    def __init__(self):
        self.active: dict[str, list[WebSocket]] = {}  # room_id → [ws]

    async def connect(self, ws: WebSocket, room: str):
        await ws.accept()
        self.active.setdefault(room, []).append(ws)

    def disconnect(self, ws: WebSocket, room: str):
        if room in self.active:
            self.active[room].remove(ws)

    async def broadcast(self, room: str, message: dict):
        for ws in self.active.get(room, []):
            try:
                await ws.send_json(message)
            except Exception:
                pass  # conexão morta, ignora

manager = ConnectionManager()

@app.websocket("/ws/{room}")
async def websocket_endpoint(ws: WebSocket, room: str):
    await manager.connect(ws, room)
    try:
        # Autenticação no primeiro frame:
        auth_frame = await ws.receive_json()
        if auth_frame.get("type") != "auth":
            await ws.close(code=4001, reason="Primeiro frame deve ser auth")
            return

        token = auth_frame.get("token")
        user = verify_jwt(token)  # lança exceção se inválido
        if not user:
            await ws.close(code=4001, reason="Token inválido")
            return

        # Loop principal de mensagens:
        while True:
            data = await ws.receive_json()
            if data.get("type") == "message":
                await manager.broadcast(room, {
                    "type": "message",
                    "user": user.name,
                    "text": data["text"],
                })
    except WebSocketDisconnect:
        manager.disconnect(ws, room)
    except Exception as e:
        manager.disconnect(ws, room)

# Heartbeat: evitar que proxies fechem conexão ociosa
# WS tem ping/pong nativo (opcode 0x9/0xA):
# Nginx: proxy_read_timeout 3600s; (1 hora)
# AWS ALB: idle timeout padrão = 60s (aumente para WS longos)

# No cliente (JavaScript):
# const ws = new WebSocket('wss://api.example.com/ws/room1');
# ws.onopen = () => ws.send(JSON.stringify({type:'auth', token: getJwt()}));
# ws.onmessage = (e) => handleMessage(JSON.parse(e.data));
# ws.onclose = (e) => scheduleReconnect(e.code);  // reconexão manual (diferente de SSE)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Nginx e proxies: configuração para streaming">
        <CodeBlock>{`# Nginx para SSE: desabilitar buffering
nginx_sse_config = """
location /stream {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Connection '';        # keep-alive sem upgrade
    proxy_cache off;
    proxy_buffering off;                  # CRÍTICO: sem buffering = streaming real
    proxy_read_timeout 3600s;             # conexão longa para SSE
    add_header X-Accel-Buffering no;      # header para desabilitar buffer via app
}
"""

# Nginx para WebSocket: upgrade de protocolo
nginx_ws_config = """
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

location /ws {
    proxy_pass http://backend:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;        # CRUCIAL: header WS
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 3600s;                      # não fechar conexão ociosa
    proxy_send_timeout 3600s;
}
"""

# Problema comum: proxy sem configuração fecha WebSocket com 502/504
# Sintoma: conexão funciona direto no backend mas falha atrás do proxy
# Diagnóstico:
# curl -i -N http://api.example.com/stream   ← SSE (vê se streama ou bufferiza)
# wscat -c wss://api.example.com/ws          ← WebSocket CLI (npm i -g wscat)

# AWS ALB para WebSocket:
# - Suporte nativo: sem configuração especial além do health check
# - Idle timeout padrão: 60s → aumentar para 3600s em aplicações de chat
# - Target group: registre instâncias/containers normalmente`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Modelo mental:</strong> SSE = HTTP stream simples (servidor → cliente), reconexão automática, funciona atrás de qualquer proxy com `proxy_buffering off`. WebSocket = full-duplex sobre TCP, requer configuração de proxy (Upgrade header). Para LLM streaming: SSE é a escolha certa (unidirecional, simples, CDN-friendly). Para chat e jogos: WebSocket. Heartbeat (ping/pong ou comment SSE) evita que proxies cortem conexões ociosas. Autenticação WebSocket: first frame auth ou token na URL com TTL curto.
      </Callout>

      <Callout>
        Próximo: <strong>CORS, CSRF e cookies seguros</strong> — segurança web fundamental que todo desenvolvedor backend precisa entender.
      </Callout>
    </div>
  );
}
