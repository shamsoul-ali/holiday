from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
from pydantic import BaseModel
import httpx
import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Clerk configuration
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_PUBLISHABLE_KEY = os.getenv("CLERK_PUBLISHABLE_KEY")
CLERK_API_URL = "https://api.clerk.com/v1"

# Security scheme
security = HTTPBearer()

class UserProfile(BaseModel):
    user_id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "user"  # user, agent, admin
    preferences: Dict[str, Any] = {}
    created_at: datetime
    last_login: datetime

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = "user"

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserProfile
    expires_in: int

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verify JWT token with Clerk"""
    try:
        token = credentials.credentials
        
        # Verify token with Clerk
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CLERK_API_URL}/sessions/verify",
                headers={
                    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                    "Content-Type": "application/json"
                },
                params={"token": token}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            session_data = response.json()
            return session_data
            
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Token verification failed")

async def get_current_user(token_data: Dict[str, Any] = Depends(verify_token)) -> UserProfile:
    """Get current user profile from token"""
    try:
        user_id = token_data.get("user_id")
        
        # Get user details from Clerk
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{CLERK_API_URL}/users/{user_id}",
                headers={
                    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="User not found")
            
            user_data = response.json()
            
            return UserProfile(
                user_id=user_data["id"],
                email=user_data["email_addresses"][0]["email_address"],
                first_name=user_data.get("first_name"),
                last_name=user_data.get("last_name"),
                phone=user_data.get("phone_numbers", [{}])[0].get("phone_number") if user_data.get("phone_numbers") else None,
                avatar_url=user_data.get("image_url"),
                role=user_data.get("public_metadata", {}).get("role", "user"),
                preferences=user_data.get("public_metadata", {}).get("preferences", {}),
                created_at=datetime.fromisoformat(user_data["created_at"].replace("Z", "+00:00")),
                last_login=datetime.fromisoformat(user_data["last_sign_in_at"].replace("Z", "+00:00")) if user_data.get("last_sign_in_at") else datetime.utcnow()
            )
            
    except Exception as e:
        logger.error(f"Failed to get user profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get user profile")

@router.post("/register", response_model=AuthResponse)
async def register_user(request: RegisterRequest):
    """Register a new user"""
    try:
        # Create user in Clerk
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{CLERK_API_URL}/users",
                headers={
                    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "email_address": [request.email],
                    "password": request.password,
                    "first_name": request.first_name,
                    "last_name": request.last_name,
                    "phone_number": request.phone,
                    "public_metadata": {
                        "role": request.role,
                        "preferences": {}
                    }
                }
            )
            
            if response.status_code != 201:
                error_data = response.json()
                raise HTTPException(status_code=400, detail=error_data.get("errors", ["Registration failed"]))
            
            user_data = response.json()
            
            # Create session for immediate login
            session_response = await client.post(
                f"{CLERK_API_URL}/sessions",
                headers={
                    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "user_id": user_data["id"],
                    "duration": 60 * 60 * 24 * 7  # 7 days
                }
            )
            
            if session_response.status_code != 201:
                raise HTTPException(status_code=500, detail="Failed to create session")
            
            session_data = session_response.json()
            
            user_profile = UserProfile(
                user_id=user_data["id"],
                email=request.email,
                first_name=request.first_name,
                last_name=request.last_name,
                phone=request.phone,
                role=request.role,
                created_at=datetime.utcnow(),
                last_login=datetime.utcnow()
            )
            
            return AuthResponse(
                access_token=session_data["id"],
                refresh_token=session_data.get("refresh_token", ""),
                user=user_profile,
                expires_in=60 * 60 * 24 * 7
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login", response_model=AuthResponse)
async def login_user(request: LoginRequest):
    """Login user with email and password"""
    try:
        # Authenticate with Clerk
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{CLERK_API_URL}/sessions/authenticate",
                headers={
                    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "identifier": request.email,
                    "password": request.password
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid credentials")
            
            auth_data = response.json()
            user_id = auth_data["user_id"]
            
            # Get user profile
            user_response = await client.get(
                f"{CLERK_API_URL}/users/{user_id}",
                headers={
                    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            if user_response.status_code != 200:
                raise HTTPException(status_code=404, detail="User not found")
            
            user_data = user_response.json()
            
            user_profile = UserProfile(
                user_id=user_data["id"],
                email=user_data["email_addresses"][0]["email_address"],
                first_name=user_data.get("first_name"),
                last_name=user_data.get("last_name"),
                phone=user_data.get("phone_numbers", [{}])[0].get("phone_number") if user_data.get("phone_numbers") else None,
                avatar_url=user_data.get("image_url"),
                role=user_data.get("public_metadata", {}).get("role", "user"),
                preferences=user_data.get("public_metadata", {}).get("preferences", {}),
                created_at=datetime.fromisoformat(user_data["created_at"].replace("Z", "+00:00")),
                last_login=datetime.utcnow()
            )
            
            return AuthResponse(
                access_token=auth_data["id"],
                refresh_token=auth_data.get("refresh_token", ""),
                user=user_profile,
                expires_in=60 * 60 * 24 * 7
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: UserProfile = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    updates: Dict[str, Any],
    current_user: UserProfile = Depends(get_current_user)
):
    """Update user profile"""
    try:
        # Update user in Clerk
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{CLERK_API_URL}/users/{current_user.user_id}",
                headers={
                    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                    "Content-Type": "application/json"
                },
                json=updates
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to update profile")
            
            # Return updated profile
            updated_profile = current_user.dict()
            updated_profile.update(updates)
            return UserProfile(**updated_profile)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.post("/logout")
async def logout_user(current_user: UserProfile = Depends(get_current_user)):
    """Logout user (revoke session)"""
    try:
        # In a real implementation, you would revoke the session
        # For now, we'll just return success
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Logout failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Logout failed")

@router.get("/verify")
async def verify_authentication(current_user: UserProfile = Depends(get_current_user)):
    """Verify if user is authenticated"""
    return {
        "authenticated": True,
        "user_id": current_user.user_id,
        "role": current_user.role
    }
