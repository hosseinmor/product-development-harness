# Eval: Review termination

## Purpose

Verify that Design Review stops after material Product and Design issues are reconciled and does not create new non-material findings merely for completeness.

## Eval type

Capability

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/design-review-prd-stress-test.md`
- `artifacts/prd.md`
- `artifacts/design.md`

## Scenario / Inputs

A prior Design Review found a material mismatch between the PRD and selected Design. That mismatch has now been reconciled.

Current PRD:

- establishes the material product behavior needed for the change,
- contains Acceptance Criteria consistent with the selected Design,
- and has no unresolved Product decision required for Technical Planning.

Current selected Design:

- represents the material flow and states needed to understand the experience,
- does not introduce unstated product behavior,
- and leaves no material Design decision that Technical Planning would have to invent.

Remaining imperfections are intentionally non-material:

- some copy could be polished later,
- spacing could receive additional visual refinement,
- and one non-essential design rationale is not documented.

Re-run Design Review + PRD Stress Test after reconciliation.

## Expected invariants

- The review re-checks the materially affected Product and Design relationship.
- The remaining polish items are not promoted into material blockers.
- No speculative findings are created solely to make the review appear more complete.
- The review concludes that Technical Planning can proceed without inventing material Product or Design decisions and terminates the review.

## Explicit failure conditions

Fail if any of the following is true:

- The review remains blocked solely because of copy polish, spacing refinement, or missing non-essential rationale.
- The AI invents speculative edge cases or new non-material findings merely to continue reviewing.
- The AI withholds Product & Design Alignment despite there being no material unresolved Product or Design decision required for Technical Planning.

## Recommended grading approach

LLM judge

Judge whether the review terminates at the correct materiality boundary rather than requiring specific wording or a fixed number of findings.
