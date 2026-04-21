import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('uv-e-python-moderno');

const accent = '#3776ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que uv (Astral) é preferido a pip + venv em 2026?',
    options: [
      'Marketing',
      'Escrito em Rust, 10-100x mais rápido em install; gerencia versões de Python automaticamente; uv.lock determinístico; substitui pip, pip-tools, pipx, virtualenv, pyenv de uma vez',
      'Mais seguro',
      'Apenas de Astral Corp',
    ],
    correct: 1,
    explanation: 'uv faz: install packages (pip), lock (pip-tools), isolamento (venv), múltiplas versões Python (pyenv), tools globais (pipx) — tudo num binário Rust. Install de 100 deps em 3s vs 40s do pip. pyproject.toml é a config canônica (PEP 621).',
  },
  {
    question: 'O que é pyproject.toml?',
    options: [
      'Arquivo de build do PyInstaller',
      'Config canônica de projeto Python (PEP 518/621) — declara deps, metadata, build system. Equivalente a package.json do Node',
      'Só pra Poetry',
      'Substitui requirements.txt mas não setup.py',
    ],
    correct: 1,
    explanation: 'pyproject.toml unifica: deps, dev-deps, metadata (name, version), build config, tool config (ruff, mypy, pytest). Substitui setup.py, setup.cfg, requirements.txt, Pipfile. É o package.json do Python — e uv/hatch/poetry suportam.',
  },
  {
    question: 'Como gerenciar múltiplas versões de Python com uv?',
    options: [
      'Não gerencia',
      '`uv python install 3.12 3.13`; `uv python pin 3.13`; uv baixa versões oficiais do python.org, isola por projeto via pyproject.toml [requires-python]',
      'Só pyenv serve',
      'Precisa Docker sempre',
    ],
    correct: 1,
    explanation: 'uv gerencia versões como nvm pra Node. `uv python install 3.13` baixa; `uv python pin` grava versão no .python-version; uv ativa automaticamente. Zero conflito com Python do SO.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="uv-e-python-moderno"
      title="uv e Python moderno: chega de pip + venv manual"
      icon="⚡"
      xp={45}
      readTime={11}
      trailName="Python para Engenheiros"
      trailColor={accent}
      nextSlug="type-hints-rigorosos"
      nextTitle="Type hints rigorosos: PEP 695, Protocol, TypedDict"
      quiz={quiz}
    >
      <Section title="Por que uv vence" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Install 10-100x mais rápido (Rust + parallel solver).</li>
          <li>Lock determinístico (<InlineCode>uv.lock</InlineCode>).</li>
          <li>Gerencia versões Python sem pyenv.</li>
          <li>uv run — roda script numa venv efêmera isolada.</li>
          <li>uv tool — substitui pipx pra CLIs globais.</li>
        </ul>
      </Section>

      <Section title="Workflow básico" accent={accent}>
        <CodeBlock lang="bash">{`# Criar projeto
uv init meu-app
cd meu-app

# Adicionar deps
uv add fastapi pydantic httpx
uv add --dev pytest ruff mypy

# Instalar tudo
uv sync

# Rodar código dentro da venv
uv run python app.py
uv run pytest

# Atualizar tudo
uv sync --upgrade

# Python version específica
uv python install 3.13
echo "3.13" > .python-version`}</CodeBlock>
      </Section>

      <Section title="pyproject.toml exemplo" accent={accent}>
        <CodeBlock lang="toml">{`[project]
name = "meu-app"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "fastapi>=0.115",
  "pydantic>=2.10",
  "httpx>=0.28",
]

[dependency-groups]
dev = [
  "pytest>=8.3",
  "ruff>=0.9",
  "mypy>=1.13",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.mypy]
strict = true
python_version = "3.12"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"`}</CodeBlock>
      </Section>

      <Section title="Migrando de requirements.txt / poetry" accent={accent}>
        <CodeBlock lang="bash">{`# De requirements.txt → pyproject.toml + uv
uv add $(cat requirements.txt | tr '\\n' ' ')

# De Poetry → uv
# uv consegue ler poetry's pyproject.toml direto em muitos casos; migrator:
pip install poetry-to-uv
poetry-to-uv

# Depois: uv sync e pronto`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Regra pra time: novos projetos em uv. Legados continuam como estão se funcionam — migrar sem valor é churn.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
