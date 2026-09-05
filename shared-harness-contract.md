# Shared Harness Contract

This contract defines the rules shared by all product-development workflows and artifacts in the Job Vision Product Development Harness.

## 1. Source of Truth

Authority is scoped to the kind of claim being made. There is no single global source of truth.

- The Harness is authoritative for product-development rules and artifact contracts.
- The relevant Job Vision codebase in GitHub is authoritative for current implemented product behavior.
- Product Knowledge is a derived context provider for current product truth. It is not independently authoritative over the codebase.
- The PRD owns decided intended product change, including materially affected users, intended outcomes, material Product Scenarios, required product behavior, and acceptance criteria within its scope.
- The Design Artifact owns the selected experience and interaction solution within the constraints of the PRD.

An artifact is authoritative only for claims inside its decision domain that are established by the responsible human role or validly derived from established decisions.

A clear statement by the responsible human role establishes a decision. The owning artifact makes that decision durable and consumable downstream. No additional approval ceremony is required.

Conversations, AI outputs, working notes, and tool-local state are not durable authoritative sources.

Evidence informs decisions but does not itself establish product intent.

Artifacts may propose changes outside their authority, but must not silently establish those proposals as decided facts.

When sources appear inconsistent, AI must surface the inconsistency rather than resolve it by assumption. Where practical, each fact should have one primary owner and other artifacts should reference, retrieve, or derive from that source rather than independently redefine it.

## 2. Human Decision Authority

Human roles retain decision authority for the domains they own.

For the current MVP:

- Product Management owns problem definition, materially affected users, product intent, User and Business Outcomes, scope, Key Product Scenarios, required product behavior, product-level constraints, and acceptance criteria.
- Product Design owns the selected experience and interaction solution used to satisfy decided product intent.
- AI has no independent product or design decision authority.

AI may autonomously:

- retrieve relevant context,
- synthesize information,
- produce best-effort drafts,
- identify ambiguity and inconsistency,
- derive logically constrained consequences,
- create reversible working assumptions,
- generate alternatives,
- make recommendations,
- challenge artifacts and human decisions,
- maintain artifacts after human decisions,
- and reconcile materially affected artifacts when accessible.

AI may challenge a human decision by surfacing risks, contradictions, missing evidence, or downstream consequences. It must not override the decision.

AI may derive a consequence of an authoritative decision when the consequence is logically necessary and introduces no new domain judgment. Derived content has no independent authority; it inherits authority only from the decision or source from which it necessarily follows.

When unresolved judgment is required, AI must preserve the uncertainty or ask the responsible human role rather than silently deciding.

Approval is required for decisions, not for mechanical drafting or maintenance edits.

## 3. Artifact Boundaries

Artifacts are separated by the kind of decision they own.

### Product Knowledge

Provides retrievable context about the currently implemented product. It is derived from current product truth and does not own intended changes.

### PRD

Owns the intended product change, including:

- the problem being addressed,
- materially affected users or actors,
- intended User and Business Outcomes,
- material scope boundaries,
- material Product Scenarios,
- decided required product behavior, including business rules,
- acceptance criteria,
- and material unresolved product decisions or assumptions.

The PRD may include concise current-product context and canonical dependency references for downstream understanding, retrieval, and impact analysis. Those contextual references do not override Product Knowledge or the relevant authoritative implementation source and should not become duplicate owners of current-product truth.

The PRD should describe observable or verifiable product expectations without prescribing the experience or implementation unless that prescription is itself a product constraint.

### Design Artifact

Owns the selected experience and interaction solution used to satisfy the PRD.

It may expose gaps or propose changes to product intent, but it must not silently redefine the PRD.

### Technical Plan

Owns implementation approach. This boundary is intentionally minimal until Engineering workflows are designed.

### Validation Plan

Owns how correctness and agreed expectations are verified. This boundary is intentionally minimal until Validation and QA workflows are designed.

### Cross-artifact rule

When work in one artifact requires changing a decision owned by another artifact, the change must return to the owning artifact rather than remaining only in the downstream artifact.

## 4. Knowledge Contract

The Harness defines what product context is required to perform a task. It does not define how Product Knowledge stores, structures, indexes, or retrieves that context.

For a given task, relevant context may include:

- current user-visible or otherwise relevant implemented behavior,
- relevant users, actors, permissions, and eligibility,
- related flows and material states,
- applicable business rules and constraints,
- known dependencies with adjacent product areas,
- relevant terminology and concepts,
- available evidence relevant to the stated problem,
- and implementation references when deeper verification is required and available.

Product Knowledge is the preferred provider of current-product context when available, but it is not a mandatory runtime dependency. Equivalent context may be retrieved directly from authoritative sources when necessary.

When Product Knowledge exposes canonical concepts or identifiers useful for references or dependency navigation, the Harness may use those existing references. The Harness does not define or require a separate Product Knowledge taxonomy.

AI should not ask a human for product facts that are reasonably retrievable from available product context or the authoritative implementation source.

Absence from retrieved context is uncertainty, not evidence that a behavior does not exist.

When retrieved knowledge is insufficient, inconsistent, or materially uncertain, AI should retrieve deeper context or inspect the authoritative source rather than invent missing product truth.

Retrieval should be task-scoped. AI should retrieve enough context to make a strong best-effort draft and identify material uncertainty, not exhaustively reconstruct the whole product.

No freshness schema, Product Knowledge ontology, or mandatory implementation-reference format is required in the current MVP.

## 5. Uncertainty Model

AI must distinguish established information from information it has inferred, assumed, or cannot resolve.

The current Harness uses four semantic states:

- **Known** — established by an authoritative source or a decision from the responsible human role.
- **Derived** — logically follows from known information without introducing new domain judgment.
- **Assumed** — a reversible working choice used to allow drafting or exploration to continue.
- **Unresolved** — a material choice or unknown for which no authoritative decision or reliable derivation exists.

AI should minimize uncertainty in this order:

```text
retrieve → derive → assume when safe and reversible → ask when human judgment is required
```

Assumptions and unresolved issues must not silently become authoritative because they appear in an authoritative artifact.

The Harness does not require certainty labels on every statement. Material uncertainty must be visible when another role could reasonably mistake it for a product or design constraint.

Unknown information that can still be retrieved is not yet an unresolved product decision.

Conflicting evidence that materially affects the work remains unresolved until the authoritative source or discrepancy is understood.

When an assumption is resolved, AI should update the owning artifact and remove or replace stale uncertainty.

Once a responsible human role has established a decision, AI must continue to treat that decision as Known and must not reclassify the same issue as Unresolved unless new authoritative information materially conflicts with, supersedes, or invalidates the decision.

No confidence percentages or mandatory certainty metadata are required.

## 6. Clarification Rules

Clarification is an escalation mechanism for material human judgment, not an intake questionnaire.

AI should make a best-effort draft before asking for clarification whenever useful work can proceed from available context.

Before asking a human a question, AI should attempt to:

1. retrieve the missing context,
2. derive the answer from existing authoritative decisions when logically constrained,
3. continue with an explicit reversible assumption when doing so does not create material downstream risk.

AI should ask for clarification only when an unresolved issue:

- requires judgment from a human decision owner,
- materially affects product intent, acceptance criteria, design direction, scope, or another downstream decision,
- and cannot be safely deferred without degrading the usefulness of the current work.

Clarification should ask the smallest coherent set of high-impact questions that meaningfully advances the artifact.

Questions should expose the decision being made, why it matters, and viable options when those are known. AI should provide a recommendation only when there is a defensible basis for one.

Dependent questions should be asked incrementally when their relevance depends on unresolved upstream decisions.

A human may delegate a choice by supplying decision constraints or criteria. This does not transfer permanent domain authority to AI.

An unanswered high-impact question does not automatically stop the workflow. AI should continue with explicit assumptions where the remaining work can still be useful and non-misleading.

## 7. Change Propagation

A decided change should first be recorded in the artifact that owns the affected decision.

When an authoritative decision changes, AI should identify materially affected downstream artifacts and update, flag, or re-evaluate them as appropriate.

AI should autonomously propagate changes when the required update is mechanical or logically constrained.

When propagation requires new human judgment, AI should preserve the authoritative change, identify the affected downstream work, and surface the new decision need to the responsible human role.

Propagation is impact-based, not global. Not every artifact edit requires reconciliation everywhere.

If materially affected artifacts are not accessible in the current tool or environment, AI must identify the outstanding reconciliation rather than pretending propagation is complete.

Stale assumptions, acceptance criteria, recommendations, and derived content should be removed or revised when the decisions they depend on change.

The Harness does not currently require a dependency graph, synchronization service, decision ledger, or mandatory changelog.

## 8. Readiness and Quality

Readiness means an artifact is sufficiently trustworthy and complete for its intended next use. It does not require all uncertainty to be eliminated.

An artifact is ready for a downstream activity when:

- the authoritative decisions required by that activity are established,
- material assumptions and unresolved issues are visible,
- remaining unresolved issues do not invalidate the intended downstream work,
- the artifact is internally consistent,
- it is materially consistent with relevant authoritative upstream context,
- and it is specific enough to constrain downstream interpretation where constraint is required.

Readiness is always relative to the next intended activity, not a global `ready/not ready` state.

AI may assess readiness and identify gaps. Humans retain authority over the product or design decisions required to close those gaps.

Readiness findings are advisory by default. They block progression only when proceeding would make the downstream work materially misleading or unusable.

Quality is fitness for the artifact's intended use within its authority and boundaries, not maximum completeness.

### Problem Aligned

`Problem Aligned` is a readiness condition for meaningful Design Exploration.

It means the problem, materially affected users, relevant local current behavior, established User and Business Outcomes, material scope boundaries, applicable Key Product Scenarios, and product behavior required to constrain useful design work are sufficiently established or bounded by visible material uncertainty, and no known material mismatch with product intent remains that would prevent useful exploration.

Material dependencies needed for downstream interpretation should be identifiable, and Acceptance Criteria need to be sufficient, not complete. Remaining gaps are acceptable when they are explicit and do not allow materially incompatible interpretations of the intended product change or invalidate useful Design Exploration.

### Product & Design Aligned

`Product & Design Aligned` is a readiness condition for Technical Planning.

It means the PRD and selected Design Artifact are sufficiently consistent and bounded that technical planning does not need to invent material product or design decisions.
