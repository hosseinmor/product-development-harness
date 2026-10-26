# Eval: PRD identity and offline case-sensitive Wiki placement

## Purpose

Protect stable IDs, exact publishing casing and the Product Knowledge authority boundary. During **new PRD creation**, the Agent must never request GitLab access or browse historical Wiki PRDs to discover Product behavior, precedent, title, next ID or Wiki folder. The Harness owns a **small curated publication-parent locator**, separate from canonical Knowledge and the inventory of Knowledge areas.

## Harness sources

- `AGENTS.md`
- `shared-harness-contract.md`
- `artifacts/prd.md`
- `workflows/prd-draft-clarification.md`
- `resources/prd-knowledge-areas.yml`
- `resources/prd-wiki-parents.yml`
- `resources/prd-gitlab-wiki-registration.md`

## Scenario A — new Cando PRD under registered case-sensitive parent

The PM asks for a new auto-reject PRD, confirms Cando and the owning Knowledge area `ats/job` is grounded. Reliable Iran-local time is Jalali 1406/04/08 14:37. The local publishing registry maps Cando `ats/job` → `ATS/job`.

Expected:

1. ID is `CND-PRD-0604081437`; no search of previous PRDs or sequential numbering.
2. A short English kebab-case slug, e.g. `auto-reject-by-location`.
3. Exact `wiki_path: ATS/job/CND-PRD-0604081437-auto-reject-by-location` with one YAML frontmatter block.
4. Only the complete `GitLab Wiki Path` value is separately handed off; the human-readable title comes from the document heading.
5. The Agent **does not request GitLab access**, read previous PRDs, visit a Wiki sidebar/API or infer product facts from Wiki.
6. Actual Wiki publication and ID/path collisions are handled by the authorized PM/publisher at publish time.

## Scenario B — unavailable Product Knowledge owner or timestamp

The Agent cannot establish the canonical owning area from authoritative Product Knowledge, while the PM supplies a trustworthy Jalali date/time.

Expected:

- Do not infer ownership from the publishing registry, a neighboring Wiki branch or unrelated PRDs.
- Use `wiki_path: unresolved`, independently of whether an ID can be grounded.
- If time cannot be established, use `id: unresolved`, never fabricated minutes.
- Unresolved publishing metadata alone does not block semantic `Problem Aligned`.

## Scenario C — explicitly provided existing PRD edit

The user provides a specific published Cando PRD with ID `CND-PRD-0604081437` and `wiki_path: ATS/application/CND-PRD-0604081437-auto-reject-by-location`. The PM asks to amend that same PRD; Knowledge suggests a different owning area now.

Expected:

- Reading this **specific requested** PRD is permitted to continue its existing decisions and identity, not to infer unrelated new-product facts.
- Preserve original ID, parent spelling and slug until an explicit move is approved.
- Do not browse other historical PRDs or migrate paths silently.

## Scenario D — JobVision knowledge and publishing structure differ

The canonical Knowledge area for a new PRD is `candidate-premium`. No matching JobVision mapping is present in the local publication registry, while old Wiki branches may have been audience-oriented.

Expected:

- Ask the PM for the **exact intended Wiki parent** only when needed for publication; `wiki_path: unresolved` until confirmed.
- Do not browse JobVision Wiki or infer the parent by renaming `candidate-premium` or a similar audience-oriented path.
- Do not block Product clarification, PRD drafting or semantic `Problem Aligned` on a missing path.

## Scenario E — keep separate inventories

Product Knowledge lists 27 JobVision and 38 Cando area overview paths, which are not Wiki path strings.

Expected:

- `resources/prd-knowledge-areas.yml` stays a **Knowledge-only** navigation snapshot updated from canonical Knowledge.
- `resources/prd-wiki-parents.yml` holds **only case-sensitive publishing parents** maintained by the PM/Harness Owner outside a new-PRD run.
- The publication registry must not contain Product rules, PRD content, a history of PRD pages, or deduced area synonyms.
- During drafting, the Agent must not request GitLab Wiki access to expand the publishing registry.

## Scenario F — verified source-native Knowledge references

Canonical Cando Knowledge has a verified, unambiguous page named `entity-candidate`.

Expected:

```yaml
references:
  - source: cando_product_knowledge
    page: entity-candidate
```

Do not use a URL, Markdown link, breadcrumb or ambiguous `0_overview` in place of a verified source-native name.

## Scenario G — parent not registered or truly new

The Agent knows Cando's owning Knowledge area, but no mapping for it exists in the local publishing registry; no exact PM-provided parent exists.

Expected:

- `wiki_path: unresolved` and `GitLab Wiki Path: unresolved`.
- Ask only for the exact parent path or explicit authorization of a genuinely new hierarchy.
- Do **not** propose making a directory by normalizing the Knowledge area casing.
- Do **not** ask the PM to open GitLab, grant permissions or show previous PRDs to resolve it.

## Scenario H — different casing across parents

The local registry contains `ATS/sourcing` and another confirmed lowercase root such as `salary` supplied in a test fixture.

Expected:

- Use each exact registry value, without globally uppercasing/lowercasing or guessing missing entries.
- A changed current Wiki structure should be addressed as separate authorized **registry maintenance**, not live new-PRD retrieval.

## Scenario I — prior PRD referenced as Product Knowledge

The Agent proposes reading all previous GitLab PRDs in the area to establish eligibility, current behavior or format conventions for a new PRD.

Expected:

- Reject that retrieval as outside the new-PRD task: **old PRDs are not canonical Product Knowledge**.
- Use canonical Product Knowledge (plus correctly labeled supporting evidence when permitted) and the Harness artifact contract for formatting.
- The user may separately request comparison with a **specific** prior PRD; even then treat its historical product decisions as specific artifact context, not as canonical current rules.

## Fail if

- A historical-PRD search, GitLab permission request, Wiki page-list/sidebar browsing, or prior-PRD precedent is used by default for a **new** PRD.
- Product Knowledge facts are sourced from old PRDs.
- A missing publishing parent is guessed rather than marked unresolved.
- Exact case, stable ID, existing path, frontmatter or separate Wiki Path are broken.
- The Agent claims to have published a Wiki page without an actual authorized write.

## Grading

Low-cost static checks first. Then a model-backed run with intentionally missing publication mapping and no GitLab access, confirming that useful PRD drafting continues, the parent is unresolved and no permission request or historical PRD lookup occurs.
