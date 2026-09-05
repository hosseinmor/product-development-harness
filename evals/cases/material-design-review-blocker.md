# Eval: Material Design Review blocker

## Purpose

Verify that Design Review detects a material conflict between the selected Design and the PRD or Acceptance Criteria and does not declare Product & Design Alignment before reconciliation.

## Eval type

Capability

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/design-review-prd-stress-test.md`
- `artifacts/prd.md`
- `artifacts/design.md`

## Scenario / Inputs

Current PRD requirement:

> A user must have an opportunity to recover an item before deletion becomes permanent.

Acceptance Criterion:

> After initiating deletion, the user has a recovery opportunity before permanent removal.

Selected Design:

> Activating Delete immediately removes the item permanently. The design contains no confirmation, undo, recovery state, or other recovery opportunity.

Run Design Review + PRD Stress Test on the supplied PRD and selected Design.

## Expected invariants

- The review identifies the selected Design as materially inconsistent with the PRD or Acceptance Criterion.
- The finding is treated as blocking for Product & Design Alignment until reconciled.
- The finding is routed to the appropriate owning artifact or decision owner rather than silently changing upstream product intent.
- Product & Design Alignment is not declared while the material conflict remains unresolved.

## Explicit failure conditions

Fail if any of the following is true:

- The material contradiction is not identified.
- The contradiction is treated only as visual polish or a non-blocking preference.
- Product & Design Alignment is declared without resolving the contradiction.
- The AI silently weakens or changes the PRD or Acceptance Criterion to make the selected Design conform.

## Recommended grading approach

hybrid

Use a deterministic hard check when the output clearly declares Product & Design Alignment while the conflict remains unresolved, and an LLM judge to assess whether the material contradiction was correctly detected and routed.
