# PRD Artifact Contract

## Purpose

The PRD is the durable artifact for the intended product change.

It exists to make product intent and required behavior sufficiently explicit that downstream Design and later Engineering work do not need to invent material product decisions.

The PRD should constrain interpretation without becoming a Design specification or implementation plan.

## Authority

The PRD owns decided product claims within its scope, including required product behavior and acceptance criteria.

AI may draft and maintain the PRD, but AI-generated, assumed, or unresolved content does not become authoritative merely because it appears in the document.

A clear PM decision establishes product intent. The PRD makes that decision durable downstream.

## Semantic structure

A PRD should cover the following responsibilities. The headings below are the default representation, not a requirement for a more complex schema.

```markdown
# <Change>

## Problem

## Intended Outcome

## Scope

## Required Product Behavior

## Acceptance Criteria

## Assumptions & Open Decisions
```

`Assumptions & Open Decisions` may be omitted when no material uncertainty remains.

### Problem

Describe the underlying problem or opportunity so a product-team reader can understand it without already knowing the proposed feature. When relevant, make clear the affected actor, context or stage, what the actor is trying to accomplish, the current unmet need, limitation, or friction, and why it matters.

Do not define the Problem only as the absence of a proposed feature, capability, data structure, or solution. When PM Intent is solution-shaped, use the intent and current-product context to construct the strongest supported problem framing; if a material part of that framing requires Product judgment, keep it unresolved and use targeted clarification rather than stating it as fact.

Include enough current-product context to make the intended change understandable. Do not duplicate Product Knowledge or fully document the existing flow by default.

Evidence may support the problem when available, but the absence of evidence does not prevent an initial draft unless the decision fundamentally depends on it.

### Intended Outcome

Describe the outcome the product change is intended to create.

Describe the improved state the change is intended to create for the affected user, business, or product.

Keep the Intended Outcome distinct from Scope, Required Product Behavior, the proposed experience, and implementation. Do not use this section to summarize feature mechanics, constraints, states, rules, or acceptance criteria that belong elsewhere in the PRD.

Prefer describing what becomes better, easier, faster, safer, more consistent, or newly possible if the change succeeds. Include only outcomes that are established by Product intent; do not invent benefits that have not been decided or supported.

Include a success metric when it is known, meaningful, and part of product intent. A separate mandatory `Success Metrics` section is not required.

### Scope

Define the material boundaries of the intended change.

Use Scope to answer what capabilities, actors, scenarios, or product areas are included or excluded from this change, not how the included behavior works in detail.

Include actors, scenarios, exclusions, unchanged behavior, non-goals, or out-of-scope items only when they materially prevent scope expansion or incompatible interpretation.

Do not use Scope to restate detailed product rules, lifecycle behavior, states, validation rules, or acceptance criteria that belong in Required Product Behavior or Acceptance Criteria.

Include a constraint such as a limit, supported type, or version boundary in Scope when it materially defines the shape of the release or prevents scope expansion. Put the detailed behavior of that constraint in Required Product Behavior.

Do not list implementation choices as feature Out of Scope merely because the PRD does not own them. Implementation boundaries are governed by the PRD's artifact boundary unless excluding a technical capability is itself part of Product intent.

`Out of Scope` and `Non-goals` are semantic concepts, not mandatory headings.

### Required Product Behavior

Describe what the product must permit, require, prevent, preserve, or cause.

This section may include material eligibility, permissions, state transitions, business rules, consequences, and lifecycle behavior.

Describe product behavior rather than interface mechanics or technical implementation unless a specific solution is itself a product constraint.

### Acceptance Criteria

Acceptance criteria define the observable or verifiable product conditions that must be true for the intended change to be considered correctly realized.

They are product-owned behavioral constraints for downstream Design, Engineering, Validation, and AI-generated work.

Acceptance criteria should:

- be specific enough to prevent materially incompatible interpretations,
- remain solution-independent where possible,
- describe product-level correctness rather than implementation mechanics,
- derive from decided product intent or logically necessary consequences of it,
- and not silently encode unresolved AI assumptions as product decisions.

Acceptance criteria are not test cases. The future Validation Plan owns how correctness is verified.

No mandatory Given/When/Then syntax is required.

### Assumptions & Open Decisions

Expose only uncertainty that could materially affect downstream interpretation.

Use this section for:

- material reversible assumptions used to keep work moving,
- unresolved product decisions requiring PM judgment,
- and materially uncertain current-product claims that affect the PRD.

Do not use it for low-impact working notes or unknowns that can still reasonably be retrieved.

When an item is resolved, AI should update the owning PRD content and remove or replace the stale uncertainty.

## Current-product references and evidence

References are optional.

Include a source reference when it materially helps verify a current-product claim, revisit evidence, or resolve uncertainty. Do not turn the PRD into a research dossier or bibliography by default.

## What the PRD does not own

By default, the PRD does not own:

- layout,
- visual hierarchy,
- component selection,
- exact screen structure,
- interaction pattern,
- implementation architecture,
- API or database design,
- test cases,
- or analytics event specifications.

These may appear only when they represent a genuine product constraint rather than a downstream solution choice.

## Metadata

The current MVP requires no mandatory PRD metadata such as IDs, status fields, owner fields, versions, timestamps, Jira links, Figma links, confidence values, requirement numbering, or approval signatures.

Add such metadata only after a concrete workflow need is demonstrated.

## Readiness for Design Exploration

A PRD is `Problem Aligned` when it is sufficiently grounded and bounded for meaningful Design Exploration and remaining uncertainty does not force Design to invent materially different product intent or behavior.

Acceptance criteria need to be sufficient for that next use, not exhaustive.
