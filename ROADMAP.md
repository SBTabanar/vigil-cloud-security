# Vigil Roadmap

This roadmap outlines planned features and improvements. Items are prioritized but not strictly scheduled.

## Q2 2025 — Foundation

- [x] Core FastAPI backend with JWT auth
- [x] React frontend with routing and auth context
- [x] SQLite database with SQLAlchemy models
- [x] AWS onboarding via CloudFormation cross-account IAM role
- [x] Synthetic scan engine with XGBoost risk scoring
- [x] 7 compliance framework mappings (HIPAA, GDPR, SOC2, PCI, ISO, CIS, NIST)
- [x] Terraform remediation generation
- [x] Stripe billing integration
- [x] PayMongo billing integration (GCash, Maya)
- [x] SendGrid email notifications
- [x] Docker Compose local deployment
- [ ] Alembic database migrations
- [ ] PostgreSQL production support
- [ ] pytest test suite for backend APIs

## Q3 2025 — Real Data

- [ ] Live AWS API scanning (boto3 cross-account reads)
- [ ] CloudTrail log ingestion from S3
- [ ] EventBridge real-time streaming
- [ ] Retrain ML model on real customer data (with consent)
- [ ] Multi-region scan support
- [ ] Scan scheduling (cron-based via Celery Beat)

## Q4 2025 — Multi-Cloud & Scale

- [ ] GCP Security Command Center integration
- [ ] Azure Monitor / Activity Log integration
- [ ] Kubernetes (EKS/GKE/AKS) security posture scanning
- [ ] Open Policy Agent (OPA) policy engine
- [ ] Custom policy builder UI
- [ ] Role-based access control (RBAC) beyond owner/admin/member
- [ ] Audit log for all platform actions

## Future Ideas

- **SARIF export** — Integration with GitHub Advanced Security
- **Slack/Teams bots** — Interactive remediation approvals
- **Mobile app** — React Native dashboard viewer
- **On-premise installer** — Air-gapped deployment for regulated industries
- **Federation** — Multi-tenant SaaS with isolated databases per tenant
- **LLM integration** — GPT-4 generated remediation explanations
- **Community policy marketplace** — Share custom compliance policies

## Completed

See [GitHub Releases](https://github.com/SBTabanar/vigil-cloud-security/releases) for shipped features.
