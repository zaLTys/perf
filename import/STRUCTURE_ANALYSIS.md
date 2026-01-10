# Import Folder Structure Analysis

## Overview

This document analyzes the differences between the **import folder structure** (legacy/old approach) and the **current setup** (new framework approach).

## Structure Comparison

### Import Folder Structure (Legacy)

```
import/
├── baseLoad.js                    # Monolithic test file with hardcoded scenarios
├── postTransfers.js               # Standalone API function file
├── postAdyenCallbackForPayin.js  # Standalone API function file
├── action.yml                     # GitHub Actions composite action
└── run-base-load.yml              # GitHub Actions workflow
```

**Key Characteristics:**
- **Monolithic test files** - Single large file (`baseLoad.js`) containing all scenarios and test logic
- **Hardcoded scenarios** - Test scenarios defined directly in JavaScript code
- **Direct API imports** - Imports from `../api/` and `../common/` directories (not present in current repo)
- **GitHub Actions** - Uses GitHub Actions for CI/CD
- **No YAML config** - Configuration embedded in JavaScript
- **No team organization** - Flat structure, no team-based organization
- **API-centric** - Organized around API endpoints rather than test scenarios

### Current Setup Structure

```
teams/
└── [team-name]/
    └── [test-type]/              # load, smoke, spike, stress, soak
        └── [test-name]/
            ├── config.yaml        # Test configuration (scenarios, thresholds, endpoints)
            └── test.js            # Test script (business logic)

scenarios/
└── shared/                       # Shared utilities
    ├── config_loader.js          # YAML config loader
    ├── environment.js            # Environment overrides
    ├── http_client.js            # HTTP wrapper with retry
    ├── validators.js             # Config validation
    └── auth/                     # Auth helpers

jenkins/                          # Jenkins CI/CD
├── Jenkinsfile.validation
└── Jenkinsfile.run
```

**Key Characteristics:**
- **Config-driven** - YAML files separate configuration from code
- **Team-based organization** - Tests organized by team ownership
- **Test type categorization** - Grouped by test type (load, smoke, spike, stress, soak)
- **Shared utilities** - Reusable code in `scenarios/shared/`
- **Jenkins CI/CD** - Uses Jenkins instead of GitHub Actions
- **Modular design** - Small, focused test files
- **Environment support** - Built-in environment overrides in config files

## Detailed Differences

### 1. Test Organization

#### Import Folder (Legacy)
- **Single monolithic file** (`baseLoad.js`) with 332 lines
- Contains multiple scenarios (get_transfers, post_transfers, get_payouts, etc.) in one file
- All test logic mixed together
- Difficult to maintain and understand

#### Current Setup
- **One test per directory** (`teams/teamA/load/weather_api/`)
- Each test has its own `config.yaml` and `test.js`
- Clear separation of concerns
- Easy to find and modify specific tests

**Example from import:**
```javascript
// baseLoad.js - All scenarios in one file
export const options = {
  scenarios: {
    get_transfers: { ... },
    post_transfers: { ... },
    get_payouts: { ... },
    // ... 10+ scenarios
  }
};
```

**Example from current:**
```yaml
# config.yaml - Separate config file
scenarios:
  weather_load:
    executor: "ramping-vus"
    stages: [...]
```

### 2. Configuration Management

#### Import Folder (Legacy)
- **Hardcoded in JavaScript** - Configuration values embedded in code
- **No environment support** - Environment-specific values require code changes
- **Difficult to modify** - Requires JavaScript knowledge to change test parameters
- **No validation** - No schema validation for configuration

#### Current Setup
- **YAML configuration** - Human-readable, version-controlled config files
- **Environment overrides** - Built-in support for dev/staging/prod environments
- **Non-developer friendly** - Testers can modify scenarios without touching code
- **Schema validation** - Config files validated against JSON schema

**Example from import:**
```javascript
// Hardcoded duration
const LOAD_TEST_DURATION = __ENV.LOAD_TEST_DURATION || '6h';

// Hardcoded stages
stages: [
  { duration: '10m', target: 4 },
  { duration: LOAD_TEST_DURATION, target: 4 },
]
```

**Example from current:**
```yaml
# config.yaml - Easy to modify
scenarios:
  weather_load:
    executor: "ramping-vus"
    stages:
      - duration: "30s"
        target: 10
      - duration: "1m"
        target: 10

environments:
  dev:
    base_url: "https://dev-api.example.com"
  prod:
    base_url: "https://api.example.com"
```

### 3. Code Reusability

#### Import Folder (Legacy)
- **Direct API imports** - Imports from `../api/` directory structure
- **Custom retry logic** - `makeApiCallWithRetry` function in each test
- **Duplicated code** - Similar patterns repeated across files
- **Tight coupling** - Tests tightly coupled to specific API implementations

#### Current Setup
- **Shared utilities** - Common code in `scenarios/shared/`
- **HTTP client abstraction** - Standardized HTTP wrapper with retry
- **DRY principle** - Write once, use everywhere
- **Loose coupling** - Tests use abstracted HTTP client

**Example from import:**
```javascript
// Each test file imports directly
import { getTransfers as getTransfersApi } from '../api/transfers/getTransfers.js';
import { postTransfersRandomSourceRandomDestination as postTransfersApi } from '../api/transfers/postTransfersRandomSourceRandomDestination.js';

// Custom retry wrapper
export function getTransfers() {
  return makeApiCallWithRetry(apiFunctions.getTransfers, 'GET /transfers');
}
```

**Example from current:**
```javascript
// Shared HTTP client
import { get, post } from '../../../../scenarios/shared/http_client.js';

// Simple usage
export default function () {
  const response = get(config.base_url, config.endpoints.forecast);
}
```

### 4. CI/CD Integration

#### Import Folder (Legacy)
- **GitHub Actions** - Uses GitHub Actions workflows
- **Docker-based execution** - Runs k6 in Docker containers
- **AWS Prometheus** - Integrates with AWS Prometheus via sigv4-proxy
- **Slack notifications** - Built-in Slack webhook notifications

#### Current Setup
- **Jenkins pipelines** - Uses Jenkins for CI/CD
- **Test discovery** - Tests discovered by `test_name` from config.yaml
- **Validation pipeline** - Separate validation pipeline for PRs
- **Execution pipeline** - On-demand test execution

**Key Difference:**
- Import folder: GitHub Actions with composite actions
- Current setup: Jenkins with parameterized jobs

### 5. Test Discovery

#### Import Folder (Legacy)
- **File path based** - Tests referenced by file path
- **Manual configuration** - Need to know exact file location
- **Workflow-specific** - Each workflow hardcodes test file paths

#### Current Setup
- **Test name based** - Tests discovered by `test_name` field
- **Automatic discovery** - Scripts find config.yaml by test name
- **Simple execution** - `./run-test.sh teamA_load_weather_api`

### 6. Authentication Handling

#### Import Folder (Legacy)
- **Custom auth module** - `../common/getAuthToken.js` (not in current repo)
- **Token caching** - Built-in token caching with `getCacheStatus()`
- **Retry wrapper** - `makeApiCallWithRetry` handles auth automatically

#### Current Setup
- **Auth helpers** - Multiple auth strategies in `scenarios/shared/auth/`
- **JWT refresh** - `jwt_refresh.js`
- **OAuth client** - `oauth_client.js`
- **Static token** - `static_token.js`
- **Flexible** - Multiple authentication strategies supported

## Benefits Comparison

### Import Folder Approach (Legacy)

**Advantages:**
1. ✅ **GitHub Actions integration** - Native GitHub integration
2. ✅ **AWS Prometheus** - Direct integration with AWS managed Prometheus
3. ✅ **Slack notifications** - Built-in notification system
4. ✅ **Docker-first** - Consistent execution environment
5. ✅ **Token caching** - Efficient authentication token management

**Disadvantages:**
1. ❌ **Monolithic files** - Hard to maintain large test files
2. ❌ **No config separation** - Configuration mixed with code
3. ❌ **No team organization** - Flat structure doesn't scale
4. ❌ **Tight coupling** - Tests tightly coupled to API structure
5. ❌ **No environment support** - Hard to switch between environments
6. ❌ **Code duplication** - Similar patterns repeated
7. ❌ **Requires API directory** - Depends on `../api/` structure not present in repo

### Current Setup Approach

**Advantages:**
1. ✅ **Config-driven** - Separation of configuration and code
2. ✅ **Team organization** - Clear ownership and organization
3. ✅ **Modular design** - Small, focused test files
4. ✅ **Environment support** - Built-in environment overrides
5. ✅ **Shared utilities** - DRY principle, consistent patterns
6. ✅ **Test discovery** - Simple test name-based execution
7. ✅ **Schema validation** - Config files validated
8. ✅ **Non-developer friendly** - Testers can modify configs
9. ✅ **Scalable** - Easy to add new teams and tests
10. ✅ **Maintainable** - Clear structure, easy to navigate

**Disadvantages:**
1. ❌ **Jenkins dependency** - Requires Jenkins infrastructure
2. ❌ **No GitHub Actions** - Missing GitHub Actions integration
3. ❌ **No AWS Prometheus** - Uses local Prometheus (though can be extended)
4. ❌ **No Slack integration** - Missing notification system
5. ❌ **More files** - Each test requires config.yaml + test.js

## Migration Path

If migrating from import folder to current setup:

1. **Extract scenarios** - Split monolithic `baseLoad.js` into separate test directories
2. **Create config files** - Convert hardcoded scenarios to YAML configs
3. **Refactor API calls** - Replace direct API imports with shared HTTP client
4. **Organize by team** - Move tests to appropriate team directories
5. **Add environment configs** - Extract environment-specific values to config.yaml
6. **Update CI/CD** - Migrate from GitHub Actions to Jenkins (or add GitHub Actions support)

## Recommendations

### For New Tests
- ✅ **Use current setup** - Follow the team-based, config-driven approach
- ✅ **Leverage shared utilities** - Use `scenarios/shared/` modules
- ✅ **Create config.yaml** - Separate configuration from code
- ✅ **Organize by team** - Place tests in appropriate team directory

### For Existing Import Folder Tests
- ⚠️ **Consider migration** - Import folder structure is legacy
- ⚠️ **API dependencies** - Import folder tests reference `../api/` structure not present
- ⚠️ **Maintenance burden** - Monolithic files harder to maintain
- ⚠️ **GitHub Actions** - If GitHub Actions needed, can be added to current setup

### Hybrid Approach (Best of Both Worlds)
Consider enhancing current setup with:
- ✅ Add GitHub Actions workflows (in addition to Jenkins)
- ✅ Add AWS Prometheus support (in addition to local Prometheus)
- ✅ Add Slack notifications
- ✅ Add token caching to auth helpers
- ✅ Keep config-driven, team-based structure

## Conclusion

The **current setup** provides a more maintainable, scalable, and developer-friendly approach with:
- Better organization (team-based)
- Configuration separation (YAML configs)
- Code reusability (shared utilities)
- Environment support (built-in overrides)
- Test discovery (name-based)

The **import folder** has some useful features (GitHub Actions, AWS Prometheus, Slack) that could be integrated into the current setup while maintaining its superior structure.

**Recommendation:** Use current setup as the foundation and adopt useful features from import folder where appropriate.





