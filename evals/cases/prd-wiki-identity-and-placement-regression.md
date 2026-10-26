# Eval: PRD timestamp identity and Knowledge-owned Wiki placement

## Purpose

Verify the manual-friendly, Knowledge-owned publishing contract. An observed pilot PRD had two consecutive frontmatter blocks and the Wiki API parsed only the first. This regression protects single frontmatter, permanent identity, canonical Knowledge placement, and the explicit GitLab Wiki Path-only handoff.

## Harness sources

- `shared-harness-contract.md`
- `artifacts/prd.md`
- `workflows/prd-draft-clarification.md`
- `resources/prd-knowledge-areas.yml`
- `resources/prd-gitlab-wiki-registration.md`

## Scenario A — new Cando auto-reject PRD

The PM publishes a **new** Cando PRD. Trusted Iran-local time: **Jalali 1406/04/08, 14:37**. Cando canonical Knowledge establishes `ats/job` as the owning area for job auto-reject rules, while `ats/application` and `ats/candidate` are materially related. The destination Wiki may already contain legacy uppercase `ATS/job` pages.

Expected:

1. ID: `CND-PRD-0604081437`, without a registry, GitLab Issue, or sequence lookup.
2. Choose a concise English kebab-case slug such as `auto-reject-by-location`.
3. **Use the exact Knowledge area path as the new Wiki parent**, with original casing: `wiki_path: ats/job/CND-PRD-0604081437-auto-reject-by-location`.
4. Do not translate `ats/job` to the legacy `ATS/job` merely because Wiki has that directory; Knowledge dictates the new convention, and the PM can create the new branch on publication.
5. Keep application/candidate area references in `references`, not as alternative duplicate PRDs.
6. Produce exactly **one** opening YAML frontmatter including both `id` and `wiki_path`.
7. **Always** show only `GitLab Wiki Path: ats/job/CND-PRD-0604081437-auto-reject-by-location` outside the PRD Markdown. Use the PRD heading as the page title; no extra `GitLab Wiki Title` handoff field.
8. Explain that the Wiki Path must be entered independently of the document heading, disable "Generate page path from title", and omit `.md` from Path. Do not imply the PRD was published.

## Scenario B — no trustworthy timestamp or owning area

The PM provides a trustworthy Jalali date/time manually but canonical Knowledge is inaccessible and no other authoritative context establishes the owning area.

Expected:

- Accept the supplied Jalali date/time as a manual fallback for ID; do not require a registry or random ID service.
- Do not guess the owning area from generic vocabulary, the nearest inventory entry, or a `references` entry.
- Return `wiki_path: unresolved` and separately show `GitLab Wiki Path: unresolved` plus the minimum needed canonical access/context.
- If time cannot be established even from the PM, keep `id: unresolved` instead of inventing a minute.
- Operational uncertainty in publication placement does not automatically prevent semantic `Problem Aligned`.

## Scenario C — existing Wiki PRD under a legacy path

An already-published Cando PRD has `id: CND-PRD-0604081437` and `wiki_path: ATS/application/CND-PRD-0604081437-auto-reject-by-location`. Its content or title changes and canonical Knowledge now points to `ats/job`.

Expected:

- Preserve its existing ID and stored Wiki Path (including legacy uppercase and legacy parent), even if the new-page convention would choose another path.
- Update only semantic content/references as needed, with one opening frontmatter block.
- Offer only the established GitLab Wiki Path outside the copyable Markdown.
- Move the page only after an explicit decision, keeping ID stable and reconciling links.

## Scenario D — new JobVision PRDs follow canonical areas

JobVision canonical Knowledge has areas `job-search`, `candidate-premium`, `cv`, and `application`. Some historical Wiki paths use audience-based directories such as `candidate/job-discovery`, `candidate/jobvision-pro`, or `candidate/onboarding-cv`.

Expected:

- A **new** job-search PRD uses `job-search/<JV-PRD-ID>-<slug>`, not `candidate/job-discovery/...`.
- A **new** candidate-premium PRD uses `candidate-premium/<JV-PRD-ID>-<slug>`, not `candidate/jobvision-pro/...`.
- A **new** CV PRD uses `cv/<JV-PRD-ID>-<slug>`; do not require a matching pre-existing Wiki directory.
- A previously published PRD under `candidate/jobvision-pro` keeps its actual Path until an approved move.
- Do not infer area ownership merely because the path is listed in `knowledge_areas`; derive ownership from the live Knowledge documentation and the intent.

## Scenario E — Knowledge-only inventory refresh

The task is to refresh the snapshot from the two live canonical Knowledge sites. Their navigation currently exposes 27 JobVision `0_overview` areas and 38 Cando `0_overview` areas.

Expected:

- Update `resources/prd-knowledge-areas.yml` from canonical Knowledge **only**; no Wiki navigation or Wiki mapping extraction.
- Preserve all observed area paths and correct casing for both products, including areas without previously published PRDs.
- No `verified_areas`, `wiki_parent`, `wiki_routes`, or Knowledge-to-Wiki translation table should be introduced to the inventory.
- A new/renamed area in live Knowledge supersedes the cached area list; a stale index cannot override canonical Knowledge.
- Publishing path selection uses the live Knowledge area name even if the index has not yet been refreshed.

## Fail if

- The Agent uses Gregorian dates, the browser timezone, Persian digits, wrong padding, or seconds instead of ten digits of Jalali date and Iran-local time.
- A known timestamp-ID collision is ignored and an existing PRD is overwritten.
- A new Wiki path is translated using `verified_areas`, legacy GitLab directory naming, or an independently maintained mapping rather than the exact Knowledge area.
- A Knowledge inventory entry is treated as independent authoritative evidence of the changed behavior's owner.
- The Agent demands a pre-existing identical Wiki directory before proposing a new path.
- The Agent changes an already-published Wiki path or stable ID silently.
- There are multiple consecutive YAML frontmatter blocks, or a Wiki-bound PRD lacks the separate, explicit, copy-ready `GitLab Wiki Path`.
- The Agent adds `.md`, a URL, a Persian transliteration, or another timestamp to the new Wiki Path.

## Grading

Use deterministic checks for ID formatting, `wiki_path` assembly, single-frontmatter structure, old-vs-new path stability, inventory coverage, and required separate Wiki Path. Use semantic review for owning-area identification and separation of live Knowledge authority from inventory navigation.
