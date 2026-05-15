/**
 * Testes de execução real (filesystem) das 4 tools de questões:
 * list_questions, create_question, update_question, delete_question.
 *
 * Mocka apenas o que os handlers não usam (FFVClient) — o catalog.json é real (tmp).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFile } from "fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { registerSimuladosTools } from "../tools/simulados.js";
import type { FFVClient } from "../client.js";
import { withTempJson, type TempJsonHandle } from "./helpers/tmpfs.js";
import catalogFixture from "./fixtures/catalog.fixture.json" with { type: "json" };

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

async function makePair(catalogJsonPath: string) {
  const server = new McpServer({ name: "test", version: "0.0.0" });
  registerSimuladosTools(server, NOOP_CLIENT, {
    baseUrl: "http://localhost",
    adminToken: null,
    httpTimeoutMs: 5_000,
    newsJsonPath: "/dev/null",
    catalogJsonPath,
  });
  const [ct1, st1] = InMemoryTransport.createLinkedPair();
  const sdk = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([server.connect(st1), sdk.connect(ct1)]);
  return sdk;
}

function fiveOptions() {
  return [
    { id: "A", text: "Opção A correta" },
    { id: "B", text: "Opção B errada" },
    { id: "C", text: "Opção C errada" },
    { id: "D", text: "Opção D errada" },
    { id: "E", text: "Opção E errada" },
  ];
}

// ─── Setup ────────────────────────────────────────────────────────────────────

let handle: TempJsonHandle;

beforeEach(async () => {
  vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  handle = await withTempJson(JSON.parse(JSON.stringify(catalogFixture)));
});

afterEach(async () => {
  vi.restoreAllMocks();
  await handle.cleanup();
});

// ─── list_questions ───────────────────────────────────────────────────────────

describe("list_questions", () => {
  it("filtra por simulado_id e retorna stems truncadas", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "list_questions", { simulado_id: "aws-clf" });
    expect(r.isError).toBeFalsy();
    const data = JSON.parse(text(r));
    expect(data.simulado_id).toBe("aws-clf");
    expect(data.total).toBe(3);
    expect(data.questions).toHaveLength(3);
    expect(data.questions[0]).toHaveProperty("stem");
  });

  it("simulado inexistente retorna erro", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "list_questions", { simulado_id: "nao-existe" });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain("não encontrado");
  });
});

// ─── create_question ──────────────────────────────────────────────────────────

describe("create_question", () => {
  const base = {
    simulado_id: "aws-clf",
    id: "clf-q4",
    stem: "Qual serviço fornece DNS gerenciado pela AWS?",
    options: fiveOptions(),
    correct_id: "A" as const,
    explanation: "Route 53 é o serviço de DNS gerenciado da AWS.",
    topic: "Networking",
    difficulty: "easy" as const,
  };

  it("happy path recalcula questionCount", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "create_question", base);
    expect(r.isError).toBeFalsy();
    const data = JSON.parse(text(r));
    expect(data.created).toBe("clf-q4");
    expect(data.total_questions).toBe(4);

    const raw = JSON.parse(await readFile(handle.path, "utf-8"));
    const sim = raw.find((s: { id: string }) => s.id === "aws-clf");
    expect(sim.questionCount).toBe(4);
    expect(sim.questions).toHaveLength(4);
  });

  it("options com 4 elementos é rejeitado pelo Zod", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "create_question", {
      ...base,
      options: fiveOptions().slice(0, 4),
    });
    expect(r.isError).toBe(true);
  });

  it("options com 6 elementos é rejeitado pelo Zod", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "create_question", {
      ...base,
      options: [...fiveOptions(), { id: "A", text: "extra" }],
    });
    expect(r.isError).toBe(true);
  });

  it("correct_id fora de A-E é rejeitado pelo Zod", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "create_question", { ...base, correct_id: "F" });
    expect(r.isError).toBe(true);
  });
});

// ─── update_question ──────────────────────────────────────────────────────────

describe("update_question", () => {
  it("atualiza correct_id (mapeia para correctId no arquivo)", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "update_question", {
      simulado_id: "aws-clf",
      question_id: "clf-q1",
      correct_id: "E",
    });
    expect(r.isError).toBeFalsy();

    const raw = JSON.parse(await readFile(handle.path, "utf-8"));
    const sim = raw.find((s: { id: string }) => s.id === "aws-clf");
    const q = sim.questions.find((q: { id: string }) => q.id === "clf-q1");
    expect(q.correctId).toBe("E");
  });
});

// ─── delete_question ──────────────────────────────────────────────────────────

describe("delete_question", () => {
  it("confirm_id divergente bloqueia", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "delete_question", {
      simulado_id: "aws-clf",
      question_id: "clf-q1",
      confirm_id: "outro",
    });
    expect(r.isError).toBe(true);
    expect(text(r)).toContain("Confirmação inválida");
    const raw = JSON.parse(await readFile(handle.path, "utf-8"));
    const sim = raw.find((s: { id: string }) => s.id === "aws-clf");
    expect(sim.questions).toHaveLength(3);
  });

  it("happy path decrementa questionCount", async () => {
    const sdk = await makePair(handle.path);
    const r = await ct(sdk, "delete_question", {
      simulado_id: "aws-clf",
      question_id: "clf-q1",
      confirm_id: "clf-q1",
    });
    expect(r.isError).toBeFalsy();
    const data = JSON.parse(text(r));
    expect(data.deleted).toBe("clf-q1");
    expect(data.remaining_questions).toBe(2);

    const raw = JSON.parse(await readFile(handle.path, "utf-8"));
    const sim = raw.find((s: { id: string }) => s.id === "aws-clf");
    expect(sim.questionCount).toBe(2);
    expect(sim.questions.some((q: { id: string }) => q.id === "clf-q1")).toBe(false);
  });
});
