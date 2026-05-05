# Compliance Framework Mappings

Vigil maps every security finding to specific controls across 7 compliance frameworks. This isn't a generic "this is bad" — it's "this violates HIPAA §164.312(a)(1) and GDPR Art. 32(1)(b)."

## Supported Frameworks

| Framework | Version | Category | Industries |
|-----------|---------|----------|------------|
| CIS AWS Foundations | 3.0 | Security Benchmark | All |
| SOC2 Type II | — | Audit Standard | SaaS, Fintech, Healthcare |
| ISO 27001:2022 | 2022 | International Standard | All |
| PCI DSS | 4.0 | Payment Standard | Fintech, E-commerce |
| NIST CSF | 2.0 | Government Framework | GovTech, Critical Infrastructure |
| HIPAA | — | Healthcare Regulation | Healthcare, HealthTech |
| GDPR | — | Data Protection | EU, Global with EU users |

## Finding-to-Framework Mapping

### S3 Bucket Public Access

**Finding**: S3 bucket allows public read or write access

**Mapped Controls**:
- CIS AWS Foundations 3.0: **2.1.5** — Ensure S3 buckets are not publicly readable/writable
- PCI DSS 4.0: **1.3.1** — Implement security controls on system components
- SOC2 Type II: **CC6.6** — Logical access security measures
- HIPAA: **164.312(a)(1)** — Access control
- GDPR: **Art. 32(1)(b)** — Security of processing
- GDPR: **Art. 5(1)(f)** — Integrity and confidentiality

**Remediation Complexity**: `one_click` (Terraform `aws_s3_bucket_public_access_block`)

**Dollar Impact**: $25K–$2.5M (data breach notification, regulatory fines)

---

### IAM User Without MFA

**Finding**: Console login detected without MFA enforcement

**Mapped Controls**:
- CIS AWS Foundations 3.0: **1.10** — Ensure multi-factor authentication is enabled for all IAM users
- SOC2 Type II: **CC6.1** — Logical and physical access controls
- ISO 27001:2022: **A.9.4.2** — Secure log-on procedures
- HIPAA: **164.312(a)(2)(iv)** — Encryption and decryption
- GDPR: **Art. 32(1)(b)** — Security of processing

**Remediation Complexity**: `automated` (Terraform `aws_iam_user_policy` with MFA enforcement)

**Dollar Impact**: $10K–$500K (account takeover, lateral movement)

---

### IAM Privilege Escalation

**Finding**: API call indicates possible privilege escalation attempt

**Mapped Controls**:
- CIS AWS Foundations 3.0: **1.16, 1.20** — Minimize access and ensure IAM policies don't allow privilege escalation
- NIST CSF 2.0: **PR.AC-4** — Access permissions and authorizations are managed
- SOC2 Type II: **CC6.3** — Logical access security measures
- HIPAA: **164.312(a)(1)** — Access control
- GDPR: **Art. 32(1)(b)** — Security of processing

**Remediation Complexity**: `manual` (requires policy review and principle of least privilege)

**Dollar Impact**: $100K–$5M (full environment compromise)

---

### CloudTrail Logging Disabled

**Finding**: CloudTrail is not enabled in all regions or logs are not encrypted

**Mapped Controls**:
- CIS AWS Foundations 3.0: **3.1** — Ensure CloudTrail is enabled in all regions
- SOC2 Type II: **CC7.2** — System operations monitoring
- HIPAA: **164.312(b)** — Audit controls
- GDPR: **Art. 30** — Records of processing activities
- GDPR: **Art. 5(1)(f)** — Integrity and confidentiality

**Remediation Complexity**: `one_click` (Terraform `aws_cloudtrail` multi-region trail)

**Dollar Impact**: $5K–$250K (undetected breach, audit failure)

---

### RDS Unencrypted

**Finding**: RDS instance or snapshot created without encryption at rest

**Mapped Controls**:
- CIS AWS Foundations 3.0: **2.3.1** — Ensure RDS instances are encrypted
- PCI DSS 4.0: **3.4.1** — Strong cryptography for stored account data
- HIPAA: **164.312(a)(2)(iv)** — Encryption and decryption
- GDPR: **Art. 32(1)(a)** — Pseudonymisation and encryption

**Remediation Complexity**: `manual` (requires snapshot → encrypt → restore cycle)

**Dollar Impact**: $100K–$10M (PHI exposure, HIPAA tier 4 penalties)

---

### GDPR Data Residency

**Finding**: Personal data stored outside EU without adequacy decision or safeguards

**Mapped Controls**:
- GDPR: **Art. 44** — Transfers on basis of adequacy decision
- GDPR: **Art. 45** — Transfers on basis of appropriate safeguards
- GDPR: **Art. 46** — Binding corporate rules
- GDPR: **Art. 49** — Derogations for specific situations

**Remediation Complexity**: `manual` (requires DPA, SCCs, or infrastructure migration)

**Dollar Impact**: Up to €20M or 4% global turnover (GDPR tier 2)

---

### HIPAA Minimum Necessary

**Finding**: IAM policies grant broader access than required for workforce members handling PHI

**Mapped Controls**:
- HIPAA: **164.502(b)** — Minimum necessary standard
- HIPAA: **164.308(a)(3)(ii)(A)** — Workforce clearance procedure
- HIPAA: **164.308(a)(3)(ii)(B)** — Workforce authorization
- SOC2 Type II: **CC6.3** — Logical access security measures

**Remediation Complexity**: `manual` (requires role analysis and policy refactoring)

**Dollar Impact**: $100–$1.5M per violation (HIPAA tiered penalties)

## Penalty Reference

### HIPAA
| Tier | Knowledge | Min per violation | Max per violation | Max annual |
|------|-----------|-------------------|-------------------|------------|
| 1 | Unknowing | $100 | $50,000 | $1.5M |
| 2 | Reasonable cause | $1,000 | $50,000 | $1.5M |
| 3 | Willful neglect, corrected | $10,000 | $50,000 | $1.5M |
| 4 | Willful neglect, not corrected | $50,000 | $1.5M | $1.5M |

### GDPR
| Tier | Violation | Max Penalty |
|------|-----------|-------------|
| 1 | Record-keeping, DPO, certifications | €10M or 2% global turnover |
| 2 | Data breaches, unlawful processing, consent | €20M or 4% global turnover |

## How Vigil Uses This Data

1. **Dashboard Display**: Every finding shows applicable frameworks with control IDs
2. **Compliance Reporting**: Executive summaries group findings by framework
3. **Risk Prioritization**: Findings mapped to high-penalty frameworks (HIPAA tier 4, GDPR tier 2) get elevated scores
4. **Remediation Guidance**: Terraform templates include framework-specific justification comments

## Adding New Frameworks

To add a new framework:

1. Add framework metadata to `FRAMEWORK_METADATA` in `backend/app/services/compliance.py`
2. Add framework tags to relevant policies in `COMPLIANCE_POLICIES`
3. Add framework column to dashboard compliance summary in `backend/app/api/scans.py`
4. Update this wiki page

## Industry-Specific Recommendations

| Industry | Recommended Frameworks |
|----------|----------------------|
| Healthcare | HIPAA, SOC2 Type II, ISO 27001:2022, CIS |
| HealthTech | HIPAA, SOC2 Type II, GDPR, CIS |
| Fintech | PCI DSS 4.0, SOC2 Type II, GDPR, CIS |
| SaaS | SOC2 Type II, GDPR, ISO 27001:2022, CIS |
| E-commerce | PCI DSS 4.0, GDPR, SOC2 Type II |
| GovTech | NIST CSF 2.0, SOC2 Type II, ISO 27001:2022 |
| Default | CIS, SOC2 Type II, ISO 27001:2022 |
