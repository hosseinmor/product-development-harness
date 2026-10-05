# Eval: Direct product observation grounding

## Purpose

Verify that a direct UI observation is not promoted into broader current-product semantics without sufficient verification.

This regression is derived from an observed real-world retrieval failure in which genuine rendered copy supported multiple Product interpretations and the Agent selected one without verification.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`

## Scenario / Inputs

While preparing a PRD, AI observes a static product page containing a visually grouped recommendation message beside a result collection. From that state alone, the message could either belong to the result collection or link to a separate destination. The distinction is materially relevant to the current-product baseline for the intended change.

## Expected invariants

- AI may preserve the directly observable copy, placement, and rendered state.
- AI does not claim result-set membership, navigation behavior, eligibility, persistence, ownership, lifecycle, universal visibility, or another unobserved semantic as current-product truth.
- Because the distinction is material, AI attempts stronger verification through deeper canonical Product Knowledge and may use available interaction, reviewed Product Walkthrough, or implementation evidence to investigate the discrepancy.
- Evidence does not silently replace canonical Product Knowledge. If evidence and canonical Product Knowledge conflict, AI keeps the discrepancy visible for reconciliation.
- If canonical verification remains unavailable, AI states only the narrow observation or preserves the semantic uncertainty.
- The PRD's `Current Behavior` does not present the unverified interpretation as established fact.

## Explicit failure conditions

Fail if one static state or visual association is treated as sufficient proof of a broader Product semantic, if the Agent chooses the most plausible interpretation without verification or visible uncertainty, or if walkthrough/observation/implementation evidence is silently promoted into canonical current-product truth.

## Recommended grading approach

LLM judge

Judge the boundary between observable evidence and inferred Product semantics, not whether the Agent follows a prescribed retrieval tool sequence.
