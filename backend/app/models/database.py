from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime, timezone

from app.core.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    organizations = relationship("OrganizationMember", back_populates="user")

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    industry = Column(String)
    plan = Column(String, default="starter")
    is_active = Column(Boolean, default=True)
    payment_provider = Column(String, default="stripe")
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    paymongo_customer_id = Column(String, nullable=True)
    paymongo_source_id = Column(String, nullable=True)
    paymongo_payment_intent_id = Column(String, nullable=True)
    subscription_status = Column(String, default="trial")
    trial_ends_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    members = relationship("OrganizationMember", back_populates="organization")
    aws_accounts = relationship("AWSAccount", back_populates="organization")
    scans = relationship("Scan", back_populates="organization")
    findings = relationship("Finding", back_populates="organization")

class OrganizationMember(Base):
    __tablename__ = "organization_members"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    role = Column(String, default="member")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="organizations")
    organization = relationship("Organization", back_populates="members")

class AWSAccount(Base):
    __tablename__ = "aws_accounts"
    
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), index=True)
    account_name = Column(String, nullable=False)
    account_id = Column(String, nullable=False)
    role_arn = Column(String, nullable=False)
    external_id = Column(String)
    regions = Column(JSON, default=list)
    is_connected = Column(Boolean, default=False)
    last_scan_at = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    organization = relationship("Organization", back_populates="aws_accounts")

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), index=True)
    aws_account_id = Column(Integer, ForeignKey("aws_accounts.id"), nullable=True, index=True)
    scan_type = Column(String, default="full")
    status = Column(String, default="pending")
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    events_analyzed = Column(Integer, default=0)
    sequences_found = Column(Integer, default=0)
    malicious_sequences = Column(Integer, default=0)
    max_risk_score = Column(Float, default=0.0)
    avg_risk_score = Column(Float, default=0.0)
    summary = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    organization = relationship("Organization", back_populates="scans")

class Finding(Base):
    __tablename__ = "findings"
    
    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), index=True)
    policy_id = Column(String, nullable=False, index=True)
    policy_name = Column(String, nullable=False)
    severity = Column(String, nullable=False, index=True)
    description = Column(Text)
    resource_arn = Column(String)
    resource_type = Column(String, index=True)
    region = Column(String)
    actor_arn = Column(String)
    event_name = Column(String)
    compliance_frameworks = Column(JSON, default=list)
    remediation_complexity = Column(String, default="manual")
    remediation_template = Column(String)
    estimated_fix_time = Column(Integer, default=15)
    is_remediated = Column(Boolean, default=False, index=True)
    remediated_at = Column(DateTime)
    dollar_impact_low = Column(Integer, default=0)
    dollar_impact_high = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    organization = relationship("Organization", back_populates="findings")
    
    __table_args__ = (
        Index('idx_finding_org_severity', 'organization_id', 'severity'),
        Index('idx_finding_org_remediated', 'organization_id', 'is_remediated'),
    )

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
