import http from 'k6/http';
import { trackMetrics } from '../../metrics/prometheus.js';

/**
 * Shared HTTP wrapper for GET requests that automatically
 * records common metrics.
 */
export function get(baseUrl, endpoint, params = {}) {
  const url = `${baseUrl}${endpoint}`;
  const res = http.get(url, params);
  trackMetrics(res);
  return res;
}
