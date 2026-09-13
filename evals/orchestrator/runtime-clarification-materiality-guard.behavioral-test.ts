import assert from "node:assert/strict";
import {
  ClarificationMaterialityGuard,
  MaterialDecisionCoverageGuard,
  clarificationMaterialityRepairPrompt,
  routeAndRevealAfterValidation,
  validateProductOutputWithRepairs,
  type AtomicityAudit,
  type AuthorityAudit,
  type ClarificationMaterialityAudit,
  type ClarificationMaterialityInput,
  type ClarificationMaterialitySemanticAuditor,
  type GuardrailProductQuestion,
  type SemanticGuardResult,
} from "./runtime-guardrails.js";

type MockResponse = {
  questions: GuardrailProductQuestion[];
  prdMarkdown: string;
  problemAligned: boolean;
};

const validAuthority: AuthorityAudit = { passed: true, claims: [] };

function passingAtomicity(questions: GuardrailProductQuestion[]): AtomicityAudit {
  return {
    passed: true,
    results: questions.map(({ question }) => ({
      question,
      decisionVariable: "one material Product decision",
      atomic: true,
      reason: "The question varies one independently answerable property.",
      independentAxes: [],
    })),
  };
}

function semanticResult(
  input: ClarificationMaterialityInput,
): SemanticGuardResult<ClarificationMaterialityAudit> {
  const results = input.questions.map(({ question }) => {
    if (/required to complete/i.test(question)) {
      return {
        question,
        classification: "BLOCKING_PRODUCT_DECISION" as const,
        reason: "Completion semantics would otherwise be invented by Design.",
        dependsOnQuestions: [],
      };
    }
    if (/exact option taxonomy/i.test(question)) {
      return {
        question,
        classification: "NON_BLOCKING_PRODUCT_UNCERTAINTY" as const,
        reason: "The bounded catalog model is established; exact values can remain open.",
        dependsOnQuestions: [],
      };
    }
    return {
      question,
      classification: "DESIGN_OWNED" as const,
      reason: "Exact presentation belongs to Design.",
      dependsOnQuestions: [],
    };
  });
  return {
    threadId: "materiality-test-thread",
    audit: {
      passed: results.every(
        ({ classification, dependsOnQuestions }) =>
          classification === "BLOCKING_PRODUCT_DECISION" &&
          dependsOnQuestions.length === 0,
      ),
      results,
    },
    usage: null,
    isolation: {
      workingDirectoryWasEmpty: true,
      workingDirectoryUnchanged: true,
      networkAccessEnabled: false,
      passed: true,
    },
  };
}

const semanticAuditor: ClarificationMaterialitySemanticAuditor = async (input) =>
  semanticResult(input);

function materialityInput(
  questions: GuardrailProductQuestion[],
): ClarificationMaterialityInput {
  return {
    pmIntent: "Add a bounded feedback capability to an existing core action.",
    currentProductContext: [],
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
    questions,
  };
}

const blockingQuestion: GuardrailProductQuestion = {
  question: "Is the action required to complete the core flow?",
  whyMaterial: "It changes completion semantics.",
};
const taxonomyQuestion: GuardrailProductQuestion = {
  question: "What exact option taxonomy belongs in the established catalog?",
  whyMaterial: "Product owns the eventual values.",
};
const designQuestion: GuardrailProductQuestion = {
  question: "Should the catalog open in a modal or popover?",
  whyMaterial: "The presentation is unresolved.",
};

async function testIndependentClassificationsAndCache(): Promise<void> {
  const guard = new ClarificationMaterialityGuard(semanticAuditor);
  const input = materialityInput([
    blockingQuestion,
    taxonomyQuestion,
    designQuestion,
  ]);
  const first = await guard.audit(input);
  const second = await guard.audit(input);
  assert.deepEqual(
    first.audit.results.map(({ classification }) => classification),
    [
      "BLOCKING_PRODUCT_DECISION",
      "NON_BLOCKING_PRODUCT_UNCERTAINTY",
      "DESIGN_OWNED",
    ],
  );
  assert.equal(first.audit.passed, false);
  assert.equal(second.instrumentation.cached, true);
  assert.equal(second.instrumentation.semanticAuditCallCount, 0);
  assert.equal(guard.metrics.semanticAuditCallCount, 1);
  assert.equal(guard.metrics.cacheHits, 1);
}

async function testMixedBatchOnlyBlockingReachesRouter(): Promise<void> {
  const events: string[] = [];
  const guard = new ClarificationMaterialityGuard(semanticAuditor);
  const initial: MockResponse = {
    questions: [blockingQuestion, taxonomyQuestion],
    prdMarkdown: materialityInput([]).prdMarkdown,
    problemAligned: false,
  };
  const validation = await validateProductOutputWithRepairs({
    initialResponse: initial,
    getQuestions: ({ questions }) => questions,
    auditAuthority: async () => {
      events.push("authority");
      return validAuthority;
    },
    auditClarificationMateriality: async (response, questions) => {
      events.push("materiality");
      return (
        await guard.audit({
          ...materialityInput(questions),
          prdMarkdown: response.prdMarkdown,
        })
      ).audit;
    },
    auditAtomicity: async (questions) => {
      events.push("atomicity");
      return passingAtomicity(questions);
    },
    repairAuthority: async () => {
      throw new Error("Authority repair was not expected.");
    },
    repairClarificationMateriality: async (response, audit) => {
      events.push("materiality_feedback");
      guard.recordRepairAttempt();
      assert.match(
        clarificationMaterialityRepairPrompt(audit),
        /NON_BLOCKING_PRODUCT_UNCERTAINTY/,
      );
      return {
        ...response,
        questions: response.questions.filter(
          ({ question }) =>
            audit.results.find((result) => result.question === question)
              ?.classification === "BLOCKING_PRODUCT_DECISION",
        ),
      };
    },
    repairAtomicity: async () => {
      throw new Error("Atomicity repair was not expected.");
    },
  });
  const routed = await routeAndRevealAfterValidation({
    validation,
    getQuestions: ({ questions }) => questions,
    route: async (questions) => {
      events.push("router");
      assert.deepEqual(questions, [blockingQuestion]);
      return { matched: true };
    },
    routeAllowsReveal: ({ matched }) => matched,
    reveal: () => {
      events.push("reveal");
      return "fixture";
    },
  });
  assert.equal(routed.status, "revealed");
  assert.equal(validation.clarificationMaterialityRepairAttempts, 1);
  assert.deepEqual(events, [
    "authority",
    "materiality",
    "materiality_feedback",
    "authority",
    "materiality",
    "atomicity",
    "router",
    "reveal",
  ]);
}

async function testAllNonBlockingSkipsRouterAndReturnsFeedback(): Promise<void> {
  let routerCalls = 0;
  const guard = new ClarificationMaterialityGuard(semanticAuditor);
  const initial: MockResponse = {
    questions: [taxonomyQuestion, designQuestion],
    prdMarkdown: materialityInput([]).prdMarkdown,
    problemAligned: false,
  };
  const validation = await validateProductOutputWithRepairs({
    initialResponse: initial,
    getQuestions: ({ questions }) => questions,
    auditAuthority: async () => validAuthority,
    auditClarificationMateriality: async (response, questions) =>
      (
        await guard.audit({
          ...materialityInput(questions),
          prdMarkdown: response.prdMarkdown,
        })
      ).audit,
    auditAtomicity: async () => {
      throw new Error("Atomicity must not run after all questions are suppressed.");
    },
    repairAuthority: async () => initial,
    repairClarificationMateriality: async (response, audit) => {
      guard.recordRepairAttempt();
      assert.equal(
        audit.results.filter(
          ({ classification }) => classification !== "BLOCKING_PRODUCT_DECISION",
        ).length,
        2,
      );
      return { ...response, questions: [], problemAligned: true };
    },
    repairAtomicity: async () => initial,
  });
  if (validation.response.questions.length > 0) routerCalls += 1;
  assert.equal(validation.status, "passed");
  assert.equal(validation.response.problemAligned, true);
  assert.equal(routerCalls, 0);
  assert.equal(guard.metrics.clarificationMaterialityRepairCount, 1);
}

async function testAlignmentBackstopStillRejectsMaterialOmission(): Promise<void> {
  const falseNegativeAuditor: ClarificationMaterialitySemanticAuditor = async (input) => ({
    ...semanticResult(input),
    audit: {
      passed: false,
      results: input.questions.map(({ question }) => ({
        question,
        classification: "NON_BLOCKING_PRODUCT_UNCERTAINTY" as const,
        reason: "Intentional false negative for backstop verification.",
        dependsOnQuestions: [],
      })),
    },
  });
  const guard = new ClarificationMaterialityGuard(falseNegativeAuditor);
  const validation = await validateProductOutputWithRepairs({
    initialResponse: {
      questions: [blockingQuestion],
      prdMarkdown: "# Draft\n\n## Scope\n\n- Core flow exists.",
      problemAligned: false,
    },
    getQuestions: ({ questions }) => questions,
    auditAuthority: async () => validAuthority,
    auditClarificationMateriality: async (response, questions) =>
      (
        await guard.audit({
          ...materialityInput(questions),
          prdMarkdown: response.prdMarkdown,
        })
      ).audit,
    auditAtomicity: async (questions) => passingAtomicity(questions),
    repairAuthority: async (response) => response,
    repairClarificationMateriality: async (response) => ({
      ...response,
      questions: [],
      problemAligned: true,
    }),
    repairAtomicity: async (response) => response,
  });
  assert.equal(validation.response.problemAligned, true);

  const alignment = new MaterialDecisionCoverageGuard(async () => ({
    threadId: "alignment-backstop-test",
    audit: {
      aligned: false,
      blockers: [
        {
          boundary: "Whether the action is required to complete the core flow",
          owner: "product",
          material: true,
          blocking: true,
          reason: "Design would otherwise invent completion semantics.",
        },
      ],
      nonBlockingOpenDecisions: [],
    },
    usage: null,
    isolation: {
      workingDirectoryWasEmpty: true,
      workingDirectoryUnchanged: true,
      networkAccessEnabled: false,
      passed: true,
    },
  }));
  const audit = await alignment.audit({
    pmIntent: materialityInput([]).pmIntent,
    currentProductContext: [],
    prdMarkdown: validation.response.prdMarkdown,
    humanDecisions: [],
  });
  assert.equal(audit.audit.aligned, false);
  assert.equal(audit.audit.blockers.length, 1);
}

async function testNoHiddenFixtureDependency(): Promise<void> {
  let observedKeys: string[] = [];
  const observingAuditor: ClarificationMaterialitySemanticAuditor = async (input) => {
    observedKeys = Object.keys(input).sort();
    return semanticResult(input);
  };
  const guard = new ClarificationMaterialityGuard(observingAuditor);
  const input = materialityInput([taxonomyQuestion]);
  const hiddenFixtureAnswers = ["secret answer A"];
  const first = await guard.audit(input);
  hiddenFixtureAnswers.push("secret answer B");
  const second = await guard.audit(input);
  assert.deepEqual(observedKeys, [
    "currentProductContext",
    "humanDecisions",
    "pmIntent",
    "prdMarkdown",
    "questions",
  ]);
  assert.deepEqual(second.audit, first.audit);
  assert.equal(second.instrumentation.cached, true);
}

async function testObservableProductConsequenceBoundary(): Promise<void> {
  const storageAssociationQuestion: GuardrailProductQuestion = {
    question:
      "Should the captured value be associated with the subject record or the operation record when both models preserve the same Product behavior?",
    whyMaterial: "The durable record association remains unresolved.",
  };
  const criticalIdentityQuestion: GuardrailProductQuestion = {
    question:
      "Is the durable state identified by account or by device when that choice changes cross-device persistence and access?",
    whyMaterial:
      "The identity determines observable ownership, persistence, and lifecycle behavior.",
  };
  const rejectedDetailQuestion: GuardrailProductQuestion = {
    question:
      "Must the capability add a separate durable interaction-record identity that was removed as unsupported and is unnecessary for its established behavior?",
    whyMaterial:
      "The unsupported detail lacks authority, but the established capability does not depend on it.",
  };
  const auditor: ClarificationMaterialitySemanticAuditor = async (input) => {
    const results = input.questions.map(({ question }) => ({
      question,
      classification:
        question === criticalIdentityQuestion.question
          ? ("BLOCKING_PRODUCT_DECISION" as const)
          : ("NON_BLOCKING_PRODUCT_UNCERTAINTY" as const),
      reason:
        question === criticalIdentityQuestion.question
          ? "The identity changes observable Product ownership, persistence, and lifecycle."
          : "The established Product behavior is unchanged and Design need not choose the record model.",
      dependsOnQuestions: [],
    }));
    return {
      threadId: "observable-consequence-test-thread",
      audit: {
        passed: results.every(
          ({ classification }) =>
            classification === "BLOCKING_PRODUCT_DECISION",
        ),
        results,
      },
      usage: null,
      isolation: {
        workingDirectoryWasEmpty: true,
        workingDirectoryUnchanged: true,
        networkAccessEnabled: false,
        passed: true,
      },
    };
  };
  const guard = new ClarificationMaterialityGuard(auditor);
  const result = await guard.audit({
    pmIntent:
      "Capture a structured value with a completed operation while preserving its established user-visible meaning and effects.",
    currentProductContext: [],
    prdMarkdown: `# Structured capture

## Required Product Behavior

- The structured value is captured with the completed operation and preserves the established Product meaning and effects.

## Assumptions & Open Decisions

- Its internal durable record association remains open.
- A previously unsupported separate interaction identity remains omitted.`,
    humanDecisions: [],
    questions: [
      storageAssociationQuestion,
      criticalIdentityQuestion,
      rejectedDetailQuestion,
    ],
  });
  assert.deepEqual(
    result.audit.results.map(({ classification }) => classification),
    [
      "NON_BLOCKING_PRODUCT_UNCERTAINTY",
      "BLOCKING_PRODUCT_DECISION",
      "NON_BLOCKING_PRODUCT_UNCERTAINTY",
    ],
  );
}

async function testDependentClarificationOrdering(): Promise<void> {
  const upstreamQuestion: GuardrailProductQuestion = {
    question:
      "Does activating the state durably suppress the item from future eligible collections?",
    whyMaterial: "It establishes durable eligibility and lifecycle semantics.",
  };
  const downstreamQuestion: GuardrailProductQuestion = {
    question:
      "Should the item disappear from the current view immediately, or remain until refresh or navigation?",
    whyMaterial:
      "Its ownership depends on whether durable suppression is established.",
  };
  const events: string[] = [];
  const dependencyAuditor: ClarificationMaterialitySemanticAuditor = async (input) => {
    const upstreamEstablished = input.humanDecisions.some(
      ({ question }) => question === upstreamQuestion.question,
    );
    const results = input.questions.map(({ question }) => {
      if (question === upstreamQuestion.question) {
        return {
          question,
          classification: "BLOCKING_PRODUCT_DECISION" as const,
          reason: "Durable suppression is an unresolved upstream Product decision.",
          dependsOnQuestions: [],
        };
      }
      if (!upstreamEstablished) {
        return {
          question,
          classification: "BLOCKING_PRODUCT_DECISION" as const,
          reason:
            "The immediate transition cannot be classified until durable suppression is decided.",
          dependsOnQuestions: [upstreamQuestion.question],
        };
      }
      return {
        question,
        classification: "DESIGN_OWNED" as const,
        reason:
          "With durable suppression established, only immediate UI reflection remains.",
        dependsOnQuestions: [],
      };
    });
    return {
      threadId: "dependency-ordering-test-thread",
      audit: {
        passed: results.every(
          ({ classification, dependsOnQuestions }) =>
            classification === "BLOCKING_PRODUCT_DECISION" &&
            dependsOnQuestions.length === 0,
        ),
        results,
      },
      usage: null,
      isolation: {
        workingDirectoryWasEmpty: true,
        workingDirectoryUnchanged: true,
        networkAccessEnabled: false,
        passed: true,
      },
    };
  };
  const guard = new ClarificationMaterialityGuard(dependencyAuditor);
  const initial: MockResponse = {
    questions: [upstreamQuestion, downstreamQuestion],
    prdMarkdown: `# State change

## Assumptions & Open Decisions

- Durable suppression is unresolved.
- The immediate current-view transition depends on that decision.`,
    problemAligned: false,
  };
  const validation = await validateProductOutputWithRepairs({
    initialResponse: initial,
    getQuestions: ({ questions }) => questions,
    auditAuthority: async () => validAuthority,
    auditClarificationMateriality: async (response, questions) => {
      events.push("materiality");
      return (
        await guard.audit({
          pmIntent: "Introduce an explicit state change for an item.",
          currentProductContext: [],
          prdMarkdown: response.prdMarkdown,
          humanDecisions: [],
          questions,
        })
      ).audit;
    },
    auditAtomicity: async (questions) => {
      events.push("atomicity");
      return passingAtomicity(questions);
    },
    repairAuthority: async () => {
      throw new Error("Authority repair was not expected.");
    },
    repairClarificationMateriality: async (response, audit) => {
      events.push("dependency_feedback");
      guard.recordRepairAttempt();
      const prompt = clarificationMaterialityRepairPrompt(audit);
      assert.match(prompt, /Deferred dependent questions/);
      assert.match(prompt, /re-evaluate them after the listed upstream/);
      return { ...response, questions: [upstreamQuestion] };
    },
    repairAtomicity: async () => {
      throw new Error("Atomicity repair was not expected.");
    },
  });
  const routed = await routeAndRevealAfterValidation({
    validation,
    getQuestions: ({ questions }) => questions,
    route: async (questions) => {
      events.push("router");
      assert.deepEqual(questions, [upstreamQuestion]);
      return { matched: true };
    },
    routeAllowsReveal: ({ matched }) => matched,
    reveal: () => {
      events.push("reveal");
      return {
        question: upstreamQuestion.question,
        answer: "The state durably suppresses the item until it is reversed.",
      };
    },
  });
  assert.equal(routed.status, "revealed");
  if (routed.status !== "revealed") return;

  events.push("materiality_after_reveal");
  const downstreamAfterAuthority = await guard.audit({
    pmIntent: "Introduce an explicit state change for an item.",
    currentProductContext: [],
    prdMarkdown: initial.prdMarkdown,
    humanDecisions: [routed.reveal],
    questions: [downstreamQuestion],
  });
  assert.equal(
    downstreamAfterAuthority.audit.results[0]?.classification,
    "DESIGN_OWNED",
  );
  assert.deepEqual(
    downstreamAfterAuthority.audit.results[0]?.dependsOnQuestions,
    [],
  );
  assert.deepEqual(events, [
    "materiality",
    "dependency_feedback",
    "materiality",
    "atomicity",
    "router",
    "reveal",
    "materiality_after_reveal",
  ]);
}

await testIndependentClassificationsAndCache();
await testMixedBatchOnlyBlockingReachesRouter();
await testAllNonBlockingSkipsRouterAndReturnsFeedback();
await testDependentClarificationOrdering();
await testAlignmentBackstopStillRejectsMaterialOmission();
await testNoHiddenFixtureDependency();
await testObservableProductConsequenceBoundary();

console.log(
  "Pre-Router Clarification Materiality behavioral tests passed (A-H, observable-consequence boundary, dependency ordering, mixed/all suppression, cache, and Alignment backstop).",
);
