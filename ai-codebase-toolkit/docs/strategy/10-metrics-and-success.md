# 10 — Metrics & Success

## North star

**Weekly Active Projects (WAP)** — distinct workspaces that ran any toolkit command in the last 7 days.

| Horizon | Target | Current | Action if missed |
|---|---|---|---|
| Month 3 | 1,000 | – | Re-evaluate launch channel mix. |
| Month 6 | 10,000 | – | Reassess product-market fit. |
| Month 12 | 50,000 | – | Pivot or shelve. |

## Metric pyramid

```
                 ┌────────────────────────┐
                 │   Weekly Active        │   ← North Star
                 │   Projects (WAP)       │
                 └───────────▲────────────┘
                             │
        ┌────────────────────┼────────────────────────┐
        │                    │                        │
┌───────▼────────┐   ┌───────▼────────┐   ┌──────────▼──────────┐
│ Activation     │   │ Retention      │   │ Engagement          │
│ - 1st install  │   │ - 7-day return │   │ - tools used / week │
│   → 1st cmd    │   │ - 28-day        │   │ - drift action rate│
│   < 5 minutes  │   │   return        │   │                     │
└───────▲────────┘   └───────▲────────┘   └──────────▲──────────┘
        │                    │                        │
        └────────────────────┼────────────────────────┘
                             │
                  ┌──────────▼───────────┐
                  │ Top of funnel         │
                  │ - marketplace views   │
                  │ - install rate (CTR)  │
                  └───────────────────────┘
```

## Leading vs lagging

### Leading (cheap to move, predicts outcomes)
- Install → first-command time (target: < 5 min).
- Drift notification → action rate (target: > 40%).
- Generated-file open rate (target: > 70%).
- Score view per active week (target: > 1.5).

### Lagging (harder to move, but the truth)
- WAP (north star).
- 28-day retention (target: > 35%).
- Uninstall rate (target: < 1.5%/week).
- Net Promoter Score (target: > 30).

## Counter-metrics (so we don't game the wrong thing)

- **Notification dismiss rate** — if drift action rate goes up because we spam, this catches it.
- **Time to first command** — if we make activation easier by shoving a modal in everyone's face, this catches it.
- **Tools used per session** — if we train users to obsess over score and ignore everything else, this catches it.

## Per-pillar metrics

### Pillar 1 — Instructions
- % of activations that ran `Generate Instructions`.
- Avg targets generated per project (signal of multi-AI use).
- % of generated files still present 30 days later.

### Pillar 2 — Score
- % of active workspaces with a score view in the week.
- Avg score on first scan vs last scan (improvement).
- % of "Fix" buttons clicked from score view.

### Pillar 3 — Drift
- # of drift events detected per active workspace per week.
- Action rate (regenerate / dismiss).
- Time from drift event to action.

## Telemetry plan

- **v0.1: no telemetry.** Privacy first. Use marketplace stats + GitHub stars + qualitative interviews.
- **v0.2: opt-in telemetry** through `vscode-telemetry` reporter, anonymized.
- Consent UI: clear, reversible, with what-we-collect detail.
- Data points (proposed v0.2):
  - Anonymous install ID (random UUID, stored in `globalState`).
  - Command names + counts (no payloads, no file contents).
  - Errors (sanitized stack traces).

What we will NOT collect, ever:
- File contents.
- File names beyond fixed allow-list (`package.json`, etc., and only existence flags).
- Personal info.
- Project paths.

## Reporting cadence

- **Daily:** founder glances at install/uninstall delta.
- **Weekly:** internal metrics post (Discord/Slack of team) with WAP + leading indicators + 1 anecdote.
- **Monthly:** public dev log post with selective metrics ("here's what we learned").
- **Quarterly:** full review against this doc + roadmap gates.

## Definition of done for any feature shipping

A feature is "done" only when it has:
1. A defined leading metric.
2. An instrumentation plan (or explicit reason for being un-instrumented).
3. A target value and a review date.
4. A documented kill criterion.

If a feature has been live for 90 days without hitting its target, it goes on the chopping block in the quarterly review.

## Vanity metrics we will NOT chase

- ❌ GitHub stars (nice, irrelevant).
- ❌ Marketplace install count (vanity, not a usage metric).
- ❌ Twitter followers.
- ❌ HN front page (one-time spike, doesn't translate to retention).

These are signals at most, never targets.
