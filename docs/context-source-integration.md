# Federated context integration

The Harness owns workflows, artifact contracts, clarification, review, and readiness. It does **not** own the rules or current-product facts found in external sources.

`context-sources.yml` is the compact runtime locator for source roles, current entry points, access requirements, and task-resolved artifacts. Source-owned registries and navigation remain with their owning source.

## Retrieval sequence

1. Start at `AGENTS.md` and read `shared-harness-contract.md` plus the task's workflow and artifact contract.
2. Resolve product scope before product-specific retrieval. If JobVision/Cando ownership cannot be established from explicit or authoritative context, ask one minimal routing question rather than guessing.
3. Read `context-sources.yml` to identify the source role that owns each needed claim.
4. Partition cross-product claims by JobVision/Cando and verify access to the corresponding canonical Product Knowledge source in the current execution environment.
5. When user-shared/local browser tabs are readable, reuse an already-open relevant canonical tab; otherwise request one canonical tab for the resolved product. Retrieve the smallest relevant context first and request additional tabs/sources only when materially necessary.
6. Retrieve only the smallest relevant source-owned context:
   - Design Language: start with the `design-language` repository's `AGENTS.md` / `ai/router.md`, then the smallest owning document.
   - Product Content: start with `foundations/content/README.md` in the same repository, then the relevant foundation, pattern, component-copy contract, or eval.
   - Product Walkthrough and working artifacts: resolve only the task-relevant current source/artifact.
7. Keep current-product truth, approved PM changes, designer-selected experience, reusable design rules, content expression rules, and evidence separate.
8. Missing access or conflicting evidence is an explicit limitation. Figma, implementation, walkthroughs, Design Language, or Content guidance cannot silently substitute for canonical Product Knowledge.

## Current source topology

| Source role | Current location | Entry point |
|---|---|---|
| JobVision Product Knowledge | `https://docs-jv.jvoffice.ir/` | relevant internal Product Knowledge pages |
| Cando Product Knowledge | `https://docs-cd.jvoffice.ir/` | relevant internal Product Knowledge pages |
| JV Design Language / Karbon | `https://github.com/hosseinmor/design-language` | `AGENTS.md` then `ai/router.md` / smallest owning document |
| Product Content System | `https://github.com/hosseinmor/design-language` | `foundations/content/README.md` |
| Product Walkthrough | task-resolved | relevant reviewed journey/flow evidence |
| Current PRD | task-resolved | current durable PM-owned artifact |
| Current Design Artifact | task-resolved | current durable Designer-owned artifact |

Design Language and Product Content are separate **authority roles** even though they currently share one repository. Repository co-location does not merge their ownership boundaries.

## Ownership and cross-system claims

- **Product Knowledge** — established product meaning and current behavior within each product's scope.
- **PM and current PRD** — approved intended Product Change, outcomes, scope, and required behavior.
- **Product Designer and current Design Artifact** — selected experience and interaction.
- **JV Design Language / Karbon** — reusable visual, interaction, accessibility, component, pattern, governance, integration, and approved product-expression rules.
- **Product Content System** — reusable terminology, voice/tone, localization, interaction-language patterns, and component copy; never product behavior.
- **Harness** — process, consistency, readiness, and downstream change propagation.
- **Product Walkthrough, implementation, observation, and research** — evidence within their verified scope, not policy overrides.

## PRD Wiki placement map

`resources/prd-knowledge-areas.yml` is a **dated navigation index** of area overview paths extracted **only from canonical Product Knowledge** (JobVision 27 + Cando 38 as of 2026-10-26). It does not own or duplicate product semantics, and is not a second source of truth. `context-sources.yml` continues to hold source endpoints. For every new Wiki PRD, read live canonical Knowledge to establish the owning area, and consult this inventory only to locate it or detect changes. **GitLab Wiki is authoritative for the spelling/case of existing Wiki parents**, which may differ from Knowledge (for example Knowledge `ats/job`, Wiki `ATS/job`). Check the real Wiki hierarchy when preparing publication metadata; use the exact existing parent plus `<ID>-<english-kebab-case-slug>`. Do not use a separate permanent area-to-Wiki mapping file or add Wiki aliases to the Knowledge inventory. Where the destination cannot be verified, mark `wiki_path: unresolved` and ask for the precise parent or approval before creating a new hierarchy, without blocking semantic Problem Alignment. Refresh this Knowledge inventory **from Knowledge only**. Preserve existing published PRD paths until an explicit move is approved.

## Source-location rules

- Treat `context-sources.yml` as the current locator; do not hard-code obsolete repository names elsewhere in Harness guidance.
- A repository URL or artifact location is not evidence that the source is accessible in the current execution environment; verify access when the task depends on it.
- Do not infer a future repository or URL from a proposed name.
- If a source moves later, update the registry only after the new location and entry point are verified, then update any intentionally human-facing direct links.
- Keep source-owned routing, manifests, validators, and semantic rules in the owning source rather than copying them into the Harness.
