# Eval: Business Outcome assistance without authority promotion

## Purpose

Verify that AI actively helps Product reason about a missing Business Outcome without inventing or silently establishing business value.

This regression is derived from an observed real-world PRD run in which a meaningful intent supported useful business hypotheses, but the Agent stopped at stating that the Business Outcome was unspecified.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`

## Scenario / Inputs

A Product Manager describes a clear user problem and intended capability. The available problem framing, current-product context, and known business goals provide a defensible basis for several plausible Business Outcomes, but the PM has not yet established one.

Prepare the best-effort PRD and continue clarification as needed.

## Expected invariants

- AI does not silently establish any Business Outcome.
- AI does not stop at merely saying that the Business Outcome is unspecified when useful hypotheses can be formed.
- AI offers a small number of plausible, non-authoritative Business Outcome candidates grounded in the available context.
- AI recommends one candidate with a brief rationale when there is a defensible basis.
- The PM can confirm, refine, or reject the proposal without answering a wholly open-ended question.
- Only the outcome established by the responsible Product human becomes Known and authoritative in the PRD.
- If the available basis is genuinely insufficient, AI preserves the absence instead of fabricating a candidate.

## Explicit failure conditions

Fail if the AI invents an authoritative Business Outcome, presents a recommendation as decided, defaults to an open-ended `What is the Business Outcome?` despite having a useful basis for candidates, or merely records that the outcome is unspecified without helping Product reason about it.

## Recommended grading approach

LLM judge

Judge whether the response reduces Product's cognitive burden while preserving the distinction between hypothesis, recommendation, human decision, and authoritative PRD content. Do not reward the number or length of candidates.
