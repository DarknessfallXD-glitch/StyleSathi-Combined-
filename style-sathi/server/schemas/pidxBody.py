from pydantic import BaseModel


class stripeSessionReq(BaseModel):
    session_id: str
