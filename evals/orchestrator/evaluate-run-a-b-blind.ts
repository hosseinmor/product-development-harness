import { Codex, type ThreadItem, type Usage } from "@openai/codex-sdk";
import { createHash, randomInt } from "node:crypto";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const runAId = "run-a-control-2026-09-10T07-36-42.269Z";
const runBId = "run-b-no-product-knowledge-2026-09-08T18-20-14.093Z";
const runCId = "run-c-solution-shaped-2026-09-10T07-47-18.173Z";
const snapshotId = "product-knowledge-snapshot-2026-09-07T14-47-41.304Z";
const snapshotDirectory = resolve(runsDirectory, snapshotId);
const supersededEvaluationId =
  "blind-evaluation-a-b-2026-09-08T18-51-54.250Z";
const previousAcEvaluationId =
  "blind-evaluation-a-c-with-reference-2026-09-09T08-37-01.829Z";
type Comparison = "a-b" | "a-c";
const comparisonArgument = process.argv.find((argument) =>
  argument.startsWith("--comparison="),
);
const comparison = (comparisonArgument?.slice("--comparison=".length) ??
  "a-b") as Comparison;
if (comparison !== "a-b" && comparison !== "a-c") {
  throw new Error(`Unsupported blind comparison: ${comparison}`);
}
const comparisonRunId = comparison === "a-c" ? runCId : runBId;
const comparisonRunKey = comparison === "a-c" ? "runC" : "runB";
const evaluationPrefix =
  comparison === "a-c"
    ? "blind-evaluation-final-a-c-with-reference"
    : "blind-evaluation-a-b-with-reference";
const neutralEvaluationBrief = `تغییر محصول قرار است به کارجویی که در طول زمان دوباره با یک Search مواجه می‌شود کمک کند فرصت‌هایی را که از مراجعهٔ قبلی به نتایج آن Search اضافه شده‌اند سریع‌تر تشخیص دهد و تمرکز خود را روی فرصت‌های تازه بگذارد.

Product authority را فقط از محتوای substantive خود PRD و clarification question/answerهای ارائه‌شده ارزیابی کن. سازگاری آن‌ها را بسنج، اما دربارهٔ شرایط تولید Candidate حدس نزن.

یک Product capability صریح، از جمله توانایی محدودکردن نمایش به موارد New، صرفاً به‌دلیل نحوهٔ بیانش نباید جریمه شود. آن را از Design mechanic دقیق مانند filter/mode/control، badge، visual hierarchy، exact count presentation و layout جدا کن؛ این mechanics فقط وقتی constraint هستند که authority قابل مشاهده آن‌ها را الزام کرده باشد.`;
const evaluatorConfig = {
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
type CandidateLabel = "X" | "Y";

type RunMetadata = {
  productQuestions: Array<{
    turn: number;
    question: string;
    whyMaterial: string;
  }>;
  fixtureAnswers: Array<{
    afterTurn: number;
    question: string;
    fixtures: Array<{ answer: string }>;
  }>;
};

type BlindCandidate = {
  candidate: CandidateLabel;
  finalPrd: string;
  productClarificationQuestions: Array<{
    turn: number;
    question: string;
  }>;
  productAnswers: Array<{
    afterTurn: number;
    question: string;
    answers: string[];
  }>;
};

type Redaction = {
  kind:
    | "frontmatter_references"
    | "canonical_dependencies"
    | "context_availability_statement";
  startLine: number;
  removedLines: string[];
  replacement: null;
};

type LoadedCandidate = {
  blindCandidate: BlindCandidate;
  originalPrd: string;
  redactions: Redaction[];
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
  candidateEvaluations: Array<{
    candidate: CandidateLabel;
    scores: Score[];
    problem_recovery: {
      value: "strong" | "partial" | "weak";
      evidence: string;
    };
    solution_lock_in: {
      value: "none" | "minor" | "material";
      evidence: string;
    };
    unsupported_product_behavior: Array<{
      behavior: string;
      evidence: string;
      authorityGap: string;
      downstreamDesignEffect: string;
    }>;
    unsupported_design_constraints: Array<{
      constraint: string;
      evidence: string;
      authorityGap: string;
      downstreamDesignEffect: string;
    }>;
    omitted_material_product_decisions: Array<{
      decision: string;
      evidence: string;
      downstreamDesignRisk: string;
    }>;
    material_context_missed: Array<{
      context: string;
      referenceEvidence: string;
      directRelevance: string;
      downstreamDesignRisk: string;
    }>;
  }>;
  comparativeJudgment:
    | "X_materially_better"
    | "Y_materially_better"
    | "no_material_difference";
  keyDifferences: Array<{
    difference: string;
    mayChangeDownstreamDesign: boolean;
    downstreamDesignEffect: string;
  }>;
  comparativeDiagnostics: {
    productDesignBoundaryBetterPreservedBy: CandidateLabel | "neither";
    productDesignBoundaryEvidence: string;
    solutionSpaceUnnecessarilyLimitedBy: CandidateLabel[];
    solutionSpaceEvidence: string;
    materialProductSemanticsMissedBy: CandidateLabel[];
    materialProductSemanticsEvidence: string;
  };
  unsupportedOrInventedProductTruth: Array<{
    candidate: CandidateLabel;
    hasUnsupportedOrInventedClaim: boolean;
    claims: Array<{
      claim: string;
      evidence: string;
      referenceEvidence: string;
      rationale: string;
    }>;
  }>;
};

const evaluatorOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    candidateEvaluations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          candidate: { type: "string", enum: ["X", "Y"] },
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
          problem_recovery: {
            type: "object",
            additionalProperties: false,
            properties: {
              value: {
                type: "string",
                enum: ["strong", "partial", "weak"],
              },
              evidence: { type: "string" },
            },
            required: ["value", "evidence"],
          },
          solution_lock_in: {
            type: "object",
            additionalProperties: false,
            properties: {
              value: {
                type: "string",
                enum: ["none", "minor", "material"],
              },
              evidence: { type: "string" },
            },
            required: ["value", "evidence"],
          },
          unsupported_product_behavior: {
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
          unsupported_design_constraints: {
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
          omitted_material_product_decisions: {
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
          material_context_missed: {
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
        },
        required: [
          "candidate",
          "scores",
          "problem_recovery",
          "solution_lock_in",
          "unsupported_product_behavior",
          "unsupported_design_constraints",
          "omitted_material_product_decisions",
          "material_context_missed",
        ],
      },
    },
    comparativeJudgment: {
      type: "string",
      enum: [
        "X_materially_better",
        "Y_materially_better",
        "no_material_difference",
      ],
    },
    keyDifferences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          difference: { type: "string" },
          mayChangeDownstreamDesign: { type: "boolean" },
          downstreamDesignEffect: { type: "string" },
        },
        required: [
          "difference",
          "mayChangeDownstreamDesign",
          "downstreamDesignEffect",
        ],
      },
    },
    comparativeDiagnostics: {
      type: "object",
      additionalProperties: false,
      properties: {
        productDesignBoundaryBetterPreservedBy: {
          type: "string",
          enum: ["X", "Y", "neither"],
        },
        productDesignBoundaryEvidence: { type: "string" },
        solutionSpaceUnnecessarilyLimitedBy: {
          type: "array",
          items: { type: "string", enum: ["X", "Y"] },
        },
        solutionSpaceEvidence: { type: "string" },
        materialProductSemanticsMissedBy: {
          type: "array",
          items: { type: "string", enum: ["X", "Y"] },
        },
        materialProductSemanticsEvidence: { type: "string" },
      },
      required: [
        "productDesignBoundaryBetterPreservedBy",
        "productDesignBoundaryEvidence",
        "solutionSpaceUnnecessarilyLimitedBy",
        "solutionSpaceEvidence",
        "materialProductSemanticsMissedBy",
        "materialProductSemanticsEvidence",
      ],
    },
    unsupportedOrInventedProductTruth: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          candidate: { type: "string", enum: ["X", "Y"] },
          hasUnsupportedOrInventedClaim: { type: "boolean" },
          claims: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                claim: { type: "string" },
                evidence: { type: "string" },
                referenceEvidence: { type: "string" },
                rationale: { type: "string" },
              },
              required: [
                "claim",
                "evidence",
                "referenceEvidence",
                "rationale",
              ],
            },
          },
        },
        required: ["candidate", "hasUnsupportedOrInventedClaim", "claims"],
      },
    },
  },
  required: [
    "candidateEvaluations",
    "comparativeJudgment",
    "keyDifferences",
    "comparativeDiagnostics",
    "unsupportedOrInventedProductTruth",
  ],
} as const;

const harnessCriteria = `
- Judge semantic fitness for downstream Product Design, not wording, polish, or length.
- The PRD must frame the underlying user problem rather than merely the absence of a feature.
- Current Behavior must contain only the local baseline supported by visible evidence; absence of context is uncertainty, not evidence of nonexistence.
- Product intent, affected users, outcomes, scope, scenarios, required behavior, and acceptance criteria must remain within Product authority and must not silently convert assumptions into product truth.
- General/domain knowledge may support hypotheses or recommendations but must not be presented as established current behavior or decided intent.
- Clarification should follow a best-effort draft and ask only material human-owned decisions, with the decision and its consequence clear. Independent decisions should be separate.
- Scope should establish material boundaries without prescribing Design or implementation details.
- Product scenarios should provide the shortest coherent user/product lifecycle needed to connect the rules.
- Required behavior and acceptance criteria should constrain materially incompatible interpretations and be observable or verifiable without prescribing a UI solution.
- Problem Aligned means the artifact is sufficiently established or explicitly bounded for meaningful Design Exploration; it does not require maximum detail or zero uncertainty.
- Conditional sections need not appear when their semantic responsibility does not apply. Do not reward length or exact section wording by itself.`.trim();

const rubricOperationalization = `
- Current-product grounding: assess correctness against the local reference, relevance of stated current behavior to this change, and omission of materially relevant current context.
- Authority / uncertainty discipline: distinguish established facts from assumptions or unresolved claims. Absence from the reference is not proof that a behavior does not exist.
- Domain specificity without unsupported invention: reward correct supported specificity, penalize unsupported specificity, and do not reward genericness merely because it avoids claims.
- For Current-product grounding, Authority / uncertainty discipline, and Domain specificity without unsupported invention, cite concise local reference evidence when it is relevant to the score.
- The local reference describes current implemented product context only. Never treat it as Product intent for the proposed feature. Judge intended-behavior authority from substantive statements in the candidate PRD together with the supplied Product clarification answers; do not infer the candidate's original input or generation condition.
- problem_recovery: judge whether the PRD models the problem and outcome independently of interaction mechanics; return strong, partial, or weak with evidence.
- solution_lock_in: judge whether the PRD turns an interaction suggestion or presentation choice into a requirement without sufficient Product authority; return none, minor, or material with evidence.
- unsupported_product_behavior: list intended Product behaviors asserted as requirements when neither the substantive PRD nor supplied clarification evidence provides sufficient authority.
- unsupported_design_constraints: list only constraints that are not established by a supplied Product answer, cannot be derived from current-product reference context, and properly belong to Design Exploration.
- Explicitly inspect Search identity, New semantics including Reactivation, baseline lifecycle, first visit/no baseline, and persistence/logged-in/account/device boundaries.
- Separately inspect the explicit capability to view only New results, any exact filter/mode/control, ordinary-results marker/distinguishability, and Recent/Saved exact count or weaker pre-entry signal. Do not penalize an explicit Product capability merely because of how it is phrased; separate the capability from its exact Design mechanic and decide authority only from visible artifact and clarification evidence.
- Inclusion of Search Results, Recent Search, and Saved Search in v0 scope does not by itself establish a particular presentation mechanic on those touchpoints.
- omitted_material_product_decisions: list only unresolved Product decisions whose omission would force Design to invent materially consequential product behavior.
- material_context_missed: include an item only when the context is supported by the reference, directly relevant to the intended change, and its omission could lead Design to a materially different or incorrect experience. Mere relatedness is insufficient, and additional context is not inherently better.`.trim();

function blindPrd(markdown: string): { redactedPrd: string; redactions: Redaction[] } {
  const lines = markdown.split("\n");
  const removedIndexes = new Set<number>();
  const redactions: Redaction[] = [];

  const frontmatterEnd = lines[0] === "---" ? lines.indexOf("---", 1) : -1;
  if (frontmatterEnd > 0) {
    const referencesStart = lines.findIndex(
      (line, index) =>
        index > 0 && index < frontmatterEnd && line.trim() === "references:",
    );
    if (referencesStart >= 0) {
      let referencesEnd = referencesStart + 1;
      while (
        referencesEnd < frontmatterEnd &&
        (lines[referencesEnd].startsWith(" ") || lines[referencesEnd] === "")
      ) {
        referencesEnd += 1;
      }
      const removedLines = lines.slice(referencesStart, referencesEnd);
      removedLines.forEach((_, offset) =>
        removedIndexes.add(referencesStart + offset),
      );
      redactions.push({
        kind: "frontmatter_references",
        startLine: referencesStart + 1,
        removedLines,
        replacement: null,
      });
    }
  }

  const dependenciesStart = lines.findIndex(
    (line) => line.trim() === "## Dependencies",
  );
  if (dependenciesStart >= 0) {
    let dependenciesEnd = dependenciesStart + 1;
    while (
      dependenciesEnd < lines.length &&
      !lines[dependenciesEnd].startsWith("## ")
    ) {
      dependenciesEnd += 1;
    }
    const dependencyBody = lines.slice(dependenciesStart + 1, dependenciesEnd);
    const substantiveBody = dependencyBody.filter((line) => line.trim().length > 0);
    const onlyCanonicalReferences =
      substantiveBody.length > 0 &&
      substantiveBody.every(
        (line) =>
          line.trimStart().startsWith("- http://") ||
          line.trimStart().startsWith("- https://") ||
          /^-\s+`[^`]+`$/.test(line.trim()),
      );
    if (onlyCanonicalReferences) {
      const removedLines = lines.slice(dependenciesStart, dependenciesEnd);
      removedLines.forEach((_, offset) =>
        removedIndexes.add(dependenciesStart + offset),
      );
      redactions.push({
        kind: "canonical_dependencies",
        startLine: dependenciesStart + 1,
        removedLines,
        replacement: null,
      });
    }
  }

  lines.forEach((line, index) => {
    const availabilityOnlyStatement = line.includes("Product Knowledge");
    if (availabilityOnlyStatement && !removedIndexes.has(index)) {
      removedIndexes.add(index);
      redactions.push({
        kind: "context_availability_statement",
        startLine: index + 1,
        removedLines: [line],
        replacement: null,
      });
    }
  });

  return {
    redactedPrd: lines
      .filter((_, index) => !removedIndexes.has(index))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n"),
    redactions,
  };
}

async function loadBlindCandidate(
  candidate: CandidateLabel,
  runId: string,
): Promise<LoadedCandidate> {
  const runDirectory = resolve(runsDirectory, runId);
  const [metadata, finalPrd] = await Promise.all([
    readFile(resolve(runDirectory, "run-metadata.json"), "utf8").then(
      (value) => JSON.parse(value) as RunMetadata,
    ),
    readFile(resolve(runDirectory, "workspace/outputs/prd.md"), "utf8"),
  ]);
  const redacted = blindPrd(finalPrd);
  return {
    originalPrd: finalPrd,
    redactions: redacted.redactions,
    blindCandidate: {
      candidate,
      finalPrd: redacted.redactedPrd,
      productClarificationQuestions: metadata.productQuestions.map(
        ({ turn, question }) => ({ turn, question }),
      ),
      productAnswers: metadata.fixtureAnswers.map((entry) => ({
        afterTurn: entry.afterTurn,
        question: entry.question,
        answers: entry.fixtures.map((fixture) => fixture.answer),
      })),
    },
  };
}

function validateBlindPackage(serialized: string): void {
  const forbidden = [
    runAId,
    runBId,
    runCId,
    previousAcEvaluationId,
    "Run A",
    "Run B",
    "Run C",
    "problem-oriented",
    "solution-shaped",
    "retrievedProductKnowledge",
    "fixtureRoutes",
    "fixtureAnswers",
    "Fixture A",
    "Fixture B",
    "Fixture C",
    "Fixture D",
    "Fixture E",
    "Fixture F",
    "Fixture G",
    "Fixture H",
    "snapshot",
    "platform-eng.pages.git.jvoffice.ir",
    "/Users/",
    "evals/runs",
    "Product Knowledge",
  ];
  const disclosure = forbidden.find((value) => serialized.includes(value));
  if (disclosure) {
    throw new Error(`Blind evaluation package contains forbidden disclosure: ${disclosure}`);
  }
}

function evaluatorPrompt(blindPackage: unknown): string {
  return `You are an independent blind evaluator of two Product-work candidates. You do not know how either candidate was produced and must not guess or infer its experimental variant.

Evaluate each candidate independently on every listed dimension, then make the requested comparative judgment.

Scoring:
- 0 = materially missing, unsupported, or not fit for purpose
- 1 = partially adequate, with a material gap
- 2 = sufficiently strong for the intended downstream use

For every score provide short artifact evidence, short referenceEvidence, a short rationale, and confidence. For dimensions where the local reference is not relevant, say so briefly in referenceEvidence. Do not score exact wording, stylistic polish, or length. A longer PRD is not inherently better.

Harness criteria:
${harnessCriteria}

Rubric operationalization:
${rubricOperationalization}

Evaluation dimensions:
${dimensions.map((dimension, index) => `${index + 1}. ${dimension}`).join("\n")}

After independent scoring:
- choose X_materially_better, Y_materially_better, or no_material_difference;
- give exactly three most important factual differences;
- state for each whether it may change downstream Design and how;
- record whether either candidate better preserves the Product/Design boundary;
- record whether either candidate unnecessarily limits the solution space;
- record whether either candidate misses material Product semantics;
- assess whether either artifact states unsupported or invented product truth, citing local reference evidence or explicitly stating that the reference does not establish the claim;
- populate problem_recovery, solution_lock_in, unsupported_product_behavior, omitted_material_product_decisions, and unsupported_design_constraints for each candidate using the operationalized definitions;
- populate material_context_missed for each candidate using the strict three-part test in the operationalization; use an empty array when nothing qualifies.

Important authority checks: examine Search identity, New/Reactivation semantics, baseline lifecycle, first visit/no baseline, and persistence/logged-in/account/device boundaries. Also separate an explicit ability to view only New results from an exact filter/mode/control, ordinary-results distinguishability capability from its visual treatment, and Recent/Saved pre-entry signaling from exact counts or presentation. Scope inclusion alone does not establish these capabilities or mechanics. Do not penalize a capability solely because of how it is phrased. Judge only from the artifact and supplied clarification evidence, without guessing candidate identity.

Use only the evaluation package below and the frozen current-product reference at reference/current-product. Search that local reference yourself when needed, using read-only tools. Do not use network, files outside the evaluator workspace, hidden context, or speculation about candidate identity. The reference is grading context for current implemented behavior only; it is not Product authority for the intended change.

Evaluation package:
${JSON.stringify(blindPackage, null, 2)}`;
}

function validateEvaluatorOutput(output: EvaluatorOutput): void {
  const labels = output.candidateEvaluations.map((entry) => entry.candidate).sort();
  if (labels.join(",") !== "X,Y") {
    throw new Error("Evaluator must return exactly one evaluation for X and Y.");
  }
  for (const candidate of output.candidateEvaluations) {
    const returnedDimensions = candidate.scores.map((score) => score.dimension);
    if (
      returnedDimensions.length !== dimensions.length ||
      new Set(returnedDimensions).size !== dimensions.length ||
      !dimensions.every((dimension) => returnedDimensions.includes(dimension))
    ) {
      throw new Error(`Evaluator returned an invalid score set for ${candidate.candidate}.`);
    }
    if (
      candidate.scores.some(
        (score) => !Number.isInteger(score.score) || score.score < 0 || score.score > 2,
      )
    ) {
      throw new Error(`Evaluator returned an invalid score for ${candidate.candidate}.`);
    }
  }
  if (output.keyDifferences.length !== 3) {
    throw new Error("Evaluator must return exactly three key differences.");
  }
  const claimLabels = output.unsupportedOrInventedProductTruth
    .map((entry) => entry.candidate)
    .sort();
  if (claimLabels.join(",") !== "X,Y") {
    throw new Error("Evaluator must assess unsupported claims for X and Y.");
  }
}

async function jsonlFilesUnder(root: string): Promise<string[]> {
  const files: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith(".jsonl")) files.push(path);
    }
  }
  await visit(root);
  return files;
}

async function observedConfiguration(codexHome: string): Promise<{
  model: string | null;
  reasoningEffort: string | null;
  workingDirectory: string | null;
  approvalPolicy: string | null;
  networkAccessEnabled: boolean | null;
  permissionProfile: unknown;
}> {
  const observed = {
    model: null as string | null,
    reasoningEffort: null as string | null,
    workingDirectory: null as string | null,
    approvalPolicy: null as string | null,
    networkAccessEnabled: null as boolean | null,
    permissionProfile: null as unknown,
  };
  for (const path of await jsonlFilesUnder(codexHome)) {
    for (const line of (await readFile(path, "utf8")).split("\n")) {
      if (!line) continue;
      try {
        const event = JSON.parse(line) as Record<string, unknown>;
        if (event.type !== "turn_context") continue;
        const payload = event.payload as Record<string, unknown> | undefined;
        const sandbox = payload?.sandbox_policy as Record<string, unknown> | undefined;
        const collaborationMode = payload?.collaboration_mode as
          | Record<string, unknown>
          | undefined;
        const collaborationSettings = collaborationMode?.settings as
          | Record<string, unknown>
          | undefined;
        const permissionProfile = payload?.permission_profile as
          | Record<string, unknown>
          | undefined;
        if (typeof payload?.model === "string") observed.model = payload.model;
        if (typeof payload?.reasoning_effort === "string") {
          observed.reasoningEffort = payload.reasoning_effort;
        } else if (typeof collaborationSettings?.reasoning_effort === "string") {
          observed.reasoningEffort = collaborationSettings.reasoning_effort;
        }
        if (typeof payload?.cwd === "string") observed.workingDirectory = payload.cwd;
        if (typeof payload?.approval_policy === "string") {
          observed.approvalPolicy = payload.approval_policy;
        }
        if (typeof sandbox?.network_access === "boolean") {
          observed.networkAccessEnabled = sandbox.network_access;
        } else if (permissionProfile?.network === "restricted") {
          observed.networkAccessEnabled = false;
        }
        if (payload?.permission_profile !== undefined) {
          observed.permissionProfile = payload.permission_profile;
        }
      } catch {
        continue;
      }
    }
  }
  return observed;
}

async function fileHashesUnder(root: string): Promise<Record<string, string>> {
  const hashes: Record<string, string> = {};
  async function visit(directory: string, prefix = ""): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await visit(path, relativePath);
      else if (entry.isFile()) {
        hashes[relativePath] = createHash("sha256")
          .update(await readFile(path))
          .digest("hex");
      }
    }
  }
  await visit(root);
  return Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b)));
}

const startedAt = new Date();
const evaluationId = `${evaluationPrefix}-${startedAt.toISOString().replaceAll(":", "-")}`;
const evaluationDirectory = resolve(runsDirectory, evaluationId);
await mkdir(evaluationDirectory, { recursive: true });

const runAIsX = randomInt(2) === 0;
const candidateMapping: Record<CandidateLabel, string> = runAIsX
  ? { X: runAId, Y: comparisonRunId }
  : { X: comparisonRunId, Y: runAId };
const [loadedX, loadedY] = await Promise.all([
  loadBlindCandidate("X", candidateMapping.X),
  loadBlindCandidate("Y", candidateMapping.Y),
]);
const blindPackage = {
  evaluationBrief: neutralEvaluationBrief,
  harnessCriteria,
  rubricOperationalization,
  candidates: [loadedX.blindCandidate, loadedY.blindCandidate],
};
const serializedPackage = `${JSON.stringify(blindPackage, null, 2)}\n`;
validateBlindPackage(serializedPackage);
const blindPackagePath = resolve(evaluationDirectory, "blind-package.json");
const auditDirectory = resolve(evaluationDirectory, "audit");
await mkdir(auditDirectory, { recursive: true });
const redactionLogPath = resolve(evaluationDirectory, "redaction-log.json");
const methodologyPath = resolve(evaluationDirectory, "measurement-context.json");
await Promise.all([
  writeFile(blindPackagePath, serializedPackage, "utf8"),
  writeFile(
    resolve(auditDirectory, "original-candidate-X.md"),
    loadedX.originalPrd,
    "utf8",
  ),
  writeFile(
    resolve(auditDirectory, "original-candidate-Y.md"),
    loadedY.originalPrd,
    "utf8",
  ),
  writeFile(
    redactionLogPath,
    `${JSON.stringify(
      {
        policy: [
          "Remove candidate-specific references metadata from YAML frontmatter.",
          "Remove Dependencies sections containing only canonical current-product references.",
          "Remove statements whose sole purpose is to disclose current-product context availability.",
          "Include clarification question text but symmetrically omit whyMaterial fields, which are not requested grading evidence and may contain source-provenance commentary.",
          "Do not rewrite substantive Product claims, Current Behavior, Scope, rules, scenarios, or Acceptance Criteria.",
        ],
        candidates: [
          { candidate: "X", redactions: loadedX.redactions },
          { candidate: "Y", redactions: loadedY.redactions },
        ],
      },
      null,
      2,
    )}\n`,
    "utf8",
  ),
  writeFile(
    methodologyPath,
    `${JSON.stringify(
      {
        comparison,
        ...(comparison === "a-c"
          ? {
              validRuns: { runA: runAId, runC: runCId },
              previousComparableEvaluation: {
                evaluationId: previousAcEvaluationId,
                purpose:
                  "Post-reveal factual comparison of the measured A/C score gap; unavailable to the evaluator workspace.",
              },
            }
          : {
              supersedesEvaluation: supersededEvaluationId,
              reason:
                "The previous evaluator could not inspect the frozen current-product reference, so its grounding measurement could reward omission without verifying candidate claims or material context gaps.",
            }),
        preserved: true,
        evaluatorAccess: false,
      },
      null,
      2,
    )}\n`,
    "utf8",
  ),
]);

const evaluatorWorkingDirectory = await mkdtemp(
  join(tmpdir(), "harness-blind-evaluator-workspace-"),
);
const evaluatorCodexHome = await mkdtemp(
  join(tmpdir(), "harness-blind-evaluator-codex-"),
);
const originalCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
const referenceDirectory = resolve(
  evaluatorWorkingDirectory,
  "reference/current-product",
);
await mkdir(referenceDirectory, { recursive: true });
await Promise.all(
  ["manifest.json", "pages.jsonl"].map((name) =>
    copyFile(resolve(snapshotDirectory, name), resolve(referenceDirectory, name)),
  ),
);
const hashesBefore = await fileHashesUnder(evaluatorWorkingDirectory);
const evaluatorToml = `
default_permissions = "blind_prd_evaluator"

[permissions.blind_prd_evaluator]
description = "Blind PRD evaluation from the supplied package and frozen local grading reference only."

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

let evaluatorOutput: EvaluatorOutput;
let usage: Usage | null = null;
let threadId: string | null = null;
let evaluatorItems: ThreadItem[] = [];
let observed: Awaited<ReturnType<typeof observedConfiguration>>;
try {
  const codex = new Codex({ env: evaluatorEnvironment });
  const thread = codex.startThread({
    model: evaluatorConfig.model,
    modelReasoningEffort: evaluatorConfig.reasoningEffort,
    workingDirectory: evaluatorWorkingDirectory,
    skipGitRepoCheck: true,
    networkAccessEnabled: evaluatorConfig.networkAccessEnabled,
    approvalPolicy: evaluatorConfig.approvalPolicy,
    webSearchMode: evaluatorConfig.webSearchMode,
  });
  const turn = await thread.run(evaluatorPrompt(blindPackage), {
    outputSchema: evaluatorOutputSchema,
  });
  threadId = thread.id;
  usage = turn.usage;
  evaluatorItems = turn.items;
  if (!turn.finalResponse) throw new Error("Evaluator returned no final response.");
  evaluatorOutput = JSON.parse(turn.finalResponse) as EvaluatorOutput;
  validateEvaluatorOutput(evaluatorOutput);

  const evaluatorOutputPath = resolve(evaluationDirectory, "evaluator-output.json");
  await writeFile(
    evaluatorOutputPath,
    `${JSON.stringify(evaluatorOutput, null, 2)}\n`,
    "utf8",
  );
  const judgmentPersistedAt = new Date();

  await new Promise((resolvePromise) => setTimeout(resolvePromise, 2));
  const mappingPath = resolve(evaluationDirectory, "candidate-mapping.json");
  await writeFile(
    mappingPath,
    `${JSON.stringify(candidateMapping, null, 2)}\n`,
    "utf8",
  );
  const mappingRevealedAt = new Date();

  const scoreByCandidate = Object.fromEntries(
    evaluatorOutput.candidateEvaluations.map((candidate) => [
      candidate.candidate,
      Object.fromEntries(
        candidate.scores.map((score) => [score.dimension, score.score]),
      ),
    ]),
  ) as Record<CandidateLabel, Record<Dimension, number>>;
  const scoreDifferences = dimensions.map((dimension) => ({
    dimension,
    candidateX: scoreByCandidate.X[dimension],
    candidateY: scoreByCandidate.Y[dimension],
    differenceXMinusY:
      scoreByCandidate.X[dimension] - scoreByCandidate.Y[dimension],
    runA:
      candidateMapping.X === runAId
        ? scoreByCandidate.X[dimension]
        : scoreByCandidate.Y[dimension],
    [comparisonRunKey]:
      candidateMapping.X === comparisonRunId
        ? scoreByCandidate.X[dimension]
        : scoreByCandidate.Y[dimension],
  }));
  const evaluationByCandidate = Object.fromEntries(
    evaluatorOutput.candidateEvaluations.map((candidate) => [
      candidate.candidate,
      candidate,
    ]),
  ) as Record<
    CandidateLabel,
    EvaluatorOutput["candidateEvaluations"][number]
  >;
  const runALabel: CandidateLabel = candidateMapping.X === runAId ? "X" : "Y";
  const comparisonRunLabel: CandidateLabel = runALabel === "X" ? "Y" : "X";
  const winningCandidate =
    evaluatorOutput.comparativeJudgment === "X_materially_better"
      ? "X"
      : evaluatorOutput.comparativeJudgment === "Y_materially_better"
        ? "Y"
        : null;
  const interpretation = {
    comparativeJudgment: evaluatorOutput.comparativeJudgment,
    winningCandidate,
    winningRun: winningCandidate ? candidateMapping[winningCandidate] : null,
    mapping: candidateMapping,
    scoreDifferences,
    diagnosticsByRun: {
      runA: {
        problem_recovery: evaluationByCandidate[runALabel].problem_recovery,
        solution_lock_in: evaluationByCandidate[runALabel].solution_lock_in,
        unsupported_product_behavior:
          evaluationByCandidate[runALabel].unsupported_product_behavior,
        unsupported_design_constraints:
          evaluationByCandidate[runALabel].unsupported_design_constraints,
        omitted_material_product_decisions:
          evaluationByCandidate[runALabel].omitted_material_product_decisions,
        material_context_missed:
          evaluationByCandidate[runALabel].material_context_missed,
      },
      [comparisonRunKey]: {
        problem_recovery:
          evaluationByCandidate[comparisonRunLabel].problem_recovery,
        solution_lock_in:
          evaluationByCandidate[comparisonRunLabel].solution_lock_in,
        unsupported_product_behavior:
          evaluationByCandidate[comparisonRunLabel].unsupported_product_behavior,
        unsupported_design_constraints:
          evaluationByCandidate[comparisonRunLabel].unsupported_design_constraints,
        omitted_material_product_decisions:
          evaluationByCandidate[comparisonRunLabel]
            .omitted_material_product_decisions,
        material_context_missed:
          evaluationByCandidate[comparisonRunLabel].material_context_missed,
      },
    },
    comparativeDiagnostics: evaluatorOutput.comparativeDiagnostics,
    methodology:
      comparison === "a-c"
        ? {
            finalPostFixMeasurement: true,
            previousComparableEvaluationId: previousAcEvaluationId,
          }
        : null,
    limitation:
      "Factual interpretation of one blinded comparison only; no definitive causal conclusion is supported.",
  };
  const interpretationPath = resolve(
    evaluationDirectory,
    "interpretation-summary.json",
  );
  await writeFile(
    interpretationPath,
    `${JSON.stringify(interpretation, null, 2)}\n`,
    "utf8",
  );

  observed = await observedConfiguration(evaluatorCodexHome);
  const hashesAfter = await fileHashesUnder(evaluatorWorkingDirectory);
  const evaluatorCommands = evaluatorItems
    .filter((item) => item.type === "command_execution")
    .map((item) => item.command);
  const evaluatorWebSearchItemCount = evaluatorItems.filter(
    (item) => item.type === "web_search",
  ).length;
  const networkCommandAttempted = evaluatorCommands.some((command) =>
    /\b(?:curl|wget|httpie|fetch)\b/i.test(command),
  );
  const isolation = {
    referenceFilesPresentBeforeEvaluation:
      Object.keys(hashesBefore).sort().join(",") ===
      "reference/current-product/manifest.json,reference/current-product/pages.jsonl",
    workingDirectoryUnchanged:
      JSON.stringify(hashesBefore) === JSON.stringify(hashesAfter),
    actualWorkingDirectoryIsEvaluatorWorkspace:
      observed.workingDirectory === evaluatorWorkingDirectory,
    actualNetworkDisabled: observed.networkAccessEnabled === false,
    evaluatorWebSearchItemCount,
    networkCommandAttempted,
  };
  const metadata = {
    evaluationId,
    comparison,
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    judgmentPersistedAt: judgmentPersistedAt.toISOString(),
    mappingRevealedAt: mappingRevealedAt.toISOString(),
    mappingWasRevealedAfterJudgment:
      mappingRevealedAt.getTime() > judgmentPersistedAt.getTime(),
    evaluatorConfig,
    observedConfiguration: observed,
    gradingReference: {
      snapshotId,
      sourcePath: snapshotDirectory,
      evaluatorWorkspacePath: referenceDirectory,
      files: hashesBefore,
      purpose: "Current implemented product context grading reference only.",
      productIntentAuthority: false,
    },
    methodology:
      comparison === "a-c"
        ? {
            validRunIds: [runAId, runCId],
            finalPostFixMeasurement: true,
            previousComparableEvaluationId: previousAcEvaluationId,
            recordPath: methodologyPath,
          }
        : {
            supersededEvaluationId,
            reason:
              "The previous evaluator lacked the frozen current-product reference needed to verify grounding.",
            recordPath: methodologyPath,
          },
    blindness: {
      candidatesRandomized: true,
      variantSpecificPmIntentsExcluded: true,
      neutralEvaluationBriefUsed: true,
      runIdsAndVariantLabelsExcluded: true,
      filesystemPathsExcluded: true,
      routerAndFixtureIdsExcluded: true,
      candidateSpecificProvenanceRedacted: true,
      packageValidatedBeforeEvaluation: true,
    },
    threadId,
    usage,
    blindPackagePath,
    redactionLogPath,
    originalCandidateArtifacts: {
      X: resolve(auditDirectory, "original-candidate-X.md"),
      Y: resolve(auditDirectory, "original-candidate-Y.md"),
    },
    evaluatorOutputPath,
    mappingPath,
    interpretationPath,
    isolation: {
      ...isolation,
      passed:
        isolation.referenceFilesPresentBeforeEvaluation &&
        isolation.workingDirectoryUnchanged &&
        isolation.actualWorkingDirectoryIsEvaluatorWorkspace &&
        isolation.actualNetworkDisabled &&
        isolation.evaluatorWebSearchItemCount === 0 &&
        !isolation.networkCommandAttempted,
    },
  };
  const metadataPath = resolve(evaluationDirectory, "evaluation-metadata.json");
  await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        evaluationDirectory,
        evaluatorOutput,
        interpretation,
        metadata,
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
