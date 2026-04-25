# 03 — Product Scope

> Brutal per-tool review. Every feature must justify its existence or be cut.

## Scope verdict matrix

| Tool | Verdict | Why |
|------|---------|-----|
| **Generate AI Instructions** | 🟢 KEEP — pillar 1 | The product. Multi-target = unique. |
| **AI-Readiness Score** | 🟢 KEEP — pillar 2 | Viral hook. Engagement driver. |
| **Drift Detection** | 🟢 KEEP — pillar 3 | Defensible moat. Retention driver. |
| **New SDD Spec** | 🟡 KEEP (secondary) | Real differentiator vs competitors. Low maintenance cost. |
| **New ADR** | 🟡 KEEP (secondary) | Cheap. Aligns with our "context for AI" thesis. |
| **Generate Test Suite** | 🟡 KEEP (secondary) | Multi-layer scaffold is professional, but risk of looking too generic. |
| **Generate Architecture Diagram** | 🟡 KEEP (secondary) | Mermaid tree is genuinely useful, low maintenance. |
| **Scaffold Feature** | 🟠 KEEP (with caveat) | Useful framing ("for AI to fill"). But risk of competing with `nx`/`plop`. |
| **Generate Docs Site** | 🔴 DEFER to v0.2 | Heavy: VitePress dep, npm install hassle, scope creep. Validate demand first. |
| ~~Generate Module Flowchart~~ | ✅ CUT | Already removed. |
| ~~Generate PR Description~~ | ✅ CUT | Already removed. |

## Detailed per-tool critique

### Pillar 1 — Generate AI Instructions
**Status:** core, ship in v0.1.

**What it does:** generates `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.amazonq/rules/project.md`, `AGENTS.md`.

**Critique:**
- ✅ Multi-target is unique.
- ✅ Generated from real scan, not template.
- ⚠️ The 5 files = repo clutter. Mitigation: detect what user already has, default to those only.
- ⚠️ Each AI vendor may change format. Mitigation: small adapter per target, easy to update.

**Decision:** ship as the headline feature. UI emphasizes "5 in 1 click."

---

### Pillar 2 — AI-Readiness Score
**Status:** core, ship in v0.1.

**What it does:** static analysis → 0–100 score with prioritized fixes.

**Critique:**
- ✅ Viral mechanic. Lighthouse precedent.
- ✅ Drives engagement back to other tools (each issue has a "Fix" button).
- ⚠️ If the rules are too easy or too hard, score loses signal. Need calibration on real projects.
- ⚠️ Subjective rules ("naming consistency") can feel arbitrary.

**Decision:** ship with current 11 rules. Plan a "rules calibration" pass after first 100 real-world scans.

**Future:** allow users to disable rules they disagree with. Allow team-level rule profiles.

---

### Pillar 3 — Drift Detection
**Status:** core, ship in v0.1 (already shipped in current code).

**What it does:** embeds project hash in generated files, watches for changes, warns when files are stale.

**Critique:**
- ✅ Genuinely novel. No competitor has this.
- ✅ Retention mechanic — gives users a reason to come back.
- ⚠️ Must not be annoying. Debouncing critical.
- ⚠️ False positives kill trust. Hash must be tuned to reduce flapping.

**Decision:** ship with current debounced implementation. Track "drift notification → action" rate as a key metric. If users dismiss > 70% of notifications, we are too noisy.

---

### Secondary tools

#### New SDD Spec
**Status:** keep as-is.

**Critique:**
- ✅ Real differentiator — no competitor has SDD scaffold.
- ✅ Aligns with thesis ("specs are context for AI").
- ⚠️ Most devs don't write specs. Risk of unused feature.
- 🎯 Could be valuable specifically for senior/team users.

**Decision:** keep. Show in tree view but not headline. Low maintenance.

#### New ADR
**Status:** keep as-is.

**Critique:**
- ✅ Cheap to maintain.
- ✅ Niche but loyal user base (architecture-minded devs).
- ⚠️ Already commoditized — `adr-tools` exists.
- 🎯 We win because: integrated with extension, no extra install, in same UX as the rest.

**Decision:** keep. Don't market separately.

#### Generate Test Suite
**Status:** keep, needs polish.

**Critique:**
- ✅ Multi-layer (unit/integration/contract/e2e) is professional.
- ⚠️ Generated tests are placeholders. Risk: looks like junk if not refined.
- ⚠️ Competes with framework generators (Nx, Vitest's `--workspace`).
- 🎯 Our angle: "tests AI can fill in." TODO(ai) markers + AAA structure.

**Decision:** keep, but add a clear "this is meant for your AI to flesh out" framing in the generated files and walkthrough.

#### Generate Architecture Diagram
**Status:** keep, low maintenance.

**Critique:**
- ✅ Mermaid `graph TD` is real value, instantly visualizes structure.
- ✅ Used as input by AI assistants (they can read Mermaid).
- ⚠️ For very large projects, the tree becomes unreadable. Need depth/leaf limits.
- ⚠️ One-shot — doesn't update automatically.

**Decision:** keep. Add max-depth setting in v0.2. Eventually integrate with drift system (regen when source tree changes significantly).

#### Scaffold Feature
**Status:** keep with caveat.

**Critique:**
- ⚠️ Competes with framework generators that may be better tuned.
- ✅ Our differentiator: explicit `TODO(ai)` markers + reference to sibling for the AI to follow.
- ⚠️ Currently stack-dumb (only TS / Python). Need at least Go and Java for credibility.

**Decision:** keep but de-emphasize. Add Go and Java in v0.2. If usage stays low after 90 days, cut.

---

### Cut / defer

#### Generate Docs Site
**Status:** defer to v0.2 or v1.0.

**Why defer:**
- VitePress site is ~20 generated files + requires `npm install` in `docs/`.
- High setup friction → low completion rate.
- Big maintenance cost (VitePress changes, plugin churn).
- Most users won't run a docs site for personal projects.

**Decision:** **remove from v0.1**. Reintroduce in v0.2 if 3+ users explicitly request it.

> Action: gate the `aiToolkit.generateDocsSite` command behind a `aiToolkit.experimental.docsSite` setting (default off). Hide from the tree view. Keep code + tests so it can come back fast.

## Rules for accepting new feature ideas

A feature is accepted only if it satisfies **all** of:

1. **Reinforces a pillar.** Either generate, score, or keep-fresh.
2. **Determinístico.** No LLM call required from us.
3. **Zero new runtime dependencies** (test deps OK).
4. **< 200 lines of code** for v1, or has a champion willing to maintain it.
5. **Has a metric** that tells us if it's used.

## Backlog (waiting for evidence)

These are good ideas that we don't build yet because evidence is missing:

- **MCP server mode** — wait until v0.3, after OSS validation.
- **Score history dashboard** — wait until 1k WAP.
- **Team / shared rules** — wait for first 5 paying signals.
- **Stack-specific templates (Next.js, NestJS, Django)** — wait for top 3 stacks by user share.
- **Auto-fix on save** — invasive; needs explicit opt-in research.
- **CI integration** ("AI-readiness as a check") — wait for org-level demand.
