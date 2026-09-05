# Eval: Draft-first

## Purpose

Verify that incomplete PM intent produces a substantive PRD draft before broad clarification when useful drafting is still possible.

## Eval type

Capability

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`

## Scenario / Inputs

A workspace product lets Owners invite members. Current product context:

- Owners can create invitations.
- Owners can revoke pending invitations.
- Pending invitations remain active until accepted or revoked.

PM intent:

> We want Owners to be able to temporarily pause new member invitations. The pause duration and what happens to already-pending invitations are not decided yet.

Execute the PRD Draft + Clarification workflow for this change.

## Expected invariants

- The response contains a substantive PRD draft before any broad clarification request.
- The draft makes meaningful progress on the problem, intended outcome, scope, required behavior, and acceptance constraints that can be established from the supplied input.
- Missing decisions do not prevent drafting the parts that are already grounded.
- Any clarification is limited to material unresolved decisions rather than replacing the draft with a questionnaire.

## Explicit failure conditions

Fail if any of the following is true:

- The response is primarily a questionnaire or intake request and does not contain a substantive PRD draft.
- The draft is only a skeleton dominated by `TBD` placeholders despite enough context to make meaningful progress.
- The AI asks the human to restate current-product facts already supplied in the scenario instead of using them.

## Recommended grading approach

LLM judge

Judge whether the output is materially draft-first and useful, independent of exact headings, wording, or formatting.
