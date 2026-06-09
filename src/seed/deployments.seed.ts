import type { Deployment } from '../types/deployment.types';

/**
 * Mock deployment events used to seed the in-memory repository at startup.
 *
 * Spread deliberately across five services, all five statuses, a range of
 * durations, and timestamps spanning several weeks so the list/filter endpoints
 * (and the metrics/anomaly features built in the live session) have realistic
 * data to work with.
 */
export const deploymentsSeed: Deployment[] = [
  { id: 'deploy_001', service: 'billing-api', status: 'success', duration: 142, timestamp: '2025-04-01T09:12:00Z', commit_sha: 'a1b2c3d' },
  { id: 'deploy_002', service: 'billing-api', status: 'failed', duration: 320, timestamp: '2025-04-03T14:32:00Z', commit_sha: 'b2c3d4e' },
  { id: 'deploy_003', service: 'billing-api', status: 'success', duration: 138, timestamp: '2025-04-06T11:05:00Z', commit_sha: 'c3d4e5f' },
  { id: 'deploy_004', service: 'billing-api', status: 'rolled_back', duration: 410, timestamp: '2025-04-09T16:48:00Z', commit_sha: 'd4e5f6a' },
  { id: 'deploy_005', service: 'billing-api', status: 'success', duration: 151, timestamp: '2025-04-14T08:20:00Z', commit_sha: 'e5f6a7b' },
  { id: 'deploy_006', service: 'billing-api', status: 'in_progress', duration: 0, timestamp: '2025-04-28T14:32:00Z', commit_sha: 'f6a7b8c' },

  { id: 'deploy_007', service: 'auth-service', status: 'success', duration: 88, timestamp: '2025-04-02T10:00:00Z', commit_sha: '1a2b3c4' },
  { id: 'deploy_008', service: 'auth-service', status: 'success', duration: 92, timestamp: '2025-04-05T13:15:00Z', commit_sha: '2b3c4d5' },
  { id: 'deploy_009', service: 'auth-service', status: 'failed', duration: 205, timestamp: '2025-04-08T19:40:00Z', commit_sha: '3c4d5e6' },
  { id: 'deploy_010', service: 'auth-service', status: 'success', duration: 79, timestamp: '2025-04-12T07:55:00Z', commit_sha: '4d5e6f7' },
  { id: 'deploy_011', service: 'auth-service', status: 'pending', duration: 0, timestamp: '2025-04-27T22:10:00Z', commit_sha: '5e6f7a8' },
  { id: 'deploy_012', service: 'auth-service', status: 'success', duration: 101, timestamp: '2025-04-29T09:30:00Z', commit_sha: '6f7a8b9' },

  { id: 'deploy_013', service: 'web-frontend', status: 'success', duration: 64, timestamp: '2025-04-01T12:00:00Z', commit_sha: 'aa11bb2' },
  { id: 'deploy_014', service: 'web-frontend', status: 'success', duration: 71, timestamp: '2025-04-04T15:25:00Z', commit_sha: 'bb22cc3' },
  { id: 'deploy_015', service: 'web-frontend', status: 'failed', duration: 188, timestamp: '2025-04-07T18:10:00Z', commit_sha: 'cc33dd4' },
  { id: 'deploy_016', service: 'web-frontend', status: 'rolled_back', duration: 240, timestamp: '2025-04-10T20:45:00Z', commit_sha: 'dd44ee5' },
  { id: 'deploy_017', service: 'web-frontend', status: 'success', duration: 68, timestamp: '2025-04-18T06:35:00Z', commit_sha: 'ee55ff6' },
  { id: 'deploy_018', service: 'web-frontend', status: 'success', duration: 73, timestamp: '2025-04-25T11:50:00Z', commit_sha: 'ff66aa7' },
  { id: 'deploy_019', service: 'web-frontend', status: 'in_progress', duration: 0, timestamp: '2025-04-30T13:05:00Z', commit_sha: 'aa77bb8' },

  { id: 'deploy_020', service: 'notifications-worker', status: 'success', duration: 115, timestamp: '2025-04-02T08:45:00Z', commit_sha: '9c8d7e6' },
  { id: 'deploy_021', service: 'notifications-worker', status: 'failed', duration: 277, timestamp: '2025-04-05T17:20:00Z', commit_sha: '8d7e6f5' },
  { id: 'deploy_022', service: 'notifications-worker', status: 'failed', duration: 301, timestamp: '2025-04-11T21:00:00Z', commit_sha: '7e6f5a4' },
  { id: 'deploy_023', service: 'notifications-worker', status: 'success', duration: 109, timestamp: '2025-04-16T09:15:00Z', commit_sha: '6f5a4b3' },
  { id: 'deploy_024', service: 'notifications-worker', status: 'success', duration: 122, timestamp: '2025-04-22T14:40:00Z', commit_sha: '5a4b3c2' },
  { id: 'deploy_025', service: 'notifications-worker', status: 'pending', duration: 0, timestamp: '2025-04-28T23:55:00Z', commit_sha: '4b3c2d1' },

  { id: 'deploy_026', service: 'search-api', status: 'success', duration: 196, timestamp: '2025-04-03T10:30:00Z', commit_sha: 'c0ffee1' },
  { id: 'deploy_027', service: 'search-api', status: 'success', duration: 203, timestamp: '2025-04-06T12:10:00Z', commit_sha: 'c0ffee2' },
  { id: 'deploy_028', service: 'search-api', status: 'failed', duration: 540, timestamp: '2025-04-09T15:00:00Z', commit_sha: 'c0ffee3' },
  { id: 'deploy_029', service: 'search-api', status: 'success', duration: 188, timestamp: '2025-04-13T08:05:00Z', commit_sha: 'c0ffee4' },
  { id: 'deploy_030', service: 'search-api', status: 'rolled_back', duration: 612, timestamp: '2025-04-17T19:25:00Z', commit_sha: 'c0ffee5' },
  { id: 'deploy_031', service: 'search-api', status: 'success', duration: 210, timestamp: '2025-04-21T07:45:00Z', commit_sha: 'c0ffee6' },
  { id: 'deploy_032', service: 'search-api', status: 'success', duration: 199, timestamp: '2025-04-26T16:30:00Z', commit_sha: 'c0ffee7' },
  { id: 'deploy_033', service: 'search-api', status: 'in_progress', duration: 0, timestamp: '2025-04-30T18:00:00Z', commit_sha: 'c0ffee8' },

  { id: 'deploy_034', service: 'billing-api', status: 'success', duration: 134, timestamp: '2025-05-02T09:00:00Z', commit_sha: 'abc1234' },
  { id: 'deploy_035', service: 'auth-service', status: 'failed', duration: 198, timestamp: '2025-05-03T11:20:00Z', commit_sha: 'def5678' },
  { id: 'deploy_036', service: 'search-api', status: 'success', duration: 205, timestamp: '2025-05-04T13:40:00Z', commit_sha: 'ghi9012' },
];
