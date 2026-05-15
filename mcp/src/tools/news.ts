import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FFVClient } from "../client.js";
import type { Config } from "../config.js";
import { safe, readJson, writeJson, today } from "../util.js";

const NEWS_CATEGORIES = ["launch", "research", "business", "safety", "regulation"] as const;

export function registerNewsTools(server: McpServer, _client: FFVClient, cfg: Config): void {
  server.registerTool(
    "list_news",
    {
      title: "Listar notícias",
      description:
        "Lista todas as notícias do portal FFV Academy (lê news.json). " +
        "Filtrável por categoria ou fonte. Use antes de criar para evitar duplicatas.",
      inputSchema: {
        category: z
          .enum(NEWS_CATEGORIES)
          .optional()
          .describe("Filtrar por categoria: launch, research, business, safety, regulation."),
        source: z.string().optional().describe("Filtrar por fonte (ex: 'Anthropic', 'OpenAI')."),
        hot_only: z.boolean().optional().describe("Retornar apenas notícias marcadas como hot."),
      },
    },
    async ({ category, source, hot_only }) =>
      safe("list_news", async () => {
        const feed = await readJson<{ updatedAt: string; items: unknown[] }>(cfg.newsJsonPath);
        type Item = { category: string; source: string; hot?: boolean };
        let items = feed.items as Item[];
        if (category) items = items.filter((i) => i.category === category);
        if (source) items = items.filter((i) => i.source === source);
        if (hot_only) items = items.filter((i) => i.hot === true);
        return { total: items.length, updatedAt: feed.updatedAt, items };
      }),
  );

  server.registerTool(
    "create_news",
    {
      title: "Criar notícia",
      description:
        "Adiciona uma nova notícia ao news.json do frontend FFV Academy. " +
        "Requer rebuild do frontend para publicar. " +
        "Use list_news antes para checar se já existe notícia similar.",
      inputSchema: {
        id: z
          .string()
          .regex(/^[a-z0-9-]{3,80}$/)
          .describe("ID único kebab-case (ex: 'openai-gpt5-launch')."),
        title: z.string().min(10).max(140).describe("Título da notícia (10-140 chars)."),
        summary: z
          .string()
          .min(20)
          .max(320)
          .describe("Resumo editorial em português (20-320 chars)."),
        source: z.string().min(2).max(40).describe("Nome da fonte (ex: 'Anthropic', 'OpenAI')."),
        source_url: z
          .string()
          .url()
          .refine((u) => u.startsWith("https://"), "URL deve ser https://")
          .describe("URL de origem da notícia (https://)."),
        published_at: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe("Data de publicação YYYY-MM-DD."),
        category: z
          .enum(NEWS_CATEGORIES)
          .describe("Categoria: launch, research, business, safety, regulation."),
        hot: z.boolean().optional().describe("Marcar como destaque (aparece em primeiro)."),
        tags: z
          .array(z.string().min(2).max(32))
          .max(6)
          .optional()
          .describe("Tags kebab-case (máx 6)."),
      },
    },
    async ({ id, title, summary, source, source_url, published_at, category, hot, tags }) =>
      safe("create_news", async () => {
        const feed = await readJson<{ updatedAt: string; items: Record<string, unknown>[] }>(
          cfg.newsJsonPath,
        );
        if (feed.items.some((i) => i["id"] === id)) {
          throw new Error(`Notícia com id="${id}" já existe. Use update_news para editar.`);
        }
        const item: Record<string, unknown> = {
          id,
          title,
          summary,
          source,
          sourceUrl: source_url,
          publishedAt: published_at,
          category,
        };
        if (hot !== undefined) item["hot"] = hot;
        if (tags?.length) item["tags"] = tags;
        feed.items.unshift(item); // mais recente primeiro
        feed.updatedAt = today();
        await writeJson(cfg.newsJsonPath, feed);
        return { created: id, total: feed.items.length, updatedAt: feed.updatedAt };
      }),
  );

  server.registerTool(
    "update_news",
    {
      title: "Atualizar notícia",
      description:
        "Edita uma notícia existente no news.json pelo ID. Apenas campos fornecidos são alterados. " +
        "Requer rebuild do frontend para publicar.",
      inputSchema: {
        id: z.string().min(1).describe("ID da notícia a atualizar."),
        title: z.string().min(10).max(140).optional(),
        summary: z.string().min(20).max(320).optional(),
        source: z.string().min(2).max(40).optional(),
        source_url: z
          .string()
          .url()
          .refine((u) => u.startsWith("https://"))
          .optional(),
        published_at: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        category: z.enum(NEWS_CATEGORIES).optional(),
        hot: z.boolean().optional(),
        tags: z.array(z.string().min(2).max(32)).max(6).optional(),
      },
    },
    async ({ id, title, summary, source, source_url, published_at, category, hot, tags }) =>
      safe("update_news", async () => {
        const feed = await readJson<{ updatedAt: string; items: Record<string, unknown>[] }>(
          cfg.newsJsonPath,
        );
        const idx = feed.items.findIndex((i) => i["id"] === id);
        if (idx === -1) throw new Error(`Notícia id="${id}" não encontrada.`);
        const item = feed.items[idx]!;
        if (title !== undefined) item["title"] = title;
        if (summary !== undefined) item["summary"] = summary;
        if (source !== undefined) item["source"] = source;
        if (source_url !== undefined) item["sourceUrl"] = source_url;
        if (published_at !== undefined) item["publishedAt"] = published_at;
        if (category !== undefined) item["category"] = category;
        if (hot !== undefined) item["hot"] = hot;
        if (tags !== undefined) item["tags"] = tags;
        feed.updatedAt = today();
        await writeJson(cfg.newsJsonPath, feed);
        return { updated: id, updatedAt: feed.updatedAt };
      }),
  );

  server.registerTool(
    "delete_news",
    {
      title: "Deletar notícia",
      description:
        "Remove uma notícia do news.json pelo ID. Operação irreversível via MCP. " +
        "Requer rebuild do frontend para efeito.",
      inputSchema: {
        id: z.string().min(1).describe("ID da notícia a remover."),
        confirm_id: z
          .string()
          .min(1)
          .describe("Repita o ID exato para confirmar. Deve ser igual ao campo id."),
      },
    },
    async ({ id, confirm_id }) =>
      safe("delete_news", async () => {
        if (id !== confirm_id) {
          throw new Error(
            `Confirmação inválida: id="${id}" mas confirm_id="${confirm_id}". ` +
              `Os dois campos devem ser idênticos.`,
          );
        }
        const feed = await readJson<{ updatedAt: string; items: Record<string, unknown>[] }>(
          cfg.newsJsonPath,
        );
        const before = feed.items.length;
        feed.items = feed.items.filter((i) => i["id"] !== id);
        if (feed.items.length === before) throw new Error(`Notícia id="${id}" não encontrada.`);
        feed.updatedAt = today();
        await writeJson(cfg.newsJsonPath, feed);
        return { deleted: id, remaining: feed.items.length };
      }),
  );
}
