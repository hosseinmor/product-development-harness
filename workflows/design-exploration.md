# Product Design Workflow

## Purpose

Turn a Problem-Aligned PRD into an explored, Designer-selected solution, implement the approved direction in Figma, incorporate Designer polish, and reconcile the final Figma, Design Artifact and PRD or precise PRD changes for development handoff. Preserve Product and Design decision boundaries throughout.

AI should reduce blank-canvas work by doing substantive design reasoning before asking the Product Designer to choose or refine a direction.

Design Exploration is the opening activity of this integrated workflow, not its default endpoint. The existing file path and Design Exploration prompt remain supported. An explicitly exploration-only request ends at a selected inspectable direction with remaining work visible; otherwise continue through Figma, Designer polish, review and handoff. Product & Design Alignment and design handoff do not certify engineering feasibility, implementation QA, release readiness or the broader Delivery Readiness lifecycle.

This is not a one-shot prototype generation step. The workflow should reconstruct the relevant current experience, model the design problem, identify the material design decisions, explore meaningful directions, and iterate on a working direction before treating it as selected.

## Inputs

- A PRD that is sufficiently Problem Aligned for useful exploration.
- Relevant acceptance criteria.
- Relevant canonical Product Knowledge context.
- Relevant reviewed Product Walkthrough evidence when the task depends on an end-to-end journey, current flow, handoff, or feature walkthrough.
- Existing product patterns or flows when they materially constrain the experience.
- Relevant Design System guidance when available and applicable.
- Relevant reusable components and interaction patterns.
- Relevant content or language guidance.
- Available evidence, screenshots, implementation references, analytics, or other experience context when materially useful.

## Entry and progression

After Gate 0, read the supplied current PRD and resolve Product Scope under Gate 1 in `../AGENTS.md`. Inherit explicit, unambiguous, non-conflicting PRD ownership without another confirmation; otherwise ask the smallest scope question. Check that the PRD is sufficiently Problem Aligned for useful design work; unresolved Product dependencies that invalidate the affected scope must be routed before relying on it. A separate Design Intent is optional; when absent, explore the relevant PRD scope rather than asking the Designer to invent an initial direction.

The steps below are a revisitable design loop, not a one-way checklist. Proceed autonomously through useful retrieval, synthesis, visual exploration and critique. Pause only for consequential human judgment or a real access/capability dependency; when pausing, identify the exact decision or evidence needed and what it unlocks. Recommending the next step is not a reason to pause: perform already-authorized useful work in the same turn when possible. A working-direction choice authorizes the next detailing/critique work within the existing task scope; do not replace that work with an offer to do it later.

## Workflow

### 1. Reconstruct the relevant current experience

Before proposing a material design direction, understand the existing experience that the change enters, extends, interrupts, or replaces.

Retrieve and reconstruct only the parts of the current experience needed for the design problem, including where relevant:

- the current user journey and entry/exit points,
- the affected product surfaces and their relationship to each other,
- current information hierarchy and interaction patterns,
- material states, validation, recovery, and persistence behavior,
- existing responsive or platform behavior when it materially affects the solution,
- current terminology and content conventions,
- relevant Design System guidance and reusable components,
- and known constraints from the current implementation or product structure.

Use canonical Product Knowledge as the primary documented source for established product meaning and behavior. For end-to-end journeys, current flows, handoffs, and feature walkthroughs, use relevant reviewed Product Walkthrough evidence when available to improve reconstruction. Walkthrough evidence is not canonical Product Knowledge and must not silently override it.

Retrieve deeper evidence when a material design recommendation depends on behavior that is not sufficiently established. Depending on available tools, this may include inspecting implementation, existing design files, screenshots, prototypes, or other directly relevant product evidence. Treat those sources as evidence, not as a silent replacement for the canonical Product Knowledge **of the resolved product scope**. Do not assume a specific code host or repository provider unless the environment establishes one.

If canonical Product Knowledge, reviewed walkthrough evidence, direct observation, or implementation evidence materially conflict, keep the discrepancy visible for reconciliation rather than choosing the most convenient source.

Do not claim that the current experience has been reconstructed more precisely than the available context supports.

When a design recommendation depends on the current UI structure, information placement, or interaction behavior, inspect the relevant current experience before making that recommendation concrete. Canonical Product Knowledge and the PRD alone do not establish the current rendered UI. Do not guess unseen layout, adjacent information, available controls, or interaction behavior from requirements, model knowledge, or a familiar pattern.

Use sufficient current visual or interaction evidence already available; otherwise, when supported access is available, navigate the relevant product pages and walk through the affected flow directly. If direct inspection is unavailable or the evidence is insufficient, explicitly request the smallest useful evidence from the user: for example, a full-page screenshot showing the surrounding information hierarchy, screenshots of a specific state, a short recording of the relevant interaction, or access to the needed page. State exactly which page, section, or transition is needed and why; do not stop at reporting missing UI context or ask for evidence already available.

Match inspection coverage to the decision: a placement recommendation needs the relevant page structure and neighboring information; a flow recommendation needs the material steps, transitions, and states. A cropped component screenshot does not establish the surrounding page, and a static screenshot does not establish unobserved interaction behavior. Keep direct observation in its evidence role; it does not override canonical Product Knowledge or establish intended Product decisions.

If the needed observation remains unavailable, continue useful conceptual exploration or conditional alternatives where possible, explicitly identify the unverified dependency, and defer concrete recommendations that require inventing current UI or behavior. Do not present those recommendations as grounded in the current experience.

Retrieve Design System and content context only to the extent relevant to the task. Do not inspect the complete Design System by default.

Missing or inaccessible Design System context does not block exploration by itself. Make the limitation visible when material and do not invent Design System rules, components, or guidance.

Do not create a separate Design Context artifact by default.

### 2. Build a design problem model

Translate the PRD and reconstructed current experience into the concrete design problem that must be solved.

Identify, to the extent material:

- the user goals and experience outcomes the solution should enable,
- the Product constraints the design must satisfy,
- the affected surfaces and handoffs,
- the material user decisions and moments of friction,
- the material states, transitions, validation, and recovery needs,
- the material Design decisions that are genuinely open,
- relevant existing patterns worth reusing or deliberately departing from,
- and Product assumptions or ambiguities that Design must not silently resolve.

Use relevant general model knowledge, domain knowledge, common UX and interaction patterns, analogous product precedents, and available research to identify overlooked risks, opportunities, or materially different ways to frame the design problem.

This is working reasoning, not a durable artifact by default.

Do not turn every possible UI choice into a formal decision. Focus on choices whose alternatives would materially change the experience, interaction model, information hierarchy, or downstream design work.

### 3. Explore material design directions

Explore one or more materially different directions for the important Design decisions identified in the problem model.

AI should proactively generate alternatives when different approaches expose meaningful trade-offs. Do not manufacture multiple options merely to satisfy a fixed count.

For each material direction, consider as relevant:

- fit with the PRD and acceptance criteria,
- fit with the reconstructed current experience,
- user comprehension and cognitive load,
- interaction cost and recoverability,
- consistency with existing product patterns and Design System guidance,
- scalability across material states or variants,
- accessibility implications,
- content and hierarchy implications,
- and material trade-offs or risks.

Use model/domain knowledge and design precedents as non-authoritative inputs. Do not present a precedent or common pattern as an existing Job Vision pattern unless it was actually retrieved from Job Vision context.

Recommend a preferred direction when there is a defensible basis, and make the reasoning clear enough for the Product Designer to challenge.

AI-generated directions remain proposals. They are not selected Design decisions.

For UI changes, **present a simple visible wireframe or equivalent visual before asking the Designer to choose a working direction**. Show the material differences in layout, hierarchy, controls or flow between the directions being compared, at comparable fidelity and scope. Keep the visuals small and focused on the decision; a full prototype or polished design is unnecessary. If only one defensible direction exists, show its proposal visually without manufacturing alternatives.

Use a rendered representation the Designer can actually inspect, such as an inline visual, screen sketch, lightweight rendered HTML, or accessible existing design. A prose description, raw code, or flowchart alone does not replace a UI wireframe when the decision concerns screen structure. Reuse adequate visuals already available. For a non-UI problem, use a relevant diagram or other inspectable representation when it aids judgment rather than forcing a screen wireframe. If the environment cannot present a visual, explicitly state the capability limitation and the smallest next action; do not silently finish with text or claim a visual was delivered.

The Product Design / Design Exploration request authorizes lightweight session-local exploratory visuals and files needed to render them; do not ask for a separate "give me a wireframe" instruction. Shared Figma execution follows the explicit direction approval and destination rules in Step 9, not tool availability alone. Keep unsupported current-UI dependencies visibly conditional under Step 1.

### 4. Product Designer establishes a working direction

The Product Designer may reject, modify, combine, extend, or replace the AI exploration.

A clear Designer statement or action is sufficient to establish the current working direction. No separate approval ceremony is required.

The Designer owns design judgment, including the working experience direction, interaction patterns, hierarchy, flow, and presentation choices that satisfy the PRD without changing product intent.

A working direction is intentionally provisional. It is concrete enough to deepen and test, but it is not yet the durable selected Design Artifact.

If the Designer delegates a material Design choice to AI by giving decision constraints or criteria, AI may choose and recommend within those constraints, but the choice remains in the Design decision domain.

### 5. Prototype or detail the working direction

After the Designer establishes a working direction, **continue to detail its visible representation without requiring another request for a wireframe**. Cover the material changed flow from entry to outcome, including alternate paths and states needed for the decision; one default screen is insufficient when the change spans several steps. Reuse and deepen the exploratory wireframes rather than creating a mandatory second deliverable.

Choose the representation that best exposes the material design decisions and experience behavior.

When interaction, flow, or material UI states are central to the problem, use a lightweight executable prototype or another interaction-capable representation when practical.

When the primary design problem is visual composition, hierarchy, Design System design, branding, or visual refinement, use Figma or another representation better suited to that work.

The Harness does not prescribe which tool or runtime is used.

At this stage, the representation should make the selected working hypothesis concrete enough to inspect. Prioritize the fidelity needed for the current decision:

- behavior fidelity for flows, states, actions, transitions, validation, and recovery,
- structural fidelity for information hierarchy and responsive relationships,
- visual fidelity only to the degree needed for the material Design judgment being made.

Do not make technical implementation choices authoritative merely because they are convenient for the prototype.

Ensure that multiple affected surfaces represent one coherent Product state and do not silently contradict each other.

Before or during detailing, account for relevant retrieved Design System constraints, reusable patterns, and content guidance.

Design System guidance constrains choices within the Design domain; it does not establish Product intent or Product behavior.

If Design System guidance appears to conflict with the PRD, surface the conflict rather than changing Product intent to conform to the Design System. Identify whether resolution requires a Product decision or a Design/System decision.

### 6. Critique and iterate

Do not treat the first concrete design as the selected solution by default.

Inspect the working direction and its representation as a design hypothesis, then revise when the critique exposes material weakness.

AI should actively critique the design against relevant dimensions such as:

- consistency with the PRD and acceptance criteria,
- consistency with the reconstructed current product experience,
- cross-surface and cross-state consistency,
- information hierarchy and comprehension,
- cognitive and interaction load,
- discoverability and feedback,
- error prevention, validation, recovery, and reversibility,
- accessibility and input-method robustness,
- responsive or platform behavior when material,
- Design System and content fit,
- and Product assumptions or Product-change proposals that may have leaked into the design.

When a prototype or interactive representation exists, exercise the material states and transitions rather than reviewing only the default screen.

Iterate only where critique would materially improve the solution or decision quality. Do not create an endless polish loop or optimize low-value details before material Design decisions are stable.

Revisit earlier steps whenever discussion, critique, or new evidence changes the problem or reveals a stronger approach. The Designer may challenge the framing, request more alternatives, combine directions, or return to a previously rejected direction. AI should propose additional directions when they expose a material opportunity, without a fixed count or a limit on discussion rounds. Update the current visual and recommendation when the working direction changes; do not continue detailing a superseded direction.

**Recognize convergence proactively.** After material discussion or revision, assess whether:

- the main experience, hierarchy and interaction choices have stabilized through Designer input;
- the current visible representation covers the material flow and states;
- critique has addressed material weaknesses and there is no active competing direction requiring comparison;
- remaining Design questions are minor or explicitly bounded, and Product dependencies are identified with their effect on selection and review readiness.

When these conditions hold, recommend closing exploration and establishing the selected design direction. Briefly show the current visual, settled decisions, remaining gaps and PRD implications, then ask only for any still-needed Designer selection. Do not wait for the human to ask "what next?". Convergence is an advisory signal, not authority: silence, elapsed time, number of rounds, or lack of objections is not selection. If a new substantive objection or alternative appears, return to exploration; if the Designer has already clearly selected the critiqued direction, proceed without asking for the same decision again.

Convergence is scope-specific. Agreement on one screen, control, or branch does not establish convergence of the whole requested flow. A material unresolved Product decision or current-experience uncertainty that could invalidate the direction prevents unconditional closure of that affected scope; continue independent parts and route the dependency to its owner.

This internal Design critique is distinct from `Design Review + PRD Stress Test`. It improves the candidate solution before cross-artifact alignment review.

### 7. Reconcile Product and Design decision boundaries

Throughout exploration, and again after material iteration, classify consequential choices correctly:

- **Design decision** — multiple solutions can satisfy established Product behavior; Product Design decides.
- **Product-change proposal** — the proposed solution changes what the Product permits, requires, prevents, preserves, or causes; PM decision is required.
- **PRD ambiguity exposed by Design** — coherent design depends on Product judgment that the PRD has not established; return the issue to PRD clarification.
- **Current-experience uncertainty** — the design depends on an existing behavior that remains insufficiently understood; retrieve deeper canonical context or evidence rather than silently converting uncertainty into a Product decision.

Design may originate Product-change proposals, but it may not silently make them authoritative.

Exploration may legitimately expose missing Product decisions. That is not a workflow failure.

When a Product decision changes the design constraints, update the affected exploration rather than continuing to optimize against stale Product assumptions.

#### PRD update proposals

When exploration exposes a material PRD change or clarification, prepare a concise reviewable proposal in the conversation or existing review mechanism. Raise blocking Product issues when discovered; do not wait for convergence. At convergence, reconcile the complete remaining set against the current PRD, removing proposals superseded by later design changes.

For each independent Product decision, provide:

- **Target:** current PRD identity/location and exact affected section or scenario.
- **Current → proposed:** the relevant current wording (or identify the omission) and exact replacement/addition/removal in copy-ready Markdown. Do not invent unread current wording.
- **Reason:** the design finding or evidence that makes this change necessary.
- **Impact:** materially affected behavior, scenarios, scope, acceptance criteria and Design dependencies, including the consequence of leaving it unchanged.
- **Decision/status:** whether PM acceptance, correction or clarification is needed, or which explicit PM decision already establishes the change. Designer selection alone is not PM acceptance.

Keep Design-owned layout, controls and wording choices in the Design Artifact unless they express a Product requirement. If no Product-semantic change is needed, say so briefly rather than manufacturing a PRD edit or copying UI details into it. Do not create a separate change-log artifact or duplicate PRD.

Once the PM accepts a change, reconcile it into the current PRD under its artifact contract and existing write authorization, preserving identity and applying downstream propagation. Load `../artifacts/prd.md` before editing or exporting the updated PRD. If access or write authority is unavailable, deliver the exact pending patch and identify who must apply it; distinguish proposed, accepted, and actually applied changes. Do not claim Product & Design Alignment from convergence alone.

### 8. Establish the selected design direction

Once the working direction has been made concrete and materially critiqued, the Product Designer may establish it as the selected design direction.

A clear statement or action by the Product Designer is sufficient. No separate approval ceremony is required.

`Selected` does not mean final, immutable, technically validated, or pixel-perfect.

Detailed visual refinement may be deferred, including until after Product & Design Alignment, when the remaining refinement does not contain material Product or Design decisions required for Technical Planning.

If later refinement materially changes the selected design, re-review the affected Product and Design decisions before relying on the revised design downstream.

After selection, reconcile the material experience decisions into the current Design Artifact under `../artifacts/design.md`. A working copy may be persisted earlier to support PM discussions; keep working and selected claims distinguishable. Do not create a second artifact simply to mark selection. In the full workflow, selection is an intermediate checkpoint: recommend and perform the approved Figma execution below, rather than reporting development completion.

### 9. Execute the approved direction in Figma

After explicit Designer approval to proceed with the direction in Figma, implement it in the human-designated file/page or frames. A single clear "proceed in Figma" or equivalent approval in this task is sufficient; do not ask again for already-approved writes within that scope. In a full Product Design request that already asks AI to implement the approved design in Figma, direction approval plus an established destination satisfies this requirement. If only a provisional choice to explore was made, or the target file/scope is missing, ask only for the missing execution approval or destination.

Before writing, read the current target and relevant source-owned Figma, Design Language and Content guidance. Follow the environment's applicable Figma skills/tools for actual execution. Reuse valid components, variables and established product patterns; respect existing content and masters. This workflow does not prescribe a Figma file structure. Do not replace unrelated frames, redesign shared components or publish a library as incidental implementation work.

Implement the approved material flow and states, including responsive relationships, content and interactions necessary for this change. Inspect the rendered result and material behavior rather than assuming successful tool calls prove fidelity. State the actual file/frame location, what was implemented, and any limitations. If access or write capabilities are unavailable, request the smallest remedy, retain the prepared design and state the outstanding Figma work; do not claim completion from a local visual.

Before the Designer takes over, reconcile the current Design Artifact with the approved solution and verified Figma representation. Retain enough of this agreed baseline to compare later changes, using the same artifact and available Figma/version history rather than a new baseline document, duplicate file or exhaustive property snapshot. It must be possible to tell what material behavior, hierarchy, flow, constraints and states were agreed.

### 10. Designer polishes the design

Hand the Designer the exact Figma location and identify any remaining visual/detail work, material open questions and known limitations. State the next action explicitly: the Designer polishes the design and returns the updated frames for conformance review. Do not imply that polishing is completed by AI or silently skip this human step in the normal workflow.

The Designer may refine visual craft, content, layout and interactions, or discover a need to revisit the direction. Earlier AI output is not a constraint on Designer judgment. If the Designer explicitly approves the existing Figma as sufficient and returns it without changes, treat that as their completion of this step without manufacturing edits.

### 11. Review returned design and reconcile decisions

When the Designer returns the design, retrieve the current Figma frames, current PRD, current Design Artifact and the last agreed material baseline. Read the actual returned representation rather than assuming it matches the AI-authored design or relying on memory. If the prior baseline is unavailable, retrieve available version history/decisions or ask a targeted question about the uncertain material change; disclose the comparison limit instead of fabricating a diff.

Compare decision-level meaning and behavior, not every pixel:
- **Consistent refinement:** visual/copy/spacing changes or other changes that still satisfy agreed experience and Product constraints. Accept them and update the representation references or material specification as needed; do not require a rationale for routine polish.
- **Material Design departure:** a changed hierarchy, flow, interaction, state coverage or experience constraint that conflicts with the agreed direction or introduces consequential judgment. Cite the affected frame/state and prior decision, describe the actual difference and consequence, and ask the Designer whether it is intentional and why before treating it as the new agreed baseline. Do not automatically revert it or call it a mistake.
- **Product-semantic change:** a change to eligibility, permissions, persistence, consequences, scope or other PM-owned behavior. Explain its impact and use Step 7's PRD proposal process; Designer polish/selection alone cannot establish that policy.
- **Unverifiable behavior:** static frames do not establish an unrepresented interaction or persistence rule. Retrieve the smallest additional evidence or clarify the specific behavior.

A clear intentional Design decision may supersede the earlier selection in the Design domain. Preserve necessary rationale, update the same artifact and current baseline, and re-check affected flows; reopen exploration when the effect is material enough. PM decisions reconcile into the same PRD and affected design. Do not demand that all polish preserve AI choices.

Use `design-review-prd-stress-test.md` for the bidirectional PRD ↔ Design check within this same task, both when material decisions need review and before final handoff. Read that workflow from the same Harness ref before use; no new chat or repeated scope gate is required. Inspect the returned Figma against the current design specifications and relevant Design Language constraints as well. Re-check changed portions after fixes; avoid full rework when the change is local.

This is **design conformance and change-impact review**, not a runtime software regression test. Regression evals protect whether the Harness performs this review correctly; they do not establish that a real product design is correct. A tool diff or pixel comparison alone cannot establish semantic conformance.

### 12. Prepare development handoff

Complete and verify the design details needed for the actual handoff scope: material screens and responsive behavior, relevant states, actions/transitions, validation/recovery, content and applicable accessibility/interaction constraints. Do not require exhaustive irrelevant states or pixel perfection, but do not defer a material decision to developers under the label "polish".

Deliver one coherent package:
1. **Figma:** exact accessible file/frame references to the current Designer-polished, reviewed design. Identify any part of the design that remains unverified.
2. **Design Artifact:** the same current specification, reconciled with those Figma frames, containing material flows/states/interactions, necessary rationale and explicit remaining dependencies. It complements Figma rather than becoming an independently conflicting design.
3. **PRD:** the current PM-authoritative final PRD when accessible and reconciled, **or** the exact copy-ready proposed/accepted changes against the identified PRD with section targets and decision/application status. Preserve ID and path; never label an unapplied patch as an updated PRD or unapproved changes as final.

Before handing off, apply the Design Artifact's `Exploration history` review: write for a developer absent from the conversation, describe the current solution directly, remove superseded debate, and retain material boundaries, rationale, unresolved issues and reference limitations.

State design handoff readiness separately from Product & Design Alignment. Handoff is ready when the Designer has completed/accepted the Figma, the returned design has been reviewed, material implementation-facing design decisions and coverage are sufficient, the three deliverables are retrievable and consistent, and no unresolved judgment would cause development to invent materially different behavior. An accepted but not applied PRD patch may be the agreed handoff representation if it is exact, clearly identified, and non-conflicting; a still-unapproved Product change that development depends on blocks unconditional handoff.

If a blocker remains, deliver the useful current package marked conditional, name the owner/action needed, and continue independent work. Do not claim a verified Figma handoff from screenshots alone or from a selection statement. Preparing the package is not authorization to send messages to developers, publish a library, or perform other external distribution.

### Pause, resume and reopen

The workflow may span weeks and multiple PM/Designer discussions. At a material pause or handoff, keep a concise continuation note in the same current Design Artifact/working representation: current working or selected direction, authoritative PRD and Figma references, material open decisions/dependencies, and next action/owner/expected delivery. Preserve only what is needed to resume; do not add a transcript, separate process artifact or duplicate versions.

On resume, read the latest artifacts and returned frames, reconcile new PM/Designer decisions, remove stale assumptions and continue from the affected step. Do not restart discovery or reconfirm unchanged product scope solely because time passed or a new conversation is used; apply entry gates for the resumed task and inherit clear current PRD scope.

After handoff, classify new changes by Design/Product/technical impact, identify affected screens/specifications/PRD sections and any previously delivered guidance now superseded, and reopen only the relevant work. Obtain responsible-role decisions where needed, update the same current artifacts and re-run the affected conformance/alignment checks. State the updated handoff location and outstanding downstream reconciliation without claiming developers were notified or code was changed.

## Readiness for Design Review

Design Exploration is ready for Design Review + PRD Stress Test when:

- the relevant current experience has been reconstructed sufficiently for the material design choices being made,
- a selected direction is concrete enough to inspect the experience behavior,
- the material flows, states, and interactions needed to understand the solution are represented,
- important Design decisions have been explored and the selected working hypothesis has been materially critiqued,
- materially affected surfaces and states are internally coherent,
- material Product assumptions and Product-change proposals are visible,
- current-experience uncertainty that could invalidate the solution has been resolved or made explicit,
- and the solution can meaningfully be evaluated against the PRD and acceptance criteria.

Pixel-perfect completeness and exhaustive edge-state coverage are not required.

## Output and interaction contract

The full workflow delivers the reconciled **Figma + Design Artifact + current PRD or exact PRD changes** package from Step 12. Direction selection alone is not the default final output. For an explicitly exploration-only task, stop at the selected inspectable direction, state that Figma execution/polish/handoff remain outside that requested outcome, and identify the next action.

### Always make the next step clear

Every substantive Designer-facing response that advances, pauses or hands off work must make three things clear, concisely: **where the work stands, the next action and its owner, and the inspectable delivery or decision it produces**. This is a conversation rule, not a repeated status form. A narrow factual answer may refer to the still-current next action.

Recommend the highest-value next action with a short reason when useful. Perform already-authorized work instead of ending with "I can do it if you want", asking generic "what next?", or repeatedly asking to continue. Do not invent additional work when the requested outcome is complete.

| Current situation | Next action / owner | Expected delivery |
| --- | --- | --- |
| Context is insufficient | AI retrieves evidence or asks for the precise missing page/state/transition. | Grounded comparison or explicitly conditional visual. |
| Directions have not converged | AI compares the consequential unresolved choice; Designer decides where judgment is needed. | Comparable sketches, targeted prototype or revised recommendation. |
| A working direction needs testing | AI details and critiques material flow/states. | Updated visual and material findings. |
| Direction is selected | Designer gives any still-needed Figma execution approval/destination; AI proceeds within existing authorization. | Implemented and inspected Figma plus the reconciled baseline Design Artifact. |
| AI's Figma work is complete | Designer polishes the specified frames and returns them, or explicitly accepts them unchanged. | Current Designer-returned Figma for conformance review. |
| Returned design has material departures | AI explains exact differences and impacts; Designer explains/decides Design changes, PM decides Product changes. | Reconciled Figma/specification and exact PRD proposals or updates. |
| The design is consistent and sufficiently detailed | AI completes integrated review and prepares Step 12's package. | Verified Figma references, current Design Artifact, final PRD or identified copy-ready changes, readiness and remaining limitations. |
| A dependency blocks progress | AI names the exact decision/access action and owner, continues independent work and preserves a resumption point. | A conditional working package and explicit next action. |
| A delivered design needs revision | AI reopens affected work and routes new decisions to their owner. | Updated same artifacts, affected checks and clear supersession of stale handoff guidance. |

A review within this full workflow is already in scope; load its contracts and perform it without asking the Designer to start a separate workflow. A standalone review remains available. Neither a selected direction, a successful Figma write nor a polished screen alone proves conformance or handoff readiness.

Keep working, selected, awaiting Designer polish/review, and ready/conditional handoff distinguishable in natural language, without imposing a status schema or approval ceremony. Never claim Figma access, writes, publication, persistence, PM acceptance or final readiness without evidence. When a required destination, capability, decision or write authorization is missing, state the exact limitation and smallest next action rather than silently substituting a different final deliverable.

Maintain one current Design Artifact and designated Figma representation; exploratory sketches, alternatives and critique notes are not competing durable artifacts. Retain intermediate decisions only when needed for resumption, conformance or material rationale. Once reconciled, remove superseded discussion and keep the final package understandable without the conversation.
