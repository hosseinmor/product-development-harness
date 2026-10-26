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

`resources/prd-wiki-placement-map.yml` has **two intentionally separate sections for each product**: `knowledge_areas` is a dated inventory of the canonical Product Knowledge overview paths observed on the JobVision and Cando sites (27 + 38 at this snapshot), while `verified_areas` contains only independently confirmed Knowledge-area → GitLab Wiki-parent translations. It is separate from `context-sources.yml` (source locations). It does not duplicate individual rule/flow/capability documents, define product ownership or guarantee that a Knowledge area has a corresponding Wiki folder. For Wiki-bound PRDs, establish ownership in live canonical Knowledge first, cross-check the inventory for changes, then require an **exact matching** `verified_areas` key for a previously checked Wiki parent; no generic parent/sibling fallbacks. An area with no verified Wiki mapping is not an absent Product Knowledge area: verify the actual destination or label placement as proposed/unresolved. Refresh the Knowledge inventory **from Knowledge alone** when its area navigation changes; separately update Wiki translations only after validating the destination path. Never migrate published PRDs merely because the map was updated.

## Source-location rules

- Treat `context-sources.yml` as the current locator; do not hard-code obsolete repository names elsewhere in Harness guidance.
- A repository URL or artifact location is not evidence that the source is accessible in the current execution environment; verify access when the task depends on it.
- Do not infer a future repository or URL from a proposed name.
- If a source moves later, update the registry only after the new location and entry point are verified, then update any intentionally human-facing direct links.
- Keep source-owned routing, manifests, validators, and semantic rules in the owning source rather than copying them into the Harness.
