#!/usr/bin/env python3
"""
CarrierIQ Backend Integration Test Suite

Tests all API endpoints with sample data.
Run: python test_backend.py
"""

import json
import requests
import time
from pathlib import Path

BASE_URL = "http://localhost:8000"
TIMEOUT = 10

# ANSI color codes
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

def print_test(name, success, details=""):
    """Print test result with color."""
    status = f"{GREEN}✓ PASS{RESET}" if success else f"{RED}✗ FAIL{RESET}"
    print(f"{status} {name}")
    if details:
        print(f"  {BLUE}→{RESET} {details}")

def test_health():
    """Test: Health endpoint."""
    try:
        resp = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        success = resp.status_code == 200 and "status" in resp.json()
        print_test("Health Check", success, f"Status: {resp.status_code}")
        return success
    except Exception as e:
        print_test("Health Check", False, str(e))
        return False

def test_sample_carriers():
    """Test: Fetch sample carriers."""
    try:
        resp = requests.get(f"{BASE_URL}/api/carriers", timeout=TIMEOUT)
        if resp.status_code == 200:
            carriers = resp.json()
            success = len(carriers) > 0
            print_test("Fetch Carriers", success, f"Found {len(carriers)} carriers")
            return success
        else:
            print_test("Fetch Carriers", False, f"Status: {resp.status_code}")
            return False
    except Exception as e:
        print_test("Fetch Carriers", False, str(e))
        return False

def test_score_endpoint():
    """Test: Score carriers endpoint."""
    payload = {
        "lane": "Mumbai → Delhi",
        "carriers": [
            {
                "id": "C001",
                "name": "TransCo Express",
                "otd_rate": 0.96,
                "damage_rate": 0.002,
                "capacity_utilization": 0.78,
                "price_per_kg": 2.50,
                "avg_transit_days": 3,
                "claim_resolution_days": 5,
                "invoice_accuracy": 0.98,
                "years_in_operation": 12
            },
            {
                "id": "C002",
                "name": "Logistics Prime",
                "otd_rate": 0.92,
                "damage_rate": 0.005,
                "capacity_utilization": 0.65,
                "price_per_kg": 2.10,
                "avg_transit_days": 4,
                "claim_resolution_days": 7,
                "invoice_accuracy": 0.95,
                "years_in_operation": 8
            }
        ],
        "priorities": {
            "cost": 0.40,
            "reliability": 0.35,
            "speed": 0.15,
            "quality": 0.10
        }
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/api/score", json=payload, timeout=TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            success = "rankings" in data and len(data.get("rankings", [])) > 0
            rankings = data.get("rankings", [])
            print_test("Score Carriers", success, 
                      f"Top carrier: {rankings[0]['name'] if rankings else 'N/A'} (score: {rankings[0].get('score_pct', 0):.1f}%)")
            return success
        else:
            print_test("Score Carriers", False, f"Status: {resp.status_code}")
            return False
    except Exception as e:
        print_test("Score Carriers", False, str(e))
        return False

def test_stream_endpoint():
    """Test: Stream agent debate endpoint."""
    payload = {
        "lane": "Mumbai → Delhi",
        "carriers": [
            {
                "id": "C001",
                "name": "TransCo Express",
                "otd_rate": 0.96,
                "damage_rate": 0.002,
                "capacity_utilization": 0.78,
                "price_per_kg": 2.50,
                "avg_transit_days": 3,
                "claim_resolution_days": 5,
                "invoice_accuracy": 0.98,
                "years_in_operation": 12
            }
        ],
        "priorities": {
            "cost": 0.40,
            "reliability": 0.35,
            "speed": 0.15,
            "quality": 0.10
        }
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/api/score/stream", json=payload, timeout=TIMEOUT, stream=True)
        if resp.status_code == 200:
            events = []
            for line in resp.iter_lines():
                if line and line.startswith(b"data: "):
                    try:
                        event = json.loads(line[6:])
                        events.append(event.get("type", "unknown"))
                    except:
                        pass
            
            success = len(events) > 0
            event_types = ", ".join(set(events[:3]))
            print_test("Stream Debate", success, f"Events: {event_types}...")
            return success
        else:
            print_test("Stream Debate", False, f"Status: {resp.status_code}")
            return False
    except Exception as e:
        print_test("Stream Debate", False, str(e))
        return False

def test_explain_endpoint():
    """Test: Explain carrier endpoint."""
    try:
        resp = requests.get(f"{BASE_URL}/api/explain/C001", timeout=TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            success = "carrier_id" in data and "score" in data
            score = data.get("score", 0)
            print_test("Explain Carrier", success, f"Score: {score:.1f}, Features: {len(data.get('features', {}))}")
            return success
        else:
            print_test("Explain Carrier", False, f"Status: {resp.status_code}")
            return False
    except Exception as e:
        print_test("Explain Carrier", False, str(e))
        return False

def test_research_endpoint():
    """Test: Research endpoint."""
    try:
        resp = requests.get(f"{BASE_URL}/api/research/C001", timeout=TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            success = "carrier_id" in data
            print_test("Research Carrier", success, "Live data stub")
            return success
        else:
            print_test("Research Carrier", False, f"Status: {resp.status_code}")
            return False
    except Exception as e:
        print_test("Research Carrier", False, str(e))
        return False

def test_feedback_endpoint():
    """Test: Feedback submission endpoint."""
    payload = {
        "lane": "Mumbai → Delhi",
        "awarded_carrier_id": "C001",
        "decision_rationale": "Highest score with low risk",
        "actual_outcome": {
            "otd_pct": 96.5,
            "damage_rate": 0.001,
            "cost_actual": 2.45
        },
        "feedback_text": "Excellent performance"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/api/feedback", json=payload, timeout=TIMEOUT)
        if resp.status_code == 200 or resp.status_code == 201:
            data = resp.json()
            success = "status" in data
            print_test("Submit Feedback", success, f"Response: {data.get('message', data.get('status'))}")
            return success
        else:
            print_test("Submit Feedback", False, f"Status: {resp.status_code}")
            return False
    except Exception as e:
        print_test("Submit Feedback", False, str(e))
        return False

def main():
    """Run all tests."""
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}CarrierIQ Backend Integration Test Suite{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    # Check if server is running
    print(f"{YELLOW}Connecting to {BASE_URL}...{RESET}")
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
    except:
        print(f"{RED}✗ Server not responding at {BASE_URL}{RESET}")
        print(f"{YELLOW}Start the server with: uvicorn backend.main:app --reload{RESET}\n")
        return
    
    print(f"{GREEN}Connected! Running tests...{RESET}\n")
    
    # Run tests
    results = []
    results.append(test_health())
    results.append(test_sample_carriers())
    results.append(test_score_endpoint())
    results.append(test_explain_endpoint())
    results.append(test_research_endpoint())
    results.append(test_feedback_endpoint())
    results.append(test_stream_endpoint())
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print(f"\n{BLUE}{'='*60}{RESET}")
    if passed == total:
        print(f"{GREEN}✓ All {total} tests passed!{RESET}")
    else:
        print(f"{RED}✗ {total - passed} of {total} tests failed{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    # Next steps
    if passed == total:
        print(f"{YELLOW}Next Steps:{RESET}")
        print("1. Start the frontend: cd frontend && npm run dev")
        print("2. Visit: http://localhost:5173")
        print("3. Test the dashboard with real API responses")
        print()

if __name__ == "__main__":
    main()
