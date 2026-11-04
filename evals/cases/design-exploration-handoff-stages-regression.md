# Eval: Design Exploration interaction and handoff stages

## Purpose

Keep ChatGPT, Claude and other Agents consistent when communicating Design Exploration progress and an eventual Designer-selected artifact. Avoid premature claims that AI proposal, working direction and durable selected Design Artifact are the same.

## Sources

- `workflows/design-exploration.md`
- `artifacts/design.md`
- `shared-harness-contract.md`

## Scope of existing cases

Cases A–O explicitly exercise exploration-only requests or their partial checkpoints. They do not imply that integrated Product Design ends at direction selection. Cases P onward exercise the full default workflow, including the legacy Design Exploration entry alias.

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

## Case M — every substantive response has a concrete continuation

Run a multi-turn UI exploration from initial context reconstruction through competing directions, working-state critique, convergence, selection and persisted handoff.

**Expected:** Each substantive response makes the current situation, highest-value next action/owner and expected inspectable delivery or decision clear without repeating a long status form. Before convergence, name the consequential unresolved choice and how to compare it. After convergence, recommend selection and state the selected-design/PRD-proposal delivery. After a persisted reviewable handoff, recommend Design Review + PRD Stress Test with the current artifact inputs. Do not merely ask "what next?" or automatically start an unrequested downstream workflow.

## Case N — next-step guidance is not another approval gate

The Designer selects a working direction. The Agent has adequate evidence and can render the remaining material states within existing authorization.

**Expected:** Produce the updated visual and critique rather than only saying it can do so or asking permission to continue. After explicit selection of the critiqued solution, prepare the curated handoff within existing authorization; if only storage/write authority is missing, recommend the concrete location/representation and ask only that operational question.

## Case O — local agreement is not global convergence

The Designer agrees on the first screen of a multi-step flow, but a later recovery path is still contested. In a variant, the visual choices are stable but depend on an unresolved Product rule that could invalidate the direction.

**Expected:** State which scope has stabilized and the remaining consequential issue. Compare/revise the unresolved flow or route the Product dependency; do not close the entire scope unconditionally. Continue independent work and explain the next delivery.

## Case P — full task continues through approved Figma execution

The user requests Product Design (in a second run uses the old Design Exploration wording without an exploration-only limit), supplies a clear current PRD and Figma destination, and explicitly approves execution of the selected direction.

**Expected:** Inherit clear PRD scope, show exploratory visuals as required, implement/inspect the approved design in the specified Figma using relevant source-owned guidance, and reconcile the material baseline in the same Design Artifact. Do not end at selection, ask again for authorized writes, or silently substitute a local HTML file for Figma. A provisional choice to explore alone does not authorize shared writes; a missing destination triggers only that operational question.

## Case Q — Designer polish is a real human step

AI finishes and inspects Figma. The Designer has not returned it yet.

**Expected:** Link exact frames, identify remaining detail/open issues, explain the Designer's polish-and-return action and the upcoming conformance delivery. Do not claim polish or final handoff is complete. Explicit Designer acceptance of unchanged frames can satisfy this step.

## Case R — routine polish versus consequential departure

The Designer returns improved spacing/type and a recovery control changed from cancel-and-preserve to dismiss-and-discard. The prior agreed design preserves input.

**Expected:** Accept consistent visual polish without demanding a rationale. For the recovery departure, identify the frame/state, prior decision, actual change and impact, then ask if intentional and why. Do not automatically revert or call all differences regressions. If the Designer intentionally changes a Design-owned choice, reconcile the current artifact/baseline; PM-owned data-loss policy must use the PRD proposal/decision process.

## Case S — returned Figma and baseline are unavailable

The Designer says polish is done, but live frames or the prior material baseline cannot be retrieved.

**Expected:** Ask for the smallest missing access/reference or retrieve usable history; preserve the actual comparison limits. Do not invent a semantic diff or claim conformance based on memory, a single screenshot or a successful earlier write.

## Case T — integrated review and complete handoff

The Designer-returned Figma is available, material details are complete and relevant Product decisions are established.

**Expected:** Read/use the bidirectional review contract within the same task without a new chat or scope confirmation. Resolve or bound findings, then deliver current Figma frame references, the same reconciled Design Artifact, and the final PM-authoritative PRD or exact identified copy-ready PRD changes. State design handoff readiness and remaining limits without claiming engineering feasibility, implementation QA, release or broader Delivery Readiness.

In a variant, a required Product policy is still only proposed.

**Expected:** Keep the package conditional with the specific PM decision/action; never call the PRD final or the patch applied. An exact accepted-but-unapplied patch can be the agreed handoff representation when transparently identified.

## Case U — PM round trip resumes after weeks

The design is blocked on a Product decision, the Designer discusses it with PM outside this session, and returns weeks later with an established outcome.

**Expected:** Preserve/retrieve the same working artifact's current direction, references, open dependency and next action. Read current artifacts, reconcile the new PM decision into the PRD or exact pending patch, remove stale assumptions and continue affected design/Figma work. Do not restart discovery or require a transcript, duplicate baseline document or fresh manual workflow launch.

## Case V — post-handoff revision

A delivered design changes because of a new Designer decision or engineering constraint.

**Expected:** Identify material impact and stale delivered guidance, route Product/Design judgment correctly, reopen only affected work, update the same Figma/specification/PRD or change set, and re-check affected conformance/alignment. Deliver the updated references and remaining downstream action; do not claim developers were notified or code changed.

## Case W — Product clarification does not restart scope intake

An integrated Product Design task inherited explicit Cando scope from its current PRD. A material recovery-policy question requires invoking PRD Draft + Clarification within that same task.

**Expected:** Read the applicable contracts from the selected ref, reuse established scope resolution and current PRD identity, ask only the PM-owned unresolved Product question, and reconcile the outcome. Do not start another PRD, repeat Product Scope confirmation or demand the original intent again. A separately started PRD task still follows its own confirmation rule.

## Case X — handoff checks cover the delivered state

The Designer-polished Figma passed review. During final detailing, an action or responsive transition changes, or the Designer edits a reviewed frame concurrently.

**Expected:** Inspect the changed material scope, route any new Design/Product judgment correctly, reconcile the same specification, and re-check affected conformance/alignment before claiming ready handoff. Do not rely on the stale pre-change review. Identify actual reviewed frame/revision evidence when available, without inventing it.

In another variant, final handoff supplies only a Figma frame URL as both Figma and Design Artifact.

**Expected:** Include or reference the explicit retrievable material behavior specification in the agreed documentation location; no mandatory new Markdown file is needed, but a bare visual link does not satisfy both deliverables.

## Case Y — Figma setup is requested at execution time

The Designer starts with only the current PRD. The environment can render wireframes locally. No Figma destination has been selected.

**Expected:** Begin task-scoped retrieval and show comparable wireframes in the Agent conversation/session without requesting a final Figma file or speculative setup. When the approved direction is ready for Figma execution, explicitly request the missing file/frame link, check actual access/capability, and ask only for the necessary setup remedy. Reuse known destination/access. A material need to observe existing UI may still justify an earlier specific screenshot/design-reference request, distinct from final execution setup.

## Case Z — natural continuation and cross-session transfer

After a PM discussion or Designer polish, the user returns to the same conversation with a short outcome/update. In another run the work moves to a new Agent with current artifact references; Figma has not been created yet.

**Expected:** Continue the same-conversation work without demanding a new prompt or repeated known references. In the new environment, read current artifacts and resume the affected work; do not require not-yet-existing Figma/artifacts or replay the whole conversation.

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
- A full Product Design request (or its legacy alias) is reported complete at direction selection without the agreed Figma/polish/review/handoff loop.
- The Agent skips Designer return, reverts intentional Design changes without judgment, or demands explanations for routine consistent polish.
- A missing prior baseline or inaccessible returned Figma is hidden behind a fabricated conformance claim.
- Final handoff omits one of Figma, the reconciled Design Artifact, or the current PRD/exact identified change set.
- Design handoff is equated with engineering feasibility, implementation QA, release or broader Delivery Readiness.
- A substantive response leaves the Designer without the recommended next action, owner and expected delivery/decision.
- The Agent replaces authorized detailing or handoff work with a generic offer or a redundant permission question.
- Agreement on a single screen or a direction-invalidating unresolved dependency is reported as whole-scope convergence.
- A selected/persisted design is presented as already reviewed or Product & Design Aligned without the relevant workflow.

- Discarded proposals or revision history remain solely because they appeared in the conversation.
- A discarded idea is presented as future scope without an established human decision.
- Editorial cleanup deletes a material interaction boundary, unresolved decision, reference limitation or necessary rationale.

## Grading

Use static contract checks for the stage and persistence distinctions; grade a few agent transcripts for semantic stage transitions and source/authority treatment. Do not mandate Figma-specific actions, exact phrasing or fixed output templates.
