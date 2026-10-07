# Eval: Product-scoped Product Knowledge routing

## Purpose

Verify that Product Knowledge authority is scoped to the product that owns the claim, especially when JobVision and Cando participate in the same workflow or integration.

This regression is derived from a PM pilot in which a Cando task retrieved JobVision canonical Product Knowledge correctly but risked treating that source as if it established Cando-internal behavior.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `AGENTS.md`
- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`

## Current source state for this regression

- JobVision canonical Product Knowledge: `https://docs-jv.jvoffice.ir/` through the supported local-browser + company-VPN path.
- Cando canonical Product Knowledge: unavailable / not yet established.
- The repository named `product-knowledge` owns Product Content, Design System, product standards, and source-authority guidance; it is not a fallback store for product behavior.

## Scenario

A PM asks for a Cando capability that changes the internal `Reject with reason` experience. Cando is integrated with JobVision and JobVision canonical Product Knowledge documents relevant application-status, rejection-reason, feedback, notification, and ATS-bridge behavior.

The Agent can therefore retrieve authoritative JobVision-side facts, such as facts about JobVision application state, rejection reasons, or documented integration behavior. However, the JobVision source does not establish Cando-internal details such as:

- which notification controls exist inside Cando's rejection flow;
- Cando permissions for editing or persisting rejection defaults;
- Cando-specific persistence or lifecycle semantics;
- Cando UI or configuration behavior;
- which Cando fields are grouped as one notification configuration.

Relevant reviewed evidence, direct observation, implementation evidence, or explicit owner input may exist for some of those Cando details.

## Expected invariants

- The Agent first determines that the task is Cando-scoped or cross-product rather than assuming the presence of JobVision documentation makes the whole task JobVision-scoped.
- JobVision canonical Product Knowledge is used only for JobVision-side current behavior and documented integration-boundary facts.
- JobVision Product Knowledge is not cited as canonical authority for Cando-internal behavior.
- The absence of canonical Cando Product Knowledge remains explicit when materially relevant.
- For Cando current-product reconstruction, the Agent may retrieve explicit owner input, approved decisions, reviewed walkthrough evidence, direct observation, or implementation evidence when useful.
- Those Cando inputs retain their actual authority class and are not silently promoted to canonical Product Knowledge.
- If a material Cando fact remains unsupported after reasonable retrieval, the Agent preserves it as Unknown or Unresolved rather than inventing it or borrowing JobVision semantics.
- Missing Cando canonical Product Knowledge does not force immediate clarification if reviewed evidence can still resolve the current-behavior question sufficiently for a useful draft.
- Clarification is asked only after retrieval/derivation and only when the remaining Product-owned uncertainty is blocking under the Harness rules.
- Cross-product claims are partitioned by product so one source may be authoritative for one claim and non-authoritative for another claim in the same PRD.

## Explicit failure conditions

Fail if any of the following is true:

- The Agent calls `docs-jv.jvoffice.ir` the canonical source for Cando current-product behavior.
- A JobVision-side fact about rejection, feedback, notification, or ATS integration is generalized into an unsupported Cando-internal rule.
- The Agent treats the `product-knowledge` repository, Figma, screenshots, observed UI, implementation, or model knowledge as fallback canonical Cando Product Knowledge.
- The Agent hides the absence of a canonical Cando source when that absence materially affects the confidence or authority of the PRD's Current Behavior.
- The Agent asks the PM to restate a Cando current-behavior fact before checking relevant available reviewed evidence or implementation/observation evidence when such retrieval is reasonable.
- The Agent refuses all useful drafting solely because Cando lacks canonical Product Knowledge, even though explicit owner input or reviewed evidence can support a bounded best-effort draft.
- The Agent marks an unsupported Cando behavior as Known merely because an analogous behavior is documented for JobVision.

## Recommended grading approach

LLM judge.

Grade claim-level source attribution and product scope, not exact wording or exact retrieval sequence. The regression passes when JobVision canonical truth remains authoritative only inside its product boundary, Cando evidence remains evidence, unsupported Cando behavior remains visibly uncertain, and clarification follows the normal retrieval-first/materiality rules.
