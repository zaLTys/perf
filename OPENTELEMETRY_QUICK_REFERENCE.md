# OpenTelemetry Quick Reference

## Key Concepts Explained Simply

### What is OpenTelemetry Collector?
A **middleware service** that sits between your application (k6) and your monitoring backend (Prometheus). It:
- Receives metrics from k6 via OTLP protocol
- Can process/transform metrics (filtering, batching, etc.)
- Exposes metrics in Prometheus format for Prometheus to scrape

**Think of it as:** A translator/router for telemetry data.

### What is "Metrics Signal"?
In OpenTelemetry, data is categorized into **signals**:
- **Metrics** = numbers (request count, latency, CPU)
- **Traces** = request paths through your system
- **Logs** = event records

Your central collector handles traces/logs but **not metrics** → that's why you need a separate collector for k6 metrics.

### Pushgateway vs OpenTelemetry Collector

**Pushgateway:**
- Receives metrics via HTTP POST (Prometheus text format)
- Designed for short-lived/batch jobs
- Prometheus scrapes from it

**OpenTelemetry Collector:**
- Receives metrics via OTLP (OpenTelemetry Protocol)
- More flexible, vendor-neutral
- Can export to multiple backends
- Exposes Prometheus format for scraping

**The engineer's suggestion:** Use OTel Collector instead of Pushgateway because:
1. k6 supports OTLP output natively
2. More flexible for future needs
3. Can integrate with other OTel systems

## Architecture Comparison

### Current Setup (Prometheus Remote Write)
```
k6 → Prometheus (direct push)
```

### Proposed Setup (OpenTelemetry)
```
k6 → OTel Collector → Prometheus (scrape)
```

## Quick Decision Guide

**Use OpenTelemetry Collector if:**
- ✅ You need vendor-neutral telemetry
- ✅ You want to integrate with other OTel systems
- ✅ You need advanced processing/transformation
- ✅ Your team standardizes on OpenTelemetry

**Keep Prometheus Remote Write if:**
- ✅ Current setup works fine
- ✅ You only need Prometheus
- ✅ You want simpler architecture
- ✅ Lower latency is important

## Next Steps

1. **Read** `OPENTELEMETRY_SETUP.md` for detailed setup
2. **Decide** if you need OpenTelemetry or can keep current setup
3. **If proceeding:** Use the example configs in `docker/otel-collector/`
4. **Test** locally before deploying to production

## Files Created

- `OPENTELEMETRY_SETUP.md` - Full setup guide
- `docker/otel-collector/otel-collector-config.yaml` - Collector config
- `docker/docker-compose.otel.example.yml` - Docker service example
- `docker/prometheus/prometheus.otel.example.yml` - Prometheus scrape config example

