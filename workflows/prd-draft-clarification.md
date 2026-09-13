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

Apply a Draft Authority Gate throughout drafting and reconciliation, not only during final normalization. Before an intended behavior appears as an unconditional Scope commitment, Required Product Behavior, Acceptance Criterion, or equivalent established Product behavior, trace it to an explicit PM or responsible-human decision, a clarification answer, an authoritative current-product fact or constraint used only to describe current behavior or constrain a necessary derivation, or a consequence necessarily implied by established authority. If the behavior is unresolved, hypothetical, recommended, or only a reversible working assumption, keep that authority state visible and do not state it as a commitment. Safe reversible assumptions remain allowed when useful, but must stay visibly assumed or open until authority is established; only then may reconciliation promote them into authoritative sections.

Current-product eligibility, permissions, channels, lifecycle boundaries, and access rules may inform or constrain reasoning about a new capability, but they do not automatically establish the intended eligibility, permissions, scope, channels, or lifecycle of that capability. Inherit a current-product rule as authoritative for intended behavior only when the inheritance is explicitly established by PM or responsible-human authority, established by clarification, or necessarily implied because the new behavior is inseparable from an already-authorized Product operation. Otherwise keep the intended boundary Unresolved or explicit as an Open Decision. Apply the necessary-implication test: `If the current-product rule were true, could the new capability legitimately use a different rule?` If yes, the inheritance is not established and must not be promoted as intended Product behavior.

When PM intent is solution-shaped or retrieved context does not establish the underlying problem, outcome, rationale, risk, or likely tradeoff, use relevant general model knowledge, domain knowledge, and common product patterns to generate informed hypotheses, candidate framings, alternatives, and recommendations. Do not present those as established Job Vision truth or decided Product intent. If a hypothesis materially affects Product framing or downstream decisions, keep that distinction visible and surface the Product judgment when needed.

Apply a Solution Promotion Gate to proposed interaction or presentation mechanics and capabilities in PM input. Solution-shaped form does not reduce Product authority: a clear, imperative PM statement can establish a Product capability in the initial intent, and does not require a second clarification or approval. Preserve the established capability while separating it from its proposed realization. For example, `the user can view only New results` may be required Product behavior while a filter, mode, tab, toggle, or other exact control pattern remains open for Design unless Product explicitly constrains it. Tentative language such as `it would be better to` or `we could` does not by itself establish mandatory behavior.

Use the test `if this proposed solution were removed from the PM input, would the established Product decisions still necessarily require this behavior?` only when evaluating behavior inferred from an in-scope surface, an adjacent decision, or another implicit inference. Do not use the test to invalidate an explicit PM or human decision. In particular, `surface or touchpoint is in scope` does not imply `the proposed mechanic or capability on that surface is required`.

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

Before asking each clarification, apply a Clarification Ownership Gate: verify both that the unresolved item is Product-owned and that resolving it is necessary for Problem Alignment. Ask Product only when both conditions hold. If the unresolved item is Design-owned, do not ask Product merely because it remains open; preserve it for Design Exploration. Product-owned decisions commonly include identity, semantics, lifecycle or baseline state, persistence, eligibility, permissions or user scope, and business rules. Design-owned decisions commonly include badge or marker treatment, exact visual distinguishability, filter/tab/toggle/control choice, exact count versus presence indication, visual hierarchy, and empty-state presentation unless Product has explicitly constrained them. These examples guide semantic judgment and are not an exhaustive taxonomy.

Apply a Blocking Materiality Gate after ownership is established: `Product-owned uncertainty` does not by itself mean `Product clarification required`. Treat a Product decision as a clarification blocker only when leaving it unresolved would force Design to invent material Product intent or behavior, or would leave the change's core semantics, scope, lifecycle, or acceptance behavior indeterminate. Consider whether materially different answers would change the core Product or a material Design direction, whether the issue belongs to a downstream dependency or policy, whether it is a non-core edge-case or lifecycle branch, and whether the current feature only needs a clear boundary or handoff rather than the dependency's internal policy. If Design can still perform meaningful exploration without material Product invention, do not ask; keep the Product-owned uncertainty explicit as an Open Decision, assumption where safe, or dependency boundary, and allow Problem Alignment when the remaining core behavior is sufficiently established. Do not defer core identity, eligibility, requiredness, submission semantics, persistence, or another boundary when its alternatives would still force materially different Product behavior or Design.

This gate applies in particular to non-binding solution preferences in PM input. Do not ask Product solely to decide whether to promote or discard an optional or tentative proposal. When Design can explore that proposal without inventing material Product semantics and resolving it is not necessary for Problem Alignment, do not make it a Product requirement or clarification blocker; preserve it as a Design hypothesis or open design space. For example, whether New must be distinguishable in ordinary mixed results or whether Recent or Saved Search must signal New before entry can be Product capabilities if required, but tentative suggestions for them need not be resolved before alignment. Badge, marker, color, hierarchy, exact count versus presence, and exact presentation or control remain Design mechanics unless Product explicitly constrains them.

Before emitting any clarification that has passed the Ownership and Blocking Materiality gates, apply a Clarification Atomicity Gate. Each clarification question must resolve one independently answerable Product decision. The Agent must be able to name the single Product decision variable the question resolves. Multiple alternatives may appear in one question only when they are mutually exclusive values of that one variable and all other Product properties remain fixed.

Apply a One-variable test before emission: `What single Product property does this question resolve? Do all options vary only that property? Could two options logically both be true at the same time? Could the human answer one part of this question while legitimately leaving another part undecided?` If no single variable can be named, the options change more than one property, two options can both be true, or one part can be answered while another remains undecided, the question is compound and must be split into separate clarifications.

Do not bundle independent consequences such as visibility or disclosure, submission eligibility or blocking, status transition, rejection or another automation trigger, ranking or prioritization, scoring, persistence or reuse, ownership or scope, and lifecycle timing unless established authority necessarily couples them. These are examples for semantic judgment, not a fixed taxonomy.

Do not disguise independent capabilities as values of an umbrella label or apparent spectrum such as `level of effect`. Do not use package options that change several behaviors together—for example, `prefill and editable`, `prefill with explicit confirmation`, and `automatic submission` vary prefill, editability, confirmation, and submission behavior rather than one Product property. Separate any independently answerable axes whose resolution is materially required.

Atomicity applies to each question, not to the clarification batch. A batch may contain multiple atomic questions when decision dependency and downstream timing are respected. Splitting a compound question must not resurrect Design-owned or non-blocking uncertainty as Product clarification; ownership and blocking materiality are decided before atomic formulation.

Prioritize questions by decision dependency and downstream impact.

Ask the smallest coherent batch of questions needed to unlock meaningful progress. Do not ask downstream questions whose relevance depends on an unresolved upstream answer unless resolving them together materially improves decision quality.

Each clarification should, when useful, make clear:

- the decision required,
- why the decision matters,
- the materially different options,
- and an AI recommendation when there is a defensible basis for one.

### 8. Reconcile PM decisions into the PRD

A clear PM statement is sufficient to establish a product decision.

Before promoting any claim during reconciliation into an unconditional Scope commitment, Required Product Behavior, Acceptance Criterion, or equivalent established Product behavior, apply a Reconciliation Authority Check: ask `What exact authority establishes this claim?` A valid trace must lead to an explicit PM or responsible-human decision, the clarification answer being reconciled, an authoritative current-product fact or constraint only for the current-behavior or constraint claim it actually establishes, or a consequence necessarily implied by established authority. A clarification answer makes authoritative only the semantic decision or decisions it actually resolves. An adjacent consequence, plausible inference, recommendation, convenient completion, or common pattern does not inherit authority merely because it is related.

For every claimed necessary implication, apply the counterfactual test: `If the authoritative decision were true, could this adjacent claim still legitimately be false?` If yes, the adjacent claim is not necessarily implied and must not be promoted. Keep it Unresolved, visibly Assumed when safe, or in Open Decisions according to its actual state. Reconciliation must not silently change the decision state of claims the answer did not resolve.

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

After resolving clarifications that originated from solution-shaped suggestions, re-scan the underlying problem for unresolved material Product decisions independent of those suggestions. Do not let clarification of proposed surfaces or mechanics substitute for material semantics such as identity, lifecycle, baseline or state, persistence, eligibility, permissions or user scope, and important boundary conditions. Use semantic judgment rather than treating these examples as a mandatory checklist.

Known material uncertainty must remain visible until resolved even when it does not block useful Design Exploration.

### 10. Run final whole-artifact semantic normalization

After material Product decisions have been reconciled and remaining uncertainty has been reassessed, normalize the entire PRD again as one artifact before assessing readiness. Do not limit this pass to sections directly edited during reconciliation.

Re-run the semantic checks from Step 4 across the complete PRD, with particular attention to changes introduced during clarification and reconciliation. Check that:

- newly established decisions have not created duplication across Scope, Product Scenarios, Required Product Behavior, and Acceptance Criteria,
- section boundaries remain intact after the artifact accumulated new detail,
- Acceptance Criteria have not expanded into a line-by-line restatement of Required Product Behavior,
- stale assumptions, superseded alternatives, and obsolete uncertainty have been removed,
- current-product knowledge-status or retrieval notes have not leaked into semantic sections such as `Current Behavior`,
- references and Dependencies still serve their distinct roles,
- and the final artifact remains semantically complete with low redundancy.

This pass is cleanup, not a new Product decision step. It must preserve established Product decisions and must not introduce new product behavior merely to make the document look complete.

If whole-artifact normalization exposes a material unresolved Product decision or contradiction, return to the relevant uncertainty-resolution or clarification step before readiness assessment.

### 11. Assess Problem Alignment

Assess whether the PRD is `Problem Aligned` for Design Exploration.

Before declaring alignment, run a brief Pre-Alignment Authority and Material Decision Coverage Check. First, trace each material Product behavior and boundary present in the PRD to an explicit PM or responsible-human statement, a clarification answer, an authoritative current-product fact or constraint, or a consequence necessarily implied by established decisions. Then check for material Product boundaries omitted from the PRD: could two materially different Products still satisfy it because an important Product-owned decision is unspecified? If plausible alternatives would materially change downstream behavior or Design, preserve that boundary as unresolved and obtain Product clarification before alignment. Product Knowledge may establish current facts and constraints, but cannot by itself establish intended behavior for the new change. Apply this counterfactual check semantically rather than as an exhaustive checklist or fixed domain taxonomy. For example, using `same Search` without resolving whether identity follows each saved or recent record versus normalized query and eligibility-affecting filters can produce different baseline and New behavior. Likewise, a feature that depends on prior visits without resolving session-, device-, account-, or guest-versus-logged-in scope leaves materially different state behavior possible. Whether a reactivated job is New and how New behaves on a first eligible visit without a prior baseline similarly require Product authority when their alternatives materially change the experience. A plausible model-selected answer is not sufficient. Open Design choices such as badge, marker, exact control, visual hierarchy, or count versus dot do not block alignment merely because they remain open.

Reapply the Blocking Materiality Gate as a readiness check: Product ownership alone does not prevent alignment. A downstream policy or non-core edge-case may remain explicitly unresolved when the core boundary or handoff is clear and Design can proceed without inventing material Product behavior; an unresolved core boundary that still permits materially incompatible Products must continue to block.

The PRD is aligned when Design can proceed without needing to invent materially different product intent or behavior.

Check that the affected actors, local current-product baseline, established Outcomes, material scope boundaries, applicable Product Scenarios, required behavior, available canonical material dependencies, acceptance criteria, and remaining uncertainty are sufficiently clear for the next use.

The absence of a canonical dependency reference alone does not block alignment when the material Product behavior and implications are otherwise clear.

Remaining uncertainty is acceptable when it is explicit and does not invalidate useful Design Exploration.

If alignment is not reached, identify the specific blocking gap rather than reporting generic incompleteness.

## Output

The durable output is the reconciled and final-normalized PRD.

Semantic-normalization notes, ambiguity scans, retrieval notes, clarification transcripts, and reasoning do not require separate durable artifacts unless a later demonstrated need justifies one.
