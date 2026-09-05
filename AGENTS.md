# AGENTS.md

This repository is the tool-agnostic Product Development Harness for AI-native, human-governed product development at Job Vision.

For product-development tasks, start here.

## How to use the Harness

1. Read `shared-harness-contract.md` for the rules shared across all workflows and artifacts.
2. Read only the workflow relevant to the current task.
3. Read the artifact contract for any durable artifact you are creating, reviewing, or updating.

Do not load every workflow by default.

## Task routing

| Task | Workflow | Artifact contract |
| --- | --- | --- |
| PRD Draft + Clarification | `workflows/prd-draft-clarification.md` | `artifacts/prd.md` |
| Design Exploration | `workflows/design-exploration.md` | `artifacts/design.md` |
| Design Review + PRD Stress Test | `workflows/design-review-prd-stress-test.md` | `artifacts/prd.md` and `artifacts/design.md` |
| Harness Improvement | `workflows/harness-improvement.md` | — |

## Context

Retrieve only external context relevant to the task, such as:

- Product Knowledge,
- Design System guidance,
- evidence,
- and current working artifacts.

Use context that is already available instead of asking humans to restate it.

If required external context is unavailable, keep the limitation explicit and do not invent missing facts, rules, components, or guidance.

## Operating constraints

Follow `shared-harness-contract.md` for authority, uncertainty, clarification, propagation, and readiness rules.

Do not invent unresolved product or design decisions.

Do not treat AI proposals or assumptions as authoritative facts.

During normal product work, do not add files, schemas, routers, agent layers, or other Harness abstractions unless the task is explicitly to evolve the Harness and a demonstrated need justifies the change.
