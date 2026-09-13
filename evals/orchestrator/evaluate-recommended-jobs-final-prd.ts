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
  inputHashes,
  networkIsolationWasVerifiedDisabled,
  observedSessionConfiguration,
} from "./prd-eval-runner-support.js";
import { proposedFrozenPmIntent } from "./recommended-jobs-not-interested-reason-smoke.js";

const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const sourceRunId =
  "smoke-recommended-jobs-not-interested-reason-2026-09-13T06-22-48.986Z";
const sourceRunDirectory = resolve(runsDirectory, sourceRunId);
const evaluationPrefix =
  "blind-final-prd-evaluation-recommended-jobs-not-interested-reason";

export const recommendedJobsFinalPrdEvaluatorConfig = {
  model: "gpt-5.6-sol",
  reasoningEffort: "high",
  networkAccessEnabled: false,
  approvalPolicy: "never",
  webSearchMode: "disabled",
  structuredOutput: true,
  permissionProfile: "blind_prd_evaluator",
} as const;

const dimensions = [
  "Problem framing quality",
  "Current-product grounding",
  "Product semantics / rule modeling",
  "Scope quality",
  "Clarification quality",
  "Authority / uncertainty discipline",
  "Product scenario completeness",
  "Acceptance Criteria quality",
  "Domain specificity without unsupported invention",
  "Fitness for meaningful Design Exploration",
] as const;
type Dimension = (typeof dimensions)[number];

type RevealedClarification = {
  question: string;
  answers: string[];
};

export type RecommendedJobsFinalPrdEvaluationPackage = {
  pmIntent: string;
  finalPrd: string;
  revealedProductClarifications: RevealedClarification[];
};

type SourceRunMetadata = {
  runId: string;
  status: string;
  acceptedProblemAligned: boolean;
  fixtureAnswers: Array<{
    question: string;
    fixtures: Array<{ answer: string }>;
  }>;
  productKnowledge: {
    references: Array<{
      id: string;
      repositoryRelativePath: string;
      sha256: string;
    }>;
    inputHashes: Record<string, string>;
  };
};

type Score = {
  dimension: Dimension;
  score: number;
  evidence: string;
  referenceEvidence: string;
  rationale: string;
  confidence: "low" | "medium" | "high";
};

type EvaluatorOutput = {
  scores: Score[];
  unsupportedOrInventedProductBehavior: Array<{
    behavior: string;
    evidence: string;
    authorityGap: string;
    downstreamDesignEffect: string;
  }>;
  omittedMaterialProductDecisions: Array<{
    decision: string;
    evidence: string;
    downstreamDesignRisk: string;
  }>;
  unnecessaryDesignConstraints: Array<{
    constraint: string;
    evidence: string;
    authorityGap: string;
    downstreamDesignEffect: string;
  }>;
  materialCurrentProductContextMissed: Array<{
    context: string;
    referenceEvidence: string;
    directRelevance: string;
    downstreamDesignRisk: string;
  }>;
  fitForDesignExploration: {
    verdict: "fit" | "not_fit";
    rationale: string;
    blockingFindings: string[];
    confidence: "low" | "medium" | "high";
  };
  summary: string;
};

const evaluatorOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    scores: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          dimension: { type: "string", enum: dimensions },
          score: { type: "integer", minimum: 0, maximum: 2 },
          evidence: { type: "string" },
          referenceEvidence: { type: "string" },
          rationale: { type: "string" },
          confidence: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
        },
        required: [
          "dimension",
          "score",
          "evidence",
          "referenceEvidence",
          "rationale",
          "confidence",
        ],
      },
    },
    unsupportedOrInventedProductBehavior: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          behavior: { type: "string" },
          evidence: { type: "string" },
          authorityGap: { type: "string" },
          downstreamDesignEffect: { type: "string" },
        },
        required: [
          "behavior",
          "evidence",
          "authorityGap",
          "downstreamDesignEffect",
        ],
      },
    },
    omittedMaterialProductDecisions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          decision: { type: "string" },
          evidence: { type: "string" },
          downstreamDesignRisk: { type: "string" },
        },
        required: ["decision", "evidence", "downstreamDesignRisk"],
      },
    },
    unnecessaryDesignConstraints: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          constraint: { type: "string" },
          evidence: { type: "string" },
          authorityGap: { type: "string" },
          downstreamDesignEffect: { type: "string" },
        },
        required: [
          "constraint",
          "evidence",
          "authorityGap",
          "downstreamDesignEffect",
        ],
      },
    },
    materialCurrentProductContextMissed: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          context: { type: "string" },
          referenceEvidence: { type: "string" },
          directRelevance: { type: "string" },
          downstreamDesignRisk: { type: "string" },
        },
        required: [
          "context",
          "referenceEvidence",
          "directRelevance",
          "downstreamDesignRisk",
        ],
      },
    },
    fitForDesignExploration: {
      type: "object",
      additionalProperties: false,
      properties: {
        verdict: { type: "string", enum: ["fit", "not_fit"] },
        rationale: { type: "string" },
        blockingFindings: { type: "array", items: { type: "string" } },
        confidence: {
          type: "string",
          enum: ["low", "medium", "high"],
        },
      },
      required: ["verdict", "rationale", "blockingFindings", "confidence"],
    },
    summary: { type: "string" },
  },
  required: [
    "scores",
    "unsupportedOrInventedProductBehavior",
    "omittedMaterialProductDecisions",
    "unnecessaryDesignConstraints",
    "materialCurrentProductContextMissed",
    "fitForDesignExploration",
    "summary",
  ],
} as const;

const harnessCriteria = `
- Judge semantic fitness for downstream Product Design, not wording, polish, or length.
- The PRD must frame the underlying user problem rather than merely the absence of a feature.
- Product Knowledge is evidence for current implemented context only; it is not authority for intended change.
- PM Intent and actually revealed Product answers are the only supplied human Product authority. A final PRD is not self-authorizing.
- Derived intended behavior is valid only when necessarily implied by supplied Product authority and introduces no new Product judgment.
- Scope, required behavior, scenarios, and acceptance criteria must not silently promote assumptions, unresolved details, implementation choices, or Design mechanics.
- Clarification quality depends on whether the visible questions isolate material Product decisions and the reconciled PRD faithfully uses the visible answers. Do not infer hidden questions or answers.
- Product-owned uncertainty is not automatically blocking. Treat an omission as material only when Design would otherwise need to invent materially different Product behavior, scope, eligibility, lifecycle, or acceptance semantics.
- Exact presentation and interaction mechanics belong to Design unless explicitly constrained by Product authority or necessarily implied by it.
- Product scenarios should connect the shortest coherent user and Product lifecycle. Acceptance Criteria should be observable or verifiable without prescribing an unnecessary solution.
- Fitness for Design Exploration requires no material unsupported behavior and no omitted material Product boundary; explicit bounded non-blocking uncertainty is allowed.`.trim();

const rubric = `
Score every dimension from 0 to 2:
- 0 = materially missing, unsupported, or unfit for the intended downstream use.
- 1 = partially adequate, with a material gap.
- 2 = sufficiently strong for meaningful Design Exploration.

For every score provide concise artifact evidence, concise current-product reference evidence when relevant, rationale, and confidence. Do not reward length or stylistic polish. Do not reward genericness merely for avoiding claims, and do not reward specificity when unsupported.

For current-product grounding, verify claims against reference/current-product. Absence from that reference is uncertainty, not proof a behavior does not exist. A material context miss must be supported by the reference, directly relevant to this change, and capable of materially changing downstream Design.

For authority and uncertainty, distinguish explicit PM Intent, revealed answers, necessary implications, bounded open decisions, and unsupported invention. Evaluate Product capabilities separately from exact UI controls or presentation mechanics.

List unsupported or invented Product behavior only when an authoritative intended claim lacks sufficient visible authority. List omitted Product decisions only when Design would have to invent a material boundary. List unnecessary Design constraints only when the PRD prescribes a solution choice without visible Product authority.

Independently decide fitForDesignExploration. Do not assume that any prior process accepted or rejected the artifact.`.trim();

export function buildRecommendedJobsFinalPrdEvaluationPackage(input: {
  finalPrd: string;
  revealedProductClarifications: RevealedClarification[];
}): RecommendedJobsFinalPrdEvaluationPackage {
  return {
    pmIntent: proposedFrozenPmIntent,
    finalPrd: input.finalPrd,
    revealedProductClarifications: input.revealedProductClarifications.map(
      ({ question, answers }) => ({ question, answers: [...answers] }),
    ),
  };
}

function validateBlindPackage(serialized: string): void {
  const forbidden = [
    sourceRunId,
    "NI-",
    "fixtureIds",
    "fixtureAnswers",
    "fixtureRoutes",
    "runtimeGuardrails",
    "acceptedProblemAligned",
    "proposedProblemAligned",
    "Alignment verdict",
    "Router classifications",
    "/Users/",
    "evals/runs",
  ];
  const disclosure = forbidden.find((value) => serialized.includes(value));
  if (disclosure) {
    throw new Error(
      `Blind final-PRD evaluation package contains forbidden disclosure: ${disclosure}`,
    );
  }
}

function evaluatorPrompt(evaluationPackage: RecommendedJobsFinalPrdEvaluationPackage) {
  return `You are an independent blind evaluator of one final Product Requirements Document. You do not know how the artifact was produced, whether any runtime process accepted it, or what unused Product answers may exist. Do not infer or seek that information.

Evaluate the artifact on these dimensions:
${dimensions.map((dimension, index) => `${index + 1}. ${dimension}`).join("\n")}

Harness criteria:
${harnessCriteria}

Scoring and diagnostics:
${rubric}

Use only the evaluation package below and the local current-product reference under reference/current-product. You may search those local reference files with read-only tools. Do not use network, web search, files outside this isolated workspace, or general knowledge as evidence of current Job Vision behavior.

Evaluation package:
${JSON.stringify(evaluationPackage, null, 2)}`;
}

function validateEvaluatorOutput(output: EvaluatorOutput): void {
  const returnedDimensions = output.scores.map(({ dimension }) => dimension);
  if (
    returnedDimensions.length !== dimensions.length ||
    new Set(returnedDimensions).size !== dimensions.length ||
    !dimensions.every((dimension) => returnedDimensions.includes(dimension))
  ) {
    throw new Error("Evaluator returned an invalid score set.");
  }
  if (
    output.scores.some(
      ({ score }) => !Number.isInteger(score) || score < 0 || score > 2,
    )
  ) {
    throw new Error("Evaluator returned an invalid score.");
  }
  if (
    output.fitForDesignExploration.verdict === "fit" &&
    output.fitForDesignExploration.blockingFindings.length > 0
  ) {
    throw new Error("A fit verdict cannot contain blocking findings.");
  }
  if (
    output.fitForDesignExploration.verdict === "not_fit" &&
    output.fitForDesignExploration.blockingFindings.length === 0
  ) {
    throw new Error("A not_fit verdict must identify at least one blocker.");
  }
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function stageVerifiedFrozenProductKnowledge(input: {
  sourceProductKnowledgeRoot: string;
  targetProductKnowledgeRoot: string;
  references: SourceRunMetadata["productKnowledge"]["references"];
  sourceRunInputHashes: Record<string, string>;
}): Promise<Record<string, string>> {
  if (input.references.length === 0) {
    throw new Error("Source run recorded no Product Knowledge references.");
  }
  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();
  await mkdir(input.targetProductKnowledgeRoot, { recursive: true });
  const hashes: Record<string, string> = {};
  for (const reference of input.references) {
    if (
      !reference.id.trim() ||
      !reference.repositoryRelativePath.trim() ||
      !/^[a-f0-9]{64}$/.test(reference.sha256) ||
      seenIds.has(reference.id) ||
      seenPaths.has(reference.repositoryRelativePath)
    ) {
      throw new Error("Source run Product Knowledge reference metadata is invalid.");
    }
    seenIds.add(reference.id);
    seenPaths.add(reference.repositoryRelativePath);
    const source = resolve(
      input.sourceProductKnowledgeRoot,
      reference.repositoryRelativePath,
    );
    if (
      source === input.sourceProductKnowledgeRoot ||
      !source.startsWith(`${input.sourceProductKnowledgeRoot}/`)
    ) {
      throw new Error(`Unsafe Product Knowledge path for ${reference.id}.`);
    }
    const content = await readFile(source);
    const hash = sha256(content);
    const sourceRunWorkspaceHash =
      input.sourceRunInputHashes[
        `context/product-knowledge/${reference.repositoryRelativePath}`
      ];
    if (
      hash !== reference.sha256 ||
      sourceRunWorkspaceHash !== reference.sha256
    ) {
      throw new Error(`Product Knowledge hash mismatch for ${reference.id}.`);
    }
    const target = resolve(
      input.targetProductKnowledgeRoot,
      reference.repositoryRelativePath,
    );
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
    hashes[reference.repositoryRelativePath] = hash;
  }
  return hashes;
}

export const recommendedJobsFinalPrdEvaluatorStaticWiring = {
  sourceRunId,
  npmCommand: "npm run eval:recommended-jobs-not-interested-reason-final-prd",
  packageKeys: ["pmIntent", "finalPrd", "revealedProductClarifications"],
  clarificationKeys: ["question", "answers"],
  productKnowledgeSource: "source-run-frozen-workspace",
  evaluatorConfig: recommendedJobsFinalPrdEvaluatorConfig,
  generatedOutputFiles: [
    "evaluation-package.json",
    "evaluator-output.json",
    "input-provenance.json",
    "evaluation-metadata.json",
  ],
} as const;

export async function runRecommendedJobsFinalPrdEvaluation(): Promise<void> {
  const startedAt = new Date();
  const evaluationId = `${evaluationPrefix}-${startedAt
    .toISOString()
    .replaceAll(":", "-")}`;
  const evaluationDirectory = resolve(runsDirectory, evaluationId);
  await mkdir(evaluationDirectory, { recursive: true });

  const metadataPath = resolve(sourceRunDirectory, "run-metadata.json");
  const finalPrdPath = resolve(sourceRunDirectory, "workspace/outputs/prd.md");
  const initialPromptPath = resolve(sourceRunDirectory, "initial-prompt.txt");
  const [metadataText, finalPrd, initialPrompt] = await Promise.all([
    readFile(metadataPath, "utf8"),
    readFile(finalPrdPath, "utf8"),
    readFile(initialPromptPath, "utf8"),
  ]);
  const metadata = JSON.parse(metadataText) as SourceRunMetadata;
  if (
    metadata.runId !== sourceRunId ||
    metadata.status !== "problem_aligned" ||
    !metadata.acceptedProblemAligned
  ) {
    throw new Error("Source run is not the expected successful frozen run.");
  }
  if (!initialPrompt.includes(proposedFrozenPmIntent)) {
    throw new Error("Frozen PM Intent is not present in the source run prompt.");
  }

  const revealedProductClarifications = metadata.fixtureAnswers.map(
    ({ question, fixtures }) => ({
      question,
      answers: fixtures.map(({ answer }) => answer),
    }),
  );
  const evaluationPackage = buildRecommendedJobsFinalPrdEvaluationPackage({
    finalPrd,
    revealedProductClarifications,
  });
  const serializedPackage = `${JSON.stringify(evaluationPackage, null, 2)}\n`;
  validateBlindPackage(serializedPackage);

  const packagePath = resolve(evaluationDirectory, "evaluation-package.json");
  const provenancePath = resolve(evaluationDirectory, "input-provenance.json");
  await Promise.all([
    writeFile(packagePath, serializedPackage, "utf8"),
    writeFile(
      provenancePath,
      `${JSON.stringify(
        {
          sourceRunId,
          evaluatorAccess: false,
          sourceFiles: {
            runMetadata: { path: metadataPath, sha256: sha256(metadataText) },
            finalPrd: { path: finalPrdPath, sha256: sha256(finalPrd) },
            initialPrompt: {
              path: initialPromptPath,
              sha256: sha256(initialPrompt),
            },
          },
          packageInputs: {
            pmIntentSha256: sha256(proposedFrozenPmIntent),
            finalPrdSha256: sha256(finalPrd),
            revealedClarificationsSha256: sha256(
              JSON.stringify(revealedProductClarifications),
            ),
            revealedClarificationCount: revealedProductClarifications.length,
          },
          excludedFromEvaluator: [
            "hidden fixture bank",
            "unused fixture answers",
            "expected outcome",
            "previous failed smoke runs",
            "runtime guard verdicts",
            "Router classifications",
            "Alignment verdict",
            "diagnosis and tuning history",
          ],
        },
        null,
        2,
      )}\n`,
      "utf8",
    ),
  ]);

  const evaluatorWorkingDirectory = await mkdtemp(
    join(tmpdir(), "harness-blind-final-prd-evaluator-workspace-"),
  );
  const evaluatorCodexHome = await mkdtemp(
    join(tmpdir(), "harness-blind-final-prd-evaluator-codex-"),
  );
  const originalCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
  try {
    const inputDirectory = resolve(evaluatorWorkingDirectory, "input");
    await mkdir(inputDirectory, { recursive: true });
    await writeFile(
      resolve(inputDirectory, "evaluation-package.json"),
      serializedPackage,
      "utf8",
    );
    const sourceProductKnowledgeRoot = resolve(
      sourceRunDirectory,
      "workspace/context/product-knowledge",
    );
    const targetProductKnowledgeRoot = resolve(
      evaluatorWorkingDirectory,
      "reference/current-product",
    );
    const referenceHashes = await stageVerifiedFrozenProductKnowledge({
      sourceProductKnowledgeRoot,
      targetProductKnowledgeRoot,
      references: metadata.productKnowledge.references,
      sourceRunInputHashes: metadata.productKnowledge.inputHashes,
    });
    const hashesBefore = await inputHashes(evaluatorWorkingDirectory);
    const evaluatorToml = `
default_permissions = "blind_prd_evaluator"

[permissions.blind_prd_evaluator]
description = "Blind final-PRD evaluation from the supplied package and local current-product reference only."

[permissions.blind_prd_evaluator.filesystem]
":minimal" = "read"
${JSON.stringify(evaluatorWorkingDirectory)} = "read"

[permissions.blind_prd_evaluator.network]
enabled = false
`;
    await writeFile(resolve(evaluatorCodexHome, "config.toml"), evaluatorToml, "utf8");
    await symlink(
      resolve(originalCodexHome, "auth.json"),
      resolve(evaluatorCodexHome, "auth.json"),
    );
    const evaluatorEnvironment = Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    );
    evaluatorEnvironment.CODEX_HOME = evaluatorCodexHome;

    const codex = new Codex({ env: evaluatorEnvironment });
    const thread = codex.startThread({
      model: recommendedJobsFinalPrdEvaluatorConfig.model,
      modelReasoningEffort:
        recommendedJobsFinalPrdEvaluatorConfig.reasoningEffort,
      workingDirectory: evaluatorWorkingDirectory,
      skipGitRepoCheck: true,
      networkAccessEnabled:
        recommendedJobsFinalPrdEvaluatorConfig.networkAccessEnabled,
      approvalPolicy: recommendedJobsFinalPrdEvaluatorConfig.approvalPolicy,
      webSearchMode: recommendedJobsFinalPrdEvaluatorConfig.webSearchMode,
    });
    const turn = await thread.run(evaluatorPrompt(evaluationPackage), {
      outputSchema: evaluatorOutputSchema,
    });
    if (!thread.id || !turn.finalResponse) {
      throw new Error("Blind final-PRD evaluator completed without a result.");
    }
    const evaluatorOutput = JSON.parse(turn.finalResponse) as EvaluatorOutput;
    validateEvaluatorOutput(evaluatorOutput);
    const evaluatorOutputPath = resolve(
      evaluationDirectory,
      "evaluator-output.json",
    );
    await writeFile(
      evaluatorOutputPath,
      `${JSON.stringify(evaluatorOutput, null, 2)}\n`,
      "utf8",
    );

    const hashesAfter = await inputHashes(evaluatorWorkingDirectory);
    const observedConfiguration = await observedSessionConfiguration(
      evaluatorCodexHome,
    );
    const evaluatorItems: ThreadItem[] = turn.items;
    const evaluatorCommands = evaluatorItems
      .filter((item) => item.type === "command_execution")
      .map((item) => item.command);
    const evaluatorWebSearchItemCount = evaluatorItems.filter(
      (item) => item.type === "web_search",
    ).length;
    const networkCommandAttempted = evaluatorCommands.some((command) =>
      /\b(?:curl|wget|httpie|fetch)\b/i.test(command),
    );
    const expectedReferencePaths = metadata.productKnowledge.references
      .map(({ repositoryRelativePath }) => repositoryRelativePath)
      .sort();
    const isolation = {
      expectedReferenceFilesPresent:
        Object.keys(referenceHashes).sort().join(",") ===
        expectedReferencePaths.join(","),
      workingDirectoryUnchanged:
        JSON.stringify(hashesBefore) === JSON.stringify(hashesAfter),
      actualWorkingDirectoryIsEvaluatorWorkspace:
        observedConfiguration.workingDirectory === evaluatorWorkingDirectory,
      actualNetworkDisabled:
        networkIsolationWasVerifiedDisabled(observedConfiguration),
      evaluatorWebSearchItemCount,
      networkCommandAttempted,
    };
    const usage: Usage | null = turn.usage;
    const evaluationMetadataPath = resolve(
      evaluationDirectory,
      "evaluation-metadata.json",
    );
    const evaluationMetadata = {
      evaluationId,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      evaluatorConfig: recommendedJobsFinalPrdEvaluatorConfig,
      observedConfiguration,
      inputProvenancePath: provenancePath,
      inputVisibility: {
        evaluatorCanSee: [
          "frozen PM Intent",
          "final PRD",
          "Product Knowledge references used by the source run",
          "clarification questions and answers actually revealed to the Product Child",
        ],
        evaluatorCannotSee: [
          "hidden fixture bank",
          "unused fixture answers",
          "expected outcome",
          "previous failed smoke runs",
          "runtime guard verdicts",
          "Router classifications",
          "Alignment verdict",
          "diagnosis and tuning history",
        ],
      },
      sourceProvenance: {
        sourceRunId,
        evaluatorAccess: false,
        productKnowledgeReferences: metadata.productKnowledge.references,
        referenceHashes,
      },
      threadId: thread.id,
      usage,
      paths: {
        evaluationPackage: packagePath,
        evaluatorOutput: evaluatorOutputPath,
        inputProvenance: provenancePath,
      },
      isolation: {
        ...isolation,
        passed:
          isolation.expectedReferenceFilesPresent &&
          isolation.workingDirectoryUnchanged &&
          isolation.actualWorkingDirectoryIsEvaluatorWorkspace &&
          isolation.actualNetworkDisabled &&
          isolation.evaluatorWebSearchItemCount === 0 &&
          !isolation.networkCommandAttempted,
      },
    };
    await writeFile(
      evaluationMetadataPath,
      `${JSON.stringify(evaluationMetadata, null, 2)}\n`,
      "utf8",
    );
    console.log(
      JSON.stringify(
        {
          evaluationDirectory,
          evaluatorOutput,
          evaluationMetadata,
        },
        null,
        2,
      ),
    );
  } finally {
    await Promise.all([
      rm(evaluatorCodexHome, { recursive: true, force: true }),
      rm(evaluatorWorkingDirectory, { recursive: true, force: true }),
    ]);
  }
}

const isEntrypoint =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntrypoint) await runRecommendedJobsFinalPrdEvaluation();
