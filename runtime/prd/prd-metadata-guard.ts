export type PrdArtifactIdAuditInput = {
  previousId?: string | null;
  nextId?: string | null;
  identityMigrationEstablished?: boolean;
};

export type PrdArtifactIdAudit = {
  passed: boolean;
  previousId: string | null;
  nextId: string | null;
  reason: string;
};

const placeholderIds = new Set([
  "unresolved",
  "unknown",
  "tbd",
  "todo",
  "none",
  "null",
]);

function normalizeId(value: string | null | undefined): string | null {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function isStableId(value: string | null): boolean {
  if (!value) return false;
  return !placeholderIds.has(value.toLowerCase());
}

/**
 * Protects durable PRD identity across redrafting and reconciliation.
 *
 * This guard intentionally does not prescribe how a new PRD ID is generated.
 * It only prevents an already-established non-placeholder ID from silently
 * changing or regressing to an unresolved/placeholder value.
 */
export function auditStablePrdArtifactId({
  previousId,
  nextId,
  identityMigrationEstablished = false,
}: PrdArtifactIdAuditInput): PrdArtifactIdAudit {
  const before = normalizeId(previousId);
  const after = normalizeId(nextId);

  if (!isStableId(before)) {
    return {
      passed: true,
      previousId: before,
      nextId: after,
      reason: "No stable prior PRD ID exists, so identity preservation is not applicable.",
    };
  }

  if (before === after) {
    return {
      passed: true,
      previousId: before,
      nextId: after,
      reason: "The established PRD ID was preserved.",
    };
  }

  if (identityMigrationEstablished && isStableId(after)) {
    return {
      passed: true,
      previousId: before,
      nextId: after,
      reason: "A deliberate identity migration was established and the new ID is non-placeholder.",
    };
  }

  if (!isStableId(after)) {
    return {
      passed: false,
      previousId: before,
      nextId: after,
      reason: "An established PRD ID must not regress to a missing or placeholder identity.",
    };
  }

  return {
    passed: false,
    previousId: before,
    nextId: after,
    reason: "An established PRD ID changed without an explicit identity migration.",
  };
}
