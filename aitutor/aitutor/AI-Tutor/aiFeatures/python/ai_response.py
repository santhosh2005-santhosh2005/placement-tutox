import os
import time
import mistune  # Markdown to HTML conversion
import sys
from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional


load_dotenv()

# Check if API key is loaded
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("Warning: GOOGLE_API_KEY not found in environment variables")

# Initialize AI Tutor Models with correct model names
llm_shunya = ChatGoogleGenerativeAI(model="models/gemini-2.0-flash", google_api_key=api_key)   # Shunya LLM
llm_pratham = ChatGoogleGenerativeAI(model="models/gemini-2.0-flash", google_api_key=api_key)  # Pratham LLM
llm_dviteey = ChatGoogleGenerativeAI(model="models/gemini-2.0-flash", google_api_key=api_key)  # Dviteey LLM

@dataclass
class Message:
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: float = field(default_factory=time.time)

@dataclass
class ChatSession:
    session_id: str
    messages: List[Message] = field(default_factory=list)
    metadata: Dict = field(default_factory=dict)
    max_history_length: int = 20  # Default limit for messages to store
    
    def add_message(self, role: str, content: str) -> None:
        """Add a message to the chat history."""
        # Implement truncation if history exceeds max length
        if len(self.messages) >= self.max_history_length:
            # Remove oldest messages (keep the most recent)
            self.messages = self.messages[-(self.max_history_length-1):]
        
        self.messages.append(Message(role=role, content=content))
    
    def get_formatted_history(self) -> str:
        """Return the chat history in a formatted string for context."""
        formatted = ""
        for msg in self.messages:
            formatted += f"{msg.role.capitalize()}: {msg.content}\n\n"
        return formatted
    
    def get_langchain_messages(self) -> List[Tuple[str, str]]:
        """Return chat history in LangChain message format."""
        return [(msg.role, msg.content) for msg in self.messages]

# Session manager to handle multiple chat sessions
class ChatSessionManager:
    def __init__(self):
        self.sessions: Dict[str, ChatSession] = {}
    
    def create_session(self, session_id: str) -> ChatSession:
        """Create a new chat session."""
        self.sessions[session_id] = ChatSession(session_id=session_id)
        return self.sessions[session_id]
    
    def get_session(self, session_id: str) -> Optional[ChatSession]:
        """Get an existing chat session by ID."""
        return self.sessions.get(session_id)
    
    def get_or_create_session(self, session_id: str) -> ChatSession:
        """Get an existing session or create a new one if it doesn't exist."""
        session = self.get_session(session_id)
        if not session:
            session = self.create_session(session_id)
        return session
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a chat session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

# Prompt templates with updated system messages and chat history context
def create_shunya_prompt_with_history(session: ChatSession):
    """Create a prompt template that includes chat history."""
    return ChatPromptTemplate.from_messages([
        ("system", "You are an experienced AI Tutor named TUTIX."
                   "Your name is TUTIX."
                   "you are specialized in personalized education. "
                   "You will be provided with web scraped content and a user query. "
                   "Your goal is to provide clear, thoughtful explanations tailored to the student's "
                   "learning needs. Use bold for key concepts, create structured lists for step-by-step "
                   "explanations, and provide examples when appropriate. Maintain context from previous "
                   "exchanges to create a cohesive learning experience. Address knowledge gaps "
                   "compassionately and encourage critical thinking. Adjust your teaching style based on "
                   "the student's responses and questions."
                   "Incorporate relevant web information when available to provide up-to-date and accurate information."),
        *session.get_langchain_messages(),
        ("human",  "User Query: {query}\n\n"
                  "Web Scraped Content: {scraped_content}\n\n"
                  "Please provide a helpful, educational response.")
    ])

        
def create_pratham_prompt_with_history(session: ChatSession):
    """Create a pratham prompt template with chat history for retrieval-based responses."""
    return ChatPromptTemplate.from_messages([
        ("system", "You are an AI Assistant that generates educational content based on retrieved information. "
                  "Your role is to analyze the data retrieved from the knowledge database contents "
                  "create an informative, well-structured topic explanations that address the user's query. "
                  "Focus on extracting the most relevant information from the retrieved data, organizing it "
                  "logically, and presenting it in a way that builds upon previous conversation context. "
                  "Identify key concepts, create logical connections between ideas, and ensure "
                  "the information is factually accurate based on the retrieved data."
                  "When using web-scraped information, prioritize recent and authoritative content."),
        *session.get_langchain_messages(),
        ("human", "User Query: {query}\n\n"
                  "Vector Database Retrieval Response: {retrieved}\n\n"
                  "Your Task: Generate a comprehensive topic explanation based on the retrieved information "
                  "while considering the conversation history and addressing the specific query.")
    ])

def create_dviteey_prompt_with_history(session: ChatSession):
    """Create a dviteey prompt template with chat history for response verification."""
    return ChatPromptTemplate.from_messages([
        ("system", "You are an expert AI Tutor named TUTIX."
                   "Your name is TUTIX."
                   "you are responsible for delivering the highest quality educational content. "
                   "Your task is to review and enhance the educational material provided to you. "
                   "This is a confidential verification process - you must NEVER mention or acknowledge the existence "
                   "of any prior assistant, response generation process, or verification chain in your output. "
                   "\n\n"
                   "You will receive a user query, retrieved information, and a draft response. Analyze all Three "
                   "to ensure accuracy, completeness, and pedagogical effectiveness. Focus on:\n"
                   "- Correcting any factual errors based on the retrieved information\n"
                   "- Ensuring the response is relevant to the user's query\n"
                   "- Improving clarity and structure for better learning outcomes\n"
                   "- Enhancing explanations with appropriate examples or analogies\n"
                   "- Maintaining continuity with previous conversation context\n"
                   "- Ensuring the response directly addresses the user's learning needs\n"
                   "\n"
                   "Your final output should appear as a direct response to the user with no indication "
                   "that any verification or refinement process occurred. The user should perceive your "
                   "response as coming directly from their tutor, not as a refined version of another system's output."),
        *session.get_langchain_messages(),
        ("human", "User Query: {query}\n\n"
                  "Draft Educational Content: {response}\n\n"
                  "Retrieved Reference Information: {retrieved}\n\n"
                  "Your Task: Provide a refined, improved educational response directly addressing the "
                  "user's query. Ensure factual accuracy based on the retrieved information while  maintaining "
                  "the conversational flow from previous exchanges.")
    ])

# Quick response function for timeout scenarios
def generate_quick_response(query: str) -> str:
    """Generate a quick response when the main AI system is taking too long"""
    query_lower = query.lower()
    
    # Educational topic responses
    if any(word in query_lower for word in ['python', 'programming', 'code', 'coding']):
        return "<p><strong>Python Programming:</strong> Python is a versatile, high-level programming language known for its simple syntax and powerful libraries. It's widely used in web development, data science, AI, and automation. Key concepts include variables, functions, loops, and object-oriented programming.</p>"
    
    elif any(word in query_lower for word in ['machine learning', 'ml', 'ai', 'artificial intelligence']):
        return "<p><strong>Machine Learning:</strong> Machine Learning is a subset of AI that enables computers to learn from data without explicit programming. It includes supervised learning (classification, regression), unsupervised learning (clustering), and reinforcement learning. Popular algorithms include linear regression, decision trees, and neural networks.</p>"
    
    elif any(word in query_lower for word in ['math', 'mathematics', 'algebra', 'calculus']):
        return "<p><strong>Mathematics:</strong> Mathematics is the study of numbers, shapes, patterns, and relationships. It includes areas like arithmetic, algebra, geometry, calculus, and statistics. Math is fundamental to science, engineering, and many other fields.</p>"
    
    elif any(word in query_lower for word in ['dsa', 'data structures', 'algorithms']):
        return "<p><strong>Data Structures and Algorithms:</strong> DSA involves organizing data efficiently (arrays, linked lists, trees, graphs) and designing step-by-step procedures to solve problems. Common algorithms include sorting (quicksort, mergesort), searching (binary search), and graph traversal (BFS, DFS).</p>"
    
    elif any(word in query_lower for word in ['database', 'sql', 'mysql', 'postgresql']):
        return "<p><strong>Databases:</strong> Databases store and organize data systematically. SQL (Structured Query Language) is used to interact with relational databases. Key concepts include tables, primary keys, foreign keys, joins, and normalization.</p>"
    
    elif any(word in query_lower for word in ['web development', 'html', 'css', 'javascript', 'frontend', 'backend']):
        return "<p><strong>Web Development:</strong> Web development involves creating websites and web applications. Frontend uses HTML (structure), CSS (styling), and JavaScript (interactivity). Backend handles server logic, databases, and APIs using languages like Python, Java, or Node.js.</p>"
    
    else:
        return f"<p>Thank you for asking about <strong>{query}</strong>. This is an interesting topic that involves multiple concepts and applications. For a more detailed explanation, please try asking a more specific question about particular aspects you'd like to understand better.</p>"

def generate_fallback_with_retrieval(query: str, retrieved_data: str) -> str:
    """Generate a fallback response when API quota is exceeded but we have retrieved data"""
    if retrieved_data and retrieved_data.strip():
        # Try to extract key information from retrieved data
        data_snippet = retrieved_data[:500] + "..." if len(retrieved_data) > 500 else retrieved_data
        return f"<p><strong>Based on available information:</strong></p><p>{data_snippet}</p><p><em>Note: Due to high demand, I'm providing a response based on your documents. For more detailed analysis, please try again later.</em></p>"
    else:
        return generate_quick_response(query)

# Markdown to HTML formatter
def format_response(response):
    """Converts AI response from Markdown to clean HTML."""
    if not response or response.strip() == "":
        return "I apologize, but I couldn't generate a proper response. Please try rephrasing your question."
    try:
        return mistune.markdown(response)
    except Exception as e:
        print(f"Error formatting response: {str(e)}")
        return response  # Return original response if markdown conversion fails

# Function for standard response (without retrieval)
def generate_response_without_retrieval(session_id: str, prompt: str,scraped_content: str, session_manager: ChatSessionManager):
    """Generates AI response using a single LLM (no retrieval) with chat history."""
    try:
        print(f"Generating response for session {session_id} with prompt: {prompt[:50]}...")
        # Get or create session
        session = session_manager.get_or_create_session(session_id)
        
        # Add user message to history
        session.add_message("human", prompt)
        
        # Ensure scraped_content is not None
        if not scraped_content:
            scraped_content = "No additional web content available."
        
        # Create prompt with history and generate response
        prompt_template = create_shunya_prompt_with_history(session)
        print("Prompt template created, invoking model...")
        shunya_response = (prompt_template | llm_shunya | StrOutputParser()).invoke({
            "query": prompt,
            "scraped_content": scraped_content,
            })
        print("Model response received")
        
        if not shunya_response or shunya_response.strip() == "":
            shunya_response = "I apologize, but I couldn't generate a proper response to your question. Could you please try rephrasing it or asking something else?"
        
        # Add assistant response to history
        session.add_message("assistant", shunya_response)
        
        return format_response(shunya_response)
    except Exception as e:
        error_str = str(e)
        print(f"Error in generate_response_without_retrieval: {error_str}")
        
        # Handle quota exceeded errors specifically
        if "429" in error_str and "quota" in error_str.lower():
            print("Quota exceeded - using fallback response")
            fallback_response = generate_quick_response(prompt)
            session = session_manager.get_or_create_session(session_id)
            session.add_message("assistant", fallback_response)
            return fallback_response
        
        error_msg = "I apologize, but I encountered an error while processing your question. Please try again. Error details: " + error_str
        return error_msg

# Function for retrieval-based response (with verification)
def generate_response_with_retrieval(session_id: str, prompt: str, retrieved_data: str, session_manager: ChatSessionManager):
    """Generates AI response using two LLMs (retrieval-based verification) with chat history."""
    try:
        print(f"Generating retrieval-based response for session {session_id} with prompt: {prompt[:50]}...")
        # Get or create session
        session = session_manager.get_or_create_session(session_id)

        # Add user message to history
        session.add_message("human", prompt)

        # Step 1: Generate initial response with history
        pratham_prompt = create_pratham_prompt_with_history(session)
        print("Pratham prompt created, invoking model...")
        pratham_response = (pratham_prompt | llm_pratham | StrOutputParser()).invoke({
            "query": prompt,
            "retrieved": retrieved_data,
        })
        print("Pratham response received")

        # Step 2: Verify & refine response using retrieval data and history
        dviteey_prompt = create_dviteey_prompt_with_history(session)
        print("Dviteey prompt created, invoking model...")
        dviteey_response = (dviteey_prompt | llm_dviteey | StrOutputParser()).invoke({
            "query": prompt,
            "retrieved": retrieved_data,
            "response": pratham_response,
        })
        print("Dviteey response received")
        
        # Add assistant response to history
        session.add_message("assistant", dviteey_response)
        
        return format_response(dviteey_response)
    except Exception as e:
        error_str = str(e)
        print(f"Error in generate_response_with_retrieval: {error_str}")
        
        # Handle quota exceeded errors specifically
        if "429" in error_str and "quota" in error_str.lower():
            print("Quota exceeded - using fallback response with retrieved data")
            fallback_response = generate_fallback_with_retrieval(prompt, retrieved_data)
            session = session_manager.get_or_create_session(session_id)
            session.add_message("assistant", fallback_response)
            return fallback_response
        
        error_msg = "I apologize, but I encountered an error while processing your question. Please try again. Error details: " + error_str
        return error_msg

def detect_youtube_recommendation_request(query: str) -> bool:
    """
    Detect if the user query is requesting YouTube video recommendations.
    
    Args:
        query (str): User query
        
    Returns:
        bool: True if the query is requesting YouTube recommendations
    """
    query_lower = query.lower()
    
    # Keywords that indicate a request for YouTube recommendations
    youtube_keywords = [
        "youtube", "video", "tutorial", "learn", "watch", 
        "guide", "course", "lecture", "demonstration",
        "how to", "how-to", "explain", "teach"
    ]
    
    # Check if any YouTube-related keywords are in the query
    return any(keyword in query_lower for keyword in youtube_keywords)

def extract_topic_from_query(query: str) -> str:
    """
    Extract the main topic from a user query.
    
    Args:
        query (str): User query
        
    Returns:
        str: Extracted topic
    """
    # Remove common phrases that don't contribute to the topic
    query_lower = query.lower()
    
    # Remove question words and phrases
    remove_phrases = [
        "what is", "what are", "how to", "how do i", "how can i",
        "can you", "could you", "please", "recommend", "suggest",
        "show me", "find me", "find", "show", "videos", "video",
        "tutorials", "tutorial", "youtube", "on", "about"
    ]
    
    topic = query
    for phrase in remove_phrases:
        topic = topic.replace(phrase, "", 1)
    
    # Clean up extra spaces and return
    return " ".join(topic.split()).strip()

# Test Run
if __name__ == "__main__":
    # Create a session manager
    session_manager = ChatSessionManager()
    
    # Use a consistent session ID for the test
    test_session_id = "test_session_001"
    
    while True:
        user_input = input("Ask something (or type 'exit' to quit): ")
        
        if user_input.lower() == 'exit':    
            break
        # Simulating retrieval decision
        use_retrieval = input("Use retrieval? (yes/no): ").strip().lower() == "yes"
        
        scraped_text = input("Enter Scraped data: ") # Simulating retrieval data
        
        if use_retrieval:
            retrieved_info = input("Enter retrieved data: ")  # Simulating retrieval data
            response = generate_response_with_retrieval(
                test_session_id, user_input, scraped_text, retrieved_info, session_manager
            )
        else:
            response = generate_response_without_retrieval(
                test_session_id, user_input, scraped_text, session_manager
            )
            
        print("AI Tutor Response:", response)
        
        # Show chat history for demonstration
        session = session_manager.get_session(test_session_id)
        print("\n--- Chat History ---")
        print(session.get_formatted_history())
        print("-------------------\n")