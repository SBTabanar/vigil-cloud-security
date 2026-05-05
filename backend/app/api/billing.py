from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from urllib.parse import urlparse

from app.api.auth import get_current_active_user
from app.models.database import get_db, Organization, OrganizationMember
from app.services.billing import BillingService, PLANS, sync_org_from_webhook
from app.services.paymongo import PayMongoService, PAYMONGO_PLANS
from app.core.config import get_settings

router = APIRouter(prefix="/billing", tags=["billing"])
settings = get_settings()


def _validate_redirect_url(url: str) -> str:
    """Prevent open redirects by enforcing same-origin URLs."""
    parsed = urlparse(url)
    expected = urlparse(settings.FRONTEND_URL)
    if parsed.netloc and parsed.netloc != expected.netloc:
        raise HTTPException(status_code=400, detail="Invalid redirect URL")
    return url


@router.get("/plans")
def get_plans():
    """Get available subscription plans with pricing for both Stripe and PayMongo."""
    plans = []
    for plan_id, config in PLANS.items():
        pm_config = PAYMONGO_PLANS.get(plan_id, {})
        plans.append({
            "id": plan_id,
            "name": config["name"],
            "description": config["description"],
            "price_monthly_cents": config["price_monthly"],
            "price_monthly_display_usd": f"${config['price_monthly'] / 100:,.0f}",
            "price_monthly_php_cents": pm_config.get("price_monthly_php", 0),
            "price_monthly_display_php": f"₱{pm_config.get('price_monthly_php', 0) / 100:,.0f}" if pm_config else "",
            "features": config["features"],
            "stripe_price_id": config["price_id"]
        })
    return {"plans": plans}


@router.post("/checkout")
def create_checkout(
    plan: str,
    success_url: str,
    cancel_url: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a Stripe Checkout session for subscription."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="No organization found")

    org = db.query(Organization).filter(Organization.id == member.organization_id).first()

    _validate_redirect_url(success_url)
    _validate_redirect_url(cancel_url)

    try:
        session = BillingService.create_checkout_session(
            organization_id=org.id,
            plan=plan,
            customer_email=current_user.email,
            success_url=success_url,
            cancel_url=cancel_url
        )
        return {"provider": "stripe", **session}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/checkout/paymongo")
async def create_paymongo_checkout(
    plan: str,
    type: str,  # gcash, paymaya, grab_pay
    success_url: str,
    failed_url: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a PayMongo Source for e-wallet (GCash, Maya, GrabPay) checkout."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="No organization found")

    org = db.query(Organization).filter(Organization.id == member.organization_id).first()

    _validate_redirect_url(success_url)
    _validate_redirect_url(failed_url)

    try:
        config = PayMongoService.get_plan_config(plan)
        amount = config["price_monthly_php"]

        if not org.paymongo_customer_id:
            customer = await PayMongoService.create_customer(
                email=current_user.email,
                name=f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email
            )
            org.paymongo_customer_id = customer["customer_id"]
            db.commit()

        source = await PayMongoService.create_source(
            amount=amount,
            currency="PHP",
            type_=type,
            redirect_success=success_url,
            redirect_failed=failed_url,
            billing_info={
                "name": f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email,
                "email": current_user.email
            }
        )

        org.paymongo_source_id = source["source_id"]
        db.commit()

        return {
            "provider": "paymongo",
            "source_id": source["source_id"],
            "checkout_url": source["checkout_url"],
            "amount": amount,
            "currency": "PHP",
            "type": type,
            "organization_id": org.id,
            "plan": plan
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/portal")
def create_billing_portal(
    return_url: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a Stripe Billing Portal session."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="No organization found")

    org = db.query(Organization).filter(Organization.id == member.organization_id).first()

    if not org.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No Stripe customer found")

    _validate_redirect_url(return_url)

    session = BillingService.create_billing_portal_session(
        customer_id=org.stripe_customer_id,
        return_url=return_url
    )
    return session


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events."""
    payload = await request.body()

    try:
        result = BillingService.handle_webhook(
            payload=payload,
            signature=stripe_signature,
            webhook_secret=settings.STRIPE_WEBHOOK_SECRET
        )

        if result.get("organization_id"):
            sync_org_from_webhook(db, result)

        return {"status": "processed", "event": result.get("event")}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook/paymongo")
async def paymongo_webhook(
    request: Request,
    paymongo_signature: str = Header(None, alias="Paymongo-Signature"),
    db: Session = Depends(get_db)
):
    """Handle PayMongo webhook events."""
    payload = await request.body()

    try:
        event_data = PayMongoService.verify_webhook(
            payload=payload,
            signature=paymongo_signature,
            webhook_secret=settings.PAYMONGO_WEBHOOK_SECRET
        )

        event_type = event_data.get("data", {}).get("attributes", {}).get("type", "")
        event_data_obj = event_data.get("data", {}).get("attributes", {}).get("data", {})

        result = {"event": event_type, "processed": False, "provider": "paymongo"}

        if event_type == "source.chargeable":
            source_id = event_data_obj.get("id")
            amount = event_data_obj.get("attributes", {}).get("amount", 0)
            org = db.query(Organization).filter(Organization.paymongo_source_id == source_id).first()
            if org:
                result.update({
                    "organization_id": org.id,
                    "source_id": source_id,
                    "amount": amount,
                    "action": "activate_subscription"
                })
                sync_org_from_webhook(db, result)

        elif event_type == "payment.paid":
            source_id = event_data_obj.get("attributes", {}).get("source", {}).get("id")
            org = db.query(Organization).filter(Organization.paymongo_source_id == source_id).first()
            if org:
                result.update({
                    "organization_id": org.id,
                    "source_id": source_id,
                    "action": "activate_subscription"
                })
                sync_org_from_webhook(db, result)

        elif event_type == "payment.failed":
            source_id = event_data_obj.get("attributes", {}).get("source", {}).get("id")
            org = db.query(Organization).filter(Organization.paymongo_source_id == source_id).first()
            if org:
                result.update({
                    "organization_id": org.id,
                    "source_id": source_id,
                    "action": "mark_payment_failed"
                })
                sync_org_from_webhook(db, result)

        result["processed"] = True
        return {"status": "processed", "event": event_type}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subscription")
def get_subscription(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get current subscription status (Stripe or PayMongo)."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="No organization found")

    org = db.query(Organization).filter(Organization.id == member.organization_id).first()

    subscription_data = None
    if org.payment_provider == "stripe" and org.stripe_subscription_id:
        subscription_data = BillingService.get_subscription_status(org.stripe_subscription_id)
    elif org.payment_provider == "paymongo" and org.paymongo_payment_intent_id:
        subscription_data = {
            "status": org.subscription_status,
            "provider": "paymongo",
            "payment_intent_id": org.paymongo_payment_intent_id,
            "source_id": org.paymongo_source_id
        }

    return {
        "organization_id": org.id,
        "plan": org.plan,
        "status": org.subscription_status,
        "is_active": org.is_active,
        "payment_provider": org.payment_provider,
        "trial_ends_at": org.trial_ends_at.isoformat() if org.trial_ends_at else None,
        "stripe_customer_id": org.stripe_customer_id,
        "stripe_subscription_id": org.stripe_subscription_id,
        "paymongo_customer_id": org.paymongo_customer_id,
        "paymongo_source_id": org.paymongo_source_id,
        "paymongo_payment_intent_id": org.paymongo_payment_intent_id,
        "details": subscription_data
    }


@router.post("/cancel")
def cancel_subscription(
    at_period_end: bool = True,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Cancel the current subscription (Stripe or PayMongo)."""
    member = db.query(OrganizationMember).filter(
        OrganizationMember.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="No organization found")

    org = db.query(Organization).filter(Organization.id == member.organization_id).first()

    if org.payment_provider == "stripe":
        if not org.stripe_subscription_id:
            raise HTTPException(status_code=400, detail="No active Stripe subscription")
        result = BillingService.cancel_subscription(org.stripe_subscription_id, at_period_end)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return {"provider": "stripe", **result}

    elif org.payment_provider == "paymongo":
        org.subscription_status = "canceled"
        org.is_active = False
        db.commit()
        return {
            "provider": "paymongo",
            "status": "canceled",
            "message": "PayMongo subscription canceled. No further charges will be made."
        }

    raise HTTPException(status_code=400, detail="No active subscription found")
