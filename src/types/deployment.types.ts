/**
 * Domain types for the deployments module.
 *
 * The wire shape matches the assignment payload exactly (snake_case fields,
 * `duration` in seconds), so the API mirrors the data the team handed us.
 */

/** Lifecycle state of a deployment. */
export const DEPLOYMENT_STATUSES = [
  'success',
  'failed',
  'in_progress',
  'rolled_back',
  'pending',
] as const;

export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

export interface Deployment {
  id: string;
  service: string;
  status: DeploymentStatus;
  /** Wall-clock duration of the deployment, in seconds. */
  duration: number;
  /** ISO-8601 timestamp of when the deployment ran. */
  timestamp: string;
  commit_sha: string;
}

/** Validated, normalized filters accepted by the list endpoint. */
export interface DeploymentQuery {
  service?: string;
  status?: DeploymentStatus;
}

/** Runtime guard used by the service to validate the `status` query param. */
export function isDeploymentStatus(value: string): value is DeploymentStatus {
  return (DEPLOYMENT_STATUSES as readonly string[]).includes(value);
}
