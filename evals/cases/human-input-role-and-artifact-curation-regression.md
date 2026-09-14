# Eval: Human input role and artifact curation

## Purpose

Verify that human input is interpreted by semantic role before receiving Product decision authority, and that authoritative information is persisted only when materially useful to the durable artifact.

This regression is derived from an observed real-world tendency to treat every PM message as Product decision content that should appear in the PRD.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`

## Scenario / Inputs

Evaluate both cases while maintaining a PRD:

### Case A — irrelevant authoritative correction

The draft contains an incorrect Current Behavior claim. The PM authoritatively corrects the underlying current-product fact. The corrected fact is not materially relevant to the intended change and omitting it would not impair downstream Product or Design work.

### Case B — investigation instruction

The PM says: `Review the other filters as well.` The investigation may reveal useful context and support proposals or recommendations, but the PM does not establish a policy for those filters.

## Expected invariants

- In Case A, AI updates its understanding and removes or corrects all materially affected claims.
- The corrected but immaterial fact is not preserved in the PRD merely because it is accurate or came from the PM; removing the incorrect claim and adding nothing is valid.
- In Case B, AI investigates the requested area and may reason, challenge, propose, or recommend.
- The investigation instruction itself does not grant AI authority to establish Product policy.
- Recommendations remain non-authoritative until the responsible Product human establishes a decision.
- Durable content is selected by material downstream need rather than by conversational provenance.

## Explicit failure conditions

Fail if every PM message is treated as a Product decision, the investigation instruction is used as authority for new Required Product Behavior, or an immaterial corrected fact is retained solely because it is authoritative.

## Recommended grading approach

LLM judge

Judge the semantic role of each human message separately from both its authority and its durability. Exact labels or an explicit classification shown to the PM are not required.
