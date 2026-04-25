# AI Codebase Toolkit

> **Stop re-explaining your project to AI.** Configure once, every AI you use understands it forever.

A VS Code extension that prepares your codebase for the AI you already pay for — **Claude Code, Amazon Q, Copilot, Cursor, Cline**. Zero LLM calls. Zero API keys. Just deterministic, useful files.

---

## The 3 things that matter

### 1. 📝 Generate AI Instructions (multi-target)
One command creates and maintains `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.amazonq/rules/project.md`, and `AGENTS.md` from your real project state.

> Works with Claude Code, Cursor, Copilot, Amazon Q, Cline, Continue, Aider — every assistant on the market.

### 2. 📊 AI-Readiness Score
A **0–100 score** in your status bar that tells you exactly how ready your codebase is for AI assistance. Each missing point comes with a one-click fix.

> Like Lighthouse for AI-friendliness. Devs check it. Teams compete on it.

### 3. 🔄 Drift Detection (the killer feature)
Every generated file embeds a hash of your project state. When `package.json` / `tsconfig` / structure changes, the extension **automatically detects** that your AI instructions are stale and offers to regenerate.

> Other tools generate `CLAUDE.md` once and let it rot. We keep it alive.

---

## Why this exists

| Without the extension | With the extension |
|---|---|
| Each prompt re-explains the project | Tools embed context automatically |
| `CLAUDE.md` written once, never updated | Drift detection keeps it in sync |
| Each AI needs separate setup | One command configures all five |
| AI generates code that doesn't match the repo | Code matches because the repo is consistent |
| "Why doesn't the AI understand my project?" | Score shows exactly what's missing |

---

## Extras (also included)

| Tool | Use it when |
|------|-------------|
| **New SDD Spec** | Before complex features — gives AI explicit acceptance criteria. |
| **New ADR** | Documenting an architecture decision (MADR format). |
| **Generate Test Suite** | Right-click any source file → scaffolds unit/integration/contract/e2e. |
| **Generate Architecture Diagram** | Mermaid `graph TD` of your source tree. |
| **Scaffold Feature** | New feature folder with idiomatic files + `TODO(ai)` markers. |
| **Generate Docs Site** | Full VitePress site, runnable with `npm run docs:dev`. |

These are useful but secondary. The product is the 3 above.

---

## Install & use

```bash
git clone <this-repo>
cd ai-codebase-toolkit
npm install
npm run build
```

Open in VS Code, press **F5** → Extension Development Host launches with the toolkit loaded.

In your project:
1. Click the **🚀 AI** badge in the status bar.
2. Click **Generate Instructions** in the welcome notification.
3. Done. Open Claude Code / Cursor / Q — they now understand your project.

---

## Architecture

```
src/
├── core/              # types, logger
├── utils/             # fs, git, template (zero deps)
├── scanner/           # static analysis → ScanResult
├── drift/             # manifest hash + watcher
├── generators/        # one module per tool, framework-agnostic
├── tools/registry.ts  # tool catalog (drives sidebar)
├── providers/         # status bar, tree view, webviews, quickpicks
├── commands/          # VS Code command handlers
└── extension.ts       # activation + welcome + drift watcher
```

Design rules:
- **No LLM calls.** All output is deterministic.
- **Zero runtime deps.** Templates inlined, mustache caseiro.
- **Strict TypeScript.** Lint clean.
- **47 tests** covering scanner, generators, drift, utils.

---

## Roadmap

**v0.1 (this release)**
- 3 core tools + 6 extras.
- Drift detection with watcher.
- Status bar score, walkthrough, welcome view.

**v0.2**
- Templates per stack (Next.js, NestJS, Django, Expo).
- Score history (track improvement over time).
- Per-target template customization.

**v0.3 — MCP server mode**
- Same generators exposed as a Model Context Protocol server.
- Usable from Claude Desktop, Zed, JetBrains, any MCP client.
- **5x the addressable market.**

**v1.0 — Team mode**
- Shared rules via remote repo.
- Team dashboard.
- Tool marketplace.

---

## License

MIT — see [LICENSE](./LICENSE).
