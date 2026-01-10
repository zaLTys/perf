/**
 * Static bearer token provider.
 *
 * Inject AUTH_TOKEN via environment, e.g.:
 *   AUTH_TOKEN=xxx k6 run ...
 */
export function getStaticToken() {
  const token = __ENV.AUTH_TOKEN;
  if (!token) {
    return '';
  }
  return token;
}
