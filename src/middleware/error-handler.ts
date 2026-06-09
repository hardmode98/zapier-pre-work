import type { ErrorRequestHandler } from 'express';
import { config } from '../config';
import { AppError } from '../errors/app-error';
import { fail } from '../http/response';

/**
 * Global error handler — the last middleware in the stack.
 *
 * Operational `AppError`s map directly to their status/code/message. Everything
 * else is an unexpected failure: respond with a generic 500 (never leak internal
 * messages) while always logging the real error server-side. The stack trace is
 * included in the response body only outside production.
 *
 * Express identifies this as an error handler by its four-argument signature, so
 * `next` must stay in the list even though it is unused.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_ERROR';
  const message = isAppError ? err.message : 'An unexpected error occurred';
  const details = isAppError ? err.details : undefined;

  // Always log unexpected errors (with full context) for observability.
  if (!isAppError) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  const stack = !config.isProduction && err instanceof Error ? err.stack : undefined;

  res.status(statusCode).json(fail(message, code, details, stack));
};
