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

**GitLab Wiki is a publishing destination, not a Product Knowledge retrieval source.** For a **new PRD**, establish its primary owning area from the confirmed product's canonical Product Knowledge, optionally navigating via [`resources/prd-knowledge-areas.yml`](resources/prd-knowledge-areas.yml). Use the complete parent path for that area from `resources/prd-knowledge-areas.yml` as the Wiki parent, including hierarchy and casing (for example JobVision `_common/application` or Cando `ats/job`). A flat documentation page URL such as `/contents/application/` is not the Wiki parent. This is the PM's chosen naming convention; do not check the Wiki for a different parent or require a separate Wiki mapping. **Do not browse/search historical PRDs, request GitLab access, or inspect GitLab Wiki pages/sidebar/API** to infer current Product behavior, precedent, numbering, or publication parent during ordinary new-PRD drafting. If the owning Knowledge area cannot be established, set `wiki_path: unresolved` until it can be resolved from Knowledge or PM input, without delaying semantic Problem Alignment. The PM will correct any divergence between Knowledge and Wiki paths outside the drafting run. Preserve paths of previously published PRDs when editing an explicitly supplied PRD. Generate stable ID and complete `wiki_path` per `artifacts/prd.md`; present only the separate `GitLab Wiki Path` handoff value, never a `GitLab Wiki Title`. References use verified Product Knowledge source keys and exact source-native page names, not URLs or invented breadcrumbs.

## Context

Read [`context-sources.yml`](context-sources.yml) as the small **source locator**
before external context retrieval. It identifies product-scoped authorities and
the current Design Language, Content, evidence, and artifact entry points.
It does not replace source-owned guidance, Figma/Code or the current PRD/Design
Artifact. See [federated retrieval](docs/context-source-integration.md).
Retrieve only external context materially relevant to the task.

### Gate 1 — Product Scope confirmation (mandatory for product-scoped tasks after Gate 0)

**Apply Gate 1 to tasks that create, continue, review, or change product-scoped PRD/Design work**: PRD Draft + Clarification, Design Exploration, and Design Review + PRD Stress Test. For each new such task, **propose** the target product from the user's intent, the current durable artifact if provided, and already-available authoritative scope context; **ask the human to confirm or correct** the proposal in one short turn, even when the product is explicitly named. A new task requires a new confirmation, but not each conversational turn.

**Harness Improvement** that only audits or edits generic Harness rules, evals, or infrastructure has **no owning product**: Gate 0 is mandatory, but skip Gate 1 instead of fabricating a JobVision/Cando selection. A task that separately starts work on a specific product PRD/Design artifact must pass Gate 1 before that product work.

**Scope-intake exception:** After Gate 0, the Agent may read the **specific user-supplied current PRD or Design Artifact** solely to understand its identity and propose the Product Scope. This is not approval to use its product behavior as canonical Knowledge. No product-specific canonical Knowledge, walkthrough, implementation, or design-system source retrieval, and no substantive drafting, may begin until human confirmation. Explicit naming is evidence for the proposal, **not a waiver** of Gate 1.

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

When continuing **an explicitly identified existing PRD or Design Artifact**, retrieve that current artifact when accessible before relying on conversation history. This is not permission to search unrelated historical PRDs or treat prior PRD decisions as canonical Product Knowledge for a new change. Conversation history is not a substitute for the specific current artifact.

If required external context is unavailable, keep the limitation explicit and do not invent missing facts, rules, components, or guidance. For either JobVision or Cando, do not silently substitute another repository, historical documentation, the other product's canonical source, or evidence as canonical Product Knowledge when the owning product's internal source is inaccessible.

## Operating constraints

Follow `shared-harness-contract.md` for authority, uncertainty, clarification, propagation, and readiness rules.

Do not invent unresolved product or design decisions.

Do not treat AI proposals or assumptions as authoritative facts.

Do not create parallel PRD versions such as `v1`, `v2`, or `final` artifacts unless a demonstrated workflow need explicitly requires them. For PRD Draft + Clarification, **create and keep one current editable/openable Markdown working file** in the execution environment from the first useful draft, and update **that same file after each material clarification decision**, through final handoff, when the environment supports file creation/editing. Offer a native in-environment preview/open action where available; otherwise link the actual file if supported. At final handoff, give both a verified file link and the complete identical raw Markdown in a single code block; explicitly tell the PM to click the link to view the PRD and use the code block to copy its source. Never claim a file, preview or copy control exists when unsupported. This is **one working copy**, not a competing canonical PRD or permission to publish to GitLab; keep one explicitly designated current durable PRD per Product Change. If the environment cannot create/retain a file, disclose the limitation and provide complete copyable Markdown as a fallback. See `workflows/prd-draft-clarification.md` and `artifacts/prd.md`.

During the current pilot, the **same working `.md` file** must include the non-authoritative, collapsed `Harness Pilot Evaluation` record **after the main PRD** from the first useful draft onward, and update its `Clarification Record` as Product clarifications are answered. Do not print or maintain that record as a separate chat transcript, file or artifact. The chat should show the current clarification question and a brief change summary, not duplicate the evaluation record. Normal downstream work must not promote evaluation metadata to Product truth; resolved decisions are reconciled into the authoritative PRD sections.

During normal product work, do not add files, schemas, routers, agent layers, or other Harness abstractions unless the task is explicitly to evolve the Harness and a demonstrated need justifies the change.
