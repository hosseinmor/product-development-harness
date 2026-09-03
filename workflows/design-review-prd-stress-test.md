# Design Review + PRD Stress Test Workflow

## Purpose

Review the PRD and selected Design Artifact as a coupled system before Technical Planning.

The review is intentionally two-way:

- PRD → Design: does the design satisfy decided product intent and acceptance criteria?
- Design → PRD: has the design exposed missing, contradictory, or silently invented product behavior?

The goal is Product & Design Alignment, not a generic design-quality score.

## Inputs

- Current PRD.
- Acceptance criteria.
- Selected Design Artifact.
- Relevant current-product context when needed to verify a finding.

## Workflow

### 1. Retrieve review context as needed

Retrieve only the current-product context required to make review findings defensible.

Do not create a separate Review Context artifact by default.

### 2. Review PRD → Design conformance

Check whether the selected design satisfies the PRD, including:

- required product behavior,
- material acceptance criteria,
- scope boundaries,
- product constraints,
- and material states needed to realize the intended behavior.

Identify missing coverage, direct contradictions, or interaction behavior that prevents the PRD from being satisfied.

### 3. Stress-test Design → PRD

Inspect the design for product behavior that the PRD has not established.

Ask what must be true about the product for the selected solution to work coherently.

Pay particular attention to material behavior involving, where relevant:

- eligibility and permissions,
- persistence,
- reversibility,
- state transitions,
- consequences,
- retry or recovery behavior,
- scope expansion,
- and business or policy rules.

If the design silently establishes new product behavior, surface it as a product decision need rather than treating it as a valid design decision.

### 4. Check cross-artifact consistency

Review PRD and Design together for material problems such as:

- direct contradiction,
- missing design coverage,
- design-invented product behavior,
- under-specified PRD behavior,
- PRD language that unnecessarily prescribes a design solution,
- and stale assumptions or decisions in either artifact.

Do not create findings merely to maximize completeness. Challenge only when the issue could materially change product behavior, user experience, scope, or downstream implementation.

### 5. Classify and route findings

A finding should result in one of the following outcomes:

- no material issue,
- Design issue,
- PRD issue,
- Product decision needed,
- Design decision needed,
- cross-artifact inconsistency.

This classification is semantic; no machine-readable finding schema is required.

When useful, AI may recommend a possible resolution or alternative, but must keep the finding separate from the recommendation.

### 6. Distinguish blocking from non-blocking findings

- **Blocking** — proceeding would cause downstream work to rely on a materially wrong or unresolved product/design interpretation.
- **Non-blocking** — the issue should be improved, but Technical Planning can still proceed meaningfully.

No broader severity taxonomy is required in the current MVP.

### 7. Reconcile durable outcomes

Do not create a separate Design Review artifact by default.

Durable outcomes return to their owning artifact:

- PRD issue or decided product change → update PRD and affected acceptance criteria.
- Design issue or decided design change → update Design Artifact.
- unresolved product judgment → keep visible in the PRD.
- unresolved design judgment → keep visible in the design work where materially relevant.
- informational finding with no durable consequence → no durable artifact required.

When a material change is made, re-check the affected portions of both PRD and Design. Do not restart the entire workflow unless the change invalidates the broader work.

### 8. Assess Product & Design Alignment

The PRD and selected Design Artifact are `Product & Design Aligned` when they are sufficiently consistent and bounded that Technical Planning does not need to invent material product or design decisions.

The assessment should cover all material acceptance criteria semantically, but no AC-to-frame traceability table or requirement-ID system is required.

## Scope of this review

The current MVP focuses on:

- product behavior,
- interaction coherence,
- PRD alignment,
- product ambiguity,
- and material cross-artifact consistency.

Generic visual-craft scoring is not part of the Shared Harness review contract.

## Lifecycle implication

`Delivery Readiness` comes after Technical Planning and subsequent Product / Design / Technical reconciliation. This workflow ends at `Product & Design Aligned`, not `Delivery Ready`.
