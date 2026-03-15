import requests
import json
import time

time.sleep(2)

# Test with minimal params
r = requests.post('http://localhost:8000/api/score/ticket', json={'lane': 'Test'})
print(f'Status: {r.status_code}')
resp = r.json()
print(json.dumps(resp, indent=2))

if r.status_code == 200:
    print("\n✅ FIXED: Endpoint now accepts optional parameters!")
else:
    print(f"\n❌ Still failing with status {r.status_code}")
