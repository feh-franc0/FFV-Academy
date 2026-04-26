# Project Context for Claude

## Stack
- Language: TypeScript (strict)
- Runtime: Node.js 18+
- Framework: VS Code Extension API (vscode ^1.85)
- Test framework: Vitest
- Package manager: npm

## Structure
- Source root: `src/`
- Top-level folders: `src/`, `tests/`, `docs/`, `media/`, `templates/`, `dist/`
- Tests folder: `tests/` (unit + integration, Vitest)
- Docs folder: `docs/` (strategy docs, testing guide)

## Entry points
- `src/extension.ts` — activate() and deactivate(); the VS Code entry point
- `src/commands/index.ts` — all 10 VS Code command handlers
- `src/scanner/index.ts` — `scanProject()` and `computeReadiness()`
- `src/generators/instructions/index.ts` — `generateInstructions()` multi-target

## Architecture
The codebase is layered — each layer only imports from layers below it:

```
extension.ts (activation)
    └── commands/         (VS Code handlers — thin, delegate to generators/scanner)
    └── providers/        (status bar, tree view, webviews, quickpicks — UI only)
            └── scanner/          (static analysis → ScanResult; no VS Code imports)
            └── drift/            (manifest hash, detector, file watcher)
            └── generators/       (one module per tool; no VS Code imports)
                    └── core/     (domain types, logger)
                    └── utils/    (fs helpers, walk — zero runtime deps)
```

**Hard rules:**
- `scanner/`, `drift/`, and `generators/` must NOT import from `vscode`. They are pure TypeScript and must remain testable without a VS Code runtime.
- `providers/` and `commands/` may import `vscode`.
- Zero runtime dependencies — no npm packages in `dependencies`. Templates are inlined.

## Commands
- `npm run build` — compile `src/` → `dist/` (tsc)
- `npm run watch` — compile on save
- `npm test` — 39 tests (Vitest)
- `npm run test:coverage` — tests + coverage report
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm run package` — build + pack → `.vsix`
- `npm run publish` — build + publish to VS Code Marketplace

## Conventions
- File naming: `kebab-case`
- Import style: relative within a layer, no barrel re-exports except at layer boundaries
- Async: prefer `async/await`; avoid floating promises — use `void` only when intentional fire-and-forget
- Error handling: all VS Code commands are wrapped in `withRoot()` which catches and shows `showErrorMessage`; background operations log to the "AI Toolkit" output channel and show a warning notification on failure

## Webviews
All webviews must:
- Set `Content-Security-Policy` with a per-request nonce (`crypto.randomBytes(16).toString('hex')`)
- Add `nonce="${nonce}"` to every `<script>` tag
- Set `localResourceRoots: []` (no local file access needed)
- Validate all incoming `postMessage` commands against an explicit allowlist

## Testing
- Tests live in `tests/unit/` and `tests/integration/`
- Tests must not import from `vscode` — use the pure-TypeScript layers only
- Fixture data lives in `tests/` alongside the tests that use it
- Run `npm test` before every commit; the build must be clean

## Working agreements
- Always run `npm run build` and `npm test` after non-trivial changes.
- Always run `npm run lint` before finishing; fix all lint errors.
- Match existing file naming (`kebab-case`) when creating new files.
- Never add runtime dependencies — keep `dependencies` empty in `package.json`.
- Never import `vscode` in `scanner/`, `drift/`, `generators/`, `core/`, or `utils/`.
- Keep command handlers thin — business logic belongs in `generators/` or `scanner/`.
- Add tests for any new generator or scanner rule.

## Architecture decisions
See `docs/strategy/` for planning documents. No formal ADRs yet.

## Known limitations (as of v0.1)
- Test suite generator produces scaffolding with placeholder assertions — it cannot infer real behavior from static analysis alone.
- Architecture diagram shows folder structure only, not module dependency graph.
- Scanner detects one primary language per project; mixed-language monorepos (Node + Python) report only the primary.
