# Changelog

## 0.1.0

Initial release.

**Core features**
- Multi-target AI instruction generation: `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.amazonq/rules/project.md`, `AGENTS.md`
- AI-Readiness Score (0–100) with 12 weighted rules and one-click fixes
- Drift detection: manifest hash embedded in generated files, file watcher with debounce, status bar badge and notification

**Additional tools**
- SDD spec generator (auto-numbered, stored in `docs/specs/`)
- ADR generator in MADR format (auto-numbered, stored in `docs/adr/`)
- Multi-layer test suite scaffold (unit, integration, contract, e2e)
- Architecture diagram generator (Mermaid `graph TD`)
- Feature scaffold with `TODO(ai)` markers (TypeScript and Python)
- Documentation site generator (VitePress skeleton)

**Extension shell**
- Sidebar tree view organized by category (Analysis, Context, Documentation, Scaffold)
- Status bar: readiness score + drift count
- 4-step getting started walkthrough
- First-run welcome notification
- Content Security Policy with per-request nonce on all webviews

**Quality**
- Zero runtime dependencies
- Strict TypeScript, ESLint clean
- 39 tests covering scanner, generators, drift detection, and file utilities
