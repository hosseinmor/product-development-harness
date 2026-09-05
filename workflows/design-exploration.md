# Design Exploration Workflow

## Purpose

Turn a Problem-Aligned PRD into a substantive design starting point and then a Designer-selected experience direction, while preserving Product and Design decision boundaries.

AI should reduce blank-canvas work without turning the Product Designer into an approver of AI-made design decisions.

## Inputs

- A PRD that is sufficiently Problem Aligned for useful exploration.
- Relevant acceptance criteria.
- Relevant current-product context.
- Existing product patterns or flows when they materially constrain the experience.
- Relevant Design System guidance when available and applicable.
- Relevant reusable components and interaction patterns.
- Relevant content or language guidance.

## Workflow

### 1. Assemble design context

Extract the context required to make design decisions, including:

- what the experience must accomplish,
- what behavior and constraints the PRD establishes,
- what existing flows or patterns are relevant,
- what relevant Design System constraints or guidance apply,
- what reusable components or interaction patterns may materially shape the solution,
- what relevant content or language guidance applies,
- what material states the solution must account for,
- and what remains intentionally unresolved.

Retrieve deeper current-product context when necessary.

Retrieve Design System and content context only to the extent relevant to the task. Do not retrieve or inspect the complete Design System by default.

Design System and content guidance are external design-context sources. The Harness does not prescribe how they are structured, stored, retrieved, or represented in tools such as Figma.

Missing or inaccessible Design System context does not block exploration by itself. AI should make the limitation visible when material and must not invent Design System rules, components, or guidance.

Do not create a separate Design Context artifact by default.

### 2. Produce an AI design exploration draft

Create a substantive starting point before asking the Designer to work from a blank canvas.

When interaction, flow, or material UI states are central to the design problem, prefer a lightweight executable prototype as the default exploration representation.

The Harness does not prescribe how the prototype is built or which tool or runtime is used. The prototype is a Design representation, not production implementation, and must not make technical implementation choices authoritative.

At this stage, prioritize behavior fidelity over visual fidelity. The prototype should make material flows, states, actions, transitions, validation, and recovery behavior experienceable to the extent needed for design judgment and review.

This preference is not universal. When the primary design problem is visual composition, Design System design, branding, or visual refinement, use Figma or another representation better suited to that work.

Before proposing a design direction, AI should account for relevant retrieved Design System constraints, reusable patterns, and content guidance.

Design System guidance constrains design choices within the Design domain; it does not establish product intent or product behavior.

If Design System guidance appears to conflict with the PRD, AI must surface the conflict rather than changing product intent to conform to the Design System. It should identify whether resolution requires a Product decision or a Design/System decision.

AI may:

- derive key user flows,
- identify material states,
- translate PRD constraints into experience constraints,
- identify obvious recovery or edge states,
- propose one or more plausible design directions,
- explain relevant trade-offs,
- identify places where the PRD does not sufficiently constrain the experience,
- and recommend a preferred direction when there is a defensible basis.

AI-generated directions remain proposals. They are not selected design decisions.

Do not manufacture multiple alternatives simply to satisfy a fixed option count. Produce alternatives only when materially different directions are genuinely useful.

### 3. Product Designer exploration

The Product Designer may reject, modify, combine, extend, or replace the AI exploration.

The Designer owns design judgment, including the selected experience direction, interaction patterns, hierarchy, flow, and presentation choices that satisfy the PRD without changing product intent.

Exploration may legitimately expose missing product decisions. That is not a workflow failure.

### 4. Reconcile Product and Design decision boundaries

For material choices exposed during exploration, distinguish:

- **Design decision** — multiple solutions can satisfy the established product behavior; the Product Designer decides.
- **Product-change proposal** — the solution changes what the product permits, requires, prevents, preserves, or causes; PM decision is required.
- **PRD ambiguity exposed by Design** — the solution cannot proceed coherently without product judgment; return the issue to PRD clarification.

Design may originate product-change proposals, but it may not silently make them authoritative.

### 5. Establish the selected design direction

A clear statement or action by the Product Designer is sufficient to establish the current selected direction. No separate approval ceremony is required.

`Selected` does not mean final or immutable. The design may change after review, product reconciliation, or later technical constraints.

Detailed visual refinement may be deferred, including until after Product & Design Alignment, when the remaining refinement does not contain material Product or Design decisions required for Technical Planning.

If later refinement materially changes the selected design, re-review the affected Product and Design decisions before relying on the revised design downstream.

The durable Design Artifact follows `../artifacts/design.md`.

## Readiness for Design Review

Design Exploration is ready for Design Review + PRD Stress Test when:

- a selected direction is concrete enough to inspect the experience behavior,
- material flows and states needed to understand the solution are represented,
- material product assumptions are visible,
- product-change proposals are not disguised as design decisions,
- and the solution can meaningfully be evaluated against the PRD and acceptance criteria.

Pixel-perfect completeness and exhaustive edge-state coverage are not required.

## Output

The durable output is the selected Design Artifact.

AI exploration drafts, rejected alternatives, and working notes are not durable artifacts by default. Preserve them only when losing them would materially harm future understanding or decision-making.
