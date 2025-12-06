import { sleep } from 'k6';
import { get } from '../../../../scenarios/shared/http_client.js';
import { loadConfig } from '../../../../scenarios/shared/config_loader.js';

const scenarioFile = __ENV.SCENARIO_FILE || 'teams/teamA/smoke/health_check/config.yaml';
const config = loadConfig(scenarioFile);

export const options = {
  scenarios: config.scenarios,
  thresholds: config.thresholds || {},
  gracefulStop: '10s',
};

export default function () {
  get(config.base_url, config.endpoints.health || '/health');
  sleep(1);
}
