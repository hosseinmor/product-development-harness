# Harness Evals

## Purpose

This directory is a small, durable bank of repeatable cases for evaluating important Product Development Harness behaviors.

Cases test observable outcomes and invariants. They do not prescribe chain-of-thought, exact wording, tool sequence, or provider-specific execution.

## Capability vs Regression

- **Capability** evals test whether a representative scenario exhibits an intended Harness behavior.
- **Regression** evals preserve a previously observed failure as a repeatable case so the same failure does not recur.

## Case anatomy

Each case defines:

- Purpose
- Eval type
- Scenario / Inputs
- Expected invariants
- Explicit failure conditions
- Recommended grading approach

Each case should be self-contained and test one primary behavior.

## Grading principles

Grading should evaluate semantic outcomes and stated invariants rather than exact phrasing or hidden reasoning.

The recommended grading approach must be one of:

- `deterministic`
- `LLM judge`
- `hybrid`

Routine evals should not require human review. Human review may be used occasionally to calibrate grading behavior.

No scores, weights, aggregate thresholds, or percentages are defined in the current eval bank.

## Relationship to Harness contracts

Evals do not define new Harness rules. `shared-harness-contract.md`, the relevant workflow, and the relevant artifact contract remain authoritative.

If an eval conflicts with those sources, the Harness source should be corrected or the eval should be updated; the eval does not override the Harness.

## Current non-goals

The current eval bank does not define a runner, CLI, CI integration, case schema, grader library, fixtures layer, provider integration, dashboard, or external eval platform.
