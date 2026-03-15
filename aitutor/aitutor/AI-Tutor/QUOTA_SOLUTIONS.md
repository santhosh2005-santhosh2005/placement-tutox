# Gemini API Quota Solutions Guide

## Current Issue
- **Error**: 429 Quota exceeded for Gemini API
- **Limit**: 50 requests per day on free tier
- **Model**: gemini-1.5-flash

## Solution Options

### 🔥 **Option 1: Get New API Key (Immediate Fix)**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new Google account or use different Google account
3. Generate a new API key
4. Replace in `.env` file:
   ```
   GOOGLE_API_KEY="YOUR_NEW_API_KEY_HERE"
   ```
5. Restart the Flask server

### 💰 **Option 2: Upgrade to Paid Plan**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Enable billing for your project
3. Gemini API pricing:
   - **Gemini 1.5 Flash**: $0.075 per 1M input tokens
   - **Gemini 1.5 Pro**: $1.25 per 1M input tokens
   - Much higher rate limits (1000+ requests/minute)

### 🔄 **Option 3: Use Multiple API Keys (Rotation)**
Create multiple Google accounts and rotate between API keys:

```python
# In ai_response.py - add this rotation logic
import random

api_keys = [
    "YOUR_FIRST_API_KEY",
    "YOUR_SECOND_API_KEY",
    "YOUR_THIRD_API_KEY"
]

def get_random_api_key():
    return random.choice(api_keys)

# Update model initialization
current_key = get_random_api_key()
llm_shunya = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=current_key)
```

### ⏰ **Option 4: Wait for Quota Reset**
- Free tier quota resets every 24 hours
- Current quota resets at midnight Pacific Time
- You can wait ~5.8 seconds as indicated in error message for retry

### 🤖 **Option 5: Switch to Alternative AI Models**
1. **Ollama Local Models** (Already set up for embeddings):
   ```bash
   ollama pull llama2
   ollama pull codellama
   ```

2. **OpenAI API** (Requires separate key):
   ```python
   from langchain_openai import ChatOpenAI
   llm = ChatOpenAI(model="gpt-3.5-turbo", api_key="your_openai_key")
   ```

3. **Anthropic Claude**:
   ```python
   from langchain_anthropic import ChatAnthropic
   llm = ChatAnthropic(model="claude-3-sonnet-20240229", api_key="your_anthropic_key")
   ```

### 📊 **Option 6: Implement Request Caching**
Cache responses to reduce API calls:

```python
import hashlib
import json
import os

cache_dir = "response_cache"
os.makedirs(cache_dir, exist_ok=True)

def get_cache_key(query, context=""):
    content = f"{query}_{context}"
    return hashlib.md5(content.encode()).hexdigest()

def get_cached_response(cache_key):
    cache_file = os.path.join(cache_dir, f"{cache_key}.json")
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            return json.load(f)
    return None

def cache_response(cache_key, response):
    cache_file = os.path.join(cache_dir, f"{cache_key}.json")
    with open(cache_file, 'w') as f:
        json.dump({"response": response, "timestamp": time.time()}, f)
```

## Current Fallback System (Implemented)
✅ **Smart Error Detection**: Detects 429 quota errors
✅ **Topic-Based Responses**: Provides relevant educational content
✅ **Retrieval Integration**: Uses document data when available
✅ **Graceful Degradation**: Maintains user experience

## Recommendation
**Best immediate solution**: Get a new Gemini API key from a different Google account. This takes 2 minutes and gives you another 50 free requests per day.

**Long-term solution**: Upgrade to paid tier for production use or implement multiple API key rotation.