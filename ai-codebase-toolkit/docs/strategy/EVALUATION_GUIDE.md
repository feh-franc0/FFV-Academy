# 🧪 Evaluation Guide

> Use this when you sit down later to **review the entire project critically**.
> Walk through each section. Mark the checkboxes as you go.

---

## How to use this guide

1. Open this file alongside the strategy docs.
2. Each section asks a question, points you to evidence, and gives a checkbox.
3. **At the end you decide:** continue, pivot, or shelve.
4. Add your conclusions at the bottom (`## Final verdict`).

There are intentionally **no recommended answers**. The point is for *you* to decide.

---

## Part A — Does the idea hold up?

### A1. Is the value proposition real or wishful?
- 📖 Read: [`01-vision-and-positioning.md`](./01-vision-and-positioning.md) (whole doc, focus on "Brutal self-critique").
- ❓ Ask yourself: **without our marketing, would Marina (the persona) install this if she stumbled on it?**
- ❓ Is the pain ("re-explain my project to AI again and again") something **you** have personally felt in the last 30 days?
- ✅ Verdict:
  - [ ] Real — proceed.
  - [ ] Maybe — needs validation (run Experiment 1 in doc 08 first).
  - [ ] Wishful — kill / pivot.

### A2. Are the 3 pillars actually distinct from competitors?
- 📖 Read: [`02-market-analysis.md`](./02-market-analysis.md), section "Where we lose."
- ❓ Has Cursor or Copilot shipped a multi-target generator since you wrote this? (Check today.)
- ❓ Is anyone else doing **drift detection on AI context files**? (Search GitHub for "CLAUDE.md drift".)
- ✅ Verdict:
  - [ ] Distinct — proceed.
  - [ ] Already commoditized — refocus on remaining moat or kill.

### A3. Are the personas plausible?
- 📖 Read: [`04-personas-and-jobs.md`](./04-personas-and-jobs.md).
- ❓ Do you know **3 real people** who match Marina or Carlos?
- ❓ Have you **shown them this and gotten honest feedback**?
- ✅ Verdict:
  - [ ] Yes, real people excited — proceed.
  - [ ] Hypothetical — book 5 user interviews this week.

---

## Part B — Is the scope right?

### B1. Are the 3 pillars enough?
- 📖 Read: [`03-product-scope.md`](./03-product-scope.md), pillar sections.
- ❓ If the extras (SDD, ADR, tests, diagrams) all disappeared, would the product still be valuable?
- ❓ If the answer is yes → are the extras worth maintaining?
- ✅ Verdict:
  - [ ] Pillars carry it — extras are bonus, keep low-maintenance.
  - [ ] Pillars insufficient — what's missing?

### B2. Did we cut the right things?
- 📖 Read: [`12-decision-log.md`](./12-decision-log.md), entries D-004 and D-006.
- ❓ Does the cut "Module Flowchart" still feel right, or could it differentiate us?
- ❓ Is "Generate Docs Site" really a v0.2 feature, or should it ship?
- ✅ Verdict:
  - [ ] Cuts hold — proceed.
  - [ ] Reverse a cut — log a new decision in doc 12.

---

## Part C — Can we actually build & ship it?

### C1. Is the architecture sound?
- 📖 Read: [`05-architecture.md`](./05-architecture.md).
- ❓ Are the layers respected in the actual code? (Check: does `src/scanner/` import from `vscode`? It shouldn't.)
- ❓ Is the test coverage on logic actually 90%+? (Run `npm run test:coverage`.)
- ✅ Verdict:
  - [ ] Clean — proceed.
  - [ ] Drift detected — issue follow-up tasks.

### C2. Can a solo founder execute this?
- 📖 Read: [`06-organogram-and-roles.md`](./06-organogram-and-roles.md).
- ❓ How many hours/week can you realistically commit?
- ❓ What's the very first thing you'll delegate? When?
- ✅ Verdict:
  - [ ] Sustainable — proceed.
  - [ ] Will burn out — adjust roadmap pace or get a co-conspirator.

---

## Part D — Will anyone notice?

### D1. Is the launch plan realistic?
- 📖 Read: [`11-go-to-market.md`](./11-go-to-market.md), launch playbook.
- ❓ Do you have access to the channels listed (HN, /r/cursor, dev.to, Twitter following)?
- ❓ Do you have **5 design partners** lined up to install on day 1?
- ✅ Verdict:
  - [ ] Yes — proceed.
  - [ ] Need to build network first — delay launch by 4 weeks for outreach.

### D2. Are the metrics measurable today?
- 📖 Read: [`10-metrics-and-success.md`](./10-metrics-and-success.md).
- ❓ Without telemetry (which is v0.2), how will you actually count WAP at month 3?
- ❓ Marketplace stats give installs, not WAP. What's the proxy?
- ✅ Verdict:
  - [ ] Have a plan (qualitative interviews + GitHub stars + npm downloads of MCP) — proceed.
  - [ ] Need to instrument first — add telemetry to v0.1.

---

## Part E — What kills us?

### E1. Top risks
- 📖 Read: [`09-risks-and-mitigations.md`](./09-risks-and-mitigations.md).
- ❓ For the top 3 risks (R1, R2, R3), is the mitigation **already implemented** in the code?
- ❓ For R5 (founder burnout) — is your time-box discipline **already in place**?
- ✅ Verdict:
  - [ ] Mitigations real — proceed.
  - [ ] Mostly aspirational — schedule mitigations as actual tasks.

### E2. Pre-mortem
- 📖 Read: [`09-risks-and-mitigations.md`](./09-risks-and-mitigations.md), "Pre-mortem" section.
- ❓ Of the 3 most likely failure causes, which one are you most exposed to **right now**?
- ❓ What ONE action this week would reduce that exposure?

---

## Part F — Validation gates

Before doing anything else, **the validation plan asks for proof**:
- 📖 Read: [`08-validation-plan.md`](./08-validation-plan.md).
- 📋 Status check:
  - [ ] Experiment 1 — Landing page (week 0) — ☐ done / ☐ pending
  - [ ] Experiment 2 — Score effect on AI quality (week 6) — ☐ done / ☐ pending
  - [ ] Experiment 3 — Drift sensitivity (week 8) — ☐ done / ☐ pending
  - [ ] Experiment 4 — Team waitlist (week 16) — ☐ done / ☐ pending

> If Experiment 1 hasn't even been run yet and you've started writing more code, **stop**. Run E1 first.

---

## Part G — Operational health

### G1. Build, lint, tests
- ❓ When was the last time you ran `npm run build`?
- ❓ When was the last time you ran `npm test`?
- ❓ When was the last time you ran `npm run lint`?
- ✅ All three should be ✅ before any push.

### G2. Documentation drift
- ❓ Do the strategy docs still reflect the actual state of the product? (e.g. did you ship a tool that's not mentioned in doc 03?)
- ❓ Has the decision log been updated with any new strategic choice in the last 30 days?

---

## Final verdict

> Fill this in **after** going through every section. Be honest with yourself.

```
Date of evaluation: ____________
Hours since last edit to the codebase: ____________

Continue / Pivot / Shelve: ____________

Top 3 reasons:
1.
2.
3.

Top 3 actions for the next 7 days:
1.
2.
3.

If I had to bet money: this project succeeds with probability ___% .
```

---

## Recurring evaluation cadence

Run this evaluation:
- After every roadmap-phase completion.
- Every 3 months regardless of phase.
- Whenever you feel "off" about the direction.

Don't skip the cadence even if everything feels great. **Especially** then.
