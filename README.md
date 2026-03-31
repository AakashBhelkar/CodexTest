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
│   │   ├── auth.controller.ts
│   │   ├── rule-engine.controller.ts
│   │   ├── return-request.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── protected.routes.ts
│   │   ├── rule-engine.routes.ts
│   │   └── return-request.routes.ts
│   ├── services/
│   │   ├── risk-scoring.service.ts
│   │   ├── rule-engine.service.ts
│   │   ├── return-request.service.ts
│   │   └── user.store.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   ├── jwt.ts
│   │   ├── risk.ts
│   │   └── user.ts
│   ├── validators/
│   │   ├── rule-engine.validator.ts
│   │   └── return-request.validator.ts
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
