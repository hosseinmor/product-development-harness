# Shared Harness Contract

This contract defines the rules shared by all product-development workflows and artifacts in the Job Vision Product Development Harness.

## 1. Source of Truth

Authority is scoped to the kind of claim being made. There is no single global source of truth.

- The Harness is authoritative for product-development rules and artifact contracts.
- Canonical Product Knowledge is the primary source for established Job Vision product meaning and behavior, including concepts, business rules, terminology, and current-product documentation.
- Product Walkthrough provides reviewed evidence for end-to-end journeys, current flows, and feature walkthroughs. It is useful for flow reconstruction but is not canonical Product Knowledge and must not override it.
- Relevant implementation may provide evidence when canonical documentation and reviewed evidence are insufficient, inconsistent, or require investigation. Implementation evidence may expose a Product Knowledge gap, but it does not silently replace canonical JobVision Product Knowledge. The Harness does not assume a specific code host or repository provider.
- The PRD owns decided intended product change, including materially affected users, intended outcomes, material Product Scenarios, required product behavior, and acceptance criteria within its scope.
- The Design Artifact owns the selected experience and interaction solution within the constraints of the PRD.

For JobVision current-product claims, canonical Product Knowledge has precedence over reviewed evidence, observed UI/design, implementation evidence, hypotheses, and recommendations. Evidence may reveal a discrepancy that requires Product Knowledge reconciliation; until reconciled, AI must surface the conflict rather than silently promoting the evidence into canonical product truth.

Product Knowledge and evidence about the current product do not own intended changes.

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

Interpret human input by its semantic role before treating it as a decision. A human message may establish, change, supersede, or reject a decision in that human's domain, but it may instead correct current-product understanding, provide rationale or context, offer an example or hypothesis, instruct retrieval, or challenge existing content. Only input that actually establishes, changes, supersedes, or rejects a human-owned decision carries decision authority for that decision. Other human input may change AI understanding, retrieval, or reasoning without creating a new Product or Design requirement.

Human authority determines what AI may treat as decided; it does not determine what must be written into a durable artifact. Durable artifacts are curated representations of material decisions and necessary context, not transcripts of human input. Persist human-derived information only when omitting it would cause a downstream reader to misunderstand the intended change, miss a material decision or constraint, lack necessary current-product context, or invent materially different behavior. An authoritative correction may require removing an incorrect artifact claim without adding the corrected fact when that fact is not materially relevant.

### Broad cognition, narrow authority

Human decision authority limits what AI may establish as authoritative, not how broadly AI may investigate, reason, explore, or challenge before a decision is established.

Within the scope of the task, AI should proactively use the strongest relevant capabilities and available context to improve decision quality. This may include deeper retrieval, tool use, domain knowledge, analogous patterns, hypothesis generation, alternative framings, counterfactuals, risk analysis, trade-off analysis, critique, and recommendations.

AI should not collapse into transcription, paraphrase, or conservative template completion merely because some claims are uncertain. Instead, it should separate exploration from authority: explore broadly, make the basis and material uncertainty visible, and route human-owned judgment to the responsible role only when a decision is actually required.

Exploration depth should be proportional to the decision at stake. Do not add research, alternatives, or analysis merely for completeness when they cannot materially improve the current decision or downstream work.

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

Provides canonical documented product meaning and behavior, including concepts, business rules, terminology, and retrievable current-product context. It does not own intended changes.

### Product Walkthrough

Provides reviewed evidence packages for end-to-end journeys, current flows, and feature walkthroughs. It is an evidence source for reconstruction and Product Knowledge reconciliation, not canonical Product Knowledge and not an owner of intended changes.

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

The PRD may include concise current-product context and canonical dependency references for downstream understanding, retrieval, and impact analysis. Those contextual references do not override canonical Product Knowledge and should not become duplicate owners of current-product truth. Walkthrough, observation, or implementation evidence may support or challenge current-product understanding, but discrepancies with canonical Product Knowledge must remain visible until reconciled.

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

### Durable artifact persistence

Conversations, AI sessions, and tool-local working state may host exploration, clarification, and human decisions, but they are not the durable state of product development.

When a human establishes a decision that belongs to a durable artifact, AI should reconcile that decision into the current owning artifact so downstream work does not depend on recovering the original conversation.

When continuing existing work, AI should retrieve the current durable artifacts before relying on conversation history. Returning to the same conversation may be convenient, but it is not a workflow requirement.

When an established decision changes, update the current owning artifact and then apply the change-propagation rules to materially affected downstream artifacts. Do not preserve superseded decisions merely as parallel artifact versions unless a demonstrated workflow need requires it.

Durable artifacts must remain retrievable and versioned enough for downstream work and change recovery.

For the current Job Vision pilot, the PRD has a concrete persistence model:

- The canonical PRD is stored as one page in the Wiki of the internal GitLab project `product/prd/agent-harness`.
- One Wiki page represents the current PRD for a product change; do not create parallel version pages by default.
- GitLab Wiki page history provides the PRD revision history and recovery path.
- The PRD's stable `id` is its machine-oriented identity; the Wiki title/path is primarily for human navigation.
- A downloaded, exported, copied, or AI-generated working copy is not a competing source of truth.
- Product Management owns Product decisions and the canonical PRD write. Other roles may comment with proposed changes, but comments do not establish Product authority.
- When a PM accepts a proposed change, the current canonical PRD is updated and downstream change propagation is applied.
- Access permissions are deployment configuration, not something the Harness should infer. They must be verified with the actual team roles before rollout.

This persistence choice is specific to the current PRD workflow. The Harness does not prescribe the storage mechanism for other artifact types unless a demonstrated need justifies one.

The Harness does not require MCP for this model. During the current pilot, retrieval and persistence may remain manual. A future MCP or other controlled integration may automate the same read/write operations without changing artifact authority or workflow semantics.

## 4. Knowledge Contract

The Harness defines what product context is required to perform a task. It does not define how canonical Product Knowledge or evidence sources store, structure, index, or retrieve that context.

For a given task, relevant context may include:

- current user-visible or otherwise relevant implemented behavior,
- relevant users, actors, permissions, and eligibility,
- related flows and material states,
- applicable business rules and constraints,
- known dependencies with adjacent product areas,
- relevant terminology and concepts,
- available evidence relevant to the stated problem,
- and implementation references when deeper investigation is required and available.

Use canonical Product Knowledge as the primary source for established product meaning and behavior. For JobVision, the current canonical Product Knowledge source is `https://docs-jv.jvoffice.ir/`, accessed through a local browser on a company-VPN-connected machine. Product Walkthrough may be used as reviewed evidence to reconstruct journeys, flows, handoffs, or feature behavior when relevant, but it does not become canonical Product Knowledge merely because the evidence was reviewed.

If an environment cannot access canonical Product Knowledge directly, preserve the access limitation and use only relevant context supplied through another trustworthy path. Do not silently substitute the Product Content/Design Knowledge repository, historical Product Knowledge, walkthrough evidence, observed UI/design, implementation evidence, or model knowledge as canonical current-product truth.

When Product Knowledge exposes canonical concepts or identifiers useful for references or dependency navigation, the Harness may use those existing references. The Harness does not define or require a separate Product Knowledge taxonomy.

AI should not ask a human to restate product facts that are already available in canonical Product Knowledge. Evidence sources may be retrieved autonomously when useful, but they remain evidence under the source-precedence rules.

Absence from retrieved context is uncertainty, not evidence that a behavior does not exist.

When canonical Product Knowledge is insufficient, inconsistent with evidence, or materially uncertain, AI may retrieve deeper canonical context and inspect reviewed walkthrough, observation, or implementation evidence to investigate the discrepancy. It must not resolve the discrepancy by silently promoting evidence into canonical Product Knowledge. The Harness must not hard-code a specific implementation host as a semantic dependency.

General model knowledge, domain knowledge, and common product patterns are legitimate non-authoritative inputs for hypothesis generation, candidate framing, alternatives, risks, and recommendations. AI should use them when they improve the quality of Product or Design thinking, especially when PM intent is solution-shaped or retrieved context does not establish the underlying rationale, outcome, or likely tradeoff.

Such model- or domain-informed content must not be presented as established Job Vision current behavior, evidence, or decided Product intent merely because it is plausible. When a hypothesis materially affects framing or a downstream decision, AI should make the hypothesis visible and seek the responsible human judgment when needed rather than replacing it with a mechanical paraphrase of the requested feature.

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
