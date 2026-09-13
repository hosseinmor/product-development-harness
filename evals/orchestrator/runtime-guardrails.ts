import { Codex, type Usage } from "@openai/codex-sdk";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join, resolve } from "node:path";

export const runtimeGuardrailConfig = {
  model: "gpt-5.6-sol",
  reasoningEffort: "high",
  networkAccessEnabled: false,
  approvalPolicy: "never",
  webSearchMode: "disabled",
  structuredOutput: true,
  maximumRepairAttemptsPerGuard: 2,
  maximumAlignmentAttempts: 2,
} as const;

export type GuardrailProductQuestion = {
  question: string;
  whyMaterial: string;
};

export type AtomicityFinding = {
  question: string;
  decisionVariable: string;
  atomic: boolean;
  reason: string;
  independentAxes: string[];
};

export type AtomicityAudit = {
  passed: boolean;
  results: AtomicityFinding[];
};

export const clarificationMaterialityClassifications = [
  "BLOCKING_PRODUCT_DECISION",
  "NON_BLOCKING_PRODUCT_UNCERTAINTY",
  "DESIGN_OWNED",
] as const;

export type ClarificationMaterialityClassification =
  (typeof clarificationMaterialityClassifications)[number];

export type ClarificationMaterialityFinding = {
  question: string;
  classification: ClarificationMaterialityClassification;
  reason: string;
  dependsOnQuestions: string[];
};

export type ClarificationMaterialityAudit = {
  passed: boolean;
  results: ClarificationMaterialityFinding[];
};

export type ClarificationMaterialityInput = {
  pmIntent: string;
  currentProductContext: Array<{ url: string; title: string; context: string }>;
  prdMarkdown: string;
  humanDecisions: HumanDecision[];
  questions: GuardrailProductQuestion[];
};

export type ClarificationMaterialityMetrics = {
  clarificationMaterialityAuditCount: number;
  clarificationMaterialityRejectCount: number;
  blockingQuestions: number;
  nonBlockingProductQuestions: number;
  designOwnedQuestions: number;
  clarificationMaterialityRepairCount: number;
  semanticAuditCallCount: number;
  cacheHits: number;
};

export type ClarificationMaterialityGuardResult =
  SemanticGuardResult<ClarificationMaterialityAudit> & {
    instrumentation: {
      cached: boolean;
      semanticAuditCallCount: number;
    };
  };

export type AuthorityStatus =
  | "explicit_intent"
  | "human_decision"
  | "current_fact_only"
  | "necessary_implication"
  | "not_authoritative"
  | "unsupported";

export const authorityTypes = [
  "explicit_intent",
  "human_decision",
  "necessary_implication",
  "current_product_constraint",
] as const;

export type AuthorityType = (typeof authorityTypes)[number];

export type AuthorityClaimSection =
  | "Scope"
  | "Required Product Behavior"
  | "Acceptance Criteria";

export type AuthorityClaimSidecar = {
  claim: string;
  section: AuthorityClaimSection;
  authorityRefs: string[];
  authorityType: AuthorityType;
  derived: boolean;
};

export type AuthorityLedgerItem = {
  id: string;
  kind: "pm_intent" | "human_decision";
  statement: string;
  question: string | null;
};

export type AuthorityLedger = {
  version: number;
  items: AuthorityLedgerItem[];
};

export type AuthorityFinding = {
  claim: string;
  section: AuthorityClaimSection;
  authorityStatus: AuthorityStatus;
  authoritySource: string;
  necessaryImplication: boolean;
  validPromotion: boolean;
  reason: string;
  authorityRefs?: string[];
  verdictSource?: "semantic_audit" | "cache" | "deterministic";
};

export type AuthorityAudit = {
  passed: boolean;
  claims: AuthorityFinding[];
};

export type GuardIsolation = {
  workingDirectoryWasEmpty: boolean;
  workingDirectoryUnchanged: boolean;
  networkAccessEnabled: false;
  passed: boolean;
};

export type SemanticGuardResult<TAudit> = {
  threadId: string | null;
  audit: TAudit;
  usage: Usage | null;
  isolation: GuardIsolation;
};

export type HumanDecision = {
  question: string;
  answer: string;
};

export type AuthorityAuditInstrumentation = {
  authorityStateVersion: number;
  claimsChecked: number;
  semanticAuditCallCount: number;
  semanticClaimsSubmitted: number;
  cacheHits: number;
  deterministicVerdicts: number;
  claimsRecheckedAfterRepair: string[];
};

export type AuthorityGuardMetrics = {
  auditInvocations: number;
  semanticAuditCallCount: number;
  semanticClaimsSubmitted: number;
  cacheHits: number;
  claimsChecked: number;
  deterministicVerdicts: number;
  claimsRecheckedAfterRepair: number;
};

export type AuthorityGuardResult = SemanticGuardResult<AuthorityAudit> & {
  instrumentation: AuthorityAuditInstrumentation;
};

export type MaterialDecisionBoundary = {
  boundary: string;
  owner: "product" | "design" | "dependency";
  material: boolean;
  blocking: boolean;
  reason: string;
};

export type NonBlockingOpenDecision = {
  boundary: string;
  reason: string;
};

export type MaterialDecisionCoverageAudit = {
  aligned: boolean;
  blockers: MaterialDecisionBoundary[];
  nonBlockingOpenDecisions: NonBlockingOpenDecision[];
};

export type MaterialDecisionCoverageInput = {
  pmIntent: string;
  currentProductContext: Array<{ url: string; title: string; context: string }>;
  prdMarkdown: string;
  humanDecisions: HumanDecision[];
};

export type AlignmentGuardMetrics = {
  alignmentAuditCount: number;
  alignmentRejectCount: number;
  blockersReported: number;
  nonBlockingOpenDecisions: number;
  alignmentRepairCount: number;
  semanticAuditCallCount: number;
  cacheHits: number;
};

export type AlignmentGuardResult =
  SemanticGuardResult<MaterialDecisionCoverageAudit> & {
    instrumentation: {
      cached: boolean;
      semanticAuditCallCount: number;
    };
  };

function normalizedText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[`*_~]/g, "")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function splitPmIntent(pmIntent: string): string[] {
  return pmIntent
    .split(/\n\s*\n/g)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

export function createAuthorityLedger(pmIntent: string): AuthorityLedger {
  return {
    version: 1,
    items: splitPmIntent(pmIntent).map((statement, index) => ({
      id: `PM-${String(index + 1).padStart(3, "0")}`,
      kind: "pm_intent",
      statement,
      question: null,
    })),
  };
}

export function extendAuthorityLedger(
  ledger: AuthorityLedger,
  decisions: HumanDecision[],
): AuthorityLedger {
  const existingDecisionKeys = new Set(
    ledger.items
      .filter((item) => item.kind === "human_decision")
      .map((item) => `${normalizedText(item.question ?? "")}\u0000${normalizedText(item.statement)}`),
  );
  const additions: AuthorityLedgerItem[] = [];
  for (const decision of decisions) {
    const key = `${normalizedText(decision.question)}\u0000${normalizedText(decision.answer)}`;
    if (existingDecisionKeys.has(key)) continue;
    existingDecisionKeys.add(key);
    const ordinal =
      ledger.items.filter((item) => item.kind === "human_decision").length +
      additions.length +
      1;
    additions.push({
      id: `HD-${String(ordinal).padStart(3, "0")}`,
      kind: "human_decision",
      statement: decision.answer.trim(),
      question: decision.question.trim(),
    });
  }
  return additions.length === 0
    ? ledger
    : { version: ledger.version + 1, items: [...ledger.items, ...additions] };
}

const atomicityOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          decisionVariable: { type: "string" },
          atomic: { type: "boolean" },
          reason: { type: "string" },
          independentAxes: { type: "array", items: { type: "string" } },
        },
        required: [
          "question",
          "decisionVariable",
          "atomic",
          "reason",
          "independentAxes",
        ],
      },
    },
  },
  required: ["results"],
} as const;

const clarificationMaterialityOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          classification: {
            type: "string",
            enum: clarificationMaterialityClassifications,
          },
          reason: { type: "string" },
          dependsOnQuestions: { type: "array", items: { type: "string" } },
        },
        required: ["question", "classification", "reason", "dependsOnQuestions"],
      },
    },
  },
  required: ["results"],
} as const;

const authorityDeltaOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdicts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          claimIndex: { type: "integer" },
          necessaryImplication: { type: "boolean" },
          validPromotion: { type: "boolean" },
          reason: { type: "string" },
        },
        required: [
          "claimIndex",
          "necessaryImplication",
          "validPromotion",
          "reason",
        ],
      },
    },
  },
  required: ["verdicts"],
} as const;

const materialDecisionCoverageOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    aligned: { type: "boolean" },
    blockers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          boundary: { type: "string" },
          owner: { type: "string", enum: ["product", "design", "dependency"] },
          material: { type: "boolean" },
          blocking: { type: "boolean" },
          reason: { type: "string" },
        },
        required: ["boundary", "owner", "material", "blocking", "reason"],
      },
    },
    nonBlockingOpenDecisions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          boundary: { type: "string" },
          reason: { type: "string" },
        },
        required: ["boundary", "reason"],
      },
    },
  },
  required: ["aligned", "blockers", "nonBlockingOpenDecisions"],
} as const;

export function productChildAuthorityClaimsSchema(ledger: AuthorityLedger) {
  const ledgerDescription = ledger.items
    .map(
      (item) =>
        `${item.id} [${item.kind}]: ${item.question ? `${item.question} -> ` : ""}${item.statement}`,
    )
    .join("\n");
  return {
    type: "array",
    description:
      "Non-durable eval sidecar. Copy every authoritative list/numbered claim from Scope, Required Product Behavior, and Acceptance Criteria exactly once. Omit visibly unresolved, assumed, recommended, hypothetical, or open-decision content. Cite only stable IDs from the authority ledger described on authorityRefs.",
    items: {
      type: "object",
      additionalProperties: false,
      properties: {
        claim: {
          type: "string",
          description: "Exact claim text copied from the PRD, without its Markdown marker.",
        },
        section: {
          type: "string",
          enum: ["Scope", "Required Product Behavior", "Acceptance Criteria"],
        },
        authorityRefs: {
          type: "array",
          description: `Stable authority ledger IDs available in this run:\n${ledgerDescription}`,
          items: { type: "string", enum: ledger.items.map((item) => item.id) },
        },
        authorityType: { type: "string", enum: authorityTypes },
        derived: { type: "boolean" },
      },
      required: ["claim", "section", "authorityRefs", "authorityType", "derived"],
    },
  } as const;
}

export const runtimeGuardrailSchemas = {
  atomicity: atomicityOutputSchema,
  clarificationMateriality: clarificationMaterialityOutputSchema,
  authorityDelta: authorityDeltaOutputSchema,
  materialDecisionCoverage: materialDecisionCoverageOutputSchema,
} as const;

type GuardExecution<TAudit> = {
  prompt: string;
  schema:
    | typeof atomicityOutputSchema
    | typeof clarificationMaterialityOutputSchema
    | typeof authorityDeltaOutputSchema
    | typeof materialDecisionCoverageOutputSchema;
  parse: (raw: unknown) => TAudit;
};

async function immediateFiles(directory: string): Promise<string[]> {
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

async function runSemanticGuard<TAudit>({
  prompt,
  schema,
  parse,
}: GuardExecution<TAudit>): Promise<SemanticGuardResult<TAudit>> {
  const workingDirectory = await mkdtemp(join(tmpdir(), "harness-runtime-guard-workspace-"));
  const guardCodexHome = await mkdtemp(join(tmpdir(), "harness-runtime-guard-codex-"));
  const sourceCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
  const filesBefore = await immediateFiles(workingDirectory);
  try {
    const config = `
default_permissions = "runtime_guard"

[permissions.runtime_guard]
description = "Independent semantic runtime validation with no project or network access."

[permissions.runtime_guard.filesystem]
":minimal" = "read"
${JSON.stringify(workingDirectory)} = "read"

[permissions.runtime_guard.network]
enabled = false
`;
    await writeFile(resolve(guardCodexHome, "config.toml"), config, "utf8");
    await symlink(resolve(sourceCodexHome, "auth.json"), resolve(guardCodexHome, "auth.json"));
    const environment = Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    );
    environment.CODEX_HOME = guardCodexHome;
    const codex = new Codex({ env: environment });
    const thread = codex.startThread({
      model: runtimeGuardrailConfig.model,
      modelReasoningEffort: runtimeGuardrailConfig.reasoningEffort,
      workingDirectory,
      skipGitRepoCheck: true,
      networkAccessEnabled: runtimeGuardrailConfig.networkAccessEnabled,
      approvalPolicy: runtimeGuardrailConfig.approvalPolicy,
      webSearchMode: runtimeGuardrailConfig.webSearchMode,
    });
    const turn = await thread.run(prompt, { outputSchema: schema });
    if (!thread.id || !turn.finalResponse) {
      throw new Error("Runtime semantic guard completed without a result.");
    }
    const audit = parse(JSON.parse(turn.finalResponse) as unknown);
    const filesAfter = await immediateFiles(workingDirectory);
    const workingDirectoryWasEmpty = filesBefore.length === 0;
    const workingDirectoryUnchanged =
      JSON.stringify(filesBefore) === JSON.stringify(filesAfter);
    return {
      threadId: thread.id,
      audit,
      usage: turn.usage,
      isolation: {
        workingDirectoryWasEmpty,
        workingDirectoryUnchanged,
        networkAccessEnabled: false,
        passed: workingDirectoryWasEmpty && workingDirectoryUnchanged,
      },
    };
  } finally {
    await Promise.all([
      rm(guardCodexHome, { recursive: true, force: true }),
      rm(workingDirectory, { recursive: true, force: true }),
    ]);
  }
}

function parseAtomicityAudit(raw: unknown, questions: GuardrailProductQuestion[]): AtomicityAudit {
  const response = raw as { results?: AtomicityFinding[] };
  if (!Array.isArray(response.results) || response.results.length !== questions.length) {
    throw new Error("Atomicity guard returned the wrong number of results.");
  }
  response.results.forEach((result, index) => {
    if (result.question !== questions[index]?.question) {
      throw new Error(`Atomicity guard changed question ${index + 1}.`);
    }
    if (!result.decisionVariable.trim() || !result.reason.trim()) {
      throw new Error(`Atomicity guard omitted rationale for question ${index + 1}.`);
    }
    if (!Array.isArray(result.independentAxes)) {
      throw new Error(`Atomicity guard omitted independentAxes for question ${index + 1}.`);
    }
    if (!result.atomic && result.independentAxes.length < 2) {
      throw new Error(`Non-atomic question ${index + 1} lacks independent axes.`);
    }
  });
  return {
    passed: response.results.every((result) => result.atomic),
    results: response.results,
  };
}

function parseClarificationMaterialityAudit(
  raw: unknown,
  questions: GuardrailProductQuestion[],
): ClarificationMaterialityAudit {
  const response = raw as { results?: ClarificationMaterialityFinding[] };
  if (!Array.isArray(response.results) || response.results.length !== questions.length) {
    throw new Error("Clarification Materiality guard returned the wrong number of results.");
  }
  response.results.forEach((result, index) => {
    if (result.question !== questions[index]?.question) {
      throw new Error(`Clarification Materiality guard changed question ${index + 1}.`);
    }
    if (
      !clarificationMaterialityClassifications.includes(result.classification) ||
      !result.reason.trim()
    ) {
      throw new Error(
        `Clarification Materiality guard omitted a valid classification or rationale for question ${index + 1}.`,
      );
    }
    if (!Array.isArray(result.dependsOnQuestions)) {
      throw new Error(
        `Clarification Materiality guard omitted dependencies for question ${index + 1}.`,
      );
    }
    for (const dependency of result.dependsOnQuestions) {
      if (
        dependency === result.question ||
        !questions.some(({ question }) => question === dependency)
      ) {
        throw new Error(
          `Clarification Materiality guard returned an invalid dependency for question ${index + 1}.`,
        );
      }
    }
  });
  return {
    passed: response.results.every(
      ({ classification, dependsOnQuestions }) =>
        classification === "BLOCKING_PRODUCT_DECISION" &&
        dependsOnQuestions.length === 0,
    ),
    results: response.results,
  };
}

export function extractPrdAuthorityClaims(
  prdMarkdown: string,
): Array<Pick<AuthorityFinding, "claim" | "section">> {
  const targetSections = new Set<AuthorityClaimSection>([
    "Scope",
    "Required Product Behavior",
    "Acceptance Criteria",
  ]);
  const claims: Array<Pick<AuthorityFinding, "claim" | "section">> = [];
  let section: AuthorityClaimSection | null = null;
  let authoritativeSubsection = true;
  for (const line of prdMarkdown.split("\n")) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const title = heading[1] as AuthorityClaimSection;
      section = targetSections.has(title) ? title : null;
      authoritativeSubsection = true;
      continue;
    }
    const subsection = /^#{3,6}\s+(.+?)\s*$/.exec(line);
    if (subsection) {
      authoritativeSubsection = !/(?:unresolved|open decisions?|assumptions?|hypotheses?|recommendations?|حل.?نشده|تصمیم(?:‌|\s)*باز|فرض|پیشنهاد)/iu.test(
        subsection[1] ?? "",
      );
      continue;
    }
    if (!section || !authoritativeSubsection || /^#{1,6}\s+/.test(line)) continue;
    const item = /^\s*(?:[-*+]\s+|\d+[.)]\s+)(.+\S)\s*$/.exec(line);
    if (item?.[1]) claims.push({ claim: item[1], section });
  }
  return claims;
}

export async function auditClarificationAtomicity(
  questions: GuardrailProductQuestion[],
): Promise<SemanticGuardResult<AtomicityAudit>> {
  const prompt = `You are an independent Clarification Atomicity runtime guard. You are not the Product agent and have no Product decision authority.

Inspect each emitted clarification independently. A question is atomic only when one clearly nameable Product decision variable is resolved, all alternatives vary only that property, alternatives are mutually exclusive values of that property, and no option packages multiple independently answerable behaviors. If two alternatives can legitimately both be true, they are not values of one variable. Umbrella labels such as "level of effect" do not merge independent capabilities.

Examples of non-atomic axes include visibility plus ranking plus submission blocking plus rejection; prefill plus editability plus confirmation plus submission; and identity mechanism plus organization scope. A valid multi-option example is one requiredness-policy variable with all-required, all-optional, or configurable-per-item values.

Do not answer the questions, infer Product intent, mention fixtures, or resolve dependencies. Return one result per input question in the same order and copy question text exactly. For a failure, list the independently answerable axes. For a passing question, independentAxes must be empty.

Questions:
${JSON.stringify(questions, null, 2)}`;
  return runSemanticGuard({
    prompt,
    schema: atomicityOutputSchema,
    parse: (raw) => parseAtomicityAudit(raw, questions),
  });
}

export type ClarificationMaterialitySemanticAuditor = (
  input: ClarificationMaterialityInput,
) => Promise<SemanticGuardResult<ClarificationMaterialityAudit>>;

async function runClarificationMaterialitySemanticAudit(
  input: ClarificationMaterialityInput,
): Promise<SemanticGuardResult<ClarificationMaterialityAudit>> {
  const explicitAssumptionsAndOpenDecisions =
    extractExplicitAssumptionsAndOpenDecisions(input.prdMarkdown);
  const prompt = `You are an independent, feature-agnostic Pre-Router Clarification Materiality runtime guard. You have no Product or Design decision authority.

Classify every clarification question independently as exactly one of:

- BLOCKING_PRODUCT_DECISION: answering is materially necessary for Design to proceed without inventing materially different Product intent, behavior, or scope.
- NON_BLOCKING_PRODUCT_UNCERTAINTY: Product owns the decision, but Design can proceed while it remains explicit and bounded.
- DESIGN_OWNED: the unresolved choice belongs to Design and should not be escalated to Product.

Product ownership alone is not blocking. A Product question is blocking only when leaving it unanswered would force Design to invent materially different Product behavior or scope. Capability existence, eligibility, ownership when behavior depends on it, lifecycle semantics, requiredness, persistence needed to define behavior, automatic Product effects, and irreversible transitions can be blocking, but this is not a checklist. Exact labels or taxonomy after the semantic model is established, exact copy, future post-v0 policy, analytics implementation detail, and bounded non-core retention may remain non-blocking. Modal versus popover, exact placement, visual treatment, and interaction mechanics normally belong to Design unless Product authority independently constrains them.

Distinguish durable Product semantics from their immediate UI reflection. If durable capability, eligibility, lifecycle, persistent state, scope, and other material behavior are already established, the choice of how or when that established state is reflected in the current UI—such as removing an item immediately versus leaving it visible until refresh or navigation—is DESIGN_OWNED. It becomes BLOCKING_PRODUCT_DECISION only when the alternatives actually change a Product capability, eligibility, lifecycle, persistent state, scope, or another material behavior rather than merely presenting the same established state differently. Conversely, when the durable suppression, eligibility, or lifecycle semantics themselves remain unresolved, classify that Product decision as blocking when Design would otherwise have to invent the behavior. Judge the semantic consequence of the alternatives, not presentation wording alone.

A hypothetical additional Product capability or effect is not blocking merely because adding it would materially change behavior. If the authorized PM Intent and already-established Product behavior can be fully specified without introducing that extra effect, classify a question about whether to add it as NON_BLOCKING_PRODUCT_UNCERTAINTY and keep the possible future effect explicit and bounded. Do not infer or establish the answer "no." If PM Intent explicitly requires the effect but its Product semantics remain unresolved, classify the necessary decision as BLOCKING_PRODUCT_DECISION. Likewise, when the authorized core flow itself cannot be specified without choosing between materially different behaviors, the decision remains blocking.

Apply an observable-Product-consequence test to unresolved data/entity association, storage identity, and record-model choices. The existence of multiple possible durable models does not itself make the choice blocking. Classify it as NON_BLOCKING_PRODUCT_UNCERTAINTY when the required Product capability, meaning, effects, scope, lifecycle, eligibility, and acceptance behavior remain the same across those models and Design can proceed without choosing among them. Classify it as BLOCKING_PRODUCT_DECISION when the identity or association choice changes observable Product semantics—for example who owns or can access the state, what it applies to, how it persists or is reused, when it changes, or what behavior and acceptance criteria Design must represent. Preserve genuinely Product-critical identity decisions as blocking; judge consequences, not the technical durability or structural wording of the alternatives.

The absence of authority for a detail does not prove that resolving the detail is necessary for Problem Alignment. In particular, when Draft Authority has rejected or removed an unsupported detail, do not automatically recover that detail as a blocking clarification merely to obtain authority for it. Reassess the question independently using the same observable-consequence and blocking-materiality tests. If the authorized capability can be fully specified without the detail, keep it explicit and bounded as NON_BLOCKING_PRODUCT_UNCERTAINTY rather than promoting it through clarification.

Enforce clarification dependency ordering within the proposed batch. If deciding one question's ownership, materiality, or answerable semantics depends on the answer to another unresolved Product question in the same batch, list the exact upstream question text in dependsOnQuestions. Such a dependent question must be deferred until the upstream authority is revealed and then re-evaluated against the updated authority; do not route both together, answer the dependent question, or prematurely classify it away merely because the upstream answer is not yet known. Use an empty dependsOnQuestions array when the question can be evaluated and routed independently. Dependencies must reference exact question text from this batch and must not reference the question itself.

Use only the supplied PM Intent, current Product context, current PRD, actually revealed human decisions, clarification questions, and explicit open decisions. Current Product context establishes current facts and constraints only. Do not answer any question, infer hidden decisions, mention fixtures, use expected outcomes, or rewrite a question. Return one result per question in the same order, copy question text exactly, and always return dependsOnQuestions.

PM Intent:
${input.pmIntent}

Current Product context:
${JSON.stringify(input.currentProductContext, null, 2)}

Current PRD:
${input.prdMarkdown}

Actually revealed human Product decisions:
${JSON.stringify(input.humanDecisions, null, 2)}

Product clarification questions:
${JSON.stringify(input.questions, null, 2)}

Explicit Assumptions/Open Decisions extracted from the PRD:
${JSON.stringify(explicitAssumptionsAndOpenDecisions, null, 2)}`;
  return runSemanticGuard({
    prompt,
    schema: clarificationMaterialityOutputSchema,
    parse: (raw) => parseClarificationMaterialityAudit(raw, input.questions),
  });
}

function clarificationMaterialityInputKey(
  input: ClarificationMaterialityInput,
): string {
  return digest(
    JSON.stringify({
      pmIntent: input.pmIntent,
      currentProductContext: input.currentProductContext,
      prdMarkdown: input.prdMarkdown,
      humanDecisions: input.humanDecisions,
      questions: input.questions,
      explicitAssumptionsAndOpenDecisions:
        extractExplicitAssumptionsAndOpenDecisions(input.prdMarkdown),
    }),
  );
}

export class ClarificationMaterialityGuard {
  private readonly cache = new Map<
    string,
    SemanticGuardResult<ClarificationMaterialityAudit>
  >();
  private readonly totals: ClarificationMaterialityMetrics = {
    clarificationMaterialityAuditCount: 0,
    clarificationMaterialityRejectCount: 0,
    blockingQuestions: 0,
    nonBlockingProductQuestions: 0,
    designOwnedQuestions: 0,
    clarificationMaterialityRepairCount: 0,
    semanticAuditCallCount: 0,
    cacheHits: 0,
  };

  constructor(
    private readonly semanticAuditor: ClarificationMaterialitySemanticAuditor =
      runClarificationMaterialitySemanticAudit,
  ) {}

  get metrics(): ClarificationMaterialityMetrics {
    return { ...this.totals };
  }

  recordRepairAttempt(): void {
    this.totals.clarificationMaterialityRepairCount += 1;
  }

  async audit(
    input: ClarificationMaterialityInput,
  ): Promise<ClarificationMaterialityGuardResult> {
    this.totals.clarificationMaterialityAuditCount += 1;
    const key = clarificationMaterialityInputKey(input);
    const cached = this.cache.get(key);
    const semanticResult = cached ?? (await this.semanticAuditor(input));
    if (cached) this.totals.cacheHits += 1;
    else {
      this.totals.semanticAuditCallCount += 1;
      this.cache.set(key, semanticResult);
    }

    const audit = semanticResult.audit;
    const blocking = audit.results.filter(
      ({ classification }) => classification === "BLOCKING_PRODUCT_DECISION",
    ).length;
    const nonBlocking = audit.results.filter(
      ({ classification }) => classification === "NON_BLOCKING_PRODUCT_UNCERTAINTY",
    ).length;
    const designOwned = audit.results.filter(
      ({ classification }) => classification === "DESIGN_OWNED",
    ).length;
    this.totals.blockingQuestions += blocking;
    this.totals.nonBlockingProductQuestions += nonBlocking;
    this.totals.designOwnedQuestions += designOwned;
    this.totals.clarificationMaterialityRejectCount += nonBlocking + designOwned;

    return {
      threadId: cached ? null : semanticResult.threadId,
      audit,
      usage: cached ? null : semanticResult.usage,
      isolation: semanticResult.isolation,
      instrumentation: {
        cached: cached !== undefined,
        semanticAuditCallCount: cached ? 0 : 1,
      },
    };
  }
}

export type AuthoritySemanticAuditCase = AuthorityClaimSidecar & {
  claimIndex: number;
  citedAuthorities: AuthorityLedgerItem[];
};

export type AuthoritySemanticVerdict = {
  claimIndex: number;
  necessaryImplication: boolean;
  validPromotion: boolean;
  reason: string;
};

type AuthoritySemanticAudit = { verdicts: AuthoritySemanticVerdict[] };

export type AuthoritySemanticAuditor = (
  claims: AuthoritySemanticAuditCase[],
  currentProductContext: Array<{ url: string; title: string; context: string }>,
) => Promise<SemanticGuardResult<AuthoritySemanticAudit>>;

function parseAuthorityDelta(
  raw: unknown,
  expected: AuthoritySemanticAuditCase[],
): AuthoritySemanticAudit {
  const response = raw as { verdicts?: AuthoritySemanticVerdict[] };
  if (!Array.isArray(response.verdicts) || response.verdicts.length !== expected.length) {
    throw new Error("Authority delta guard returned the wrong number of verdicts.");
  }
  response.verdicts.forEach((verdict, index) => {
    if (verdict.claimIndex !== expected[index]?.claimIndex) {
      throw new Error(`Authority delta guard changed or reordered claim ${index + 1}.`);
    }
    if (!verdict.reason.trim()) {
      throw new Error(`Authority delta guard omitted rationale for claim ${index + 1}.`);
    }
  });
  return { verdicts: response.verdicts };
}

async function runAuthoritySemanticAudit(
  claims: AuthoritySemanticAuditCase[],
  currentProductContext: Array<{ url: string; title: string; context: string }>,
): Promise<SemanticGuardResult<AuthoritySemanticAudit>> {
  const prompt = `You are an independent claim-level Draft and Reconciliation Authority guard. You have no Product decision authority.

For each claim, inspect only whether its cited authority ledger items establish that exact intended claim. Do not use uncited authority, general knowledge, the surrounding PRD, or plausibility. Current Product context is current fact/constraint evidence only and cannot authorize intended eligibility, permissions, scope, channels, lifecycle, submission consequences, persistence, or automation behavior.

For a derived claim, apply: "If every cited authority were true, could this claim still legitimately be false?" For current-product inheritance also apply: "If the current-product rule were true, could the new capability legitimately use a different rule?" If yes, validPromotion=false and necessaryImplication=false. Requiredness does not establish submission blocking. Future reuse does not establish historical immutability. Automation capability does not establish trigger timing. Current internal/link-out behavior or current permissions do not automatically govern a new capability.

For a direct claim, validPromotion=true only when the cited statement itself establishes the claim. For a derived claim, validPromotion=true only when necessaryImplication=true. Do not answer Product questions or invent authority. Return one verdict per claim in order and copy claimIndex exactly.

Cited claim-level inputs:
${JSON.stringify(claims, null, 2)}

Current Product context (non-authoritative for intended change):
${JSON.stringify(currentProductContext, null, 2)}`;
  return runSemanticGuard({
    prompt,
    schema: authorityDeltaOutputSchema,
    parse: (raw) => parseAuthorityDelta(raw, claims),
  });
}

function authoritySource(items: AuthorityLedgerItem[]): string {
  return items
    .map((item) => `${item.id}: ${item.question ? `${item.question} -> ` : ""}${item.statement}`)
    .join(" | ");
}

function claimIdentity(claim: AuthorityClaimSidecar): string {
  return [
    claim.section,
    normalizedText(claim.claim),
    [...new Set(claim.authorityRefs)].sort().join(","),
    claim.authorityType,
    String(claim.derived),
  ].join("\u0000");
}

function authorityFingerprint(items: AuthorityLedgerItem[]): string {
  return digest(
    JSON.stringify(
      [...items]
        .sort((left, right) => left.id.localeCompare(right.id))
        .map(({ id, kind, statement, question }) => ({ id, kind, statement, question })),
    ),
  );
}

function deterministicRejection(
  claim: AuthorityClaimSidecar,
  reason: string,
): AuthorityFinding {
  return {
    claim: claim.claim,
    section: claim.section,
    authorityStatus: "unsupported",
    authoritySource: claim.authorityRefs.length
      ? `Cited ledger IDs: ${claim.authorityRefs.join(", ")}`
      : "No authorityRefs supplied.",
    necessaryImplication: false,
    validPromotion: false,
    reason,
    authorityRefs: [...claim.authorityRefs],
    verdictSource: "deterministic",
  };
}

function validateAuthorityRefs(
  claim: AuthorityClaimSidecar,
  cited: AuthorityLedgerItem[],
): string | null {
  if (claim.authorityRefs.length === 0) {
    return "An authoritative intended claim has no authorityRefs.";
  }
  if (cited.length !== new Set(claim.authorityRefs).size) {
    return "One or more authorityRefs do not exist in the current in-run ledger.";
  }
  if (claim.authorityType === "explicit_intent" && cited.some((item) => item.kind !== "pm_intent")) {
    return "explicit_intent may cite only PM Intent ledger items.";
  }
  if (
    claim.authorityType === "human_decision" &&
    cited.some((item) => item.kind !== "human_decision")
  ) {
    return "human_decision may cite only revealed human-decision ledger items.";
  }
  if (claim.authorityType === "necessary_implication" && !claim.derived) {
    return "necessary_implication requires derived=true.";
  }
  if (
    claim.derived &&
    claim.authorityType !== "necessary_implication" &&
    claim.authorityType !== "current_product_constraint"
  ) {
    return "A derived claim must use necessary_implication or current_product_constraint.";
  }
  if (claim.authorityType === "current_product_constraint" && !claim.derived) {
    return "Current Product cannot directly authorize new intended behavior; the claim must be a necessary derivation.";
  }
  return null;
}

export class AuthorityLedgerGuard {
  private readonly exactCache = new Map<string, AuthorityFinding>();
  private readonly portableCache = new Map<
    string,
    { authorityFingerprint: string; finding: AuthorityFinding }
  >();
  private readonly seenClaims = new Set<string>();
  private readonly totals: AuthorityGuardMetrics = {
    auditInvocations: 0,
    semanticAuditCallCount: 0,
    semanticClaimsSubmitted: 0,
    cacheHits: 0,
    claimsChecked: 0,
    deterministicVerdicts: 0,
    claimsRecheckedAfterRepair: 0,
  };

  constructor(private readonly semanticAuditor: AuthoritySemanticAuditor = runAuthoritySemanticAudit) {}

  get metrics(): AuthorityGuardMetrics {
    return { ...this.totals };
  }

  async audit(input: {
    ledger: AuthorityLedger;
    claims: AuthorityClaimSidecar[];
    currentProductContext: Array<{ url: string; title: string; context: string }>;
    prdMarkdown: string;
    phase: "initial" | "repair" | "reconciliation";
  }): Promise<AuthorityGuardResult> {
    this.totals.auditInvocations += 1;
    const expected = extractPrdAuthorityClaims(input.prdMarkdown);
    const expectedKeys = new Set(expected.map((claim) => `${claim.section}\u0000${claim.claim}`));
    const sidecarByKey = new Map<string, AuthorityClaimSidecar>();
    const duplicateKeys = new Set<string>();
    for (const claim of input.claims) {
      const key = `${claim.section}\u0000${claim.claim}`;
      if (sidecarByKey.has(key)) duplicateKeys.add(key);
      else sidecarByKey.set(key, claim);
    }

    const orderedClaims: AuthorityClaimSidecar[] = expected.map(
      (claim) =>
        sidecarByKey.get(`${claim.section}\u0000${claim.claim}`) ?? {
          ...claim,
          authorityRefs: [],
          authorityType: "necessary_implication",
          derived: true,
        },
    );
    orderedClaims.push(
      ...input.claims.filter(
        (claim) => !expectedKeys.has(`${claim.section}\u0000${claim.claim}`),
      ),
    );

    const ledgerById = new Map(input.ledger.items.map((item) => [item.id, item]));
    const findings = new Map<number, AuthorityFinding>();
    const delta: AuthoritySemanticAuditCase[] = [];
    let cacheHits = 0;
    let deterministicVerdicts = 0;
    const claimsRecheckedAfterRepair: string[] = [];

    for (const [index, claim] of orderedClaims.entries()) {
      const sidecarKey = `${claim.section}\u0000${claim.claim}`;
      const cited = [...new Set(claim.authorityRefs)]
        .map((id) => ledgerById.get(id))
        .filter((item): item is AuthorityLedgerItem => item !== undefined);
      const identity = claimIdentity(claim);
      const fingerprint = authorityFingerprint(cited);
      const exactKey = `${input.ledger.version}\u0000${identity}\u0000${fingerprint}`;
      let deterministicReason: string | null = null;
      if (!expectedKeys.has(sidecarKey)) {
        deterministicReason = "The authority sidecar claim does not exist as an authoritative PRD claim.";
      } else if (duplicateKeys.has(sidecarKey)) {
        deterministicReason = "The authoritative PRD claim appears more than once in the sidecar.";
      } else if (!sidecarByKey.has(sidecarKey)) {
        deterministicReason = "The authoritative PRD claim is missing from the sidecar.";
      } else {
        deterministicReason = validateAuthorityRefs(claim, cited);
      }
      if (deterministicReason) {
        deterministicVerdicts += 1;
        const finding = deterministicRejection(claim, deterministicReason);
        findings.set(index, finding);
        this.exactCache.set(exactKey, finding);
        this.portableCache.set(identity, { authorityFingerprint: fingerprint, finding });
        this.seenClaims.add(`${claim.section}\u0000${normalizedText(claim.claim)}`);
        continue;
      }

      const exact = this.exactCache.get(exactKey);
      const portable = this.portableCache.get(identity);
      const cached = exact ??
        (portable?.authorityFingerprint === fingerprint ? portable.finding : undefined);
      if (cached) {
        cacheHits += 1;
        findings.set(index, { ...cached, verdictSource: "cache" });
        this.exactCache.set(exactKey, cached);
        this.seenClaims.add(`${claim.section}\u0000${normalizedText(claim.claim)}`);
        continue;
      }

      const semanticKey = `${claim.section}\u0000${normalizedText(claim.claim)}`;
      if (input.phase === "repair" && this.seenClaims.has(semanticKey)) {
        claimsRecheckedAfterRepair.push(claim.claim);
      }
      this.seenClaims.add(semanticKey);
      delta.push({ ...claim, claimIndex: index, citedAuthorities: cited });
    }

    let semanticResult: SemanticGuardResult<AuthoritySemanticAudit> | null = null;
    if (delta.length > 0) {
      semanticResult = await this.semanticAuditor(delta, input.currentProductContext);
      this.totals.semanticAuditCallCount += 1;
      this.totals.semanticClaimsSubmitted += delta.length;
      const verdictByIndex = new Map(
        semanticResult.audit.verdicts.map((verdict) => [verdict.claimIndex, verdict]),
      );
      for (const item of delta) {
        const verdict = verdictByIndex.get(item.claimIndex);
        if (!verdict) throw new Error(`Authority delta audit omitted claim ${item.claimIndex}.`);
        const cited = item.citedAuthorities;
        const validPromotion = item.derived
          ? verdict.validPromotion && verdict.necessaryImplication
          : verdict.validPromotion;
        const status: AuthorityStatus = validPromotion
          ? item.derived
            ? "necessary_implication"
            : cited.some((authority) => authority.kind === "human_decision")
              ? "human_decision"
              : "explicit_intent"
          : "unsupported";
        const finding: AuthorityFinding = {
          claim: item.claim,
          section: item.section,
          authorityStatus: status,
          authoritySource: authoritySource(cited),
          necessaryImplication: item.derived && verdict.necessaryImplication,
          validPromotion,
          reason: verdict.reason,
          authorityRefs: [...item.authorityRefs],
          verdictSource: "semantic_audit",
        };
        findings.set(item.claimIndex, finding);
        const identity = claimIdentity(item);
        const fingerprint = authorityFingerprint(cited);
        const exactKey = `${input.ledger.version}\u0000${identity}\u0000${fingerprint}`;
        this.exactCache.set(exactKey, finding);
        this.portableCache.set(identity, { authorityFingerprint: fingerprint, finding });
      }
    }

    const orderedFindings = orderedClaims.map((_, index) => {
      const finding = findings.get(index);
      if (!finding) throw new Error(`Authority guard omitted internal claim ${index}.`);
      return finding;
    });
    const instrumentation: AuthorityAuditInstrumentation = {
      authorityStateVersion: input.ledger.version,
      claimsChecked: orderedClaims.length,
      semanticAuditCallCount: delta.length > 0 ? 1 : 0,
      semanticClaimsSubmitted: delta.length,
      cacheHits,
      deterministicVerdicts,
      claimsRecheckedAfterRepair,
    };
    this.totals.cacheHits += cacheHits;
    this.totals.claimsChecked += orderedClaims.length;
    this.totals.deterministicVerdicts += deterministicVerdicts;
    this.totals.claimsRecheckedAfterRepair += claimsRecheckedAfterRepair.length;
    return {
      threadId: semanticResult?.threadId ?? null,
      audit: {
        passed: orderedFindings.every((claim) => claim.validPromotion),
        claims: orderedFindings,
      },
      usage: semanticResult?.usage ?? null,
      isolation:
        semanticResult?.isolation ?? {
          workingDirectoryWasEmpty: true,
          workingDirectoryUnchanged: true,
          networkAccessEnabled: false,
          passed: true,
        },
      instrumentation,
    };
  }
}

export function extractExplicitAssumptionsAndOpenDecisions(
  prdMarkdown: string,
): string[] {
  const entries: string[] = [];
  let inRelevantSection = false;
  for (const line of prdMarkdown.split("\n")) {
    const heading = /^#{2,6}\s+(.+?)\s*$/.exec(line);
    if (heading) {
      inRelevantSection =
        /(?:open decisions?|assumptions?|unresolved|تصمیم(?:‌|\s)*باز|فرض|حل.?نشده)/iu.test(
          heading[1] ?? "",
        );
      continue;
    }
    if (!inRelevantSection) continue;
    const item = /^\s*(?:[-*+]\s+|\d+[.)]\s+)(.+\S)\s*$/.exec(line);
    if (item?.[1]) entries.push(item[1]);
  }
  return entries;
}

function parseMaterialDecisionCoverageAudit(
  raw: unknown,
): MaterialDecisionCoverageAudit {
  const response = raw as Partial<MaterialDecisionCoverageAudit>;
  if (
    typeof response.aligned !== "boolean" ||
    !Array.isArray(response.blockers) ||
    !Array.isArray(response.nonBlockingOpenDecisions)
  ) {
    throw new Error("Material Decision Coverage guard returned an invalid result shape.");
  }
  for (const [index, blocker] of response.blockers.entries()) {
    if (
      !blocker ||
      typeof blocker.boundary !== "string" ||
      !blocker.boundary.trim() ||
      typeof blocker.reason !== "string" ||
      !blocker.reason.trim()
    ) {
      throw new Error(`Material Decision Coverage blocker ${index + 1} is incomplete.`);
    }
    if (blocker.owner !== "product" || !blocker.material || !blocker.blocking) {
      throw new Error(
        `Material Decision Coverage blocker ${index + 1} is not Product-owned, material, and blocking.`,
      );
    }
  }
  for (const [index, decision] of response.nonBlockingOpenDecisions.entries()) {
    if (
      !decision ||
      typeof decision.boundary !== "string" ||
      !decision.boundary.trim() ||
      typeof decision.reason !== "string" ||
      !decision.reason.trim()
    ) {
      throw new Error(
        `Material Decision Coverage non-blocking decision ${index + 1} is incomplete.`,
      );
    }
  }
  if (response.aligned !== (response.blockers.length === 0)) {
    throw new Error(
      "Material Decision Coverage aligned verdict is inconsistent with its blockers.",
    );
  }
  return {
    aligned: response.aligned,
    blockers: response.blockers,
    nonBlockingOpenDecisions: response.nonBlockingOpenDecisions,
  };
}

export type AlignmentSemanticAuditor = (
  input: MaterialDecisionCoverageInput,
) => Promise<SemanticGuardResult<MaterialDecisionCoverageAudit>>;

async function runMaterialDecisionCoverageSemanticAudit(
  input: MaterialDecisionCoverageInput,
): Promise<SemanticGuardResult<MaterialDecisionCoverageAudit>> {
  const explicitAssumptionsAndOpenDecisions =
    extractExplicitAssumptionsAndOpenDecisions(input.prdMarkdown);
  const prompt = `You are an independent, feature-agnostic Pre-Alignment Material Decision Coverage runtime guard. You have no Product or Design decision authority.

The Product agent proposes that the problem is aligned. Decide only this: could Design proceed from the current PRD without inventing a material Product behavior, boundary, or decision?

Apply the same blocking-materiality principle used before clarification routing. Report a blocker only when all conditions hold: the unresolved boundary is Product-owned; it is material to core semantics, scope, lifecycle, eligibility, or acceptance behavior; and leaving it unresolved would force Design to invent materially different Product intent or behavior. Product ownership alone is not blocking. For every unresolved Product-owned item, ask whether Design can proceed while keeping it explicit and bounded, without selecting materially different Product behavior. If yes, report it as a nonBlockingOpenDecision and do not invent its answer.

An unresolved detail within an already-established Product model is non-blocking when different answers would not change the capability, scope, eligibility, lifecycle, persistent state, or acceptance semantics that Design must honor. For example, exact members, labels, or ordering of an already-authorized bounded option set may remain Product-owned and unresolved when its selection semantics and effects are established. By contrast, whether the option set exists, who can use it, what selecting it means, or what Product effect it causes remains blocking when unresolved and material. Do not block on Design-owned choices, sufficiently bounded dependency-owned downstream policy, non-core lifecycle edge cases, or every explicit open item. Preserve those as nonBlockingOpenDecisions when useful.

Remain an independent completeness backstop: audit both explicit open decisions and material omissions, and reject alignment when an omitted or explicit unresolved core boundary would still force Design to invent material Product behavior. Current Product Knowledge establishes only current facts and constraints; it cannot authorize intended behavior for the new capability. PM Intent and the actually revealed human decisions are the only Product authority here. Do not answer unresolved questions, propose a preferred answer, infer hidden decisions, or speculate about fixtures. Do not use a feature-specific checklist.

Every blockers item must be owner=product, material=true, and blocking=true. aligned must be true exactly when blockers is empty.

PM Intent:
${input.pmIntent}

Current Product context (current facts/constraints only):
${JSON.stringify(input.currentProductContext, null, 2)}

Current PRD:
${input.prdMarkdown}

Actually revealed human Product decisions:
${JSON.stringify(input.humanDecisions, null, 2)}

Explicit Assumptions/Open Decisions extracted from the PRD:
${JSON.stringify(explicitAssumptionsAndOpenDecisions, null, 2)}`;
  return runSemanticGuard({
    prompt,
    schema: materialDecisionCoverageOutputSchema,
    parse: parseMaterialDecisionCoverageAudit,
  });
}

function alignmentInputKey(input: MaterialDecisionCoverageInput): string {
  return digest(
    JSON.stringify({
      pmIntent: input.pmIntent,
      currentProductContext: input.currentProductContext,
      prdMarkdown: input.prdMarkdown,
      humanDecisions: input.humanDecisions,
      explicitAssumptionsAndOpenDecisions:
        extractExplicitAssumptionsAndOpenDecisions(input.prdMarkdown),
    }),
  );
}

export class MaterialDecisionCoverageGuard {
  private readonly cache = new Map<
    string,
    SemanticGuardResult<MaterialDecisionCoverageAudit>
  >();
  private readonly totals: AlignmentGuardMetrics = {
    alignmentAuditCount: 0,
    alignmentRejectCount: 0,
    blockersReported: 0,
    nonBlockingOpenDecisions: 0,
    alignmentRepairCount: 0,
    semanticAuditCallCount: 0,
    cacheHits: 0,
  };

  constructor(
    private readonly semanticAuditor: AlignmentSemanticAuditor =
      runMaterialDecisionCoverageSemanticAudit,
  ) {}

  get metrics(): AlignmentGuardMetrics {
    return { ...this.totals };
  }

  recordRepairAttempt(): void {
    this.totals.alignmentRepairCount += 1;
  }

  async audit(input: MaterialDecisionCoverageInput): Promise<AlignmentGuardResult> {
    this.totals.alignmentAuditCount += 1;
    const key = alignmentInputKey(input);
    const cached = this.cache.get(key);
    const result = cached ?? (await this.semanticAuditor(input));
    if (cached) this.totals.cacheHits += 1;
    else {
      this.totals.semanticAuditCallCount += 1;
      this.cache.set(key, result);
    }
    if (!result.audit.aligned) this.totals.alignmentRejectCount += 1;
    this.totals.blockersReported += result.audit.blockers.length;
    this.totals.nonBlockingOpenDecisions +=
      result.audit.nonBlockingOpenDecisions.length;
    return {
      ...result,
      instrumentation: {
        cached: cached !== undefined,
        semanticAuditCallCount: cached ? 0 : 1,
      },
    };
  }
}

export function alignmentRepairPrompt(
  audit: MaterialDecisionCoverageAudit,
): string {
  const blockers = audit.blockers
    .filter(
      (blocker) =>
        blocker.owner === "product" && blocker.material && blocker.blocking,
    )
    .map(({ boundary, reason }) => ({ boundary, reason }));
  return `Runtime Pre-Alignment Material Decision Coverage validation rejected the proposed Problem Alignment.

Unresolved material Product boundaries:
${JSON.stringify(blockers, null, 2)}

Do not invent or select answers for these boundaries. Continue the same PRD Draft + Clarification workflow in this thread. For each blocker, first use already available authoritative context or a genuinely necessary derivation if one resolves it; otherwise emit the smallest atomic Product clarification needed. Keep status=clarification_required and problemAligned=false while any listed boundary remains blocking. Preserve Design-owned, dependency-owned, and non-material uncertainties as explicit non-blocking open decisions when useful. Do not mention fixtures, hidden answers, or the runtime evaluator. Return the complete structured response again using the same schema.`;
}

export function atomicityRepairPrompt(audit: AtomicityAudit): string {
  const failures = audit.results.filter((result) => !result.atomic);
  return `Runtime Clarification Atomicity validation rejected part of your clarification batch.

Validation findings:
${JSON.stringify(failures, null, 2)}

Reformulate only the rejected clarification questions so each productQuestions item resolves one independently answerable Product decision variable. Split independent axes and package options. Preserve already-atomic questions when still material, preserve the PRD's authority states, and respect dependency ordering and batching. Do not answer any Product question, infer a Product answer, mention fixtures, or add Product decisions. Return the complete structured response again using the same schema.`;
}

export function clarificationMaterialityRepairPrompt(
  audit: ClarificationMaterialityAudit,
): string {
  const suppressedQuestions = audit.results
    .filter(
      ({ classification, dependsOnQuestions }) =>
        classification !== "BLOCKING_PRODUCT_DECISION" &&
        dependsOnQuestions.length === 0,
    )
    .map(({ question, classification, reason }) => ({
      question,
      classification,
      reason,
    }));
  const deferredQuestions = audit.results
    .filter(({ dependsOnQuestions }) => dependsOnQuestions.length > 0)
    .map(({ question, classification, reason, dependsOnQuestions }) => ({
      question,
      classification,
      reason,
      dependsOnQuestions,
    }));
  const blockingQuestions = audit.results
    .filter(
      ({ classification, dependsOnQuestions }) =>
        classification === "BLOCKING_PRODUCT_DECISION" &&
        dependsOnQuestions.length === 0,
    )
    .map(({ question }) => question);
  return `Runtime Pre-Router Clarification Materiality validation suppressed questions that must not be sent to Product.

Suppressed questions:
${JSON.stringify(suppressedQuestions, null, 2)}

Deferred dependent questions that must not be routed in this batch:
${JSON.stringify(deferredQuestions, null, 2)}

Upstream blocking Product questions eligible to route now:
${JSON.stringify(blockingQuestions, null, 2)}

Do not answer or rewrite the suppressed questions into different Product questions. Preserve NON_BLOCKING_PRODUCT_UNCERTAINTY items as explicit, bounded Open Decisions when relevant, and leave DESIGN_OWNED choices open for Design Exploration. Do not answer or suppress deferred questions: remove them only from the current clarification batch, preserve their unresolved dependency explicitly, and re-evaluate them after the listed upstream Product authority is established. Preserve upstream blocking questions without changing their meaning. Then continue PRD reconciliation and reassess Problem Alignment. Alignment Coverage remains the backstop for any material boundary omitted later. This feedback supplies no Product answer or authority. Do not mention fixtures, hidden answers, Router results, or the runtime evaluator. Return the complete structured response again using the same schema.`;
}

export function authorityRepairPrompt(audit: AuthorityAudit): string {
  const failures = audit.claims.filter((claim) => !claim.validPromotion);
  return `Runtime Draft Authority validation found unsupported authoritative promotions in your PRD.

Validation findings:
${JSON.stringify(failures, null, 2)}

Revise only those unsupported promotions: remove them from authoritative claims or preserve them visibly as Unresolved, Assumed, or Open Decisions as appropriate. Keep the non-durable authorityClaims sidecar synchronized with the revised authoritative PRD claims and cite only ledger IDs exposed by the output schema. Do not invent or select Product answers, do not mention fixtures, and do not change established decisions. Preserve valid PRD content and return the complete structured response again using the same schema.`;
}

export type GuardAuditEvent =
  | { guard: "authority"; audit: AuthorityAudit }
  | {
      guard: "clarification_materiality";
      audit: ClarificationMaterialityAudit;
    }
  | { guard: "atomicity"; audit: AtomicityAudit };

export type GuardValidationResult<TResponse> = {
  status:
    | "passed"
    | "authority_validation_failed"
    | "clarification_materiality_validation_failed"
    | "atomicity_validation_failed";
  response: TResponse;
  authorityRepairAttempts: number;
  clarificationMaterialityRepairAttempts: number;
  atomicityRepairAttempts: number;
  events: GuardAuditEvent[];
};

export async function validateProductOutputWithRepairs<TResponse>(input: {
  initialResponse: TResponse;
  getQuestions: (response: TResponse) => GuardrailProductQuestion[];
  auditAuthority: (response: TResponse) => Promise<AuthorityAudit>;
  auditClarificationMateriality?: (
    response: TResponse,
    questions: GuardrailProductQuestion[],
  ) => Promise<ClarificationMaterialityAudit>;
  auditAtomicity: (questions: GuardrailProductQuestion[]) => Promise<AtomicityAudit>;
  repairAuthority: (response: TResponse, audit: AuthorityAudit, attempt: number) => Promise<TResponse>;
  repairClarificationMateriality?: (
    response: TResponse,
    audit: ClarificationMaterialityAudit,
    attempt: number,
  ) => Promise<TResponse>;
  repairAtomicity: (response: TResponse, audit: AtomicityAudit, attempt: number) => Promise<TResponse>;
  maximumRepairAttempts?: number;
}): Promise<GuardValidationResult<TResponse>> {
  const maximumRepairAttempts =
    input.maximumRepairAttempts ?? runtimeGuardrailConfig.maximumRepairAttemptsPerGuard;
  let response = input.initialResponse;
  let authorityRepairAttempts = 0;
  let clarificationMaterialityRepairAttempts = 0;
  let atomicityRepairAttempts = 0;
  const events: GuardAuditEvent[] = [];

  while (true) {
    const authority = await input.auditAuthority(response);
    events.push({ guard: "authority", audit: authority });
    if (!authority.passed) {
      if (authorityRepairAttempts >= maximumRepairAttempts) {
        return {
          status: "authority_validation_failed",
          response,
          authorityRepairAttempts,
          clarificationMaterialityRepairAttempts,
          atomicityRepairAttempts,
          events,
        };
      }
      authorityRepairAttempts += 1;
      response = await input.repairAuthority(response, authority, authorityRepairAttempts);
      continue;
    }

    const questions = input.getQuestions(response);
    if (questions.length === 0) {
      return {
        status: "passed",
        response,
        authorityRepairAttempts,
        clarificationMaterialityRepairAttempts,
        atomicityRepairAttempts,
        events,
      };
    }
    if (input.auditClarificationMateriality) {
      const materiality = await input.auditClarificationMateriality(response, questions);
      events.push({ guard: "clarification_materiality", audit: materiality });
      if (!materiality.passed) {
        if (
          clarificationMaterialityRepairAttempts >= maximumRepairAttempts ||
          !input.repairClarificationMateriality
        ) {
          return {
            status: "clarification_materiality_validation_failed",
            response,
            authorityRepairAttempts,
            clarificationMaterialityRepairAttempts,
            atomicityRepairAttempts,
            events,
          };
        }
        clarificationMaterialityRepairAttempts += 1;
        response = await input.repairClarificationMateriality(
          response,
          materiality,
          clarificationMaterialityRepairAttempts,
        );
        continue;
      }
    }
    const atomicity = await input.auditAtomicity(questions);
    events.push({ guard: "atomicity", audit: atomicity });
    if (atomicity.passed) {
      return {
        status: "passed",
        response,
        authorityRepairAttempts,
        clarificationMaterialityRepairAttempts,
        atomicityRepairAttempts,
        events,
      };
    }
    if (atomicityRepairAttempts >= maximumRepairAttempts) {
      return {
        status: "atomicity_validation_failed",
        response,
        authorityRepairAttempts,
        clarificationMaterialityRepairAttempts,
        atomicityRepairAttempts,
        events,
      };
    }
    atomicityRepairAttempts += 1;
    response = await input.repairAtomicity(response, atomicity, atomicityRepairAttempts);
  }
}

export async function routeAndRevealAfterValidation<TResponse, TRoute, TReveal>(input: {
  validation: GuardValidationResult<TResponse>;
  getQuestions: (response: TResponse) => GuardrailProductQuestion[];
  route: (questions: GuardrailProductQuestion[]) => Promise<TRoute>;
  routeAllowsReveal: (route: TRoute) => boolean;
  reveal: (route: TRoute, response: TResponse) => Promise<TReveal> | TReveal;
}): Promise<
  | { status: "guard_failed"; validation: GuardValidationResult<TResponse> }
  | { status: "route_blocked"; validation: GuardValidationResult<TResponse>; route: TRoute }
  | {
      status: "revealed";
      validation: GuardValidationResult<TResponse>;
      route: TRoute;
      reveal: TReveal;
    }
> {
  if (input.validation.status !== "passed") {
    return { status: "guard_failed", validation: input.validation };
  }
  const route = await input.route(input.getQuestions(input.validation.response));
  if (!input.routeAllowsReveal(route)) {
    return { status: "route_blocked", validation: input.validation, route };
  }
  const reveal = await input.reveal(route, input.validation.response);
  return { status: "revealed", validation: input.validation, route, reveal };
}
