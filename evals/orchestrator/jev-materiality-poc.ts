import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

type Classification =
  | "BLOCKING_PRODUCT_DECISION"
  | "NON_BLOCKING_PRODUCT_UNCERTAINTY"
  | "DESIGN_OWNED";

type MaterialityCase = {
  id: string;
  expected: Classification;
  pmIntent: string;
  prdMarkdown: string;
  humanDecisions: Array<{ question: string; answer: string }>;
  question: string;
  whyMaterial: string;
};

const cases: MaterialityCase[] = [
  {
    id: "required-core-action",
    expected: "BLOCKING_PRODUCT_DECISION",
    pmIntent: "Add a bounded feedback capability to an existing core action.",
    prdMarkdown: `# Draft

## Scope

- The semantic input model is a predefined catalog.

## Assumptions & Open Decisions

- Exact catalog values remain unresolved.
- Whether feedback is required to complete the core action remains unresolved.`,
    humanDecisions: [
      {
        question: "What semantic input model is supported?",
        answer: "A predefined catalog is supported.",
      },
    ],
    question: "Is the feedback action required to complete the core flow?",
    whyMaterial: "It changes whether the core action may complete without feedback.",
  },
  {
    id: "exact-option-taxonomy",
    expected: "NON_BLOCKING_PRODUCT_UNCERTAINTY",
    pmIntent: "Add a bounded feedback capability to an existing core action.",
    prdMarkdown: `# Draft

## Scope

- The semantic input model is a predefined catalog.

## Assumptions & Open Decisions

- Exact catalog values remain unresolved.`,
    humanDecisions: [
      {
        question: "What semantic input model is supported?",
        answer: "A predefined catalog is supported.",
      },
    ],
    question: "What exact option taxonomy belongs in the established catalog?",
    whyMaterial: "Product owns the eventual values, but the bounded catalog model is already established.",
  },
  {
    id: "modal-vs-popover",
    expected: "DESIGN_OWNED",
    pmIntent: "Add a bounded feedback capability to an existing core action.",
    prdMarkdown: `# Draft

## Scope

- The semantic input model is a predefined catalog.

## Required Product Behavior

- The user can choose one value from the catalog before submitting feedback.`,
    humanDecisions: [],
    question: "Should the catalog open in a modal or popover?",
    whyMaterial: "The established Product behavior is unchanged; only presentation is unresolved.",
  },
  {
    id: "record-association-same-behavior",
    expected: "NON_BLOCKING_PRODUCT_UNCERTAINTY",
    pmIntent:
      "Capture one structured value with a completed operation while preserving the same established Product meaning and effects.",
    prdMarkdown: `# Structured capture

## Required Product Behavior

- The structured value is captured with the completed operation.
- Its meaning, availability, Product effects, scope, and lifecycle are the same regardless of internal record association.

## Assumptions & Open Decisions

- Whether persistence associates the value with the subject record or operation record remains unresolved.`,
    humanDecisions: [],
    question:
      "Should persistence associate the captured value with the subject record or the operation record?",
    whyMaterial:
      "Multiple durable record models are possible, but required observable Product behavior is unchanged.",
  },
  {
    id: "identity-changes-persistence",
    expected: "BLOCKING_PRODUCT_DECISION",
    pmIntent:
      "Preserve a reusable preference so a returning person can use it in later sessions.",
    prdMarkdown: `# Reusable preference

## Assumptions & Open Decisions

- Whether the preference belongs to an account or a device remains unresolved.`,
    humanDecisions: [],
    question: "Is the reusable preference identified by account or by device?",
    whyMaterial:
      "The answer changes cross-device availability, ownership, persistence, and lifecycle behavior.",
  },
  {
    id: "unsupported-extra-identity",
    expected: "NON_BLOCKING_PRODUCT_UNCERTAINTY",
    pmIntent:
      "Capture a structured value with a completed operation and make that value available with the completed record.",
    prdMarkdown: `# Structured value

## Scope

- The structured value is captured with the completed operation.

## Required Product Behavior

- The captured value is available with the completed record.

## Assumptions & Open Decisions

- A previously unsupported separate interaction-record identity remains omitted; whether to add it remains unresolved.`,
    humanDecisions: [],
    question:
      "Must the capability additionally create a separate durable interaction-record identity?",
    whyMaterial:
      "The extra identity is not required to specify the already-authorized observable capability.",
  },
  {
    id: "immediate-ui-reflection",
    expected: "DESIGN_OWNED",
    pmIntent: "Let a user dismiss an item from a recurring personalized collection.",
    prdMarkdown: `# Dismissal

## Required Product Behavior

- Dismissing an item durably suppresses it from future eligible collections.
- The durable state change occurs when the dismissal action succeeds.

## Assumptions & Open Decisions

- The immediate reflection of that established state in the current view remains unresolved.`,
    humanDecisions: [],
    question:
      "After durable suppression succeeds, should the item disappear from the current view immediately or remain until refresh or navigation?",
    whyMaterial:
      "The durable Product state is already established; only its immediate UI reflection is unresolved.",
  },
];

const options: Record<Classification, string> = {
  BLOCKING_PRODUCT_DECISION:
    "Product owns the unresolved decision and Design cannot proceed without inventing materially different current scope, eligibility, lifecycle, core behavior, required Product effects, or acceptance semantics.",
  NON_BLOCKING_PRODUCT_UNCERTAINTY:
    "Product owns the unresolved decision, but it can remain explicit and bounded while Design proceeds without selecting materially different current Product behavior.",
  DESIGN_OWNED:
    "The unresolved choice is an experience, presentation, or interaction decision for already-established Product semantics and belongs to Design.",
};

const sharedInstruction = `
Classify clarification materiality for exactly one case identified by id.
Product ownership alone is not enough to make a question blocking.
Use BLOCKING_PRODUCT_DECISION only if leaving the question unanswered would force Design to invent materially different Product intent, behavior, scope, eligibility, lifecycle, required Product effects, or acceptance semantics.
Use NON_BLOCKING_PRODUCT_UNCERTAINTY when Product owns the decision but Design can proceed while it stays explicit and bounded.
Use DESIGN_OWNED when durable Product semantics are established and the unresolved choice is how to present or interact with them.
Do not answer the Product question itself.
`.trim();

const state = {
  purpose: "Job Vision Product Development Harness clarification-materiality regression POC",
  cases: cases.map(({ expected: _expected, ...testCase }) => testCase),
};

const questions = Object.fromEntries(
  cases.map((testCase) => [
    testCase.id,
    choice(
      `${sharedInstruction}

Classify only the case whose id is "${testCase.id}".`,
      options,
    ),
  ]),
);

const client = new TypeSafeClient();
const started = performance.now();
const response = await client.systemOne({ state, questions });
const latencyMs = Math.round(performance.now() - started);

const results = cases.map((testCase) => {
  const answer = response.answers[testCase.id] as {
    choice: Classification;
    confidence: number;
    probabilities: Record<Classification, number>;
  };
  return {
    id: testCase.id,
    expected: testCase.expected,
    predicted: answer.choice,
    correct: answer.choice === testCase.expected,
    confidence: answer.confidence,
    probabilities: answer.probabilities,
  };
});

const correct = results.filter((result) => result.correct).length;
const total = results.length;

console.log(
  JSON.stringify(
    {
      experiment: "jev-clarification-materiality-poc",
      model: response.model,
      summary: {
        correct,
        total,
        accuracy: correct / total,
        latencyMs,
      },
      usage: response.usage,
      results,
      notes: [
        "Synthetic regression cases only; no Job Vision private Product Knowledge is sent.",
        "Expected labels come from current Harness clarification-materiality semantics.",
        "This experiment does not set an automation confidence threshold.",
      ],
    },
    null,
    2,
  ),
);
