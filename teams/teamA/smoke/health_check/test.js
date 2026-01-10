import { sleep } from 'k6';
import { get } from '../../../../scenarios/shared/http_client.js';

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://test-api.example.com';
const HEALTH_ENDPOINT = '/health';

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
  gracefulStop: '10s',
};

export default function () {
  get(BASE_URL, HEALTH_ENDPOINT);
  sleep(1);
}

export default function () {
  get(config.base_url, config.endpoints.health || '/health');
  sleep(1);
}
