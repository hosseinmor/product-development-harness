import assert from "node:assert/strict";
import {
  ClarificationMaterialityGuard,
  runtimeGuardrailConfig,
  type GuardrailProductQuestion,
} from "./runtime-guardrails.js";

const questions: GuardrailProductQuestion[] = [
  {
    question:
      "Must the supplemental verification action be completed before the user can submit the core request?",
    whyMaterial: "It determines whether the core flow may complete.",
  },
  {
    question:
      "Which exact labels and values belong in the already-established predefined option catalog?",
    whyMaterial: "Product owns the eventual catalog content.",
  },
  {
    question: "Should the option catalog be presented in a modal or a popover?",
    whyMaterial: "The exact interaction remains unresolved.",
  },
  {
    question:
      "Does activating the state irreversibly remove access, or can the user reverse it later?",
    whyMaterial: "The lifecycle materially changes user access and recovery.",
  },
];

const guard = new ClarificationMaterialityGuard();
const result = await guard.audit({
  pmIntent:
    "Add supplemental structured feedback to an existing core action while keeping the flow usable.",
  currentProductContext: [
    {
      url: "pk://current-core-action",
      title: "Current core action",
      context:
        "The current action exists. Current context does not establish intended completion, presentation, or lifecycle rules for the new feedback capability.",
    },
  ],
  prdMarkdown: `# Supplemental structured feedback

## Scope

- The semantic input model is a predefined option catalog.

## Assumptions & Open Decisions

- Exact catalog labels and values remain unresolved.
- Exact presentation remains open for Design.`,
  humanDecisions: [
    {
      question: "What semantic input model is supported?",
      answer: "Use a predefined option catalog; exact values are not yet established.",
    },
  ],
  questions,
});

const classifications = result.audit.results.map(({ classification }) => classification);
assert.deepEqual(classifications, [
  "BLOCKING_PRODUCT_DECISION",
  "NON_BLOCKING_PRODUCT_UNCERTAINTY",
  "DESIGN_OWNED",
  "BLOCKING_PRODUCT_DECISION",
]);
assert.equal(result.audit.passed, false);
assert.equal(result.isolation.passed, true);
assert.equal(result.isolation.networkAccessEnabled, false);
assert.equal(guard.metrics.semanticAuditCallCount, 1);
assert.equal(guard.metrics.blockingQuestions, 2);
assert.equal(guard.metrics.nonBlockingProductQuestions, 1);
assert.equal(guard.metrics.designOwnedQuestions, 1);

const unresolvedDurableSemantics = await guard.audit({
  pmIntent: "Let a user dismiss an item from a recurring personalized collection.",
  currentProductContext: [],
  prdMarkdown: `# Dismissal

## Assumptions & Open Decisions

- Whether dismissal durably suppresses the item from future eligible collections remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "After dismissal, must the same item remain ineligible for future collections, or may it become eligible again?",
      whyMaterial: "The answer establishes durable suppression and lifecycle semantics.",
    },
  ],
});
assert.equal(
  unresolvedDurableSemantics.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

const immediateUiReflection = await guard.audit({
  pmIntent: "Let a user dismiss an item from a recurring personalized collection.",
  currentProductContext: [],
  prdMarkdown: `# Dismissal

## Required Product Behavior

- A dismissed item is durably ineligible for future collections until the user reverses the dismissal.

## Assumptions & Open Decisions

- The immediate transition in the current view remains open for Design.`,
  humanDecisions: [
    {
      question: "What durable effect does dismissal have on the same item?",
      answer:
        "The item remains ineligible for future collections until the user reverses the dismissal.",
    },
  ],
  questions: [
    {
      question:
        "Should the dismissed item disappear from the current view immediately, or remain visible until refresh or navigation?",
      whyMaterial:
        "The durable state is established; only its immediate reflection in the current UI remains open.",
    },
  ],
});
assert.equal(
  immediateUiReflection.audit.results[0]?.classification,
  "DESIGN_OWNED",
);

const presentationThatChangesBehavior = await guard.audit({
  pmIntent: "Let a user dismiss an item from a recurring personalized collection.",
  currentProductContext: [],
  prdMarkdown: `# Dismissal

## Assumptions & Open Decisions

- The durable access consequence of dismissal remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Should the dismissal presentation only collapse the item until refresh, or permanently remove the user's ability to access that item?",
      whyMaterial:
        "Although phrased as presentation, the alternatives change durable access capability and state.",
    },
  ],
});
assert.equal(
  presentationThatChangesBehavior.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

const hypotheticalAdditionalEffect = await guard.audit({
  pmIntent:
    "Capture structured feedback alongside an existing completed action so the feedback is available for later product learning.",
  currentProductContext: [],
  prdMarkdown: `# Structured feedback

## Required Product Behavior

- The user can record structured feedback alongside the existing action.
- The captured feedback is available for later product learning.

## Assumptions & Open Decisions

- Possible future automated effects of the feedback remain outside the established behavior.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Should recording the feedback additionally change the eligibility of other items in the user's collection?",
      whyMaterial:
        "Adding the effect would change behavior, but feedback capture does not require it.",
    },
  ],
});
assert.equal(
  hypotheticalAdditionalEffect.audit.results[0]?.classification,
  "NON_BLOCKING_PRODUCT_UNCERTAINTY",
);

const requiredEffectWithUnresolvedSemantics = await guard.audit({
  pmIntent:
    "Use the captured feedback to make related items ineligible for future inclusion in the user's collection.",
  currentProductContext: [],
  prdMarkdown: `# Feedback-driven eligibility

## Required Product Behavior

- Captured feedback changes future eligibility of related items.

## Assumptions & Open Decisions

- Which relationship makes an item ineligible remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Which related items must become ineligible after feedback is recorded: only items sharing the same source, or all items in the same category?",
      whyMaterial:
        "The required eligibility effect cannot be implemented without defining its semantic boundary.",
    },
  ],
});
assert.equal(
  requiredEffectWithUnresolvedSemantics.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

const unresolvedCoreBehavior = await guard.audit({
  pmIntent:
    "Add a required validation step to the core request flow before the request is completed.",
  currentProductContext: [],
  prdMarkdown: `# Core request validation

## Assumptions & Open Decisions

- Completion behavior when validation fails remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "When validation fails, does the core request still complete, or must completion be blocked until validation succeeds?",
      whyMaterial:
        "The authorized core flow cannot be specified without choosing its completion behavior.",
    },
  ],
});
assert.equal(
  unresolvedCoreBehavior.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

const unchangedBehaviorStorageAssociation = await guard.audit({
  pmIntent:
    "Capture one structured value with a completed operation so it has the same established Product meaning and effect regardless of internal record association.",
  currentProductContext: [],
  prdMarkdown: `# Structured capture

## Scope

- One structured value is captured with the completed operation.

## Required Product Behavior

- The captured value has the same meaning, availability, and Product effect regardless of its internal record association.

## Acceptance Criteria

- Completing the operation preserves the selected value with the same observable behavior.

## Open Decisions

- Whether persistence associates the value with the subject record or the operation record remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Should persistence associate the captured value with the subject record or the operation record?",
      whyMaterial:
        "Multiple durable record models are possible, but required observable Product behavior is unchanged.",
    },
  ],
});
assert.equal(
  unchangedBehaviorStorageAssociation.audit.results[0]?.classification,
  "NON_BLOCKING_PRODUCT_UNCERTAINTY",
);

const observableIdentityBoundary = await guard.audit({
  pmIntent:
    "Preserve a reusable preference so a returning person can use it in later sessions.",
  currentProductContext: [],
  prdMarkdown: `# Reusable preference

## Open Decisions

- Whether the preference belongs to an account or a device remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Is the reusable preference identified by account or by device?",
      whyMaterial:
        "The answer changes cross-device availability, ownership, and persistence lifecycle.",
    },
  ],
});
assert.equal(
  observableIdentityBoundary.audit.results[0]?.classification,
  "BLOCKING_PRODUCT_DECISION",
);

const authorityRejectedUnnecessaryDetail = await guard.audit({
  pmIntent:
    "Capture a structured value with a completed operation and make that value available with the completed record.",
  currentProductContext: [],
  prdMarkdown: `# Structured value

## Scope

- The structured value is captured with the completed operation.

## Required Product Behavior

- The captured value is available with the completed record.

## Acceptance Criteria

- A completed record exposes its captured value.

## Open Decisions

- Draft Authority removed an unsupported claim requiring a separate durable interaction-record identity; whether to add that unnecessary identity remains unresolved.`,
  humanDecisions: [],
  questions: [
    {
      question:
        "Must the capability additionally create a separate durable interaction-record identity?",
      whyMaterial:
        "The detail was removed for lacking authority, but the authorized capability can be specified without it.",
    },
  ],
});
assert.equal(
  authorityRejectedUnnecessaryDetail.audit.results[0]?.classification,
  "NON_BLOCKING_PRODUCT_UNCERTAINTY",
);

console.log(
  JSON.stringify(
    {
      passed: true,
      featureAgnostic: true,
      config: runtimeGuardrailConfig,
      classifications,
      durableUiBoundaryClassifications: {
        unresolvedDurableSemantics:
          unresolvedDurableSemantics.audit.results[0]?.classification,
        immediateUiReflection:
          immediateUiReflection.audit.results[0]?.classification,
        presentationThatChangesBehavior:
          presentationThatChangesBehavior.audit.results[0]?.classification,
      },
      additionalEffectClassifications: {
        hypotheticalAdditionalEffect:
          hypotheticalAdditionalEffect.audit.results[0]?.classification,
        requiredEffectWithUnresolvedSemantics:
          requiredEffectWithUnresolvedSemantics.audit.results[0]?.classification,
        unresolvedCoreBehavior:
          unresolvedCoreBehavior.audit.results[0]?.classification,
      },
      observableConsequenceClassifications: {
        unchangedBehaviorStorageAssociation:
          unchangedBehaviorStorageAssociation.audit.results[0]?.classification,
        observableIdentityBoundary:
          observableIdentityBoundary.audit.results[0]?.classification,
        authorityRejectedUnnecessaryDetail:
          authorityRejectedUnnecessaryDetail.audit.results[0]?.classification,
      },
      hiddenFixtureDataAvailable: false,
      isolation: {
        baseline: result.isolation,
        unresolvedDurableSemantics: unresolvedDurableSemantics.isolation,
        immediateUiReflection: immediateUiReflection.isolation,
        presentationThatChangesBehavior: presentationThatChangesBehavior.isolation,
        hypotheticalAdditionalEffect: hypotheticalAdditionalEffect.isolation,
        requiredEffectWithUnresolvedSemantics:
          requiredEffectWithUnresolvedSemantics.isolation,
        unresolvedCoreBehavior: unresolvedCoreBehavior.isolation,
        unchangedBehaviorStorageAssociation:
          unchangedBehaviorStorageAssociation.isolation,
        observableIdentityBoundary: observableIdentityBoundary.isolation,
        authorityRejectedUnnecessaryDetail:
          authorityRejectedUnnecessaryDetail.isolation,
      },
      metrics: guard.metrics,
    },
    null,
    2,
  ),
);
