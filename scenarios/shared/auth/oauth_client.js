import http from 'k6/http';

/**
 * OAuth2 client_credentials flow.
 *
 * Expects in config:
 * auth: {
 *   type: "oauth2",
 *   token_url: "https://auth.example.com/oauth/token",
 *   client_id: "perfclient",
 *   client_secret_env: "OAUTH_CLIENT_SECRET",
 *   scope: "read write"
 * }
 */
export function getOAuthToken(config) {
  if (!config.auth || config.auth.type !== 'oauth2') {
    throw new Error('OAuth2 auth requested but config.auth.type is not oauth2');
  }

  const clientSecretEnv = config.auth.client_secret_env || 'OAUTH_CLIENT_SECRET';
  const clientSecret = __ENV[clientSecretEnv];

  if (!clientSecret) {
    throw new Error(
      `Missing OAuth2 client secret in environment variable ${clientSecretEnv}`
    );
  }

  const payload = {
    client_id: config.auth.client_id,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope: config.auth.scope || '',
  };

  const res = http.post(config.auth.token_url, payload);

  if (res.status !== 200) {
    throw new Error(`OAuth2 token request failed: HTTP ${res.status}`);
  }

  const body = res.json();
  if (!body.access_token) {
    throw new Error('OAuth2 token response missing access_token');
  }

  return body.access_token;
}
