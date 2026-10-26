# AGENTS.md

This repository is the tool-agnostic Product Development Harness for AI-native, human-governed product development at Job Vision.

For product-development tasks, start here.

## Canonical Harness source

The canonical Harness source for the current pilot is the GitHub repository `https://github.com/hosseinmor/product-development-harness`. GitLab migration is paused until the internal access issues are resolved; do not use the GitLab copy as the current Harness source.

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

**Required GitLab Wiki PRD handoff:** In the JobVision/Cando PRD pilot, assume publication in the corresponding product GitLab Wiki unless the PM explicitly selects another durable store. For any PRD intended for manual publication to a product Wiki, first identify the owning canonical Product Knowledge area, then look up its exact area-to-parent mapping in [`resources/prd-wiki-placement-map.yml`](resources/prd-wiki-placement-map.yml); its `knowledge_areas` lists the 2026-10-26 canonical Knowledge area snapshot, while its `verified_areas` separately lists only independently checked Wiki parents. This inventory is a snapshot, not an authority over live Product Knowledge; do not equate the presence of a Knowledge area with a confirmed Wiki path. The Agent must derive a stable timestamp-based ID and complete `wiki_path` according to `artifacts/prd.md`, and **explicitly provide GitLab Wiki Title and full GitLab Wiki Path outside the copyable PRD Markdown**. When the ID or placement cannot be grounded, show `unresolved` and the needed operational input; do not omit these fields or fabricate the page path.

## Context

Read [`context-sources.yml`](context-sources.yml) as the small **source locator**
before external context retrieval. It identifies product-scoped authorities and
the current Design Language, Content, evidence, and artifact entry points.
It does not replace source-owned guidance, Figma/Code or the current PRD/Design
Artifact. See [federated retrieval](docs/context-source-integration.md).
Retrieve only external context materially relevant to the task.

### Product scope resolution gate

Resolve the owning product **before canonical Product Knowledge retrieval or substantive PRD drafting**.

Use, in order, the strongest available basis that actually establishes product ownership: explicit task wording, the current durable artifact, authoritative routing/context already available in the task, or an established product-scoped source. Do not guess product ownership from generic vocabulary such as `job`, `candidate`, `reject`, `notification`, or another concept that may exist across products.

- If exactly one product is established, route to that product's canonical Product Knowledge.
- If the task is cross-product or an integration, partition material claims by owning product before retrieval.
- If product ownership cannot be established confidently enough to choose the canonical source, **stop product-specific retrieval and substantive drafting and ask one minimal operational clarification**, for example: `این تغییر مربوط به JobVision است یا Cando؟`
- This product-scope clarification is a source-routing prerequisite, not a Product Decision clarification. It may happen before the normal draft-first clarification flow because guessing here can route the entire task to the wrong authority.
- Once product scope is resolved, do not ask the human to restate it unless new information makes the scope materially ambiguous again.

Product Knowledge authority is product-scoped; a canonical source for one product must not be promoted into canonical truth for another product merely because the products integrate.

Current source routing:

- **JobVision** — canonical Product Knowledge is `https://docs-jv.jvoffice.ir/`.
- **Cando** — canonical Product Knowledge is `https://docs-cd.jvoffice.ir/`.
- **Cross-product / integration tasks** — partition claims by product. Each canonical Product Knowledge source establishes current behavior only inside its own product scope plus integration-boundary facts it explicitly documents; do not use one product's source as canonical authority for the other product's internal behavior.

Current verified pilot access path for JobVision Product Knowledge in ChatGPT Desktop / Work is **local Chrome on the same company-VPN-connected machine, controlled through Computer Use + the Chrome extension**. ChatGPT Built-in Browser, Cloud Browser, and ordinary Web Search are not supported substitutes for this internal source. In another execution environment, use an equivalent local-browser path only after access to the internal source has been verified. If the verified local-browser path is unavailable, report the access limitation rather than silently switching to another source.

For Cando, retrieve canonical Product Knowledge from `https://docs-cd.jvoffice.ir/`. Use an execution path only after access to that internal source has been verified in the current environment. If it is inaccessible, report the limitation rather than substituting JobVision Product Knowledge or another evidence source as canonical Cando truth.

When the current environment can read user-shared or local browser tabs, use that capability as a low-overhead internal-source access path:
1. Reuse an already-open relevant canonical Product Knowledge tab when available.
2. If the owning canonical source is needed but no readable relevant tab is available, ask the user to open **one** tab for that source rather than requesting multiple sources up front.
3. Retrieve the smallest relevant page/section first.
4. Ask the user to open another tab or source only when the current source cannot resolve a materially necessary question.
5. Do not ask for pre-emptive browser setup that is not needed for the current task.

These are retrieval-efficiency rules, not authority changes; a readable tab is still only an access path to the owning canonical source.

When canonical Product Knowledge for either product is insufficient, inconsistent, or inaccessible, use explicit owner input, approved decisions, relevant reviewed evidence, direct observation, or implementation evidence when useful. Keep each source in its actual authority class; these inputs may support reconstruction and decision-making but do not silently become canonical Product Knowledge. If materially necessary behavior remains unsupported after reasonable retrieval, keep it Unknown or Unresolved and apply the Harness clarification rules.

The current shared reusable design and content guidance lives in
`https://github.com/hosseinmor/design-language`. Design Language and the
Content foundation are distinct source roles but currently share that repository;
Content starts at `foundations/content/README.md`. This repository is not a
fallback store for JobVision or Cando product behavior.

Use these source roles when available:

- **Canonical Product Knowledge** — primary source for established product meaning and behavior only within the product scope for which that source is approved.
- **Product Walkthrough** — preferred reviewed evidence source for reconstructing end-to-end journeys, current flows, and feature walkthroughs when sequence or experience context is material. Walkthrough evidence is not canonical Product Knowledge and must not override it.
- **JV Design Language / Karbon** — reusable foundations, tokens, components,
  interaction patterns, accessibility, governance, integration and approved
  product-expression rules. Retrieve from
  `https://github.com/hosseinmor/design-language`, starting with its
  `AGENTS.md` / AI router and then the smallest owning document.
- **Product Content System** — terminology, voice/tone, localization, content
  patterns, component copy and source-owned evals. It is currently the Content
  foundation inside the same Design Language repository, starting at
  `foundations/content/README.md`. Neither source role defines current
  JobVision or Cando product behavior.
- **Implementation evidence** — inspect relevant implementation when it helps investigate a gap or discrepancy. Treat it as evidence for Product Knowledge reconciliation or Technical Planning, not as a silent replacement for canonical Product Knowledge. Do not assume a specific code host or repository provider unless the environment establishes one.
- **Other evidence and current working artifacts** — use when materially relevant to the task.

For current-product claims, canonical Product Knowledge for the owning product outranks reviewed evidence, observed UI/design, implementation evidence, hypotheses, and recommendations. Evidence may expose that canonical documentation needs reconciliation, but it does not silently become the new canonical product truth. A canonical source for one product must never be used as canonical authority for another product.

Product Knowledge and evidence sources do not substitute for human authority over intended Product decisions. If sources materially conflict, surface the conflict rather than silently choosing or inventing a resolution.

Use context that is already available instead of asking humans to restate it. Retrieve selectively; do not load an entire knowledge source when a smaller relevant slice is sufficient.

When continuing existing product work, retrieve the current durable artifacts before relying on conversation history or tool-local state. Conversation history may provide useful context, but it must not substitute for the current artifact state.

If required external context is unavailable, keep the limitation explicit and do not invent missing facts, rules, components, or guidance. For either JobVision or Cando, do not silently substitute another repository, historical documentation, the other product's canonical source, or evidence as canonical Product Knowledge when the owning product's internal source is inaccessible.

## Operating constraints

Follow `shared-harness-contract.md` for authority, uncertainty, clarification, propagation, and readiness rules.

Do not invent unresolved product or design decisions.

Do not treat AI proposals or assumptions as authoritative facts.

Do not create parallel PRD versions such as `v1`, `v2`, or `final` artifacts unless a demonstrated workflow need explicitly requires them. Maintain one explicitly designated current durable PRD artifact per Product Change. During the current pilot, PRD persistence is manual and the Harness does not assume a GitLab Wiki or any other specific hosting service.

During the current pilot, append a collapsed `Harness Pilot Evaluation` record after the PRD in the same durable artifact when the chosen storage format supports it; otherwise keep the record immediately adjacent to the persisted PRD under an explicit non-authoritative heading. This record is evaluation metadata and is not part of the PRD's Product decision domain. Normal Product, Design, Engineering, and Validation work must not treat original PM intent, clarification history, evaluation assumptions, derivations, or Harness Owner findings in that block as Product truth. Product decisions established through clarification must be reconciled into the PRD itself. Use the evaluation block only when the task explicitly involves Harness evaluation or pilot review.

During normal product work, do not add files, schemas, routers, agent layers, or other Harness abstractions unless the task is explicitly to evolve the Harness and a demonstrated need justifies the change.
