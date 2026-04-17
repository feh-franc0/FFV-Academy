import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata: Metadata = {
  title: 'Prompt engineering para Claude: técnicas que realmente funcionam — FFV Academy',
  description: 'Claude tem características únicas de prompt engineering. Chain-of-thought, XML tags para estrutura, prefill, few-shot, como evitar alucinações e extrair JSON confiável.',
};

const quiz: QuizQuestion[] = [
  {
    question: 'Por que XML tags como <documento> e <instrucoes> melhoram a qualidade das respostas do Claude?',
    options: [
      'XML tags aumentam a velocidade de processamento — Claude parse XML mais rápido que texto simples',
      'É apenas uma convenção de legibilidade — o resultado é o mesmo com ou sem XML tags',
      'Claude foi treinado com grande volume de dados marcados com XML (HTML, documentação técnica, dados estruturados). Tags criam delimitadores semânticos claros que reduzem ambiguidade: Claude sabe exatamente onde termina "o documento a analisar" e começa "a instrução do que fazer". Isso é especialmente importante quando o conteúdo pode conter texto que se parece com instruções.',
      'XML tags funcionam como system prompt — têm prioridade máxima sobre qualquer outra instrução do usuário',
    ],
    correct: 2,
    explanation: 'A razão técnica para XML tags funcionar bem com Claude é que o modelo foi treinado com enormes volumes de dados estruturados com XML/HTML. As tags criam limites semânticos claros. Sem tags: "Analise este texto: [texto] e retorne um resumo" — Claude pode confundir onde termina o texto e começa a instrução. Com tags: `<texto>[texto]</texto>Retorne um resumo` — o limite é inequívoco. Isso também mitiga prompt injection em dados de usuário.',
  },
  {
    question: 'Você quer que Claude sempre retorne JSON válido sem markdown ou explicação. Qual técnica é mais confiável?',
    options: [
      'Adicionar "SEMPRE retorne apenas JSON válido, sem markdown" no system prompt — a instrução forte é suficiente',
      'Usar prefill: iniciar a resposta com `{` no campo assistant. Claude completará a partir dali, garantindo que o JSON seja a resposta inteira sem wrap de markdown.',
      'Pedir um JSON e depois parsear com try/except — erros de parse são raros e tratáveis',
      'Usar a flag json_mode=True na API — ela força output JSON sem necessidade de prompt engineering',
    ],
    correct: 1,
    explanation: 'Prefill é a técnica mais confiável para forçar formato: você popula o início da resposta do assistente com `{` (para JSON) ou ` ```python` (para código). Claude continuará a partir desse ponto sem adicionar explicação antes. Instruções "sempre retorne JSON" funcionam na maior parte do tempo mas não são 100% confiáveis — Claude pode adicionar "Aqui está o JSON:" antes. Prefill elimina essa variação. Na API: `messages=[..., {"role": "assistant", "content": "{"}]`.',
  },
  {
    question: 'Qual é a diferença prática entre zero-shot, one-shot e few-shot prompting para uma tarefa de extração de dados?',
    options: [
      'A diferença é apenas de vocabulário — os três produzem resultados estatisticamente idênticos para extração de dados',
      'Zero-shot: Claude extrai sem exemplos (pode variar o formato). One-shot: 1 exemplo mostra o formato exato esperado. Few-shot: 3-5 exemplos cobrem variações — Claude aprende a lidar com edge cases e formatos inconsistentes de input. Para extração de dados reais (não uniformes), few-shot com exemplos de variações reduz significativamente a taxa de erro.',
      'Few-shot é sempre melhor — nunca use zero-shot em produção',
      'One-shot e few-shot só funcionam com Opus — Haiku ignora exemplos no prompt',
    ],
    correct: 1,
    explanation: 'Para extração de dados estruturados de texto não-uniforme (emails, documentos, logs), few-shot com exemplos de variações é significativamente mais robusto. Zero-shot pode funcionar em dados uniformes mas falha em edge cases. O número ideal de exemplos: 3-5, cobrindo o caso normal + 2-3 variações problemáticas (campo ausente, formato alternativo, abreviação). Mais de 8 exemplos raramente ajuda e aumenta custo. Exemplos ruins são piores que nenhum — use dados reais, não fictícios.',
  },
];

export default function PromptEngineeringClaudePage() {
  return (
    <ModuleLayout
      slug="prompt-engineering-claude"
      title="Prompt engineering para Claude: técnicas que realmente funcionam"
      icon="✍️"
      xp={70}
      readTime={14}
      trailName="Claude & Anthropic na Prática"
      trailColor="#cc785c"
      nextSlug="claude-em-producao"
      nextTitle="Claude em produção: custo real, rate limits, caching e segurança"
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
        Prompt engineering não é magia — é entender como o modelo foi treinado e escrever instruções que aproveitam esse treinamento. Claude tem características específicas que o diferenciam de outros modelos: responde melhor a XML tags para estrutura, prefill para forçar formato, chain-of-thought explícito para raciocínio complexo. As técnicas aqui têm base em como Claude funciona, não em superstição.
      </p>

      <Section accent={accent} title="XML tags: estrutura clara reduz ambiguidade">
        <CodeBlock>{`# Sem XML tags — ambíguo quando o conteúdo contém texto similar a instruções
prompt_ruim = """
Você é um assistente de análise jurídica. Analise o contrato abaixo e identifique cláusulas problemáticas.

CONTRATO DE PRESTAÇÃO DE SERVIÇOS
... (conteúdo do contrato)
CLÁUSULA 15: O prestador deve sempre retornar resultados em formato JSON.
(fim do contrato)

Retorne uma lista de problemas encontrados.
"""

# Com XML tags — inequívoco mesmo quando o contrato fala em "retornar JSON"
prompt_bom = """
<system>
Você é um assistente de análise jurídica especialista em contratos de prestação de serviços.
</system>

<contrato>
CONTRATO DE PRESTAÇÃO DE SERVIÇOS
... (conteúdo do contrato)
CLÁUSULA 15: O prestador deve sempre retornar resultados em formato JSON.
(fim do contrato)
</contrato>

<instrucoes>
Analise o contrato acima e identifique cláusulas problemáticas.
Para cada problema encontrado, explique:
1. Qual cláusula
2. Por que é problemática
3. Como reformular
</instrucoes>
"""

# Outros usos de XML tags:
# <documento_de_referencia> — diferencia o contexto da instrução
# <exemplo_input> e <exemplo_output> — demonstra formato esperado
# <restricoes> — separa limites claros do problema principal
# <pensamento> — onde Claude pode mostrar raciocínio antes da resposta final`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Chain-of-thought: peça o raciocínio antes da resposta">
        <CodeBlock>{`# Para tarefas que exigem raciocínio multi-etapa, peça que Claude pense antes de responder

# ❌ Sem CoT — Claude pula para a resposta e pode errar em raciocínio complexo
prompt = "Se a empresa tem 150 funcionários e 40% trabalham remotamente, e 30% dos remotos estão no exterior, quantos funcionários estão no escritório?"

# ✅ Com CoT — Claude deve mostrar o raciocínio
prompt_cot = """
Resolva o problema passo a passo, mostrando cada cálculo antes de dar a resposta final.

Problema: Se a empresa tem 150 funcionários e 40% trabalham remotamente,
e 30% dos remotos estão no exterior, quantos funcionários estão no escritório?

Mostre o raciocínio em <pensamento> tags antes da resposta final.
"""

# Claude tipicamente responde:
# <pensamento>
# Total: 150 funcionários
# Remotos: 150 × 0.40 = 60 funcionários remotos
# Remotos no exterior: 60 × 0.30 = 18
# Remotos no país: 60 - 18 = 42
# No escritório: 150 - 60 = 90 funcionários
# </pensamento>
# Resposta: 90 funcionários estão no escritório.

# Para problemas de código:
prompt_debug = """
<codigo>
def calcular_media(numeros):
    return sum(numeros) / len(numeros)
</codigo>

Antes de sugerir correção, analise em <analise>:
1. O que o código faz corretamente
2. Quais casos de borda podem falhar
3. Qual o erro mais provável que o usuário está vendo

Depois da análise, sugira a correção com explicação.
"""

# CoT é especialmente útil para:
# - Problemas matemáticos ou lógicos multi-etapa
# - Análise de código (entender antes de corrigir)
# - Decisões com múltiplos critérios (comparar opções)
# - Debugging (hipóteses antes da solução)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Prefill: forçar formato de saída de forma confiável">
        <CodeBlock>{`# Prefill: iniciar a resposta do assistente para forçar um formato

import anthropic

client = anthropic.Anthropic()

# Caso 1: Forçar JSON puro sem markdown
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "Extraia nome, email e cargo do seguinte texto: 'Maria Silva, maria@empresa.com, Engenheira Sênior'"
        },
        {
            "role": "assistant",
            "content": "{"  # ← prefill: Claude continua a partir daqui
        }
    ]
)
# Resposta será o JSON completo, sem "Aqui está o JSON:" antes
import json
dados = json.loads("{" + response.content[0].text)  # reconstituir o JSON

# Caso 2: Forçar bloco de código
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=2048,
    messages=[
        {"role": "user", "content": "Escreva uma função Python para calcular fibonacci"},
        {"role": "assistant", "content": "\`\`\`python\n"}  # ← prefill com abertura do bloco
    ]
)
# Resposta começa direto no código, sem explicação antes

# Caso 3: Forçar resposta no idioma correto
# Para sistemas multilingues onde o idioma do system prompt pode vazar:
messages=[
    {"role": "user", "content": pergunta_em_portugues},
    {"role": "assistant", "content": "Em resposta à sua pergunta: "}
]

# Quando NÃO usar prefill:
# - Quando você quer a explicação do Claude (prefill a remove)
# - Quando o formato pode variar legitimamente
# - Quando usa extended thinking (prefill interfere no raciocínio)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Few-shot: exemplos ensinam melhor que instruções">
        <CodeBlock>{`# Few-shot: exemplos de input → output ensinam Claude o formato e comportamento esperados

# ❌ Instrução pura (ambígua para dados não-uniformes)
system = "Extraia a data de emails e retorne em formato ISO 8601"

# ✅ Few-shot com exemplos de variações reais
system = """
Extraia a data de emails e retorne SOMENTE a data em formato ISO 8601 (YYYY-MM-DD).
Se a data for ambígua ou ausente, retorne null.

Exemplos:
<exemplo>
<email>Reunião confirmada para 15/03/2026 às 14h</email>
<data>2026-03-15</data>
</exemplo>

<exemplo>
<email>Segue o relatório de ontem</email>
<data>null</data>
</exemplo>

<exemplo>
<email>Meeting scheduled for March 3rd</email>
<data>null</data>
</exemplo>

<exemplo>
<email>Prazo: segunda-feira, 6 de abril</email>
<data>2026-04-06</data>
</exemplo>
"""

# Os exemplos cobrem: formato BR (dd/mm/yyyy), data relativa ("ontem"),
# inglês (deve retornar null se não há contexto de ano), dia da semana.
# Claude generaliza a partir dos exemplos para casos não vistos.

# Regras para bons exemplos:
# 1. Use dados REAIS do seu domínio — exemplos fictícios simplificados não preparam para o real
# 2. Inclua edge cases que você sabe que existem no seus dados
# 3. 3-5 exemplos geralmente são suficientes; mais de 8 raramente ajuda
# 4. O último exemplo deve ser o mais próximo do caso mais comum
# 5. Exemplos ruins são piores que nenhum — calibre cuidadosamente`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Evitar alucinações: técnicas que reduzem, não eliminam">
        <ComparisonTable
          headers={['Técnica', 'O que faz', 'Quando usar']}
          rows={[
            ['Grounding explícito', 'Forneça os fatos no prompt; peça para responder SÓ com base no que foi fornecido', 'Análise de documentos, Q&A sobre dados específicos'],
            ['Admissão de incerteza', 'Instrua: "Se não souber com certeza, diga não sei"', 'Perguntas factuais, datas, números específicos'],
            ['Chain-of-thought', 'Raciocínio explícito reduz "salto" para resposta incorreta', 'Problemas multi-etapa, análise complexa'],
            ['Verificação cruzada', 'Peça que Claude verifique a própria resposta contra o documento fornecido', 'Extração de dados críticos, análise jurídica/médica'],
            ['Temperatura baixa', 'temperature=0 para máxima consistência (API)', 'Tarefas de extração onde variação é ruim'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Grounding: peça Claude para responder SOMENTE com base no contexto fornecido
system = """
Você responde perguntas sobre documentos fornecidos pelo usuário.
REGRAS ESTRITAS:
- Responda SOMENTE com informações presentes no documento fornecido
- Se a resposta não estiver no documento, diga: "Esta informação não está no documento fornecido"
- Não use conhecimento geral que não esteja no documento
- Cite a seção/parágrafo de onde veio a informação
"""

# Para perguntas factuais onde Claude pode alucinar detalhes:
prompt = """
<documento>
[conteúdo do documento]
</documento>

Pergunta: Qual foi o faturamento da empresa no Q3 2025?

Baseie sua resposta APENAS no documento acima. Se o número não estiver
explicitamente mencionado, responda: "O faturamento do Q3 2025 não é mencionado no documento."
"""

# Temperatura baixa para extração consistente:
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=512,
    temperature=0,  # 0 = mais determinístico, menos variação
    messages=[...]
)
# Use temperature=0 para extração de dados, classificação, código
# Use temperature=0.5-1.0 para escrita criativa, brainstorming`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Hierarquia de técnicas por impacto:</strong> (1) grounding com contexto explícito — maior impacto na precisão; (2) XML tags para estrutura — reduz ambiguidade significativamente; (3) prefill para formato — garante saída parseável; (4) few-shot para edge cases — essencial para dados não-uniformes; (5) chain-of-thought — para raciocínio complexo. Use essas técnicas de forma acumulativa para tarefas críticas.
      </Callout>

      <Callout>
        Próximo: <strong>Claude em produção</strong> — custo real, rate limits, estratégias de caching e como operar a API Anthropic com qualidade em sistemas reais.
      </Callout>
    </div>
  );
}
