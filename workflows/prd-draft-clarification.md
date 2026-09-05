# PRD Draft + Clarification Workflow

## Purpose

Turn an informal or incomplete PM intent into a product PRD that is sufficiently grounded and bounded for meaningful Design Exploration, while minimizing unnecessary human interruption.

The workflow is draft-first, retrieval-first, and clarification-light.

## Inputs

- PM Intent, in whatever natural form the PM provides it.
- Relevant current-product context from Product Knowledge when available.
- Evidence when available and relevant.
- The authoritative implementation source when deeper verification is required.

PM Intent does not require a mandatory intake schema. Missing structure is work for AI to resolve where possible, not an automatic request for more documentation from PM.

## Workflow

### 1. Receive PM Intent

Interpret the requested product change without requiring a discovery questionnaire.

If the intent is too ambiguous to produce any useful draft, ask only the minimum question needed to establish what change is being discussed. Otherwise continue to retrieval.

### 2. Retrieve task-relevant context

Retrieve only the current-product context needed to understand the change, including where relevant:

- the materially affected actors,
- the concise local current behavior needed to understand the change,
- relevant permissions and eligibility,
- material states and adjacent flows,
- business rules and constraints,
- established terminology,
- established User and Business Outcomes already present in Product intent or authoritative context,
- context needed to understand material Product Scenarios,
- materially relevant canonical Product Knowledge dependencies when available,
- and available evidence related to the stated problem.

Use Product Knowledge as the preferred context provider. Use canonical Product Knowledge concepts or identifiers from the taxonomy that actually exists when dependency references are useful. Do not invent a Harness dependency taxonomy.

Inspect the relevant GitHub codebase when retrieved context is insufficient, inconsistent, or requires authoritative verification.

Do not create a separate context artifact by default.

Do not infer unsupported Business Outcomes or Success Metrics from retrieved context merely to complete the PRD structure.

### 3. Produce a best-effort PRD v0

Create a substantive PRD before clarification whenever useful work can proceed.

Use:

- Known facts,
- validly Derived consequences,
- reversible Assumptions when they help create a useful draft,
- and explicit Unresolved items when human judgment is still required.

Populate the PRD metadata and semantic responsibilities defined by `../artifacts/prd.md` without rendering empty conditional sections merely for completeness.

When a required Product responsibility such as Business Outcome is not established, make the absence or uncertainty explicit rather than inventing content.

Draft Key Product Scenarios when a material journey, actor handoff, lifecycle sequence, or connected behavior sequence benefits from a coherent product-level view. Keep them solution-independent and separate from selected Design User Flows.

Do not return a skeleton dominated by `TBD` fields when a meaningful draft can be produced.

Follow the PRD Artifact Contract in `../artifacts/prd.md`.

### 4. Run an ambiguity scan

Stress-test the draft rather than immediately asking questions.

Check for material ambiguity in:

- product intent,
- scope,
- materially affected actors,
- current-product assumptions,
- User Outcome,
- Business Outcome, including missing or unsupported business value,
- Key Product Scenarios where they are material,
- required product behavior,
- materially relevant dependencies,
- acceptance criteria,
- assumptions and open decisions,
- and internal consistency.

A useful test is whether two materially different products could both satisfy the current wording.

Also check whether a materially affected actor is missing, a Product Scenario requires unstated Product judgment, or a material dependency needed for downstream interpretation has not been identified.

The ambiguity scan produces uncertainty, not questions.

### 5. Resolve uncertainty before escalation

For each material uncertainty, attempt in order:

```text
retrieve → derive → safe reversible assumption → human clarification
```

Do not ask the PM to restate facts that can reasonably be retrieved, including affected actors, current behavior, or canonical dependency references.

Do not escalate a choice that belongs to Design rather than Product.

### 6. Ask targeted clarification

Ask only unresolved choices that require PM judgment and materially affect product intent, User or Business Outcome, scope, Product Scenarios, required behavior, acceptance criteria, or downstream design direction.

Prioritize questions by decision dependency and downstream impact.

Ask the smallest coherent batch of questions needed to unlock meaningful progress. Do not ask downstream questions whose relevance depends on an unresolved upstream answer unless resolving them together materially improves decision quality.

Each clarification should, when useful, make clear:

- the decision required,
- why the decision matters,
- the materially different options,
- and an AI recommendation when there is a defensible basis for one.

### 7. Reconcile PM decisions into the PRD

A clear PM statement is sufficient to establish a product decision.

After a decision:

- update the owning PRD claim,
- update affected User or Business Outcomes,
- update affected Key Product Scenarios,
- update affected acceptance criteria,
- remove or replace stale assumptions,
- reconcile related scope, behavior, or dependency references,
- and run a local consistency check.

Do not require a second approval ceremony for the edit itself.

### 8. Reassess remaining uncertainty

If a PM decision creates new material ambiguity, repeat only the affected retrieval, clarification, and reconciliation work. Do not restart the workflow from zero.

Known material uncertainty must remain visible until resolved even when it does not block useful Design Exploration.

### 9. Assess Problem Alignment

Assess whether the PRD is `Problem Aligned` for Design Exploration.

The PRD is aligned when Design can proceed without needing to invent materially different product intent or behavior.

Check that the affected actors, local current-product baseline, established Outcomes, material scope boundaries, applicable Product Scenarios, required behavior, material dependencies, acceptance criteria, and remaining uncertainty are sufficiently clear for the next use.

Remaining uncertainty is acceptable when it is explicit and does not invalidate useful Design Exploration.

If alignment is not reached, identify the specific blocking gap rather than reporting generic incompleteness.

## Output

The durable output is the reconciled PRD.

Ambiguity scans, retrieval notes, clarification transcripts, and reasoning do not require separate durable artifacts unless a later demonstrated need justifies one.
