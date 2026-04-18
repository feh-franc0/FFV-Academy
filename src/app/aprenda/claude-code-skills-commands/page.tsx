import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#cc785c';

export const metadata = getModuleMetadata('claude-code-skills-commands');

const quiz: QuizQuestion[] = [
  {
    question: 'Onde ficam os arquivos de slash commands customizados no Claude Code?',
    options: [
      'Em ~/.claude/skills/ — o diretório global para todos os projetos',
      'Em .claude/commands/ dentro do projeto — commitado no repositório para compartilhar com o time',
      'Em src/.claude/ — junto ao código da aplicação para facilitar versionamento',
      'Skills são configurados via API — não há arquivos locais envolvidos',
    ],
    correct: 1,
    explanation: 'Slash commands ficam em `.claude/commands/` como arquivos Markdown. O nome do arquivo define o comando: `deploy.md` → `/deploy`, `code-review.md` → `/code-review`. Commitar no repositório significa que todo o time tem os mesmos comandos disponíveis. Há também `~/.claude/commands/` para comandos pessoais que você quer em todos os projetos (ex: `/commit` com seu estilo preferido de mensagem).',
  },
  {
    question: 'Um slash command usa `$ARGUMENTS` na sua definição. O que isso significa na prática?',
    options: [
      '$ARGUMENTS é uma variável especial que Claude substitui automaticamente pelo conteúdo do arquivo ARGUMENTS.md no projeto',
      'Quando você invoca o comando, o texto após o nome do comando é passado como $ARGUMENTS: `/deploy staging v2.1` → $ARGUMENTS = "staging v2.1". O arquivo Markdown usa isso para parametrizar o workflow.',
      '$ARGUMENTS é apenas um placeholder de documentação — não tem efeito funcional no comportamento do comando',
      '$ARGUMENTS injeta automaticamente os argumentos da linha de comando do Claude Code (`claude --args`)',
    ],
    correct: 1,
    explanation: 'Skills suportam argumentos via `$ARGUMENTS`. Quando você digita `/deploy staging v2.1`, o Claude Code substitui `$ARGUMENTS` por "staging v2.1" no template do skill antes de processá-lo. Isso permite skills parametrizáveis: `/pr-review 42` passa o número do PR, `/translate pt-BR` passa o idioma alvo, `/new-component Button` passa o nome do componente. Para múltiplos argumentos nomeados, o skill pode instruir Claude a pedir explicitamente (e.g., "extraia o ambiente e a versão de: $ARGUMENTS").',
  },
  {
    question: 'Qual a diferença entre um skill (slash command) e um hook em termos de quando usar cada um?',
    options: [
      'Skills e hooks são intercambiáveis — escolha o que for mais fácil de escrever',
      'Skills são invocados manualmente pelo usuário (/comando). Hooks disparam automaticamente em eventos. Use skills para workflows que você inicia; use hooks para automação que deve rodar sempre sem intervenção.',
      'Skills são mais poderosos que hooks — hooks são apenas uma versão limitada de skills para automação',
      'A diferença é de linguagem: skills são em Markdown, hooks em shell script — o resultado é o mesmo',
    ],
    correct: 1,
    explanation: 'Skills (slash commands) são iniciados pelo usuário: você decide quando rodar `/deploy` ou `/code-review`. Hooks são automáticos: disparam em eventos sem intervenção (PostToolUse, Stop). A combinação certa é: hooks para automação que deve acontecer sempre (lint após edit, notificação ao terminar) e skills para workflows que você inicia quando quiser (deploy, geração de PR description, revisão de segurança). São complementares, não concorrentes.',
  },
];

export default function ClaudeCodeSkillsCommandsPage() {
  return (
    <ModuleLayout
      slug="claude-code-skills-commands"
      title="Skills e slash commands: criar seus próprios workflows"
      icon="⚡"
      xp={65}
      readTime={13}
      trailName="Claude Code: do zero ao poder total"
      trailColor="#cc785c"
      nextSlug="claude-code-subagents"
      nextTitle="Subagents: delegar tarefas a agentes isolados"
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
        Toda vez que você pede a Claude Code para fazer a mesma coisa — "revise este código por questões de segurança", "gere uma descrição para o PR", "faça deploy no ambiente de staging" — você está repetindo um workflow que poderia ser um slash command. Skills transformam prompts repetitivos em comandos de uma palavra invocáveis em qualquer sessão.
      </p>

      <Section accent={accent} title="Anatomia de um slash command">
        <CodeBlock>{`# Skills ficam em .claude/commands/ como arquivos Markdown
# Nome do arquivo = nome do comando (sem .md)

# Exemplo: .claude/commands/commit.md → /commit
# Exemplo: .claude/commands/code-review.md → /code-review
# Exemplo: .claude/commands/deploy.md → /deploy staging v2.1

# Estrutura de um arquivo de skill:

---
# Este bloco de frontmatter é opcional mas recomendado
description: Cria um commit com mensagem no formato Conventional Commits
---

Analise as mudanças staged com \`git diff --staged\` e crie um commit seguindo estas regras:

1. Formato: \`tipo(escopo): descrição curta em PT-BR\`
   - tipos: feat, fix, refactor, docs, test, chore, style, perf
   - escopo: componente ou módulo afetado (opcional)
   - descrição: máximo 72 caracteres, imperativo, sem ponto final

2. Se as mudanças cobrem múltiplos contextos, use commit com bullet points no body.

3. Nunca use --no-verify. Se o pre-commit falhar, investigue e corrija.

4. Após o commit bem-sucedido, confirme com: "✓ Commit criado: [mensagem]"

# Para invocar: /commit
# Claude Code carrega este arquivo, injetado como prompt do usuário`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Skill com argumentos: workflows parametrizáveis">
        <CodeBlock>{`# .claude/commands/pr-review.md
# Uso: /pr-review 42 ou /pr-review https://github.com/org/repo/pull/42

Revise o Pull Request: $ARGUMENTS

Processo:
1. Use o MCP do GitHub para buscar o PR (número ou URL fornecido)
2. Leia o diff completo
3. Analise por estas dimensões (sem ser condescendente ou genérico):
   - Segurança: há possibilidade de injeção, vazamento de dados, permissão indevida?
   - Performance: loops O(n²), N+1 queries, blocking I/O desnecessário?
   - Manutenibilidade: a lógica está clara? há duplicação evitável?
   - Cobertura de edge cases: o que acontece com inputs inválidos, lista vazia, null?
   - Alinhamento com padrões do projeto (cheque o CLAUDE.md para convenções)

4. Formato da resposta:
   ### ✅ Aprovado / ⚠️ Mudanças necessárias / ❌ Bloqueado

   **Problemas críticos** (bloqueia merge):
   - ...

   **Sugestões** (não bloqueia, mas vale considerar):
   - ...

   **Pontos positivos** (o que está bem feito):
   - ...

5. Se não há problemas: "Aprovado ✅ — PR pode ser mergeado"

---
# .claude/commands/new-component.md
# Uso: /new-component NomeDoComponente

Crie um novo componente React: $ARGUMENTS

Siga o padrão dos componentes existentes em src/components/:
1. Leia 2-3 componentes similares para entender o padrão usado
2. Crie src/components/$ARGUMENTS.tsx com:
   - Props tipadas (interface ou type)
   - JSDoc na interface de Props
   - Named export (não default export)
   - Sem estado interno se possível (prefira componentes controlados)
3. Exporte no src/components/index.ts se existir
4. Confirme o que foi criado e próximos passos`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Skills essenciais para qualquer projeto de software">
        <ComparisonTable
          headers={['Skill', 'O que faz', 'Invocação']}
          rows={[
            ['/commit', 'Gera commit Conventional Commits com diff staged', '/commit'],
            ['/pr-review [num]', 'Revisa PR por segurança, performance e padrões', '/pr-review 42'],
            ['/deploy [env]', 'Deploy no ambiente especificado com checklist', '/deploy staging'],
            ['/doc [arquivo]', 'Gera documentação para arquivo ou função', '/doc src/auth.ts'],
            ['/security-check', 'Varre o projeto por vulnerabilidades conhecidas', '/security-check'],
            ['/changelog', 'Gera CHANGELOG.md a partir dos commits desde último tag', '/changelog'],
            ['/translate [lang]', 'Traduz strings de UI para outro idioma', '/translate en-US'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# .claude/commands/deploy.md
# Uso: /deploy staging ou /deploy production

Executar deploy no ambiente: $ARGUMENTS

ATENÇÃO: Se o ambiente for "production", exija confirmação explícita antes de qualquer ação.

Checklist antes de qualquer deploy:
1. Verificar que não há mudanças não commitadas: git status
2. Verificar que os testes passam: npm test
3. Verificar que o build está limpo: npm run build
4. Para produção: verificar que está na branch main e o último commit é recente

Se algum item do checklist falhar, PARE e informe o problema. Não continue o deploy.

Se o ambiente for "staging":
- Execute: ./scripts/deploy.sh staging
- Aguarde confirmação de sucesso
- Reporte a URL de staging ao final

Se o ambiente for "production":
- Exiba o checklist e peça confirmação explícita: "Confirme digitando 'DEPLOY PRODUCTION'"
- Só prossiga após confirmação textual explícita
- Execute: ./scripts/deploy.sh production
- Monitore o rollout por 5 minutos
- Verifique os health checks configurados`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Skills globais vs de projeto: organização">
        <CodeBlock>{`# Dois locais para skills:

# 1. ~/.claude/commands/ — globais (disponíveis em TODOS os projetos)
~/.claude/commands/
├── commit.md              # /commit — padrão pessoal de commit
├── explain.md             # /explain — explique o código selecionado
└── quick-doc.md           # /quick-doc — gera docstring rapidamente

# 2. .claude/commands/ (projeto) — compartilhados com o time via git
.claude/commands/
├── deploy.md              # /deploy — específico deste projeto
├── pr-review.md           # /pr-review — padrões de review da equipe
├── new-component.md       # /new-component — padrão de componente React do projeto
└── security-check.md      # /security-check — checklist de segurança do projeto

# Regra de prioridade:
# - Skills de projeto têm prioridade sobre globais com mesmo nome
# - /commit no projeto pode sobrescrever /commit global se tiver convenções diferentes

# Descobrir skills disponíveis na sessão:
/help    # lista todos os comandos disponíveis, incluindo seus skills customizados

# Boas práticas de skills:
# ✅ Instrua Claude a ler arquivos relevantes antes de agir (contexto primeiro)
# ✅ Defina formato de saída esperado (evita variação entre execuções)
# ✅ Adicione checklist para ações destrutivas (deploy, deletar dados)
# ✅ Documente no CLAUDE.md quais skills existem e para que servem
# ❌ Não crie skills muito genéricos ("faça o que for necessário") — seja específico
# ❌ Não duplique o que o CLAUDE.md já cobre — skills são para workflows, não contexto`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Skill avançado: geração de especificação técnica">
        <CodeBlock>{`# .claude/commands/spec.md
# Uso: /spec [feature] — gera especificação técnica antes de implementar

Gere uma especificação técnica para: $ARGUMENTS

Antes de escrever qualquer código, produza um documento SPEC.md com:

## 1. Problema
O que estamos resolvendo? Por que isso importa?

## 2. Decisões de design
- Quais são as 2-3 abordagens possíveis?
- Para cada uma: trade-offs, complexidade, manutenabilidade
- Decisão escolhida e justificativa

## 3. Interface pública
- Quais funções/componentes/rotas serão criados/modificados?
- Tipos e assinaturas exatas
- Exemplos de uso

## 4. Casos de borda
- O que acontece com input inválido?
- O que acontece com falha de rede/banco?
- Limites de volume (quantos usuários, quantos registros)

## 5. Plano de implementação
- Passos ordenados de implementação
- Quais arquivos criar/modificar
- Estimativa de complexidade (S/M/L/XL)

## 6. Critérios de aceite
- Como verificar que está funcionando?
- Quais testes cobrir?

---
Após gerar o SPEC.md, aguarde aprovação antes de começar a implementação.
Escreva: "Especificação gerada em SPEC.md. Revise e diga 'implementar' para prosseguir."`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Skills como padrão do time:</strong> todo workflow repetitivo que a equipe faz mais de 3 vezes por semana merece um slash command. Commite em .claude/commands/, documente no CLAUDE.md, e o time inteiro se beneficia. A padronização reduz variação de qualidade — /pr-review sempre segue os mesmos critérios, /deploy sempre tem o mesmo checklist de segurança.
      </Callout>

      <Callout>
        Próximo: <strong>API da Anthropic</strong> — como usar a API Messages diretamente para construir aplicações com Claude integrado: streaming, vision, batch e prompt caching.
      </Callout>
    </div>
  );
}
