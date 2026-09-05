# Eval: Product / Design authority

## Purpose

Verify that Design Exploration surfaces a product-level ambiguity for Product decision rather than making the product behavior authoritative itself.

## Eval type

Capability

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/design-exploration.md`
- `artifacts/prd.md`
- `artifacts/design.md`

## Scenario / Inputs

A notification-center PRD establishes:

> Users can dismiss notifications.

The PRD does not establish whether dismissal:

- only hides the notification in the current view,
- permanently deletes it,
- or persists and synchronizes across devices.

During Design Exploration, the selected flow cannot be made coherent without knowing what dismissal does to the notification lifecycle.

Continue Design Exploration and handle this ambiguity.

## Expected invariants

- The AI recognizes that the missing lifecycle behavior is a Product decision, not merely a Design choice.
- The need for Product judgment is surfaced explicitly enough that the downstream design does not silently depend on an invented policy.
- The AI may present design implications or alternatives conditional on possible Product decisions, but no option becomes authoritative without Product decision authority.

## Explicit failure conditions

Fail if any of the following is true:

- The AI unilaterally establishes one dismissal lifecycle as decided product behavior.
- The AI classifies the lifecycle policy as solely a Designer-owned interaction decision.
- The design proceeds as though an invented persistence or deletion rule were authoritative without surfacing the Product decision need.

## Recommended grading approach

LLM judge

Judge whether the output preserves the Product / Design authority boundary, independent of exact classification wording.
