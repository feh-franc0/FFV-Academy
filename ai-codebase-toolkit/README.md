# AI Codebase Toolkit

> **Stop re-explaining your project to AI.** Configure once, every AI assistant you use understands it forever.

A VS Code extension that prepares your codebase for the AI tools you already use — **Claude Code, Amazon Q, Copilot, Cursor, Cline**. No LLM calls. No API keys. Pure static analysis, deterministic output.

---

## The 3 things that matter

### 1. Generate AI Instructions (multi-target)

One command scans your project and generates:

| File | Used by |
|---|---|
| `CLAUDE.md` | Claude Code |
| `.cursorrules` | Cursor |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.amazonq/rules/project.md` | Amazon Q Developer |
| `AGENTS.md` | Cline, Continue, Aider, and any vendor-neutral agent |

The output is tailored to your actual stack — not a generic template. A Next.js project gets Server Component rules. A NestJS project gets DI and validation patterns. A Go project gets idiomatic layout guidance.

### 2. AI-Readiness Score

A **0–100 score** displayed in the status bar. Each failing check comes with a one-click fix.

Checks include: AI instruction files present, TypeScript enabled, test folder detected, naming consistency, large folders that hurt AI comprehension, ADRs and SDD specs present.

> Think of it as Lighthouse — but for how well your codebase communicates with AI.

### 3. Drift Detection

Every generated file embeds a hash of your project state. When `package.json`, `tsconfig.json`, or your folder structure changes, the extension detects that your AI instructions are stale and offers to regenerate — automatically.

> Most tools write `CLAUDE.md` once and let it rot. This one keeps it alive.

---

## Why this exists

| Without this extension | With this extension |
|---|---|
| Every prompt re-explains the project | AI reads the context automatically |
| `CLAUDE.md` is written once and never updated | Drift detection keeps it in sync |
| Each AI tool needs manual setup | One command configures all five |
| Generated code doesn't match the repo style | Code matches because conventions are documented |
| "Why doesn't the AI understand my project?" | The score tells you exactly what's missing |

---

## Additional tools

| Tool | What it does |
|---|---|
| **New SDD Spec** | Creates a Spec-Driven Development template — problem, goals, use cases, acceptance criteria |
| **New ADR** | Architecture Decision Record in MADR format, auto-numbered |
| **Generate Test Suite** | Right-click any source file → scaffolds unit, integration, contract, and e2e layers |
| **Generate Architecture Diagram** | Mermaid `graph TD` of your source tree |
| **Scaffold Feature** | Feature folder with idiomatic files and `TODO(ai)` markers for your AI to fill in |
| **Generate Docs Site** | Full VitePress site skeleton, runnable with `npm run docs:dev` |

These are useful but secondary. The core product is the three above.

---

## Requirements

- VS Code 1.85 or later
- Node.js 18+ (for development)

The extension activates automatically when you open a project that contains `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, or `CLAUDE.md`.

---

## Development

### 1. Clone and install

```bash
git clone https://github.com/feh-franc0/ai-codebase-toolkit
cd ai-codebase-toolkit
npm install
```

### 2. Build

```bash
npm run build
```

Output goes to `dist/`. The build must be clean before running the extension.

### 3. Launch the Extension Development Host

Open the folder in VS Code, then press **F5**. A second VS Code window opens with the extension loaded. Open any project in that window to test.

### 4. Useful scripts

```bash
npm run build          # compile src/ → dist/
npm run watch          # compile on save (use alongside F5)
npm test               # run 39 tests (Vitest)
npm run test:coverage  # tests + coverage report in coverage/
npm run lint           # ESLint
npm run format         # Prettier
npm run package        # build + pack → ai-codebase-toolkit-0.1.0.vsix
npm run publish        # build + publish to VS Code Marketplace
```

### 5. Iterating quickly

Run `npm run watch` in one terminal so the extension recompiles on every save. After a change, press **Ctrl+Shift+F5** in VS Code to restart the Extension Development Host without closing the window.

---

## Publishing to the VS Code Marketplace

> Do this only after validating the extension on at least 3–5 real projects.

### Step 1 — Create a publisher account

1. Go to [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage).
2. Sign in with your Microsoft account.
3. Click **Create publisher** and use the ID `feh-franc0` (already set in `package.json`).

### Step 2 — Create a Personal Access Token

1. Go to [dev.azure.com](https://dev.azure.com) and sign in.
2. Click your profile icon → **Personal access tokens** → **New Token**.
3. Set:
   - **Organization:** All accessible organizations
   - **Scopes:** `Marketplace > Manage`
4. Copy the token — it is shown only once.

### Step 3 — Authenticate

```bash
npx vsce login feh-franc0
# Paste the PAT when prompted
```

### Step 4 — Publish

```bash
npm run publish
```

This runs `npm run build`, packages the extension, and uploads it. The extension appears on the Marketplace within a few minutes.

### Bumping the version

```bash
npx vsce publish patch   # 0.1.0 → 0.1.1
npx vsce publish minor   # 0.1.0 → 0.2.0
npx vsce publish major   # 0.1.0 → 1.0.0
```

### Installing the .vsix locally (without publishing)

```bash
npm run package
code --install-extension ai-codebase-toolkit-0.1.0.vsix
```

Or via the Extensions panel: `... > Install from VSIX`.

---

## Architecture

```
src/
├── core/              # domain types, logger
├── utils/             # fs helpers, walk — zero runtime deps
├── scanner/           # static analysis → ScanResult
├── drift/             # manifest hash, detector, file watcher
├── generators/        # one module per tool, framework-agnostic
├── tools/             # tool catalog (drives the sidebar)
├── providers/         # status bar, tree view, webviews, quickpicks
├── commands/          # VS Code command handlers
└── extension.ts       # activation, welcome flow, drift watcher
```

Design constraints:
- **No LLM calls.** All output is deterministic.
- **Zero runtime dependencies.** Templates are inlined; no external template engine.
- **Strict TypeScript.** The build must be lint-clean.
- **Content Security Policy** on all webviews — nonce-based inline scripts only.

---

## Roadmap

**v0.1 — current**
- Multi-target AI instruction generation (5 targets)
- AI-Readiness Score with one-click fixes
- Drift detection with file watcher
- SDD specs, ADRs, test suite scaffold, architecture diagram, feature scaffold, docs site
- Status bar, sidebar, walkthrough, welcome notification

**v0.2**
- Stack-specific templates (Next.js, NestJS, Django, Expo)
- Score history — track improvement over time
- Per-target template customization

**v0.3 — MCP server mode**
- Same generators exposed as a Model Context Protocol server
- Works from Claude Desktop, Zed, JetBrains, any MCP client

**v1.0 — Team mode**
- Shared rules synced from a remote repository
- Team dashboard and score aggregation

---

## License

MIT — see [LICENSE](./LICENSE).
