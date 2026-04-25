# 06 — Organogram & Roles

> Honest about the fact that today this is one person wearing every hat.
> Defines what to delegate first, when, and to whom.

## Phase 0 — Today (1 person)

```
┌─────────────────────────────────┐
│  Founder / solo maintainer      │
│  (Fernando)                     │
└─────────────────────────────────┘
```

One person, all hats:
- Engineering (extension + scanner + generators)
- Product (scope, priorities)
- Design (UX, visuals)
- DevRel (tweets, README, walkthrough)
- Support (issues, replies)
- QA (manual testing in VS Code)

**This is fine for v0.1. It is NOT fine past v0.2.**

The single biggest risk in solo phase: **burnout from context-switching**. Documented mitigation: hard time-boxing, one focus per week.

## Phase 1 — First 1k WAP (1 person + 1 contractor)

```
┌─────────────────────────────────┐
│  Founder                        │
│  - Engineering                  │
│  - Product                      │
│  - DevRel                       │
└─────────┬───────────────────────┘
          │ contracts
┌─────────▼───────────────────────┐
│  Contract Designer (5–10 h/mo)  │
│  - Marketplace icon             │
│  - Walkthrough screenshots      │
│  - Landing page                 │
└─────────────────────────────────┘
```

First delegation: **visual design**. It's the lowest-skill match for an engineer (founders often ship ugly). $200–500/mo on a contracted designer for the assets that drive install conversion.

## Phase 2 — 1k → 10k WAP (2 people)

```
┌─────────────────────────────────┐
│  Founder (CEO/CTO hybrid)       │
│  - Product                      │
│  - Architecture / hardest code  │
│  - DevRel / community           │
└─────────┬───────────────────────┘
          │ hires
┌─────────▼───────────────────────┐
│  Engineer #1 (full-time)        │
│  - Generators                   │
│  - Test suite                   │
│  - Bug fixes                    │
│  - PR triage                    │
└─────────────────────────────────┘
```

Hire #1 = **generalist engineer**. Not a specialist. Someone who can ship features and answer support without supervision. Critical traits: VS Code extension experience or hunger to learn it; written communication; calm with ambiguity.

## Phase 3 — 10k → 50k WAP (4–6 people)

```
┌──────────────────────────────────────────┐
│  Founder (CEO)                           │
│  - Strategy, fundraising, key partners   │
└──────┬───────────────┬───────────────────┘
       │               │
┌──────▼──────┐   ┌────▼─────────┐   ┌──────────────┐
│  CTO /      │   │  Head of     │   │  DevRel /    │
│  Tech Lead  │   │  Product     │   │  Community   │
│             │   │              │   │              │
│  - Arch     │   │  - Roadmap   │   │  - Docs      │
│  - Reviews  │   │  - Research  │   │  - Talks     │
│  - Hires    │   │  - Pricing   │   │  - Discord   │
└──────┬──────┘   └──────────────┘   └──────────────┘
       │
┌──────▼──────────────────────────┐
│  2 engineers                    │
│  - Core (extension/MCP)          │
│  - Integrations (Cursor/Q/...)   │
└─────────────────────────────────┘
```

Critical hires in order:
1. CTO / Tech Lead (so founder stops being on the critical path of every PR).
2. Head of Product (when feature requests outpace prioritization capacity).
3. DevRel (when community grows past 5k members).
4. Engineer #2 (when there's revenue to support).

## Phase 4 — Team product, paid tier (10+ people)

Adds:
- **Customer Success** for paid teams.
- **Solutions Engineer** for enterprise pilots.
- **Designer** full-time (off contract).
- **Backend engineer** (when team-sync features need a server).

Avoid hiring a **Sales** person before $500k ARR. Founder + CS handles sales.

## RACI for the v0.1 → v0.2 timeframe

| Activity | Founder | Designer (contract) |
|---|---|---|
| Architecture decisions | A/R | I |
| Code | R | – |
| Code review | R | – |
| Visual design (icon, screenshots) | A | R |
| Marketplace listing | A/R | C |
| Tweets, blog posts | R | C |
| Issue triage | R | – |
| User interviews | A/R | I |

Legend: R=Responsible, A=Accountable, C=Consulted, I=Informed.

## Decision authority

Until we are 3+ people, decisions follow this rule:
- **Reversible decisions:** founder decides immediately, documents in a Decision Log entry.
- **Irreversible decisions** (pricing, architecture U-turn, public deprecation): 24-hour cool-off, written analysis before commit.

## Communication cadence

### Solo phase
- Weekly: write a public dev log (build in public).
- Monthly: review metrics, decide kill/continue.

### 2+ people
- Daily async standup in Slack/Discord.
- Weekly 1h sync.
- Monthly all-hands.

## What we will NOT hire for early

- ❌ Marketing manager (founder + DevRel cover this).
- ❌ Salesperson (PLG product).
- ❌ Recruiter (no scale yet).
- ❌ Office manager.

## Cost map

| Phase | Monthly cost (lean) | Notes |
|---|---|---|
| 0 (solo) | $50 (domain, marketplace, hosting) | Founder unpaid. |
| 1 (+designer) | $300–700 | Contract designer + tools. |
| 2 (+1 engineer) | $8k–12k | Engineer salary dominates. |
| 3 (4–6 people) | $40k–60k | Real burn. Needs revenue or funding. |
| 4 (10+) | $120k+ | Series A territory. |

## Triggers for moving to next phase

| → Phase | Trigger |
|---|---|
| → 1 | Public launch + first 100 installs. |
| → 2 | 1k WAP sustained for 4 weeks AND first paying signal (waitlist of 50+). |
| → 3 | 10k WAP AND $5k MRR OR funded round. |
| → 4 | $30k MRR AND 50k WAP. |

If we hit a phase trigger but lack confidence, **we don't hire**. Bringing in people without product-market fit makes both worse.
