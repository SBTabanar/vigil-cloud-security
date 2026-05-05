# Contributing to Vigil

Thank you for considering contributing to Vigil! This document provides guidelines and instructions for extending the platform.

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker + Docker Compose
- Git

### Development Setup

```bash
# Clone the repository
git clone https://github.com/SBTabanar/vigil-cloud-security.git
cd vigil-cloud-security

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install

# Run with Docker Compose (recommended)
cd ..
cp .env.example .env
# Edit .env — set SECRET_KEY
docker-compose up --build -d
```

## Project Structure

```
vigil-cloud-security/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI route handlers
│   │   ├── core/          # Config, security, middleware
│   │   ├── models/        # SQLAlchemy database models
│   │   ├── schemas/       # Pydantic request/response models
│   │   └── services/      # Business logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # React custom hooks
│   │   └── pages/         # Page-level components
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Follow the code style of existing files. Key conventions:

**Backend:**
- Use type hints everywhere
- Follow PEP 8 (run `black` and `flake8` before committing)
- Use `datetime.now(timezone.utc)` for timestamps (never `datetime.utcnow()`)
- Validate all user input with Pydantic models
- Add `db: Session = Depends(get_db)` for database access
- Verify org membership on every org-scoped endpoint

**Frontend:**
- Use functional components with hooks
- Inline CSS-in-JS (no Tailwind or MUI)
- Use `useAuth()` hook for API calls
- Handle loading and error states

### 3. Test Your Changes

```bash
# Backend syntax check
find backend/app -name "*.py" -exec python3 -m py_compile {} \;

# Run the app
docker-compose up --build -d

# Test the feature manually
# Login: demo@vigil.local / demo123
```

### 4. Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new compliance framework
fix: correct HIPAA control mapping
docs: update API reference
refactor: improve scan performance
test: add auth rate limiting tests
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a PR on GitHub with:
- Clear description of what changed and why
- Screenshots for UI changes
- Reference to any related issues

## Areas to Contribute

### High Priority

1. **Real AWS Integration**: Replace `_simulate_scan()` with actual CloudTrail analysis
2. **Additional Compliance Frameworks**: FedRAMP, CMMC, SOC1
3. **Kubernetes Security**: Scan k8s clusters for misconfigurations
4. **Real ML Model**: Train XGBoost on actual AWS CloudTrail data
5. **Terraform Cloud Integration**: Remote state management

### Medium Priority

1. **Additional Payment Providers**: PayPal, Razorpay (India)
2. **Slack/Teams Notifications**: Webhook-based alert channels
3. **PDF Reports**: Executive summary generation
4. **SSO Integration**: OAuth2/OIDC (Google, Microsoft, Okta)
5. **Audit Logging**: Immutable activity logs

### Good First Issues

1. **UI Polish**: Loading skeletons, empty states, error boundaries
2. **Form Validation**: Better client-side validation messages
3. **Dark/Light Theme**: CSS variable-based theming
4. **i18n**: Multi-language support (start with Filipino/Tagalog)
5. **Accessibility**: ARIA labels, keyboard navigation

## Adding a New Compliance Framework

### 1. Add Framework Metadata

In `backend/app/services/compliance.py`:

```python
FRAMEWORK_METADATA = {
    "Your Framework": {
        "category": "your_category",
        "industries": ["industry1", "industry2"],
        "required_for": ["use_case1"],
        "penalties": {
            "tier1": {"min": 1000, "max": 50000, "unit": "per_violation"}
        }
    }
}
```

### 2. Map Policies

Add framework tags to existing policies:

```python
COMPLIANCE_POLICIES = {
    "s3-public-access": {
        "frameworks": [
            "CIS AWS Foundations 3.0:2.1.5",
            "Your Framework:Control-ID",
        ]
    }
}
```

### 3. Update Dashboard

In `backend/app/api/scans.py`, add framework to `compliance_summary`:

```python
"Your Framework": {
    "total_findings": len([f for f in findings if "Your Framework" in str(f.compliance_frameworks)]),
    "critical": len([f for f in findings if "Your Framework" in str(f.compliance_frameworks) and f.severity == "critical"]),
    "controls_affected": ["Control-1", "Control-2"]
}
```

### 4. Update Wiki

Add framework to [Compliance-Mappings](Compliance-Mappings) wiki page.

## Adding a New Remediation Template

### 1. Add Generator

In `backend/app/services/remediation.py`:

```python
def _your_fix(self, resource_id: str, arn: str, region: str) -> str:
    return f'''resource "aws_your_resource" "{resource_id}" {{
  # Your Terraform code here
}}'''
```

### 2. Register Generator

Add to `generators` dictionary:

```python
generators = {
    "your-finding-type": self._your_fix,
    # ...existing generators
}
```

### 3. Add API Endpoint

In `backend/app/api/remediation.py`, the template is automatically available via `/remediation/templates`.

## Adding a New Payment Provider

### 1. Create Service

Create `backend/app/services/your_provider.py`:

```python
class YourProviderService:
    @staticmethod
    async def create_checkout(...):
        # Implementation
        pass
    
    @staticmethod
    def verify_webhook(payload, signature, secret):
        # HMAC verification
        pass
```

### 2. Add API Routes

In `backend/app/api/billing.py`:

```python
@router.post("/checkout/your-provider")
async def create_your_provider_checkout(...):
    # Validate, create checkout, return URL
    pass
```

### 3. Update Webhook Handler

In `sync_org_from_webhook()`, add provider handling:

```python
if provider == "your_provider":
    org.your_provider_customer_id = webhook_result.get("customer_id")
```

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] All Python files pass `python3 -m py_compile`
- [ ] No hardcoded secrets or URLs (use `settings.FRONTEND_URL`)
- [ ] All datetime uses `timezone.utc` (no `datetime.utcnow()`)
- [ ] All org-scoped endpoints verify `OrganizationMember`
- [ ] Input validation on all user-facing endpoints
- [ ] Error messages don't leak sensitive information
- [ ] No vibecoding artifacts (placeholder comments, "In production" TODOs)
- [ ] Commit messages follow Conventional Commits

## Testing

Currently, Vigil uses manual testing with seeded demo data. We're working on:

- Unit tests with `pytest`
- Integration tests with `TestClient`
- Frontend tests with `vitest` + `@testing-library/react`

If you'd like to set up the testing framework, that's a valuable contribution!

## Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security concerns to: [create a security email or use GitHub private vulnerability reporting]
3. We'll respond within 48 hours and work on a fix

## Community

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and ideas
- Wiki: Living documentation (you can edit directly)

## License

By contributing to Vigil, you agree that your contributions will be licensed under the AGPL-3.0 License.

---

**Thank you for making cloud security more accessible!**
