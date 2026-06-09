import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app';

/**
 * End-to-end HTTP tests via supertest — exercises routing, validation, the
 * response envelope, and the custom 404 / error handler without binding a port.
 * The app self-wires its modules (each defaults to its in-memory repository).
 */
describe('Deployments API', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  it('GET /deployments returns the full list in the standard envelope', async () => {
    const res = await request(app).get('/deployments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.message).toBe('string');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(30);
    expect(res.body.meta.count).toBe(res.body.data.length);
  });

  it('filters by status and service', async () => {
    const res = await request(app)
      .get('/deployments')
      .query({ status: 'failed', service: 'billing-api' });
    expect(res.status).toBe(200);
    expect(res.body.data.every((d: { service: string; status: string }) =>
      d.service === 'billing-api' && d.status === 'failed',
    )).toBe(true);
    expect(res.body.meta.filters).toEqual({ service: 'billing-api', status: 'failed' });
  });

  it('returns 400 with a message for an invalid status', async () => {
    const res = await request(app).get('/deployments').query({ status: 'bogus' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(typeof res.body.message).toBe('string');
  });

  it('GET /deployments/:id returns a single deployment', async () => {
    const res = await request(app).get('/deployments/deploy_001');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: 'deploy_001', service: 'billing-api' });
  });

  it('returns a 404 envelope for an unknown deployment id', async () => {
    const res = await request(app).get('/deployments/deploy_missing');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(typeof res.body.message).toBe('string');
  });

  it('returns a custom 404 for an unknown route', async () => {
    const res = await request(app).get('/totally/unknown');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.message).toContain('/totally/unknown');
  });

  it('exposes a health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });
});
