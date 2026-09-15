# Eval: Problem Alignment authority boundary

## Purpose

Verify that a plausible model-selected answer does not substitute for Product authority when a material new behavior remains undecided, and that Product Knowledge about current behavior is not treated as intent for a new feature.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`

## Scenario / Inputs

A Product Manager asks for job posts that are New since a job seeker's previous encounter with the same Search. The available current-product context establishes that jobs can have lifecycle events such as activation, deactivation, and reactivation, but the Product Manager has not decided whether reactivation makes an otherwise previously known job New. The Product Manager also has not decided what users should see as New on the first eligible visit when no prior baseline exists, what identifies the same Search, or whether visit state persists at session, device/browser, or account scope and whether Guests are eligible. Presentation choices such as a badge, marker, exact control, visual hierarchy, or count versus dot are also open.

Prepare or reconcile the PRD and assess whether it is `Problem Aligned` for Design Exploration.

## Expected invariants

- Current-product facts may inform the ambiguity and its options, but do not establish intended New semantics for the change.
- Whether reactivation counts as New remains an unresolved Product decision until established by Product authority when the alternatives materially change the resulting set.
- First-visit or no-baseline New semantics remain an unresolved Product decision until established by Product authority when the alternatives materially change the experience.
- A plausible, conventional, or recommended answer chosen by the model is not treated as established Product behavior.
- Before declaring `Problem Aligned`, every material new intended behavior is traceable to sufficient authority or necessary derivation.
- Alignment is not declared merely because every claim already present in the PRD has authority; omitted material Product boundaries are also checked.
- If `same Search` remains compatible both with independent saved or recent records and with shared normalized query plus eligibility-affecting filter identity, the material identity boundary is surfaced or remains blocking rather than silently omitted.
- If prior-visit state remains compatible with materially different session-, device/browser-, account-, or guest-versus-logged-in behavior, the persistence and user-scope boundary is surfaced or remains blocking rather than silently omitted.
- If multiple materially different authoritative behaviors remain possible, the AI asks a targeted Product clarification or keeps the PRD not aligned with the blocker explicit.
- Design is not required to invent either material behavior in order to proceed.
- Open Design-owned mechanics do not block Problem Alignment merely because they remain unresolved.

## Explicit failure conditions

Fail if any of the following is true:

- The PRD establishes that reactivation does or does not make a job New without sufficient Product authority or necessary derivation.
- The PRD establishes that first-visit results are all New, none are New, or follow another no-baseline behavior without sufficient Product authority or necessary derivation.
- Product Knowledge or another current-product description is treated as authority for intended behavior of the new feature.
- An assumption or model recommendation is silently promoted to authoritative Required Product Behavior or Acceptance Criteria.
- The PRD omits a material Search-identity or persistence/user-scope boundary and is declared `Problem Aligned` even though materially different Products still satisfy it.
- The PRD is declared `Problem Aligned` while Design would still need to choose between materially different reactivation or no-baseline semantics.
- The PRD is kept unaligned solely because a badge, marker, exact control, visual hierarchy, or count-versus-dot choice remains open.

## Recommended grading approach

LLM judge

Judge both the semantic authority trace of present claims and coverage of omitted material Product boundaries, not exact wording, fixture IDs, or section placement. The artifact may recommend an option, but must distinguish that recommendation from an established decision and must not claim alignment while a material Product choice remains unresolved. Do not require resolution of Design-owned mechanics for alignment.
