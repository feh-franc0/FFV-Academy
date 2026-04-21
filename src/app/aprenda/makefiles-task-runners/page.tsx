import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('makefiles-task-runners');
const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que .PHONY é crucial em Makefile moderno (não C/C++)?',
    options: [
      'Convenção estética',
      'Make foi desenhado pra build de arquivos — se existir arquivo chamado "test" no diretório, make test não roda nada porque "já existe". .PHONY: test declara que test é comando, não arquivo, e sempre executa',
      'Aumenta performance',
      'Torna paralelo',
    ],
    correct: 1,
    explanation: 'Make checa mtime de arquivos: target "test" vs arquivo "test" — se arquivo é mais novo que deps, make diz "nothing to do". Em projeto JS/Python, dev cria pasta "test" e make para de funcionar silenciosamente. .PHONY: test help build clean deploy declara phony targets. Makefile sério começa com .PHONY listando todos os commands. Sem isso, bug mais frustrante do ecossistema.',
  },
  {
    question: 'Qual vantagem principal de just sobre Make?',
    options: [
      'Mais rápido',
      'Sintaxe moderna legível (sem tabs vs spaces traumático), cross-platform real (funciona igual em Windows/Mac/Linux), built-in help (just --list mostra todos os comandos com descrição), sem gotchas de make (.PHONY, $ escapado, tabs obrigatórias)',
      'Substitui bash',
      'Só funciona em Rust',
    ],
    correct: 1,
    explanation: 'Just foi feito pelo autor de rust-analyzer exatamente porque Makefile moderno é experiência dolorosa: tab vs space obrigatório, $$ pra escapar $, .PHONY em tudo, erro de shell diferente em Mac/Linux. Just: justfile em vez de Makefile, indentação livre, recipe com parâmetros tipados, shebang por receita permite Python/Node/Ruby inline. Trade-off: precisa instalar (brew install just), enquanto make vem em tudo.',
  },
  {
    question: 'Quando task (Taskfile.yml, Go) é melhor que Make ou just?',
    options: [
      'Nunca',
      'Quando equipe tem preferência por YAML declarativo (similar a GitHub Actions), precisa de watch/include/task dependencies nativos elaborados, ou mistura Windows/Mac/Linux pesado — task é cross-platform Go binary sem dependências externas',
      'Em projetos Go apenas',
      'Em CI só',
    ],
    correct: 1,
    explanation: 'Task (taskfile.dev) é YAML declarativo: familiar pra quem vem de Actions/Ansible. Features: includes (modular), sources/generates (faz cache inteligente), watch mode, deps automáticas, vars, templating. Single Go binary, sem runtime. Trade-off: YAML verbose comparado a just. Escolha: Make onde simplicidade e ubiquidade mandam; just onde UX pra dev local importa; task onde pipeline complexo com cache de build.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="makefiles-task-runners"
      title="Makefiles e task runners: make, just, task"
      icon="⚙️"
      xp={45}
      readTime={11}
      trailName="DX & Developer Productivity"
      trailColor={accent}
      nextSlug="editor-produtividade"
      nextTitle="Editor produtividade: VS Code power + Neovim"
      quiz={quiz}
    >
      <Section title="Task runner como ponto único de entrada" accent={accent}>
        <p>
          README que lista 20 comandos npm/python/docker diferentes é hostil. Task runner centraliza: <code>make test</code>, <code>make deploy</code>, <code>make seed</code>. Onboarding vira &quot;rode make help&quot;. CI usa os mesmos targets que dev local — paridade real. Protege também contra esquecer parâmetros mágicos (<code>docker run --rm -it --platform=linux/amd64 ...</code>).
        </p>
      </Section>

      <Section title="Make: clássico universal" accent={accent}>
        <CodeBlock lang="yaml">{`# Makefile (note: targets usam TAB, não espaços — lei)
.PHONY: help install test lint build clean deploy

help:  ## Lista comandos disponíveis
\t@grep -E '^[a-zA-Z_-]+:.*?## ' \$(MAKEFILE_LIST) | \\
\t\tawk 'BEGIN{FS=":.*?## "}{printf "  %-15s %s\\n", \$\$1, \$\$2}'

install:  ## Instala deps
\tnpm ci

test:  ## Roda testes
\tnpm test

lint:  ## Lint + typecheck
\tnpm run lint && npx tsc --noEmit

build: install lint test  ## Build completo com checks
\tnpm run build

clean:
\trm -rf node_modules .next out dist

deploy: build  ## Deploy para produção
\t./scripts/deploy.sh`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          TAB obrigatório no início da receita. Dor histórica — editor tem que mostrar whitespace. Se copia do browser e cola, provavelmente quebrou.
        </Callout>
      </Section>

      <Section title="just: moderno e limpo" accent={accent}>
        <CodeBlock lang="bash">{`# justfile (espaços livres, sem TAB obrigatório)

# Lista comandos (default)
default:
    @just --list

# Instala deps
install:
    npm ci

# Roda testes
test:
    npm test

# Lint + typecheck
check:
    npm run lint
    npx tsc --noEmit

# Build com parâmetros
build target="production":
    npm run build -- --mode={{target}}

# Deploy condicional
deploy env="staging": check
    ./scripts/deploy.sh {{env}}

# Shebang permite receita em outra linguagem
analyze:
    #!/usr/bin/env python3
    import json
    print("analysis aqui")`}</CodeBlock>
      </Section>

      <Section title="task: YAML declarativo" accent={accent}>
        <CodeBlock lang="yaml">{`# Taskfile.yml
version: '3'

vars:
  BIN: ./node_modules/.bin

tasks:
  install:
    desc: Instala deps
    cmds:
      - npm ci
    sources:
      - package.json
      - package-lock.json
    generates:
      - node_modules/**

  test:
    desc: Roda testes
    deps: [install]
    cmds:
      - npm test

  build:
    desc: Build produção
    deps: [test]
    cmds:
      - npm run build
    sources:
      - src/**
    generates:
      - out/**`}</CodeBlock>
      </Section>

      <Section title="Comparação rápida" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Dimensão', 'make', 'just', 'task']}
          rows={[
            ['Instalado por default', 'Sim (Unix)', 'Não', 'Não'],
            ['Sintaxe amigável', 'Hostil (tabs, $$)', 'Limpa', 'YAML'],
            ['Cross-platform Windows', 'Com WSL', 'Nativo', 'Nativo'],
            ['Dependências/cache', 'Sim (mtime)', 'Básico', 'Rich (sources/generates)'],
            ['Watch mode', 'Não', 'Não', 'Sim'],
            ['Ecossistema', 'Enorme', 'Crescendo', 'Crescendo'],
          ]}
        />
        <Callout tone="success" icon="✅">
          Regra prática: use <code>make</code> se quer zero-dep e target simples; <code>just</code> se equipe valoriza DX; <code>task</code> se já curte YAML declarativo (Actions, Docker Compose). Qualquer um é infinitamente melhor que README com 20 comandos soltos.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
