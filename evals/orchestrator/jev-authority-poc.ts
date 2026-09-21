import { choice, TypeSafeClient } from "@typesafe-ai/sdk";

type YesNo = "YES" | "NO";

type AuthorityItem = {
  id: string;
  kind: "pm_intent" | "human_decision";
  statement: string;
  question: string | null;
};

type AuthorityCase = {
  id: string;
  claim: string;
  authorityType:
    | "explicit_intent"
    | "human_decision"
    | "necessary_implication"
    | "current_product_constraint";
  derived: boolean;
  citedAuthorities: AuthorityItem[];
  expectedValidPromotion: boolean;
  expectedNecessaryImplication?: boolean;
};

const pm001: AuthorityItem = {
  id: "PM-001",
  kind: "pm_intent",
  statement:
    "Introduce supplemental questions whose answers accompany a submitted request and are available to the Employer for review.",
  question: null,
};
const hd001: AuthorityItem = {
  id: "HD-001",
  kind: "human_decision",
  question: "Requiredness?",
  statement: "All supplemental questions are required.",
};
const hd002: AuthorityItem = {
  id: "HD-002",
  kind: "human_decision",
  question: "Reuse?",
  statement: "Saved answers are reused in future requests.",
};
const hd003: AuthorityItem = {
  id: "HD-003",
  kind: "human_decision",
  question: "Automation capability?",
  statement: "A valid submitted answer may trigger an automated action.",
};
const hd004: AuthorityItem = {
  id: "HD-004",
  kind: "human_decision",
  question: "Missing-answer consequence?",
  statement: "A missing required answer blocks submission.",
};
const hd005: AuthorityItem = {
  id: "HD-005",
  kind: "human_decision",
  question: "Historical update behavior?",
  statement: "Historical request answers are immutable.",
};
const hd006: AuthorityItem = {
  id: "HD-006",
  kind: "human_decision",
  question: "Automation timing?",
  statement: "The automated action runs only after request creation.",
};
const hd007: AuthorityItem = {
  id: "HD-007",
  kind: "human_decision",
  question: "New-capability channel scope?",
  statement: "The new capability is internal-only and requires a signed-in user.",
};
const hd008: AuthorityItem = {
  id: "HD-008",
  kind: "human_decision",
  question: "New-capability permission?",
  statement: "Permission X governs use of the new capability.",
};

const cases: AuthorityCase[] = [
  {
    id: "explicit-intent-direct-match",
    claim:
      "Supplemental answers accompany the submitted request and are available to the Employer for review.",
    authorityType: "explicit_intent",
    derived: false,
    citedAuthorities: [pm001],
    expectedValidPromotion: true,
  },
  {
    id: "current-channel-does-not-authorize-new-scope",
    claim: "The new capability is available only internally to signed-in users.",
    authorityType: "current_product_constraint",
    derived: true,
    citedAuthorities: [pm001],
    expectedValidPromotion: false,
    expectedNecessaryImplication: false,
  },
  {
    id: "requiredness-direct-match",
    claim: "All supplemental questions are required.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd001],
    expectedValidPromotion: true,
  },
  {
    id: "requiredness-does-not-imply-submission-block",
    claim: "A missing required answer blocks submission.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd001],
    expectedValidPromotion: false,
  },
  {
    id: "reuse-direct-match",
    claim: "A saved answer is reused in future requests.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd002],
    expectedValidPromotion: true,
  },
  {
    id: "future-reuse-does-not-imply-history-immutability",
    claim: "Historical request answers are immutable.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd002],
    expectedValidPromotion: false,
  },
  {
    id: "automation-capability-direct-match",
    claim: "A valid submitted answer may trigger an automated action.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd003],
    expectedValidPromotion: true,
  },
  {
    id: "automation-capability-does-not-imply-timing",
    claim: "The automated action runs only after request creation.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd003],
    expectedValidPromotion: false,
  },
  {
    id: "current-permission-does-not-authorize-new-permission",
    claim: "Only actors with permission X can use the new capability.",
    authorityType: "current_product_constraint",
    derived: true,
    citedAuthorities: [pm001],
    expectedValidPromotion: false,
    expectedNecessaryImplication: false,
  },
  {
    id: "submission-block-after-independent-decision",
    claim: "A missing required answer blocks submission.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd004],
    expectedValidPromotion: true,
  },
  {
    id: "history-immutability-after-independent-decision",
    claim: "Historical request answers are immutable.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd005],
    expectedValidPromotion: true,
  },
  {
    id: "automation-timing-after-independent-decision",
    claim: "The automated action runs only after request creation.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd006],
    expectedValidPromotion: true,
  },
  {
    id: "internal-scope-after-independent-decision",
    claim: "The new capability is available only internally to signed-in users.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd007],
    expectedValidPromotion: true,
  },
  {
    id: "permission-after-independent-decision",
    claim: "Only actors with permission X can use the new capability.",
    authorityType: "human_decision",
    derived: false,
    citedAuthorities: [hd008],
    expectedValidPromotion: true,
  },
  {
    id: "necessary-implication-positive",
    claim:
      "The search values used to produce the matching results are determined by the system from the user's profile data.",
    authorityType: "necessary_implication",
    derived: true,
    citedAuthorities: [
      {
        id: "PM-101",
        kind: "pm_intent",
        question: null,
        statement:
          "Let a user start one profile-based search and go directly to matching results without manually entering search criteria.",
      },
      {
        id: "PM-102",
        kind: "pm_intent",
        question: null,
        statement:
          "The system must determine the search values for that search from the user's profile data.",
      },
    ],
    expectedValidPromotion: true,
    expectedNecessaryImplication: true,
  },
  {
    id: "necessary-implication-negative",
    claim: "A missing required answer blocks submission.",
    authorityType: "necessary_implication",
    derived: true,
    citedAuthorities: [hd001],
    expectedValidPromotion: false,
    expectedNecessaryImplication: false,
  },
];

const currentProductContext = [
  {
    url: "pk://synthetic-current-submission",
    title: "Synthetic current submission channels",
    context:
      "The current adjacent submission flow is signed-in and internal-only; another channel exists for link-out.",
  },
  {
    url: "pk://synthetic-current-permissions",
    title: "Synthetic current object permissions",
    context: "Permission X controls editing the current object.",
  },
];

const rubric = `
You are checking claim-level Product authority. You have no Product decision authority.
Inspect only whether each claim's citedAuthorities establish that exact intended claim.
Current Product context is current fact/constraint evidence only and cannot authorize intended behavior for a new capability.

For a direct claim, valid promotion is YES only when the cited statement itself establishes the claim.
For a derived claim, ask: if every cited authority were true, could the claim still legitimately be false?
If yes, necessary implication is NO and valid promotion is NO.
For current-product inheritance also ask: if the current rule were true, could the new capability legitimately use a different rule? If yes, it is not a necessary implication.

Requiredness does not establish submission blocking.
Future reuse does not establish historical immutability.
Automation capability does not establish trigger timing.
Current channel or permission rules do not automatically govern a new capability.
Do not use uncited authority, plausibility, or general product patterns to authorize a claim.
`.trim();

const yesNoOptions: Record<YesNo, string> = {
  YES: "Yes, the cited authority establishes this decision under the rubric.",
  NO: "No, the cited authority does not establish this decision under the rubric.",
};

const state = {
  experiment: "authority",
  rubric,
  currentProductContext,
  cases: cases.map(
    ({
      expectedValidPromotion: _expectedValid,
      expectedNecessaryImplication: _expectedNecessary,
      ...testCase
    }) => testCase,
  ),
};

const questions: Record<string, ReturnType<typeof choice>> = {};
for (const testCase of cases) {
  questions[`${testCase.id}__validPromotion`] = choice(
    `Using the rubric in state, for authority case "${testCase.id}", is validPromotion true?`,
    yesNoOptions,
  );
  if (testCase.expectedNecessaryImplication !== undefined) {
    questions[`${testCase.id}__necessaryImplication`] = choice(
      `Using the rubric in state, for derived authority case "${testCase.id}", is necessaryImplication true?`,
      yesNoOptions,
    );
  }
}

const repetitions = 3;
const client = new TypeSafeClient();

async function runSystemOneWithRetry(state: unknown, questions: Record<string, ReturnType<typeof choice>>) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      return await runSystemOneWithRetry(state, questions);
    } catch (error) {
      lastError = error;
      if (attempt === 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
    }
  }
  throw lastError;
}
const runs = [];
let totalInputTokens = 0;
let totalOutputTokens = 0;
let totalLatencyMs = 0;

for (let runIndex = 1; runIndex <= repetitions; runIndex += 1) {
  const started = performance.now();
  const response = await runSystemOneWithRetry(state, questions);
  const latencyMs = Math.round(performance.now() - started);
  totalLatencyMs += latencyMs;
  totalInputTokens += response.usage.input_tokens;
  totalOutputTokens += response.usage.output_tokens;

  const results = cases.map((testCase) => {
    const valid = response.answers[`${testCase.id}__validPromotion`] as {
      choice: YesNo;
      confidence: number;
      probabilities: Record<YesNo, number>;
    };
    const necessary =
      testCase.expectedNecessaryImplication === undefined
        ? null
        : (response.answers[`${testCase.id}__necessaryImplication`] as {
            choice: YesNo;
            confidence: number;
            probabilities: Record<YesNo, number>;
          });

    const validExpected: YesNo = testCase.expectedValidPromotion ? "YES" : "NO";
    const necessaryExpected: YesNo | null =
      testCase.expectedNecessaryImplication === undefined
        ? null
        : testCase.expectedNecessaryImplication
          ? "YES"
          : "NO";

    return {
      id: testCase.id,
      validPromotion: {
        expected: validExpected,
        predicted: valid.choice,
        correct: valid.choice === validExpected,
        confidence: valid.confidence,
        probabilities: valid.probabilities,
      },
      necessaryImplication:
        necessary && necessaryExpected
          ? {
              expected: necessaryExpected,
              predicted: necessary.choice,
              correct: necessary.choice === necessaryExpected,
              confidence: necessary.confidence,
              probabilities: necessary.probabilities,
            }
          : null,
    };
  });

  const decisions = results.flatMap((result) => [
    result.validPromotion,
    ...(result.necessaryImplication ? [result.necessaryImplication] : []),
  ]);

  runs.push({
    run: runIndex,
    model: response.model,
    latencyMs,
    usage: response.usage,
    correct: decisions.filter((decision) => decision.correct).length,
    total: decisions.length,
    results,
  });
}

const decisionKeys = Object.keys(questions);
const perDecision = decisionKeys.map((key) => {
  const observations = runs.map((run) => {
    const [caseId, decision] = key.split("__");
    const result = run.results.find((item) => item.id === caseId)!;
    const item =
      decision === "validPromotion"
        ? result.validPromotion
        : result.necessaryImplication!;
    return {
      run: run.run,
      predicted: item.predicted,
      correct: item.correct,
      confidence: item.confidence,
    };
  });
  return {
    key,
    correctRuns: observations.filter((item) => item.correct).length,
    repetitions,
    stable: new Set(observations.map((item) => item.predicted)).size === 1,
    minConfidence: Math.min(...observations.map((item) => item.confidence)),
    maxConfidence: Math.max(...observations.map((item) => item.confidence)),
    observations,
  };
});

const totalDecisions = runs.reduce((sum, run) => sum + run.total, 0);
const totalCorrect = runs.reduce((sum, run) => sum + run.correct, 0);

console.log(
  JSON.stringify(
    {
      experiment: "jev-authority-poc",
      sentToTypeSafe: {
        stateShape: {
          experiment: state.experiment,
          rubric,
          currentProductContext,
          caseCount: cases.length,
          fieldsPerCase: [
            "id",
            "claim",
            "authorityType",
            "derived",
            "citedAuthorities",
          ],
        },
        questionCount: Object.keys(questions).length,
        answerType: "Choice YES/NO for validPromotion and selected necessaryImplication decisions",
        privateJobVisionProductKnowledgeIncluded: false,
      },
      summary: {
        repetitions,
        casesPerRun: cases.length,
        decisionsPerRun: decisionKeys.length,
        totalDecisions,
        totalCorrect,
        accuracy: totalCorrect / totalDecisions,
        stableDecisions: perDecision.filter((item) => item.stable).length,
        totalDecisionKeys: perDecision.length,
        totalLatencyMs,
        averageApiLatencyMs: Math.round(totalLatencyMs / repetitions),
        totalInputTokens,
        totalOutputTokens,
      },
      perDecision,
      runs,
    },
    null,
    2,
  ),
);
