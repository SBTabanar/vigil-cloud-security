# Architecture Overview

Vigil is designed as a modular, containerized platform with clear separation between scanning, scoring, remediation, and presentation layers.

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Browser   │  │   Stripe    │  │      PayMongo       │  │
│  │  (React)    │  │   Webhook   │  │      Webhook        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│              FastAPI + Uvicorn (Port 8000)                   │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │ Auth Router  │  │ Scan Router │  │ Billing Router     │  │
│  │ /api/v1/auth │  │/api/v1/orgs │  │ /api/v1/billing    │  │
│  └──────────────┘  └─────────────┘  └────────────────────┘  │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │ Org Router   │  │Remediation  │  │ Health Check       │  │
│  │ /api/v1/orgs │  │ /api/v1/rem │  │ /api/health        │  │
│  └──────────────┘  └─────────────┘  └────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│   Services      │ │   Database      │ │   External APIs     │
│  ┌───────────┐  │ │  ┌───────────┐  │ │  ┌───────────────┐  │
│  │Compliance │  │ │  │  SQLite   │  │ │  │   Stripe      │  │
│  │  Engine   │  │ │  │ (dev)     │  │ │  │   API         │  │
│  └───────────┘  │ │  └───────────┘  │ │  └───────────────┘  │
│  ┌───────────┐  │ │  ┌───────────┐  │ │  ┌───────────────┐  │
│  │Remediation│  │ │  │ PostgreSQL│  │ │  │   PayMongo    │  │
│  │  Service  │  │ │  │ (prod)    │  │ │  │   API         │  │
│  └───────────┘  │ │  └───────────┘  │ │  └───────────────┘  │
│  ┌───────────┐  │ │  ┌───────────┐  │ │  ┌───────────────┐  │
│  │  Billing  │  │ │  │   Redis   │  │ │  │   SendGrid    │  │
│  │  Service  │  │ │  │ (cache)   │  │ │  │   API         │  │
│  └───────────┘  │ │  └───────────┘  │ │  └───────────────┘  │
│  ┌───────────┐  │ │                 │ │  ┌───────────────┐  │
│  │   Email   │  │ │                 │ │  │   GitHub      │  │
│  │  Service  │  │ │                 │ │  │   API         │  │
│  └───────────┘  │ │                 │ │  └───────────────┘  │
└─────────────────┘ └─────────────────┘ └─────────────────────┘
```

## Data Flow

### Scan Execution Flow

1. **Trigger**: User clicks "Run Scan" → POST `/api/v1/organizations/{id}/scans`
2. **Validation**: Auth middleware verifies JWT + org membership (IDOR prevention)
3. **Simulation**: `_simulate_scan()` generates synthetic findings based on compliance policies
4. **Persistence**: Scan + findings written to database with indexed queries
5. **Notification**: Email service sends scan summary + critical alerts via SendGrid
6. **Response**: Dashboard data returned with timeline, actors, and remediation queue

### Payment Flow (Stripe)

1. **Checkout**: POST `/api/v1/billing/checkout` → Stripe Checkout session created
2. **Redirect**: User pays on Stripe-hosted page
3. **Webhook**: Stripe sends `checkout.session.completed` → organization activated
4. **Portal**: POST `/api/v1/billing/portal` → Stripe Billing Portal for self-service

### Payment Flow (PayMongo)

1. **Source**: POST `/api/v1/billing/checkout/paymongo` → PayMongo Source for GCash/Maya
2. **Redirect**: User authenticates on GCash/Maya app
3. **Webhook**: PayMongo sends `source.chargeable` → payment processed
4. **Activation**: Organization subscription activated in database

## Security Model

### Authentication
- **JWT tokens**: HS256, 30-minute expiry, `sub` claim contains user ID
- **Password hashing**: bcrypt with cost factor 12
- **Rate limiting**: 5 login attempts per IP per 60 seconds (in-memory, Redis recommended for production)

### Authorization
- **Organization-scoped**: Every data endpoint verifies `OrganizationMember` record
- **Role-based**: `owner` vs `member` (extensible to `admin`, `viewer`)
- **Resource-level**: Remediation endpoints check finding ownership via org membership

### CORS
- **Strict whitelist**: Only `FRONTEND_URL` origin allowed in production
- **Debug mode**: Additional `localhost:5173` allowed for development
- **Credentials**: `allow_credentials=True` never paired with wildcard origins

## Database Schema

### Core Tables

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `users` | Authentication | `email` (unique) |
| `organizations` | Multi-tenancy | `slug` (unique) |
| `organization_members` | Access control | `(user_id, organization_id)` |
| `aws_accounts` | Connected accounts | `organization_id` |
| `scans` | Scan history | `organization_id`, `aws_account_id` |
| `findings` | Security findings | `(organization_id, severity)`, `(organization_id, is_remediated)` |

### Composite Indexes

```sql
-- Dashboard queries: filter by org + severity
CREATE INDEX idx_finding_org_severity ON findings (organization_id, severity);

-- Remediation queue: filter by org + remediation status
CREATE INDEX idx_finding_org_remediated ON findings (organization_id, is_remediated);
```

## Technology Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| API Framework | FastAPI | Async-native, automatic OpenAPI docs, Pydantic validation |
| ORM | SQLAlchemy 2.0 | Mature, supports SQLite→PostgreSQL migration |
| Frontend | React + Vite | Fast dev server, minimal config, tree-shaking |
| Charts | Recharts | React-native, responsive, customizable |
| Styling | Inline CSS-in-JS | Zero dependency bloat, demonstrates raw CSS mastery |
| ML | XGBoost | Industry standard, SHAP-compatible, fast inference |
| Payments | Stripe + PayMongo | Global cards + PH e-wallets |
| Container | Docker Compose | Single-command deployment for contributors |

## Performance Considerations

### Current (Development)
- **Database**: SQLite with `check_same_thread=False` for FastAPI concurrency
- **Caching**: None (queries are fast enough for demo data)
- **Async**: Simulated scans run synchronously (acceptable for <100 findings)

### Production Recommendations
- **Database**: PostgreSQL with connection pooling (PgBouncer)
- **Caching**: Redis for scan results, user sessions, and rate limiting
- **Queue**: Celery + Redis for async scan execution
- **Workers**: Separate container for ML inference to avoid blocking API
- **CDN**: CloudFront/Cloudflare for static frontend assets

## Deployment Targets

### Docker Compose (Development)
```bash
docker-compose up --build -d
```
Runs all services on localhost. SQLite database persisted in volume.

### Kubernetes (Production)
See [Deployment](Deployment) for Helm charts and manifest examples.
