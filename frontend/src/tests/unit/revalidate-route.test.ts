import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * A rota `/api/revalidate` é a única superfície do frontend que aceita uma ação
 * de servidor vinda do navegador. Ela precisa ser chata na entrada, e estes
 * testes existem para que continue sendo.
 *
 * O risco não é "alguém revalidar uma página" — é revalidar as 415 em laço e
 * transformar trabalho de re-render em custo de hospedagem. Autorização aqui é
 * proteção de recurso, não de segredo.
 */

const revalidatePath = vi.fn();
vi.mock('next/cache', () => ({ revalidatePath: (p: string) => revalidatePath(p) }));

const fetchMock = vi.fn();

function req(body: unknown, auth?: string): Request {
  return new Request('http://localhost/api/revalidate', {
    method: 'POST',
    headers: auth ? { Authorization: auth } : {},
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

/** Resposta do backend para `GET /api/v1/me`. */
function perfil(role: string, ok = true) {
  return { ok, json: async () => ({ role }) } as Response;
}

describe('/api/revalidate', () => {
  beforeEach(() => {
    vi.resetModules();
    revalidatePath.mockClear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.exemplo.test');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  async function rota() {
    return (await import('@/app/api/revalidate/route')).POST;
  }

  it('sem Authorization responde 401 e não revalida nada', async () => {
    const POST = await rota();
    const res = await POST(req({ slug: 'rag-fundamentos' }));
    expect(res.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('token válido de usuário comum responde 403', async () => {
    fetchMock.mockResolvedValue(perfil('user'));
    const POST = await rota();
    const res = await POST(req({ slug: 'rag-fundamentos' }, 'Bearer abc'));
    expect(res.status).toBe(403);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('token recusado pelo backend responde 401', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) } as Response);
    const POST = await rota();
    const res = await POST(req({ slug: 'rag-fundamentos' }, 'Bearer expirado'));
    expect(res.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('admin revalida exatamente a rota do módulo', async () => {
    fetchMock.mockResolvedValue(perfil('admin'));
    const POST = await rota();
    const res = await POST(req({ slug: 'rag-fundamentos' }, 'Bearer adm'));
    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith('/aprenda/rag-fundamentos');
  });

  // O slug entra num caminho de revalidação. Sem validação, o chamador escolhe
  // qual caminho o servidor invalida — inclusive fora de /aprenda.
  it.each([
    ['travessia', '../../admin'],
    ['barra', 'a/b'],
    ['vazio', ''],
    ['maiúsculas', 'RAG'],
    ['não-string', 42],
  ])('rejeita slug inválido (%s) antes de chamar o backend', async (_caso, slug) => {
    fetchMock.mockResolvedValue(perfil('admin'));
    const POST = await rota();
    const res = await POST(req({ slug }, 'Bearer adm'));
    expect(res.status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
    // A validação barata acontece ANTES da ida à rede: entrada obviamente
    // inválida não deve custar uma chamada ao backend.
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('corpo que não é JSON responde 400', async () => {
    const POST = await rota();
    const res = await POST(req('{isso não é json', 'Bearer adm'));
    expect(res.status).toBe(400);
  });

  it('backend inalcançável responde 502 — não revalida no escuro', async () => {
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const POST = await rota();
    const res = await POST(req({ slug: 'rag-fundamentos' }, 'Bearer adm'));
    expect(res.status).toBe(502);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('sem API configurada responde 503 em vez de revalidar sem verificar', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', '');
    vi.resetModules();
    const POST = await rota();
    const res = await POST(req({ slug: 'rag-fundamentos' }, 'Bearer adm'));
    expect(res.status).toBe(503);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
