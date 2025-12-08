# ADR Performance Testing Framework

## Metadata

| Field | Value |
|-------|-------|
| **Status** | WIP |
| **Topic** | Testing |
| **Created at** | Dec 7, 2025 |
| **Author(s)** | Performance Testing Team |
| **Approver(s)** | TBD |
| **Superseded by** | - |
| **Preceded by** | - |

## Rationale

As our system scales and transitions to service-to-service communication, there is an increasing need for standardized performance testing across multiple teams. Previously, teams implemented performance tests independently, leading to:

- **Inconsistent testing approaches** - Different tools, methodologies, and metrics across teams
- **Duplication of effort** - Each team reinventing common patterns (HTTP clients, authentication, retry logic)
- **Lack of observability** - No centralized view of performance metrics across services
- **Difficult test discovery** - No unified way to find and run tests across teams
- **CI/CD friction** - Each team building their own pipeline integration

We need a centralized, standardized performance testing framework that:
- Enables teams to write tests quickly using shared utilities
- Provides consistent observability through unified metrics collection
- Supports multiple test types (load, smoke, spike, stress, soak)
- Integrates seamlessly with CI/CD pipelines
- Allows test execution by simple test name lookup
- Works consistently across local development and production environments

## Decision

We will establish a **multi-team performance testing monorepo** built around k6 with the following architectural decisions:

### 1. **k6 as the Performance Testing Tool**
We will use [k6](https://k6.io/) as our primary performance testing tool because:
- It's modern, developer-friendly, and uses JavaScript (familiar to most teams)
- Supports multiple executors (ramping-vus, constant-vus, etc.) for different test types
- Has excellent Prometheus integration for metrics collection
- Can run in Docker containers, ensuring consistency across environments
- Active community and good documentation

### 2. **Multi-Team Monorepo Structure**
Tests will be organized by team under `teams/[team-name]/[test-type]/[test-name]/`:
- **Team ownership** - Each team owns their test directory
- **Test type organization** - Tests grouped by type (load, smoke, spike, stress, soak)
- **Clear separation** - Teams can work independently without conflicts
- **Shared utilities** - Common code in `scenarios/shared/` for reuse

### 3. **Config-Driven Test Design**
Each test consists of two files:
- **`config.yaml`** - Test configuration (scenarios, thresholds, endpoints, environment overrides)
- **`test.js`** - Test script (business logic, API calls)

**Benefits:**
- Non-developers can modify test scenarios without touching code
- Environment-specific overrides (dev/staging/prod) in a single file
- Version-controlled test configurations
- Easy to validate and review

### 4. **Test Discovery by `test_name`**
Each `config.yaml` must include a unique `test_name` field. Tests can be executed using only the test name:
```bash
./run-test.sh teamA_load_weather_api
```

**Benefits:**
- Simple, intuitive test execution
- No need to remember file paths
- Works consistently in local and CI/CD environments
- Automatic discovery of config and test.js files

### 5. **Docker-Based Execution**
All tests run in Docker containers:
- **Consistency** - Same environment locally and in CI/CD
- **No local dependencies** - Teams don't need to install k6
- **Isolation** - Tests run in isolated containers
- **Reproducibility** - Same results across different machines

### 6. **Prometheus + Grafana Observability**
All tests output metrics to Prometheus via k6's `experimental-prometheus-rw` output:
- **Centralized metrics** - All test results in one place
- **Real-time dashboards** - Grafana dashboards for visualization
- **Historical data** - Prometheus stores metrics over time
- **Standardized metrics** - Consistent metrics format across all tests

### 7. **Shared Utilities Pattern**
Common functionality extracted to `scenarios/shared/`:
- **HTTP client** - Automatic retry with exponential backoff
- **Config loader** - YAML parsing and validation
- **Environment handling** - Environment-specific overrides
- **Validators** - Response validation helpers
- **Auth helpers** - Authentication utilities (JWT, OAuth, static tokens)

**Benefits:**
- DRY principle - Write once, use everywhere
- Consistent behavior - All tests use same retry logic, error handling
- Easier maintenance - Fix bugs in one place
- Faster test development - Teams focus on business logic

### 8. **CI/CD Integration**
Two Jenkins pipelines:
- **Validation pipeline** (`Jenkinsfile.validation`) - Runs on PRs, validates YAML syntax and k6 scripts
- **Execution pipeline** (`Jenkinsfile.run`) - Runs tests on-demand with `TEST_NAME` parameter

**Benefits:**
- Automated validation prevents broken tests from merging
- Easy test execution from Jenkins UI or API
- Consistent execution environment
- Metrics automatically sent to Prometheus

### 9. **Test Execution Scripts**
Local execution scripts (`run-test.sh`, `run-test.ps1`) that:
- Accept test name as parameter
- Automatically find config.yaml and test.js files
- Run tests in Docker container
- Provide helpful error messages and test discovery

**Benefits:**
- Developer-friendly local testing
- Same interface for local and CI/CD execution
- Cross-platform support (bash for macOS/Linux, PowerShell for Windows)

## Consequences

### Positive Consequences

1. **Faster test development** - Teams can create new tests in minutes using shared utilities
2. **Consistent metrics** - All tests produce standardized metrics in Prometheus
3. **Better observability** - Centralized Grafana dashboards for all performance tests
4. **Easier onboarding** - New team members can start writing tests quickly
5. **Reduced duplication** - Common patterns implemented once in shared utilities
6. **CI/CD ready** - Tests integrate seamlessly with Jenkins pipelines
7. **Environment flexibility** - Same test runs against dev/staging/prod with config overrides
8. **Test discoverability** - Easy to find and run tests by name

### Negative Consequences / Trade-offs

1. **Monorepo complexity** - All teams share the same repository (mitigated by clear directory structure)
2. **Docker dependency** - Requires Docker for local development (acceptable trade-off for consistency)
3. **k6 learning curve** - Teams need to learn k6 syntax (mitigated by examples and shared utilities)
4. **YAML validation** - Requires yq tool for validation (optional, CI/CD handles it)
5. **Test name uniqueness** - Must ensure unique test names across teams (enforced by validation)

### Required Changes

1. **Team adoption** - Teams need to migrate existing tests to new structure
2. **Documentation** - Comprehensive guides for writing and running tests
3. **Grafana setup** - Initial dashboard configuration and Prometheus integration
4. **Jenkins pipelines** - Setup and configuration of validation and execution pipelines
5. **Shared utilities** - Initial implementation of common utilities
6. **Test examples** - Reference implementations for different test types

## Compliance

To ensure this architectural decision is followed:

### 1. **Automated Validation**
- **YAML syntax validation** - All `config.yaml` files validated in CI/CD pipeline
- **Schema validation** - Config files must match `config_schema.json`
- **k6 dry-run** - All test scripts validated before merge
- **Test name uniqueness** - Validation ensures no duplicate test names

### 2. **Documentation Requirements**
- All tests must include a `README.md` explaining test purpose and usage
- Test names must follow naming convention: `{team}_{type}_{name}`
- Config files must include all required fields per schema

### 3. **Code Review Process**
- PRs adding new tests must be reviewed by at least one team member
- Validation pipeline must pass before merge
- New shared utilities require broader review

### 4. **Monitoring and Reporting**
- Grafana dashboards track test execution frequency and results
- Failed tests trigger alerts
- Regular review of test coverage and adoption

### 5. **Onboarding**
- New team members receive framework documentation
- Examples provided for each test type
- Shared utilities documented with usage examples

## Optional Sections

### Test Structure Example

```
teams/
├── teamA/
│   ├── load/
│   │   ├── ramp_up/
│   │   │   ├── config.yaml
│   │   │   ├── test.js
│   │   │   └── README.md
│   │   └── weather_api/
│   │       ├── config.yaml
│   │       ├── test.js
│   │       └── README.md
│   ├── smoke/
│   │   └── health_check/
│   └── spike/
│       └── instant_traffic/
└── teamB/
    ├── load/
    └── soak/
```

### Local Development Workflow

1. **Start observability stack**: `npm run docker:up`
2. **Run test by name**: `./run-test.sh teamA_load_weather_api`
3. **View metrics**: http://localhost:3000 (Grafana)
4. **Validate before commit**: `npm run validate:all`

### CI/CD Workflow

1. **On PR**: Validation pipeline runs automatically
   - Validates YAML syntax
   - Validates config schema
   - Runs k6 dry-run
2. **On demand**: Execution pipeline runs tests
   - Accepts `TEST_NAME` parameter
   - Runs test in Docker container
   - Sends metrics to Prometheus
   - Returns test results

### Future Enhancements

- **Test result archival** - Store test results in S3/blob storage
- **Slack notifications** - Alert teams on test failures
- **Test scheduling** - Automated periodic test execution
- **Performance regression detection** - Compare results over time
- **Multi-region testing** - Run tests from different geographic locations
- **Custom metrics** - Teams can add domain-specific metrics

