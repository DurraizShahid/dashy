declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
    auth: { type: 'api-key' | 'bearer' | 'anonymous' };
  }
}

export {};
