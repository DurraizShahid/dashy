import { checkHttpHealth } from './http';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkWorldMonitorHealth(url: string): Promise<HealthCheckResult> {
  return checkHttpHealth(url);
}
