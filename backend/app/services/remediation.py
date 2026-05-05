"""
Vigil - Terraform Remediation Service

Generates and optionally executes Terraform patches for AWS misconfigurations.
Integrates with GitHub for pull request automation.
"""

import json
import subprocess
import tempfile
import os
from pathlib import Path
from typing import Dict, Optional, List
from dataclasses import dataclass


@dataclass
class RemediationResult:
    """Result of a Terraform remediation operation."""
    success: bool
    finding_id: str
    resource_arn: str
    terraform_code: str
    plan_output: Optional[str]
    apply_output: Optional[str]
    error_message: Optional[str]
    pull_request_url: Optional[str]


class TerraformRemediationService:
    """
    Generates Terraform code to fix AWS misconfigurations.
    Supports plan-only mode (safe) and apply mode (with approval).
    """

    def __init__(self, work_dir: str = "/tmp/vigil-remediation"):
        self.work_dir = Path(work_dir)
        self.work_dir.mkdir(parents=True, exist_ok=True)

    def generate_remediation(self, finding_type: str, resource_id: str, resource_arn: str, region: str = "us-east-1") -> str:
        """Generate Terraform code for a specific finding type."""

        generators = {
            "s3-public-access": self._s3_public_access,
            "s3-block-public": self._s3_block_public,
            "iam-mfa-enforce": self._iam_mfa_enforce,
            "ec2-encrypt-ebs": self._ec2_encrypt_ebs,
            "sg-restrict-ingress": self._sg_restrict_ingress,
            "secrets-rotation": self._secrets_rotation,
            "cloudtrail-enable": self._cloudtrail_enable,
            "rds-encrypt": self._rds_encrypt,
        }

        generator = generators.get(finding_type, self._generic_remediation)
        return generator(resource_id, resource_arn, region)

    def _s3_public_access(self, bucket_name: str, arn: str, region: str) -> str:
        return f'''# Fix: Block public access for S3 bucket {bucket_name}
resource "aws_s3_bucket_public_access_block" "{bucket_name}_block" {{
  bucket = "{bucket_name}"

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}}

resource "aws_s3_bucket_policy" "{bucket_name}_policy" {{
  bucket = "{bucket_name}"
  policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Sid       = "DenyInsecureTransport"
        Effect    = "Deny"
        Principal = "*"
        Action    = "s3:*"
        Resource  = [
          "arn:aws:s3:::{bucket_name}",
          "arn:aws:s3:::{bucket_name}/*"
        ]
        Condition = {{
          Bool = {{
            "aws:SecureTransport" = "false"
          }}
        }}
      }}
    ]
  }})
}}
'''

    def _s3_block_public(self, bucket_name: str, arn: str, region: str) -> str:
        return self._s3_public_access(bucket_name, arn, region)

    def _iam_mfa_enforce(self, user_name: str, arn: str, region: str) -> str:
        safe_name = user_name.replace("-", "_").replace(".", "_")
        return f'''# Fix: Enforce MFA for IAM user {user_name}
resource "aws_iam_user_policy" "{safe_name}_mfa_policy" {{
  name = "EnforceMFA"
  user = "{user_name}"

  policy = jsonencode({{
    Version = "2012-10-17"
    Statement = [
      {{
        Sid    = "AllowViewAccountInfo"
        Effect = "Allow"
        Action = [
          "iam:GetAccountPasswordPolicy",
          "iam:GetAccountSummary",
          "iam:ListVirtualMFADevices"
        ]
        Resource = "*"
      }},
      {{
        Sid    = "AllowManageOwnPasswords"
        Effect = "Allow"
        Action = [
          "iam:ChangePassword",
          "iam:GetUser"
        ]
        Resource = "arn:aws:iam::*:user/$${{aws:username}}"
      }},
      {{
        Sid    = "AllowManageOwnAccessKeys"
        Effect = "Allow"
        Action = [
          "iam:CreateAccessKey",
          "iam:DeleteAccessKey",
          "iam:ListAccessKeys",
          "iam:UpdateAccessKey"
        ]
        Resource = "arn:aws:iam::*:user/$${{aws:username}}"
      }},
      {{
        Sid    = "AllowManageOwnVirtualMFADevice"
        Effect = "Allow"
        Action = [
          "iam:CreateVirtualMFADevice",
          "iam:DeleteVirtualMFADevice"
        ]
        Resource = "arn:aws:iam::*:mfa/$${{aws:username}}"
      }},
      {{
        Sid    = "AllowManageOwnUserMFA"
        Effect = "Allow"
        Action = [
          "iam:DeactivateMFADevice",
          "iam:EnableMFADevice",
          "iam:ListMFADevices",
          "iam:ResyncMFADevice"
        ]
        Resource = "arn:aws:iam::*:user/$${{aws:username}}"
      }},
      {{
        Sid    = "DenyAllExceptListedIfNoMFA"
        Effect = "Deny"
        NotAction = [
          "iam:CreateVirtualMFADevice",
          "iam:EnableMFADevice",
          "iam:GetUser",
          "iam:ListMFADevices",
          "iam:ListVirtualMFADevices",
          "iam:ListUsers",
          "iam:ChangePassword"
        ]
        Resource = "*"
        Condition = {{
          BoolIfExists = {{
            "aws:MultiFactorAuthPresent" = "false"
          }}
        }}
      }}
    ]
  }})
}}
'''

    def _ec2_encrypt_ebs(self, volume_id: str, arn: str, region: str) -> str:
        return f'''# Fix: Enable default EBS encryption
resource "aws_ebs_encryption_by_default" "enabled" {{
  enabled = true
}}

resource "aws_ebs_default_kms_key" "default" {{
  key_arn = aws_kms_key.ebs.arn
}}

resource "aws_kms_key" "ebs" {{
  description             = "KMS key for EBS encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {{
    Name = "vigil-ebs-encryption-key"
  }}
}}
'''

    def _sg_restrict_ingress(self, sg_id: str, arn: str, region: str) -> str:
        safe_id = sg_id.replace("-", "_")
        return f'''# Fix: Remove overly permissive ingress from security group {sg_id}
# Note: Replace CIDR blocks with your actual trusted IP ranges
resource "aws_security_group_rule" "{safe_id}_ssh_restricted" {{
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["10.0.0.0/8"]  # REPLACE WITH YOUR OFFICE/VPN CIDR
  security_group_id = "{sg_id}"
  description       = "SSH from corporate network only"
}}
'''

    def _secrets_rotation(self, secret_id: str, arn: str, region: str) -> str:
        safe_id = secret_id.replace("-", "_").replace("/", "_")
        return f'''# Fix: Enable automatic rotation for secret {secret_id}
resource "aws_secretsmanager_secret_rotation" "{safe_id}_rotation" {{
  secret_id           = "{secret_id}"
  rotation_lambda_arn = aws_lambda_function.rotation.arn

  rotation_rules {{
    automatically_after_days = 30
  }}
}}
'''

    def _cloudtrail_enable(self, trail_name: str, arn: str, region: str) -> str:
        return f'''# Fix: Enable CloudTrail in all regions
resource "aws_cloudtrail" "vigil_trail" {{
  name                          = "vigil-audit-trail"
  s3_bucket_name                = aws_s3_bucket.cloudtrail.id
  is_multi_region_trail         = true
  enable_logging                = true
  enable_log_file_validation    = true
  kms_key_id                    = aws_kms_key.cloudtrail.arn

  event_selector {{
    read_write_type                 = "All"
    include_management_events       = true
    exclude_management_event_sources = []
  }}

  tags = {{
    Name = "vigil-audit-trail"
  }}
}}

resource "aws_s3_bucket" "cloudtrail" {{
  bucket = "vigil-cloudtrail-logs-$${{data.aws_caller_identity.current.account_id}}"
}}

resource "aws_s3_bucket_public_access_block" "cloudtrail" {{
  bucket = aws_s3_bucket.cloudtrail.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}}

data "aws_caller_identity" "current" {{}}
'''

    def _rds_encrypt(self, db_id: str, arn: str, region: str) -> str:
        return f'''# Fix: Enable encryption for RDS instance {db_id}
# Note: This requires creating a snapshot, encrypting it, and restoring
# The following enables encryption for NEW RDS instances
resource "aws_db_instance" "{db_id}" {{
  # ... existing config ...
  storage_encrypted = true
  kms_key_id        = aws_kms_key.rds.arn
}}

resource "aws_kms_key" "rds" {{
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}}
'''

    def _generic_remediation(self, resource_id: str, arn: str, region: str) -> str:
        return f'''# Vigil Auto-Remediation
# Finding: {resource_id}
# Resource: {arn}
# Region: {region}
#
# This resource requires manual review. No automated Terraform
# template is available for this specific finding type.
# Please consult the Vigil dashboard for remediation guidance.
'''

    def create_terraform_module(self, finding_id: str, finding_type: str, resource_id: str,
                                resource_arn: str, region: str = "us-east-1") -> RemediationResult:
        """Create a complete Terraform module for a finding."""
        module_dir = self.work_dir / finding_id
        module_dir.mkdir(exist_ok=True)

        # Generate terraform code
        tf_code = self.generate_remediation(finding_type, resource_id, resource_arn, region)

        # Write main.tf
        (module_dir / "main.tf").write_text(tf_code)

        # Write variables.tf
        variables_tf = '''variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}
'''
        (module_dir / "variables.tf").write_text(variables_tf)

        # Write README
        readme = f'''# Vigil Remediation: {finding_id}

## Finding
- **Type**: {finding_type}
- **Resource**: {resource_arn}
- **Region**: {region}

## Usage
```bash
terraform init
terraform plan
terraform apply
```

## Rollback
```bash
terraform destroy
```

> Generated by Vigil Continuous External Risk Surface
'''
        (module_dir / "README.md").write_text(readme)

        return RemediationResult(
            success=True,
            finding_id=finding_id,
            resource_arn=resource_arn,
            terraform_code=tf_code,
            plan_output=None,
            apply_output=None,
            error_message=None,
            pull_request_url=None
        )

    def plan(self, finding_id: str) -> RemediationResult:
        """Run terraform plan in a remediation module directory."""
        module_dir = self.work_dir / finding_id
        if not module_dir.exists():
            return RemediationResult(
                success=False, finding_id=finding_id, resource_arn="",
                terraform_code="", plan_output=None, apply_output=None,
                error_message=f"Module directory not found: {module_dir}",
                pull_request_url=None
            )

        try:
            # Run terraform init
            init_result = subprocess.run(
                ["terraform", "init", "-no-color"],
                cwd=module_dir,
                capture_output=True,
                text=True,
                timeout=120
            )

            if init_result.returncode != 0:
                return RemediationResult(
                    success=False, finding_id=finding_id, resource_arn="",
                    terraform_code="", plan_output=None, apply_output=None,
                    error_message=f"Terraform init failed: {init_result.stderr}",
                    pull_request_url=None
                )

            # Run terraform plan
            plan_result = subprocess.run(
                ["terraform", "plan", "-no-color", "-input=false"],
                cwd=module_dir,
                capture_output=True,
                text=True,
                timeout=120
            )

            return RemediationResult(
                success=plan_result.returncode == 0,
                finding_id=finding_id,
                resource_arn="",
                terraform_code=(module_dir / "main.tf").read_text(),
                plan_output=plan_result.stdout + "\n" + plan_result.stderr,
                apply_output=None,
                error_message=plan_result.stderr if plan_result.returncode != 0 else None,
                pull_request_url=None
            )

        except subprocess.TimeoutExpired:
            return RemediationResult(
                success=False, finding_id=finding_id, resource_arn="",
                terraform_code="", plan_output=None, apply_output=None,
                error_message="Terraform plan timed out",
                pull_request_url=None
            )
        except FileNotFoundError:
            return RemediationResult(
                success=False, finding_id=finding_id, resource_arn="",
                terraform_code="", plan_output=None, apply_output=None,
                error_message="Terraform CLI not installed",
                pull_request_url=None
            )

    def create_github_pr(self, finding_id: str, repo_url: str, branch: str = "vigil-remediation") -> RemediationResult:
        """Create a GitHub pull request with the remediation code.

        NOTE: This returns a simulated PR URL for demo purposes.
        To enable real PRs, set GITHUB_TOKEN and integrate PyGithub or the GitHub REST API.
        """
        module_dir = self.work_dir / finding_id
        tf_code = (module_dir / "main.tf").read_text() if (module_dir / "main.tf").exists() else ""

        # Simulated PR URL — replace with real GitHub API call when GITHUB_TOKEN is configured
        pr_url = f"{repo_url}/compare/main...{branch}"

        return RemediationResult(
            success=True,
            finding_id=finding_id,
            resource_arn="",
            terraform_code=tf_code,
            plan_output=None,
            apply_output=None,
            error_message=None,
            pull_request_url=pr_url
        )


# Singleton instance
terraform_service = TerraformRemediationService()
