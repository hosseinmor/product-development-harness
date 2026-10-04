# AGENTS.md

This repository is the tool-agnostic Product Development Harness for AI-native, human-governed product development at Job Vision.

For product-development tasks, start here.

## Canonical Harness source

The canonical Harness source is the private/internal GitLab repository maintained by Job Vision. The public GitHub repository is a reference/mirror and is not authoritative for day-to-day execution.

If the execution environment cannot access the canonical repository directly, a human may provide the current Harness files manually. Start from this `AGENTS.md` and follow its routing; do not load the whole repository by default.

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

When continuing existing product work, retrieve the current durable artifacts before relying on conversation history or tool-local state. Conversation history may provide useful context, but it must not substitute for the current artifact state.

If required external context is unavailable, keep the limitation explicit and do not invent missing facts, rules, components, or guidance.

## Operating constraints

Follow `shared-harness-contract.md` for authority, uncertainty, clarification, propagation, and readiness rules.

Do not invent unresolved product or design decisions.

Do not treat AI proposals or assumptions as authoritative facts.

Do not create parallel PRD versions such as `v1`, `v2`, or `final` pages unless a demonstrated workflow need explicitly requires them. The current PRD is the canonical Wiki page; GitLab history preserves prior revisions.

During normal product work, do not add files, schemas, routers, agent layers, or other Harness abstractions unless the task is explicitly to evolve the Harness and a demonstrated need justifies the change.
