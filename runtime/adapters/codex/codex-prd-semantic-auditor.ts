import { codexRuntimeGuardInvoker } from "./codex-runtime-guard-invoker.js";
import { ModelBackedPrdSemanticAuditor } from "../../prd/model-backed-prd-semantic-auditor.js";
import type { PrdSemanticAuditor } from "../../prd/prd-semantic-auditor.js";

export const codexPrdSemanticAuditor: PrdSemanticAuditor =
  new ModelBackedPrdSemanticAuditor(codexRuntimeGuardInvoker);
