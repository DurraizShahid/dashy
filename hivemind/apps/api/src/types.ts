declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
    auth:
      | { type: 'api-key' }
      | { type: 'anonymous' };
  }
}

export {};
