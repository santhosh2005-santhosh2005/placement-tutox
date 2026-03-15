import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Get the API key
api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key: {api_key[:10]}...{api_key[-5:] if api_key else 'None'}")  # Print only part of the key for security

# Configure the API
genai.configure(api_key=api_key)

# Test the API with a supported model from the list
try:
    # Try with gemini-2.0-flash which is available
    model = genai.GenerativeModel('models/gemini-2.0-flash')
    response = model.generate_content("Hello, world!")
    print("API test successful!")
    print(f"Response: {response.text[:100]}...")
except Exception as e:
    print(f"API test with gemini-2.0-flash failed: {e}")
    
    # Try with gemini-flash-latest as a fallback
    try:
        model = genai.GenerativeModel('models/gemini-flash-latest')
        response = model.generate_content("Hello, world!")
        print("API test with gemini-flash-latest successful!")
        print(f"Response: {response.text[:100]}...")
    except Exception as e3:
        print(f"API test with gemini-flash-latest failed: {e3}")
        print("All model tests failed. There might be an issue with the API key or quota.")
