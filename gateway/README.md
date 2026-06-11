# API Gateway (Design + Starter Scaffold)

This gateway is the **single entry point** for ERP microservices.

## Goals

- Route traffic to service-specific backends
- Enforce JWT authentication for protected domains
- Forward user identity (`x-user-id`, `x-user-role`) to downstream services
- Propagate `x-request-id` correlation IDs across services
- Centralize CORS, structured request logging, and baseline rate limiting

## Security Boundary Rule (Important)

Gateway auth is the **first checkpoint**, not the only checkpoint.

- Gateway verifies JWT for protected prefixes.
- Each downstream service must still verify JWT independently.

This prevents header spoofing when a service is called directly outside the gateway path.

## Route Plan

- `/api/auth/*` → Auth Service (public for register/login)
- `/api/students/*` → Student Service (JWT required)
- `/api/structure/*` → Academic Structure Service (JWT required)
- `/api/academic/*` → Academic Service (planned, JWT required)
- `/api/profiles/*` → Profile Service (JWT required)
- `/api/billing/*` → Billing Service (JWT required)

## Environment Variables

```env
GATEWAY_PORT=8080
JWT_SECRET=change-this-secret
AUTH_SERVICE_URL=http://localhost:5000
STUDENT_SERVICE_URL=http://localhost:5001
ACADEMIC_SERVICE_URL=http://localhost:5002
BILLING_SERVICE_URL=http://localhost:5003
PROFILE_SERVICE_URL=http://localhost:5004
```

## Request Flow

1. Client sends request to gateway.
2. Gateway validates JWT for protected prefixes.
3. Gateway injects identity headers (`x-user-id`, `x-user-role`) and `x-request-id`.
4. Gateway forwards request to target service.
5. Service validates JWT again as final security boundary and logs the same `x-request-id`.

## Current Hardening Included

- 5-second upstream timeout via `AbortController`
- Error normalization for proxy failures
- Structured JSON logs with a normalized schema (`level`, `type`, `requestId`, `service`, `pathTemplate`, `status`, `statusGroup`, `duration`)
- Request correlation with forced `x-request-id` overwrite/propagation
- Response latency capture (`duration` in ms)
- CORS handling at gateway
- Request body size guard (`1mb`)
- Basic in-memory rate limiting
- Graceful shutdown handling (`SIGINT`, `SIGTERM`)

## Notes

- This scaffold intentionally uses only existing project dependencies.
- In production, move rate-limiter state to Redis and add service-to-service trust (internal secret or mTLS).
