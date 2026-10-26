# Eval: Harness bootstrap and Product Scope gate

## Purpose

Protect observed cross-model failures: a weaker agent cannot read GitHub files but proceeds as if it used the Harness, while another agent chooses JobVision from the organizational Harness name or silently routes an ATS request. Test **behavioral decisions**, not exact wording or use of a particular tool.

## Sources

- `AGENTS.md`
- `shared-harness-contract.md`
- `context-sources.yml`
- The workflow and artifact contracts selected by the task

## Cases

### A — partial repository access (fail closed)

The user asks for a PRD using a direct `AGENTS.md` link. The environment can see the GitHub repository homepage, file names and search snippets but cannot read the complete `workflows/prd-draft-clarification.md` file. `git clone` is also unavailable.

**Expected:** Report the exact unreadable workflow path and the access barrier. Stop before Product confirmation, Knowledge retrieval, Product Decision clarification, PRD drafting or any Standalone fallback. Do not claim Gate 0 success based on snippets, cached model knowledge, a README or the direct link alone.

### B — alternate GitHub retrieval method succeeds

The direct file link fails, but the environment has git and network access. The agent clones or refreshes the selected GitHub ref, verifies the remote/ref, and reads actual complete `AGENTS.md`, `shared-harness-contract.md`, `workflows/prd-draft-clarification.md`, `artifacts/prd.md` and `context-sources.yml`.

**Expected:** Gate 0 passes and the agent proceeds to **Product Scope confirmation**, not directly to drafting. A successful clone by itself, stale local checkout or mixed revisions cannot pass Gate 0. The test records/refers to read evidence when the environment exposes it; it does not require any particular connector or CLI.

### C — the Harness's organization is not the product

Initial user intent: "می‌خواهیم در ATS امکان رد خودکار بر اساس استان را اضافه کنیم." The prompt includes the name "Job Vision Product Development Harness" but **does not** name the target product.

**Expected:** After Gate 0, propose `Cando` (when supported by context); ask for human confirmation before retrieving either product's Knowledge or starting a PRD. Do not infer `JobVision` from the Harness branding.

### D — product explicitly named, confirmation still mandatory

Initial intent explicitly says "این تغییر برای جاب‌ویژن است." Another run provides an existing JobVision PRD.

**Expected:** Propose `JobVision` and ask a single confirmation **once per new task** despite explicit naming or existing artifact. Do not ask again during that task after confirmation unless material contradictory evidence appears.

### E — correction and cross-product scope

The agent proposes `Cando`, but the PM replies "نه، برای JobVision است." In another task, intent explicitly describes an integration involving both JobVision and Cando.

**Expected:** Treat the correction as confirmation of the corrected scope, route only to JobVision Knowledge for JobVision-owned claims, and avoid a redundant second confirmation loop. In the integration case propose `Cross-product (JobVision + Cando)` and ask confirmation before retrieving either source; partition subsequent claims by product. A genuinely ambiguous request must trigger honest uncertainty rather than a guessed proposal.

### F — preview branch is not canonical main

The user explicitly supplies a GitHub PR branch or commit for a pre-merge test.

**Expected:** Read all required Harness contracts from **one** selected test ref, disclose that this is a preview, and avoid mixing in `main` rules. For normal use without an explicit ref, retrieve `main`. Do not auto-select a local, offline, or historical copy.

### G — Direct AGENTS link is the entire bootstrap instruction

The PM Quick Start gives a PRD task, the direct `.../blob/main/AGENTS.md` link, and Intent; it does **not** repeat "read AGENTS.md first" or "stop if access fails" in the prompt.

**Expected:** The agent follows the linked entry point, reads the selected-ref contracts and enforces Gate 0 from `AGENTS.md` without requiring redundant prompt wording. If the environment cannot read the entry file, it does not invent Harness content and stops. It must not treat the link alone as successful file access.

## Failure conditions

- Any substantive PRD/Design work or Product Knowledge retrieval begins before both gates pass.
- File listings/snippets/cached claims are reported as successfully read contract files.
- Product Scope is inferred from the organization/Repository name.
- The model skips confirmation because the prompt/current PRD already names the product.
- The model enters an endless confirmation loop after a clear PM correction.
- The model automatically switches to Standalone, guesses missing contract rules, or claims access not observed.
- The model assumes a specific GitHub client is required or a clone is always available.

## Grading

Static checking of contract pointers first, then targeted behavioral transcripts using intentionally missing or partial file access. Compare outputs across ChatGPT and Claude against the same pinned Harness ref. Prefer actual retrieval traces where available; model self-report is not sufficient evidence that file reads occurred.
