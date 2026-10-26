# AGENTS.md

This repository is the tool-agnostic Product Development Harness for AI-native, human-governed product development at Job Vision.

For product-development tasks, start here.

## Canonical Harness source

The canonical Harness source for the current pilot is the GitHub repository `https://github.com/hosseinmor/product-development-harness`. GitLab migration is paused until the internal access issues are resolved; do not use the GitLab copy as the current Harness source.

## Gate 0 — Harness access (mandatory, fail-closed)

**Before Product Scope confirmation, Product Knowledge retrieval, drafting, design work, or any other Harness workflow execution**, actually read the **complete content** of the Harness files from canonical GitHub **`main` by default**. For an explicitly requested PR/preview test, the user may instead pin a GitHub branch or commit: read **all** required files from that same pinned ref and clearly identify the run as a preview, not as canonical merged `main`. Required files:

1. `AGENTS.md` (this entry point);
2. `shared-harness-contract.md`;
3. the workflow selected by the Task Routing table below;
4. each artifact contract required by that workflow;
5. `context-sources.yml` before any external context retrieval.

For **PRD creation**, that means `AGENTS.md`, `shared-harness-contract.md`, `workflows/prd-draft-clarification.md`, `artifacts/prd.md`, and `context-sources.yml`. For other workflows, follow the corresponding row of the routing table; do not load unrelated workflows.

Any read-only method is valid (GitHub connector, browser/raw-file retrieval, or `git clone`/a verified up-to-date checkout). A clone is a transport, **not** a separate authority. If using an existing clone, verify its canonical remote and refresh/validate it against the **selected GitHub ref** (`main` or an explicitly pinned test ref) before reading; do not silently use a stale/offline checkout. Where supported, read all required files from one consistent Git commit and retain its SHA for evaluation. Do not install dependencies or execute repository code merely to read the Harness.

**PASS requires the actual, complete, readable contents of every required file.** A repository listing, README, file name, search snippet, remembered content, broken/partial page, or successful clone command alone is **not** a pass. If a retrieval method fails, another supported method may be attempted.

**FAIL:** If any required file still cannot be read reliably, stop. Report the exact unreadable path(s) and the access issue, request that GitHub/repository access be enabled, and do **not** infer missing rules, ask Product confirmation, retrieve Product Knowledge, create a PRD/Design artifact, or automatically switch to the Standalone PRD Kit. Providing pasted files is not an automatic fallback for the normal GitHub-backed Harness workflow. Never claim Gate 0 passed without evidence of the reads. Recheck this gate for each new task execution; avoid unnecessary rereads within the same task. The URL used to start the task does not by itself establish access.

The words **"Job Vision" in the Harness name designate the organization, not the target product**. Selecting the target product is a separate, mandatory confirmation step after Gate 0.

## How to use the Harness

Use the Task Routing table to select the workflow and required artifact contract after reading this entry point. Gate 0 above determines which files must be fully read before execution. Keep retrieval task-scoped; do not load every workflow by default.

## Task routing

| Task | Workflow | Artifact contract |
| --- | --- | --- |
| PRD Draft + Clarification | `workflows/prd-draft-clarification.md` | `artifacts/prd.md` |
| Design Exploration | `workflows/design-exploration.md` | `artifacts/design.md` |
| Design Review + PRD Stress Test | `workflows/design-review-prd-stress-test.md` | `artifacts/prd.md` and `artifacts/design.md` |
| Harness Improvement | `workflows/harness-improvement.md` | — |

**Required GitLab Wiki PRD handoff:** In the JobVision/Cando PRD pilot, assume publication in the corresponding product GitLab Wiki unless the PM explicitly selects another durable store. For any PRD intended for manual publication to a product Wiki, identify the owning area in live canonical Product Knowledge first; use [`resources/prd-knowledge-areas.yml`](resources/prd-knowledge-areas.yml) only as a dated navigation snapshot to help find the relevant area or spot changes. For a NEW Wiki PRD, use that canonical area's **exact path** (including casing) directly as the Wiki parent; never consult or invent a separate Knowledge-to-Wiki mapping. This new-page naming convention does not prove the page/folder exists in Wiki, and existing published Wiki paths must be preserved unless a move is approved. The Agent must derive a stable timestamp-based ID and complete `wiki_path` according to `artifacts/prd.md`, and **explicitly provide only the full `GitLab Wiki Path` outside the copyable PRD Markdown**. When the ID or placement cannot be grounded, show `GitLab Wiki Path: unresolved` and the needed operational input; do not omit or fabricate the page path. PRD `references` frontmatter must use only an authoritative source key and the exact source-native page name/slug (for example `page: entity-candidate` when that page exists): no URLs, Markdown links, browsable URL paths, or invented breadcrumb labels.

## Context

Read [`context-sources.yml`](context-sources.yml) as the small **source locator**
before external context retrieval. It identifies product-scoped authorities and
the current Design Language, Content, evidence, and artifact entry points.
It does not replace source-owned guidance, Figma/Code or the current PRD/Design
Artifact. See [federated retrieval](docs/context-source-integration.md).
Retrieve only external context materially relevant to the task.

### Gate 1 — Product Scope confirmation (mandatory after Gate 0)

Before **any product-specific retrieval or substantive PRD/Design work**, propose the target product from the **user's actual task intent**, the current durable artifact if provided, and available authoritative scope context. Ask the human to **confirm or correct** that proposal in one short turn, **on every new task**, even when JobVision or Cando was explicitly named in the initial request or current artifact. Explicit naming is evidence for the proposal, **not a waiver** of this gate.

- Never use the organization name `Job Vision Product Development Harness`, the Harness repository name, or generic terms such as `job`, `candidate`, `reject`, or `notification` as evidence that the target product is JobVision.
- If a single product is well-supported, say for example: `این درخواست را مربوط به **Cando** تشخیص دادم. تأیید می‌کنی؟` Then **stop and await an explicit answer**; do not preemptively retrieve its Knowledge.
- If both products are affected, propose **Cross-product (JobVision + Cando)** and, when reasonably identifiable, the primary owner. Ask for confirmation of that scope.
- If the source material is genuinely ambiguous, say so and ask which product(s) own the task; do **not** fabricate a confident proposal merely to appear decisive.
- A correction supersedes the proposal: discard any unverified source/ownership assumptions, select the corrected canonical source, and confirm the corrected scope from the human's explicit reply without another redundant confirmation loop.
- After confirmation, do not reconfirm during the **same task** unless new information materially contradicts the confirmed scope. A new unrelated task requires a new Gate 1 confirmation.
- Product Scope confirmation is an **operational routing decision**, not a Product Decision clarification, and must not be recorded in the PRD Clarification Record. It precedes the draft-first workflow.

Only after Gate 1 passes, route to the confirmed product's canonical Knowledge. For cross-product work, partition materially relevant claims by each owning source.

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

**Actionable missing-tab behavior:** When this environment can read user-shared/local tabs, the owning canonical source is materially needed, and no relevant readable tab is open, **explicitly ask the user to open one tab with that product's exact canonical URL** (`https://docs-jv.jvoffice.ir/` or `https://docs-cd.jvoffice.ir/`). Do not stop at merely reporting that the tab is missing or that Product Knowledge is unavailable. Once the tab is available, retry task-scoped retrieval. If the environment cannot read user tabs at all, or access is blocked for a separate browser/VPN/authentication/policy reason, state that actual limitation; opening a tab alone must not be presented as sufficient. This is an operational access request, not Product clarification.

**Actionable follow-up page requests:** After reading an available canonical page, if a *different* canonical page is materially needed and is not already readable, first navigate/retrieve it directly when the environment actually supports that. If the environment can only read user-opened/shared tabs, **ask the user to open the specific needed page** in the supported browser instead of merely reporting missing context or stopping retrieval. Give its verified URL when known; otherwise give its exact known page title and navigation path within the owning canonical source. Do not invent deep links. Once the new page is readable, continue retrieval. Ask for pages incrementally, only as the current task requires them; do not request several pages pre-emptively. This is also an operational access request, not Product clarification.

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

During the current pilot, for a PRD prepared for durable handoff, append the non-authoritative `Harness Pilot Evaluation` record after the PRD as specified in `artifacts/prd.md`; keep it visually separated/collapsed where supported. It is evaluation metadata, not Product decision content. Normal downstream work must not promote that record to Product truth. Decisions established through clarification must be reconciled into the PRD itself.

During normal product work, do not add files, schemas, routers, agent layers, or other Harness abstractions unless the task is explicitly to evolve the Harness and a demonstrated need justifies the change.
