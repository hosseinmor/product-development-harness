import {
  fixtureIds,
  routeProductQuestions,
  semanticFixtureRouterConfig,
  type FixtureId,
} from "./semantic-fixture-router.js";
import { routeQuestionsWithFixtureDescriptions } from "./prd-eval-runner-support.js";

const cases: Array<{ question: string; expected: FixtureId[] }> = [
  {
    question:
      "چه چیزی دو Search را «یکسان» می‌کند؟ پیشنهاد شامل معیارهای نرمال‌شده، Saved Search و بی‌اثر بودن touchpoint ورود است.",
    expected: ["A"],
  },
  {
    question: "همان Search با چه قاعده‌ای تشخیص داده شود؟",
    expected: ["A"],
  },
  {
    question:
      "معیار مرجع برای همان Search چیست: query/filter نرمال‌شده، Saved Search یا URL؟",
    expected: ["A"],
  },
  {
    question:
      "دقیقاً چه زمانی یک آگهی از baseline قبلی به نتایج اضافه‌شده محسوب می‌شود؟ گزینه‌ها انتشار، Reactivation یا تغییر Rank هستند.",
    expected: ["B"],
  },
  {
    question:
      "چه رویدادی باید باعث شود یک آگهی برای یک Search مشخص جدید محسوب شود؟ پیشنهاد می‌تواند انتشار، Reactivation یا تازه‌سازی باشد.",
    expected: ["B"],
  },
  {
    question:
      "کدام مدل معنای «آگهی جدید» را تعیین کند: ورود آگهی به نتایج، فعال‌شدن آگهی، یا ارائه‌نشدن قبلی؟",
    expected: ["B"],
  },
  {
    question:
      "مرجع «آخرین مراجعه» دقیقاً با وقوع کدام رویداد جلو برود؟",
    expected: ["C"],
  },
  {
    question: "کدام رویداد باید نقطهٔ آخرین مراجعه را جلو ببرد؟",
    expected: ["C"],
  },
  {
    question:
      "نقطه مرجع آخرین مراجعه در چه رویدادی جلو برود؟ پیشنهاد وضعیت جدید بودن را محاسبه کند؛ گزینه دیگر پایان session است.",
    expected: ["C"],
  },
  {
    question:
      "تداوم سابقه مراجعه در چه سطحی باشد: session، device یا account؟",
    expected: ["D"],
  },
  {
    question:
      "برای کارجوی واردشده، history هر Search باید در چه دامنه‌ای میان sessionها و deviceها پایدار بماند؟",
    expected: ["D"],
  },
  {
    question: "آیا کارجوی بدون ورود نیز در دامنه این قابلیت باشد؟",
    expected: ["D"],
  },
  {
    question:
      "آیا نسخه نخست باید همه touchpointها را پوشش دهد یا یک زیرمجموعه را؟",
    expected: ["E"],
  },
  {
    question: "کدام touchpointها در v0 هستند؟",
    expected: ["E"],
  },
  {
    question: "آیا Recent Search و Saved Search در scope نسخه اول هستند؟",
    expected: ["E"],
  },
  {
    question: "آیا New در ordinary Search Results باید قابل‌تشخیص باشد؟",
    expected: [],
  },
  {
    question: "آیا Recent Search باید قبل از ورود وجود New را signal کند؟",
    expected: [],
  },
  {
    question: "آیا Saved Search باید قبل از ورود وجود New را signal کند؟",
    expected: [],
  },
  {
    question:
      "در Saved Search که در scope است، count دقیق نشان داده شود یا فقط presence signal؟",
    expected: [],
  },
  {
    question:
      "مبنای آخرین مراجعه چه زمانی جلو برود و در چه دامنه‌ای برای account، session و دستگاه حفظ شود؟ مشاهده در touchpoint دیگر چه اثری دارد؟",
    expected: ["C", "D"],
  },
  {
    question: "در اولین visit بدون baseline، همه نتایج New هستند یا هیچ‌کدام؟",
    expected: ["H"],
  },
  {
    question: "وقتی baseline قبلی وجود ندارد، نتایج فعلی New محسوب شوند؟",
    expected: ["H"],
  },
  {
    question:
      "بعد از اینکه baseline قبلی وجود دارد، چه زمانی یک آگهی برای همان Search جدید محسوب شود؟",
    expected: ["B"],
  },
  {
    question: "کدام رویداد باید baseline موجود را برای مراجعه بعدی جلو ببرد؟",
    expected: ["C"],
  },
];

const result = await routeProductQuestions(cases.map((testCase) => testCase.question));
const failures = cases.flatMap((testCase, index) => {
  const route = result.routes[index];
  const actual = [...route.fixtureIds].sort(
    (left, right) => fixtureIds.indexOf(left) - fixtureIds.indexOf(right),
  );
  const expected = [...testCase.expected].sort(
    (left, right) => fixtureIds.indexOf(left) - fixtureIds.indexOf(right),
  );
  const passed =
    expected.length === 0
      ? route.status === "no_match" && actual.length === 0
      : route.status === "matched" && actual.join(",") === expected.join(",");
  return passed
    ? []
    : [
        {
          question: testCase.question,
          expected,
          actualStatus: route.status,
          actualFixtureIds: actual,
          rationale: route.rationale,
        },
      ];
});

const exactnessFixtures = [
  {
    id: "GENERIC-INPUT-MODEL",
    routingDescription:
      "Answers only the Product decision about whether a new structured attribute accepts values from a predefined bounded option set or accepts free-form input. It does not answer which concrete values, labels, or ordering belong to a predefined option set.",
  },
] as const;
const repeatedAdjacentQuestion =
  "Which exact values and labels belong to the predefined option set?";
const exactnessCases = [
  {
    question:
      "Should the structured attribute use a predefined bounded option set or free-form input?",
    expectedStatus: "matched" as const,
    expectedFixtureIds: ["GENERIC-INPUT-MODEL"],
  },
  {
    question: repeatedAdjacentQuestion,
    expectedStatus: "no_match" as const,
    expectedFixtureIds: [],
  },
  {
    question: repeatedAdjacentQuestion,
    expectedStatus: "no_match" as const,
    expectedFixtureIds: [],
  },
];
const exactnessResult = await routeQuestionsWithFixtureDescriptions({
  questions: exactnessCases.map(({ question }) => question),
  fixtures: exactnessFixtures,
  temporaryDirectoryPrefix: "harness-semantic-router-exactness-regression",
});
const exactnessFailures: Array<{
  question: string;
  expectedStatus: string;
  expectedFixtureIds: readonly string[];
  actualStatus: string;
  actualFixtureIds: readonly string[];
  rationale: string;
}> = exactnessCases.flatMap((testCase, index) => {
  const route = exactnessResult.routes[index]!;
  const passed =
    route.status === testCase.expectedStatus &&
    route.fixtureIds.join(",") === testCase.expectedFixtureIds.join(",");
  return passed
    ? []
    : [
        {
          question: testCase.question,
          expectedStatus: testCase.expectedStatus,
          expectedFixtureIds: testCase.expectedFixtureIds,
          actualStatus: route.status,
          actualFixtureIds: route.fixtureIds,
          rationale: route.rationale,
        },
      ];
});
const firstRepeatedRoute = exactnessResult.routes[1]!;
const secondRepeatedRoute = exactnessResult.routes[2]!;
const repeatedInputStable =
  firstRepeatedRoute.status === secondRepeatedRoute.status &&
  firstRepeatedRoute.fixtureIds.join(",") ===
    secondRepeatedRoute.fixtureIds.join(",") &&
  firstRepeatedRoute.multipleDecisions === secondRepeatedRoute.multipleDecisions;
if (!repeatedInputStable) {
  exactnessFailures.push({
    question: repeatedAdjacentQuestion,
    expectedStatus: "same semantic outcome for repeated identical input",
    expectedFixtureIds: [],
    actualStatus: `${firstRepeatedRoute.status} / ${secondRepeatedRoute.status}`,
    actualFixtureIds: [
      ...firstRepeatedRoute.fixtureIds,
      ...secondRepeatedRoute.fixtureIds,
    ],
    rationale: `${firstRepeatedRoute.rationale} / ${secondRepeatedRoute.rationale}`,
  });
}

const allFailures = [...failures, ...exactnessFailures];

console.log(
  JSON.stringify(
    {
      config: semanticFixtureRouterConfig,
      threadId: result.threadId,
      cases: cases.length,
      exactnessCases: exactnessCases.length,
      exactnessThreadId: exactnessResult.threadId,
      repeatedInputStable,
      passed: allFailures.length === 0,
      failures: allFailures,
      isolation: [result.isolation, exactnessResult.isolation],
    },
    null,
    2,
  ),
);

if (allFailures.length > 0) process.exitCode = 1;
