from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import time
import logging

from app.routers import top10, planning, umrah

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Holiday AI Planner API",
    description="AI-powered travel planning and booking platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Include routers
app.include_router(top10.router)
app.include_router(planning.router)
app.include_router(umrah.router)

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>Holiday AI Planner API</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .container { max-width: 800px; margin: 0 auto; }
                .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .method { font-weight: bold; color: #007bff; }
                .url { font-family: monospace; background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Holiday AI Planner API</h1>
                <p>Welcome to the AI-powered travel planning platform!</p>
                
                <h2>📚 API Documentation</h2>
                <p>View the complete API documentation at:</p>
                <ul>
                    <li><a href="/docs">Swagger UI</a> - Interactive API documentation</li>
                    <li><a href="/redoc">ReDoc</a> - Alternative documentation view</li>
                </ul>
                
                <h2>🔗 Available Endpoints</h2>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/health</div>
                    <p>API health check and status</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/api/top10</div>
                    <p>Get top 10 travel destinations based on budget and preferences</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/api/planning/destinations/suggest</div>
                    <p>Get destination suggestions based on query and budget</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/api/planning/flights/search</div>
                    <p>Search for flights with comprehensive filtering</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/api/planning/hotels/search</div>
                    <p>Search for hotels with location and date filtering</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/api/planning/activities/search</div>
                    <p>Search for activities and attractions</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">POST</div>
                    <div class="url">/api/planning/create</div>
                    <p>Create personalized travel itineraries</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/api/umrah/packages</div>
                    <p>Search for Umrah travel packages</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/api/umrah/destinations</div>
                    <p>Get Umrah destinations and details</p>
                </div>
                
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div class="url">/api/umrah/guidelines</div>
                    <p>Get Umrah travel guidelines and requirements</p>
                </div>
                
                <h2>🚀 Quick Start</h2>
                <p>Test the API with these example requests:</p>
                <ul>
                    <li><code>curl "http://localhost:8000/api/top10?budget=5000&currency=MYR&pax=2"</code></li>
                    <li><code>curl "http://localhost:8000/api/umrah/packages?budget=8000&currency=MYR&pax=4&preferences=halal"</code></li>
                </ul>
                
                <h2>🔧 Development</h2>
                <p>This API is built with FastAPI and includes:</p>
                <ul>
                    <li>Comprehensive travel planning endpoints</li>
                    <li>Umrah-specific travel packages</li>
                    <li>Real-time pricing and availability</li>
                    <li>AI-powered recommendations</li>
                    <li>Halal and family-friendly filtering</li>
                </ul>
            </div>
        </body>
    </html>
    """

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "holiday-ai-planner-api",
        "version": "0.1.0"
    }
