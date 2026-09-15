import { createHash } from "node:crypto";
import type {
  StructuredAgentIsolation,
  StructuredAgentUsage,
} from "./structured-agent-invoker.js";
import type { PrdSemanticAuditor } from "./prd-semantic-auditor.js";

export type { PrdSemanticAuditor } from "./prd-semantic-auditor.js";

export const runtimeGuardrailConfig = {
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

export type GuardIsolation = StructuredAgentIsolation;

export type SemanticGuardResult<TAudit> = {
  threadId: string | null;
  audit: TAudit;
  usage: StructuredAgentUsage | null;
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
  semanticAuditor: PrdSemanticAuditor,
): Promise<SemanticGuardResult<AtomicityAudit>> {
  return semanticAuditor.auditAtomicity(questions);
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

  constructor(private readonly semanticAuditor: PrdSemanticAuditor) {}

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
    const semanticResult =
      cached ?? (await this.semanticAuditor.auditClarificationMateriality(input));
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

export type AuthoritySemanticAudit = { verdicts: AuthoritySemanticVerdict[] };

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

  constructor(private readonly semanticAuditor: PrdSemanticAuditor) {}

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
      semanticResult = await this.semanticAuditor.auditAuthority(
        delta,
        input.currentProductContext,
      );
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

  constructor(private readonly semanticAuditor: PrdSemanticAuditor) {}

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
    const result = cached ?? (await this.semanticAuditor.auditAlignment(input));
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
