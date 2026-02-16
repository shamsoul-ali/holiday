from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime, date
import logging
from app.routers.auth import get_current_user, UserProfile

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/agents", tags=["Travel Agents"])

class Client(BaseModel):
    client_id: str
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    total_bookings: int = 0
    total_spent: float = 0.0
    currency: str = "MYR"
    created_at: datetime
    last_booking: Optional[datetime] = None
    preferences: Dict[str, Any] = {}

class Booking(BaseModel):
    booking_id: str
    client_id: str
    agent_id: str
    trip_type: str  # "leisure", "business", "umrah", "group"
    destination: str
    start_date: date
    end_date: date
    passengers: int
    total_amount: float
    currency: str = "MYR"
    commission_rate: float
    commission_amount: float
    status: str  # "pending", "confirmed", "cancelled", "completed"
    created_at: datetime
    updated_at: datetime
    notes: Optional[str] = None

class CommissionReport(BaseModel):
    agent_id: str
    period: str  # "daily", "weekly", "monthly", "yearly"
    start_date: date
    end_date: date
    total_bookings: int
    total_revenue: float
    total_commission: float
    currency: str = "MYR"
    top_destinations: List[Dict[str, Any]]
    top_clients: List[Dict[str, Any]]

class BulkBookingRequest(BaseModel):
    client_ids: List[str]
    trip_type: str
    destination: str
    start_date: date
    end_date: date
    passengers_per_booking: int
    package_type: str  # "budget", "comfort", "luxury"
    special_requirements: Optional[List[str]] = None

class AgentDashboard(BaseModel):
    agent_id: str
    total_clients: int
    total_bookings: int
    total_revenue: float
    total_commission: float
    currency: str = "MYR"
    recent_bookings: List[Booking]
    top_clients: List[Client]
    pending_approvals: int
    monthly_trends: Dict[str, Any]

# Mock data for development
MOCK_CLIENTS = [
    Client(
        client_id="CL001",
        name="Ahmad Rahman",
        email="ahmad@company.com",
        phone="+60123456789",
        company="Tech Solutions Sdn Bhd",
        total_bookings=15,
        total_spent=45000.0,
        currency="MYR",
        created_at=datetime(2024, 1, 15),
        last_booking=datetime(2025, 8, 20),
        preferences={"halal": True, "family": True, "budget": "comfort"}
    ),
    Client(
        client_id="CL002",
        name="Sarah Lim",
        email="sarah@travelgroup.com",
        phone="+60187654321",
        company="Corporate Travel Group",
        total_bookings=28,
        total_spent=89000.0,
        currency="MYR",
        created_at=datetime(2023, 6, 10),
        last_booking=datetime(2025, 8, 18),
        preferences={"luxury": True, "business": True, "flexible": True}
    )
]

MOCK_BOOKINGS = [
    Booking(
        booking_id="BK001",
        client_id="CL001",
        agent_id="AG001",
        trip_type="leisure",
        destination="Bangkok, Thailand",
        start_date=date(2025, 12, 15),
        end_date=date(2025, 12, 19),
        passengers=4,
        total_amount=5600.0,
        currency="MYR",
        commission_rate=0.15,
        commission_amount=840.0,
        status="confirmed",
        created_at=datetime(2025, 8, 20),
        updated_at=datetime(2025, 8, 20),
        notes="Family trip, halal food required"
    ),
    Booking(
        booking_id="BK002",
        client_id="CL002",
        agent_id="AG001",
        trip_type="business",
        destination="Singapore",
        start_date=date(2025, 11, 10),
        end_date=date(2025, 11, 12),
        passengers=2,
        total_amount=3200.0,
        currency="MYR",
        commission_rate=0.12,
        commission_amount=384.0,
        status="confirmed",
        created_at=datetime(2025, 8, 18),
        updated_at=datetime(2025, 8, 18),
        notes="Business meeting, 5-star hotel preferred"
    )
]

@router.get("/dashboard", response_model=AgentDashboard)
async def get_agent_dashboard(
    current_user: UserProfile = Depends(get_current_user),
    period: str = Query("monthly", description="Report period")
):
    """Get agent dashboard with key metrics"""
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Agent role required.")
    
    try:
        # Calculate dashboard metrics
        total_clients = len(MOCK_CLIENTS)
        total_bookings = len(MOCK_BOOKINGS)
        total_revenue = sum(booking.total_amount for booking in MOCK_BOOKINGS)
        total_commission = sum(booking.commission_amount for booking in MOCK_BOOKINGS)
        pending_approvals = len([b for b in MOCK_BOOKINGS if b.status == "pending"])
        
        # Get recent bookings
        recent_bookings = sorted(MOCK_BOOKINGS, key=lambda x: x.created_at, reverse=True)[:5]
        
        # Get top clients by revenue
        top_clients = sorted(MOCK_CLIENTS, key=lambda x: x.total_spent, reverse=True)[:3]
        
        # Monthly trends (mock data)
        monthly_trends = {
            "bookings": [12, 15, 18, 22, 25, 28, 30, 32],
            "revenue": [45000, 52000, 61000, 68000, 72000, 78000, 82000, 89000],
            "commission": [6750, 7800, 9150, 10200, 10800, 11700, 12300, 13350]
        }
        
        return AgentDashboard(
            agent_id=current_user.user_id,
            total_clients=total_clients,
            total_bookings=total_bookings,
            total_revenue=total_revenue,
            total_commission=total_commission,
            currency="MYR",
            recent_bookings=recent_bookings,
            top_clients=top_clients,
            pending_approvals=pending_approvals,
            monthly_trends=monthly_trends
        )
        
    except Exception as e:
        logger.error(f"Failed to get agent dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard")

@router.get("/clients", response_model=List[Client])
async def get_agent_clients(
    current_user: UserProfile = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Search by name or email"),
    company: Optional[str] = Query(None, description="Filter by company")
):
    """Get list of agent's clients"""
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Agent role required.")
    
    try:
        clients = MOCK_CLIENTS.copy()
        
        # Apply search filter
        if search:
            search_lower = search.lower()
            clients = [
                c for c in clients 
                if search_lower in c.name.lower() or search_lower in c.email.lower()
            ]
        
        # Apply company filter
        if company:
            company_lower = company.lower()
            clients = [
                c for c in clients 
                if c.company and company_lower in c.company.lower()
            ]
        
        return clients
        
    except Exception as e:
        logger.error(f"Failed to get agent clients: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get clients")

@router.get("/clients/{client_id}", response_model=Client)
async def get_client_details(
    client_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """Get detailed client information"""
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Agent role required.")
    
    try:
        client = next((c for c in MOCK_CLIENTS if c.client_id == client_id), None)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        return client
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get client details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get client details")

@router.post("/clients", response_model=Client)
async def create_client(
    client_data: Client,
    current_user: UserProfile = Depends(get_current_user)
):
    """Create a new client"""
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Agent role required.")
    
    try:
        # Generate new client ID
        new_client_id = f"CL{len(MOCK_CLIENTS) + 1:03d}"
        
        new_client = Client(
            client_id=new_client_id,
            name=client_data.name,
            email=client_data.email,
            phone=client_data.phone,
            company=client_data.company,
            preferences=client_data.preferences,
            created_at=datetime.utcnow()
        )
        
        MOCK_CLIENTS.append(new_client)
        return new_client
        
    except Exception as e:
        logger.error(f"Failed to create client: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create client")

@router.get("/bookings", response_model=List[Booking])
async def get_agent_bookings(
    current_user: UserProfile = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter by booking status"),
    client_id: Optional[str] = Query(None, description="Filter by client"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date")
):
    """Get list of agent's bookings"""
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Agent role required.")
    
    try:
        bookings = [b for b in MOCK_BOOKINGS if b.agent_id == current_user.user_id]
        
        # Apply filters
        if status:
            bookings = [b for b in bookings if b.status == status]
        
        if client_id:
            bookings = [b for b in bookings if b.client_id == client_id]
        
        if start_date:
            bookings = [b for b in bookings if b.start_date >= start_date]
        
        if end_date:
            bookings = [b for b in bookings if b.end_date <= end_date]
        
        return sorted(bookings, key=lambda x: x.created_at, reverse=True)
        
    except Exception as e:
        logger.error(f"Failed to get agent bookings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get bookings")

@router.post("/bookings/bulk", response_model=List[Booking])
async def create_bulk_bookings(
    request: BulkBookingRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """Create multiple bookings for different clients"""
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Agent role required.")
    
    try:
        new_bookings = []
        
        for i, client_id in enumerate(request.client_ids):
            # Generate booking ID
            booking_id = f"BK{len(MOCK_BOOKINGS) + i + 1:03d}"
            
            # Calculate commission based on package type
            base_amount = 2000.0  # Mock base amount
            if request.package_type == "comfort":
                base_amount = 3000.0
            elif request.package_type == "luxury":
                base_amount = 5000.0
            
            total_amount = base_amount * request.passengers_per_booking
            commission_rate = 0.15 if request.package_type == "luxury" else 0.12
            commission_amount = total_amount * commission_rate
            
            new_booking = Booking(
                booking_id=booking_id,
                client_id=client_id,
                agent_id=current_user.user_id,
                trip_type=request.trip_type,
                destination=request.destination,
                start_date=request.start_date,
                end_date=request.end_date,
                passengers=request.passengers_per_booking,
                total_amount=total_amount,
                currency="MYR",
                commission_rate=commission_rate,
                commission_amount=commission_amount,
                status="pending",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                notes=f"Bulk booking - {request.package_type} package"
            )
            
            new_bookings.append(new_booking)
            MOCK_BOOKINGS.append(new_booking)
        
        return new_bookings
        
    except Exception as e:
        logger.error(f"Failed to create bulk bookings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create bulk bookings")

@router.get("/commission", response_model=CommissionReport)
async def get_commission_report(
    current_user: UserProfile = Depends(get_current_user),
    period: str = Query("monthly", description="Report period"),
    start_date: Optional[date] = Query(None, description="Custom start date"),
    end_date: Optional[date] = Query(None, description="Custom end date")
):
    """Get commission report for the agent"""
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Agent role required.")
    
    try:
        # Filter bookings by agent and date range
        agent_bookings = [b for b in MOCK_BOOKINGS if b.agent_id == current_user.user_id]
        
        if start_date:
            agent_bookings = [b for b in agent_bookings if b.start_date >= start_date]
        
        if end_date:
            agent_bookings = [b for b in agent_bookings if b.end_date <= end_date]
        
        # Calculate totals
        total_bookings = len(agent_bookings)
        total_revenue = sum(b.total_amount for b in agent_bookings)
        total_commission = sum(b.commission_amount for b in agent_bookings)
        
        # Top destinations
        destination_counts = {}
        for booking in agent_bookings:
            destination_counts[booking.destination] = destination_counts.get(booking.destination, 0) + 1
        
        top_destinations = [
            {"destination": dest, "bookings": count}
            for dest, count in sorted(destination_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        # Top clients
        client_revenue = {}
        for booking in agent_bookings:
            client_revenue[booking.client_id] = client_revenue.get(booking.client_id, 0) + booking.total_amount
        
        top_clients = [
            {"client_id": client_id, "revenue": revenue}
            for client_id, revenue in sorted(client_revenue.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        return CommissionReport(
            agent_id=current_user.user_id,
            period=period,
            start_date=start_date or date(2025, 1, 1),
            end_date=end_date or date(2025, 12, 31),
            total_bookings=total_bookings,
            total_revenue=total_revenue,
            total_commission=total_commission,
            currency="MYR",
            top_destinations=top_destinations,
            top_clients=top_clients
        )
        
    except Exception as e:
        logger.error(f"Failed to get commission report: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get commission report")

@router.put("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    status: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """Update booking status"""
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Agent role required.")
    
    try:
        booking = next((b for b in MOCK_BOOKINGS if b.booking_id == booking_id), None)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking.agent_id != current_user.user_id and current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Can only update own bookings")
        
        # Validate status
        valid_statuses = ["pending", "confirmed", "cancelled", "completed"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        booking.status = status
        booking.updated_at = datetime.utcnow()
        
        return {"message": f"Booking status updated to {status}", "booking_id": booking_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update booking status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update booking status")

@router.get("/analytics")
async def get_agent_analytics(
    current_user: UserProfile = Depends(get_current_user),
    period: str = Query("monthly", description="Analytics period")
):
    """Get comprehensive analytics for the agent"""
    if current_user.role not in ["agent", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied. Agent role required.")
    
    try:
        agent_bookings = [b for b in MOCK_BOOKINGS if b.agent_id == current_user.user_id]
        
        # Revenue trends
        monthly_revenue = {}
        for booking in agent_bookings:
            month_key = f"{booking.start_date.year}-{booking.start_date.month:02d}"
            monthly_revenue[month_key] = monthly_revenue.get(month_key, 0) + booking.total_amount
        
        # Top performing months
        top_months = sorted(monthly_revenue.items(), key=lambda x: x[1], reverse=True)[:6]
        
        # Client retention rate
        total_clients = len(set(b.client_id for b in agent_bookings))
        repeat_clients = len([c for c in MOCK_CLIENTS if c.total_bookings > 1])
        retention_rate = (repeat_clients / total_clients * 100) if total_clients > 0 else 0
        
        # Average booking value
        avg_booking_value = sum(b.total_amount for b in agent_bookings) / len(agent_bookings) if agent_bookings else 0
        
        return {
            "agent_id": current_user.user_id,
            "period": period,
            "total_bookings": len(agent_bookings),
            "total_revenue": sum(b.total_amount for b in agent_bookings),
            "total_commission": sum(b.commission_amount for b in agent_bookings),
            "monthly_revenue_trends": top_months,
            "client_retention_rate": round(retention_rate, 2),
            "average_booking_value": round(avg_booking_value, 2),
            "top_destinations": list(set(b.destination for b in agent_bookings)),
            "booking_status_distribution": {
                status: len([b for b in agent_bookings if b.status == status])
                for status in ["pending", "confirmed", "cancelled", "completed"]
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get agent analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get analytics")
