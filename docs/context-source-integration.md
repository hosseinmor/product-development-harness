# Federated context integration — migration stage 1

The Harness owns workflows, artifact contracts, clarification, review and readiness; it does **not** own the rules or current-product facts found in external sources. `context-sources.yml` is a small locator for source roles, current entry points, access requirements, and cutover state; source-owned manifests and internal navigation stay at the source.

## Retrieval sequence

1. Start at `AGENTS.md` and read `shared-harness-contract.md` plus the task's workflow and artifact contract.
2. Read `context-sources.yml` to identify source owners. Select sources by the **claim/domain needed**, not by folder names.
3. Partition current-product claims by JobVision/Cando. Verify the appropriate internal documentation access in this execution environment; do not treat a listed URL as verified access.
4. Retrieve only the relevant source-owned entry point, topic/component/pattern, and current durable artifact. For Design Language, consult its `DESIGN.md` first; for content, consult its own entry. Do **not** preload a complete manifest's documents.
5. Keep current-product truth, approved PM changes, designer-selected experience, reusable design rules, content expression rules, and evidence separate.
6. Missing access or conflicting evidence is an explicit limitation. Figma, implementation and walkthroughs cannot silently substitute for canonical Product Knowledge.

## Workflow ownership and legacy convergence

| Legacy file in `product-knowledge` | Harness owner | Migration disposition |
|---|---|---|
| `ai/prd-writing.md`, `ai/skills/prd-writing/SKILL.md`, `templates/jira-prd.md` | `workflows/prd-draft-clarification.md` + `artifacts/prd.md` | Replace legacy PRD execution contract with a compatibility pointer **after** consumers and content extraction are verified; do not import its alternate Jira template. |
| `ai/design-start.md` | `workflows/design-exploration.md` + `artifacts/design.md` | Consolidate generic design process; retain specialist Design Language usage guidance with its owner. |
| `ai/research.md` | Task-selected existing Harness workflow | Research is an evidence-gathering activity inside the selected workflow. A standalone research workflow is **not** created in this migration without a demonstrated need. |
| `ai/router.md` | `AGENTS.md` task routing | Retire the duplicate general router at cutover; domain-specific Design/Content routing stays in owning repos. |
| `docs/ai-context-retrieval-flow.md` | This document + `context-sources.yml` | Consolidate cross-source retrieval. |

**No PRD, Design Artifact, product behavior, or Design Language semantics are modified in stage 1.** No existing legacy file is deleted before its owning replacement and consumer links are validated.

## Ownership and cross-system claims

- Product Knowledge: established meaning and current behavior within each product's scope.
- PM and current PRD: approved intended product change, outcomes, scope and required behavior.
- Product Designer and current Design Artifact: selected experience and interaction.
- Karbon Design Language: reusable visual, interaction, accessibility and implementation guidance; product-specific identities may have approved variations.
- Product Content System: terminology, voice, tone, localization and UI expression, never product behavior.
- Harness: process, consistency and downstream change propagation.
- Product Walkthrough, implementation, observation and research: evidence within their verified scope, not a policy override.

## Cutover gates

- **Design repo**: rename the existing `product-knowledge` repository (preserving Git history) to `karbon-design-language` using repository administration, then re-verify URL and access; only then change the registry's current location.
- **Content repo**: create `product-content-system`, copy source documents **and** their validators/evals/manifest generation or adapt indexing there, prove equivalent coverage, then update the registry to the actual URL and new entry point. PR #83 (Cando context) is open: explicitly decide whether its reviewed changes have landed before final inventory and checksum comparison.
- **Retirement**: remove content and legacy general router from Karbon only after Content System is independently usable, links are updated and validators pass in both repos.
- **Harness**: run deterministic routing/source tests first. Reserve model-backed evals for a documented semantic regression risk, not a directory rename.

A GitHub repository URL, GitLab location, verified AI access path or artifact store must **never** be manufactured from a proposed name.
