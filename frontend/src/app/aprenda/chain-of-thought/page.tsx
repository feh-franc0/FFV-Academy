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
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('chain-of-thought');

const ACCENT = '#3b82f6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o Chain-of-Thought funciona melhor em modelos maiores (>100B parâmetros)?',
    options: [
      'Modelos maiores têm mais memória RAM disponível para processar raciocínio longo',
      'CoT é uma capacidade emergente — modelos pequenos não têm representações internas suficientes para realizar e expressar raciocínio multi-step. Abaixo de ~100B (ou equivalente em modelos destilados modernos), CoT pode até piorar o resultado comparado a resposta direta',
      'Modelos maiores têm acesso à internet e podem verificar os passos',
      'CoT funciona igualmente bem em qualquer tamanho de modelo',
    ],
    correct: 1,
    explanation:
      'Wei et al. (2022) mostraram que CoT é uma propriedade emergente — aparece abruptamente acima de certos tamanhos. Modelos pequenos tendem a gerar "raciocínio" plausível mas incorreto, levando a piora no resultado final. Com modelos modernos menores (Phi-4, Mistral Small), o threshold caiu — mas CoT ainda funciona melhor em modelos com maior capacidade de raciocínio.',
  },
  {
    question: 'Qual é a diferença entre zero-shot CoT e few-shot CoT?',
    options: [
      'Zero-shot usa GPU; few-shot usa CPU para inferência',
      'Zero-shot CoT adiciona "Vamos pensar passo a passo" ao final da query sem exemplos; few-shot CoT inclui 2–8 exemplos completos de raciocínio (pergunta + cadeia de pensamento + resposta) antes da query — few-shot tem qualidade superior mas requer exemplos curados',
      'Zero-shot é para classificação; few-shot é para geração de texto',
      'São termos diferentes para a mesma técnica',
    ],
    correct: 1,
    explanation:
      'Zero-shot CoT (Kojima et al. 2022): apenas adicionar "Vamos pensar passo a passo" ou "Let\'s think step by step" induz raciocínio — simples e surpreendentemente eficaz. Few-shot CoT (Wei et al. 2022): inclui exemplos completos de cadeia de raciocínio na prompt — mais eficaz mas exige curadoria dos exemplos. Few-shot CoT tipicamente supera zero-shot em 5–15 pontos em benchmarks matemáticos.',
  },
  {
    question: 'O que é Self-Consistency em CoT e como melhora a confiabilidade?',
    options: [
      'Self-consistency é uma técnica para evitar que o modelo repita informações no raciocínio',
      'Gera múltiplos caminhos de raciocínio independentes (diferentes temperaturas/amostras) e seleciona a resposta por maioria — reduz erros aleatórios de raciocínio e dá uma estimativa de confiança sem precisar de modelo separado',
      'Self-consistency verifica se o modelo lembra corretamente de informações anteriores na conversa',
      'É um método de fine-tuning para tornar o modelo mais consistente nas respostas',
    ],
    correct: 1,
    explanation:
      'Self-consistency (Wang et al. 2022): amostre N caminhos de raciocínio independentes para a mesma query (temperatura > 0), extraia a resposta final de cada caminho, e selecione por votação majoritária. Se 7/10 caminhos chegam a "42", a resposta é "42" com alta confiança. Melhora de 10–20 pontos em GSM8K vs CoT único. O custo é N× mais tokens de inferência.',
  },
  {
    question: 'Quando CoT NÃO ajuda ou pode prejudicar?',
    options: [
      'CoT sempre ajuda — sempre adicione "pense passo a passo" em todas as queries',
      'CoT prejudica em tarefas intuitivas/diretas (classificação simples, fatos memorizados, tarefas criativas), em modelos pequenos sem capacidade de raciocínio, e quando o raciocínio intermediário introduz erro que contamina a resposta final',
      'CoT não ajuda apenas em tarefas de programação — para todo o resto, é sempre positivo',
      'CoT prejudica apenas quando o contexto tem mais de 4k tokens',
    ],
    correct: 1,
    explanation:
      'CoT tem overhead: mais tokens gerados = mais latência e custo. Para "Qual a capital do Brasil?" CoT não ajuda — o modelo sabe a resposta direto. Pior: em tarefas onde o modelo pode raciocinar de forma incorreta (math com erros de aritmética, lógica com falácia), o raciocínio longo pode amplificar o erro. Use CoT seletivamente: problema de múltiplos passos, raciocínio lógico, planejamento, matemática não-trivial.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="chain-of-thought"
      title="Chain-of-Thought: raciocínio passo a passo em LLMs"
      icon="🧩"
      xp={75}
      readTime={14}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="prompt-engineering-claude"
      nextTitle="Prompt Engineering com Claude"
      relatedSlugs={['prompt-engineering-claude', 'tree-of-thoughts', 'react-raciocinio-acao']}
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
        Chain-of-Thought (CoT) é uma das descobertas mais impactantes em prompting: simplesmente pedir ao modelo
        para raciocinar passo a passo — em vez de responder diretamente — melhora dramaticamente o desempenho
        em problemas de matemática, lógica e planejamento. Em 2026, é a base de quase todo sistema de raciocínio
        com LLMs.
      </p>

      <Section title="O que é CoT e por que funciona" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          LLMs geram tokens sequencialmente — cada token é condicionado pelos anteriores. Pedir uma resposta
          direta força o modelo a "pular" para a conclusão. CoT insere passos intermediários no contexto de
          geração, permitindo que cada passo condicione o próximo — análogo ao rascunho em papel que humanos
          fazem para resolver problemas complexos.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Abordagem', 'Prompt', 'Resultado típico em GSM8K']}
          rows={[
            ['Resposta direta', '"Joana tem 3 maçãs..." → "Resposta:"', '~18% (GPT-3 175B)'],
            ['Zero-shot CoT', '"... Vamos pensar passo a passo."', '~46% (GPT-3 175B)'],
            ['Few-shot CoT', '8 exemplos com cadeia de raciocínio', '~57% (GPT-3 175B)'],
            ['Self-Consistency', '40 amostras + votação', '~78% (GPT-3 175B)'],
            ['Modelos modernos (o1, Claude)', 'CoT interno treinado', '>90%'],
          ]}
        />
        <Callout tone="info">
          Os números acima são de 2022. Modelos modernos (Claude Sonnet, GPT-4o, Gemini 1.5) já superam esses
          resultados mesmo sem CoT explícito, porque foram treinados com dados de raciocínio. CoT ainda ajuda
          em tarefas específicas do seu domínio que o modelo não viu em treinamento.
        </Callout>
      </Section>

      <Section title="Zero-shot CoT: o prompt mágico" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Kojima et al. (2022) descobriram que adicionar "Let's think step by step" ao final de uma query
          induz raciocínio sem nenhum exemplo — resultado surpreendente que abriu a área.
        </p>
        <CodeBlock lang="python">{`from anthropic import Anthropic

client = Anthropic()

# Sem CoT — resposta direta, maior chance de erro
def ask_direct(question: str) -> str:
    return client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=100,
        messages=[{"role": "user", "content": question}]
    ).content[0].text

# Com Zero-shot CoT
def ask_cot_zero_shot(question: str) -> str:
    cot_prompt = f"""{question}

Vamos resolver isso passo a passo:"""
    return client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": cot_prompt}]
    ).content[0].text

# Variações eficazes do trigger CoT:
# "Vamos pensar passo a passo."
# "Resolva isso metodicamente:"
# "Antes de responder, trabalhe o raciocínio:"
# "Analise cada parte do problema:"

question = """
Uma empresa tem 120 funcionários. 40% trabalham em TI, 30% em vendas e o restante em operações.
Se TI cresce 25% e vendas decresce 10%, quantos funcionários a empresa terá no total após as mudanças?
"""

print("=== Resposta direta ===")
print(ask_direct(question + " Responda com um número."))

print("\\n=== Com Zero-shot CoT ===")
print(ask_cot_zero_shot(question))`}</CodeBlock>
      </Section>

      <Section title="Few-shot CoT: exemplos de raciocínio" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Few-shot CoT inclui exemplos completos de cadeia de raciocínio antes da query. A qualidade dos exemplos
          importa muito — exemplos com raciocínio incorreto, mesmo que cheguem à resposta certa, degradam a
          performance.
        </p>
        <CodeBlock lang="python">{`FEW_SHOT_COT_SYSTEM = """Você é um especialista em análise de sistemas. Responda sempre
mostrando o raciocínio passo a passo antes da conclusão final.

Exemplo 1:
Pergunta: Um sistema processa 1000 req/s com latência de 50ms. Se a latência dobrar
e precisamos manter 1000 req/s, quantos servidores adicionais precisamos (assumindo
escala linear)?

Raciocínio:
1. Latência dobrou: 50ms → 100ms
2. Throughput de cada servidor: com latência maior, throughput cai proporcionalmente
   (no modelo de Little's Law: L = λW → λ = L/W)
3. Se latência dobra, throughput de cada servidor cai pela metade
4. Para manter 1000 req/s com metade do throughput por servidor:
   Precisamos do dobro de servidores
5. Tínhamos N servidores → precisamos de 2N → N servidores adicionais

Resposta: Precisamos dobrar a frota — N servidores adicionais (100% de aumento).

---

Exemplo 2:
Pergunta: Um índice B-tree em uma coluna com 1M linhas tem profundidade log2(1M) ≈ 20.
Se o dataset crescer para 1B linhas, qual a nova profundidade e impacto na latência?

Raciocínio:
1. log2(1.000.000) = 20 nós a percorrer
2. log2(1.000.000.000) = log2(10^9) ≈ 30 nós
3. Aumento: 30 vs 20 = 50% mais nós
4. Mas cada nó é uma page do disco (8KB típico)
5. Se estiver em cache: latência aumenta em 50% (30 vs 20 operações de memória)
6. Se não estiver em cache: cada nó = disk seek ~10ms → impacto enorme

Resposta: Profundidade aumenta de 20 para 30 (50%). Impacto depende do cache hit rate.
"""

def ask_few_shot_cot(question: str) -> str:
    return client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=FEW_SHOT_COT_SYSTEM,
        messages=[{"role": "user", "content": f"Pergunta: {question}"}]
    ).content[0].text`}</CodeBlock>
        <Callout tone="warn">
          Exemplos de few-shot CoT devem ser do mesmo domínio e complexidade da query real. Exemplos de
          matemática não ajudam em raciocínio sobre código. Invista em 3–8 exemplos de alta qualidade
          específicos para o seu caso de uso.
        </Callout>
      </Section>

      <Section title="Self-Consistency: confiança por votação" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Self-consistency amosta múltiplos caminhos de raciocínio e seleciona a resposta mais frequente —
          análogo a perguntar a 10 especialistas e confiar no consenso.
        </p>
        <CodeBlock lang="python">{`from collections import Counter
import re

def self_consistency_cot(
    question: str,
    n_samples: int = 10,
    temperature: float = 0.7,
    extract_answer_fn=None,
) -> tuple[str, float]:
    """
    Retorna (resposta_mais_comum, confiança).
    confiança = fração das amostras que concordam com a resposta escolhida.
    """
    answers = []

    for _ in range(n_samples):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            temperature=temperature,
            messages=[{
                "role": "user",
                "content": f"{question}\\n\\nVamos resolver passo a passo e chegar a uma resposta final clara:"
            }]
        ).content[0].text

        # Extrair resposta final (customizar por domínio)
        if extract_answer_fn:
            answer = extract_answer_fn(response)
        else:
            # Heurística: última linha ou "Resposta: X"
            lines = [l.strip() for l in response.split("\\n") if l.strip()]
            answer = lines[-1] if lines else response

        answers.append(answer)

    # Votação majoritária
    counter = Counter(answers)
    most_common, count = counter.most_common(1)[0]
    confidence = count / n_samples

    return most_common, confidence

# Uso
answer, confidence = self_consistency_cot(
    "Qual a complexidade de espaço de merge sort para um array de N elementos?",
    n_samples=8,
)
print(f"Resposta: {answer}")
print(f"Confiança: {confidence:.0%} ({int(confidence*8)}/8 amostras concordaram)")`}</CodeBlock>

        <DecisionBox
          scenario="Problema matemático/lógico onde confiabilidade é crítica (ex: cálculo de custos em produção)"
          winner="Self-Consistency CoT (5-10 amostras)"
          winnerColor={ACCENT}
          why="Reduz erros aleatórios de raciocínio de 20-30% para 5-10%. Confiança estimável sem modelo separado. Custo: 5-10× mais tokens — aceitável para decisões críticas."
          alternatives={[
            { name: 'Few-shot CoT único', note: 'Para problemas onde latência importa e custo é restrito' },
            { name: 'Zero-shot CoT', note: 'Baseline rápido quando a tarefa não é crítica' },
            { name: 'Modelo de raciocínio (o1, Claude Extended)', note: 'Para raciocínio muito complexo — delega o CoT interno ao modelo' },
          ]}
        />
      </Section>

      <Section title="Quando usar e quando evitar CoT" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Task', 'CoT recomendado?', 'Justificativa']}
          rows={[
            ['Matemática multi-step', 'Sim — always', 'Erro se forçar resposta direta'],
            ['Lógica e inferência', 'Sim', 'Raciocínio encadeado necessário'],
            ['Planejamento e decomposição', 'Sim', 'Sub-tasks precisam ser explicitadas'],
            ['Debugging de código', 'Sim', 'Análise de estado passo a passo'],
            ['Classificação binária simples', 'Não', 'Overhead sem ganho de qualidade'],
            ['Fato memorizado direto', 'Não', 'Latência aumenta sem benefício'],
            ['Geração criativa (poesia, narrativa)', 'Não', 'CoT inibe fluência criativa'],
            ['Tasks treinadas diretamente', 'Talvez', 'Meça se ajuda no seu caso'],
          ]}
        />
        <QAItem
          q="CoT ajuda com alucinação factual?"
          a={<>Parcialmente. CoT ajuda quando o erro é de raciocínio (1+1=3 porque "1+1 é 3"). Não ajuda quando o erro é de conhecimento (o modelo genuinamente não sabe um fato). Pior: CoT pode amplificar alucinações factuais — o modelo gera uma cadeia de raciocínio plausível mas baseada em um fato errado, chegando a uma conclusão wrong com alta confiança. Para fatos, RAG é a solução certa — não CoT.</>}
        />
        <QAItem
          q="Como extrair a resposta final de uma cadeia de raciocínio?"
          a={<>Peça ao modelo para marcar a resposta final explicitamente: "Conclua com 'RESPOSTA FINAL: X'". Alternativamente, use um segundo LLM call: passe o raciocínio gerado e peça "extraia apenas a resposta final em uma linha". Evite regex frágil em produção — LLMs variam o formato. Structured outputs (JSON mode) com campo separado para reasoning e answer é a solução mais robusta.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Zero-shot CoT ("pense passo a passo") é grátis e frequentemente útil.
        Few-shot CoT com exemplos curados do seu domínio é a abordagem de maior qualidade. Self-consistency
        para decisões críticas onde confiabilidade importa mais que latência. Evite CoT em tarefas simples
        — overhead sem benefício. CoT não resolve alucinação factual — use RAG para isso. Em 2026, modelos
        de raciocínio (o1, Claude Extended Thinking) internalizaram CoT — considere-os para tarefas muito
        complexas.
      </Callout>
    </div>
  );
}
