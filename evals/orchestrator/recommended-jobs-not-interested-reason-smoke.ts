import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runtimeGuardrailConfig } from "./runtime-guardrails.js";
import { semanticFixtureRouterConfig } from "./semantic-fixture-router.js";

const orchestratorDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(orchestratorDirectory, "../..");
const productKnowledgeRoot = resolve(repositoryRoot, "../product-knowledge");

export const syntheticEvalTruthLabel =
  "SYNTHETIC EVAL TRUTH — NOT A PRODUCTION PRODUCT DECISION";

export const fixtureBankStatus = "human-approved-and-frozen" as const;

export const proposedFrozenPmIntent = `کارجو در بخش شغل‌های پیشنهادی می‌تواند مشخص کند که به یک موقعیت شغلی علاقه‌مند نیست.

می‌خواهیم بعد از اعلام عدم علاقه، امکان ثبت دلیل آن را هم به کارجو بدهیم تا علاوه بر ثبت عدم علاقه، سیگنال دقیق‌تری درباره نامناسب بودن پیشنهاد داشته باشیم و این داده بتواند برای بهبود تجربه پیشنهاد شغل استفاده شود.

نمی‌خواهیم گرفتن این feedback باعث اصطکاک غیرضروری در تجربه مرور شغل‌های پیشنهادی شود.

هنوز درباره الزامی یا اختیاری بودن ثبت دلیل، مدل و تعداد دلیل‌های قابل ثبت، اثر این feedback روی همان Job Post یا سایر پیشنهادها، امکان بازگرداندن تصمیم، مالکیت state و ماندگاری آن نهایی نکرده‌ایم.`;

export const explicitPmSuppliedCurrentFacts = [
  {
    id: "CURRENT-PM-001",
    statement:
      'Recommended Jobs already has a "Not Interested" action for a recommended Job Post.',
    authority: "pm-supplied-current-fact",
    limits:
      "Does not establish what the action stores, permanent hiding, recommendation/ranking effects, reversibility, or cross-device persistence.",
  },
] as const;

export const productKnowledgeReferences = [
  {
    id: "jobvision.candidate.recommended-jobs",
    repositoryRelativePath:
      "products/jobvision/candidate/areas/recommended-jobs.md",
    sha256: "d1df74c40d7547cbd944a3c7165de7dc8adbf689b67a55af2bd90347ec4fc419",
    selectionReason:
      "Canonical current context for Candidate Recommended Jobs, personalization inputs, documented actors, and known recommendation unknowns.",
  },
  {
    id: "shared.job-post",
    repositoryRelativePath: "shared/product-concepts/job-post.md",
    sha256: "d9ea34a5a782d0ff6501e887a7c09870c3e96c52f03767e11b5947dc2257a9cd",
    selectionReason:
      "Defines the shared Job Post that the feedback action targets while keeping Candidate-specific actions in their owning Product Area.",
  },
] as const;

export const productKnowledgeReferenceSetup = {
  sourceRepository: productKnowledgeRoot,
  selection: "explicit canonical manifest references",
  futureWorkspaceTarget: "context/product-knowledge",
  copyMode: "read-only generated snapshot at run setup",
  generatedArtifactsCommitted: false,
  note:
    "The future smoke runner must verify these hashes before copying the selected text into its isolated workspace. It must not mount the source repository into the Product Child workspace.",
} as const;

export type FixtureReviewStatus = "review_required" | "approved";
export type FixtureDecisionVariable =
  | "reason_requiredness"
  | "reason_input_model"
  | "reason_cardinality"
  | "same_job_suppression"
  | "other_job_recommendation_effect"
  | "reversibility"
  | "state_ownership"
  | "state_persistence";

export type ProposedFixture = {
  id: `NI-${number}` | `NI-${number}${"A" | "B"}`;
  decisionVariable: string;
  decisionVariableKey: FixtureDecisionVariable;
  excludedDecisionVariables: FixtureDecisionVariable[];
  whyMaterial: string;
  routingDescription: string;
  proposedHiddenAnswer: {
    label: typeof syntheticEvalTruthLabel;
    text: string;
    authority: "human-approved-synthetic-eval-truth";
    authorityScope: "frozen-eval-case-only";
  };
  productionDecisionAuthority: "not-production-authority";
  reviewStatus: FixtureReviewStatus;
};

export const proposedFixtures: readonly ProposedFixture[] = [
  {
    id: "NI-1",
    decisionVariable: "Reason requiredness",
    decisionVariableKey: "reason_requiredness",
    excludedDecisionVariables: [
      "reason_input_model",
      "reason_cardinality",
    ],
    whyMaterial:
      "Determines whether the existing Not Interested action may complete without collecting a reason and therefore changes the core completion path.",
    routingDescription:
      "Answers only the Product decision about whether providing a reason is optional or required when a Candidate marks a recommended Job Post as Not Interested. It does not answer the reason input model, effects on the Job Post or future recommendations, reversibility, persistence, or presentation.",
    proposedHiddenAnswer: {
      label: syntheticEvalTruthLabel,
      text:
        "Reason is optional. Not Interested can complete successfully without a reason.",
      authority: "human-approved-synthetic-eval-truth",
      authorityScope: "frozen-eval-case-only",
    },
    productionDecisionAuthority: "not-production-authority",
    reviewStatus: "approved",
  },
  {
    id: "NI-2A",
    decisionVariable: "Reason input model",
    decisionVariableKey: "reason_input_model",
    excludedDecisionVariables: ["reason_requiredness", "reason_cardinality"],
    whyMaterial:
      "Determines the semantic source of feedback data the product accepts without deciding whether a reason is required, how many may be selected, or which UI control represents it.",
    routingDescription:
      "Answers only the Product decision about the semantic source or input model supported for a Not Interested reason in v0, such as a predefined catalog, free text, or a combination. It does not answer whether a reason is required, how many reasons may be selected, effects, persistence, or presentation.",
    proposedHiddenAnswer: {
      label: syntheticEvalTruthLabel,
      text:
        "v0 supports only a predefined reason catalog. No free-text reason is supported.",
      authority: "human-approved-synthetic-eval-truth",
      authorityScope: "frozen-eval-case-only",
    },
    productionDecisionAuthority: "not-production-authority",
    reviewStatus: "approved",
  },
  {
    id: "NI-2B",
    decisionVariable: "Reason cardinality",
    decisionVariableKey: "reason_cardinality",
    excludedDecisionVariables: ["reason_requiredness", "reason_input_model"],
    whyMaterial:
      "Determines the number of reason values the product records for one Not Interested decision, independently of requiredness and the source of those values.",
    routingDescription:
      "Answers only the Product decision about how many Not Interested reasons may be selected when a reason is provided. It does not answer whether providing a reason is required, where reason values come from, effects, persistence, or presentation.",
    proposedHiddenAnswer: {
      label: syntheticEvalTruthLabel,
      text: "At most one predefined reason may be selected.",
      authority: "human-approved-synthetic-eval-truth",
      authorityScope: "frozen-eval-case-only",
    },
    productionDecisionAuthority: "not-production-authority",
    reviewStatus: "approved",
  },
  {
    id: "NI-3",
    decisionVariable: "Same Job Post suppression",
    decisionVariableKey: "same_job_suppression",
    excludedDecisionVariables: ["other_job_recommendation_effect"],
    whyMaterial:
      "Determines the Product consequence of an active Not Interested state for the exact Job Post it targets, independently of effects on any other recommendation.",
    routingDescription:
      "Answers only the Product decision about whether an active Not Interested state suppresses the exact same Job Post from Recommended Jobs for that Candidate. It does not answer effects on other Job Posts, exact transition or presentation, reversibility, unrelated lifecycle reappearance, or persistence.",
    proposedHiddenAnswer: {
      label: syntheticEvalTruthLabel,
      text:
        "While Not Interested is active for a Candidate and Job Post, that exact Job Post is excluded from Recommended Jobs for that Candidate. This does not establish exact UI removal animation, transition, or presentation.",
      authority: "human-approved-synthetic-eval-truth",
      authorityScope: "frozen-eval-case-only",
    },
    productionDecisionAuthority: "not-production-authority",
    reviewStatus: "approved",
  },
  {
    id: "NI-4",
    decisionVariable: "Effect on other or future recommendations",
    decisionVariableKey: "other_job_recommendation_effect",
    excludedDecisionVariables: ["same_job_suppression"],
    whyMaterial:
      "Determines whether the new feedback is merely captured or automatically changes the recommendation product in v0; the PM outcome alone does not establish that consequence.",
    routingDescription:
      "Answers only the Product decision about whether the Not Interested reason automatically changes recommendation selection, ranking, eligibility, or exclusion for other Job Posts in v0, or is captured only as feedback/data. It does not answer suppression of the exact same Job Post, reversibility, persistence, or analytics implementation.",
    proposedHiddenAnswer: {
      label: syntheticEvalTruthLabel,
      text:
        "In v0, the reason is captured as feedback/data only. It does not automatically affect selection, ranking, eligibility, or exclusion of other Job Posts. This does not change the separately established suppression of the exact same Job Post while Not Interested is active.",
      authority: "human-approved-synthetic-eval-truth",
      authorityScope: "frozen-eval-case-only",
    },
    productionDecisionAuthority: "not-production-authority",
    reviewStatus: "approved",
  },
  {
    id: "NI-6",
    decisionVariable: "Reversibility",
    decisionVariableKey: "reversibility",
    excludedDecisionVariables: ["state_ownership", "state_persistence"],
    whyMaterial:
      "Determines whether Not Interested is a reversible Product state and whether Design must support a recovery lifecycle, without prescribing an undo UI.",
    routingDescription:
      "Answers only the Product lifecycle decision about whether a Candidate can reverse a previously recorded Not Interested decision. It does not answer the reversal interaction, immediate removal, future ranking effects, or persistence scope.",
    proposedHiddenAnswer: {
      label: syntheticEvalTruthLabel,
      text:
        "Candidate can reverse the active Not Interested state. Exact interaction and surface for reversal are Design-owned. This does not establish historical event or reason retention.",
      authority: "human-approved-synthetic-eval-truth",
      authorityScope: "frozen-eval-case-only",
    },
    productionDecisionAuthority: "not-production-authority",
    reviewStatus: "approved",
  },
  {
    id: "NI-7A",
    decisionVariable: "Ownership scope",
    decisionVariableKey: "state_ownership",
    excludedDecisionVariables: ["state_persistence"],
    whyMaterial:
      "Determines what owns the state and selected reason; current logged-in recommendation context cannot establish this intended boundary by inheritance.",
    routingDescription:
      "Answers only the Product decision about what entity or context owns the Not Interested state and selected reason, such as a Candidate account, browser, device, or session. It does not answer how long the state remains active, whether it survives context changes, effects, reversibility, or presentation.",
    proposedHiddenAnswer: {
      label: syntheticEvalTruthLabel,
      text:
        "The state and selected reason are Candidate-account-owned, not browser-, device-, or session-owned. This does not establish persistence duration.",
      authority: "human-approved-synthetic-eval-truth",
      authorityScope: "frozen-eval-case-only",
    },
    productionDecisionAuthority: "not-production-authority",
    reviewStatus: "approved",
  },
  {
    id: "NI-7B",
    decisionVariable: "Persistence",
    decisionVariableKey: "state_persistence",
    excludedDecisionVariables: ["state_ownership"],
    whyMaterial:
      "Determines whether an active Not Interested decision continues across sessions and devices, independently of which entity owns that state.",
    routingDescription:
      "Answers only the Product decision about whether and until when an active Not Interested state survives session or device changes. It does not answer what entity owns the state, historical retention after reversal, effects on recommendations, or presentation.",
    proposedHiddenAnswer: {
      label: syntheticEvalTruthLabel,
      text:
        "The active Not Interested state persists across sessions and devices until the Candidate reverses it. Historical retention or deletion semantics after reversal remain non-blocking and are not established.",
      authority: "human-approved-synthetic-eval-truth",
      authorityScope: "frozen-eval-case-only",
    },
    productionDecisionAuthority: "not-production-authority",
    reviewStatus: "approved",
  },
] as const;

export const intentionallyDeferredConditionalDecision = {
  originalInventoryNumber: 5,
  decisionVariable: "Scope of recommendation effect",
  status: "not_applicable_under_frozen_NI-4_answer",
  reason:
    "This decision exists only if NI-4 establishes an automatic recommendation effect. Frozen NI-4 establishes capture-only behavior for other Job Posts, so activating a scope fixture would create a dead branch and unnecessary disclosure.",
} as const;

export const expectedAuthorityBoundaries = {
  sourceEstablishedCurrentFacts: [
    "Recommended Jobs displays personalized Job Posts for Candidate-side discovery.",
    "The documented recommendation/ranking logic is unknown and remains subject to Product review.",
    "A recommended item is a shared Job Post; Candidate-specific actions are owned by the Candidate Product Area.",
  ],
  pmSuppliedCurrentFacts: explicitPmSuppliedCurrentFacts,
  pmIntentEstablished: [
    "After Not Interested, the intended change allows a Candidate to provide a reason.",
    "The reason is intended to create a more specific feedback signal that can be used to improve the recommendation experience.",
    "Avoiding unnecessary browsing friction is an intended outcome, not an interaction specification.",
  ],
  humanApprovedSyntheticEvalTruth: proposedFixtures.map(
    ({ id, decisionVariable }) => ({ id, decisionVariable }),
  ),
  productionAuthorityStatus:
    "These fixture answers are authoritative only inside this frozen eval case and are not production Product decisions.",
  prohibitedInheritance: [
    "Current signed-in recommendation context does not establish the new feedback state's intended eligibility, ownership, or persistence.",
    "Existing preference inputs affecting recommendations do not establish that Not Interested reason feedback changes ranking or selection.",
    "The existing Not Interested action does not establish storage, permanent hiding, reversibility, or cross-device behavior.",
    "The low-friction intent does not establish whether providing a reason is optional or required.",
  ],
} as const;

export const designOwnedUncertaintiesExcludedFromFixtures = [
  "Exact UI, control, layout, and visual treatment.",
  "Timing and placement of the reason prompt.",
  "Exact reversal interaction and surface.",
] as const;

export const nonBlockingProductUncertaintiesExcludedFromFixtures = [
  "Final reason taxonomy and wording.",
  "Historical retention or deletion of reasons and events after reversal.",
  "Analytics implementation.",
  "Future use of feedback beyond v0.",
  "Reappearance caused by unrelated Job Post lifecycle changes.",
] as const;

export const expectedClarificationPath = {
  targetProductTurns: "2–3 clarification turns before reconciliation",
  firstBatchCandidates: ["NI-1", "NI-2A", "NI-2B", "NI-3", "NI-4"],
  laterBatchCandidates: ["NI-6", "NI-7A", "NI-7B"],
  rules: [
    "Every question must remain one-variable even when questions are batched in one Product turn.",
    "A competent Child need not consume a non-blocking fixture merely because it exists.",
    "NI-4 must resolve before any automatic-effect scope question could become applicable.",
    "Design-owned and explicitly non-blocking uncertainties remain open rather than becoming Product clarifications.",
  ],
} as const;

export const futureSmokeConfig = {
  fixtureBankStatus,
  productChild: {
    model: "gpt-5.6-sol",
    reasoningEffort: "high",
    networkAccessEnabled: false,
    approvalPolicy: "never",
    freshThread: true,
  },
  semanticRouter: semanticFixtureRouterConfig,
  runtimeGuardrails: runtimeGuardrailConfig,
  artifactContract: "artifacts/prd.md",
  workflow: "workflows/prd-draft-clarification.md",
  productKnowledge: productKnowledgeReferenceSetup,
  runtimePipeline: [
    "Product Child",
    "Authority Guard",
    "Atomicity Guard",
    "Semantic Router",
    "fixture reveal",
    "Product Child reconciliation",
    "Authority Guard",
    "Material Decision Coverage Guard",
  ],
} as const;

export function routerVisibleFixtures(): Array<{
  id: ProposedFixture["id"];
  routingDescription: string;
}> {
  return proposedFixtures.map(({ id, routingDescription }) => ({
    id,
    routingDescription,
  }));
}

export function assertFixtureBankReviewComplete(): void {
  const pending = proposedFixtures.filter(
    ({ reviewStatus }) => reviewStatus !== "approved",
  );
  if (pending.length > 0) {
    throw new Error(
      `Smoke execution is intentionally disabled: ${pending.length} proposed synthetic fixture answers still require human review (${pending.map(({ id }) => id).join(", ")}).`,
    );
  }
}

export function approvedFixtureAnswerBank(): Record<string, string> {
  assertFixtureBankReviewComplete();
  return Object.fromEntries(
    proposedFixtures.map(({ id, proposedHiddenAnswer }) => [
      id,
      proposedHiddenAnswer.text,
    ]),
  );
}

export async function validateProductKnowledgeReferences(): Promise<void> {
  for (const reference of productKnowledgeReferences) {
    const sourcePath = resolve(
      productKnowledgeRoot,
      reference.repositoryRelativePath,
    );
    const actualHash = createHash("sha256")
      .update(await readFile(sourcePath))
      .digest("hex");
    if (actualHash !== reference.sha256) {
      throw new Error(
        `Product Knowledge reference changed for ${reference.id}: expected ${reference.sha256}, received ${actualHash}. Review and intentionally re-freeze before any smoke execution.`,
      );
    }
  }
}
