import { Codex, type ThreadItem, type Usage } from "@openai/codex-sdk";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  approvedFixtureAnswerBank,
  assertFixtureBankReviewComplete,
  explicitPmSuppliedCurrentFacts,
  fixtureBankStatus,
  futureSmokeConfig,
  productKnowledgeReferences,
  proposedFixtures,
  proposedFrozenPmIntent,
  routerVisibleFixtures,
  validateProductKnowledgeReferences,
  type ProposedFixture,
} from "./recommended-jobs-not-interested-reason-smoke.js";
import {
  AuthorityLedgerGuard,
  ClarificationMaterialityGuard,
  MaterialDecisionCoverageGuard,
  alignmentRepairPrompt,
  atomicityRepairPrompt,
  auditClarificationAtomicity,
  authorityRepairPrompt,
  clarificationMaterialityRepairPrompt,
  createAuthorityLedger,
  extendAuthorityLedger,
  productChildAuthorityClaimsSchema,
  routeAndRevealAfterValidation,
  runtimeGuardrailConfig,
  runtimeGuardrailSchemas,
  validateProductOutputWithRepairs,
  type AlignmentGuardResult,
  type AtomicityAudit,
  type AuthorityClaimSidecar,
  type AuthorityGuardResult,
  type AuthorityLedger,
  type ClarificationMaterialityGuardResult,
  type SemanticGuardResult,
} from "./runtime-guardrails.js";
import { semanticFixtureRouterConfig } from "./semantic-fixture-router.js";
import {
  createIsolatedPrdWorkspace,
  filesUnder,
  inputHashes,
  observedSessionConfiguration,
  pathExists,
  repositoryGitStatus,
  routeQuestionsWithFixtureDescriptions,
  type FixtureRoute,
  type RouterResult,
} from "./prd-eval-runner-support.js";

const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const maximumTurns = 8;

type FixtureId = ProposedFixture["id"];
type ProductQuestion = { question: string; whyMaterial: string };
type ProductKnowledgeContext = { url: string; title: string; context: string };
type ChildResponse = {
  status: "clarification_required" | "problem_aligned" | "blocked";
  problemAligned: boolean;
  alignmentRationale: string;
  productQuestions: ProductQuestion[];
  retrievedProductKnowledge: ProductKnowledgeContext[];
  prdMarkdown: string;
  authorityClaims: AuthorityClaimSidecar[];
};
type RunStatus =
  | "problem_aligned"
  | "blocked_on_runtime_authority_validation"
  | "blocked_on_runtime_clarification_materiality_validation"
  | "blocked_on_runtime_atomicity_validation"
  | "blocked_on_runtime_alignment_validation"
  | "blocked_on_ambiguous_fixture_route"
  | "blocked_on_no_match_fixture_route"
  | "max_turns_reached"
  | "technical_failure";
type GuardrailRepairTurn = {
  guard: "authority" | "clarification_materiality" | "atomicity";
  attempt: number;
  prompt: string;
  response: ChildResponse;
  rawFinalResponse: string;
  items: ThreadItem[];
  usage: Usage | null;
};
type RecordedTurn = {
  number: number;
  prompt: string;
  initialResponse: ChildResponse | null;
  initialRawFinalResponse: string;
  response: ChildResponse | null;
  rawFinalResponse: string;
  items: ThreadItem[];
  usage: Usage | null;
  guardrailRepairs: GuardrailRepairTurn[];
};
type RuntimeGuardAuditRecord =
  | {
      productTurn: number;
      sequence: number;
      guard: "authority";
      result: AuthorityGuardResult;
    }
  | {
      productTurn: number;
      sequence: number;
      guard: "clarification_materiality";
      result: ClarificationMaterialityGuardResult;
    }
  | {
      productTurn: number;
      sequence: number;
      guard: "atomicity";
      result: SemanticGuardResult<AtomicityAudit>;
    }
  | {
      productTurn: number;
      sequence: number;
      guard: "alignment";
      result: AlignmentGuardResult;
    };

export const recommendedJobsSmokeRunnerStaticWiring = {
  executableEntrypoint:
    "evals/orchestrator/run-recommended-jobs-not-interested-reason-smoke.ts",
  npmCommand: "npm run eval:recommended-jobs-not-interested-reason-smoke",
  fixtureBankStatus,
  fixtureIds: proposedFixtures.map(({ id }) => id),
  model: futureSmokeConfig.productChild.model,
  reasoningEffort: futureSmokeConfig.productChild.reasoningEffort,
  networkAccessEnabled: futureSmokeConfig.productChild.networkAccessEnabled,
  approvalPolicy: futureSmokeConfig.productChild.approvalPolicy,
  freshThread: futureSmokeConfig.productChild.freshThread,
  runtimeOrder: [
    "Product Child",
    "Authority Guard",
    "Clarification Materiality Guard",
    "Atomicity Guard",
    "Semantic Router",
    "fixture reveal",
    "Product Child reconciliation",
    "Authority Guard",
    "Material Decision Coverage Guard",
  ],
  outputFiles: ["workspace/outputs/prd.md", "turns.json", "run-metadata.json"],
  validationImportsAreSideEffectFree: true,
} as const;

function childOutputSchema(ledger: AuthorityLedger) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      status: {
        type: "string",
        enum: ["clarification_required", "problem_aligned", "blocked"],
      },
      problemAligned: { type: "boolean" },
      alignmentRationale: { type: "string" },
      productQuestions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            question: { type: "string" },
            whyMaterial: { type: "string" },
          },
          required: ["question", "whyMaterial"],
        },
      },
      retrievedProductKnowledge: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            url: { type: "string" },
            title: { type: "string" },
            context: { type: "string" },
          },
          required: ["url", "title", "context"],
        },
      },
      prdMarkdown: { type: "string" },
      authorityClaims: productChildAuthorityClaimsSchema(ledger),
    },
    required: [
      "status",
      "problemAligned",
      "alignmentRationale",
      "productQuestions",
      "retrievedProductKnowledge",
      "prdMarkdown",
      "authorityClaims",
    ],
  } as const;
}

export function buildRecommendedJobsInitialPrompt(): string {
  const currentFacts = explicitPmSuppliedCurrentFacts
    .map(
      ({ statement, limits }) =>
        `Current Product fact supplied by PM: ${statement}\nAuthority limit: ${limits}`,
    )
    .join("\n\n");
  return `You are the child Product agent for a fresh, small cross-domain PRD Harness smoke test. Work only inside the isolated generated workspace that is your current working directory.

Start with AGENTS.md. Discover and follow the relevant workflow and artifact contract for a PRD Draft + Clarification task. Use only the local Product Knowledge under context/product-knowledge as current Product context and retrieve the smallest relevant set yourself.

Do not use network access, web search, paths outside this workspace, previous PRDs, earlier evals, unavailable context, or expected outcomes. Do not alter Harness, workflow, contract, or Product Knowledge input files. Return drafts through the structured response; the parent persists the final PRD.

${currentFacts}

Do not infer any undocumented behavior of the current Not Interested action. In particular, its storage, suppression, recommendation effects, reversibility, ownership, and persistence are not established by the current fact above.

PM Intent:

${proposedFrozenPmIntent}

Execute the real PRD Draft + Clarification workflow: retrieve relevant current context, produce a best-effort PRD, run semantic normalization and ambiguity scan, and ask only targeted material Product clarifications that cannot be resolved from authority. Product Knowledge establishes current facts and constraints, not intended behavior for this change. Do not invent unresolved Product decisions.

Each productQuestions item must request exactly one independently answerable Product decision. If different answers could independently change scope, semantics, lifecycle, eligibility, or success behavior, split them into separate questions. Before asking, confirm the uncertainty is Product-owned and materially blocking for Problem Alignment; keep Design-owned and non-blocking uncertainty open when useful. This instruction establishes no Product answer.

If material clarification is required, return status=clarification_required, problemAligned=false, the smallest useful atomic question batch, and the current PRD in prdMarkdown. If no blocking material ambiguity remains, return status=problem_aligned, problemAligned=true, and the complete contract-compliant PRD. Use status=blocked only for a non-Product technical/context blocker.`;
}

async function routeProductQuestions(questions: string[]): Promise<RouterResult<FixtureId>> {
  return routeQuestionsWithFixtureDescriptions({
    questions,
    fixtures: routerVisibleFixtures(),
    temporaryDirectoryPrefix: "harness-recommended-jobs",
  });
}
function fixtureForId(id: FixtureId): ProposedFixture {
  const fixture = proposedFixtures.find((candidate) => candidate.id === id);
  if (!fixture) throw new Error(`Missing frozen fixture ${id}.`);
  return fixture;
}

function followUpPrompt(
  questions: Array<{ question: ProductQuestion; fixtures: ProposedFixture[] }>,
  answerBank: Record<string, string>,
): string {
  const answers = questions
    .map(({ question, fixtures }) => {
      const answer = fixtures.map((fixture) => answerBank[fixture.id]).join("\n");
      return `سؤال خودت: ${question.question}\nپاسخ authoritative Product فقط برای همین سؤال:\n${answer}`;
    })
    .join("\n\n");
  return `Product فقط به سؤال‌های مادی turn قبل پاسخ داده است:

${answers}

این پاسخ‌ها فقط برای همین eval، authoritative Product decisions هستند. چیزی فراتر از متن همین پاسخ‌های ارائه‌شده استنباط نکن. همان workflow را در همین thread ادامه بده: draft را reconcile و ambiguity scan را دوباره اجرا کن. اگر judgment مادی دیگری لازم است فقط سؤال اتمیک و Product-owned آن را برگردان. Design-owned و non-blocking uncertainty را باز نگه دار. اگر ambiguity مادی باز نمانده، PRD کامل را در prdMarkdown برگردان و فقط آن‌وقت status=problem_aligned و problemAligned=true کن.`;
}

export async function runRecommendedJobsNotInterestedReasonSmoke(): Promise<void> {
  const startedAt = new Date();
  const wallClockStarted = performance.now();
  assertFixtureBankReviewComplete();
  await validateProductKnowledgeReferences();
  const answerBank = approvedFixtureAnswerBank();
  const fixtureIds = proposedFixtures.map(({ id }) => id);
  await mkdir(runsDirectory, { recursive: true });
  const runId = `smoke-recommended-jobs-not-interested-reason-${startedAt
    .toISOString()
    .replaceAll(":", "-")}`;
  const runDirectory = resolve(runsDirectory, runId);
  const workspaceDirectory = resolve(runDirectory, "workspace");
  await createIsolatedPrdWorkspace({
    repositoryRoot,
    workspaceDirectory,
    productKnowledgeRoot: futureSmokeConfig.productKnowledge.sourceRepository,
    productKnowledgeReferences,
  });
  const initialPrompt = buildRecommendedJobsInitialPrompt();
  await writeFile(resolve(runDirectory, "initial-prompt.txt"), `${initialPrompt}\n`, "utf8");

  const hashesBeforeChild = await inputHashes(workspaceDirectory);
  const filesBeforeChild = await filesUnder(workspaceDirectory);
  const rootStatusBeforeChild = await repositoryGitStatus(repositoryRoot);
  const temporaryCodexHome = await mkdtemp(
    join(tmpdir(), "harness-recommended-jobs-smoke-codex-"),
  );
  const originalCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
  const childConfig = `
default_permissions = "recommended_jobs_smoke"

[permissions.recommended_jobs_smoke]
description = "Recommended Jobs smoke child: isolated frozen inputs with generated output only."

[permissions.recommended_jobs_smoke.filesystem]
":minimal" = "read"
${JSON.stringify(workspaceDirectory)} = "read"
${JSON.stringify(resolve(workspaceDirectory, "outputs"))} = "write"

[permissions.recommended_jobs_smoke.network]
enabled = false
`;
  await writeFile(resolve(temporaryCodexHome, "config.toml"), childConfig, "utf8");
  await symlink(
    resolve(originalCodexHome, "auth.json"),
    resolve(temporaryCodexHome, "auth.json"),
  );
  const childEnvironment = Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
  childEnvironment.CODEX_HOME = temporaryCodexHome;

  const codex = new Codex({ env: childEnvironment });
  const thread = codex.startThread({
    model: futureSmokeConfig.productChild.model,
    modelReasoningEffort: futureSmokeConfig.productChild.reasoningEffort,
    workingDirectory: workspaceDirectory,
    networkAccessEnabled: false,
    approvalPolicy: "never",
    webSearchMode: "disabled",
  });
  let authorityLedger = createAuthorityLedger(proposedFrozenPmIntent);
  const authorityLedgerHistory: AuthorityLedger[] = [authorityLedger];
  const authorityGuard = new AuthorityLedgerGuard();
  const clarificationMaterialityGuard = new ClarificationMaterialityGuard();
  const alignmentGuard = new MaterialDecisionCoverageGuard();
  const turns: RecordedTurn[] = [];
  const fixtureRoutes: Array<{
    afterTurn: number;
    question: string;
    status: FixtureRoute<FixtureId>["status"];
    fixtureIds: FixtureId[];
    multipleDecisions: boolean;
    rationale: string;
  }> = [];
  const fixtureAnswers: Array<{
    afterTurn: number;
    question: string;
    fixtures: Array<{ id: FixtureId; decisionVariable: string; answer: string }>;
  }> = [];
  const routerInvocations: Array<
    RouterResult<FixtureId> & { afterTurn: number }
  > = [];
  const runtimeGuardAudits: RuntimeGuardAuditRecord[] = [];
  const runtimeValidations: Array<{
    productTurn: number;
    status:
      | "passed"
      | "authority_validation_failed"
      | "clarification_materiality_validation_failed"
      | "atomicity_validation_failed";
    authorityRepairAttempts: number;
    clarificationMaterialityRepairAttempts: number;
    atomicityRepairAttempts: number;
  }> = [];
  const alignmentFeedbacks: Array<{
    afterTurn: number;
    attempt: number;
    blockers: AlignmentGuardResult["audit"]["blockers"];
  }> = [];
  let status: RunStatus = "technical_failure";
  let failure: string | null = null;
  let finalPrd = "";
  let currentPrompt = initialPrompt;

  try {
    for (let turnNumber = 1; turnNumber <= maximumTurns; turnNumber += 1) {
      const outputSchema = childOutputSchema(authorityLedger);
      const turn = await thread.run(currentPrompt, { outputSchema });
      if (!turn.finalResponse) {
        throw new Error(`Product Child turn ${turnNumber} returned no response.`);
      }
      let response = JSON.parse(turn.finalResponse) as ChildResponse;
      const initialResponse = response;
      const repairs: GuardrailRepairTurn[] = [];
      let latestRawResponse = turn.finalResponse;
      let latestUsage = turn.usage;
      let authorityAuditWithinTurn = 0;
      const validation = await validateProductOutputWithRepairs({
        initialResponse: response,
        getQuestions: (candidate) => candidate.productQuestions,
        auditAuthority: async (candidate) => {
          const currentProductContext = Array.from(
            new Map(
              [
                ...turns.flatMap(
                  (record) => record.response?.retrievedProductKnowledge ?? [],
                ),
                ...candidate.retrievedProductKnowledge,
              ].map((entry) => [`${entry.url}\u0000${entry.title}`, entry]),
            ).values(),
          );
          const result = await authorityGuard.audit({
            ledger: authorityLedger,
            claims: candidate.authorityClaims,
            currentProductContext,
            prdMarkdown: candidate.prdMarkdown,
            phase:
              authorityAuditWithinTurn > 0
                ? "repair"
                : turnNumber === 1
                  ? "initial"
                  : "reconciliation",
          });
          authorityAuditWithinTurn += 1;
          runtimeGuardAudits.push({
            productTurn: turnNumber,
            sequence: runtimeGuardAudits.length + 1,
            guard: "authority",
            result,
          });
          return result.audit;
        },
        auditClarificationMateriality: async (candidate, questions) => {
          const currentProductContext = Array.from(
            new Map(
              [
                ...turns.flatMap(
                  (record) => record.response?.retrievedProductKnowledge ?? [],
                ),
                ...candidate.retrievedProductKnowledge,
              ].map((entry) => [`${entry.url}\u0000${entry.title}`, entry]),
            ).values(),
          );
          const humanDecisions = authorityLedger.items
            .filter((item) => item.kind === "human_decision")
            .map((item) => ({
              question: item.question ?? "",
              answer: item.statement,
            }));
          const result = await clarificationMaterialityGuard.audit({
            pmIntent: proposedFrozenPmIntent,
            currentProductContext,
            prdMarkdown: candidate.prdMarkdown,
            humanDecisions,
            questions,
          });
          runtimeGuardAudits.push({
            productTurn: turnNumber,
            sequence: runtimeGuardAudits.length + 1,
            guard: "clarification_materiality",
            result,
          });
          return result.audit;
        },
        auditAtomicity: async (questions) => {
          const result = await auditClarificationAtomicity(questions);
          runtimeGuardAudits.push({
            productTurn: turnNumber,
            sequence: runtimeGuardAudits.length + 1,
            guard: "atomicity",
            result,
          });
          return result.audit;
        },
        repairAuthority: async (_candidate, audit, attempt) => {
          const prompt = authorityRepairPrompt(audit);
          const repair = await thread.run(prompt, { outputSchema });
          if (!repair.finalResponse) throw new Error("Authority repair returned no response.");
          const repaired = JSON.parse(repair.finalResponse) as ChildResponse;
          repairs.push({
            guard: "authority",
            attempt,
            prompt,
            response: repaired,
            rawFinalResponse: repair.finalResponse,
            items: repair.items,
            usage: repair.usage,
          });
          latestRawResponse = repair.finalResponse;
          latestUsage = repair.usage;
          return repaired;
        },
        repairClarificationMateriality: async (_candidate, audit, attempt) => {
          clarificationMaterialityGuard.recordRepairAttempt();
          const prompt = clarificationMaterialityRepairPrompt(audit);
          const repair = await thread.run(prompt, { outputSchema });
          if (!repair.finalResponse) {
            throw new Error("Clarification Materiality repair returned no response.");
          }
          const repaired = JSON.parse(repair.finalResponse) as ChildResponse;
          repairs.push({
            guard: "clarification_materiality",
            attempt,
            prompt,
            response: repaired,
            rawFinalResponse: repair.finalResponse,
            items: repair.items,
            usage: repair.usage,
          });
          latestRawResponse = repair.finalResponse;
          latestUsage = repair.usage;
          return repaired;
        },
        repairAtomicity: async (_candidate, audit, attempt) => {
          const prompt = atomicityRepairPrompt(audit);
          const repair = await thread.run(prompt, { outputSchema });
          if (!repair.finalResponse) throw new Error("Atomicity repair returned no response.");
          const repaired = JSON.parse(repair.finalResponse) as ChildResponse;
          repairs.push({
            guard: "atomicity",
            attempt,
            prompt,
            response: repaired,
            rawFinalResponse: repair.finalResponse,
            items: repair.items,
            usage: repair.usage,
          });
          latestRawResponse = repair.finalResponse;
          latestUsage = repair.usage;
          return repaired;
        },
      });
      runtimeValidations.push({
        productTurn: turnNumber,
        status: validation.status,
        authorityRepairAttempts: validation.authorityRepairAttempts,
        clarificationMaterialityRepairAttempts:
          validation.clarificationMaterialityRepairAttempts,
        atomicityRepairAttempts: validation.atomicityRepairAttempts,
      });
      response = validation.response;
      turns.push({
        number: turnNumber,
        prompt: currentPrompt,
        initialResponse,
        initialRawFinalResponse: turn.finalResponse,
        response,
        rawFinalResponse: latestRawResponse,
        items: [turn.items, ...repairs.map((repair) => repair.items)].flat(),
        usage: latestUsage,
        guardrailRepairs: repairs,
      });

      if (validation.status === "authority_validation_failed") {
        status = "blocked_on_runtime_authority_validation";
        failure = "Authority Guard still rejected the draft after bounded repairs.";
        break;
      }
      if (validation.status === "clarification_materiality_validation_failed") {
        status = "blocked_on_runtime_clarification_materiality_validation";
        failure =
          "Clarification Materiality Guard still rejected non-blocking or Design-owned questions after bounded repairs.";
        break;
      }
      if (validation.status === "atomicity_validation_failed") {
        status = "blocked_on_runtime_atomicity_validation";
        failure = "Atomicity Guard still rejected questions after bounded repairs.";
        break;
      }

      if (response.problemAligned && response.status === "problem_aligned") {
        if (!response.prdMarkdown.trim()) {
          throw new Error("Product Child proposed Problem Aligned without a PRD.");
        }
        const currentProductContext = Array.from(
          new Map(
            turns
              .flatMap((record) => record.response?.retrievedProductKnowledge ?? [])
              .map((entry) => [`${entry.url}\u0000${entry.title}`, entry]),
          ).values(),
        );
        const humanDecisions = authorityLedger.items
          .filter((item) => item.kind === "human_decision")
          .map((item) => ({
            question: item.question ?? "",
            answer: item.statement,
          }));
        const alignmentResult = await alignmentGuard.audit({
          pmIntent: proposedFrozenPmIntent,
          currentProductContext,
          prdMarkdown: response.prdMarkdown,
          humanDecisions,
        });
        runtimeGuardAudits.push({
          productTurn: turnNumber,
          sequence: runtimeGuardAudits.length + 1,
          guard: "alignment",
          result: alignmentResult,
        });
        if (!alignmentResult.audit.aligned) {
          if (
            alignmentGuard.metrics.alignmentAuditCount >=
              runtimeGuardrailConfig.maximumAlignmentAttempts ||
            turnNumber === maximumTurns
          ) {
            status = "blocked_on_runtime_alignment_validation";
            failure = "Alignment Guard still reported blocking Product boundaries.";
            break;
          }
          alignmentGuard.recordRepairAttempt();
          alignmentFeedbacks.push({
            afterTurn: turnNumber,
            attempt: alignmentGuard.metrics.alignmentRepairCount,
            blockers: alignmentResult.audit.blockers,
          });
          currentPrompt = alignmentRepairPrompt(alignmentResult.audit);
          continue;
        }
        finalPrd = response.prdMarkdown;
        status = "problem_aligned";
        break;
      }
      if (response.status === "blocked") {
        throw new Error(`Product Child blocker: ${response.alignmentRationale}`);
      }
      if (response.productQuestions.length === 0) {
        throw new Error("Product Child was not aligned but returned no questions.");
      }

      const routing = await routeAndRevealAfterValidation({
        validation,
        getQuestions: (candidate) => candidate.productQuestions,
        route: async (questions) =>
          routeProductQuestions(questions.map(({ question }) => question)),
        routeAllowsReveal: (result) =>
          result.routes.every((route) => route.status === "matched"),
        reveal: (result, candidate) =>
          candidate.productQuestions.map((question, index) => ({
            question,
            fixtures: result.routes[index]!.fixtureIds.map(fixtureForId),
          })),
      });
      if (routing.status === "guard_failed") {
        throw new Error("Router reached after guard validation failure.");
      }
      const routerResult = routing.route;
      routerInvocations.push({ afterTurn: turnNumber, ...routerResult });
      response.productQuestions.forEach((question, index) => {
        fixtureRoutes.push({
          afterTurn: turnNumber,
          question: question.question,
          ...routerResult.routes[index]!,
        });
      });
      if (routerResult.routes.some((route) => route.status === "ambiguous")) {
        status = "blocked_on_ambiguous_fixture_route";
        failure = "Semantic Router returned ambiguous for the clarification batch.";
        break;
      }
      if (routerResult.routes.some((route) => route.status === "no_match")) {
        status = "blocked_on_no_match_fixture_route";
        failure = "Semantic Router returned no_match for the clarification batch.";
        break;
      }
      if (routing.status !== "revealed") {
        throw new Error("Matched routing batch did not reach reveal.");
      }
      for (const mapped of routing.reveal) {
        fixtureAnswers.push({
          afterTurn: turnNumber,
          question: mapped.question.question,
          fixtures: mapped.fixtures.map((fixture) => ({
            id: fixture.id,
            decisionVariable: fixture.decisionVariable,
            answer: answerBank[fixture.id]!,
          })),
        });
      }
      const nextLedger = extendAuthorityLedger(
        authorityLedger,
        routing.reveal.flatMap((mapped) =>
          mapped.fixtures.map((fixture) => ({
            question: mapped.question.question,
            answer: answerBank[fixture.id]!,
          })),
        ),
      );
      if (nextLedger !== authorityLedger) {
        authorityLedger = nextLedger;
        authorityLedgerHistory.push(authorityLedger);
      }
      currentPrompt = followUpPrompt(routing.reveal, answerBank);
      if (turnNumber === maximumTurns) status = "max_turns_reached";
    }
  } catch (error) {
    status = "technical_failure";
    failure = error instanceof Error ? error.stack ?? error.message : String(error);
  }

  const observedConfiguration = await observedSessionConfiguration(temporaryCodexHome);
  await rm(temporaryCodexHome, { recursive: true, force: true });
  const rootStatusAfterChild = await repositoryGitStatus(repositoryRoot);
  const hashesAfterChild = await inputHashes(workspaceDirectory);
  const filesAfterChild = await filesUnder(workspaceDirectory);
  const inputFilesUnchanged =
    JSON.stringify(hashesBeforeChild) === JSON.stringify(hashesAfterChild);
  const filesAddedByChild = filesAfterChild.filter(
    (path) => !filesBeforeChild.includes(path),
  );
  const filesAddedOutsideOutputs = filesAddedByChild.filter(
    (path) => path !== "outputs" && !path.startsWith("outputs/"),
  );
  const originalRepositoryChangedByChild = rootStatusAfterChild !== rootStatusBeforeChild;
  const childCommands = turns.flatMap((record) =>
    record.items
      .filter((item) => item.type === "command_execution")
      .map((item) => item.command),
  );
  const childWebSearchItemCount = turns
    .flatMap((record) => record.items)
    .filter((item) => item.type === "web_search").length;
  const allRouterIsolationPassed = routerInvocations.every(
    (invocation) => invocation.isolation.passed,
  );
  const allGuardIsolationPassed = runtimeGuardAudits.every(
    ({ result }) => result.isolation.passed,
  );
  const productKnowledgeDirectoryPresent = await pathExists(
    resolve(workspaceDirectory, "context/product-knowledge"),
  );
  const isolationPassed =
    !originalRepositoryChangedByChild &&
    inputFilesUnchanged &&
    filesAddedOutsideOutputs.length === 0 &&
    observedConfiguration.networkAccessEnabled === false &&
    observedConfiguration.workingDirectory === workspaceDirectory &&
    childWebSearchItemCount === 0 &&
    !childCommands.some((command) => /\b(?:curl|wget|httpie)\b/i.test(command)) &&
    productKnowledgeDirectoryPresent &&
    allRouterIsolationPassed &&
    allGuardIsolationPassed;

  if (status === "problem_aligned") {
    await writeFile(
      resolve(workspaceDirectory, "outputs/prd.md"),
      `${finalPrd.trim()}\n`,
      "utf8",
    );
  }
  const consumedFixtureIds = [
    ...new Set(
      fixtureAnswers.flatMap(({ fixtures }) => fixtures.map(({ id }) => id)),
    ),
  ].sort((left, right) => fixtureIds.indexOf(left) - fixtureIds.indexOf(right));
  const atomicityAudits = runtimeGuardAudits.filter(
    (record) => record.guard === "atomicity",
  );
  const productRepairCalls = turns.reduce(
    (sum, record) => sum + record.guardrailRepairs.length,
    0,
  );
  const routerCalls = routerInvocations.length;
  const runtimeGuardModelCalls =
    authorityGuard.metrics.semanticAuditCallCount +
    clarificationMaterialityGuard.metrics.semanticAuditCallCount +
    atomicityAudits.length +
    alignmentGuard.metrics.semanticAuditCallCount;
  const totalModelCalls =
    turns.length + productRepairCalls + routerCalls + runtimeGuardModelCalls;
  const finishedAt = new Date();
  const metadata = {
    runId,
    runType: "Recommended Jobs / Not Interested Reason smoke test",
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    wallClockMilliseconds: Math.round(performance.now() - wallClockStarted),
    status,
    failure,
    threadId: thread.id,
    configuredModel: futureSmokeConfig.productChild.model,
    configuredReasoningEffort: futureSmokeConfig.productChild.reasoningEffort,
    maximumTurns,
    completedProductTurns: turns.length,
    productRepairCalls,
    totalModelCalls,
    runtimeGuardModelCalls,
    fixtureBankStatus,
    fixtureIds,
    fixtureRoutes,
    fixtureAnswers,
    fixtureIdsConsumed: consumedFixtureIds,
    fixtureIdsUnused: fixtureIds.filter((id) => !consumedFixtureIds.includes(id)),
    fixtureIsolation: {
      hiddenAnswersAbsentFromInitialPrompt: proposedFixtures.every(
        ({ proposedHiddenAnswer }) =>
          !initialPrompt.includes(proposedHiddenAnswer.text),
      ),
      routerDescriptionsAbsentFromProductChild: routerVisibleFixtures().every(
        ({ routingDescription }) => !initialPrompt.includes(routingDescription),
      ),
      onlyRevealedAnswersEnteredAuthorityLedger:
        authorityLedger.items.filter((item) => item.kind === "human_decision").length ===
        fixtureAnswers.reduce((sum, entry) => sum + entry.fixtures.length, 0),
    },
    productKnowledge: {
      references: productKnowledgeReferences,
      workspacePath: resolve(workspaceDirectory, "context/product-knowledge"),
      inputHashes: hashesBeforeChild,
    },
    runtimeGuardrails: {
      config: runtimeGuardrailConfig,
      schemas: runtimeGuardrailSchemas,
      authorityLedger,
      authorityLedgerHistory,
      authorityMetrics: authorityGuard.metrics,
      clarificationMaterialityMetrics: clarificationMaterialityGuard.metrics,
      atomicityAuditCount: atomicityAudits.length,
      atomicityFailureCount: atomicityAudits.filter(
        (record) => !record.result.audit.passed,
      ).length,
      atomicityRepairCount: runtimeValidations.reduce(
        (sum, validation) => sum + validation.atomicityRepairAttempts,
        0,
      ),
      atomicitySemanticModelCalls: atomicityAudits.length,
      alignmentMetrics: alignmentGuard.metrics,
      alignmentFeedbacks,
      validations: runtimeValidations,
      audits: runtimeGuardAudits,
    },
    router: {
      config: semanticFixtureRouterConfig,
      calls: routerCalls,
      invocations: routerInvocations,
      noMatchCount: fixtureRoutes.filter(({ status }) => status === "no_match").length,
      ambiguousCount: fixtureRoutes.filter(({ status }) => status === "ambiguous").length,
    },
    usage: {
      productTurns: turns.map(({ number, usage }) => ({ number, usage })),
      productRepairs: turns.flatMap(({ number, guardrailRepairs }) =>
        guardrailRepairs.map(({ guard, attempt, usage }) => ({
          productTurn: number,
          guard,
          attempt,
          usage,
        })),
      ),
      routers: routerInvocations.map(({ afterTurn, usage }) => ({ afterTurn, usage })),
      runtimeGuards: runtimeGuardAudits.map(({ productTurn, guard, result }) => ({
        productTurn,
        guard,
        usage: result.usage,
      })),
    },
    proposedProblemAligned: turns.some(
      ({ response }) =>
        response?.problemAligned === true && response.status === "problem_aligned",
    ),
    acceptedProblemAligned: status === "problem_aligned",
    transcriptPath: resolve(runDirectory, "turns.json"),
    finalPrdPath:
      status === "problem_aligned"
        ? resolve(workspaceDirectory, "outputs/prd.md")
        : null,
    isolation: {
      configuredNetworkAccessEnabled: false,
      observedConfiguration,
      originalRepositoryChangedByChild,
      inputFilesUnchanged,
      filesAddedByChild,
      filesAddedOutsideOutputs,
      childWebSearchItemCount,
      allRouterIsolationPassed,
      allGuardIsolationPassed,
      productKnowledgeDirectoryPresent,
      passed: isolationPassed,
    },
  };
  await Promise.all([
    writeFile(
      resolve(runDirectory, "turns.json"),
      `${JSON.stringify(turns, null, 2)}\n`,
      "utf8",
    ),
    writeFile(
      resolve(runDirectory, "run-metadata.json"),
      `${JSON.stringify(metadata, null, 2)}\n`,
      "utf8",
    ),
  ]);
  console.log(
    JSON.stringify(
      {
        runId,
        runDirectory,
        status,
        failure,
        completedProductTurns: turns.length,
        consumedFixtureIds,
        finalPrdPath: metadata.finalPrdPath,
        totalModelCalls,
        isolation: metadata.isolation,
      },
      null,
      2,
    ),
  );
  if (status === "technical_failure" || !isolationPassed) process.exitCode = 1;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await runRecommendedJobsNotInterestedReasonSmoke();
}
