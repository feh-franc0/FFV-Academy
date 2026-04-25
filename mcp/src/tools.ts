import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiError, type ArticleListItem, type FFVClient } from "./client.js";

type TextResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

const json = (value: unknown): TextResult => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
});

const fail = (message: string): TextResult => ({
  content: [{ type: "text", text: message }],
  isError: true,
});

async function safe<T>(fn: () => Promise<T>): Promise<TextResult> {
  try {
    const result = await fn();
    return json(result);
  } catch (err) {
    if (err instanceof ApiError) {
      return fail(`API error ${err.status}: ${err.message}\n${JSON.stringify(err.body, null, 2)}`);
    }
    if (err instanceof Error) return fail(err.message);
    return fail(String(err));
  }
}

export function registerTools(server: McpServer, client: FFVClient): void {
  // ─── Leitura ────────────────────────────────────────────────────────────────

  server.registerTool(
    "list_articles",
    {
      title: "Listar artigos",
      description:
        "Lista artigos do currículo da FFV Academy, opcionalmente filtrados por trilha. " +
        "Retorna metadados (sem conteúdo). Útil para inventário e descobrir o que já existe.",
      inputSchema: {
        trail_id: z.string().optional().describe("ID da trilha para filtrar (ex: 'ia-fundamentos')."),
        limit: z.number().int().min(1).max(100).optional().describe("Máximo de artigos (default 20)."),
        offset: z.number().int().min(0).optional().describe("Offset para paginação (default 0)."),
      },
    },
    async ({ trail_id, limit, offset }) =>
      safe(() => client.listArticles({ trailId: trail_id, limit, offset })),
  );

  server.registerTool(
    "read_article",
    {
      title: "Ler artigo",
      description:
        "Retorna um artigo completo (com content_md em Markdown) pelo slug. " +
        "Use antes de editar para entender o conteúdo atual ou para calibrar tom ao criar um novo.",
      inputSchema: {
        slug: z.string().min(1).describe("Slug do artigo (ex: 'prompt-caching-anthropic')."),
      },
    },
    async ({ slug }) => safe(() => client.getArticle(slug)),
  );

  server.registerTool(
    "search_articles",
    {
      title: "Buscar artigos",
      description:
        "Busca artigos por similaridade no título. Use ANTES de criar um novo artigo para " +
        "evitar duplicação. Não busca no corpo — apenas em títulos.",
      inputSchema: {
        query: z.string().min(1).describe("Termo de busca."),
      },
    },
    async ({ query }) => safe(() => client.searchArticles(query)),
  );

  server.registerTool(
    "find_duplicates",
    {
      title: "Procurar duplicatas",
      description:
        "Busca artigos sobre um tópico e agrupa por trilha, destacando potenciais duplicatas " +
        "ou sobreposição. Útil antes de criar conteúdo novo.",
      inputSchema: {
        topic: z.string().min(2).describe("Tópico a investigar (ex: 'prompt caching')."),
      },
    },
    async ({ topic }) =>
      safe(async () => {
        const { data } = await client.searchArticles(topic);
        const byTrail = new Map<string, ArticleListItem[]>();
        for (const a of data) {
          const list = byTrail.get(a.trail_id) ?? [];
          list.push(a);
          byTrail.set(a.trail_id, list);
        }
        const groups = [...byTrail.entries()].map(([trail, items]) => ({
          trail_id: trail,
          count: items.length,
          articles: items.map((a) => ({ slug: a.slug, title: a.title, hub_id: a.hub_id })),
        }));
        return {
          topic,
          total_matches: data.length,
          trails_touched: byTrail.size,
          groups: groups.sort((a, b) => b.count - a.count),
          recommendation:
            data.length === 0
              ? "Nenhum artigo encontrado — espaço livre para criar."
              : data.length > 3
                ? "Várias correspondências — revise antes de criar para evitar duplicação."
                : "Poucas correspondências — provavelmente seguro criar conteúdo novo.",
        };
      }),
  );

  // ─── Mutação (admin) ────────────────────────────────────────────────────────

  server.registerTool(
    "create_article",
    {
      title: "Criar artigo",
      description:
        "Cria um novo artigo no currículo. Requer FFV_ADMIN_TOKEN. " +
        "Defaults aplicados pelo backend: xp=30, read_time=5 quando ausentes.",
      inputSchema: {
        slug: z
          .string()
          .min(1)
          .regex(/^[a-z0-9-]+$/, "kebab-case minúsculo (a-z, 0-9, -)")
          .describe("Slug único, kebab-case."),
        title: z.string().min(1).describe("Título do artigo."),
        trail_id: z.string().min(1).describe("ID da trilha à qual pertence."),
        hub_id: z.string().min(1).describe("ID do hub temático (ex: 'ia', 'aws')."),
        content_md: z.string().min(1).describe("Conteúdo em Markdown."),
        difficulty: z
          .enum(["beginner", "intermediate", "advanced"])
          .describe("Nível de dificuldade."),
        xp: z.number().int().min(0).optional().describe("XP concedido (default 30)."),
        read_time: z.number().int().min(1).optional().describe("Tempo estimado em min (default 5)."),
        order: z.number().int().min(0).optional().describe("Ordem dentro da trilha (default 0)."),
        published: z.boolean().optional().describe("Se já entra publicado (default false)."),
      },
    },
    async (input) => safe(() => client.createArticle(input)),
  );

  server.registerTool(
    "update_article",
    {
      title: "Atualizar artigo",
      description:
        "Atualiza um artigo existente (PATCH parcial). Requer FFV_ADMIN_TOKEN. " +
        "Apenas campos fornecidos são alterados — campos omitidos preservam o valor atual.",
      inputSchema: {
        slug: z.string().min(1).describe("Slug do artigo a atualizar."),
        title: z.string().min(1).optional(),
        content_md: z.string().min(1).optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        xp: z.number().int().min(0).optional(),
        read_time: z.number().int().min(1).optional(),
        order: z.number().int().min(0).optional(),
        published: z.boolean().optional(),
      },
    },
    async ({ slug, ...patches }) => safe(() => client.updateArticle(slug, patches)),
  );

  server.registerTool(
    "delete_article",
    {
      title: "Deletar artigo (soft)",
      description:
        "Faz soft-delete de um artigo. Requer FFV_ADMIN_TOKEN. " +
        "O artigo deixa de aparecer mas permanece no banco para auditoria.",
      inputSchema: {
        slug: z.string().min(1).describe("Slug do artigo a deletar."),
        confirm: z
          .literal(true)
          .describe("Confirmação obrigatória — passe `true` para evitar deleção acidental."),
      },
    },
    async ({ slug }) =>
      safe(async () => {
        await client.deleteArticle(slug);
        return { deleted: slug };
      }),
  );
}
