"""
Vigil Demo Data Seeder

Run this to populate the database with realistic scan results,
findings, and metrics for screenshot/demo purposes.

Usage:
    cd backend
    python -c "import app.services.seed; app.services.seed.run()"
"""

from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.database import get_db, engine, Base, User, Organization, OrganizationMember, AWSAccount, Scan, Finding
from app.core.security import get_password_hash
import random

def run():
    """Seed the database with demo data."""
    Base.metadata.create_all(bind=engine)
    db = next(get_db())

    # Clear existing data (optional — comment out if you want to keep real data)
    db.query(Finding).delete()
    db.query(Scan).delete()
    db.query(AWSAccount).delete()
    db.query(OrganizationMember).delete()
    db.query(Organization).delete()
    db.query(User).delete()
    db.commit()

    # 1. Create demo user
    user = User(
        email="demo@vigil.local",
        hashed_password=get_password_hash("demo123"),
        first_name="Demo",
        last_name="User",
        is_active=True,
        is_admin=False
    )
    db.add(user)
    db.flush()

    # 2. Create organization
    org = Organization(
        name="Acme Corp",
        slug="acme-corp",
        industry="fintech",
        plan="professional",
        is_active=True,
        payment_provider="stripe",
        subscription_status="active",
        trial_ends_at=datetime.now(timezone.utc) + timedelta(days=14)
    )
    db.add(org)
    db.flush()

    # 3. Link user to org
    member = OrganizationMember(
        user_id=user.id,
        organization_id=org.id,
        role="owner"
    )
    db.add(member)

    # 4. Create AWS account
    aws_account = AWSAccount(
        organization_id=org.id,
        account_name="Production",
        account_id="123456789012",
        role_arn="arn:aws:iam::123456789012:role/VigilScannerRole",
        external_id="demo-external-id-12345",
        regions=["us-east-1", "eu-west-1", "ap-southeast-1"],
        is_connected=True,
        last_scan_at=datetime.now(timezone.utc)
    )
    db.add(aws_account)
    db.flush()

    # 5. Create scans
    scans = []
    for i, (scan_type, events, sequences, malicious, max_score, avg_score, status) in enumerate([
        ("full", 1847293, 4521, 23, 892.4, 312.5, "completed"),
        ("drift", 45231, 89, 2, 645.2, 198.3, "completed"),
        ("full", 1923847, 4782, 31, 945.1, 356.8, "completed"),
        ("compliance", 89102, 156, 0, 245.6, 89.4, "completed"),
    ]):
        scan = Scan(
            organization_id=org.id,
            aws_account_id=aws_account.id,
            scan_type=scan_type,
            status=status,
            started_at=datetime.now(timezone.utc) - timedelta(days=i*2, hours=2),
            completed_at=datetime.now(timezone.utc) - timedelta(days=i*2),
            events_analyzed=events,
            sequences_found=sequences,
            malicious_sequences=malicious,
            max_risk_score=max_score,
            avg_risk_score=avg_score,
            summary={
                "top_services": ["s3", "iam", "ec2", "cloudtrail", "lambda"],
                "regions_scanned": ["us-east-1", "eu-west-1", "ap-southeast-1"]
            }
        )
        db.add(scan)
        scans.append(scan)
    db.flush()

    # 6. Create findings
    findings_data = [
        # Critical
        {"policy_id": "S3-001", "policy_name": "S3 Bucket Public Read Access", "severity": "critical", "resource_type": "s3", "resource_arn": "arn:aws:s3:::customer-data-backup", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/ops-admin", "event_name": "PutBucketAcl", "frameworks": ["CIS", "SOC2", "PCI"], "complexity": "auto", "template": "s3_block_public", "fix_time": 2, "dollar_low": 50000, "dollar_high": 2500000},
        {"policy_id": "IAM-002", "policy_name": "Root Account Has Active Access Keys", "severity": "critical", "resource_type": "iam", "resource_arn": "arn:aws:iam::123456789012:root", "region": "global", "actor_arn": "arn:aws:iam::123456789012:root", "event_name": "CreateAccessKey", "frameworks": ["CIS", "SOC2", "ISO27001"], "complexity": "auto", "template": "iam_disable_root_keys", "fix_time": 5, "dollar_low": 100000, "dollar_high": 5000000},
        {"policy_id": "EC2-003", "policy_name": "Security Group Allows 0.0.0.0/0 on Port 22", "severity": "critical", "resource_type": "ec2", "resource_arn": "arn:aws:ec2:us-east-1:123456789012:security-group/sg-0abc123", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/dev-junior", "event_name": "AuthorizeSecurityGroupIngress", "frameworks": ["CIS", "PCI", "NIST"], "complexity": "auto", "template": "sg_restrict_ssh", "fix_time": 3, "dollar_low": 25000, "dollar_high": 1500000},
        {"policy_id": "RDS-004", "policy_name": "RDS Snapshot is Publicly Accessible", "severity": "critical", "resource_type": "rds", "resource_arn": "arn:aws:rds:us-east-1:123456789012:snapshot:prod-backup-2025", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/dba-admin", "event_name": "ModifyDBSnapshotAttribute", "frameworks": ["HIPAA", "GDPR", "SOC2"], "complexity": "manual", "template": "rds_private_snapshot", "fix_time": 10, "dollar_low": 100000, "dollar_high": 10000000},
        
        # High
        {"policy_id": "IAM-005", "policy_name": "IAM User Without MFA Enabled", "severity": "high", "resource_type": "iam", "resource_arn": "arn:aws:iam::123456789012:user/billing-admin", "region": "global", "actor_arn": "arn:aws:iam::123456789012:user/billing-admin", "event_name": "CreateUser", "frameworks": ["CIS", "SOC2", "ISO27001"], "complexity": "auto", "template": "iam_enforce_mfa", "fix_time": 5, "dollar_low": 10000, "dollar_high": 500000},
        {"policy_id": "S3-006", "policy_name": "S3 Bucket Missing Default Encryption", "severity": "high", "resource_type": "s3", "resource_arn": "arn:aws:s3:::logs-archive-2024", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/ops-admin", "event_name": "CreateBucket", "frameworks": ["HIPAA", "GDPR", "PCI"], "complexity": "auto", "template": "s3_enable_encryption", "fix_time": 3, "dollar_low": 25000, "dollar_high": 1000000},
        {"policy_id": "CT-007", "policy_name": "CloudTrail Logging Disabled", "severity": "high", "resource_type": "cloudtrail", "resource_arn": "arn:aws:cloudtrail:us-east-1:123456789012:trail/main", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/security-admin", "event_name": "StopLogging", "frameworks": ["CIS", "SOC2", "NIST"], "complexity": "auto", "template": "cloudtrail_enable", "fix_time": 2, "dollar_low": 5000, "dollar_high": 250000},
        {"policy_id": "LAM-008", "policy_name": "Lambda Function Has Overly Permissive IAM Role", "severity": "high", "resource_type": "lambda", "resource_arn": "arn:aws:lambda:us-east-1:123456789012:function:process-payments", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/dev-lead", "event_name": "CreateFunction20150331", "frameworks": ["CIS", "SOC2"], "complexity": "manual", "template": "lambda_least_privilege", "fix_time": 15, "dollar_low": 15000, "dollar_high": 750000},
        {"policy_id": "SEC-009", "policy_name": "Secrets Manager Secret Without Rotation", "severity": "high", "resource_type": "secretsmanager", "resource_arn": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/db/password", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/devops", "event_name": "CreateSecret", "frameworks": ["PCI", "SOC2", "ISO27001"], "complexity": "manual", "template": "secrets_rotation", "fix_time": 30, "dollar_low": 10000, "dollar_high": 500000},
        
        # Medium
        {"policy_id": "EBS-010", "policy_name": "EBS Volume Not Encrypted", "severity": "medium", "resource_type": "ebs", "resource_arn": "arn:aws:ec2:us-east-1:123456789012:volume/vol-0def456", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/dev-junior", "event_name": "CreateVolume", "frameworks": ["HIPAA", "GDPR", "PCI"], "complexity": "auto", "template": "ebs_enable_encryption", "fix_time": 5, "dollar_low": 5000, "dollar_high": 250000},
        {"policy_id": "EC2-011", "policy_name": "EC2 Instance Has Public IP in Private Subnet", "severity": "medium", "resource_type": "ec2", "resource_arn": "arn:aws:ec2:us-east-1:123456789012:instance/i-0ghi789", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/dev-junior", "event_name": "RunInstances", "frameworks": ["CIS", "NIST"], "complexity": "manual", "template": "ec2_remove_public_ip", "fix_time": 10, "dollar_low": 2000, "dollar_high": 100000},
        {"policy_id": "IAM-012", "policy_name": "Unused IAM Access Key Older Than 90 Days", "severity": "medium", "resource_type": "iam", "resource_arn": "arn:aws:iam::123456789012:user/contractor-march", "region": "global", "actor_arn": "arn:aws:iam::123456789012:user/contractor-march", "event_name": "CreateAccessKey", "frameworks": ["CIS", "SOC2"], "complexity": "auto", "template": "iam_deactivate_unused_key", "fix_time": 2, "dollar_low": 1000, "dollar_high": 50000},
        
        # Low
        {"policy_id": "S3-013", "policy_name": "S3 Bucket Missing Lifecycle Policy", "severity": "low", "resource_type": "s3", "resource_arn": "arn:aws:s3:::old-logs-bucket", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/ops-admin", "event_name": "CreateBucket", "frameworks": ["SOC2"], "complexity": "auto", "template": "s3_lifecycle_policy", "fix_time": 5, "dollar_low": 500, "dollar_high": 10000},
        {"policy_id": "CT-014", "policy_name": "CloudTrail Log File Validation Disabled", "severity": "low", "resource_type": "cloudtrail", "resource_arn": "arn:aws:cloudtrail:us-east-1:123456789012:trail/main", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/security-admin", "event_name": "CreateTrail", "frameworks": ["CIS"], "complexity": "auto", "template": "cloudtrail_enable_validation", "fix_time": 2, "dollar_low": 100, "dollar_high": 5000},
        {"policy_id": "VPC-015", "policy_name": "VPC Flow Logs Not Enabled", "severity": "low", "resource_type": "vpc", "resource_arn": "arn:aws:ec2:us-east-1:123456789012:vpc/vpc-0jkl012", "region": "us-east-1", "actor_arn": "arn:aws:iam::123456789012:user/network-admin", "event_name": "CreateVpc", "frameworks": ["CIS", "NIST"], "complexity": "auto", "template": "vpc_enable_flow_logs", "fix_time": 5, "dollar_low": 500, "dollar_high": 25000},
    ]

    for i, f in enumerate(findings_data):
        scan = scans[i % len(scans)]
        finding = Finding(
            organization_id=org.id,
            scan_id=scan.id,
            policy_id=f["policy_id"],
            policy_name=f["policy_name"],
            severity=f["severity"],
            description=f"Detected {f['policy_name'].lower()} which violates compliance requirements and increases breach risk.",
            resource_arn=f["resource_arn"],
            resource_type=f["resource_type"],
            region=f["region"],
            actor_arn=f["actor_arn"],
            event_name=f["event_name"],
            compliance_frameworks=f["frameworks"],
            remediation_complexity=f["complexity"],
            remediation_template=f["template"],
            estimated_fix_time=f["fix_time"],
            is_remediated=(i < 3),  # First 3 are remediated
            remediated_at=datetime.now(timezone.utc) - timedelta(hours=i) if i < 3 else None,
            dollar_impact_low=f["dollar_low"],
            dollar_impact_high=f["dollar_high"]
        )
        db.add(finding)

    db.commit()
    db.close()
    print("✅ Demo data seeded successfully!")
    print(f"   User: demo@vigil.local / demo123")
    print(f"   Organization: Acme Corp (Fintech)")
    print(f"   Scans: {len(scans)}")
    print(f"   Findings: {len(findings_data)} (3 remediated)")
    print(f"   Log in at http://localhost:5173 to view the dashboard.")

if __name__ == "__main__":
    run()
