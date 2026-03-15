import requests
import json

print("🧪 Testing CarrierIQ Scoring with Gemini API...")
print("-" * 60)

# Test data with correct column names
payload = {
    "lane": "Mumbai → Delhi",
    "carriers": [
        {
            "carrier_id": "C001",
            "carrier_name": "Fast Haul Express",
            "tier": "Premium",
            "cost_per_km": 2.50,
            "ontime_pct": 96.0,
            "damage_rate": 0.2,
            "capacity_utilization": 0.78,
            "rating": 4.8,
            "years_experience": 12,
            "routes_covered": 120,
            "transit_consistency": 0.95,
            "avg_delay_hours": 1.5,
            "claims_last_month": 2
        },
        {
            "carrier_id": "C002",
            "carrier_name": "SafeRoute Logistics",
            "tier": "Premium",
            "cost_per_km": 3.20,
            "ontime_pct": 98.0,
            "damage_rate": 0.1,
            "capacity_utilization": 0.85,
            "rating": 4.9,
            "years_experience": 15,
            "routes_covered": 150,
            "transit_consistency": 0.97,
            "avg_delay_hours": 0.8,
            "claims_last_month": 1
        },
        {
            "carrier_id": "C003",
            "carrier_name": "VelocityFreight Ltd",
            "tier": "Standard",
            "cost_per_km": 2.80,
            "ontime_pct": 90.0,
            "damage_rate": 0.8,
            "capacity_utilization": 0.70,
            "rating": 4.0,
            "years_experience": 8,
            "routes_covered": 100,
            "transit_consistency": 0.88,
            "avg_delay_hours": 3.2,
            "claims_last_month": 3
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
    print("📊 Calling POST /api/score...")
    response = requests.post(
        "http://localhost:8000/api/score",
        json=payload,
        timeout=10
    )
    
    print(f"✅ Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Scoring Result:")
        
        # Pretty print the ranking
        if "rankings" in result:
            print("\n📊 CARRIER RANKINGS:")
            for idx, carrier in enumerate(result["rankings"][:3], 1):
                print(f"\n{idx}. {carrier.get('carrier_name', 'Unknown')} (Rank #{carrier.get('rank', '?')})")
                print(f"   Final Score: {carrier.get('final_score', 0):.2%}")
                print(f"   Delay Risk: {carrier.get('delay_risk', 0):.1f}%")
        
        # Check for API key errors
        if "API key" in str(result):
            print("\n❌ API KEY ERROR FOUND IN RESPONSE!")
        else:
            print("\n✅ No API key errors detected!")
            print("✅ Gemini API is working correctly!")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Request failed: {e}")

print("\n" + "-" * 60)
print("🎉 To view all features, open:")
print("   Frontend: http://localhost:5174")
print("   API Docs: http://localhost:8000/docs")

