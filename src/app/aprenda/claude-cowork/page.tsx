import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-cowork');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre o Claude Cowork e o Claude Code CLI?',
    options: [
      'Não há diferença — Cowork é apenas uma interface gráfica para o Claude Code CLI',
      'Claude Code CLI é focado em desenvolvimento de software no terminal com acesso ao sistema de arquivos local. Cowork é uma plataforma de automação de tarefas mais ampla: executa tarefas de forma assíncrona, suporta plugins especializados, agendamento e pesquisa em escala — sem exigir terminal ou ambiente de desenvolvimento.',
      'Cowork usa um modelo de IA diferente do Claude Code — é otimizado para tarefas de negócio, não para código',
      'Claude Code CLI é para uso individual; Cowork é exclusivamente para equipes com mais de 5 pessoas',
    ],
    correct: 1,
    explanation: 'Claude Code CLI e Cowork são ferramentas complementares do ecossistema Anthropic com focos distintos. CLI é o agente de código no terminal: lê arquivos, edita, commita, roda testes — integrado ao workflow de desenvolvimento. Cowork é uma plataforma de automação mais ampla: você descreve uma tarefa, Cowork a planeja e executa de forma assíncrona (você pode ir fazer outra coisa), usando plugins para capacidades especializadas como pesquisa web profunda, processamento de documentos e integração com serviços externos.',
  },
  {
    question: 'O que são "plugins" no contexto do Claude Cowork e como eles diferem dos MCP servers do Claude Code?',
    options: [
      'Plugins e MCP servers são a mesma coisa — apenas terminologias diferentes para o mesmo conceito',
      'Plugins no Cowork são capacidades especializadas que Claude pode ativar para uma tarefa: pesquisa web, análise de planilhas, geração de imagens, integração com ferramentas de equipe. MCP servers são mais low-level — você configura e mantém. Plugins são mais gerenciados — disponíveis como capacidades na plataforma.',
      'Plugins são exclusivos para usuários Enterprise — planos básicos não têm acesso a plugins',
      'Plugins no Cowork são equivalentes a slash commands — triggers de texto que iniciam um workflow específico',
    ],
    correct: 1,
    explanation: 'A distinção é de abstração e gestão. MCP servers no Claude Code você configura, mantém, versiona — é infraestrutura que você controla. Plugins no Cowork são capacidades disponíveis na plataforma — você os "ativa" para uma tarefa sem configuração de infraestrutura. A filosofia é diferente: Claude Code é para desenvolvedores que querem controle total; Cowork é para profissionais que querem capacidades prontas sem overhead de configuração.',
  },
  {
    question: 'Qual é o principal benefício das tarefas agendadas no Claude Cowork versus configurar um cron job que chama a API do Claude?',
    options: [
      'Tarefas agendadas no Cowork são gratuitas — cron jobs que chamam a API são cobrados por uso',
      'Tarefas agendadas no Cowork mantêm contexto entre execuções, permitem revisão humana antes de agir, e têm interface visual para monitorar execuções. Cron + API é mais simples mas não tem loop de revisão nativo.',
      'Cron jobs são superiores — mais controle técnico, sem limitações de plataforma',
      'Não há diferença prática — use qualquer um dependendo do que você já conhece',
    ],
    correct: 1,
    explanation: 'Tarefas agendadas no Cowork têm uma capacidade que cron + API não tem nativamente: o loop de revisão humana integrado. Claude pode planejar a tarefa, mostrar o plan antes de executar, e solicitar aprovação em pontos críticos — tudo em uma interface visual. Com cron + API, você recebe o output e tem que construir toda essa infraestrutura de revisão manualmente. Para tarefas de automação com impacto real (enviar emails, publicar conteúdo, fazer mudanças em sistemas), a revisão integrada é crítica para evitar erros.',
  },
];

export default function ClaudeCoworkPage() {
  return (
    <ModuleLayout
      slug="claude-cowork"
      title="Claude Cowork: plugins, tarefas agendadas e pesquisa em escala"
      icon="🏢"
      xp={70}
      readTime={14}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-code-cheatsheet-pratico"
      nextTitle="Cheatsheet prático: 50+ comandos, 30 atalhos, 20 flags"
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
        Claude Cowork é a plataforma da Anthropic para automação de tarefas além do código. Enquanto o Claude Code CLI vive no terminal, o Cowork opera em um nível mais alto: você descreve o que precisa fazer, Claude planeja e executa — podendo usar plugins especializados, pesquisar em escala e rodar tarefas de forma assíncrona enquanto você faz outra coisa.
      </p>

      <Section accent={accent} title="O loop de tarefas do Cowork">
        <ComparisonTable
          headers={['Fase', 'O que acontece', 'Você faz']}
          rows={[
            ['1. Descrever', 'Você explica a tarefa em linguagem natural', 'Escrever o objetivo com contexto suficiente'],
            ['2. Planejar', 'Claude decompõe em etapas verificáveis', 'Revisar o plan, ajustar se necessário'],
            ['3. Executar', 'Claude executa cada etapa, possivelmente usando plugins', 'Monitorar, aprovar em pontos críticos'],
            ['4. Revisar', 'Claude entrega o resultado', 'Validar, solicitar ajustes'],
          ]}
          accent={accent}
        />
        <Callout>
          O Cowork é assíncrono por design: você inicia uma tarefa longa (pesquisa, análise de documentos, geração de relatório), fecha a janela e volta quando estiver pronto. Claude continua executando em background.
        </Callout>
      </Section>

      <Section accent={accent} title="Plugins: capacidades especializadas">
        <CodeBlock>{`# Plugins disponíveis no Claude Cowork (variam por plano):

# 🔍 Pesquisa Web Profunda
# Claude pesquisa, visita páginas, sintetiza — não apenas busca rasa
Tarefa: "Pesquise os 5 principais concorrentes do nosso produto
         [descreva o produto]. Para cada um:
         - Modelo de preço
         - Diferenciais principais
         - Reviews de usuários recentes
         - Pontos fracos identificados
         Gere um relatório comparativo em Markdown."

# Plugin de pesquisa web acessa múltiplas fontes,
# Claude sintetiza — não é apenas um resumo de uma página

# ---

# 📊 Análise de Documentos
# Claude processa PDFs, planilhas, apresentações
Tarefa: "Analise os 3 relatórios financeiros em anexo.
         Identifique: tendências de receita, anomalias nos custos,
         e gere um resumo executivo com os 5 pontos mais críticos."

# ---

# 📅 Integração com Calendário e Email (quando disponível)
# Claude pode agendar reuniões, enviar rascunhos de emails
Tarefa: "Baseado na discussão que tivemos, rascunhe um email
         de follow-up para o cliente João sobre os próximos passos.
         Tom: profissional mas direto. Aguarde minha aprovação antes
         de enviar."
# Note: Claude aguarda aprovação para ações com side effects`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Tarefas agendadas: automação com revisão">
        <CodeBlock>{`# Exemplos de tarefas agendadas no Cowork:

# Daily: resumo das notícias relevantes
Tarefa diária (9h):
"Pesquise notícias das últimas 24h sobre:
 - Anthropic e modelos de IA
 - Startups de AI no Brasil
 - Regulamentação de IA (UE, EUA)
 Gere um resumo de 5 bullets por categoria.
 Máximo 300 palavras no total."

# Semanal: relatório de métricas
Tarefa semanal (sexta 17h):
"Acesse o dashboard [URL] e extraia:
 - Usuários ativos da semana
 - Métricas de conversão
 - Top 3 erros reportados
 Compare com semana anterior. Gere o relatório."

# Antes de reunião: preparação de contexto
Tarefa (1h antes de cada reunião de cliente):
"Pesquise as notícias recentes sobre [nome do cliente],
 leia os últimos emails trocados com eles,
 e gere um briefing de 1 página com:
 - Contexto atual da empresa
 - Últimas interações conosco
 - Pontos a abordar na reunião"

# Importante: tarefas com side effects (enviar email, publicar)
# sempre têm um ponto de aprovação humana configurável`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Pesquisa em escala: o que o Cowork faz melhor">
        <CodeBlock>{`# Cowork é particularmente forte em pesquisa que requer
# múltiplas fontes + síntese + formatação:

# Exemplo: Due diligence de fornecedor
Tarefa: "Faça due diligence do fornecedor TechSupply Ltda.
         Pesquise e analise:
         1. Histórico da empresa (fundação, funding, crescimento)
         2. Reputação: reviews, reclamações, casos de sucesso
         3. Saúde financeira: notícias de cortes, expansão, litigação
         4. Concorrentes que oferecem o mesmo serviço
         5. Riscos identificados: concentração de mercado, dependência
         Gere relatório de 2 páginas com fontes citadas."

# Claude usa o plugin de pesquisa para visitar múltiplas fontes:
# LinkedIn, Crunchbase, notícias, sites de review como G2/Capterra
# e sintetiza — sem você ter que abrir 15 abas manualmente

# Comparado com uma busca manual:
# Manual: 2-4 horas para compilar o mesmo nível de informação
# Cowork: 10-20 minutos para resultado similar ou melhor em profundidade`}</CodeBlock>
        <ComparisonTable
          headers={['Caso de uso', 'Claude Code CLI', 'Claude Cowork']}
          rows={[
            ['Implementar feature', '✅ Ideal', '❌ Não é o caso de uso'],
            ['Code review', '✅ Ideal com MCP GitHub', '⚪ Possível mas não otimizado'],
            ['Pesquisa de mercado', '❌ Sem plugin de pesquisa', '✅ Ideal'],
            ['Análise de documentos', '⚪ Com MCP filesystem', '✅ Ideal com plugin'],
            ['Automação agendada', '⚪ Via cron + headless', '✅ Nativo com revisão'],
            ['Tarefas longas assíncronas', '❌ Bloqueia o terminal', '✅ Nativo'],
          ]}
          accent={accent}
        />
      </Section>

      <Section accent={accent} title="Trabalhando com responsabilidade no Cowork">
        <CodeBlock>{`# Configurar pontos de aprovação para ações com impacto:

# 1. Seja explícito sobre o que Claude pode fazer sozinho
"Execute esta tarefa completamente sem interrupção:
 pesquisa → análise → relatório. Não precisa de aprovação."

# vs.

"Pesquise e analise. Aguarde minha aprovação antes de
 enviar o email de follow-up ou fazer qualquer ação externa."

# 2. Para tarefas com acesso a dados sensíveis:
"Acesse apenas os dados do dashboard de analytics.
 Não acesse configurações, dados de usuário ou financeiro."

# 3. Monitore o progresso em tarefas longas:
# O Cowork mostra um log de etapas enquanto executa
# Você pode interromper se Claude seguir uma direção errada

# 4. Revise sempre antes de compartilhar externamente:
"Gere o relatório mas não envie — me mostre para revisão primeiro."`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Cowork e Claude Code são complementares, não competidores.</strong> Para devs: use Claude Code CLI para o trabalho técnico no repositório. Use Cowork para pesquisa, análise de mercado, preparação de documentos, automação de rotinas não-técnicas. Os dois juntos cobrem praticamente todo o ciclo de trabalho de um profissional de tecnologia.
      </Callout>
    </div>
  );
}
