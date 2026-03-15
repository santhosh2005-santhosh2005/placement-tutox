import os
import re
import sys
import signal
import time
import os
from datetime import datetime
from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
import threading
import tempfile
from concurrent.futures import ThreadPoolExecutor, TimeoutError

# Add aiFeatures/python to sys.path for module imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from aiFeatures.python.ai_response import generate_response_without_retrieval, generate_response_with_retrieval, ChatSessionManager, generate_quick_response, generate_fallback_with_retrieval
from aiFeatures.python.speech_to_text import speech_to_text
from aiFeatures.python.text_to_speech import say, stop_speech
from aiFeatures.python.web_scraping import web_response
from aiFeatures.python.rag_pipeline import index_pdfs, retrieve_answer, extract_text_from_pdf
from aiFeatures.python.visual_generator import VisualContentGenerator
from aiFeatures.python.history_manager import HistoryManager
from aiFeatures.python.youtube_recommender import get_youtube_recommendations
from aiFeatures.python.related_topics import get_related_topics

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Add a secret key for sessions
CORS(app)  # Enable CORS for frontend requests

# Global variables
vector_store = None
session_manager = ChatSessionManager()
default_session_id = "user_session_001"  # Default session ID
executor = ThreadPoolExecutor(max_workers=2)  # Thread pool for handling requests
visual_generator = VisualContentGenerator()  # Visual content generator
history_manager = HistoryManager(storage_type="sqlite", storage_path="chat_history.db")  # Chat history manager

# Timeout wrapper function
def run_with_timeout(func, timeout_seconds=30):
    """Run a function with a timeout"""
    try:
        print(f"Executing function with timeout of {timeout_seconds} seconds")
        future = executor.submit(func)
        result = future.result(timeout=timeout_seconds)
        print("Function executed successfully within timeout")
        return result
    except TimeoutError:
        print(f"Function timed out after {timeout_seconds} seconds")
        return None
    except Exception as e:
        print(f"Error in timeout wrapper: {str(e)}")
        return None

import re


def generate_pdf_summary(file_paths, file_names):
    """Generate a comprehensive summary of uploaded PDF files."""
    try:
        summaries = []
        total_pages = 0
        
        for file_path, file_name in zip(file_paths, file_names):
            # Extract text from PDF
            texts_with_metadata = extract_text_from_pdf(file_path)
            
            if not texts_with_metadata:
                summaries.append(f"❌ **{file_name}**: Could not extract text from this PDF.")
                continue
            
            # Count pages
            page_count = len(texts_with_metadata)
            total_pages += page_count
            
            # Extract first few pages for summary
            sample_text = ""
            for i, (text, metadata) in enumerate(texts_with_metadata[:3]):  # First 3 pages
                sample_text += text + " "
                if len(sample_text) > 3000:  # Limit to 3000 characters
                    break
            
            # Generate summary using AI
            summary_prompt = f"Provide a comprehensive summary of this PDF content in 2-3 paragraphs. Include key topics, main concepts, and important information. Content: {sample_text[:2000]}"
            
            try:
                # Use the session manager to generate summary
                ai_summary = run_with_timeout(
                    lambda: generate_response_without_retrieval(
                        default_session_id,
                        summary_prompt,
                        "",
                        session_manager
                    ),
                    timeout_seconds=25
                )
                
                if ai_summary is None or "429" in str(ai_summary):
                    # Fallback summary
                    ai_summary = f"This PDF contains {page_count} pages of content. The document appears to cover topics related to the filename '{file_name}'. The content has been successfully indexed for question-answering."
                
            except Exception as e:
                print(f"Error generating AI summary for {file_name}: {e}")
                ai_summary = f"This PDF contains {page_count} pages of content and has been successfully processed for question-answering."
            
            # Format the summary
            summary_text = f"""📄 **{file_name}**
📊 **Pages**: {page_count}
📝 **Summary**: {ai_summary}
✅ **Status**: Successfully indexed for Q&A
"""
            
            summaries.append(summary_text)
        
        # Create comprehensive overview
        overview = (f"🎉 **PDF Processing Complete!**\n\n"
                   f"📚 **Total Files Processed**: {len(file_names)}\n"
                   f"📄 **Total Pages**: {total_pages}\n"
                   f"🔍 **Ready for Questions**: You can now ask questions about any content from these documents.\n\n"
                   f"---\n\n" + 
                   "\n\n---\n\n".join(summaries) + 
                   f"\n\n---\n\n"
                   f"💡 **How to Use**: \n"
                   f"- Ask specific questions about any document\n"
                   f"- Reference concepts, topics, or details from the PDFs\n"
                   f"- Use keywords from the content for best results\n"
                   f"- Ask for comparisons between different documents\n\n"
                   f"🚀 **Ready to answer your questions!**")
        
        return overview
        
    except Exception as e:
        print(f"Error generating PDF summary: {e}")
        return f"Successfully processed {len(file_names)} PDF file(s) with {total_pages} total pages. The documents are now ready for question-answering."


def chunk_text(text, max_length=150):
    """Split text into smaller chunks at sentence boundaries for faster TTS processing."""
    # Split by sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_length:
            current_chunk += " " + sentence if current_chunk else sentence
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence
    
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return chunks

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/clear-session", methods=["POST"])
def clear_session():
    """Clears the current RAG session and resets the vector store."""
    global vector_store, session_manager, history_manager, default_session_id
    
    try:
        # Reset the vector store
        vector_store = None
        
        # Clear the session for this user
        session_manager.delete_session(default_session_id)
        
        # Clear chat history for this session
        history_manager.delete_session(default_session_id)
        
        return jsonify({"success": True, "message": "Session and chat history cleared successfully"})
    
    except Exception as e:
        print(f"Error clearing session: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/initialize-rag", methods=["POST"])
def initialize_rag():
    """Handles indexing PDFs from uploaded files or a folder path and provides comprehensive summaries."""
    global vector_store, history_manager, default_session_id
    
    try:
        file_paths = []
        file_names = []
        
        if 'files' in request.files:
            files = request.files.getlist('files')
            
            with tempfile.TemporaryDirectory() as temp_dir:
                for file in files:
                    if file.filename.endswith('.pdf'):
                        file_path = os.path.join(temp_dir, file.filename)
                        file.save(file_path)
                        file_paths.append(file_path)
                        file_names.append(file.filename)

                if not file_paths:
                    return jsonify({"success": False, "message": "No valid PDF files found"}), 400
                
                # Generate summary before indexing
                pdf_summary = generate_pdf_summary(file_paths, file_names)
                
                # Index the PDFs
                if len(file_paths) == 1:
                    vector_store = index_pdfs(file_paths[0])  # Using unified index_pdfs function
                else:
                    vector_store = index_pdfs(file_paths)  # Using unified index_pdfs function
                
                # Store the summary in chat history
                summary_message_id = history_manager.add_message(
                    session_id=default_session_id,
                    role="assistant",
                    content=pdf_summary,
                    message_type="text",
                    metadata={
                        'message_type': 'pdf_summary',
                        'files_processed': file_names,
                        'total_files': len(file_names)
                    }
                )
                
                return jsonify({
                    "success": True, 
                    "message": "RAG initialized successfully",
                    "summary": pdf_summary,
                    "files_processed": file_names,
                    "message_id": summary_message_id
                })
        
        elif 'folder' in request.form:
            folder_path = request.form.get('folder')
            
            # Get all PDF files in the folder
            if os.path.isdir(folder_path):
                for filename in os.listdir(folder_path):
                    if filename.lower().endswith('.pdf'):
                        file_paths.append(os.path.join(folder_path, filename))
                        file_names.append(filename)
                
                if not file_paths:
                    return jsonify({"success": False, "message": "No PDF files found in folder"}), 400
                
                # Generate summary
                pdf_summary = generate_pdf_summary(file_paths, file_names)
                
                # Index the PDFs
                vector_store = index_pdfs(folder_path)  # Using unified index_pdfs function
                
                # Store the summary in chat history
                summary_message_id = history_manager.add_message(
                    session_id=default_session_id,
                    role="assistant",
                    content=pdf_summary,
                    message_type="text",
                    metadata={
                        'message_type': 'pdf_summary',
                        'files_processed': file_names,
                        'total_files': len(file_names),
                        'source_folder': folder_path
                    }
                )
                
                return jsonify({
                    "success": True, 
                    "message": "RAG initialized successfully",
                    "summary": pdf_summary,
                    "files_processed": file_names,
                    "message_id": summary_message_id
                })
            else:
                return jsonify({"success": False, "message": "Invalid folder path"}), 400
        
        else:
            return jsonify({"success": False, "message": "No files or folder provided"}), 400
        
    except Exception as e:
        print(f"RAG initialization error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/ask", methods=["POST"])
def ask():
    """Handles text input and returns AI response with chat history management."""
    global vector_store, session_manager, default_session_id, visual_generator, history_manager
    data = request.json
    user_query = data.get("query")

    if not user_query:
        return jsonify({"error": "No input provided"}), 400

    try:
        # Store user message in history
        user_message_id = history_manager.add_message(
            session_id=default_session_id,
            role="user",
            content=user_query,
            message_type="text"
        )
        print(f"Stored user message with ID: {user_message_id}")
        
        # Check if user is requesting YouTube recommendations
        youtube_recommendations_html = None
        if detect_youtube_request(user_query):
            topic = extract_topic_from_query(user_query)
            if topic:
                print(f"Detected YouTube request for topic: {topic}")
                youtube_recommendations_html = get_youtube_recommendations(topic, max_results=3)
        
        # Check if visual content should be generated
        visual_detection = visual_generator.detect_visual_request(user_query)
        visual_content = None
        visual_metadata = {}
        
        if visual_detection['has_visual_request']:
            try:
                # Attempt to generate visual content
                visual_types = visual_detection['visual_types']
                topic_context = visual_detection.get('topic_context')
                
                # Use topic-specific visual generation if context is detected
                if topic_context:
                    print(f"Generating topic-specific visual for: {topic_context}")
                    visual_content = visual_generator.generate_topic_specific_visual(user_query, topic_context)
                    visual_metadata['topic_context'] = topic_context
                
                # Fallback to general visual types if no topic-specific content
                elif 'diagram' in visual_types:
                    visual_content = visual_generator.generate_simple_diagram('flowchart', user_query)
                    visual_metadata['visual_type'] = 'flowchart'
                elif 'timeline' in visual_types:
                    visual_content = visual_generator.generate_simple_diagram('timeline', user_query)
                    visual_metadata['visual_type'] = 'timeline'
                elif 'comparison' in visual_types:
                    visual_content = visual_generator.generate_simple_diagram('concept_map', user_query)
                    visual_metadata['visual_type'] = 'concept_map'
                elif 'chart' in visual_types or 'statistics' in visual_types:
                    visual_content = visual_generator.generate_from_data(user_query)
                    visual_metadata['visual_type'] = 'chart'
                
                # If no specific visual generated, try educational visual
                if not visual_content:
                    visual_content = visual_generator.generate_educational_visual(user_query, 'general')
                    visual_metadata['visual_type'] = 'educational'
                
                visual_metadata['visual_types'] = visual_types
                    
            except Exception as ve:
                print(f"Visual generation error: {ve}")
                visual_content = None
        
        # Get retrieved information if vector store exists
        retrieved_info = ""
        if vector_store:
            retrieved_info = run_with_timeout(
                lambda: retrieve_answer(user_query, vector_store), 
                timeout_seconds=15
            ) or ""
        
        # Generate response based on whether retrieval was performed
        if retrieved_info:
            def generate_with_retrieval():
                return generate_response_with_retrieval(
                    default_session_id, 
                    user_query,
                    retrieved_info, 
                    session_manager
                )
            
            response = run_with_timeout(generate_with_retrieval, timeout_seconds=30)
            
            if response is None:
                print("Response timeout - using fallback with retrieval")
                response = generate_fallback_with_retrieval(user_query, retrieved_info)
            
            # Check for quota errors and use fallback
            if "429" in response and "quota" in response.lower():
                print("Quota error detected - using fallback with retrieval")
                response = generate_fallback_with_retrieval(user_query, retrieved_info)
            
            # Store AI response in history
            response_metadata = {
                'hasRetrieval': True,
                'retrieved_info_length': len(retrieved_info),
                'response_method': 'retrieval'
            }
            if visual_content:
                response_metadata.update(visual_metadata)
                response_metadata['has_visual'] = True
            
            ai_message_id = history_manager.add_message(
                session_id=default_session_id,
                role="assistant",
                content=response,
                message_type="visual" if visual_content else "text",
                metadata=response_metadata
            )
            print(f"Stored AI response with ID: {ai_message_id}")
            
            return jsonify({
                "response": response,
                "retrieved": retrieved_info,
                "hasRetrieval": bool(retrieved_info),
                "visual_content": visual_content,
                "has_visual": bool(visual_content),
                "visual_types": visual_detection.get('visual_types', []),
                "youtube_recommendations": youtube_recommendations_html,
                "message_id": ai_message_id
            })
            
        else:
            def generate_without_retrieval():
                scraped_text = run_with_timeout(
                    lambda: web_response(user_query),
                    timeout_seconds=20
                ) or "No web content available."
                
                return generate_response_without_retrieval(
                    default_session_id, 
                    user_query, 
                    scraped_text,
                    session_manager
                )
            
            response = run_with_timeout(generate_without_retrieval, timeout_seconds=30)
            
            if response is None:
                print("Response timeout - using quick fallback")
                response = generate_quick_response(user_query)
            
            # Check for quota errors and use fallback
            if "429" in response and "quota" in response.lower():
                print("Quota error detected - using quick fallback")
                response = generate_quick_response(user_query)
            
            # Get scraped text for display (if available)
            scraped_text = "Web content was processed for this response."
            
            # Store AI response in history
            response_metadata = {
                'hasScraping': True,
                'response_method': 'web_scraping'
            }
            if visual_content:
                response_metadata.update(visual_metadata)
                response_metadata['has_visual'] = True
            
            ai_message_id = history_manager.add_message(
                session_id=default_session_id,
                role="assistant",
                content=response,
                message_type="visual" if visual_content else "text",
                metadata=response_metadata
            )
            print(f"Stored AI response with ID: {ai_message_id}")

            return jsonify({
                "response": response,
                "scraped": scraped_text,
                "hasScraping": True,
                "visual_content": visual_content,
                "has_visual": bool(visual_content),
                "visual_types": visual_detection.get('visual_types', []),
                "youtube_recommendations": youtube_recommendations_html,
                "message_id": ai_message_id
            })
    
    except Exception as e:
        error_str = str(e)
        print(f"Error processing query: {error_str}")
        
        # Handle quota errors specifically
        if "429" in error_str and "quota" in error_str.lower():
            print("Quota error in exception handler - using fallback")
            fallback_response = generate_quick_response(user_query)
            return jsonify({
                "response": fallback_response,
                "fallback": True,
                "message": "Using fallback due to API quota limit"
            })
        
        return jsonify({"error": "Failed to process query: " + error_str}), 500
    
@app.route("/speech-to-text", methods=["POST"])
def process_voice():
    """Handles voice input and converts it to text."""
    try:
        user_query = speech_to_text()
        return jsonify({"query": user_query})
    except Exception as e:
        print(f"Speech recognition error: {e}")
        return jsonify({"error": "Failed to recognize speech: " + str(e)}), 500

@app.route("/text-to-speech", methods=["POST"])
def process_speech():
    """Converts text to speech."""
    data = request.json
    text = data.get("text")
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    try:
        say(text)  # Convert text to speech
        return jsonify({"success": True})
    except Exception as e:
        print(f"Text-to-speech error: {e}")
        return jsonify({"error": "Failed to convert text to speech: " + str(e)}), 500
    
    
@app.route("/stop-speech", methods=["POST"])
def handle_stop_speech():
    """Stops ongoing speech output."""
    try:
        success = stop_speech()
        return jsonify({"message": "Speech stopped", "success": success})
    except Exception as e:
        print(f"Error stopping speech: {e}")
        return jsonify({"error": "Failed to stop speech: " + str(e)}), 500

@app.route("/generate-visual", methods=["POST"])
def generate_visual():
    """Generate visual content based on user request"""
    global visual_generator
    
    try:
        data = request.json
        query = data.get("query", "")
        visual_type = data.get("visual_type", "auto")
        chart_data = data.get("chart_data", None)
        
        if not query and not chart_data:
            return jsonify({"error": "No query or data provided"}), 400
        
        visual_result = None
        
        # If specific chart data is provided
        if chart_data:
            visual_result = visual_generator.generate_chart(chart_data, visual_type)
        
        # Auto-detect visual needs from query
        elif visual_type == "auto":
            detection = visual_generator.detect_visual_request(query)
            
            if detection['has_visual_request']:
                visual_types = detection['visual_types']
                topic_context = detection.get('topic_context')
                
                # Use topic-specific visual generation if context is detected
                if topic_context:
                    print(f"Generating topic-specific visual for: {topic_context}")
                    visual_result = visual_generator.generate_topic_specific_visual(query, topic_context)
                
                # Fallback to general visual types
                elif 'chart' in visual_types or 'statistics' in visual_types:
                    # Try to extract data from query for chart generation
                    visual_result = visual_generator.generate_from_data(query)
                
                elif 'diagram' in visual_types:
                    visual_result = visual_generator.generate_simple_diagram('flowchart', query)
                
                elif 'timeline' in visual_types:
                    visual_result = visual_generator.generate_simple_diagram('timeline', query)
                
                elif 'comparison' in visual_types:
                    visual_result = visual_generator.generate_simple_diagram('concept_map', query)
                
                else:
                    # Generate educational visual
                    visual_result = visual_generator.generate_educational_visual(query, 'general')
        
        # Generate specific visual type
        else:
            if visual_type in ['flowchart', 'timeline', 'concept_map']:
                visual_result = visual_generator.generate_simple_diagram(visual_type, query)
            elif visual_type in ['bar', 'line', 'pie', 'scatter']:
                # For chart types, try to generate sample data or extract from query
                sample_data = {
                    'x': ['A', 'B', 'C', 'D'],
                    'y': [10, 25, 30, 15],
                    'title': f'{visual_type.title()} Chart for: {query[:50]}...',
                    'xlabel': 'Categories',
                    'ylabel': 'Values'
                }
                visual_result = visual_generator.generate_chart(sample_data, visual_type)
            else:
                # For any other visual type, generate educational visual
                visual_result = visual_generator.generate_educational_visual(query, visual_type)
        
        # If no visual was generated so far, try fallback generation
        if not visual_result:
            print(f"No visual generated, trying fallback for query: {query}")
            visual_result = visual_generator.generate_educational_visual(query, 'general')
        
        if visual_result:
            return jsonify({
                "success": True,
                "visual_data": visual_result,
                "visual_type": visual_type,
                "query": query
            })
        else:
            return jsonify({
                "success": False,
                "message": "Could not generate visual content for this query. Please try a different request or contact support.",
                "debug_info": {
                    "query": query,
                    "visual_type": visual_type,
                    "attempted_generation": True
                }
            })
    
    except Exception as e:
        print(f"Error generating visual: {e}")
        return jsonify({"error": "Failed to generate visual: " + str(e)}), 500

@app.route("/analyze-for-visual", methods=["POST"])
def analyze_for_visual():
    """Analyze query to determine if visual content would be helpful"""
    global visual_generator
    
    try:
        data = request.json
        query = data.get("query", "")
        
        if not query:
            return jsonify({"error": "No query provided"}), 400
        
        detection = visual_generator.detect_visual_request(query)
        
        return jsonify({
            "has_visual_request": detection['has_visual_request'],
            "visual_types": detection['visual_types'],
            "suggestions": {
                'chart': 'chart' in detection['visual_types'] or 'statistics' in detection['visual_types'],
                'diagram': 'diagram' in detection['visual_types'],
                'timeline': 'timeline' in detection['visual_types'],
                'comparison': 'comparison' in detection['visual_types']
            }
        })
    
    except Exception as e:
        print(f"Error analyzing query for visual: {e}")
        return jsonify({"error": "Failed to analyze query: " + str(e)}), 500

def detect_youtube_request(user_query: str) -> bool:
    """
    Detect if the user query is requesting YouTube video recommendations.
    
    Args:
        user_query (str): User query
        
    Returns:
        bool: True if the query is requesting YouTube recommendations
    """
    query_lower = user_query.lower()
    
    # Keywords that indicate a request for YouTube recommendations
    youtube_keywords = [
        "youtube", "video", "tutorial", "learn", "watch", 
        "guide", "course", "lecture", "demonstration",
        "how to", "how-to", "explain", "teach", "show me"
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

@app.route("/youtube-recommendations", methods=["POST"])
def youtube_recommendations():
    """Get YouTube video recommendations for a given topic."""
    try:
        data = request.json
        topic = data.get("topic", "")
        
        if not topic:
            return jsonify({"error": "No topic provided"}), 400
        
        # Get YouTube recommendations
        recommendations_html = get_youtube_recommendations(topic, max_results=5)
        
        # Store in chat history
        recommendation_message_id = history_manager.add_message(
            session_id=default_session_id,
            role="assistant",
            content=f"YouTube recommendations for: {topic}",
            message_type="text",
            metadata={
                'youtube_recommendations': True,
                'topic': topic
            }
        )
        
        return jsonify({
            "success": True,
            "topic": topic,
            "recommendations": recommendations_html,
            "message_id": recommendation_message_id
        })
        
    except Exception as e:
        print(f"Error getting YouTube recommendations: {e}")
        return jsonify({"error": "Failed to get YouTube recommendations"}), 500

@app.route("/related-topics", methods=["POST"])
def related_topics():
    """Get related topics for a given topic."""
    try:
        data = request.json
        topic = data.get("topic", "")
        
        if not topic:
            return jsonify({"error": "No topic provided"}), 400
        
        # Get related topics
        topics = get_related_topics(topic, max_results=5)
        
        return jsonify({
            "success": True,
            "topic": topic,
            "related_topics": topics
        })
        
    except Exception as e:
        print(f"Error getting related topics: {e}")
        return jsonify({"error": "Failed to get related topics"}), 500

# ========================================
# Chat History Management Endpoints
# ========================================

@app.route("/history", methods=["GET"])
def get_chat_history():
    """Get chat history for the current session"""
    global history_manager, default_session_id
    
    try:
        # Get query parameters
        limit = request.args.get('limit', default=50, type=int)
        offset = request.args.get('offset', default=0, type=int)
        
        # Get session history
        history = history_manager.get_session_history(
            session_id=default_session_id,
            limit=limit,
            offset=offset
        )
        
        return jsonify({
            "success": True,
            "session_id": default_session_id,
            "history": history,
            "total_messages": len(history),
            "limit": limit,
            "offset": offset
        })
        
    except Exception as e:
        print(f"Error getting chat history: {e}")
        return jsonify({"error": "Failed to get chat history: " + str(e)}), 500

@app.route("/history/sessions", methods=["GET"])
def get_all_sessions():
    """Get list of all chat sessions"""
    global history_manager
    
    try:
        sessions = history_manager.get_all_sessions()
        
        return jsonify({
            "success": True,
            "sessions": sessions,
            "total_sessions": len(sessions)
        })
        
    except Exception as e:
        print(f"Error getting sessions: {e}")
        return jsonify({"error": "Failed to get sessions: " + str(e)}), 500

@app.route("/history/search", methods=["POST"])
def search_chat_history():
    """Search chat history by content"""
    global history_manager, default_session_id
    
    try:
        data = request.json
        query = data.get("query", "")
        session_id = data.get("session_id")  # Optional, defaults to current session
        limit = data.get("limit", 50)
        
        if not query:
            return jsonify({"error": "No search query provided"}), 400
        
        # Use current session if no specific session provided
        search_session_id = session_id if session_id else default_session_id
        
        results = history_manager.search_messages(
            query=query,
            session_id=search_session_id,
            limit=limit
        )
        
        return jsonify({
            "success": True,
            "query": query,
            "session_id": search_session_id,
            "results": results,
            "total_results": len(results)
        })
        
    except Exception as e:
        print(f"Error searching chat history: {e}")
        return jsonify({"error": "Failed to search chat history: " + str(e)}), 500

@app.route("/history/statistics", methods=["GET"])
def get_chat_statistics():
    """Get chat history statistics"""
    global history_manager
    
    try:
        stats = history_manager.get_statistics()
        
        return jsonify({
            "success": True,
            "statistics": stats
        })
        
    except Exception as e:
        print(f"Error getting statistics: {e}")
        return jsonify({"error": "Failed to get statistics: " + str(e)}), 500

@app.route("/history/export", methods=["GET"])
def export_chat_history():
    """Export chat history as JSON"""
    global history_manager, default_session_id
    
    try:
        # Get session ID from query params or use default
        session_id = request.args.get('session_id', default_session_id)
        
        # Get full history for the session
        history = history_manager.get_session_history(session_id=session_id)
        
        # Prepare export data
        export_data = {
            "export_timestamp": time.time(),
            "export_date": datetime.now().isoformat(),
            "session_id": session_id,
            "total_messages": len(history),
            "messages": history
        }
        
        return jsonify({
            "success": True,
            "export_data": export_data
        })
        
    except Exception as e:
        print(f"Error exporting chat history: {e}")
        return jsonify({"error": "Failed to export chat history: " + str(e)}), 500

@app.route("/history/clear", methods=["POST"])
def clear_chat_history():
    """Clear chat history for current session"""
    global history_manager, default_session_id
    
    try:
        # Delete the session and all its messages
        success = history_manager.delete_session(default_session_id)
        
        if success:
            return jsonify({
                "success": True,
                "message": f"Chat history cleared for session {default_session_id}"
            })
        else:
            return jsonify({
                "success": False,
                "message": "No chat history found to clear"
            })
        
    except Exception as e:
        print(f"Error clearing chat history: {e}")
        return jsonify({"error": "Failed to clear chat history: " + str(e)}), 500

    
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=5500)
    args = parser.parse_args()
    app.run(host='0.0.0.0', port=args.port, debug=False)
