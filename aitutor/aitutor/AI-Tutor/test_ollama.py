import os
import sys
from langchain_ollama import OllamaEmbeddings

# Add aiFeatures/python to sys.path for module imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "aiFeatures/python")))

def test_ollama_connection():
    try:
        print("Testing Ollama connection...")
        embeddings = OllamaEmbeddings(model="mxbai-embed-large:latest", base_url="http://localhost:11434")
        print("Embedding model initialized successfully")
        
        # Test embedding generation
        test_texts = ["Hello world", "This is a test"]
        print("Generating embeddings...")
        embeddings_result = embeddings.embed_documents(test_texts)
        print(f"Generated {len(embeddings_result)} embeddings")
        print(f"Embedding dimension: {len(embeddings_result[0])}")
        print("Ollama connection test successful!")
        return True
    except Exception as e:
        print(f"Ollama connection test failed: {e}")
        return False

if __name__ == "__main__":
    test_ollama_connection()