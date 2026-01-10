import { sleep } from 'k6';
import { get } from '../../../../scenarios/shared/http_client.js';

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://test-api.example.com';
const HEALTH_ENDPOINT = '/health';

export const options = {
  scenarios: {
    ramp: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
  gracefulStop: '30s',
};

export default function () {
  get(BASE_URL, HEALTH_ENDPOINT);
  sleep(1);
}
