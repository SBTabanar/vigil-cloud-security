from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from urllib.parse import urlparse

from app.api.auth import get_current_active_user
from app.models.database import get_db, Finding, Organization, OrganizationMember
from app.services.remediation import terraform_service
from app.services.email import EmailService

router = APIRouter(prefix="/remediation", tags=["remediation"])
email_service = EmailService()


def _validate_repo_url(url: str) -> str:
    """Validate GitHub repository URL to prevent SSRF/open redirect."""
    parsed = urlparse(url)
    if parsed.scheme not in ("https",) or parsed.netloc not in ("github.com", "www.github.com"):
        raise HTTPException(status_code=400, detail="Invalid repository URL. Only https://github.com URLs are allowed.")
    return url


@router.post("/generate/{finding_id}")
def generate_terraform(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Generate Terraform code for a specific finding."""
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    # Check user has access
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == finding.organization_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Access denied")

    result = terraform_service.create_terraform_module(
        finding_id=f"finding-{finding.id}",
        finding_type=finding.policy_id,
        resource_id=finding.resource_arn.split(":")[-1] if finding.resource_arn else "resource",
        resource_arn=finding.resource_arn or "",
        region=finding.region or "us-east-1"
    )

    return {
        "success": result.success,
        "finding_id": finding.id,
        "terraform_code": result.terraform_code,
        "module_path": str(terraform_service.work_dir / f"finding-{finding.id}"),
        "error": result.error_message
    }


@router.post("/plan/{finding_id}")
def plan_terraform(
    finding_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Run terraform plan for a finding's remediation module."""
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == finding.organization_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Access denied")

    # First generate if not exists
    terraform_service.create_terraform_module(
        finding_id=f"finding-{finding.id}",
        finding_type=finding.policy_id,
        resource_id=finding.resource_arn.split(":")[-1] if finding.resource_arn else "resource",
        resource_arn=finding.resource_arn or "",
        region=finding.region or "us-east-1"
    )

    result = terraform_service.plan(f"finding-{finding.id}")

    return {
        "success": result.success,
        "finding_id": finding.id,
        "terraform_code": result.terraform_code,
        "plan_output": result.plan_output,
        "error": result.error_message
    }


@router.post("/github-pr/{finding_id}")
def create_github_pr(
    finding_id: int,
    repo_url: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a GitHub PR with the Terraform remediation."""
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == finding.organization_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Access denied")

    _validate_repo_url(repo_url)

    result = terraform_service.create_github_pr(
        finding_id=f"finding-{finding.id}",
        repo_url=repo_url
    )

    # Send email notification
    org = db.query(Organization).filter(Organization.id == finding.organization_id).first()
    email_service.send_critical_finding(
        to_email=current_user.email,
        org_name=org.name if org else "Your Organization",
        finding={
            "policy_name": f"Terraform PR created for: {finding.policy_name}",
            "description": f"A pull request has been generated to remediate {finding.resource_arn}",
            "resource_arn": finding.resource_arn,
            "region": finding.region,
            "dollar_impact_low": finding.dollar_impact_low,
            "dollar_impact_high": finding.dollar_impact_high,
            "remediation_url": result.pull_request_url or "#"
        }
    )

    return {
        "success": result.success,
        "finding_id": finding.id,
        "pull_request_url": result.pull_request_url,
        "terraform_code": result.terraform_code
    }


@router.get("/templates")
def list_remediation_templates():
    """List all available remediation template types."""
    return {
        "templates": [
            {"id": "s3-public-access", "name": "Block S3 Public Access", "resource_types": ["S3Bucket"]},
            {"id": "iam-mfa-enforce", "name": "Enforce MFA for IAM User", "resource_types": ["IAMUser"]},
            {"id": "ec2-encrypt-ebs", "name": "Enable EBS Encryption by Default", "resource_types": ["EBSVolume"]},
            {"id": "sg-restrict-ingress", "name": "Restrict Security Group Ingress", "resource_types": ["EC2SecurityGroup"]},
            {"id": "secrets-rotation", "name": "Enable Secrets Rotation", "resource_types": ["SecretsManagerSecret"]},
            {"id": "cloudtrail-enable", "name": "Enable CloudTrail Multi-Region", "resource_types": ["CloudTrail"]},
            {"id": "rds-encrypt", "name": "Enable RDS Encryption", "resource_types": ["RDSInstance"]},
        ]
    }
