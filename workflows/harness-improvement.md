# Harness Improvement Workflow

## Purpose

Turn observed failures, friction, or review feedback from real product-development work into the smallest justified durable improvement to the Harness.

The goal is continuous improvement without expanding the Harness for every execution mistake.

## Inputs

- An observed failure, friction point, or review finding from product-development work.
- The relevant current Harness rules, workflow, artifact contract, or eval case.
- Enough run context to understand what actually happened.

Do not require a separate failure log or improvement artifact.

## Workflow

### 1. Diagnose the observation

Identify what failed or created material friction and what behavior was expected instead.

Use the smallest amount of run context needed to make the diagnosis defensible.

During a controlled Pilot or Eval run, do not modify the Harness mid-run unless the experiment explicitly intends live adaptation. Observe the failure and improve the Harness after the run.

### 2. Distinguish execution mistake from Harness gap

Determine whether the observation represents:

- **Execution mistake** — the existing Harness already required the correct behavior, but the Agent failed to follow it.
- **Harness gap** — the existing Harness does not sufficiently establish the required behavior.
- **Deliberate workflow improvement** — the existing behavior is understood, but a human wants the Harness to work differently going forward.

An execution mistake alone does not justify changing the Harness.

Do not duplicate an existing rule merely to compensate for one Agent failure.

### 3. Identify the smallest owning Harness layer

Prefer changing the existing layer that owns the behavior:

- navigation or task routing → `AGENTS.md`
- shared invariant → `shared-harness-contract.md`
- workflow-specific execution → the relevant workflow
- durable output expectation → the relevant artifact contract
- recurrence protection for an observed failure → `evals/cases/`

Do not introduce a new file, layer, schema, tool, or abstraction unless an existing owning layer cannot represent the needed behavior and the need is demonstrated.

### 4. Propose the smallest justified change

Describe:

- the diagnosed gap or intended behavior change,
- the smallest owning layer,
- the exact proposed patch,
- and why existing rules are insufficient when a Harness change is being proposed.

Avoid unrelated cleanup or speculative architecture.

### 5. Human decides whether Harness behavior changes

AI may diagnose, challenge, recommend, and draft changes.

AI must not establish new Harness behavior without a human decision.

If the human decides no Harness change is needed, preserve the existing Harness and treat the observation as an execution issue or local learning.

### 6. Apply and reconcile the approved patch

Apply only the approved change to the owning Harness layer.

Check materially related Harness content for contradiction or stale wording, but do not broaden the patch merely for consistency theater.

### 7. Decide whether regression protection is warranted

Add or update a Regression eval only when an observed failure represents a stable Harness invariant worth protecting from recurrence.

Not every Harness change requires a Regression eval.

Do not create a Regression eval solely because a file changed.

## Output

The durable output is the approved patch to the existing Harness and, when justified, a Regression eval.

No failure log, decision ledger, improvement report, or separate improvement artifact is required.
