import { readFile, writeFile } from "fs/promises";
import { ApiError, type Article, type UpdateArticleInput } from "./client.js";

// ─── Logger ────────────────────────────────────────────────────────────────────

export function log(entry: Record<string, unknown>): void {
  process.stderr.write(JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n");
}

// ─── Result helpers ────────────────────────────────────────────────────────────

export type TextResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export const json = (value: unknown): TextResult => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
});

export const fail = (message: string): TextResult => ({
  content: [{ type: "text", text: message }],
  isError: true,
});

export async function safe<T>(tool: string, fn: () => Promise<T>): Promise<TextResult> {
  const start = Date.now();
  try {
    const result = await fn();
    log({ tool, status: "ok", ms: Date.now() - start });
    return json(result);
  } catch (err) {
    const ms = Date.now() - start;
    if (err instanceof ApiError) {
      log({ tool, status: "error", httpStatus: err.status, ms });
      return fail(`API error ${err.status}: ${err.message}\n${JSON.stringify(err.body, null, 2)}`);
    }
    if (err instanceof Error) {
      log({ tool, status: "error", error: err.message, ms });
      return fail(err.message);
    }
    log({ tool, status: "error", error: String(err), ms });
    return fail(String(err));
  }
}

// ─── JSON file helpers ────────────────────────────────────────────────────────

export async function readJson<T>(path: string): Promise<T> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw) as T;
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, JSON.stringify(value, null, 2) + "\n", "utf-8");
}

export function today(): string {
  return new Date().toISOString().split("T")[0]!;
}

// ─── Diff ─────────────────────────────────────────────────────────────────────

type PatchFields = Partial<Pick<UpdateArticleInput, "title" | "content_md" | "difficulty" | "xp" | "read_time" | "order" | "published">>;

export function buildDiff(current: Article, patches: PatchFields) {
  const fields = Object.keys(patches) as Array<keyof PatchFields>;
  if (fields.length === 0) return { fields_inspected: 0, fields_changed: 0, no_changes: true, diff: [] };

  const diff = fields.map((field) => {
    const before = current[field as keyof typeof current];
    const after = patches[field];
    const changed = JSON.stringify(before) !== JSON.stringify(after);

    if (field === "content_md" && typeof after === "string") {
      const beforeLen = typeof before === "string" ? before.length : 0;
      return {
        field,
        changed,
        before_length: beforeLen,
        after_length: after.length,
        delta_chars: after.length - beforeLen,
        note: "Conteúdo omitido no preview — use read_article para ver o atual.",
      };
    }
    return { field, changed, before, after };
  });

  const changedFields = diff.filter((d) => d.changed).map((d) => d.field);
  return {
    fields_inspected: fields.length,
    fields_changed: changedFields.length,
    no_changes: changedFields.length === 0,
    diff,
  };
}
