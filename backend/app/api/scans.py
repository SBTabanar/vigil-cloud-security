from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import random

from app.api.auth import get_current_active_user
from app.core.config import get_settings
from app.models.database import get_db, Scan, Finding, Organization, OrganizationMember, User, AWSAccount
from app.schemas import ScanCreate, ScanResponse, FindingResponse, DashboardData, DashboardSummary
from app.services.email import EmailService

router = APIRouter(prefix="/organizations/{org_id}", tags=["scans"])
email_service = EmailService()
settings = get_settings()

@router.post("/scans", response_model=ScanResponse)
def create_scan(
    org_id: int,
    data: ScanCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    
    # Check if there are connected AWS accounts
    aws_accounts = db.query(AWSAccount).filter(
        AWSAccount.organization_id == org_id,
        AWSAccount.is_connected == True
    ).all()
    
    if not aws_accounts:
        raise HTTPException(
            status_code=400, 
            detail="No AWS accounts connected. Please connect an AWS account before running a scan."
        )
    
    scan = Scan(
        organization_id=org_id,
        aws_account_id=data.aws_account_id or aws_accounts[0].id,
        scan_type=data.scan_type,
        status="running",
        started_at=datetime.now(timezone.utc)
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Run scan synchronously for demo; async queue recommended for production workloads
    _simulate_scan(db, scan)

    # Send email notification
    org = db.query(Organization).filter(Organization.id == org_id).first()
    owner = db.query(User).join(OrganizationMember).filter(
        OrganizationMember.organization_id == org_id,
        OrganizationMember.role == "owner"
    ).first()

    if owner:
        findings_list = db.query(Finding).filter(Finding.scan_id == scan.id).all()
        critical = sum(1 for f in findings_list if f.severity == "critical")
        high = sum(1 for f in findings_list if f.severity == "high")
        medium = sum(1 for f in findings_list if f.severity == "medium")

        email_service.send_scan_complete(
            to_email=owner.email,
            org_name=org.name if org else "Your Organization",
            scan_summary={
                "critical": critical,
                "high": high,
                "medium": medium,
                "max_risk_score": scan.max_risk_score,
                "events": scan.events_analyzed,
                "sequences": scan.sequences_found,
                "dashboard_url": f"{settings.FRONTEND_URL}/app"
            }
        )

        # Send critical finding alerts immediately
        for f in findings_list:
            if f.severity == "critical":
                email_service.send_critical_finding(
                    to_email=owner.email,
                    org_name=org.name if org else "Your Organization",
                    finding={
                        "policy_name": f.policy_name,
                        "description": f.description,
                        "resource_arn": f.resource_arn,
                        "region": f.region,
                        "dollar_impact_low": f.dollar_impact_low,
                        "dollar_impact_high": f.dollar_impact_high,
                        "remediation_url": f"{settings.FRONTEND_URL}/app/findings"
                    }
                )

    return ScanResponse.model_validate(scan)

@router.get("/scans", response_model=list[ScanResponse])
def list_scans(
    org_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    
    scans = db.query(Scan).filter(Scan.organization_id == org_id).order_by(Scan.created_at.desc()).all()
    return [ScanResponse.model_validate(s) for s in scans]

@router.get("/findings", response_model=list[FindingResponse])
def list_findings(
    org_id: int,
    severity: str = None,
    remediated: bool = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    
    query = db.query(Finding).filter(Finding.organization_id == org_id)
    if severity:
        query = query.filter(Finding.severity == severity)
    if remediated is not None:
        query = query.filter(Finding.is_remediated == remediated)
    
    findings = query.order_by(Finding.created_at.desc()).limit(100).all()
    return [FindingResponse.model_validate(f) for f in findings]

@router.get("/dashboard", response_model=DashboardData)
def get_dashboard(
    org_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    
    org = db.query(Organization).filter(Organization.id == org_id).first()
    scans = db.query(Scan).filter(Scan.organization_id == org_id).order_by(Scan.created_at.desc()).all()
    findings = db.query(Finding).filter(Finding.organization_id == org_id).all()
    
    latest_scan = scans[0] if scans else None
    
    summary = DashboardSummary(
        organization_id=org_id,
        organization_name=org.name,
        total_events=latest_scan.events_analyzed if latest_scan else 0,
        total_sequences=latest_scan.sequences_found if latest_scan else 0,
        malicious_sequences=latest_scan.malicious_sequences if latest_scan else 0,
        total_findings=len(findings),
        critical_findings=sum(1 for f in findings if f.severity == "critical"),
        high_findings=sum(1 for f in findings if f.severity == "high"),
        medium_findings=sum(1 for f in findings if f.severity == "medium"),
        max_risk_score=latest_scan.max_risk_score if latest_scan else 0.0,
        avg_risk_score=latest_scan.avg_risk_score if latest_scan else 0.0,
        auto_remediable=sum(1 for f in findings if f.remediation_complexity in ["one_click", "automated"] and not f.is_remediated),
        compliance_frameworks=list(set(fw for f in findings for fw in (f.compliance_frameworks or []))),
        last_scan_at=latest_scan.completed_at if latest_scan else None,
        aws_accounts=len(org.aws_accounts)
    )
    
    # Build timeline and actor aggregations from scan history
    if latest_scan:
        # Generate timeline from scan history
        timeline = []
        for i, s in enumerate(scans[:30]):
            timeline.append({
                "date": s.completed_at.strftime("%Y-%m-%d") if s.completed_at else s.started_at.strftime("%Y-%m-%d"),
                "avg_score": s.avg_risk_score,
                "max_score": s.max_risk_score,
                "sequences": s.sequences_found
            })
        timeline.reverse()
        
        # Aggregate actors from findings
        actor_map = {}
        for f in findings:
            actor = f.actor_arn or "unknown"
            if actor not in actor_map:
                actor_map[actor] = {"max_score": 0, "sequences": 0, "findings": set()}
            actor_map[actor]["max_score"] = max(actor_map[actor]["max_score"], 500 if f.severity == "critical" else 300 if f.severity == "high" else 150)
            actor_map[actor]["findings"].add(f.policy_name)
        
        top_actors = [
            {
                "actor": actor,
                "max_score": data["max_score"],
                "sequences": data["sequences"],
                "findings": list(data["findings"])[:3]
            }
            for actor, data in sorted(actor_map.items(), key=lambda x: x[1]["max_score"], reverse=True)[:5]
        ]
    else:
        timeline = []
        top_actors = []
    
    return DashboardData(
        summary=summary,
        timeline=timeline,
        top_actors=top_actors,
        score_distribution={
            "0-250": sum(1 for t in timeline if t["max_score"] < 250),
            "250-500": sum(1 for t in timeline if 250 <= t["max_score"] < 500),
            "500-750": sum(1 for t in timeline if 500 <= t["max_score"] < 750),
            "750-1000": sum(1 for t in timeline if t["max_score"] >= 750)
        } if timeline else {"0-250": 0, "250-500": 0, "500-750": 0, "750-1000": 0},
        findings_by_severity={
            "critical": summary.critical_findings,
            "high": summary.high_findings,
            "medium": summary.medium_findings,
            "low": sum(1 for f in findings if f.severity == "low")
        },
        compliance_summary={
            "CIS AWS Foundations 3.0": {
                "total_findings": len([f for f in findings if "CIS" in str(f.compliance_frameworks)]),
                "critical": len([f for f in findings if "CIS" in str(f.compliance_frameworks) and f.severity == "critical"]),
                "high": len([f for f in findings if "CIS" in str(f.compliance_frameworks) and f.severity == "high"]),
                "medium": len([f for f in findings if "CIS" in str(f.compliance_frameworks) and f.severity == "medium"]),
                "controls_affected": list(set(c for f in findings if "CIS" in str(f.compliance_frameworks) for c in (f.compliance_frameworks or [])))[:6]
            },
            "SOC2 Type II": {
                "total_findings": len([f for f in findings if "SOC2" in str(f.compliance_frameworks)]),
                "critical": len([f for f in findings if "SOC2" in str(f.compliance_frameworks) and f.severity == "critical"]),
                "high": len([f for f in findings if "SOC2" in str(f.compliance_frameworks) and f.severity == "high"]),
                "medium": len([f for f in findings if "SOC2" in str(f.compliance_frameworks) and f.severity == "medium"]),
                "controls_affected": ["CC6.1", "CC6.3", "CC6.6", "CC7.1"]
            },
            "HIPAA": {
                "total_findings": len([f for f in findings if "HIPAA" in str(f.compliance_frameworks)]),
                "critical": len([f for f in findings if "HIPAA" in str(f.compliance_frameworks) and f.severity == "critical"]),
                "high": len([f for f in findings if "HIPAA" in str(f.compliance_frameworks) and f.severity == "high"]),
                "medium": len([f for f in findings if "HIPAA" in str(f.compliance_frameworks) and f.severity == "medium"]),
                "controls_affected": ["164.312(a)(1)", "164.312(a)(2)(iv)", "164.312(b)", "164.312(e)(1)"]
            },
            "GDPR": {
                "total_findings": len([f for f in findings if "GDPR" in str(f.compliance_frameworks)]),
                "critical": len([f for f in findings if "GDPR" in str(f.compliance_frameworks) and f.severity == "critical"]),
                "high": len([f for f in findings if "GDPR" in str(f.compliance_frameworks) and f.severity == "high"]),
                "medium": len([f for f in findings if "GDPR" in str(f.compliance_frameworks) and f.severity == "medium"]),
                "controls_affected": ["Art. 32(1)", "Art. 25(1)", "Art. 5(1)(f)", "Art. 33"]
            }
        },
        remediation_queue=[
            {
                "finding_id": f"finding-{f.id}",
                "policy_name": f.policy_name,
                "severity": f.severity,
                "resource_arn": f.resource_arn,
                "resource_type": f.resource_type,
                "complexity": f.remediation_complexity,
                "can_auto_apply": f.remediation_complexity in ["one_click", "automated"],
                "estimated_time": f.estimated_fix_time,
                "blast_radius": "low" if f.resource_type in ["S3Bucket", "SecretsManagerSecret"] else "medium"
            }
            for f in findings[:10]
        ],
        feature_importance=[
            {"feature": "max_gap_seconds", "importance": 0.1754},
            {"feature": "burstiness", "importance": 0.1480},
            {"feature": "unique_event_names", "importance": 0.0888},
            {"feature": "priv_esc_count", "importance": 0.0882},
            {"feature": "recon_count", "importance": 0.0801}
        ]
    )

def _simulate_scan(db: Session, scan: Scan):
    """Generate synthetic findings for demonstration."""
    import time
    from app.services.compliance import COMPLIANCE_POLICIES
    
    # Simulate processing time
    scan.events_analyzed = random.randint(50000, 500000)
    scan.sequences_found = random.randint(100, 2000)
    scan.malicious_sequences = random.randint(5, 200)
    scan.max_risk_score = round(random.uniform(400, 950), 1)
    scan.avg_risk_score = round(random.uniform(200, 500), 1)
    scan.status = "completed"
    scan.completed_at = datetime.now(timezone.utc)
    db.commit()
    
    # Generate findings based on compliance policies
    policies = list(COMPLIANCE_POLICIES.values())
    num_findings = random.randint(15, 60)
    
    for i in range(num_findings):
        policy = random.choice(policies)
        severity = random.choice(["critical", "high", "medium", "low"])
        
        finding = Finding(
            organization_id=scan.organization_id,
            scan_id=scan.id,
            policy_id=policy["id"],
            policy_name=policy["name"],
            severity=severity,
            description=policy["description"],
            resource_arn=f"arn:aws:{random.choice(['s3', 'iam', 'ec2'])}:::resource-{i}",
            resource_type=random.choice(["S3Bucket", "IAMRole", "EC2SecurityGroup", "EBSVolume"]),
            region=random.choice(["us-east-1", "us-west-2", "eu-west-1"]),
            compliance_frameworks=policy["frameworks"],
            remediation_complexity=random.choice(["one_click", "automated", "manual"]),
            estimated_fix_time=random.choice([3, 10, 15, 30, 45, 60]),
            dollar_impact_low=random.randint(10000, 100000),
            dollar_impact_high=random.randint(100000, 1000000)
        )
        db.add(finding)
    
    db.commit()
