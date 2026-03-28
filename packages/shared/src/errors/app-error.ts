export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Unauthenticated") {
    super(message, "UNAUTHENTICATED", 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(message, "RATE_LIMITED", 429);
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, "INTERNAL_ERROR", 500);
  }
}

export class TenantIsolationError extends AppError {
  constructor(message = "Tenant isolation violation") {
    super(message, "TENANT_ISOLATION_VIOLATION", 403);
  }
}
