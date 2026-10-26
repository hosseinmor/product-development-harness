# PRD Artifact Contract

## Purpose

The PRD is the durable artifact for the intended product change.

It exists to make product intent and required behavior sufficiently explicit that downstream Design and later Engineering work do not need to invent material product decisions.

The PRD should constrain interpretation without becoming a Design specification or implementation plan.

## Authority

The PRD owns decided product claims within its scope, including intended outcomes, material product scenarios, required product behavior, and acceptance criteria.

AI may draft and maintain the PRD, but AI-generated, assumed, or unresolved content does not become authoritative merely because it appears in the document.

A clear PM decision establishes product intent. The PRD makes that decision durable downstream.

Current-product descriptions and Product Knowledge references in the PRD are contextual views of external product truth. They do not become independently authoritative over canonical Product Knowledge. Reviewed walkthrough evidence, direct observation, and implementation evidence may ground or challenge those descriptions but do not silently become competing canonical Product Knowledge.

## Metadata

A PRD uses lightweight YAML frontmatter for stable machine navigation and cross-artifact reference.

The default metadata responsibilities are:

```yaml
---
id: unresolved
artifact: prd
owner: <responsible-product-owner-or-team>
# Required when publishing to GitLab Wiki; omit otherwise:
# wiki_path: <verified-case-sensitive-wiki-parent>/<PRD-ID>-<english-kebab-case-slug>
references:
  - source: <jobvision_product_knowledge-or-cando_product_knowledge>
    page: <source-native-page-slug>
related_artifacts:
  - <related-artifact-reference>
---
```

Metadata rules:

- `id` provides stable identity for the PRD.
- A new draft may start with `id: unresolved` until an accurate timestamp can be obtained. For the first stable ID, use `JV-PRD-YYMMDDHHmm` (JobVision) or `CND-PRD-YYMMDDHHmm` (Cando); no registry or sequential numbering is needed. In this notation `YY` means the last two digits of the **Jalali/Solar Hijri year** (for example 1406 → `06`), `MMDD` is the Jalali month/day, and `HHmm` is the current 24-hour clock time in `Asia/Tehran`. Use ten ASCII digits and zero-pad each part; no separators, seconds, or Western/Gregorian calendar date.
- An AI may produce the ID itself when it has an accurate time source and can reliably obtain/convert the Iran-local Jalali date. Do not invent current minute or calendar conversion. If it cannot be established, ask for the actual current Iran-local Jalali date/time (e.g. from the PM) or retain `id: unresolved` until supplied. A person may generate the identical ID manually from the Iranian calendar and clock. Do not read existing PRDs to calculate a next ID.
- A first valid assignment replacing `id: unresolved` is registration, not identity migration. Timestamp-based IDs are not guaranteed globally unique; if a collision is actually encountered at publication, resolve it before publishing rather than overwriting an existing PRD.
- Once an official ID has been assigned, preserve it across redrafting, clarification, reconciliation, title changes, storage moves, and downstream work. Change it only through an explicit identity migration that preserves affected references.
- Existing stable PRD IDs created before this registration scheme are grandfathered. Do not rewrite them only to match the new format; migrate them only through an explicit identity migration with the old-to-new relationship preserved.
- Assigning a stable ID is not a prerequisite for `Problem Aligned`; semantic Product readiness and artifact registration are separate concerns. Before publication or downstream handoff as a current durable PRD, resolve `id: unresolved`.
- `artifact: prd` identifies the artifact type.
- For JobVision and Cando PRDs in the current pilot, **default to GitLab Wiki publication** unless the PM explicitly specifies another durable target. For such PRDs, include exactly one `wiki_path` in the **single** YAML frontmatter block. It holds the **entire proposed or established GitLab Wiki page Path**, without leading `/`, base domain, `.md`, or spaces; it is not merely a parent directory. Format for a **new** Wiki PRD: `<case-verified-GitLab-Wiki-parent>/<stable-PRD-ID>-<short-english-kebab-case-title>`. Example with a **hypothetical** ID and a confirmed existing Cando parent: `ATS/job/CND-PRD-0604081437-auto-reject-by-location`.
- Identify the **owning area in live canonical Product Knowledge**, prioritizing the area responsible for the changed behavior. [`../resources/prd-knowledge-areas.yml`](../resources/prd-knowledge-areas.yml) remains a dated **Knowledge-only** index, not a source of Wiki spelling or product ownership. For a **new** Wiki PRD, check the **actual destination GitLab Wiki** for the corresponding existing parent; copy the **exact case of every segment** without normalization. For example, `ats/job` in Cando Knowledge must yield `ATS/job` in Wiki **if that exact Wiki branch exists**. Do not create lowercase `ats` beside existing uppercase `ATS`. A matching path may require different case from Knowledge; a *conceptually similar but differently organized* path is not automatically an equivalent parent. Do not revive a permanent `verified_areas`/mapping file. Other affected areas belong in `references`, not duplicate PRDs. `entity`, `flow`, `rule`, and `capability` documents are not automatically directories. When no existing equivalent Wiki parent is verified, ask for the exact destination path or PM approval to create a genuinely new hierarchy and use `wiki_path: unresolved` until that is established. This is a **publishing metadata issue**, not a Product Decision and not by itself a blocker for `Problem Aligned`.
- Propose the English slug using canonical product terminology, lowercase `a-z` and digits separated by single hyphens; keep it concise and descriptive. Do not use spaces, a translated Persian title, a PRD version, a timestamp repeated outside the ID, or `.md`. The human-readable GitLab page title can be taken directly from the PRD's Persian heading; the AI does **not** need to output a separate Wiki Title field. When entering the Wiki page, turn off **Generate page path from title** and paste the complete Path.
- A proposed `wiki_path` reuses the exact verified GitLab Wiki parent (including case), while Product Knowledge remains the authority for **which product area owns the behavior**. Do not silently create or propose a new differently cased branch. If a truly new Wiki hierarchy is required, first obtain explicit PM approval. Preserve the established Wiki page Path and leaf when updating an existing PRD; do not silently regenerate its slug because the title changed. When publication moves between primary areas, keep the stable `id` and request approval before moving an already published page.
- **Mandatory Wiki handoff:** For every Wiki-bound PRD output, present only `GitLab Wiki Path` as an explicit copy-ready value *outside the PRD's Markdown payload*, equal to frontmatter `wiki_path`. Do not output `GitLab Wiki Title` as an extra field; the document heading supplies the human-readable title. If the Path cannot be grounded, show `GitLab Wiki Path: unresolved` plus the minimum action needed.
- `owner` identifies the responsible Product owner or team at the appropriate level. AI should retrieve ownership when reasonably possible and must not infer or fabricate an owner merely to populate metadata. If ownership cannot be established, use `owner: unresolved`.
- `references` is a concise machine-facing navigation list for materially relevant canonical Product Knowledge pages that ground the PRD or are useful for downstream retrieval and impact analysis.
- Each Product Knowledge reference uses `source` + `page`. `source` must be the owning Product Knowledge source key from `context-sources.yml` (for example `jobvision_product_knowledge` or `cando_product_knowledge`), not a URL.
- `page` is **only the exact source-native page name/slug** of an actually identified Knowledge page, written as a plain string. For example, when the source itself names the page `entity-candidate`, write `page: entity-candidate`. **Never write** `page: https://...`, `page: [entity-candidate](https://...)`, a URL/path fragment copied from the browser, or a constructed label such as `ATS / Candidate / Entity`. Do not convert a display title or category breadcrumb into an invented identifier, add `.md`, or invent a Harness-specific ID. If the page name cannot be established, omit that reference instead of replacing it with a URL.
- Source-location changes are resolved through `context-sources.yml`; they should not require rewriting PRDs merely because a base URL changes.
- Include only materially useful Product Knowledge pages; `references` is not a bibliography of everything retrieved while drafting.
- If the relevant canonical page cannot be identified reliably, omit the reference rather than guessing a page name. This does not by itself make the Product behavior unresolved when the behavior is otherwise established.
- Evidence, screenshots, observations, implementation findings, and temporary research do not need to be copied into `references`; preserve their provenance in the Harness Pilot Evaluation when materially used.
- When updating an existing PRD that contains legacy Product Knowledge URLs, Markdown links or human-readable breadcrumb strings in `references`, normalize them to `source + page` where `page` contains **only the verified source-native page name/slug**. If that name cannot be established, omit the specific reference; never preserve the URL or synthesize a slug from it. Remove non-navigation evidence from `references`.
- `related_artifacts` references related durable artifacts when they exist and the relationship is useful downstream.
- `references` and `related_artifacts` may be omitted when they have no useful entries.
- Metadata is machine-facing navigation data. It should not duplicate semantic PRD content. Write **one** YAML frontmatter block at the start of a PRD; never append a second `--- ... ---` block to add Wiki placement.
- In the current pilot, PRD storage can be manual. The Harness does not require GitLab Wiki for all use cases; when the PM chooses it, use the Wiki publication metadata and the store's history/recovery capability. Do not add a separate PRD version field merely to duplicate storage history.

Do not add generic status, version, timestamps, confidence scores, approval metadata, requirement numbering, Jira links, Figma links, or similar metadata without a demonstrated workflow need.

## Writing conventions

The PRD is a durable Product artifact, so its wording should make Product intent easy to understand without depending on the conversation that produced it.

- For Job Vision PRDs, write the **body prose in Persian by default** unless the responsible human requests another language. **Every Markdown section and subsection heading (`##`–`######`) in the produced PRD must be English.** Preserve the canonical English section headings listed below exactly (e.g. `## Current Behavior`, `## Required Product Behavior`, `## Assumptions & Open Decisions`); never replace them with Persian headings. Any additional scenario/rule/state subheading must also have a concise English label. The document's main `#` title may be Persian; content, field examples, and quotations may be Persian. Apply this to Working Drafts, final handoffs, and revisions. Do not treat product UI copy displayed as quoted evidence as structural document headings.
- Use canonical product terminology from Product Knowledge and other authoritative context. Do not create alternate names for the same concept merely for stylistic variety.
- Prefer natural Persian prose. Keep English terms when they are canonical Product, technical, artifact, or Harness terms, or when translation would reduce precision; otherwise avoid unnecessary Persian-English mixing.
- Use a direct, neutral, product-oriented tone. Do not write marketing copy, conversational dialogue with the PM, approval narration, or AI process/reasoning into the PRD.
- Let wording reflect authority correctly: state established Product behavior directly; label assumptions, hypotheses, and open decisions as such. Do not hedge established decisions or present uncertainty as decided fact.
- Prefer concise, scannable sentences, bullets, and tables when they improve comprehension. Do not optimize for brevity when it would remove a material distinction or decision boundary.
- Preserve exact named Harness states or established product labels when referring to them, such as `Problem Aligned`, rather than translating or paraphrasing them inconsistently.

## Semantic structure

A PRD should cover the following semantic responsibilities. The headings below are the default representation, not a requirement to render empty conditional sections.

```markdown
# <Change>

## Problem

## Affected Users

## Current Behavior

## Outcomes

### User Outcome

### Business Outcome

### Success Metrics

## Scope

## Key Product Scenarios

## Required Product Behavior

## Acceptance Criteria

## Assumptions & Open Decisions
```

`Success Metrics`, `Key Product Scenarios`, and `Assumptions & Open Decisions` are conditional and may be omitted when their semantic responsibility does not apply or has no material content.

### Problem

Describe the underlying problem or opportunity so a product-team reader can understand it without already knowing the proposed feature. When relevant, make clear the affected actor, context or stage, what the actor is trying to accomplish, the current unmet need, limitation, or friction, and why it matters.

Do not define the Problem only as the absence of a proposed feature, capability, data structure, or solution. When PM Intent is solution-shaped, use the intent and current-product context to construct the strongest supported problem framing; if a material part of that framing requires Product judgment, keep it unresolved and use targeted clarification rather than stating it as fact.

Keep detailed current-product baseline in `Current Behavior` rather than duplicating it in the Problem.

Evidence may support the problem when available, but the absence of evidence does not prevent an initial draft unless the decision fundamentally depends on it.

### Affected Users

Identify the actors materially affected by the intended change.

Keep this concise, usually as a short actor list. Do not turn it into persona documentation or repeat detailed needs, journeys, or behavior owned elsewhere in the PRD.

The purpose is to make affected actors easy to scan and make material actor omissions easier to detect.

### Current Behavior

Describe only the local current-product baseline needed to understand the intended change.

Keep it concise and task-scoped. Canonical Product Knowledge remains the primary documented source of current-product truth. Reviewed Product Walkthrough evidence, direct observation, and verified implementation evidence may support reconstruction or expose a discrepancy, but the PRD should not duplicate full flows, reconstruct those sources, or silently treat evidence as canonical Product Knowledge.

Describe relevant current user or product behavior rather than merely stating that the proposed feature does not exist.

Preservation rules introduced by the intended change belong primarily in `Required Product Behavior`, not in `Current Behavior`.

### Outcomes

Outcomes describe the improved state the change is intended to create without summarizing Scope, Required Product Behavior, the selected experience, or implementation.

Do not use Outcomes to repeat feature mechanics, constraints, states, rules, or acceptance criteria.

#### User Outcome

Describe what improves or becomes possible for the affected user or actor if the change succeeds.

User Outcome is a required semantic responsibility. Include only outcomes established by Product intent; do not invent benefits that have not been decided or supported.

Do not manufacture a User Outcome by rephrasing requested behavior, feature mechanics, requirements, or acceptance conditions as an outcome.

#### Business Outcome

Describe why the change matters to Job Vision, the business, or the product at the business level.

Business Outcome is a required semantic responsibility and must not silently substitute for User Outcome or be inferred from it without support.

Do not invent business value. An established Business Outcome is required before the PRD can become `Problem Aligned`. If a Business Outcome has not been established and there is enough basis in the intent, Problem, evidence, current-product context, known goals, or defensible Product reasoning, AI should proactively offer a small number of plausible non-authoritative candidates and briefly recommend one when justified. These proposals reduce Product's decision burden, but none becomes authoritative until the responsible Product human confirms or refines it. If there is genuinely insufficient basis for a meaningful proposal, make the limitation explicit and ask the smallest clarification needed to establish why the change matters rather than fabricating business value.

Keep an unresolved Business Outcome visible in the `Business Outcome` section; do not mechanically duplicate it into `Assumptions & Open Decisions`.

#### Success Metrics

Include a success metric or KPI only when it is meaningful and has been established as part of Product intent.

Do not invent metrics merely to fill the section.

Business Outcome and Success Metric are distinct: Business Outcome is the desired business effect; a Success Metric is an established way that effect or another intended outcome will be measured.

`Success Metrics` remain optional unless Product has established a metric or the task specifically requires one; the requirement to establish Business Outcome does not imply that a metric must also be defined before `Problem Aligned`.

### Scope

Define the material boundaries of the intended change.

Use Scope to answer what capabilities, actors, scenarios, or product areas are included or excluded from this change, not how the included behavior works in detail.

Include actors, scenarios, exclusions, unchanged behavior, non-goals, or out-of-scope items only when they materially prevent scope expansion or incompatible interpretation.

Do not use Scope to restate detailed product rules, lifecycle behavior, states, validation rules, or acceptance criteria that belong in Required Product Behavior or Acceptance Criteria.

Include a constraint such as a limit, supported type, or version boundary in Scope when it materially defines the shape of the release or prevents scope expansion. Put the detailed behavior of that constraint in Required Product Behavior.

Do not list implementation choices as feature Out of Scope merely because the PRD does not own them. Implementation boundaries are governed by the PRD's artifact boundary unless excluding a technical capability is itself part of Product intent.

`Out of Scope` and `Non-goals` are semantic concepts, not mandatory headings.

### Key Product Scenarios

Use Key Product Scenarios when the change has a material user journey, actor handoff, lifecycle sequence, or connected sequence of product behaviors whose context would otherwise be difficult to reconstruct from individual rules.

A Key Product Scenario should be the shortest sequence needed to give a downstream reader a coherent product-level mental model. Use it to assemble material behaviors into a journey, actor handoff, or lifecycle sequence, not as a second specification of Required Product Behavior.

Describe what materially happens in the product, in sequence. Keep scenarios solution-independent.

Detailed validation rules, eligibility conditions, exceptions, negative isolation rules, preservation rules, field-level semantics, lifecycle edge cases, and similar detail should remain primarily in `Required Product Behavior` unless a detail is necessary to understand the sequence itself.

Practical heuristic: if removing a sentence from a Scenario would preserve the reader's understanding of the material sequence, and that sentence is already owned by Required Product Behavior, omit it from the Scenario.

Do not specify screens, modals, components, selected interaction patterns, or other Design decisions unless they are themselves Product constraints.

Do not require Product Scenarios for trivial, local, or rule-only changes where sequence adds no material value.

Maintain this distinction:

- PRD Key Product Scenario = what materially happens in the product.
- Design Artifact User Flow = how the selected experience makes it happen.
- Technical Flow = how the system implements it.

Key Product Scenarios are part of the PM-stage PRD before Design Exploration. Design may expose a missing or incorrect Product Scenario, but a material Product change must reconcile back into the PRD rather than becoming Design authority.

### Required Product Behavior

Describe what the product must permit, require, prevent, preserve, or cause.

This section may include material eligibility, permissions, state transitions, business rules, consequences, and lifecycle behavior.

Business Rules remain a semantic type of Required Product Behavior. Do not require a separate top-level `Business Rules` section. Use subsections such as `Business Rules`, `Eligibility`, `Lifecycle`, `Configuration`, or `Evaluation` only when they improve coherence.

Organize related behavior into coherent groups so a reader can understand a product rule and its material consequences without reconstructing it across multiple sections.

Each material product rule should have one primary home. Avoid repeating the same rule across multiple subsections merely for completeness; reference or state its consequence only when that adds materially new information.

Prefer grouping behavior by product concept, actor, or lifecycle when that keeps closely related rules together. Do not create a separate subsection for every individual rule or edge case when it is part of a larger coherent behavior.

Describe product behavior rather than interface mechanics or technical implementation unless a specific solution is itself a product constraint.

### Acceptance Criteria

Acceptance criteria define the observable or verifiable product conditions that must be true for the intended change to be considered correctly realized.

They are product-owned behavioral constraints for downstream Design, Engineering, Validation, and AI-generated work.

Acceptance criteria should:

- be specific enough to prevent materially incompatible interpretations,
- remain solution-independent where possible,
- describe product-level correctness rather than implementation mechanics,
- derive from decided product intent or logically necessary consequences of it,
- and not silently encode unresolved AI assumptions as product decisions.

Acceptance criteria should capture material correctness boundaries rather than restate Required Product Behavior line by line. Do not require a one-to-one mapping between behavior statements and acceptance criteria.

Consolidate related conditions only when they represent the same material correctness boundary. Keep conditions separate when they can fail independently in a way that materially affects product correctness.

Acceptance criteria are not test cases. The future Validation Plan owns how correctness is verified.

No mandatory Given/When/Then syntax is required.

### Assumptions & Open Decisions

Expose only uncertainty that could materially affect downstream interpretation.

Apply the Shared Harness uncertainty model before making an unknown durable in `Assumptions & Open Decisions`.

Use this section for:

- material reversible assumptions used to keep work moving,
- unresolved product decisions requiring PM judgment,
- and materially uncertain current-product claims that affect the PRD.

Do not use this section merely for:

- implementation source or system-of-record discovery,
- possible code-level limits or implementation constraints,
- technical feasibility questions,
- missing canonical Product Knowledge ownership or taxonomy,
- other retrievable current-product or implementation facts,
- low-impact working notes,
- or implementation choices.

An unresolved current-product fact belongs here only when, after reasonable retrieval, it materially changes Product interpretation or requires Product judgment.

Unknowns that affect how decided Product behavior will be implemented, but not what Product behavior is intended, should remain retrieval or Technical Planning concerns rather than durable PRD Open Decisions.

Known material uncertainty must remain visible until resolved even when it does not block Design Exploration.

When an item is resolved, AI should update the owning PRD content and remove or replace the stale uncertainty.

## What the PRD does not own

By default, the PRD does not own:

- layout,
- visual hierarchy,
- component selection,
- exact screen structure,
- selected interaction patterns or Design User Flows,
- implementation architecture,
- API or database design,
- test cases,
- or analytics event specifications.

These may appear only when they represent a genuine product constraint rather than a downstream solution choice.

## Readiness for Design Exploration

A PRD is `Problem Aligned` when it is sufficiently grounded and bounded for meaningful Design Exploration and remaining uncertainty does not force Design to invent materially different product intent or behavior.

The materially affected actors, local current-product baseline, established User and Business Outcomes, material scope boundaries, applicable Product Scenarios, required product behavior, and material Product context needed for downstream interpretation should be clear enough for the next use. Business Outcome must be established before `Problem Aligned`; an AI-generated candidate, recommendation, assumption, or unresolved placeholder is not sufficient. Other missing Product judgments may remain unresolved when they are explicit and do not invalidate useful Design Exploration or force Design to invent materially different Product behavior.

The absence of a `references` entry alone does not block Problem Alignment when the material Product behavior and implications are otherwise clear. Likewise, an unresolved **publishing** field such as `wiki_path` does not negate semantic `Problem Aligned` status; it must be disclosed as an **operational publication blocker**, never replaced by an invented Wiki branch.

Acceptance criteria need to be sufficient for that next use, not exhaustive.

## Delivery representation (current pilot)

The PRD is a **Markdown document**, not a transcript or questionnaire. **From the first substantive Working Draft through each material clarification answer to final handoff, create and update one actual `.md` working file**, wherever the execution client supports file creation and updates. Keep it openable/previewable **in the same client where native preview is available**; otherwise provide a verified link to that file. Update the same working copy, instead of producing parallel `v1`, `v2` or `final` artifacts. A local file is not the canonical PM-owned GitLab Wiki PRD or authorization to publish or overwrite external data. If the client cannot create/retain a file, disclose that limitation and provide the latest complete copyable Markdown snapshot in chat following material updates. Never invent file paths, preview capabilities or completed writes.

The `.md` file starts with **one** YAML frontmatter block and contains established behavior plus open decisions in the relevant semantic sections. While blocking clarifications remain, identify it as **Working Draft / not ready for handoff** through a concise line **after** frontmatter (do not add a status metadata field or second YAML block). Do not present unanswered questions as decided behavior. Remove the working-draft indication only after the PRD reaches `Problem Aligned`. The non-authoritative evaluation block follows the PRD body **inside the same file**. Use chat for the current question and concise change summaries, **not for a separate Clarification Record**. The only separately shown Wiki handoff field is `GitLab Wiki Path`, equal to frontmatter `wiki_path`. Deliver a Problem-Aligned PRD even with `wiki_path: unresolved`, and state `Wiki publication not ready` without pretending to publish.

## Harness Pilot Evaluation record

During the current pilot, **include the `Harness Pilot Evaluation` record in the same `.md` file from its first substantive Working Draft**, directly after the main PRD, and keep it current at every material clarification stage and final handoff. This record is **not** a separate chat appendix, independent file, or Product-authoritative section. Preserve the boundary even when a client's preview does not render collapsible HTML; do not omit the record from the Markdown source.

Use a `<details>` block so normal downstream readers see the PRD first and the evaluation material remains collapsed by default.

The record should contain only evaluation-relevant provenance, not chain-of-thought, full browsing logs, or a transcript of the session. Keep it concise enough that a Harness Owner can compare intent, source use, clarification, derivation, and readiness without reconstructing the chat.

Include:

- **Run Context** — workflow, Harness ref/commit when reliably known, and AI client/model when reliably exposed by the environment. Do not fabricate unavailable metadata.
- **Original PM Intent** — preserve the PM's original natural-language intent verbatim. For attached material, reference the attached file or durable source rather than copying its entire contents into the record.
- **Sources Used** — list only materially used sources and identify their role, such as canonical Product Knowledge, current PRD, reviewed evidence, direct observation, implementation evidence, or explicit Product-owner input.
- **Material Source Limitations** — record only source/access limitations that materially affected the draft, clarification, or readiness decision.
- **Clarification Record** — preserve material Product clarifications **inside this same evaluation block**: the actual AI question, PM answer and resulting resolved Product decision. A question still awaiting its answer can be marked `Pending`; do not invent a PM answer or resolved decision. Update the entry in place after clarification. Do not include tool-access, VPN, file-location or other operational questions, and **never duplicate or move this record into chat or another file**.
- **Material Assumptions / Derivations** — record only assumptions or derivations that materially influenced the PRD or the readiness decision. This is concise provenance, not hidden reasoning.
- **Readiness** — record whether the PRD is `Problem Aligned` and list any remaining material open Product decisions relevant to that readiness judgment.

Resolved clarification history belongs only in this evaluation record; the PRD itself should contain the current resolved Product decision in its normal semantic home and should not retain stale resolved questions in `Assumptions & Open Decisions`.

A Harness Owner may later append a short `Harness Owner Review` inside the same evaluation block, for example verdict, material findings, and whether a finding is a regression candidate. AI must not fabricate or pre-approve this owner review.

Recommended representation:

```markdown
---

<details>
<summary><strong>Harness Pilot Evaluation</strong> — non-authoritative</summary>

> این بخش بخشی از PRD و Product Decision نیست و فقط برای ارزیابی Pilot نگهداری می‌شود.

### Run Context

- Workflow: `prd-draft-clarification`
- Harness ref/commit: ...
- AI client/model: ...

### Original PM Intent

> متن اصلی PM

### Sources Used

- `<source>` — `<authority/evidence role>`

### Material Source Limitations

- ...

### Clarification Record

#### C1 — <decision>

**AI Question**

...

**PM Answer**

...

**Resolved Decision**

...

### Material Assumptions / Derivations

- ...

### Readiness

- Problem Aligned: Yes / No
- Remaining material open decisions: ...

### Harness Owner Review

<!-- Optional. Added by the Harness Owner after review; do not prefill as AI. -->

</details>
```

If a subsection has no material content, omit it or state `None` only when that absence is useful for evaluation. Do not move evaluation metadata into PRD YAML frontmatter.
