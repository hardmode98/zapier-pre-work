import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundError, ValidationError } from '../src/errors/app-error';
import { InMemoryDeploymentRepository } from '../src/modules/deployments/deployments.repository';
import { DeploymentService } from '../src/modules/deployments/deployments.service';
import { deploymentsSeed } from '../src/seed/deployments.seed';

/**
 * Pure unit tests: the service is constructed against a throwaway in-memory
 * repository (dependency injection), so no HTTP server or global state is needed.
 */
function buildService(): DeploymentService {
  return new DeploymentService(new InMemoryDeploymentRepository(deploymentsSeed));
}

describe('DeploymentService', () => {
  let service: DeploymentService;

  beforeEach(() => {
    service = buildService();
  });

  it('lists all deployments when no filter is applied', async () => {
    const all = await service.list({});
    expect(all).toHaveLength(deploymentsSeed.length);
  });

  it('filters by service and status together', async () => {
    const query = service.parseQuery({ service: 'billing-api', status: 'failed' });
    const results = await service.list(query);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((d) => d.service === 'billing-api' && d.status === 'failed')).toBe(true);
  });

  it('rejects an invalid status with a ValidationError', () => {
    expect(() => service.parseQuery({ status: 'exploded' })).toThrow(ValidationError);
  });

  it('rejects an empty service with a ValidationError', () => {
    expect(() => service.parseQuery({ service: '   ' })).toThrow(ValidationError);
  });

  it('returns a single deployment by id', async () => {
    const deployment = await service.getById('deploy_001');
    expect(deployment).toMatchObject({ id: 'deploy_001', service: 'billing-api' });
  });

  it('throws a NotFoundError for an unknown id', async () => {
    await expect(service.getById('deploy_missing')).rejects.toThrow(NotFoundError);
  });
});
