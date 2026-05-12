import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface Config {
  baseUrl: string;
  adminToken: string | null;
  httpTimeoutMs: number;
  newsJsonPath: string;
  catalogJsonPath: string;
}

export function loadConfig(): Config {
  const baseUrl = (process.env.FFV_API_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");
  const adminToken = process.env.FFV_ADMIN_TOKEN?.trim() || null;
  const timeoutRaw = process.env.FFV_HTTP_TIMEOUT_MS;
  const httpTimeoutMs = timeoutRaw ? Number.parseInt(timeoutRaw, 10) : 15_000;

  if (Number.isNaN(httpTimeoutMs) || httpTimeoutMs <= 0) {
    throw new Error(`FFV_HTTP_TIMEOUT_MS inválido: ${timeoutRaw}`);
  }

  // Defaults: resolve a partir deste arquivo compilado (dist/config.js).
  // dist/ → mcp/ → raiz do monorepo → subpastas frontend/backend.
  const repoRoot = resolve(__dirname, "../..");

  const newsJsonPath =
    process.env.FFV_NEWS_JSON_PATH ??
    resolve(repoRoot, "frontend/src/data/news.json");

  const catalogJsonPath =
    process.env.FFV_CATALOG_JSON_PATH ??
    resolve(repoRoot, "backend/internal/infrastructure/catalog/catalog.json");

  return { baseUrl, adminToken, httpTimeoutMs, newsJsonPath, catalogJsonPath };
}
