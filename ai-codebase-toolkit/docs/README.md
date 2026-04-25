# 📚 Documentation Index

Entry point for everything in this repo. Read top-to-bottom or jump to what you need.

---

## 🎯 If you have 5 minutes
Read just these:
1. [`/README.md`](../README.md) — the product pitch.
2. [`strategy/00-overview.md`](./strategy/00-overview.md) — strategic TL;DR.
3. [`strategy/EVALUATION_GUIDE.md`](./strategy/EVALUATION_GUIDE.md) — what to evaluate.

## 📖 If you have 30 minutes
Add:
4. [`strategy/01-vision-and-positioning.md`](./strategy/01-vision-and-positioning.md) — vision + brutal self-critique.
5. [`strategy/03-product-scope.md`](./strategy/03-product-scope.md) — what's in/out and why.
6. [`strategy/09-risks-and-mitigations.md`](./strategy/09-risks-and-mitigations.md) — what kills the project.

## 🧠 Full deep dive (2–3 hours)
Read every doc in `strategy/` in order (00 → 12).

---

## 🗂️ Map of every artifact

### Product (root)
| File | Purpose |
|------|---------|
| [`/README.md`](../README.md) | Public-facing product pitch (3 pillars + extras). |
| [`/CHANGELOG.md`](../CHANGELOG.md) | Version history. |
| [`/LICENSE`](../LICENSE) | MIT. |
| [`/package.json`](../package.json) | Extension manifest, commands, walkthrough, settings. |

### Strategy docs (`docs/strategy/`)
| # | Doc | What it answers |
|---|-----|-----------------|
| 00 | [Overview](./strategy/00-overview.md) | Index + TL;DR + kill criterion. |
| 01 | [Vision & Positioning](./strategy/01-vision-and-positioning.md) | What we are, what we are not, brutal critique. |
| 02 | [Market Analysis](./strategy/02-market-analysis.md) | TAM, competitors, threats, segments. |
| 03 | [Product Scope](./strategy/03-product-scope.md) | Per-tool keep/cut/defer verdict. |
| 04 | [Personas & Jobs](./strategy/04-personas-and-jobs.md) | Marina + Carlos, JTBD, anti-personas. |
| 05 | [Architecture](./strategy/05-architecture.md) | Layered design, principles, performance budget. |
| 06 | [Organogram & Roles](./strategy/06-organogram-and-roles.md) | Hats by phase, RACI, hiring triggers. |
| 07 | [Roadmap](./strategy/07-roadmap.md) | 5 phases with explicit gates and kill criteria. |
| 08 | [Validation Plan](./strategy/08-validation-plan.md) | 6 hypotheses, 4 experiments, falsification criteria. |
| 09 | [Risks & Mitigations](./strategy/09-risks-and-mitigations.md) | 12 risks ranked, pre-mortem. |
| 10 | [Metrics & Success](./strategy/10-metrics-and-success.md) | North star (WAP), pyramid, counter-metrics. |
| 11 | [Go-to-Market](./strategy/11-go-to-market.md) | Channels, launch playbook, pricing. |
| 12 | [Decision Log](./strategy/12-decision-log.md) | Strategic decisions with reversal triggers. |

### Code architecture (`src/`)
See [`strategy/05-architecture.md`](./strategy/05-architecture.md) for the layered design.

```
src/
├── core/         # types, logger
├── utils/        # fs, git
├── scanner/      # static analysis → ScanResult
├── drift/        # manifest hash + watcher
├── generators/   # one module per tool
├── tools/        # registry (drives sidebar)
├── providers/    # status bar, tree view, webviews, quickpicks
├── commands/     # VS Code command handlers
└── extension.ts  # activation
```

### Tests (`tests/`)
- 8 suites, 39 tests, all green.
- Coverage: 90–100% on logic (scanner, generators, drift, utils).
- Run with `npm test` or `npm run test:coverage`.

### VS Code walkthrough (`media/walkthrough/`)
4 markdown files used by the in-IDE Getting Started walkthrough.

---

## 🧭 By question

**"What does this product do?"** → [`/README.md`](../README.md)

**"Is this idea any good?"** → [`strategy/01-vision-and-positioning.md`](./strategy/01-vision-and-positioning.md) (self-critique section)

**"Who is this for?"** → [`strategy/04-personas-and-jobs.md`](./strategy/04-personas-and-jobs.md)

**"What about competition?"** → [`strategy/02-market-analysis.md`](./strategy/02-market-analysis.md)

**"How is the code organized?"** → [`strategy/05-architecture.md`](./strategy/05-architecture.md)

**"What ships when?"** → [`strategy/07-roadmap.md`](./strategy/07-roadmap.md)

**"How will I know it's working?"** → [`strategy/10-metrics-and-success.md`](./strategy/10-metrics-and-success.md) + [`strategy/08-validation-plan.md`](./strategy/08-validation-plan.md)

**"What could kill this project?"** → [`strategy/09-risks-and-mitigations.md`](./strategy/09-risks-and-mitigations.md)

**"Why was X decided?"** → [`strategy/12-decision-log.md`](./strategy/12-decision-log.md)

**"Should I hire someone?"** → [`strategy/06-organogram-and-roles.md`](./strategy/06-organogram-and-roles.md)

**"How do I launch this?"** → [`strategy/11-go-to-market.md`](./strategy/11-go-to-market.md)

---

## 📊 Project stats (snapshot)

| Metric | Value |
|--------|-------|
| Source files | 25 TS modules |
| Test files | 8 suites · 39 tests · all green |
| Strategy docs | 13 docs · ~1,434 lines |
| Runtime dependencies | **0** |
| Build status | ✅ Clean |
| Lint status | ✅ Clean |
| Tools shipped | 8 (3 pillars + 5 extras) |
| Supported AI assistants | 5 (Claude · Cursor · Copilot · Amazon Q · AGENTS.md) |
