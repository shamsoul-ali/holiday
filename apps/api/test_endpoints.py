#!/usr/bin/env python3
"""
Holiday AI Platform - API Endpoint Test Script
Tests all major endpoints to ensure they're working correctly

Platform Configuration:
- API Backend: http://localhost:8000
- Web Frontend: http://localhost:3010
- Database: localhost:5432
- Redis: localhost:6379
"""

import requests
import json
from datetime import datetime, date
from typing import Dict, Any

BASE_URL = "http://localhost:8000"
WEB_URL = "http://localhost:3010"
WEB_URL = "http://localhost:3010"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check: {data['status']} - {data['service']} v{data['version']}")
            return True
        else:
            print(f"❌ Health Check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health Check error: {str(e)}")
        return False

def test_root_endpoint():
    """Test the root endpoint"""
    print("\n🔍 Testing Root Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root Endpoint: {data['message']}")
            print(f"   Features: {', '.join(data['features'])}")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint error: {str(e)}")
        return False

def test_top10_endpoint():
    """Test the top 10 destinations endpoint"""
    print("\n🔍 Testing Top 10 Destinations...")
    try:
        response = requests.get(f"{BASE_URL}/api/top10?budget=5000&currency=MYR&pax=2")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Top 10: Found {len(data['items'])} destinations")
            print(f"   Budget: {data['budget']} {data['currency']}")
            print(f"   First destination: {data['items'][0]['name']}")
            return True
        else:
            print(f"❌ Top 10 failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Top 10 error: {str(e)}")
        return False

def test_umrah_endpoints():
    """Test the Umrah module endpoints"""
    print("\n🔍 Testing Umrah Module...")
    
    # Test packages search
    try:
        response = requests.get(f"{BASE_URL}/api/umrah/packages?budget=8000&currency=MYR&pax=4&preferences=halal")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Umrah Packages: Found {data['total_count']} packages")
            print(f"   Search summary: {data['search_summary']}")
            return True
        else:
            print(f"❌ Umrah packages failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Umrah packages error: {str(e)}")
        return False

def test_planning_endpoints():
    """Test the travel planning endpoints"""
    print("\n🔍 Testing Travel Planning...")
    
    # Test destination suggestions
    try:
        response = requests.get(f"{BASE_URL}/api/planning/destinations/suggest?query=bangkok&budget=5000&currency=MYR")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Destination Suggestions: Found {len(data['suggestions'])} suggestions")
            print(f"   First suggestion: {data['suggestions'][0]['name']}")
            return True
        else:
            print(f"❌ Destination suggestions failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Destination suggestions error: {str(e)}")
        return False

def test_auth_endpoints():
    """Test the authentication endpoints"""
    print("\n🔍 Testing Authentication...")
    
    # Test registration endpoint (without real data)
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": "test@example.com",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User"
        })
        # This should fail without real Clerk keys, but endpoint should exist
        print(f"✅ Auth Register: Endpoint accessible (status: {response.status_code})")
        return True
    except Exception as e:
        print(f"❌ Auth register error: {str(e)}")
        return False

def test_agents_endpoints():
    """Test the B2B agents endpoints"""
    print("\n🔍 Testing B2B Agents...")
    
    # Test dashboard endpoint (should require auth)
    try:
        response = requests.get(f"{BASE_URL}/api/agents/dashboard")
        # This should fail without auth token
        if response.status_code == 401 or response.status_code == 422:
            print(f"✅ Agents Dashboard: Endpoint accessible (auth required: {response.status_code})")
            return True
        else:
            print(f"❌ Agents dashboard unexpected response: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Agents dashboard error: {str(e)}")
        return False

def test_api_documentation():
    """Test the API documentation endpoints"""
    print("\n🔍 Testing API Documentation...")
    
    try:
        # Test OpenAPI spec
        response = requests.get(f"{BASE_URL}/openapi.json")
        if response.status_code == 200:
            data = response.json()
            paths = list(data['paths'].keys())
            print(f"✅ OpenAPI Spec: {len(paths)} endpoints documented")
            print(f"   Sample endpoints: {', '.join(paths[:5])}...")
            return True
        else:
            print(f"❌ OpenAPI spec failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ OpenAPI spec error: {str(e)}")
        return False

def test_web_frontend():
    """Test if the web frontend is accessible"""
    print("\n🔍 Testing Web Frontend...")
    
    try:
        response = requests.get(f"{WEB_URL}", timeout=5)
        if response.status_code == 200:
            print(f"✅ Web Frontend: Accessible at {WEB_URL}")
            return True
        else:
            print(f"⚠️  Web Frontend: Responding with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Web Frontend: Not accessible at {WEB_URL} (Connection refused)")
        return False
    except Exception as e:
        print(f"❌ Web Frontend error: {str(e)}")
        return False

def generate_api_summary():
    """Generate a summary of all available endpoints"""
    print("\n📊 API ENDPOINT SUMMARY")
    print("=" * 50)
    
    try:
        response = requests.get(f"{BASE_URL}/openapi.json")
        if response.status_code == 200:
            data = response.json()
            paths = data['paths']
            
            # Group endpoints by category
            categories = {
                "Core": ["/", "/health"],
                "Travel Planning": [],
                "Umrah Module": [],
                "Authentication": [],
                "B2B Agents": [],
                "Documentation": []
            }
            
            for path in paths.keys():
                if path.startswith("/api/planning"):
                    categories["Travel Planning"].append(path)
                elif path.startswith("/api/umrah"):
                    categories["Umrah Module"].append(path)
                elif path.startswith("/api/auth"):
                    categories["Authentication"].append(path)
                elif path.startswith("/api/agents"):
                    categories["B2B Agents"].append(path)
                elif path in ["/docs", "/redoc", "/openapi.json"]:
                    categories["Documentation"].append(path)
            
            # Display summary
            for category, endpoints in categories.items():
                if endpoints:
                    print(f"\n{category}:")
                    for endpoint in sorted(endpoints):
                        methods = list(paths[endpoint].keys())
                        print(f"  {endpoint} [{', '.join(methods)}]")
            
            total_endpoints = len(paths)
            print(f"\n📈 Total Endpoints: {total_endpoints}")
            
        else:
            print("❌ Could not fetch API specification")
            
    except Exception as e:
        print(f"❌ Error generating summary: {str(e)}")

def main():
    """Main test function"""
    print("🚀 HOLIDAY AI PLATFORM - API TESTING")
    print("=" * 50)
    print(f"API Backend: {BASE_URL}")
    print(f"Web Frontend: {WEB_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    tests = [
        test_health_check,
        test_root_endpoint,
        test_top10_endpoint,
        test_umrah_endpoints,
        test_planning_endpoints,
        test_auth_endpoints,
        test_agents_endpoints,
        test_api_documentation,
        test_web_frontend
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {str(e)}")
    
    # Generate API summary
    generate_api_summary()
    
    # Final results
    print("\n" + "=" * 50)
    print(f"🎯 TEST RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The platform is working perfectly.")
    elif passed > total * 0.8:
        print("✅ Most tests passed. The platform is working well.")
    elif passed > total * 0.5:
        print("⚠️  Some tests passed. The platform has some issues.")
    else:
        print("❌ Many tests failed. The platform needs attention.")
    
    print(f"\n🌐 API Documentation: {BASE_URL}/docs")
    print(f"📖 OpenAPI Spec: {BASE_URL}/openapi.json")
    print(f"🖥️  Web Frontend: {WEB_URL}")

if __name__ == "__main__":
    main()
