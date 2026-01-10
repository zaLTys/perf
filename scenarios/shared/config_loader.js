import { validateConfig } from './validators.js';
import { applyEnvironmentOverrides, getCurrentEnvironment } from './environment.js';

/**
 * Load and validate a JavaScript configuration object, and apply environment overrides.
 *
 * @param {object} configObj - Configuration object defined inline in the test file.
 * @returns {object} Validated and environment-configured object.
 */
export function loadConfig(configObj) {
  let config;

  try {
    // Step 1: Validate input
    if (!configObj || typeof configObj !== 'object') {
      throw new Error('Config must be a valid object');
    }

    // Create a copy to avoid mutating the original
    config = JSON.parse(JSON.stringify(configObj));
  } catch (err) {
    throw new Error(
      `Failed to process config object\n` +
      `Error: ${err.message}\n` +
      `Hint: Ensure config is a valid JavaScript object.`
    );
  }

  try {
    // Step 2: Validate schema
    validateConfig(config, '<inline>');
  } catch (err) {
    throw new Error(
      `Config validation failed\n` +
      `Error: ${err.message}\n` +
      `Hint: Ensure all required fields are present and properly typed.`
    );
  }

  try {
    // Step 3: Apply environment overrides
    const env = getCurrentEnvironment();
    config = applyEnvironmentOverrides(config);

    console.log(`✓ Loaded config: ${config.test_name || '<unnamed>'} (environment: ${env})`);
    if (config.base_url) {
      console.log(`  Base URL: ${config.base_url}`);
    }
  } catch (err) {
    throw new Error(
      `Failed to apply environment overrides\n` +
      `Error: ${err.message}`
    );
  }

  return config;
}
