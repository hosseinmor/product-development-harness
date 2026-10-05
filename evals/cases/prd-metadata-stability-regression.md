# Eval: PRD metadata identity stability

## Purpose

Verify that an existing PRD keeps its established stable artifact `id` across redrafting, normalization, clarification, and reconciliation unless Product explicitly establishes that the work is a different artifact or an intentional identity migration is required.

This regression is derived from an observed PM pilot failure where a valid existing PRD `id` was replaced with `id: unresolved` during a later drafting pass even though the artifact identity had not changed.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `artifacts/prd.md`
- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`

## Scenario / Inputs

An initial working PRD already exists with this metadata:

```yaml
---
id: prd-kando-rejection-reason-notification-defaults
artifact: prd
owner: unresolved
---
```

The same Product change is then retrieved again and the Agent performs additional evidence retrieval, semantic normalization, clarification, and PRD reconciliation. New evidence changes `Current Behavior`, assumptions, and open decisions, but nothing establishes a new artifact identity.

Evaluate these candidate reconciliations:

1. The PRD preserves `id: prd-kando-rejection-reason-notification-defaults`.
2. The PRD replaces the established value with `id: unresolved` because ownership or canonical storage remains unresolved.
3. The PRD silently generates a different new ID from the latest title or wording.
4. The PRD intentionally changes ID only after an explicit human decision that the work is a distinct artifact or after a deliberate identity migration with the old-to-new relationship preserved.

## Expected invariants

- An existing non-placeholder PRD `id` is treated as durable artifact identity and is preserved across ordinary drafting and reconciliation.
- Uncertainty in `owner`, canonical storage location, source access, scope details, or Product decisions does not make the artifact `id` unresolved.
- `owner: unresolved` remains valid when ownership cannot be established; that rule does not imply that `id: unresolved` is a valid replacement for an already established ID.
- Title edits, wording changes, evidence retrieval, semantic normalization, and clarification do not silently regenerate identity.
- A changed ID is acceptable only when there is explicit authority or a deliberate identity migration establishing that the artifact itself changed identity, not merely its content.
- If an intentional identity migration occurs, downstream references must not be silently orphaned.

## Explicit failure conditions

Fail if any of the following is true:

- A valid existing PRD ID is replaced with `unresolved`, blank, a placeholder, or a newly invented value without an explicit identity change.
- The Agent conflates unresolved ownership or storage governance with unresolved artifact identity.
- The Agent derives a replacement ID from the current title merely because the PRD was redrafted or normalized.
- A later clarification or evidence pass causes identity churn while the Product change remains the same artifact.
- A deliberate identity migration is rejected solely because the Harness normally preserves IDs.

## Recommended grading approach

Deterministic comparison when both before/after metadata are available; otherwise semantic regression grading is sufficient. Compare artifact identity rather than exact surrounding YAML formatting.
