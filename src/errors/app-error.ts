/**
 * Typed application errors.
 *
 * Anything thrown in a service/controller that is an `AppError` is treated as a
 * deliberate, client-facing failure: the global error handler maps its
 * `statusCode`/`code`/`message` straight into the response. Anything else is
 * treated as an unexpected 500.
 */

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;
  /** Distinguishes intentional, client-facing errors from unexpected crashes. */
  readonly isOperational = true;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/** 400 — caller sent something invalid (bad query param, malformed input). */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/** 404 — requested resource or route does not exist. */
export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
  }
}
