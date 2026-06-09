import type { RequestHandler } from 'express';
import { NotFoundError } from '../errors/app-error';

/**
 * Catch-all for unmatched routes. Mounted after every real route and before the
 * error handler, it raises a `NotFoundError` so the client gets our consistent
 * JSON envelope instead of Express's default HTML "Cannot GET /x" page.
 */
export const notFound: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};
