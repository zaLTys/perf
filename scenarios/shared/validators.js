import { open } from 'k6/fs';

const schema = JSON.parse(open('scenarios/shared/config_schema.json'));

/**
 * Enhanced validator with detailed error reporting
 */
export function validateConfig(config, path = '<inline>') {
  const errors = [];
  const warnings = [];

  // Check required fields
  (schema.required || []).forEach((field) => {
    if (config[field] === undefined || config[field] === null) {
      errors.push(`Missing required field: '${field}'`);
    }
  });

  // Validate test_name
  if (config.test_name !== undefined) {
    if (typeof config.test_name !== 'string') {
      errors.push("Field 'test_name' must be a string");
    } else if (config.test_name.trim() === '') {
      errors.push("Field 'test_name' cannot be empty");
    } else if (!/^[a-zA-Z0-9_-]+$/.test(config.test_name)) {
      errors.push(
        "Field 'test_name' should only contain letters, numbers, underscores, and hyphens. " +
        `Got: '${config.test_name}'`
      );
    }
  }

  // Validate base_url
  if (config.base_url !== undefined) {
    if (typeof config.base_url !== 'string') {
      errors.push("Field 'base_url' must be a string");
    } else if (!config.base_url.startsWith('http://') && !config.base_url.startsWith('https://')) {
      errors.push(
        "Field 'base_url' must start with 'http://' or 'https://'. " +
        `Got: '${config.base_url}'`
      );
    }
  }

  // Validate scenarios
  if (config.scenarios !== undefined) {
    if (typeof config.scenarios !== 'object' || Array.isArray(config.scenarios)) {
      errors.push("Field 'scenarios' must be an object (not an array)");
    } else if (Object.keys(config.scenarios).length === 0) {
      errors.push("Field 'scenarios' must contain at least one scenario");
    } else {
      // Validate each scenario
      Object.entries(config.scenarios).forEach(([scenarioName, scenarioConfig]) => {
        if (!scenarioConfig || typeof scenarioConfig !== 'object') {
          errors.push(`Scenario '${scenarioName}' must be an object`);
          return;
        }

        if (!scenarioConfig.executor) {
          errors.push(`Scenario '${scenarioName}' is missing required field 'executor'`);
        } else {
          const validExecutors = [
            'shared-iterations',
            'per-vu-iterations',
            'constant-vus',
            'ramping-vus',
            'constant-arrival-rate',
            'ramping-arrival-rate',
            'externally-controlled',
          ];
          if (!validExecutors.includes(scenarioConfig.executor)) {
            errors.push(
              `Scenario '${scenarioName}' has invalid executor: '${scenarioConfig.executor}'. ` +
              `Valid executors: ${validExecutors.join(', ')}`
            );
          }
        }
      });
    }
  }

  // Validate thresholds
  if (config.thresholds !== undefined) {
    if (typeof config.thresholds !== 'object' || Array.isArray(config.thresholds)) {
      errors.push("Field 'thresholds' must be an object");
    } else {
      Object.entries(config.thresholds).forEach(([metric, thresholdArray]) => {
        if (!Array.isArray(thresholdArray)) {
          errors.push(`Threshold for metric '${metric}' must be an array of strings`);
        } else {
          thresholdArray.forEach((threshold, idx) => {
            if (typeof threshold !== 'string') {
              errors.push(
                `Threshold[${idx}] for metric '${metric}' must be a string. ` +
                `Got: ${typeof threshold}`
              );
            }
          });
        }
      });
    }
  }

  // Validate endpoints (if present)
  if (config.endpoints !== undefined) {
    if (typeof config.endpoints !== 'object' || Array.isArray(config.endpoints)) {
      errors.push("Field 'endpoints' must be an object");
    } else {
      Object.entries(config.endpoints).forEach(([key, value]) => {
        if (typeof value !== 'string') {
          errors.push(`Endpoint '${key}' must be a string, got: ${typeof value}`);
        } else if (!value.startsWith('/')) {
          warnings.push(
            `Endpoint '${key}' should start with '/'. ` +
            `Got: '${value}'. This may cause URL construction issues.`
          );
        }
      });
    }
  }

  // Validate environments (if present)
  if (config.environments !== undefined) {
    if (typeof config.environments !== 'object' || Array.isArray(config.environments)) {
      errors.push("Field 'environments' must be an object");
    } else {
      Object.entries(config.environments).forEach(([envName, envConfig]) => {
        if (typeof envConfig !== 'object' || Array.isArray(envConfig)) {
          errors.push(`Environment '${envName}' must be an object`);
        }
      });
    }
  }

  // Validate auth (if present)
  if (config.auth !== undefined) {
    if (typeof config.auth !== 'object' || Array.isArray(config.auth)) {
      errors.push("Field 'auth' must be an object");
    }
  }

  // Display warnings
  if (warnings.length > 0) {
    console.warn(`\n⚠️  Configuration warnings for ${path}:`);
    warnings.forEach((warn) => {
      console.warn(`  - ${warn}`);
    });
  }

  // Throw if there are errors
  if (errors.length > 0) {
    const errorMessage =
      `\n❌ Configuration validation failed for ${path}:\n\n` +
      errors.map((err, idx) => `  ${idx + 1}. ${err}`).join('\n') +
      `\n\n📝 Please fix the above issues and try again.\n`;

    throw new Error(errorMessage);
  }
}

