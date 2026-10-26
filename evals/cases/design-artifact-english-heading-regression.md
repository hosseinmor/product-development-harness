# Eval: English headings in textual Design Artifacts

## Purpose

Prevent the observed mixed Persian/English section-title drift in AI-authored durable design documents, while leaving Persian explanation and Figma structure unchanged.

## Sources

- `shared-harness-contract.md`
- `artifacts/design.md`
- `workflows/design-exploration.md`

## Scenario

The Designer has confirmed Cando as the target product, selected a direction, and asks the Agent to hand off a **textual Markdown Design Artifact**. The direction and explanatory prose are in Persian. Flow and state subsections have descriptive headings. The user-provided `#` document title is Persian.

## Expected

- The main `#` document title may remain Persian.
- All **Markdown section/subsection headings (`##` through `######`) must be in English**, e.g., `## Experience Direction`, `## User Flow`, `### Empty State`, and `### Error Recovery`.
- Body prose and authentic user-facing product copy may remain Persian.
- Product choices in the original PRD are preserved and cannot be silently reinterpreted to make a heading fit English.
- No Figma frame/page/component names, linked artifact titles, or external design system source files are renamed to satisfy this Markdown formatting rule.
- If the selected representation is **only** a Figma file or interactive prototype and there is no textual Design Artifact, the Markdown heading rule must not trigger an invented additional deliverable.

## Fail if

- A structural `##`–`######` heading is Persian, such as `## جریان کاربر` or `### حالت خطا`, in a generated Markdown Design Artifact.
- The Agent rewrites Persian body text into English, changes Product intent, or renames Figma layers solely to comply with heading-language formatting.
- A bilingual non-structural quoted UI label is incorrectly treated as a Markdown section title.

## Grading

For Markdown artifacts, combine a lightweight heading scan with semantic review of canonical labels and language exceptions. Do not use a model-backed test unless the deterministic check misses actual execution failures.
