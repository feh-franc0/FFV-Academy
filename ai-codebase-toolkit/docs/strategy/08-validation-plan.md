# 08 — Validation Plan

> Building is cheap. Building the wrong thing is expensive. Validate before scale.

## What we are validating

| # | Hypothesis | Why it matters | How we test |
|---|------------|----------------|-------------|
| H1 | Devs care about a generated `CLAUDE.md` (vs writing it themselves). | Pillar 1 demand. | Cold landing page: "Generate AI files for your project. Email me when ready." Measure signups. |
| H2 | The score visibly changes behavior. | Pillar 2 retention. | A/B during alpha: half of users see the score, half don't. Compare 7-day return rate. |
| H3 | Drift notifications are appreciated, not annoying. | Pillar 3 retention. | Track dismiss rate vs action rate. Target: action rate > 40%. |
| H4 | A higher score = better AI output. | The whole thesis. | Side-by-side: same prompt, scored 30 vs scored 85 codebase. Blind rating by 10 devs. |
| H5 | Multi-target is a real value (not just multi-target as a checkbox). | Differentiation. | Ask 30 devs how many AI assistants they use weekly. Median ≥ 2 = validated. |
| H6 | Team leads will pay for shared rules. | Phase 3 viability. | Cold outreach to 20 teams. "Would you pay $5/dev/mo for X?" Get 5 verbal yeses. |

## Validation gates per phase

### Phase 0 → Phase 1 gate
- H1: 100+ landing-page signups before launch.
- H2: not yet — needs aggregated data.
- H3: 10 alpha users have at least 1 drift event each, dismiss rate < 60%.
- H4: pilot with 3 devs, blind comparison, anecdotal "yes it's better."

### Phase 1 → Phase 2 gate
- H1: 1k WAP confirms demand.
- H2: 7-day return rate of users who saw score ≥ 60%.
- H3: action rate > 40% as defined above.
- H4: blog post with rigorous experiment ("here's the data, scored 85 produced cleaner output 7/10 times").

### Phase 2 → Phase 3 gate
- H5: usage telemetry shows ≥ 50% of WAP have generated 2+ targets.
- H6: 5 team leads on a "pay if available" waitlist.

## Experiment templates

### Experiment 1 — Landing page (Week 0)
- Single static page: hero, 3 pillars, "Get notified" form.
- Channels: 3 tweets, 2 dev subreddits, 1 HN Show.
- Success: ≥ 100 emails in 7 days.
- Decision: < 50 → rewrite pitch and retry. < 20 second time → revisit market hypothesis.

### Experiment 2 — Score effect on AI quality (Week 6)
- Pick 10 real-world repos.
- For each: run an identical task ("add a `health` endpoint following project patterns") with Claude Code.
  - Round A: as-is, score ~30–50.
  - Round B: after running our toolkit, score ~80+.
- Have 5 senior devs blind-rate the outputs.
- Success: B wins ≥ 65% of comparisons.
- Decision: if B doesn't clearly win, our entire thesis is wrong. Stop and rethink.

### Experiment 3 — Drift sensitivity (Week 8)
- Auto-trigger drift on 50 alpha users.
- Track: notification → click rate, dismiss rate, "regenerate" rate.
- Success: action rate > 40%.
- Decision: < 20% → strip drift to opt-in, demote from pillar.

### Experiment 4 — Team waitlist (Week 16)
- Email ALL users who installed via team-shared link with: "Are you a team lead? Want a Team tier?"
- Light landing page describing Team features.
- Success: ≥ 30 form submissions, 5 willing to pay verbally.
- Decision: < 10 → defer Team tier indefinitely.

## User research cadence

- **Weeks 0–4 (alpha):** 5 design-partner interviews (1h each, recorded with consent). Open-ended: pain, current workflow, reactions to generated files.
- **Months 1–3 (post-launch):** 3 interviews per month, biased toward devs who installed but didn't return.
- **Months 4+:** 5 interviews per month, half churned-paying, half active.

Interview questions are documented in a separate runbook (not this doc).

## What "wrong" data looks like

We must distinguish noise from signal:

- **Spike from a single tweet ≠ product-market fit.** Wait 4 weeks for retention data.
- **High install + low usage = curiosity, not value.** Track activation (= ran any command), not install count.
- **Loud feedback from 3 users isn't a roadmap.** Wait for the same request from 3 independent threads.

## Falsification criteria (when we admit defeat)

We ship the project to "maintenance only" if **any** of:
- 12 weeks of public availability with < 500 WAP.
- Score experiment (H4) fails.
- A first-party tool (Cursor / Claude / Copilot) ships an equivalent multi-target generator AND drift detection within v0.1's first quarter.

## Validation outputs

For each experiment we produce:
- A 1-page write-up (hypothesis → method → result → decision).
- Lives in `docs/strategy/experiments/<NN>-<title>.md`.
- Linked from the relevant gate in the Roadmap doc.

This is non-negotiable. We do not advance phases without written experiment evidence.
