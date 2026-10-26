# PRD Draft + Clarification Workflow

## Purpose

Turn an informal or incomplete PM intent into a product PRD that is sufficiently grounded and bounded for meaningful Design Exploration, while minimizing unnecessary human interruption.

The workflow is draft-first, retrieval-first, normalization-before-clarification, and clarification-light.

## Inputs

- PM Intent, in whatever natural form the PM provides it.
- Relevant discovery context when available, including research, evidence, prior analysis, hypotheses, or working notes.
- Relevant canonical Product Knowledge context when available.
- Relevant reviewed Product Walkthrough evidence when a journey, flow, handoff, or feature walkthrough is material.
- Relevant implementation evidence when deeper investigation is required and available.

PM Intent does not require a mandatory intake schema. Missing structure is work for AI to resolve where possible, not an automatic request for more documentation from PM.

Discovery and problem exploration may happen before this workflow in any suitable tool or process. The Harness does not prescribe or own that upstream work. When relevant discovery context is available, AI should consume it rather than requiring the PM to restate or reformat it.

Discovery context is input to Product Definition, not Product authority by default. Evidence may inform Product decisions, while prior analysis, hypotheses, recommendations, working notes, and AI-generated conclusions remain non-authoritative unless the responsible PM establishes the Product intent or decision they imply.

## Workflow

### 1. Receive PM Intent after the execution gates

Gate 0 in `AGENTS.md` must have **actually passed** before entering this workflow. Gate 1 must have produced an **explicit human-confirmed Product Scope** (JobVision, Cando, or Cross-product). The Agent may inspect the specific user-provided current PRD **only to propose this scope** after Gate 0 and before Gate 1; this is not canonical Product Knowledge retrieval. Never infer the human's confirmation from the first prompt, the Harness name, or the existing PRD. If either gate is incomplete, complete it without retrieving product-specific Knowledge or beginning the draft.

Interpret the requested change without requiring a discovery questionnaire. Use the confirmed scope for source routing, including corrections to the initial proposal. If the intent is still too ambiguous to produce any useful working draft, ask the minimum Product question that establishes what change is being discussed. Otherwise continue to retrieval.

### 2. Retrieve task-relevant context

Retrieve only the current-product context needed to understand the change, including where relevant:

- the responsible Product owner or team when reasonably retrievable,
- the materially affected actors,
- the concise local current behavior needed to understand the change,
- relevant permissions and eligibility,
- material states and adjacent flows,
- business rules and constraints,
- established terminology,
- established User and Business Outcomes already present in Product intent or authoritative context,
- context needed to understand material Product Scenarios,
- materially relevant canonical Product Knowledge pages when useful for grounding or downstream retrieval,
- and available evidence related to the stated problem.

Use canonical Product Knowledge as the primary source for established product meaning and behavior, including concepts, business rules, terminology, and current-product documentation. Route to the source identified by the resolved product scope; do not silently substitute another product's source or another repository when the owning source is unavailable.

If the environment can read user-shared/local browser tabs, reuse an already-open relevant canonical tab first. If none is available and canonical context is materially needed, ask the user to open one tab for the resolved product's canonical source, retrieve the smallest relevant context, and request further tabs/sources only when materially necessary.

When the task depends on an end-to-end journey, current flow, handoff, or feature walkthrough, use relevant reviewed Product Walkthrough evidence when available to improve reconstruction. Walkthrough evidence is not canonical Product Knowledge and must not silently override it.

When a materially useful canonical Product Knowledge page is identified, record it in PRD frontmatter `references` as `{source, page}`, where `source` is the owning key from `context-sources.yml` and `page` is **only the exact source-native page name/slug** (e.g. `entity-candidate` when that is the actual page name). Do not use URLs, Markdown links, browser paths, breadcrumb labels, descriptive page titles substituted for file names, or invented IDs. If the source-native name cannot be identified, omit that reference rather than guessing or falling back to a link. Before handoff, verify every entry conforms.

**GitLab Wiki placement for Wiki-bound PRDs:** Establish the primary owning area **from live canonical Product Knowledge**; `../resources/prd-knowledge-areas.yml` is a navigation aid. For a **new** Wiki PRD, use the exact relative Knowledge area path, including its casing, as the parent in `<owning-area>/<ID>-<slug>`. **Do not browse previous Wiki PRDs, sidebar, page listings or API, nor request GitLab access** to infer product facts or publication placement. If the owning area cannot be established, use `wiki_path: unresolved` and `GitLab Wiki Path: unresolved` until Knowledge or PM input establishes it. The PM handles any actual Wiki path divergence outside the drafting run. Publishing uncertainty does not block semantic `Problem Aligned`. Other related Knowledge areas belong in `references`, not duplicate pages. When editing a **specific user-provided existing PRD**, preserve its established ID and path unless an explicit move is approved.

Inspect relevant implementation when canonical documentation and reviewed evidence are insufficient, inconsistent, or require deeper investigation. Treat what you find as implementation evidence for discrepancy analysis or later Technical Planning, not as a silent replacement for canonical JobVision Product Knowledge. Do not assume a specific code host or repository provider unless the environment establishes one.

Treat direct product observation as establishing only what is directly observable in the state or session inspected. Static copy, layout, visual grouping, or one rendered state does not by itself establish navigation destination, result-set membership, eligibility, persistence, state or data ownership, lifecycle behavior, universal visibility, cross-session behavior, or business-rule semantics. When such an interpretation is materially relevant, verify it through stronger available context such as deeper canonical Product Knowledge retrieval, reviewed walkthrough evidence, interaction with the product, or implementation evidence. Until verified in canonical Product Knowledge, state only the narrow observable fact or preserve the semantic uncertainty rather than promoting the interpretation into canonical `Current Behavior`.

If canonical Product Knowledge, reviewed walkthrough evidence, direct observation, or implementation evidence materially conflict, preserve and surface the discrepancy until it is reconciled. Do not choose the source that best fits the proposed change.

Do not create a separate context artifact by default.

Do not infer unsupported Business Outcomes or Success Metrics from retrieved context merely to complete the PRD structure.

### 3. Produce a best-effort PRD v0

Create a substantive PRD before clarification whenever useful work can proceed.

Use:

- Known facts,
- validly Derived consequences,
- reversible Assumptions when they help create a useful draft,
- and explicit Unresolved items when human judgment is still required.

Apply a Draft Authority Gate throughout drafting and reconciliation, not only during final normalization. Before an intended behavior appears as an unconditional Scope commitment, Required Product Behavior, Acceptance Criterion, or equivalent established Product behavior, trace it to an explicit PM or responsible-human decision, a clarification answer, a canonical current-product fact or constraint used only to describe current behavior or constrain a necessary derivation, or a consequence necessarily implied by established authority. If the behavior is unresolved, hypothetical, recommended, or only a reversible working assumption, keep that authority state visible and do not state it as a commitment. Safe reversible assumptions remain allowed when useful, but must stay visibly assumed or open until authority is established; only then may reconciliation promote them into authoritative sections.

Current-product eligibility, permissions, channels, lifecycle boundaries, and access rules may inform or constrain reasoning about a new capability, but they do not automatically establish the intended eligibility, permissions, scope, channels, or lifecycle of that capability. Inherit a current-product rule as authoritative for intended behavior only when the inheritance is explicitly established by PM or responsible-human authority, established by clarification, or necessarily implied because the new behavior is inseparable from an already-authorized Product operation. Otherwise keep the intended boundary Unresolved or explicit as an Open Decision. Apply the necessary-implication test: `If the current-product rule were true, could the new capability legitimately use a different rule?` If yes, the inheritance is not established and must not be promoted as intended Product behavior.

When PM intent is solution-shaped or retrieved context does not establish the underlying problem, outcome, rationale, risk, or likely tradeoff, use relevant general model knowledge, domain knowledge, and common product patterns to generate informed hypotheses, candidate framings, alternatives, and recommendations. Do not present those as established Job Vision truth or decided Product intent. If a hypothesis materially affects Product framing or downstream decisions, keep that distinction visible and surface the Product judgment when needed.

Apply a Solution Promotion Gate to proposed interaction or presentation mechanics and capabilities in PM input. Solution-shaped form does not reduce Product authority: a clear, imperative PM statement can establish a Product capability in the initial intent, and does not require a second clarification or approval. Preserve the established capability while separating it from its proposed realization. For example, `the user can view only New results` may be required Product behavior while a filter, mode, tab, toggle, or other exact control pattern remains open for Design unless Product explicitly constrains it. Tentative language such as `it would be better to` or `we could` does not by itself establish mandatory behavior.

Use the test `if this proposed solution were removed from the PM input, would the established Product decisions still necessarily require this behavior?` only when evaluating behavior inferred from an in-scope surface, an adjacent decision, or another implicit inference. Do not use the test to invalidate an explicit PM or human decision. In particular, `surface or touchpoint is in scope` does not imply `the proposed mechanic or capability on that surface is required`.

Populate the PRD metadata and semantic responsibilities defined by `../artifacts/prd.md` without rendering empty conditional sections merely for completeness. For a new PRD, generate the first stable `YYMMDDHHmm` ID from a trustworthy current Jalali date and 24-hour Iran-local time when available, with manual PM-provided date/time as the fallback. Do not silently fabricate the date or change an existing non-placeholder ID. For Wiki-bound PRDs, propose a short English kebab-case slug and construct the **complete** `wiki_path` from the grounded primary parent, stable ID and slug. Put all metadata in one opening YAML frontmatter block; never append a second block.

Retrieve the responsible Product owner or team when reasonably possible. Do not infer or fabricate ownership; when ownership cannot be established, use `owner: unresolved`.

When Business Outcome is not established, do not invent or silently establish business value. When PM Intent, the Problem, relevant evidence, current-product context, known Product or business goals, or defensible domain reasoning provide enough basis, proactively offer the PM a small number of plausible non-authoritative Business Outcome candidates. Prefer one candidate and explain the recommendation briefly when there is a defensible basis. Ask the PM to confirm, refine, or reject the proposal rather than defaulting to an open-ended request for the Business Outcome. Only a Business Outcome established by the responsible Product human may become Known and authoritative in the PRD. If there is genuinely insufficient basis for a meaningful proposal, make that limitation explicit and ask the smallest Product clarification needed rather than fabricating business value. An established Business Outcome is required before the PRD can become `Problem Aligned`. Keep an unresolved Business Outcome visible in the `Business Outcome` section; do not mechanically duplicate it into `Assumptions & Open Decisions`.

Draft Key Product Scenarios when a material journey, actor handoff, lifecycle sequence, or connected behavior sequence benefits from a coherent product-level view. Keep them solution-independent, as short as needed to preserve the material sequence, and separate from selected Design User Flows and detailed Required Product Behavior.

Keep product relationships and behavioral consequences in their semantic homes such as Scope, Key Product Scenarios, or Required Product Behavior. Do not create a separate `Dependencies` section merely to list Product Knowledge pages.

Do not return a skeleton dominated by `TBD` fields when a meaningful draft can be produced.

Follow the PRD Artifact Contract in `../artifacts/prd.md`. **Starting with the first substantive PRD draft, create one real current `.md` working file** when the execution environment supports file creation. Include a single YAML frontmatter block, the working Product sections, and the separated `Harness Pilot Evaluation` with its evolving `Clarification Record`. Provide native in-environment open/preview access where supported, or a verified file link. Subsequent clarification updates must modify **the same file**, not create a parallel version. A working file is not proof of GitLab publication.

**Wiki publishing handoff:** Determine the primary owning area from confirmed Product Knowledge and use its exact relative area path as the parent. Do not visit GitLab Wiki, search older PRDs, or ask the PM to grant GitLab access to discover a parent or compare prior content. If the owning area is unknown, use `wiki_path: unresolved` until it is established. Show the full `GitLab Wiki Path` separately, equal to frontmatter `wiki_path`, without `.md` or a separate `GitLab Wiki Title`. Keep existing path/ID for a specific user-identified PRD being edited. Publishing uncertainty does not block `Problem Aligned`; do not claim a GitLab write.

### 4. Run semantic normalization

Clean the draft as one artifact before asking for clarification. The goal is semantic completeness with low redundancy, not minimum detail.

Check that:

- each material claim has one primary semantic home and is not repeated merely for completeness,
- `Problem` and `Outcomes` describe problem framing and improved states rather than feature mechanics or requirement summaries,
- `Affected Users` remains a concise actor view rather than carrying permissions or detailed behavior owned elsewhere,
- `Current Behavior` describes the nearest concrete local product baseline that the intended change enters, extends, interrupts, or replaces,
- `Scope` defines release boundaries without becoming a rule inventory,
- `Key Product Scenarios` provide only the shortest coherent journey, handoff, or lifecycle sequence and do not duplicate Required Product Behavior,
- `Required Product Behavior` states Product semantics and observable consequences without Design commentary or implementation strategy,
- vague abstractions such as `reconcile`, `snapshot`, `ready`, `identity`, or `version` are replaced by observable Product semantics unless the abstraction itself is an intentional Product concept,
- future-oriented or premature specification is removed when it is not needed to constrain the current release,
- newly introduced configurable or shared resources have their materially relevant actor, lifecycle, ownership, and scope boundary considered,
- frontmatter `references` contains only materially useful canonical Product Knowledge source keys plus verified plain page names/slugs, with no URLs, Markdown links, browser paths, breadcrumbs or invented IDs,
- and Acceptance Criteria capture material correctness boundaries rather than restating Required Product Behavior line by line.

Normalization must not silently resolve Product uncertainty. If cleanup exposes a material missing decision, preserve it for the ambiguity scan rather than inventing an answer.

### 5. Run an ambiguity scan

Stress-test the normalized draft rather than immediately asking questions.

Check for material ambiguity in:

- product intent,
- scope,
- materially affected actors,
- current-product assumptions,
- User Outcome,
- Business Outcome, including missing or unsupported business value,
- Key Product Scenarios where they are material,
- required product behavior,
- materially relevant canonical dependencies available from Product Knowledge but omitted from the PRD,
- acceptance criteria,
- assumptions and open decisions,
- and internal consistency.

A useful test is whether two materially different products could both satisfy the current wording.

Also check whether a materially affected actor is missing or a Product Scenario requires unstated Product judgment.

A missing Business Outcome is a blocking Product decision for `Problem Aligned`, because downstream Product and Design decisions require an established statement of why the change matters to the product or business. This does not justify an open-ended intake question when useful candidates can be formed: propose a small grounded set, recommend one when justified, and ask the PM to confirm, refine, or reject it.

The ambiguity scan produces uncertainty, not questions.

### 6. Resolve uncertainty before escalation

For each material uncertainty, attempt in order:

```text
retrieve → derive → safe reversible assumption → human clarification
```

Do not ask the PM to restate facts that can reasonably be retrieved, including affected actors, current behavior, ownership, or relevant canonical Product Knowledge context.

Do not escalate a choice that belongs to Design rather than Product.

### 7. Ask targeted clarification

Ask only unresolved choices that require PM judgment and materially affect product intent, User or Business Outcome, scope, Product Scenarios, required behavior, acceptance criteria, or downstream design direction.

Business Outcome is a required Product-owned decision for `Problem Aligned`. If it is not yet established, first perform the candidate-assistance step above and then ask the PM for the smallest confirmation, refinement, or rejection needed to establish the Business Outcome. Do not allow the general Blocking Materiality Gate to downgrade a missing Business Outcome into non-blocking uncertainty.

Before asking each clarification, apply a Clarification Ownership Gate: verify both that the unresolved item is Product-owned and that resolving it is necessary for Problem Alignment. Ask Product only when both conditions hold. If the unresolved item is Design-owned, do not ask Product merely because it remains open; preserve it for Design Exploration. Product-owned decisions commonly include identity, semantics, lifecycle or baseline state, persistence, eligibility, permissions or user scope, and business rules. Design-owned decisions commonly include badge or marker treatment, exact visual distinguishability, filter/tab/toggle/control choice, exact count versus presence indication, visual hierarchy, and empty-state presentation unless Product has explicitly constrained them. These examples guide semantic judgment and are not an exhaustive taxonomy.

Apply a Blocking Materiality Gate after ownership is established: `Product-owned uncertainty` does not by itself mean `Product clarification required`. Treat a Product decision as a clarification blocker only when leaving it unresolved would force Design to invent material Product intent or behavior, or would leave the change's core semantics, scope, lifecycle, or acceptance behavior indeterminate. Consider whether materially different answers would change the core Product or a material Design direction, whether the issue belongs to a downstream dependency or policy, whether it is a non-core edge-case or lifecycle branch, and whether the current feature only needs a clear boundary or handoff rather than the dependency's internal policy. If Design can still perform meaningful exploration without material Product invention, do not ask; keep the Product-owned uncertainty explicit as an Open Decision, assumption where safe, or dependency boundary, and allow Problem Alignment when the remaining core behavior is sufficiently established. Do not defer core identity, eligibility, requiredness, submission semantics, persistence, or another boundary when its alternatives would still force materially different Product behavior or Design.

This gate applies in particular to non-binding solution preferences in PM input. Do not ask Product solely to decide whether to promote or discard an optional or tentative proposal. When Design can explore that proposal without inventing material Product semantics and resolving it is not necessary for Problem Alignment, do not make it a Product requirement or clarification blocker; preserve it as a Design hypothesis or open design space. For example, whether New must be distinguishable in ordinary mixed results or whether Recent or Saved Search must signal New before entry can be Product capabilities if required, but tentative suggestions for them need not be resolved before alignment. Badge, marker, color, hierarchy, exact count versus presence, and exact presentation or control remain Design mechanics unless Product explicitly constrains them.

Before emitting any clarification that has passed the Ownership and Blocking Materiality gates, apply a Clarification Atomicity Gate. Each clarification question must resolve one independently answerable Product decision. The Agent must be able to name the single Product decision variable the question resolves. Multiple alternatives may appear in one question only when they are mutually exclusive values of that one variable and all other Product properties remain fixed.

Apply a One-variable test before emission: `What single Product property does this question resolve? Do all options vary only that property? Could two options logically both be true at the same time? Could the human answer one part of this question while legitimately leaving another part undecided?` If no single variable can be named, the options change more than one property, two options can both be true, or one part can be answered while another remains undecided, the question is compound and must be split into separate clarifications.

Do not bundle independent consequences such as visibility or disclosure, submission eligibility or blocking, status transition, rejection or another automation trigger, ranking or prioritization, scoring, persistence or reuse, ownership or scope, and lifecycle timing unless established authority necessarily couples them. These are examples for semantic judgment, not a fixed taxonomy.

Do not disguise independent capabilities as values of an umbrella label or apparent spectrum such as `level of effect`. Do not use package options that change several behaviors together—for example, `prefill and editable`, `prefill with explicit confirmation`, and `automatic submission` vary prefill, editability, confirmation, and submission behavior rather than one Product property. Separate any independently answerable axes whose resolution is materially required.

Atomicity applies to each question, not to the clarification batch. A batch may contain multiple atomic questions when decision dependency and downstream timing are respected. Splitting a compound question must not resurrect Design-owned or non-blocking uncertainty as Product clarification; ownership and blocking materiality are decided before atomic formulation.

Prioritize questions by decision dependency and downstream impact.

**Default interaction:** ask **one atomic Product Decision question per turn** when human clarification is required, then reconcile its answer and reassess whether the next question is still needed. Batch independent questions only when the human explicitly requests a batch or there is a defensible, materially useful reason to group them; respect their dependencies. Do not ask downstream questions whose relevance depends on an unresolved upstream answer.

Each clarification should, when useful, make clear:

- the decision required,
- why the decision matters,
- the materially different options,
- and an AI recommendation when there is a defensible basis for one.

### 8. Reconcile PM decisions into the PRD

Before reconciliation, interpret the semantic role of the human input. A clear PM statement that actually establishes, changes, supersedes, or rejects a Product decision is sufficient authority for that decision. A correction of current-product understanding, rationale, example, hypothesis, retrieval instruction, challenge, or request to investigate may change the working context without establishing new Product behavior.

Then apply an Artifact Durability Check to human-derived information: would omitting it cause a downstream reader to misunderstand the intended change, miss a material Product decision or constraint, lack necessary current-product context, or invent materially different Product behavior? If not, retain it only as conversational or reasoning context. In particular, an authoritative correction of an immaterial current-product claim may be reconciled by removing the incorrect claim and adding nothing in its place.

Before promoting any claim during reconciliation into an unconditional Scope commitment, Required Product Behavior, Acceptance Criterion, or equivalent established Product behavior, apply a Reconciliation Authority Check: ask `What exact authority establishes this claim?` A valid trace must lead to an explicit PM or responsible-human decision, the clarification answer being reconciled, a canonical current-product fact or constraint only for the current-behavior or constraint claim it actually establishes, or a consequence necessarily implied by established authority. A clarification answer makes authoritative only the semantic decision or decisions it actually resolves. An adjacent consequence, plausible inference, recommendation, convenient completion, or common pattern does not inherit authority merely because it is related.

For every claimed necessary implication, apply the counterfactual test: `If the authoritative decision were true, could this adjacent claim still legitimately be false?` If yes, the adjacent claim is not necessarily implied and must not be promoted. Keep it Unresolved, visibly Assumed when safe, or in Open Decisions according to its actual state. Reconciliation must not silently change the decision state of claims the answer did not resolve.

After a decision:

- update the owning PRD claim,
- update affected User or Business Outcomes,
- update affected Key Product Scenarios,
- update affected acceptance criteria,
- remove or replace stale assumptions,
- reconcile related scope, behavior, or Product Knowledge page references,
- re-run semantic normalization on materially affected sections,
- and run a local consistency check.

**After each material clarification answer, update the current `.md` working file**: reconcile the decision into the Product-owned section and update the **same file's** `Harness Pilot Evaluation > Clarification Record` with the actual question, PM answer and resolved decision. An unanswered material clarification can be marked as `Pending`, without inventing a decision; update that entry when the reply arrives. Do not print a separate Clarification Record or transcript in chat. Briefly acknowledge the change and ask the next atomic Product question where needed.

Do not require a second approval ceremony for the edit itself.

### 9. Reassess remaining uncertainty

If a PM decision creates new material ambiguity, repeat only the affected retrieval, normalization, clarification, and reconciliation work. Do not restart the workflow from zero.

After resolving clarifications that originated from solution-shaped suggestions, re-scan the underlying problem for unresolved material Product decisions independent of those suggestions. Do not let clarification of proposed surfaces or mechanics substitute for material semantics such as identity, lifecycle, baseline or state, persistence, eligibility, permissions or user scope, and important boundary conditions. Use semantic judgment rather than treating these examples as a mandatory checklist.

Known material uncertainty must remain visible until resolved even when it does not block useful Design Exploration.

### 10. Run final whole-artifact semantic normalization

After material Product decisions have been reconciled and remaining uncertainty has been reassessed, normalize the entire PRD again as one artifact before assessing readiness. Do not limit this pass to sections directly edited during reconciliation.

Re-run the semantic checks from Step 4 across the complete PRD, with particular attention to changes introduced during clarification and reconciliation. Check that:

- newly established decisions have not created duplication across Scope, Product Scenarios, Required Product Behavior, and Acceptance Criteria,
- section boundaries remain intact after the artifact accumulated new detail,
- Acceptance Criteria have not expanded into a line-by-line restatement of Required Product Behavior,
- stale assumptions, superseded alternatives, and obsolete uncertainty have been removed,
- current-product knowledge-status or retrieval notes have not leaked into semantic sections such as `Current Behavior`,
- frontmatter references remain concise navigation metadata rather than duplicated PRD content or a retrieval bibliography,
- all PRD section/subsection Markdown headings (`##`–`######`) use English, with the canonical labels in `artifacts/prd.md` preserved verbatim even when body prose is Persian,
- and the final artifact remains semantically complete with low redundancy.

This pass is cleanup, not a new Product decision step. It must preserve established Product decisions and must not introduce new product behavior merely to make the document look complete.

If whole-artifact normalization exposes a material unresolved Product decision or contradiction, return to the relevant uncertainty-resolution or clarification step before readiness assessment.

### 11. Assess Problem Alignment

Assess whether the PRD is `Problem Aligned` for Design Exploration.

An established Business Outcome is required before declaring `Problem Aligned`; a recommendation or AI-generated candidate is not sufficient until the responsible Product human establishes it.

Before declaring alignment, run a brief Pre-Alignment Authority and Material Decision Coverage Check. First, trace each material Product behavior and boundary present in the PRD to an explicit PM or responsible-human statement, a clarification answer, a canonical current-product fact or constraint, or a consequence necessarily implied by established decisions. Then check for material Product boundaries omitted from the PRD: could two materially different Products still satisfy it because an important Product-owned decision is unspecified? If plausible alternatives would materially change downstream behavior or Design, preserve that boundary as unresolved and obtain Product clarification before alignment. Canonical Product Knowledge may establish current facts and constraints. Reviewed Product Walkthrough, observed UI/design, and implementation evidence may support reconstruction or expose gaps, but they do not independently establish canonical current-product truth or intended behavior for the new change. Apply this counterfactual check semantically rather than as an exhaustive checklist or fixed domain taxonomy. For example, using `same Search` without resolving whether identity follows each saved or recent record versus normalized query and eligibility-affecting filters can produce different baseline and New behavior. Likewise, a feature that depends on prior visits without resolving session-, device-, account-, or guest-versus-logged-in scope leaves materially different state behavior possible. Whether a reactivated job is New and how New behaves on a first eligible visit without a prior baseline similarly require Product authority when their alternatives materially change the experience. A plausible model-selected answer is not sufficient. Open Design choices such as badge, marker, exact control, visual hierarchy, or count versus dot do not block alignment merely because they remain open.

Reapply the Blocking Materiality Gate as a readiness check: Product ownership alone does not prevent alignment. A downstream policy or non-core edge-case may remain explicitly unresolved when the core boundary or handoff is clear and Design can proceed without inventing material Product behavior; an unresolved core boundary that still permits materially incompatible Products must continue to block.

The PRD is aligned when Design can proceed without needing to invent materially different product intent or behavior.

Check that the affected actors, local current-product baseline, established Outcomes, material scope boundaries, applicable Product Scenarios, required behavior, material Product context, acceptance criteria, and remaining uncertainty are sufficiently clear for the next use.

The absence of a frontmatter Product Knowledge page reference alone does not block alignment when the material Product behavior and implications are otherwise clear.

Remaining uncertainty is acceptable when it is explicit and does not invalidate useful Design Exploration.

If alignment is not reached, identify the specific blocking gap rather than reporting generic incompleteness.

## Output and interaction contract

The default output is **one living Markdown working file**, not a full PRD dump into chat after each turn. Use these modes:

1. **Clarification:** From the first substantive working draft, maintain an **openable `.md` working file**. When a Product Decision blocks `Problem Aligned`, ask the next focused atomic question in chat. **After each answer, reconcile and update that same file**, keeping it visibly **Working Draft / not ready for handoff** while blocked. Chat may briefly describe the change and surface the open/preview link, but must **not** emit a separate Clarification Record or a final-looking PRD with trailing questions.
2. **Working Draft inspection:** When supported by the client, open/show a **rendered read-only view** derived from the one current Markdown source at any stage. The PM should read a formatted document, not need to edit YAML or Markdown syntax. Clarifications and edits are requested conversationally. If the client lacks rendered preview, use a verified file link or the best available readable fallback; do not invent UI capabilities.
3. **PRD handoff:** When the PRD reaches `Problem Aligned`, update the **same `.md` file** and provide a verified clickable file link **plus the entire current raw Markdown in one fenced code block in chat**. Explicitly say to **click the link to view the PRD** and use the code block's copy control, if available, to copy its Markdown into GitLab's **Markdown/source editor**. A supported rendered read-only preview or native raw-copy action can supplement this handoff. The code block must contain the exact file source, including frontmatter and embedded `<details>`/Clarification Record, with an outer fence long enough to contain any inner code fences; it is not a second artifact. Present `GitLab Wiki Path` separately. If path or ID remains `unresolved`, deliver the aligned PRD but explicitly mark **Wiki publication not ready** and explain the smallest operational step. Do not require a second "now write it" turn or claim publication.

**Client capability fallback:** Do not assume ChatGPT or Claude has native rendered-document preview, a file link, or a copy button. Use and name each capability only when actually supported. If file creation/linking is unsupported, disclose it and provide the complete raw Markdown code block at handoff (and after material updates when no file can be maintained). If the code block lacks a copy control, tell the PM to select and copy its contents; do not claim a button exists. Do not present "Copy rendered preview" as equivalent to copying raw Markdown. Never fabricate a successful file, preview, clipboard action or GitLab write.

**Clarification history placement:** Keep one YAML frontmatter block at the start of the file. Append the non-authoritative **`Harness Pilot Evaluation` with `Clarification Record` inside the same `.md` file, after the main PRD**, separated and collapsed via `<details>` when the client supports Markdown HTML. Never create a second Clarification Record file, print it as a separate chat appendix, or promote it to Product-authoritative sections. Display only `GitLab Wiki Path` separately as publishing metadata.

The durable output is the reconciled and final-normalized PRD. Semantic-normalization notes, ambiguity scans, retrieval notes, clarification transcripts, and reasoning do not require separate durable artifacts unless a demonstrated need justifies one.
