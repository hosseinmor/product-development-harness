import { codexRuntimeGuardInvoker } from "./codex-runtime-guard-invoker.js";
import { ModelBackedPrdSemanticAuditor } from "./model-backed-prd-semantic-auditor.js";
import type { PrdSemanticAuditor } from "./runtime-guardrails.js";

export const codexPrdSemanticAuditor: PrdSemanticAuditor =
  new ModelBackedPrdSemanticAuditor(codexRuntimeGuardInvoker);
