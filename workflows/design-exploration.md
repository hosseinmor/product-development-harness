# Design Exploration Workflow

## Purpose

Turn a Problem-Aligned PRD into a strong design exploration and then a Designer-selected experience direction, while preserving Product and Design decision boundaries.

AI should reduce blank-canvas work by doing substantive design reasoning before asking the Product Designer to choose or refine a direction.

Design Exploration is not a one-shot prototype generation step. The workflow should reconstruct the relevant current experience, model the design problem, identify the material design decisions, explore meaningful directions, and iterate on a working direction before treating it as selected.

## Inputs

- A PRD that is sufficiently Problem Aligned for useful exploration.
- Relevant acceptance criteria.
- Relevant current-product context.
- Existing product patterns or flows when they materially constrain the experience.
- Relevant Design System guidance when available and applicable.
- Relevant reusable components and interaction patterns.
- Relevant content or language guidance.
- Available evidence, screenshots, implementation references, analytics, or other experience context when materially useful.

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

Use Product Knowledge as a preferred context provider when available, but retrieve deeper context from authoritative or direct experience sources when a material design recommendation depends on behavior that is not sufficiently established. Depending on available tools, this may include inspecting implementation, existing design files, screenshots, prototypes, or other directly relevant product evidence.

Do not claim that the current experience has been reconstructed more precisely than the available context supports.

If a material recommendation depends on current behavior that remains uncertain, either retrieve deeper context or make the recommendation conditional and reduce its confidence accordingly.

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

A lightweight exploratory sketch or micro-prototype may be used during this step when it materially helps answer a specific design question, but a full prototype is not the default output of early exploration.

### 4. Product Designer establishes a working direction

The Product Designer may reject, modify, combine, extend, or replace the AI exploration.

A clear Designer statement or action is sufficient to establish the current working direction. No separate approval ceremony is required.

The Designer owns design judgment, including the working experience direction, interaction patterns, hierarchy, flow, and presentation choices that satisfy the PRD without changing product intent.

A working direction is intentionally provisional. It is concrete enough to deepen and test, but it is not yet the durable selected Design Artifact.

If the Designer delegates a material Design choice to AI by giving decision constraints or criteria, AI may choose and recommend within those constraints, but the choice remains in the Design decision domain.

### 5. Prototype or detail the working direction

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

This internal Design critique is distinct from `Design Review + PRD Stress Test`. It improves the candidate solution before cross-artifact alignment review.

### 7. Reconcile Product and Design decision boundaries

Throughout exploration, and again after material iteration, classify consequential choices correctly:

- **Design decision** — multiple solutions can satisfy established Product behavior; Product Design decides.
- **Product-change proposal** — the proposed solution changes what the Product permits, requires, prevents, preserves, or causes; PM decision is required.
- **PRD ambiguity exposed by Design** — coherent design depends on Product judgment that the PRD has not established; return the issue to PRD clarification.
- **Current-experience uncertainty** — the design depends on an existing behavior that remains insufficiently understood; retrieve deeper context rather than silently converting uncertainty into a Product decision.

Design may originate Product-change proposals, but it may not silently make them authoritative.

Exploration may legitimately expose missing Product decisions. That is not a workflow failure.

When a Product decision changes the design constraints, update the affected exploration rather than continuing to optimize against stale Product assumptions.

### 8. Establish the selected design direction

Once the working direction has been made concrete and materially critiqued, the Product Designer may establish it as the selected design direction.

A clear statement or action by the Product Designer is sufficient. No separate approval ceremony is required.

`Selected` does not mean final, immutable, technically validated, or pixel-perfect.

Detailed visual refinement may be deferred, including until after Product & Design Alignment, when the remaining refinement does not contain material Product or Design decisions required for Technical Planning.

If later refinement materially changes the selected design, re-review the affected Product and Design decisions before relying on the revised design downstream.

The durable Design Artifact follows `../artifacts/design.md`.

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

## Output

The durable output is the selected Design Artifact.

Design problem models, AI exploration drafts, rejected alternatives, exploratory prototypes, critique notes, and working-state representations are not durable artifacts by default. Preserve them only when losing them would materially harm future understanding, decision-making, or the ability to inspect the selected Design Artifact.
