import requests
import json

# Test CORS by checking headers
url = "http://localhost:5500/ask"
data = {"query": "Hello"}
headers = {
    "Content-Type": "application/json",
    "Origin": "http://localhost:5500"  # Simulate a CORS request
}

try:
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Response: {response.text[:200]}...")
    
    # Check for CORS headers
    cors_headers = [key for key in response.headers.keys() if 'access-control' in key.lower()]
    print(f"CORS Headers: {cors_headers}")
    
    for header in cors_headers:
        print(f"  {header}: {response.headers[header]}")
        
except Exception as e:
    print(f"Error: {e}")