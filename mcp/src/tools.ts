import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ApiError, type Article, type ArticleListItem, type Difficulty, type FFVClient, type UpdateArticleInput } from "./client.js";

// ─── Logger ────────────────────────────────────────────────────────────────────

function log(entry: Record<string, unknown>): void {
  process.stderr.write(JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

async function safe<T>(tool: string, fn: () => Promise<T>): Promise<TextResult> {
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

// ─── Taxonomia estática ───────────────────────────────────────────────────────
// Sincronizada com frontend/src/lib/curriculum.ts — atualizar quando o currículo mudar.

const HUBS_STATIC = [
  {
    id: "hub-ia",
    slug: "ia",
    name: "Inteligência Artificial",
    trailIds: ["trail1", "trail2", "trail3", "trail9", "trail25", "trail26", "trail29", "trail30", "trail50", "trail51", "trail55"],
  },
  {
    id: "hub-aws",
    slug: "aws",
    name: "AWS Cloud",
    trailIds: ["trail4", "trail23", "trail5", "trail27", "trail28"],
  },
  {
    id: "hub-engenharia",
    slug: "engenharia",
    name: "Engenharia de Software",
    trailIds: ["trail7", "trail8", "trail21", "trail22", "trail33", "trail34", "trail10", "trail11", "trail32", "trail40", "trail52", "trail53", "trail58", "trail59", "trail60", "trail61", "trail62", "trail63", "trail64", "trail65", "trail66"],
  },
  {
    id: "hub-claude-anthropic",
    slug: "claude-anthropic",
    name: "Claude & Anthropic",
    trailIds: ["trail13", "trail17", "trail18"],
  },
  {
    id: "hub-fundamentos",
    slug: "fundamentos",
    name: "Fundamentos Técnicos",
    trailIds: ["trail12", "trail14", "trail15", "trail16"],
  },
  {
    id: "hub-programacao",
    slug: "programacao",
    name: "Programação & Algoritmos",
    trailIds: ["trail19", "trail20", "trail36", "trail43", "trail44", "trail45", "trail46", "trail47", "trail49", "trail48"],
  },
  {
    id: "hub-dados",
    slug: "dados",
    name: "Dados & Analytics Engineering",
    trailIds: ["trail38", "trail24", "trail54"],
  },
  {
    id: "hub-construcao",
    slug: "construcao",
    name: "Construção & Clientes",
    trailIds: ["trail31", "trail35", "trail37", "trail42", "trail56", "trail57"],
  },
] as const;

const TRAILS_STATIC = [
  { id: "trail1",  hubId: "hub-ia",              name: "Fundamentos da IA" },
  { id: "trail2",  hubId: "hub-ia",              name: "IA Além do LLM" },
  { id: "trail3",  hubId: "hub-ia",              name: "Ferramentas de IA para Código" },
  { id: "trail4",  hubId: "hub-aws",             name: "AWS Cloud Practitioner" },
  { id: "trail5",  hubId: "hub-aws",             name: "AWS Solutions Architect Associate" },
  { id: "trail7",  hubId: "hub-engenharia",      name: "DevOps & Containers" },
  { id: "trail8",  hubId: "hub-engenharia",      name: "Engenharia de Software Moderna" },
  { id: "trail9",  hubId: "hub-ia",              name: "Engenharia AI-Native" },
  { id: "trail10", hubId: "hub-engenharia",      name: "Sistemas Distribuídos" },
  { id: "trail11", hubId: "hub-engenharia",      name: "Observabilidade & SRE" },
  { id: "trail12", hubId: "hub-fundamentos",     name: "Fundamentos Técnicos" },
  { id: "trail13", hubId: "hub-claude-anthropic",name: "Claude Code: do zero ao poder total" },
  { id: "trail14", hubId: "hub-fundamentos",     name: "SQL & Databases" },
  { id: "trail15", hubId: "hub-fundamentos",     name: "Como o Computador Funciona" },
  { id: "trail16", hubId: "hub-fundamentos",     name: "Redes & Web" },
  { id: "trail17", hubId: "hub-claude-anthropic",name: "API Claude & Agents" },
  { id: "trail18", hubId: "hub-claude-anthropic",name: "Claude Code Pro: Harness Engineering" },
  { id: "trail19", hubId: "hub-programacao",     name: "TypeScript Profissional" },
  { id: "trail20", hubId: "hub-programacao",     name: "Estruturas de Dados & Algoritmos" },
  { id: "trail21", hubId: "hub-engenharia",      name: "API Design & Contratos" },
  { id: "trail22", hubId: "hub-engenharia",      name: "Security Engineering" },
  { id: "trail23", hubId: "hub-aws",             name: "AWS Developer Associate (DVA-C02)" },
  { id: "trail24", hubId: "hub-dados",           name: "Data Engineering Moderna" },
  { id: "trail25", hubId: "hub-ia",              name: "Fine-tuning & Customização de LLMs" },
  { id: "trail26", hubId: "hub-ia",              name: "LLM Evals Profissional" },
  { id: "trail27", hubId: "hub-aws",             name: "AWS Solutions Architect Professional (SAP-C03)" },
  { id: "trail28", hubId: "hub-aws",             name: "FinOps & Cost Engineering" },
  { id: "trail29", hubId: "hub-ia",              name: "Voice, Vision & Multimodal" },
  { id: "trail30", hubId: "hub-ia",              name: "AI Safety, Red Teaming & Alinhamento" },
  { id: "trail31", hubId: "hub-construcao",      name: "Frontend Moderno — HTML, CSS, JS e React" },
  { id: "trail32", hubId: "hub-engenharia",      name: "Tech Leadership & Staff Engineering" },
  { id: "trail33", hubId: "hub-engenharia",      name: "Testing Engineering" },
  { id: "trail34", hubId: "hub-engenharia",      name: "Accessibility & Inclusive Engineering" },
  { id: "trail35", hubId: "hub-construcao",      name: "Mobile para Devs Web (React Native + Expo)" },
  { id: "trail36", hubId: "hub-programacao",     name: "Python para Engenheiros" },
  { id: "trail37", hubId: "hub-construcao",      name: "Edge Computing & Workers" },
  { id: "trail38", hubId: "hub-dados",           name: "Database Deep — Postgres Internals" },
  { id: "trail40", hubId: "hub-engenharia",      name: "DX & Developer Productivity" },
  { id: "trail42", hubId: "hub-construcao",      name: "Library & Package Authoring" },
  { id: "trail43", hubId: "hub-programacao",     name: "C Moderno: Systems Programming" },
  { id: "trail44", hubId: "hub-programacao",     name: "C++ Moderno (C++20/23)" },
  { id: "trail45", hubId: "hub-programacao",     name: "C# & .NET Moderno" },
  { id: "trail46", hubId: "hub-programacao",     name: "Java Moderno (17/21 LTS)" },
  { id: "trail47", hubId: "hub-programacao",     name: "Go Profissional" },
  { id: "trail48", hubId: "hub-programacao",     name: "Comparação de Linguagens: Escolha Certa" },
  { id: "trail49", hubId: "hub-programacao",     name: "Rust Profissional" },
  { id: "trail50", hubId: "hub-ia",              name: "Machine Learning Clássico" },
  { id: "trail51", hubId: "hub-ia",              name: "MLOps — ML em produção" },
  { id: "trail52", hubId: "hub-engenharia",      name: "System Design Interview Prep" },
  { id: "trail53", hubId: "hub-engenharia",      name: "Technical Writing & RFCs" },
  { id: "trail54", hubId: "hub-dados",           name: "NoSQL + Vector Databases" },
  { id: "trail55", hubId: "hub-ia",              name: "Computer Vision Clássico" },
  { id: "trail56", hubId: "hub-construcao",      name: "iOS Native: Swift + SwiftUI" },
  { id: "trail57", hubId: "hub-construcao",      name: "Android Native: Kotlin + Compose" },
  { id: "trail58", hubId: "hub-engenharia",      name: "GraphQL completo" },
  { id: "trail59", hubId: "hub-engenharia",      name: "Platform Engineering & IDPs" },
  { id: "trail60", hubId: "hub-engenharia",      name: "Performance Engineering" },
  { id: "trail61", hubId: "hub-engenharia",      name: "Cryptography Applied" },
  { id: "trail62", hubId: "hub-engenharia",      name: "Event Streaming / Kafka Depth" },
  { id: "trail63", hubId: "hub-engenharia",      name: "Real-time Systems" },
  { id: "trail64", hubId: "hub-engenharia",      name: "Product Engineering & Experimentation" },
  { id: "trail65", hubId: "hub-engenharia",      name: "Career Engineering" },
  { id: "trail66", hubId: "hub-engenharia",      name: "Chaos Engineering" },
] as const;

// ─── Funções puras (exportadas para testes) ───────────────────────────────────

export { HUBS_STATIC, TRAILS_STATIC };

export function getTrails(hubId?: string) {
  const trails = hubId
    ? TRAILS_STATIC.filter((t) => t.hubId === hubId)
    : TRAILS_STATIC;
  return { total: trails.length, trails };
}

export function groupByTrail(data: ArticleListItem[], topic: string) {
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
    note: "Busca por similaridade de TÍTULO apenas — não detecta duplicação de conteúdo.",
    total_matches: data.length,
    trails_touched: byTrail.size,
    groups: groups.sort((a, b) => b.count - a.count),
    recommendation:
      data.length === 0
        ? "Nenhum título similar encontrado — espaço livre para criar."
        : data.length > 3
          ? "Vários títulos similares — revise antes de criar para evitar duplicação."
          : "Poucos títulos similares — provavelmente seguro criar conteúdo novo.",
  };
}

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

// ─── Registro de tools ────────────────────────────────────────────────────────

export function registerTools(server: McpServer, client: FFVClient): void {

  // ── Taxonomia ──────────────────────────────────────────────────────────────

  server.registerTool(
    "list_hubs",
    {
      title: "Listar hubs",
      description:
        "Retorna todos os hubs temáticos do currículo FFV Academy com seus IDs e trilhas. " +
        "Use ANTES de create_article para obter o hub_id correto.",
      inputSchema: {},
    },
    async () => safe("list_hubs", async () => HUBS_STATIC),
  );

  server.registerTool(
    "list_trails",
    {
      title: "Listar trilhas",
      description:
        "Retorna todas as trilhas do currículo com seus IDs e hub de origem. " +
        "Use ANTES de create_article para obter o trail_id correto. " +
        "Filtre por hub_id para ver só as trilhas de um hub específico.",
      inputSchema: {
        hub_id: z.string().optional().describe("ID do hub para filtrar (ex: 'hub-ia'). Omita para listar todas."),
      },
    },
    async ({ hub_id }) => safe("list_trails", async () => getTrails(hub_id)),
  );

  // ── Leitura ────────────────────────────────────────────────────────────────

  server.registerTool(
    "list_articles",
    {
      title: "Listar artigos",
      description:
        "Lista artigos do currículo da FFV Academy, opcionalmente filtrados por trilha. " +
        "Retorna metadados (sem conteúdo). Útil para inventário e descobrir o que já existe.",
      inputSchema: {
        trail_id: z.string().optional().describe("ID da trilha para filtrar (ex: 'trail1')."),
        limit: z.number().int().min(1).max(100).optional().describe("Máximo de artigos (default 20)."),
        offset: z.number().int().min(0).optional().describe("Offset para paginação (default 0)."),
      },
    },
    async ({ trail_id, limit, offset }) =>
      safe("list_articles", () => client.listArticles({ trailId: trail_id, limit, offset })),
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
    async ({ slug }) => safe("read_article", () => client.getArticle(slug)),
  );

  server.registerTool(
    "search_articles",
    {
      title: "Buscar artigos por título",
      description:
        "Busca artigos por similaridade no título. Use ANTES de criar um novo artigo para " +
        "evitar duplicação. Atenção: busca apenas em títulos, não no corpo dos artigos.",
      inputSchema: {
        query: z.string().min(1).describe("Termo de busca."),
      },
    },
    async ({ query }) => safe("search_articles", () => client.searchArticles(query)),
  );

  server.registerTool(
    "find_similar_titles",
    {
      title: "Encontrar títulos similares",
      description:
        "Busca artigos com títulos similares ao tópico e agrupa por trilha. " +
        "Útil para checar sobreposição ANTES de criar conteúdo novo. " +
        "IMPORTANTE: compara apenas títulos — não detecta duplicação semântica de conteúdo.",
      inputSchema: {
        topic: z.string().min(2).describe("Tópico a investigar (ex: 'prompt caching')."),
      },
    },
    async ({ topic }) =>
      safe("find_similar_titles", async () => {
        const { data } = await client.searchArticles(topic);
        return groupByTrail(data, topic);
      }),
  );

  // ── Mutação (admin) ────────────────────────────────────────────────────────

  server.registerTool(
    "create_article",
    {
      title: "Criar artigo",
      description:
        "Cria um novo artigo no currículo. Requer FFV_ADMIN_TOKEN. " +
        "Use list_hubs e list_trails para obter hub_id e trail_id válidos antes de chamar esta tool. " +
        "Defaults aplicados pelo backend: xp=30, read_time=5 quando ausentes.",
      inputSchema: {
        slug: z
          .string()
          .min(1)
          .regex(/^[a-z0-9-]+$/, "kebab-case minúsculo (a-z, 0-9, -)")
          .describe("Slug único, kebab-case."),
        title: z.string().min(1).describe("Título do artigo."),
        trail_id: z.string().min(1).describe("ID da trilha (use list_trails para descobrir os IDs válidos)."),
        hub_id: z.string().min(1).describe("ID do hub (use list_hubs para descobrir os IDs válidos)."),
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
    async (input) => safe("create_article", () => client.createArticle(input)),
  );

  server.registerTool(
    "preview_article_update",
    {
      title: "Preview de atualização de artigo",
      description:
        "Mostra o que mudaria em um artigo ANTES de aplicar update_article. " +
        "Lê o estado atual e compara campo a campo com as mudanças propostas. " +
        "Não altera nada — use update_article após revisar o preview.",
      inputSchema: {
        slug: z.string().min(1).describe("Slug do artigo a inspecionar."),
        title: z.string().min(1).optional(),
        content_md: z.string().min(1).optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        xp: z.number().int().min(0).optional(),
        read_time: z.number().int().min(1).optional(),
        order: z.number().int().min(0).optional(),
        published: z.boolean().optional(),
      },
    },
    async ({ slug, ...patches }) =>
      safe("preview_article_update", async () => {
        const current = await client.getArticle(slug);

        if (Object.keys(patches).length === 0) {
          return { slug, warning: "Nenhum campo para alterar foi fornecido." };
        }

        const result = buildDiff(current, patches);
        const changedFields = result.diff.filter((d) => d.changed).map((d) => d.field);
        return {
          slug,
          preview_only: true,
          ...result,
          next_step:
            changedFields.length > 0
              ? `Chame update_article(slug="${slug}", ${changedFields.map((f) => `${f}=...`).join(", ")}) para aplicar.`
              : "Nenhum campo difere do valor atual — update_article não teria efeito.",
        };
      }),
  );

  server.registerTool(
    "update_article",
    {
      title: "Atualizar artigo",
      description:
        "Atualiza um artigo existente (PATCH parcial). Requer FFV_ADMIN_TOKEN. " +
        "ATENÇÃO: operação destrutiva sem rollback — use preview_article_update antes para revisar o diff. " +
        "Apenas campos fornecidos são alterados; campos omitidos preservam o valor atual.",
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
    async ({ slug, ...patches }) => safe("update_article", () => client.updateArticle(slug, patches)),
  );

  server.registerTool(
    "delete_article",
    {
      title: "Deletar artigo (soft)",
      description:
        "Faz soft-delete de um artigo. Requer FFV_ADMIN_TOKEN. " +
        "O artigo deixa de aparecer no currículo mas permanece no banco para auditoria. " +
        "ATENÇÃO: sem rollback via MCP — restauração exige acesso direto ao banco. " +
        "Para confirmar a intenção, passe o slug em AMBOS os campos slug e confirm_slug — eles devem ser idênticos.",
      inputSchema: {
        slug: z.string().min(1).describe("Slug do artigo a deletar."),
        confirm_slug: z.string().min(1).describe("Repita o slug exato para confirmar. Deve ser igual ao campo slug."),
      },
    },
    async ({ slug, confirm_slug }) =>
      safe("delete_article", async () => {
        if (slug !== confirm_slug) {
          throw new Error(
            `Confirmação inválida: slug="${slug}" mas confirm_slug="${confirm_slug}". ` +
            `Os dois campos devem ser idênticos para executar o delete.`,
          );
        }
        await client.deleteArticle(slug);
        return { deleted: slug };
      }),
  );
}
