import { open } from 'k6/fs';
import yaml from 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.mjs';
import { validateConfig } from './validators.js';

/**
 * Load and parse a YAML configuration file, then validate it.
 *
 * @param {string} path - Path to the YAML file relative to the project root.
 * @returns {object} Parsed and validated configuration object.
 */
export function loadConfig(path) {
  try {
    const raw = open(path);
    const config = yaml.load(raw);
    validateConfig(config, path);
    return config;
  } catch (err) {
    throw new Error(`Failed to load YAML config: ${path}
 → ${err.message}`);
  }
}
