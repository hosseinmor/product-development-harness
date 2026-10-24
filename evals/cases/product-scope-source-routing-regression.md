# Eval: Product-scoped Product Knowledge routing

## Purpose

Verify that Product Knowledge authority is scoped to the product that owns the claim, especially when JobVision and Cando participate in the same workflow or integration.

This regression originated from a PM pilot in which a Cando task risked treating JobVision canonical Product Knowledge as if it established Cando-internal behavior. Cando now has its own canonical Product Knowledge source, so the regression protects product-scoped routing in both directions.

## Eval type

Regression

## Harness sources

Use the repository Harness, especially:

- `AGENTS.md`
- `shared-harness-contract.md`
- `workflows/prd-draft-clarification.md`

## Current source state for this regression

- JobVision canonical Product Knowledge: `https://docs-jv.jvoffice.ir/`.
- Cando canonical Product Knowledge: `https://docs-cd.jvoffice.ir/`.
- Internal canonical sources are used only through an execution path whose access has been verified in the current environment.
- The `design-language` repository owns reusable Design Language and Content guidance; it is not a fallback store for product behavior.

## Scenario A — resolved Cando scope

A PM asks for a Cando capability that changes the internal `Reject with reason` experience. Cando is integrated with JobVision and JobVision canonical Product Knowledge documents relevant application-status, rejection-reason, feedback, notification, and ATS-bridge behavior.

The Agent can therefore retrieve authoritative JobVision-side facts, such as facts about JobVision application state, rejection reasons, or documented integration behavior. However, the JobVision source does not establish Cando-internal details such as:

- which notification controls exist inside Cando's rejection flow;
- Cando permissions for editing or persisting rejection defaults;
- Cando-specific persistence or lifecycle semantics;
- Cando UI or configuration behavior;
- which Cando fields are grouped as one notification configuration.

Relevant reviewed evidence, direct observation, implementation evidence, or explicit owner input may still exist for some details, especially when canonical documentation is insufficient, inaccessible, or in conflict with evidence.

## Scenario B — ambiguous product scope before retrieval

A PM says:

> We want to add geographic auto-reject by city/province to job auto-reject settings in the ATS.

The current task context does not otherwise establish whether the named ATS belongs to JobVision, Cando, or a cross-product flow. The Agent has not yet retrieved product-specific canonical Product Knowledge.

Expected routing behavior:

- If authoritative context already available in the task establishes which product owns this ATS surface, use that context and route directly without asking the PM to repeat it.
- Otherwise, do not infer product ownership from generic terms such as `ATS`, `job`, `candidate`, or `reject` alone.
- Ask one minimal operational clarification identifying the owning product before canonical Product Knowledge retrieval or substantive PRD drafting.
- Do not record that routing question as a Product Decision clarification merely because it occurred before drafting.

## Scenario C — browser-tab-assisted canonical retrieval

Assume product scope has been resolved to Cando and the execution environment can read user-shared/local browser tabs.

- If a readable relevant `docs-cd` tab is already open, reuse it.
- If no relevant canonical tab is readable and canonical context is materially needed, ask the user to open one `docs-cd` tab.
- Make the request actionable: name the exact owning source URL (`https://docs-cd.jvoffice.ir/`) and ask the user to open it in the supported local/shared browser. Do not merely announce that no tab is open.
- After the tab becomes readable, resume task-scoped canonical retrieval rather than treating the missing-tab finding as a final result.
- If browser-tab reading itself is unavailable, or browser/VPN/authentication/policy access fails independently of the tab being closed, report the actual blocker instead of promising that opening a tab would fix it.
- Retrieve the smallest relevant context first.
- Do not ask the user to open JobVision Product Knowledge, live ATS, implementation, or other tabs pre-emptively.
- Request another tab/source only if a materially necessary question remains unresolved after the current source is used.
- If the first `docs-cd` page points to a different canonical page required to resolve a material fact, try direct navigation/retrieval only if supported. Otherwise ask the user to open that **specific next page**, providing its verified URL when known or its known title plus navigation path when a verified deep link is unavailable. Resume retrieval when it becomes readable; never invent a URL or just report `another page is missing`.
- Do not request the next page if the existing canonical page already answers the task, or ask for multiple pages before they are needed.

## Expected invariants

- The Agent resolves product scope before product-specific canonical retrieval or substantive PRD drafting.
- The Agent first determines that Scenario A is Cando-scoped or cross-product rather than assuming the presence of JobVision documentation makes the whole task JobVision-scoped.
- In Scenario B, the Agent uses already-available authoritative routing context when it establishes ownership; otherwise it asks one minimal product-scope routing question rather than guessing.
- The Scenario B routing question is treated as operational source resolution, not as a Product Decision clarification.
- In Scenario C, the Agent reuses an already-open relevant canonical tab when possible and otherwise asks for one canonical tab before requesting additional browser sources.
- If an additional canonical page is materially needed, the Agent retrieves it directly when possible or asks the user to open the identifiable next page in read-only-tab environments.
- JobVision canonical Product Knowledge is used only for JobVision-side current behavior and documented integration-boundary facts.
- JobVision Product Knowledge is not cited as canonical authority for Cando-internal behavior.
- Cando canonical Product Knowledge is retrieved from `docs-cd.jvoffice.ir` for Cando-owned current-product claims when access is available.
- The Agent may retrieve explicit owner input, approved decisions, reviewed walkthrough evidence, direct observation, or implementation evidence when canonical documentation is insufficient, inaccessible, or inconsistent.
- Those inputs retain their actual authority class and are not silently promoted to canonical Product Knowledge.
- If a material Cando fact remains unsupported after reasonable retrieval, the Agent preserves it as Unknown or Unresolved rather than inventing it or borrowing JobVision semantics.
- An access limitation to Cando Product Knowledge does not force immediate clarification if other evidence can still support a bounded useful draft, but that evidence does not become canonical truth.
- Clarification is asked only after retrieval/derivation and only when the remaining Product-owned uncertainty is blocking under the Harness rules.
- Cross-product claims are partitioned by product so one source may be authoritative for one claim and non-authoritative for another claim in the same PRD.

## Explicit failure conditions

Fail if any of the following is true:

- The Agent calls `docs-jv.jvoffice.ir` the canonical source for Cando current-product behavior or calls `docs-cd.jvoffice.ir` the canonical source for JobVision current-product behavior.
- A JobVision-side fact about rejection, feedback, notification, or ATS integration is generalized into an unsupported Cando-internal rule.
- The Agent treats the `design-language` repository, Figma, screenshots, observed UI, implementation, or model knowledge as fallback canonical Cando Product Knowledge.
- The Agent hides a material access limitation to the owning product's canonical Product Knowledge.
- The Agent asks the PM to restate a Cando current-behavior fact before checking `docs-cd` when access is available, or before checking relevant available evidence when canonical access is unavailable or insufficient.
- The Agent refuses all useful drafting solely because Cando canonical Product Knowledge is temporarily inaccessible, even though explicit owner input or reviewed evidence can support a bounded best-effort draft.
- The Agent marks an unsupported Cando behavior as Known merely because an analogous behavior is documented for JobVision.
- The Agent chooses `docs-jv` or `docs-cd` in Scenario B without authoritative context establishing the product.
- The Agent starts substantive PRD drafting in Scenario B while product ownership is still ambiguous enough that canonical-source selection would be a guess.
- The Agent treats the Scenario B scope-routing question as a material Product clarification in the PRD/Evaluation clarification record.
- In Scenario C, the Agent asks the user to open multiple tabs/sources up front when one canonical Product Knowledge tab is sufficient to begin task-scoped retrieval.
- In Scenario C, relevant canonical context is needed, the browser can read user-shared/local tabs, and no relevant canonical tab is open, but the Agent only reports `no tab is open` / `Product Knowledge unavailable` without an actionable request to open the resolved product's canonical URL.
- In Scenario C, the Agent asks the user to open a tab as if that fixes access when the environment actually lacks tab-reading capabilities or a separate browser/VPN/authentication/policy block prevents reading it.
- In Scenario C, the Agent discovers that a different canonical page is materially needed and cannot navigate to it, but only reports unavailable/missing context instead of asking the user to open the specific required page.
- In Scenario C, the Agent invents a deep link for a needed page or asks the user to open several unneeded follow-up pages pre-emptively.

## Recommended grading approach

LLM judge.

Grade claim-level source attribution, scope resolution, and retrieval efficiency, not exact wording. The regression passes when product ownership is resolved before source selection, ambiguity triggers only the minimum routing clarification, JobVision canonical truth remains authoritative only inside JobVision, Cando canonical truth remains authoritative only inside Cando, browser-assisted access starts from the smallest sufficient canonical tab/context, non-canonical evidence keeps its actual authority class, unsupported behavior remains visibly uncertain, and Product clarification follows the normal retrieval-first/materiality rules after scope resolution.
