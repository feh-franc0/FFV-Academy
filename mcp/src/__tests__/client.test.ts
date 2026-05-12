import { describe, it, expect, vi, beforeEach } from "vitest";
import { FFVClient, ApiError } from "../client.js";
import type { Config } from "../config.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeConfig(overrides: Partial<Config> = {}): Config {
  return {
    baseUrl: "http://localhost:8080",
    adminToken: null,
    httpTimeoutMs: 5_000,
    newsJsonPath: "/tmp/news.json",
    catalogJsonPath: "/tmp/catalog.json",
    ...overrides,
  };
}

function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: () => Promise.resolve(text),
      headers: new Headers({ "content-type": "application/json", ...headers }),
    }),
  );
}

function mockFetchTimeout() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(
      (_url: string, opts: { signal?: AbortSignal }) =>
        new Promise<never>((_res, rej) => {
          if (opts?.signal) {
            opts.signal.addEventListener("abort", () => {
              const err = new Error("The operation was aborted");
              err.name = "AbortError";
              rej(err);
            });
          }
        }),
    ),
  );
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("FFVClient.listArticles", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("faz GET /api/v1/curriculum e retorna dados", async () => {
    const payload = { data: [], total: 0, limit: 20, offset: 0 };
    mockFetch(200, payload);

    const client = new FFVClient(makeConfig());
    const result = await client.listArticles({});

    expect(result).toEqual(payload);
    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("/api/v1/curriculum");
  });

  it("inclui trail_id no query string quando fornecido", async () => {
    mockFetch(200, { data: [], total: 0, limit: 20, offset: 0 });
    const client = new FFVClient(makeConfig());
    await client.listArticles({ trailId: "trail1" });

    const [url] = vi.mocked(fetch).mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("trail_id=trail1");
  });

  it("lança ApiError em resposta 500", async () => {
    mockFetch(500, { title: "Internal Error", detail: "DB down" });
    const client = new FFVClient(makeConfig());

    await expect(client.listArticles({})).rejects.toThrow(ApiError);
  });

  it("lança timeout quando o backend não responde", async () => {
    mockFetchTimeout();
    const client = new FFVClient(makeConfig({ httpTimeoutMs: 50 }));

    await expect(client.listArticles({})).rejects.toThrow(/Timeout/);
  }, 2_000);
});

describe("FFVClient.getArticle", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("faz GET /api/v1/curriculum/:slug", async () => {
    const article = { id: "1", slug: "meu-artigo", title: "Meu Artigo" };
    mockFetch(200, article);

    const client = new FFVClient(makeConfig());
    const result = await client.getArticle("meu-artigo");

    expect(result).toEqual(article);
    const [url] = vi.mocked(fetch).mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("/api/v1/curriculum/meu-artigo");
  });

  it("encoda slug com caracteres especiais", async () => {
    mockFetch(200, {});
    const client = new FFVClient(makeConfig());
    await client.getArticle("artigo com espaços");

    const [url] = vi.mocked(fetch).mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("artigo%20com%20espa%C3%A7os");
  });

  it("lança ApiError 404 quando artigo não existe", async () => {
    mockFetch(404, { title: "Not Found", detail: "Artigo não encontrado" });
    const client = new FFVClient(makeConfig());

    const err = await client.getArticle("inexistente").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(404);
  });
});

describe("FFVClient — erros de autenticação", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("lança erro descritivo quando adminToken está ausente e operação exige auth", async () => {
    const client = new FFVClient(makeConfig({ adminToken: null }));

    await expect(
      client.createArticle({
        slug: "test",
        title: "Test",
        trail_id: "trail1",
        hub_id: "hub-ia",
        content_md: "# Test",
        difficulty: "beginner",
      }),
    ).rejects.toThrow(/FFV_ADMIN_TOKEN/);
  });

  it("lança ApiError 401 com URL real do backend (não variável de shell)", async () => {
    mockFetch(401, { title: "Unauthorized", detail: "token expired" });
    const client = new FFVClient(makeConfig({ adminToken: "token-expirado", baseUrl: "https://api.exemplo.com" }));

    const err = await client.createArticle({
      slug: "test",
      title: "Test",
      trail_id: "trail1",
      hub_id: "hub-ia",
      content_md: "# Test",
      difficulty: "beginner",
    }).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(401);
    // deve usar a URL real, não $FFV_API_BASE_URL literal
    expect((err as ApiError).message).toContain("https://api.exemplo.com/api/v1/auth/request-token");
    expect((err as ApiError).message).toContain("https://api.exemplo.com/api/v1/auth/verify");
    expect((err as ApiError).message).not.toContain("$FFV_API_BASE_URL");
    expect((err as ApiError).message).toContain("FFV_ADMIN_TOKEN");
  });

  it("inclui header Authorization nas chamadas admin", async () => {
    mockFetch(200, { slug: "test" });
    const client = new FFVClient(makeConfig({ adminToken: "meu-jwt" }));

    await client.createArticle({
      slug: "test",
      title: "Test",
      trail_id: "trail1",
      hub_id: "hub-ia",
      content_md: "# Test",
      difficulty: "beginner",
    });

    const [, opts] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)["Authorization"]).toBe("Bearer meu-jwt");
  });

  it("não inclui header Authorization nas chamadas públicas", async () => {
    mockFetch(200, { data: [], total: 0, limit: 20, offset: 0 });
    const client = new FFVClient(makeConfig({ adminToken: null }));
    await client.listArticles({});

    const [, opts] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>)["Authorization"]).toBeUndefined();
  });
});

describe("FFVClient.updateArticle", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("faz PATCH /api/v1/admin/curriculum/:slug com body parcial", async () => {
    const updated = { id: "1", slug: "meu-artigo", title: "Novo Título", published: true };
    mockFetch(200, updated);
    const client = new FFVClient(makeConfig({ adminToken: "jwt" }));

    const result = await client.updateArticle("meu-artigo", { title: "Novo Título", published: true });

    expect(result).toEqual(updated);
    const [url, opts] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/admin/curriculum/meu-artigo");
    expect(opts.method).toBe("PATCH");
    expect(JSON.parse(opts.body as string)).toEqual({ title: "Novo Título", published: true });
  });
});

describe("FFVClient.deleteArticle", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("faz DELETE /api/v1/admin/curriculum/:slug sem body", async () => {
    mockFetch(204, "");
    const client = new FFVClient(makeConfig({ adminToken: "jwt" }));
    await client.deleteArticle("artigo-velho");

    const [url, opts] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/admin/curriculum/artigo-velho");
    expect(opts.method).toBe("DELETE");
    expect(opts.body).toBeUndefined();
  });

  it("lança erro quando adminToken ausente", async () => {
    const client = new FFVClient(makeConfig({ adminToken: null }));
    await expect(client.deleteArticle("qualquer")).rejects.toThrow(/FFV_ADMIN_TOKEN/);
  });
});

describe("FFVClient.searchArticles", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("faz GET /api/v1/curriculum/search com query string", async () => {
    mockFetch(200, { data: [] });
    const client = new FFVClient(makeConfig());
    const result = await client.searchArticles("prompt caching");

    expect(result).toEqual({ data: [] });
    const [url] = vi.mocked(fetch).mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain("/api/v1/curriculum/search");
    expect(url).toContain("q=");
  });

  it("lança ApiError quando busca falha", async () => {
    mockFetch(500, { title: "Search Error", detail: "índice indisponível" });
    const client = new FFVClient(makeConfig());
    await expect(client.searchArticles("qualquer")).rejects.toThrow(ApiError);
  });
});

describe("FFVClient — erros de rede (não-ApiError, não-AbortError)", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("re-lança TypeError de rede diretamente", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const client = new FFVClient(makeConfig());
    await expect(client.listArticles({})).rejects.toThrow("Failed to fetch");
  });
});

describe("FFVClient — parsing de erros Problem+JSON", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("extrai title e detail do Problem+JSON no erro", async () => {
    mockFetch(422, { title: "Validation Error", detail: "slug já existe" });
    const client = new FFVClient(makeConfig({ adminToken: "jwt" }));

    const err = await client
      .createArticle({ slug: "dup", title: "T", trail_id: "t", hub_id: "h", content_md: "c", difficulty: "beginner" })
      .catch((e) => e);

    expect((err as ApiError).message).toContain("Validation Error");
    expect((err as ApiError).message).toContain("slug já existe");
  });

  it("usa texto bruto quando resposta não é Problem+JSON", async () => {
    mockFetch(503, "Service Unavailable");
    const client = new FFVClient(makeConfig({ adminToken: "jwt" }));

    const err = await client.listArticles({}).catch((e) => e);
    expect((err as ApiError).message).toContain("503");
  });
});
