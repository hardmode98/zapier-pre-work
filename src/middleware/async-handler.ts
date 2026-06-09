import type { NextFunction, Request, Response, RequestHandler } from 'express';

/**
 * Wraps an async route handler so a rejected promise is forwarded to Express's
 * error pipeline via `next(err)`.
 *
 * Express 4 does NOT catch rejections from async handlers on its own — an
 * unhandled rejection there would otherwise bypass the global error handler (and
 * could crash the process). Wrapping every async controller keeps error handling
 * centralized and consistent.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
