import { GeneratedFile } from '../core/types';

export interface SddInput {
  title: string;
  folder: string; // e.g. docs/specs
  number: number; // sequence
}

function pad(n: number): string {
  return n.toString().padStart(4, '0');
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Generates a Spec-Driven Development spec following a professional template:
 * problem → goals → non-goals → users → use cases → functional reqs → NFRs →
 * data model → API contracts → risks → acceptance criteria → rollout.
 */
export function generateSddSpec(input: SddInput): GeneratedFile {
  const filename = `${pad(input.number)}-${slug(input.title)}.md`;
  const today = new Date().toISOString().slice(0, 10);
  const content = `# SPEC-${pad(input.number)} — ${input.title}

> **Status:** Draft &nbsp;·&nbsp; **Owner:** _TBD_ &nbsp;·&nbsp; **Created:** ${today}

## 1. Problem
<!-- What real problem are we solving? Who feels it and how often? -->

## 2. Goals
- [ ] _Measurable goal 1_
- [ ] _Measurable goal 2_

## 3. Non-goals
- _What we explicitly are NOT solving in this spec._

## 4. Users & personas
| Persona | Need | Frequency |
|---------|------|-----------|
| _e.g. Backend dev_ | _e.g. ship a feature with confidence_ | _daily_ |

## 5. Use cases
1. **UC-1 — _Title_**
   - **Actor:** _user role_
   - **Pre-conditions:** _state required_
   - **Main flow:**
     1. _step_
     2. _step_
   - **Alt flows:** _branching_
   - **Post-conditions:** _result_

## 6. Functional requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | _shall do X_ | Must |
| FR-2 | _shall do Y_ | Should |

## 7. Non-functional requirements
| ID | Category | Requirement |
|----|----------|-------------|
| NFR-1 | Performance | _e.g. p95 < 200ms_ |
| NFR-2 | Security | _e.g. OWASP ASVS L2_ |
| NFR-3 | Observability | _logs, metrics, traces_ |

## 8. Data model
\`\`\`mermaid
erDiagram
  ENTITY {
    string id PK
    string name
  }
\`\`\`

## 9. API / Contracts
\`\`\`http
POST /api/resource
Content-Type: application/json

{ "name": "string" }
\`\`\`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | _constraints_ |

## 10. Architecture impact
- Affected modules: _list_
- New dependencies: _list or none_
- Migration steps: _none / steps_

## 11. Risks & mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| _description_ | Low/Med/High | Low/Med/High | _plan_ |

## 12. Acceptance criteria (Given/When/Then)
- **Scenario 1**
  - **Given** _initial state_
  - **When** _action_
  - **Then** _expected outcome_

## 13. Rollout plan
- [ ] Behind feature flag \`spec_${pad(input.number)}_${slug(input.title).slice(0, 20)}\`
- [ ] Internal dogfood
- [ ] Canary 5% → 50% → 100%
- [ ] Cleanup flag after 2 weeks of 100%

## 14. Open questions
- [ ] _question_

---

> **AI prompt to fill this spec:**
> "Read this SDD spec and propose concrete content for each TBD section based on the codebase under \`src/\`. Stay aligned with existing ADRs in \`docs/adr/\`."
`;

  return { path: `${input.folder}/${filename}`, content };
}
