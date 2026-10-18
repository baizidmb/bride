import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base = "http://localhost:3001"

# 1. Test GET /
try:
    with urllib.request.urlopen(f"{base}/") as resp:
        print("GET / status:", resp.status)
        html = resp.read().decode('utf-8')
        print("HTML length:", len(html), "Contains root div:", 'id="root"' in html)
except Exception as e:
    print("GET / error:", e)

# 2. Test GET /api/locations
try:
    with urllib.request.urlopen(f"{base}/api/locations") as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("GET /api/locations success:", data.get('success'), "Divisions count:", len(data.get('divisions', [])))
except Exception as e:
    print("GET /api/locations error:", e)

# 3. Test POST /api/search?page=1&limit=2
try:
    req = urllib.request.Request(
        f"{base}/api/search?page=1&limit=2",
        data=json.dumps({"filters": {}}).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        items = data.get('data', {}).get('data', [])
        pagination = data.get('data', {}).get('pagination', {})
        print("POST /api/search status: success! Items count:", len(items), "Total brides:", pagination.get('total'))
        if items:
            sample = items[0]
            print(f"Sample Bride Lead #{sample.get('biodata_no')}: Age={sample.get('age')}, Gender={sample.get('gender')}")
            # Test 4. GET /api/biodata/:id
            b_no = sample.get('biodata_no')
            with urllib.request.urlopen(f"{base}/api/biodata/{b_no}") as b_resp:
                b_data = json.loads(b_resp.read().decode('utf-8'))
                print(f"GET /api/biodata/{b_no} status: success={b_data.get('success')}, keys={list(b_data.get('data', {}).keys())[:6]}")
except Exception as e:
    print("POST /api/search error:", e)

# 5. Test POST /api/leads (Save lead)
try:
    test_lead = {
        "biodata_no": 24590,
        "status": "shortlisted",
        "rating": 5,
        "notes": "Highly educated, religious family in Dhaka. Follow up next week.",
        "tags": ["Dhaka", "Alia", "Priority"],
        "contact_info": {
            "name": "Father",
            "phone": "01712345678",
            "relation": "Father"
        }
    }
    req = urllib.request.Request(
        f"{base}/api/leads",
        data=json.dumps(test_lead).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("POST /api/leads success:", data.get('success'), "Lead stored:", data.get('lead', {}).get('biodata_no'))
except Exception as e:
    print("POST /api/leads error:", e)

# 6. Test GET /api/leads
try:
    with urllib.request.urlopen(f"{base}/api/leads") as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("GET /api/leads success:", data.get('success'), "Total saved leads:", len(data.get('data', [])))
except Exception as e:
    print("GET /api/leads error:", e)
