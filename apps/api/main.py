from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Sentry
if os.getenv("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0,
        environment=os.getenv("APP_ENV", "development")
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Holiday AI Planner API...")
    
    # Initialize API key manager and run startup checks
    try:
        from config.api_keys import api_key_manager
        
        # Check for missing required keys
        missing_required = api_key_manager.get_missing_required_keys()
        if missing_required:
            print("⚠️  WARNING: Missing required API keys:")
            for key in missing_required:
                print(f"   - {key.value}")
            print("   Platform will run with limited functionality")
            print("   Visit /api/system/env-template for configuration help")
        
        # Validate configured keys (non-blocking)
        print("🔑 Validating configured API keys...")
        validation_results = await api_key_manager.validate_all_keys()
        
        valid_keys = sum(1 for r in validation_results.values() if r["is_valid"])
        total_keys = len(validation_results)
        print(f"   ✅ {valid_keys}/{total_keys} API keys validated successfully")
        
        if valid_keys >= 3:
            print("🎯 Platform ready for operation!")
        else:
            print("⚠️  Limited functionality - configure more API keys for full features")
            
    except Exception as e:
        print(f"❌ Startup validation failed: {e}")
        print("   Platform will start but may have limited functionality")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Holiday AI Planner API...")

# Create FastAPI app
app = FastAPI(
    title="Holiday AI Planner API",
    description="AI-first, one-stop travel OS for individuals, travel agents, and Umrah/halal travel",
    version="0.1.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3010",  # Web app - Updated port
        "http://localhost:3004",  # Alternative web port
        "http://localhost:3000",  # Alternative web port
        "http://127.0.0.1:3010", # Web app - Updated port
        "http://127.0.0.1:3004", # Alternative web port
        "http://127.0.0.1:3000", # Alternative web port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.vercel.app", "*.netlify.app"]
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "holiday-ai-planner-api",
        "version": "0.1.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Holiday AI Planner API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health",
        "features": [
            "Travel Planning",
            "Umrah Packages", 
            "B2B Agent Dashboard",
            "User Authentication",
            "AI-Powered Recommendations"
        ]
    }

# Import and include routers
from routes import top10, planning, system, payments, cache, flights, hotels
from app.routers import umrah, auth, agents

app.include_router(system.router)  # System management routes
app.include_router(cache.router)  # Cache management routes
app.include_router(payments.router)  # Payment processing routes
app.include_router(flights.router)  # Flight search routes
app.include_router(hotels.router)  # Hotel search routes
app.include_router(top10.router)
app.include_router(planning.router)
app.include_router(umrah.router)
app.include_router(auth.router)
app.include_router(agents.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
