# Vigil Wiki

Welcome to the Vigil wiki. This is the living documentation for the Vigil cloud security platform.

## Quick Links

- [Architecture Overview](Architecture) — How Vigil works under the hood
- [Compliance Frameworks](Compliance-Mappings) — Deep dive into 7-framework mappings
- [Payment Integration](Payment-Integration) — Stripe + PayMongo dual provider setup
- [Production Deployment](Deployment) — From Docker Compose to Kubernetes
- [API Reference](API-Reference) — Complete endpoint documentation
- [Contributing Guide](Contributing) — How to extend Vigil

## What is Vigil?

Vigil is an open-source cloud security posture management (CSPM) platform that:

1. **Scans AWS accounts** for misconfigurations across 7 compliance frameworks
2. **Scores risk with ML** using behavioral sequence analysis
3. **Auto-remediates** via Terraform with GitHub PR integration
4. **Maps findings** to specific regulatory controls with dollar-impact estimates

## Philosophy

- **Explainable over opaque**: SHAP-ready feature importance, not black-box scores
- **Actionable over informational**: Terraform patches, not just PDF reports
- **Accessible over exclusive**: GCash/Maya support for Philippine users
- **Transparent over proprietary**: AGPL-3.0 ensures security tooling stays open
