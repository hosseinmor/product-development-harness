import assert from "node:assert/strict";
import { MaterialDecisionCoverageGuard } from "./runtime-guardrails.js";

const missingCoreGuard = new MaterialDecisionCoverageGuard();
const missingCore = await missingCoreGuard.audit({
  pmIntent:
    "Introduce a capability that stores a person's answer with each submitted record and lets that person reuse a saved answer in later submissions.",
  currentProductContext: [],
  humanDecisions: [],
  prdMarkdown: `# Reusable answers

## Required Product Behavior

- A person can reuse a saved answer in a later submission.
- Each completed submission contains the answer supplied for that submission.

## Open Decisions

- The intended eligible population for the new reuse capability is unresolved.
- Whether editing the reusable answer changes an already-submitted historical record is unresolved.
`,
});
assert.equal(missingCore.audit.aligned, false);
assert.ok(missingCore.audit.blockers.length >= 2);
const missingCoreText = JSON.stringify(missingCore.audit.blockers);
assert.match(missingCoreText, /eligib|population|account/i);
assert.match(missingCoreText, /histor|prior|submitted|mutat|lifecycle/i);
assert.ok(
  missingCore.audit.blockers.every(
    (blocker) =>
      blocker.owner === "product" && blocker.material && blocker.blocking,
  ),
);

const nonBlockingGuard = new MaterialDecisionCoverageGuard();
const nonBlocking = await nonBlockingGuard.audit({
  pmIntent:
    "When the operation completes, hand the resulting record and its outcome to the existing downstream service for processing.",
  currentProductContext: [
    {
      url: "pk://handoff",
      title: "Current handoff",
      context: "The downstream service owns its internal processing policy after handoff.",
    },
  ],
  humanDecisions: [],
  prdMarkdown: `# Defined handoff

## Scope

- The completed record and its outcome are handed to the existing downstream service.

## Required Product Behavior

- The handoff occurs after the operation has produced its outcome.

## Acceptance Criteria

- A completed operation makes the record and outcome available to the downstream service.

## Open Decisions

- Exact user-interface placement and visual treatment remain open for Design.
- The downstream service owns its internal post-handoff policy.
- A non-core later communication policy remains open and does not change the defined handoff.
`,
});
assert.equal(nonBlocking.audit.aligned, true);
assert.equal(nonBlocking.audit.blockers.length, 0);
assert.ok(nonBlocking.audit.nonBlockingOpenDecisions.length >= 2);

const openDetailGuard = new MaterialDecisionCoverageGuard();
const openDetail = await openDetailGuard.audit({
  pmIntent:
    "Allow a person to attach one structured category to a completed operation. The category uses a Product-maintained, bounded, single-select option set and has no additional Product effect.",
  currentProductContext: [],
  humanDecisions: [],
  prdMarkdown: `# Structured category

## Scope

- A person can attach one category to a completed operation.

## Required Product Behavior

- The category is selected from a Product-maintained, bounded, single-select option set.
- The selected category is stored with the completed operation and has no additional Product effect.

## Acceptance Criteria

- A completed operation with a selected category preserves exactly one selected value.

## Open Decisions

- The exact members, labels, and ordering of the bounded option set remain Product-owned and unresolved.
`,
});
if (!openDetail.audit.aligned) {
  console.error(JSON.stringify({ openDetailDiagnostic: openDetail.audit }, null, 2));
}
assert.equal(openDetail.audit.aligned, true);
assert.equal(openDetail.audit.blockers.length, 0);
assert.ok(openDetail.audit.nonBlockingOpenDecisions.length >= 1);
assert.match(
  JSON.stringify(openDetail.audit.nonBlockingOpenDecisions),
  /members|labels|ordering|option/i,
);

const resolvedGuard = new MaterialDecisionCoverageGuard();
const resolved = await resolvedGuard.audit({
  pmIntent:
    "Introduce a capability that stores a person's answer with each submitted record and lets that person reuse a saved answer in later submissions.",
  currentProductContext: [],
  humanDecisions: [
    {
      question: "Who is eligible to reuse a saved answer?",
      answer: "Only the signed-in owner of the saved answer is eligible.",
    },
    {
      question: "Can a later saved-answer edit change a prior submitted record?",
      answer: "No. Each submitted record preserves the answer captured at submission.",
    },
    {
      question: "When is a saved answer eligible for reuse?",
      answer: "It may be reused only for the same stable question identifier.",
    },
    {
      question: "How is the reusable saved answer created or replaced?",
      answer:
        "On each completed submission, the current answer becomes the reusable answer for future submissions and replaces the prior reusable answer for the same stable question identifier.",
    },
    {
      question: "How is an eligible reusable answer applied in a later submission?",
      answer:
        "It is automatically prefilled, remains editable before submission, needs no separate confirmation, and the visible current value is submitted.",
    },
  ],
  prdMarkdown: `# Reusable answers

## Scope

- Reuse is available only to the signed-in owner of the saved answer.

## Required Product Behavior

- The owner can reuse the saved answer only for the same stable question identifier.
- An eligible reusable answer is automatically prefilled, remains editable before submission, needs no separate confirmation, and the visible current value is submitted.
- On each completed submission, its current answer replaces the reusable answer for future submissions with the same stable question identifier.
- Every submitted record preserves the answer captured at its own submission time.

## Acceptance Criteria

- Editing a saved answer leaves all prior submitted records unchanged.
`,
});
if (!resolved.audit.aligned) {
  console.error(JSON.stringify({ resolvedDiagnostic: resolved.audit }, null, 2));
}
assert.equal(resolved.audit.aligned, true);
assert.equal(resolved.audit.blockers.length, 0);

console.log(
  JSON.stringify(
    {
      missingCore: missingCore.audit,
      nonBlocking: nonBlocking.audit,
      openDetail: openDetail.audit,
      resolved: resolved.audit,
      isolation: [missingCore, nonBlocking, openDetail, resolved].map(
        (result) => result.isolation,
      ),
    },
    null,
    2,
  ),
);
