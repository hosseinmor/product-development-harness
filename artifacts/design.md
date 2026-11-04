# Design Artifact Contract

## Purpose

The Design Artifact is the durable specification of the current experience and interaction solution used to satisfy the PRD. During integrated Product Design it may first be a clearly provisional working representation; after selection it records the Designer-owned selected solution, and at handoff it is reconciled with the Designer-polished, reviewed Figma.

It makes the experience concrete enough to inspect, challenge, and reconcile without becoming a second owner of product intent.

## Authority

The Design Artifact owns design claims within the Product Design decision domain once the Product Designer has selected them.

AI-generated exploration remains proposal content until the Product Designer establishes a selected direction.

`Selected` does not mean final, immutable, technically validated, or ready for development handoff. The integrated workflow continues through approved Figma execution, Designer polish, conformance/alignment review and sufficient detailing. Working/proposed content remains non-authoritative until the responsible human establishes its decisions.

## Tool independence

The artifact contract can support different representations. The current integrated Product Design workflow explicitly uses Figma for execution, Designer polish and handoff; alternative media require the human to choose that scope/representation, and cannot silently stand in for a promised Figma deliverable.

A Design Artifact may be represented by Figma, a prototype, diagrams, structured text, or another medium that can satisfy this contract. For UI changes, textual specifications may accompany or reference the visible wireframes/design required by Design Exploration; text alone does not discharge that workflow's visual comparison and inspection requirements. Existing adequate visuals may be reused.

The Harness does not prescribe Figma page structure, frame naming, component structure, or tool-local organization. **For a textual/Markdown Design Artifact**, all section and subsection headings (`##`–`######`) must be English, including additional flow/state/interaction headings. The document's main `#` title and explanatory prose may be Persian. This formatting rule does not rename Figma frames/pages, UI labels, or external design references.

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

Write the selected artifact for a downstream reader who has not seen the exploration conversation. Describe the current selected solution directly; do not require the reader to reconstruct earlier proposals, versions, or human/AI exchanges.

Rejected alternatives, superseded directions, and conversation history are omitted by default. Remove statements that only explain what was suggested, rejected, replaced, or not added. Prefer the selected property itself: "The button has a blue border" rather than "AI's proposal to remove the border was not approved." Do not turn a discarded idea into a future commitment by calling it "deferred to the next phase" unless the responsible human actually established that commitment and it materially constrains the current work.

This is a materiality rule, not a ban on negative statements. Retain exclusions, preservation rules, interaction boundaries, unresolved decisions, and source/representation limitations when omitting them could materially change interpretation, review, or implementation of the selected solution. For example, "The badge is not a separate control" defines interaction; "The Figma frame has not been verified against the selected design" qualifies reference reliability.

Preserve rationale or a rejected alternative only when its loss would materially impair future judgment or cause an important trade-off to be repeatedly rediscovered. When retained, state the relevant constraint or trade-off and enough context to understand it without the conversation; do not reproduce the debate or a sequence of revisions. Existing version history can retain superseded content; no separate exploration log or artifact is required.

Before handoff or after a material artifact update, review the delivered content:

- Does each statement help a reader understand, review, implement, or safely change the current selected solution?
- Can conversation-dependent wording be removed or rewritten as a direct description without losing a material boundary or rationale?
- Are important open decisions, limitations, and authoritative constraints still visible after editing?

Apply this review to the artifact and its concise handoff without changing decided behavior or claiming missing decisions have been resolved.

## Working continuity and conformance

Maintain the same current artifact from useful working progress through selection and handoff; distinguish provisional proposals, established decisions and open dependencies. At pauses, retain the current direction, PRD/Figma references and next action/owner/expected delivery so work can resume after a PM discussion or weeks later. These are concise material continuation details, not a transcript or a separate process document.

Before Designer polish, reconcile the approved material baseline and actual AI-authored Figma into this artifact. Use existing version history and the agreed decisions to compare returned work; do not require a duplicate baseline file or pixel inventory. On return, inspect live frames and reconcile intentional Design changes after the Designer's judgment; Product-semantic changes still require PM authority. Material departures require a targeted explanation request, while routine consistent polish does not. The prior AI design is not an immutable authority.

## Handoff and persistence

The full workflow's development handoff identifies **the current Designer-polished and reviewed Figma, this reconciled Design Artifact, and the current PRD or precise copy-ready PRD changes**. Include actual retrievable locations, affected scope, material remaining dependencies and the next action/owner. Final specifications must match the reviewed Figma; do not hand developers competing descriptions.

An unapplied PRD patch must identify its target, exact text, PM decision status and whether it was applied. A proposal is not a final PRD, and an unresolved Product decision that invalidates implementation blocks unconditional handoff. Keep product requirements in the PRD and experience decisions in Design.

A selected direction does not prove that Figma was implemented, Designer polish returned, conformance checked, or the artifact saved. The integrated request authorizes local working representations and, once the direction/execution is approved and the destination established, the Figma writes and artifact maintenance within that scope. Do not ask again for authorization already given. Ask only for a genuinely missing destination, decision or write scope; tool availability alone grants none.

If persistence or a required representation is unavailable, report exactly what exists and what remains pending. Give the smallest next action rather than claiming completion or silently creating a second authoritative artifact. An explicitly exploration-only request may stop at the selected inspectable direction with later work clearly identified.

## Readiness for Design Review

The selected Design Artifact is ready for Design Review + PRD Stress Test when:

- the experience is concrete enough to inspect behavior,
- material flows and states needed to understand the solution are represented,
- material product assumptions or change proposals are visible,
- and the solution can meaningfully be evaluated against the PRD and acceptance criteria.

Pixel-perfect completeness is not required.

## Readiness for development handoff

Use Step 12 of `../workflows/design-exploration.md`: the Designer-returned Figma has been inspected, material design details are sufficient, bidirectional review findings have been resolved or bounded, and the Figma, specification and PRD/change set are consistent and retrievable. Expose conditional scope and blockers. This is design handoff readiness, not certification of engineering feasibility, implementation QA, release or the broader Delivery Readiness lifecycle.
