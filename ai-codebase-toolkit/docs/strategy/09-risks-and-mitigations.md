# 09 — Risks & Mitigations

> Ranked by **expected loss** (probability × impact). The top of this list is what kills us.

## Risk register

### R1 — Cursor / Copilot / Claude ship native equivalents 🔴
- **Probability:** High (60–70% in 12 months for some subset).
- **Impact:** Medium-high — they take pillar 1, leaving us with score and drift.
- **Mitigations:**
  - Prioritize **multi-target** moat (no vendor will support competitors).
  - Invest in **drift detection** as the second moat.
  - Build community around **AGENTS.md** so the vendor-neutral story is ours.
  - Have an MCP server ready (v0.3) so we can pivot to "context layer for any AI" if the editor surface is captured.

### R2 — Drift notifications become annoying 🟠
- **Probability:** Medium.
- **Impact:** Medium — kills retention even if installs are healthy.
- **Mitigations:**
  - Aggressive debouncing (1.5s default, configurable).
  - Notifications only on substantial change (manifest hash change).
  - Easy off-switch (`aiToolkit.autoSync` setting).
  - Track dismiss rate. Auto-tune sensitivity in v0.2.

### R3 — Generated files look generic / users uninstall 🟠
- **Probability:** Medium.
- **Impact:** High — kills first impression.
- **Mitigations:**
  - **Stack-specific templates** for top 4 frameworks (Next.js, NestJS, Django, Expo) before public launch.
  - Inject project name, real scripts, real top-level folders.
  - Validate via 5 design-partner reviews ("does this look useful?").

### R4 — Marketplace listing doesn't convert 🟠
- **Probability:** Medium.
- **Impact:** Medium — slow growth even with good product.
- **Mitigations:**
  - Hire contract designer for icon + screenshots.
  - A/B test taglines via paid micro-experiments.
  - Optimize for the "first 5 lines" of the description.

### R5 — Solo founder burnout 🟠
- **Probability:** Medium.
- **Impact:** Existential.
- **Mitigations:**
  - Hard time-box: 4 focused hours/day max during alpha.
  - Public dev log creates external accountability AND motivation.
  - One feature per week, no exceptions.
  - Physical/mental breaks scheduled.

### R6 — Monetization fails (Phase 3) 🟡
- **Probability:** Medium-low (50%).
- **Impact:** Medium — OSS can survive without it but no scale.
- **Mitigations:**
  - Validate paying signal early (Experiment 4 in v8).
  - Don't build paid features speculatively.
  - Have a Plan B: sponsorships (GitHub Sponsors), grants, consulting.

### R7 — AI ecosystem changes faster than we ship 🟡
- **Probability:** High that *something* changes; Low that it kills us.
- **Impact:** Variable.
- **Mitigations:**
  - Adapter pattern in `generators/instructions/` makes per-target updates cheap.
  - Track each AI assistant's release notes (RSS / GitHub releases).
  - 30-day SLA on adapting to format changes.

### R8 — Security incident (we wrote a bad file or leaked something) 🟡
- **Probability:** Low.
- **Impact:** High — kills trust.
- **Mitigations:**
  - Never read secrets (`.env`, `.npmrc`, etc.).
  - All writes are explicit user actions (no auto-write).
  - Open source = audit-friendly.
  - Document responsible disclosure process.

### R9 — Microsoft changes VS Code extension API 🟡
- **Probability:** Low (Microsoft is very stable here).
- **Impact:** Low (we use stable APIs).
- **Mitigations:** stay on stable; integration test with VS Code Insiders monthly.

### R10 — Contributors / community don't materialize 🟢
- **Probability:** Medium.
- **Impact:** Low (we can ship without them, just slower).
- **Mitigations:** label "good first issue" generously; respond to PRs in < 72h.

### R11 — Naming / trademark conflict 🟢
- **Probability:** Low.
- **Impact:** Medium (forced rename).
- **Mitigations:** check trademark search before public launch; pick a name with .com available and unique npm package name.

### R12 — Support load exceeds capacity 🟢
- **Probability:** Low until 1k WAP, then Medium.
- **Impact:** Low if we route well.
- **Mitigations:**
  - GitHub issues template (reproduces, environment).
  - FAQ / troubleshooting in docs.
  - Community Discord eventually (Phase 2).

## Pre-mortem (top 3)

If this project fails 18 months from now, the cause will probably be:

1. **We didn't ship drift before competitors caught up on instructions.** We have a 12-month window. Drift must be production-quality from day 1.
2. **Generated files looked generic, devs decided "I can write this better in 5 minutes."** Stack-specific templates are mandatory before mass marketing.
3. **We chased the docs site / scaffold / tests features instead of doubling down on the 3 pillars.** Discipline.

## Risk monitoring cadence

- **Weekly:** glance at install/uninstall ratio, top GitHub issues.
- **Monthly:** revisit this risk register. Update probabilities. Add new risks.
- **Quarterly:** kill any feature whose risk-adjusted ROI is negative.
