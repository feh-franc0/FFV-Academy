# 04 — Personas & Jobs to be Done

## Why personas matter here

Different devs have different jobs. If we build for "all devs" we build for none. We design for **two primary personas** and let everyone else benefit.

## Primary personas

### P1 — "Marina, the multi-AI senior dev" (PRIMARY BUYER)
- **Role:** senior fullstack at a mid-size SaaS.
- **Stack:** Next.js + NestJS + Postgres.
- **AIs used:** Claude Code (thinking), Copilot (autocomplete), Amazon Q (AWS).
- **Pain:**
  - Each AI gives slightly different suggestions because each has different context.
  - She's manually copy-pasted the same project briefing into 3 chats this month.
  - Wrote a `CLAUDE.md` 4 months ago, but the project moved on.
- **What she'd pay for:** a tool that aligns all 3 AIs to her project, automatically.
- **Acquisition channel:** Twitter, dev newsletters, /r/cursor, Hacker News.
- **Adoption blocker:** "Yet another extension." Needs to see value within 60 seconds.

### P2 — "Carlos, the team lead" (SECONDARY BUYER, ENABLER)
- **Role:** tech lead, team of 6.
- **Stack:** mixed — frontend devs use Cursor, backend devs use Copilot, the principal uses Claude Code.
- **Pain:**
  - Inconsistent code quality because each dev's AI gives different patterns.
  - New hires take 2 weeks to "understand the codebase" — would love AI to onboard them.
  - Has to sell the team on adopting any new tool.
- **What he'd pay for:** team-level rules profile, dashboards showing each repo's AI-readiness, weekly drift reports.
- **Acquisition channel:** referral from Marina (his best dev), conference talks.
- **Adoption blocker:** has to convince the team and security/compliance.

## Secondary personas (benefit but not designed for)

### P3 — Solo OSS maintainer
- Loves it, will tweet about it, won't pay.
- **Role:** advocacy + contributors.

### P4 — Junior dev / student
- Doesn't yet feel the pain of context drift.
- **Role:** future user when they grow into senior.

### P5 — Engineering manager
- Doesn't write code daily. Cares about team metrics.
- **Role:** future buyer of Team tier.

## Anti-personas (we ignore)

- **Devs who don't use AI assistants.** Not our market.
- **Devs in regulated environments without LLM permissions.** Different problem.
- **Devs married to one assistant.** They get value from `.cursorrules` autogen but won't appreciate multi-target.

## Jobs to be Done (Marina's perspective)

| When… | I want to… | So I can… |
|---|---|---|
| I clone a new repo | give my AI an instant briefing | not waste 20 min explaining context |
| I onboard onto a project | get the AI to onboard *me* in parallel | learn faster |
| I switch AI assistant | have my new one understand the project the same way | not redo setup |
| I add a new framework | propagate that to all my AI files | not get conflicting suggestions |
| I write a complex feature | give the AI explicit acceptance criteria | get correct code first try |
| I review my AI's output | check it against the project's actual patterns | catch off-style code |
| I open my project after 3 months | trust that the AI context still matches | not be misled |

## Jobs to be Done (Carlos's perspective)

| When… | I want to… | So I can… |
|---|---|---|
| A new dev joins | hand them a setup that makes their AI useful day 1 | shorten onboarding |
| Code reviews diverge by author | enforce shared AI rules | reduce style nits |
| I audit our AI usage | see which repos are well-configured | spot risk |
| Compliance asks "what context goes to AI?" | show them committed files | answer transparently |

## Adoption funnel by persona

### Marina
1. Sees tweet / install link. (5s)
2. Installs extension. (10s)
3. Opens a project. (immediate)
4. Welcome notification → "Generate Instructions" — clicks. (30s)
5. Sees her CLAUDE.md generated, is impressed. (1 min)
6. Tries her usual AI prompt. Gets better answer. (5 min)
7. Tweets about it. (acquisition flywheel)

If step 5 isn't impressive — game over. **The first generated file must look professional.**

### Carlos
1. Marina shows him the score on her project.
2. He scans his team's repos. Most are < 50.
3. He shares the score with the team. They compete.
4. After 2 months, he asks "is there a team version?" → upsell trigger.

## Failure modes

- Marina installs, generates `CLAUDE.md`, sees a generic file → uninstalls.
- Marina gets a drift notification at the wrong moment → disables it.
- Carlos can't find a "team rules" feature → loses interest before v0.3 ships.

Each of these is a tracked metric in doc 10.
