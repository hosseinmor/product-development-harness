# Eval: Solution promotion and independent decision coverage

## Purpose

Verify that solution-shaped PM input does not become authoritative Product behavior without sufficient Product authority, and that clarifying proposed surfaces or mechanics does not displace independent material Product decisions.

This regression case is derived from an observed A/C ablation failure. The scenario is synthetic and self-contained; grading protects the semantic invariant rather than exact PRD wording.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`

## Scenario / Inputs

A Product Manager provides solution-shaped intent for helping returning job seekers recognize job posts added since their previous encounter with the same Search. The input explicitly requires that the user can view only New results and proposes a filter or mode as a possible realization. It also tentatively proposes:

- a New marker or other distinguishability treatment in ordinary Search Results,
- a New count on each Recent Search,
- and a New count on each Saved Search.

The relevant PM statement is clear and imperative at the capability level: add a state or filter in Search Results so that the user can view only job posts added since the previous visit. It does not establish that the exact interaction must be a filter, mode, tab, toggle, or other particular control pattern. The marker is phrased as something that would be better to have, and the counts as something that could be shown.

During clarification, the Product Manager establishes only this Product decision:

> v0 includes Search Results as the primary surface, Recent Search, and Saved Search. Other discovery surfaces are outside v0.

No separate Product decision establishes the proposed marker, exact New-only control pattern, or count presentations. The intended behavior depends on a previous-visit baseline, but persistence and user scope across sessions, devices, accounts, and Guest use have not been decided.

Produce or reconcile the PRD and assess its readiness for Design Exploration.

## Expected invariants

- Search Results, Recent Search, and Saved Search may be recorded as in-scope surfaces.
- The explicit capability that the user can view only New results is preserved as required Product behavior without requiring a second approval.
- The capability does not require a filter, mode, tab, toggle, or any other exact interaction pattern; that realization remains open for Design Exploration unless separately constrained by Product.
- In-scope status alone is not treated as authority for behavior on a touchpoint, including ordinary-results distinguishability or a pre-entry New signal on Recent Search or Saved Search.
- Tentative marker, distinguishability, pre-entry signal, and count proposals remain Design hypotheses or open design space rather than Required Product Behavior or Acceptance Criteria.
- A Product-owned capability does not necessarily require resolution before Problem Alignment. A non-binding, non-blocking capability proposal does not become a Product clarification merely so it can be promoted or discarded.
- Unresolved presentation choices such as marker treatment, exact count versus presence indication, and exact control pattern remain open for Design Exploration rather than becoming Product clarification questions merely because they are unresolved.
- Product clarification is reserved for unresolved Product-owned decisions whose resolution is necessary for Problem Alignment.
- After solution-originated clarification, the underlying problem is re-scanned for independent material Product decisions.
- Material persistence or user-scope semantics are surfaced for Product clarification or remain explicitly unresolved when their omission would force Design to invent materially different behavior.

## Explicit failure conditions

Fail if any of the following is true:

- The PRD turns the marker or ordinary-results distinguishability into authoritative Required Product Behavior or Acceptance Criteria solely because Search Results is in scope.
- The PRD discards or downgrades the explicitly established capability to view only New results merely because the input is solution-shaped.
- The PRD requires a filter, mode, tab, toggle, or other exact New-only interaction pattern without separate Product authority.
- The PRD requires a New count on Recent Search or Saved Search solely because those surfaces are in scope.
- The PRD requires a pre-entry New signal on Recent Search or Saved Search solely because those surfaces are in scope or the PM tentatively suggested a count.
- The AI asks Product whether tentative ordinary-results distinguishability or pre-entry signaling should become mandatory when that decision is not required for Problem Alignment.
- The AI asks Product to choose marker treatment, exact count versus presence indication, or an exact control pattern solely because that Design-owned choice remains unresolved.
- The clarification process or final readiness assessment skips materially consequential persistence or user-scope semantics because attention was consumed by the proposed surfaces or mechanics.
- The PRD is declared ready while downstream Design would need to invent those unresolved material Product semantics.

## Recommended grading approach

LLM judge

Judge whether the artifact preserves the explicit Product capability while keeping its unestablished interaction realization open, preserves the Product/Design authority boundary for tentative proposals, and covers independent material Product decisions. Do not require exact wording or a particular section arrangement.
