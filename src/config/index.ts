/**
 * Application configuration, read once from `process.env` with safe defaults.
 *
 * Deliberately dependency-free (no dotenv): the service must run on a clean
 * checkout with zero environment set. Override any value by exporting it in the
 * shell, e.g. `PORT=4000 npm run dev`.
 */

export type NodeEnv = 'development' | 'production' | 'test';

export interface Config {
  readonly env: NodeEnv;
  readonly port: number;
  readonly isProduction: boolean;
  readonly isTest: boolean;
}

function parseEnv(value: string | undefined): NodeEnv {
  if (value === 'production' || value === 'test') return value;
  return 'development';
}

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const env = parseEnv(process.env.NODE_ENV);

export const config: Config = {
  env,
  port: parsePort(process.env.PORT, 3000),
  isProduction: env === 'production',
  isTest: env === 'test',
};
