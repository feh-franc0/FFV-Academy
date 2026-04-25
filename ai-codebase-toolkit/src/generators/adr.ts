import { GeneratedFile } from '../core/types';

export interface AdrInput {
  title: string;
  folder: string;
  number: number;
}

function pad(n: number): string {
  return n.toString().padStart(4, '0');
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * MADR-style Architecture Decision Record.
 * https://adr.github.io/madr/
 */
export function generateAdr(input: AdrInput): GeneratedFile {
  const filename = `${pad(input.number)}-${slug(input.title)}.md`;
  const today = new Date().toISOString().slice(0, 10);
  const content = `# ${pad(input.number)}. ${input.title}

- **Status:** Proposed
- **Date:** ${today}
- **Deciders:** _names_
- **Related specs/ADRs:** _links_

## Context and problem statement
<!-- What is the issue we are facing and why does a decision need to be made now? -->

## Decision drivers
- _driver 1_
- _driver 2_

## Considered options
1. **Option A** — _short summary_
2. **Option B** — _short summary_
3. **Option C** — _short summary_

## Decision outcome
**Chosen option:** _Option X_, because _justification_.

### Positive consequences
- _benefit 1_

### Negative consequences
- _trade-off 1_

## Pros and cons of the options

### Option A
- 👍 _pro_
- 👎 _con_

### Option B
- 👍 _pro_
- 👎 _con_

## Links
- _PR / spec / external doc_
`;

  return { path: `${input.folder}/${filename}`, content };
}
