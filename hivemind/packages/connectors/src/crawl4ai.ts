import { checkHttpHealth } from './http';
import type { HealthCheckResult } from '@hivemind/core';

export async function checkCrawl4AIHealth(url: string): Promise<HealthCheckResult> {
  return checkHttpHealth(url);
}
