import assert from "node:assert/strict";
import {
  routeAndRevealAfterValidation,
  validateProductOutputWithRepairs,
  type AtomicityAudit,
  type AuthorityAudit,
  type GuardrailProductQuestion,
} from "./runtime-guardrails.js";

type MockResponse = {
  questions: GuardrailProductQuestion[];
  authoritativeClaims: string[];
  establishedAuthorities: string[];
};

const validAuthorityAudit: AuthorityAudit = { passed: true, claims: [] };

function invalidAuthorityAudit(claim: string, source: string): AuthorityAudit {
  return {
    passed: false,
    claims: [
      {
        claim,
        section: "Required Product Behavior",
        authorityStatus: "unsupported",
        authoritySource: source,
        necessaryImplication: false,
        validPromotion: false,
        reason: "The adjacent authority can remain true while this claim is false.",
      },
    ],
  };
}

function atomicAudit(questions: GuardrailProductQuestion[]): AtomicityAudit {
  return {
    passed: true,
    results: questions.map(({ question }) => ({
      question,
      decisionVariable: "requiredness policy",
      atomic: true,
      reason: "All options vary only one Product property.",
      independentAxes: [],
    })),
  };
}

async function testCompoundQuestionRepairsBeforeRouting(): Promise<void> {
  const events: string[] = [];
  const initial: MockResponse = {
    questions: [
      {
        question: "Should answers affect status, score, or ranking?",
        whyMaterial: "These effects change downstream behavior.",
      },
    ],
    authoritativeClaims: [],
    establishedAuthorities: [],
  };
  const validation = await validateProductOutputWithRepairs({
    initialResponse: initial,
    getQuestions: (response) => response.questions,
    auditAuthority: async () => {
      events.push("authority_audit");
      return validAuthorityAudit;
    },
    auditAtomicity: async (questions) => {
      events.push("atomicity_audit");
      const compound = questions[0]?.question.includes("status, score, or ranking");
      return compound
        ? {
            passed: false,
            results: [
              {
                question: questions[0]!.question,
                decisionVariable: "none: umbrella effect label",
                atomic: false,
                reason: "Status, score, and ranking are independently answerable.",
                independentAxes: ["status", "score", "ranking"],
              },
            ],
          }
        : atomicAudit(questions);
    },
    repairAuthority: async () => {
      throw new Error("Authority repair was not expected.");
    },
    repairAtomicity: async (response, audit) => {
      events.push("atomicity_feedback");
      assert.deepEqual(audit.results[0]?.independentAxes, ["status", "score", "ranking"]);
      return {
        ...response,
        questions: [
          {
            question: "Should answers affect Match Score?",
            whyMaterial: "Scoring is one independent Product decision.",
          },
        ],
      };
    },
  });
  const routed = await routeAndRevealAfterValidation({
    validation,
    getQuestions: (response) => response.questions,
    route: async () => {
      events.push("router");
      return { matched: true };
    },
    routeAllowsReveal: (route) => route.matched,
    reveal: () => {
      events.push("fixture_reveal");
      return "revealed";
    },
  });
  assert.equal(routed.status, "revealed");
  assert.deepEqual(events, [
    "authority_audit",
    "atomicity_audit",
    "atomicity_feedback",
    "authority_audit",
    "atomicity_audit",
    "router",
    "fixture_reveal",
  ]);
}

async function testPersistentCompoundQuestionStopsBeforeRouter(): Promise<void> {
  let repairs = 0;
  let routerCalls = 0;
  let reveals = 0;
  const response: MockResponse = {
    questions: [
      {
        question: "Should identity mechanism and organization scope use package A or B?",
        whyMaterial: "Both axes are material.",
      },
    ],
    authoritativeClaims: [],
    establishedAuthorities: [],
  };
  const validation = await validateProductOutputWithRepairs({
    initialResponse: response,
    getQuestions: (candidate) => candidate.questions,
    auditAuthority: async () => validAuthorityAudit,
    auditAtomicity: async (questions) => ({
      passed: false,
      results: [
        {
          question: questions[0]!.question,
          decisionVariable: "none: packaged decisions",
          atomic: false,
          reason: "Identity mechanism and organization scope are independent.",
          independentAxes: ["identity mechanism", "organization scope"],
        },
      ],
    }),
    repairAuthority: async () => response,
    repairAtomicity: async (candidate) => {
      repairs += 1;
      return candidate;
    },
    maximumRepairAttempts: 2,
  });
  const routed = await routeAndRevealAfterValidation({
    validation,
    getQuestions: (candidate) => candidate.questions,
    route: async () => {
      routerCalls += 1;
      return { matched: true };
    },
    routeAllowsReveal: () => true,
    reveal: () => {
      reveals += 1;
      return "revealed";
    },
  });
  assert.equal(validation.status, "atomicity_validation_failed");
  assert.equal(repairs, 2);
  assert.equal(routed.status, "guard_failed");
  assert.equal(routerCalls, 0);
  assert.equal(reveals, 0);
}

async function testAtomicRequirednessCanReachRouter(): Promise<void> {
  let routerCalls = 0;
  const response: MockResponse = {
    questions: [
      {
        question: "Requiredness policy: all required, all optional, or configurable per item?",
        whyMaterial: "Requiredness changes the Product contract.",
      },
    ],
    authoritativeClaims: [],
    establishedAuthorities: [],
  };
  const validation = await validateProductOutputWithRepairs({
    initialResponse: response,
    getQuestions: (candidate) => candidate.questions,
    auditAuthority: async () => validAuthorityAudit,
    auditAtomicity: async (questions) => atomicAudit(questions),
    repairAuthority: async () => response,
    repairAtomicity: async () => response,
  });
  const routed = await routeAndRevealAfterValidation({
    validation,
    getQuestions: (candidate) => candidate.questions,
    route: async () => {
      routerCalls += 1;
      return { matched: true };
    },
    routeAllowsReveal: (route) => route.matched,
    reveal: () => "revealed",
  });
  assert.equal(validation.atomicityRepairAttempts, 0);
  assert.equal(routerCalls, 1);
  assert.equal(routed.status, "revealed");
}

const authorityLeakCases = [
  {
    name: "requiredness does not authorize submission blocking",
    authority: "all_questions_required",
    unsupportedClaim: "missing_answer_blocks_submit",
  },
  {
    name: "future reuse does not authorize historical immutability",
    authority: "future_reuse",
    unsupportedClaim: "historical_applications_immutable",
  },
  {
    name: "current internal flow does not authorize intended internal-only scope",
    authority: "current_internal_only",
    unsupportedClaim: "new_capability_internal_only",
  },
  {
    name: "current permission does not authorize new-capability permission",
    authority: "current_permission_x",
    unsupportedClaim: "new_capability_uses_permission_x",
  },
] as const;

async function testAuthorityLeakRepairBeforeRouting(): Promise<void> {
  for (const scenario of authorityLeakCases) {
    const events: string[] = [];
    const initial: MockResponse = {
      questions: [
        {
          question: "What independent Product decision remains?",
          whyMaterial: "The decision is material.",
        },
      ],
      authoritativeClaims: [scenario.unsupportedClaim],
      establishedAuthorities: [scenario.authority],
    };
    const validation = await validateProductOutputWithRepairs({
      initialResponse: initial,
      getQuestions: (response) => response.questions,
      auditAuthority: async (response) => {
        events.push("authority_audit");
        return response.authoritativeClaims.includes(scenario.unsupportedClaim)
          ? invalidAuthorityAudit(scenario.unsupportedClaim, scenario.authority)
          : validAuthorityAudit;
      },
      auditAtomicity: async (questions) => {
        events.push("atomicity_audit");
        return atomicAudit(questions);
      },
      repairAuthority: async (response, audit) => {
        events.push("authority_feedback");
        assert.equal(audit.claims[0]?.claim, scenario.unsupportedClaim, scenario.name);
        return { ...response, authoritativeClaims: [] };
      },
      repairAtomicity: async () => {
        throw new Error("Atomicity repair was not expected.");
      },
    });
    const routed = await routeAndRevealAfterValidation({
      validation,
      getQuestions: (response) => response.questions,
      route: async () => {
        events.push("router");
        return { matched: true };
      },
      routeAllowsReveal: (route) => route.matched,
      reveal: () => {
        events.push("fixture_reveal");
        return "revealed";
      },
    });
    assert.equal(routed.status, "revealed", scenario.name);
    assert.deepEqual(
      events,
      [
        "authority_audit",
        "authority_feedback",
        "authority_audit",
        "atomicity_audit",
        "router",
        "fixture_reveal",
      ],
      scenario.name,
    );
  }
}

async function testIndependentAuthorityAllowsPromotion(): Promise<void> {
  let authorityRepairs = 0;
  const response: MockResponse = {
    questions: [],
    authoritativeClaims: ["missing_answer_blocks_submit"],
    establishedAuthorities: ["all_questions_required", "missing_answer_blocks_submit"],
  };
  const validation = await validateProductOutputWithRepairs({
    initialResponse: response,
    getQuestions: (candidate) => candidate.questions,
    auditAuthority: async (candidate) =>
      candidate.establishedAuthorities.includes("missing_answer_blocks_submit")
        ? validAuthorityAudit
        : invalidAuthorityAudit(
            "missing_answer_blocks_submit",
            "all_questions_required",
          ),
    auditAtomicity: async () => {
      throw new Error("No clarification questions should require an atomicity audit.");
    },
    repairAuthority: async () => {
      authorityRepairs += 1;
      return response;
    },
    repairAtomicity: async () => response,
  });
  assert.equal(validation.status, "passed");
  assert.equal(authorityRepairs, 0);
}

async function testPersistentAuthorityFailureStopsBeforeRouter(): Promise<void> {
  let repairs = 0;
  let routerCalls = 0;
  let reveals = 0;
  const response: MockResponse = {
    questions: [
      {
        question: "What is the independent submission consequence?",
        whyMaterial: "Submission behavior is material.",
      },
    ],
    authoritativeClaims: ["missing_answer_blocks_submit"],
    establishedAuthorities: ["all_questions_required"],
  };
  const validation = await validateProductOutputWithRepairs({
    initialResponse: response,
    getQuestions: (candidate) => candidate.questions,
    auditAuthority: async () =>
      invalidAuthorityAudit("missing_answer_blocks_submit", "all_questions_required"),
    auditAtomicity: async (questions) => atomicAudit(questions),
    repairAuthority: async (candidate) => {
      repairs += 1;
      return candidate;
    },
    repairAtomicity: async (candidate) => candidate,
    maximumRepairAttempts: 2,
  });
  const routed = await routeAndRevealAfterValidation({
    validation,
    getQuestions: (candidate) => candidate.questions,
    route: async () => {
      routerCalls += 1;
      return { matched: true };
    },
    routeAllowsReveal: () => true,
    reveal: () => {
      reveals += 1;
      return "revealed";
    },
  });
  assert.equal(validation.status, "authority_validation_failed");
  assert.equal(repairs, 2);
  assert.equal(routed.status, "guard_failed");
  assert.equal(routerCalls, 0);
  assert.equal(reveals, 0);
}

async function testReconciledOutputIsReaudited(): Promise<void> {
  let authorityAudits = 0;
  const audit = async (response: MockResponse): Promise<AuthorityAudit> => {
    authorityAudits += 1;
    return response.authoritativeClaims.includes("historical_applications_immutable")
      ? invalidAuthorityAudit("historical_applications_immutable", "future_reuse")
      : validAuthorityAudit;
  };
  const beforeReconciliation: MockResponse = {
    questions: [],
    authoritativeClaims: [],
    establishedAuthorities: [],
  };
  const initialValidation = await validateProductOutputWithRepairs({
    initialResponse: beforeReconciliation,
    getQuestions: (response) => response.questions,
    auditAuthority: audit,
    auditAtomicity: async (questions) => atomicAudit(questions),
    repairAuthority: async (response) => response,
    repairAtomicity: async (response) => response,
  });
  assert.equal(initialValidation.status, "passed");

  const reconciledOutput: MockResponse = {
    questions: [],
    authoritativeClaims: ["historical_applications_immutable"],
    establishedAuthorities: ["future_reuse"],
  };
  const reconciledValidation = await validateProductOutputWithRepairs({
    initialResponse: reconciledOutput,
    getQuestions: (response) => response.questions,
    auditAuthority: audit,
    auditAtomicity: async (questions) => atomicAudit(questions),
    repairAuthority: async (response) => ({ ...response, authoritativeClaims: [] }),
    repairAtomicity: async (response) => response,
  });
  assert.equal(reconciledValidation.status, "passed");
  assert.equal(reconciledValidation.authorityRepairAttempts, 1);
  assert.equal(authorityAudits, 3);
}

await testCompoundQuestionRepairsBeforeRouting();
await testPersistentCompoundQuestionStopsBeforeRouter();
await testAtomicRequirednessCanReachRouter();
await testAuthorityLeakRepairBeforeRouting();
await testIndependentAuthorityAllowsPromotion();
await testPersistentAuthorityFailureStopsBeforeRouter();
await testReconciledOutputIsReaudited();

console.log(
  JSON.stringify(
    {
      passed: true,
      tests: 10,
      coverage: [
        "compound clarification repaired before Router/reveal",
        "persistent non-atomic clarification stops after two repairs",
        "atomic requiredness reaches Router",
        ...authorityLeakCases.map((scenario) => scenario.name),
        "independently authorized promotion passes",
        "persistent authority violation stops before Router/reveal",
        "reconciled Product Child output is independently re-audited",
      ],
    },
    null,
    2,
  ),
);
