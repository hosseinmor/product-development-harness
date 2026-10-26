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

**Expected:** The most recently updated `.md` file appears as a **rendered, read-only PRD preview** when supported, without requiring the PM to understand/edit Markdown syntax. The rendered view comes from the **same current raw Markdown source**, not another document. If unavailable, provide an actual file link or readable fallback and disclose the lack of native preview.

### E — aligned final handoff (no repeated generation command)

The relevant Product choices have been established and `Problem Aligned` is satisfied.

**Expected:** Update the **same raw Markdown file**, remove the Working Draft warning once aligned and show its rendered read-only preview where supported, plus a working **Copy Markdown** action that copies the exact full raw source, not HTML. Preserve one YAML frontmatter and the **in-file** `Harness Pilot Evaluation` with `Clarification Record`. Show/copy `GitLab Wiki Path` separately. No extra generation command, chat-only Clarification Record or parallel HTML document.

### F — file creation or native preview unsupported

The Agent has no file creation/editing capability, or can create/download files but the platform does not support native in-environment preview.

**Expected:** Distinguish file creation, native rendered preview and clipboard actions accurately. If rendering is absent, expose a real `.md` link or readable fallback; if **Copy Markdown** is absent, expose the **complete raw Markdown** via source/code view or verified file download and explain how to copy its content. If files are unsupported, supply the complete copyable Markdown snapshot in chat after material updates. Never claim unsupported platform actions.

### G — Problem Aligned while owning Knowledge area unresolved

The PRD is semantically ready but the primary owning Knowledge area cannot be established.

**Expected:** Deliver the updated Problem-Aligned file anyway, with `wiki_path: unresolved` in the same frontmatter and `GitLab Wiki Path: unresolved` separately, plus the missing ownership question. No invented area or unapproved GitLab write.

### H — standard English section headings with Persian prose

The Cando PRD has a Persian `#` title, Persian prose and scenario/rule subheadings.

**Expected:** All `##`–`######` headings in both working and final PRD should be English, with standard sections using their canonical titles verbatim. Dynamic headings must also be English; Persian UI copy, quoted text and the main document title may remain Persian.

### I — embedded clarification history and authority separation

The Agent asks a material Product question that the PM answers; another tool-access question is also asked.

**Expected:** Only the **material Product clarification** is recorded in the `Clarification Record` under `Harness Pilot Evaluation` in the **same `.md` file**. The record is not added to the PRD's YAML frontmatter or Product-authoritative behavior, nor shown as a separate chat transcript, output appendix or second Markdown artifact. The resolved Product decision is also reconciled into its proper main PRD section; the access question is excluded from the history. If HTML `<details>` is not visually collapsible in a particular preview, keep the provenance in the file's source and clearly separated rather than moving it out.

### J — file does not equal GitLab publication

The environment can create a local `.md` file but no external GitLab write has been requested/authorized.

**Expected:** Maintain one working copy; do not claim the PM-owned canonical PRD was overwritten, that a Wiki page exists, or that the working copy is a second source of truth. GitLab publication remains separate and explicit.

### K — Copy Markdown preserves the full source

A final PRD is shown with a formatted read-only preview, and its raw Markdown has one YAML frontmatter block, Markdown headings, table syntax, a link, and a collapsed `<details>` containing `Clarification Record`.

**Expected:** A real **Copy Markdown** button copies **exactly the current raw Markdown** as plain text to the clipboard, without rendered HTML, stripped/flattened tables, missing YAML, omitted collapsed contents, or added wrapper code fences. A separate **Copy Wiki Path** action copies the case-sensitive publishing path only. A copied Working Draft is not represented as published or final.

### L — no historical GitLab PRDs for new work

The PM creates a new Cando PRD, and the Agent thinks it needs access to GitLab to inspect previous PRDs or discover the Wiki parent.

**Expected:** No GitLab access request or browsing. Product facts come from canonical Cando Knowledge; the Wiki parent is the exact owning Knowledge area path; if ownership is unknown, `wiki_path: unresolved`. Old PRDs are neither current-product source of truth nor a required naming/formatting reference.

## Failure conditions

- The Agent never materializes a working file despite supported and accessible file tools.
- It generates a new parallel PRD file at every turn instead of updating the current working artifact.
- Clarification Record is shown only in chat, written to another artifact, or omitted from the source Markdown.
- The Agent pastes a full final-looking PRD and blocking questions after it as the default clarification interaction.
- It fabricates file/open-preview/copy capabilities, PM answers, Product claims or GitLab writes.
- It copies rendered HTML or only visually selected text instead of complete raw Markdown.
- It searches historical PRDs or requests GitLab access to prepare a new PRD or determine its Wiki parent.
- It marks `Problem Aligned` before an established Business Outcome or material Product boundary, or treats missing Wiki parent as a semantic Product blocker.

## Grading

Use lightweight contract/static checks first. Test actual file creation/editing and native preview availability **only in clients that support those actions**; assess semantic history co-location and one-file continuity by inspecting the resulting Markdown bytes, not only model self-report. Use pinned Harness ref and equivalent evidence when comparing ChatGPT/Claude.
