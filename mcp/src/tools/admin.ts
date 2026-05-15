import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FFVClient } from "../client.js";
import type { Config } from "../config.js";
import { safe } from "../util.js";

export function registerAdminTools(server: McpServer, client: FFVClient, _cfg: Config): void {
  // ── Leaderboard ────────────────────────────────────────────────────────────

  server.registerTool(
    "get_leaderboard",
    {
      title: "Ranking semanal",
      description:
        "Retorna o ranking semanal de XP da plataforma (top 50). Requer FFV_ADMIN_TOKEN. " +
        "A semana começa na segunda-feira UTC. " +
        "Use para acompanhar engajamento e identificar alunos mais ativos.",
      inputSchema: {},
    },
    async () => safe("get_leaderboard", () => client.getLeaderboard()),
  );

  // ── Admin ──────────────────────────────────────────────────────────────────

  server.registerTool(
    "get_admin_stats",
    {
      title: "Estatísticas do portal",
      description:
        "Retorna métricas gerais do sistema FFV Academy. Requer FFV_ADMIN_TOKEN. " +
        "Use para obter uma visão geral do estado operacional da plataforma.",
      inputSchema: {},
    },
    async () => safe("get_admin_stats", () => client.getAdminStats()),
  );

  server.registerTool(
    "get_audit_log",
    {
      title: "Log de auditoria",
      description:
        "Lista o log de mutations administrativas (POST/PATCH/PUT/DELETE com 2xx). Requer FFV_ADMIN_TOKEN. " +
        "Filtrável por usuário, ação, e intervalo de datas. " +
        "Use para auditar quem criou, editou ou deletou conteúdo e quando.",
      inputSchema: {
        limit: z.number().int().min(1).max(500).optional().describe("Máximo de registros (default 50, máx 500)."),
        offset: z.number().int().min(0).optional().describe("Offset para paginação (default 0)."),
        user_id: z.string().optional().describe("Filtrar por ID de usuário específico."),
        action: z.string().optional().describe("Filtrar por prefixo de ação (ex: 'POST /api/v1/admin/curriculum')."),
        from: z.string().optional().describe("Data de início ISO 8601 (ex: '2026-01-01T00:00:00Z')."),
        to: z.string().optional().describe("Data de fim ISO 8601 (ex: '2026-12-31T23:59:59Z')."),
      },
    },
    async ({ limit, offset, user_id, action, from, to }) =>
      safe("get_audit_log", () =>
        client.getAuditLog({ limit, offset, userId: user_id, action, from, to }),
      ),
  );
}
