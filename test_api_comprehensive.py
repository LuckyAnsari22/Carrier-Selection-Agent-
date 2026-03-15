#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive API Test Suite for CarrierIQ v3
Tests all endpoints to ensure system is working correctly
"""

import requests
import json
import sys
from datetime import datetime
import io
import os

# Force UTF-8 output
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.buffer)

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def log_test(name, result=True, message=""):
    status = f"{GREEN}✅ PASS{RESET}" if result else f"{RED}❌ FAIL{RESET}"
    print(f"{status} | {name}")
    if message:
        print(f"         {message}")

def log_section(title):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{title}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}")

def test_health():
    """Test health endpoint"""
    log_section("TEST 1: HEALTH CHECK")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        result = response.status_code == 200
        data = response.json()
        
        log_test("Health endpoint reachable", result)
        log_test("API version correct", data.get("version") == "3.0.0")
        log_test("Carriers loaded", data.get("carriers_loaded", 0) > 0, 
                f"Loaded {data.get('carriers_loaded')} carriers")
        log_test("Model trained", data.get("model_trained", False))
        
        return result
    except Exception as e:
        log_test("Health endpoint reachable", False, str(e))
        return False

def test_carriers():
    """Test carriers endpoint"""
    log_section("TEST 2: GET CARRIERS")
    try:
        response = requests.get(f"{API_URL}/carriers", timeout=5)
        result = response.status_code == 200
        data = response.json()
        
        log_test("Carriers endpoint accessible", result)
        log_test("Returns list", isinstance(data, list), f"Got {len(data)} carriers")
        
        if data:
            carrier = data[0]
            required_fields = ['carrier_id', 'carrier_name', 'final_score', 'rank']
            has_fields = all(field in carrier for field in required_fields)
            log_test("Has required fields", has_fields)
        
        return result
    except Exception as e:
        log_test("Carriers endpoint accessible", False, str(e))
        return False

def test_score():
    """Test score endpoint"""
    log_section("TEST 3: SCORE CARRIERS")
    try:
        payload = {"carrier_data": []}
        response = requests.post(f"{API_URL}/score", json=payload, timeout=10)
        result = response.status_code == 200
        data = response.json()
        
        log_test("Score endpoint accessible", result)
        log_test("Returns JSON response", isinstance(data, dict))
        log_test("Has carriers in response", 'carriers' in data, 
                f"Got {len(data.get('carriers', []))} carriers")
        log_test("Has rankings", 'rankings' in data)
        log_test("Has weights", 'weights_used' in data)
        
        if data.get('carriers'):
            top_carrier = data['carriers'][0]
            log_test("Top carrier has score", 'final_score' in top_carrier,
                    f"Score: {top_carrier.get('final_score'):.2f}")
        
        return result
    except Exception as e:
        log_test("Score endpoint accessible", False, str(e))
        return False

def test_explain():
    """Test explain endpoint"""
    log_section("TEST 4: EXPLAIN CARRIER")
    try:
        response = requests.get(f"{API_URL}/explain/CARRIER_001", timeout=5)
        result = response.status_code == 200
        data = response.json()
        
        log_test("Explain endpoint accessible", result)
        log_test("Has features", 'features' in data)
        log_test("Has explanation", 'explanation' in data)
        log_test("Has SHAP contributions", 'contributions' in data)
        
        if 'features' in data:
            log_test("Features are dict", isinstance(data['features'], dict),
                    f"Got {len(data['features'])} features")
        
        return result
    except Exception as e:
        log_test("Explain endpoint accessible", False, str(e))
        return False

def test_research():
    """Test research endpoint"""
    log_section("TEST 5: RESEARCH CARRIER")
    try:
        response = requests.get(f"{API_URL}/research/CARRIER_001", timeout=5)
        result = response.status_code == 200
        data = response.json()
        
        log_test("Research endpoint accessible", result)
        log_test("Returns research data", isinstance(data, dict))
        
        # Check for expected fields
        if isinstance(data, dict):
            has_data = len(data) > 0
            log_test("Has research content", has_data, f"Got {len(data)} fields")
        
        return result
    except Exception as e:
        log_test("Research endpoint accessible", False, str(e))
        return False

def test_feedback():
    """Test feedback endpoint"""
    log_section("TEST 6: FEEDBACK ENDPOINT")
    try:
        payload = {
            "carrier_id": "CARRIER_001",
            "lane": "Mumbai → Delhi",
            "actual_ontime_pct": 92.5,
            "actual_damage_rate": 0.5,
            "actual_cost_per_km": 30.0
        }
        response = requests.post(f"{API_URL}/feedback/", json=payload, timeout=5)
        result = response.status_code in [200, 201]
        
        log_test("Feedback endpoint accessible", result, f"Status: {response.status_code}")
        
        return result
    except Exception as e:
        log_test("Feedback endpoint accessible", False, str(e))
        return False

def test_financial_health():
    """Test financial health endpoint"""
    log_section("TEST 7: FINANCIAL HEALTH")
    try:
        payload = {
            "carrier_id": "CARRIER_001",
            "include_market_noise": True
        }
        response = requests.post(f"{API_URL}/financial_health/", json=payload, timeout=10)
        result = response.status_code == 200
        data = response.json() if result else {}
        
        log_test("Financial health endpoint accessible", result, f"Status: {response.status_code}")
        log_test("Has assessment", 'assessment' in data)
        log_test("Has health score", 'health_score' in data)
        
        return result
    except Exception as e:
        log_test("Financial health endpoint accessible", False, str(e))
        return False

def test_whatif():
    """Test what-if analysis endpoint"""
    log_section("TEST 8: WHAT-IF ANALYSIS")
    try:
        payload = {
            "scenario_name": "MONSOON PROTOCOL",
            "weights": {
                "cost": 20,
                "reliability": 60,
                "speed": 10,
                "quality": 10
            },
            "filters": {
                "max_damage": 1.5
            }
        }
        response = requests.post(f"{API_URL}/whatif/", json=payload, timeout=10)
        result = response.status_code == 200
        data = response.json() if result else {}
        
        log_test("What-if endpoint accessible", result, f"Status: {response.status_code}")
        log_test("Has scenario results", 'baseline_top_5' in data or 'scenario_top_5' in data)
        
        return result
    except Exception as e:
        log_test("What-if endpoint accessible", False, str(e))
        return False

def test_docs():
    """Test Swagger docs"""
    log_section("TEST 9: API DOCUMENTATION")
    try:
        # Test Swagger UI
        response = requests.get(f"{BASE_URL}/docs", timeout=5)
        swagger_ok = response.status_code == 200
        log_test("Swagger UI accessible", swagger_ok)
        
        # Test OpenAPI schema
        response = requests.get(f"{BASE_URL}/openapi.json", timeout=5)
        openapi_ok = response.status_code == 200
        data = response.json()
        
        log_test("OpenAPI schema accessible", openapi_ok)
        log_test("OpenAPI has paths", 'paths' in data, 
                f"Documented {len(data.get('paths', {}))} endpoints")
        
        return swagger_ok and openapi_ok
    except Exception as e:
        log_test("Documentation accessible", False, str(e))
        return False

def main():
    """Run all tests"""
    print(f"\n{BLUE}CarrierIQ v3 - Comprehensive API Test Suite{RESET}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Server: {BASE_URL}\n")
    
    # Track results
    all_tests = [
        test_health,
        test_carriers,
        test_score,
        test_explain,
        test_research,
        test_feedback,
        test_financial_health,
        test_whatif,
        test_docs,
    ]
    
    results = []
    for test in all_tests:
        try:
            results.append(test())
        except Exception as e:
            print(f"{RED}Error running test: {str(e)}{RESET}")
            results.append(False)
    
    # Summary
    log_section("SUMMARY")
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100
    
    print(f"Tests Passed: {passed}/{total} ({percentage:.1f}%)")
    
    if percentage == 100:
        print(f"{GREEN}✅ ALL SYSTEMS OPERATIONAL - READY FOR VIDEO{RESET}")
        return 0
    elif percentage >= 80:
        print(f"{YELLOW}⚠️  MOSTLY WORKING - Some endpoints may need attention{RESET}")
        return 1
    else:
        print(f"{RED}❌ CRITICAL ISSUES - Please check errors above{RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
