/**
 * Custom error types for Hive Mind API interactions.
 */

export class HiveMindApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string,
  ) {
    super(`Hive Mind API ${status} (${statusText}): ${body}`);
    this.name = "HiveMindApiError";
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

export class HiveMindConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HiveMindConfigError";
  }
}

export class HiveMindNetworkError extends Error {
  constructor(cause: unknown) {
    super(
      `Network error connecting to Hive Mind API: ${cause instanceof Error ? cause.message : String(cause)}`
    );
    this.name = "HiveMindNetworkError";
  }
}
