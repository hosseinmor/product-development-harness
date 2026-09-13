import { Codex, type ThreadItem, type Usage } from "@openai/codex-sdk";
import { semanticFixtureRouterConfig } from "./semantic-fixture-router.js";
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
  type AtomicityAudit,
  type AlignmentGuardResult,
  type AuthorityClaimSidecar,
  type AuthorityGuardResult,
  type AuthorityLedger,
  type ClarificationMaterialityGuardResult,
  type SemanticGuardResult,
} from "./runtime-guardrails.js";
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
const frozenSnapshotId = "product-knowledge-snapshot-2026-09-07T14-47-41.304Z";
const model = "gpt-5.6-sol";
const reasoningEffort = "high";
const maximumTurns = 8;

const pmIntent = `در بعضی آگهی‌های شغلی، کارفرما برای بررسی اولیهٔ کارجو به اطلاعاتی نیاز دارد که لزوماً از رزومه قابل تشخیص نیست.

می‌خواهیم کارفرما بتواند برای آگهی، سؤال‌هایی تعریف کند که کارجو هنگام ارسال رزومه به آن‌ها پاسخ دهد، تا اطلاعات موردنیاز برای بررسی اولیه همراه با درخواست استخدام در اختیار کارفرما قرار بگیرد.

در عین حال، نمی‌خواهیم این مرحله باعث اصطکاک غیرضروری در اپلای شود، مخصوصاً زمانی که کارجو قبلاً به همان سؤال پاسخ داده است.

هنوز جزئیات رفتار سؤال‌ها، الزامی‌بودن پاسخ، استفادهٔ مجدد از پاسخ‌های قبلی، و تأثیر احتمالی پاسخ‌ها بر فرآیند بررسی نهایی نشده‌اند.`;

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
  | "blocked_on_runtime_atomicity_validation"
  | "blocked_on_runtime_authority_validation"
  | "blocked_on_runtime_clarification_materiality_validation"
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

const fixtureIds = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
] as const;
type FixtureId = (typeof fixtureIds)[number];
type Fixture = {
  id: FixtureId;
  topic: string;
  routingDescription: string;
  answer: string;
};

const fixtures: readonly Fixture[] = [
  {
    id: "1",
    topic: "Question limit",
    routingDescription:
      "Answers only the Product decision about the maximum number of Screening Questions that may be attached to one Job Post.",
    answer: "هر Job Post حداکثر ۵ Screening Question دارد.",
  },
  {
    id: "2",
    topic: "Supported answer types",
    routingDescription:
      "Answers only the Product decision selecting which semantic Screening Question answer types are supported in the initial release, not their exact UI controls or presentation.",
    answer:
      "هر پنج نوع Boolean، Select، Number، Range و Date در MVP پشتیبانی می‌شوند. Exact UI control و presentation هر type با این تصمیم establish نمی‌شود.",
  },
  {
    id: "3",
    topic: "Required answers",
    routingDescription:
      "Answers only the Product decision about whether selected Screening Questions are required or optional and whether an Employer may configure requiredness per question. It does not by itself define the submission consequence of missing or invalid answers.",
    answer:
      "تمام Screening Questionهای انتخاب‌شده required هستند و Employer requiredness را per-question تنظیم نمی‌کند.",
  },
  {
    id: "4",
    topic: "Submission blocking",
    routingDescription:
      "Answers only the Product decision about whether Apply completion is blocked until every required Screening Question has a valid recorded answer.",
    answer:
      "Candidate تا زمانی که پاسخ معتبر همهٔ Screening Questionها ثبت نشده باشد نمی‌تواند Apply را کامل کند.",
  },
  {
    id: "5",
    topic: "Answer reuse / prefill",
    routingDescription:
      "Answers only the Product decision about saving a Candidate's prior answer and prefilling it when the same question appears in a later Apply.",
    answer:
      "پاسخ قبلی Candidate به همان سؤال ذخیره می‌شود و در Applyهای بعدی به همان سؤال prefill می‌شود.",
  },
  {
    id: "6",
    topic: "Same-question identity",
    routingDescription:
      "Answers only the Product identity decision that determines when two questions count as the same question for saved-answer reuse, including whether identifier equality, text similarity, or semantic relatedness is sufficient.",
    answer:
      "فقط Question ID یکسان به معنی همان سؤال برای reuse است. Text similarity یا related-question semantics برای reuse کافی نیست.",
  },
  {
    id: "7",
    topic: "Prefilled answer confirmation and edit",
    routingDescription:
      "Answers only the Product lifecycle and confirmation decision about whether a Candidate must separately confirm a prefilled answer, whether the answer may be edited in the Apply flow, and whether an edit updates the reusable saved answer.",
    answer:
      "Candidate لازم نیست برای پاسخ prefilled confirmation جداگانه انجام دهد. پاسخ در flow سؤال‌ها نمایش داده می‌شود، قابل ویرایش است و submit کردن Apply همان تأیید پاسخ فعلی محسوب می‌شود. ویرایش پاسخ، reusable saved answer را نیز برای Applyهای بعدی update می‌کند.",
  },
  {
    id: "8",
    topic: "Published-question immutability",
    routingDescription:
      "Answers only the Product lifecycle decision about whether a Job Post's Screening configuration may change after first Publish, including question membership and order, parameters, expected answers, knockout settings, and Screening-related Auto-Rejection settings, and whether pausing or deactivating the Job Post unlocks it.",
    answer:
      "پس از اولین Publish، کل Screening configuration آن Job Post freeze می‌شود. add/remove question، question selection، order، parameters، Expected Answer، Knockout setting و Screening-related Auto-Rejection configuration قابل تغییر نیستند. Pause یا Deactivate شدن Job Post این lock را باز نمی‌کند. Exact future versioning workflow خارج از Scope این PRD است.",
  },
  {
    id: "9",
    topic: "Eligible flow",
    routingDescription:
      "Answers only the Product release-scope decision about which Apply channels and user eligibility states are supported, such as internal authenticated Apply versus guest or external/link-out flows.",
    answer:
      "v0 فقط internal logged-in Apply flow را پوشش می‌دهد. Guest Apply و external/link-out application خارج از Scope هستند.",
  },
  {
    id: "10",
    topic: "Match Score relationship",
    routingDescription:
      "Answers only the Product decision about whether Screening Question answers affect the existing Match Score or remain independent from it.",
    answer:
      "Screening Questions فعلاً مستقل از Match Score هستند. Answerها Match Score را تغییر نمی‌دهند.",
  },
  {
    id: "11",
    topic: "Knockout questions",
    routingDescription:
      "Answers only the Product capability decision about whether an Employer may mark an eligible Screening Question as knockout and whether mismatch creates a disqualifying mismatch. It does not answer eligible answer types, comparison semantics, multiple-knockout composition, pre-submission blocking, Auto-Rejection activation or handoff, exact UI, or technical orchestration.",
    answer:
      "Employer می‌تواند یک Screening Question مجاز را Knockout کند. Mismatch در Knockout Question یک Disqualifying Mismatch ایجاد می‌کند. Expected Answer در چارچوب rule همان Canonical Question تعیین می‌شود. Exact UI configuration و internal orchestration با این تصمیم establish نمی‌شود.",
  },
  {
    id: "12",
    topic: "Candidate transparency",
    routingDescription:
      "Answers only the Product decision about whether the Candidate is told which questions are knockout, which answers the Employer expects, or which answers can cause automatic rejection.",
    answer:
      "Candidate هنگام پاسخ‌دادن نباید بداند کدام سؤال knockout است، کدام پاسخ مورد انتظار Employer است، یا کدام پاسخ می‌تواند باعث Auto-Rejection شود. Candidate باید سؤال را به‌صورت عادی و صادقانه پاسخ دهد.",
  },
  {
    id: "13",
    topic: "Employer filtering",
    routingDescription:
      "Answers only the Product capability decision about whether Employers can filter Candidates or Applications by Screening Question answers. It does not define filtering UI, operators, boolean composition, match presentation, or placement.",
    answer:
      "Employer باید بتواند Candidate/Applicationها را بر اساس پاسخ Screening Questions فیلتر کند. این تصمیم فقط capability را establish می‌کند و exact filtering UI، operators، AND/OR behavior، one-filter vs multi-filter، exact Match/Mismatch presentation و filter placement را establish نمی‌کند.",
  },
  {
    id: "14",
    topic: "Cross-organization reuse",
    routingDescription:
      "Answers only the Product scope and ownership decision about whether a saved answer to the same canonical Question ID may be reused across Job Posts belonging to different Employers, and whether that reusable answer is Candidate-owned or Employer-scoped.",
    answer:
      "اگر Question ID یکسان باشد، saved answer می‌تواند بین Job Postهای employerهای مختلف نیز reuse یا prefill شود. Answer متعلق به Candidate + canonical Question ID است، نه employer.",
  },
  {
    id: "15",
    topic: "Knockout timing / submission consequence",
    routingDescription:
      "Answers only the Product lifecycle decision for a valid answer that mismatches an Employer's expected knockout answer: whether mismatch blocks Apply submission or submission succeeds first and automatic rejection may occur afterward. This does not cover missing or invalid required answers.",
    answer:
      "مقدار پاسخ، وقتی Candidate پاسخ معتبر داده، مانع submit شدن Apply نمی‌شود. Application ابتدا طبق flow عادی ثبت می‌شود. اگر پاسخ یک Knockout Question با expected answer Employer تطابق نداشته باشد، Application بعد از ثبت می‌تواند از طریق Auto-Rejection رد شود. missing یا invalid required answer همچنان submit را block می‌کند.",
  },
  {
    id: "16",
    topic: "Automated status and ranking boundary",
    routingDescription:
      "Answers only the Product boundary about whether a valid Screening Question answer, outside the separately defined Knockout Auto-Rejection behavior, may automatically change Application status or Candidate ranking/order. It does not answer missing/invalid-answer submission blocking, Match Score, Employer filtering, or exact automation mechanics.",
    answer:
      "غیر از Knockout Auto-Rejection، Screening answer به‌صورت خودکار Application status را تغییر نمی‌دهد و ranking یا order خودکار Candidateها را تغییر نمی‌دهد. Screening answer همچنان می‌تواند برای Employer filtering استفاده شود، اما filtering یک capability مستقل است و تغییر خودکار status یا ranking محسوب نمی‌شود.",
  },
  {
    id: "17",
    topic: "Canonical Question creation",
    routingDescription:
      "Answers only the Product creation and governance decision about whether v0 Screening Questions must come from a shared canonical catalog or may be created as Employer-defined canonical or free-form/custom questions, and whether canonical questions have stable identifiers. It does not define catalog browsing, search, or selection UI.",
    answer:
      "در v0، Screening Questionها فقط از shared canonical question catalog انتخاب می‌شوند. Employer نمی‌تواند canonical Question جدید یا free-form/custom Question جدید بسازد. هر canonical Question یک stable Question ID دارد. Exact catalog browsing/search UI متعلق به Design است.",
  },
  {
    id: "18",
    topic: "Application answer snapshot",
    routingDescription:
      "Answers only the Product persistence decision about whether Screening answers attached to an Application are immutable snapshots of their submit-time values or remain live-linked to later reusable saved-answer edits. It does not answer Screening Question immutability or whether edits update the reusable saved answer for future Applies.",
    answer:
      "هنگام submit شدن Apply، پاسخ‌های Screening همان Application به‌صورت snapshot ذخیره می‌شوند. تغییر بعدی reusable saved answer نباید Applicationهای قبلی را تغییر دهد. reusable saved answer می‌تواند برای Apply آینده update شود، هر Application مقدار پاسخ زمان submit خودش را حفظ می‌کند و historical Application answers immutable هستند. این تصمیم question immutability یا reusable-answer writeback را establish نمی‌کند.",
  },
  {
    id: "19",
    topic: "Optional use at Job Post level",
    routingDescription:
      "Answers only the Product adoption decision about whether every Job Post must use Screening Questions or whether Screening Questions are optional at the Job Post level and a Job Post may be published without them.",
    answer:
      "استفاده از Screening Questions برای Job Post اختیاری است و Job Post می‌تواند بدون Screening Question منتشر شود.",
  },
  {
    id: "20",
    topic: "Canonical Question semantic stability",
    routingDescription:
      "Answers only the Product versioning decision about which changes to a canonical question require a new Question ID versus which non-semantic editorial changes may preserve the existing stable ID. It does not decide who creates catalog questions or whether a published Job Post's configuration may change.",
    answer:
      "Question ID یک semantic contract پایدار است. تغییر مادی meaning، Answer Type، answer semantics، option semantics یا evaluation semantics به Question ID جدید نیاز دارد. تغییر صرفاً نگارشی که معنا را تغییر نمی‌دهد می‌تواند همان Question ID را حفظ کند.",
  },
  {
    id: "21",
    topic: "Saved-answer expiration",
    routingDescription:
      "Answers only the Product lifecycle decision about whether reusable saved answers automatically expire in v0 or remain reusable until the Candidate changes them. It does not answer Application snapshot history or writeback after editing a prefilled answer.",
    answer:
      "در v0 saved answer خودکار expire نمی‌شود و تا زمانی که Candidate آن را تغییر دهد reusable باقی می‌ماند. Future expiration policy می‌تواند بعداً در سطح Canonical Question اضافه شود، ولی expiration در v0 وجود ندارد.",
  },
  {
    id: "22",
    topic: "Deterministic evaluation model",
    routingDescription:
      "Answers only the Product evaluation-model decision about whether an evaluable canonical question deterministically combines Candidate Answer, Employer Expected Answer, and the canonical comparison rule into Match or Mismatch. It does not define per-type comparison semantics, knockout eligibility, or rejection workflow.",
    answer:
      "هر Canonical Question که Evaluable است یک deterministic evaluation rule دارد: Candidate Answer + Employer Expected Answer + Canonical Question comparison rule نتیجهٔ Match یا Mismatch تولید می‌کند.",
  },
  {
    id: "23",
    topic: "Expected-answer configuration authority",
    routingDescription:
      "Answers only the Product authority decision about whether the Employer supplies an Expected Answer and whether the Employer may choose arbitrary comparison operators or must use comparison semantics allowed by the Canonical Question. It does not define exact configuration UI or the per-type comparison rules themselves.",
    answer:
      "Employer Expected Answer را تعیین می‌کند، اما arbitrary comparison operator انتخاب نمی‌کند. Canonical Question مشخص می‌کند چه comparison semantics مجاز است. Exact configuration UI با این تصمیم establish نمی‌شود.",
  },
  {
    id: "24",
    topic: "Supported comparison semantics",
    routingDescription:
      "Answers only the Product decision about deterministic comparison-semantics families supported by each answer type—Boolean, Select, Number, Date, and Range—without defining Employer-selectable UI controls or allowing arbitrary operators.",
    answer:
      "Comparison semantics توسط Canonical Question تعریف می‌شود: Boolean equality با expected value؛ Select یک یا چند accepted option طبق rule؛ Number یکی از exact، minimum، maximum یا range؛ Date یکی از exact date، before/on-or-before، after/on-or-after یا between؛ و Range یک رابطه deterministic مانند overlap یا containment/inside allowed range. Employer operator دلخواه تعریف نمی‌کند.",
  },
  {
    id: "25",
    topic: "Knockout eligibility by answer type",
    routingDescription:
      "Answers only the Product scope decision about which supported answer types may be used as knockout questions and what eligibility condition applies. It does not define comparison rules, multiple-knockout composition, or rejection timing.",
    answer:
      "هر پنج Answer Type می‌توانند Knockout باشند، اگر Canonical Question deterministic evaluation rule داشته باشد.",
  },
  {
    id: "26",
    topic: "Multiple knockout composition",
    routingDescription:
      "Answers only the Product composition decision about whether one mismatch among multiple knockout questions is sufficient for a disqualifying result or whether all knockout questions must mismatch. It does not answer comparison semantics or Auto-Rejection timing.",
    answer:
      "وجود حداقل یک Knockout mismatch کافی است. Semantics ترکیب چند Knockout Question برابر ANY/OR است و لازم نیست همهٔ آن‌ها mismatch شوند.",
  },
  {
    id: "27",
    topic: "Screening Auto-Rejection relationship",
    routingDescription:
      "Answers only the Product handoff decision about when a disqualifying knockout mismatch may enter the existing Auto-Rejection flow, including whether Screening-based Auto-Rejection must be active and whether Screening Questions execute the final rejection workflow themselves. It does not answer pre-submission blocking, comparison semantics, or multiple-knockout composition.",
    answer:
      "اگر Knockout mismatch وجود داشته باشد و Screening-based Auto-Rejection فعال باشد، Application پس از ایجاد می‌تواند به Auto-Rejection flow تحویل داده شود. Screening Questions مسئول اجرای نهایی rejection workflow نیست.",
  },
];

type FixtureRoute = {
  status: "matched" | "ambiguous" | "no_match";
  fixtureIds: FixtureId[];
  multipleDecisions: boolean;
  rationale: string;
};
type RouterResult = {
  threadId: string;
  routes: FixtureRoute[];
  usage: Usage | null;
  isolation: {
    workingDirectoryWasEmpty: boolean;
    workingDirectoryUnchanged: boolean;
    networkAccessEnabled: false;
    passed: boolean;
  };
};

const routerOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    routes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          questionIndex: { type: "integer" },
          status: {
            type: "string",
            enum: ["matched", "ambiguous", "no_match"],
          },
          fixtureIds: {
            type: "array",
            items: { type: "string", enum: fixtureIds },
          },
          multipleDecisions: { type: "boolean" },
          rationale: { type: "string" },
        },
        required: [
          "questionIndex",
          "status",
          "fixtureIds",
          "multipleDecisions",
          "rationale",
        ],
      },
    },
  },
  required: ["routes"],
} as const;

type RawRoute = FixtureRoute & { questionIndex: number };
type RawRouterResponse = { routes: RawRoute[] };

function routerPrompt(questions: string[]): string {
  const descriptions = fixtures
    .map(({ id, routingDescription }) => `${id}: ${routingDescription}`)
    .join("\n");
  const indexedQuestions = questions
    .map((question, questionIndex) => `${questionIndex}: ${question}`)
    .join("\n");
  return `You are a Semantic Fixture Router, separate from the Product agent.

Your only task is to map each Product question to the decision fixture whose routing description directly answers the decision being requested.

Routing descriptions:
${descriptions}

Product questions:
${indexedQuestions}

Rules:
- Evaluate the requested Product decision semantically, not by keyword overlap.
- Identify the decision variable requested by the question and the decision variable resolved by each routing description. A match requires those decision variables to be semantically coextensive: the fixture answer would directly and fully resolve the question, rather than resolve only a related, broader, narrower, parent, or child decision.
- Semantic adjacency, a shared feature area, and shared terminology are not sufficient for a match.
- A question about the contents, configuration, parameters, or members of something must not match a fixture that only establishes the existence, type, or model of that thing, and vice versa.
- Before returning matched, ask: after applying the fixture answer, would the question be resolved without another Product decision? If not, return no_match unless more than one routing description is genuinely coextensive with the requested decision, in which case return ambiguous.
- A concept used only as background, an example, a proposed option, or a consequence must not trigger its fixture.
- Prefer ambiguous or no_match over revealing an extra fixture.
- Use matched only when the routing description directly and completely corresponds to the decision the question asks Product to make.
- An atomic question normally maps to exactly one fixture.
- Return multiple fixtureIds only when the question itself genuinely requests multiple independent Product decisions; set multipleDecisions=true in that case.
- For ambiguous or no_match, return an empty fixtureIds array.
- Return one route for every questionIndex, in the same order.
- Do not use tools, inspect files, or seek any other context. The fixture answers are intentionally unavailable.`;
}

function validateRouterResponse(
  response: RawRouterResponse,
  questionCount: number,
): FixtureRoute[] {
  if (!Array.isArray(response.routes) || response.routes.length !== questionCount) {
    throw new Error(
      `Semantic Fixture Router returned ${response.routes?.length ?? 0} routes for ${questionCount} questions.`,
    );
  }
  return response.routes.map((route, expectedIndex) => {
    if (route.questionIndex !== expectedIndex) {
      throw new Error(
        `Semantic Fixture Router returned questionIndex ${route.questionIndex} at position ${expectedIndex}.`,
      );
    }
    const uniqueIds = [...new Set(route.fixtureIds)];
    if (!uniqueIds.every((id) => fixtureIds.includes(id))) {
      throw new Error("Semantic Fixture Router returned an unknown fixture id.");
    }
    if (route.status !== "matched") {
      return {
        status: route.status,
        fixtureIds: [],
        multipleDecisions: false,
        rationale: route.rationale,
      };
    }
    if (uniqueIds.length === 0) {
      return {
        status: "ambiguous",
        fixtureIds: [],
        multipleDecisions: false,
        rationale: "Router returned matched without a fixture id.",
      };
    }
    if (uniqueIds.length > 1 && !route.multipleDecisions) {
      return {
        status: "ambiguous",
        fixtureIds: [],
        multipleDecisions: false,
        rationale:
          "Router returned multiple fixtures without explicitly identifying multiple independent Product decisions.",
      };
    }
    return {
      status: "matched",
      fixtureIds: uniqueIds.sort(
        (left, right) => fixtureIds.indexOf(left) - fixtureIds.indexOf(right),
      ),
      multipleDecisions: route.multipleDecisions,
      rationale: route.rationale,
    };
  });
}

async function immediateFiles(directory: string): Promise<string[]> {
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

async function routeProductQuestions(questions: string[]): Promise<RouterResult> {
  const routerWorkingDirectory = await mkdtemp(
    join(tmpdir(), "harness-screening-router-workspace-"),
  );
  const routerCodexHome = await mkdtemp(
    join(tmpdir(), "harness-screening-router-codex-"),
  );
  const originalCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
  const filesBefore = await immediateFiles(routerWorkingDirectory);
  try {
    const routerConfig = `
default_permissions = "semantic_fixture_router"

[permissions.semantic_fixture_router]
description = "Semantic fixture routing from question text and answer-independent descriptions only."

[permissions.semantic_fixture_router.filesystem]
":minimal" = "read"
${JSON.stringify(routerWorkingDirectory)} = "read"

[permissions.semantic_fixture_router.network]
enabled = false
`;
    await writeFile(resolve(routerCodexHome, "config.toml"), routerConfig, "utf8");
    await symlink(
      resolve(originalCodexHome, "auth.json"),
      resolve(routerCodexHome, "auth.json"),
    );
    const routerEnvironment = Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    );
    routerEnvironment.CODEX_HOME = routerCodexHome;
    const codex = new Codex({ env: routerEnvironment });
    const thread = codex.startThread({
      model: semanticFixtureRouterConfig.model,
      modelReasoningEffort: semanticFixtureRouterConfig.reasoningEffort,
      workingDirectory: routerWorkingDirectory,
      skipGitRepoCheck: true,
      networkAccessEnabled: semanticFixtureRouterConfig.networkAccessEnabled,
      approvalPolicy: semanticFixtureRouterConfig.approvalPolicy,
      webSearchMode: semanticFixtureRouterConfig.webSearchMode,
    });
    const turn = await thread.run(routerPrompt(questions), {
      outputSchema: routerOutputSchema,
    });
    if (!thread.id || !turn.finalResponse) {
      throw new Error("Semantic Fixture Router completed without a result.");
    }
    const routes = validateRouterResponse(
      JSON.parse(turn.finalResponse) as RawRouterResponse,
      questions.length,
    );
    const filesAfter = await immediateFiles(routerWorkingDirectory);
    const workingDirectoryWasEmpty = filesBefore.length === 0;
    const workingDirectoryUnchanged =
      JSON.stringify(filesBefore) === JSON.stringify(filesAfter);
    return {
      threadId: thread.id,
      routes,
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
      rm(routerCodexHome, { recursive: true, force: true }),
      rm(routerWorkingDirectory, { recursive: true, force: true }),
    ]);
  }
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

async function createWorkspace(
  workspaceDirectory: string,
  snapshotDirectory: string,
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
  const snapshotTarget = resolve(workspaceDirectory, "context/product-knowledge");
  await mkdir(snapshotTarget, { recursive: true });
  await Promise.all(
    ["manifest.json", "pages.jsonl"].map((name) =>
      copyFile(resolve(snapshotDirectory, name), resolve(snapshotTarget, name)),
    ),
  );
  await execFileAsync("git", ["init", "--quiet"], { cwd: workspaceDirectory });
}

async function filesUnder(root: string): Promise<string[]> {
  const result: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolutePath = resolve(directory, entry.name);
      if (entry.isDirectory()) await visit(absolutePath);
      else if (entry.isFile()) result.push(relative(root, absolutePath));
    }
  }
  await visit(root);
  return result.sort();
}

async function inputHashes(root: string): Promise<Record<string, string>> {
  const hashes: Record<string, string> = {};
  for (const relativePath of await filesUnder(root)) {
    if (relativePath === "outputs" || relativePath.startsWith("outputs/")) continue;
    hashes[relativePath] = createHash("sha256")
      .update(await readFile(resolve(root, relativePath)))
      .digest("hex");
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

function fixturesForRoute(route: FixtureRoute): Fixture[] {
  return route.fixtureIds.map((id) => {
    const fixture = fixtures.find((candidate) => candidate.id === id);
    if (!fixture) throw new Error(`Missing fixture ${id}.`);
    return fixture;
  });
}

function followUpPrompt(
  questions: Array<{ question: ProductQuestion; fixtures: Fixture[] }>,
): string {
  const answers = questions
    .map(({ question, fixtures: matched }) => {
      const answerText = matched.map((fixture) => fixture.answer).join("\n");
      return `سؤال خودت: ${question.question}\nپاسخ authoritative Product فقط برای همین سؤال:\n${answerText}`;
    })
    .join("\n\n");
  return `Product فقط به سؤال‌های مادی‌ای که در turn قبل پرسیدی پاسخ داده است:

${answers}

این پاسخ‌ها را authoritative Product decisions بدان، اما چیزی فراتر از متن آن‌ها استنباط نکن. همان PRD Draft + Clarification workflow را در همین thread ادامه بده: draft را reconcile و ambiguity scan را دوباره اجرا کن. اگر judgment مادی دیگری لازم است فقط سؤال هدفمند آن را برگردان و هر productQuestions item را به دقیقاً یک Product decision تجزیه‌ناپذیر محدود کن. قبل از پرسیدن بررسی کن که decision واقعاً Product-owned و برای Problem Alignment لازم است؛ Design-owned uncertainty را برای Design Exploration باز نگه دار. اگر ambiguity مادیِ باز باقی نمانده، PRD کامل را مطابق artifact contract در prdMarkdown برگردان و فقط در آن حالت status را problem_aligned و problemAligned را true کن. از network یا مسیرهای خارج workspace استفاده نکن و فایل‌های input را تغییر نده.`;
}

const startedAt = new Date();
await mkdir(runsDirectory, { recursive: true });
const runId = `generalization-screening-questions-${startedAt
  .toISOString()
  .replaceAll(":", "-")}`;
const runDirectory = resolve(runsDirectory, runId);
const workspaceDirectory = resolve(runDirectory, "workspace");
const snapshotDirectory = resolve(runsDirectory, frozenSnapshotId);
await createWorkspace(workspaceDirectory, snapshotDirectory);

const initialPrompt = `You are the child Product agent for a fresh Generalization Validation. Work only inside the isolated generated workspace that is your current working directory.

Start with AGENTS.md. Discover and follow the relevant workflow and artifact contract for a PRD Draft + Clarification task; do not assume their paths before reading AGENTS.md. Use the local Product Knowledge snapshot under context/product-knowledge as Current Product context. Search the snapshot yourself and choose the relevant pages; no page subset has been preselected for you.

Do not use network access, web search, Browser Use, or paths outside this workspace. Do not read previous chats, any legacy Screening Questions PRD, earlier feature artifact, design artifact, prototype, eval result, or pilot result. They are intentionally absent. Do not alter Harness, workflow, contract, or Product Knowledge input files. Return the draft and final PRD in the structured response; the parent will persist it.

PM Intent:

${pmIntent}

Execute the real Harness workflow: retrieve relevant current context, produce a best-effort PRD v0, run the required semantic normalization and ambiguity scan, and ask only targeted material Product clarification questions that cannot be resolved from authoritative context. Do not invent unresolved Product decisions. Keep productQuestions empty unless you genuinely need Product judgment. Include in retrievedProductKnowledge only original URLs, titles, and short context from snapshot records you actually used.

Each productQuestions array item must request exactly one indivisible Product decision. If different answers could independently change scope, semantics, lifecycle, eligibility, or the success definition, split them into separate array items rather than combining them in one question. Before asking, confirm the unresolved item is Product-owned and necessary for Problem Alignment; keep Design-owned uncertainty open for Design Exploration.

If material clarification is required, return status=clarification_required, problemAligned=false, the smallest useful question batch, and the current PRD draft in prdMarkdown. If no material ambiguity remains, return status=problem_aligned, problemAligned=true, and the complete contract-compliant PRD. Use status=blocked only for a non-Product blocker and explain it in alignmentRationale.`;

await mkdir(runDirectory, { recursive: true });
await writeFile(resolve(runDirectory, "initial-prompt.txt"), `${initialPrompt}\n`, "utf8");
const hashesBeforeChild = await inputHashes(workspaceDirectory);
const filesBeforeChild = await filesUnder(workspaceDirectory);
const rootStatusBeforeChild = await gitStatus();
const legacyArtifactCandidates = [
  "prd.md",
  "legacy-prd.md",
  "screening-questions-prd.md",
].filter((path) => filesBeforeChild.includes(path));

const temporaryCodexHome = await mkdtemp(
  join(tmpdir(), "harness-screening-generalization-codex-"),
);
const originalCodexHome = process.env.CODEX_HOME ?? resolve(homedir(), ".codex");
const childConfig = `
default_permissions = "screening_generalization"

[permissions.screening_generalization]
description = "Screening Questions validation child: isolated workspace inputs with generated output only."

[permissions.screening_generalization.filesystem]
":minimal" = "read"
${JSON.stringify(workspaceDirectory)} = "read"
${JSON.stringify(resolve(workspaceDirectory, "outputs"))} = "write"

[permissions.screening_generalization.network]
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

let authorityLedger = createAuthorityLedger(pmIntent);
const authorityLedgerHistory: AuthorityLedger[] = [authorityLedger];
const authorityGuard = new AuthorityLedgerGuard();
const clarificationMaterialityGuard = new ClarificationMaterialityGuard();
const alignmentGuard = new MaterialDecisionCoverageGuard();

const turns: RecordedTurn[] = [];
const productQuestions: Array<ProductQuestion & { turn: number }> = [];
const fixtureAnswers: Array<{
  afterTurn: number;
  question: string;
  fixtures: Array<{ id: FixtureId; topic: string; answer: string }>;
}> = [];
const fixtureRoutes: Array<{
  afterTurn: number;
  question: string;
  status: FixtureRoute["status"];
  fixtureIds: FixtureId[];
  multipleDecisions: boolean;
  rationale: string;
}> = [];
const routerInvocations: Array<RouterResult & { afterTurn: number; questions: string[] }> = [];
const runtimeGuardAudits: RuntimeGuardAuditRecord[] = [];
const runtimeGuardValidations: Array<{
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
  prompt: string;
  blockers: AlignmentGuardResult["audit"]["blockers"];
}> = [];
let runStatus: RunStatus = "technical_failure";
let failure: string | null = null;
let finalPrd = "";
let currentPrompt = initialPrompt;

try {
  for (let turnNumber = 1; turnNumber <= maximumTurns; turnNumber += 1) {
    const outputSchema = childOutputSchema(authorityLedger);
    const turn = await thread.run(currentPrompt, { outputSchema });
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
        initialResponse: null,
        initialRawFinalResponse: turn.finalResponse,
        response: null,
        rawFinalResponse: turn.finalResponse,
        items: turn.items,
        usage: turn.usage,
        guardrailRepairs: [],
      });
      throw new Error(
        `Child turn ${turnNumber} returned invalid structured JSON: ${String(error)}`,
      );
    }
    const initialResponse = response;
    const guardrailRepairs: GuardrailRepairTurn[] = [];
    let latestRawFinalResponse = turn.finalResponse;
    let latestUsage = turn.usage;
    let authorityAuditWithinTurn = 0;
    const validation = await validateProductOutputWithRepairs({
      initialResponse: response,
      getQuestions: (candidate) => candidate.productQuestions,
      auditAuthority: async (candidate) => {
        const result = await authorityGuard.audit({
          ledger: authorityLedger,
          claims: candidate.authorityClaims,
          currentProductContext: Array.from(
            new Map(
              [
                ...turns.flatMap(
                  (record) => record.response?.retrievedProductKnowledge ?? [],
                ),
                ...candidate.retrievedProductKnowledge,
              ].map((entry) => [`${entry.url}\u0000${entry.title}`, entry]),
            ).values(),
          ),
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
          pmIntent,
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
        const repairTurn = await thread.run(prompt, { outputSchema });
        if (!repairTurn.finalResponse) {
          throw new Error(
            `Authority repair ${attempt} for Product turn ${turnNumber} completed without a response.`,
          );
        }
        let repairedResponse: ChildResponse;
        try {
          repairedResponse = JSON.parse(repairTurn.finalResponse) as ChildResponse;
        } catch (error) {
          throw new Error(
            `Authority repair ${attempt} for Product turn ${turnNumber} returned invalid JSON: ${String(error)}`,
          );
        }
        guardrailRepairs.push({
          guard: "authority",
          attempt,
          prompt,
          response: repairedResponse,
          rawFinalResponse: repairTurn.finalResponse,
          items: repairTurn.items,
          usage: repairTurn.usage,
        });
        latestRawFinalResponse = repairTurn.finalResponse;
        latestUsage = repairTurn.usage;
        return repairedResponse;
      },
      repairClarificationMateriality: async (_candidate, audit, attempt) => {
        clarificationMaterialityGuard.recordRepairAttempt();
        const prompt = clarificationMaterialityRepairPrompt(audit);
        const repairTurn = await thread.run(prompt, { outputSchema });
        if (!repairTurn.finalResponse) {
          throw new Error(
            `Clarification Materiality repair ${attempt} for Product turn ${turnNumber} completed without a response.`,
          );
        }
        let repairedResponse: ChildResponse;
        try {
          repairedResponse = JSON.parse(repairTurn.finalResponse) as ChildResponse;
        } catch (error) {
          throw new Error(
            `Clarification Materiality repair ${attempt} for Product turn ${turnNumber} returned invalid JSON: ${String(error)}`,
          );
        }
        guardrailRepairs.push({
          guard: "clarification_materiality",
          attempt,
          prompt,
          response: repairedResponse,
          rawFinalResponse: repairTurn.finalResponse,
          items: repairTurn.items,
          usage: repairTurn.usage,
        });
        latestRawFinalResponse = repairTurn.finalResponse;
        latestUsage = repairTurn.usage;
        return repairedResponse;
      },
      repairAtomicity: async (_candidate, audit, attempt) => {
        const prompt = atomicityRepairPrompt(audit);
        const repairTurn = await thread.run(prompt, { outputSchema });
        if (!repairTurn.finalResponse) {
          throw new Error(
            `Atomicity repair ${attempt} for Product turn ${turnNumber} completed without a response.`,
          );
        }
        let repairedResponse: ChildResponse;
        try {
          repairedResponse = JSON.parse(repairTurn.finalResponse) as ChildResponse;
        } catch (error) {
          throw new Error(
            `Atomicity repair ${attempt} for Product turn ${turnNumber} returned invalid JSON: ${String(error)}`,
          );
        }
        guardrailRepairs.push({
          guard: "atomicity",
          attempt,
          prompt,
          response: repairedResponse,
          rawFinalResponse: repairTurn.finalResponse,
          items: repairTurn.items,
          usage: repairTurn.usage,
        });
        latestRawFinalResponse = repairTurn.finalResponse;
        latestUsage = repairTurn.usage;
        return repairedResponse;
      },
    });
    runtimeGuardValidations.push({
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
      rawFinalResponse: latestRawFinalResponse,
      items: [turn.items, ...guardrailRepairs.map((repair) => repair.items)].flat(),
      usage: latestUsage,
      guardrailRepairs,
    });
    if (validation.status === "authority_validation_failed") {
      runStatus = "blocked_on_runtime_authority_validation";
      failure = `Runtime Authority Guard still found unsupported promotions after ${validation.authorityRepairAttempts} repair attempts.`;
      break;
    }
    if (validation.status === "clarification_materiality_validation_failed") {
      runStatus = "blocked_on_runtime_clarification_materiality_validation";
      failure = `Runtime Clarification Materiality Guard still found non-blocking or Design-owned questions after ${validation.clarificationMaterialityRepairAttempts} repair attempts.`;
      break;
    }
    if (validation.status === "atomicity_validation_failed") {
      runStatus = "blocked_on_runtime_atomicity_validation";
      failure = `Runtime Atomicity Guard still found compound clarification after ${validation.atomicityRepairAttempts} repair attempts.`;
      break;
    }
    productQuestions.push(
      ...response.productQuestions.map((question) => ({ turn: turnNumber, ...question })),
    );
    if (response.problemAligned && response.status === "problem_aligned") {
      if (!response.prdMarkdown.trim()) {
        throw new Error("Child declared Problem Aligned without returning a PRD.");
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
        pmIntent,
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
          runStatus = "blocked_on_runtime_alignment_validation";
          failure = `Pre-Alignment Material Decision Coverage Guard still found blocking Product boundaries after ${alignmentGuard.metrics.alignmentAuditCount} alignment attempts and ${alignmentGuard.metrics.alignmentRepairCount} repair attempts.`;
          break;
        }
        alignmentGuard.recordRepairAttempt();
        const prompt = alignmentRepairPrompt(alignmentResult.audit);
        alignmentFeedbacks.push({
          afterTurn: turnNumber,
          attempt: alignmentGuard.metrics.alignmentRepairCount,
          prompt,
          blockers: alignmentResult.audit.blockers,
        });
        currentPrompt = prompt;
        continue;
      }
      finalPrd = response.prdMarkdown;
      runStatus = "problem_aligned";
      break;
    }
    if (response.status === "blocked") {
      throw new Error(
        `Child reported a technical/context blocker: ${response.alignmentRationale}`,
      );
    }
    if (response.productQuestions.length === 0) {
      throw new Error(
        "Child was not Problem Aligned but returned no Product clarification question.",
      );
    }
    const routing = await routeAndRevealAfterValidation({
      validation,
      getQuestions: (candidate) => candidate.productQuestions,
      route: async (questions) =>
        routeProductQuestions(questions.map((question) => question.question)),
      routeAllowsReveal: (result) =>
        result.routes.every((route) => route.status === "matched"),
      reveal: (result, candidate) =>
        candidate.productQuestions.map((question, index) => ({
          question,
          fixtures: fixturesForRoute(result.routes[index]!),
        })),
    });
    if (routing.status === "guard_failed") {
      throw new Error("Router was reached after runtime guard validation failed.");
    }
    const routerResult = routing.route;
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
    const ambiguous = routedQuestions.filter(({ route }) => route.status === "ambiguous");
    if (ambiguous.length > 0) {
      runStatus = "blocked_on_ambiguous_fixture_route";
      failure = ambiguous
        .map(
          ({ question, route }) =>
            `Ambiguous fixture route for ${JSON.stringify(question.question)}: ${route.rationale}`,
        )
        .join(" | ");
      break;
    }
    const noMatch = routedQuestions.filter(({ route }) => route.status === "no_match");
    if (noMatch.length > 0) {
      runStatus = "blocked_on_no_match_fixture_route";
      failure = `No fixture answer for: ${noMatch
        .map(({ question }) => question.question)
        .join(" | ")}`;
      break;
    }
    if (routing.status !== "revealed") {
      throw new Error("Fixture route was valid but runtime reveal did not occur.");
    }
    const mappedQuestions = routing.reveal;
    for (const mapped of mappedQuestions) {
      fixtureAnswers.push({
        afterTurn: turnNumber,
        question: mapped.question.question,
        fixtures: mapped.fixtures.map(({ id, topic, answer }) => ({ id, topic, answer })),
      });
    }
    const nextAuthorityLedger = extendAuthorityLedger(
      authorityLedger,
      mappedQuestions.flatMap((mapped) =>
        mapped.fixtures.map((fixture) => ({
          question: mapped.question.question,
          answer: fixture.answer,
        })),
      ),
    );
    if (nextAuthorityLedger !== authorityLedger) {
      authorityLedger = nextAuthorityLedger;
      authorityLedgerHistory.push(authorityLedger);
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
  JSON.stringify(hashesBeforeChild) === JSON.stringify(hashesAfterChild);
const filesAddedByChild = filesAfterChild.filter(
  (path) => !filesBeforeChild.includes(path),
);
const filesAddedOutsideOutputs = filesAddedByChild.filter(
  (path) => path !== "outputs" && !path.startsWith("outputs/"),
);
const originalRepositoryChangedByChild = rootStatusAfterChild !== rootStatusBeforeChild;
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
const originalSnapshotReferencedInCommands = childCommands.some((command) =>
  command.includes(snapshotDirectory),
);
const productKnowledgeDirectoryPresent = await pathExists(
  resolve(workspaceDirectory, "context/product-knowledge"),
);
const actualNetworkDisabled = observedConfiguration.networkAccessEnabled === false;
const actualWorkingDirectoryIsWorkspace =
  observedConfiguration.workingDirectory === workspaceDirectory;
const allRouterIsolationPassed = routerInvocations.every(
  (invocation) => invocation.isolation.passed,
);
const allRuntimeGuardIsolationPassed = runtimeGuardAudits.every(
  (record) => record.result.isolation.passed,
);
const isolationPassed =
  !originalRepositoryChangedByChild &&
  inputFilesUnchanged &&
  filesAddedOutsideOutputs.length === 0 &&
  actualNetworkDisabled &&
  actualWorkingDirectoryIsWorkspace &&
  childWebSearchItems.length === 0 &&
  !privateNetworkCommandAttempted &&
  !originalSnapshotReferencedInCommands &&
  productKnowledgeDirectoryPresent &&
  legacyArtifactCandidates.length === 0 &&
  allRouterIsolationPassed &&
  allRuntimeGuardIsolationPassed;

if (runStatus === "problem_aligned") {
  await writeFile(
    resolve(workspaceDirectory, "outputs/prd.md"),
    `${finalPrd.trim()}\n`,
    "utf8",
  );
}

const consumedFixtureIds = [
  ...new Set(
    fixtureAnswers.flatMap((entry) => entry.fixtures.map((fixture) => fixture.id)),
  ),
].sort((left, right) => fixtureIds.indexOf(left) - fixtureIds.indexOf(right));
const unusedFixtureIds = fixtureIds.filter((id) => !consumedFixtureIds.includes(id));
const retrievedProductKnowledge = Array.from(
  new Map(
    turns
      .flatMap((turn) => turn.response?.retrievedProductKnowledge ?? [])
      .map((entry) => [`${entry.url}\u0000${entry.title}`, entry]),
  ).values(),
);
const finishedAt = new Date();
const metadata = {
  runId,
  runType: "Generalization Validation — Screening Questions",
  startedAt: startedAt.toISOString(),
  finishedAt: finishedAt.toISOString(),
  status: runStatus,
  failure,
  threadId: thread.id,
  configuredModel: model,
  configuredReasoningEffort: reasoningEffort,
  maximumTurns,
  completedTurns: turns.length,
  snapshot: {
    id: frozenSnapshotId,
    sourcePath: snapshotDirectory,
    workspacePath: resolve(workspaceDirectory, "context/product-knowledge"),
  },
  frozenHarnessInputHashes: hashesBeforeChild,
  productChildSchema: childOutputSchema(authorityLedgerHistory[0]!),
  productQuestions,
  fixtureRoutes,
  fixtureAnswers,
  fixtureIdsConsumed: consumedFixtureIds,
  fixtureIdsUnused: unusedFixtureIds,
  fixtureBank: fixtures,
  fixtureIsolation: {
    fixtureAnswersAbsentFromInitialPrompt: fixtures.every(
      (fixture) => !initialPrompt.includes(fixture.answer),
    ),
    fixtureIdsAndTopicsAbsentFromChildFollowUps: true,
    routingDescriptionsAbsentFromProductChild: true,
  },
  router: {
    config: semanticFixtureRouterConfig,
    implementationReference: "evals/orchestrator/semantic-fixture-router.ts",
    implementationHash: createHash("sha256")
      .update(await readFile(resolve(orchestratorDirectory, "semantic-fixture-router.ts")))
      .digest("hex"),
    invocations: routerInvocations,
  },
  runtimeGuardrails: {
    config: runtimeGuardrailConfig,
    schemas: runtimeGuardrailSchemas,
    authorityLedger,
    authorityLedgerHistory,
    authorityMetrics: authorityGuard.metrics,
    clarificationMaterialityMetrics: clarificationMaterialityGuard.metrics,
    alignmentMetrics: alignmentGuard.metrics,
    alignmentFeedbacks,
    claimSidecarDurability: "generated eval metadata only; not part of the PRD artifact",
    implementationReference: "evals/orchestrator/runtime-guardrails.ts",
    implementationHash: createHash("sha256")
      .update(await readFile(resolve(orchestratorDirectory, "runtime-guardrails.ts")))
      .digest("hex"),
    validations: runtimeGuardValidations,
    audits: runtimeGuardAudits,
    repairTurns: turns.flatMap((turn) =>
      turn.guardrailRepairs.map((repair) => ({
        productTurn: turn.number,
        ...repair,
      })),
    ),
  },
  retrievedProductKnowledge,
  initialPromptPath: resolve(runDirectory, "initial-prompt.txt"),
  transcriptPath: resolve(runDirectory, "turns.json"),
  finalPrdPath:
    runStatus === "problem_aligned"
      ? resolve(workspaceDirectory, "outputs/prd.md")
      : null,
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
    legacyArtifactCandidates,
    allRouterIsolationPassed,
    allRuntimeGuardIsolationPassed,
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
      runDirectory,
      status: runStatus,
      childThreadId: thread.id,
      turns: turns.length,
      productQuestions,
      fixtureRoutes,
      fixtureAnswers,
      runtimeGuardValidations,
      consumedFixtureIds,
      unusedFixtureIds,
      retrievedProductKnowledge,
      finalPrdPath: metadata.finalPrdPath,
      observedConfiguration,
      isolation: metadata.isolation,
      failure,
    },
    null,
    2,
  ),
);

if (runStatus === "technical_failure" || !isolationPassed) process.exitCode = 1;
