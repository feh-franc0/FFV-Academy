import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-claude-code-team-playbook');
const accent = '#cc785c';

const quiz: QuizQuestion[] = [
  {
    question: 'O que NÃO deve entrar em CLAUDE.md de time?',
    options: [
      'Regras de estilo',
      'Segredos, credenciais, tokens, senhas, URLs internas sensíveis — CLAUDE.md entra no repo, pode vazar. Use .env/Secrets Manager pra sensíveis',
      'Convenções',
      'Comandos comuns',
    ],
    correct: 1,
    explanation: 'CLAUDE.md vira contexto do agent em cada sessão. Se tem secret, Claude pode logar/referenciar inadvertidamente. Guarde: convenções, stack, gotchas, comandos, roteamento de arquivos. Nunca: credenciais.',
  },
  {
    question: 'Quando usar Skills em vez de alias de comando?',
    options: [
      'Sempre',
      'Skills quando lógica é contextual (carrega docs, scripts, prompts específicos) e reutilizável. Alias pra shortcut simples. Skills são invocadas por intenção ("quando user pedir X"); alias é explícito',
      'Skills são deprecated',
      'Sem diferença',
    ],
    correct: 1,
    explanation: 'Skills (Anthropic) são "specialists" — Claude consulta quando reconhece intent. Alias é atalho literal. Pra "quando usuário pedir deploy, siga esse playbook", skill. Pra "sempre inicie com ls de x", alias ou hook.',
  },
  {
    question: 'Qual é o valor de hooks em CI?',
    options: [
      'Nenhum',
      'Validação automatizada antes de commit/PR (lint, secret scan, tests) roda sem o dev esquecer. Mais rápido que review manual; falha rápido',
      'Só cosmético',
      'Hook é deprecated',
    ],
    correct: 1,
    explanation: 'Hook pre-commit/pre-push roda local; hooks de CI em PR. Claude Code hooks (PreToolUse, PostToolUse) validam durante a conversa do dev com agent. Juntos: qualidade automática, zero fricção.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-claude-code-team-playbook"
      title="Capstone: playbook de Claude Code pro seu time"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="Claude Code Masterclass"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Entregáveis" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>CLAUDE.md</strong> com: stack, convenções, gotchas, comandos comuns, regras de validação</li>
          <li><strong>.claude/skills/</strong>: 3 skills custom do domínio (ex: deploy, new-module, review-pr)</li>
          <li><strong>.claude/settings.json</strong>: permissions hierárquicas (enterprise → project → user)</li>
          <li><strong>Hooks</strong>: pre-tool-use (validação), post-tool-use (format), stop (summary em PR)</li>
          <li><strong>Onboarding guide</strong>: novo dev do time roda em 30min com Claude Code</li>
        </ul>
      </Section>

      <Section title="Skill exemplo" accent={accent}>
        <CodeBlock lang="markdown">{`# .claude/skills/deploy/SKILL.md
---
name: deploy
description: Deploy da aplicação pra staging/prod com validações
when-to-use: user menciona "deploy", "subir pra staging", "push pra prod"
---

# Deploy checklist

1. Validar testes passando: \`npm test\`
2. Build local: \`npm run build\`
3. Scan secrets: \`gitleaks detect\`
4. Deploy staging: \`npm run deploy:staging\`
5. Smoke test: \`curl https://staging.app/healthz\`
6. Se OK, prod: \`npm run deploy:prod\` (requer aprovação via Slack)
7. Monitor: link pro Grafana
`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Entregável: PR no repo do time com setup completo. Novo dev clona, instala Claude Code, já tem contexto pra trabalhar.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
