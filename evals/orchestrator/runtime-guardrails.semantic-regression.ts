import assert from "node:assert/strict";
import {
  AuthorityLedgerGuard,
  auditClarificationAtomicity,
  createAuthorityLedger,
  extendAuthorityLedger,
  runtimeGuardrailConfig,
  type AuthorityClaimSidecar,
} from "./runtime-guardrails.js";

const atomicity = await auditClarificationAtomicity([
  {
    question: "Should answers affect status, score, or ranking?",
    whyMaterial: "Each effect changes a different Product consequence.",
  },
  {
    question:
      "Should a previous answer be prefilled and editable, shown for confirmation, or submitted automatically?",
    whyMaterial: "The options package multiple behaviors.",
  },
  {
    question: "Should all fields be required, all optional, or configurable per field?",
    whyMaterial: "Requiredness changes completion semantics.",
  },
]);
assert.equal(atomicity.audit.results[0]?.atomic, false);
assert.ok((atomicity.audit.results[0]?.independentAxes.length ?? 0) >= 2);
assert.equal(atomicity.audit.results[1]?.atomic, false);
assert.ok((atomicity.audit.results[1]?.independentAxes.length ?? 0) >= 2);
assert.equal(atomicity.audit.results[2]?.atomic, true);
assert.equal(atomicity.isolation.passed, true);

const pmIntent =
  "Introduce supplemental questions whose answers accompany a submitted request and are available to the Employer for review.";
let ledger = createAuthorityLedger(pmIntent);
ledger = extendAuthorityLedger(ledger, [
  { question: "Requiredness?", answer: "All supplemental questions are required." },
  { question: "Reuse?", answer: "Saved answers are reused in future requests." },
  {
    question: "Automation capability?",
    answer: "A valid submitted answer may trigger an automated action.",
  },
]);
const currentProductContext = [
  {
    url: "pk://current-submission",
    title: "Current submission channels",
    context:
      "The current adjacent submission flow is signed-in and internal-only; link-out uses another channel.",
  },
  {
    url: "pk://current-permissions",
    title: "Current object permissions",
    context: "Permission X controls editing the current object.",
  },
];
const claims = {
  intent:
    "[C_INTENT] Supplemental answers accompany the submitted request and are available to the Employer for review.",
  internal: "[C_INTERNAL] The new capability is available only internally to signed-in users.",
  required: "[C_REQUIRED] All supplemental questions are required.",
  blocking: "[C_BLOCK] A missing required answer blocks submission.",
  reuse: "[C_REUSE] A saved answer is reused in future requests.",
  history: "[C_HISTORY] Historical request answers are immutable.",
  automation: "[C_AUTOMATION] A valid submitted answer may trigger an automated action.",
  timing: "[C_TIMING] The automated action runs only after request creation.",
  permission: "[C_PERMISSION] Only actors with permission X can use the new capability.",
} as const;
const prdMarkdown = `# Supplemental questions

## Scope

- ${claims.intent}
- ${claims.internal}

## Required Product Behavior

- ${claims.required}
- ${claims.blocking}
- ${claims.reuse}
- ${claims.history}
- ${claims.automation}
- ${claims.timing}

## Acceptance Criteria

- ${claims.permission}
`;

function sidecar(
  claim: string,
  section: AuthorityClaimSidecar["section"],
  authorityRefs: string[],
  authorityType: AuthorityClaimSidecar["authorityType"],
  derived = false,
): AuthorityClaimSidecar {
  return { claim, section, authorityRefs, authorityType, derived };
}

const initialSidecar: AuthorityClaimSidecar[] = [
  sidecar(claims.intent, "Scope", ["PM-001"], "explicit_intent"),
  sidecar(claims.internal, "Scope", ["PM-001"], "current_product_constraint", true),
  sidecar(claims.required, "Required Product Behavior", ["HD-001"], "human_decision"),
  sidecar(claims.blocking, "Required Product Behavior", ["HD-001"], "human_decision"),
  sidecar(claims.reuse, "Required Product Behavior", ["HD-002"], "human_decision"),
  sidecar(claims.history, "Required Product Behavior", ["HD-002"], "human_decision"),
  sidecar(claims.automation, "Required Product Behavior", ["HD-003"], "human_decision"),
  sidecar(claims.timing, "Required Product Behavior", ["HD-003"], "human_decision"),
  sidecar(
    claims.permission,
    "Acceptance Criteria",
    ["PM-001"],
    "current_product_constraint",
    true,
  ),
];

const guard = new AuthorityLedgerGuard();
const unsupported = await guard.audit({
  ledger,
  claims: initialSidecar,
  currentProductContext,
  prdMarkdown,
  phase: "initial",
});
const unsupportedByTag = new Map(
  unsupported.audit.claims.map((claim) => [claim.claim.match(/\[(C_[A-Z]+)\]/)?.[1], claim]),
);
for (const tag of ["C_BLOCK", "C_HISTORY", "C_TIMING", "C_INTERNAL", "C_PERMISSION"]) {
  assert.equal(unsupportedByTag.get(tag)?.validPromotion, false, tag);
}
for (const tag of ["C_INTENT", "C_REQUIRED", "C_REUSE", "C_AUTOMATION"]) {
  assert.equal(unsupportedByTag.get(tag)?.validPromotion, true, tag);
}
assert.equal(unsupported.audit.passed, false);
assert.equal(unsupported.isolation.passed, true);

ledger = extendAuthorityLedger(ledger, [
  {
    question: "Missing-answer consequence?",
    answer: "A missing required answer blocks submission.",
  },
  {
    question: "Historical update behavior?",
    answer: "Historical request answers are immutable.",
  },
  {
    question: "Automation timing?",
    answer: "The automated action runs only after request creation.",
  },
  {
    question: "New-capability channel scope?",
    answer: "The new capability is internal-only and requires a signed-in user.",
  },
  {
    question: "New-capability permission?",
    answer: "Permission X governs use of the new capability.",
  },
]);
const independentlyAuthorized = await guard.audit({
  ledger,
  claims: initialSidecar.map((claim) => {
    const newRefs: Record<string, string> = {
      [claims.blocking]: "HD-004",
      [claims.history]: "HD-005",
      [claims.timing]: "HD-006",
      [claims.internal]: "HD-007",
      [claims.permission]: "HD-008",
    };
    const authorityRef = newRefs[claim.claim];
    return authorityRef
      ? { ...claim, authorityRefs: [authorityRef], authorityType: "human_decision", derived: false }
      : claim;
  }),
  currentProductContext,
  prdMarkdown,
  phase: "reconciliation",
});
assert.equal(independentlyAuthorized.audit.passed, true);
assert.equal(independentlyAuthorized.isolation.passed, true);
assert.equal(independentlyAuthorized.instrumentation.cacheHits, 4);
assert.equal(independentlyAuthorized.instrumentation.semanticClaimsSubmitted, 5);

console.log(
  JSON.stringify(
    {
      passed: true,
      config: runtimeGuardrailConfig,
      atomicity: { compoundRejected: 2, atomicAccepted: 1 },
      authority: {
        explicitIntentAccepted: true,
        unsupportedPromotionsRejected: [
          "requiredness -> submission blocking",
          "future reuse -> historical immutability",
          "automation capability -> trigger timing",
          "current internal channel -> intended internal-only scope",
          "current permission X -> new-capability permission X",
        ],
        independentlyAuthorizedPromotionsAccepted: true,
        unchangedAcceptedClaimsReusedFromCache: independentlyAuthorized.instrumentation.cacheHits,
        semanticClaimsCheckedAfterNewAuthority:
          independentlyAuthorized.instrumentation.semanticClaimsSubmitted,
      },
      metrics: guard.metrics,
      isolation: {
        atomicity: atomicity.isolation,
        unsupportedAuthority: unsupported.isolation,
        authorizedAuthority: independentlyAuthorized.isolation,
      },
    },
    null,
    2,
  ),
);
