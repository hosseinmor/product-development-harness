# Design Artifact Contract

## Purpose

The Design Artifact is the durable specification of the current experience and interaction solution used to satisfy the PRD. During integrated Product Design it may first be a clearly provisional working representation; after selection it records the Designer-owned selected solution, and at handoff it is reconciled with the Designer-polished, reviewed Figma.

It is the specification accompanying the visual design: enough experience context to inspect, implement, challenge and safely change the solution, without becoming a second owner of product intent. Prioritize behavior and decisions that cannot be understood reliably from the Figma frames alone.

## Authority

The Design Artifact owns design claims within the Product Design decision domain once the Product Designer has selected them.

AI-generated exploration remains proposal content until the Product Designer establishes a selected direction.

`Selected` does not mean final, immutable, technically validated, or ready for development handoff. The integrated workflow continues through approved Figma execution, Designer polish, conformance/alignment review and sufficient detailing. Working/proposed content remains non-authoritative until the responsible human establishes its decisions.

## Tool independence

The artifact contract can support different representations. The current integrated Product Design workflow explicitly uses Figma for execution, Designer polish and handoff; alternative media require the human to choose that scope/representation, and cannot silently stand in for a promised Figma deliverable.

A Design Artifact may be represented by Figma documentation, a prototype with specification, diagrams, structured text, or another medium that can satisfy this contract. In full Product Design, the visual Figma deliverable must be accompanied by an explicit retrievable specification of the material experience behavior; a bare frame link alone does not satisfy both deliverables. The specification can live in the designated Figma documentation or existing document store; no separate Markdown file is mandatory. For UI changes, textual specifications may accompany or reference the visible wireframes/design required by Design Exploration; text alone does not discharge that workflow's visual comparison and inspection requirements. Existing adequate visuals may be reused.

The Harness does not prescribe Figma page structure, frame naming, component structure, or tool-local organization. **For a textual/Markdown Design Artifact**, all section and subsection headings (`##`–`######`) must be English, including additional flow/state/interaction headings. The document's main `#` title and explanatory prose may be Persian. This formatting rule does not rename Figma frames/pages, UI labels, or external design references.

## Document structure

Use the following stable, lightweight section order for a textual/Markdown Design Artifact. These are document sections, not required database fields or a new artifact schema. Use the English headings below when their content is relevant; omit empty or irrelevant sections instead of filling them with "N/A", speculative edge cases or boilerplate. Add focused flow/state subsections only when useful. In Figma documentation or another selected representation, preserve the same semantic grouping without forcing Markdown formatting.

The document must identify the change and its current PRD/design references; during early work, state any not-yet-established reference honestly. The remaining sections grow only as the design needs them. No new ID scheme, mandatory frontmatter or fixed length is introduced.

### Context & References

Identify the design scope in a short orientation, the current PRD, and the actual relevant Figma frames or other current design representation. Make it clear which part of the experience this specification covers and whether the representation is working, selected or ready/conditional for handoff when that affects interpretation.

Reference the PRD for product intent and requirements; do not reproduce its problem statement, goals, business rules or acceptance criteria. Use precise retrievable references when available, not invented links or a falsely verified Figma location.

### Experience & Flow

Explain the material user path and relationships between the changed screens, panels or steps. Reference the corresponding visual rather than narrating every visible element. Describe entry, exit, alternate paths or cross-surface context only when needed to understand the change.

PRD Key Product Scenarios own what materially happens in the product; this section owns how the selected experience enables it. If a missing Product Scenario or behavior is exposed, route it to PRD reconciliation rather than establishing it here.

### Behavior & States

Specify material interaction behavior that a developer/reviewer cannot reliably infer from the static frames: relevant triggers/actions, transitions, feedback, validation, recovery, persistence expectations already established by Product, and responsive/accessibility behavior when relevant.

Connect rules to their screen/control/state references. Cover necessary success, empty, error, loading, confirmation or other states without a mandatory state taxonomy. Do not list every possible state merely for completeness or infer unobserved semantics from a screenshot. Do not prescribe APIs or technical implementation decisions unless they are established constraints.

### Key Decisions

Retain consequential Design choices and concise rationale whose loss would make implementation or future change materially harder. State the current chosen property and necessary trade-off directly. Do not turn all visual choices into formal decisions, preserve a debate log, or list rejected alternatives by default. Use the rationale and exploration-history rules below.

### Open Issues & Dependencies

Include only material unresolved questions, assumptions, Product proposals, access/reference limitations or external dependencies. State the effect on the affected design/handoff scope, the responsible decision/action owner, and the next needed step.

Keep reversible proposals distinguishable from established decisions. Reference the current PRD or exact Product-change proposal rather than making a second Product decision ledger here. Resolve/remove stale entries when the owning decision changes; omit this section if nothing material remains open.

### Handoff

Briefly state what representation and scope were actually inspected, the current handoff readiness/limitations, and the next action/owner. Reference the same final Figma, Design Artifact and PRD/change set rather than duplicating their contents. Readiness must follow the criteria below and the integrated workflow; a filled section is not proof the checks were performed.

While work is paused, use this section for the concise next action and expected delivery needed to resume. At final handoff, replace obsolete working instructions with the current handoff facts; keep any remaining material dependency visible.

## Writing and materiality

Write for a developer or reviewer who has not seen the conversation. Prefer clear, observable behavior and necessary constraints over a long narrative.

Do not transcribe what Figma already makes unambiguous, such as every label, color, dimension or placement. Include such a fact only when it carries a material interaction, responsive/accessibility rule, exception, constraint or rationale that would otherwise be missed. Likewise, do not reproduce reusable Design Language rules or selected UI copy as an independent source when a precise reference is sufficient. Use local repetition only when necessary for understandable behavior or a material boundary.

Keep one owner for each decision: Figma and this specification describe one consistent Design solution; the PRD owns Product intent. If they conflict, surface and reconcile the discrepancy rather than picking whichever is convenient or handing off competing requirements.

## Design rationale

Capture rationale only when losing it would make a material design decision significantly harder to understand, challenge, or change later.

The Harness does not require written rationale for every design choice.

## Copy and content

Experience copy is owned by Design by default.

When copy communicates a product policy, irreversible consequence, eligibility rule, or other product requirement, the semantic requirement belongs in the PRD while the selected wording may remain a Design decision.

AI-written copy follows the Content System copy brief contract. The brief is working reasoning and is not stored in this artifact. Record here only what a downstream reader needs: new concept names introduced by this design with their PRD reference, so they can be matched to Product Knowledge after publish; copy that carries a product rule, referencing the PRD requirement; and open copy questions under Open Issues & Dependencies with their owner. Do not transcribe UI copy that the Figma frames already show unambiguously.

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

Use Step 12 of `../workflows/design-exploration.md`: the Designer-returned Figma has been inspected, material design details are sufficient, bidirectional review findings have been resolved or bounded, and the Figma, specification and PRD/change set are consistent and retrievable. Any material detailing or frame changes made after review must have their affected conformance/alignment checked again; the readiness statement applies to the actual delivered state. Expose conditional scope and blockers. This is design handoff readiness, not certification of engineering feasibility, implementation QA, release or the broader Delivery Readiness lifecycle.
