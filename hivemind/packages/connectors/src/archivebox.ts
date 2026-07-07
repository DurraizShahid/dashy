import { checkHttpHealth } from './http';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkArchiveBoxHealth(url: string): Promise<HealthCheckResult> {
  return checkHttpHealth(url);
}
