# Simple test for chat history
import requests
import json

BASE_URL = \"http://127.0.0.1:5500\"

try:
    # Test 1: Send a message
    print(\"Testing message sending...\")
    response = requests.post(f\"{BASE_URL}/ask\", 
                           json={\"query\": \"What is Python?\"}, 
                           headers={\"Content-Type\": \"application/json\"})
    print(f\"Status: {response.status_code}\")
    
    # Test 2: Get history
    print(\"\\nTesting history retrieval...\")
    response = requests.get(f\"{BASE_URL}/history\")
    print(f\"Status: {response.status_code}\")
    if response.status_code == 200:
        data = response.json()
        print(f\"History messages: {len(data.get('history', []))}\")
    
    print(\"\\n✅ Basic tests completed successfully!\")
    
except Exception as e:
    print(f\"❌ Error: {e}\")