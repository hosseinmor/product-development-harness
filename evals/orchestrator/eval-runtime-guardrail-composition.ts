import type {
  AtomicityAudit,
  AuthorityAudit,
  ClarificationMaterialityAudit,
  GuardrailProductQuestion,
  GuardValidationResult,
  MaterialDecisionCoverageAudit,
} from "./runtime-guardrails.js";

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
