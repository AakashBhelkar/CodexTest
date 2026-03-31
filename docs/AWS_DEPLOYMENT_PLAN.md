# Confirmly AWS Deployment Plan

## 1) Target architecture (ECS-based, recommended)

```text
Users
  │
  ▼
CloudFront (CDN + TLS)
  ├── Origin A: S3 (frontend static assets)
  └── Origin B: ALB (API domain /api/*)
                  │
                  ▼
            ECS Fargate Cluster
              ├── Backend Service (Express API)
              ├── Worker Service (SQS consumer)
              └── Analyzer Service (FastAPI)
                  │
                  ├── RDS PostgreSQL (Multi-AZ, private subnet)
                  ├── ElastiCache Redis (private subnet)
                  └── SQS Queue (+ DLQ)

Other integrations:
- ECR (container image registry)
- Secrets Manager / SSM Parameter Store (secrets + env vars)
- CloudWatch Logs + Metrics + Alarms
- Route 53 (DNS)
- ACM (TLS certificates)
```

## 2) Service mapping

- **Compute**: ECS Fargate (preferred over EC2 for lower ops overhead).
- **Database**: Amazon RDS PostgreSQL.
- **Object storage**: Amazon S3 (frontend/static uploads).
- **CDN**: CloudFront in front of S3 + ALB.
- **Queue**: Amazon SQS (return risk jobs).
- **Cache**: Amazon ElastiCache Redis.

---

## 3) Step-by-step deployment

## Phase A — Foundation

1. **Create VPC**
   - 2+ AZs.
   - Public subnets: ALB + NAT Gateway.
   - Private subnets: ECS tasks, RDS, Redis.

2. **Security groups**
   - ALB SG: allow 80/443 from internet.
   - ECS SG: allow app port from ALB SG only.
   - RDS SG: allow 5432 from ECS SG only.
   - Redis SG: allow 6379 from ECS SG only.

3. **IAM roles**
   - ECS task execution role (pull ECR image, write CloudWatch logs).
   - ECS task role (SQS, S3, Secrets Manager access).

## Phase B — Data & messaging

4. **Provision RDS PostgreSQL**
   - Multi-AZ enabled (production).
   - Automated backups + retention.
   - Parameter group tuned for workload.

5. **Provision ElastiCache Redis**
   - Redis replication group (at least 1 replica for production).

6. **Create SQS queues**
   - Main queue: `return-risk-queue`.
   - DLQ: `return-risk-dlq`.
   - Redrive policy: move to DLQ after N receives (e.g., 5).

## Phase C — Container build and registry

7. **Create ECR repositories**
   - `confirmly-backend`
   - `confirmly-worker`
   - `confirmly-analyzer`
   - (optional) `confirmly-frontend` if frontend containerized.

8. **Build and push images**
   - Build from repository Dockerfiles.
   - Tag with commit SHA and `latest`.
   - Push to ECR.

## Phase D — ECS deployment

9. **Create ECS cluster (Fargate)**
   - Enable Container Insights.

10. **Define task definitions**
   - Backend task: Express API container.
   - Worker task: SQS worker command.
   - Analyzer task: FastAPI service.
   - Configure CPU/memory, health checks, CloudWatch logs.

11. **Inject secrets/config**
   - Store env vars in Secrets Manager or SSM:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `SHOPIFY_WEBHOOK_SECRET`
     - `SQS_QUEUE_URL`
     - `AWS_REGION`
     - `OPENAI_API_KEY`
   - Reference secrets in task definitions.

12. **Create Application Load Balancer**
   - HTTPS listener (ACM cert).
   - Target groups:
     - backend service
     - analyzer service (if publicly exposed)

13. **Create ECS services**
   - Backend service behind ALB with autoscaling.
   - Worker service (no ALB required) with desired count >= 1.
   - Analyzer service (ALB or private internal-only).

## Phase E — Frontend and CDN

14. **Deploy frontend to S3**
   - Create S3 bucket for static assets.
   - Enable versioning and block public access.

15. **Create CloudFront distribution**
   - Origin A: S3 bucket for frontend.
   - Origin B: ALB for `/api/*` path.
   - Add cache behaviors:
     - `/api/*` -> ALB (low/no cache, forward auth headers).
     - `/*` -> S3 (cache static files).

16. **DNS + TLS**
   - Route 53 records to CloudFront.
   - ACM certificate in us-east-1 for CloudFront domain.

## Phase F — Operations and hardening

17. **Observability**
   - CloudWatch dashboards (ALB, ECS, RDS, SQS).
   - Alarms for 5xx, CPU/memory, queue depth, DB connections.

18. **Security**
   - Enable AWS WAF on CloudFront.
   - Enable GuardDuty and Security Hub.
   - Rotate secrets regularly.

19. **CI/CD pipeline**
   - GitHub Actions / CodePipeline:
     - test -> build -> push ECR -> deploy ECS.
   - Blue/green deployment (CodeDeploy) for backend.

20. **Disaster recovery**
   - RDS snapshots and cross-region backup policy.
   - S3 lifecycle and replication if needed.

---

## 4) ECS vs EC2 decision guidance

- **Choose ECS Fargate** when you want faster delivery, autoscaling, and less server management.
- **Choose EC2** only if you need host-level control, custom AMIs, or lower cost at very high steady usage.

---

## 5) Suggested rollout order

1. Deploy RDS + Redis + SQS.
2. Deploy backend + worker to ECS.
3. Validate API and queue processing.
4. Deploy analyzer service.
5. Deploy frontend to S3 + CloudFront.
6. Cut over DNS in Route 53.
