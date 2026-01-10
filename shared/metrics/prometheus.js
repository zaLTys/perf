import { Trend, Rate, Counter } from 'k6/metrics';

/**
 * Custom Prometheus-friendly metrics.
 * These are in addition to k6's built-in metrics like http_req_duration.
 */
export const http_req_duration_trend = new Trend('http_req_duration_trend');
export const http_errors = new Counter('http_errors');
export const success_rate = new Rate('success_rate');

/**
 * Track metrics for a single HTTP response.
 * Call this helper from the shared HTTP client wrapper.
 */
export function trackMetrics(res) {
  http_req_duration_trend.add(res.timings.duration);
  success_rate.add(res.status >= 200 && res.status < 400);

  if (res.status >= 400) {
    http_errors.add(1);
  }
}
