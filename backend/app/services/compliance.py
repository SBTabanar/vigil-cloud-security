# Compliance policies with HIPAA and GDPR mappings

COMPLIANCE_POLICIES = {
    "iam-mfa-not-enabled": {
        "id": "iam-mfa-not-enabled",
        "name": "IAM User Console Access Without MFA",
        "description": "Console login detected without MFA enforcement",
        "severity_map": {"default": "high"},
        "frameworks": [
            "CIS AWS Foundations 3.0:1.10",
            "SOC2 Type II:CC6.1",
            "ISO 27001:2022:A.9.4.2",
            "HIPAA:164.312(a)(2)(iv)",  # Access control - encryption/decryption
            "GDPR:Art. 32(1)(b)"  # Security of processing
        ],
        "remediation_complexity": "automated",
        "check_type": "iam"
    },
    "s3-public-access": {
        "id": "s3-public-access",
        "name": "S3 Bucket Public Access Enabled",
        "description": "S3 bucket allows public read or write access",
        "severity_map": {"default": "critical"},
        "frameworks": [
            "CIS AWS Foundations 3.0:2.1.5",
            "PCI DSS 4.0:1.3.1",
            "SOC2 Type II:CC6.6",
            "HIPAA:164.312(a)(1)",  # Access control
            "GDPR:Art. 32(1)(b)",  # Security of processing
            "GDPR:Art. 5(1)(f)"    # Integrity and confidentiality
        ],
        "remediation_complexity": "one_click",
        "check_type": "s3"
    },
    "iam-privilege-escalation": {
        "id": "iam-privilege-escalation",
        "name": "Potential IAM Privilege Escalation",
        "description": "API call indicates possible privilege escalation attempt",
        "severity_map": {"default": "critical"},
        "frameworks": [
            "CIS AWS Foundations 3.0:1.16",
            "CIS AWS Foundations 3.0:1.20",
            "NIST CSF 2.0:PR.AC-4",
            "SOC2 Type II:CC6.3",
            "HIPAA:164.312(a)(1)",  # Access control
            "GDPR:Art. 32(1)(b)"
        ],
        "remediation_complexity": "manual",
        "check_type": "iam"
    },
    "unauthorized-api-calls": {
        "id": "unauthorized-api-calls",
        "name": "Repeated Unauthorized API Calls",
        "description": "Multiple AccessDenied or UnauthorizedOperation errors from same actor",
        "severity_map": {"default": "high"},
        "frameworks": [
            "CIS AWS Foundations 3.0:3.1",
            "SOC2 Type II:CC6.6",
            "HIPAA:164.312(b)",  # Audit controls
            "GDPR:Art. 33"  # Breach notification
        ],
        "remediation_complexity": "automated",
        "check_type": "iam"
    },
    "ec2-unencrypted-volume": {
        "id": "ec2-unencrypted-volume",
        "name": "EC2 Volume Created Without Encryption",
        "description": "EBS volume or snapshot created without encryption at rest",
        "severity_map": {"default": "medium"},
        "frameworks": [
            "CIS AWS Foundations 3.0:2.2.1",
            "PCI DSS 4.0:3.4.1",
            "ISO 27001:2022:A.8.24",
            "HIPAA:164.312(a)(2)(iv)",  # Encryption
            "GDPR:Art. 32(1)(a)"  # Pseudonymisation/encryption
        ],
        "remediation_complexity": "automated",
        "check_type": "ec2"
    },
    "secrets-exposure": {
        "id": "secrets-exposure",
        "name": "Secrets Manager Access Without Rotation",
        "description": "Secret value retrieved from Secrets Manager; check rotation policy",
        "severity_map": {"default": "high"},
        "frameworks": [
            "CIS AWS Foundations 3.0:3.8",
            "SOC2 Type II:CC6.1",
            "HIPAA:164.312(a)(2)(iv)",  # Encryption
            "GDPR:Art. 32(1)(b)"
        ],
        "remediation_complexity": "automated",
        "check_type": "secrets"
    },
    "root-account-usage": {
        "id": "root-account-usage",
        "name": "Root Account API Usage Detected",
        "description": "AWS root account used for API calls; root should be locked down",
        "severity_map": {"default": "critical"},
        "frameworks": [
            "CIS AWS Foundations 3.0:1.7",
            "SOC2 Type II:CC6.1",
            "HIPAA:164.312(a)(1)",  # Access control
            "GDPR:Art. 32(1)(b)"
        ],
        "remediation_complexity": "manual",
        "check_type": "iam"
    },
    "overly-permissive-sg": {
        "id": "overly-permissive-sg",
        "name": "Security Group Allows Unrestricted Ingress",
        "description": "Security group rule allows 0.0.0.0/0 on sensitive ports",
        "severity_map": {"default": "high"},
        "frameworks": [
            "CIS AWS Foundations 3.0:5.2",
            "CIS AWS Foundations 3.0:5.3",
            "PCI DSS 4.0:1.3.1",
            "HIPAA:164.312(e)(1)",  # Transmission security
            "GDPR:Art. 32(1)(b)"
        ],
        "remediation_complexity": "automated",
        "check_type": "ec2"
    },
    "rds-unencrypted": {
        "id": "rds-unencrypted",
        "name": "RDS Database Not Encrypted",
        "description": "RDS instance or snapshot created without encryption at rest",
        "severity_map": {"default": "high"},
        "frameworks": [
            "CIS AWS Foundations 3.0:2.3.1",
            "PCI DSS 4.0:3.4.1",
            "HIPAA:164.312(a)(2)(iv)",  # Encryption
            "GDPR:Art. 32(1)(a)"
        ],
        "remediation_complexity": "manual",
        "check_type": "rds"
    },
    "lambda-env-secrets": {
        "id": "lambda-env-secrets",
        "name": "Lambda Function Contains Hardcoded Secrets",
        "description": "Environment variables in Lambda may contain plaintext credentials",
        "severity_map": {"default": "high"},
        "frameworks": [
            "CIS AWS Foundations 3.0:3.9",
            "SOC2 Type II:CC6.1",
            "HIPAA:164.312(a)(2)(iv)",  # Encryption
            "GDPR:Art. 32(1)(b)"
        ],
        "remediation_complexity": "automated",
        "check_type": "lambda"
    },
    "cloudtrail-disabled": {
        "id": "cloudtrail-disabled",
        "name": "CloudTrail Logging Disabled or Misconfigured",
        "description": "CloudTrail is not enabled in all regions or logs are not encrypted",
        "severity_map": {"default": "critical"},
        "frameworks": [
            "CIS AWS Foundations 3.0:3.1",
            "SOC2 Type II:CC7.2",
            "HIPAA:164.312(b)",  # Audit controls
            "GDPR:Art. 30",  # Records of processing
            "GDPR:Art. 5(1)(f)"
        ],
        "remediation_complexity": "one_click",
        "check_type": "cloudtrail"
    },
    "gdpr-data-residency": {
        "id": "gdpr-data-residency",
        "name": "Personal Data Stored Outside EU Without Safeguards",
        "description": "S3 buckets or databases containing personal data are in non-EU regions without DPA",
        "severity_map": {"default": "high"},
        "frameworks": [
            "GDPR:Art. 44",  # Transfers on basis of adequacy decision
            "GDPR:Art. 45",  # Transfers on basis of appropriate safeguards
            "GDPR:Art. 46",
            "GDPR:Art. 49"
        ],
        "remediation_complexity": "manual",
        "check_type": "s3"
    },
    "gdpr-right-to-erasure": {
        "id": "gdpr-right-to-erasure",
        "name": "No Automated Data Deletion/Retention Policy",
        "description": "S3 buckets or databases lack lifecycle policies for personal data deletion",
        "severity_map": {"default": "medium"},
        "frameworks": [
            "GDPR:Art. 17",  # Right to erasure
            "GDPR:Art. 5(1)(e)"  # Storage limitation
        ],
        "remediation_complexity": "automated",
        "check_type": "s3"
    },
    "hipaa-audit-logging": {
        "id": "hipaa-audit-logging",
        "name": "Insufficient Audit Logging for PHI Access",
        "description": "CloudTrail or VPC Flow Logs do not cover all PHI access paths",
        "severity_map": {"default": "high"},
        "frameworks": [
            "HIPAA:164.312(b)",  # Audit controls
            "HIPAA:164.308(a)(1)(ii)(D)",  # Information access management
            "SOC2 Type II:CC7.2"
        ],
        "remediation_complexity": "automated",
        "check_type": "cloudtrail"
    },
    "hipaa-backup-recovery": {
        "id": "hipaa-backup-recovery",
        "name": "No Automated Backup for PHI Storage",
        "description": "RDS or DynamoDB tables containing PHI lack automated backup and recovery",
        "severity_map": {"default": "high"},
        "frameworks": [
            "HIPAA:164.308(a)(7)(ii)(A)",  # Data backup plan
            "HIPAA:164.308(a)(7)(ii)(B)",  # Disaster recovery plan
            "SOC2 Type II:A1.2"
        ],
        "remediation_complexity": "automated",
        "check_type": "rds"
    },
    "hipaa-minimum-necessary": {
        "id": "hipaa-minimum-necessary",
        "name": "IAM Policies Violate Minimum Necessary Standard",
        "description": "IAM policies grant broader access than required for workforce members handling PHI",
        "severity_map": {"default": "medium"},
        "frameworks": [
            "HIPAA:164.502(b)",  # Minimum necessary
            "HIPAA:164.308(a)(3)(ii)(A)",  # Workforce clearance procedure
            "HIPAA:164.308(a)(3)(ii)(B)",  # Workforce authorization
            "SOC2 Type II:CC6.3"
        ],
        "remediation_complexity": "manual",
        "check_type": "iam"
    }
}

# Framework metadata for dashboard display
FRAMEWORK_METADATA = {
    "CIS AWS Foundations 3.0": {
        "category": "security_benchmark",
        "industries": ["all"],
        "required_for": ["SOC2", "ISO27001"]
    },
    "SOC2 Type II": {
        "category": "audit_standard",
        "industries": ["saas", "fintech", "healthcare"],
        "required_for": ["enterprise_sales"]
    },
    "ISO 27001:2022": {
        "category": "international_standard",
        "industries": ["all"],
        "required_for": ["global_enterprise"]
    },
    "PCI DSS 4.0": {
        "category": "payment_standard",
        "industries": ["fintech", "ecommerce"],
        "required_for": ["card_processing"]
    },
    "NIST CSF 2.0": {
        "category": "government_framework",
        "industries": ["govtech", "critical_infrastructure"],
        "required_for": ["federal_contracts"]
    },
    "HIPAA": {
        "category": "healthcare_regulation",
        "industries": ["healthcare", "healthtech", "medical_devices"],
        "required_for": ["phi_handling", "covered_entities", "business_associates"],
        "penalties": {
            "tier1": {"min": 100, "max": 50000, "unit": "per_violation"},
            "tier4": {"min": 50000, "max": 1500000, "unit": "per_violation"}
        }
    },
    "GDPR": {
        "category": "data_protection_regulation",
        "industries": ["all_eu", "global_with_eu_users"],
        "required_for": ["eu_data_subjects", "eu_establishment"],
        "penalties": {
            "tier1": {"percent": 2, "of": "global_turnover"},
            "tier2": {"percent": 4, "of": "global_turnover"},
            "fixed_max": 20000000
        }
    }
}

# Industry-specific recommended frameworks
INDUSTRY_FRAMEWORKS = {
    "healthcare": ["HIPAA", "SOC2 Type II", "ISO 27001:2022", "CIS AWS Foundations 3.0"],
    "healthtech": ["HIPAA", "SOC2 Type II", "GDPR", "CIS AWS Foundations 3.0"],
    "fintech": ["PCI DSS 4.0", "SOC2 Type II", "GDPR", "CIS AWS Foundations 3.0"],
    "saas": ["SOC2 Type II", "GDPR", "ISO 27001:2022", "CIS AWS Foundations 3.0"],
    "ecommerce": ["PCI DSS 4.0", "GDPR", "SOC2 Type II"],
    "govtech": ["NIST CSF 2.0", "SOC2 Type II", "ISO 27001:2022"],
    "default": ["CIS AWS Foundations 3.0", "SOC2 Type II", "ISO 27001:2022"]
}
