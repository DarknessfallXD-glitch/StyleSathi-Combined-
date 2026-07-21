from dotenv import load_dotenv
import os
from uuid import uuid4
from supabase import create_client, Client
from core.AppException import AppException
import logging
from datetime import datetime, timedelta, timezone

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_PROJECT_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")

supabase: Client = create_client(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_KEY)

PLANS = {
    "plans": [
        {
            "id": "basic",
            "name": "Basic",
            "order": 1,
            "price": {
                "amount": 499,
                "currency": "USD"
            },
            "days": 30,
            "limits": {"try_on_per_day": 5},
            "features": [
                "Up to 5 try-ons per day",
                "Standard processing speed",
                "Email support"
            ]
        },
        {
            "id": "standard",
            "name": "Standard",
            "order": 2,
            "recommended": True,
            "price": {
                "amount": 999,
                "currency": "USD"
            },
            "days": 30,
            "limits": {"try_on_per_day": 10},
            "features": [
                "Up to 10 try-ons per day",
                "Faster processing",
                "Priority email support"
            ]
        },
        {
            "id": "pro",
            "name": "Pro",
            "order": 3,
            "price": {
                "amount": 1999,
                "currency": "USD"
            },
            "days": 30,
            "limits": {"try_on_per_day": 20},
            "features": [
                "Up to 20 try-ons per day",
                "Fastest processing",
                "Priority support + early features"
            ]
        }
    ]
}


_PLACEHOLDER_KEYS = {"sk_test_your-key-here", "sk_test_your-test-key-here", "sk_live_your-key-here"}

def _is_stripe_configured() -> bool:
    key = STRIPE_SECRET_KEY.strip()
    if not key:
        return False
    if key in _PLACEHOLDER_KEYS:
        return False
    if "your-key" in key or "your_test_key" in key:
        return False
    return True


def getPlans():
    return PLANS


def getPlan(plan_id: str) -> dict | None:
    for plan in PLANS["plans"]:
        if plan["id"] == plan_id:
            return plan
    return None


def InitiateSubscribe(plan: dict, user_id: str) -> dict:
    order_id = f"sub_{uuid4().hex[:12]}"

    if not _is_stripe_configured():
        session_id = f"demo_{uuid4().hex[:16]}"
        logger.info(f"Demo mode: order={order_id} user={user_id} session={session_id}")
        supabase.table("payments").insert({
            "user_id": user_id,
            "order_id": order_id,
            "pidx": session_id,
            "amount": plan["price"]["amount"] / 100,
            "currency": plan["price"]["currency"],
            "status": "pending",
            "type": plan["id"],
            "gateway": "demo",
        }).execute()
        return {
            "session_id": session_id,
            "payment_url": f"https://yourfrontend.com/payment-success?session_id={session_id}",
        }

    import stripe
    stripe.api_key = STRIPE_SECRET_KEY

    logger.info(f"Stripe checkout: order={order_id} user={user_id}")

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": plan["price"]["currency"].lower(),
                    "product_data": {
                        "name": plan["name"],
                        "description": f"StyleSathi {plan['name']} plan - {plan['days']} days",
                    },
                    "unit_amount": plan["price"]["amount"],
                },
                "quantity": 1,
            }],
            metadata={
                "order_id": order_id,
                "user_id": user_id,
                "plan_id": plan["id"],
            },
            success_url=os.getenv("STRIPE_SUCCESS_URL", "https://yourfrontend.com/payment-success?session_id={CHECKOUT_SESSION_ID}"),
            cancel_url=os.getenv("STRIPE_CANCEL_URL", "https://yourfrontend.com/payment-cancel"),
        )
    except Exception as e:
        logger.error(f"Stripe session creation failed: {str(e)}")
        raise AppException(f"Stripe error: {str(e)}", 502)

    supabase.table("payments").insert({
        "user_id": user_id,
        "order_id": order_id,
        "pidx": session.id,
        "amount": plan["price"]["amount"] / 100,
        "currency": plan["price"]["currency"],
        "status": "pending",
        "type": plan["id"],
        "gateway": "Stripe",
    }).execute()

    return {
        "session_id": session.id,
        "payment_url": session.url,
    }


def verifyPayment(session_id: str) -> str:
    result = supabase.table("payments").select("*").eq("pidx", session_id).single().execute()
    if not result.data:
        raise AppException("Payment not found", 404)

    payment = result.data
    plan = getPlan(payment["type"])
    if not plan:
        raise AppException("Invalid plan", 400)

    if payment["status"] in ("completed", "processing"):
        return "Already handled"

    gateway = payment.get("gateway", "")
    if gateway == "demo" and session_id.startswith("demo_"):
        return _activate_subscription(payment, session_id, plan)

    if not _is_stripe_configured():
        raise AppException("Stripe not configured and no demo session found", 502)

    import stripe
    stripe.api_key = STRIPE_SECRET_KEY

    supabase.table("payments").update({"status": "processing"}).eq("pidx", session_id).execute()

    try:
        session = stripe.checkout.Session.retrieve(session_id)
    except Exception as e:
        supabase.table("payments").update({"status": "pending"}).eq("pidx", session_id).execute()
        raise AppException(f"Stripe lookup failed: {str(e)}", 502)

    if session.get("metadata", {}).get("order_id") != payment.get("order_id"):
        supabase.table("payments").update({"status": "pending"}).eq("pidx", session_id).execute()
        raise AppException("Order ID mismatch", 400)

    if session.payment_status == "paid" or session.status == "complete":
        return _activate_subscription(payment, session_id, plan)
    elif session.status == "expired" or session.payment_status == "unpaid":
        supabase.table("payments").update({"status": "failed"}).eq("pidx", session_id).execute()
        return "failed"
    else:
        supabase.table("payments").update({"status": "pending"}).eq("pidx", session_id).execute()
        return "pending"


def _activate_subscription(payment: dict, session_id: str, plan: dict) -> str:
    supabase.table("payments").update({"status": "completed"}).eq("pidx", session_id).execute()

    expiry = datetime.now(timezone.utc) + timedelta(days=plan["days"])
    res = supabase.table("users").update({
        "subscription_type": payment["type"],
        "subscription_status": "active",
        "subscription_expiry": expiry.isoformat(),
        "free_tries_used": 0,
        "user_usage": 0,
    }).eq("id", payment["user_id"]).execute()

    if not res.data:
        raise AppException("User update failed", 500)

    logger.info(f"Subscription activated: session={session_id} user={payment['user_id']}")
    return "completed"
