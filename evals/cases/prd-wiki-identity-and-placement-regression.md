# Eval: PRD timestamp identity and GitLab Wiki placement handoff

## Purpose

Protect the chosen manual-friendly PRD naming/placement workflow in the JobVision and Cando GitLab Wikis. In a pilot, a PRD was pasted into Wiki with two consecutive YAML frontmatter blocks, and the API parsed only the first block; `wiki_path` was not machine-visible. Separate work established that merely writing a missing/unverified page path is not a reliable publishing handoff.

## Harness sources

- `shared-harness-contract.md`
- `artifacts/prd.md`
- `workflows/prd-draft-clarification.md`
- `resources/prd-gitlab-wiki-registration.md`

## Scenario A — new Cando auto-reject PRD

Assume the PM has selected the Cando GitLab Wiki for manual publication. A trusted source confirms Iranian **Jalali 1406/04/08 14:37**. Canonical Cando Product Knowledge establishes that the auto-reject configuration behavior is owned by the **ATS job** area, while the Candidate and Application areas have materially relevant references. The actual Wiki has an `ATS` top-level parent; the exact `ATS/job` child has **not** yet been verified.

Expected behavior:

1. Generate `id: CND-PRD-0604081437` without registering a GitLab Issue or scanning the last PRD.
2. Propose a concise English slug, such as `auto-reject-by-location`, and a complete `wiki_path: ATS/job/CND-PRD-0604081437-auto-reject-by-location`.
3. Treat `ATS/job` as **proposed**, not an asserted existing page/folder, until GitLab navigation verifies it.
4. Preserve other relevant areas as `references`, not as duplicate canonical PRDs.
5. Produce **exactly one** opening YAML frontmatter block that contains `id` and `wiki_path`.
6. **Always** emit a separate, human-readable publishing handoff outside the PRD Markdown with:
   - `GitLab Wiki Title: رد خودکار درخواست‌های شغلی بر اساس محل سکونت کارجو`
   - `GitLab Wiki Path: ATS/job/CND-PRD-0604081437-auto-reject-by-location`
7. Explain that GitLab uses distinct Title and Path fields and the PM should disable automatic Path generation from Title.

## Scenario B — manual fallback and ambiguity

The Agent cannot determine the current Iranian Jalali date/time reliably, but the PM provides Jalali `1406/04/08` and Iran-local `14:37`. The canonical Product Knowledge page is inaccessible and the current Product Intent does not establish which of two areas owns the proposed capability.

Expected behavior:

- Derive the same date-based ID using the PM's date/time and product scope; do **not** require any API, UUID service, registry, or Issue.
- **Do not** invent a primary parent from a secondary `references` page or fake a verified Wiki directory.
- Keep `wiki_path: unresolved` and explicitly emit `GitLab Wiki Path: unresolved` with the minimal needed placement question or verification step.
- Never omit the explicit publication handoff simply because the Path is unresolved; do not misclassify a placement question as Product decision-making or falsely block `Problem Aligned`.
- When neither PM nor tools provide trustworthy time, do not invent a timestamp; retain `id: unresolved` while pursuing the smallest operational clarification.

## Scenario C — revising an existing PRD

A published PRD already has `id: CND-PRD-0604081437` and `wiki_path: ATS/job/CND-PRD-0604081437-auto-reject-by-location`. The PM updates its title, clarifies a required behavior and adds more Product Knowledge references. The Agent processes it later, at a different wall-clock time.

Expected behavior:

- Preserve the ID and established page path (including the original English slug) exactly.
- Keep one YAML frontmatter block and update `references` in place.
- Report the established Title and Path for manual Wiki editing, without silently moving the page.
- If the PM explicitly approves a move to a different parent, preserve `id`, update `wiki_path` to the approved location and surface link reconciliation.

## Fail if

- The Agent uses a Gregorian date, its host/browser's local timezone instead of Iran time, Persian digits, missing padding, or 12-digit seconds for the ten-digit ID.
- Two new PRDs are automatically assigned the same ID based on a known collision without acknowledging or resolving the conflict before publication.
- The Agent demands external registry/Issue allocation or refuses a trustworthy PM-provided date/time.
- `wiki_path` contains a URL, just a parent, whitespace, a `.md` suffix, a duplicated ID timestamp, or a Persian title transliteration.
- There are two consecutive `--- ... ---` frontmatter blocks.
- A materially related but non-owning area is selected as primary merely because it appears in `references`.
- The Agent asserts a proposed Wiki folder exists without verifying it.
- A Wiki-bound PRD is delivered without explicit separate Title **and** complete Path, even if `wiki_path` is in frontmatter.
- Reconciliation changes a stable ID or published Wiki path without appropriate identity migration or page-move approval.

## Suggested evaluation

Use deterministic string/structure checks for timestamp formatting, ID/path prefix/leaf consistency, single YAML frontmatter and presence of external handoff fields; semantic review for primary ownership, unresolved paths and source/verification boundaries.
