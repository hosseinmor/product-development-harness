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

1. Produce the strongest useful draft supported by the available context before asking for clarification whenever possible.
2. Separate established Product intent from hypotheses, recommendations, assumptions, and unresolved decisions.
3. Do not invent current-product facts, Product decisions, User or Business Outcomes, metrics, eligibility, permissions, business rules, lifecycle behavior, or dependencies merely to make the PRD look complete.
4. Ask only the smallest set of materially necessary Product questions when the draft cannot be useful without the answer.
5. Do not turn the PRD into a Design Spec or Technical Plan.
6. Omit optional sections when they have no meaningful content.
7. Follow the semantic guidance in `authoring-guide.md`.
8. Use `prd-template.md` as the default output structure, adapting or omitting optional sections as appropriate.

## Missing context

- If Current Behavior is unknown and materially needed, say it requires verification rather than inventing a plausible baseline.
- If User Outcome or Business Outcome is not established, do not derive a benefit merely from the requested feature. Keep the missing outcome explicit or ask for it only when materially needed.
- Do not convert missing current-product facts into Product decisions.
- Acceptance Criteria may be derived only from established Product intent or logically necessary consequences of it.

## Output

For Job Vision PRDs, write in Persian by default unless the user asks for another language. Preserve canonical Product or technical terms when translation would reduce precision.

Return the strongest supported PRD draft in Markdown.

Do not force semantic completeness when authority or context is missing. A shorter grounded PRD is better than a complete-looking PRD containing invented Product truth.
