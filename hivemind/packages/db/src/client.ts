import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

let dbClient: ReturnType<typeof drizzle<typeof schema>> | null = null;
let pgClient: ReturnType<typeof postgres> | null = null;

export function createDbClient(databaseUrl: string) {
  if (dbClient) return dbClient;

  pgClient = postgres(databaseUrl, { max: 10, ssl: 'require' });
  dbClient = drizzle(pgClient, { schema });

  return dbClient;
}

export function getDbClient() {
  if (!dbClient) {
    throw new Error('DB client not initialized. Call createDbClient first.');
  }
  return dbClient;
}

export async function closeDbClient() {
  if (pgClient) {
    await pgClient.end();
    pgClient = null;
    dbClient = null;
  }
}

export async function checkDbHealth(): Promise<boolean> {
  if (!pgClient) return false;
  try {
    const result = await pgClient`SELECT 1`;
    return result.length === 1;
  } catch {
    return false;
  }
}
