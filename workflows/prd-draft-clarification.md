# PRD Draft + Clarification Workflow

## Purpose

Turn an informal or incomplete PM intent into a product PRD that is sufficiently grounded and bounded for meaningful Design Exploration, while minimizing unnecessary human interruption.

The workflow is draft-first, retrieval-first, normalization-before-clarification, and clarification-light.

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

- the responsible Product owner or team when reasonably retrievable,
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

Use Product Knowledge as the preferred context provider. Use only canonical Product Knowledge dependency references that already exist in the Product Knowledge structure that actually exists. Do not invent a Harness dependency taxonomy, Product Knowledge IDs, or free-text substitutes for missing canonical dependency references.

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

When PM intent is solution-shaped or retrieved context does not establish the underlying problem, outcome, rationale, risk, or likely tradeoff, use relevant general model knowledge, domain knowledge, and common product patterns to generate informed hypotheses, candidate framings, alternatives, and recommendations. Do not present those as established Job Vision truth or decided Product intent. If a hypothesis materially affects Product framing or downstream decisions, keep that distinction visible and surface the Product judgment when needed.

Populate the PRD metadata and semantic responsibilities defined by `../artifacts/prd.md` without rendering empty conditional sections merely for completeness.

Retrieve the responsible Product owner or team when reasonably possible. Do not infer or fabricate ownership; when ownership cannot be established, use `owner: unresolved`.

When Business Outcome is not established, make the absence explicit in `Business Outcome`. Do not automatically duplicate that absence into `Assumptions & Open Decisions`; surface a separate Product decision only when judgment about the missing business rationale is materially required downstream.

Draft Key Product Scenarios when a material journey, actor handoff, lifecycle sequence, or connected behavior sequence benefits from a coherent product-level view. Keep them solution-independent, as short as needed to preserve the material sequence, and separate from selected Design User Flows and detailed Required Product Behavior.

Populate `Dependencies` only with materially relevant canonical Product Knowledge references that already exist. If a material relationship has no canonical Product Knowledge reference, do not invent or substitute one in `Dependencies`; handle the gap according to whether it needs deeper retrieval, Product judgment, or later Technical Planning.

Do not return a skeleton dominated by `TBD` fields when a meaningful draft can be produced.

Follow the PRD Artifact Contract in `../artifacts/prd.md`.

### 4. Run semantic normalization

Clean the draft as one artifact before asking for clarification. The goal is semantic completeness with low redundancy, not minimum detail.

Check that:

- each material claim has one primary semantic home and is not repeated merely for completeness,
- `Problem` and `Outcomes` describe problem framing and improved states rather than feature mechanics or requirement summaries,
- `Affected Users` remains a concise actor view rather than carrying permissions or detailed behavior owned elsewhere,
- `Current Behavior` describes the nearest concrete local product baseline that the intended change enters, extends, interrupts, or replaces,
- `Scope` defines release boundaries without becoming a rule inventory,
- `Key Product Scenarios` provide only the shortest coherent journey, handoff, or lifecycle sequence and do not duplicate Required Product Behavior,
- `Required Product Behavior` states Product semantics and observable consequences without Design commentary or implementation strategy,
- vague abstractions such as `reconcile`, `snapshot`, `ready`, `identity`, or `version` are replaced by observable Product semantics unless the abstraction itself is an intentional Product concept,
- future-oriented or premature specification is removed when it is not needed to constrain the current release,
- newly introduced configurable or shared resources have their materially relevant actor, lifecycle, ownership, and scope boundary considered,
- `Dependencies` contains only materially relevant canonical Product Knowledge entities,
- and Acceptance Criteria capture material correctness boundaries rather than restating Required Product Behavior line by line.

Normalization must not silently resolve Product uncertainty. If cleanup exposes a material missing decision, preserve it for the ambiguity scan rather than inventing an answer.

### 5. Run an ambiguity scan

Stress-test the normalized draft rather than immediately asking questions.

Check for material ambiguity in:

- product intent,
- scope,
- materially affected actors,
- current-product assumptions,
- User Outcome,
- Business Outcome, including missing or unsupported business value,
- Key Product Scenarios where they are material,
- required product behavior,
- materially relevant canonical dependencies available from Product Knowledge but omitted from the PRD,
- acceptance criteria,
- assumptions and open decisions,
- and internal consistency.

A useful test is whether two materially different products could both satisfy the current wording.

Also check whether a materially affected actor is missing or a Product Scenario requires unstated Product judgment.

A missing Business Outcome is not by itself an Open Decision. Treat it as a separate Product decision need only when the missing business rationale materially affects a downstream Product decision.

The ambiguity scan produces uncertainty, not questions.

### 6. Resolve uncertainty before escalation

For each material uncertainty, attempt in order:

```text
retrieve → derive → safe reversible assumption → human clarification
```

Do not ask the PM to restate facts that can reasonably be retrieved, including affected actors, current behavior, ownership, or canonical dependency references.

Do not escalate a choice that belongs to Design rather than Product.

### 7. Ask targeted clarification

Ask only unresolved choices that require PM judgment and materially affect product intent, User or Business Outcome, scope, Product Scenarios, required behavior, acceptance criteria, or downstream design direction.

Prioritize questions by decision dependency and downstream impact.

Ask the smallest coherent batch of questions needed to unlock meaningful progress. Do not ask downstream questions whose relevance depends on an unresolved upstream answer unless resolving them together materially improves decision quality.

Each clarification should, when useful, make clear:

- the decision required,
- why the decision matters,
- the materially different options,
- and an AI recommendation when there is a defensible basis for one.

### 8. Reconcile PM decisions into the PRD

A clear PM statement is sufficient to establish a product decision.

After a decision:

- update the owning PRD claim,
- update affected User or Business Outcomes,
- update affected Key Product Scenarios,
- update affected acceptance criteria,
- remove or replace stale assumptions,
- reconcile related scope, behavior, or dependency references,
- re-run semantic normalization on materially affected sections,
- and run a local consistency check.

Do not require a second approval ceremony for the edit itself.

### 9. Reassess remaining uncertainty

If a PM decision creates new material ambiguity, repeat only the affected retrieval, normalization, clarification, and reconciliation work. Do not restart the workflow from zero.

Known material uncertainty must remain visible until resolved even when it does not block useful Design Exploration.

### 10. Assess Problem Alignment

Assess whether the PRD is `Problem Aligned` for Design Exploration.

The PRD is aligned when Design can proceed without needing to invent materially different product intent or behavior.

Check that the affected actors, local current-product baseline, established Outcomes, material scope boundaries, applicable Product Scenarios, required behavior, available canonical material dependencies, acceptance criteria, and remaining uncertainty are sufficiently clear for the next use.

The absence of a canonical dependency reference alone does not block alignment when the material Product behavior and implications are otherwise clear.

Remaining uncertainty is acceptable when it is explicit and does not invalidate useful Design Exploration.

If alignment is not reached, identify the specific blocking gap rather than reporting generic incompleteness.

## Output

The durable output is the reconciled PRD.

Semantic-normalization notes, ambiguity scans, retrieval notes, clarification transcripts, and reasoning do not require separate durable artifacts unless a later demonstrated need justifies one.
