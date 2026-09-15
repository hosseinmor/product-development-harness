import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runtimeDirectory = resolve(repositoryRoot, "runtime");
const runtimePrdDirectory = resolve(runtimeDirectory, "prd");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const runnerPath = resolve(
  orchestratorDirectory,
  "run-recommended-jobs-not-interested-reason-smoke.ts",
);
const runtimeGuardrailsPath = resolve(
  repositoryRoot,
  "runtime/prd/runtime-guardrails.ts",
);
const evalCompositionPath = resolve(
  orchestratorDirectory,
  "eval-runtime-guardrail-composition.ts",
);
const packagePath = resolve(orchestratorDirectory, "package.json");
const runPrefix = "smoke-recommended-jobs-not-interested-reason-";

async function typescriptSourcesUnder(
  directory: string,
): Promise<Array<{ path: string; source: string }>> {
  const entries = await readdir(directory, { withFileTypes: true });
  const results: Array<{ path: string; source: string }> = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) results.push(...(await typescriptSourcesUnder(path)));
    else if (entry.isFile() && entry.name.endsWith(".ts")) {
      results.push({ path, source: await readFile(path, "utf8") });
    }
  }
  return results;
}

const runDirectoriesBeforeImport = (await readdir(runsDirectory)).filter((name) =>
  name.startsWith(runPrefix),
);
await access(runnerPath);
const runnerSource = await readFile(runnerPath, "utf8");
const runtimeGuardrailsSource = await readFile(runtimeGuardrailsPath, "utf8");
const evalCompositionSource = await readFile(evalCompositionPath, "utf8");
const runtimeSources = await typescriptSourcesUnder(runtimeDirectory);
const runtimePrdSources = await typescriptSourcesUnder(runtimePrdDirectory);
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
  /from "\.\/eval-runtime-guardrail-composition\.js"/,
  "eval clarification routing/revelation must be imported from the composition layer",
);
assert.ok(
  runtimeSources.every(({ source }) => !/from\s+["'][^"']*evals\//.test(source)),
  "runtime modules must not import from evals",
);
assert.ok(
  runtimePrdSources.every(
    ({ source }) =>
      !source.includes("@openai/codex-sdk") &&
      !/from\s+["'][^"']*adapters\/codex/.test(source),
  ),
  "runtime/prd must not depend on Codex SDK or the Codex adapter",
);
assert.match(
  runnerSource,
  /from "\.\.\/\.\.\/runtime\/adapters\/codex\/codex-prd-semantic-auditor\.js"/,
  "eval runner must compose the Codex semantic auditor externally",
);
assert.match(
  runnerSource,
  /from "\.\.\/\.\.\/runtime\/prd\/runtime-guardrails\.js"/,
  "eval runner must consume reusable PRD runtime guards externally",
);
assert.doesNotMatch(
  runtimeGuardrailsSource,
  /fixture|hidden answers?|semantic fixture|router|routeAndRevealAfterValidation/i,
  "reusable runtime guardrails must not contain eval fixture/router concepts",
);
assert.match(
  evalCompositionSource,
  /export async function routeAndRevealAfterValidation/,
  "eval composition must own route-before-reveal orchestration",
);
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
