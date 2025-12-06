# k6 Performance PoC

This repository is a proof-of-concept performance testing framework built around k6.

Key ideas:

- Tests are written in JavaScript (as required by k6).
- Each team has its own folder under `teams/`.
- Under each team, tests are grouped by **test type**: `load`, `smoke`, `spike`, `stress`, `soak`, etc.
- Each individual test has a dedicated folder that contains:
  - `config.yaml` – scenario configuration (stages, thresholds, base URL, endpoints, optional auth).
  - `test.js` – k6 test entrypoint that loads the YAML config and runs the scenario.
- Shared code lives under `scenarios/shared` (HTTP helpers, config loader, validators, auth utilities).
- Common metrics are defined once under `metrics/prometheus.js`.
- A simple `docker-compose` stack is provided for Prometheus + Grafana.
- Jenkins integration:
  - `Jenkinsfile.validation` – auto validation on branch update (YAML + k6 --dry-run).
  - `Jenkinsfile.run` – manual/API-triggered performance run based on `TEST_NAME`.

## Running a single test locally

Example:

```bash
k6 run \
  -e SCENARIO_FILE=teams/teamA/load/ramp_up/config.yaml \
  teams/teamA/load/ramp_up/test.js
```

## Running via Jenkins (execution pipeline)

The execution Jenkinsfile (`Jenkinsfile.run`) expects a parameter `TEST_NAME`
matching the `test_name` field in a `config.yaml`. It then automatically finds
the correct config and `test.js` and runs k6.

Example parameter:

```text
teamA_load_ramp_up
```
