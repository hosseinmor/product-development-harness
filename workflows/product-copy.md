# Product Copy Workflow

## Purpose

Write or revise the UI copy of an identified surface without running the full Product Design workflow: for example, revising an existing screen's messages, acting on a copy-audit finding, or writing copy for a small change whose experience is already decided. The output is copy that follows the Content System rules, with every unsourced fact turned into a question for its owner.

Use Product Design instead when the task needs a new or changed experience, flow or hierarchy.

## Inputs

- The target surface: Figma frames, the current product screen, or a copy-audit finding with its location.
- The current PRD when the copy describes new or changed behavior.
- Canonical Product Knowledge of the resolved product.
- The Content System, starting at `foundations/content/README.md` in the Design Language repository, including the copy brief, terminology and naming rules.
- A current Design Artifact, when one exists for the surface.

## Entry

After Gate 0, resolve Product Scope under Gate 1 in `../AGENTS.md`; a supplied current PRD with explicit, unambiguous ownership satisfies it. Cando copy follows the Content System rule for products without a verbal-identity layer.

## Workflow

### 1. Identify slots and states

Inspect the target surface and identify the text slots and states in scope. Follow the shared contract's direct-observation rules; do not infer unseen states, controls or behavior from a single screen. Request the smallest missing evidence, such as a screenshot of a specific state, when it is materially needed.

### 2. Build copy briefs

Build one copy brief per component or message under the Content System contract from the inspected surface, the PRD, Product Knowledge and terminology. Do not ask the human to author briefs. A brief is working reasoning and is not persisted.

### 3. Resolve unknown facts

Retrieve before asking. A fact that still has no source stays Unknown or Unresolved and becomes the smallest question for its owner: the PM for intended behavior, the Product Knowledge owner for a gap in documented current behavior. Do not write copy that asserts it.

### 4. Write and check copy

Write the copy through the briefs and check it against the Content System rules. Copy that would change a product rule, consequence or eligibility is a Product-semantic change and returns to the PM.

### 5. Deliver

Deliver, for each slot in scope: the copy, its location, the rules it was checked against, open questions with their owners, and any new concept names. When a current Design Artifact is supplied, update it under `../artifacts/design.md`. Write to Figma only after explicit approval and with an established destination, as in Product Design Step 9. Do not publish, send or change the product.

## Authority

AI-written copy is a proposal. The Product Designer owns the selected wording; the PM owns any product rule the copy expresses. This workflow does not establish product behavior.
