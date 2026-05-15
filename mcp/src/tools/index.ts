import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FFVClient } from "../client.js";
import type { Config } from "../config.js";
import { registerCurriculumTools } from "./curriculum.js";
import { registerSimuladosTools } from "./simulados.js";
import { registerAdminTools } from "./admin.js";
import { registerNewsTools } from "./news.js";

export { HUBS_STATIC, TRAILS_STATIC, getTrails, groupByTrail } from "./curriculum.js";

export function registerAllTools(server: McpServer, client: FFVClient, cfg: Config): void {
  registerCurriculumTools(server, client, cfg);
  registerSimuladosTools(server, client, cfg);
  registerAdminTools(server, client, cfg);
  registerNewsTools(server, client, cfg);
}
