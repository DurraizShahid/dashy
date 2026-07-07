import { checkHttpHealth } from './http';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkSearXNGHealth(url: string): Promise<HealthCheckResult> {
  return checkHttpHealth(url);
}
