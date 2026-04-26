/**
 * Testa os handlers reais registrados em registerTools via InMemoryTransport + Client do SDK.
 * Cobre o código em tools.ts linhas 241-452 que os testes de funções puras não alcançam:
 * safe(), log(), json(), fail() e todos os handlers de tool.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerTools } from "../tools.js";
import { ApiError } from "../client.js";
import type { FFVClient } from "../client.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type TR = { isError?: boolean; content: Array<{ type: string; text: string }> };

// Narrow wrapper that casts the SDK's index-signature return to a concrete type.
async function ct(client: Client, name: string, args: Record<string, unknown> = {}): Promise<TR> {
  const raw = await client.callTool({ name, arguments: args });
  return raw as unknown as TR;
}

function text(result: TR): string {
  const item = result.content[0];
  if (!item) throw new Error("callTool returned empty content");
  return item.text;
}

// ─── Mock do FFVClient ────────────────────────────────────────────────────────

const MOCK_ARTICLE = {
  id: "1", slug: "test-slug", title: "Test Article", trail_id: "trail1", hub_id: "hub-ia",
  content_md: "# Conteúdo", xp: 30, read_time: 5, difficulty: "beginner" as const, order: 0, published: false,
};

function makeMockClient(overrides: Partial<{ [K in keyof FFVClient]: unknown }> = {}): FFVClient {
  return {
    listArticles: vi.fn().mockResolvedValue({ data: [], total: 0, limit: 20, offset: 0 }),
    getArticle: vi.fn().mockResolvedValue(MOCK_ARTICLE),
    searchArticles: vi.fn().mockResolvedValue({ data: [] }),
    createArticle: vi.fn().mockResolvedValue({ slug: "novo-artigo" }),
    updateArticle: vi.fn().mockResolvedValue(MOCK_ARTICLE),
    deleteArticle: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as FFVClient;
}

// ─── Helper: conectar server+client em memória ────────────────────────────────

async function makeConnectedPair(clientOverrides: Partial<{ [K in keyof FFVClient]: unknown }> = {}) {
  const server = new McpServer({ name: "test", version: "0.0.0" });
  const mockClient = makeMockClient(clientOverrides);
  registerTools(server, mockClient);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const sdkClient = new Client({ name: "test-client", version: "0.0.0" });

  await Promise.all([
    server.connect(serverTransport),
    sdkClient.connect(clientTransport),
  ]);

  return { sdkClient, mockClient };
}

// ─── Suprimir stderr ──────────────────────────────────────────────────────────

beforeEach(() => vi.spyOn(process.stderr, "write").mockImplementation(() => true));
afterEach(() => vi.restoreAllMocks());

// ─── list_hubs ────────────────────────────────────────────────────────────────

describe("handler: list_hubs", () => {
  it("retorna 8 hubs sem chamar o client", async () => {
    const { sdkClient, mockClient } = await makeConnectedPair();
    const result = await ct(sdkClient, "list_hubs");

    expect(result.isError).toBeFalsy();
    const data = JSON.parse(text(result));
    expect(data).toHaveLength(8);
    expect(vi.mocked(mockClient.listArticles)).not.toHaveBeenCalled();
  });

  it("emite log JSON com tool=list_hubs e status=ok em stderr", async () => {
    const { sdkClient } = await makeConnectedPair();
    await ct(sdkClient, "list_hubs");

    const stderrWrite = vi.mocked(process.stderr.write);
    expect(stderrWrite).toHaveBeenCalled();
    const firstCall = stderrWrite.mock.calls[0];
    if (!firstCall) throw new Error("stderr.write not called");
    const logLine = JSON.parse(String(firstCall[0]));
    expect(logLine.tool).toBe("list_hubs");
    expect(logLine.status).toBe("ok");
    expect(typeof logLine.ms).toBe("number");
  });
});

// ─── list_trails ──────────────────────────────────────────────────────────────

describe("handler: list_trails", () => {
  it("sem filtro retorna todas as trilhas", async () => {
    const { sdkClient } = await makeConnectedPair();
    const result = await ct(sdkClient, "list_trails");
    const data = JSON.parse(text(result));
    expect(data.total).toBeGreaterThan(50);
  });

  it("com hub_id=hub-ia retorna só trilhas de IA", async () => {
    const { sdkClient } = await makeConnectedPair();
    const result = await ct(sdkClient, "list_trails", { hub_id: "hub-ia" });
    const data = JSON.parse(text(result));
    expect(data.trails.every((t: { hubId: string }) => t.hubId === "hub-ia")).toBe(true);
  });
});

// ─── list_articles ────────────────────────────────────────────────────────────

describe("handler: list_articles", () => {
  it("delega ao client com parâmetros corretos", async () => {
    const { sdkClient, mockClient } = await makeConnectedPair();
    await ct(sdkClient, "list_articles", { trail_id: "trail1", limit: 5 });
    expect(vi.mocked(mockClient.listArticles)).toHaveBeenCalledWith({ trailId: "trail1", limit: 5, offset: undefined });
  });

  it("retorna isError e loga httpStatus quando API retorna erro", async () => {
    const { sdkClient } = await makeConnectedPair({
      listArticles: vi.fn().mockRejectedValue(new ApiError(503, {}, "Service down")),
    });
    const result = await ct(sdkClient, "list_articles");

    expect(result.isError).toBe(true);
    expect(text(result)).toContain("API error 503");

    const stderrWrite = vi.mocked(process.stderr.write);
    const firstCall = stderrWrite.mock.calls[0];
    if (!firstCall) throw new Error("stderr.write not called");
    const logLine = JSON.parse(String(firstCall[0]));
    expect(logLine.status).toBe("error");
    expect(logLine.httpStatus).toBe(503);
  });

  it("retorna isError quando client lança Error genérico", async () => {
    const { sdkClient } = await makeConnectedPair({
      listArticles: vi.fn().mockRejectedValue(new Error("conexão recusada")),
    });
    const result = await ct(sdkClient, "list_articles");
    expect(result.isError).toBe(true);
    expect(text(result)).toContain("conexão recusada");
  });

  it("retorna isError quando client lança valor primitivo (não-Error)", async () => {
    const { sdkClient } = await makeConnectedPair({
      listArticles: vi.fn().mockRejectedValue("falha catastrófica em string"),
    });
    const result = await ct(sdkClient, "list_articles");
    expect(result.isError).toBe(true);
    expect(text(result)).toContain("falha catastrófica em string");
  });
});

// ─── read_article ─────────────────────────────────────────────────────────────

describe("handler: read_article", () => {
  it("retorna artigo completo", async () => {
    const { sdkClient, mockClient } = await makeConnectedPair();
    const result = await ct(sdkClient, "read_article", { slug: "test-slug" });

    expect(result.isError).toBeFalsy();
    expect(vi.mocked(mockClient.getArticle)).toHaveBeenCalledWith("test-slug");
    const data = JSON.parse(text(result));
    expect(data.slug).toBe("test-slug");
  });
});

// ─── search_articles ──────────────────────────────────────────────────────────

describe("handler: search_articles", () => {
  it("delega ao client e retorna resultados brutos", async () => {
    const { sdkClient, mockClient } = await makeConnectedPair({
      searchArticles: vi.fn().mockResolvedValue({
        data: [{ id: "1", slug: "prompt-caching", title: "Prompt Caching", trail_id: "trail1", hub_id: "hub-ia", xp: 30, read_time: 5, difficulty: "beginner", order: 0, published: true }],
      }),
    });
    const result = await ct(sdkClient, "search_articles", { query: "prompt" });

    expect(result.isError).toBeFalsy();
    expect(vi.mocked(mockClient.searchArticles)).toHaveBeenCalledWith("prompt");
    const data = JSON.parse(text(result));
    expect(data.data).toHaveLength(1);
    expect(data.data[0].slug).toBe("prompt-caching");
  });

  it("retorna isError quando client lança ApiError", async () => {
    const { sdkClient } = await makeConnectedPair({
      searchArticles: vi.fn().mockRejectedValue(new ApiError(500, {}, "Search down")),
    });
    const result = await ct(sdkClient, "search_articles", { query: "qualquer" });
    expect(result.isError).toBe(true);
    expect(text(result)).toContain("API error 500");
  });
});

// ─── find_similar_titles ──────────────────────────────────────────────────────

describe("handler: find_similar_titles", () => {
  it("agrupa resultados por trail e retorna estrutura correta", async () => {
    const { sdkClient } = await makeConnectedPair({
      searchArticles: vi.fn().mockResolvedValue({
        data: [
          { id: "1", slug: "a1", title: "Prompt A", trail_id: "trail1", hub_id: "hub-ia", xp: 30, read_time: 5, difficulty: "beginner", order: 0, published: true },
          { id: "2", slug: "a2", title: "Prompt B", trail_id: "trail2", hub_id: "hub-ia", xp: 30, read_time: 5, difficulty: "beginner", order: 0, published: true },
        ],
      }),
    });
    const result = await ct(sdkClient, "find_similar_titles", { topic: "prompt" });
    const data = JSON.parse(text(result));
    expect(data.total_matches).toBe(2);
    expect(data.trails_touched).toBe(2);
    expect(data.note).toContain("TÍTULO");
  });
});

// ─── create_article ───────────────────────────────────────────────────────────

describe("handler: create_article", () => {
  it("chama client.createArticle e retorna slug", async () => {
    const { sdkClient, mockClient } = await makeConnectedPair();
    const result = await ct(sdkClient, "create_article", {
      slug: "novo-artigo", title: "Novo Artigo", trail_id: "trail1",
      hub_id: "hub-ia", content_md: "# Conteúdo", difficulty: "beginner",
    });

    expect(result.isError).toBeFalsy();
    expect(vi.mocked(mockClient.createArticle)).toHaveBeenCalledOnce();
    const data = JSON.parse(text(result));
    expect(data.slug).toBe("novo-artigo");
  });
});

// ─── preview_article_update ───────────────────────────────────────────────────

describe("handler: preview_article_update", () => {
  it("retorna warning quando nenhum campo além do slug", async () => {
    const { sdkClient } = await makeConnectedPair();
    const result = await ct(sdkClient, "preview_article_update", { slug: "test-slug" });
    const data = JSON.parse(text(result));
    expect(data.warning).toBeTruthy();
    expect(data.preview_only).toBeUndefined();
  });

  it("retorna diff com preview_only=true quando há campos", async () => {
    const { sdkClient } = await makeConnectedPair();
    const result = await ct(sdkClient, "preview_article_update", { slug: "test-slug", title: "Título Diferente" });
    const data = JSON.parse(text(result));
    expect(data.preview_only).toBe(true);
    expect(data.fields_changed).toBeGreaterThan(0);
  });

  it("retorna isError quando artigo não existe", async () => {
    const { sdkClient } = await makeConnectedPair({
      getArticle: vi.fn().mockRejectedValue(new ApiError(404, {}, "Not Found")),
    });
    const result = await ct(sdkClient, "preview_article_update", { slug: "inexistente", title: "Qualquer" });
    expect(result.isError).toBe(true);
  });
});

// ─── update_article ───────────────────────────────────────────────────────────

describe("handler: update_article", () => {
  it("chama client.updateArticle com patches corretos", async () => {
    const { sdkClient, mockClient } = await makeConnectedPair();
    await ct(sdkClient, "update_article", { slug: "meu-artigo", published: true, xp: 50 });
    expect(vi.mocked(mockClient.updateArticle)).toHaveBeenCalledWith("meu-artigo", { published: true, xp: 50 });
  });
});

// ─── delete_article ───────────────────────────────────────────────────────────

describe("handler: delete_article", () => {
  it("executa delete quando slug e confirm_slug são idênticos", async () => {
    const { sdkClient, mockClient } = await makeConnectedPair();
    const result = await ct(sdkClient, "delete_article", { slug: "artigo-alvo", confirm_slug: "artigo-alvo" });

    expect(result.isError).toBeFalsy();
    expect(vi.mocked(mockClient.deleteArticle)).toHaveBeenCalledWith("artigo-alvo");
    const data = JSON.parse(text(result));
    expect(data.deleted).toBe("artigo-alvo");
  });

  it("retorna isError e NÃO deleta quando confirm_slug difere", async () => {
    const { sdkClient, mockClient } = await makeConnectedPair();
    const result = await ct(sdkClient, "delete_article", { slug: "artigo-alvo", confirm_slug: "artigo-errado" });

    expect(result.isError).toBe(true);
    expect(text(result)).toContain("Confirmação inválida");
    expect(vi.mocked(mockClient.deleteArticle)).not.toHaveBeenCalled();
  });
});
