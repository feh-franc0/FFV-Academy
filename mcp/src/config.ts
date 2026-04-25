export interface Config {
  baseUrl: string;
  adminToken: string | null;
  httpTimeoutMs: number;
}

export function loadConfig(): Config {
  const baseUrl = (process.env.FFV_API_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");
  const adminToken = process.env.FFV_ADMIN_TOKEN?.trim() || null;
  const timeoutRaw = process.env.FFV_HTTP_TIMEOUT_MS;
  const httpTimeoutMs = timeoutRaw ? Number.parseInt(timeoutRaw, 10) : 15_000;

  if (Number.isNaN(httpTimeoutMs) || httpTimeoutMs <= 0) {
    throw new Error(`FFV_HTTP_TIMEOUT_MS inválido: ${timeoutRaw}`);
  }

  return { baseUrl, adminToken, httpTimeoutMs };
}
