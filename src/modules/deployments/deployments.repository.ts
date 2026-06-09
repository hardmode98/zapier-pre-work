import type { Deployment, DeploymentQuery } from '../../types/deployment.types';

/**
 * Data-access contract for deployments — this interface IS the dependency-inversion
 * boundary. The service depends only on it, never on a concrete store.
 *
 * A future Mongo/Postgres version is simply a new class implementing this same
 * interface (e.g. `MongoDeploymentRepository`) that runs `find()` on the typed
 * `Deployment` model — no generic datastore, no collection-name plumbing, and
 * nothing above the repository changes.
 */
export interface DeploymentRepository {
  findAll(query?: DeploymentQuery): Promise<Deployment[]>;
  findById(id: string): Promise<Deployment | null>;
}

/**
 * In-memory implementation backed by a plain array. Data lives for the process
 * lifetime; methods are `async` so an I/O-bound implementation drops in behind the
 * same interface. Reads return copies so callers can't mutate the store.
 */
export class InMemoryDeploymentRepository implements DeploymentRepository {
  constructor(private readonly deployments: Deployment[]) {}

  async findAll(query: DeploymentQuery = {}): Promise<Deployment[]> {
    return this.deployments
      .filter(
        (row) =>
          (query.service === undefined || row.service === query.service) &&
          (query.status === undefined || row.status === query.status),
      )
      .map((row) => ({ ...row }));
  }

  async findById(id: string): Promise<Deployment | null> {
    const match = this.deployments.find((row) => row.id === id);
    return match ? { ...match } : null;
  }
}
