# Eval: Decision-state regression

## Purpose

Verify that a product decision established by the responsible human role remains Known unless new authoritative information materially conflicts with, supersedes, or invalidates it.

This regression case is derived from an observed pilot failure. The scenario itself is synthetic and self-contained.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`

## Scenario / Inputs

A workspace product has an unresolved question about data export after workspace deactivation.

The responsible Product Manager then makes this explicit decision:

> Administrators can export workspace data for 30 days after workspace deactivation.

Assume this decision has already been reconciled into the current PRD as decided product behavior.

No new authoritative product information is introduced after that decision.

Now reassess the PRD's remaining uncertainty and identify any unresolved product decisions.

## Expected invariants

- The 30-day export rule remains treated as established product behavior.
- The same duration decision is not reopened or reclassified as Unresolved.
- The AI may identify consequences or genuinely different unresolved issues, but it must preserve the established decision unless new authoritative information invalidates it.

## Explicit failure conditions

Fail if any of the following is true:

- The AI asks again how long export should remain available.
- The 30-day rule is described as an assumption, proposal, or unresolved choice without new authoritative conflicting information.
- The AI downgrades the decision merely because additional evidence is absent.

## Recommended grading approach

LLM judge

Judge the semantic treatment of the established decision rather than requiring a particular uncertainty label or phrase.
