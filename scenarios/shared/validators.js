import { open } from 'k6/fs';

const schema = JSON.parse(open('scenarios/shared/config_schema.json'));

/**
 * Very small validator for the PoC.
 */
export function validateConfig(config, path = '<inline>') {
  const errors = [];

  (schema.required || []).forEach((field) => {
    if (config[field] === undefined || config[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (config.test_name && typeof config.test_name !== 'string') {
    errors.push('test_name must be a string');
  }
  if (config.base_url && typeof config.base_url !== 'string') {
    errors.push('base_url must be a string');
  }
  if (config.scenarios && typeof config.scenarios !== 'object') {
    errors.push('scenarios must be an object');
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed for ${path}:
` + errors.join('\n')
    );
  }
}
