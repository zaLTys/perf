import { sleep } from 'k6';
import { get } from '../../../../shared/http_client.js';

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://test-api.example.com';
const HEALTH_ENDPOINT = '/health';

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 300,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.05'],
  },
  gracefulStop: '30s',
};

export default function () {
  get(BASE_URL, HEALTH_ENDPOINT);
  sleep(0.5);
}
