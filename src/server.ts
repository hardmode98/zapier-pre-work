import type { Server } from 'node:http';
import { createApp } from './app';
import { config } from './config';

/**
 * Process entrypoint: build the app, start the HTTP server, and install
 * process-level safety nets (unhandled rejections, uncaught exceptions, and
 * graceful shutdown on signals).
 */
function start(): void {
  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(
      `[server] listening on http://localhost:${config.port} (env=${config.env})`,
    );
  });

  installProcessHandlers(server);
}

/**
 * A rejected promise or thrown error with no handler leaves the process in an
 * undefined state. Log it, then shut the server down cleanly and exit non-zero so
 * an orchestrator can restart us from a known-good state.
 */
function installProcessHandlers(server: Server): void {
  const shutdown = (signal: string, code: number): void => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(() => {
      console.log('[server] closed remaining connections, exiting');
      process.exit(code);
    });
    // Failsafe: don't hang forever if connections refuse to drain.
    setTimeout(() => process.exit(code), 10_000).unref();
  };

  process.on('unhandledRejection', (reason) => {
    console.error('[server] unhandled promise rejection:', reason);
    shutdown('unhandledRejection', 1);
  });

  process.on('uncaughtException', (err) => {
    console.error('[server] uncaught exception:', err);
    shutdown('uncaughtException', 1);
  });

  process.on('SIGINT', () => shutdown('SIGINT', 0));
  process.on('SIGTERM', () => shutdown('SIGTERM', 0));
}

start();
