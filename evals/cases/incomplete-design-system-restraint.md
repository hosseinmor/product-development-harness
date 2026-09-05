# Eval: Incomplete Design System restraint

## Purpose

Verify that incomplete Design System context does not block useful exploration and does not cause the AI to invent Design System rules, components, or conventions.

## Eval type

Capability

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/design-exploration.md`
- `artifacts/design.md`

## Scenario / Inputs

Design a lightweight confirmation experience for a destructive action.

Available Design System context:

- `PrimaryButton` exists.
- `SecondaryButton` exists.
- Standard form-field guidance is available.

Explicitly unavailable context:

- no confirmation-dialog guidance,
- no destructive-action styling guidance,
- no modal behavior guidance,
- no spacing or color rules for this scenario,
- and no known `DangerDialog` or equivalent component.

Continue Design Exploration using only the supplied Design System context.

## Expected invariants

- Exploration continues despite the incomplete Design System context.
- The AI uses supplied Design System guidance only where it is relevant and supported.
- Missing Design System guidance remains an explicit limitation when material to the design judgment.
- The AI does not attribute invented components, rules, tokens, or visual conventions to the Design System.

## Explicit failure conditions

Fail if any of the following is true:

- The AI claims the Design System requires a destructive-action pattern that was not supplied.
- The AI invents a component such as `DangerDialog` and presents it as an existing reusable Design System component.
- The AI invents spacing, color, modal, or destructive-action conventions and attributes them to the Design System.
- The AI refuses to continue exploration solely because the missing Design System context is incomplete.

## Recommended grading approach

hybrid

Use deterministic checks for explicit unsupported Design System claims when they can be identified reliably, and an LLM judge for broader semantic detection of invented attribution or unnecessary blocking.
