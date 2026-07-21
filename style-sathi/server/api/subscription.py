from fastapi import APIRouter, Depends
from api.user import checkAuth
from services.subscriber import getPlan, getPlans, InitiateSubscribe, verifyPayment
from core.AppException import AppException
from schemas.planBody import planReq
from schemas.pidxBody import stripeSessionReq
from fastapi.security import HTTPBearer

subscription_router = APIRouter()
security = HTTPBearer()


@subscription_router.get("/plans")
def plans():
    return getPlans()


@subscription_router.post("/create")
def create_subscribe(req: planReq, credentials=Depends(security)):
    info = checkAuth(credentials)
    plan = getPlan(req.planId)

    if plan is None:
        raise AppException("Plan not found", 404)

    return InitiateSubscribe(plan, info["sub"])


@subscription_router.post("/verify")
def verify_subscribe(req: stripeSessionReq, credentials=Depends(security)):
    checkAuth(credentials)
    return verifyPayment(req.session_id)
