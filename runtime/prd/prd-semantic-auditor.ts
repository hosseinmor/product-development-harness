import type {
  AtomicityAudit,
  AuthoritySemanticAudit,
  AuthoritySemanticAuditCase,
  ClarificationMaterialityAudit,
  ClarificationMaterialityInput,
  GuardrailProductQuestion,
  MaterialDecisionCoverageAudit,
  MaterialDecisionCoverageInput,
  SemanticGuardResult,
} from "./runtime-guardrails.js";

export interface PrdSemanticAuditor {
  auditAuthority(
    claims: AuthoritySemanticAuditCase[],
    currentProductContext: Array<{ url: string; title: string; context: string }>,
  ): Promise<SemanticGuardResult<AuthoritySemanticAudit>>;
  auditClarificationMateriality(
    input: ClarificationMaterialityInput,
  ): Promise<SemanticGuardResult<ClarificationMaterialityAudit>>;
  auditAtomicity(
    questions: GuardrailProductQuestion[],
  ): Promise<SemanticGuardResult<AtomicityAudit>>;
  auditAlignment(
    input: MaterialDecisionCoverageInput,
  ): Promise<SemanticGuardResult<MaterialDecisionCoverageAudit>>;
}
