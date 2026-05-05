import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('memoria-agentes');

const ACCENT = '#8b5cf6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre working memory e episodic memory em agentes LLM?',
    options: [
      'São termos equivalentes — ambos se referem ao contexto atual do modelo',
      'Working memory é o contexto ativo da janela atual (volátil, desaparece com a sessão). Episodic memory é o histórico de interações passadas armazenado externamente e recuperado por relevância — permite que o agente lembre de conversas de dias/semanas atrás',
      'Working memory é armazenada em RAM; episodic memory em disco rígido',
      'Episodic memory é exclusiva de modelos com mais de 100B parâmetros',
    ],
    correct: 1,
    explanation:
      'Working memory é a janela de contexto ativa — tudo que está na prompt atual. É volátil: desaparece quando a sessão termina. Episodic memory é análoga à memória episódica humana — registros de eventos passados (conversas, ações, resultados) armazenados em banco externo (vector store, key-value) e recuperados quando relevantes para o contexto atual via busca semântica ou temporal.',
  },
  {
    question: 'O que é semantic memory em agentes e como difere de episodic memory?',
    options: [
      'São sinônimos — ambos se referem a memória de longo prazo',
      'Semantic memory armazena fatos, conhecimento e entidades sobre o mundo e o usuário (preferências, dados pessoais, contexto do projeto). Episodic memory armazena eventos sequenciais com timestamp. Semantic memory é atemporal; episodic memory é ordenada temporalmente',
      'Semantic memory é implementada com vector stores; episodic memory usa bancos relacionais',
      'Semantic memory é apenas o conteúdo do sistema de prompt original',
    ],
    correct: 1,
    explanation:
      'Semantic memory: "O usuário prefere Python, trabalha na empresa X, seu projeto usa PostgreSQL". É atemporal — fatos e entidades sobre o mundo. Episodic memory: "Na última conversa (2026-05-01), o usuário pediu para refatorar a função parse_csv e o agente sugeriu usar Polars". É temporal — sequência de eventos. Em implementação: semantic memory costuma usar key-value store com tags; episodic memory usa vector store com timestamps.',
  },
  {
    question: 'O que é procedural memory em agentes LLM e como é implementada na prática?',
    options: [
      'É o código Python do próprio agente armazenado em disco',
      'Armazena "como fazer" — skills, templates de prompt aprendidos, procedimentos otimizados para tarefas recorrentes. Em prática: coleção de prompts que funcionaram bem, scripts reutilizáveis, workflows de ferramentas que resolveram problemas anteriores — recuperados quando a situação atual é similar',
      'É a memória de curto prazo usada durante a execução de uma única função Python',
      'São os pesos do modelo, que armazenam conhecimento procedural implicitamente',
    ],
    correct: 1,
    explanation:
      'Procedural memory (também chamada de "skills" ou "playbooks") armazena procedimentos — sequências de ações que funcionaram para resolver tipos de problemas. Implementação: quando o agente resolve com sucesso um tipo de tarefa, registra o "recipe": ferramenta A com parâmetro X, depois ferramenta B com resultado de A. Na próxima tarefa similar, recupera o recipe como contexto. Ferramentas como Mem0 suportam isso explicitamente.',
  },
  {
    question: 'Qual o principal desafio de implementar memória de longo prazo em produção?',
    options: [
      'Bancos de dados não suportam a quantidade de memórias necessárias',
      'Decidir o que vale a pena memorizar, quando esquecer informações desatualizadas, e como recuperar com alta precision sem poluir o contexto com memórias irrelevantes — o "what to remember" é mais difícil que o "how to store"',
      'Memória de longo prazo só é possível com modelos acima de 100B parâmetros',
      'A LGPD proíbe armazenar qualquer informação sobre conversas de usuários',
    ],
    correct: 1,
    explanation:
      'O problema técnico de armazenar memórias é resolvido (vector stores, key-value). O problema difícil: (1) O que memorizar? Nem tudo merece ser memorizado. (2) Como detectar que uma memória está desatualizada? (usuário mudou de emprego, preferência mudou). (3) Precision na recuperação — retornar memórias tangencialmente relacionadas polui o contexto. (4) Privacidade e LGPD — quanto tempo reter memórias, como deletar dados de usuário.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="memoria-agentes"
      title="Memória de Agentes: working, episódica, semântica e procedural"
      icon="🧠"
      xp={85}
      readTime={17}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="agentes-padroes"
      nextTitle="Padrões de Agentes: arquiteturas para sistemas autônomos"
      relatedSlugs={['agentes-padroes', 'context-engineering', 'multi-agent-systems']}
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
        Agentes LLM sem memória persistente "nascem de novo" a cada sessão — incapazes de aprender com
        interações passadas, lembrar preferências do usuário, ou reutilizar soluções que funcionaram antes.
        Memória transforma agentes de ferramentas stateless em assistentes que melhoram com o tempo e
        personalizam a experiência por usuário.
      </p>

      <Section title="Os quatro tipos de memória em agentes" accent={ACCENT}>
        <LayerStack
          title="Taxonomia de memória em agentes LLM"
          accent={ACCENT}
          separatorLabel="persistência crescente"
          layers={[
            { label: 'Working Memory', content: 'Contexto ativo na janela atual — volátil, desaparece com a sessão', note: 'implementada pela janela de contexto', tone: 'default' },
            { label: 'Episodic Memory', content: 'Histórico de interações e eventos passados com timestamp', note: 'vector store com timestamps', tone: 'default' },
            { label: 'Semantic Memory', content: 'Fatos, entidades e conhecimento sobre usuário/mundo', note: 'key-value ou graph database', tone: 'writable' },
            { label: 'Procedural Memory', content: 'Skills, prompts otimizados, playbooks de ação', note: 'coleção de templates indexados', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'O que armazena', 'Escopo', 'Exemplo concreto']}
          rows={[
            ['Working', 'Contexto da sessão atual', 'Sessão (volátil)', 'Conversa em andamento, resultados de tools'],
            ['Episodic', 'Histórico de conversas e ações', 'Long-term por usuário', '"Na sessão de 01/05, o usuário pediu X"'],
            ['Semantic', 'Fatos sobre usuário/domínio', 'Long-term por usuário', '"Usuário prefere Python, usa Mac, empresa Y"'],
            ['Procedural', 'Skills e playbooks de ação', 'Long-term, reutilizável', '"Para análise de CSV: use Polars, depois..."'],
          ]}
        />
      </Section>

      <Section title="Working Memory: gerenciando a janela ativa" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Working memory é a janela de contexto — mas gerenciá-la bem é arte. Você decide o que entra,
          em que ordem, o que truncar e o que resumir quando a janela esgota.
        </p>
        <CodeBlock lang="python">{`from dataclasses import dataclass, field
from typing import Literal

@dataclass
class WorkingMemory:
    """Gerencia o contexto ativo de uma sessão de agente."""
    max_tokens: int = 100_000
    system_prompt: str = ""
    tool_definitions: list[dict] = field(default_factory=list)
    retrieved_context: list[str] = field(default_factory=list)   # RAG results
    conversation_history: list[dict] = field(default_factory=list)
    tool_results: list[dict] = field(default_factory=list)

    def add_message(self, role: str, content: str | list):
        self.conversation_history.append({"role": role, "content": content})
        self._compact_if_needed()

    def _compact_if_needed(self):
        total = self._estimate_tokens()
        if total < self.max_tokens * 0.8:
            return

        # Comprimir histórico mantendo cauda + sumário
        if len(self.conversation_history) > 10:
            to_summarize = self.conversation_history[:-8]
            self.conversation_history = self.conversation_history[-8:]

            summary = self._summarize(to_summarize)
            summary_msg = {
                "role": "user",
                "content": f"<session_summary>\\n{summary}\\n</session_summary>"
            }
            self.conversation_history.insert(0, summary_msg)

    def _estimate_tokens(self) -> int:
        import json
        text = json.dumps({
            "system": self.system_prompt,
            "history": self.conversation_history,
        })
        return len(text) // 4  # estimativa grosseira

    def _summarize(self, messages: list[dict]) -> str:
        from anthropic import Anthropic
        client = Anthropic()
        return client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            system="Resuma a conversa em 200 palavras, mantendo: decisões tomadas, fatos descobertos, estado atual da tarefa.",
            messages=messages,
        ).content[0].text

    def to_messages(self) -> list[dict]:
        """Retorna a lista de mensagens para passar ao LLM."""
        return self.conversation_history`}</CodeBlock>
      </Section>

      <Section title="Episodic Memory: histórico persistente por usuário" accent={ACCENT}>
        <CodeBlock lang="python">{`from datetime import datetime
import json
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from openai import OpenAI

qdrant = QdrantClient("localhost", port=6333)
openai_client = OpenAI()

COLLECTION_NAME = "episodic_memory"

def init_episodic_store():
    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
    )

def store_episode(
    user_id: str,
    session_id: str,
    summary: str,
    key_facts: list[str],
    outcome: str,
):
    """Armazena um episódio (sessão) na memória episódica."""
    combined_text = f"{summary}\\nFatos: {'; '.join(key_facts)}\\nResultado: {outcome}"

    embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=combined_text,
    ).data[0].embedding

    import uuid
    qdrant.upsert(
        collection_name=COLLECTION_NAME,
        points=[PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload={
                "user_id": user_id,
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "summary": summary,
                "key_facts": key_facts,
                "outcome": outcome,
            }
        )]
    )

def retrieve_relevant_episodes(
    user_id: str,
    current_query: str,
    top_k: int = 3,
) -> list[dict]:
    """Recupera episódios relevantes para o contexto atual."""
    query_embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=current_query,
    ).data[0].embedding

    results = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding,
        query_filter={"must": [{"key": "user_id", "match": {"value": user_id}}]},
        limit=top_k,
    )

    return [r.payload for r in results]

def format_episodic_context(episodes: list[dict]) -> str:
    if not episodes:
        return ""
    lines = ["<episodic_memory>"]
    for ep in episodes:
        lines.append(f"[{ep['timestamp'][:10]}] {ep['summary']}")
        if ep.get('key_facts'):
            lines.append(f"  Fatos: {'; '.join(ep['key_facts'])}")
    lines.append("</episodic_memory>")
    return "\\n".join(lines)`}</CodeBlock>
      </Section>

      <Section title="Semantic Memory: fatos sobre usuário e domínio" accent={ACCENT}>
        <CodeBlock lang="python">{`import redis
import json
from anthropic import Anthropic

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
client = Anthropic()

def extract_and_store_semantic_facts(
    user_id: str,
    conversation: list[dict],
):
    """Extrai fatos semânticos de uma conversa e armazena."""
    extraction_prompt = f"""Analise esta conversa e extraia fatos duráveis sobre o usuário
que seriam úteis para futuras interações.

Categorias de fatos:
- preferencias: ferramentas, linguagens, estilo de trabalho
- contexto_profissional: empresa, cargo, projetos
- expertise: áreas de conhecimento do usuário
- configuracao: SO, IDEs, configurações do ambiente

Retorne JSON com formato:
{{"fatos": [{{"categoria": "...", "chave": "...", "valor": "...", "confianca": 0.9}}]}}

Conversa:
{json.dumps(conversation, ensure_ascii=False)}"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": extraction_prompt}]
    )

    try:
        data = json.loads(response.content[0].text)
        for fact in data.get("fatos", []):
            if fact.get("confianca", 0) > 0.7:
                key = f"semantic:{user_id}:{fact['categoria']}:{fact['chave']}"
                redis_client.set(key, fact["valor"])
                redis_client.expire(key, 60 * 60 * 24 * 90)  # TTL 90 dias
    except json.JSONDecodeError:
        pass

def get_semantic_context(user_id: str) -> str:
    """Retorna todos os fatos semânticos de um usuário."""
    pattern = f"semantic:{user_id}:*"
    keys = redis_client.keys(pattern)

    if not keys:
        return ""

    facts = {}
    for key in keys:
        parts = key.split(":")
        categoria = parts[2]
        chave = parts[3]
        valor = redis_client.get(key)
        facts.setdefault(categoria, {})[chave] = valor

    lines = ["<semantic_memory>"]
    for categoria, items in facts.items():
        lines.append(f"  {categoria}:")
        for k, v in items.items():
            lines.append(f"    {k}: {v}")
    lines.append("</semantic_memory>")
    return "\\n".join(lines)`}</CodeBlock>
      </Section>

      <Section title="Integrando os quatro tipos: agente com memória completa" accent={ACCENT}>
        <CodeBlock lang="python">{`from anthropic import Anthropic

client = Anthropic()

def agent_with_full_memory(
    user_id: str,
    user_message: str,
    session_id: str,
) -> str:
    """Agente que usa todos os tipos de memória."""

    # 1. Recuperar memória semântica (fatos duráveis do usuário)
    semantic_ctx = get_semantic_context(user_id)

    # 2. Recuperar memória episódica (conversas relevantes passadas)
    episodes = retrieve_relevant_episodes(user_id, user_message, top_k=3)
    episodic_ctx = format_episodic_context(episodes)

    # 3. Recuperar skills/procedimentos relevantes (procedural memory)
    # (omitido por brevidade — similar à episodic, mas com playbooks)

    # 4. Construir system prompt com contexto de memória
    system = f"""Você é um assistente técnico personalizado.

{semantic_ctx}

{episodic_ctx}

Use o contexto acima para personalizar suas respostas. Se o histórico mostrar
que o usuário usa Python e PostgreSQL, adapte os exemplos para esses stacks."""

    # 5. Working memory — adicionar mensagem ao histórico da sessão
    working_mem = get_or_create_working_memory(session_id)
    working_mem.add_message("user", user_message)

    # 6. Gerar resposta
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        system=system,
        messages=working_mem.to_messages(),
    )
    answer = response.content[0].text
    working_mem.add_message("assistant", answer)

    # 7. Persistir working memory no Redis (para continuar sessão depois)
    save_working_memory(session_id, working_mem)

    # 8. Atualizar memória semântica com novos fatos descobertos
    extract_and_store_semantic_facts(
        user_id,
        working_mem.conversation_history[-6:],  # últimas 3 trocas
    )

    return answer`}</CodeBlock>

        <DecisionBox
          scenario="Assistente técnico pessoal que precisa lembrar preferências e histórico do usuário"
          winner="Mem0 ou implementação custom com Redis + Qdrant"
          winnerColor={ACCENT}
          why="Redis para semantic memory (latência <1ms, TTL por campo). Qdrant para episodic memory (busca semântica por relevância). Extração automática de fatos com LLM barato. Simples de manter e debugar."
          alternatives={[
            { name: 'Mem0 (managed)', note: 'API pronta — trade-off: menos controle, dependência de serviço externo' },
            { name: 'Zep (managed)', note: 'Especializado em memória de agentes com API bem projetada' },
            { name: 'Apenas window expansion', note: 'Simples mas limita pelo custo de contexto longo' },
          ]}
        />
        <QAItem
          q="Como lidar com memórias conflitantes ou desatualizadas?"
          a={<>Estratégias: (1) TTL por categoria de memória — preferências técnicas expiram em 90 dias, contexto de projeto em 30 dias, fatos pessoais em 1 ano; (2) Detecção de conflito — quando nova extração contradiz memória existente, prompta o LLM para resolver: "A memória diz X mas o usuário acabou de dizer Y — qual manter?"; (3) Versionamento — manter histórico de atualizações, não sobrescrever; (4) Confiança threshold — só armazenar fatos com confiança {'>'} 0.7.</>}
        />
        <QAItem
          q="LGPD e GDPR: como implementar direito ao esquecimento?"
          a={<>Toda implementação de memória persistente deve ter: (1) Namespace por usuário em todas as chaves (user_id como prefixo); (2) API de deleção total: delete_all_memories(user_id) que limpa Redis, Qdrant e qualquer outro store; (3) Log de quando cada memória foi criada e fonte; (4) TTL máximo por tipo de dado (regulado por política de privacidade); (5) Opção de opt-out — usuário pode desativar memória persistente.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Quatro tipos de memória: working (contexto ativo), episodic (histórico
        de sessões), semantic (fatos sobre usuário), procedural (skills e playbooks). Working memory é
        gerenciada com compaction quando a janela enche. Episodic e semantic requerem armazenamento externo
        (Qdrant + Redis). Extração automática de fatos via LLM barato. Maior desafio: o que memorizar e
        quando esquecer — resolver com TTL por categoria e confiança mínima. Implemente direito ao
        esquecimento desde o início.
      </Callout>
    </div>
  );
}
