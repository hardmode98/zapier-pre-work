import { NotFoundError, ValidationError } from '../../errors/app-error';
import type { DeploymentRepository } from './deployments.repository';
import {
  DEPLOYMENT_STATUSES,
  isDeploymentStatus,
  type Deployment,
  type DeploymentQuery,
} from '../../types/deployment.types';

/** Raw query string params as received from Express (all `string | undefined`). */
export interface RawDeploymentQuery {
  service?: string;
  status?: string;
}

/**
 * Business logic for deployments: validates input, then delegates to the
 * repository. Knows nothing about HTTP (req/res) or the concrete storage, so it
 * is trivially unit-testable.
 */
export class DeploymentService {
  constructor(private readonly repository: DeploymentRepository) {}

  /** List deployments matching an already-validated query. */
  async list(query: DeploymentQuery): Promise<Deployment[]> {
    return await this.repository.findAll(query);
  }

  /** Fetch one deployment, throwing a 404 if it does not exist. */
  async getById(id: string): Promise<Deployment> {
    const deployment = await this.repository.findById(id);
    if (!deployment) {
      throw new NotFoundError(`Deployment '${id}' not found`);
    }
    return deployment;
  }

  /** Validate and normalize raw query params into a typed {@link DeploymentQuery}. */
  parseQuery(raw: RawDeploymentQuery): DeploymentQuery {
    const query: DeploymentQuery = {};

    if (raw.service !== undefined) {
      const service = raw.service.trim();
      if (service === '') {
        throw new ValidationError('Query param "service" must not be empty');
      }
      query.service = service;
    }

    if (raw.status !== undefined) {
      const status = raw.status.trim();
      if (!isDeploymentStatus(status)) {
        throw new ValidationError(
          `Invalid status "${raw.status}". Must be one of: ${DEPLOYMENT_STATUSES.join(', ')}`,
          { allowed: DEPLOYMENT_STATUSES },
        );
      }
      query.status = status;
    }

    return query;
  }
}
