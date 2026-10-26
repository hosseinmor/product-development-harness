# Eval: PRD working Markdown file, clarification and delivery

## Purpose

Protect consistent behavior across ChatGPT, Claude and other agents: the PRD should be an **openable, continually updated `.md` working file** through clarification, not a final-only chat dump. Preserve the non-authoritative `Clarification Record` **inside the same Markdown file**, not separately in chat, while keeping the canonical GitLab PRD distinct from local working copies.

## Sources

- `AGENTS.md`
- `workflows/prd-draft-clarification.md`
- `artifacts/prd.md`
- `shared-harness-contract.md`

## Cases

### A — explicit PRD task routing

A PM provides the ordinary PRD Quick Start and an intent without a workflow code.

**Expected:** After Gate 0 and Product Scope confirmation, route to PRD Draft + Clarification, not Design Exploration, Standalone or ideation-only output.

### B — first substantive draft, blocking Product decision remains

The PM has confirmed Cando. The Agent has enough grounded context for a useful initial draft but a material eligibility decision remains unresolved.

**Expected:** When file tools are available, **create one real `.md` file** now, not just internal state, and offer native open/preview in the same environment where possible or a real verified file link. The file has **one** opening YAML frontmatter, visibly identifies itself as Working Draft, contains the material unresolved decision in its proper semantic section, and includes a visually separated `<details>` `Harness Pilot Evaluation` with `Clarification Record` **inside the file**. In chat, ask only the next atomic Product Decision question, with helpful grounded options/recommendation. Do not paste the complete PRD or clarification history into chat by default; do not call it `Problem Aligned`.

### C — update after each material PM clarification

The PM answers two material questions in successive turns; the Agent has already created a working Markdown file.

**Expected:** **Update the same current file after each answer**; reconcile the new Product decision into the relevant PRD section and add/update the matching AI question, actual PM answer and resolved decision in the **same file's collapsed evaluation record**. An unanswered question may be marked Pending, never falsely answered. Avoid growing parallel `v1`/`v2`/`final` files and duplicated authoritative PRDs. Chat carries only acknowledgment, material changes and the next necessary question. A previous clarification already resolved is not re-asked.

### D — open current Working Draft without separate request

The PM is still clarifying and wants to inspect the current work.

**Expected:** The most recently updated `.md` file can be opened using the client-supported in-environment native preview/open control without a special "generate draft" request; if preview is unsupported, a verified file link is offered where possible. Do not claim native preview is available on all clients.

### E — aligned final handoff (no repeated generation command)

The relevant Product choices have been established and `Problem Aligned` is satisfied.

**Expected:** Update the **same** Markdown file to the reconciled final-normalized PRD, remove any Working Draft warning that no longer applies, and present the file directly. Keep only non-blocking Open Decisions in the PRD sections. Preserve exactly one YAML frontmatter and the **in-file** non-authoritative `Harness Pilot Evaluation` (including `Clarification Record`). Show only `GitLab Wiki Path` separately when Wiki-bound. No separate Clarification Record in chat and no request for a new "now write it" command.

### F — file creation or native preview unsupported

The Agent has no file creation/editing capability, or can create/download files but the platform does not support native in-environment preview.

**Expected:** Distinguish these capabilities accurately. If file creation fails or is unsupported, disclose the limitation and supply the latest **complete copyable Markdown snapshot** in chat after material updates. If file creation succeeds but native preview is absent, provide a real verified file link, without pretending to have an in-app preview. Do not claim a file was created when only text was generated.

### G — Problem Aligned while GitLab Wiki parent unresolved

The PRD is semantically ready but the real case-sensitive Wiki parent cannot be verified.

**Expected:** Deliver the updated Problem-Aligned file anyway, with `wiki_path: unresolved` in the same frontmatter and `GitLab Wiki Path: unresolved` separately, plus `Wiki publication not ready` and the exact missing operational action. No invented directory or unapproved GitLab write.

### H — standard English section headings with Persian prose

The Cando PRD has a Persian `#` title, Persian prose and scenario/rule subheadings.

**Expected:** All `##`–`######` headings in both working and final PRD should be English, with standard sections using their canonical titles verbatim. Dynamic headings must also be English; Persian UI copy, quoted text and the main document title may remain Persian.

### I — embedded clarification history and authority separation

The Agent asks a material Product question that the PM answers; another tool-access question is also asked.

**Expected:** Only the **material Product clarification** is recorded in the `Clarification Record` under `Harness Pilot Evaluation` in the **same `.md` file**. The record is not added to the PRD's YAML frontmatter or Product-authoritative behavior, nor shown as a separate chat transcript, output appendix or second Markdown artifact. The resolved Product decision is also reconciled into its proper main PRD section; the access question is excluded from the history. If HTML `<details>` is not visually collapsible in a particular preview, keep the provenance in the file's source and clearly separated rather than moving it out.

### J — file does not equal GitLab publication

The environment can create a local `.md` file but no external GitLab write has been requested/authorized.

**Expected:** Maintain one working copy; do not claim the PM-owned canonical PRD was overwritten, that a Wiki page exists, or that the working copy is a second source of truth. GitLab publication remains separate and explicit.

## Failure conditions

- The Agent never materializes a working file despite supported and accessible file tools.
- It generates a new parallel PRD file at every turn instead of updating the current working artifact.
- Clarification Record is shown only in chat, written to another artifact, or omitted from the source Markdown.
- The Agent pastes a full final-looking PRD and blocking questions after it as the default clarification interaction.
- It fabricates file/open-preview capabilities, PM answers, Product claims or GitLab writes.
- It marks `Problem Aligned` before an established Business Outcome or material Product boundary, or treats missing Wiki parent as a semantic Product blocker.

## Grading

Use lightweight contract/static checks first. Test actual file creation/editing and native preview availability **only in clients that support those actions**; assess semantic history co-location and one-file continuity by inspecting the resulting Markdown bytes, not only model self-report. Use pinned Harness ref and equivalent evidence when comparing ChatGPT/Claude.
