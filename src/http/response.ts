/**
 * Canonical API response shapes.
 *
 * Every response the service emits — success or failure — is one of these two
 * interfaces, so clients can rely on a single, predictable envelope. Both carry
 * a human-readable `message`. Use the `ok()` / `fail()` builders rather than
 * constructing objects by hand so the shape stays consistent everywhere.
 */

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  /** Optional metadata (e.g. list `count`/`filters`); omitted for single resources. */
  meta?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
    /** Stack trace — populated only outside production by the error handler. */
    stack?: string;
  };
}

export function ok<T>(
  data: T,
  message: string,
  meta?: Record<string, unknown>,
): SuccessResponse<T> {
  const body: SuccessResponse<T> = { success: true, message, data };
  if (meta !== undefined) body.meta = meta;
  return body;
}

export function fail(
  message: string,
  code: string,
  details?: unknown,
  stack?: string,
): ErrorResponse {
  const error: ErrorResponse['error'] = { code };
  if (details !== undefined) error.details = details;
  if (stack !== undefined) error.stack = stack;
  return { success: false, message, error };
}
