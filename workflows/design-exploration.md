# Design Exploration Workflow

## Purpose

Turn a Problem-Aligned PRD into a strong design exploration and then a Designer-selected experience direction, while preserving Product and Design decision boundaries.

AI should reduce blank-canvas work by doing substantive design reasoning before asking the Product Designer to choose or refine a direction.

Design Exploration is not a one-shot prototype generation step. The workflow should reconstruct the relevant current experience, model the design problem, identify the material design decisions, explore meaningful directions, and iterate on a working direction before treating it as selected.

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

After Gate 0, read the supplied current PRD and resolve Product Scope under Gate 1 in `../AGENTS.md`. Inherit explicit, unambiguous, non-conflicting PRD ownership without another confirmation; otherwise ask the smallest scope question. Check that the PRD is sufficiently Problem Aligned for the requested exploration. A separate Design Intent is optional; when absent, explore the relevant PRD scope rather than asking the Designer to invent an initial direction.

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

The Design Exploration request authorizes lightweight session-local exploratory visuals and files needed to render them; do not ask for a separate "give me a wireframe" instruction. It does not authorize publishing, changing a shared Figma file, or writing to an external repository. Keep unsupported current-UI dependencies visibly conditional under Step 1.

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

After selection, curate the current representation and concise Design handoff from the settled solution: material flows/states/interactions, necessary rationale, open dependencies, PRD proposals or the statement that no Product-semantic update is needed, and readiness for the next workflow. Do this within existing authorization rather than stopping at "the design is selected". Reuse the designated artifact and visual; if its storage or write authorization is not established, recommend a concrete representation/location and ask only for that missing operational choice. State what has actually been prepared or persisted.

The durable Design Artifact follows `../artifacts/design.md`.

Before handing off or materially updating the selected artifact, apply its `Exploration history` review: write for a reader absent from the conversation, describe the current selected solution directly, and remove superseded proposals or debate that add no material value. Preserve meaningful interaction/scope boundaries, rationale, remaining decisions and reference limitations. Do not convert discarded exploration into an assumed future phase. This is an editorial review within the existing handoff, not another approval gate, artifact or workflow stage.

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

The durable output is the **Designer-selected Design Artifact**, following `../artifacts/design.md`. Do **not** turn every intermediate conversation, mockup, or alternative into a competing durable artifact.

### Always make the next step clear

Every substantive Designer-facing response that advances, pauses, or hands off this work must make three things clear, concisely and in natural language: **where the work stands, the recommended next action and its owner, and what inspectable output or decision that action will produce**. This is a conversation rule, not a repeated status form or additional artifact. A narrow factual answer can refer back to the still-current next step rather than restating the whole workflow.

Recommend the highest-value next action, with a short reason when not obvious; avoid generic endings such as "let me know", "what next?", or "I can make a wireframe if you want". Do not invent new work when the requested scope is complete.

| Current situation | Next action to communicate | Expected next delivery |
| --- | --- | --- |
| Context is insufficient | Retrieve the missing evidence autonomously, or request the precise unavailable page/state/transition and explain the decision it unlocks. | A grounded comparison or an explicitly conditional visual, within available evidence. |
| Directions have not converged | Name the most consequential unresolved choice and recommend how to distinguish the alternatives; ask only the needed Designer judgment after doing available comparison work. | Comparable sketches, a targeted interaction test/prototype, or a revised recommendation for that choice. |
| A working direction needs testing | Detail and critique the relevant flow/states; ask only for a new consequential choice if the work exposes one. | The updated visible representation and material critique findings. |
| Convergence supports selection | Recommend closing this exploration scope and identify any still-needed Designer selection; if selection is already explicit, proceed. | The curated selected visual/Design handoff and reviewable PRD proposals, or an explicit statement that no Product-semantic PRD change is needed. |
| Product judgment or persistence blocks handoff | Name the specific PM decision or operational action, responsible owner, and its effect; continue useful independent work. | A copy-ready PRD proposal/pending patch, or the selected artifact saved at the authorized location once the dependency is resolved. |
| The selected artifact is persisted and reviewable | Recommend Design Review + PRD Stress Test against the identified current PRD and Design Artifact; identify remaining material gaps honestly. | Bidirectional findings and reconciliation, followed by an alignment assessment under that workflow. |

Recommending Design Review does not claim it has run or that Technical Planning/Delivery is ready. If the user has asked to continue through review, route to and read its required contracts before performing it; otherwise hand off the concrete next action and inputs without fabricating completion.

Use three clear **interaction modes**, without imposing a tool or an additional artifact schema:

1. **Exploration (proposals):** Present the relevant design problem, material alternatives and trade-offs, and a grounded recommendation when useful. For UI choices, include the simple comparative visuals from Step 3 before asking the Product Designer for the **smallest consequential Design choice** needed to proceed, not a generic questionnaire. Do not call proposals selected, invent Product decisions, or generate a full Figma/prototype artifact solely to prove exploration happened.
2. **Working Direction (provisional):** Once the Designer selects or adapts an approach to explore, identify that working direction and continue its visible flow/state representation, key assumptions and next meaningful design question. Iterate, revisit alternatives when needed, and proactively propose closure when the convergence conditions hold. Clearly distinguish this state from a final or durable selected solution.
3. **Selected Design Handoff:** After an explicit Designer statement/action establishes the selected direction, present the **actual Design Artifact location/representation** if it exists and is accessible; identify the selected approach and the **material flows, states and interaction decisions**, plus material Product assumptions/change proposals needing PM action (using Step 7's proposal structure) and remaining Design gaps. State whether the representation is **ready for Design Review + PRD Stress Test** using the readiness criteria above. An unresolved Product Decision must not be silently resolved by Design.

If the selected Design Artifact has not been durably saved or the external representation is unavailable, say **`Design Artifact not yet persisted`** (or `location unavailable`), explain the smallest next action, and **do not claim Design Review readiness solely because the Designer selected a direction**. Lightweight session-local exploratory visuals are authorized by this workflow, but do not publish to Figma, write to an external repository, or persist a selected authoritative artifact solely because a tool is available; the human-selected representation and write permission govern durable persistence. A chat summary or generated local copy is not a second authoritative Design Artifact.

Keep the user-facing Handoff concise and reference the current PRD rather than copying its requirements as new Design-owned truth. Design problem models, rejected alternatives, exploratory prototypes, critique notes, and working-state representations are not durable artifacts by default; preserve them only when losing them would materially harm future understanding or the ability to inspect the selected solution.
