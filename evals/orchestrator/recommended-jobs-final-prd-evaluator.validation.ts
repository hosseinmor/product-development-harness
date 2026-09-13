import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  filesUnder,
  networkIsolationWasVerifiedDisabled,
  observedSessionConfiguration,
} from "./prd-eval-runner-support.js";
import { runtimeGuardrailConfig } from "./runtime-guardrails.js";

const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const evaluatorPath = resolve(
  orchestratorDirectory,
  "evaluate-recommended-jobs-final-prd.ts",
);
const packagePath = resolve(orchestratorDirectory, "package.json");
const evaluationPrefix =
  "blind-final-prd-evaluation-recommended-jobs-not-interested-reason-";
const sourceRunId =
  "smoke-recommended-jobs-not-interested-reason-2026-09-13T06-22-48.986Z";
const sourceRunDirectory = resolve(runsDirectory, sourceRunId);

const evaluationDirectoriesBefore = (await readdir(runsDirectory)).filter(
  (name) => name.startsWith(evaluationPrefix),
);
const evaluatorSource = await readFile(evaluatorPath, "utf8");
const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as {
  scripts?: Record<string, string>;
};
const evaluatorModule = await import("./evaluate-recommended-jobs-final-prd.js");
const evaluationDirectoriesAfter = (await readdir(runsDirectory)).filter(
  (name) => name.startsWith(evaluationPrefix),
);

assert.deepEqual(
  evaluationDirectoriesAfter,
  evaluationDirectoriesBefore,
  "importing the evaluator must not execute it",
);
assert.equal(
  packageJson.scripts?.[
    "eval:recommended-jobs-not-interested-reason-final-prd"
  ],
  "tsx evaluate-recommended-jobs-final-prd.ts",
);
assert.equal(
  evaluatorModule.recommendedJobsFinalPrdEvaluatorStaticWiring.sourceRunId,
  sourceRunId,
);
assert.deepEqual(
  evaluatorModule.recommendedJobsFinalPrdEvaluatorStaticWiring.packageKeys,
  ["pmIntent", "finalPrd", "revealedProductClarifications"],
);
assert.deepEqual(
  evaluatorModule.recommendedJobsFinalPrdEvaluatorStaticWiring.clarificationKeys,
  ["question", "answers"],
);
assert.equal(
  evaluatorModule.recommendedJobsFinalPrdEvaluatorConfig.networkAccessEnabled,
  false,
);
assert.equal(
  evaluatorModule.recommendedJobsFinalPrdEvaluatorConfig.approvalPolicy,
  "never",
);
assert.equal(
  evaluatorModule.recommendedJobsFinalPrdEvaluatorConfig.model,
  "gpt-5.6-sol",
);
assert.equal(
  evaluatorModule.recommendedJobsFinalPrdEvaluatorConfig.reasoningEffort,
  "high",
);
assert.equal(
  evaluatorModule.recommendedJobsFinalPrdEvaluatorConfig.networkAccessEnabled,
  runtimeGuardrailConfig.networkAccessEnabled,
  "the evaluator and isolated semantic guards must request the same disabled-network setting",
);
assert.match(
  evaluatorSource,
  /\[permissions\.blind_prd_evaluator\.network\]\s+enabled = false/,
  "the evaluator permission profile must disable network",
);
assert.match(
  evaluatorSource,
  /networkAccessEnabled:\s*recommendedJobsFinalPrdEvaluatorConfig\.networkAccessEnabled/,
  "the SDK thread must receive the frozen network-disabled setting",
);
assert.ok(!evaluatorSource.includes("approvedFixtureAnswerBank"));
assert.ok(!evaluatorSource.includes("proposedFixtures"));
assert.ok(
  !evaluatorSource
    .slice(0, evaluatorSource.indexOf("const orchestratorDirectory"))
    .includes("productKnowledgeReferences"),
  "the evaluator must not import live Product Knowledge reference definitions",
);
assert.ok(!evaluatorSource.includes('readFile(resolve(sourceRunDirectory, "turns.json")'));

const [metadataText, finalPrd] = await Promise.all([
  readFile(resolve(sourceRunDirectory, "run-metadata.json"), "utf8"),
  readFile(resolve(sourceRunDirectory, "workspace/outputs/prd.md"), "utf8"),
]);
const metadata = JSON.parse(metadataText) as {
  fixtureAnswers: Array<{
    question: string;
    fixtures: Array<{ id: string; answer: string }>;
  }>;
  fixtureIdsUnused: string[];
  productKnowledge: {
    references: Array<{
      id: string;
      repositoryRelativePath: string;
      sha256: string;
    }>;
    inputHashes: Record<string, string>;
  };
};
const evaluationPackage =
  evaluatorModule.buildRecommendedJobsFinalPrdEvaluationPackage({
    finalPrd,
    revealedProductClarifications: metadata.fixtureAnswers.map(
      ({ question, fixtures }) => ({
        question,
        answers: fixtures.map(({ answer }) => answer),
      }),
    ),
  });
assert.deepEqual(Object.keys(evaluationPackage), [
  "pmIntent",
  "finalPrd",
  "revealedProductClarifications",
]);
assert.equal(
  evaluationPackage.revealedProductClarifications.length,
  metadata.fixtureAnswers.length,
);
assert.ok(
  evaluationPackage.revealedProductClarifications.every(
    (entry: Record<string, unknown>) =>
      Object.keys(entry).sort().join(",") === "answers,question",
  ),
);
const serializedPackage = JSON.stringify(evaluationPackage);
assert.ok(!serializedPackage.includes(sourceRunId));
assert.ok(!serializedPackage.includes("fixtureAnswers"));
assert.ok(!serializedPackage.includes("runtimeGuardrails"));
assert.ok(!serializedPackage.includes("fixtureRoutes"));
assert.ok(!serializedPackage.includes("acceptedProblemAligned"));
for (const fixtureId of metadata.fixtureIdsUnused) {
  assert.ok(!serializedPackage.includes(fixtureId));
}

const temporaryRoot = await mkdtemp(
  resolve(tmpdir(), "historical-pk-provenance-static-"),
);
try {
  const frozenRoot = resolve(temporaryRoot, "frozen");
  const changedLiveRoot = resolve(temporaryRoot, "live");
  const targetRoot = resolve(temporaryRoot, "evaluator-reference");
  const relativePath = "area/context.md";
  const frozenContent = "historical source-run Product Knowledge bytes\n";
  const changedLiveContent = "later changed live Product Knowledge bytes\n";
  const frozenHash = createHash("sha256")
    .update(frozenContent)
    .digest("hex");
  await Promise.all([
    mkdir(resolve(frozenRoot, "area"), { recursive: true }),
    mkdir(resolve(changedLiveRoot, "area"), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(resolve(frozenRoot, relativePath), frozenContent, "utf8"),
    writeFile(resolve(changedLiveRoot, relativePath), changedLiveContent, "utf8"),
  ]);
  const syntheticReferences = [
    {
      id: "context.reference",
      repositoryRelativePath: relativePath,
      sha256: frozenHash,
    },
  ];
  const syntheticInputHashes = {
    [`context/product-knowledge/${relativePath}`]: frozenHash,
  };
  await evaluatorModule.stageVerifiedFrozenProductKnowledge({
    sourceProductKnowledgeRoot: frozenRoot,
    targetProductKnowledgeRoot: targetRoot,
    references: syntheticReferences,
    sourceRunInputHashes: syntheticInputHashes,
  });
  assert.equal(
    await readFile(resolve(targetRoot, relativePath), "utf8"),
    frozenContent,
    "later live Product Knowledge changes must not affect historical input",
  );
  assert.notEqual(
    await readFile(resolve(targetRoot, relativePath), "utf8"),
    changedLiveContent,
  );

  await writeFile(
    resolve(frozenRoot, relativePath),
    "tampered frozen Product Knowledge bytes\n",
    "utf8",
  );
  await assert.rejects(
    evaluatorModule.stageVerifiedFrozenProductKnowledge({
      sourceProductKnowledgeRoot: frozenRoot,
      targetProductKnowledgeRoot: resolve(temporaryRoot, "tampered-target"),
      references: syntheticReferences,
      sourceRunInputHashes: syntheticInputHashes,
    }),
    /hash mismatch/,
  );

  const actualFrozenRoot = resolve(
    sourceRunDirectory,
    "workspace/context/product-knowledge",
  );
  const actualTargetRoot = resolve(temporaryRoot, "actual-evaluator-reference");
  const actualHashes =
    await evaluatorModule.stageVerifiedFrozenProductKnowledge({
      sourceProductKnowledgeRoot: actualFrozenRoot,
      targetProductKnowledgeRoot: actualTargetRoot,
      references: metadata.productKnowledge.references,
      sourceRunInputHashes: metadata.productKnowledge.inputHashes,
    });
  assert.deepEqual(
    await filesUnder(actualTargetRoot),
    metadata.productKnowledge.references
      .map(({ repositoryRelativePath }) => repositoryRelativePath)
      .sort(),
    "evaluator reference must contain only source-run verified PK files",
  );
  const evaluatorVisibleReference = (
    await Promise.all(
      (await filesUnder(actualTargetRoot)).map((path) =>
        readFile(resolve(actualTargetRoot, path), "utf8"),
      ),
    )
  ).join("\n");
  assert.ok(!evaluatorVisibleReference.includes(sourceRunId));
  assert.ok(!evaluatorVisibleReference.includes(sourceRunDirectory));
  for (const hash of Object.values(actualHashes)) {
    assert.ok(!evaluatorVisibleReference.includes(hash));
    assert.ok(!serializedPackage.includes(hash));
  }

  const restrictedObservationRoot = resolve(
    temporaryRoot,
    "restricted-observation",
  );
  const unknownObservationRoot = resolve(temporaryRoot, "unknown-observation");
  await Promise.all([
    mkdir(restrictedObservationRoot, { recursive: true }),
    mkdir(unknownObservationRoot, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(
      resolve(restrictedObservationRoot, "session.jsonl"),
      `${JSON.stringify({
        type: "turn_context",
        payload: {
          model: "gpt-5.6-sol",
          cwd: "/isolated/evaluator",
          approval_policy: "never",
          permission_profile: { network: "restricted" },
        },
      })}\n`,
      "utf8",
    ),
    writeFile(
      resolve(unknownObservationRoot, "session.jsonl"),
      `${JSON.stringify({
        type: "turn_context",
        payload: {
          model: "gpt-5.6-sol",
          cwd: "/isolated/evaluator",
          approval_policy: "never",
        },
      })}\n`,
      "utf8",
    ),
  ]);
  const restrictedObservation = await observedSessionConfiguration(
    restrictedObservationRoot,
  );
  assert.equal(restrictedObservation.networkAccessEnabled, false);
  assert.equal(
    restrictedObservation.networkIsolationEvidence,
    "permission_profile",
  );
  assert.equal(networkIsolationWasVerifiedDisabled(restrictedObservation), true);
  const unknownObservation = await observedSessionConfiguration(
    unknownObservationRoot,
  );
  assert.equal(unknownObservation.networkAccessEnabled, null);
  assert.equal(unknownObservation.networkIsolationEvidence, "unobserved");
  assert.equal(networkIsolationWasVerifiedDisabled(unknownObservation), false);
  assert.equal(
    networkIsolationWasVerifiedDisabled({
      networkAccessEnabled: false,
      networkIsolationEvidence: "unobserved",
    }),
    false,
    "a requested or assumed false value without observed evidence must not pass",
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

console.log(
  JSON.stringify(
    {
      status: "passed",
      staticValidationOnly: true,
      evaluatorExecuted: false,
      modelCalls: 0,
      sourceRunId,
      revealedClarificationCount:
        evaluationPackage.revealedProductClarifications.length,
      hiddenFixtureBankImported: false,
      unusedFixtureAnswersExposed: false,
      runtimeAndRouterEvidenceExposed: false,
      historicalFrozenPkIndependentOfLiveState: true,
      frozenPkTamperRejected: true,
      evaluatorVisiblePkProvenanceLeakage: false,
      evaluatorMatchesSemanticGuardNetworkProfile: true,
      permissionProfileNetworkIsolationObserved: true,
      unverifiableNetworkIsolationRejected: true,
      evaluatorConfig: evaluatorModule.recommendedJobsFinalPrdEvaluatorConfig,
      npmCommand:
        evaluatorModule.recommendedJobsFinalPrdEvaluatorStaticWiring.npmCommand,
    },
    null,
    2,
  ),
);
