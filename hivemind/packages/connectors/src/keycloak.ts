import { checkHttpHealth } from './http';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkKeycloakHealth(url: string): Promise<HealthCheckResult> {
  return checkHttpHealth(url);
}
