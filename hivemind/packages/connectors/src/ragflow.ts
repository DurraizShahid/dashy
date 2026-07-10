import { checkHttpHealth } from './http';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkRAGFlowHealth(url: string): Promise<HealthCheckResult> {
  return checkHttpHealth(url);
}
