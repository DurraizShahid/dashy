/**
 * Custom error types for Hive Mind API interactions.
 */

export class HiveMindApiError extends Error {
  public code: string | null;

  constructor(
    public status: number,
    public statusText: string,
    public body: string,
  ) {
    const label = statusText || _statusCodeLabel(status);
    let code: string | null = null;
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed.code === "string") code = parsed.code;
    } catch {
      // body not JSON, ignore
    }
    super(`Hive Mind API ${status}${label ? ` (${label})` : ""}: ${body}`);
    this.name = "HiveMindApiError";
    this.code = code;
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

function _statusCodeLabel(status: number): string {
  const labels: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return labels[status] || "";
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
