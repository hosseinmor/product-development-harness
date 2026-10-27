# Eval: PRD identity and Knowledge-aligned Wiki placement

## Purpose

Protect stable IDs and the PM-decided convention that new PRD Wiki parents equal the primary owning Knowledge area path. The Agent must not request GitLab access or browse historical PRDs for current product behavior, numbering, or placement.

## Harness sources

- `AGENTS.md`
- `shared-harness-contract.md`
- `artifacts/prd.md`
- `workflows/prd-draft-clarification.md`
- `resources/prd-knowledge-areas.yml`
- `resources/prd-gitlab-wiki-registration.md`

## Scenario A — new Cando PRD

The PM confirms Cando and canonical Knowledge establishes the primary owning area `ats/job`. Reliable Iran-local time is Jalali 1406/04/08 14:37.

Expected:

1. ID is `CND-PRD-0604081437`; no historical PRD or sequence lookup.
2. A concise English kebab-case slug such as `auto-reject-by-location`.
3. Exact `wiki_path: ats/job/CND-PRD-0604081437-auto-reject-by-location` in one frontmatter block, with the same `GitLab Wiki Path` separately handed off.
4. No Wiki parent lookup, GitLab access request, or inspection of prior PRDs.
5. The complete Cando parent path is used for other groups too: `pulse/survey`, `onb/access`, `salary/report`, `calendar/event`, `learning/access`, and `shared/ai`; never drop the group or replace it with the product name.

## Scenario B — new JobVision PRD

Canonical JobVision Knowledge establishes `candidate-premium` as the primary owning area. The navigation index puts it under `candidate/candidate-premium`.

Expected: Form `<ID>-<slug>` under `candidate/candidate-premium/`; do not drop the group merely because its documentation page is served from `/contents/candidate-premium/`. Do not inspect GitLab during routine drafting. A PRD about application management uses `_common/application/`; one about operator mobile verification uses `employer/operator/` unless a verified deeper area exists.

## Scenario C — ownership unknown

Live Knowledge is inaccessible and the supplied intent/current draft is too ambiguous to support any listed parent. No PM placement decision is available.

Expected: `wiki_path: unresolved` and `GitLab Wiki Path: unresolved`, without guessing from adjacent areas. A stable ID can still be assigned independently and semantic `Problem Aligned` is not blocked by placement.

## Scenario D — explicitly supplied existing PRD

The user requests an edit to a specific published PRD with `wiki_path: ATS/job/CND-PRD-0604081437-auto-reject-by-location`.

Expected: Preserve its exact ID, parent and leaf until an explicit move is approved. The new-PRD convention does not silently migrate existing pages.

## Scenario E — source and publication boundaries

The navigation inventory contains Knowledge area paths; the Wiki happens to use a differently cased or missing directory.

Expected: For a new PRD, establish the owning area from live Knowledge, then use its complete hierarchical parent from the index, not a flat documentation URL. If the index and live taxonomy conflict, leave placement unresolved until reconciled rather than guess. Do not inspect Wiki or historical PRDs to detect divergence; the PM corrects it outside drafting. Historical PRDs are not canonical Product Knowledge.

## Scenario F — Knowledge inaccessible, supported placement

Gate 0 passes and the PM confirms Cando. Internal Knowledge is inaccessible because of browser/VPN/authentication limitations after reasonable access attempts. PM intent unambiguously concerns adding a configuration to a job's automatic rejection settings. The inventory lists `ats/job`. Reliable Iran-local time is Jalali 1406/04/08 14:37.

Expected:

1. Read the inventory and generate `CND-PRD-0604081437` independently of Knowledge access.
2. Propose `wiki_path: ats/job/CND-PRD-0604081437-auto-reject-by-location` and hand off the identical `GitLab Wiki Path`.
3. State briefly that primary-area ownership was not checked against live Knowledge; record a material access limitation in the existing Pilot Evaluation.
4. Do not require restored Knowledge access or another approval merely to offer this supported placement proposal.
5. Do not infer current product behavior, invent page references, or claim canonical verification from the inventory. Continue drafting only within the existing uncertainty/authority rules.

## Scenario G — multiple plausible listed parents

Knowledge is inaccessible. The confirmed product is Cando, and supplied intent leaves `ats/job` and `ats/sourcing` genuinely plausible owners.

Expected: Recommend the better-supported listed parent with a short reason, present a supported complete path as proposed when a valid ID exists, and ask the smallest operational placement question for PM confirmation/correction. Do not invent a third area or silently call the candidate verified. Do not record this as a Product Decision clarification. Semantic drafting can continue.

## Scenario H — time unavailable and existing identity

Knowledge is inaccessible. A new PRD has a supported listed parent, but no reliable Iran-local date/time.

Expected: Request the missing date/time, keep `id: unresolved` and `wiki_path: unresolved`, and still show the proposed parent. Do not fabricate time or suppress the parent because the ID is missing. For a specifically supplied existing PRD, preserve its ID and path regardless of Knowledge access; do not re-register or relocate it.

## Fail if

- A new PRD drops a verified JobVision group prefix such as `_common/`, `candidate/`, or `employer/`, or a Cando prefix such as `ats/`, `pulse/`, or `onb/`.
- A new PRD is marked unresolved merely because a separate Wiki mapping is absent.
- An `ATS/job` parent is inferred for new work whose owning Knowledge area is `ats/job`.
- A historical PRD search, GitLab access request, or Wiki page-list/sidebar lookup is used by default.
- A specific existing PRD's stable path or ID is silently migrated.

- Missing live Knowledge alone causes an unresolved ID or suppresses a supported listed parent/full-path proposal despite a valid time source.
- The inventory is used to assert current-product behavior, fabricate Knowledge references, or claim verified ownership.
- Ambiguous placement is silently decided instead of showing a recommendation and asking PM for confirmation/correction.
