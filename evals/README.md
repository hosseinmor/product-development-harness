# Harness Evals

## Purpose

This directory stores Regression evals for real, important failures in Product Development Harness usage that are worth protecting from recurrence.

Each eval should originate from an observed failure or a demonstrated recurrence risk grounded in real product-development work. Speculative Capability evals are not maintained in the current eval bank.

## Relationship to the Harness

Evals do not define new Harness rules. `shared-harness-contract.md`, the relevant workflow, and the relevant artifact contract remain authoritative.

Regression evals protect existing Harness behavior from recurrence of known failures; they do not extend or override that behavior.

## Review and grading

Evaluation should focus on the semantic outcome and protected invariant rather than exact wording, hidden reasoning, or a prescribed tool sequence.

Routine human review is not required. Human review may be used occasionally for calibration when useful.

## Current non-goals

The current eval bank does not define a runner, CLI, CI integration, grading infrastructure, scores, dashboards, automation, or a broader Capability eval suite.

If real usage later demonstrates a need for broader Capability evals or automation, they can be added then.
