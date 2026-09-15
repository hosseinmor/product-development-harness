# Eval: Blocking materiality for Product-owned uncertainty

## Purpose

Verify that Product ownership alone does not make an unresolved decision a clarification blocker, while unresolved core Product boundaries still block when Design would otherwise need to invent material behavior.

This regression is derived from observed clarification failures involving a downstream rejection-feedback policy and a non-core reactivation lifecycle branch. The protected invariant is feature-agnostic.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`

## Scenario / Inputs

A Product Manager asks to collect required supplemental information during submission and attach it to a durable request for downstream review. It is established that the primary submission creates the request and hands it to an existing policy service when an independently configured rule applies.

Three Product-owned uncertainties remain:

1. Whether a downstream rejection notification should disclose the exact policy reason. The current feature can establish its handoff to the notification dependency without deciding that dependency's internal disclosure policy.
2. Whether reopening a previously withdrawn request preserves its original supplemental-information snapshot or collects a new snapshot. Reopening is a non-core lifecycle branch and may remain an explicit Open Decision when it does not prevent meaningful exploration of the primary create-and-review journey.
3. Whether a missing required supplemental answer blocks the primary submission or allows creation of an incomplete request. These alternatives materially change the core submission behavior and the experience Design must explore.

Prepare or reconcile the PRD, decide which clarification is required for Problem Alignment, and assess readiness for Design Exploration.

## Expected invariants

- Product ownership is assessed separately from blocking materiality.
- The downstream disclosure policy is not asked merely because it is Product-owned when the current feature's boundary and handoff are sufficiently clear.
- The reopening lifecycle branch may remain explicitly unresolved without blocking when core Design Exploration does not require choosing its behavior.
- Non-blocking Product uncertainty remains visible as an Open Decision, assumption where safe, or dependency boundary rather than being silently resolved.
- The missing-answer submission consequence remains blocking because its alternatives change the core submission journey, required behavior, and Acceptance Criteria.
- Problem Alignment is not declared until that core boundary has sufficient authority or is otherwise validly resolved.

## Explicit failure conditions

Fail if any of the following is true:

- Every Product-owned uncertainty is turned into a clarification without assessing whether Design needs it for meaningful core exploration.
- The downstream disclosure policy or non-core reopening branch blocks alignment solely because it remains Product-owned and unresolved.
- Either non-blocking decision is silently invented or omitted instead of remaining visibly bounded.
- The missing-answer submission consequence is deferred even though Design would need to choose between materially different core submission behaviors.
- The PRD is declared aligned while the core submission consequence remains unspecified.

## Recommended grading approach

LLM judge

Judge the semantic distinction between ownership and blocking materiality, not exact wording, section placement, or question order. A different edge case may be treated as blocking only when the artifact demonstrates that it materially constrains the primary Product or Design direction.
