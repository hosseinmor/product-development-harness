# AGENTS.md

This repository is the tool-agnostic Product Development Harness for AI-native, human-governed product development at Job Vision.

For product-development tasks, start here.

## Canonical Harness source

The canonical Harness source is the private/internal GitLab project `product/prd/agent-harness`. The public GitHub repository is a reference/mirror and is not authoritative for day-to-day execution.

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

Retrieve only external context materially relevant to the task.

### Product scope gate

Before retrieving or attributing Product Knowledge, determine which product owns each material current-product claim. Product Knowledge authority is product-scoped; a canonical source for one product must not be promoted into canonical truth for another product merely because the products integrate.

Current source routing:

- **JobVision** — canonical Product Knowledge is `https://docs-jv.jvoffice.ir/`, accessed through a local browser on a machine connected to the company VPN.
- **Cando** — no canonical Product Knowledge source currently exists. Preserve unsupported Cando current behavior as unknown rather than using another source as a substitute.
- **Cross-product / integration tasks** — partition claims by product. JobVision Product Knowledge may establish JobVision-side behavior and documented integration-boundary facts, but it does not establish Cando-internal behavior, permissions, lifecycle, configuration, UI semantics, or persistence unless a future approved Cando source does so.

For Cando current-product investigation, use explicit owner input, approved decisions, relevant reviewed evidence, direct observation, or implementation evidence when available. Keep each source in its actual authority class: these inputs may support reconstruction and decision-making but do not silently become canonical Cando Product Knowledge. If materially necessary behavior remains unsupported after reasonable retrieval, keep it Unknown or Unresolved and apply the Harness clarification rules.

The repository currently named `product-knowledge` owns Product Content, Design System, product standards, and source-authority guidance for JobVision and Cando. It is not a fallback store for product behavior. Its source-authority guidance may be used to confirm the current product-to-knowledge-source mapping.

Use these source roles when available:

- **Canonical Product Knowledge** — primary source for established product meaning and behavior only within the product scope for which that source is approved.
- **Product Walkthrough** — preferred reviewed evidence source for reconstructing end-to-end journeys, current flows, and feature walkthroughs when sequence or experience context is material. Walkthrough evidence is not canonical Product Knowledge and must not override it.
- **Product Content / Design Knowledge repository** — use the repository currently named `product-knowledge` for its owned Product Content System, Design System, product standards, and source-authority guidance. Do not use it as a fallback store for JobVision or Cando product behavior.
- **Implementation evidence** — inspect relevant implementation when it helps investigate a gap or discrepancy. Treat it as evidence for Product Knowledge reconciliation or Technical Planning, not as a silent replacement for canonical Product Knowledge. Do not assume a specific code host or repository provider unless the environment establishes one.
- **Other evidence and current working artifacts** — use when materially relevant to the task.

For JobVision current-product claims, canonical Product Knowledge outranks reviewed evidence, observed UI/design, implementation evidence, hypotheses, and recommendations. Evidence may expose that canonical documentation needs reconciliation, but it does not silently become the new canonical product truth.

For Cando current-product claims, no source currently has canonical Product Knowledge status. Evidence and explicit owner input must remain correctly attributed, and absence of a canonical source must remain visible when material.

Product Knowledge and evidence sources do not substitute for human authority over intended Product decisions. If sources materially conflict, surface the conflict rather than silently choosing or inventing a resolution.

Use context that is already available instead of asking humans to restate it. Retrieve selectively; do not load an entire knowledge source when a smaller relevant slice is sufficient.

When continuing existing product work, retrieve the current durable artifacts before relying on conversation history or tool-local state. Conversation history may provide useful context, but it must not substitute for the current artifact state.

If required external context is unavailable, keep the limitation explicit and do not invent missing facts, rules, components, or guidance. For JobVision, do not silently substitute another repository or historical documentation as canonical Product Knowledge when the internal source is inaccessible. For Cando, do not invent a canonical source or treat JobVision Product Knowledge as a Cando fallback.

## Operating constraints

Follow `shared-harness-contract.md` for authority, uncertainty, clarification, propagation, and readiness rules.

Do not invent unresolved product or design decisions.

Do not treat AI proposals or assumptions as authoritative facts.

Do not create parallel PRD versions such as `v1`, `v2`, or `final` pages unless a demonstrated workflow need explicitly requires them. The current PRD is the canonical Wiki page in `product/prd/agent-harness`; GitLab Wiki history preserves prior revisions.

During normal product work, do not add files, schemas, routers, agent layers, or other Harness abstractions unless the task is explicitly to evolve the Harness and a demonstrated need justifies the change.
