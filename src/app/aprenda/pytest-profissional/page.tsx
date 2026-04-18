import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

const accent = '#3776ab';

export const metadata = getModuleMetadata('pytest-profissional');

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre fixture com `scope="function"` (default) e `scope="session"`?',
    options: [
      'São equivalentes — scope não afeta o comportamento',
      'scope="function" recria a fixture para cada função de teste (estado isolado, mais lento). scope="session" cria uma vez para toda a suíte de testes (estado compartilhado, mais rápido). Use session para recursos caros como conexão de banco. ⚠️ fixtures de session que mutam estado podem causar testes interdependentes — evite compartilhar estado mutável.',
      'scope="session" só funciona com fixtures de banco de dados',
      'scope="function" só pode ser usado em métodos de classe de teste',
    ],
    correct: 1,
    explanation: 'Os 4 scopes disponíveis: function (default), class (compartilhado entre métodos da mesma classe), module (um por arquivo de teste), session (um para toda a execução). Ordem de teardown: function → class → module → session. Uma fixture de scope maior não pode usar fixture de scope menor (mas pode usar de mesmo scope ou maior).',
  },
  {
    question: 'Quando usar `monkeypatch` vs `unittest.mock.patch` em pytest?',
    options: [
      'São equivalentes — use qualquer um',
      'monkeypatch é a fixture nativa do pytest: limpa automaticamente ao fim do teste, sintaxe mais simples para atributos e variáveis de ambiente. unittest.mock.patch é mais poderoso para mocking de objetos complexos (spec, side_effect, call_count, assert_called_with). Na prática: monkeypatch para env vars e atributos simples; mock.patch para substituir comportamento de funções e verificar chamadas.',
      'monkeypatch só funciona em Python 3.10+',
      'unittest.mock.patch não é compatível com pytest — use sempre monkeypatch',
    ],
    correct: 1,
    explanation: 'monkeypatch.setattr(obj, "attr", valor) substitui attr e restaura automaticamente. monkeypatch.setenv("VAR", "val") define env var para o teste. unittest.mock.Mock() cria objetos que registram chamadas, permite spec=ClasseReal para verificar interface, side_effect para simular exceções ou comportamento dinâmico. MagicMock suporta magic methods (__len__, __iter__, etc.).',
  },
  {
    question: 'O que `@pytest.mark.parametrize` faz e por que é preferível a múltiplas funções de teste?',
    options: [
      'parametrize executa o mesmo teste em paralelo com múltiplas threads',
      'parametrize gera N casos de teste independentes a partir de uma lista de argumentos — cada caso tem ID próprio no relatório, falha independente (um caso falhar não impede os outros), e o código de teste é escrito uma vez. Sem parametrize, você duplicaria lógica ou usaria loops (que falham no primeiro assert). É mais fácil adicionar casos edge e o pytest reporta cada parametro separadamente.',
      'parametrize só funciona com argumentos do tipo inteiro',
      'parametrize é mais lento porque executa os testes sequencialmente',
    ],
    correct: 1,
    explanation: 'pytest.mark.parametrize("x,expected", [(1, 1), (2, 4), (3, 9)]) gera 3 testes: test_quadrado[1-1], test_quadrado[2-4], test_quadrado[3-9]. Se o caso (2, 4) falhar, (3, 9) ainda roda. Você pode combinar com fixtures, adicionar pytest.param(..., marks=pytest.mark.xfail) para casos esperados de falha, e ids=[...] para nomes customizados.',
  },
];

export default function PytestProfissionalPage() {
  return (
    <ModuleLayout
      slug="pytest-profissional"
      title="pytest profissional: fixture, parametrize, mock, coverage"
      icon="🧪"
      xp={70}
      readTime={14}
      trailName="Python Profundo"
      trailColor="#3776ab"
      nextSlug="empacotamento-publicacao"
      nextTitle="Empacotando projeto: pyproject.toml, ruff, publish no PyPI"
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
        pytest é o framework de testes padrão do ecossistema Python. Saber escrever fixtures reutilizáveis, parametrize para testes data-driven, mocking correto e medir coverage real separa testes que protegem de testes que só aumentam o número de linhas de código.
      </p>

      <Section accent={accent} title="Estrutura e convenções do pytest">
        <CodeBlock>{`# conftest.py — fixtures compartilhadas (pytest detecta automaticamente)
# tests/conftest.py
import pytest
from myapp.database import Database

# Fixture básica — função que retorna o que o teste precisa
@pytest.fixture
def usuario_padrao():
    return {"nome": "Fernando", "email": "f@example.com", "admin": False}

# Fixture com teardown — yield divide setup e teardown
@pytest.fixture
def banco_de_teste():
    db = Database(url="sqlite:///:memory:")
    db.create_tables()
    yield db          # AQUI o teste roda
    db.drop_all()     # teardown sempre roda (mesmo com exceção)
    db.close()

# Scopes: function (default), class, module, session
@pytest.fixture(scope="session")
def cliente_http():
    import httpx
    with httpx.Client(base_url="http://testserver") as client:
        yield client
    # cliente fechado uma vez ao fim de toda a suíte

# Fixtures podem depender de outras fixtures
@pytest.fixture
def usuario_salvo(banco_de_teste, usuario_padrao):
    return banco_de_teste.insert("users", usuario_padrao)

# Usando fixtures no teste:
def test_usuario_tem_email(usuario_padrao):
    assert "@" in usuario_padrao["email"]

def test_salvar_usuario(usuario_salvo, banco_de_teste):
    result = banco_de_teste.find("users", id=usuario_salvo["id"])
    assert result["nome"] == "Fernando"

# Estrutura recomendada de projeto:
# projeto/
#   src/myapp/      ← código
#   tests/
#     conftest.py   ← fixtures compartilhadas
#     test_users.py
#     test_api.py
#   pyproject.toml`}</CodeBlock>
      </Section>

      <Section accent={accent} title="parametrize: testes data-driven">
        <CodeBlock>{`import pytest

def normalizar_email(email: str) -> str:
    return email.strip().lower()

# Sem parametrize — repetição de lógica:
def test_normalizar_email_maiusculo():
    assert normalizar_email("USUARIO@EXAMPLE.COM") == "usuario@example.com"

def test_normalizar_email_espaco():
    assert normalizar_email("  user@example.com  ") == "user@example.com"

# COM parametrize — uma função, N casos:
@pytest.mark.parametrize("entrada,esperado", [
    ("USUARIO@EXAMPLE.COM", "usuario@example.com"),
    ("  user@example.com  ", "user@example.com"),
    ("Mixed.Case@Example.Com", "mixed.case@example.com"),
    ("já_normalizado@exemplo.com", "já_normalizado@exemplo.com"),
])
def test_normalizar_email(entrada, esperado):
    assert normalizar_email(entrada) == esperado
# Gera: test_normalizar_email[USUARIO...], test_normalizar_email[  user...], etc.

# pytest.param — adicionar marks e ids customizados
@pytest.mark.parametrize("n,esperado", [
    pytest.param(0, 1, id="zero"),
    pytest.param(1, 1, id="um"),
    pytest.param(5, 120, id="cinco"),
    pytest.param(-1, None, id="negativo", marks=pytest.mark.xfail),
])
def test_fatorial(n, esperado):
    from math import factorial
    assert factorial(n) == esperado

# Combinar com fixtures:
@pytest.mark.parametrize("role", ["admin", "user", "viewer"])
def test_permissoes(role, banco_de_teste):   # banco_de_teste é fixture
    usuario = banco_de_teste.criar_usuario(role=role)
    permissoes = usuario.get_permissoes()
    assert isinstance(permissoes, list)`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Mocking: monkeypatch e unittest.mock">
        <ComparisonTable
          headers={['Ferramenta', 'Melhor para', 'Sintaxe', 'Auto-cleanup']}
          rows={[
            ['monkeypatch.setattr', 'Substituir atributo/método', 'monkeypatch.setattr(obj, "attr", val)', 'Sim (fim do teste)'],
            ['monkeypatch.setenv', 'Variáveis de ambiente', 'monkeypatch.setenv("VAR", "val")', 'Sim'],
            ['unittest.mock.Mock', 'Objeto fake com verificações', 'mock = Mock(spec=MinhaClasse)', 'Manual (ou @patch)'],
            ['unittest.mock.patch', 'Substituir módulo inteiro', '@patch("myapp.requests.get")', 'Automático (ctx manager)'],
            ['pytest-mock (MagicMock)', 'Interface pytest para mock', 'def test(mocker): mocker.patch(...)', 'Sim (fixture)'],
          ]}
          accent={accent}
        />
        <CodeBlock>{`import pytest
from unittest.mock import Mock, patch, MagicMock
from myapp import servico_usuario

# monkeypatch — simples e limpo
def test_com_env_var(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")
    monkeypatch.setattr("myapp.config.DEBUG", True)
    resultado = servico_usuario.conectar()
    assert resultado.url == "sqlite:///:memory:"

# unittest.mock.patch como decorator
@patch("myapp.servico_usuario.requests.get")
def test_buscar_usuario(mock_get):
    # configura o retorno do mock
    mock_get.return_value.json.return_value = {"id": 1, "nome": "Fernando"}
    mock_get.return_value.status_code = 200

    resultado = servico_usuario.buscar_usuario(1)

    # verifica que foi chamado corretamente
    mock_get.assert_called_once_with("https://api.example.com/users/1")
    assert resultado["nome"] == "Fernando"

# pytest-mock (pip install pytest-mock) — mais idiomático
def test_com_mocker(mocker):
    mock_get = mocker.patch("myapp.servico_usuario.requests.get")
    mock_get.return_value.status_code = 404

    with pytest.raises(ValueError, match="usuário não encontrado"):
        servico_usuario.buscar_usuario(999)

# Simular exceção com side_effect
def test_retry_em_falha(mocker):
    mock_get = mocker.patch("requests.get")
    mock_get.side_effect = [
        ConnectionError("timeout"),     # primeira tentativa — falha
        ConnectionError("timeout"),     # segunda — falha
        Mock(status_code=200),          # terceira — sucesso
    ]

    resultado = servico_usuario.buscar_com_retry("url")
    assert mock_get.call_count == 3

# spec= — garante que mock tem mesma interface que classe real
from myapp.models import Usuario
mock_usuario = Mock(spec=Usuario)
mock_usuario.nome         # OK — Usuario tem .nome
# mock_usuario.atributo_inexistente  # AttributeError — spec verifica!`}</CodeBlock>
      </Section>

      <Section accent={accent} title="Coverage e configuração no pyproject.toml">
        <CodeBlock>{`# pip install pytest-cov
# uv add --dev pytest-cov

# Rodar com coverage:
# uv run pytest --cov=src --cov-report=term-missing --cov-report=html

# Output:
# Name                     Stmts   Miss  Cover   Missing
# --------------------------------------------------------
# src/myapp/__init__.py        5      0   100%
# src/myapp/models.py         42      8    81%   23-30, 45
# src/myapp/servico.py        38      0   100%
# --------------------------------------------------------
# TOTAL                       85      8    90%

# pyproject.toml — configuração centralizada
# [tool.pytest.ini_options]
# testpaths = ["tests"]
# addopts = "--cov=src --cov-fail-under=80 -v"
# filterwarnings = ["error::DeprecationWarning"]

# [tool.coverage.run]
# source = ["src"]
# omit = ["*/migrations/*", "*/tests/*"]

# [tool.coverage.report]
# exclude_lines = [
#   "pragma: no cover",
#   "if TYPE_CHECKING:",
#   "raise NotImplementedError",
# ]

# Marks customizados — evitar warnings sobre marks desconhecidos:
# [tool.pytest.ini_options]
# markers = [
#   "slow: testes lentos (deselect com -m 'not slow')",
#   "integration: testes de integração que precisam de banco",
# ]

# Rodando subconjunto:
# uv run pytest -m "not slow"          # pula testes marcados como slow
# uv run pytest -k "test_usuario"      # só testes com "usuario" no nome
# uv run pytest tests/test_api.py::test_criar_usuario  # teste específico
# uv run pytest --lf                   # last-failed: só testes que falharam

# Paralelização (pip install pytest-xdist):
# uv run pytest -n auto               # usa todos os CPUs disponíveis`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Princípios de testes que valem:</strong> teste comportamento, não implementação. Uma fixture de banco de dados real (in-memory SQLite) é melhor que 20 mocks de repositório. Use <code>parametrize</code> para edge cases. Coverage de 80% em código crítico é mais valioso que 100% em código trivial. Testes lentos rodam menos — mantenha a suíte rápida com <code>scope="session"</code> e <code>pytest-xdist</code>.
      </Callout>

      <Callout>
        Próximo: <strong>Empacotamento e publicação</strong> — pyproject.toml completo, ruff para linting, e publicar no PyPI com uv.
      </Callout>
    </div>
  );
}
