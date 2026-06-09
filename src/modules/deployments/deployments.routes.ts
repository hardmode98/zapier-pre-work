import { Router } from 'express';
import { deploymentsSeed } from '../../seed/deployments.seed';
import { createDeploymentController } from './deployments.controller';
import {
  InMemoryDeploymentRepository,
  type DeploymentRepository,
} from './deployments.repository';
import { DeploymentService } from './deployments.service';

/**
 * Composition root for the deployments module: wires repository → service →
 * controllers and returns the router.
 *
 * Defaults to the in-memory repository (seeded) so the app never has to know or
 * thread this module's storage. Pass a `repository` to inject a different
 * implementation (a fake in tests, Mongo in prod) — this default arg is the single
 * place the concrete store is named.
 */
export function createDeploymentsRouter(
  repository: DeploymentRepository = new InMemoryDeploymentRepository(deploymentsSeed),
): Router {
  const service = new DeploymentService(repository);
  const controller = createDeploymentController(service);

  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  return router;
}
