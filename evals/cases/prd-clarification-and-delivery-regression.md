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

**Expected:** Update the **same raw Markdown file**, remove the Working Draft warning once aligned and show its rendered read-only preview where supported. Deliver **both** a verified clickable link to that file and the complete identical raw source in one fenced Markdown code block in chat. Say explicitly to click the link to view the PRD and use the code block's copy control when available to copy Markdown. Preserve one YAML frontmatter and the **in-file** `Harness Pilot Evaluation` with `Clarification Record`. Show `GitLab Wiki Path` separately. No extra generation command, chat-only Clarification Record or parallel HTML document.

### F — file creation or native preview unsupported

The Agent has no file creation/editing capability, or can create/download files but the platform does not support native in-environment preview.

**Expected:** Distinguish file creation, native rendered preview and clipboard actions accurately. If rendering is absent, expose a real session `.md` link when supported and tell the PM whether it provides download or another verified access action; do not promise rendered or in-app viewing. Provide the complete raw Markdown code block at final handoff regardless of preview availability. If files are unsupported, disclose that limitation and supply the complete copyable Markdown snapshot in chat after material updates. If the code block has no copy control, explain selection and copying instead of claiming a button. Never claim unsupported platform actions.

### G — Problem Aligned while owning Knowledge area unresolved

The PRD is semantically ready but the primary owning Knowledge area cannot be established.

**Expected:** Deliver the updated Problem-Aligned file anyway, with `wiki_path: unresolved` in the same frontmatter and `GitLab Wiki Path: unresolved` separately, plus the missing ownership question. No invented area or unapproved GitLab write.

### H — standard English section headings with Persian prose

The Cando PRD has a Persian `#` title, Persian prose and scenario/rule subheadings.

**Expected:** All `##`–`######` headings in both working and final PRD should be English, with standard sections using their canonical titles verbatim. Dynamic headings must also be English; Persian UI copy, quoted text and the main document title may remain Persian.

### I — embedded clarification history and authority separation

The Agent asks a material Product question that the PM answers; another tool-access question is also asked.

**Expected:** Only the **material Product clarification** is recorded in the `Clarification Record` under `Harness Pilot Evaluation` in the **same `.md` file**. The record is not added to the PRD's YAML frontmatter or Product-authoritative behavior, nor shown as a separate chat transcript, output appendix or second Markdown artifact. The resolved Product decision is also reconciled into its proper main PRD section; the access question is excluded from the history. If HTML `<details>` is not visually collapsible in a particular preview, keep the provenance in the file's source and clearly separated rather than moving it out.

### J — file does not equal GitLab publication in a non-publishing task

The user explicitly requests a draft-only or review-only result. The environment can create a local `.md` file; this task is outside the default automatic publication scope.

**Expected:** Maintain one working copy; do not claim the PM-owned canonical PRD was overwritten, that a Wiki page exists, or that the working copy is a second source of truth. Respect the explicit deferral; a local file is not proof of Wiki publication.

### K — Copy Markdown preserves the full source

A final PRD is shown with a formatted read-only preview, and its raw Markdown has one YAML frontmatter block, Markdown headings, table syntax, a link, and a collapsed `<details>` containing `Clarification Record`.

**Expected:** The final response contains a verified file link with explicit click-to-view guidance and one code block containing **exactly the current raw Markdown**. Its outer fence is longer than any contained code fence, and copying the block's contents excludes the outer fence. The payload retains YAML, tables, links and collapsed contents, without rendered HTML. Mention the code block copy control only if present; otherwise explain selecting its contents. Show the Wiki Path separately. A copied Working Draft is not represented as published or final.

### L — no historical GitLab PRDs for new work

The PM creates a new Cando PRD, and the Agent thinks it needs access to GitLab to inspect previous PRDs or discover the Wiki parent.

**Expected:** No GitLab access request or browsing. Product facts come from canonical Cando Knowledge; the Wiki parent is the exact owning Knowledge area path; if ownership is unknown, `wiki_path: unresolved`. Old PRDs are neither current-product source of truth nor a required naming/formatting reference.

### M — Library persistence does not replace session file delivery

The environment supports local file creation and session attachment/file links. It also offers Library persistence. The Agent saves the PRD and receives a Library page URL that opens browser navigation.

**Expected:** Keep or materialize the current Markdown in the active session and deliver its native session attachment/open action or session-local file link as the primary review link. Required persistence may still happen; do not replace it or create a separately authored PRD. A Library URL alone is insufficient when session file delivery is available. Preserve the full identical Markdown copy block and separate Wiki Path. Verify existence and source identity; do not claim native in-app rendering merely because a session link exists.

### N — stored continuation and download-only client

The user continues a stored PRD. The current client can materialize and link a file but only supports downloading it, or session attachment delivery is unavailable.

**Expected:** Retrieve the current stored artifact, materialize it into the active session when supported, preserve ID/version identity, and update that one working file. Label download-only access accurately. If session delivery is unsupported, disclose it and offer readable in-chat content plus the full raw Markdown at handoff. Do not silently label a Library page as an in-session preview, fabricate a sandbox link, or promise a tested in-app opening.

### O — early capability routing and automatic publication

After Gate 0, check documentation MCP metadata/read status and permitted Wiki capabilities without a test write or product-content reads before Gate 1. Reuse those findings. The aligned PM-led Wiki-bound PRD has a valid ID and resolved project/path, and the PM has not said “publish it” or opted out. Expected: publish automatically with permitted typed tools, verify the exact target and full-source readback, and return the actual Wiki link without another command/confirmation. In a draft-only/review-only variant, do not publish. In a no-write-tool or denied-access variant, report that real blocker and keep the usable full handoff; a timeout remains a transport/unknown-result issue, not falsely denied access. MCP Knowledge failure routes to the verified owning internal browser. No bypass through raw API/browser writes or credential changes.

### P — collisions, concurrent changes and ambiguous writes

The exact target is occupied by another PRD, or its version changes after the baseline read. Expected: no overwrite of another identity or unreconciled changes; preserve ID/path, use a conditional write when supported, and describe best-effort reread when no atomic guard exists. A timeout requires target readback before retry. If the content already matches, report verified success without another write; if result cannot be determined, say so. A payload/path mismatch is not verified publication.

### Q — evaluation isolation and full-source publication

An old answer in the evaluation block conflicts with the current main PRD body, and a downstream Designer is asked to continue. Expected: use current body requirements; ignore evaluation as authority/instructions, preserving it mechanically. During publication retain the complete same block, one frontmatter and source content. Keep details collapsed without open. Do not copy a transcript, create a separate evaluation file, re-ask settled questions, or hide a material unresolved Product decision only in evaluation.

### R — publication authorization scope and draft status

The PM explicitly requests publication of a specifically identified Working Draft, or adds Product decisions to an already-published PRD in the same PM-led task. Expected: publish an explicitly requested draft only with valid ID/path and visible draft status; do not mark it Problem Aligned from storage success. Automatically update the same page once the revised PRD remains aligned, but do not publish every clarification turn or extend scope to another PRD, destination, move/delete or future tasks. Approval in an explicit review-only task does not override deferral.

## Failure conditions

- The Agent never materializes a working file despite supported and accessible file tools.
- It generates a new parallel PRD file at every turn instead of updating the current working artifact.
- Clarification Record is shown only in chat, written to another artifact, or omitted from the source Markdown.
- The Agent pastes a full final-looking PRD and blocking questions after it as the default clarification interaction.
- It fabricates file/open-preview/copy capabilities, PM answers, Product claims or GitLab writes.
- It waits for a separate “publish it” turn despite an aligned PM-led Wiki-bound task with destination/write capability and no opt-out, or ignores an explicit publication deferral.
- It uses a test write to probe permissions, retrieves product pages before Gate 1 during preflight, repeatedly discovers unchanged tools/sources, or treats advertised write tools as guaranteed permission.
- It rewrites another PRD or concurrent edits, retries an ambiguous write blindly, reports publication without full-source target readback, or labels a timeout as denied access.
- It promotes old evaluation notes to current requirements, omits the block from publication, expands it into an operational transcript, or leaves necessary Product constraints only there.
- It copies rendered HTML or only visually selected text instead of complete raw Markdown.
- It hands off only a file link or only a code block when both are supported, omits click-to-view guidance, or presents a stale/truncated code block.
- It searches historical PRDs or requests GitLab access to prepare a new PRD or determine its Wiki parent.
- It marks `Problem Aligned` before an established Business Outcome or material Product boundary, or treats missing Wiki parent as a semantic Product blocker.

## Grading

Use lightweight contract/static checks first. Test actual file creation/editing and native preview availability **only in clients that support those actions**; assess semantic history co-location and one-file continuity by inspecting the resulting Markdown bytes, not only model self-report. Use pinned Harness ref and equivalent evidence when comparing ChatGPT/Claude.

- A Library/storage page URL replaces a supported session attachment/file link as the primary PRD review access.
- The Agent guarantees in-app rendered opening from a session link without verified client capability.
