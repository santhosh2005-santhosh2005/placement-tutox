import requests
import json

def test_flask_app():
    try:
        print("Testing Flask app /ask endpoint...")
        
        # Test data
        test_data = {
            "query": "What is artificial intelligence?"
        }
        
        # Make request to Flask app
        response = requests.post(
            "http://localhost:5500/ask",
            headers={"Content-Type": "application/json"},
            data=json.dumps(test_data),
            timeout=35  # Slightly longer than our AI timeout
        )
        
        print(f"Response status code: {response.status_code}")
        print(f"Response headers: {response.headers}")
        
        if response.status_code == 200:
            response_data = response.json()
            print(f"Response data: {response_data}")
            print("Test successful!")
        else:
            print(f"Error response: {response.text}")
            
    except Exception as e:
        print(f"Test failed with error: {e}")

if __name__ == "__main__":
    test_flask_app()