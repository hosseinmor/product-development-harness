# Eval: Draft-time Product authority

## Purpose

Verify that unresolved intended behavior is not written as established Product behavior in an intermediate PRD draft, and that authoritative current-product context—including adjacent eligibility, channel, lifecycle, access, and permission rules—is not used to invent intended behavior for a new change.

This regression is derived from observed drafts that promoted unresolved reuse, submission, and automation lifecycle behavior before Product authority was available.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`

## Scenario / Inputs

Evaluate three staged reconciliation sequences and three current-rule inheritance cases. In every staged sequence, produce the intermediate PRD state, reconcile only the first Product answer, inspect the resulting authority states, and only then reconcile the later independent answer.

### Sequence A — requiredness and submission consequence

Initially, field requiredness and the consequence of a missing or invalid value are both unresolved. Product then establishes only:

> All supplemental fields selected for a request are required.

Submission could still either be blocked or create an incomplete request; Product has not decided that consequence. In a later step, Product independently establishes:

> A missing or invalid required value blocks request submission.

### Sequence B — future reuse and historical update behavior

Initially, future reuse and whether later saved-answer changes affect historical requests are both unresolved. Product then establishes only:

> A saved answer is reused on future requests.

Historical request values could still remain fixed or update when the saved answer changes; Product has not decided that lifecycle behavior. In a later step, Product independently establishes:

> A historical request preserves the value recorded for that request and is not updated by later saved-answer changes.

### Sequence C — automation capability and trigger timing

Product establishes that a configured rule may trigger an automated action based on a valid submitted value, but has not decided whether that action runs before request creation, after creation, or at a later lifecycle event. In a later step, Product independently establishes that the automated action runs only after successful request creation.

Current Product Knowledge establishes that an existing, unrelated validation rule blocks submission and that a different existing automation runs after request creation. Those current behaviors are relevant context but do not establish any of the new intended consequences or lifecycle decisions above.

### Case D — current channel and new-capability eligibility

Current Product Knowledge establishes that the existing adjacent flow is available only to signed-in users through an internal channel. Product introduces a new capability adjacent to that flow but does not establish the new capability's intended user eligibility or supported channels. The new capability could legitimately be internal-only, support another channel, or have a different eligibility boundary without contradicting the current flow.

### Case E — current object permission and adjacent capability

Current Product Knowledge establishes that editing an existing object is governed by permission X. Product introduces a new capability attached to that object but does not establish who may use it. The new capability could legitimately inherit permission X or use a distinct permission without changing the current edit operation.

### Case F — necessarily inseparable inheritance

Current Product Knowledge establishes the authorization boundary of an existing Product operation. Product explicitly establishes a new behavior as an inseparable part of that same already-authorized operation, with no independent action, entry point, actor, or lifecycle. The new behavior cannot occur unless the authorized operation occurs and cannot use a different authorization boundary without changing the established operation itself.

## Expected invariants

- After the first answer in Sequence A, requiredness becomes authoritative but submission blocking remains unresolved and does not appear as an unconditional Scope commitment, Required Product Behavior, Acceptance Criterion, or equivalent established claim.
- Requiredness does not necessarily imply submission blocking because the product could still allow creation of an incomplete request.
- Only after the independent submission-consequence answer may reconciliation promote missing-or-invalid-value blocking into authoritative behavior and Acceptance Criteria.
- After the first answer in Sequence B, future reuse becomes authoritative but historical mutability remains unresolved and is not labeled Derived or promoted into authoritative behavior.
- Future reuse does not necessarily imply historical immutability because a product could still update historical requests when the reusable saved answer changes.
- Only after the independent historical-update answer may reconciliation promote preservation of historical request values into authoritative behavior and Acceptance Criteria.
- The intermediate draft may establish the existence of the automation capability because that decision has authority, while its trigger timing remains unresolved.
- Before the independent timing answer, automation timing is not presented as an unconditional Scope commitment, Required Product Behavior, Acceptance Criterion, or equivalent established claim.
- Each unresolved behavior may remain visible as an explicit assumption, hypothesis, recommendation, or Open Decision without becoming authoritative.
- Existing current-product validation and automation behavior is described only as current context or a constraint; it is not treated as Product intent for the new behavior.
- After each later explicit Product answer, reconciliation may promote only the newly established semantic decision into authoritative requirements and Acceptance Criteria.
- A clarification answer does not spread authority to adjacent Product behavior that it did not resolve.
- In Case D, the current signed-in and internal-only flow does not establish the intended eligibility or channel scope of the adjacent new capability; those boundaries remain Unresolved or explicit Open Decisions until independently established.
- In Case E, permission X for current object editing does not establish permission X for the adjacent new capability; permission inheritance remains Unresolved or an explicit Open Decision until independently established.
- The inheritance counterfactual is applied semantically: if the current rule can remain true while the new capability legitimately uses a different rule, inheritance is not necessary and is not authoritative.
- In Case F, the existing authorization boundary may constrain the inseparable new behavior because a different boundary would contradict the already-authorized operation; valid necessary inheritance is not rejected merely because it originated in current-product context.
- Promotion removes or updates stale assumptions and keeps the artifact internally consistent.

## Explicit failure conditions

Fail if any of the following is true:

- Requiredness is treated as sufficient authority to claim that missing or invalid input blocks submission before Product decides that consequence.
- Future reuse is treated as sufficient authority to claim that historical request values are immutable or to label immutability Derived before Product decides that lifecycle behavior.
- The existence of an automation capability is treated as sufficient authority to claim its trigger timing or lifecycle before Product decides it.
- Reconciliation changes the authority state of any adjacent Product claim merely because it is a plausible consequence of the answered decision.
- Current Product Knowledge about analogous existing behavior is used to establish any new intended behavior.
- The current flow's signed-in or internal-only boundary is automatically promoted as the new adjacent capability's intended eligibility or channel scope without independent authority or necessary implication.
- Permission X for current object editing is automatically promoted as the attached new capability's permission without independent authority or necessary implication.
- The Agent rejects the necessarily inseparable inheritance in Case F solely because the inherited rule comes from current-product context.
- An unresolved or reversible assumption appears as an unconditional commitment in Scope, Required Product Behavior, Acceptance Criteria, or an equivalent authoritative section.
- After Product authority is supplied, the draft refuses to promote the now-established behavior or leaves contradictory uncertainty in place.

## Recommended grading approach

LLM judge

Judge authority state and semantic promotion after each answer in each sequence and across the inheritance cases, not exact wording, section placement, or tool sequence. The regression passes only when reconciliation promotes the answered decision without leaking authority into independently answerable adjacent behavior, rejects optional inheritance from neighboring current-product rules, and still accepts inheritance that is logically inseparable from an already-authorized operation. Concise current-product context and visibly labeled assumptions are acceptable; unsupported intended commitments are not.
