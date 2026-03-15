# TUTIX: AI Tutor - Smart Multimodal Learning Assistant

**Version-1**

## Description

**TUTIX** is an intelligent, multimodal educational assistant built using **Flask**, **Langchain** and advanced **AI models**, designed to provide precise and engaging learning support. Whether you're uploading PDFs for reference or seeking real-time answers through web scraping, AI Tutor adapts dynamically using **Retrieval-Augmented Generation (RAG)** and **Agentic capabilities** to ensure tailored responses.

## Tech Stack

| Layer                     | Technologies Used                                            |
| ------------------------- | ------------------------------------------------------------ |
| **Frontend**              | Flask, HTML, CSS, JavaScript                                 |
| **AI Models**             | Gemini 1.5-flash, Gemini 2.0-flash, mxbai-embed-large:latest |
| **Vector Datastore**      | FAISS (in-memory vector store)                               |
| **Web Scraping**          | Langchain Tools, BeautifulSoup4, SERP                        |
| **RAG + Agentic Support** | Langchain, GoogleGenerativeAI, webbrowser                    |
| **NLP Processing**        | Ollama Embeddings, CharacterTextSplitter, NLTK               |
| **Voice Interaction**     | SpeechRecognition, pyttsx3 (TTS)                             |

## Features

### 🔁 Dual Response Capability

- **With PDFs**: Extracts content from uploaded PDFs, embeds them into FAISS using cosine similarity, and generates responses by augmenting model outputs.
- **Without PDFs**: Uses real-time web scraping and curates links from the web to answer queries dynamically.

### 🧠 Intelligent Context Handling

- Differentiates between **retrieval mode** (document-based) and **non-retrieval mode** (web-based), ensuring the most context-aware and relevant responses.

### 🔗 RAG Capabilities

- Retrieves embedded vector chunks using cosine similarity and enhances Gemini-generated outputs with this specific context.

### 🤖 Agentic Capabilities

- Automates browsing using web scraping tools.
- Opens recommended learning links in the user's browser for detailed study.

### 🎙️ Voice-Enabled Learning

- Listens to queries using **speech recognition**.
- Responds using **text-to-speech**, improving accessibility and engagement.

### 🧩 Multi-Model Chaining

- Chains multiple models during RAG processing:
  | Model | Purpose |
  |-------------------|---------------------------------------------------------------------------------------------------------------|
  | **shunya_llm** | Generation for non-retrieved queries using user input + web-scraped content. |
  | **pratham_llm** | Retrieval-based topic generation using vector DB or document content. |
  | **dviteey_llm** | Cross-verification of pratham_llm's output using retrieved data to reduce hallucinations and enhance clarity. |

### 📚 Resource-Driven Recommendations

- Offers curated links or document-based responses with no redundancy—focused only on what's essential for the user.

## 📁 File Structure (with Descriptions)

```plaintext
AI-TUTOR/
├── aiFeatures/
│   └── python/
│       ├── ai_assistant.py              # Core logic to manage query routing and decision-making
│       ├── ai_response.py               # Handles AI model responses and augmentation
│       ├── rag_pipeline.py              # Implements RAG (retrieval-augmented generation) process
│       ├── speech_to_text.py            # Converts voice input to text using speech recognition
│       ├── text_to_speech.py            # Converts text responses to speech using pyttsx3
│       ├── web_scraper_tool.py          # Automates scraping tools using BeautifulSoup and SERP
│       └── web_scraping.py              # Generalized web scraping logic for live content retrieval
│
├── data/
│   └── scrapings/
│       └── scraped_content.txt          # Stores temporarily scraped content from the web
│
├── testFrontend/
│   └── FlaskApp/
│       ├── static/
│       │   ├── script.js                # JavaScript for dynamic frontend interaction
│       │   └── style.css                # Custom styling for the frontend
│       └── templates/
│           └── index.html               # Main HTML template rendered by Flask
│
├── app.py                               # Entry-point Flask server script integrating backend/frontend
├── .env                                 # Environment file for storing API keys and secrets
├── .gitignore                           # Git ignore rules
├── README.md                            # Project documentation
└── requirements.txt                     # Python dependencies
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/gupta-v/AI-Tutor.git
cd AI-Tutor
```

### 2. Set Up Virtual Environment

```bash
python -m venv env
source env/bin/activate  # or `env\Scripts\activate` on Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file and add your API keys:

```env
GEMINI_API_KEY=your_gemini_key
SERPAPI_KEY=your_serpapi_key
```

### 5. Run the Application

```bash
python app.py
```

Access the app at: [http://localhost:5000](http://localhost:5000)

## Ollama Setup

To use **Ollama embeddings** for document chunking and vector representation, follow these steps:

### 1. Install Ollama

Download and install Ollama from the official site:

👉 [https://ollama.com/download](https://ollama.com/download)

After installation, ensure it is accessible in your terminal:

```bash
ollama --version
```

### 2. Pull the Required Model

Pull a supported embedding model like `mxbai-embed-large` or any other compatible model:

```bash
ollama pull mxbai-embed-large
```

### 3. Start Ollama Server (if required)

Ollama typically runs as a background service. If not, you can start it manually:

```bash
ollama serve
```

### 4. Integration in AI Tutor

The application uses Ollama to embed chunks of PDF/text using:

- `mxbai-embed-large` or any embedding model you configure
- Embeddings are stored in FAISS vector store and used for cosine similarity-based retrieval

Ensure your `.env` or config file includes proper references to use Ollama embeddings.

```env
OLLAMA_MODEL=mxbai-embed-large
```

You’re now ready to use Ollama with AI Tutor🌟

## Example Usage

### Voice Query

> "Explain Newton's second law"

- ✅ Converts to text → Checks for PDF → Fetches embedded context (if available) → Responds via Gemini + TTS

### Text Query Without Upload

> "What is quantum entanglement?"

- ❌ No documents → 🌐 Web scraping triggered → 🧠 Top 3 results shown + 🔊 Voice explanation

### Text Query With Upload

> Upload a PDF → Ask "Summarize Chapter 2"

- ✅ FAISS retrieves PDF chunks → Gemini refines answer using those → 🎧 Output is spoken

## To-Do / Future Enhancements

- ✅ Add image-based query support (Multimodal)
- 🔄 Integrate quiz and flashcards generation from uploaded materials
- 🔒 Secure backend in GOlang/Python
- 🚀 Scaling and deployment using Docker + Firebase

## Credits

- Developed by Vaibhav Gupta, Shweta Maurya, Shreya Pandey, Vartika Upadhyay
- Built using Google's Gemini API, FAISS, Langchain, and Ollama
- Open-source contributions are welcome 🤝
