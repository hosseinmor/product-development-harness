import assert from "node:assert/strict";
import {
  AuthorityLedgerGuard,
  createAuthorityLedger,
  extendAuthorityLedger,
  type AuthorityClaimSidecar,
  type AuthoritySemanticAuditCase,
  type PrdSemanticAuditor,
} from "../../runtime/prd/runtime-guardrails.js";

const isolated = {
  workingDirectoryWasEmpty: true,
  workingDirectoryUnchanged: true,
  networkAccessEnabled: false as const,
  passed: true,
};

function auditorUsing(
  decide: (claim: AuthoritySemanticAuditCase) => {
    validPromotion: boolean;
    necessaryImplication?: boolean;
    reason: string;
  },
  calls: AuthoritySemanticAuditCase[][],
): PrdSemanticAuditor {
  const unexpected = async (): Promise<never> => {
    throw new Error("Unexpected semantic auditor method.");
  };
  return {
    auditAuthority: async (claims) => {
      calls.push(claims);
      return {
        threadId: `mock-audit-${calls.length}`,
        audit: {
          verdicts: claims.map((claim) => {
            const verdict = decide(claim);
            return {
              claimIndex: claim.claimIndex,
              necessaryImplication: verdict.necessaryImplication ?? false,
              validPromotion: verdict.validPromotion,
              reason: verdict.reason,
            };
          }),
        },
        usage: null,
        isolation: isolated,
      };
    },
    auditClarificationMateriality: unexpected,
    auditAtomicity: unexpected,
    auditAlignment: unexpected,
  };
}

function prd(claims: string[]): string {
  return `# Test PRD

## Scope

${claims.map((claim) => `- ${claim}`).join("\n")}

## Required Product Behavior

## Acceptance Criteria
`;
}

function directClaim(claim: string, authorityRef: string): AuthorityClaimSidecar {
  return {
    claim,
    section: "Scope",
    authorityRefs: [authorityRef],
    authorityType: authorityRef.startsWith("HD-") ? "human_decision" : "explicit_intent",
    derived: false,
  };
}

async function testIdempotence(): Promise<void> {
  const ledger = createAuthorityLedger(
    "Screening answers are available with the Application to the Employer.",
  );
  const claim = "Screening answers are available with the Application to the Employer.";
  const calls: AuthoritySemanticAuditCase[][] = [];
  const guard = new AuthorityLedgerGuard(
    auditorUsing(
      () => ({ validPromotion: true, reason: "The cited PM statement is an exact match." }),
      calls,
    ),
  );
  const input = {
    ledger,
    claims: [directClaim(claim, "PM-001")],
    currentProductContext: [],
    prdMarkdown: prd([claim]),
  };
  const first = await guard.audit({ ...input, phase: "initial" });
  const second = await guard.audit({ ...input, phase: "repair" });
  assert.equal(first.audit.passed, true);
  assert.equal(second.audit.passed, true);
  assert.equal(calls.length, 1);
  assert.equal(second.instrumentation.semanticAuditCallCount, 0);
  assert.equal(second.instrumentation.cacheHits, 1);
  assert.equal(second.audit.claims[0]?.verdictSource, "cache");
}

async function testDeltaRepair(): Promise<void> {
  const ledger = createAuthorityLedger(
    "The retained authoritative claim.\n\nRejected consequence two.",
  );
  const retained = "The retained authoritative claim.";
  const rejectedOne = "Rejected consequence one.";
  const rejectedTwo = "Rejected consequence two.";
  const calls: AuthoritySemanticAuditCase[][] = [];
  const guard = new AuthorityLedgerGuard(
    auditorUsing(
      (claim) => {
        const established = claim.citedAuthorities.some(
          (authority) => authority.statement === claim.claim,
        );
        return {
          validPromotion: established,
          reason: established
            ? "The cited authority directly establishes this claim."
            : "The cited authority does not establish this consequence.",
        };
      },
      calls,
    ),
  );
  const first = await guard.audit({
    ledger,
    claims: [retained, rejectedOne, rejectedTwo].map((claim) => directClaim(claim, "PM-001")),
    currentProductContext: [],
    prdMarkdown: prd([retained, rejectedOne, rejectedTwo]),
    phase: "initial",
  });
  assert.equal(first.audit.passed, false);
  const second = await guard.audit({
    ledger,
    claims: [directClaim(retained, "PM-001"), directClaim(rejectedTwo, "PM-002")],
    currentProductContext: [],
    prdMarkdown: prd([retained, rejectedTwo]),
    phase: "repair",
  });
  assert.equal(second.audit.passed, true);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1]?.map((claim) => claim.claim), [rejectedTwo]);
  assert.equal(second.instrumentation.cacheHits, 1);
  assert.equal(second.instrumentation.semanticClaimsSubmitted, 1);
  assert.deepEqual(second.instrumentation.claimsRecheckedAfterRepair, [rejectedTwo]);
  assert.equal(second.audit.claims.find((claim) => claim.claim === retained)?.verdictSource, "cache");
}

async function testExplicitPmIntent(): Promise<void> {
  const ledger = createAuthorityLedger(
    "Screening answers are available with the Application to the Employer.",
  );
  const claim = "Screening answers are available with the Application to the Employer.";
  const calls: AuthoritySemanticAuditCase[][] = [];
  const guard = new AuthorityLedgerGuard(
    auditorUsing(
      (candidate) => ({
        validPromotion: candidate.citedAuthorities.some(
          (authority) => authority.statement === candidate.claim,
        ),
        reason: "The cited PM statement directly establishes the matching claim.",
      }),
      calls,
    ),
  );
  const result = await guard.audit({
    ledger,
    claims: [directClaim(claim, "PM-001")],
    currentProductContext: [],
    prdMarkdown: prd([claim]),
    phase: "initial",
  });
  assert.equal(result.audit.passed, true);
  assert.equal(result.audit.claims[0]?.authorityStatus, "explicit_intent");
}

async function testUnsupportedConsequence(): Promise<void> {
  let ledger = createAuthorityLedger("Employers can add Screening Questions.");
  ledger = extendAuthorityLedger(ledger, [
    { question: "Requiredness?", answer: "All Screening Questions are required." },
  ]);
  assert.deepEqual(ledger.items.map((item) => item.id), ["PM-001", "HD-001"]);
  const claim = "A missing answer blocks Application submission.";
  const calls: AuthoritySemanticAuditCase[][] = [];
  const guard = new AuthorityLedgerGuard(
    auditorUsing(
      () => ({
        validPromotion: false,
        reason: "Requiredness can be true while submission blocking is false.",
      }),
      calls,
    ),
  );
  const result = await guard.audit({
    ledger,
    claims: [directClaim(claim, "HD-001")],
    currentProductContext: [],
    prdMarkdown: prd([claim]),
    phase: "initial",
  });
  assert.equal(result.audit.passed, false);
  assert.equal(result.audit.claims[0]?.validPromotion, false);
}

async function testUnsupportedInheritance(): Promise<void> {
  const ledger = createAuthorityLedger("Employers can add Screening Questions to Job Posts.");
  const claim = "The new Screening capability is internal-only.";
  const calls: AuthoritySemanticAuditCase[][] = [];
  const guard = new AuthorityLedgerGuard(
    auditorUsing(
      () => ({
        validPromotion: false,
        necessaryImplication: false,
        reason: "The current flow can be internal-only while the new capability uses another scope.",
      }),
      calls,
    ),
  );
  const result = await guard.audit({
    ledger,
    claims: [
      {
        claim,
        section: "Scope",
        authorityRefs: [],
        authorityType: "current_product_constraint",
        derived: true,
      },
    ],
    currentProductContext: [
      { url: "pk://apply", title: "Current Apply", context: "Current Apply is internal-only." },
    ],
    prdMarkdown: prd([claim]),
    phase: "initial",
  });
  assert.equal(result.audit.passed, false);
  assert.equal(calls.length, 0);
  assert.equal(result.instrumentation.deterministicVerdicts, 1);
}

async function testLaterAuthorityInvalidatesByRefs(): Promise<void> {
  let ledger = createAuthorityLedger("Employers can add Screening Questions.");
  ledger = extendAuthorityLedger(ledger, [
    { question: "Requiredness?", answer: "All Screening Questions are required." },
  ]);
  assert.deepEqual(ledger.items.map((item) => item.id), ["PM-001", "HD-001"]);
  const claim = "A missing answer blocks Application submission.";
  const calls: AuthoritySemanticAuditCase[][] = [];
  const guard = new AuthorityLedgerGuard(
    auditorUsing(
      (candidate) => ({
        validPromotion: candidate.citedAuthorities.some((item) =>
          item.statement.includes("blocks Application submission"),
        ),
        reason: "Only the independently revealed submission decision establishes blocking.",
      }),
      calls,
    ),
  );
  const first = await guard.audit({
    ledger,
    claims: [directClaim(claim, "HD-001")],
    currentProductContext: [],
    prdMarkdown: prd([claim]),
    phase: "initial",
  });
  assert.equal(first.audit.passed, false);

  ledger = extendAuthorityLedger(ledger, [
    {
      question: "Missing-answer consequence?",
      answer: "A missing answer blocks Application submission.",
    },
  ]);
  assert.deepEqual(ledger.items.map((item) => item.id), ["PM-001", "HD-001", "HD-002"]);
  const second = await guard.audit({
    ledger,
    claims: [directClaim(claim, "HD-002")],
    currentProductContext: [],
    prdMarkdown: prd([claim]),
    phase: "reconciliation",
  });
  assert.equal(second.audit.passed, true);
  assert.equal(second.audit.claims[0]?.authorityStatus, "human_decision");
  assert.equal(calls.length, 2);
  assert.equal(second.instrumentation.cacheHits, 0);
}

async function testResumeDerivedSearchLinkageRegression(): Promise<void> {
  const ledger = createAuthorityLedger(`می‌خواهیم کارجو بتواند بر اساس اطلاعات رزومه‌اش، بدون وارد کردن دستی عبارت جست‌وجو یا تنظیم فیلترها، جست‌وجوی شغل انجام دهد و مستقیماً وارد صفحه نتایج متناسب شود.

سیستم باید بر اساس رزومه، مقادیر مناسب برای جست‌وجو مثل keyword، گروه شغلی و فیلترهای مرتبط را تعیین کند.`);
  const claim =
    "مقادیر جست‌وجویی که برای تولید آن نتایج استفاده می‌شوند توسط سیستم و بر اساس اطلاعات رزومه تعیین شده‌اند.";
  const calls: AuthoritySemanticAuditCase[][] = [];
  const guard = new AuthorityLedgerGuard(
    auditorUsing(
      (candidate) => {
        assert.equal(candidate.claim, claim);
        assert.equal(candidate.section, "Acceptance Criteria");
        assert.deepEqual(candidate.authorityRefs, ["PM-001", "PM-002"]);
        assert.equal(candidate.authorityType, "necessary_implication");
        assert.equal(candidate.derived, true);
        assert.deepEqual(
          candidate.citedAuthorities.map(({ id }) => id),
          ["PM-001", "PM-002"],
        );
        return {
          validPromotion: true,
          necessaryImplication: true,
          reason:
            "PM-001 defines one Resume-based search that reaches matching results, while PM-002 requires the system to determine that search's values from the Resume; the cited values must therefore be the inputs used to produce those results.",
        };
      },
      calls,
    ),
  );
  const result = await guard.audit({
    ledger,
    claims: [
      {
        claim,
        section: "Acceptance Criteria",
        authorityRefs: ["PM-001", "PM-002"],
        authorityType: "necessary_implication",
        derived: true,
      },
    ],
    currentProductContext: [],
    prdMarkdown: `# جست‌وجوی شغل مبتنی بر رزومه

## Scope

## Required Product Behavior

## Acceptance Criteria

- ${claim}
`,
    phase: "initial",
  });

  assert.equal(result.audit.passed, true);
  assert.equal(result.audit.claims[0]?.validPromotion, true);
  assert.equal(result.audit.claims[0]?.necessaryImplication, true);
  assert.equal(result.audit.claims[0]?.authorityStatus, "necessary_implication");
  assert.equal(result.audit.claims[0]?.verdictSource, "semantic_audit");
  assert.equal(result.instrumentation.semanticAuditCallCount, 1);
  assert.equal(result.instrumentation.cacheHits, 0);
  assert.equal(calls.length, 1);
}

await testIdempotence();
await testDeltaRepair();
await testExplicitPmIntent();
await testUnsupportedConsequence();
await testUnsupportedInheritance();
await testLaterAuthorityInvalidatesByRefs();
await testResumeDerivedSearchLinkageRegression();

console.log(
  JSON.stringify(
    {
      passed: true,
      tests: 7,
      coverage: [
        "idempotent cached verdict without a second semantic call",
        "delta repair audits only changed claims and caches unchanged accepted claims",
        "explicit PM Intent directly authorizes a matching claim",
        "requiredness does not authorize submission blocking",
        "current internal-only flow does not authorize intended internal-only scope",
        "new human authority plus changed authorityRefs invalidates the old verdict",
        "the exact Resume-derived search linkage rejected in the real-world run is a valid necessary implication",
      ],
    },
    null,
    2,
  ),
);
