---
name: standalone-prd-authoring
description: Create a structured Product Requirements Document from user-provided intent and context when the full Job Vision Product Development Harness is not being used.
---

# Standalone PRD Authoring

Use this Skill only for standalone PRD drafting.

This Skill is not the Job Vision Product Development Harness and must not claim Harness readiness states such as `Problem Aligned`.

## Required resources

Read:
1. `authoring-guide.md`
2. `prd-template.md`

## Inputs

Use the Product Intent and any files, notes, research, screenshots, existing PRDs, or other context supplied by the user.

Treat a clear user statement that establishes a Product choice as decided Product intent. Do not promote examples, questions, tentative suggestions, hypotheses, or UI preferences into Product decisions unless the user clearly establishes them as constraints.

## Working method

1. Start a new PRD with `id: unresolved` only while a trustworthy timestamp is unavailable; otherwise generate `JV-PRD-YYMMDDHHmm` or `CND-PRD-YYMMDDHHmm` from the **Jalali date and 24-hour Asia/Tehran clock**, using ten ASCII digits and leading zeroes. The PM can supply this date/time for fully manual fallback; do not make up minute precision or calculate a next sequential number. Once an ID exists, preserve it unless an explicit identity migration is established.
2. Produce the strongest useful draft supported by the available context before asking for clarification whenever possible.
3. Separate established Product intent from hypotheses, recommendations, assumptions, and unresolved decisions.
4. Do not invent current-product facts, Product decisions, User or Business Outcomes, metrics, eligibility, permissions, business rules, lifecycle behavior, Product relationships, or Product Knowledge references merely to make the PRD look complete.
5. For the PRD, write all Markdown section/subsection headings (`##`–`######`) in **English**, using the template's canonical headings exactly; keep Persian body prose and allow a Persian `#` document title. Do not translate section headings to Persian.
6. When a materially useful canonical Product Knowledge page is known, record it only in frontmatter `references` as `source + page`, where `page` is an exact plain source-native page name/slug such as `entity-candidate` when verified; never use URLs, Markdown links or reconstructed breadcrumb labels. Do not add a body `Dependencies` section.
7. Ask only the smallest set of materially necessary Product questions when the draft cannot be useful without the answer.
8. Do not turn the PRD into a Design Spec or Technical Plan.
9. Omit optional sections when they have no meaningful content.
10. Follow the semantic guidance in `authoring-guide.md`.
11. Use `prd-template.md` as the default output structure, adapting or omitting optional sections as appropriate.
12. For GitLab Wiki publication, establish the primary owning product area from canonical Product Knowledge and consult `../prd-knowledge-areas.yml` only for Knowledge navigation. Use the exact relative owning Knowledge area path as the Wiki parent, without a second mapping or GitLab verification. Do **not** browse historical PRDs, request GitLab access, or inspect Wiki navigation to deduce it. If the owning area is unknown, use `wiki_path: unresolved` and show `GitLab Wiki Path: unresolved` until Knowledge or PM input establishes it. Include full `wiki_path` in **one** YAML frontmatter block and reuse existing ID/path when editing an explicitly supplied existing PRD. Historical PRDs never substitute for canonical Product Knowledge. The heading supplies the human-readable page title; do not emit `GitLab Wiki Title`. Disable Generate page path from title when publishing.

## Missing context

- If Current Behavior is unknown and materially needed, say it requires verification rather than inventing a plausible baseline.
- If User Outcome is not established, do not derive a benefit merely from the requested feature; keep the uncertainty explicit and clarify it when materially needed.
- If Business Outcome is not established, do not invent business value. When there is a defensible basis, offer a small number of non-authoritative candidates, recommend one briefly when useful, and ask the responsible Product human to confirm, refine, or reject the proposal before treating the PRD as ready for downstream handoff. This standalone Skill must not translate that rule into a Harness readiness claim such as `Problem Aligned`.
- Do not convert missing current-product facts into Product decisions.
- Acceptance Criteria may be derived only from established Product intent or logically necessary consequences of it.

## Output

For Job Vision PRDs, write in Persian by default unless the user asks for another language. Preserve canonical Product or technical terms when translation would reduce precision.

Return the strongest supported PRD draft in Markdown.

Do not force semantic completeness when authority or context is missing. A shorter grounded PRD is better than a complete-looking PRD containing invented Product truth.
