import express, { type Express } from 'express';
import morgan from 'morgan';
import { config } from './config';
import { ok } from './http/response';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';
import { createDeploymentsRouter } from './modules/deployments/deployments.routes';

/**
 * Builds and configures the Express application.
 *
 * Intentionally decoupled from any module's dependencies — each feature module
 * wires its own (see its router factory), so this signature never grows as
 * modules are added. Mounting a new module is one `app.use()` line below; at many
 * modules you'd extract a route collator (see the README).
 *
 * Order matters: request logging → body parsing → feature routes → 404 catch-all
 * → global error handler (always last).
 */
export function createApp(): Express {
  const app = express();

  // Request logging — concise `dev` format, silenced during tests.
  if (!config.isTest) {
    app.use(morgan('dev'));
  }

  app.use(express.json());

  // Liveness/readiness probe — handy for on-call and load balancers.
  app.get('/health', (_req, res) => {
    res.status(200).json(ok({ status: 'ok', uptime: process.uptime() }, 'Service is healthy'));
  });

  // Feature modules — each owns its own wiring.
  app.use('/deployments', createDeploymentsRouter());

  // Unmatched route → custom 404 (must come after all real routes).
  app.use(notFound);

  // Centralized error handling (must be the final middleware).
  app.use(errorHandler);

  return app;
}
