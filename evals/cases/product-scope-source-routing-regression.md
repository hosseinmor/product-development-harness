# Eval: Product-scoped Product Knowledge routing

## Purpose

Verify that Product Knowledge authority is scoped to the product that owns the claim, especially when JobVision and Cando participate in the same workflow or integration.

This regression originated from a PM pilot in which a Cando task risked treating JobVision canonical Product Knowledge as if it established Cando-internal behavior. Cando now has its own canonical Product Knowledge source, so the regression protects product-scoped routing in both directions.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `AGENTS.md`
- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`

## Current source state for this regression

- JobVision canonical Product Knowledge: `https://docs-jv.jvoffice.ir/`.
- Cando canonical Product Knowledge: `https://docs-cd.jvoffice.ir/`.
- Internal canonical sources are used only through an execution path whose access has been verified in the current environment.
- The repository named `product-knowledge` owns Product Content, Design System, product standards, and source-authority guidance; it is not a fallback store for product behavior.

## Scenario

A PM asks for a Cando capability that changes the internal `Reject with reason` experience. Cando is integrated with JobVision and JobVision canonical Product Knowledge documents relevant application-status, rejection-reason, feedback, notification, and ATS-bridge behavior.

The Agent can therefore retrieve authoritative JobVision-side facts, such as facts about JobVision application state, rejection reasons, or documented integration behavior. However, the JobVision source does not establish Cando-internal details such as:

- which notification controls exist inside Cando's rejection flow;
- Cando permissions for editing or persisting rejection defaults;
- Cando-specific persistence or lifecycle semantics;
- Cando UI or configuration behavior;
- which Cando fields are grouped as one notification configuration.

Relevant reviewed evidence, direct observation, implementation evidence, or explicit owner input may still exist for some details, especially when canonical documentation is insufficient, inaccessible, or in conflict with evidence.

## Expected invariants

- The Agent first determines that the task is Cando-scoped or cross-product rather than assuming the presence of JobVision documentation makes the whole task JobVision-scoped.
- JobVision canonical Product Knowledge is used only for JobVision-side current behavior and documented integration-boundary facts.
- JobVision Product Knowledge is not cited as canonical authority for Cando-internal behavior.
- Cando canonical Product Knowledge is retrieved from `docs-cd.jvoffice.ir` for Cando-owned current-product claims when access is available.
- The Agent may retrieve explicit owner input, approved decisions, reviewed walkthrough evidence, direct observation, or implementation evidence when canonical documentation is insufficient, inaccessible, or inconsistent.
- Those inputs retain their actual authority class and are not silently promoted to canonical Product Knowledge.
- If a material Cando fact remains unsupported after reasonable retrieval, the Agent preserves it as Unknown or Unresolved rather than inventing it or borrowing JobVision semantics.
- An access limitation to Cando Product Knowledge does not force immediate clarification if other evidence can still support a bounded useful draft, but that evidence does not become canonical truth.
- Clarification is asked only after retrieval/derivation and only when the remaining Product-owned uncertainty is blocking under the Harness rules.
- Cross-product claims are partitioned by product so one source may be authoritative for one claim and non-authoritative for another claim in the same PRD.

## Explicit failure conditions

Fail if any of the following is true:

- The Agent calls `docs-jv.jvoffice.ir` the canonical source for Cando current-product behavior or calls `docs-cd.jvoffice.ir` the canonical source for JobVision current-product behavior.
- A JobVision-side fact about rejection, feedback, notification, or ATS integration is generalized into an unsupported Cando-internal rule.
- The Agent treats the `product-knowledge` repository, Figma, screenshots, observed UI, implementation, or model knowledge as fallback canonical Cando Product Knowledge.
- The Agent hides a material access limitation to the owning product's canonical Product Knowledge.
- The Agent asks the PM to restate a Cando current-behavior fact before checking `docs-cd` when access is available, or before checking relevant available evidence when canonical access is unavailable or insufficient.
- The Agent refuses all useful drafting solely because Cando canonical Product Knowledge is temporarily inaccessible, even though explicit owner input or reviewed evidence can support a bounded best-effort draft.
- The Agent marks an unsupported Cando behavior as Known merely because an analogous behavior is documented for JobVision.

## Recommended grading approach

LLM judge.

Grade claim-level source attribution and product scope, not exact wording or exact retrieval sequence. The regression passes when JobVision canonical truth remains authoritative only inside JobVision, Cando canonical truth remains authoritative only inside Cando, non-canonical evidence keeps its actual authority class, unsupported behavior remains visibly uncertain, and clarification follows the normal retrieval-first/materiality rules.
