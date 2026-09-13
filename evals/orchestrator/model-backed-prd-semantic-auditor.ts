import type { StructuredAgentInvoker } from "./structured-agent-invoker.js";
import {
  clarificationMaterialityClassifications,
  extractExplicitAssumptionsAndOpenDecisions,
  type AtomicityAudit,
  type AtomicityFinding,
  type AuthoritySemanticAudit,
  type AuthoritySemanticAuditCase,
  type AuthoritySemanticVerdict,
  type ClarificationMaterialityAudit,
  type ClarificationMaterialityFinding,
  type ClarificationMaterialityInput,
  type GuardrailProductQuestion,
  type MaterialDecisionCoverageAudit,
  type MaterialDecisionCoverageInput,
  type PrdSemanticAuditor,
  type SemanticGuardResult,
} from "./runtime-guardrails.js";

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

export const runtimeGuardrailSchemas = {
  atomicity: atomicityOutputSchema,
  clarificationMateriality: clarificationMaterialityOutputSchema,
  authorityDelta: authorityDeltaOutputSchema,
  materialDecisionCoverage: materialDecisionCoverageOutputSchema,
} as const;

type SemanticAuditExecution<TAudit> = {
  prompt: string;
  schema:
    | typeof atomicityOutputSchema
    | typeof clarificationMaterialityOutputSchema
    | typeof authorityDeltaOutputSchema
    | typeof materialDecisionCoverageOutputSchema;
  parse: (raw: unknown) => TAudit;
};

async function runSemanticAudit<TAudit>(
  invoker: StructuredAgentInvoker,
  { prompt, schema, parse }: SemanticAuditExecution<TAudit>,
): Promise<SemanticGuardResult<TAudit>> {
  const result = await invoker.invokeStructured({
    prompt,
    outputSchema: schema,
  });
  if (!result.sessionId || !result.finalResponse) {
    throw new Error("Runtime semantic guard completed without a result.");
  }
  return {
    threadId: result.sessionId,
    audit: parse(JSON.parse(result.finalResponse) as unknown),
    usage: result.usage,
    isolation: result.isolation,
  };
}

function parseAtomicityAudit(
  raw: unknown,
  questions: GuardrailProductQuestion[],
): AtomicityAudit {
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

export class ModelBackedPrdSemanticAuditor implements PrdSemanticAuditor {
  constructor(private readonly invoker: StructuredAgentInvoker) {}

  async auditAtomicity(
    questions: GuardrailProductQuestion[],
  ): Promise<SemanticGuardResult<AtomicityAudit>> {
    const prompt = `You are an independent Clarification Atomicity runtime guard. You are not the Product agent and have no Product decision authority.

Inspect each emitted clarification independently. A question is atomic only when one clearly nameable Product decision variable is resolved, all alternatives vary only that property, alternatives are mutually exclusive values of that property, and no option packages multiple independently answerable behaviors. If two alternatives can legitimately both be true, they are not values of one variable. Umbrella labels such as "level of effect" do not merge independent capabilities.

Examples of non-atomic axes include visibility plus ranking plus submission blocking plus rejection; prefill plus editability plus confirmation plus submission; and identity mechanism plus organization scope. A valid multi-option example is one requiredness-policy variable with all-required, all-optional, or configurable-per-item values.

Do not answer the questions, infer Product intent, mention fixtures, or resolve dependencies. Return one result per input question in the same order and copy question text exactly. For a failure, list the independently answerable axes. For a passing question, independentAxes must be empty.

Questions:
${JSON.stringify(questions, null, 2)}`;
    return runSemanticAudit(this.invoker, {
      prompt,
      schema: atomicityOutputSchema,
      parse: (raw) => parseAtomicityAudit(raw, questions),
    });
  }

  async auditClarificationMateriality(
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
    return runSemanticAudit(this.invoker, {
      prompt,
      schema: clarificationMaterialityOutputSchema,
      parse: (raw) => parseClarificationMaterialityAudit(raw, input.questions),
    });
  }

  async auditAuthority(
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
    return runSemanticAudit(this.invoker, {
      prompt,
      schema: authorityDeltaOutputSchema,
      parse: (raw) => parseAuthorityDelta(raw, claims),
    });
  }

  async auditAlignment(
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
    return runSemanticAudit(this.invoker, {
      prompt,
      schema: materialDecisionCoverageOutputSchema,
      parse: parseMaterialDecisionCoverageAudit,
    });
  }
}
