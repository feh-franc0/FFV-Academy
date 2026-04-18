import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#a78bfa';

export const metadata = getModuleMetadata('workflows-ia-profissional');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que pedir ao Claude Code que "escreva a especificação técnica antes de implementar" melhora o resultado final?',
    options: [
      'Não melhora — é uma etapa extra desnecessária que aumenta o tempo total sem benefício mensurável',
      'A spec força Claude a "pensar em voz alta" sobre trade-offs, edge cases e interfaces antes de escrever código. Erros de design são 10x mais baratos de corrigir na spec do que no código. A spec também serve como checkpoint — você pode revisar e corrigir o design antes que código seja escrito.',
      'A spec é necessária apenas para projetos grandes — para tarefas pequenas (< 100 linhas de código) implemente diretamente',
      'A spec melhora o resultado porque Claude tem uma janela de contexto limitada — sem spec, ele esquece o que estava fazendo no meio da implementação',
    ],
    correct: 1,
    explanation: 'Spec-Driven Development com Claude Code funciona porque: (1) Claude produz melhores implementações quando tem um plano claro, (2) você tem um checkpoint de revisão antes de código ser escrito, (3) a spec documenta a intenção — útil para revisão de código e futuras manutenções. Para tarefas de 30 minutos: spec dura 5 minutos e salva 20 de retrabalho. Para tarefas de 8 horas: spec dura 30 minutos e pode salvar horas de implementação na direção errada.',
  },
  {
    question: 'Qual é a abordagem correta quando Claude Code produz uma implementação com um bug que você identificou?',
    options: [
      'Descrever o bug em linguagem natural e pedir para Claude corrigir — não aponte a linha específica para não limitar a abordagem de Claude',
      'Rejeitar toda a implementação e pedir que Claude recomece do zero com instruções mais detalhadas',
      'Apontar especificamente o que está errado com evidências: arquivo, linha, comportamento esperado vs observado, e o erro ou output incorreto real. Claude diagnostica melhor com dados concretos do que descrições vagas.',
      'Corrigir o bug manualmente e informar Claude do que foi feito para que ele aprenda',
    ],
    correct: 2,
    explanation: 'Claude Code responde muito melhor a descrições concretas do problema. "Tem um bug" → Claude vai explorar e pode não achar o mesmo bug que você. "O arquivo src/auth.ts linha 47 retorna undefined quando o usuário não tem o campo email definido, mas deveria retornar o email padrão guest@..." → Claude vai direto ao ponto, entende o contrato esperado e corrige cirurgicamente. Evidências concretas — output real, stack trace, caso de teste que falha — são o insumo mais valioso para debugging com IA.',
  },
  {
    question: 'Você é um gestor de projetos sem experiência em código querendo usar Claude Code para automatizar relatórios. Qual é a abordagem mais eficaz?',
    options: [
      'Claude Code é apenas para desenvolvedores — gestores sem experiência em código devem usar Claude.ai web para automação',
      'Descreva o problema e o resultado desejado em linguagem natural, peça ao Claude que explique cada etapa antes de executar, e valide os resultados antes de aprovar ações. Conhecimento de código não é necessário para supervisionar e avaliar o resultado de uma tarefa.',
      'Contratar um desenvolvedor para escrever os prompts — gestores não conseguem comunicar requisitos técnicos adequadamente para Claude Code',
      'Use apenas o modo de leitura — gestores devem evitar criar ou modificar arquivos com Claude Code',
    ],
    correct: 1,
    explanation: 'Claude Code é um agente que entende linguagem natural. Um gestor pode descrever "preciso de um script que leia o relatório de vendas em Excel toda segunda-feira e envie um resumo por email" e Claude Code vai implementar. A habilidade necessária não é código — é clareza sobre o problema e o resultado esperado, capacidade de avaliar se o resultado faz sentido, e disposição de revisar cada ação antes de aprovar. Isso é supervisão, não programação.',
  },
];

export default function WorkflowsIaProfissionalPage() {
  return (
    <ModuleLayout
      slug="workflows-ia-profissional"
      title="Workflows profissionais: do problema ao resultado com Claude Code"
      icon="🚀"
      xp={85}
      readTime={17}
      trailName="API Claude & Agents"
      trailColor="#a78bfa"
      nextSlug="rag-fundamentos"
      nextTitle="RAG: por que 'só jogar tudo no LLM' não funciona"
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
        O valor real do Claude Code não está nos comandos individuais — está nos workflows completos que ele viabiliza. De uma feature nova em um projeto existente a um script de automação criado do zero, existe uma sequência de etapas que funciona consistentemente: spec antes de código, contexto antes de ação, revisão antes de deploy. Este artigo mostra esse ciclo em cenários reais.
      </p>

      <Section accent={accent} title="O ciclo de trabalho profissional com Claude Code">
        <CodeBlock>{`# O ciclo que funciona em qualquer contexto:

# 1. CONTEXTO — antes de qualquer coisa, Claude entende o projeto
cd meu-projeto
claude
"Antes de começarmos, leia o CLAUDE.md, a estrutura do projeto e me diga
 qual é a arquitetura principal e os arquivos mais importantes."

# Claude lê: CLAUDE.md, package.json, estrutura de pastas, arquivos principais
# Resultado: Claude sabe a stack, padrões e convenções antes de agir

# 2. SPEC — defina o problema antes de implementar
"Vamos implementar autenticação JWT. Antes de escrever qualquer código,
 produza uma especificação técnica que inclua:
 - abordagem escolhida e alternativas descartadas
 - quais arquivos serão criados/modificados
 - interface pública (funções, tipos, rotas)
 - casos de borda a tratar
 Aguarde minha aprovação da spec antes de implementar."

# Você revisa a spec, corrige o que não faz sentido, aprova.

# 3. IMPLEMENTAÇÃO — com spec aprovada, Claude age
"Spec aprovada. Implemente exatamente como descrito."

# Claude edita arquivos, cria outros, adiciona imports — você aprova cada ação

# 4. TESTES
"Agora adicione testes para os casos de uso descritos na spec,
 incluindo os casos de borda."

# 5. REVISÃO
"Rode os testes. Se algum falhar, corrija antes de continuar."

# 6. COMMIT
/commit    # slash command que gera commit com mensagem descritiva

# Tempo total para uma feature média: 30-90 minutos
# vs 4-8 horas de implementação tradicional`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Caso real: desenvolvedor implementando uma feature nova">
        <CodeBlock>{`# Cenário: adicionar exportação de relatório em CSV na API existente

$ claude
# Sessão iniciada. Claude lê CLAUDE.md automaticamente.

Dev: Preciso adicionar um endpoint GET /api/reports/export?format=csv
     que exporta os dados de vendas do último mês. Veja como os outros
     endpoints estão implementados antes de propor a abordagem.

Claude: [Lê src/routes/reports.ts, src/middleware/auth.ts, src/models/sales.ts]

        Analisando o padrão existente...

        Proposta de implementação:
        - Novo arquivo: src/routes/reports/export.ts
        - Reutilizar middleware de auth existente (validateToken)
        - Query no model Sales com filtro date_range
        - Transformação para CSV via biblioteca 'papaparse' (já instalada)
        - Response com headers Content-Type: text/csv, Content-Disposition

        Antes de implementar, quero confirmar:
        1. O endpoint deve exigir autenticação? (assumindo sim)
        2. O "último mês" é mês calendário ou últimos 30 dias?
        3. Há limite de linhas ou pode exportar tudo?

Dev: Sim, auth obrigatória. Últimos 30 dias. Sem limite de linhas.

Claude: Perfeito. Vou implementar.

        [Edit] src/routes/reports/export.ts — criando handler
        [Edit] src/routes/index.ts — registrando nova rota
        [Bash] npm test -- routes/reports (aguardando confirmação)

Dev: [Enter — aprova execução dos testes]

Claude: Testes passando (3 novos, 0 falhou).
        O endpoint está em GET /api/reports/export?format=csv com JWT obrigatório.
        Quer que eu adicione documentação OpenAPI para este endpoint?

# Resultado: feature implementada, testada e documentada em ~20 minutos`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Caso real: gestora de projetos automatizando relatórios (sem código)">
        <CodeBlock>{`# Cenário: gestora quer automatizar consolidação semanal de dados de planilhas

$ claude

Gestora: Toda segunda-feira eu pego três planilhas em Excel — vendas, estoque
         e entregas — e consolido num relatório único que vai por email.
         Isso leva 2 horas. Quero automatizar isso.

Claude: Entendi. Antes de começar, preciso de algumas informações:

        1. Onde estão as planilhas? (pasta local, Google Drive, SharePoint)
        2. Qual é o formato de saída do relatório? (email texto, PDF, outra planilha)
        3. Você usa Mac ou Windows?
        4. Você tem Python instalado? (posso verificar)

Gestora: São arquivos locais em ~/Downloads/relatorios/
         Quero um email com tabela resumo e PDF anexo.
         Mac. Não sei se tenho Python.

Claude: [Bash] python3 --version (com sua permissão)
        → Python 3.12.2 instalado ✓

        Vou criar um script Python que:
        1. Lê as três planilhas da pasta relatorios/
        2. Consolida os dados
        3. Gera um PDF com tabela resumo
        4. Envia por email via Gmail (vou precisar configurar credenciais)

        Antes de criar o script, você pode me enviar as planilhas de exemplo
        para eu entender a estrutura dos dados?

Gestora: [compartilha os arquivos via Claude Code]

Claude: [Read] vendas.xlsx — lendo estrutura...
        [Read] estoque.xlsx — lendo estrutura...
        [Read] entregas.xlsx — lendo estrutura...

        Entendi as estruturas. Vou criar o script.

        [Write] consolidar_relatorio.py
        [Write] README_instrucoes.txt (instruções para configurar o email)
        [Bash] pip install openpyxl reportlab (com sua permissão)
        [Bash] python3 consolidar_relatorio.py --teste (sem enviar email, com sua permissão)

        Relatório gerado: relatorio_teste.pdf
        Verifique se os dados estão corretos. Se sim, configuro o envio de email
        e o agendamento automático para toda segunda-feira.

Gestora: O PDF está perfeito. Como agendar?

Claude: Vou criar um cron job que roda toda segunda às 8h...

# Resultado: gestora com automação funcional sem escrever uma linha de código`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Padrões de prompt que elevam a qualidade do resultado">
        <ComparisonTable
          headers={['Anti-padrão', 'Melhor abordagem']}
          rows={[
            ['"Faça X" sem contexto', '"Antes de fazer X, leia os arquivos relevantes e me diga o plano"'],
            ['"Corrija o bug" sem evidência', '"O arquivo Y linha N retorna Z quando deveria retornar W — corrija"'],
            ['"Refatore tudo"', '"Identifique os 3 principais problemas de manutenibilidade e proponha um plano de refactoring"'],
            ['"Continue" após erro', '"O erro foi X. Qual é a causa e como você pretende corrigir?"'],
            ['"Faça deploy" sem checklist', 'Use o /deploy skill com checklist de segurança embutido'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Padrões de prompt que funcionam consistentemente:

# 1. "Antes de X, faça Y" — controle explícito de ordem
"Antes de escrever qualquer código, leia os arquivos existentes e
 me explique como você vai abordar o problema."

# 2. "Mostre antes de executar" — para ações com efeito colateral
"Mostre o plano completo de mudanças (arquivos a criar/modificar/deletar)
 antes de executar qualquer ação."

# 3. "Assuma que posso estar errado" — para revisão crítica
"Revise minha implementação e me diga onde estou errado, não apenas
 o que está certo. Seja honesto sobre os problemas."

# 4. Checkpoint de qualidade embutido
"Após implementar, verifique se:
 - todos os edge cases da spec estão cobertos
 - há testes para os casos de borda
 - o código segue os padrões do projeto
 Corrija o que não estiver ok antes de reportar concluído."

# 5. Sessões focadas — uma tarefa por sessão
"Nesta sessão vamos APENAS implementar o endpoint de exportação.
 Não faremos refactoring, não vamos corrigir outros bugs que você encontrar.
 Foco total na feature definida."

# Anti-padrão clássico: "entendi" sem verificar
# Claude às vezes confirma entendimento mas implementa diferente do esperado
# Solução: "Antes de implementar, repita com suas palavras o que vai fazer"
# → força Claude a verbalizar o plano e você pode corrigir antes da ação`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Quando Claude Code não é a ferramenta certa">
        <CodeBlock>{`# Claude Code é excelente para:
# ✅ Implementar features com base em especificação clara
# ✅ Debugging: diagnosticar e corrigir erros com evidência
# ✅ Refactoring: melhorar código existente com padrão definido
# ✅ Automação: criar scripts para tarefas repetitivas
# ✅ Code review: identificar problemas em código existente
# ✅ Geração de testes: a partir de especificação existente

# Claude Code não substitui:
# ❌ Decisões de arquitetura — Claude pode propor, mas a decisão é sua
#    Você conhece os constraints do negócio; Claude não
# ❌ Revisão de segurança crítica — use especialistas para sistemas financeiros/médicos
# ❌ Design de produto — "o que construir" é problema de produto, não de código
# ❌ Conhecimento de domínio específico — medicina, direito, contabilidade específica
# ❌ Contexto histórico do projeto — Claude não sabe "por que decidimos assim em 2022"
#    (documentação de ADRs resolve parcialmente)

# Regra prática: se a tarefa requer julgamento sobre o que é correto
# para o seu contexto específico de negócio, Claude Code executa
# mas você decide. Se a tarefa é "como chegar ao resultado", Claude Code
# pode liderar com você supervisionando.

# O padrão mais produtivo:
# - Você define O QUÊ (o problema, o resultado desejado, os critérios)
# - Claude Code decide e executa o COMO
# - Você valida o resultado antes de finalizar`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>O loop de trabalho que funciona:</strong> contexto → spec → aprovação → implementação → testes → revisão → commit. Não pule etapas. Spec bem escrita economiza mais tempo do que implementação rápida. Supervisão inteligente (revisar plano antes de aprovar execução) é o que transforma Claude Code de uma ferramenta que "às vezes funciona" para um colaborador confiável.
      </Callout>

      <Callout>
        Você concluiu a Trilha Claude {"&"} Anthropic na Prática. O próximo passo natural é a <strong>Trilha Engenharia AI-Native</strong> — RAG, agent patterns, MCP servers profissionais e LLMOps em produção.
      </Callout>
    </div>
  );
}
