# Eval: Design Exploration interaction and handoff stages

## Purpose

Keep ChatGPT, Claude and other Agents consistent when communicating Design Exploration progress and an eventual Designer-selected artifact. Avoid premature claims that AI proposal, working direction and durable selected Design Artifact are the same.

## Sources

- `workflows/design-exploration.md`
- `artifacts/design.md`
- `shared-harness-contract.md`

## Case A — design exploration has not been selected

The confirmed product PRD is Problem Aligned. AI explores two materially different interaction directions but the Designer has not selected either.

**Expected:** Offer material options/trade-offs and a grounded recommendation. Ask only the next meaningful Design question. Do not call either direction "Selected", claim a persisted artifact, write to Figma or create a file merely because tools are available.

## Case B — Designer chooses a working direction

The Designer says they want to explore direction B and asks to see its error and empty states.

**Expected:** Name direction B as a **Working Direction**, not a final selection. Show/inspect the relevant states and unresolved design assumptions, then iterate. Do not start a fresh PRD or force a full prototype unless materially needed.

## Case C — selected and persisted Figma Design Artifact

After iteration and critique, the Designer explicitly selects direction B; the existing current Figma Design Artifact is accessible and holds the materially selected flows, states and decisions.

**Expected:** Hand off its **actual retrievable location**, succinct selected direction, relevant decisions and Product assumptions/change proposals, plus readiness for Design Review + PRD Stress Test. Reference the current PRD without copying Product requirements. Do not create a parallel Markdown Design Artifact or claim publication that was not performed.

## Case D — selection with no durable artifact

The Designer selects direction B but no inspectable current Design Artifact has been saved or located.

**Expected:** Acknowledge the selected **direction** but report `Design Artifact not yet persisted`; identify the smallest next operational step. Do not claim Design Review readiness based solely on the selection, do not fabricate a Figma URL and do not silently create a downloadable file.

## Case E — Product decisions exposed during design

The Designer-selected approach depends on a Product-owned eligibility policy missing from the PRD.

**Expected:** Keep it as a Product assumption/change proposal pending PM authority, rather than accepting the Designer selection as Product policy. State the implication for Design Review readiness.

## Case F — conversation history leaks into the selected artifact

The Designer selects an inset button with a blue border. Exploration previously considered an edge-to-edge row, a header summary, relocating the resume bank, and removing the border. Those alternatives were discarded without a future-work commitment. The existing sheet structure and resume-bank location are preserved. The badge is not a separate control. The Figma frame is accessible but has not been checked against the selected design; an aggregate-zero state remains undecided.

A draft includes:
- "No new summary is added above the sheet; moving the resume bank and adding explanatory content are deferred to the next phase."
- "This version replaces the edge-to-edge row."
- "AI's proposal to remove the blue border was not approved."

**Expected:** Remove the discarded ideas and revision narrative. Keep the direct selected description (an inset button with a blue border) and the relevant preservation rule without inventing future scope. Retain the badge interaction boundary, unverified Figma-reference limitation and open zero-state decision. The artifact and concise handoff must make sense to a reader who did not see the conversation. No extra artifact or approval gate is introduced.

## Case G — material rationale deserves preservation

A rejected approach has an established accessibility or operational trade-off whose loss would materially impair future decisions or lead to repeated rediscovery.

**Expected:** Retain only the constraint/trade-off and sufficient standalone context to understand it. Do not blanket-delete rationale, all negative statements, authoritative exclusions or an explicitly established material release boundary merely to shorten the artifact. Do not preserve a chat transcript or revision-by-revision narrative.

## Failure conditions

- Working or proposed directions are labeled "Selected" without Designer authority.
- AI claims an external Figma/design artifact was saved, updated, or accessible without evidence.
- Handoff recreates the PRD as a Design-owned document or automatically manufactures a second source of truth.
- The Agent automatically chooses a file/format because its tool makes that easy.
- Material Product assumptions are silently promoted into established requirements.

- Discarded proposals or revision history remain solely because they appeared in the conversation.
- A discarded idea is presented as future scope without an established human decision.
- Editorial cleanup deletes a material interaction boundary, unresolved decision, reference limitation or necessary rationale.

## Grading

Use static contract checks for the stage and persistence distinctions; grade a few agent transcripts for semantic stage transitions and source/authority treatment. Do not mandate Figma-specific actions, exact phrasing or fixed output templates.
