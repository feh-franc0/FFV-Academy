# 12 — Decision Log

> Strategic decisions, dated and reasoned. New entries go at the top.
> Format: status · context · decision · consequences.

---

## D-006 — 2026-04-25 — Defer "Generate Documentation Site" to v0.2
- **Status:** Accepted (gated behind `aiToolkit.experimental.docsSite`).
- **Context:** Tool generates a 20-file VitePress site requiring `npm install` in `docs/`. High setup friction, low completion likelihood for casual users.
- **Decision:** Hide from main UX in v0.1. Keep code + tests. Reintroduce only if 3+ users explicitly request.
- **Consequences:** Cleaner v0.1 surface, less repo noise. Risk of losing a wedge feature for power users — accepted because we believe the 3 pillars are stronger.
- **Reversal trigger:** ≥ 5 GitHub issues asking for it within 90 days of public launch.

---

## D-005 — 2026-04-25 — Ship Drift Detection as a Pillar (not a side feature)
- **Status:** Accepted.
- **Context:** No competitor offers drift detection. It is the most defensible moat in our concept.
- **Decision:** Drift goes to v0.1 with status-bar badge, webview, watcher, and the manifest hash embedded in every generated file.
- **Consequences:** Increased complexity in v0.1; another "thing to maintain." We accept this as the differentiator.
- **Reversal trigger:** action rate < 20% over 90 days → demote to opt-in feature.

---

## D-004 — 2026-04-25 — Cut Module Flowchart and PR Description tools
- **Status:** Accepted.
- **Context:** Module Flowchart produced generic Mermaid placeholders without LLM context = low value. PR Description duplicates functionality every AI assistant already has built in.
- **Decision:** Both removed from v0.1 entirely (code, commands, tests).
- **Consequences:** Tighter focus on the 3 pillars; smaller scope; fewer tests to maintain. We lose two "wow surface" demos but neither was load-bearing.

---

## D-003 — 2026-04-25 — Strict TypeScript + zero runtime dependencies
- **Status:** Accepted.
- **Context:** VS Code extensions tend to be bloated. We want install/load speed to be a brand asset.
- **Decision:** `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`. Templates inlined; no runtime libraries; templates inlined as TS strings.
- **Consequences:** More verbose code in places. Faster startup. Easier to audit (security).
- **Trade-off accepted.**

---

## D-002 — 2026-04-25 — No LLM calls inside the extension, ever
- **Status:** Accepted (foundational principle).
- **Context:** We could call an LLM to enrich generated content. We don't.
- **Decision:** Determinism > "smarter" output. Always. Users plug their own AI in at the consumption side.
- **Consequences:** No API key UX, no privacy worries, no rate limits, no cost.
- **Reversal trigger:** would only revisit if the entire category shifts toward "context tools that orchestrate AI." Unlikely.

---

## D-001 — 2026-04-25 — Position as "context layer," not "AI assistant"
- **Status:** Accepted (foundational positioning).
- **Context:** Initial framing was "AI orchestrator inside VS Code," which sounded like a competitor to Cursor / Copilot.
- **Decision:** Reframe explicitly as **complement**, not competitor. Tagline: "Make every AI assistant understand your project."
- **Consequences:** Lower ceiling on positioning ambition; much higher landing on real value.

---

## How to write a new entry

```md
## D-NNN — YYYY-MM-DD — Short title
- **Status:** Proposed | Accepted | Superseded by D-XYZ | Reversed.
- **Context:** What forced the decision.
- **Decision:** What we chose, in 1–3 sentences.
- **Consequences:** What this implies, both good and bad.
- **Reversal trigger** (optional): the data or event that would make us flip.
```

Decisions that change architecture also get an ADR in `docs/adr/`. This log is for **strategy** decisions; ADRs are for **engineering** decisions.

## Open questions (not decisions yet)

- Do we accept paid sponsorships in the README before Phase 3? *(Tentatively no — keeps brand neutral.)*
- Do we publish under a personal account or create a brand from day 1? *(Brand name TBD, tentative: separate publisher account.)*
- Do we attempt to trademark the brand name pre-launch? *(Tentatively yes if name is unique enough.)*
- Open governance model from day 1, or solo until Phase 2? *(Solo until Phase 2.)*
