# Production Implementation Guide

This guide describes the production hardening applied in this repository and how to extend it.

## 1) Logging system

Implemented:
- Structured JSON logger: `src/utils/logger.ts`
- Request logging middleware: `src/middleware/request-logger.middleware.ts`

What is logged:
- HTTP method, URL, status code
- Request duration
- Optional request id (`x-request-id`)
- Timestamp and level

Recommended next steps:
- Forward logs to CloudWatch / ELK / Datadog
- Include trace IDs from API gateway/load balancer

## 2) Error handling

Implemented:
- 404 handler: `notFoundHandler`
- Global error handler: `errorHandler`
- Async error propagation via `express-async-errors`

Behavior:
- Returns `500` on unhandled exceptions
- Logs error context (method/path/message)
- Hides stack traces in production responses

Recommended next steps:
- Add domain-specific error classes and status mapping
- Add sanitized error codes for clients

## 3) Monitoring hooks

Implemented:
- Hook registry and event emitter: `src/monitoring/monitoring.hooks.ts`
- Events emitted from request middleware and error handler
- Process-level hooks in `src/server.ts` for uncaught exceptions and unhandled rejections

Event categories:
- `request`
- `error`
- `health`

Recommended next steps:
- Register integrations for Prometheus, OpenTelemetry, Datadog, Sentry
- Push critical error events to alerting channels

## 4) Runtime checklist

- Set `NODE_ENV=production`
- Set `LOG_LEVEL=info` (or `warn`)
- Configure health check endpoint in ALB / orchestrator
- Enable autoscaling and graceful shutdown
- Configure centralized log retention and alerting
