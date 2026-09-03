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

- what currently happens,
- who is affected,
- relevant permissions and eligibility,
- material states and adjacent flows,
- business rules and constraints,
- established terminology,
- and available evidence related to the stated problem.

Use Product Knowledge as the preferred context provider. Inspect the relevant GitHub codebase when retrieved context is insufficient, inconsistent, or requires authoritative verification.

Do not create a separate context artifact by default.

### 3. Produce a best-effort PRD v0

Create a substantive PRD before clarification whenever useful work can proceed.

Use:

- Known facts,
- validly Derived consequences,
- reversible Assumptions when they help create a useful draft,
- and explicit Unresolved items when human judgment is still required.

Do not return a skeleton dominated by `TBD` fields when a meaningful draft can be produced.

Follow the PRD Artifact Contract in `../artifacts/prd.md`.

### 4. Run an ambiguity scan

Stress-test the draft rather than immediately asking questions.

Check for material ambiguity in:

- product intent,
- scope,
- affected actors,
- required product behavior,
- acceptance criteria,
- assumptions about current product behavior,
- and internal consistency.

A useful test is whether two materially different products could both satisfy the current wording.

The ambiguity scan produces uncertainty, not questions.

### 5. Resolve uncertainty before escalation

For each material uncertainty, attempt in order:

```text
retrieve → derive → safe reversible assumption → human clarification
```

Do not ask the PM to restate facts that can reasonably be retrieved.

Do not escalate a choice that belongs to Design rather than Product.

### 6. Ask targeted clarification

Ask only unresolved choices that require PM judgment and materially affect product intent, scope, required behavior, acceptance criteria, or downstream design direction.

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
- update affected acceptance criteria,
- remove or replace stale assumptions,
- reconcile related scope or behavior statements,
- and run a local consistency check.

Do not require a second approval ceremony for the edit itself.

### 8. Reassess remaining uncertainty

If a PM decision creates new material ambiguity, repeat only the affected retrieval, clarification, and reconciliation work. Do not restart the workflow from zero.

### 9. Assess Problem Alignment

Assess whether the PRD is `Problem Aligned` for Design Exploration.

The PRD is aligned when Design can proceed without needing to invent materially different product intent or behavior.

Remaining uncertainty is acceptable when it does not invalidate useful Design Exploration.

If alignment is not reached, identify the specific blocking gap rather than reporting generic incompleteness.

## Output

The durable output is the reconciled PRD.

Ambiguity scans, retrieval notes, clarification transcripts, and reasoning do not require separate durable artifacts unless a later demonstrated need justifies one.
