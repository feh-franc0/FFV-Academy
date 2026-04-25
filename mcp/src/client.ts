import type { Config } from "./config.js";

export interface Article {
  id: string;
  slug: string;
  title: string;
  trail_id: string;
  hub_id: string;
  content_md?: string;
  xp: number;
  read_time: number;
  difficulty: string;
  order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  trail_id: string;
  hub_id: string;
  xp: number;
  read_time: number;
  difficulty: string;
  order: number;
  published: boolean;
}

export interface ListArticlesResult {
  data: ArticleListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateArticleInput {
  slug: string;
  title: string;
  trail_id: string;
  hub_id: string;
  content_md: string;
  difficulty: string;
  xp?: number;
  read_time?: number;
  order?: number;
  published?: boolean;
}

export interface UpdateArticleInput {
  title?: string;
  content_md?: string;
  difficulty?: string;
  xp?: number;
  read_time?: number;
  order?: number;
  published?: boolean;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class FFVClient {
  constructor(private readonly cfg: Config) {}

  // Operações públicas (não requerem token).

  async listArticles(params: {
    trailId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ListArticlesResult> {
    const qs = new URLSearchParams();
    if (params.trailId) qs.set("trail_id", params.trailId);
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    if (params.offset !== undefined) qs.set("offset", String(params.offset));
    const suffix = qs.toString() ? `?${qs}` : "";
    return this.request<ListArticlesResult>("GET", `/api/v1/curriculum${suffix}`);
  }

  async getArticle(slug: string): Promise<Article> {
    return this.request<Article>("GET", `/api/v1/curriculum/${encodeURIComponent(slug)}`);
  }

  async searchArticles(query: string): Promise<{ data: ArticleListItem[] }> {
    const qs = new URLSearchParams({ q: query });
    return this.request<{ data: ArticleListItem[] }>("GET", `/api/v1/curriculum/search?${qs}`);
  }

  // Operações admin (exigem JWT com role=admin).

  async createArticle(input: CreateArticleInput): Promise<{ slug: string }> {
    return this.requestAuth<{ slug: string }>("POST", "/api/v1/admin/curriculum", input);
  }

  async updateArticle(slug: string, input: UpdateArticleInput): Promise<Article> {
    return this.requestAuth<Article>(
      "PATCH",
      `/api/v1/admin/curriculum/${encodeURIComponent(slug)}`,
      input,
    );
  }

  async deleteArticle(slug: string): Promise<void> {
    await this.requestAuth<void>(
      "DELETE",
      `/api/v1/admin/curriculum/${encodeURIComponent(slug)}`,
      undefined,
      true,
    );
  }

  // Núcleo HTTP.

  private async request<T>(method: string, path: string): Promise<T> {
    return this.send<T>(method, path, undefined, false);
  }

  private async requestAuth<T>(
    method: string,
    path: string,
    body: unknown,
    expectEmpty = false,
  ): Promise<T> {
    if (!this.cfg.adminToken) {
      throw new Error(
        "Esta operação exige FFV_ADMIN_TOKEN configurado. " +
          "Defina a variável de ambiente com um JWT de role=admin.",
      );
    }
    return this.send<T>(method, path, body, expectEmpty);
  }

  private async send<T>(
    method: string,
    path: string,
    body: unknown,
    expectEmpty: boolean,
  ): Promise<T> {
    const url = `${this.cfg.baseUrl}${path}`;
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), this.cfg.httpTimeoutMs);

    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.cfg.adminToken) {
      headers.Authorization = `Bearer ${this.cfg.adminToken}`;
    }
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: ac.signal,
      });

      const text = await res.text();
      const parsed: unknown = text ? safeJson(text) : null;

      if (!res.ok) {
        const detail = isProblem(parsed) ? `${parsed.title}: ${parsed.detail ?? ""}` : text;
        throw new ApiError(res.status, parsed, `${method} ${path} → ${res.status} ${detail}`);
      }

      if (expectEmpty) return undefined as T;
      return parsed as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`Timeout (${this.cfg.httpTimeoutMs}ms) em ${method} ${path}`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

interface Problem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
}

function isProblem(v: unknown): v is Problem {
  return typeof v === "object" && v !== null && "title" in v;
}
