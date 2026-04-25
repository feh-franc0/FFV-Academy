# 07 — Roadmap

> Phased delivery with **explicit gates and kill criteria**. We do not advance to the next phase without hitting the gate.

## Phase 0 — Internal alpha (now → 4 weeks)

**Goal:** the toolkit works on 5 real projects (different stacks).

**Deliverables**
- [x] 3 pillars functional (instructions, score, drift).
- [x] 8 tools wired to commands + tree view.
- [x] 39 automated tests passing.
- [ ] Manual test on 5 real projects (Next.js, Nest, Python, Go, monorepo).
- [ ] Marketplace icon + screenshots.
- [ ] README polished + landing page (single static HTML at minimum).

**Gate to Phase 1**
- All 3 pillars work without a single fatal bug on the 5 test projects.
- Generated `CLAUDE.md` is rated "useful" by 5/5 devs in informal review.
- Activation < 200ms; scan < 2s on 10k files.

**Kill criterion**
- If 3+ devs in the alpha review say "I would not install this," we revisit positioning.

---

## Phase 1 — Public launch (week 5 → week 12)

**Goal:** 1,000 weekly active projects.

**Deliverables**
- Marketplace publish (`vsce publish`).
- Open Source: GitHub repo public, MIT license.
- Launch posts: Hacker News, /r/cursor, /r/vscode, dev.to, Twitter, dev.to crosspost.
- 1 blog post: "We benchmarked 50 codebases for AI-readiness."
- First 50 design-partner devs (DM in DMs, get feedback).
- Bug-fix turnaround < 48h for first 60 days.
- Telemetry (opt-in) live for tracking metric north star.

**Gate to Phase 2**
- 1,000 WAP for 4 consecutive weeks.
- 30%+ of installs have generated AI Instructions at least once.
- 20%+ of installs have at least 1 drift event resolved.

**Kill criterion**
- < 200 WAP after 8 weeks of public launch with active marketing → **stop**, write postmortem, decide whether to pivot or shelve.

---

## Phase 2 — Polish + secondary tools (week 13 → week 24)

**Goal:** retention. Deepen the product without bloat.

**Deliverables**
- **Stack-specific instruction templates** (Next.js, NestJS, Django, Expo) — top 4 by user share.
- **Score history** (sparkline on the webview, persisted per workspace).
- **Per-target customization** (allow users to override sections of generated files).
- **Test suite improvements** (Go, Java, Rust scaffolds; better fixtures).
- **Architecture diagram improvements** (depth limit, focus on a subfolder, regen on drift).
- Promote SDD spec UX in walkthrough now that 1k devs have basic context.
- Blog: 2 posts ("Why your AI is wrong about your repo," "Drift in the wild: data from 1k projects").

**Gate to Phase 3**
- 10,000 WAP.
- 50+ paying signal (waitlist for "Team" tier) OR 1 enterprise inbound.
- < 1% weekly uninstall rate.

**Kill criterion**
- 24-week retention < 20% → product isn't sticky. Deep redesign or pivot.

---

## Phase 3 — MCP server + Team tier (week 25 → week 52)

**Goal:** monetize, expand surface beyond VS Code.

**Deliverables**
- **MCP server** (`@aitk/mcp`) — same generators exposed via MCP. Distributed via npm.
  - Works in Claude Desktop, Claude Code, Cursor, Zed, any MCP client.
  - This is the "5x addressable market" play.
- **Team tier (paid, $5–10/dev/mo)**:
  - Shared rules profile (a repo all team members consume).
  - Score dashboard (web app — first server-side component).
  - Drift digest (weekly email of drifted repos).
  - SSO + audit log.
- Pricing experiment with first 20 teams.

**Gate to Phase 4**
- $30k MRR.
- 50,000 WAP.
- Churn < 5% monthly on Team tier.

**Kill criterion**
- $0 MRR after 6 months of Team tier marketing → fall back to OSS-only and reconsider.

---

## Phase 4 — Enterprise + ecosystem (year 2)

**Goal:** ecosystem stickiness, sustainable growth.

**Deliverables**
- Enterprise: SOC 2, on-prem MCP, custom rules engine.
- **Tool marketplace** (community-contributed templates and tools).
- IDE expansion: JetBrains plugin (uses the MCP under the hood).
- Conferences: 1 talk per quarter at major dev conferences.

**Gate to Phase 5 (whatever it is)**
- $1M ARR.
- 200k WAP.
- 50 enterprise customers OR 5,000 paying teams.

---

## Anti-roadmap (things we will NOT do)

- ❌ AI features inside the extension.
- ❌ Charging for OSS features.
- ❌ Multi-language support beyond what users ask for (don't pre-build Rust support; wait).
- ❌ A web app before Phase 3.
- ❌ A mobile app. Ever.
- ❌ Selling to procurement before 50 happy paying teams.

## Kanban hygiene

- Single backlog (GitHub Project).
- WIP limit: 2 active items for the founder; 1 per other engineer.
- Every issue has a label: `pillar:instructions | pillar:score | pillar:drift | extra | infra | bug`.
- Issues without labels stay in triage.

## Quarterly cadence

| Quarter | Theme | Deliverable to public |
|---|---|---|
| Q1 (current) | Build & alpha | Marketplace launch |
| Q2 | Adoption | 1k WAP, blog series |
| Q3 | Retention | Stack templates, drift v2 |
| Q4 | Monetize | MCP + Team tier beta |

If we miss two quarterly themes in a row → the strategy is wrong, not the execution.
