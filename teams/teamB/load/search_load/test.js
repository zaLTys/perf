import { sleep } from 'k6';
import { get } from '../../../../scenarios/shared/http_client.js';
import { loadConfig } from '../../../../scenarios/shared/config_loader.js';

const scenarioFile = __ENV.SCENARIO_FILE || 'teams/teamB/load/search_load/config.yaml';
const config = loadConfig(scenarioFile);

export const options = {
  scenarios: config.scenarios,
  thresholds: config.thresholds || {},
  gracefulStop: '20s',
};

export default function () {
  const endpoint = (config.endpoints && config.endpoints.search) || '/search?q=test';
  get(config.base_url, endpoint);
  sleep(1);
}
