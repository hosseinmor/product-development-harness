# Job Vision Product Development Harness

A minimal, tool-agnostic harness for AI-native, human-governed product development at Job Vision.

The Harness defines shared rules, workflow contracts, artifact boundaries, and optional validation/runtime infrastructure that can be used across tools such as ChatGPT, Claude, Cursor/Codex, Figma, and future environments.

The canonical Harness source for the current pilot is `https://github.com/hosseinmor/product-development-harness`. The GitLab migration is paused until internal access issues are resolved.

The core Harness is tool-agnostic. Some validation/runtime implementations in this repository are currently provider-specific and are not required to use the core Harness.

**Federated context:** [`context-sources.yml`](context-sources.yml) lists
current authoritative source locations plus Design Language, Content, evidence
and per-task artifact entry points.
[`docs/context-source-integration.md`](docs/context-source-integration.md)
defines selective retrieval and source ownership. The current reusable Design
Language and Content foundation are both in
`https://github.com/hosseinmor/design-language`, with separate entry points.

## Core principles

- Human roles retain decision authority in their domains.
- AI retrieves context, drafts, derives constrained consequences, identifies ambiguity, recommends, challenges, maintains artifacts, and reconciles inconsistencies.
- AI must not silently convert unresolved product or design judgment into fact.
- Humans should not create extra documentation for AI when the required context can be retrieved or derived from working artifacts.
- Authority belongs to the claim and its owning domain, not to the tool containing it.
- Each fact should have one primary owner where practical.
- Canonical Product Knowledge is the primary source for established product meaning and behavior. Product Walkthrough provides reviewed evidence that can improve journey/flow reconstruction but does not replace canonical Product Knowledge.
- Retrieval should be task-scoped. Do not load whole repositories or knowledge bases when a smaller relevant slice is sufficient.
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

The Standalone PRD Kit is a **separately chosen, optional mode** for structured drafting without the full Harness. It is not an equivalent replacement and must **never** be selected automatically because Harness access failed.

The Harness rules themselves remain in `AGENTS.md`, the shared contract, workflows, and artifact contracts.

### Repo-aware agents

Give the agent the direct entry point `https://github.com/hosseinmor/product-development-harness/blob/main/AGENTS.md`. The URL is an entry hint, **not proof of access**. Before any task execution, Gate 0 requires actually reading the entire `AGENTS.md`, `shared-harness-contract.md`, the routed workflow, required artifact contract(s) and `context-sources.yml` from canonical GitHub `main` by default, or from **one explicitly pinned GitHub ref** when testing an unmerged PR. Do not mix files from different refs; label a branch-based run as a preview.

Direct GitHub reads and GitHub-validated clones are equivalent transport options when fully readable at the selected ref; MCP or a particular runtime is not required. If any required file cannot be read, **stop** and report the missing file(s); do not generate a generic PRD, ask product confirmation, or silently switch to Standalone. After successful reads, for each **product-scoped PRD/Design task**, propose Product Scope and **ask for one human confirmation**, even if the task already names a product. Generic Harness Improvement that does not affect a specific product artifact does not require an artificial Product Scope gate. The organization's Harness name must not influence that proposal.

### Current pilot: manual Harness access

MCP is **not required** to use the Harness.

During this pilot, repository-backed Harness execution is **fail-closed**: if neither direct retrieval nor a verified current clone can read all required files, the Agent cannot proceed under the Harness. Pasted/older copies of files are not an automatic substitute for the GitHub source. A separately requested offline or Standalone exercise must be explicitly identified as **not** this normal repository-backed execution.

The current manual model is intentionally simple: Harness retrieval → AI executes the Harness → a human persists the resulting PRD in the explicitly designated current durable location for that Product Change. During new PRD creation, the Agent **does not search historical GitLab Wiki PRDs** for current-product behavior, precedent or publishing path: canonical Product Knowledge establishes the owning area, whose exact relative path is used as the Wiki parent. The PM reviews a **rendered read-only PRD preview** where supported and uses **Copy Markdown** to transfer its *full raw Markdown source* (including frontmatter and collapsed evaluation record) into GitLab's Markdown/source editor; the Wiki Path is copied separately. If a platform cannot render or copy raw Markdown directly, expose the verified `.md` file/source and disclose the limitation.

A repository or artifact-store integration may later automate retrieval and persistence. That future automation must preserve the same Harness workflow and authority rules rather than introduce a different process.

### Environments without repository or internal-source access

**Harness access failure:** stop before task execution; restore GitHub read access or verified Git checkout access. Do not pretend that a copied prompt, remembered rules, or the README provides the contracts.

**Product Knowledge access failure after the Harness gates:** preserve the limitation and use only sources with their actual authority roles, according to the workflow. Do not substitute another repository, historical Knowledge, walkthrough evidence, observed UI/design, implementation evidence, or model knowledge as canonical current-product truth.

### External product context

Provide access to or the location of relevant external sources such as canonical Product Knowledge, reviewed Product Walkthrough evidence, current working artifacts, other evidence, Product Content/Design System guidance, or implementation evidence. The Harness defines how those sources should be treated; it does not require a specific storage or retrieval tool.

For JobVision, the current canonical Product Knowledge entry point is `https://docs-jv.jvoffice.ir/`. In the documented ChatGPT Desktop / Work pilot, the recorded supported access path is local Chrome on the same company-VPN-connected machine, controlled through Computer Use + the Chrome extension. ChatGPT Built-in Browser, Cloud Browser, and ordinary Web Search are not supported substitutes for this internal source. Verify access in each execution environment; if unavailable, preserve that limitation. Reusable Design Language and Content guidance is in `https://github.com/hosseinmor/design-language` (see `context-sources.yml`); it is never a fallback store for JobVision product behavior.

For the current pilot, migration of the **Harness repository** to GitLab is paused. For the current JobVision/Cando pilot, the corresponding product GitLab Wiki is the **default** manual PRD publishing target unless the PM explicitly chooses another durable store; the Harness remains portable across storage providers and does not claim automatic Wiki write access. Identify one canonical durable PRD per Product Change before downstream handoff. A new PRD ID uses product prefix + 10-digit Jalali Iran-local `YYMMDDHHmm` timestamp rather than a registry/Issue sequence; the existing stable `id` must be preserved when updating. For Wiki-bound PRDs, `wiki_path` records the full proposed/established Wiki page path, and the AI must provide only the copy-ready `GitLab Wiki Path` outside the PRD content; the document heading supplies the page title. See `artifacts/prd.md` and the GitLab Wiki publication guide.

The PM remains the authority for Product decisions and the canonical PRD write. Other roles may propose changes through the review/comment mechanism available around the chosen durable artifact, but a proposal is not itself a Product decision. When a PM accepts a proposed change, the current durable PRD is updated and downstream propagation rules apply.

The future PRD storage/integration model remains a deployment decision. The Harness must not infer a storage service, permission model, or automation path that has not been established.

A minimal **PRD** task prompt (see the [PM Quick Start](resources/pm-quick-start.md)):

```text
برای درخواست زیر با Job Vision Product Development Harness یک PRD تهیه کن.

https://github.com/hosseinmor/product-development-harness/blob/main/AGENTS.md

Intent:
[مسئله یا تغییر موردنظر]
```

For existing work, add `Current PRD:` with the current durable artifact. The Harness owns Product confirmation, Knowledge selection, clarification and output rules; the prompt need not repeat them.

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

These directories are validation infrastructure, not additional sources of Product or Design authority. Some HTTP Product Knowledge utilities under `evals/orchestrator/` are diagnostics or experimental snapshot tooling; they are not the supported local-browser Product Knowledge access contract for normal Harness use.

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
│   ├── runtime-evals-guide.md
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
