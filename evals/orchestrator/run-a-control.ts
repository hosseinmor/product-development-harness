import { Codex, type ThreadItem, type Usage } from "@openai/codex-sdk";
import {
  routeProductQuestions,
  semanticFixtureRouterConfig,
  type FixtureId,
  type SemanticFixtureRoute,
  type SemanticFixtureRouterResult,
} from "./semantic-fixture-router.js";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
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
import { dirname, join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const runsDirectory = resolve(repositoryRoot, "evals/runs");
const model = "gpt-5.6-sol";
const reasoningEffort = "high";
const maximumTurns = 8;
const defaultRunAReferenceId = "run-a-control-2026-09-08T17-57-49.339Z";
const frozenSnapshotId = "product-knowledge-snapshot-2026-09-07T14-47-41.304Z";
const supersededRunCId = "run-c-solution-shaped-2026-09-09T07-08-22.803Z";
const priorValidRunCId = "run-c-solution-shaped-2026-09-09T07-55-30.935Z";

type RunVariant =
  | "run-a-control"
  | "run-b-no-product-knowledge"
  | "run-c-solution-shaped";

const variantArgument = process.argv.find((argument) =>
  argument.startsWith("--variant="),
);
const referenceRunArgument = process.argv.find((argument) =>
  argument.startsWith("--reference-run-id="),
);
const runAReferenceId =
  referenceRunArgument?.slice("--reference-run-id=".length) ??
  defaultRunAReferenceId;
const runVariant = (variantArgument?.slice("--variant=".length) ??
  "run-a-control") as RunVariant;
if (
  runVariant !== "run-a-control" &&
  runVariant !== "run-b-no-product-knowledge" &&
  runVariant !== "run-c-solution-shaped"
) {
  throw new Error(`Unsupported eval variant: ${runVariant}`);
}
const productKnowledgeAvailable = runVariant !== "run-b-no-product-knowledge";
const runType =
  runVariant === "run-a-control"
    ? "Run A — Control"
    : runVariant === "run-b-no-product-knowledge"
      ? "Run B — No Product Knowledge"
      : "Run C — Solution-shaped Intent";
const childPromptRunType =
  runVariant === "run-c-solution-shaped" ? "this eval run" : runType;

const runAIntent = `کارجو ممکن است یک Job Search مشخص را چند بار در طول زمان بررسی کند تا فرصت‌های شغلی جدید مرتبط با آن را پیدا کند.

وقتی دوباره به همان Search برمی‌گردد، در حال حاضر برایش روشن نیست کدام آگهی‌ها از آخرین باری که این Search را دیده به نتایج اضافه شده‌اند. این موضوع باعث می‌شود برای پیدا کردن فرصت‌های جدید بخشی از نتایجی را که قبلاً دیده دوباره بررسی کند.

می‌خواهیم کارجو بتواند هنگام مواجهه دوباره با همان Search یا نتایج مرتبط با آن، سریع‌تر متوجه فرصت‌های جدیدی شود که از آخرین مراجعه‌اش اضافه شده‌اند و تمرکزش را روی آن‌ها بگذارد.

این نیاز ممکن است در چند touchpoint مختلف از تجربه کارجو مطرح شود و نمی‌خواهیم راه‌حل از ابتدا به یک صفحه یا مسیر خاص محدود شود.

هنوز درباره نحوه نمایش این اطلاعات، تعریف دقیق یک Search یکسان، touchpointهای نهایی، یا رفتار این قابلیت در حالت‌ها و sessionهای مختلف تصمیم نگرفته‌ایم.`;

const runCIntent = `می‌خواهیم در تجربه جستجوی شغل، آگهی‌هایی که از مراجعه قبلی کارجو جدید هستند مشخص شوند.

در صفحه نتایج جستجو یک حالت یا فیلتر «آگهی‌های جدید» اضافه شود تا کارجو بتواند فقط آگهی‌هایی را ببیند که از آخرین مراجعه‌اش اضافه شده‌اند. در لیست عادی نتایج هم بهتر است آگهی‌های جدید به‌صورت مشخص از بقیه قابل تشخیص باشند.

در Recent Search و Saved Search هم می‌توان تعداد آگهی‌های جدید هر جستجو را نشان داد تا کارجو قبل از ورود به نتایج متوجه شود فرصت جدیدی وجود دارد.

هدف این است که کارجو مجبور نباشد هر بار نتایجی را که قبلاً دیده دوباره مرور کند.

جزئیات رفتار این قابلیت و edge caseهای آن هنوز نهایی نشده‌اند.`;

const pmIntent =
  runVariant === "run-c-solution-shaped" ? runCIntent : runAIntent;

const childOutputSchema = {
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
  },
  required: [
    "status",
    "problemAligned",
    "alignmentRationale",
    "productQuestions",
    "retrievedProductKnowledge",
    "prdMarkdown",
  ],
} as const;

type ProductQuestion = {
  question: string;
  whyMaterial: string;
};

type ProductKnowledgeContext = {
  url: string;
  title: string;
  context: string;
};

type ChildResponse = {
  status: "clarification_required" | "problem_aligned" | "blocked";
  problemAligned: boolean;
  alignmentRationale: string;
  productQuestions: ProductQuestion[];
  retrievedProductKnowledge: ProductKnowledgeContext[];
  prdMarkdown: string;
};

type RunStatus =
  | "problem_aligned"
  | "blocked_on_ambiguous_fixture_route"
  | "blocked_on_no_match_fixture_route"
  | "max_turns_reached"
  | "technical_failure";

type RecordedTurn = {
  number: number;
  prompt: string;
  response: ChildResponse | null;
  rawFinalResponse: string;
  items: ThreadItem[];
  usage: Usage | null;
};

type Fixture = {
  id: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
  topic: string;
  answer: string;
};

const fixtures: Fixture[] = [
  {
    id: "A",
    topic: "Search identity",
    answer:
      "Search یکسان بر اساس Keyword/Query نرمال‌شده و Filterهای نرمال‌شده تعیین می‌شود. Sort، Pagination، Saved/Unsaved بودن و touchpoint ورود بخشی از Search identity نیستند.",
  },
  {
    id: "B",
    topic: "New semantics",
    answer:
      "New یعنی نتیجه‌ای که بعد از baseline قبلی برای نخستین‌بار وارد مجموعهٔ نتایج واجدشرایط همان Search شده باشد. Refresh و تغییر Rank به‌تنهایی New نیستند. Reactivation با New یکی نیست و در شمارش New ادغام نمی‌شود.",
  },
  {
    id: "C",
    topic: "Baseline",
    answer:
      "Summary، Alert، Preview یا Shortcut به‌تنهایی baseline را جلو نمی‌برند. baseline زمانی به‌روزرسانی می‌شود که Search Results به‌صورت موفق و قابل‌استفاده در اختیار کارجو قرار گرفته باشد. baseline مورد استفاده در visit جاری باید ثابت بماند.",
  },
  {
    id: "D",
    topic: "User scope",
    answer:
      "v0 فقط برای کارجوی logged-in است. state در سطح account و cross-device است. Guest persistence خارج از Scope است.",
  },
  {
    id: "E",
    topic: "Touchpoints",
    answer:
      "v0 شامل Search Results به‌عنوان سطح اصلی، Recent Search و Saved Search است. Home Page، Job Alert، Followed Companies، Similar Jobs و سایر discovery surfaces خارج از Scope v0 هستند.",
  },
  {
    id: "F",
    topic: "Reactivation",
    answer:
      "Reactivation باید از New جدا بماند. نمایش ویژهٔ Reactivation جزو v0 نیست و نباید blocker این قابلیت باشد.",
  },
  {
    id: "G",
    topic: "Business Outcome",
    answer:
      "Business Outcome تثبیت‌شده‌ای توسط Product ارائه نشده است. می‌توانی hypothesis پیشنهاد کنی اما نباید آن را Product truth معرفی کنی.",
  },
  {
    id: "H",
    topic: "First-visit / No-baseline semantics",
    answer:
      "اگر برای یک Search هیچ baseline قبلی وجود ندارد، هیچ‌یک از نتایج واجدشرایط فعلی صرفاً به دلیل نبود baseline، New محسوب نمی‌شوند. اولین نمایش موفق و قابل‌استفادهٔ Search Results baseline مراجعهٔ بعدی را ایجاد می‌کند.",
  },
];

function fixturesForRoute(route: SemanticFixtureRoute): Fixture[] {
  return route.fixtureIds.map((id) => {
    const fixture = fixtures.find((candidate) => candidate.id === id);
    if (!fixture) throw new Error(`Missing fixture ${id}.`);
    return fixture;
  });
}

async function gitStatus(): Promise<string> {
  const { stdout } = await execFileAsync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { cwd: repositoryRoot },
  );
  return stdout;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function assertHarnessMatchesRunAReference(): Promise<void> {
  const harnessFiles = [
    "AGENTS.md",
    "shared-harness-contract.md",
    "workflows/prd-draft-clarification.md",
    "artifacts/prd.md",
  ];
  const referenceWorkspace = resolve(
    runsDirectory,
    runAReferenceId,
    "workspace",
  );

  for (const relativePath of harnessFiles) {
    const [current, reference] = await Promise.all([
      readFile(resolve(repositoryRoot, relativePath)),
      readFile(resolve(referenceWorkspace, relativePath)),
    ]);
    const currentHash = createHash("sha256").update(current).digest("hex");
    const referenceHash = createHash("sha256").update(reference).digest("hex");
    if (currentHash !== referenceHash) {
      throw new Error(
        `Harness revision differs from ${runAReferenceId}: ${relativePath}.`,
      );
    }
  }
}

async function createWorkspace(
  workspaceDirectory: string,
  snapshotDirectory?: string,
): Promise<void> {
  const harnessFiles = [
    "AGENTS.md",
    "shared-harness-contract.md",
    "workflows/prd-draft-clarification.md",
    "artifacts/prd.md",
  ];

  await mkdir(resolve(workspaceDirectory, "outputs"), { recursive: true });
  for (const relativePath of harnessFiles) {
    const target = resolve(workspaceDirectory, relativePath);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(resolve(repositoryRoot, relativePath), target);
  }

  if (snapshotDirectory) {
    const snapshotTarget = resolve(
      workspaceDirectory,
      "context/product-knowledge",
    );
    await mkdir(snapshotTarget, { recursive: true });
    await Promise.all(
      ["manifest.json", "pages.jsonl"].map((name) =>
        copyFile(resolve(snapshotDirectory, name), resolve(snapshotTarget, name)),
      ),
    );
  }

  await execFileAsync("git", ["init", "--quiet"], { cwd: workspaceDirectory });
}

async function filesUnder(root: string): Promise<string[]> {
  const result: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolutePath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile()) {
        result.push(relative(root, absolutePath));
      }
    }
  }
  await visit(root);
  return result.sort();
}

async function inputHashes(workspaceDirectory: string): Promise<Record<string, string>> {
  const hashes: Record<string, string> = {};
  for (const relativePath of await filesUnder(workspaceDirectory)) {
    if (relativePath === "outputs" || relativePath.startsWith("outputs/")) continue;
    const content = await readFile(resolve(workspaceDirectory, relativePath));
    hashes[relativePath] = createHash("sha256").update(content).digest("hex");
  }
  return hashes;
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

async function observedSessionConfiguration(codexHome: string): Promise<{
  model: string | null;
  reasoningEffort: string | null;
  workingDirectory: string | null;
  approvalPolicy: string | null;
  networkAccessEnabled: boolean | null;
  permissionProfile: unknown;
}> {
  let observed = {
    model: null as string | null,
    reasoningEffort: null as string | null,
    workingDirectory: null as string | null,
    approvalPolicy: null as string | null,
    networkAccessEnabled: null as boolean | null,
    permissionProfile: null as unknown,
  };

  for (const path of await jsonlFilesUnder(codexHome)) {
    const lines = (await readFile(path, "utf8")).split("\n");
    for (const line of lines) {
      if (!line) continue;
      let event: Record<string, unknown>;
      try {
        event = JSON.parse(line) as Record<string, unknown>;
      } catch {
        continue;
      }
      if (event.type !== "turn_context") continue;
      const payload = event.payload as Record<string, unknown> | undefined;
      if (!payload) continue;
      const sandboxPolicy = payload.sandbox_policy as
        | Record<string, unknown>
        | undefined;
      const collaborationMode = payload.collaboration_mode as
        | Record<string, unknown>
        | undefined;
      const collaborationSettings = collaborationMode?.settings as
        | Record<string, unknown>
        | undefined;
      observed = {
        model: typeof payload.model === "string" ? payload.model : observed.model,
        reasoningEffort:
          typeof payload.reasoning_effort === "string"
            ? payload.reasoning_effort
            : typeof collaborationSettings?.reasoning_effort === "string"
              ? collaborationSettings.reasoning_effort
              : observed.reasoningEffort,
        workingDirectory:
          typeof payload.cwd === "string" ? payload.cwd : observed.workingDirectory,
        approvalPolicy:
          typeof payload.approval_policy === "string"
            ? payload.approval_policy
            : observed.approvalPolicy,
        networkAccessEnabled:
          typeof sandboxPolicy?.network_access === "boolean"
            ? sandboxPolicy.network_access
            : observed.networkAccessEnabled,
        permissionProfile: payload.permission_profile ?? observed.permissionProfile,
      };
    }
  }
  return observed;
}

function followUpPrompt(
  questions: Array<{ question: ProductQuestion; fixtures: Fixture[] }>,
): string {
  const answers = questions
    .map(({ question, fixtures: matched }) => {
      const fixtureAnswers = matched
        .map((fixture) => `[Fixture ${fixture.id} — ${fixture.topic}] ${fixture.answer}`)
        .join("\n");
      return `سؤال Child: ${question.question}\nپاسخ Product فقط برای همین سؤال:\n${fixtureAnswers}`;
    })
    .join("\n\n");

  return `Product فقط به سؤال‌های مادی‌ای که در turn قبل پرسیدی پاسخ داده است:

${answers}

این پاسخ‌ها را authoritative Product decisions بدان، اما چیزی فراتر از متن آن‌ها استنباط نکن. همان PRD Draft + Clarification workflow را در همین thread ادامه بده: draft را reconcile و ambiguity scan را دوباره اجرا کن. اگر judgment مادی دیگری لازم است فقط سؤال هدفمند آن را برگردان و هر productQuestions item را به دقیقاً یک Product decision تجزیه‌ناپذیر محدود کن. اگر ambiguity مادیِ باز باقی نمانده، PRD کامل را مطابق artifact contract در prdMarkdown برگردان و فقط در آن حالت status را problem_aligned و problemAligned را true کن. از network یا مسیرهای خارج workspace استفاده نکن و فایل‌های input را تغییر نده.`;
}

const startedAt = new Date();
await mkdir(runsDirectory, { recursive: true });
if (runVariant !== "run-a-control") await assertHarnessMatchesRunAReference();
const runId = `${runVariant}-${startedAt.toISOString().replaceAll(":", "-")}`;
const runDirectory = resolve(runsDirectory, runId);
const workspaceDirectory = resolve(runDirectory, "workspace");
const snapshotDirectory = productKnowledgeAvailable
  ? resolve(runsDirectory, frozenSnapshotId)
  : null;
const snapshotId = snapshotDirectory
  ? (snapshotDirectory.split("/").at(-1) ?? snapshotDirectory)
  : null;
await createWorkspace(workspaceDirectory, snapshotDirectory ?? undefined);

const contextAssessmentInstruction = productKnowledgeAvailable
  ? "Use the local Product Knowledge snapshot under context/product-knowledge as Current Product context. Search the snapshot yourself and choose the relevant pages; no page subset has been preselected for you."
  : "Relevant external Product Knowledge is intentionally unavailable in this Run. Follow the Harness with the context that is available, general/domain knowledge, and the uncertainty rules. Do not treat the absence of Product Knowledge as evidence about current product behavior.";
const retrievedContextInstruction = productKnowledgeAvailable
  ? "Include in retrievedProductKnowledge only original URLs, titles, and short context from snapshot records you actually used."
  : "Keep retrievedProductKnowledge empty because no external Product Knowledge is available. Do not invent, summarize, or substitute current-product facts from another source.";

const initialPrompt = `You are the child Product agent for ${childPromptRunType}. Work only inside the isolated generated workspace that is your current working directory.

Start with AGENTS.md. Discover and follow the relevant workflow and artifact contract for a PRD Draft + Clarification task; do not assume their paths before reading AGENTS.md. ${contextAssessmentInstruction}

Do not use network access, web search, Browser Use, or paths outside this workspace. Do not read previous chats, any previous New Jobs PRD, design artifact, prototype, or pilot result. They are intentionally absent. Do not alter Harness, workflow, contract, or Product Knowledge input files. Return the draft and final PRD in the structured response; the parent will persist it.

PM Intent:

${pmIntent}

Execute the real Harness workflow: retrieve relevant current context, produce a best-effort PRD v0, run the required semantic normalization and ambiguity scan, and ask only targeted material Product clarification questions that cannot be resolved from authoritative context. Do not invent unresolved Product decisions. Keep productQuestions empty unless you genuinely need Product judgment. ${retrievedContextInstruction}

Each productQuestions array item must request exactly one indivisible Product decision. If different answers could independently change scope, semantics, lifecycle, eligibility, or the success definition, split them into separate array items rather than combining them in one question.

If material clarification is required, return status=clarification_required, problemAligned=false, the smallest useful question batch, and the current PRD draft in prdMarkdown. If no material ambiguity remains, return status=problem_aligned, problemAligned=true, and the complete contract-compliant PRD. Use status=blocked only for a non-Product blocker and explain it in alignmentRationale.`;

await writeFile(resolve(runDirectory, "initial-prompt.txt"), `${initialPrompt}\n`, "utf8");

const hashesBeforeChild = await inputHashes(workspaceDirectory);
const runAReferenceInputHashes =
  runVariant === "run-c-solution-shaped"
    ? await inputHashes(resolve(runsDirectory, runAReferenceId, "workspace"))
    : null;
const inputHashesMatchRunA =
  runAReferenceInputHashes === null ||
  JSON.stringify(hashesBeforeChild) === JSON.stringify(runAReferenceInputHashes);
if (!inputHashesMatchRunA) {
  throw new Error(`Run C workspace inputs differ from ${runAReferenceId}.`);
}
const filesBeforeChild = await filesUnder(workspaceDirectory);
const rootStatusBeforeChild = await gitStatus();
const temporaryCodexHome = await mkdtemp(join(tmpdir(), "harness-run-a-codex-"));
const originalCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
const childConfig = `
default_permissions = "run_a_control"

[permissions.run_a_control]
description = "Run A child: isolated workspace inputs with generated output only."

[permissions.run_a_control.filesystem]
":minimal" = "read"
${JSON.stringify(workspaceDirectory)} = "read"
${JSON.stringify(resolve(workspaceDirectory, "outputs"))} = "write"

[permissions.run_a_control.network]
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
  model,
  modelReasoningEffort: reasoningEffort,
  workingDirectory: workspaceDirectory,
  networkAccessEnabled: false,
  approvalPolicy: "never",
  webSearchMode: "disabled",
});

const turns: RecordedTurn[] = [];
const productQuestions: Array<{
  turn: number;
  question: string;
  whyMaterial: string;
}> = [];
const fixtureAnswers: Array<{
  afterTurn: number;
  question: string;
  fixtures: Array<{ id: Fixture["id"]; topic: string; answer: string }>;
}> = [];
const fixtureRoutes: Array<{
  afterTurn: number;
  question: string;
  status: SemanticFixtureRoute["status"];
  fixtureIds: FixtureId[];
  multipleDecisions: boolean;
  rationale: string;
}> = [];
const routerInvocations: Array<
  SemanticFixtureRouterResult & {
    afterTurn: number;
    questions: string[];
  }
> = [];
let runStatus: RunStatus = "technical_failure";
let failure: string | null = null;
let finalPrd = "";
let currentPrompt = initialPrompt;

try {
  for (let turnNumber = 1; turnNumber <= maximumTurns; turnNumber += 1) {
    const turn = await thread.run(currentPrompt, { outputSchema: childOutputSchema });
    if (!turn.finalResponse) {
      throw new Error(`Child turn ${turnNumber} completed without a final response.`);
    }

    let response: ChildResponse;
    try {
      response = JSON.parse(turn.finalResponse) as ChildResponse;
    } catch (error) {
      turns.push({
        number: turnNumber,
        prompt: currentPrompt,
        response: null,
        rawFinalResponse: turn.finalResponse,
        items: turn.items,
        usage: turn.usage,
      });
      throw new Error(
        `Child turn ${turnNumber} returned invalid structured JSON: ${String(error)}`,
      );
    }

    turns.push({
      number: turnNumber,
      prompt: currentPrompt,
      response,
      rawFinalResponse: turn.finalResponse,
      items: turn.items,
      usage: turn.usage,
    });
    productQuestions.push(
      ...response.productQuestions.map((question) => ({
        turn: turnNumber,
        ...question,
      })),
    );

    if (response.problemAligned && response.status === "problem_aligned") {
      if (!response.prdMarkdown.trim()) {
        throw new Error("Child declared Problem Aligned without returning a PRD.");
      }
      finalPrd = response.prdMarkdown;
      runStatus = "problem_aligned";
      break;
    }

    if (response.status === "blocked") {
      throw new Error(`Child reported a technical/context blocker: ${response.alignmentRationale}`);
    }

    if (response.productQuestions.length === 0) {
      throw new Error(
        "Child was not Problem Aligned but returned no Product clarification question.",
      );
    }

    const routerResult = await routeProductQuestions(
      response.productQuestions.map((question) => question.question),
    );
    routerInvocations.push({
      afterTurn: turnNumber,
      questions: response.productQuestions.map((question) => question.question),
      ...routerResult,
    });
    const routedQuestions = response.productQuestions.map((question, index) => ({
      question,
      route: routerResult.routes[index],
    }));
    fixtureRoutes.push(
      ...routedQuestions.map(({ question, route }) => ({
        afterTurn: turnNumber,
        question: question.question,
        ...route,
      })),
    );

    const ambiguousQuestions = routedQuestions.filter(
      ({ route }) => route.status === "ambiguous",
    );
    if (ambiguousQuestions.length > 0) {
      runStatus = "blocked_on_ambiguous_fixture_route";
      failure = ambiguousQuestions
        .map(
          ({ question, route }) =>
            `Ambiguous fixture route for ${JSON.stringify(question.question)}: ${route.rationale}`,
        )
        .join(" | ");
      break;
    }

    const noMatchQuestions = routedQuestions.filter(
      ({ route }) => route.status === "no_match",
    );
    if (noMatchQuestions.length > 0) {
      runStatus = "blocked_on_no_match_fixture_route";
      failure = `No fixture answer for: ${noMatchQuestions
        .map(({ question }) => question.question)
        .join(" | ")}`;
      break;
    }

    const mappedQuestions = routedQuestions.map(({ question, route }) => ({
      question,
      fixtures: fixturesForRoute(route),
    }));

    for (const mapped of mappedQuestions) {
      fixtureAnswers.push({
        afterTurn: turnNumber,
        question: mapped.question.question,
        fixtures: mapped.fixtures.map(({ id, topic, answer }) => ({
          id,
          topic,
          answer,
        })),
      });
    }
    currentPrompt = followUpPrompt(mappedQuestions);

    if (turnNumber === maximumTurns) runStatus = "max_turns_reached";
  }
} catch (error) {
  runStatus = "technical_failure";
  failure = error instanceof Error ? error.stack ?? error.message : String(error);
}

const observedConfiguration = await observedSessionConfiguration(temporaryCodexHome);
await rm(temporaryCodexHome, { recursive: true, force: true });

const rootStatusAfterChild = await gitStatus();
const hashesAfterChild = await inputHashes(workspaceDirectory);
const filesAfterChild = await filesUnder(workspaceDirectory);
const inputFilesUnchanged =
  JSON.stringify(hashesAfterChild) === JSON.stringify(hashesBeforeChild);
const filesAddedByChild = filesAfterChild.filter(
  (path) => !filesBeforeChild.includes(path),
);
const filesAddedOutsideOutputs = filesAddedByChild.filter(
  (path) => path !== "outputs" && !path.startsWith("outputs/"),
);
const originalRepositoryChangedByChild =
  rootStatusAfterChild !== rootStatusBeforeChild;
const childCommands = turns.flatMap((turn) =>
  turn.items
    .filter((item) => item.type === "command_execution")
    .map((item) => item.command),
);
const childWebSearchItems = turns.flatMap((turn) =>
  turn.items.filter((item) => item.type === "web_search"),
);
const privateNetworkCommandAttempted = childCommands.some((command) =>
  /\b(?:curl|wget|httpie|fetch)\b/i.test(command),
);
const originalSnapshotReferencedInCommands = snapshotDirectory
  ? childCommands.some((command) => command.includes(snapshotDirectory))
  : false;
const productKnowledgeDirectoryPresent = await pathExists(
  resolve(workspaceDirectory, "context/product-knowledge"),
);
const actualNetworkDisabled = observedConfiguration.networkAccessEnabled === false;
const actualWorkingDirectoryIsWorkspace =
  observedConfiguration.workingDirectory === workspaceDirectory;
const isolationPassed =
  !originalRepositoryChangedByChild &&
  inputFilesUnchanged &&
  filesAddedOutsideOutputs.length === 0 &&
  actualNetworkDisabled &&
  actualWorkingDirectoryIsWorkspace &&
  childWebSearchItems.length === 0 &&
  !privateNetworkCommandAttempted &&
  !originalSnapshotReferencedInCommands &&
  productKnowledgeDirectoryPresent === productKnowledgeAvailable;

if (runStatus === "problem_aligned") {
  await writeFile(
    resolve(workspaceDirectory, "outputs/prd.md"),
    `${finalPrd.trim()}\n`,
    "utf8",
  );
}

const prdHeadingLevels = {
  Problem: "##",
  "Affected Users": "##",
  "Current Behavior": "##",
  Outcomes: "##",
  "User Outcome": "###",
  "Business Outcome": "###",
  "Success Metrics": "###",
  Scope: "##",
  "Key Product Scenarios": "##",
  "Required Product Behavior": "##",
  Dependencies: "##",
  "Acceptance Criteria": "##",
  "Assumptions & Open Decisions": "##",
} as const;

function prdFacts(markdown: string): {
  present: boolean;
  sectionPresence: Record<keyof typeof prdHeadingLevels, boolean>;
  referencesCount: number;
  dependenciesCount: number;
} {
  const lines = markdown.split("\n");
  const sectionPresence = Object.fromEntries(
    Object.entries(prdHeadingLevels).map(([heading, level]) => [
      heading,
      lines.some((line) => line.trim() === `${level} ${heading}`),
    ]),
  ) as Record<keyof typeof prdHeadingLevels, boolean>;

  const frontmatterEnd = lines[0] === "---" ? lines.indexOf("---", 1) : -1;
  const frontmatter = frontmatterEnd > 0 ? lines.slice(1, frontmatterEnd) : [];
  const referencesStart = frontmatter.findIndex(
    (line) => line.trim() === "references:",
  );
  let referencesCount = 0;
  if (referencesStart >= 0) {
    for (const line of frontmatter.slice(referencesStart + 1)) {
      if (line.startsWith("  - ")) referencesCount += 1;
      else if (line.length > 0 && !line.startsWith(" ")) break;
    }
  }

  const dependenciesStart = lines.findIndex(
    (line) => line.trim() === "## Dependencies",
  );
  let dependenciesCount = 0;
  if (dependenciesStart >= 0) {
    for (const line of lines.slice(dependenciesStart + 1)) {
      if (line.startsWith("## ")) break;
      if (line.trimStart().startsWith("- ")) dependenciesCount += 1;
    }
  }

  return {
    present: markdown.trim().length > 0,
    sectionPresence,
    referencesCount,
    dependenciesCount,
  };
}

const comparisonPrepSummary = {
  runId,
  runType,
  referenceRunId: runVariant === "run-a-control" ? null : runAReferenceId,
  turns: turns.length,
  productQuestions: productQuestions.length,
  fixtureIdsConsumed: [
    ...new Set(
      fixtureAnswers.flatMap((entry) =>
        entry.fixtures.map((fixture) => fixture.id),
      ),
    ),
  ],
  finalStatus: runStatus,
  problemAligned: runStatus === "problem_aligned",
  prd: prdFacts(finalPrd),
};
const comparisonPrepSummaryPath = productKnowledgeAvailable
  ? runVariant === "run-a-control"
    ? null
    : resolve(runDirectory, "comparison-prep.json")
  : resolve(runDirectory, "comparison-prep.json");
const methodologySupersession =
  runVariant === "run-c-solution-shaped"
    ? {
        supersededRuns: [
          {
            runId: supersededRunCId,
            reason:
              "Diagnostic Run C superseded after a missing first-visit/no-baseline PM simulator fixture caused repeated clarification.",
          },
          {
            runId: priorValidRunCId,
            reason:
              "Prior valid Run C used the pre-improvement Harness revision and is not comparable with this rerun.",
          },
        ],
        supersededByRunId: runId,
        referenceRunId: runAReferenceId,
        classification: "harness_revision_rerun",
        interpretationRule:
          "Compare this Run C only with the new Run A reference recorded here; do not compare it with a Run A from the prior Harness revision.",
      }
    : null;
const methodologySupersessionPath = methodologySupersession
  ? resolve(runDirectory, "methodology-supersession.json")
  : null;

const finishedAt = new Date();
const metadata = {
  runId,
  runType,
  referenceRunId: runVariant === "run-a-control" ? null : runAReferenceId,
  experimentalCondition: {
    productKnowledgeAvailable,
    intendedDifferenceFromReference:
      runVariant === "run-c-solution-shaped"
        ? "PM Intent only: solution-shaped Intent replaces the problem-oriented Run A Intent."
        : "Availability of external Product Knowledge in the child workspace and the prompt text necessary to state that availability.",
    apparatusCorrectionFromReference:
      runVariant === "run-c-solution-shaped"
        ? "None. The new Run A reference and this Run C use the same Harness revision and fixture bank A-H."
        : null,
  },
  startedAt: startedAt.toISOString(),
  finishedAt: finishedAt.toISOString(),
  status: runStatus,
  failure,
  threadId: thread.id,
  configuredModel: model,
  configuredReasoningEffort: reasoningEffort,
  router: {
    config: semanticFixtureRouterConfig,
    invocations: routerInvocations,
  },
  observedConfiguration,
  maximumTurns,
  completedTurns: turns.length,
  configurationParity:
    runVariant === "run-c-solution-shaped"
      ? {
          referenceRunId: runAReferenceId,
          harnessAndSnapshotInputHashesMatch: inputHashesMatchRunA,
          referenceInputHashes: runAReferenceInputHashes,
          runInputHashes: hashesBeforeChild,
          productChild: {
            model,
            reasoningEffort,
            maximumTurns,
            networkAccessEnabled: false,
            approvalPolicy: "never",
            webSearchMode: "disabled",
            structuredOutputSchema: childOutputSchema,
          },
          semanticFixtureRouter: semanticFixtureRouterConfig,
          fixtures,
          intendedMaterialDifference: "PM Intent only",
          apparatusParityException: null,
          promptWrapperDeviation:
            "The variant label in the first prompt sentence is neutralized to avoid mentioning Run A to the child; workflow instructions are otherwise unchanged.",
        }
      : null,
  availableContext: {
    harnessFiles: [
      "AGENTS.md",
      "shared-harness-contract.md",
      "workflows/prd-draft-clarification.md",
      "artifacts/prd.md",
    ],
    productKnowledgeAvailable,
    productKnowledgeWorkspacePath: productKnowledgeDirectoryPresent
      ? resolve(workspaceDirectory, "context/product-knowledge")
      : null,
  },
  snapshot: snapshotDirectory
    ? {
        id: snapshotId,
        sourcePath: snapshotDirectory,
        workspacePath: resolve(
          workspaceDirectory,
          "context/product-knowledge",
        ),
      }
    : null,
  initialPromptPath: resolve(runDirectory, "initial-prompt.txt"),
  transcriptPath: resolve(runDirectory, "turns.json"),
  finalPrdPath:
    runStatus === "problem_aligned"
      ? resolve(workspaceDirectory, "outputs/prd.md")
      : null,
  comparisonPrepSummaryPath,
  methodologySupersessionPath,
  productQuestions,
  fixtureRoutes,
  fixtureAnswers,
  fixtureWasAbsentFromInitialPrompt: fixtures.every(
    (fixture) => !initialPrompt.includes(fixture.answer),
  ),
  isolation: {
    networkAccessEnabled: false,
    actualNetworkDisabled,
    actualWorkingDirectoryIsWorkspace,
    originalRepositoryChangedByChild,
    inputFilesUnchanged,
    filesAddedByChild,
    filesAddedOutsideOutputs,
    childWebSearchItemCount: childWebSearchItems.length,
    privateNetworkCommandAttempted,
    originalSnapshotReferencedInCommands,
    productKnowledgeDirectoryPresent,
    productKnowledgeAvailabilityMatchedCondition:
      productKnowledgeDirectoryPresent === productKnowledgeAvailable,
    passed: isolationPassed,
  },
  retrievedProductKnowledge: turns.at(-1)?.response?.retrievedProductKnowledge ?? [],
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
  ...(comparisonPrepSummaryPath
    ? [
        writeFile(
          comparisonPrepSummaryPath,
          `${JSON.stringify(comparisonPrepSummary, null, 2)}\n`,
          "utf8",
        ),
      ]
    : []),
  ...(methodologySupersessionPath && methodologySupersession
    ? [
        writeFile(
          methodologySupersessionPath,
          `${JSON.stringify(methodologySupersession, null, 2)}\n`,
          "utf8",
        ),
      ]
    : []),
]);

console.log(
  JSON.stringify(
    {
      runDirectory,
      finalPrdPath: metadata.finalPrdPath,
      status: runStatus,
      childThreadId: thread.id,
      turns: turns.length,
      productQuestions,
      fixtureRoutes,
      fixtureAnswers,
      retrievedProductKnowledge: metadata.retrievedProductKnowledge,
      observedConfiguration,
      isolation: metadata.isolation,
      comparisonPrepSummaryPath,
      failure,
    },
    null,
    2,
  ),
);

if (runStatus === "technical_failure" || !isolationPassed) {
  process.exitCode = 1;
}
