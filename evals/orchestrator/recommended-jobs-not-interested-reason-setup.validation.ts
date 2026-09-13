import assert from "node:assert/strict";
import {
  approvedFixtureAnswerBank,
  assertFixtureBankReviewComplete,
  designOwnedUncertaintiesExcludedFromFixtures,
  expectedAuthorityBoundaries,
  fixtureBankStatus,
  futureSmokeConfig,
  intentionallyDeferredConditionalDecision,
  nonBlockingProductUncertaintiesExcludedFromFixtures,
  productKnowledgeReferenceSetup,
  productKnowledgeReferences,
  proposedFixtures,
  proposedFrozenPmIntent,
  routerVisibleFixtures,
  syntheticEvalTruthLabel,
  validateProductKnowledgeReferences,
} from "./recommended-jobs-not-interested-reason-smoke.js";

const expectedIntent = `کارجو در بخش شغل‌های پیشنهادی می‌تواند مشخص کند که به یک موقعیت شغلی علاقه‌مند نیست.

می‌خواهیم بعد از اعلام عدم علاقه، امکان ثبت دلیل آن را هم به کارجو بدهیم تا علاوه بر ثبت عدم علاقه، سیگنال دقیق‌تری درباره نامناسب بودن پیشنهاد داشته باشیم و این داده بتواند برای بهبود تجربه پیشنهاد شغل استفاده شود.

نمی‌خواهیم گرفتن این feedback باعث اصطکاک غیرضروری در تجربه مرور شغل‌های پیشنهادی شود.

هنوز درباره الزامی یا اختیاری بودن ثبت دلیل، مدل و تعداد دلیل‌های قابل ثبت، اثر این feedback روی همان Job Post یا سایر پیشنهادها، امکان بازگرداندن تصمیم، مالکیت state و ماندگاری آن نهایی نکرده‌ایم.`;

assert.equal(proposedFrozenPmIntent, expectedIntent, "PM Intent drifted");
assert.ok(
  proposedFixtures.length === 8,
  "frozen fixture bank must contain exactly eight decisions",
);
assert.equal(
  new Set(proposedFixtures.map(({ id }) => id)).size,
  proposedFixtures.length,
  "fixture ids must be unique",
);
assert.equal(
  new Set(proposedFixtures.map(({ decisionVariable }) => decisionVariable)).size,
  proposedFixtures.length,
  "each fixture must own one distinct decision variable",
);

for (const fixture of proposedFixtures) {
  assert.equal(fixture.reviewStatus, "approved");
  assert.equal(fixture.productionDecisionAuthority, "not-production-authority");
  assert.equal(
    fixture.proposedHiddenAnswer.authority,
    "human-approved-synthetic-eval-truth",
  );
  assert.equal(
    fixture.proposedHiddenAnswer.authorityScope,
    "frozen-eval-case-only",
  );
  assert.equal(fixture.proposedHiddenAnswer.label, syntheticEvalTruthLabel);
  assert.ok(fixture.routingDescription.length > 80);
  assert.ok(fixture.proposedHiddenAnswer.text.length > 20);
  assert.ok(
    !fixture.routingDescription.includes(fixture.proposedHiddenAnswer.text),
    `${fixture.id} routing description leaks its answer`,
  );
}

assert.deepEqual(
  proposedFixtures.map(({ id }) => id),
  ["NI-1", "NI-2A", "NI-2B", "NI-3", "NI-4", "NI-6", "NI-7A", "NI-7B"],
  "fixture identity/order drifted",
);
assert.equal(fixtureBankStatus, "human-approved-and-frozen");

const atomicityBoundaries = Object.fromEntries(
  proposedFixtures.map(
    ({ id, decisionVariableKey, excludedDecisionVariables }) => [
      id,
      { decisionVariableKey, excludedDecisionVariables },
    ],
  ),
);
assert.deepEqual(atomicityBoundaries["NI-2A"], {
  decisionVariableKey: "reason_input_model",
  excludedDecisionVariables: ["reason_requiredness", "reason_cardinality"],
});
assert.deepEqual(atomicityBoundaries["NI-2B"], {
  decisionVariableKey: "reason_cardinality",
  excludedDecisionVariables: ["reason_requiredness", "reason_input_model"],
});
assert.deepEqual(atomicityBoundaries["NI-3"], {
  decisionVariableKey: "same_job_suppression",
  excludedDecisionVariables: ["other_job_recommendation_effect"],
});
assert.deepEqual(atomicityBoundaries["NI-4"], {
  decisionVariableKey: "other_job_recommendation_effect",
  excludedDecisionVariables: ["same_job_suppression"],
});
assert.deepEqual(atomicityBoundaries["NI-7A"], {
  decisionVariableKey: "state_ownership",
  excludedDecisionVariables: ["state_persistence"],
});
assert.deepEqual(atomicityBoundaries["NI-7B"], {
  decisionVariableKey: "state_persistence",
  excludedDecisionVariables: ["state_ownership"],
});

const answerLeakFragments: Record<string, string[]> = {
  "NI-1": ["can complete successfully without"],
  "NI-2A": ["supports only a predefined", "no free-text"],
  "NI-2B": ["at most one"],
  "NI-3": ["is excluded from Recommended Jobs"],
  "NI-4": ["does not automatically affect"],
  "NI-6": ["can reverse the active"],
  "NI-7A": ["Candidate-account-owned"],
  "NI-7B": ["until the Candidate reverses"],
};
for (const fixture of proposedFixtures) {
  for (const fragment of answerLeakFragments[fixture.id] ?? []) {
    assert.ok(
      !fixture.routingDescription
        .toLocaleLowerCase("en-US")
        .includes(fragment.toLocaleLowerCase("en-US")),
      `${fixture.id} Router description leaks frozen answer fragment: ${fragment}`,
    );
  }
}

const routerFixtures = routerVisibleFixtures();
assert.deepEqual(
  Object.keys(routerFixtures[0] ?? {}).sort(),
  ["id", "routingDescription"],
  "Router-visible fixtures must not expose answers or review metadata",
);
assert.equal(routerFixtures.length, proposedFixtures.length);

assert.equal(
  intentionallyDeferredConditionalDecision.originalInventoryNumber,
  5,
);
assert.match(
  intentionallyDeferredConditionalDecision.status,
  /not_applicable/,
);
assert.ok(designOwnedUncertaintiesExcludedFromFixtures.length >= 3);
assert.ok(nonBlockingProductUncertaintiesExcludedFromFixtures.length >= 3);
assert.ok(expectedAuthorityBoundaries.prohibitedInheritance.length >= 3);

assert.equal(futureSmokeConfig.productChild.networkAccessEnabled, false);
assert.equal(futureSmokeConfig.fixtureBankStatus, "human-approved-and-frozen");
assert.equal(futureSmokeConfig.productChild.approvalPolicy, "never");
assert.equal(futureSmokeConfig.productChild.freshThread, true);
assert.equal(futureSmokeConfig.semanticRouter.networkAccessEnabled, false);
assert.equal(futureSmokeConfig.runtimeGuardrails.networkAccessEnabled, false);
assert.equal(
  productKnowledgeReferenceSetup.futureWorkspaceTarget,
  "context/product-knowledge",
);
assert.equal(productKnowledgeReferenceSetup.generatedArtifactsCommitted, false);
assert.deepEqual(
  productKnowledgeReferences.map(({ id }) => id),
  ["jobvision.candidate.recommended-jobs", "shared.job-post"],
);

await validateProductKnowledgeReferences();

assert.doesNotThrow(assertFixtureBankReviewComplete);
const approvedAnswers = approvedFixtureAnswerBank();
assert.equal(Object.keys(approvedAnswers).length, 8);
assert.deepEqual(Object.keys(approvedAnswers), proposedFixtures.map(({ id }) => id));

console.log(
  JSON.stringify(
    {
      status: "passed",
      validationOnly: true,
      productChildExecuted: false,
      fixtureCount: proposedFixtures.length,
      routerVisibleFixtureCount: routerFixtures.length,
      productKnowledgeReferenceCount: productKnowledgeReferences.length,
      fixtureAnswersActivated: true,
      fixtureAtomicityStructuralValidation: "passed",
      answerLeakValidation: "passed",
      caseDataReady: true,
      fixtureBankReady: true,
      smokeExecuted: false,
    },
    null,
    2,
  ),
);
