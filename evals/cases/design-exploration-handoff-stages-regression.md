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

## Failure conditions

- Working or proposed directions are labeled "Selected" without Designer authority.
- AI claims an external Figma/design artifact was saved, updated, or accessible without evidence.
- Handoff recreates the PRD as a Design-owned document or automatically manufactures a second source of truth.
- The Agent automatically chooses a file/format because its tool makes that easy.
- Material Product assumptions are silently promoted into established requirements.

## Grading

Use static contract checks for the stage and persistence distinctions; grade a few agent transcripts for semantic stage transitions and source/authority treatment. Do not mandate Figma-specific actions, exact phrasing or fixed output templates.
