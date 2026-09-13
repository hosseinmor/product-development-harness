import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const runnerPath = resolve(
  orchestratorDirectory,
  "run-recommended-jobs-not-interested-reason-smoke.ts",
);
const packagePath = resolve(orchestratorDirectory, "package.json");
const runPrefix = "smoke-recommended-jobs-not-interested-reason-";

const runDirectoriesBeforeImport = (await readdir(runsDirectory)).filter((name) =>
  name.startsWith(runPrefix),
);
await access(runnerPath);
const runnerSource = await readFile(runnerPath, "utf8");
const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as {
  scripts?: Record<string, string>;
};
const runnerModule = await import(
  "./run-recommended-jobs-not-interested-reason-smoke.js"
);
const caseModule = await import(
  "./recommended-jobs-not-interested-reason-smoke.js"
);
const runDirectoriesAfterImport = (await readdir(runsDirectory)).filter((name) =>
  name.startsWith(runPrefix),
);

const wiring = runnerModule.recommendedJobsSmokeRunnerStaticWiring;
const initialPrompt = runnerModule.buildRecommendedJobsInitialPrompt();

assert.equal(
  packageJson.scripts?.["eval:recommended-jobs-not-interested-reason-smoke"],
  "tsx run-recommended-jobs-not-interested-reason-smoke.ts",
  "npm smoke command must resolve to the explicit entrypoint",
);
assert.match(
  runnerSource,
  /from "\.\/recommended-jobs-not-interested-reason-smoke\.js"/,
  "runner must import the frozen case module",
);
assert.ok(
  !runnerSource.includes("export const proposedFrozenPmIntent ="),
  "runner must not duplicate the frozen PM Intent",
);
assert.ok(
  !runnerSource.includes("export const proposedFixtures"),
  "runner must not duplicate the fixture bank",
);
assert.deepEqual(wiring.fixtureIds, [
  "NI-1",
  "NI-2A",
  "NI-2B",
  "NI-3",
  "NI-4",
  "NI-6",
  "NI-7A",
  "NI-7B",
]);
assert.equal(wiring.fixtureBankStatus, "human-approved-and-frozen");
assert.ok(initialPrompt.includes(caseModule.proposedFrozenPmIntent));
assert.ok(
  caseModule.explicitPmSuppliedCurrentFacts.every(
    ({ statement }: { statement: string }) => initialPrompt.includes(statement),
  ),
);
assert.ok(
  caseModule.proposedFixtures.every(
    ({ proposedHiddenAnswer }: { proposedHiddenAnswer: { text: string } }) =>
      !initialPrompt.includes(proposedHiddenAnswer.text),
  ),
  "hidden answers must not enter Product Child initial input",
);
assert.ok(
  caseModule.routerVisibleFixtures().every(
    ({ routingDescription }: { routingDescription: string }) =>
      !initialPrompt.includes(routingDescription),
  ),
  "Router descriptions must not enter Product Child initial input",
);

const authorityGuardIndex = wiring.runtimeOrder.indexOf("Authority Guard");
const materialityGuardIndex = wiring.runtimeOrder.indexOf(
  "Clarification Materiality Guard",
);
const atomicityGuardIndex = wiring.runtimeOrder.indexOf("Atomicity Guard");
const routerIndex = wiring.runtimeOrder.indexOf("Semantic Router");
const revealIndex = wiring.runtimeOrder.indexOf("fixture reveal");
const reconciliationIndex = wiring.runtimeOrder.indexOf(
  "Product Child reconciliation",
);
const secondAuthorityIndex = wiring.runtimeOrder.lastIndexOf("Authority Guard");
const alignmentIndex = wiring.runtimeOrder.indexOf(
  "Material Decision Coverage Guard",
);
assert.ok(authorityGuardIndex < materialityGuardIndex);
assert.ok(materialityGuardIndex < atomicityGuardIndex);
assert.ok(atomicityGuardIndex < routerIndex);
assert.ok(routerIndex < revealIndex);
assert.ok(revealIndex < reconciliationIndex);
assert.ok(reconciliationIndex < secondAuthorityIndex);
assert.ok(secondAuthorityIndex < alignmentIndex);

const revealValidationIndex = runnerSource.indexOf(
  'if (routing.status !== "revealed")',
);
const ledgerExtensionIndex = runnerSource.lastIndexOf("extendAuthorityLedger(");
assert.ok(revealValidationIndex >= 0);
assert.ok(
  revealValidationIndex < ledgerExtensionIndex,
  "Authority Ledger may only extend after a validated route is revealed",
);
assert.match(runnerSource, /routeAndRevealAfterValidation\(/);
assert.match(
  runnerSource,
  /result\.routes\.every\(\(route\) => route\.status === "matched"\)/,
  "the whole batch must match before any answer reveal",
);
assert.match(
  runnerSource,
  /response\.problemAligned && response\.status === "problem_aligned"/,
);
assert.match(runnerSource, /alignmentGuard\.audit\(/);
assert.match(runnerSource, /alignmentRepairPrompt\(/);
assert.match(runnerSource, /clarificationMaterialityGuard\.audit\(/);
assert.match(runnerSource, /clarificationMaterialityRepairPrompt\(/);
assert.deepEqual(wiring.outputFiles, [
  "workspace/outputs/prd.md",
  "turns.json",
  "run-metadata.json",
]);
assert.equal(wiring.networkAccessEnabled, false);
assert.equal(wiring.approvalPolicy, "never");
assert.equal(wiring.freshThread, true);
assert.match(runnerSource, /networkAccessEnabled: false/);
assert.match(runnerSource, /approvalPolicy: "never"/);
assert.deepEqual(
  runDirectoriesAfterImport,
  runDirectoriesBeforeImport,
  "static validation import must not execute the smoke runner",
);

console.log(
  JSON.stringify(
    {
      status: "passed",
      caseDataReady: true,
      fixtureBankReady: true,
      executableRunnerReady: true,
      modelCalls: 0,
      smokeExecuted: false,
      fixtureCountAtRouterBoundary: wiring.fixtureIds.length,
      hiddenAnswersInInitialPrompt: false,
      alignmentHookPresent: true,
      outputPathsValidated: wiring.outputFiles,
      npmCommand: wiring.npmCommand,
    },
    null,
    2,
  ),
);
