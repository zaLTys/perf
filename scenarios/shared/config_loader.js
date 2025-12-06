import { open } from 'k6/fs';
import yaml from 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.mjs';
import { validateConfig } from './validators.js';
import { applyEnvironmentOverrides, getCurrentEnvironment } from './environment.js';

/**
 * Load and parse a YAML configuration file, validate it, and apply environment overrides.
 *
 * @param {string} path - Path to the YAML file relative to the project root.
 * @returns {object} Parsed, validated, and environment-configured object.
 */
export function loadConfig(path) {
  let config;
  let rawContent;

  try {
    // Step 1: Read file
    rawContent = open(path);
    if (!rawContent) {
      throw new Error(`File is empty or could not be read: ${path}`);
    }
  } catch (err) {
    throw new Error(
      `Failed to read config file: ${path}\n` +
      `Error: ${err.message}\n` +
      `Hint: Ensure the file exists and is readable.`
    );
  }

  try {
    // Step 2: Parse YAML
    config = yaml.load(rawContent);
    if (!config || typeof config !== 'object') {
      throw new Error('Parsed YAML is not a valid object');
    }
  } catch (err) {
    throw new Error(
      `Failed to parse YAML config: ${path}\n` +
      `Error: ${err.message}\n` +
      `Hint: Check YAML syntax - indentation, colons, quotes.`
    );
  }

  try {
    // Step 3: Validate schema
    validateConfig(config, path);
  } catch (err) {
    throw new Error(
      `Config validation failed: ${path}\n` +
      `Error: ${err.message}\n` +
      `Hint: Ensure all required fields are present and properly typed.`
    );
  }

  try {
    // Step 4: Apply environment overrides
    const env = getCurrentEnvironment();
    config = applyEnvironmentOverrides(config);

    console.log(`✓ Loaded config: ${path} (environment: ${env})`);
    if (config.base_url) {
      console.log(`  Base URL: ${config.base_url}`);
    }
  } catch (err) {
    throw new Error(
      `Failed to apply environment overrides: ${path}\n` +
      `Error: ${err.message}`
    );
  }

  return config;
}
