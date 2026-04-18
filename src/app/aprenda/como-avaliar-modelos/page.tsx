import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section, Callout, ComparisonTable, DecisionBox,
  FlowDiagram, QAItem, CodeBlock, StackFlow,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('como-avaliar-modelos');

const accent = '#d2a8ff';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que benchmarks publicos como MMLU e HumanEval nao sao suficientes para escolher um modelo para producao?',
    options: [
      'Porque sao muito caros de rodar e so grandes empresas conseguem',
      'Porque medem performance em tarefas genericas — SEU caso de uso especifico pode ter resultados completamente diferentes, e modelos podem ser otimizados para benchmarks (overfitting)',
      'Porque so medem velocidade, nao qualidade',
      'Porque sao medidos em ingles e nao funcionam em portugues',
    ],
    correct: 1,
    explanation: 'Benchmarks publicos sao uteis como triagem inicial, mas: (1) modelos podem ser "treinados para o teste" (benchmark overfitting); (2) seu caso de uso pode nao se parecer com nenhum benchmark; (3) metricas agregadas escondem fraquezas em nichos especificos. Avaliacao propria no seu dominio e insubstituivel.',
  },
  {
    question: 'O que e LLM-as-Judge e quando ele e confiavel?',
    options: [
      'Usar um LLM para julgar outputs de outro LLM — confiavel quando o juiz e mais capaz que o avaliado e voce calibra contra julgamentos humanos',
      'Um benchmark automatizado que roda modelos em competicao — sempre confiavel',
      'Usar o proprio modelo para avaliar sua propria qualidade — nunca confiavel',
      'Um framework de testes unitarios especifico para LLMs — confiavel como qualquer teste',
    ],
    correct: 0,
    explanation: 'LLM-as-Judge usa um modelo forte (ex: Claude Opus) para avaliar outputs de modelos mais fracos. E confiavel quando: (1) o juiz e significativamente mais capaz; (2) voce calibra contra julgamentos humanos (concordancia > 80%); (3) usa rubricas claras. Falha: vieses posicionais (prefere a primeira resposta) e auto-favorecimento.',
  },
  {
    question: 'SWE-bench mede:',
    options: [
      'Velocidade de geracao de tokens em diferentes hardwares',
      'Capacidade do modelo resolver issues reais de repos open-source (escrever codigo que passa nos testes)',
      'Qualidade de embeddings para busca semantica',
      'Performance em conversacao multi-turno com usuarios reais',
    ],
    correct: 1,
    explanation: 'SWE-bench pega issues reais do GitHub (com test suite), da ao modelo, e mede se o patch gerado passa nos testes. SWE-bench Verified (500 issues curadas) e o padrao ouro para avaliar coding agents. Claude Sonnet 4 e Claude Code dominam esse benchmark em 2025.',
  },
  {
    question: 'Voce precisa escolher entre dois modelos para um chatbot de atendimento. Qual abordagem de avaliacao?',
    options: [
      'Escolher o com maior MMLU score — se e melhor em conhecimento geral, e melhor em tudo',
      'Rodar ambos em 100+ exemplos reais do SEU dominio, medir qualidade com rubrica + LLM-as-judge calibrado, comparar custo por request e latencia',
      'Perguntar no Twitter qual modelo os devs preferem',
      'Escolher o mais barato — qualidade e similar entre modelos modernos',
    ],
    correct: 1,
    explanation: 'A unica forma confiavel: testar nos SEUS dados. 100+ exemplos representativos, rubrica clara (o que e uma resposta boa?), LLM-as-judge calibrado contra 20+ julgamentos humanos. Depois comparar custo e latencia. Benchmarks publicos sao triagem, nao decisao.',
  },
];

export default function ComoAvaliarModelosPage() {
  return (
    <ModuleLayout
      slug="como-avaliar-modelos"
      title="Como Avaliar Modelos de IA"
      icon="📊"
      xp={60}
      readTime={9}
      trailName="IA Alem do LLM"
      trailColor={accent}
      nextSlug="coding-agents-panorama"
      nextTitle="O Panorama dos Coding Agents"
      seoDesc="Benchmarks, pitfalls, eval proprio, LLM-as-judge. Como escolher o modelo certo para seu caso de uso."
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
        &ldquo;GPT-4 tem 86% no MMLU&rdquo; — e dai? Essa metrica ajuda a escolher o modelo certo para o <em>seu</em> caso de uso? Provavelmente nao. Neste artigo, voce vai entender os benchmarks que existem, seus limites, e como montar uma avaliacao propria que realmente informa decisoes.
      </p>

      <Section title="Os benchmarks mais relevantes" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Benchmark', 'O que mede', 'Como funciona', 'Limitacao']}
          rows={[
            ['MMLU', 'Conhecimento geral (57 dominios)', 'Multiple choice: historia, bio, fisica, direito, etc.', 'Mede reconhecimento, nao raciocinio profundo'],
            ['HumanEval', 'Geracao de codigo Python', '164 problemas de programacao; mede pass@k', 'Problemas simples; nao reflete coding real'],
            ['SWE-bench', 'Resolucao de issues reais', 'Issues de repos open-source; verifica se patch passa nos testes', 'Padrao ouro para coding; caro de rodar'],
            ['GPQA', 'Raciocinio expert-level', 'Perguntas de PhD em fisica, bio, quimica', 'Muito dificil; humanos experts acertam ~65%'],
            ['LMArena (Chatbot Arena)', 'Preferencia humana', 'Humanos comparam respostas de 2 modelos (blind)', 'Sujeito a vieses (prefere respostas longas)'],
            ['MATH', 'Raciocinio matematico', 'Problemas de competicao matematica', 'Modelos modernos ja saturam (~90%+)'],
            ['ARC-AGI', 'Raciocinio abstrato / fluida', 'Pattern matching visual com regras nao vistas', 'Controverso; talvez nao mexa o que promete'],
          ]}
        />
      </Section>

      <Section title="Pitfalls de benchmarks publicos" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Pitfall', 'Exemplo', 'Impacto']}
          rows={[
            ['Benchmark overfitting', 'Treinar o modelo em dados similares ao benchmark', 'Score alto no benchmark, performance real mediocre'],
            ['Data contamination', 'Perguntas do benchmark vazam no dataset de treino', 'Modelo "decorou" respostas; score inflado'],
            ['Cherry-picking', 'Empresa reporta so benchmarks onde vai bem', 'Visao distorcida das capacidades reais'],
            ['Metricas agregadas', 'Media de 57 dominios esconde que modelo e pessimo em matematica', 'Decisao baseada em numero que nao reflete seu caso'],
            ['Saturacao', 'MMLU e HumanEval ja estao >90% para modelos top', 'Benchmark nao diferencia mais entre modelos top'],
          ]}
        />
        <Callout tone="warn">
          <strong>Regra de ouro:</strong> benchmarks publicos sao triagem, nao decisao. Se dois modelos tem 85% vs 87% no MMLU, a diferenca e irrelevante para o seu chatbot de atendimento. O que importa: como eles performam <strong>no seu dominio, com seus dados, para seus usuarios</strong>.
        </Callout>
      </Section>

      <Section title="Avaliacao propria: o que realmente importa" accent={accent}>
        <StackFlow
          title="Montando seu eval pipeline"
          accent={accent}
          items={[
            {
              icon: '📋',
              label: '1. Coletar exemplos representativos',
              sub: '100+ exemplos',
              detail: 'Perguntas reais dos seus usuarios, ou sinteticas que representem o dominio. Cobrir edge cases, nao so o happy path.',
              connector: 'DEFINIR RUBRICA',
            },
            {
              icon: '📏',
              label: '2. Definir rubrica de qualidade',
              sub: 'criterios claros',
              detail: 'O que e uma resposta "boa"? Ex: (1) factualmente correta, (2) responde a pergunta feita, (3) tom adequado, (4) concisa. Cada criterio com score 1-5.',
              connector: 'RODAR MODELOS',
            },
            {
              icon: '🤖',
              label: '3. Gerar respostas de cada modelo',
              sub: 'A/B test',
              detail: 'Rodar os mesmos 100+ exemplos em cada modelo candidato com o mesmo prompt. Salvar respostas para avaliacao.',
              connector: 'AVALIAR',
            },
            {
              icon: '⚖️',
              label: '4. Avaliar com LLM-as-Judge + humanos',
              sub: 'calibrado',
              detail: 'LLM forte (Opus/GPT-4) avalia cada resposta pela rubrica. Calibrar contra 20+ julgamentos humanos. Se concordancia < 80%, refinar rubrica.',
              connector: 'DECIDIR',
            },
            {
              icon: '📊',
              label: '5. Comparar custo, latencia e qualidade',
              sub: 'decisao',
              detail: 'Modelo A: 92% qualidade, $0.03/req, 1.2s. Modelo B: 88% qualidade, $0.005/req, 0.4s. A decisao depende do que importa PARA VOCE.',
            },
          ]}
        />
      </Section>

      <Section title="LLM-as-Judge: automatizando avaliacao" accent={accent}>
        <p>
          Avaliar 1000 respostas manualmente e impraticavel. LLM-as-Judge usa um modelo forte para avaliar outputs de modelos mais fracos:
        </p>
        <CodeBlock lang="python">
{`# LLM-as-Judge simplificado
import anthropic

client = anthropic.Anthropic()

rubric = """
Avalie a resposta do modelo nos seguintes criterios (1-5):
1. Corretude factual: a resposta esta correta?
2. Relevancia: responde a pergunta feita?
3. Completude: cobre os pontos importantes?
4. Clareza: e clara e bem organizada?
5. Concisao: e concisa sem ser superficial?

Retorne JSON: {"scores": {"corretude": N, ...}, "total": N, "reasoning": "..."}
"""

def evaluate(question: str, answer: str) -> dict:
    response = client.messages.create(
        model="claude-opus-4-20250514",  # juiz forte
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""
{rubric}

Pergunta: {question}
Resposta do modelo: {answer}
"""
        }]
    )
    return parse_json(response.content[0].text)

# Rodar em batch
results_a = [evaluate(q, model_a(q)) for q in test_set]
results_b = [evaluate(q, model_b(q)) for q in test_set]
avg_a = sum(r["total"] for r in results_a) / len(results_a)
avg_b = sum(r["total"] for r in results_b) / len(results_b)`}
        </CodeBlock>
        <ComparisonTable
          accent={accent}
          headers={['Vies do LLM-as-Judge', 'Descricao', 'Mitigacao']}
          rows={[
            ['Position bias', 'Prefere a primeira resposta em comparacoes A vs B', 'Rodar 2x invertendo a ordem; media dos resultados'],
            ['Verbosity bias', 'Prefere respostas mais longas mesmo quando menos precisas', 'Incluir "concisao" como criterio explicito na rubrica'],
            ['Self-favoritism', 'Modelo prefere outputs do proprio modelo', 'Usar juiz de familia diferente (Claude julga GPT e vice-versa)'],
            ['Calibracao', 'Scores absolutos variam entre execucoes', 'Calibrar contra julgamentos humanos; usar scores relativos (A vs B)'],
          ]}
        />
      </Section>

      <Section title="Metricas especificas por dominio" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Dominio', 'Metricas', 'Ferramentas']}
          rows={[
            ['RAG', 'Recall@k, nDCG, faithfulness, relevance', 'RAGAS, LlamaIndex eval'],
            ['Coding', 'pass@k, SWE-bench resolve rate, edit accuracy', 'HumanEval, SWE-bench, custom test suites'],
            ['Chatbot', 'User satisfaction, resolution rate, escalation rate', 'LLM-as-judge + metricas de negocio'],
            ['Summarization', 'ROUGE, BERTScore, faithfulness', 'ROUGE-L para baseline, LLM-as-judge para qualidade'],
            ['Classification', 'F1, precision, recall, confusion matrix', 'sklearn metrics + domain-specific thresholds'],
          ]}
        />
      </Section>

      <Section title="Framework de decisao" accent={accent}>
        <DecisionBox
          scenario="Escolhendo modelo para producao"
          winner="Eval proprio > benchmarks publicos"
          winnerColor={accent}
          why="Benchmarks publicos sao triagem rapida (eliminar modelos claramente inferiores). A decisao final SEMPRE deve ser baseada em avaliacao no SEU dominio, com SEUS dados, medindo o que importa PARA VOCE."
          alternatives={[
            { name: 'So benchmarks publicos', note: 'Aceitavel apenas para prototipacao rapida onde a decisao e reversivel e o custo de errar e baixo.' },
          ]}
        />
        <FlowDiagram
          title="Processo de seleção de modelo — 4 filtros"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🌐', label: 'Universo (~20 modelos)', desc: 'Frontier + open-source relevantes para seu caso' },
            { icon: '📊', label: 'Filtro 1: benchmarks + custo', desc: 'Eliminar modelos claramente inferiores → shortlist de 3–5' },
            { icon: '🧪', label: 'Filtro 2: eval próprio', desc: '100+ exemplos do seu domínio → candidatos de 2 modelos' },
            { icon: '⚖️', label: 'Filtro 3: A/B em produção', desc: '1–2 semanas com usuários reais → modelo escolhido' },
            { icon: '📈', label: 'Monitoramento contínuo', desc: 'Eval automatizado semanal — drift detection' },
          ]}
        />
      </Section>

      <Section title="Eval Harness: pipeline de avaliação profissional" accent={accent}>
        <p>
          Um <strong>eval harness</strong> é a infraestrutura que automatiza suas avaliações —
          rodar os mesmos testes em novos modelos, comparar versões, detectar regressões.
          Sem harness, avaliação é manual e não-reproduzível.
        </p>
        <StackFlow
          title="Anatomia de um eval harness"
          accent={accent}
          items={[
            {
              icon: '📦',
              label: 'Dataset de eval',
              sub: '100-1000+ exemplos',
              detail: 'Conjunto curado de inputs + outputs esperados (gold answers). Deve cobrir: casos típicos, edge cases, casos de falha conhecidos. Versionar como código.',
              connector: 'inputs',
            },
            {
              icon: '⚡',
              label: 'Runner',
              sub: 'paralelo, com retry',
              detail: 'Envia cada exemplo para o modelo (ou modelos em paralelo). Lida com rate limits, erros e timeouts. Salva outputs crus com metadata (modelo, versão, timestamp, latência, custo).',
              connector: 'outputs',
            },
            {
              icon: '📏',
              label: 'Scorer',
              sub: 'LLM-as-judge + métricas',
              detail: 'Pontuação por rubrica (0-5), métricas automáticas (ROUGE, F1, pass@k), ou comparação direta com gold. LLM-as-judge para qualidade subjetiva.',
              connector: 'scores',
            },
            {
              icon: '📊',
              label: 'Report + tracking',
              sub: 'histórico + alertas',
              detail: 'Dashboard com histórico de scores por modelo/versão. Alertas se regressão > 5% em qualquer métrica. Integração com CI/CD para rodar em cada deploy.',
            },
          ]}
        />
        <CodeBlock lang="python">
{`# Eval harness mínimo em Python
import asyncio
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

async def eval_one(example: dict, model: str) -> dict:
    resp = await client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": example["input"]}]
    )
    output = resp.content[0].text
    score = await score_with_judge(output, example["expected"])
    return {"input": example["input"], "output": output,
            "expected": example["expected"], "score": score}

async def run_eval(dataset, model):
    results = await asyncio.gather(
        *[eval_one(ex, model) for ex in dataset]
    )
    avg = sum(r["score"] for r in results) / len(results)
    print(f"{model}: {avg:.2f}/5.0 ({len(results)} exemplos)")
    return results`}
        </CodeBlock>
      </Section>

      <Section title="A/B Testing de modelos em produção" accent={accent}>
        <p>
          Eval offline garante qualidade em dados históricos. A/B testing valida no contexto real:
          usuários reais, padrões de uso reais, resultados de negócio reais.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Eval Offline', 'A/B Testing']}
          rows={[
            ['Quando usar', 'Antes do deploy — triagem e validação', 'Após deploy — validação no mundo real'],
            ['Dados', 'Dataset curado de historico', 'Requests de produção ao vivo'],
            ['Métrica', 'Score de rubrica, benchmarks', 'CTR, resolution rate, satisfação, receita'],
            ['Duração', 'Minutos a horas', '1-2 semanas (significância estatística)'],
            ['Risco', 'Nenhum para usuários', 'Possível impacto negativo no grupo B'],
            ['Custo', 'Fixo (dataset + compute)', 'Custo de servir o modelo mais caro simultaneamente'],
          ]}
        />
        <Callout tone="warn">
          <strong>Armadilha do A/B prematuro:</strong> testar um modelo novo sem eval offline primeiro
          expõe usuários reais a riscos desnecessários. O fluxo correto é sempre:
          eval offline (eliminar candidatos ruins) → A/B em produção (validar o melhor candidato).
          Nunca pule a etapa offline — é barata e protege seus usuários.
        </Callout>
      </Section>

      <Section title="Perguntas e respostas" accent={accent}>
        <QAItem
          q="Preciso montar eval se so estou prototipando?"
          a={<>Para prototipo: nao. Use benchmarks publicos + vibes (teste manual). Mas antes de ir para producao, eval proprio e <strong>inegociavel</strong>. O custo de rodar 100 exemplos em 3 modelos e ~$5-20. O custo de escolher o modelo errado em producao e ordens de magnitude maior.</>}
        />
        <QAItem
          q="Com que frequencia devo reavaliar?"
          a={<>Sempre que: (1) o provider atualiza o modelo (versao nova); (2) seus dados ou dominio mudam; (3) um modelo novo promissor e lancado; (4) metricas de producao degradam. Na pratica: eval automatizado semanal em sample dos dados de producao + eval completo a cada atualizacao de modelo.</>}
        />
        <QAItem
          q="LMArena (Chatbot Arena) e confiavel?"
          a={<>E o melhor benchmark de preferencia humana disponivel: blind, randomizado, milhares de votos. Mas tem vieses: respostas longas e formatadas ganham de respostas concisas e corretas. E a populacao de votantes (tech-savvy, ingles) pode nao representar seus usuarios. Use como sinal forte, nao como verdade absoluta.</>}
        />
      </Section>

      <Section title="Benchmark vs produção: o que realmente medir" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Contexto', 'O que medir', 'Como medir']}
          rows={[
            ['Benchmark (pré-escolha)', 'Triagem rápida: qual modelo não usar', 'MMLU, SWE-bench, HumanEval + custo/M tokens'],
            ['Eval próprio (pré-deploy)', 'Qualidade no SEU domínio, com SEUS dados', 'Rubrica + LLM-as-Judge calibrado em 100+ exemplos'],
            ['Produção (pós-deploy)', 'Satisfação real, taxa de resolução, escalonamentos', 'Logs de usuário + feedback explícito + metricas de negócio'],
            ['Monitoramento (contínuo)', 'Degradação de qualidade, drift de distribuição', 'Eval automatizado semanal em sample dos requests'],
          ]}
        />
        <Callout tone="info">
          <strong>Produção é a fonte da verdade.</strong> Um modelo que pontua 92% no seu eval pode ter satisfação de usuário inferior a um de 88% se o de 88% for mais conciso e direto. Sempre feche o loop: métricas de produção devem realimentar sua rubrica de eval.
        </Callout>
      </Section>

      <Callout tone="success">
        <strong>O que voce aprendeu:</strong> benchmarks publicos (MMLU, HumanEval, SWE-bench, LMArena) sao uteis para triagem mas insuficientes para decisoes de producao. Benchmark overfitting, data contamination e cherry-picking sao problemas reais. Avaliacao propria com rubrica + LLM-as-Judge calibrado e o padrao ouro. A decisao final considera qualidade + custo + latencia no <strong>seu dominio especifico</strong>. Com isso, voce terminou a Trilha 2 — agora tem base para entender como <strong>ferramentas de IA para codigo</strong> funcionam. Para ir mais fundo em avaliacao de RAG e LLMOps, veja <strong>Avaliando RAG</strong> (Trilha 9) e <strong>LLMOps: eval harness, drift e canary</strong> (Trilha 9).
      </Callout>
    </div>
  );
}
