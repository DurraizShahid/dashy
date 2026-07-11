declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
    auth:
      | { type: 'api-key' }
      | { type: 'bearer' }
      | { type: 'keycloak'; sub: string; email?: string; preferred_username?: string; given_name?: string; family_name?: string }
      | { type: 'anonymous' };
  }
}

export {};
