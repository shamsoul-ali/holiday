"""
Payment Service - Stripe and iPay88 integration
Handles payment processing for travel bookings
"""

import os
import asyncio
import json
import hashlib
import hmac
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from decimal import Decimal
import logging

from fastapi import HTTPException
from config.api_keys import api_key_manager, APIProvider

logger = logging.getLogger(__name__)

class PaymentProvider:
    STRIPE = "stripe"
    IPAY88 = "ipay88"
    PAYPAL = "paypal"

class PaymentStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentService:
    def __init__(self):
        self.stripe_client = None
        self.ipay88_config = None
        self._initialize_payment_providers()
    
    def _initialize_payment_providers(self):
        """Initialize payment providers based on available API keys"""
        # Initialize Stripe
        stripe_config = api_key_manager.get_config(APIProvider.STRIPE)
        if stripe_config and stripe_config.key and stripe_config.secret:
            try:
                import stripe
                stripe.api_key = stripe_config.secret
                self.stripe_client = stripe
                self.stripe_publishable_key = stripe_config.key
                self.stripe_webhook_secret = stripe_config.additional_config.get("webhook_secret")
                logger.info("Stripe payment provider initialized")
            except ImportError:
                logger.warning("Stripe library not installed. Run: pip install stripe")
        
        # Initialize iPay88
        ipay88_config = api_key_manager.get_config(APIProvider.IPAY88)
        if ipay88_config and ipay88_config.key and ipay88_config.secret:
            self.ipay88_config = {
                "merchant_key": ipay88_config.key,
                "merchant_code": ipay88_config.secret,
                "signature_key": ipay88_config.additional_config.get("signature_key"),
                "api_url": "https://www.mobile88.com/epayment/entry.asp"  # Production
            }
            logger.info("iPay88 payment provider initialized")
    
    async def create_payment_intent(
        self,
        amount: float,
        currency: str,
        booking_reference: str,
        customer_email: str,
        payment_method: str = "stripe",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a payment intent for the booking"""
        
        if payment_method == PaymentProvider.STRIPE and self.stripe_client:
            return await self._create_stripe_payment_intent(
                amount, currency, booking_reference, customer_email, metadata
            )
        elif payment_method == PaymentProvider.IPAY88 and self.ipay88_config:
            return await self._create_ipay88_payment(
                amount, currency, booking_reference, customer_email, metadata
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Payment method {payment_method} not available or not configured"
            )
    
    async def _create_stripe_payment_intent(
        self,
        amount: float,
        currency: str,
        booking_reference: str,
        customer_email: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create Stripe Payment Intent"""
        try:
            # Convert amount to cents (Stripe requires integer in smallest currency unit)
            amount_cents = int(amount * 100)
            
            # Prepare metadata
            payment_metadata = {
                "booking_reference": booking_reference,
                "customer_email": customer_email,
                "platform": "holiday-ai-planner",
                "created_at": datetime.now().isoformat()
            }
            if metadata:
                payment_metadata.update(metadata)
            
            # Create payment intent
            intent = await asyncio.to_thread(
                self.stripe_client.PaymentIntent.create,
                amount=amount_cents,
                currency=currency.lower(),
                metadata=payment_metadata,
                receipt_email=customer_email,
                description=f"Holiday AI - Booking {booking_reference}",
                automatic_payment_methods={"enabled": True}
            )
            
            return {
                "provider": PaymentProvider.STRIPE,
                "payment_intent_id": intent.id,
                "client_secret": intent.client_secret,
                "amount": amount,
                "currency": currency,
                "status": intent.status,
                "publishable_key": self.stripe_publishable_key,
                "booking_reference": booking_reference
            }
            
        except Exception as e:
            logger.error(f"Stripe payment intent creation failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Payment intent creation failed: {str(e)}"
            )
    
    async def _create_ipay88_payment(
        self,
        amount: float,
        currency: str,
        booking_reference: str,
        customer_email: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create iPay88 payment form data"""
        try:
            # iPay88 required parameters
            merchant_code = self.ipay88_config["merchant_code"]
            payment_id = f"HolidayAI_{booking_reference}_{int(datetime.now().timestamp())}"
            
            # Convert amount to 2 decimal places string
            amount_str = f"{amount:.2f}"
            
            # Create signature string
            signature_string = (
                f"{merchant_code}{payment_id}{amount_str}{currency}"
            )
            
            # Generate signature using HMAC-SHA256
            signature = hmac.new(
                self.ipay88_config["signature_key"].encode('utf-8'),
                signature_string.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            # Prepare form data
            form_data = {
                "MerchantCode": merchant_code,
                "PaymentId": payment_id,
                "RefNo": booking_reference,
                "Amount": amount_str,
                "Currency": currency.upper(),
                "ProdDesc": f"Holiday AI Travel Booking - {booking_reference}",
                "UserName": customer_email,
                "UserEmail": customer_email,
                "UserContact": metadata.get("phone_number", "") if metadata else "",
                "Remark": f"Holiday AI Platform Booking",
                "Lang": "UTF-8",
                "Signature": signature,
                "ResponseURL": f"{os.getenv('NEXT_PUBLIC_APP_URL')}/api/payments/ipay88/callback",
                "BackendURL": f"{os.getenv('NEXT_PUBLIC_APP_URL')}/api/payments/ipay88/notify"
            }
            
            return {
                "provider": PaymentProvider.IPAY88,
                "payment_id": payment_id,
                "form_data": form_data,
                "action_url": self.ipay88_config["api_url"],
                "amount": amount,
                "currency": currency,
                "status": PaymentStatus.PENDING,
                "booking_reference": booking_reference
            }
            
        except Exception as e:
            logger.error(f"iPay88 payment creation failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"iPay88 payment creation failed: {str(e)}"
            )
    
    async def verify_payment(
        self,
        payment_intent_id: str,
        provider: str = PaymentProvider.STRIPE
    ) -> Dict[str, Any]:
        """Verify payment status"""
        
        if provider == PaymentProvider.STRIPE and self.stripe_client:
            return await self._verify_stripe_payment(payment_intent_id)
        elif provider == PaymentProvider.IPAY88 and self.ipay88_config:
            return await self._verify_ipay88_payment(payment_intent_id)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Payment provider {provider} not available"
            )
    
    async def _verify_stripe_payment(self, payment_intent_id: str) -> Dict[str, Any]:
        """Verify Stripe payment"""
        try:
            intent = await asyncio.to_thread(
                self.stripe_client.PaymentIntent.retrieve,
                payment_intent_id
            )
            
            return {
                "provider": PaymentProvider.STRIPE,
                "payment_id": intent.id,
                "status": intent.status,
                "amount": intent.amount / 100,  # Convert from cents
                "currency": intent.currency.upper(),
                "payment_method": intent.payment_method,
                "metadata": intent.metadata,
                "verified_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Stripe payment verification failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Payment verification failed: {str(e)}"
            )
    
    async def _verify_ipay88_payment(self, payment_id: str) -> Dict[str, Any]:
        """Verify iPay88 payment (would require API call to iPay88)"""
        # Note: iPay88 verification would typically be done via webhook callback
        # This is a placeholder for the verification logic
        logger.info(f"iPay88 payment verification for {payment_id}")
        
        return {
            "provider": PaymentProvider.IPAY88,
            "payment_id": payment_id,
            "status": PaymentStatus.PENDING,
            "message": "iPay88 payment verification requires webhook callback"
        }
    
    def verify_ipay88_callback(
        self,
        callback_data: Dict[str, str]
    ) -> Dict[str, Any]:
        """Verify iPay88 payment callback"""
        try:
            # Extract callback data
            merchant_code = callback_data.get("MerchantCode")
            payment_id = callback_data.get("PaymentId")
            ref_no = callback_data.get("RefNo")
            amount = callback_data.get("Amount")
            currency = callback_data.get("Currency")
            remark = callback_data.get("Remark")
            trans_id = callback_data.get("TransId")
            auth_code = callback_data.get("AuthCode")
            status = callback_data.get("Status")
            err_desc = callback_data.get("ErrDesc")
            signature = callback_data.get("Signature")
            
            # Verify signature
            signature_string = (
                f"{merchant_code}{payment_id}{ref_no}{amount}{currency}"
                f"{remark}{trans_id}{auth_code}{status}{err_desc}"
            )
            
            expected_signature = hmac.new(
                self.ipay88_config["signature_key"].encode('utf-8'),
                signature_string.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            if signature.lower() != expected_signature.lower():
                raise HTTPException(
                    status_code=400,
                    detail="Invalid signature in iPay88 callback"
                )
            
            # Determine payment status
            payment_status = PaymentStatus.SUCCESS if status == "1" else PaymentStatus.FAILED
            
            return {
                "provider": PaymentProvider.IPAY88,
                "payment_id": payment_id,
                "transaction_id": trans_id,
                "authorization_code": auth_code,
                "status": payment_status,
                "amount": float(amount),
                "currency": currency,
                "booking_reference": ref_no,
                "error_description": err_desc,
                "verified_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"iPay88 callback verification failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"iPay88 callback verification failed: {str(e)}"
            )
    
    def verify_stripe_webhook(
        self,
        payload: bytes,
        signature: str
    ) -> Dict[str, Any]:
        """Verify Stripe webhook"""
        try:
            if not self.stripe_webhook_secret:
                raise HTTPException(
                    status_code=500,
                    detail="Stripe webhook secret not configured"
                )
            
            event = self.stripe_client.Webhook.construct_event(
                payload, signature, self.stripe_webhook_secret
            )
            
            return {
                "provider": PaymentProvider.STRIPE,
                "event_type": event["type"],
                "event_id": event["id"],
                "data": event["data"],
                "verified_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Stripe webhook verification failed: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Stripe webhook verification failed: {str(e)}"
            )
    
    async def refund_payment(
        self,
        payment_intent_id: str,
        amount: Optional[float] = None,
        reason: str = "requested_by_customer",
        provider: str = PaymentProvider.STRIPE
    ) -> Dict[str, Any]:
        """Process payment refund"""
        
        if provider == PaymentProvider.STRIPE and self.stripe_client:
            return await self._refund_stripe_payment(payment_intent_id, amount, reason)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Refund not supported for provider {provider}"
            )
    
    async def _refund_stripe_payment(
        self,
        payment_intent_id: str,
        amount: Optional[float] = None,
        reason: str = "requested_by_customer"
    ) -> Dict[str, Any]:
        """Process Stripe refund"""
        try:
            refund_data = {
                "payment_intent": payment_intent_id,
                "reason": reason
            }
            
            if amount:
                refund_data["amount"] = int(amount * 100)  # Convert to cents
            
            refund = await asyncio.to_thread(
                self.stripe_client.Refund.create,
                **refund_data
            )
            
            return {
                "provider": PaymentProvider.STRIPE,
                "refund_id": refund.id,
                "payment_intent_id": payment_intent_id,
                "amount": refund.amount / 100,  # Convert from cents
                "currency": refund.currency.upper(),
                "status": refund.status,
                "reason": refund.reason,
                "created_at": datetime.fromtimestamp(refund.created).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Stripe refund failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Refund processing failed: {str(e)}"
            )
    
    def get_available_payment_methods(self, country_code: str = "MY") -> List[Dict[str, Any]]:
        """Get available payment methods for a country"""
        available_methods = []
        
        # Stripe (international)
        if self.stripe_client:
            stripe_methods = {
                "provider": PaymentProvider.STRIPE,
                "name": "Credit/Debit Card",
                "description": "Visa, Mastercard, American Express",
                "currencies": ["MYR", "USD", "SGD", "EUR", "GBP"],
                "countries": ["MY", "SG", "US", "GB", "AU", "CA"],
                "fees": "2.9% + MYR 1.50",
                "logo": "https://stripe.com/img/v3/home/twitter.png"
            }
            available_methods.append(stripe_methods)
        
        # iPay88 (Malaysia specific)
        if self.ipay88_config and country_code == "MY":
            ipay88_methods = {
                "provider": PaymentProvider.IPAY88,
                "name": "iPay88 Malaysia",
                "description": "Local Malaysian payment methods",
                "currencies": ["MYR"],
                "countries": ["MY"],
                "payment_options": [
                    "Online Banking (Maybank, CIMB, Public Bank, etc.)",
                    "Credit Card (Visa, Mastercard)",
                    "eWallet (GrabPay, Boost, TouchnGo)",
                    "FPX"
                ],
                "fees": "2.5% + MYR 1.00",
                "logo": "https://www.ipay88.com/images/logo.png"
            }
            available_methods.append(ipay88_methods)
        
        return available_methods

# Global instance
payment_service = PaymentService()