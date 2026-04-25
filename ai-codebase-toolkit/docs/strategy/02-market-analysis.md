# 02 — Market Analysis

## Market sizing (rough)

- VS Code monthly active users: ~15M (Microsoft public data, 2024).
- Cursor MAUs: estimated ~500K-1M.
- Devs paying for an AI assistant (Copilot/Cursor/Q/Claude): conservative 5M, optimistic 15M.
- Devs frustrated enough with context to install a tool for it: estimate 5-10% of paying = **250K – 1.5M addressable**.
- Realistic 18-month capture: 0.5-2% = **5K – 30K active users**.

This is **not a billion-dollar TAM**. It's a defensible niche of a hot category. That's fine — most successful dev tools start there.

## Competitive landscape

### Direct (do the same thing)

| Player | Strength | Weakness | Our edge |
|---|---|---|---|
| **Hand-written `CLAUDE.md`** | Free, in user control | Out of date in 1 sprint | We auto-maintain, multi-target |
| **Cursor's "Generate rules"** | Built into editor | Cursor-only, generic template | Multi-target, drift, project-specific |
| **`generate-cursorrules` CLIs** | Many exist on GitHub | Single-target, no UI, no drift | UI, drift, multi-target |
| **GitHub Copilot context API** | Native, automatic | Heuristic, not user-controllable | Explicit, repo-versioned |

### Indirect (solve the same dev pain differently)

| Player | What they do | How they steal our user |
|---|---|---|
| **Claude Code memory** | LLM-side memory of project | Devs feel Claude "just knows" → don't bother with files |
| **Copilot enterprise context** | Server-side index of repo | Same logic |
| **Sourcegraph Cody** | Index + search, context-aware | "Just install Cody, it figures it out" |
| **Better prompting habits** | Devs learn to give context | "I don't need a tool for this" |

### Adjacent (could pivot in)

- **Plop / Yeoman generators** — could add AI-aware mode.
- **Nx generators** — already opinionated about structure, could add AI files.
- **Continue.dev** — IDE-side AI, could ship "context manager".
- **Anthropic / OpenAI / GitHub** — first-party tool any time they want.

## Where competitors lose (our wedge)

1. **Multi-target.** No competitor generates for 5 assistants in one click. Devs use multiple AIs (Copilot for code, Claude for thinking, Q for AWS) and want them all aligned.
2. **Drift detection.** Nobody else monitors staleness. The 80% case is "I generated CLAUDE.md 6 months ago and forgot about it."
3. **Score / gamification.** Lighthouse-style number is unique in this niche.
4. **Provider-agnostic.** We stay neutral — incumbents will not.
5. **Open source.** Cursor/Copilot/Q tools are closed. We can be auditable.

## Where we lose (be honest)

1. **Vendor-native is always one step ahead.** Cursor knows when its own format changes; we follow.
2. **Native tools have install friction = 0.** We require an extension install + permissions.
3. **First-party brand trust.** "Trust this random extension to write to my repo" is a hurdle.
4. **No marketing budget vs Microsoft / Anthropic / Cursor.**

## Threats ranked

| Threat | Probability | Impact | Time horizon |
|---|---|---|---|
| Cursor adds multi-target export | Medium | High | 6-12 months |
| Anthropic ships official `claude init` CLI | High | Medium (we win on multi-target) | 3-9 months |
| GitHub adds "generate copilot-instructions" | High | Low (we already do it) | 3-6 months |
| AGENTS.md adoption stalls | Medium | Medium (we lose vendor-neutral story) | unknown |
| Copilot/Cursor context becomes so good that explicit files don't matter | Low-medium | Existential | 18-36 months |

The last one is the existential threat. **If LLMs become so good at indexing repos that no explicit context file is needed, this whole category dies.** Bet: that won't happen for 3+ years because (a) explicit > implicit for compliance/auditability, (b) every assistant still recommends explicit context files in 2026.

## Adjacent markets we should NOT chase

- **AI prompt management** (PromptLayer, Helicone). Different buyer.
- **AI evaluation / observability** (Braintrust, Langfuse). Different buyer.
- **Code generation platforms** (v0, bolt). We are the opposite.
- **Internal developer platforms** (Backstage). Too heavy.

## Customer segmentation

| Segment | Size | Willingness to pay | Notes |
|---|---|---|---|
| **Solo devs / OSS maintainers** | Largest | Low (free forever) | Volume, advocacy, contributors |
| **Small teams (2-15 devs)** | Big | Medium ($5-10/dev/mo) | Sweet spot for paid Team tier |
| **Mid-market (15-200 devs)** | Medium | High ($10-25/dev/mo) | Buy for governance/standardization |
| **Enterprise (200+)** | Small | Very high (annual contracts) | Slow sale, high value |

Phase 1 ignores enterprise. Phase 4 considers it.

## What this means

- **Phase 1: free OSS, single-product.** Win on adoption + advocacy.
- **Phase 2: build moats** that incumbents can't easily copy (drift, multi-target).
- **Phase 3: paid Team layer** for the small/mid segment.
- **Phase 4: revisit enterprise / MCP** based on real signal.
