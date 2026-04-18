import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata = getModuleMetadata('venv-pip-uv');

const quiz: QuizQuestion[] = [
  {
    question: 'Por que instalar pacotes sem virtualenv no Python do sistema é problemático?',
    options: [
      'Porque pip não funciona sem virtualenv',
      'Porque diferentes projetos podem precisar de versões incompatíveis da mesma lib (projeto A quer requests==2.28, projeto B quer requests==2.31). Sem isolamento, instalar para um quebra o outro. Virtualenv cria um Python isolado por projeto com seu próprio site-packages.',
      'Porque o Python do sistema não tem pip instalado',
      'Porque pacotes instalados no sistema não funcionam para projetos',
    ],
    correct: 1,
    explanation: 'O Python do sistema é usado pelo próprio OS (Ubuntu usa Python para ferramentas de sistema). Instalar pacotes nele com pip pode quebrar essas ferramentas. Além disso, conflitos de versões entre projetos são impossíveis de resolver sem isolamento. virtualenv (e venv) resolvem isso criando um ambiente Python independente por projeto.',
  },
  {
    question: 'Qual a diferença entre `pip install requests` e `pip install -r requirements.txt` em termos de reprodutibilidade?',
    options: [
      'São equivalentes — ambos instalam a versão mais recente',
      '`pip install requests` instala a ÚLTIMA versão disponível — isso pode mudar entre instalações. `requirements.txt` com versões fixadas (`requests==2.31.0`) garante reprodutibilidade. Melhor ainda: `requirements.lock` ou pip-compile que inclui hashes criptográficos de cada pacote.',
      '`requirements.txt` é mais lento mas mais seguro',
      'Não há diferença prática — pip sempre instala a mesma versão',
    ],
    correct: 1,
    explanation: 'Reprodutibilidade é o problema central de gerenciamento de dependências. `pip freeze > requirements.txt` captura versões exatas. pip-tools gera requirements.txt a partir de requirements.in com versões sem pinning. uv lock (no pyproject.toml) é o equivalente moderno — gera um lockfile com hashes para garantia máxima.',
  },
  {
    question: 'Por que uv é tão mais rápido que pip para resolver e instalar dependências?',
    options: [
      'uv usa uma versão mais recente do Python internamente',
      'uv é escrito em Rust com um resolver de dependências baseado no algoritmo PubGrub, usa cache global compartilhado entre projetos (não reinstala o que já tem), baixa wheels em paralelo com HTTP/2, e usa hard links do cache para o venv (evita cópias). pip é Python single-threaded sem cache compartilhado.',
      'uv só instala pacotes populares, ignorando os raros',
      'uv desabilita verificações de segurança para ser mais rápido',
    ],
    correct: 1,
    explanation: 'uv (Astral, 2024) foi construído para ser a ferramenta de gerenciamento Python mais rápida possível. O resolver PubGrub evita backtracking desnecessário. O cache global usa hard links — instalar numpy em 10 projetos não cria 10 cópias em disco. Benchmarks mostram 10-100x vs pip, especialmente em cold installs.',
  },
];

export default function VenvPipUvPage() {
  return (
    <ModuleLayout
      slug="venv-pip-uv"
      title="venv, pip, uv: isolamento de dependências sem dor"
      icon="📦"
      xp={45}
      readTime={9}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="type-hints-serios"
      nextTitle="Type hints sérios: mypy, pyright, Protocol, Generic"
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
        Dependências mal gerenciadas causam o infame "funciona na minha máquina". virtualenv, pip e agora uv são as ferramentas que resolvem isso — entender cada uma e quando usar é essencial para qualquer projeto Python sério.
      </p>

      <Section accent={accent} title="Por que virtualenvs existem">
        <p>
          Imagine dois projetos no mesmo computador: <strong>api-v1</strong> precisa de <code>django==3.2</code> e <strong>api-v2</strong> precisa de <code>django==4.2</code>. Sem isolamento, é impossível ter as duas versões instaladas ao mesmo tempo — uma sobrescreve a outra.
        </p>
        <p>
          Um <strong>virtualenv</strong> (ou <code>venv</code>) cria um diretório com uma cópia do interpretador Python e um <code>site-packages</code> próprio, isolado do Python do sistema e de outros envs. Ativar o virtualenv faz todos os comandos python/pip apontarem para ele.
        </p>
        <CodeBlock>{`# Criar virtualenv com o módulo venv (incluso no Python 3.3+)
python3 -m venv .venv          # cria em .venv/ (convenção moderna)
python3.11 -m venv .venv       # versão específica de Python

# Ativar (necessário em cada nova sessão de terminal)
source .venv/bin/activate      # Linux/Mac
.venv\\Scripts\\activate.ps1     # Windows PowerShell

# Agora 'python' e 'pip' apontam para o venv:
which python                   # → /caminho/ao/projeto/.venv/bin/python
python --version               # versão isolada
pip list                       # só o que está no venv

# Desativar
deactivate

# Excluir (é só apagar o diretório — nunca commite o .venv)
rm -rf .venv`}</CodeBlock>
        <Callout tone="info">
          Adicione <code>.venv/</code> ao <code>.gitignore</code>. O venv não deve ser versionado — apenas o arquivo de lockfile que permite recriá-lo.
        </Callout>
      </Section>

      <Section accent={accent} title="pip: instalação e gerenciamento de pacotes">
        <CodeBlock>{`# Instalar pacotes
pip install requests                   # última versão
pip install requests==2.31.0           # versão exata
pip install "requests>=2.28,<3.0"      # range de versão
pip install -r requirements.txt        # de um arquivo
pip install -e .                       # editable install (desenvolvimento)

# Listar e inspecionar
pip list                               # pacotes instalados
pip show requests                      # detalhes de um pacote
pip list --outdated                    # pacotes com versão nova disponível

# Gerar requirements.txt
pip freeze > requirements.txt          # versões exatas de tudo instalado
pip freeze | grep -v "^-e" > requirements.txt  # sem editable installs

# Instalar em produção (sem pacotes de dev)
pip install -r requirements.txt

# Problema do pip freeze: inclui TODAS as dependências (diretas + transitivas)
# Difícil distinguir o que você instalou do que foi instalado automaticamente
# → solução: requirements.in + pip-compile ou uv`}</CodeBlock>
      </Section>

      <Section accent={accent} title="pyproject.toml: o padrão moderno">
        <p>
          O <code>setup.py</code> e o <code>requirements.txt</code> puro são legados. O padrão moderno (PEP 517/518) é o <code>pyproject.toml</code> — um arquivo único que define o projeto, dependências e ferramentas.
        </p>
        <CodeBlock>{`# pyproject.toml — projeto Python moderno
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "meu-projeto"
version = "1.0.0"
description = "Descrição do projeto"
requires-python = ">=3.11"

# Dependências de produção (sem versão fixada — fixar no lockfile)
dependencies = [
  "fastapi>=0.100",
  "httpx>=0.24",
  "pydantic>=2.0",
]

[project.optional-dependencies]
# pip install -e ".[dev]" instala dependências de desenvolvimento
dev = [
  "pytest>=7.0",
  "ruff>=0.1",
  "mypy>=1.0",
]

[tool.ruff]
line-length = 88
select = ["E", "F", "I"]   # errors, pyflakes, isort

[tool.mypy]
strict = true
python_version = "3.11"

[tool.pytest.ini_options]
testpaths = ["tests"]`}</CodeBlock>
      </Section>

      <Section accent={accent} title="uv: o gerenciador moderno (10-100x mais rápido)">
        <ComparisonTable
          headers={['Operação', 'pip + venv', 'uv']}
          rows={[
            ['Criar venv', 'python -m venv .venv', 'uv venv'],
            ['Instalar deps', 'pip install -r req.txt', 'uv pip install -r req.txt'],
            ['Adicionar dep', 'pip install X + freeze', 'uv add X (atualiza pyproject)'],
            ['Sync do lockfile', 'pip install -r req.lock', 'uv sync'],
            ['Run sem ativar venv', 'source .venv/bin/activate && python', 'uv run python'],
            ['Velocidade', 'baseline', '10-100x mais rápido'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`# Instalar uv
curl -LsSf https://astral.sh/uv/install.sh | sh
# ou: pip install uv

# Iniciar projeto novo
uv init meu-projeto
cd meu-projeto

# Criar venv e instalar dependências
uv sync                        # cria .venv + instala do uv.lock

# Adicionar dependências (atualiza pyproject.toml + uv.lock)
uv add fastapi
uv add --dev pytest ruff mypy  # dependências de desenvolvimento

# Remover
uv remove requests

# Executar sem precisar ativar o venv
uv run python main.py
uv run pytest
uv run ruff check .

# Rodar scripts one-off com deps específicas (sem projeto)
uv run --with httpx -- python -c "import httpx; print(httpx.get('https://example.com').status_code)"

# uv também gerencia versões de Python
uv python install 3.12        # instala Python 3.12
uv python list                 # lista versões disponíveis`}</CodeBlock>
      </Section>

      <Section accent={accent} title="O arquivo uv.lock: reprodutibilidade garantida">
        <CodeBlock>{`# uv.lock é gerado automaticamente por 'uv sync' ou 'uv add'
# Commite o uv.lock no git — é o que garante reprodutibilidade

# Estrutura do uv.lock:
# version = 1
# requires-python = ">=3.11"
#
# [[package]]
# name = "fastapi"
# version = "0.104.1"
# source = { registry = "https://pypi.org/simple" }
# dependencies = [...]
# sdist = { url = "...", hash = "sha256:abc123..." }
# wheels = [...]
# ← hashes criptográficos garantem que você instala exatamente o que testou

# Atualizar todas as dependências para versões compatíveis mais novas
uv lock --upgrade

# Atualizar uma dependência específica
uv lock --upgrade-package fastapi`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Setup recomendado em 2026:</strong> uv para projetos novos. pyproject.toml como único arquivo de configuração. uv.lock commitado. Para projetos legados: pip + venv + pip-tools (pip-compile). Nunca mais pip install sem virtualenv ativo.
      </Callout>

      <Callout>
        Próximo: <strong>Type hints sérios</strong> — mypy, pyright, Protocol para duck typing estático, e Generic para código reutilizável.
      </Callout>
    </div>
  );
}
