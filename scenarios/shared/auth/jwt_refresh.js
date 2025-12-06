import http from 'k6/http';

/**
 * Simple JWT fetch + auto-refresh helper.
 *
 * Expects in YAML:
 * auth:
 *   type: jwt
 *   login_url: "https://auth.example.com/login"
 *   username_env: "AUTH_USERNAME"
 *   password_env: "AUTH_PASSWORD"
 */
let cachedToken = null;
let tokenExpiresAt = 0;

export function getJwt(config) {
  if (!config.auth || config.auth.type !== 'jwt') {
    throw new Error('JWT auth requested but config.auth.type is not jwt');
  }

  const now = Date.now();

  if (!cachedToken || now > tokenExpiresAt) {
    const usernameEnv = config.auth.username_env || 'AUTH_USERNAME';
    const passwordEnv = config.auth.password_env || 'AUTH_PASSWORD';

    const username = __ENV[usernameEnv];
    const password = __ENV[passwordEnv];

    if (!username || !password) {
      throw new Error(
        `Missing JWT credentials in env vars ${usernameEnv}/${passwordEnv}`
      );
    }

    const res = http.post(config.auth.login_url, {
      username,
      password,
    });

    if (res.status !== 200) {
      throw new Error(`JWT login failed: HTTP ${res.status}`);
    }

    const body = res.json();
    cachedToken = body.token || body.access_token;
    const expiresIn = body.expires_in || 3600;
    tokenExpiresAt = now + expiresIn * 1000 - 5000; // refresh 5s early
  }

  return cachedToken;
}
