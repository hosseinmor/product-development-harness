import assert from "node:assert/strict";
import {
  MaterialDecisionCoverageGuard,
  alignmentRepairPrompt,
  routeAndRevealAfterValidation,
  validateProductOutputWithRepairs,
  type AlignmentSemanticAuditor,
  type AtomicityAudit,
  type AuthorityAudit,
  type GuardrailProductQuestion,
  type MaterialDecisionCoverageAudit,
  type MaterialDecisionCoverageInput,
} from "./runtime-guardrails.js";

const isolated = {
  workingDirectoryWasEmpty: true,
  workingDirectoryUnchanged: true,
  networkAccessEnabled: false as const,
  passed: true,
};

function auditorUsing(
  decide: (input: MaterialDecisionCoverageInput) => MaterialDecisionCoverageAudit,
  calls: MaterialDecisionCoverageInput[],
): AlignmentSemanticAuditor {
  return async (input) => {
    calls.push(input);
    return {
      threadId: `mock-alignment-${calls.length}`,
      audit: decide(input),
      usage: null,
      isolation: isolated,
    };
  };
}

function input(prdMarkdown: string, humanDecisions: MaterialDecisionCoverageInput["humanDecisions"] = []) {
  return {
    pmIntent: "Introduce a capability that lets people reuse a saved preference.",
    currentProductContext: [],
    prdMarkdown,
    humanDecisions,
  };
}

function rejected(boundary: string, reason: string): MaterialDecisionCoverageAudit {
  return {
    aligned: false,
    blockers: [
      { boundary, owner: "product", material: true, blocking: true, reason },
    ],
    nonBlockingOpenDecisions: [],
  };
}

function accepted(
  boundary: string,
  reason: string,
): MaterialDecisionCoverageAudit {
  return {
    aligned: true,
    blockers: [],
    nonBlockingOpenDecisions: [{ boundary, reason }],
  };
}

async function testMissingCoreEligibilityRejects(): Promise<void> {
  const calls: MaterialDecisionCoverageInput[] = [];
  const guard = new MaterialDecisionCoverageGuard(
    auditorUsing(
      () =>
        rejected(
          "Eligibility for the new capability",
          "Different eligible populations create materially different Product scope that Design cannot choose.",
        ),
      calls,
    ),
  );
  const result = await guard.audit(
    input("# PRD\n\n## Open Decisions\n\n- Eligibility for the new capability is unresolved."),
  );
  assert.equal(result.audit.aligned, false);
  assert.equal(result.audit.blockers[0]?.owner, "product");
  assert.equal(result.audit.blockers[0]?.material, true);
  assert.equal(result.audit.blockers[0]?.blocking, true);
}

async function testMissingCoreLifecycleRejects(): Promise<void> {
  const calls: MaterialDecisionCoverageInput[] = [];
  const guard = new MaterialDecisionCoverageGuard(
    auditorUsing(
      () =>
        rejected(
          "Relationship between reusable state and historical records",
          "Design would have to invent whether later edits mutate prior records.",
        ),
      calls,
    ),
  );
  const result = await guard.audit(
    input("# PRD\n\n## Open Decisions\n\n- Historical behavior after a saved value changes."),
  );
  assert.equal(result.audit.aligned, false);
  assert.match(result.audit.blockers[0]!.reason, /invent/i);
}

async function testDownstreamCommunicationMayRemainOpen(): Promise<void> {
  const calls: MaterialDecisionCoverageInput[] = [];
  const guard = new MaterialDecisionCoverageGuard(
    auditorUsing(
      () =>
        accepted(
          "Downstream communication policy",
          "The core handoff and outcome are defined; downstream communication may remain explicit and open.",
        ),
      calls,
    ),
  );
  const result = await guard.audit(
    input("# PRD\n\n## Open Decisions\n\n- Downstream communication policy remains open."),
  );
  assert.equal(result.audit.aligned, true);
  assert.equal(result.audit.nonBlockingOpenDecisions.length, 1);
}

async function testDesignPresentationDoesNotBlockAndCaches(): Promise<void> {
  const calls: MaterialDecisionCoverageInput[] = [];
  const guard = new MaterialDecisionCoverageGuard(
    auditorUsing(
      () =>
        accepted(
          "Exact placement and visual treatment",
          "This is Design-owned and does not change the Product behavior.",
        ),
      calls,
    ),
  );
  const proposal = input(
    "# PRD\n\n## Open Decisions\n\n- Exact screen placement and visual treatment remain open for Design.",
  );
  const first = await guard.audit(proposal);
  const second = await guard.audit(proposal);
  assert.equal(first.audit.aligned, true);
  assert.equal(second.audit.aligned, true);
  assert.equal(calls.length, 1);
  assert.equal(second.instrumentation.cached, true);
  assert.equal(guard.metrics.cacheHits, 1);
}

async function testBoundedDependencyPolicyDoesNotBlock(): Promise<void> {
  const calls: MaterialDecisionCoverageInput[] = [];
  const guard = new MaterialDecisionCoverageGuard(
    auditorUsing(
      () =>
        accepted(
          "Internal downstream policy after the defined handoff",
          "The Product handoff is sufficiently bounded; the dependency can own its internal policy.",
        ),
      calls,
    ),
  );
  const result = await guard.audit(
    input("# PRD\n\n## Open Decisions\n\n- A downstream system owns its internal policy after the defined handoff."),
  );
  assert.equal(result.audit.aligned, true);
  assert.equal(result.audit.blockers.length, 0);
}

async function testEstablishedCoreWithOpenProductDetailAligns(): Promise<void> {
  const calls: MaterialDecisionCoverageInput[] = [];
  const guard = new MaterialDecisionCoverageGuard(
    auditorUsing(
      () =>
        accepted(
          "Exact members and labels of the bounded option set",
          "The Product-owned content detail remains explicit, but the authorized capability, selection semantics, and Product effect are complete enough for Design.",
        ),
      calls,
    ),
  );
  const result = await guard.audit(
    input(`# PRD

## Required Product Behavior

- A person may attach one value from a Product-maintained, bounded, single-select option set to the completed operation.
- The selected value is stored with that operation and has no additional Product effect.

## Open Decisions

- Exact members and labels of the bounded option set remain Product-owned and unresolved.`),
  );
  assert.equal(result.audit.aligned, true);
  assert.equal(result.audit.blockers.length, 0);
  assert.equal(result.audit.nonBlockingOpenDecisions.length, 1);
  assert.match(
    result.audit.nonBlockingOpenDecisions[0]!.boundary,
    /members|labels|option set/i,
  );
}

type MockProductResponse = {
  status: "clarification_required" | "problem_aligned";
  problemAligned: boolean;
  questions: GuardrailProductQuestion[];
  prdMarkdown: string;
};

const authorityPassed: AuthorityAudit = { passed: true, claims: [] };

function atomicityPassed(questions: GuardrailProductQuestion[]): AtomicityAudit {
  return {
    passed: true,
    results: questions.map((question) => ({
      question: question.question,
      decisionVariable: "eligibility",
      atomic: true,
      reason: "The question varies one Product boundary.",
      independentAxes: [],
    })),
  };
}

async function validate(response: MockProductResponse) {
  return validateProductOutputWithRepairs({
    initialResponse: response,
    getQuestions: (candidate) => candidate.questions,
    auditAuthority: async () => authorityPassed,
    auditAtomicity: async (questions) => atomicityPassed(questions),
    repairAuthority: async () => {
      throw new Error("Authority repair was not expected.");
    },
    repairAtomicity: async () => {
      throw new Error("Atomicity repair was not expected.");
    },
  });
}

async function testFeedbackClarificationReconciliationAndReaudit(): Promise<void> {
  const events: string[] = [];
  const semanticCalls: MaterialDecisionCoverageInput[] = [];
  const guard = new MaterialDecisionCoverageGuard(
    auditorUsing((auditInput) => {
      events.push("alignment_audit");
      return auditInput.humanDecisions.some((decision) =>
        decision.answer.includes("eligible account"),
      )
        ? { aligned: true, blockers: [], nonBlockingOpenDecisions: [] }
        : rejected(
            "Eligibility for the capability",
            "Design would otherwise have to select the eligible population.",
          );
    }, semanticCalls),
  );
  const initial: MockProductResponse = {
    status: "problem_aligned",
    problemAligned: true,
    questions: [],
    prdMarkdown: "# PRD\n\n## Open Decisions\n\n- Eligibility is unresolved.",
  };
  const initialValidation = await validate(initial);
  events.push("authority_atomicity_passed");
  const firstAudit = await guard.audit(input(initial.prdMarkdown));
  assert.equal(firstAudit.audit.aligned, false);
  guard.recordRepairAttempt();
  const feedback = alignmentRepairPrompt(firstAudit.audit);
  events.push("feedback_same_product_thread");
  assert.match(feedback, /Eligibility for the capability/);
  assert.doesNotMatch(feedback, /eligible account/i);

  const clarification: MockProductResponse = {
    status: "clarification_required",
    problemAligned: false,
    questions: [
      {
        question: "Which account population is eligible for this capability?",
        whyMaterial: "Design cannot select the Product eligibility boundary.",
      },
    ],
    prdMarkdown: initial.prdMarkdown,
  };
  const clarificationValidation = await validate(clarification);
  events.push("authority_atomicity_passed");
  let routerCalls = 0;
  let revealCalls = 0;
  const routed = await routeAndRevealAfterValidation({
    validation: clarificationValidation,
    getQuestions: (candidate) => candidate.questions,
    route: async () => {
      events.push("router");
      routerCalls += 1;
      return { matched: true };
    },
    routeAllowsReveal: (route) => route.matched,
    reveal: () => {
      events.push("human_authority_revealed");
      revealCalls += 1;
      return "Only an eligible account may use the capability.";
    },
  });
  assert.equal(routed.status, "revealed");

  const reconciled: MockProductResponse = {
    status: "problem_aligned",
    problemAligned: true,
    questions: [],
    prdMarkdown: "# PRD\n\n## Scope\n\n- Only an eligible account may use the capability.",
  };
  await validate(reconciled);
  events.push("reconciliation_authority_atomicity_passed");
  const secondAudit = await guard.audit(
    input(reconciled.prdMarkdown, [
      {
        question: clarification.questions[0]!.question,
        answer: "Only an eligible account may use the capability.",
      },
    ]),
  );
  assert.equal(secondAudit.audit.aligned, true);
  assert.equal(routerCalls, 1);
  assert.equal(revealCalls, 1);
  assert.deepEqual(guard.metrics, {
    alignmentAuditCount: 2,
    alignmentRejectCount: 1,
    blockersReported: 1,
    nonBlockingOpenDecisions: 0,
    alignmentRepairCount: 1,
    semanticAuditCallCount: 2,
    cacheHits: 0,
  });
  assert.deepEqual(events, [
    "authority_atomicity_passed",
    "alignment_audit",
    "feedback_same_product_thread",
    "authority_atomicity_passed",
    "router",
    "human_authority_revealed",
    "reconciliation_authority_atomicity_passed",
    "alignment_audit",
  ]);
}

await testMissingCoreEligibilityRejects();
await testMissingCoreLifecycleRejects();
await testDownstreamCommunicationMayRemainOpen();
await testDesignPresentationDoesNotBlockAndCaches();
await testBoundedDependencyPolicyDoesNotBlock();
await testEstablishedCoreWithOpenProductDetailAligns();
await testFeedbackClarificationReconciliationAndReaudit();

console.log(
  "Pre-Alignment Material Decision Coverage behavioral tests passed (A-G plus cache stability).",
);
