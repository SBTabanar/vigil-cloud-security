# Vigil — Cloud Security & Compliance Automation

<img width="1470" height="722" alt="dashboard" src="https://github.com/user-attachments/assets/0932180e-fad4-44de-82cf-7e78c8a95e16" />


> **Portfolio Project** | A production-grade cloud security platform built with FastAPI, React, and XGBoost.
> 
> 🔒 **License:** AGPL-3.0 | 🌏 **Built in:** Manila, Philippines

[![AGPL-3.0 License](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-61DAFB?logo=react)](https://react.dev/)

---

## What This Is

Vigil is a **cloud misconfiguration detection and remediation platform** that I built from scratch to demonstrate full-stack engineering, machine learning for security, and DevOps skills. It continuously monitors AWS environments, detects attack sequences in CloudTrail logs using an XGBoost model, maps findings to 7 compliance frameworks, and generates Terraform remediation patches.

This project is **open-source** and intended as a portfolio piece. You can self-host it, study the code, or contribute.

---

## Live Demo Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   React     │────▶│  FastAPI     │────▶│  SQLite/Postgre │
│  (Vite)     │◄────│  (Python)    │◄────│   (SQLAlchemy)  │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │
                    ┌──────┴──────┬──────────┐
                    ▼             ▼          ▼
              ┌────────┐   ┌──────────┐  ┌──────────┐
              │ Redis  │   │ Stripe/  │  │ SendGrid │
              │(Cache) │   │ PayMongo │  │ (Email)  │
              └────────┘   └──────────┘  └──────────┘
```

---

## Key Features

### Security Engineering
- **ML-Powered Risk Scoring** — XGBoost model trained on 16K synthetic attack sequences (AUC-ROC 1.0 on synthetic validation data)
- **Kill Chain Detection** — Maps CloudTrail events to MITRE ATT&CK-style sequences (Recon → PrivEsc → Data Access)
- **Drift Detection** — Identifies manual console changes that bypass IaC
- **Auto-Remediation** — Generates Terraform patches and AWS CLI commands for 40% of findings

### Compliance Automation
| Framework | Key Controls |
|-----------|-------------|
| **HIPAA** | 164.312 access control, encryption, audit logging |
| **GDPR** | Art. 32 security of processing, Art. 25 privacy by design |
| **SOC 2 Type II** | CC6.x logical access, CC7.x system operations |
| **PCI DSS 4.0** | Network segmentation, encryption at rest |
| **ISO 27001:2022** | Cryptography, access control |
| **CIS AWS 3.0** | IAM, S3, EC2, logging benchmarks |
| **NIST CSF 2.0** | Access control, privilege management |

<img width="1470" height="722" alt="Screenshot 2026-05-05 at 1 13 06 PM" src="https://github.com/user-attachments/assets/b1108c02-ca44-4e9c-9750-fd7f6e2ec4e5" />


### Full-Stack Implementation
- **Backend:** FastAPI, SQLAlchemy, JWT auth, async email service
- **Frontend:** React 18, React Router, Recharts, inline CSS (no UI framework dependency)
- **Payments:** Dual-provider billing with Stripe (global cards) and PayMongo (PH e-wallets: GCash, Maya)
- **DevOps:** Docker Compose, multi-stage builds, environment-based config

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | Python 3.11, FastAPI | Async by default, auto-generated OpenAPI docs, type safety |
| **ML** | XGBoost, scikit-learn | Industry-standard gradient boosting, excellent for tabular security data |
| **Frontend** | React 18, Vite | Fast HMR, small bundle, modern JSX |
| **Database** | SQLite (dev), PostgreSQL (prod) | Zero-config local dev, production-grade migration path |
| **Cache** | Redis | Session storage, rate limiting, Celery broker |
| **Payments** | Stripe + PayMongo | Global reach + Philippines local payment methods |
| **Email** | SendGrid | Reliable transactional email with templates |
| **Infra** | Docker, Docker Compose | Portable, reproducible, one-command deploy |

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- Node.js 18+ (if running frontend locally)
- Python 3.11+ (if running backend locally)

### One-Command Local Deploy

```bash
git clone https://github.com/SBTabanar/vigil-cloud-security.git
cd vigil-cloud-security

# Copy environment template
cp .env.example .env
# Edit .env with your API keys (optional for basic usage)

docker-compose up --build -d
```

**Access:**
- App: http://localhost:5173
- API Docs: http://localhost:8000/api/docs
- API Base: http://localhost:8000/api/v1

### Local Development (Without Docker)

```bash
# Terminal 1 — Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/           # REST routers (auth, orgs, scans, billing, remediation)
│   │   ├── core/          # Config, security, JWT
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response validation
│   │   ├── services/      # Business logic (Stripe, PayMongo, SendGrid, ML, compliance)
│   │   └── main.py        # FastAPI app factory
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/         # Route-level components (Landing, Dashboard, Settings, etc.)
│   │   ├── components/    # Shared UI (Layout)
│   │   └── hooks/         # useAuth context + apiFetch wrapper
│   ├── Dockerfile
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── LICENSE
```

---

## API Highlights

| Endpoint | Description |
|----------|-------------|
| `POST /auth/register` | JWT registration with bcrypt hashing |
| `POST /auth/login` | OAuth2PasswordBearer token issuance |
| `POST /organizations` | Multi-tenant org creation |
| `GET /organizations/{id}/onboarding-template` | Generates CloudFormation IAM role template |
| `POST /organizations/{id}/scans` | Triggers async security scan |
| `GET /organizations/{id}/dashboard` | Aggregated risk metrics + timeline |
| `POST /billing/checkout` | Stripe Checkout session |
| `POST /billing/checkout/paymongo` | PayMongo Source for GCash/Maya |
| `POST /billing/webhook` | Stripe webhook handler (signature verified) |
| `POST /billing/webhook/paymongo` | PayMongo webhook handler (HMAC verified) |
| `POST /remediation/generate/{id}` | Terraform patch generation |

---

## Machine Learning Pipeline

The risk scoring model was trained on a synthetic dataset mimicking real CloudTrail behavior patterns:

1. **Feature Engineering** — Event counts, time windows, actor diversity, API entropy
2. **Sequence Generation** — 8 benign + 8 malicious behavioral patterns
3. **Model** — XGBoost classifier with SHAP-ready feature importance
4. **Validation** — AUC-ROC 1.0 on synthetic holdout (note: real-world performance requires production data)
5. **Inference** — Real-time scoring during scan execution

Model artifact: `vigil/data/models/vigil_risk_model.pkl`

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Inline CSS (no Tailwind/MUI)** | Demonstrates raw CSS-in-JS understanding, zero dependency bloat |
| **SQLite for dev** | Contributors can run immediately without PostgreSQL setup |
| **Dual payment providers** | Shows internationalization awareness (Stripe for US/EU, PayMongo for PH) |
| **Heuristic + ML scoring** | Explainable scores for enterprise buyers, not black-box predictions |
| **JWT over sessions** | Stateless auth fits containerized deployment |
| **Terraform over boto3** | Infrastructure-as-code remediation leaves audit trail |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, conventions, and how to open a PR.

We welcome:
- New compliance framework mappings (FedRAMP, MAS TRM, PDPA, DORA)
- Additional AWS service coverage (Lambda, EKS, ECS)
- Frontend UI/UX improvements
- Bug fixes and documentation

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features and milestones.

Highlights:
- [ ] Migrate to PostgreSQL + Alembic migrations
- [ ] Add GCP and Azure scanners
- [ ] Implement real-time EventBridge streaming
- [ ] Build GitHub App for auto-PR remediation
- [ ] Add Open Policy Agent (OPA) integration

---

## License

This project is licensed under the **GNU Affero General Public License v3.0**.

If you run a modified version of this software on a public server, you must make your source code available to users. See [LICENSE](./LICENSE) for details.

---

## Acknowledgments

Built as a portfolio project to explore the intersection of **machine learning**, **cloud security**, and **full-stack engineering**. Inspired by tools like Wiz, Lacework, and Prowler — but designed to be fully transparent and hackable.

**Questions?** Open a [GitHub Discussion](https://github.com/SBTabanar/vigil-cloud-security/discussions).
