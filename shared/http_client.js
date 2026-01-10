import http from 'k6/http';
import { sleep } from 'k6';
import { trackMetrics } from './metrics/prometheus.js';

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Get retry configuration from environment or use defaults
 */
function getRetryConfig() {
  return {
    maxAttempts: parseInt(__ENV.HTTP_RETRY_MAX_ATTEMPTS) || DEFAULT_RETRY_CONFIG.maxAttempts,
    initialDelayMs: parseInt(__ENV.HTTP_RETRY_INITIAL_DELAY) || DEFAULT_RETRY_CONFIG.initialDelayMs,
    maxDelayMs: parseInt(__ENV.HTTP_RETRY_MAX_DELAY) || DEFAULT_RETRY_CONFIG.maxDelayMs,
    backoffMultiplier: parseFloat(__ENV.HTTP_RETRY_BACKOFF) || DEFAULT_RETRY_CONFIG.backoffMultiplier,
    retryableStatusCodes: DEFAULT_RETRY_CONFIG.retryableStatusCodes,
  };
}

/**
 * Check if a response should be retried based on status code
 */
function shouldRetry(statusCode, retryConfig) {
  return retryConfig.retryableStatusCodes.includes(statusCode);
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateBackoffDelay(attempt, retryConfig) {
  const baseDelay = retryConfig.initialDelayMs * Math.pow(retryConfig.backoffMultiplier, attempt - 1);
  const delayWithJitter = baseDelay * (0.5 + Math.random() * 0.5); // 50-100% of base delay
  return Math.min(delayWithJitter, retryConfig.maxDelayMs);
}

/**
 * Build complete URL from base and endpoint
 */
function buildUrl(baseUrl, endpoint) {
  // Remove trailing slash from baseUrl and leading slash from endpoint
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  return `${cleanBase}/${cleanEndpoint}`;
}

/**
 * Merge default headers with custom headers
 */
function buildHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'k6-performance-test',
    ...customHeaders,
  };

  // Add auth token if available
  const authToken = __ENV.AUTH_TOKEN;
  if (authToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
}

/**
 * Execute HTTP request with retry logic
 */
function executeWithRetry(method, url, body = null, params = {}, retryConfig) {
  let lastResponse = null;
  let lastError = null;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      // Log attempt if retrying
      if (attempt > 1) {
        console.log(`Retry attempt ${attempt}/${retryConfig.maxAttempts} for ${method} ${url}`);
      }

      // Make the HTTP request
      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = http.get(url, params);
          break;
        case 'post':
          response = http.post(url, body, params);
          break;
        case 'put':
          response = http.put(url, body, params);
          break;
        case 'delete':
          response = http.del(url, body, params);
          break;
        case 'patch':
          response = http.patch(url, body, params);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }

      lastResponse = response;

      // Track metrics
      trackMetrics(response);

      // Check if successful or should retry
      if (response.status >= 200 && response.status < 400) {
        // Success!
        return response;
      }

      // Check if we should retry
      if (!shouldRetry(response.status, retryConfig)) {
        // Not a retryable status, return immediately
        console.warn(`Non-retryable error ${response.status} for ${method} ${url}`);
        return response;
      }

      // This is retryable, but check if we have more attempts
      if (attempt < retryConfig.maxAttempts) {
        const delayMs = calculateBackoffDelay(attempt, retryConfig);
        console.warn(
          `Request failed with status ${response.status}, ` +
          `retrying in ${delayMs.toFixed(0)}ms...`
        );
        sleep(delayMs / 1000); // k6 sleep takes seconds
      }

    } catch (err) {
      lastError = err;
      console.error(`Request error on attempt ${attempt}: ${err.message}`);

      if (attempt < retryConfig.maxAttempts) {
        const delayMs = calculateBackoffDelay(attempt, retryConfig);
        sleep(delayMs / 1000);
      }
    }
  }

  // All retries exhausted
  if (lastError) {
    throw new Error(
      `HTTP ${method} ${url} failed after ${retryConfig.maxAttempts} attempts: ${lastError.message}`
    );
  }

  return lastResponse;
}

/**
 * Shared HTTP wrapper for GET requests with automatic retry and metrics tracking
 * 
 * @param {string} baseUrl - Base URL for the API
 * @param {string} endpoint - API endpoint path
 * @param {object} customHeaders - Optional custom headers
 * @param {object} options - Optional request options
 * @returns {object} HTTP response
 */
export function get(baseUrl, endpoint, customHeaders = {}, options = {}) {
  const url = buildUrl(baseUrl, endpoint);
  const headers = buildHeaders(customHeaders);
  const params = { headers, ...options };
  const retryConfig = getRetryConfig();

  return executeWithRetry('get', url, null, params, retryConfig);
}

/**
 * Shared HTTP wrapper for POST requests
 * 
 * @param {string} baseUrl - Base URL for the API
 * @param {string} endpoint - API endpoint path
 * @param {any} body - Request body (will be JSON stringified if object)
 * @param {object} customHeaders - Optional custom headers
 * @param {object} options - Optional request options
 * @returns {object} HTTP response
 */
export function post(baseUrl, endpoint, body = null, customHeaders = {}, options = {}) {
  const url = buildUrl(baseUrl, endpoint);
  const headers = buildHeaders(customHeaders);
  const params = { headers, ...options };
  const retryConfig = getRetryConfig();

  // Stringify body if it's an object
  const requestBody = (body && typeof body === 'object') ? JSON.stringify(body) : body;

  return executeWithRetry('post', url, requestBody, params, retryConfig);
}

/**
 * Shared HTTP wrapper for PUT requests
 * 
 * @param {string} baseUrl - Base URL for the API
 * @param {string} endpoint - API endpoint path
 * @param {any} body - Request body (will be JSON stringified if object)
 * @param {object} customHeaders - Optional custom headers
 * @param {object} options - Optional request options
 * @returns {object} HTTP response
 */
export function put(baseUrl, endpoint, body = null, customHeaders = {}, options = {}) {
  const url = buildUrl(baseUrl, endpoint);
  const headers = buildHeaders(customHeaders);
  const params = { headers, ...options };
  const retryConfig = getRetryConfig();

  const requestBody = (body && typeof body === 'object') ? JSON.stringify(body) : body;

  return executeWithRetry('put', url, requestBody, params, retryConfig);
}

/**
 * Shared HTTP wrapper for DELETE requests
 * 
 * @param {string} baseUrl - Base URL for the API
 * @param {string} endpoint - API endpoint path
 * @param {object} customHeaders - Optional custom headers
 * @param {object} options - Optional request options
 * @returns {object} HTTP response
 */
export function del(baseUrl, endpoint, customHeaders = {}, options = {}) {
  const url = buildUrl(baseUrl, endpoint);
  const headers = buildHeaders(customHeaders);
  const params = { headers, ...options };
  const retryConfig = getRetryConfig();

  return executeWithRetry('delete', url, null, params, retryConfig);
}

/**
 * Shared HTTP wrapper for PATCH requests
 * 
 * @param {string} baseUrl - Base URL for the API
 * @param {string} endpoint - API endpoint path
 * @param {any} body - Request body (will be JSON stringified if object)
 * @param {object} customHeaders - Optional custom headers
 * @param {object} options - Optional request options
 * @returns {object} HTTP response
 */
export function patch(baseUrl, endpoint, body = null, customHeaders = {}, options = {}) {
  const url = buildUrl(baseUrl, endpoint);
  const headers = buildHeaders(customHeaders);
  const params = { headers, ...options };
  const retryConfig = getRetryConfig();

  const requestBody = (body && typeof body === 'object') ? JSON.stringify(body) : body;

  return executeWithRetry('patch', url, requestBody, params, retryConfig);
}

/**
 * Response validation helpers
 */
export const validators = {
  /**
   * Check if response status is successful (2xx)
   */
  isSuccess: (response) => response.status >= 200 && response.status < 300,

  /**
   * Check if response status is in expected range
   */
  hasStatus: (response, expectedStatus) => response.status === expectedStatus,

  /**
   * Check if response body contains expected data
   */
  bodyContains: (response, expectedData) => {
    try {
      const body = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
      return body.includes(expectedData);
    } catch (err) {
      return false;
    }
  },

  /**
   * Parse and return JSON response body
   */
  parseJson: (response) => {
    try {
      return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
    } catch (err) {
      throw new Error(`Failed to parse JSON response: ${err.message}`);
    }
  },
};

