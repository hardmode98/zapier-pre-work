import { ok } from '../../http/response';
import { asyncHandler } from '../../middleware/async-handler';
import type { DeploymentService, RawDeploymentQuery } from './deployments.service';

/**
 * Builds the deployment HTTP handlers, closing over the injected service.
 *
 * Plain functions — no class, no `this`. The service is captured once here rather
 * than threaded into each handler. Handlers hold no business logic; thrown errors
 * reach the global error handler via `asyncHandler`.
 */
export function createDeploymentController(service: DeploymentService) {
  return {
    list: asyncHandler(async (req, res) => {
      const query = service.parseQuery(req.query as RawDeploymentQuery);
      const deployments = await service.list(query);

      res.status(200).json(
        ok(deployments, 'Deployments retrieved', {
          count: deployments.length,
          filters: {
            service: query.service ?? null,
            status: query.status ?? null,
          },
        }),
      );
    }),

    getById: asyncHandler(async (req, res) => {
      const deployment = await service.getById(req.params.id as string);
      res.status(200).json(ok(deployment, 'Deployment retrieved'));
    }),
  };
}
