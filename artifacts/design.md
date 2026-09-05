# Design Artifact Contract

## Purpose

The Design Artifact is the durable representation of the selected experience and interaction solution used to satisfy the PRD.

It makes the experience concrete enough to inspect, challenge, and reconcile without becoming a second owner of product intent.

## Authority

The Design Artifact owns design claims within the Product Design decision domain once the Product Designer has selected them.

AI-generated exploration remains proposal content until the Product Designer establishes a selected direction.

`Selected` does not mean final, immutable, technically validated, or ready for delivery.

## Tool independence

The Harness does not require a specific design tool or representation.

A Design Artifact may be represented by Figma, a prototype, diagrams, structured text, or another medium that can satisfy this contract.

The Harness does not prescribe Figma page structure, frame naming, component structure, or tool-local organization.

## Semantic responsibilities

The selected Design Artifact should communicate, to the extent material for the change:

### Experience Direction

Make the selected experience approach understandable.

### User Flow

Represent how the user moves through the material parts of the changed experience.

A PRD Key Product Scenario describes what materially happens in the product. The Design Artifact User Flow owns how the selected experience enables that product scenario.

If Design exposes a missing or incorrect Product Scenario, the material Product change must return to the PRD rather than silently becoming Design authority.

The artifact does not need to reproduce the full end-to-end product journey when only a subset is relevant.

### Material States

Represent states whose presence or absence changes interpretation of the experience or product behavior.

Examples may include success, empty, error, permission, confirmation, loading, recovery, or other states, but no fixed state taxonomy is required.

Only states needed for meaningful understanding and review are required at this stage.

### Interaction Behavior

Make the interaction decisions needed to understand the solution concrete, including relevant actions, transitions, and recovery behavior.

### Product Assumptions and Change Proposals

If the design depends on product behavior not established by the PRD, make that dependency visible.

A material product assumption remains non-authoritative until resolved by Product Management.

A proposed product change must return to the PRD decision process rather than silently becoming a design decision.

## Design rationale

Capture rationale only when losing it would make a material design decision significantly harder to understand, challenge, or change later.

The Harness does not require written rationale for every design choice.

## Copy and content

Experience copy is owned by Design by default.

When copy communicates a product policy, irreversible consequence, eligibility rule, or other product requirement, the semantic requirement belongs in the PRD while the selected wording may remain a Design decision.

## Relationship to the PRD

The Design Artifact should contain enough experience context to inspect the selected solution while relying on the PRD for product intent and behavioral authority.

It should not duplicate the PRD's problem statement, goals, scope, business rules, or acceptance criteria as independently owned design truth.

References or local repetition for readability are acceptable when ownership remains clear.

## Exploration history

Rejected alternatives, AI-generated directions, and exploration history are not durable artifacts by default.

Preserve them only when losing them would materially harm future understanding or cause important trade-offs to be repeatedly rediscovered.

## Readiness for Design Review

The selected Design Artifact is ready for Design Review + PRD Stress Test when:

- the experience is concrete enough to inspect behavior,
- material flows and states needed to understand the solution are represented,
- material product assumptions or change proposals are visible,
- and the solution can meaningfully be evaluated against the PRD and acceptance criteria.

Pixel-perfect completeness is not required.
