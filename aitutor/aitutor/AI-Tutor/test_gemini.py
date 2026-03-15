import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

def test_gemini_connection():
    try:
        print("Testing Gemini API connection...")
        api_key = os.getenv("GOOGLE_API_KEY")
        
        if not api_key:
            print("ERROR: GOOGLE_API_KEY not found in environment variables")
            return False
            
        print(f"API Key found: {api_key[:10]}...{api_key[-5:]}")
        
        # Test the model connection
        llm = ChatGoogleGenerativeAI(model="models/gemini-2.0-flash", google_api_key=api_key)
        print("Model initialized successfully")
        
        # Test a simple query
        print("Sending test query...")
        response = llm.invoke("Hello, this is a test. Please respond with 'Test successful'")
        print(f"Response received: {response.content}")
        print("Gemini API connection test successful!")
        return True
        
    except Exception as e:
        print(f"Gemini API connection test failed: {e}")
        return False

if __name__ == "__main__":
    test_gemini_connection()