# Eval: Clarification atomicity

## Purpose

Verify that each Product clarification resolves one independently answerable decision, while allowing multiple atomic questions in a batch and multiple mutually exclusive values of one decision variable in a single question.

This regression is derived from an observed Generalization Validation failure in which independent visibility, prioritization, submission, and automation consequences were bundled into one clarification.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`

## Scenario / Inputs

A Product Manager proposes collecting a new input during a submission flow. After retrieval, derivation, ownership assessment, and Blocking Materiality assessment, several Product-owned decisions remain that genuinely require clarification.

Consider this candidate clarification:

> Should the new input only be shown to reviewers, affect priority, block submission, or trigger automatic rejection?

The alternatives are not mutually exclusive values of one decision variable. Product could establish reviewer visibility while leaving prioritization undecided, or allow submission while separately deciding whether a later evaluated mismatch can trigger automation.

Relabeling those independent capabilities as a single spectrum does not make the question atomic. This candidate must fail the same way:

> What level of effect should answers have: reviewer visibility, prioritization, submission blocking, or automatic rejection?

Also consider a question whose alternatives are behavior packages:

> Should a previous answer be auto-prefilled and editable, shown for explicit confirmation, or submitted automatically?

This is compound because prefill, editability, confirmation, and submission behavior are independently answerable Product properties. A human could establish one while legitimately leaving another undecided.

Prepare the clarification needed for the unresolved blocking decisions. A valid semantic decomposition may separately address matters such as:

- whether a valid input can affect submission eligibility;
- whether an evaluated mismatch can trigger an automated post-submission action;
- whether the input can affect ranking or prioritization;
- what information is visible to the reviewing actor.

Exact wording and exact question count are not prescribed. Questions whose relevance depends on an upstream answer should still respect that dependency rather than being asked prematurely.

Also consider this candidate clarification:

> What is the requiredness policy: all required, all optional, or configurable per item?

These alternatives are mutually exclusive values of one requiredness decision and may remain together in one atomic question.

## Expected invariants

- Each emitted clarification resolves one independently answerable Product decision.
- The single Product decision variable can be named before emission, and every option varies only that property while other Product properties remain fixed.
- A question is split when the human could answer one part while legitimately leaving another part undecided.
- Options that can logically be true at the same time are not treated as mutually exclusive values of one decision variable.
- Independent visibility, submission, automation, ranking, and similar consequences are not presented as mutually exclusive alternatives of one decision merely because they concern the same input.
- An umbrella label such as `level of effect` does not make independent capabilities atomic.
- Package options that combine prefill, editability, confirmation, or submission behavior are decomposed when those axes materially require Product clarification.
- Multiple alternatives remain valid in one question when they are mutually exclusive values of a single decision variable, as in the requiredness-policy example.
- A clarification batch may contain multiple atomic questions; atomicity does not require one question per turn.
- Decision dependencies remain respected after decomposition, and downstream questions are not asked prematurely.
- The Atomicity Gate is applied only after Product-versus-Design ownership and Blocking Materiality have established that clarification is needed.
- Decomposition does not turn Design-owned or non-blocking uncertainty into Product clarification.

## Explicit failure conditions

Fail if any of the following is true:

- The compound visibility, prioritization, submission, and automatic-rejection question is emitted without semantic decomposition.
- The same independent consequences are accepted as atomic merely because they are labeled as one `level of effect` spectrum.
- The package-option question combining prefill, editability, confirmation, and automatic submission is accepted as one atomic decision.
- The Agent cannot name one Product decision variable that all options vary while other Product properties remain fixed.
- Options that can logically be true together are presented as mutually exclusive values of one decision.
- Independent consequences are treated as mutually exclusive values of a single decision variable.
- The valid requiredness-policy question is rejected solely because it contains multiple alternatives.
- Atomicity is interpreted as requiring exactly one question per batch or turn.
- Splitting causes a Design-owned, non-blocking, or dependency-premature issue to be asked merely because it was present in the original compound question.
- Grading requires the example wording or a fixed number or order of questions rather than the protected semantic invariant.

## Recommended grading approach

LLM judge

Judge whether each clarification is independently answerable and whether the alternatives inside it belong to one decision axis. Grade semantic decomposition, ownership, blocking materiality, and dependency timing rather than exact wording, exact question count, or batch size.
