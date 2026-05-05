# API Reference

Base URL: `https://api.vigil.yourdomain.com/api/v1`

Authentication: Bearer token in `Authorization` header

## Auth Endpoints

### POST /auth/register

Register a new user and return JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "first_name": "Jane",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "is_admin": false,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400`: Registration failed (email exists or password too weak)
- `429`: Rate limit exceeded (5 attempts per 60 seconds)

---

### POST /auth/login

Login with email and password.

**Request:**
```bash
curl -X POST /api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=SecurePass123"
```

**Response:** Same as `/auth/register`

**Errors:**
- `400`: Incorrect email or password
- `429`: Rate limit exceeded

---

### GET /auth/me

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "is_admin": false,
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

## Organization Endpoints

### POST /organizations

Create a new organization.

**Request:**
```json
{
  "name": "Acme Corp",
  "industry": "fintech",
  "plan": "starter"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Acme Corp",
  "slug": "acme-corp-a1b2c3d4",
  "industry": "fintech",
  "plan": "starter",
  "is_active": true,
  "created_at": "2025-01-15T10:30:00Z",
  "member_count": 1,
  "account_count": 0
}
```

---

### GET /organizations

List organizations for current user.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Acme Corp",
    "slug": "acme-corp-a1b2c3d4",
    "industry": "fintech",
    "plan": "starter",
    "is_active": true,
    "created_at": "2025-01-15T10:30:00Z",
    "member_count": 3,
    "account_count": 2
  }
]
```

---

### GET /organizations/{org_id}

Get organization details.

**Response:** Same object as POST response

**Errors:**
- `403`: Not a member of this organization

---

### POST /organizations/{org_id}/aws-accounts

Add an AWS account to an organization.

**Request:**
```json
{
  "account_name": "Production",
  "account_id": "123456789012",
  "role_arn": "arn:aws:iam::123456789012:role/VigilScannerRole",
  "external_id": "uuid-external-id",
  "regions": ["us-east-1", "eu-west-1"]
}
```

**Response:**
```json
{
  "id": 1,
  "account_name": "Production",
  "account_id": "123456789012",
  "role_arn": "arn:aws:iam::123456789012:role/VigilScannerRole",
  "external_id": "uuid-external-id",
  "regions": ["us-east-1", "eu-west-1"],
  "is_connected": true,
  "last_scan_at": null,
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

### GET /organizations/{org_id}/onboarding-template

Get CloudFormation template for cross-account IAM role.

**Response:**
```json
{
  "cloudformation_template": { ... },
  "external_id": "uuid-external-id",
  "instructions": ["1. Log in to AWS console...", ...]
}
```

---

## Scan Endpoints

### POST /organizations/{org_id}/scans

Create and run a new scan.

**Request:**
```json
{
  "aws_account_id": 1,
  "scan_type": "full"
}
```

**Response:**
```json
{
  "id": 1,
  "organization_id": 1,
  "aws_account_id": 1,
  "scan_type": "full",
  "status": "completed",
  "started_at": "2025-01-15T10:30:00Z",
  "completed_at": "2025-01-15T10:35:00Z",
  "events_analyzed": 1847293,
  "sequences_found": 4521,
  "malicious_sequences": 23,
  "max_risk_score": 892.4,
  "avg_risk_score": 312.5,
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `400`: No AWS accounts connected

---

### GET /organizations/{org_id}/scans

List all scans for an organization.

**Response:** Array of scan objects

---

### GET /organizations/{org_id}/findings

List findings with optional filters.

**Query Parameters:**
- `severity` (optional): `critical`, `high`, `medium`, `low`
- `remediated` (optional): `true` or `false`

**Response:**
```json
[
  {
    "id": 1,
    "organization_id": 1,
    "scan_id": 1,
    "policy_id": "S3-001",
    "policy_name": "S3 Bucket Public Read Access",
    "severity": "critical",
    "description": "Detected s3 bucket public read access...",
    "resource_arn": "arn:aws:s3:::customer-data-backup",
    "resource_type": "s3",
    "region": "us-east-1",
    "compliance_frameworks": ["CIS", "SOC2", "PCI"],
    "remediation_complexity": "auto",
    "estimated_fix_time": 2,
    "is_remediated": false,
    "dollar_impact_low": 50000,
    "dollar_impact_high": 2500000,
    "created_at": "2025-01-15T10:35:00Z"
  }
]
```

---

### GET /organizations/{org_id}/dashboard

Get dashboard data with summary, timeline, and remediation queue.

**Response:**
```json
{
  "summary": {
    "organization_id": 1,
    "organization_name": "Acme Corp",
    "total_events": 1847293,
    "total_sequences": 4521,
    "malicious_sequences": 23,
    "total_findings": 15,
    "critical_findings": 3,
    "high_findings": 5,
    "medium_findings": 4,
    "max_risk_score": 892.4,
    "avg_risk_score": 312.5,
    "auto_remediable": 8,
    "compliance_frameworks": ["CIS", "SOC2", "PCI", "HIPAA", "GDPR"],
    "last_scan_at": "2025-01-15T10:35:00Z",
    "aws_accounts": 2
  },
  "timeline": [
    {
      "date": "01-15",
      "avg_score": 312.5,
      "max_score": 892.4,
      "sequences": 4521
    }
  ],
  "top_actors": [...],
  "score_distribution": {...},
  "findings_by_severity": {...},
  "compliance_summary": {...},
  "remediation_queue": [...],
  "feature_importance": [...]
}
```

---

## Remediation Endpoints

### POST /remediation/generate/{finding_id}

Generate Terraform code for a finding.

**Response:**
```json
{
  "success": true,
  "finding_id": 1,
  "terraform_code": "resource \"aws_s3_bucket_public_access_block\" ...",
  "module_path": "/tmp/vigil-remediation/finding-1",
  "error": null
}
```

---

### POST /remediation/plan/{finding_id}

Run `terraform plan` for a finding's remediation.

**Response:**
```json
{
  "success": true,
  "finding_id": 1,
  "terraform_code": "...",
  "plan_output": "Terraform will perform the following actions: ...",
  "error": null
}
```

---

### POST /remediation/github-pr/{finding_id}

Create a GitHub PR with the Terraform remediation.

**Request:**
```json
{
  "repo_url": "https://github.com/acme/infrastructure"
}
```

**Response:**
```json
{
  "success": true,
  "finding_id": 1,
  "pull_request_url": "https://github.com/acme/infrastructure/compare/main...vigil-remediation",
  "terraform_code": "..."
}
```

**Errors:**
- `400`: Invalid repository URL (only github.com allowed)

---

### GET /remediation/templates

List available remediation template types.

**Response:**
```json
{
  "templates": [
    {
      "id": "s3-public-access",
      "name": "Block S3 Public Access",
      "resource_types": ["S3Bucket"]
    }
  ]
}
```

---

## Billing Endpoints

### GET /billing/plans

Get available subscription plans.

**Response:**
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "description": "1 AWS account, daily scans, CIS + SOC2",
      "price_monthly_cents": 250000,
      "price_monthly_display_usd": "$2,500",
      "features": ["1 AWS account", "Daily scans", "CIS + SOC2"]
    }
  ]
}
```

---

### POST /billing/checkout

Create Stripe Checkout session.

**Request:**
```json
{
  "plan": "starter",
  "success_url": "https://vigil.yourdomain.com/app/settings?upgraded=1",
  "cancel_url": "https://vigil.yourdomain.com/app/settings?canceled=1"
}
```

**Response:**
```json
{
  "provider": "stripe",
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

---

### POST /billing/checkout/paymongo

Create PayMongo Source for e-wallet checkout.

**Request:**
```json
{
  "plan": "starter",
  "type": "gcash",
  "success_url": "https://vigil.yourdomain.com/app/settings?upgraded=1",
  "failed_url": "https://vigil.yourdomain.com/app/settings?canceled=1"
}
```

**Response:**
```json
{
  "provider": "paymongo",
  "source_id": "src_...",
  "checkout_url": "https://checkout.paymongo.com/...",
  "amount": 140000,
  "currency": "PHP",
  "type": "gcash"
}
```

---

### POST /billing/portal

Create Stripe Billing Portal session.

**Request:**
```json
{
  "return_url": "https://vigil.yourdomain.com/app/settings"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

---

### GET /billing/subscription

Get current subscription status.

**Response:**
```json
{
  "organization_id": 1,
  "plan": "professional",
  "status": "active",
  "is_active": true,
  "payment_provider": "stripe",
  "trial_ends_at": null,
  "stripe_customer_id": "cus_...",
  "stripe_subscription_id": "sub_...",
  "details": {
    "status": "active",
    "current_period_end": "2025-02-15T10:30:00Z",
    "cancel_at_period_end": false,
    "plan": "price_professional_monthly"
  }
}
```

---

### POST /billing/cancel

Cancel current subscription.

**Request:**
```json
{
  "at_period_end": true
}
```

**Response:**
```json
{
  "provider": "stripe",
  "status": "active",
  "cancel_at_period_end": true,
  "current_period_end": "2025-02-15T10:30:00Z"
}
```

---

## Webhook Endpoints

### POST /billing/webhook

Stripe webhook endpoint.

**Headers:** `Stripe-Signature: t=...,v1=...`

**Body:** Raw JSON payload from Stripe

**Response:**
```json
{
  "status": "processed",
  "event": "checkout.session.completed"
}
```

---

### POST /billing/webhook/paymongo

PayMongo webhook endpoint.

**Headers:** `Paymongo-Signature: t=...,te=...,li=...`

**Body:** Raw JSON payload from PayMongo

**Response:**
```json
{
  "status": "processed",
  "event": "source.chargeable"
}
```

---

## Health Check

### GET /api/health

Basic health check (no auth required).

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Human-readable error message"
}
```

**Common Status Codes:**

| Code | Meaning | Typical Cause |
|------|---------|---------------|
| `400` | Bad Request | Invalid parameters, validation failure |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Valid token but no access to resource (IDOR) |
| `404` | Not Found | Resource doesn't exist |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /auth/login` | 5 requests | 60 seconds per IP |
| `POST /auth/register` | 5 requests | 60 seconds per IP |
| All other endpoints | 100 requests | 60 seconds per IP |

**Note:** Rate limiting is in-memory in development. Use Redis in production.
