import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata = getModuleMetadata('empacotamento-publicacao');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que `pyproject.toml` substituiu `setup.py` como padrão moderno?',
    options: [
      'pyproject.toml é mais rápido de processar que setup.py',
      'setup.py era código Python executável — instalar um pacote requeria executar código arbitrário, criando risco de segurança e comportamento não-determinístico. PEP 517/518 definiram build-system com metadados declarativos em TOML. pyproject.toml centraliza configuração de todas as ferramentas (pytest, ruff, mypy, coverage) num arquivo, elimina setup.cfg e MANIFEST.in, e o build backend é declarado explicitamente.',
      'pyproject.toml só funciona com Python 3.11+',
      'setup.py ainda é o padrão — pyproject.toml é experimental',
    ],
    correct: 1,
    explanation: 'PEP 517 (2017) definiu a interface entre ferramentas de build e instaladores (pip). PEP 518 definiu que o build-system deve ser declarado em pyproject.toml. PEP 621 (2021) padronizou os metadados do projeto na seção [project]. Hoje hatchling, flit, setuptools e poetry implementam o PEP 517 como build backends. pip entende todos eles via a interface padronizada.',
  },
  {
    question: 'O que `ruff` faz que `flake8 + isort + black` fazem separadamente?',
    options: [
      'ruff é apenas um wrapper que chama as ferramentas separadas mais rápido',
      'ruff reimplementa em Rust: linting (regras flake8, pylint, pep8), import sorting (isort), e pode formatar código (ruff format, substituindo black). Uma ferramenta, uma configuração em pyproject.toml, 10-100x mais rápida que as ferramentas Python equivalentes. Suporta 700+ regras de flake8 e plugins (flake8-bugbear, pyupgrade, etc.) sem instalar cada um.',
      'ruff só funciona para projetos com mais de 10k linhas de código',
      'ruff substitui apenas o flake8 — isort e black ainda são necessários',
    ],
    correct: 1,
    explanation: 'ruff (Charlie Marsh, Astral, 2022) é escrito em Rust com foco em velocidade. Verifica 1 milhão de linhas de código em <1 segundo. Suporta auto-fix para a maioria das regras. Configuração em pyproject.toml [tool.ruff] é uma fonte da verdade. ruff format é compatível com black (mesma formatação). Em projetos novos em 2026: substitua flake8 + isort + black por ruff sozinho.',
  },
  {
    question: 'O que é "Trusted Publishing" no PyPI e por que é mais seguro que tokens de API?',
    options: [
      'Trusted Publishing é o mesmo que API tokens — apenas um nome diferente',
      'Trusted Publishing (OpenID Connect) permite que o PyPI verifique a identidade do publisher via provedor OIDC (GitHub Actions, GitLab, etc.) sem usar tokens de longa duração. O GitHub Actions recebe um token temporário de curta duração válido apenas para aquele workflow. Nenhum secret precisa ser armazenado no repositório — elimina o risco de vazamento de tokens.',
      'Trusted Publishing só funciona para pacotes de código aberto',
      'Trusted Publishing requer que o projeto tenha mais de 100 estrelas no GitHub',
    ],
    correct: 1,
    explanation: 'OIDC Trusted Publishing (pypi.org/manage/account/publishing) configura uma relação de confiança entre PyPI e o provedor (GitHub). Ao publicar via GitHub Actions, o workflow recebe um token OIDC efêmero que PyPI valida — sem armazenar PYPI_API_TOKEN como secret. Funciona com GitHub Actions, GitLab CI/CD, Google Cloud Build, Buildkite. É o padrão recomendado pelo PyPI desde 2023.',
  },
];

export default function EmpacotamentoPublicacaoPage() {
  return (
    <ModuleLayout
      slug="empacotamento-publicacao"
      title="Empacotando projeto: pyproject.toml, ruff, publish no PyPI"
      icon="📦"
      xp={55}
      readTime={11}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="python-modelo-mental"
      nextTitle="Modelo mental do Python: tudo é objeto, referência, mutabilidade"
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
        Um projeto Python profissional vai além de código que funciona: precisa de estrutura reproduzível, ferramentas de qualidade configuradas, e processo de publicação automatizado. pyproject.toml, ruff, e uv são os padrões de 2026.
      </p>

      <Section accent={accent} title="pyproject.toml completo">
        <CodeBlock>{`# pyproject.toml — arquivo único de configuração do projeto
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "meu-pacote"
version = "0.1.0"
description = "Uma frase clara descrevendo o pacote"
readme = "README.md"
license = { text = "MIT" }
requires-python = ">=3.11"
keywords = ["python", "tooling"]
classifiers = [
  "Development Status :: 4 - Beta",
  "Programming Language :: Python :: 3.11",
  "License :: OSI Approved :: MIT License",
]
authors = [{ name = "Fernando Franco", email = "email@exemplo.com" }]

# Dependências de produção — versões abertas (lockfile pina)
dependencies = [
  "httpx>=0.25",
  "pydantic>=2.0",
]

# Entry points — cria CLI ao instalar
[project.scripts]
meu-pacote = "meu_pacote.cli:main"

# Dependências de desenvolvimento
[project.optional-dependencies]
dev = [
  "pytest>=8.0",
  "pytest-cov>=4.0",
  "ruff>=0.4",
  "mypy>=1.0",
]

# URLs do projeto (aparece no PyPI)
[project.urls]
Homepage = "https://github.com/user/meu-pacote"
Documentation = "https://meu-pacote.readthedocs.io"
Repository = "https://github.com/user/meu-pacote"

# Configuração do hatchling (onde está o código)
[tool.hatch.build.targets.wheel]
packages = ["src/meu_pacote"]`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Estrutura de projeto moderna">
        <ComparisonTable
          headers={['Estrutura', 'Flat layout (legado)', 'src layout (moderno)']}
          rows={[
            ['Organização', 'meu_pacote/ na raiz', 'src/meu_pacote/'],
            ['Import sem instalar', 'Sim (pode ser problema)', 'Não — força instalação'],
            ['Separação código/config', 'Misturado', 'Clara'],
            ['Preferência do ecossistema', 'Legado', 'Padrão atual'],
            ['pytest detecta', 'Automaticamente', 'Com testpaths configurado'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Estrutura src layout — padrão moderno
meu-pacote/
├── src/
│   └── meu_pacote/
│       ├── __init__.py     # versão aqui: __version__ = "0.1.0"
│       ├── core.py
│       ├── cli.py
│       └── py.typed        # marker para mypy (PEP 561)
├── tests/
│   ├── conftest.py
│   └── test_core.py
├── pyproject.toml
├── README.md
└── uv.lock

# src/meu_pacote/__init__.py
__version__ = "0.1.0"
__all__ = ["MinhaClasse", "minha_funcao"]

from .core import MinhaClasse, minha_funcao

# Instalar em modo editável para desenvolvimento:
uv sync                  # cria venv + instala deps + instala o pacote
uv sync --dev            # inclui dependências de desenvolvimento`}</CodeBlock>
      </Section>

      <Section accent={accent} title="ruff: linting e formatação unificados">
        <CodeBlock>{`# pyproject.toml — configuração do ruff
[tool.ruff]
target-version = "py311"
line-length = 88    # compatível com black

[tool.ruff.lint]
select = [
  "E",    # pycodestyle errors
  "W",    # pycodestyle warnings
  "F",    # pyflakes
  "I",    # isort
  "B",    # flake8-bugbear
  "C4",   # flake8-comprehensions
  "UP",   # pyupgrade (moderniza sintaxe)
  "N",    # pep8-naming
  "SIM",  # flake8-simplify
]
ignore = [
  "E501",   # line too long (ruff format cuida)
  "B008",   # do not perform function calls in default arguments
]

[tool.ruff.lint.isort]
known-first-party = ["meu_pacote"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"

# Uso no terminal:
# uv run ruff check .           # verifica (mostra erros)
# uv run ruff check . --fix     # corrige automaticamente
# uv run ruff format .           # formata (substitui black)
# uv run ruff check --select ALL # todas as regras

# Exemplos de erros que ruff detecta:
# E711: comparison to None (use 'is')
# B006: mutable default argument
# UP006: use list instead of List (pyupgrade)
# SIM108: use ternary instead of if-else
# F401: imported but unused
# I001: import order (isort)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Publicar no PyPI com uv e Trusted Publishing">
        <CodeBlock>{`# Build — gera distribuição
uv build
# Gera: dist/meu_pacote-0.1.0.tar.gz (sdist) e dist/meu_pacote-0.1.0-py3-none-any.whl

# Publicar no TestPyPI primeiro (sempre)
uv publish --publish-url https://test.pypi.org/legacy/ --token TESTPYPI_TOKEN
# Verificar em: https://test.pypi.org/project/meu-pacote/

# Publicar no PyPI
uv publish --token PYPI_TOKEN

# ─── GitHub Actions com Trusted Publishing (recomendado) ─────────────

# 1. Configurar no PyPI: https://pypi.org/manage/project/meu-pacote/settings/publishing/
#    Adicionar publisher: GitHub, user/repo, workflow: release.yml

# 2. .github/workflows/release.yml`}</CodeBlock>
        <CodeBlock>{`# .github/workflows/release.yml
name: Publish to PyPI

on:
  release:
    types: [published]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v3
        with:
          enable-cache: true
      - run: uv build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  publish:
    needs: build
    runs-on: ubuntu-latest
    environment: pypi
    permissions:
      id-token: write    # necessário para Trusted Publishing OIDC
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: pypa/gh-action-pypi-publish@release/v1
        # sem token! Trusted Publishing usa OIDC automaticamente`}</CodeBlock>
      </Section>

      <Section accent={accent} title="CI completo no pyproject.toml">
        <CodeBlock>{`# pyproject.toml — seções de ferramentas

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = [
  "--cov=src",
  "--cov-report=term-missing",
  "--cov-fail-under=80",
  "-v",
]

[tool.coverage.run]
source = ["src"]
omit = ["*/tests/*"]

[tool.coverage.report]
exclude_lines = [
  "pragma: no cover",
  "if TYPE_CHECKING:",
]

[tool.mypy]
strict = true
python_version = "3.11"
ignore_missing_imports = true

# Makefile ou justfile para comandos comuns:
# lint:
#     uv run ruff check .
#     uv run ruff format --check .
#     uv run mypy src/
#
# test:
#     uv run pytest
#
# all: lint test
#     uv build`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Setup mínimo para projeto novo:</strong> <code>uv init meu-pacote</code> → estrutura src layout → <code>pyproject.toml</code> com ruff + pytest + mypy → CI no GitHub Actions com ruff + pytest → Trusted Publishing para releases. Nenhum token nos secrets, qualidade garantida automaticamente.
      </Callout>

      <Callout>
        Você concluiu a trilha <strong>Python Profundo</strong>! Próximos caminhos: <strong>SQL & Databases</strong> para o backend completo, ou <strong>asyncio</strong> em profundidade com FastAPI e código de produção.
      </Callout>
    </div>
  );
}
