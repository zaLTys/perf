/**
 * Load environment-specific configuration.
 * 
 * Priority (highest to lowest):
 *   1. Environment variable K6_ENV (e.g., 'dev', 'staging', 'prod')
 *   2. Default to 'dev'
 * 
 * Config files should define environment overrides like:
 *   environments:
 *     dev:
 *       base_url: "https://dev-api.example.com"
 *     staging:
 *       base_url: "https://staging-api.example.com"
 *     prod:
 *       base_url: "https://api.example.com"
 * 
 * @param {object} config - Base configuration object
 * @returns {object} Configuration with environment overrides applied
 */
export function applyEnvironmentOverrides(config) {
    const env = __ENV.K6_ENV || 'dev';

    if (!config.environments || !config.environments[env]) {
        // No environment overrides defined, return base config
        return config;
    }

    const envOverrides = config.environments[env];

    // Deep merge environment overrides into base config
    const merged = {
        ...config,
        ...envOverrides,
        // Preserve non-environment fields
        test_name: config.test_name,
        scenarios: config.scenarios,
        thresholds: config.thresholds || {},
    };

    // Remove environments key from final config to avoid confusion
    delete merged.environments;

    return merged;
}

/**
 * Get the current environment name.
 * 
 * @returns {string} Current environment (default: 'dev')
 */
export function getCurrentEnvironment() {
    return __ENV.K6_ENV || 'dev';
}
