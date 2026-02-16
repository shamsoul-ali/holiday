"""
Payment routes for processing travel booking payments
"""

from fastapi import APIRouter, Request, HTTPException, Depends, Form
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import json
import logging

from services.payment_service import payment_service, PaymentProvider, PaymentStatus

router = APIRouter(prefix="/api/payments", tags=["payments"])
logger = logging.getLogger(__name__)

# Request/Response models
class PaymentIntentRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Payment amount")
    currency: str = Field(..., description="Currency code (MYR, USD, etc.)")
    booking_reference: str = Field(..., description="Unique booking reference")
    customer_email: str = Field(..., description="Customer email")
    payment_method: str = Field(default="stripe", description="Payment provider")
    customer_name: Optional[str] = Field(None, description="Customer name")
    phone_number: Optional[str] = Field(None, description="Customer phone")
    description: Optional[str] = Field(None, description="Payment description")

class PaymentIntentResponse(BaseModel):
    provider: str
    payment_intent_id: Optional[str] = None
    payment_id: Optional[str] = None
    client_secret: Optional[str] = None
    form_data: Optional[Dict[str, Any]] = None
    action_url: Optional[str] = None
    amount: float
    currency: str
    status: str
    booking_reference: str
    publishable_key: Optional[str] = None

class RefundRequest(BaseModel):
    payment_intent_id: str = Field(..., description="Payment intent ID to refund")
    amount: Optional[float] = Field(None, description="Refund amount (full refund if not specified)")
    reason: str = Field(default="requested_by_customer", description="Refund reason")
    provider: str = Field(default="stripe", description="Payment provider")

@router.get("/methods")
async def get_payment_methods(country_code: str = "MY"):
    """Get available payment methods for a country"""
    try:
        methods = payment_service.get_available_payment_methods(country_code)
        
        return {
            "country_code": country_code,
            "available_methods": methods,
            "default_method": "stripe" if any(m["provider"] == "stripe" for m in methods) else methods[0]["provider"] if methods else None
        }
        
    except Exception as e:
        logger.error(f"Failed to get payment methods: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get payment methods: {str(e)}")

@router.post("/create-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(request: PaymentIntentRequest):
    """Create a payment intent for booking payment"""
    try:
        # Prepare metadata
        metadata = {
            "customer_name": request.customer_name,
            "phone_number": request.phone_number,
            "description": request.description
        }
        
        # Create payment intent
        payment_data = await payment_service.create_payment_intent(
            amount=request.amount,
            currency=request.currency,
            booking_reference=request.booking_reference,
            customer_email=request.customer_email,
            payment_method=request.payment_method,
            metadata=metadata
        )
        
        return PaymentIntentResponse(**payment_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment intent creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Payment intent creation failed: {str(e)}")

@router.post("/verify")
async def verify_payment(
    payment_intent_id: str,
    provider: str = PaymentProvider.STRIPE
):
    """Verify payment status"""
    try:
        verification_result = await payment_service.verify_payment(payment_intent_id, provider)
        
        return {
            "verification_status": "success",
            "payment_data": verification_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment verification failed: {e}")
        raise HTTPException(status_code=500, detail=f"Payment verification failed: {str(e)}")

@router.post("/refund")
async def process_refund(request: RefundRequest):
    """Process payment refund"""
    try:
        refund_result = await payment_service.refund_payment(
            payment_intent_id=request.payment_intent_id,
            amount=request.amount,
            reason=request.reason,
            provider=request.provider
        )
        
        return {
            "refund_status": "success",
            "refund_data": refund_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Refund processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Refund processing failed: {str(e)}")

# Stripe webhook endpoint
@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    try:
        payload = await request.body()
        signature = request.headers.get("stripe-signature")
        
        if not signature:
            raise HTTPException(status_code=400, detail="Missing Stripe signature")
        
        webhook_data = payment_service.verify_stripe_webhook(payload, signature)
        
        # Process webhook event
        event_type = webhook_data["event_type"]
        event_data = webhook_data["data"]
        
        if event_type == "payment_intent.succeeded":
            # Handle successful payment
            payment_intent = event_data["object"]
            booking_reference = payment_intent["metadata"].get("booking_reference")
            
            logger.info(f"Payment succeeded for booking {booking_reference}")
            
            # Here you would update your booking status, send confirmation emails, etc.
            # await booking_service.confirm_payment(booking_reference, payment_intent["id"])
            
        elif event_type == "payment_intent.payment_failed":
            # Handle failed payment
            payment_intent = event_data["object"]
            booking_reference = payment_intent["metadata"].get("booking_reference")
            
            logger.warning(f"Payment failed for booking {booking_reference}")
            
            # Here you would handle payment failure
            # await booking_service.handle_payment_failure(booking_reference, payment_intent["id"])
        
        return {"status": "success", "event_processed": event_type}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Stripe webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

# iPay88 callback endpoints
@router.post("/ipay88/callback")
async def ipay88_callback(
    MerchantCode: str = Form(...),
    PaymentId: str = Form(...),
    RefNo: str = Form(...),
    Amount: str = Form(...),
    Currency: str = Form(...),
    Remark: str = Form(...),
    TransId: str = Form(...),
    AuthCode: str = Form(...),
    Status: str = Form(...),
    ErrDesc: str = Form(...),
    Signature: str = Form(...)
):
    """Handle iPay88 payment callback (user return)"""
    try:
        callback_data = {
            "MerchantCode": MerchantCode,
            "PaymentId": PaymentId,
            "RefNo": RefNo,
            "Amount": Amount,
            "Currency": Currency,
            "Remark": Remark,
            "TransId": TransId,
            "AuthCode": AuthCode,
            "Status": Status,
            "ErrDesc": ErrDesc,
            "Signature": Signature
        }
        
        verification_result = payment_service.verify_ipay88_callback(callback_data)
        
        # Return user-friendly response
        if verification_result["status"] == PaymentStatus.SUCCESS:
            return {
                "payment_status": "success",
                "booking_reference": verification_result["booking_reference"],
                "transaction_id": verification_result["transaction_id"],
                "message": "Payment completed successfully"
            }
        else:
            return {
                "payment_status": "failed",
                "booking_reference": verification_result["booking_reference"],
                "error_description": verification_result["error_description"],
                "message": "Payment failed"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"iPay88 callback processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Callback processing failed: {str(e)}")

@router.post("/ipay88/notify")
async def ipay88_notify(
    MerchantCode: str = Form(...),
    PaymentId: str = Form(...),
    RefNo: str = Form(...),
    Amount: str = Form(...),
    Currency: str = Form(...),
    Remark: str = Form(...),
    TransId: str = Form(...),
    AuthCode: str = Form(...),
    Status: str = Form(...),
    ErrDesc: str = Form(...),
    Signature: str = Form(...)
):
    """Handle iPay88 payment notification (backend notification)"""
    try:
        callback_data = {
            "MerchantCode": MerchantCode,
            "PaymentId": PaymentId,
            "RefNo": RefNo,
            "Amount": Amount,
            "Currency": Currency,
            "Remark": Remark,
            "TransId": TransId,
            "AuthCode": AuthCode,
            "Status": Status,
            "ErrDesc": ErrDesc,
            "Signature": Signature
        }
        
        verification_result = payment_service.verify_ipay88_callback(callback_data)
        
        # Process payment notification
        if verification_result["status"] == PaymentStatus.SUCCESS:
            # Update booking status
            booking_reference = verification_result["booking_reference"]
            transaction_id = verification_result["transaction_id"]
            
            logger.info(f"iPay88 payment notification: SUCCESS for booking {booking_reference}, transaction {transaction_id}")
            
            # Here you would update booking status, send confirmation emails, etc.
            # await booking_service.confirm_payment(booking_reference, transaction_id)
            
        else:
            # Handle payment failure
            booking_reference = verification_result["booking_reference"]
            error_description = verification_result["error_description"]
            
            logger.warning(f"iPay88 payment notification: FAILED for booking {booking_reference}, error: {error_description}")
            
            # Handle payment failure
            # await booking_service.handle_payment_failure(booking_reference, error_description)
        
        # iPay88 expects "RECEIVEOK" response
        return "RECEIVEOK"
        
    except Exception as e:
        logger.error(f"iPay88 notification processing failed: {e}")
        # Return error status to iPay88
        return "FAILED"

@router.get("/status/{booking_reference}")
async def get_payment_status(booking_reference: str):
    """Get payment status for a booking"""
    try:
        # This would typically query your database for payment status
        # For now, return a placeholder response
        
        return {
            "booking_reference": booking_reference,
            "payment_status": "pending",
            "message": "Payment status lookup - implement database query",
            "last_updated": "2025-08-26T10:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Payment status lookup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Status lookup failed: {str(e)}")

@router.get("/health")
async def payment_health_check():
    """Health check for payment services"""
    try:
        health_status = {
            "status": "healthy",
            "payment_providers": {
                "stripe": {
                    "available": bool(payment_service.stripe_client),
                    "configured": bool(payment_service.stripe_client and hasattr(payment_service, 'stripe_publishable_key'))
                },
                "ipay88": {
                    "available": bool(payment_service.ipay88_config),
                    "configured": bool(payment_service.ipay88_config)
                }
            },
            "timestamp": "2025-08-26T10:00:00Z"
        }
        
        return health_status
        
    except Exception as e:
        logger.error(f"Payment health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")