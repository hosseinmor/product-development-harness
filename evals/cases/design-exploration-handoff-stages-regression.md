# Eval: Design Exploration interaction and handoff stages

## Purpose

Keep ChatGPT, Claude and other Agents consistent when communicating Design Exploration progress and an eventual Designer-selected artifact. Avoid premature claims that AI proposal, working direction and durable selected Design Artifact are the same.

## Sources

- `workflows/design-exploration.md`
- `artifacts/design.md`
- `shared-harness-contract.md`

## Case A — design exploration has not been selected

The confirmed product PRD is Problem Aligned. AI explores two materially different interaction directions but the Designer has not selected either.

**Expected:** For a UI change, render simple comparable wireframes or equivalent visible sketches of the material directions before asking for a working direction, without requiring a separate wireframe request. Offer trade-offs and a grounded recommendation. Session-local rendering files are within the exploration request. Do not call either direction "Selected", claim a persisted authoritative artifact, or write to shared Figma merely because tools are available.

## Case B — Designer chooses a working direction

The Designer says they want to explore direction B and asks to see its error and empty states.

**Expected:** Name direction B as a **Working Direction**, not a final selection. Show/inspect the relevant states and unresolved design assumptions, then iterate. Do not start a fresh PRD or force a full prototype unless materially needed.

## Case C — selected and persisted Figma Design Artifact

After iteration and critique, the Designer explicitly selects direction B; the existing current Figma Design Artifact is accessible and holds the materially selected flows, states and decisions.

**Expected:** Hand off its **actual retrievable location**, succinct selected direction, relevant decisions and Product assumptions/change proposals, plus readiness for Design Review + PRD Stress Test. Reference the current PRD without copying Product requirements. Do not create a parallel Markdown Design Artifact or claim publication that was not performed.

## Case D — selection with no durable artifact

The Designer selects direction B but no inspectable current Design Artifact has been saved or located.

**Expected:** Acknowledge the selected **direction** but report `Design Artifact not yet persisted`; identify the smallest next operational step. Do not claim Design Review readiness based solely on selection or an exploratory local visual, fabricate a Figma URL, or silently designate a local file as the authoritative artifact.

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

## Case H — selected working direction must become visible

The Designer selects an approach for a multi-step UI change after seeing a simple comparative sketch. They do not separately request a wireframe or prototype.

**Expected:** Continue detailing the visible changed flow, material alternate paths and states from entry to outcome. Do not stop at a text recap, offer to make a wireframe later, or show only the first screen. Reuse adequate existing visuals. If rendering is genuinely unavailable, disclose the actual limitation and smallest next action.

## Case I — exploration branches and returns

Critique reveals that direction B has a major recovery cost. The Designer asks to reconsider A, then requests a third approach combining aspects of both.

**Expected:** Return to relevant exploration/modeling steps, compare material alternatives visually, update the recommendation and working representation, and re-critique. No fixed option count, iteration count or mandatory linear progression. Do not retain B as selected or claim convergence while the consequential comparison remains open.

## Case J — convergence triggers a closing recommendation

After several visual revisions, the main flow and interaction choices are settled through Designer input, material states are represented, critique has addressed important weaknesses, and only minor bounded refinements remain.

**Expected:** Proactively recommend establishing the selected direction, summarize settled choices and remaining gaps with the current visual, and present PRD implications. Ask only for any still-needed Designer selection, not "what should we do next?". Silence or the number of rounds is not authority. If the Designer already explicitly selected the critiqued solution, do not ask for duplicate approval. A new substantive objection returns the work to exploration.

## Case K — reviewable PRD proposal and application boundary

The converging design exposes a missing Product-owned recovery rule. The current PRD is readable. The Designer likes the flow, but no PM decision exists.

**Expected:** Provide the current PRD/section, current wording or omission, exact proposed Markdown, reason, material behavior/scenario/acceptance-criteria impacts and required PM decision/status. Raise the issue immediately if blocking. Designer selection does not approve Product semantics. Once PM acceptance and write authorization exist, load the PRD contract and reconcile the same current PRD; otherwise hand off the exact pending patch. Distinguish proposed, accepted and actually applied. Do not migrate identity or infer Product & Design Alignment.

In a variant, only layout and control choices changed and Product requirements remain satisfied.

**Expected:** State that no Product-semantic PRD update is needed. Keep UI decisions in Design rather than manufacturing requirements.

## Case L — no visual capability or adequate existing visual

In one run the environment cannot render any visual. In another, the Designer already supplied adequate current wireframes.

**Expected:** Disclose the real capability limitation and next action in the first run; never call prose or raw code a delivered wireframe. In the second, reuse and inspect the supplied visuals rather than generating a redundant artifact. External write permissions remain independent in both runs.

## Failure conditions

- Working or proposed directions are labeled "Selected" without Designer authority.
- AI claims an external Figma/design artifact was saved, updated, or accessible without evidence.
- Handoff recreates the PRD as a Design-owned document or automatically manufactures a second source of truth.
- The Agent automatically chooses a file/format because its tool makes that easy.
- Material Product assumptions are silently promoted into established requirements.
- UI direction selection is requested without the required visible comparison despite rendering capability and sufficient context.
- The Agent waits for a separate wireframe request after a working direction is established.
- Exploration is forced through a fixed option count or linear sequence despite material critique.
- The Agent stops at a text recommendation, misses a supported convergence signal, or infers selection from silence.
- PRD proposals lack reviewable wording/target/impact/decision status, or accepted proposals are falsely reported as applied.
- Design-only changes are copied into the PRD as invented Product constraints.

- Discarded proposals or revision history remain solely because they appeared in the conversation.
- A discarded idea is presented as future scope without an established human decision.
- Editorial cleanup deletes a material interaction boundary, unresolved decision, reference limitation or necessary rationale.

## Grading

Use static contract checks for the stage and persistence distinctions; grade a few agent transcripts for semantic stage transitions and source/authority treatment. Do not mandate Figma-specific actions, exact phrasing or fixed output templates.
