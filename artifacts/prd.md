# PRD Artifact Contract

## Purpose

The PRD is the durable artifact for the intended product change.

It exists to make product intent and required behavior sufficiently explicit that downstream Design and later Engineering work do not need to invent material product decisions.

The PRD should constrain interpretation without becoming a Design specification or implementation plan.

## Authority

The PRD owns decided product claims within its scope, including intended outcomes, material product scenarios, required product behavior, and acceptance criteria.

AI may draft and maintain the PRD, but AI-generated, assumed, or unresolved content does not become authoritative merely because it appears in the document.

A clear PM decision establishes product intent. The PRD makes that decision durable downstream.

Current-product descriptions and dependency references in the PRD are contextual views of external product truth. They do not become independently authoritative over Product Knowledge or the relevant implementation source.

## Metadata

A PRD uses lightweight YAML frontmatter for stable machine navigation and cross-artifact reference.

The default metadata responsibilities are:

```yaml
---
id: <stable-artifact-id>
artifact: prd
owner: <responsible-product-owner-or-team>
references:
  - <canonical-reference>
related_artifacts:
  - <related-artifact-reference>
---
```

Metadata rules:

- `id` provides stable identity for the PRD. The Harness does not prescribe an ID-generation scheme.
- `artifact: prd` identifies the artifact type.
- `owner` identifies the responsible Product owner or team at the appropriate level.
- `references` contains canonical references to relevant Product Knowledge or other authoritative context when useful.
- `related_artifacts` references related durable artifacts when they exist and the relationship is useful downstream.
- `references` and `related_artifacts` may be omitted when they have no useful entries.
- Metadata is machine-facing navigation data. It should not duplicate semantic PRD content.
- Git is the source of version history.

Do not add generic status, version, timestamps, confidence scores, approval metadata, requirement numbering, Jira links, Figma links, or similar metadata without a demonstrated workflow need.

## Semantic structure

A PRD should cover the following semantic responsibilities. The headings below are the default representation, not a requirement to render empty conditional sections.

```markdown
# <Change>

## Problem

## Affected Users

## Current Behavior

## Outcomes

### User Outcome

### Business Outcome

### Success Metrics

## Scope

## Key Product Scenarios

## Required Product Behavior

## Dependencies

## Acceptance Criteria

## Assumptions & Open Decisions
```

`Success Metrics`, `Key Product Scenarios`, `Dependencies`, and `Assumptions & Open Decisions` are conditional and may be omitted when their semantic responsibility does not apply or has no material content.

### Problem

Describe the underlying problem or opportunity so a product-team reader can understand it without already knowing the proposed feature. When relevant, make clear the affected actor, context or stage, what the actor is trying to accomplish, the current unmet need, limitation, or friction, and why it matters.

Do not define the Problem only as the absence of a proposed feature, capability, data structure, or solution. When PM Intent is solution-shaped, use the intent and current-product context to construct the strongest supported problem framing; if a material part of that framing requires Product judgment, keep it unresolved and use targeted clarification rather than stating it as fact.

Keep detailed current-product baseline in `Current Behavior` rather than duplicating it in the Problem.

Evidence may support the problem when available, but the absence of evidence does not prevent an initial draft unless the decision fundamentally depends on it.

### Affected Users

Identify the actors materially affected by the intended change.

Keep this concise, usually as a short actor list. Do not turn it into persona documentation or repeat detailed needs, journeys, or behavior owned elsewhere in the PRD.

The purpose is to make affected actors easy to scan and make material actor omissions easier to detect.

### Current Behavior

Describe only the local current-product baseline needed to understand the intended change.

Keep it concise and task-scoped. Product Knowledge and the relevant authoritative implementation remain the sources of current-product truth; the PRD should not duplicate the full existing flow or reconstruct Product Knowledge.

Describe relevant current user or product behavior rather than merely stating that the proposed feature does not exist.

Preservation rules introduced by the intended change belong primarily in `Required Product Behavior`, not in `Current Behavior`.

### Outcomes

Outcomes describe the improved state the change is intended to create without summarizing Scope, Required Product Behavior, the selected experience, or implementation.

Do not use Outcomes to repeat feature mechanics, constraints, states, rules, or acceptance criteria.

#### User Outcome

Describe what improves or becomes possible for the affected user or actor if the change succeeds.

User Outcome is a required semantic responsibility. Include only outcomes established by Product intent; do not invent benefits that have not been decided or supported.

#### Business Outcome

Describe why the change matters to Job Vision, the business, or the product at the business level.

Business Outcome is a required semantic responsibility and must not silently substitute for User Outcome or be inferred from it without support.

Do not invent business value. If a Business Outcome has not been established by Product, make that absence explicit and treat it as Product uncertainty when it is material to downstream interpretation or decision-making.

#### Success Metrics

Include a success metric or KPI only when it is meaningful and has been established as part of Product intent.

Do not invent metrics merely to fill the section.

Business Outcome and Success Metric are distinct: Business Outcome is the desired business effect; a Success Metric is an established way that effect or another intended outcome will be measured.

### Scope

Define the material boundaries of the intended change.

Use Scope to answer what capabilities, actors, scenarios, or product areas are included or excluded from this change, not how the included behavior works in detail.

Include actors, scenarios, exclusions, unchanged behavior, non-goals, or out-of-scope items only when they materially prevent scope expansion or incompatible interpretation.

Do not use Scope to restate detailed product rules, lifecycle behavior, states, validation rules, or acceptance criteria that belong in Required Product Behavior or Acceptance Criteria.

Include a constraint such as a limit, supported type, or version boundary in Scope when it materially defines the shape of the release or prevents scope expansion. Put the detailed behavior of that constraint in Required Product Behavior.

Do not list implementation choices as feature Out of Scope merely because the PRD does not own them. Implementation boundaries are governed by the PRD's artifact boundary unless excluding a technical capability is itself part of Product intent.

`Out of Scope` and `Non-goals` are semantic concepts, not mandatory headings.

### Key Product Scenarios

Use Key Product Scenarios when the change has a material user journey, actor handoff, lifecycle sequence, or connected sequence of product behaviors whose context would otherwise be difficult to reconstruct from individual rules.

Describe what materially happens in the product, in sequence. Keep scenarios solution-independent and connect multiple product behaviors into coherent context rather than restating individual acceptance criteria.

Do not specify screens, modals, components, selected interaction patterns, or other Design decisions unless they are themselves Product constraints.

Do not require Product Scenarios for trivial or local changes where sequence adds no material value.

Maintain this distinction:

- PRD Key Product Scenario = what materially happens in the product.
- Design Artifact User Flow = how the selected experience makes it happen.
- Technical Flow = how the system implements it.

Key Product Scenarios are part of the PM-stage PRD before Design Exploration. Design may expose a missing or incorrect Product Scenario, but a material Product change must reconcile back into the PRD rather than becoming Design authority.

### Required Product Behavior

Describe what the product must permit, require, prevent, preserve, or cause.

This section may include material eligibility, permissions, state transitions, business rules, consequences, and lifecycle behavior.

Business Rules remain a semantic type of Required Product Behavior. Do not require a separate top-level `Business Rules` section. Use subsections such as `Business Rules`, `Eligibility`, `Lifecycle`, `Configuration`, or `Evaluation` only when they improve coherence.

Organize related behavior into coherent groups so a reader can understand a product rule and its material consequences without reconstructing it across multiple sections.

Each material product rule should have one primary home. Avoid repeating the same rule across multiple subsections merely for completeness; reference or state its consequence only when that adds materially new information.

Prefer grouping behavior by product concept, actor, or lifecycle when that keeps closely related rules together. Do not create a separate subsection for every individual rule or edge case when it is part of a larger coherent behavior.

Describe product behavior rather than interface mechanics or technical implementation unless a specific solution is itself a product constraint.

### Dependencies

Use Dependencies as a concise retrieval and impact-analysis aid when the change materially depends on existing product concepts or areas.

Prefer canonical Product Knowledge identifiers or concepts from the Product Knowledge taxonomy that actually exists when those references are available. Do not invent a Harness dependency taxonomy.

Preferred form:

```markdown
## Dependencies

- `canonical-product-knowledge-id`
- `another-canonical-id`
```

Do not turn Dependencies into mini-specs or behavior explanations. Do not list every merely related concept. Include only materially relevant dependencies.

Behavioral implications of a dependency belong in Scope or Required Product Behavior.

### Acceptance Criteria

Acceptance criteria define the observable or verifiable product conditions that must be true for the intended change to be considered correctly realized.

They are product-owned behavioral constraints for downstream Design, Engineering, Validation, and AI-generated work.

Acceptance criteria should:

- be specific enough to prevent materially incompatible interpretations,
- remain solution-independent where possible,
- describe product-level correctness rather than implementation mechanics,
- derive from decided product intent or logically necessary consequences of it,
- and not silently encode unresolved AI assumptions as product decisions.

Acceptance criteria should capture material correctness boundaries rather than restate Required Product Behavior line by line. Do not require a one-to-one mapping between behavior statements and acceptance criteria.

Consolidate related conditions only when they represent the same material correctness boundary. Keep conditions separate when they can fail independently in a way that materially affects product correctness.

Acceptance criteria are not test cases. The future Validation Plan owns how correctness is verified.

No mandatory Given/When/Then syntax is required.

### Assumptions & Open Decisions

Expose only uncertainty that could materially affect downstream interpretation.

Use this section for:

- material reversible assumptions used to keep work moving,
- unresolved product decisions requiring PM judgment,
- and materially uncertain current-product claims that affect the PRD.

Do not use it for low-impact working notes, implementation choices, or unknowns that can still reasonably be retrieved.

Known material uncertainty must remain visible until resolved even when it does not block Design Exploration.

When an item is resolved, AI should update the owning PRD content and remove or replace the stale uncertainty.

## What the PRD does not own

By default, the PRD does not own:

- layout,
- visual hierarchy,
- component selection,
- exact screen structure,
- selected interaction patterns or Design User Flows,
- implementation architecture,
- API or database design,
- test cases,
- or analytics event specifications.

These may appear only when they represent a genuine product constraint rather than a downstream solution choice.

## Readiness for Design Exploration

A PRD is `Problem Aligned` when it is sufficiently grounded and bounded for meaningful Design Exploration and remaining uncertainty does not force Design to invent materially different product intent or behavior.

The materially affected actors, local current-product baseline, established User and Business Outcomes, material scope boundaries, applicable Product Scenarios, required product behavior, and material dependencies should be clear enough for the next use. A missing Product judgment may remain unresolved when it is explicit and does not invalidate useful Design Exploration.

Acceptance criteria need to be sufficient for that next use, not exhaustive.
