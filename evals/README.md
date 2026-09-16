# Harness Evals

For a non-technical overview of Runtime Guards, Evals, Regression, Proofs, and when to use each, see [`resources/runtime-evals-guide.md`](../resources/runtime-evals-guide.md).

## Purpose

This directory protects important Product Development Harness behavior from recurrence of observed failures.

Regression evals should originate from real Harness failures or demonstrated recurrence risks grounded in product-development work. Speculative capability coverage is not added merely for completeness.

## Relationship to the Harness

Evals do not define new Harness rules.

The authoritative behavior remains in:

- `shared-harness-contract.md`,
- the relevant workflow,
- and the relevant artifact contract.

Regression cases and validation code test those rules; they do not extend or override them.

## Directory structure

### `cases/`

Stores durable semantic regression cases for observed failures and important protected invariants.

Cases should describe the behavior being protected rather than prescribe exact model wording or hidden reasoning.

### `orchestrator/`

Contains executable evaluation and validation tooling used during Harness hardening, including:

- regression and behavioral test runners,
- semantic/model-backed regression runners,
- smoke and snapshot utilities,
- runtime-guard composition validation,
- and supporting package/tooling configuration.

This infrastructure exists to exercise and validate the Harness and its optional runtime guards. It is not itself an authoritative product-development workflow.

## Review and grading

Evaluation should focus on the semantic outcome and protected invariant rather than exact wording, hidden reasoning, or a prescribed tool sequence.

Use the cheapest meaningful validation layer first:

1. deterministic/static or behavioral validation,
2. direct semantic-guard validation when needed,
3. targeted model-backed regression,
4. end-to-end proof only when interaction between layers is the thing being tested.

Routine human review is not required. Human review may be used for calibration or incident investigation when useful.

## Current scope and non-goals

The repository currently does include executable runners and validation infrastructure under `evals/orchestrator/`.

It does not currently provide:

- a general-purpose end-user CLI for the Harness,
- a default CI pipeline that must run on every repository change,
- a scoring/dashboard platform,
- a generalized evaluation service,
- or a broad speculative capability-eval suite.

Additional automation should be added only when real usage demonstrates that it improves reliability or reduces recurring manual work enough to justify its maintenance and token/runtime cost.
