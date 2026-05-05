"""
Vigil - PayMongo Service (Philippines Payment Integration)

Handles GCash, Maya, GrabPay, and card payments via PayMongo.
For MVP: GCash/Maya via Source (redirect), Cards via PaymentIntent.
"""

import base64
import hmac
import hashlib
import json
from datetime import datetime
from typing import Optional, Dict
import httpx

from app.core.config import get_settings

settings = get_settings()
PAYMONGO_BASE = "https://api.paymongo.com/v1"

# Plan pricing in PHP cents (approx USD*56)
PAYMONGO_PLANS = {
    "starter": {
        "name": "Starter",
        "description": "1 AWS account, daily scans, CIS + SOC2",
        "price_monthly_php": 140_000,  # ~$25
        "features": ["1 AWS account", "Daily scans", "CIS + SOC2", "Email support"]
    },
    "professional": {
        "name": "Professional",
        "description": "5 AWS accounts, real-time drift, all frameworks",
        "price_monthly_php": 308_000,  # ~$55
        "features": ["5 AWS accounts", "Real-time drift", "7 frameworks", "Auto-remediation", "Slack integration"]
    },
    "enterprise": {
        "name": "Enterprise",
        "description": "Unlimited accounts, custom frameworks, CSM",
        "price_monthly_php": 840_000,  # ~$150
        "features": ["Unlimited accounts", "Custom frameworks", "On-prem option", "CSM", "Board reports"]
    }
}


def _basic_auth() -> str:
    """Return Basic Auth header for PayMongo secret key."""
    key = settings.PAYMONGO_SECRET_KEY or ''
    token = base64.b64encode(f"{key}:".encode()).decode()
    return f"Basic {token}"


async def _request(method: str, path: str, data: Optional[Dict] = None) -> Dict:
    """Make an authenticated request to PayMongo API."""
    url = f"{PAYMONGO_BASE}/{path}"
    headers = {
        "Authorization": _basic_auth(),
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient() as client:
        if method.lower() == "get":
            resp = await client.get(url, headers=headers)
        elif method.lower() == "post":
            resp = await client.post(url, headers=headers, json={"data": {"attributes": data}} if data else None)
        else:
            raise ValueError(f"Unsupported method: {method}")
        resp.raise_for_status()
        return resp.json()


class PayMongoService:
    """PayMongo billing operations for PH e-wallets and cards."""

    @staticmethod
    async def create_customer(email: str, name: str) -> Dict:
        """Create a PayMongo Customer."""
        result = await _request("post", "customers", {
            "email": email,
            "first_name": name.split()[0] if name else email,
            "last_name": " ".join(name.split()[1:]) if name and len(name.split()) > 1 else ""
        })
        return {
            "customer_id": result["data"]["id"],
            "email": result["data"]["attributes"]["email"]
        }

    @staticmethod
    async def create_source(amount: int, currency: str, type_: str, redirect_success: str, redirect_failed: str, billing_info: Optional[Dict] = None) -> Dict:
        """
        Create a Source for GCash/Maya/GrabPay.
        type_: 'gcash', 'paymaya', 'grab_pay'
        Returns checkout_url for redirect.
        """
        attributes = {
            "amount": amount,
            "currency": currency,
            "type": type_,
            "redirect": {
                "success": redirect_success,
                "failed": redirect_failed
            }
        }
        if billing_info:
            attributes["billing"] = billing_info

        result = await _request("post", "sources", attributes)
        data = result["data"]["attributes"]
        return {
            "source_id": result["data"]["id"],
            "type": type_,
            "amount": amount,
            "currency": currency,
            "status": data["status"],  # pending, chargeable, cancelled, expired
            "checkout_url": data["redirect"]["checkout_url"],
            "success_url": data["redirect"]["success"],
            "failed_url": data["redirect"]["failed"]
        }

    @staticmethod
    async def create_payment_intent(amount: int, currency: str, description: str, metadata: Optional[Dict] = None, payment_method_id: Optional[str] = None) -> Dict:
        """
        Create a PaymentIntent for card payments.
        If payment_method_id is provided, attach it immediately.
        """
        attributes = {
            "amount": amount,
            "currency": currency,
            "description": description,
            "metadata": metadata or {}
        }
        if payment_method_id:
            attributes["payment_method"] = payment_method_id

        result = await _request("post", "payment_intents", attributes)
        data = result["data"]["attributes"]
        return {
            "payment_intent_id": result["data"]["id"],
            "client_key": data["client_key"],
            "amount": amount,
            "currency": currency,
            "status": data["status"],  # awaiting_payment_method, awaiting_next_action, processing, succeeded, failed
            "metadata": data.get("metadata", {})
        }

    @staticmethod
    async def attach_payment_method(payment_intent_id: str, payment_method_id: str, client_key: str) -> Dict:
        """Attach a payment method to a PaymentIntent and confirm it."""
        result = await _request("post", f"payment_intents/{payment_intent_id}/attach", {
            "payment_method": payment_method_id,
            "client_key": client_key
        })
        data = result["data"]["attributes"]
        return {
            "payment_intent_id": result["data"]["id"],
            "status": data["status"],
            "next_action": data.get("next_action")
        }

    @staticmethod
    async def get_payment_intent(payment_intent_id: str) -> Dict:
        """Retrieve a PaymentIntent status."""
        result = await _request("get", f"payment_intents/{payment_intent_id}")
        data = result["data"]["attributes"]
        return {
            "payment_intent_id": result["data"]["id"],
            "status": data["status"],
            "amount": data["amount"],
            "currency": data["currency"],
            "metadata": data.get("metadata", {})
        }

    @staticmethod
    async def create_webhook(url: str, events: list) -> Dict:
        """Create a webhook endpoint."""
        result = await _request("post", "webhooks", {
            "url": url,
            "events": events
        })
        return {
            "webhook_id": result["data"]["id"],
            "secret_key": result["data"]["attributes"]["secret_key"]
        }

    @staticmethod
    def verify_webhook(payload: bytes, signature: str, webhook_secret: str) -> Dict:
        """Verify PayMongo webhook signature."""
        # PayMongo signature format: timestamp,payload_signature
        # Compute HMAC-SHA256 of timestamp + '.' + payload_json
        if not signature or not webhook_secret:
            raise ValueError("Missing signature or secret")

        # Parse signature header: t=<timestamp>,te=<test_sig>,li=<live_sig>
        parts = {}
        for part in signature.split(","):
            if "=" in part:
                k, v = part.split("=", 1)
                parts[k.strip()] = v.strip()

        timestamp = parts.get("t", "")
        test_sig = parts.get("te", "")
        live_sig = parts.get("li", "")

        expected = hmac.new(
            webhook_secret.encode(),
            f"{timestamp}.{payload.decode()}".encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected, test_sig) and not hmac.compare_digest(expected, live_sig):
            raise ValueError("Invalid signature")

        return json.loads(payload)

    @staticmethod
    def get_plan_config(plan: str) -> Dict:
        """Get PayMongo plan configuration."""
        config = PAYMONGO_PLANS.get(plan)
        if not config:
            raise ValueError(f"Invalid plan: {plan}")
        return config
