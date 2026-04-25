# Strategy — Overview

> Critical, end-to-end planning documents for **AI Codebase Toolkit**.
> Read in order. Each doc challenges the previous one.

## Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Vision & Positioning](./01-vision-and-positioning.md) | What we are, what we are not, brutal critique of the pitch. |
| 02 | [Market Analysis](./02-market-analysis.md) | Competitors, alternatives, where we lose, where we win. |
| 03 | [Product Scope](./03-product-scope.md) | Per-tool critique: keep / cut / defer. |
| 04 | [Personas & Jobs to be Done](./04-personas-and-jobs.md) | Who buys, who installs, who actually uses, who blocks. |
| 05 | [Architecture](./05-architecture.md) | Technical decisions and trade-offs. |
| 06 | [Organogram & Roles](./06-organogram-and-roles.md) | Hats today, hats at 10 / 100 / 1000 users, RACI. |
| 07 | [Roadmap](./07-roadmap.md) | Phased milestones with explicit gates and kill criteria. |
| 08 | [Validation Plan](./08-validation-plan.md) | How we know if this is real before we burn 6 months. |
| 09 | [Risks & Mitigations](./09-risks-and-mitigations.md) | What kills us. Ranked. With concrete mitigations. |
| 10 | [Metrics & Success](./10-metrics-and-success.md) | Leading vs lagging indicators. North star. |
| 11 | [Go-to-Market](./11-go-to-market.md) | Distribution, pricing, launch playbook. |
| 12 | [Decision Log](./12-decision-log.md) | ADRs for strategy choices. |

## How to use

- **First read of a quarter:** docs 01 → 03 → 09 (positioning, scope, risks).
- **Before building anything new:** doc 03 (does it survive the critique?).
- **Before hiring or delegating:** doc 06.
- **Before a launch:** docs 08 → 11.

## TL;DR

- The product has **3 pillars**: multi-target instructions, AI-readiness score, drift detection. Everything else is decoration.
- The **defensible moat** is drift + multi-target. The score is the viral hook.
- **Biggest risk**: Cursor/Copilot/Claude ship native equivalents of pillar 1. We have ~12 months.
- **MVP success criterion**: 1,000 weekly active users within 90 days of public launch with no paid marketing.
- If we can't get 50 design-partner installs in the first 3 weeks of soft launch, **we kill the project**.
