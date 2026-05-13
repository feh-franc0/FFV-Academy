import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('fastapi-na-pratica');

const accent = '#3776ab';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que FastAPI virou o framework de facto em Python moderno?',
    options: [
      'Só marketing',
      'Async nativo + OpenAPI/Swagger automático + Pydantic built-in + DI via Depends() elegante. Dev escreve código Python moderno e ganha docs + validação grátis',
      'Mais rápido que Node',
      'Obrigatório pelo PEP',
    ],
    correct: 1,
    explanation: 'Django REST Framework é maduro mas verboso. Flask é minimalista, sem tipos. FastAPI (2018, Sebastián Ramírez) achou o sweet spot: ASGI, type-hint driven, OpenAPI auto, Pydantic validation gratuita. Comunidade grande, adoção massiva.',
  },
  {
    question: 'O que Depends() faz em FastAPI?',
    options: [
      'Importa módulos',
      'Declaração de dependência injetada — FastAPI resolve automaticamente. Útil pra: auth (extrair user do token), DB session, config. Escopos: request, global, com overrides em teste',
      'Requerimento do pacote',
      'Só pra async',
    ],
    correct: 1,
    explanation: 'Depends(fn) injeta resultado de fn no handler. FastAPI faz graph resolution — deps de deps. Testes: app.dependency_overrides[fn] = mock. É o DI container "invisível" do FastAPI.',
  },
  {
    question: 'Como testar FastAPI?',
    options: [
      'Rodar servidor real',
      'TestClient (httpx sync) ou AsyncClient (pytest-asyncio) — chama handlers diretamente sem sockets. Rápido, isola.',
      'Só via cURL',
      'Requer Docker',
    ],
    correct: 1,
    explanation: 'TestClient usa httpx pra chamar a app ASGI direto. Tests rodam instantaneamente. Override de Depends permite mockar DB/auth. pytest + httpx.AsyncClient pra testar endpoints async com detalhe.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="fastapi-na-pratica"
      title="FastAPI na prática: routers, DI e auth"
      icon="🚀"
      xp={60}
      readTime={14}
      trailName="Python para Engenheiros"
      trailColor={accent}
      nextSlug="jupyter-pra-engenharia"
      nextTitle="Jupyter pra engenharia: notebook reprodutível"
      quiz={quiz}
    >
      <Section title="Router + DI" accent={accent}>
        <CodeBlock lang="python">{`from fastapi import FastAPI, APIRouter, Depends, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Tasks API", version="1.0.0")

class TaskIn(BaseModel):
    title: str
    description: str | None = None

class TaskOut(TaskIn):
    id: str

# Router (module)
tasks = APIRouter(prefix="/tasks", tags=["tasks"])

async def get_db():
    # scope: request — FastAPI abre conexão, fecha no fim
    async with AsyncSession() as session:
        yield session

@tasks.post("", response_model=TaskOut, status_code=201)
async def create_task(body: TaskIn, db=Depends(get_db)) -> TaskOut:
    task = await db.tasks.insert(body.model_dump())
    return task

@tasks.get("/{id}", response_model=TaskOut)
async def get_task(id: str, db=Depends(get_db)) -> TaskOut:
    task = await db.tasks.find(id)
    if not task: raise HTTPException(404, "not found")
    return task

app.include_router(tasks)`}</CodeBlock>
      </Section>

      <Section title="Auth com JWT" accent={accent}>
        <CodeBlock lang="python">{`from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

bearer = HTTPBearer()

class TokenPayload(BaseModel):
    sub: str
    exp: int

async def current_user(cred: HTTPAuthorizationCredentials = Depends(bearer)) -> TokenPayload:
    try:
        payload = jwt.decode(cred.credentials, SECRET, algorithms=["HS256"])
        return TokenPayload(**payload)
    except JWTError:
        raise HTTPException(401, "invalid token")

@tasks.get("/me")
async def my_tasks(user: TokenPayload = Depends(current_user), db=Depends(get_db)):
    return await db.tasks.find_by_user(user.sub)`}</CodeBlock>
      </Section>

      <Section title="Testes" accent={accent}>
        <CodeBlock lang="python">{`import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app, get_db

@pytest.fixture
def client():
    # Override de dep
    app.dependency_overrides[get_db] = lambda: MockDb()
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")

@pytest.mark.asyncio
async def test_create_task(client: AsyncClient):
    r = await client.post("/tasks", json={"title": "buy milk"})
    assert r.status_code == 201
    assert r.json()["title"] == "buy milk"`}</CodeBlock>
      </Section>

      <Section title="OpenAPI grátis" accent={accent}>
        <p>
          FastAPI gera <InlineCode>/docs</InlineCode> (Swagger UI) e <InlineCode>/redoc</InlineCode> automaticamente a partir dos tipos. Schemas Pydantic viram schemas OpenAPI, deps viram parameters, response_model vira schema de resposta. Docs sempre atualizadas — zero manutenção.
        </p>
        <Callout tone="success" icon="✅">
          Padrão de time FastAPI sério: Settings (pydantic-settings) + Router por domínio + Depends pra auth/db + pytest-asyncio + ruff + mypy strict. Stack completa que escala.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
