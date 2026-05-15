import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FFVClient } from "../client.js";
import type { Config } from "../config.js";
import { safe, readJson, writeJson } from "../util.js";

const QuestionOptionSchema = z.object({
  id: z.enum(["A", "B", "C", "D", "E"]),
  text: z.string().min(1),
});

export function registerSimuladosTools(server: McpServer, client: FFVClient, cfg: Config): void {
  // ── Simulados ──────────────────────────────────────────────────────────────

  server.registerTool(
    "list_simulados",
    {
      title: "Listar simulados",
      description:
        "Retorna o catálogo completo de simulados da plataforma (endpoint público). " +
        "Inclui metadados: título, certificação, preço, número de questões, tópicos e nota mínima de aprovação. " +
        "Use para entender quais simulados já existem antes de criar conteúdo relacionado.",
      inputSchema: {},
    },
    async () => safe("list_simulados", () => client.listSimulados()),
  );

  server.registerTool(
    "read_simulado",
    {
      title: "Ler simulado",
      description:
        "Retorna os detalhes de um simulado específico pelo ID (endpoint público). " +
        "Inclui tópicos cobertos, limite de tempo e critérios de aprovação. " +
        "Use para entender o escopo de um simulado antes de criar artigos de suporte ou questões relacionadas.",
      inputSchema: {
        simulado_id: z.string().min(1).describe("ID do simulado (ex: 'aws-saa-c03')."),
      },
    },
    async ({ simulado_id }) => safe("read_simulado", () => client.getSimulado(simulado_id)),
  );

  // ── Certificados ───────────────────────────────────────────────────────────

  server.registerTool(
    "verify_certificate",
    {
      title: "Verificar certificado",
      description:
        "Verifica a autenticidade de um certificado FFV Academy pelo hash SHA-256 (endpoint público). " +
        "Retorna nome do portador, simulado, score e data de emissão. " +
        "Use para confirmar se um certificado é válido.",
      inputSchema: {
        hash: z.string().min(1).describe("Hash SHA-256 do certificado (64 caracteres hex)."),
      },
    },
    async ({ hash }) => safe("verify_certificate", () => client.verifyCertificate(hash)),
  );

  // ── Questões de simulado (backend/internal/infrastructure/catalog/catalog.json) ──

  server.registerTool(
    "list_questions",
    {
      title: "Listar questões do simulado",
      description:
        "Lista as questões de um simulado pelo simulado_id (lê catalog.json). " +
        "Use para revisar o banco de questões antes de criar novas.",
      inputSchema: {
        simulado_id: z
          .string()
          .min(1)
          .describe("ID do simulado (ex: 'aws-clf'). Use list_simulados para ver os IDs."),
        topic: z.string().optional().describe("Filtrar por tópico (ex: 'Security')."),
        difficulty: z
          .enum(["easy", "medium", "hard"])
          .optional()
          .describe("Filtrar por dificuldade."),
      },
    },
    async ({ simulado_id, topic, difficulty }) =>
      safe("list_questions", async () => {
        type Question = { id: string; topic: string; difficulty: string; stem: string };
        type Simulado = { id: string; questions: Question[]; questionCount: number };
        const catalog = await readJson<Simulado[]>(cfg.catalogJsonPath);
        const sim = catalog.find((s) => s.id === simulado_id);
        if (!sim) throw new Error(`Simulado id="${simulado_id}" não encontrado.`);
        let qs = sim.questions;
        if (topic) qs = qs.filter((q) => q.topic === topic);
        if (difficulty) qs = qs.filter((q) => q.difficulty === difficulty);
        return {
          simulado_id,
          total: qs.length,
          questions: qs.map((q) => ({ id: q.id, topic: q.topic, difficulty: q.difficulty, stem: q.stem.slice(0, 80) + (q.stem.length > 80 ? "…" : "") })),
        };
      }),
  );

  server.registerTool(
    "create_question",
    {
      title: "Criar questão de simulado",
      description:
        "Adiciona uma nova questão a um simulado no catalog.json. " +
        "ATENÇÃO: requer rebuild + redeploy do backend para entrar em produção. " +
        "Use list_questions antes para checar IDs existentes.",
      inputSchema: {
        simulado_id: z.string().min(1).describe("ID do simulado onde adicionar a questão."),
        id: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .describe("ID único da questão em kebab-case (ex: 'clf-q2')."),
        stem: z.string().min(10).describe("Enunciado da questão."),
        options: z
          .array(QuestionOptionSchema)
          .length(5)
          .describe("Exatamente 5 opções: A, B, C, D, E."),
        correct_id: z.enum(["A", "B", "C", "D", "E"]).describe("ID da opção correta."),
        explanation: z.string().min(10).describe("Explicação da resposta correta."),
        topic: z.string().min(2).describe("Tópico da questão (ex: 'Security', 'Cloud Concepts')."),
        difficulty: z.enum(["easy", "medium", "hard"]).describe("Dificuldade da questão."),
        related_slug: z
          .string()
          .optional()
          .describe("Slug de artigo FFV relacionado (opcional, para link de estudo)."),
      },
    },
    async ({ simulado_id, id, stem, options, correct_id, explanation, topic, difficulty, related_slug }) =>
      safe("create_question", async () => {
        type Question = { id: string };
        type Simulado = { id: string; questions: Question[]; questionCount: number };
        const catalog = await readJson<Simulado[]>(cfg.catalogJsonPath);
        const simIdx = catalog.findIndex((s) => s.id === simulado_id);
        if (simIdx === -1) throw new Error(`Simulado id="${simulado_id}" não encontrado.`);
        const sim = catalog[simIdx]!;
        if (sim.questions.some((q) => q.id === id)) {
          throw new Error(`Questão id="${id}" já existe neste simulado.`);
        }
        const question: Record<string, unknown> = {
          id,
          stem,
          options: options.map((o) => ({ id: o.id, text: o.text })),
          correctId: correct_id,
          explanation,
          topic,
          difficulty,
        };
        if (related_slug) question["relatedSlug"] = related_slug;
        sim.questions.push(question as Question);
        sim.questionCount = sim.questions.length;
        await writeJson(cfg.catalogJsonPath, catalog);
        return { created: id, simulado_id, total_questions: sim.questionCount };
      }),
  );

  server.registerTool(
    "update_question",
    {
      title: "Atualizar questão de simulado",
      description:
        "Edita uma questão existente no catalog.json. Apenas campos fornecidos são alterados. " +
        "ATENÇÃO: requer rebuild + redeploy do backend para entrar em produção.",
      inputSchema: {
        simulado_id: z.string().min(1).describe("ID do simulado que contém a questão."),
        question_id: z.string().min(1).describe("ID da questão a editar."),
        stem: z.string().min(10).optional(),
        options: z.array(QuestionOptionSchema).length(5).optional(),
        correct_id: z.enum(["A", "B", "C", "D", "E"]).optional(),
        explanation: z.string().min(10).optional(),
        topic: z.string().min(2).optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        related_slug: z.string().optional(),
      },
    },
    async ({ simulado_id, question_id, stem, options, correct_id, explanation, topic, difficulty, related_slug }) =>
      safe("update_question", async () => {
        type Question = Record<string, unknown>;
        type Simulado = { id: string; questions: Question[] };
        const catalog = await readJson<Simulado[]>(cfg.catalogJsonPath);
        const sim = catalog.find((s) => s.id === simulado_id);
        if (!sim) throw new Error(`Simulado id="${simulado_id}" não encontrado.`);
        const q = sim.questions.find((q) => q["id"] === question_id);
        if (!q) throw new Error(`Questão id="${question_id}" não encontrada no simulado "${simulado_id}".`);
        if (stem !== undefined) q["stem"] = stem;
        if (options !== undefined) q["options"] = options.map((o) => ({ id: o.id, text: o.text }));
        if (correct_id !== undefined) q["correctId"] = correct_id;
        if (explanation !== undefined) q["explanation"] = explanation;
        if (topic !== undefined) q["topic"] = topic;
        if (difficulty !== undefined) q["difficulty"] = difficulty;
        if (related_slug !== undefined) q["relatedSlug"] = related_slug;
        await writeJson(cfg.catalogJsonPath, catalog);
        return { updated: question_id, simulado_id };
      }),
  );

  server.registerTool(
    "delete_question",
    {
      title: "Deletar questão de simulado",
      description:
        "Remove uma questão do catalog.json. Operação irreversível via MCP. " +
        "ATENÇÃO: requer rebuild + redeploy do backend para entrar em produção.",
      inputSchema: {
        simulado_id: z.string().min(1).describe("ID do simulado que contém a questão."),
        question_id: z.string().min(1).describe("ID da questão a remover."),
        confirm_id: z
          .string()
          .min(1)
          .describe("Repita o question_id exato para confirmar."),
      },
    },
    async ({ simulado_id, question_id, confirm_id }) =>
      safe("delete_question", async () => {
        if (question_id !== confirm_id) {
          throw new Error(
            `Confirmação inválida: question_id="${question_id}" mas confirm_id="${confirm_id}".`,
          );
        }
        type Question = Record<string, unknown>;
        type Simulado = { id: string; questions: Question[]; questionCount: number };
        const catalog = await readJson<Simulado[]>(cfg.catalogJsonPath);
        const sim = catalog.find((s) => s.id === simulado_id);
        if (!sim) throw new Error(`Simulado id="${simulado_id}" não encontrado.`);
        const before = sim.questions.length;
        sim.questions = sim.questions.filter((q) => q["id"] !== question_id);
        if (sim.questions.length === before) {
          throw new Error(`Questão id="${question_id}" não encontrada.`);
        }
        sim.questionCount = sim.questions.length;
        await writeJson(cfg.catalogJsonPath, catalog);
        return { deleted: question_id, simulado_id, remaining_questions: sim.questionCount };
      }),
  );
}
