# Job Vision Product Development Harness

A minimal, tool-agnostic harness for AI-native, human-governed product development at Job Vision.

The Harness defines shared rules, workflow contracts, and artifact boundaries that can be used across tools such as ChatGPT, Claude, Cursor/Codex, Figma, and future environments without depending on any one of them.

## Core principles

- Human roles retain decision authority in their domains.
- AI retrieves context, drafts, derives constrained consequences, identifies ambiguity, recommends, challenges, maintains artifacts, and reconciles inconsistencies.
- AI must not silently convert unresolved product or design judgment into fact.
- Humans should not create extra documentation for AI when the required context can be retrieved or derived from working artifacts.
- Authority belongs to the claim and its owning domain, not to the tool containing it.
- Each fact should have one primary owner where practical.
- Product Knowledge is an external provider of retrievable current-product context. It does not define the Harness and the Harness does not prescribe Product Knowledge's internal structure.
- The architecture remains minimal. New files, layers, schemas, agents, routers, or runtime abstractions require a demonstrated need.

## Initial MVP

The first Harness MVP covers three capabilities:

1. PRD Draft + Clarification
2. Design Exploration
3. Design Review + PRD Stress Test

Engineering and QA workflows will be designed after these capabilities have been exercised and validated.

## Current lifecycle

```text
PM Intent
→ Context Retrieval
→ PRD Draft + Clarification
→ Problem Aligned
→ Design Exploration
→ Selected Design Direction
→ Design Review + PRD Stress Test
→ Product & Design Aligned
→ Technical Planning
→ Product / Design / Technical Reconciliation
→ Delivery Readiness
→ Validation
→ Implementation
→ Convergence
→ Release
→ Product Knowledge Update
```

The lifecycle is intentionally provisional beyond the current MVP.

## Repository structure

```text
.
├── README.md
├── shared-harness-contract.md
├── workflows/
│   ├── prd-draft-clarification.md
│   ├── design-exploration.md
│   └── design-review-prd-stress-test.md
└── artifacts/
    ├── prd.md
    └── design.md
```

The structure follows one rule:

> README navigates. Shared contract governs. Workflow files describe execution. Artifact files define durable outputs.

## Scope boundaries

This repository does not define a central orchestration runtime, Product Knowledge taxonomy, Figma structure, issue-tracker workflow, agent architecture, or tool-specific integration model.

Those may be added later only when a concrete workflow failure demonstrates the need.
