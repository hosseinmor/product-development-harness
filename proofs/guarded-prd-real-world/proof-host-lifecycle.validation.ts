import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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

const semanticCalls: AuthoritySemanticAuditCase[][] = [];
const unexpected = async (): Promise<never> => {
  throw new Error("Unexpected semantic auditor method.");
};
const auditor: PrdSemanticAuditor = {
  auditAuthority: async (claims) => {
    semanticCalls.push(claims);
    return {
      threadId: `proof-host-validation-${semanticCalls.length}`,
      audit: {
        verdicts: claims.map(({ claimIndex }) => ({
          claimIndex,
          necessaryImplication: true,
          validPromotion: true,
          reason: "The unchanged cited intent necessarily implies the claim.",
        })),
      },
      usage: null,
      isolation: isolated,
    };
  },
  auditClarificationMateriality: unexpected,
  auditAtomicity: unexpected,
  auditAlignment: unexpected,
};

async function main(): Promise<void> {
  const claimText = "The derived values form the search that opens the matching results page.";
  const claim: AuthorityClaimSidecar = {
    claim: claimText,
    section: "Required Product Behavior",
    authorityRefs: ["PM-001"],
    authorityType: "necessary_implication",
    derived: true,
  };
  const prdMarkdown = `# Validation PRD

## Scope

## Required Product Behavior

- ${claimText}

## Acceptance Criteria
`;

  let ledger = createAuthorityLedger(
    "The system derives search values and opens the matching results page.",
  );
  const authorityGuard = new AuthorityLedgerGuard(auditor);
  const first = await authorityGuard.audit({
    ledger,
    claims: [claim],
    currentProductContext: [],
    prdMarkdown,
    phase: "initial",
  });

  ledger = extendAuthorityLedger(ledger, [
    { question: "Unrelated eligibility decision?", answer: "At least one signal is required." },
  ]);
  const second = await authorityGuard.audit({
    ledger,
    claims: [claim],
    currentProductContext: [],
    prdMarkdown,
    phase: "reconciliation",
  });

  assert.equal(first.instrumentation.authorityStateVersion, 1);
  assert.equal(second.instrumentation.authorityStateVersion, 2);
  assert.equal(semanticCalls.length, 1);
  assert.equal(second.instrumentation.semanticAuditCallCount, 0);
  assert.equal(second.instrumentation.cacheHits, 1);
  assert.equal(second.audit.claims[0]?.verdictSource, "cache");

  const proofDirectory = dirname(fileURLToPath(import.meta.url));
  const hostSource = await readFile(resolve(proofDirectory, "run.ts"), "utf8");
  const productTurnBody = hostSource.slice(
    hostSource.indexOf("async function runGuardedProductTurn"),
    hostSource.indexOf("async function finishOrExpose"),
  );
  const alignmentBody = hostSource.slice(
    hostSource.indexOf("async function finishOrExpose"),
    hostSource.indexOf("function validatePmInput"),
  );

  assert.match(hostSource, /const guards = createGuardSession\(\);/);
  assert.match(productTurnBody, /guards: GuardSession/);
  assert.doesNotMatch(productTurnBody, /new AuthorityLedgerGuard|new ClarificationMaterialityGuard/);
  assert.match(alignmentBody, /guards\.materialDecisionCoverage\.audit/);
  assert.doesNotMatch(alignmentBody, /new MaterialDecisionCoverageGuard/);
  assert.match(hostSource, /runInteractive\(guards: GuardSession\)/);
  assert.match(
    hostSource,
    /--answers cannot preserve in-memory Guard state across PM rounds/,
  );

  console.log(
    JSON.stringify(
      {
        passed: true,
        validations: [
          "one GuardSession is injected across Product and Alignment turns",
          "interactive PM rounds stay in one proof-host process",
          "the legacy cross-process answer path cannot silently discard Guard state",
          "an unchanged claim and cited-authority fingerprint reuse the Authority portable cache after ledger evolution",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
