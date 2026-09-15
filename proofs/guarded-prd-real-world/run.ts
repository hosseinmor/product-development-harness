import { Codex, type ThreadItem, type Usage } from "../../evals/orchestrator/node_modules/@openai/codex-sdk/dist/index.js";
import {
  copyFile,
  mkdir,
  mkdtemp,
  symlink,
  writeFile,
} from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  AuthorityLedgerGuard,
  ClarificationMaterialityGuard,
  MaterialDecisionCoverageGuard,
  auditClarificationAtomicity,
  createAuthorityLedger,
  extendAuthorityLedger,
  productChildAuthorityClaimsSchema,
  runtimeGuardrailConfig,
  validateProductOutputWithRepairs,
  type AlignmentGuardResult,
  type AtomicityAudit,
  type AuthorityClaimSidecar,
  type AuthorityGuardResult,
  type AuthorityLedger,
  type ClarificationMaterialityGuardResult,
  type GuardrailProductQuestion,
  type HumanDecision,
  type SemanticGuardResult,
} from "../../runtime/prd/runtime-guardrails.js";
import { codexPrdSemanticAuditor } from "../../runtime/adapters/codex/codex-prd-semantic-auditor.js";
import {
  alignmentRepairPrompt,
  atomicityRepairPrompt,
  authorityRepairPrompt,
  clarificationMaterialityRepairPrompt,
} from "../../evals/orchestrator/eval-runtime-guardrail-composition.js";

const proofDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(proofDirectory, "../..");
const runsDirectory = resolve(proofDirectory, "runs");
const activeRunPath = resolve(proofDirectory, "active-run.json");
const execFileAsync = promisify(execFile);

const pmIntent = `می‌خواهیم کارجو بتواند بر اساس اطلاعات رزومه‌اش، بدون وارد کردن دستی عبارت جست‌وجو یا تنظیم فیلترها، جست‌وجوی شغل انجام دهد و مستقیماً وارد صفحه نتایج متناسب شود.

سیستم باید بر اساس رزومه، مقادیر مناسب برای جست‌وجو مثل keyword، گروه شغلی و فیلترهای مرتبط را تعیین کند.`;

type ProductKnowledgeContext = {
  url: string;
  title: string;
  context: string;
};

const liveCurrentProductContext: ProductKnowledgeContext[] = [
  {
    url: "http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/job-search/0_overview/",
    title: "نمای حوزه: جستجوی شغل",
    context:
      "Retrieved live from the internal Product Knowledge site on 2026-09-14. The page is explicitly marked Draft. It identifies search, filters, job alerts, and smart recommendations as the job-search domain, but its detailed search/filter/recommendation documents are not yet written. This absence does not establish that a behavior is absent from the product.",
  },
  {
    url: "http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/cv/0_overview/",
    title: "نمای حوزه: رزومه",
    context:
      "Retrieved live from the internal Product Knowledge site on 2026-09-14; status Confirmed. A Candidate has a one-to-one Resume record. The Resume is a structured input to matching, Candidate search, recommended resumes, job recommendations, and AI models. Candidate identity/base fields and Resume data are separate records. The Candidate owns resume creation and editing.",
  },
  {
    url: "http://platform-eng.pages.git.jvoffice.ir/documents/jobvision/contents/cv/entity-cv/",
    title: "موجودیت رزومه",
    context:
      "Retrieved live from the internal Product Knowledge site on 2026-09-14; status Confirmed. Relevant structured inputs include preferred job categories on the Candidate record; Candidate city; desired salary range; work-history entries with standardized job category, industry, seniority, and standardized job title; skills; and a calculated Resume-by-job-category record with years of experience and whether the category is preferred. Each Candidate has exactly one Resume record, with separate Persian and English completeness values.",
  },
  {
    url: "https://jobvision.ir/jobs",
    title: "Current JobVision job-results surface — direct UI observation",
    context:
      "Directly observed in the current logged-in session on 2026-09-14. The results surface visibly exposes manual title/company keyword, job category, city, publication time, remote work, cooperation type, internship, salary, work experience, seniority, benefits, industry, disability-employment, and military-service filters, plus result sorting. The unfiltered state showed a result list and an AI-recommended insertion based on user activity. This observation establishes only the visible controls and rendered state; it does not establish hidden matching rules, persistence, eligibility, URL/query semantics, or the proposed Resume-derived search behavior.",
  },
];

type ChildResponse = {
  status: "clarification_required" | "problem_aligned" | "blocked";
  problemAligned: boolean;
  alignmentRationale: string;
  productQuestions: GuardrailProductQuestion[];
  retrievedProductKnowledge: ProductKnowledgeContext[];
  prdMarkdown: string;
  authorityClaims: AuthorityClaimSidecar[];
};

type GuardRecord =
  | { productTurn: number; sequence: number; guard: "authority"; result: AuthorityGuardResult }
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
  | { productTurn: number; sequence: number; guard: "alignment"; result: AlignmentGuardResult };

type RepairRecord = {
  guard: "authority" | "clarification_materiality" | "atomicity";
  attempt: number;
  prompt: string;
  response: ChildResponse;
  items: ThreadItem[];
  usage: Usage | null;
};

type ProductTurnRecord = {
  number: number;
  phase: "initial" | "reconciliation" | "alignment_repair";
  prompt: string;
  initialResponse: ChildResponse;
  guardedResponse: ChildResponse;
  items: ThreadItem[];
  usage: Usage | null;
  repairs: RepairRecord[];
  validationStatus: string;
};

type RunState = {
  kind: "guarded-real-world-prd-proof";
  runId: string;
  runDirectory: string;
  workspaceDirectory: string;
  childCodexHome: string;
  childThreadId: string;
  pmIntent: string;
  currentProductContext: ProductKnowledgeContext[];
  authorityLedger: AuthorityLedger;
  productTurns: ProductTurnRecord[];
  guardRecords: GuardRecord[];
  status: "running" | "awaiting_pm" | "problem_aligned" | "blocked";
  currentResponse: ChildResponse | null;
  failure: string | null;
};

type HumanAnswerInput = { question: string; answer: string };
type ContextCorrectionInput = {
  question: string;
  correction: string;
  finding: string;
};
type PmInputBundle = {
  productDecisions: HumanAnswerInput[];
  contextCorrections: ContextCorrectionInput[];
};

type GuardSession = {
  authority: AuthorityLedgerGuard;
  clarificationMateriality: ClarificationMaterialityGuard;
  materialDecisionCoverage: MaterialDecisionCoverageGuard;
};

function createGuardSession(): GuardSession {
  return {
    authority: new AuthorityLedgerGuard(codexPrdSemanticAuditor),
    clarificationMateriality: new ClarificationMaterialityGuard(
      codexPrdSemanticAuditor,
    ),
    materialDecisionCoverage: new MaterialDecisionCoverageGuard(
      codexPrdSemanticAuditor,
    ),
  };
}

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

function initialPrompt(): string {
  return `You are the Product Child for the first real-world Guarded / High-assurance execution of the Job Vision Product Development Harness. This is real Product work with a real PM, not an eval, fixture, smoke case, or synthetic exercise.

Start with AGENTS.md, then read shared-harness-contract.md, workflows/prd-draft-clarification.md, and artifacts/prd.md in this isolated workspace. Execute the normal PRD Draft + Clarification workflow faithfully.

The parent retrieved the following task-scoped current-product context live from Job Vision Product Knowledge behind the VPN and, because the job-search Product Knowledge page is incomplete, made a narrowly grounded direct UI observation. Use only the supplied context for current-product claims. Do not infer absence from missing documentation, and do not invent stronger semantics than the direct observation establishes.

${JSON.stringify(liveCurrentProductContext, null, 2)}

Do not read or rely on any previous Resume-based Job Search PRD, prior run, transcript, eval, fixture, hidden answer, or expected result. No Product clarification answer exists until the PM answers a question in this run.

PM Intent:

${pmIntent}

Produce a substantive v0 PRD, normalize it, run the ambiguity scan, and resolve uncertainty in Harness order. Preserve all authority boundaries. The imperative PM Intent establishes only what it actually says. Current Product context establishes current facts, not intended behavior for the new capability.

Business Outcome is not yet established. Proactively reason about a small number of plausible, explicitly non-authoritative candidate Business Outcomes when there is a defensible basis, recommend one briefly when justified, and ask the PM to confirm/refine/reject it only if that Product decision is materially required for Problem Alignment. Do not silently promote a candidate.

Each Product clarification must resolve exactly one independently answerable Product decision and must be blocking for Problem Alignment. Do not ask Design-owned or non-blocking questions. Do not mention guards or instrumentation in Product-facing text.

If clarification is required, return status=clarification_required and problemAligned=false with the smallest coherent atomic question batch. If no blocking Product ambiguity remains, return status=problem_aligned and problemAligned=true with a complete contract-compliant PRD. Use status=blocked only for a concrete technical/context blocker. The parent persists the final PRD.`;
}

function reconciliationPrompt(input: PmInputBundle): string {
  const renderedDecisions = input.productDecisions
    .map(({ question, answer }) => `سؤال Product Child:\n${question}\n\nپاسخ واقعی PM:\n${answer}`)
    .join("\n\n---\n\n");
  const renderedCorrections = input.contextCorrections
    .map(
      ({ question, correction }) =>
        `سؤالی که نباید به PM می‌رسید:\n${question}\n\nاصلاح تفسیر PM:\n${correction}`,
    )
    .join("\n\n---\n\n");
  return `The real PM has supplied the following inputs from this run.

Actual Product decisions established by the PM:

${renderedDecisions || "None."}

Corrections to interpretation of already-established PM Intent (not new Product decisions and not new authority-ledger items):

${renderedCorrections || "None."}

Interpret the semantic role of each item before reconciliation. Treat as newly authoritative only the Product decisions listed in the first group. Apply the second group only to correct your reading of the existing PM Intent; do not record it as a separate new Product decision. Do not promote adjacent implications, recommendations, examples, rationale, or common patterns. Continue the same PRD Draft + Clarification workflow in this thread: reconcile the established decisions, remove stale uncertainty, normalize the whole PRD, and reassess remaining material ambiguity. If another blocking Product decision remains, ask the smallest coherent batch of atomic questions. If the PRD is Problem Aligned, return the complete final PRD and only then set status=problem_aligned and problemAligned=true. Do not mention guards or instrumentation.`;
}

function humanDecisions(ledger: AuthorityLedger): HumanDecision[] {
  return ledger.items
    .filter((item) => item.kind === "human_decision")
    .map((item) => ({ question: item.question ?? "", answer: item.statement }));
}

function mergedContext(state: RunState, response: ChildResponse): ProductKnowledgeContext[] {
  return Array.from(
    new Map(
      [...state.currentProductContext, ...response.retrievedProductKnowledge].map((entry) => [
        `${entry.url}\u0000${entry.title}`,
        entry,
      ]),
    ).values(),
  );
}

async function persistState(state: RunState): Promise<void> {
  await writeFile(
    resolve(state.runDirectory, "state.json"),
    `${JSON.stringify(state, null, 2)}\n`,
    "utf8",
  );
  await writeFile(activeRunPath, `${JSON.stringify({ runDirectory: state.runDirectory }, null, 2)}\n`, "utf8");
}

function codexForState(state: RunState): Codex {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  );
  environment.CODEX_HOME = state.childCodexHome;
  return new Codex({ env: environment });
}

function threadOptions(state: RunState) {
  return {
    model: "gpt-5.6-sol",
    modelReasoningEffort: "high" as const,
    workingDirectory: state.workspaceDirectory,
    skipGitRepoCheck: true,
    networkAccessEnabled: false,
    approvalPolicy: "never" as const,
    webSearchMode: "disabled" as const,
  };
}

async function createRun(): Promise<RunState> {
  const startedAt = new Date();
  const runId = `resume-derived-job-search-${startedAt.toISOString().replaceAll(":", "-")}`;
  const runDirectory = resolve(runsDirectory, runId);
  const workspaceDirectory = resolve(runDirectory, "workspace");
  const childCodexHome = await mkdtemp(join(tmpdir(), "harness-real-world-product-child-"));
  await mkdir(resolve(workspaceDirectory, "workflows"), { recursive: true });
  await mkdir(resolve(workspaceDirectory, "artifacts"), { recursive: true });
  await mkdir(resolve(workspaceDirectory, "outputs"), { recursive: true });
  for (const path of [
    "AGENTS.md",
    "shared-harness-contract.md",
    "workflows/prd-draft-clarification.md",
    "artifacts/prd.md",
  ]) {
    await copyFile(resolve(repositoryRoot, path), resolve(workspaceDirectory, path));
  }
  await execFileAsync("git", ["init", "--quiet"], { cwd: workspaceDirectory });
  const config = `
default_permissions = "real_world_product_child"

[permissions.real_world_product_child]
description = "Real Product Child with isolated Harness inputs and no access to prior runs or eval fixtures."

[permissions.real_world_product_child.filesystem]
":minimal" = "read"
${JSON.stringify(workspaceDirectory)} = "read"
${JSON.stringify(resolve(workspaceDirectory, "outputs"))} = "write"

[permissions.real_world_product_child.network]
enabled = false
`;
  await writeFile(resolve(childCodexHome, "config.toml"), config, "utf8");
  const sourceCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
  await symlink(resolve(sourceCodexHome, "auth.json"), resolve(childCodexHome, "auth.json"));

  const initialLedger = createAuthorityLedger(pmIntent);
  const provisional: RunState = {
    kind: "guarded-real-world-prd-proof",
    runId,
    runDirectory,
    workspaceDirectory,
    childCodexHome,
    childThreadId: "",
    pmIntent,
    currentProductContext: liveCurrentProductContext,
    authorityLedger: initialLedger,
    productTurns: [],
    guardRecords: [],
    status: "running",
    currentResponse: null,
    failure: null,
  };
  await persistState(provisional);
  return provisional;
}

async function runGuardedProductTurn(
  state: RunState,
  prompt: string,
  phase: ProductTurnRecord["phase"],
  guards: GuardSession,
): Promise<ChildResponse> {
  const codex = codexForState(state);
  const thread = state.childThreadId
    ? codex.resumeThread(state.childThreadId, threadOptions(state))
    : codex.startThread(threadOptions(state));
  const outputSchema = childOutputSchema(state.authorityLedger);
  const productTurn = state.productTurns.length + 1;
  const initialTurn = await thread.run(prompt, { outputSchema });
  if (!initialTurn.finalResponse) throw new Error("Product Child returned no structured response.");
  if (!state.childThreadId) {
    state.childThreadId = thread.id ?? "";
    if (!state.childThreadId) throw new Error("Product Child thread did not expose an id.");
  }
  const initialResponse = JSON.parse(initialTurn.finalResponse) as ChildResponse;
  const repairs: RepairRecord[] = [];
  let latestItems = initialTurn.items;
  let latestUsage = initialTurn.usage;
  let authorityAuditWithinTurn = 0;

  const validation = await validateProductOutputWithRepairs({
    initialResponse,
    getQuestions: (candidate) => candidate.productQuestions,
    auditAuthority: async (candidate) => {
      const result = await guards.authority.audit({
        ledger: state.authorityLedger,
        claims: candidate.authorityClaims,
        currentProductContext: mergedContext(state, candidate),
        prdMarkdown: candidate.prdMarkdown,
        phase:
          authorityAuditWithinTurn > 0
            ? "repair"
            : phase === "initial"
              ? "initial"
              : "reconciliation",
      });
      authorityAuditWithinTurn += 1;
      state.guardRecords.push({
        productTurn,
        sequence: state.guardRecords.length + 1,
        guard: "authority",
        result,
      });
      return result.audit;
    },
    auditClarificationMateriality: async (candidate, questions) => {
      const result = await guards.clarificationMateriality.audit({
        pmIntent: state.pmIntent,
        currentProductContext: mergedContext(state, candidate),
        prdMarkdown: candidate.prdMarkdown,
        humanDecisions: humanDecisions(state.authorityLedger),
        questions,
      });
      state.guardRecords.push({
        productTurn,
        sequence: state.guardRecords.length + 1,
        guard: "clarification_materiality",
        result,
      });
      return result.audit;
    },
    auditAtomicity: async (questions) => {
      const result = await auditClarificationAtomicity(questions, codexPrdSemanticAuditor);
      state.guardRecords.push({
        productTurn,
        sequence: state.guardRecords.length + 1,
        guard: "atomicity",
        result,
      });
      return result.audit;
    },
    repairAuthority: async (_candidate, audit, attempt) => {
      const repairPrompt = authorityRepairPrompt(audit);
      const repairTurn = await thread.run(repairPrompt, { outputSchema });
      if (!repairTurn.finalResponse) throw new Error("Authority repair returned no response.");
      const response = JSON.parse(repairTurn.finalResponse) as ChildResponse;
      repairs.push({
        guard: "authority",
        attempt,
        prompt: repairPrompt,
        response,
        items: repairTurn.items,
        usage: repairTurn.usage,
      });
      latestItems = [...latestItems, ...repairTurn.items];
      latestUsage = repairTurn.usage;
      return response;
    },
    repairClarificationMateriality: async (_candidate, audit, attempt) => {
      guards.clarificationMateriality.recordRepairAttempt();
      const repairPrompt = clarificationMaterialityRepairPrompt(audit);
      const repairTurn = await thread.run(repairPrompt, { outputSchema });
      if (!repairTurn.finalResponse) throw new Error("Materiality repair returned no response.");
      const response = JSON.parse(repairTurn.finalResponse) as ChildResponse;
      repairs.push({
        guard: "clarification_materiality",
        attempt,
        prompt: repairPrompt,
        response,
        items: repairTurn.items,
        usage: repairTurn.usage,
      });
      latestItems = [...latestItems, ...repairTurn.items];
      latestUsage = repairTurn.usage;
      return response;
    },
    repairAtomicity: async (_candidate, audit, attempt) => {
      const repairPrompt = atomicityRepairPrompt(audit);
      const repairTurn = await thread.run(repairPrompt, { outputSchema });
      if (!repairTurn.finalResponse) throw new Error("Atomicity repair returned no response.");
      const response = JSON.parse(repairTurn.finalResponse) as ChildResponse;
      repairs.push({
        guard: "atomicity",
        attempt,
        prompt: repairPrompt,
        response,
        items: repairTurn.items,
        usage: repairTurn.usage,
      });
      latestItems = [...latestItems, ...repairTurn.items];
      latestUsage = repairTurn.usage;
      return response;
    },
  });

  state.productTurns.push({
    number: productTurn,
    phase,
    prompt,
    initialResponse,
    guardedResponse: validation.response,
    items: latestItems,
    usage: latestUsage,
    repairs,
    validationStatus: validation.status,
  });
  state.currentResponse = validation.response;
  if (validation.status !== "passed") {
    state.status = "blocked";
    state.failure = `Guard validation ended with ${validation.status}.`;
  }
  await persistState(state);
  return validation.response;
}

async function finishOrExpose(state: RunState, guards: GuardSession): Promise<void> {
  if (state.status === "blocked" || !state.currentResponse) {
    await persistState(state);
    return;
  }
  let response = state.currentResponse;
  for (let attempt = 0; attempt < runtimeGuardrailConfig.maximumAlignmentAttempts; attempt += 1) {
    if (response.productQuestions.length > 0 || response.status === "clarification_required") {
      state.status = "awaiting_pm";
      await persistState(state);
      return;
    }
    if (!response.problemAligned || response.status !== "problem_aligned") {
      state.status = "blocked";
      state.failure = "Product Child returned neither a clarification nor a Problem Aligned PRD.";
      await persistState(state);
      return;
    }
    const result = await guards.materialDecisionCoverage.audit({
      pmIntent: state.pmIntent,
      currentProductContext: mergedContext(state, response),
      prdMarkdown: response.prdMarkdown,
      humanDecisions: humanDecisions(state.authorityLedger),
    });
    state.guardRecords.push({
      productTurn: state.productTurns.length,
      sequence: state.guardRecords.length + 1,
      guard: "alignment",
      result,
    });
    if (result.audit.aligned) {
      state.status = "problem_aligned";
      await writeFile(resolve(state.runDirectory, "prd.md"), `${response.prdMarkdown.trim()}\n`, "utf8");
      await persistState(state);
      return;
    }
    if (attempt + 1 >= runtimeGuardrailConfig.maximumAlignmentAttempts) {
      state.status = "blocked";
      state.failure = "Alignment Guard still reported blocking Product boundaries after bounded repair.";
      await persistState(state);
      return;
    }
    guards.materialDecisionCoverage.recordRepairAttempt();
    response = await runGuardedProductTurn(
      state,
      alignmentRepairPrompt(result.audit),
      "alignment_repair",
      guards,
    );
    if (state.failure !== null) return;
  }
}

function validatePmInput(state: RunState, input: PmInputBundle): void {
  const pending = state.currentResponse?.productQuestions ?? [];
  if (input.productDecisions.length + input.contextCorrections.length === 0) {
    throw new Error("No real PM input was supplied.");
  }
  const pendingQuestions = new Set(pending.map(({ question }) => question));
  for (const answer of input.productDecisions) {
    if (!pendingQuestions.has(answer.question)) {
      throw new Error(`Answer does not match a pending Product question: ${answer.question}`);
    }
    if (!answer.answer.trim()) throw new Error(`Empty PM answer for: ${answer.question}`);
  }
  for (const correction of input.contextCorrections) {
    if (!pendingQuestions.has(correction.question)) {
      throw new Error(`Correction does not match a pending Product question: ${correction.question}`);
    }
    if (!correction.correction.trim() || !correction.finding.trim()) {
      throw new Error(`Incomplete PM interpretation correction for: ${correction.question}`);
    }
  }
}

async function continueWithPmInput(
  state: RunState,
  input: PmInputBundle,
  guards: GuardSession,
): Promise<RunState> {
  if (state.status !== "awaiting_pm") {
    throw new Error(`Active proof is not awaiting PM input; current status is ${state.status}.`);
  }
  validatePmInput(state, input);
  state.authorityLedger = extendAuthorityLedger(
    state.authorityLedger,
    input.productDecisions.map(({ question, answer }) => ({ question, answer })),
  );
  await writeFile(
    resolve(state.runDirectory, `pm-input-${state.productTurns.length + 1}.json`),
    `${JSON.stringify(input, null, 2)}\n`,
    "utf8",
  );
  state.status = "running";
  await persistState(state);
  await runGuardedProductTurn(
    state,
    reconciliationPrompt(input),
    "reconciliation",
    guards,
  );
  await finishOrExpose(state, guards);
  return state;
}

async function runInteractive(guards: GuardSession): Promise<RunState> {
  let state = await createRun();
  await runGuardedProductTurn(state, initialPrompt(), "initial", guards);
  await finishOrExpose(state, guards);

  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
  process.stdout.write(
    `${JSON.stringify({ event: "proof_progress", ...conciseOutput(state) })}\n`,
  );
  for await (const line of lines) {
    if (state.status !== "awaiting_pm") break;
    const input = JSON.parse(line) as PmInputBundle;
    state = await continueWithPmInput(state, input, guards);
    process.stdout.write(
      `${JSON.stringify({ event: "proof_progress", ...conciseOutput(state) })}\n`,
    );
    if (state.status !== "awaiting_pm") break;
  }
  lines.close();
  if (state.status === "awaiting_pm") {
    throw new Error("Interactive PM input ended while the proof was awaiting clarification.");
  }
  return state;
}

function conciseOutput(state: RunState) {
  const response = state.currentResponse;
  return {
    runId: state.runId,
    runDirectory: state.runDirectory,
    status: state.status,
    failure: state.failure,
    productTurnCount: state.productTurns.length,
    questions: response?.productQuestions ?? [],
    guardSequence: state.guardRecords.map(({ productTurn, sequence, guard, result }) => ({
      productTurn,
      sequence,
      guard,
      passed:
        guard === "alignment"
          ? result.audit.aligned
          : guard === "authority" || guard === "clarification_materiality" || guard === "atomicity"
            ? result.audit.passed
            : false,
    })),
    prdPath: state.status === "problem_aligned" ? resolve(state.runDirectory, "prd.md") : null,
  };
}

async function main(): Promise<void> {
  await mkdir(runsDirectory, { recursive: true });
  const guards = createGuardSession();
  const answerFlagIndex = process.argv.indexOf("--answers");
  const interactive = process.argv.includes("--interactive");
  if (answerFlagIndex >= 0) {
    throw new Error(
      "--answers cannot preserve in-memory Guard state across PM rounds; use --interactive for a lifecycle-faithful proof.",
    );
  }
  let state: RunState;
  if (interactive) {
    state = await runInteractive(guards);
  } else {
    state = await createRun();
    await runGuardedProductTurn(state, initialPrompt(), "initial", guards);
    await finishOrExpose(state, guards);
  }
  process.stdout.write(`${JSON.stringify(conciseOutput(state), null, 2)}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
