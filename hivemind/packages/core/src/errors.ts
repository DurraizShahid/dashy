export class HiveMindError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, statusCode = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'HiveMindError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ConfigurationError extends HiveMindError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONFIGURATION_ERROR', message, 500, details);
    this.name = 'ConfigurationError';
  }
}

export class ServiceUnavailableError extends HiveMindError {
  constructor(serviceName: string, cause?: unknown) {
    super(
      'SERVICE_UNAVAILABLE',
      `Service ${serviceName} is unavailable`,
      503,
      { service: serviceName, cause: cause instanceof Error ? cause.message : String(cause) },
    );
    this.name = 'ServiceUnavailableError';
  }
}

export class ValidationError extends HiveMindError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends HiveMindError {
  constructor(resource: string, id?: string) {
    super('NOT_FOUND', `${resource}${id ? ` '${id}'` : ''} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class AuthenticationError extends HiveMindError {
  constructor(message = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends HiveMindError {
  constructor(message = 'Insufficient permissions') {
    super('AUTHORIZATION_ERROR', message, 403);
    this.name = 'AuthorizationError';
  }
}
