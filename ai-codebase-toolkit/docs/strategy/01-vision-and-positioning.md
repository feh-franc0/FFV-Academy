# 01 — Vision & Positioning

## Vision (1 sentence)

> Make every codebase **instantly understandable** by every AI assistant a developer uses, and keep that understanding fresh as the code evolves.

## Mission (operational)

Provide a VS Code extension and (later) MCP server that:
1. Generates the AI context files every assistant reads.
2. Quantifies how AI-ready a codebase is.
3. Detects when that context drifts from reality and offers a one-click fix.

## What we are NOT

This list is more important than the vision. It prevents scope creep.

- ❌ We are **not an AI assistant**. We never call an LLM ourselves.
- ❌ We are **not a code generator**. We scaffold context, the user's AI generates code.
- ❌ We are **not a linter**. We surface AI-readiness, not bugs.
- ❌ We are **not a CI tool** (yet — explicit v2+ consideration).
- ❌ We are **not a documentation platform**. We bootstrap one, then step away.
- ❌ We are **not opinionated about architecture**. We mirror the user's existing patterns.

## Positioning statement

> For **professional developers using AI assistants in VS Code**, AI Codebase Toolkit is the **context layer** that makes Claude Code, Amazon Q, Copilot, and Cursor understand your specific project — without re-explaining it in every prompt. Unlike `.cursorrules` or `CLAUDE.md` written by hand (which rot in a week), we **generate, score, and keep them in sync** automatically.

Three pieces matter in that sentence:
1. "Context layer" — not competitor to assistants, complement.
2. "Without re-explaining" — the pain we resolve.
3. "Generate, score, keep in sync" — the three pillars.

## Brutal self-critique

If a senior PM stress-tested this pitch, here is what they'd say:

### "This is just a `.cursorrules` generator with extra steps."
**Counter:** That's true for pillar 1. But pillar 1 alone has real value because:
- 5 targets in 1 click (no other tool does this).
- Generated from real project state, not a generic template.
- Can be regenerated as the project evolves.

If pillars 2 and 3 fail to differentiate, this critique sticks and we are commodity.

### "Cursor will just absorb this natively in 6 months."
**Counter (partial):** Probable. Same for Copilot and Claude Code. Three responses:
- We support all 5 simultaneously — no single vendor will support competitors.
- AGENTS.md is vendor-neutral and growing. We're the best generator for it.
- If incumbents catch up on pillar 1, pillars 2 and 3 still stand. Plan for that day.

### "Devs hate one more file in the repo root."
**Valid.** Having `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `AGENTS.md` is **5 files of clutter**. We must:
- Make the QuickPick let users opt out trivially.
- Default to only the targets we detect (don't generate Copilot file if no `.github/`).
- Allow consolidating into AGENTS.md only (when supported by the dev's stack).

### "Drift detection sounds clever but devs won't notice or care."
**Risk we accept.** This is the bet. We mitigate by:
- Status bar badge (passive, not nagging).
- Notification only when drift is significant (debounced).
- Single-click fix (no friction to comply).

If after 90 days drift detection has < 30% engagement of users who installed, we strip it.

### "AI-Readiness Score is gamification fluff."
**Half true.** It is gamification. But Lighthouse proved that a number is enough to change behavior. If we frame it as "your AI works better when this score is higher" — and that's measurably true — it sticks.

We must validate that high score → better AI output. Doc 08 covers this experiment.

### "There is no business model."
**True today.** Phase 1 is open-source for adoption. Monetization is Phase 4 (team sync, dashboards, premium templates). If the OSS layer isn't loved, paid layer never works.

## North star metric

**Weekly Active Projects** (WAP) — distinct workspaces where any toolkit command was run in the last 7 days.

Why this metric:
- Captures real usage, not vanity installs.
- Per-project, not per-user — better signal because multi-project devs would skew per-user.
- Weekly cadence matches dev work rhythm.

Targets:
- Month 3 post-launch: **1,000 WAP**.
- Month 6: **10,000 WAP**.
- Month 12: **50,000 WAP**.

If month 6 < 5,000 WAP we re-evaluate the project.

## What "winning" looks like in 18 months

- 50,000 WAP organically.
- AGENTS.md adoption credits us as a primary generator.
- 1+ enterprise pilot for Team mode.
- Contributors > 10, with at least 3 from companies not affiliated with us.
- We can step away for a week without it falling over (process, not heroics).
