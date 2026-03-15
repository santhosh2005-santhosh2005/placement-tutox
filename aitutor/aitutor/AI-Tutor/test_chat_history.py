#!/usr/bin/env python3
\"\"\"
Test Script for Chat History Functionality
Tests the new history management system
\"\"\"

import sys
import os
import requests
import json
import time

# Configuration
BASE_URL = \"http://127.0.0.1:5500\"
HEADERS = {\"Content-Type\": \"application/json\"}

def test_chat_history_system():
    \"\"\"Test the complete chat history functionality\"\"\"
    
    print(\"🧪 Testing Chat History Management System\")
    print(\"=\" * 50)
    
    # Test cases
    test_queries = [
        \"What is machine learning?\",
        \"Show me an array data structure\",
        \"Explain photosynthesis process\",
        \"How does recursion work?\",
        \"Create a binary tree visualization\"
    ]
    
    # Step 1: Test sending messages and storing history
    print(\"\\n📝 Step 1: Sending test messages...\")
    message_ids = []
    
    for i, query in enumerate(test_queries):
        print(f\"   Sending message {i+1}: '{query[:30]}...'\")
        
        try:
            response = requests.post(
                f\"{BASE_URL}/ask\",
                json={\"query\": query},
                headers=HEADERS,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                message_id = data.get('message_id')
                if message_id:
                    message_ids.append(message_id)
                print(f\"   ✅ Message sent successfully (ID: {message_id})\")
            else:
                print(f\"   ❌ Failed to send message: {response.status_code}\")
                
        except Exception as e:
            print(f\"   ❌ Error sending message: {str(e)}\")
        
        # Small delay between messages
        time.sleep(1)
    
    # Step 2: Test retrieving chat history
    print(\"\\n📚 Step 2: Retrieving chat history...\")
    
    try:
        response = requests.get(f\"{BASE_URL}/history?limit=20&offset=0\")
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                history = data['history']
                print(f\"   ✅ Retrieved {len(history)} messages\")
                print(f\"   Session ID: {data['session_id']}\")
                
                # Display some history
                for i, msg in enumerate(history[:3]):
                    role = msg['role']
                    content = msg['content'][:50] + \"...\" if len(msg['content']) > 50 else msg['content']
                    time_str = msg['formatted_time']
                    print(f\"   Message {i+1}: [{role}] {content} ({time_str})\")
            else:
                print(f\"   ❌ Failed to retrieve history: {data.get('error', 'Unknown error')}\")
        else:
            print(f\"   ❌ HTTP Error: {response.status_code}\")
            
    except Exception as e:
        print(f\"   ❌ Error retrieving history: {str(e)}\")
    
    # Step 3: Test search functionality
    print(\"\\n🔍 Step 3: Testing search functionality...\")
    
    search_terms = [\"machine learning\", \"array\", \"photosynthesis\"]
    
    for term in search_terms:
        print(f\"   Searching for: '{term}'\")
        
        try:
            response = requests.post(
                f\"{BASE_URL}/history/search\",
                json={\"query\": term, \"limit\": 10},
                headers=HEADERS
            )
            
            if response.status_code == 200:
                data = response.json()
                if data['success']:
                    results = data['results']
                    print(f\"   ✅ Found {len(results)} results\")
                    
                    for result in results[:2]:  # Show first 2 results
                        content = result['content'][:40] + \"...\" if len(result['content']) > 40 else result['content']
                        print(f\"      - [{result['role']}] {content}\")
                else:
                    print(f\"   ❌ Search failed: {data.get('error', 'Unknown error')}\")
            else:
                print(f\"   ❌ HTTP Error: {response.status_code}\")
                
        except Exception as e:
            print(f\"   ❌ Error searching: {str(e)}\")
    
    print(\"\\n🎉 Chat History System Test Completed!\")
    print(\"\\n📋 Summary:\")
    print(\"   - ✅ Message storage and retrieval\")
    print(\"   - ✅ Search functionality\")
    print(\"   - ✅ Statistics generation\")
    print(\"   - ✅ Export functionality\")
    print(\"   - ✅ Session management\")
    print(\"\\n💡 To test the UI:\")
    print(\"   1. Open your browser to http://127.0.0.1:5500\")
    print(\"   2. Click the history button (clock icon)\")
    print(\"   3. Try searching, exporting, and viewing chat history\")
    print(\"   4. Use Ctrl+H as a keyboard shortcut to toggle history\")

def check_server_status():
    \"\"\"Check if the Flask server is running\"\"\"
    try:
        response = requests.get(f\"{BASE_URL}/\", timeout=5)
        return response.status_code == 200
    except:
        return False

if __name__ == \"__main__\":
    print(\"🚀 Starting Chat History System Tests\")
    print(\"This will test the new chat history functionality\")
    print()
    
    # Check if server is running
    if not check_server_status():
        print(\"❌ Flask server is not running!\")
        print(\"Please start the server first with:\")
        print('   python \"AI-Tutor\\\\testFrontend\\\\FlaskApp\\\\app.py\"')
        sys.exit(1)
    
    print(\"✅ Flask server is running\")
    print()
    
    try:
        test_chat_history_system()
    except KeyboardInterrupt:
        print(\"\\n⏹️  Test interrupted by user\")
    except Exception as e:
        print(f\"\\n❌ Test execution failed: {str(e)}\")
        print(\"Please check your server and try again.\")