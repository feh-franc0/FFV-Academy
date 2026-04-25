# 05 — Architecture

## Architectural principles (non-negotiable)

1. **Zero LLM calls inside the extension.** Determinism is the brand.
2. **Zero runtime dependencies.** Smaller bundle = faster install. We have one of the leanest extensions in the marketplace.
3. **Layered, framework-agnostic core.** Anything in `src/core/`, `src/utils/`, `src/scanner/`, `src/generators/`, `src/drift/` must NOT import `vscode`. This is what enables MCP server mode in v0.3.
4. **Strict TypeScript.** `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`.
5. **Test the lib core, not the editor glue.** Editor glue (commands, providers) gets smoke tests; logic gets full unit + integration coverage.
6. **Performance budget:** activation < 200ms cold; full scan < 2s for 10k files.

## Layer diagram

```
┌─────────────────────────────────────────────────────────┐
│  VS Code activation surface (extension.ts)             │
│  - registers commands, tree view, status bar, watcher  │
└────────────────────┬────────────────────────────────────┘
                     │ depends on
┌────────────────────▼────────────────────────────────────┐
│  providers/ (status-bar, tree-view, webviews,          │
│              quickpicks)  — VS Code UI only            │
└────────────────────┬────────────────────────────────────┘
                     │ depends on
┌────────────────────▼────────────────────────────────────┐
│  commands/ (handlers wiring user actions to core)      │
└────────────────────┬────────────────────────────────────┘
                     │ depends on
┌────────────────────▼────────────────────────────────────┐
│  generators/, scanner/, drift/, tools/registry.ts      │
│  — pure logic, no `vscode` import                      │
└────────────────────┬────────────────────────────────────┘
                     │ depends on
┌────────────────────▼────────────────────────────────────┐
│  core/, utils/ — types, logger (logger uses vscode     │
│  but is the ONLY exception, isolated)                  │
└─────────────────────────────────────────────────────────┘
```

The lower 3 layers are portable. They can become a CLI or MCP server with zero refactor of business logic.

## Why this matters for v0.3 (MCP)

When we ship the MCP server:

```
┌─────────────────────────┐    ┌─────────────────────────┐
│ VS Code extension       │    │ MCP server (CLI)        │
│ (UI in providers/)      │    │ (UI in mcp-handlers/)   │
└──────────┬──────────────┘    └──────────┬──────────────┘
           │                              │
           └──────────────┬───────────────┘
                          │
              ┌───────────▼─────────────┐
              │ Shared core             │
              │ (scanner/generators/    │
              │  drift) — UNCHANGED      │
              └─────────────────────────┘
```

We ship a second front-end without touching the engine. This is why discipline about the layers matters today.

## Module responsibilities

| Module | Owns | Doesn't own |
|---|---|---|
| `core/` | types, logger | I/O |
| `utils/fs` | file I/O, walking directories | parsing semantics |
| `utils/git` | git invocations | git intent |
| `scanner/` | static analysis → `ScanResult` | rendering |
| `drift/` | manifest + diff | UI / notifications |
| `generators/` | take `ScanResult` → `GeneratedFile[]` | writing to disk |
| `tools/registry` | tool catalog metadata | execution |
| `providers/` | VS Code UI | business logic |
| `commands/` | wire user actions → core | UI |
| `extension.ts` | activation lifecycle | logic |

## Key decisions

### Why static analysis instead of LSP / tree-sitter?
- LSP is too heavyweight for our needs (we don't do per-line analysis).
- Tree-sitter would add a native dep.
- Pure file I/O + JSON parsing is enough for stack/structure detection at our resolution.

### Why no template engine?
- Generated content is small per file.
- Template literals + helpers > runtime dep.
- We deleted the homemade mustache after seeing it was unused.

### Why store manifest in a Markdown comment instead of a sidecar file?
- Single source of truth — file moves with the data.
- No clutter in the repo (one file vs two).
- Comment is invisible in Markdown rendering.
- Trade-off: the manifest leaks into `.cursorrules` etc., but as a `#` comment, harmless.

### Why webviews over native VS Code views for score/drift?
- We need rich layout (cards, badges, buttons) — native views are too rigid.
- We control the HTML/CSS, but stay inside CSP for security.
- Light/dark theming via VS Code CSS variables.

### Why `vitest` instead of `mocha` (the VS Code default)?
- Faster, modern, native ESM, native TS.
- We don't run inside an Extension Host for tests — pure logic doesn't need it.
- Editor glue we test manually + smoke (will add when justified).

## Performance budget

| Operation | Budget | Current (measured locally) |
|---|---|---|
| Extension activation (cold) | < 200 ms | ~80 ms |
| Project scan (1k files) | < 500 ms | ~120 ms |
| Project scan (10k files) | < 2 s | ~600 ms |
| Drift check | < 200 ms | ~50 ms |
| Generate all 5 instructions | < 100 ms | ~30 ms |

If we exceed budget by > 50%, we add a profiling pass before shipping.

## Security & privacy

- **No outbound network calls.** The extension makes zero HTTP requests.
- **No telemetry by default.** v0.2 may add opt-in anonymized telemetry (`vscode-telemetry` channel).
- **No secret reading.** We never read `.env`, `.npmrc` auth tokens, or anything matching `*secret*` / `*key*` patterns.
- **Read-only by default for analysis.** Writing happens only on explicit commands.
- **Generated files have a header noting their origin** so users know what's autogenerated.

## Bundle size budget

- Compiled `dist/` < 200 KB.
- Shipped `.vsix` < 500 KB (mostly walkthrough markdown + media).
- No `node_modules/` shipped — `tsc` output only.

## Failure handling philosophy

- Scanner errors on a file → log, skip the file, continue.
- Generator errors → fail loudly with clear message, don't write partial output.
- Watcher errors → log, keep watcher alive.
- Never throw uncaught errors that crash the extension.
