# Eval: PRD identity, Knowledge ownership and case-sensitive Wiki placement

## Purpose

Protect stable timestamp IDs, single YAML frontmatter and copy-ready GitLab Wiki Path. A real Cando pilot created a **parallel lowercase Wiki branch** by copying the Knowledge area `ats/job` instead of reusing the existing Wiki parent `ATS/job`. Product Knowledge owns product meaning and primary area; the **actual GitLab Wiki owns its existing directory spelling, including case**. Do not reintroduce a permanent Knowledge-to-Wiki mapping table.

## Harness sources

- `shared-harness-contract.md`
- `artifacts/prd.md`
- `workflows/prd-draft-clarification.md`
- `resources/prd-knowledge-areas.yml`
- `resources/prd-gitlab-wiki-registration.md`

## Scenario A — new Cando PRD under an existing differently cased parent

The PM creates a **new** Cando job auto-reject PRD. Reliable Iran-local timestamp: **Jalali 1406/04/08, 14:37**. The owning area is `ats/job` in canonical Cando Knowledge; the actual destination GitLab Wiki has a **verified existing** parent `ATS/job`.

Expected:

1. ID: `CND-PRD-0604081437`; no registry or sequence lookup.
2. One short English kebab-case slug, such as `auto-reject-by-location`.
3. **Reuse the existing Wiki parent's exact case**: `wiki_path: ATS/job/CND-PRD-0604081437-auto-reject-by-location`. Never substitute `ats/job` or create parallel `ats`.
4. Confirm each Wiki parent segment's original case; there is no rule that all directories should be uppercase or lowercase.
5. Keep other materially relevant Knowledge references in `references` and create only one PRD.
6. Exactly one opening frontmatter; outside the copyable PRD show **only** `GitLab Wiki Path: ATS/job/CND-PRD-0604081437-auto-reject-by-location`.
7. Disable "Generate page path from title" when publishing, omit `.md` from Path, and do not claim the page was saved.

## Scenario B — owner or timestamp cannot be grounded

The PM provides a trustworthy Jalali date/time but canonical Knowledge is inaccessible and no authoritative context establishes the owning area.

Expected:

- Preserve trustworthy PM-supplied date/time as a manual fallback; no fabricated time.
- Do not guess area from generic vocabulary, the cached Knowledge index, or a related `references` entry.
- Use `wiki_path: unresolved` and show `GitLab Wiki Path: unresolved`.
- If timestamp cannot be established, use `id: unresolved`; operational placement uncertainty is not automatically a blocker for semantic `Problem Aligned`.

## Scenario C — preserve an existing published Wiki path

An already-published Cando PRD has `id: CND-PRD-0604081437` and `wiki_path: ATS/application/CND-PRD-0604081437-auto-reject-by-location`. The PRD is edited and Knowledge indicates `ats/job` is the better owning area.

Expected:

- Preserve both the original ID and **exact previously published path**, including case and parent, until the PM explicitly approves a move.
- Reconcile new product facts without silently regenerating the path or slug.
- Show only the original GitLab Wiki Path outside Markdown.
- If moved with approval, keep ID and repair references.

## Scenario D — JobVision Knowledge and Wiki information architectures differ

Knowledge has `job-search`, `candidate-premium`, `cv` and `application` areas. Existing Wiki paths can be audience-oriented, such as `candidate/job-discovery`, `candidate/jobvision-pro`, or `candidate/onboarding-cv`.

Expected:

- Resolve **Product owner from Knowledge**, but do not assume the Wiki uses the identical Knowledge path.
- Do not automatically treat conceptually similar Wiki branches as exact parent equivalents. Ask PM for the intended existing Wiki parent if a safe one cannot be confirmed.
- Do not create `job-search/`, `candidate-premium/` or `cv/` only because those are Knowledge area names.
- A previously published `candidate/jobvision-pro` PRD keeps its stored path unless a move is approved.

## Scenario E — refresh Knowledge-only inventory

Canonical Knowledge exposes 27 JobVision `0_overview` areas and 38 Cando `0_overview` areas.

Expected:

- Update `resources/prd-knowledge-areas.yml` **from Knowledge alone**, retaining its actual area names/case and all areas whether or not Wiki parents exist.
- No `verified_areas`, `wiki_parent`, `wiki_routes` or area-to-Wiki map is introduced.
- The cached Knowledge inventory never overrides live canonical Knowledge or the **actual Wiki spelling** of an existing publication parent.

## Scenario F — only source-native page names in references

Canonical Cando Knowledge has a verified page named `entity-candidate`; its URL is also accessible.

Expected frontmatter:

```yaml
references:
  - source: cando_product_knowledge
    page: entity-candidate
```

Do not insert a URL, Markdown link, browser path, invented identifier or descriptive breadcrumb such as `ATS / Candidate / Entity` into `page`. If the actual source-native name cannot be confirmed, omit that reference rather than fabricating a name.

## Scenario G — Wiki parent unavailable or a new branch is genuinely necessary

The Agent knows the owning Knowledge area `ats/job` but cannot access Wiki navigation or find a trustworthy exact existing parent path. In another run, the Wiki is readable and no corresponding parent exists.

Expected:

- **Unavailable Wiki:** mark `wiki_path: unresolved`, output `GitLab Wiki Path: unresolved`, and request only the exact existing parent path or access required to check it. Do not present `ats/job` as an established parent.
- **Wiki readable, no equivalent:** do not silently create any path. Request the PM's explicit approval of a *new* parent hierarchy before constructing a publishing path.
- The operational Wiki-location step may remain open even when Product decisions permit `Problem Aligned`; avoid confusing publishing with semantic readiness.

## Scenario H — case is exact across all segments, not a fixed ATS normalization

The actual Wiki includes `ATS/sourcing`, `Calendar`, `Onboarding`, `Pulse` and `salary`. Canonical Knowledge uses its own independent path names.

Expected:

- Use `ATS/sourcing` and `Calendar` exactly where those are the verified publication parents.
- Do **not** mechanically uppercase every root (e.g. `salary` must remain lowercase) or lowercase all segments; match each actual Wiki path byte-for-byte.
- Never create a second parent only because the Knowledge casing differs.

## Fail if

- Wrong calendar/timezone/padding or invented minute; known ID collision ignored.
- A new Wiki parent is guessed from Knowledge casing despite an existing case-different Wiki parent.
- A case-normalizing algorithm, persistent Wiki mapping, or a conceptual synonym replaces a real parent check.
- Missing Wiki access is treated as permission to create a new or parallel directory.
- An established published path or ID changes without approval.
- Multiple frontmatter blocks, wrong `references.page` format, omitted separate GitLab Wiki Path, or an invented publication claim.
- `.md`, a URL, transliterated Persian title or a second timestamp is placed into the Wiki Path.

## Grading

Static contract checks first. Then simulate Cando Wiki parent `ATS/job` vs Knowledge `ats/job`, missing Wiki access, new hierarchy request, and JobVision's differing navigation. Grade parent case, readiness separation, non-duplication, stable identity and copyable Path. A specific GitLab client, API or browser is not required.
