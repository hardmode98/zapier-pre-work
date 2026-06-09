import { describe, expect, it } from 'vitest';
import { InMemoryDeploymentRepository } from '../src/modules/deployments/deployments.repository';
import { deploymentsSeed } from '../src/seed/deployments.seed';

/** Fresh repository over the seed data for each assertion. */
function repo(): InMemoryDeploymentRepository {
  return new InMemoryDeploymentRepository(deploymentsSeed);
}

describe('InMemoryDeploymentRepository', () => {
  it('returns all deployments when no query is given', async () => {
    expect(await repo().findAll()).toHaveLength(deploymentsSeed.length);
  });

  it('filters by service', async () => {
    const rows = await repo().findAll({ service: 'billing-api' });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((d) => d.service === 'billing-api')).toBe(true);
  });

  it('filters by status', async () => {
    const rows = await repo().findAll({ status: 'failed' });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((d) => d.status === 'failed')).toBe(true);
  });

  it('filters by service and status combined', async () => {
    const rows = await repo().findAll({ service: 'billing-api', status: 'failed' });
    expect(rows.every((d) => d.service === 'billing-api' && d.status === 'failed')).toBe(true);
  });

  it('returns an empty array for a valid filter that matches nothing', async () => {
    expect(await repo().findAll({ service: 'does-not-exist' })).toEqual([]);
  });

  it('finds by id and returns null when missing', async () => {
    expect(await repo().findById('deploy_001')).toMatchObject({ id: 'deploy_001' });
    expect(await repo().findById('nope')).toBeNull();
  });

  it('returns copies so callers cannot mutate the store', async () => {
    const r = repo();
    const first = await r.findById('deploy_001');
    first!.service = 'mutated';
    const again = await r.findById('deploy_001');
    expect(again!.service).toBe('billing-api');
  });
});
