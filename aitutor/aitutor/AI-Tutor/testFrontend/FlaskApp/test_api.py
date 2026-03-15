import requests
import json

# Test the /ask endpoint
url = "http://localhost:5500/ask"
data = {"query": "Hello, how are you?"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")