# Express + TypeScript Authentication API

Node.js authentication API using Express and TypeScript.

## Features

- Signup with `email + password`
- Login with JWT (JWT आधारित)
- Password hashing with bcrypt
- Protected route middleware
- Return request submission API with PostgreSQL storage
- Zod validation for request payloads
- Modular return fraud risk scoring function
- Dynamic per-organization DB rule engine
- Shopify return webhook endpoint with signature verification
- Analytics endpoints powered by PostgreSQL queries
- Async risk-processing queue with AWS SQS (producer + worker + retry)

## Project structure

```text
.
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── env.ts
│   ├── db/
│   │   └── postgres.ts
│   ├── controllers/
│   │   ├── analytics.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── rule-engine.controller.ts
│   │   ├── shopify-webhook.controller.ts
│   │   ├── return-request.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── queue/
│   │   └── sqs-producer.ts
│   ├── routes/
│   │   ├── analytics.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── protected.routes.ts
│   │   ├── rule-engine.routes.ts
│   │   ├── shopify-webhook.routes.ts
│   │   └── return-request.routes.ts
│   ├── services/
│   │   ├── analytics.service.ts
│   │   ├── risk-scoring.service.ts
│   │   ├── return-risk-processor.service.ts
│   │   ├── rule-engine.service.ts
│   │   ├── shopify-webhook.service.ts
│   │   ├── return-request.service.ts
│   │   └── user.store.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   ├── jwt.ts
│   │   ├── risk.ts
│   │   ├── shopify.ts
│   │   └── user.ts
│   ├── validators/
│   │   ├── rule-engine.validator.ts
│   │   └── return-request.validator.ts
│   ├── workers/
│   │   └── return-risk.worker.ts
│   └── utils/
│       └── jwt.ts
├── .env.example
├── package.json
└── tsconfig.server.json
```

## Run

```bash
npm install
cp .env.example .env
npm run auth:dev
npm run worker:dev
```

## Example API usage

### 1) Signup

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

### 2) Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

### 3) Protected route

```bash
curl http://localhost:4000/api/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 4) Submit return request

```bash
curl -X POST http://localhost:4000/api/returns \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "ORD-1001",
    "user_id": "USR-9001",
    "reason": "Size issue",
    "product_category": "Footwear",
    "payment_type": "COD"
  }'
```

Successful response:

```json
{
  "request_id": "7ad2fd53-d75f-4af1-81c3-fd57ef28d5bf"
}
```

## Risk scoring function

`calculateReturnFraudRisk(input)` returns:
- `risk_score` (0–100)
- `decision` (`approve` / `review` / `reject`)

Rules:
- High frequency returns (`returnCountLast90Days >= 3`) → +30
- COD orders → +20
- Suspicious keywords in reason → +25
- New user → +15

## Dynamic rule engine

Rules are stored in PostgreSQL table: `risk_rules` (scoped by `organization_id`).

Example seeded rule:

`IF return_count > 3 AND payment_type = COD THEN risk += 40`

Evaluate rules API:

```bash
curl -X POST http://localhost:4000/api/risk/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org_demo",
    "return_count": 4,
    "payment_type": "COD",
    "base_risk": 15
  }'
```

## Shopify return webhook

Endpoint:

`POST /webhooks/shopify/returns?organization_id=<org_id>`

Headers:
- `X-Shopify-Hmac-Sha256: <base64-hmac>`
- `Content-Type: application/json`

The webhook flow:
1. Verifies HMAC signature with `SHOPIFY_WEBHOOK_SECRET`
2. Parses order/return payload fields (order id, customer, reason, payment type, product category)
3. Triggers return verification process (base risk + dynamic org rules)

## Analytics endpoints

### 1) Total returns
`GET /api/analytics/total-returns`

Sample response:
```json
{ "total_returns": 1284 }
```

### 2) Fraud detected %
`GET /api/analytics/fraud-detected-percentage`

Sample response:
```json
{ "fraud_detected_percentage": 12.75 }
```

### 3) Approved vs rejected
`GET /api/analytics/approved-vs-rejected`

Sample response:
```json
{
  "approved": 920,
  "rejected": 102,
  "review": 262
}
```

### 4) Daily trends (last 30 days)
`GET /api/analytics/daily-trends`

Sample response:
```json
{
  "trends": [
    { "date": "2026-03-25", "returns_count": 31 },
    { "date": "2026-03-26", "returns_count": 28 }
  ]
}
```

## AWS SQS async processing

### Queue producer
- On `POST /api/returns`, API stores request in PostgreSQL and enqueues a risk job to SQS.
- Producer file: `src/queue/sqs-producer.ts`

### Worker service
- Worker file: `src/workers/return-risk.worker.ts`
- Polls SQS and processes each job via `src/services/return-risk-processor.service.ts`
- Updates `return_requests.decision` and `return_requests.fraud_detected`

### Retry mechanism
- Uses `ApproximateReceiveCount` from SQS message attributes
- If processing fails, worker leaves the message in queue (for retry by visibility timeout)
- After `MAX_RETRIES = 3`, worker deletes the message to prevent infinite retry loops

## Docker

### Files
- `Dockerfile` (Node backend image)
- `frontend/Dockerfile` (frontend static app via Nginx)
- `python_service/Dockerfile` (FastAPI analyzer service)
- `docker-compose.yml` (orchestrates frontend, backend, worker, analyzer, PostgreSQL, Redis)

### Start stack
```bash
docker compose up --build
```

## AWS deployment

- Detailed AWS deployment plan (ECS/RDS/S3/CloudFront): `docs/AWS_DEPLOYMENT_PLAN.md`

## CI/CD

- GitHub Actions pipeline: `.github/workflows/ci-cd.yml`
- Pipeline stages: install dependencies, run tests, build Docker image, deploy to AWS ECS.

## Load testing (k6)

- Script: `loadtests/return-requests.k6.js`
- Simulates **10,000 return request submissions** using 100 VUs.

Run command:

```bash
k6 run loadtests/return-requests.k6.js
```

Optional environment overrides:

```bash
BASE_URL=http://localhost:4000 ORGANIZATION_ID=org_demo k6 run loadtests/return-requests.k6.js
```

## Security best practices

### 1) Rate limiting
- Global API limiter: `apiRateLimiter` in `src/middleware/security.middleware.ts`
- Auth-specific limiter: `authRateLimiter` applied on `/api/auth/signup` and `/api/auth/login`

### 2) Helmet.js
- Security headers enabled via `helmetMiddleware` in `src/app.ts`

### 3) Input validation
- Generic Zod validation middleware: `validateBody(...)`
- Auth payload schema: `src/validators/auth.validator.ts`

### 4) SQL injection protection
- Use parameterized PostgreSQL queries with placeholders (`$1`, `$2`, ...), for example:
```ts
await pool.query(
  'SELECT * FROM return_requests WHERE request_id = $1',
  [requestId],
);
```

## Production readiness

- Implementation guide: `docs/PRODUCTION_IMPLEMENTATION_GUIDE.md`
- Includes:
  - logging system
  - centralized error handling
  - monitoring hooks

## Merge conflict help

- PR #2 conflict resolution guide: `docs/MERGE_CONFLICT_RESOLUTION_PR2.md`
- One-command helper script: `scripts/resolve_conflicts_pr2.sh`

## Troubleshooting

### `tsx watch src/server.ts` → `Unexpected ")"` near `src/server.ts`

Common reasons:
- a half-resolved merge conflict left invalid tokens in `src/server.ts`
- stale local file state after conflict resolution

Fix steps:
1. Re-sync branch and resolve conflicts fully.
2. Ensure `src/server.ts` matches the latest version in this repo.
3. Reinstall dependencies and retry:

```bash
npm install
npm run dev
```
