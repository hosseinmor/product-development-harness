# Eval: PRD clarification and delivery medium consistency

## Purpose

Protect observed workflow inconsistency: one agent creates a downloadable file, another pastes a final-looking PRD with questions underneath, and a third misses the PRD task entirely. Compare behavioral decisions and artifact semantics, not presentation widgets.

## Sources

- `AGENTS.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`
- `shared-harness-contract.md`

## Cases

### A — explicit PRD request routes unambiguously

The quick start says "برای درخواست زیر ... یک PRD تهیه کن" and supplies a normal feature intent, with no workflow code.

**Expected:** Following successful Harness access and Product Scope confirmation, route to **PRD Draft + Clarification**, not generic Product Research, Design Exploration, Standalone PRD or a speculative ideation-only response.

### B — blocking Product decision remains

The working draft is grounded but one material Product-owned eligibility decision is still unresolved and blocks `Problem Aligned`.

**Expected:** Retain the working draft internally and ask the next atomic Product clarification as a conversational turn, preferably with grounded alternatives/recommendation. **Do not** deliver a full allegedly final PRD followed by a trailing questionnaire. Default to one atomic question per turn, reassess after the answer, and do not demand irrelevant decisions. No downloadable file or Wiki write.

### C — human requests the working draft early

During clarification, the PM explicitly asks: "پیش‌نویس فعلی را نشان بده."

**Expected:** Show the best current draft clearly labeled **Working Draft**, with uncertainty in appropriate semantic sections, no `Problem Aligned` claim, and no premature final-handoff assertion.

### D — readiness reached, no second generation command

After material decisions have been established and reconciled, `Problem Aligned` is satisfied and the metadata for publication can be constructed.

**Expected:** Automatically deliver **one complete copyable Markdown PRD** in the conversation with one YAML frontmatter block. Display only the complete `GitLab Wiki Path` separately, outside the PRD payload (use the PRD heading as the page title), and append the pilot evaluation record as non-authoritative according to the artifact contract. Do not append unasked Product clarification questions. Non-blocking Product Open Decisions remain within the document. Do not require the human to say "حالا PRD را بنویس".

### E — file generation is explicitly requested or unsupported

The user explicitly asks for a downloadable `.md` file. Another run does not request a file but the Agent has file-creation tools.

**Expected:** In the first run create the file if supported and authorized (and link it only if actually created); if not supported, disclose that limitation and give Markdown. In the second run, give Markdown only; tool availability is not an instruction to create a download. Never claim GitLab Wiki publication without a confirmed write.

### F — no redundant product or Harness intake questions

After Gate 0 passed and the PM explicitly confirmed the suggested product, the agent gets an updated Business Outcome decision in a subsequent turn.

**Expected:** Reconcile that Product decision without re-running the product confirmation or reopening the Harness access discussion within the same task. Do not confuse operational source-access requests with Product clarification.

## Failure conditions

- A final PRD with blocking questions appended is used as the default clarification response.
- One Agent creates an unsolicited downloadable file or writes to GitHub/GitLab while another returns Markdown for the same request.
- A model refuses to start PRD creation because "Product Task" seems generic despite an explicit PRD request.
- A known blocking Product uncertainty is silently promoted into authoritative product requirements to force finalization.
- The model claims `Problem Aligned` before an established Business Outcome or other material Product decision.
- The model requires another "generate final PRD" command after readiness is already satisfied.

## Grading

Use low-cost contract/static checks first. For cross-model trials pin the same Harness version and intent/context, record stage transitions and the medium of the produced artifact, and assess decisions rather than prose wording.
