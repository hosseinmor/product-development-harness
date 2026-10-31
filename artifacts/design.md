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

## Handoff and persistence

Handoff should identify the **actual current selected Design Artifact**, its retrievable location or representation (Figma, prototype or structured text), and the current PRD it satisfies. The selected representation should contain the material experience direction, relevant user flows, states and interaction behavior, and material Product assumptions/change proposals as defined above. A concise chat Handoff may summarize these details **without duplicating the PRD** or creating an independent artifact.

A Designer selecting a direction does not prove the Design Artifact was persisted. If no durable Design Artifact exists yet, explicitly distinguish **selected direction** from **persisted artifact** and do not claim review readiness without an inspectable representation. Do not save to Figma or another store or create a downloadable representation without a human request/authorization. The Harness does not force Markdown export or Figma-specific organization.

## Readiness for Design Review

The selected Design Artifact is ready for Design Review + PRD Stress Test when:

- the experience is concrete enough to inspect behavior,
- material flows and states needed to understand the solution are represented,
- material product assumptions or change proposals are visible,
- and the solution can meaningfully be evaluated against the PRD and acceptance criteria.

Pixel-perfect completeness is not required.
