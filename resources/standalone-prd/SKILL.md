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

## Rules

- Build the strongest useful PRD supported by the available context.
- Do not invent current-product facts, Product decisions, Business Outcomes, metrics, eligibility, permissions, business rules, lifecycle behavior, or dependencies merely to fill the template.
- Separate known information from assumptions and unresolved Product decisions.
- Ask only materially necessary clarification questions when the PRD cannot be useful without the answer.
- Do not turn the PRD into a Design Spec or Technical Plan.
- Omit optional sections when they have no meaningful content.
- Follow the semantic guidance in `authoring-guide.md`.
- Use `prd-template.md` as the output structure, adapting or omitting optional sections as appropriate.

## Output

Return a complete PRD draft in Markdown.

If material current-product context is unavailable, state that limitation in the PRD only when downstream readers need to know it, and keep affected claims unresolved rather than fabricating them.
