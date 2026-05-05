"""
Vigil - Billing Service (Stripe Integration)

Handles subscriptions, checkout, billing portal, and webhook processing.
"""

import stripe
from datetime import datetime, timezone
from typing import Optional, Dict
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.database import Organization

settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY or ''

# Product/Price IDs (create these in Stripe Dashboard)
PLANS = {
    "starter": {
        "name": "Starter",
        "description": "1 AWS account, daily scans, CIS + SOC2",
        "price_monthly": 2500_00,  # cents
        "price_id": "price_starter_monthly",  # Replace with real Stripe Price ID
        "features": ["1 AWS account", "Daily scans", "CIS + SOC2", "Email support"]
    },
    "professional": {
        "name": "Professional",
        "description": "5 AWS accounts, real-time drift, all frameworks",
        "price_monthly": 5500_00,
        "price_id": "price_professional_monthly",
        "features": ["5 AWS accounts", "Real-time drift", "7 frameworks", "Auto-remediation", "Slack integration"]
    },
    "enterprise": {
        "name": "Enterprise",
        "description": "Unlimited accounts, custom frameworks, CSM",
        "price_monthly": 15000_00,
        "price_id": "price_enterprise_monthly",
        "features": ["Unlimited accounts", "Custom frameworks", "On-prem option", "CSM", "Board reports"]
    }
}


class BillingService:
    """Stripe billing operations for Vigil subscriptions."""

    @staticmethod
    def create_checkout_session(organization_id: int, plan: str, customer_email: str, success_url: str, cancel_url: str) -> Dict:
        """Create a Stripe Checkout session for subscription."""
        plan_config = PLANS.get(plan)
        if not plan_config:
            raise ValueError(f"Invalid plan: {plan}")

        session = stripe.checkout.Session.create(
            customer_email=customer_email,
            payment_method_types=["card"],
            line_items=[{
                "price": plan_config["price_id"],
                "quantity": 1,
            }],
            mode="subscription",
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={
                "organization_id": str(organization_id),
                "plan": plan
            }
        )
        return {
            "session_id": session.id,
            "url": session.url
        }

    @staticmethod
    def create_billing_portal_session(customer_id: str, return_url: str) -> Dict:
        """Create a Stripe Billing Portal session for customer self-service."""
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url
        )
        return {
            "url": session.url
        }

    @staticmethod
    def handle_webhook(payload: bytes, signature: str, webhook_secret: str) -> Dict:
        """Process Stripe webhook events."""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
        except ValueError:
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid signature")

        event_type = event["type"]
        data = event["data"]["object"]

        result = {"event": event_type, "processed": False}

        if event_type == "checkout.session.completed":
            org_id = int(data["metadata"].get("organization_id", 0))
            plan = data["metadata"].get("plan", "starter")
            customer_id = data.get("customer")
            subscription_id = data.get("subscription")
            result.update({
                "organization_id": org_id,
                "plan": plan,
                "customer_id": customer_id,
                "subscription_id": subscription_id,
                "action": "activate_subscription"
            })

        elif event_type == "invoice.payment_failed":
            customer_id = data.get("customer")
            subscription_id = data.get("subscription")
            result.update({
                "customer_id": customer_id,
                "subscription_id": subscription_id,
                "action": "mark_payment_failed"
            })

        elif event_type == "customer.subscription.deleted":
            subscription_id = data.get("id")
            customer_id = data.get("customer")
            result.update({
                "subscription_id": subscription_id,
                "customer_id": customer_id,
                "action": "cancel_subscription"
            })

        result["processed"] = True
        return result

    @staticmethod
    def get_subscription_status(subscription_id: str) -> Dict:
        """Get current subscription status from Stripe."""
        try:
            sub = stripe.Subscription.retrieve(subscription_id)
            return {
                "status": sub.status,  # active, canceled, past_due, unpaid
                "current_period_end": datetime.fromtimestamp(sub.current_period_end, tz=timezone.utc).isoformat(),
                "cancel_at_period_end": sub.cancel_at_period_end,
                "plan": sub.items.data[0].price.id if sub.items.data else None
            }
        except stripe.error.StripeError as e:
            return {"error": str(e)}

    @staticmethod
    def cancel_subscription(subscription_id: str, at_period_end: bool = True) -> Dict:
        """Cancel a subscription."""
        try:
            sub = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=at_period_end
            )
            return {
                "status": sub.status,
                "cancel_at_period_end": sub.cancel_at_period_end,
                "current_period_end": datetime.fromtimestamp(sub.current_period_end, tz=timezone.utc).isoformat()
            }
        except stripe.error.StripeError as e:
            return {"error": str(e)}


def sync_org_from_webhook(db: Session, webhook_result: Dict) -> Optional[Organization]:
    """Update organization record based on Stripe or PayMongo webhook."""
    org_id = webhook_result.get("organization_id")
    if not org_id:
        return None

    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        return None

    action = webhook_result.get("action")
    provider = webhook_result.get("provider", "stripe")

    if action == "activate_subscription":
        org.plan = webhook_result.get("plan", org.plan)
        org.payment_provider = provider
        if provider == "stripe":
            org.stripe_customer_id = webhook_result.get("customer_id")
            org.stripe_subscription_id = webhook_result.get("subscription_id")
        elif provider == "paymongo":
            org.paymongo_customer_id = webhook_result.get("customer_id")
            org.paymongo_source_id = webhook_result.get("source_id")
            org.paymongo_payment_intent_id = webhook_result.get("payment_intent_id")
        org.subscription_status = "active"
        org.is_active = True
    elif action == "mark_payment_failed":
        org.subscription_status = "past_due"
    elif action == "cancel_subscription":
        org.subscription_status = "canceled"
        org.is_active = False

    db.commit()
    db.refresh(org)
    return org
