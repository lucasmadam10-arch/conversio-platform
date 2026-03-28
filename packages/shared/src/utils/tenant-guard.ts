import { TenantIsolationError } from "../errors/app-error";

export function assertTenantMatch(
  recordTenantId: string,
  contextTenantId: string,
): void {
  if (recordTenantId !== contextTenantId) {
    throw new TenantIsolationError(
      `Record tenant ${recordTenantId} does not match context ${contextTenantId}`,
    );
  }
}
