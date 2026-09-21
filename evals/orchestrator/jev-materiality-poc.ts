import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

type Classification =
  | "BLOCKING_PRODUCT_DECISION"
  | "NON_BLOCKING_PRODUCT_UNCERTAINTY"
  | "DESIGN_OWNED";

type MaterialityCase = {
  id: string;
  expected: Classification;
  pmIntent: string;
  currentProductContext: Array<{ url: string; title: string; context: string }>;
  prdMarkdown: string;
  humanDecisions: Array<{ question: string; answer: string }>;
  question: string;
  whyMaterial: string;
};

const cases: MaterialityCase[] = [
  {
    id: "supplemental-verification-blocks-core-submit",
    expected: "BLOCKING_PRODUCT_DECISION",
    pmIntent:
      "Add supplemental structured feedback to an existing core action while keeping the flow usable.",
    currentProductContext: [
      {
        url: "pk://synthetic-current-core-action",
        title: "Synthetic current core action",
        context:
          "The current action exists. This synthetic context does not establish intended completion, presentation, or lifecycle rules for the new feedback capability.",
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
    question:
      "Must the supplemental verification action be completed before the user can submit the core request?",
    whyMaterial: "It determines whether the core flow may complete.",
  },
  {
    id: "exact-catalog-labels",
    expected: "NON_BLOCKING_PRODUCT_UNCERTAINTY",
    pmIntent:
      "Add supplemental structured feedback to an existing core action while keeping the flow usable.",
    currentProductContext: [],
    prdMarkdown: `# Supplemental structured feedback

## Scope

- The semantic input model is a predefined option catalog.

## Assumptions & Open Decisions

- Exact catalog labels and values remain unresolved.`,
    humanDecisions: [
      {
        question: "What semantic input model is supported?",
        answer: "Use a predefined option catalog; exact values are not yet established.",
      },
    ],
    question:
      "Which exact labels and values belong in the already-established predefined option catalog?",
    whyMaterial: "Product owns the eventual catalog content.",
  },
  {
    id: "modal-vs-popover",
    expected: "DESIGN_OWNED",
    pmIntent:
      "Add supplemental structured feedback to an existing core action while keeping the flow usable.",
    currentProductContext: [],
    prdMarkdown: `# Supplemental structured feedback

## Scope

- The semantic input model is a predefined option catalog.

## Assumptions & Open Decisions

- Exact presentation remains open for Design.`,
    humanDecisions: [],
    question: "Should the option catalog be presented in a modal or a popover?",
    whyMaterial: "The exact interaction remains unresolved.",
  },
  {
    id: "irreversible-vs-reversible-state",
    expected: "BLOCKING_PRODUCT_DECISION",
    pmIntent:
      "Add a state-changing capability while preserving clear user control over its lifecycle.",
    currentProductContext: [],
    prdMarkdown: `# State change

## Assumptions & Open Decisions

- Whether the state can be reversed remains unresolved.`,
    humanDecisions: [],
    question:
      "Does activating the state irreversibly remove access, or can the user reverse it later?",
    whyMaterial: "The lifecycle materially changes user access and recovery.",
  },
  {
    id: "dismissal-durable-suppression",
    expected: "BLOCKING_PRODUCT_DECISION",
    pmIntent: "Let a user dismiss an item from a recurring personalized collection.",
    currentProductContext: [],
    prdMarkdown: `# Dismissal

## Assumptions & Open Decisions

- Whether dismissal durably suppresses the item from future eligible collections remains unresolved.`,
    humanDecisions: [],
    question:
      "After dismissal, must the same item remain ineligible for future collections, or may it become eligible again?",
    whyMaterial: "The answer establishes durable suppression and lifecycle semantics.",
  },
  {
    id: "dismissal-immediate-ui-reflection",
    expected: "DESIGN_OWNED",
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
    question:
      "Should the dismissed item disappear from the current view immediately, or remain visible until refresh or navigation?",
    whyMaterial:
      "The durable state is established; only its immediate reflection in the current UI remains open.",
  },
  {
    id: "presentation-that-changes-durable-access",
    expected: "BLOCKING_PRODUCT_DECISION",
    pmIntent: "Let a user dismiss an item from a recurring personalized collection.",
    currentProductContext: [],
    prdMarkdown: `# Dismissal

## Assumptions & Open Decisions

- The durable access consequence of dismissal remains unresolved.`,
    humanDecisions: [],
    question:
      "Should the dismissal presentation only collapse the item until refresh, or permanently remove the user's ability to access that item?",
    whyMaterial:
      "Although phrased as presentation, the alternatives change durable access capability and state.",
  },
  {
    id: "hypothetical-additional-eligibility-effect",
    expected: "NON_BLOCKING_PRODUCT_UNCERTAINTY",
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
    question:
      "Should recording the feedback additionally change the eligibility of other items in the user's collection?",
    whyMaterial:
      "Adding the effect would change behavior, but feedback capture does not require it.",
  },
  {
    id: "required-eligibility-effect-boundary",
    expected: "BLOCKING_PRODUCT_DECISION",
    pmIntent:
      "Use the captured feedback to make related items ineligible for future inclusion in the user's collection.",
    currentProductContext: [],
    prdMarkdown: `# Feedback-driven eligibility

## Required Product Behavior

- Captured feedback changes future eligibility of related items.

## Assumptions & Open Decisions

- Which relationship makes an item ineligible remains unresolved.`,
    humanDecisions: [],
    question:
      "Which related items must become ineligible after feedback is recorded: only items sharing the same source, or all items in the same category?",
    whyMaterial:
      "The required eligibility effect cannot be implemented without defining its semantic boundary.",
  },
  {
    id: "validation-failure-completion-semantics",
    expected: "BLOCKING_PRODUCT_DECISION",
    pmIntent:
      "Add a required validation step to the core request flow before the request is completed.",
    currentProductContext: [],
    prdMarkdown: `# Core request validation

## Assumptions & Open Decisions

- Completion behavior when validation fails remains unresolved.`,
    humanDecisions: [],
    question:
      "When validation fails, does the core request still complete, or must completion be blocked until validation succeeds?",
    whyMaterial:
      "The authorized core flow cannot be specified without choosing its completion behavior.",
  },
  {
    id: "storage-association-same-observable-behavior",
    expected: "NON_BLOCKING_PRODUCT_UNCERTAINTY",
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
    question:
      "Should persistence associate the captured value with the subject record or the operation record?",
    whyMaterial:
      "Multiple durable record models are possible, but required observable Product behavior is unchanged.",
  },
  {
    id: "account-vs-device-identity",
    expected: "BLOCKING_PRODUCT_DECISION",
    pmIntent:
      "Preserve a reusable preference so a returning person can use it in later sessions.",
    currentProductContext: [],
    prdMarkdown: `# Reusable preference

## Open Decisions

- Whether the preference belongs to an account or a device remains unresolved.`,
    humanDecisions: [],
    question: "Is the reusable preference identified by account or by device?",
    whyMaterial:
      "The answer changes cross-device availability, ownership, and persistence lifecycle.",
  },
  {
    id: "unsupported-extra-durable-identity",
    expected: "NON_BLOCKING_PRODUCT_UNCERTAINTY",
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
    question:
      "Must the capability additionally create a separate durable interaction-record identity?",
    whyMaterial:
      "The detail was removed for lacking authority, but the authorized capability can be specified without it.",
  },
  {
    id: "business-outcome-selects-current-scope",
    expected: "BLOCKING_PRODUCT_DECISION",
    pmIntent:
      "Create one v0 flow for one primary audience. If the primary Business Outcome is first-time activation, v0 serves new users through onboarding; if it is retention, v0 serves returning users through re-engagement. Only one of those scopes belongs in this version.",
    currentProductContext: [],
    prdMarkdown: `# Single-audience v0

## Assumptions & Open Decisions

- The primary Business Outcome remains unresolved.
- The selected outcome determines whether the current scope is onboarding for new users or re-engagement for returning users.`,
    humanDecisions: [],
    question:
      "Which primary Business Outcome defines this version: first-time activation or returning-user retention?",
    whyMaterial:
      "The authorized alternatives select different audiences, scope, and core flows for the current version.",
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

const rubric = `
Classify clarification materiality for exactly one case identified by id.
Product ownership alone is not enough to make a question blocking.
Use BLOCKING_PRODUCT_DECISION only if leaving the question unanswered would force Design to invent materially different Product intent, behavior, scope, eligibility, lifecycle, required Product effects, or acceptance semantics.
Use NON_BLOCKING_PRODUCT_UNCERTAINTY when Product owns the decision but Design can proceed while it stays explicit and bounded.
Use DESIGN_OWNED when durable Product semantics are established and the unresolved choice is how to present or interact with them.
A hypothetical extra Product effect is not blocking merely because adding it would change behavior.
An internal record-model choice is not blocking when observable Product meaning, effects, scope, lifecycle, eligibility, and acceptance behavior are unchanged.
Do not answer the Product question itself.
`.trim();

const state = {
  experiment: "clarification-materiality",
  rubric,
  cases: cases.map(({ expected: _expected, ...testCase }) => testCase),
};

const questions = Object.fromEntries(
  cases.map((testCase) => [
    testCase.id,
    choice(
      `Using the rubric in state, classify only the materiality case whose id is "${testCase.id}".`,
      options,
    ),
  ]),
);

const repetitions = 5;
const client = new TypeSafeClient();
const runs = [];
let totalInputTokens = 0;
let totalOutputTokens = 0;
let totalLatencyMs = 0;

for (let runIndex = 1; runIndex <= repetitions; runIndex += 1) {
  const started = performance.now();
  const response = await client.systemOne({ state, questions });
  const latencyMs = Math.round(performance.now() - started);
  totalLatencyMs += latencyMs;
  totalInputTokens += response.usage.input_tokens;
  totalOutputTokens += response.usage.output_tokens;

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

  runs.push({
    run: runIndex,
    model: response.model,
    latencyMs,
    usage: response.usage,
    correct: results.filter((result) => result.correct).length,
    total: results.length,
    results,
  });
}

const perCase = cases.map((testCase) => {
  const observations = runs.map((run) => {
    const result = run.results.find((item) => item.id === testCase.id)!;
    return {
      run: run.run,
      predicted: result.predicted,
      correct: result.correct,
      confidence: result.confidence,
    };
  });
  const correctRuns = observations.filter((item) => item.correct).length;
  const confidences = observations.map((item) => item.confidence);
  return {
    id: testCase.id,
    expected: testCase.expected,
    correctRuns,
    repetitions,
    stable: new Set(observations.map((item) => item.predicted)).size === 1,
    minConfidence: Math.min(...confidences),
    maxConfidence: Math.max(...confidences),
    observations,
  };
});

const totalDecisions = repetitions * cases.length;
const totalCorrect = runs.reduce((sum, run) => sum + run.correct, 0);

console.log(
  JSON.stringify(
    {
      experiment: "jev-clarification-materiality-expanded",
      sentToTypeSafe: {
        stateShape: {
          experiment: state.experiment,
          rubric,
          caseCount: cases.length,
          fieldsPerCase: [
            "id",
            "pmIntent",
            "currentProductContext",
            "prdMarkdown",
            "humanDecisions",
            "question",
            "whyMaterial",
          ],
        },
        questionCount: Object.keys(questions).length,
        answerType: "Choice over the three Harness materiality classifications",
        privateJobVisionProductKnowledgeIncluded: false,
      },
      summary: {
        repetitions,
        casesPerRun: cases.length,
        totalDecisions,
        totalCorrect,
        accuracy: totalCorrect / totalDecisions,
        stableCases: perCase.filter((item) => item.stable).length,
        totalCases: perCase.length,
        totalLatencyMs,
        averageApiLatencyMs: Math.round(totalLatencyMs / repetitions),
        totalInputTokens,
        totalOutputTokens,
      },
      perCase,
      runs,
    },
    null,
    2,
  ),
);
