import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Get the API key
api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key: {api_key[:10]}...{api_key[-5:] if api_key else 'None'}")

# Configure the API
genai.configure(api_key=api_key)

# List available models
try:
    print("Available models that support generateContent:")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")