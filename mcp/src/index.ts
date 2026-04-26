#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadConfig } from "./config.js";
import { FFVClient } from "./client.js";
import { registerTools } from "./tools.js";

async function main(): Promise<void> {
  const cfg = loadConfig();
  const client = new FFVClient(cfg);

  const server = new McpServer({
    name: "ffv-academy-mcp",
    version: "0.2.0",
  });

  registerTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // stderr é seguro com stdio transport — stdout é reservado pro protocolo.
  process.stderr.write(
    `[ffv-mcp] conectado. base=${cfg.baseUrl} admin=${cfg.adminToken ? "yes" : "no"}\n`,
  );
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.stack ?? err.message : String(err);
  process.stderr.write(`[ffv-mcp] fatal: ${msg}\n`);
  process.exit(1);
});
