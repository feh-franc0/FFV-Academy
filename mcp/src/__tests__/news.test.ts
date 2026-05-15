/**
 * Testes de execução real (filesystem) das 4 tools de news:
 * list_news, create_news, update_news, delete_news.
 *
 * Cada teste obtém um arquivo JSON temporário isolado via withTempJson.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFile } from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerNewsTools } from "../tools/news.js";
import type { FFVClient } from "../client.js";
import { withTempJson, type TempJsonHandle } from "./helpers/tmpfs.js";
import newsFixture from "./fixtures/news.fixture.json" with { type: "json" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

type TR = { isError?: boolean; content: Array<{ type: string; text: string }> };

async function ct(client: Client, name: string, args: Record<string, unknown> = {}): Promise<TR> {
  const raw = await client.callTool({ name, arguments: args });
  return raw as unknown as TR;
}

function text(r: TR): string {
  const item = r.content[0];
  if (!item) throw new Error("callTool returned empty content");
  return item.text;
}

const NOOP_CLIENT = {} as unknown as FFVClient;

async function makePair(newsJsonPath: string) {
  const server = new McpServer({ name: "test", version: "0.0.0" });
  registerNewsTools(server, NOOP_CLIENT, {
    baseUrl: "http://localhost",
    adminToken: null,
    httpTimeoutMs: 5_000,
    newsJsonPath,
    catalogJsonPath: "/dev/null",
  });
  const [ct1, st1] = InMemoryTransport.createLinkedPair();
  const sdk = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([server.connect(st1), sdk.connect(ct1)]);
  return sdk;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let handle: TempJsonHandle;

beforeEach(async () => {
  vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-14T00:00:00.000Z"));
  // Deep clone para isolar mutações entre testes.
  handle = await withTempJson(JSON.parse(JSON.stringify(newsFixture)));
});

afterEach(async () => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  await handle.cleanup();
});

// ─── list_news ────────────────────────────────────────────────────────────────

describe("list_news", () => {
  it("happy path retorna total e items", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "list_news");
    expect(r.isError).toBeFalsy();
    const data = JSON.parse(text(r));
    expect(data.total).toBe(3);
    expect(data.updatedAt).toBe("2026-05-10");
    expect(data.items).toHaveLength(3);
  });

  it("filtra por category", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "list_news", { category: "regulation" });
    const data = JSON.parse(text(r));
    expect(data.total).toBe(1);
    expect(data.items[0].id).toBe("eu-ai-act-fase2");
  });

  it("filtra por source", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "list_news", { source: "OpenAI" });
    const data = JSON.parse(text(r));
    expect(data.total).toBe(1);
  });

  it("filtra hot_only=true", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "list_news", { hot_only: true });
    const data = JSON.parse(text(r));
    expect(data.total).toBe(1);
    expect(data.items[0].hot).toBe(true);
  });
});

// ─── create_news ──────────────────────────────────────────────────────────────

describe("create_news", () => {
  const baseInput = {
    id: "google-gemini-3",
    title: "Google libera Gemini 3 com foco em agentes",
    summary: "Nova versão do Gemini chega otimizada para uso agêntico em produção com tool use nativo.",
    source: "Google",
    source_url: "https://blog.google/technology/ai/gemini-3",
    published_at: "2026-05-12",
    category: "launch" as const,
  };

  it("happy path adiciona item no topo e atualiza updatedAt", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "create_news", baseInput);
    expect(r.isError).toBeFalsy();
    const data = JSON.parse(text(r));
    expect(data.created).toBe("google-gemini-3");
    expect(data.total).toBe(4);
    expect(data.updatedAt).toBe("2026-05-14");

    const raw = JSON.parse(await readFile(handle.path, "utf-8"));
    expect(raw.items[0].id).toBe("google-gemini-3");
    expect(raw.updatedAt).toBe("2026-05-14");
  });

  it("id duplicado lança erro", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "create_news", { ...baseInput, id: "openai-gpt5-mini" });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain("já existe");
  });

  it("hot omitido NÃO grava campo hot no item", async () => {
    const sdk = await makePair(handle.path);
    await ct(sdk, "create_news", baseInput);
    const raw = JSON.parse(await readFile(handle.path, "utf-8"));
    const item = raw.items.find((i: { id: string }) => i.id === "google-gemini-3");
    expect("hot" in item).toBe(false);
  });

  it("URL não-https é rejeitada pelo Zod", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "create_news", { ...baseInput, source_url: "http://blog.google/x" });
    expect(r.isError).toBe(true);
  });

  it("published_at malformatado é rejeitado pelo Zod", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "create_news", { ...baseInput, published_at: "12/05/2026" });
    expect(r.isError).toBe(true);
  });
});

// ─── update_news ──────────────────────────────────────────────────────────────

describe("update_news", () => {
  it("id não encontrado retorna isError", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "update_news", { id: "id-fantasma", title: "Qualquer Coisa Aqui" });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain("não encontrada");
  });

  it("update parcial preserva campos não fornecidos", async () => {
    const sdk = await makePair(handle.path);
    await ct(sdk, "update_news", {
      id: "openai-gpt5-mini",
      title: "OpenAI atualiza GPT-5 Mini com nova precificação",
    });
    const raw = JSON.parse(await readFile(handle.path, "utf-8"));
    const item = raw.items.find((i: { id: string }) => i.id === "openai-gpt5-mini");
    expect(item.title).toBe("OpenAI atualiza GPT-5 Mini com nova precificação");
    // Campos preservados:
    expect(item.source).toBe("OpenAI");
    expect(item.category).toBe("launch");
    expect(item.publishedAt).toBe("2026-05-08");
  });

  it("updatedAt do feed é atualizado para today()", async () => {
    const sdk = await makePair(handle.path);
    await ct(sdk, "update_news", { id: "openai-gpt5-mini", hot: true });
    const raw = JSON.parse(await readFile(handle.path, "utf-8"));
    expect(raw.updatedAt).toBe("2026-05-14");
    const item = raw.items.find((i: { id: string }) => i.id === "openai-gpt5-mini");
    expect(item.hot).toBe(true);
  });
});

// ─── delete_news ──────────────────────────────────────────────────────────────

describe("delete_news", () => {
  it("confirm_id divergente bloqueia e não altera arquivo", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "delete_news", { id: "openai-gpt5-mini", confirm_id: "outro-id" });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain("Confirmação inválida");
    const raw = JSON.parse(await readFile(handle.path, "utf-8"));
    expect(raw.items).toHaveLength(3);
  });

  it("happy path remove item e atualiza updatedAt", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "delete_news", { id: "openai-gpt5-mini", confirm_id: "openai-gpt5-mini" });
    expect(r.isError).toBeFalsy();
    const data = JSON.parse(text(r));
    expect(data.deleted).toBe("openai-gpt5-mini");
    expect(data.remaining).toBe(2);
    const raw = JSON.parse(await readFile(handle.path, "utf-8"));
    expect(raw.items).toHaveLength(2);
    expect(raw.items.some((i: { id: string }) => i.id === "openai-gpt5-mini")).toBe(false);
    expect(raw.updatedAt).toBe("2026-05-14");
  });

  it("id inexistente retorna erro", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "delete_news", { id: "id-fantasma", confirm_id: "id-fantasma" });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain("não encontrada");
  });
});
