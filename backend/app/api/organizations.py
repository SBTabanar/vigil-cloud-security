from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.api.auth import get_current_active_user
from app.models.database import get_db, Organization, OrganizationMember, AWSAccount
from app.schemas import OrganizationCreate, OrganizationResponse, AWSAccountCreate, AWSAccountResponse

router = APIRouter(prefix="/organizations", tags=["organizations"])

@router.post("", response_model=OrganizationResponse)
def create_org(
    data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    slug = data.name.lower().replace(" ", "-") + "-" + str(uuid.uuid4())[:8]
    org = Organization(name=data.name, slug=slug, industry=data.industry, plan=data.plan)
    db.add(org)
    db.commit()
    db.refresh(org)
    
    member = OrganizationMember(user_id=current_user.id, organization_id=org.id, role="owner")
    db.add(member)
    db.commit()
    
    return OrganizationResponse.model_validate(org)

@router.get("", response_model=list[OrganizationResponse])
def list_orgs(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    orgs = db.query(Organization).join(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).all()
    
    result = []
    for org in orgs:
        resp = OrganizationResponse.model_validate(org)
        resp.member_count = len(org.members)
        resp.account_count = len(org.aws_accounts)
        result.append(resp)
    return result

@router.get("/{org_id}", response_model=OrganizationResponse)
def get_org(
    org_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    
    org = db.query(Organization).filter(Organization.id == org_id).first()
    resp = OrganizationResponse.model_validate(org)
    resp.member_count = len(org.members)
    resp.account_count = len(org.aws_accounts)
    return resp

# AWS Account endpoints
@router.post("/{org_id}/aws-accounts", response_model=AWSAccountResponse)
def add_aws_account(
    org_id: int,
    data: AWSAccountCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    
    account = AWSAccount(
        organization_id=org_id,
        account_name=data.account_name,
        account_id=data.account_id,
        role_arn=data.role_arn,
        external_id=data.external_id,
        regions=data.regions or ["us-east-1"],
        is_connected=True
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return AWSAccountResponse.model_validate(account)

@router.get("/{org_id}/aws-accounts", response_model=list[AWSAccountResponse])
def list_aws_accounts(
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
    
    accounts = db.query(AWSAccount).filter(AWSAccount.organization_id == org_id).all()
    return [AWSAccountResponse.model_validate(a) for a in accounts]

@router.get("/{org_id}/onboarding-template")
def get_onboarding_template(org_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_active_user)):
    """Generate the CloudFormation template for cross-account IAM role."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id,
        OrganizationMember.organization_id == org_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")
    external_id = str(uuid.uuid4())
    
    template = {
        "AWSTemplateFormatVersion": "2010-09-09",
        "Description": "Vigil Cross-Account Scanner Role",
        "Parameters": {
            "VigilAccountId": {
                "Type": "String",
                "Description": "Vigil Scanner AWS Account ID",
                "Default": "123456789012"
            },
            "ExternalId": {
                "Type": "String",
                "Description": "External ID for role assumption",
                "Default": external_id
            }
        },
        "Resources": {
            "VigilScannerRole": {
                "Type": "AWS::IAM::Role",
                "Properties": {
                    "RoleName": "VigilScannerRole",
                    "AssumeRolePolicyDocument": {
                        "Version": "2012-10-17",
                        "Statement": [{
                            "Effect": "Allow",
                            "Principal": {"AWS": {"Fn::Sub": "arn:aws:iam::${VigilAccountId}:root"}},
                            "Action": "sts:AssumeRole",
                            "Condition": {
                                "StringEquals": {"sts:ExternalId": {"Ref": "ExternalId"}}
                            }
                        }]
                    },
                    "ManagedPolicyArns": [
                        "arn:aws:iam::aws:policy/SecurityAudit",
                        "arn:aws:iam::aws:policy/ReadOnlyAccess"
                    ],
                    "Policies": [{
                        "PolicyName": "VigilScannerAdditional",
                        "PolicyDocument": {
                            "Version": "2012-10-17",
                            "Statement": [
                                {
                                    "Effect": "Allow",
                                    "Action": [
                                        "cloudtrail:LookupEvents",
                                        "cloudtrail:GetTrail",
                                        "config:Get*",
                                        "config:List*",
                                        "config:Describe*"
                                    ],
                                    "Resource": "*"
                                }
                            ]
                        }
                    }]
                }
            }
        },
        "Outputs": {
            "RoleArn": {
                "Description": "ARN of the Vigil scanner role",
                "Value": {"Fn::GetAtt": ["VigilScannerRole", "Arn"]}
            }
        }
    }
    
    return {
        "cloudformation_template": template,
        "external_id": external_id,
        "instructions": [
            "1. Log in to your AWS console as an administrator",
            "2. Go to CloudFormation > Create Stack > With new resources",
            "3. Upload this template or paste the JSON",
            "4. Fill in the Vigil Account ID (provided by your onboarding specialist)",
            "5. The External ID is pre-filled — do not change it",
            "6. Create the stack and copy the output Role ARN",
            "7. Paste the Role ARN and External ID below to connect your account"
        ]
    }
