# Job Vision Product Development Harness

A minimal, tool-agnostic harness for AI-native, human-governed product development at Job Vision.

The Harness defines shared rules, workflow contracts, artifact boundaries, and optional validation/runtime infrastructure that can be used across tools such as ChatGPT, Claude, Cursor/Codex, Figma, and future environments.

The core Harness is tool-agnostic. Some validation/runtime implementations in this repository are currently provider-specific and are not required to use the core Harness.

## Core principles

- Human roles retain decision authority in their domains.
- AI retrieves context, drafts, derives constrained consequences, identifies ambiguity, recommends, challenges, maintains artifacts, and reconciles inconsistencies.
- AI must not silently convert unresolved product or design judgment into fact.
- Humans should not create extra documentation for AI when the required context can be retrieved or derived from working artifacts.
- Authority belongs to the claim and its owning domain, not to the tool containing it.
- Each fact should have one primary owner where practical.
- Product Knowledge is an external provider of retrievable current-product context. It does not define the Harness and the Harness does not prescribe Product Knowledge's internal structure.
- The architecture remains minimal. New files, layers, schemas, agents, routers, or runtime abstractions require a demonstrated need.

## Implemented Harness scope

The current Harness MVP covers three product-development capabilities:

1. PRD Draft + Clarification
2. Design Exploration
3. Design Review + PRD Stress Test

The implemented product/design path is:

```text
PM Intent
→ Context Retrieval
→ PRD Draft + Clarification
→ Problem Aligned
→ Design Exploration
→ Selected Design Direction
→ Design Review + PRD Stress Test
→ Product & Design Aligned
```

Engineering and QA workflows are intentionally not yet defined as full Harness workflows.

## Provisional future lifecycle

The broader product-development lifecycle remains provisional beyond the implemented MVP:

```text
Product & Design Aligned
→ Technical Planning
→ Product / Design / Technical Reconciliation
→ Delivery Readiness
→ Validation
→ Implementation
→ Convergence
→ Release
→ Product Knowledge Update
```

These later stages describe the intended lifecycle direction, not currently implemented Harness workflow contracts.

## Using the Harness

### Human resources

Optional human-facing guides and fallback resources live under `resources/`:

- PM quick start: [`resources/pm-quick-start.md`](resources/pm-quick-start.md)
- Product Designer quick start: [`resources/product-designer-quick-start.md`](resources/product-designer-quick-start.md)
- Runtime Guards, Evals, and Proofs guide: [`resources/runtime-evals-guide.md`](resources/runtime-evals-guide.md)
- Standalone PRD Kit: [`resources/standalone-prd/`](resources/standalone-prd/README.md)

These files are **not part of Harness execution**. Agents do not need to load them when running the Harness unless explicitly relevant.

The Standalone PRD Kit is a fallback for structured PRD drafting when the full Harness is not being used or sufficient Product Knowledge/current-product context is unavailable. It is not an equivalent replacement for the Harness.

The Harness rules themselves remain in `AGENTS.md`, the shared contract, workflows, and artifact contracts.


### Repo-aware agents

Give the agent access to this repository and identify it as the Harness source. The agent should begin from `AGENTS.md`, which routes the task to the relevant shared contract, workflow, and artifact contract.

Do not restate Harness rules in the task prompt unless the execution environment cannot access the repository. This keeps task prompts small and makes repository behavior the source of truth.

### Environments without repository access

Provide `AGENTS.md` and the specific files it routes to for the task. Avoid loading every workflow by default.

### External product context

Provide access to or the location of relevant external sources such as Product Knowledge, current working artifacts, evidence, or authoritative implementation context. The Harness defines how those sources should be treated; it does not require a specific storage or retrieval tool.

A minimal task handoff can look like:

```text
Harness:
<repository or provided Harness files>

Product Knowledge:
<context source, when relevant>

PM Intent:
<requested product change>

Execute the task according to the Harness.
```

When continuing existing work, provide or make retrievable the current durable artifact rather than relying on prior chat history.

## Runtime and validation infrastructure

The repository also contains optional infrastructure created while hardening the PRD workflow.

### PRD runtime guards

`runtime/prd/` contains high-assurance guard logic used to validate important semantic boundaries such as authority, clarification materiality, clarification atomicity, and Problem Alignment coverage.

These guards strengthen execution of the PRD workflow; they do not replace or redefine the Harness contracts.

### Provider adapters

`runtime/adapters/` contains provider-specific integration code. The current implemented adapter is for Codex.

The existence of a Codex adapter does not make the core Harness Codex-specific. Equivalent adapters may be added for other execution environments if a demonstrated need justifies them.

### Evals and proofs

`evals/` contains regression cases and execution tooling used to protect observed Harness invariants.

`proofs/` contains focused proof/validation harnesses used to verify runtime behavior and lifecycle properties during hardening.

These directories are validation infrastructure, not additional sources of Product or Design authority.

## Repository structure

```text
.
├── AGENTS.md
├── README.md
├── shared-harness-contract.md
├── workflows/
│   ├── prd-draft-clarification.md
│   ├── design-exploration.md
│   ├── design-review-prd-stress-test.md
│   └── harness-improvement.md
├── artifacts/
│   ├── prd.md
│   └── design.md
├── resources/
│   ├── pm-quick-start.md
│   ├── product-designer-quick-start.md
│   └── standalone-prd/
│       ├── README.md
│       ├── SKILL.md
│       ├── authoring-guide.md
│       └── prd-template.md
├── runtime/
│   ├── prd/
│   └── adapters/
│       └── codex/
├── evals/
│   ├── README.md
│   ├── cases/
│   └── orchestrator/
└── proofs/
    └── guarded-prd-real-world/
```

The structure follows one rule:

> README navigates. Shared contract governs. Workflow files describe execution. Artifact files define durable outputs. Resources support humans and standalone fallback use without defining Harness behavior. Runtime guards validate execution. Evals and proofs protect behavior without redefining it.

## Scope boundaries

This repository does not define:

- a single central orchestration runtime for the entire product-development lifecycle,
- a generic multi-agent architecture,
- a Product Knowledge taxonomy,
- a Figma document structure,
- or an issue-tracker workflow.

The current runtime is intentionally narrower: it supports high-assurance execution and validation of the PRD path and currently includes a Codex-specific adapter.

Broader runtime, provider, Engineering, QA, or workflow infrastructure should be added only when real usage demonstrates the need.
