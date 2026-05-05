from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# Auth schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    is_admin: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Organization schemas
class OrganizationCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    plan: Optional[str] = "starter"

class OrganizationResponse(BaseModel):
    id: int
    name: str
    slug: str
    industry: Optional[str]
    plan: str
    is_active: bool
    created_at: datetime
    member_count: Optional[int] = None
    account_count: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

# AWS Account schemas
class AWSAccountCreate(BaseModel):
    account_name: str
    account_id: str
    role_arn: str
    external_id: Optional[str] = None
    regions: Optional[List[str]] = None

class AWSAccountResponse(BaseModel):
    id: int
    account_name: str
    account_id: str
    role_arn: str
    external_id: Optional[str]
    regions: Optional[List[str]]
    is_connected: bool
    last_scan_at: Optional[datetime]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Scan schemas
class ScanCreate(BaseModel):
    aws_account_id: Optional[int] = None
    scan_type: str = "full"

class ScanResponse(BaseModel):
    id: int
    organization_id: int
    aws_account_id: Optional[int]
    scan_type: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    events_analyzed: int
    sequences_found: int
    malicious_sequences: int
    max_risk_score: float
    avg_risk_score: float
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Finding schemas
class FindingResponse(BaseModel):
    id: int
    organization_id: int
    scan_id: int
    policy_id: str
    policy_name: str
    severity: str
    description: Optional[str]
    resource_arn: Optional[str]
    resource_type: Optional[str]
    region: Optional[str]
    compliance_frameworks: Optional[List[str]]
    remediation_complexity: str
    estimated_fix_time: int
    is_remediated: bool
    dollar_impact_low: int
    dollar_impact_high: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Dashboard schemas
class DashboardSummary(BaseModel):
    organization_id: int
    organization_name: str
    total_events: int
    total_sequences: int
    malicious_sequences: int
    total_findings: int
    critical_findings: int
    high_findings: int
    medium_findings: int
    max_risk_score: float
    avg_risk_score: float
    auto_remediable: int
    compliance_frameworks: List[str]
    last_scan_at: Optional[datetime]
    aws_accounts: int

class RiskTimelinePoint(BaseModel):
    date: str
    avg_score: float
    max_score: float
    sequences: int

class TopActor(BaseModel):
    actor: str
    max_score: float
    sequences: int
    findings: List[str]

class DashboardData(BaseModel):
    summary: DashboardSummary
    timeline: List[RiskTimelinePoint]
    top_actors: List[TopActor]
    score_distribution: dict
    findings_by_severity: dict
    compliance_summary: dict
    remediation_queue: List[dict]
    feature_importance: List[dict]
