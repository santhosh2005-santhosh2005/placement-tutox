import os
import json
from typing import List, Dict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class RelatedTopicsRecommender:
    def __init__(self):
        """Initialize the Related Topics Recommender with AI model."""
        self.api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("YOUTUBE_API_KEY")
        
        # Initialize AI model for generating related topics
        try:
            self.llm = ChatGoogleGenerativeAI(
                model="models/gemini-2.0-flash", 
                google_api_key=self.api_key
            )
        except Exception as e:
            print(f"Warning: Could not initialize AI model for Related Topics Recommender: {e}")
            self.llm = None
    
    def get_related_topics(self, topic: str, max_results: int = 5) -> List[Dict]:
        """
        Generate related topics for a given topic using AI.
        
        Args:
            topic (str): The main topic
            max_results (int): Maximum number of related topics to return
            
        Returns:
            List[Dict]: List of related topics with titles and descriptions
        """
        if not self.llm:
            # Fallback to predefined related topics
            return self._get_default_related_topics(topic, max_results)
        
        try:
            # Create prompt for generating related topics
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert at identifying related topics and subtopics. "
                         "Given a main topic, generate a list of {max_results} related topics or subtopics "
                         "that would be useful for someone learning about the main topic. "
                         "For each related topic, provide a title and a brief description (1-2 sentences). "
                         "Return your response as a JSON array of objects with 'title' and 'description' fields. "
                         "Example format: "
                         "[{\"title\": \"Subtopic 1\", \"description\": \"Brief description of subtopic 1\"}, "
                         "{\"title\": \"Subtopic 2\", \"description\": \"Brief description of subtopic 2\"}]"),
                ("human", "Main topic: {topic}\n\nGenerate {max_results} related topics:")
            ])
            
            # Generate related topics using AI
            chain = prompt | self.llm | StrOutputParser()
            response = chain.invoke({
                "topic": topic,
                "max_results": max_results
            })
            
            # Try to parse the response as JSON
            try:
                related_topics = json.loads(response)
                # Ensure we have the right format
                validated_topics = []
                for item in related_topics:
                    if isinstance(item, dict) and "title" in item and "description" in item:
                        validated_topics.append({
                            "title": item["title"],
                            "description": item["description"]
                        })
                return validated_topics[:max_results]
            except json.JSONDecodeError:
                # If JSON parsing fails, create topics from plain text
                return self._parse_plain_text_response(response, max_results)
                
        except Exception as e:
            print(f"Error generating related topics: {e}")
            # Fallback to predefined related topics
            return self._get_default_related_topics(topic, max_results)
    
    def _parse_plain_text_response(self, response: str, max_results: int) -> List[Dict]:
        """
        Parse plain text response into structured topics.
        
        Args:
            response (str): Plain text response from AI
            max_results (int): Maximum number of topics to return
            
        Returns:
            List[Dict]: List of related topics
        """
        lines = response.strip().split('\n')
        topics = []
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('[') and not line.startswith(']'):
                # Try to split on colon or dash
                if ':' in line:
                    parts = line.split(':', 1)
                    title = parts[0].strip().strip('1234567890. ')
                    description = parts[1].strip()
                elif '-' in line:
                    parts = line.split('-', 1)
                    title = parts[0].strip().strip('1234567890. ')
                    description = parts[1].strip()
                else:
                    title = line
                    description = f"Learn more about {line}"
                
                if title:
                    topics.append({
                        "title": title,
                        "description": description
                    })
        
        return topics[:max_results]
    
    def _get_default_related_topics(self, topic: str, max_results: int) -> List[Dict]:
        """
        Generate default related topics when AI is not available.
        
        Args:
            topic (str): The main topic
            max_results (int): Maximum number of related topics to return
            
        Returns:
            List[Dict]: List of default related topics
        """
        # Predefined related topics based on common subjects
        topic_mapping = {
            "machine learning": [
                {"title": "Deep Learning", "description": "Neural networks with multiple layers for complex pattern recognition"},
                {"title": "Supervised Learning", "description": "Training models with labeled data to make predictions"},
                {"title": "Unsupervised Learning", "description": "Finding hidden patterns in data without labeled examples"},
                {"title": "Reinforcement Learning", "description": "Training agents to make decisions through trial and error"},
                {"title": "Natural Language Processing", "description": "Teaching computers to understand and process human language"}
            ],
            "python": [
                {"title": "Data Science with Python", "description": "Using Python libraries for data analysis and visualization"},
                {"title": "Web Development", "description": "Building websites and web applications with Python frameworks"},
                {"title": "Automation Scripts", "description": "Writing Python scripts to automate repetitive tasks"},
                {"title": "Object-Oriented Programming", "description": "Advanced Python concepts for structuring code"},
                {"title": "Machine Learning", "description": "Building AI models with Python libraries like scikit-learn"}
            ],
            "data science": [
                {"title": "Data Visualization", "description": "Creating charts and graphs to understand data patterns"},
                {"title": "Statistical Analysis", "description": "Using statistics to draw insights from data"},
                {"title": "Big Data", "description": "Processing and analyzing large datasets"},
                {"title": "Machine Learning", "description": "Building predictive models from data"},
                {"title": "Data Engineering", "description": "Designing systems for data collection and processing"}
            ]
        }
        
        # Return specific topics if available, otherwise generic ones
        if topic.lower() in topic_mapping:
            return topic_mapping[topic.lower()][:max_results]
        else:
            return [
                {"title": f"Advanced {topic.title()}", "description": f"Deep dive into advanced concepts of {topic}"},
                {"title": f"{topic.title()} Applications", "description": f"Real-world applications and use cases of {topic}"},
                {"title": f"{topic.title()} Fundamentals", "description": f"Core principles and basics of {topic}"},
                {"title": f"Latest in {topic.title()}", "description": f"Recent developments and trends in {topic}"},
                {"title": f"{topic.title()} Best Practices", "description": f"Industry-standard approaches for working with {topic}"}
            ][:max_results]

# Global instance of RelatedTopicsRecommender
related_topics_recommender = RelatedTopicsRecommender()

def get_related_topics(topic: str, max_results: int = 5) -> List[Dict]:
    """
    Get related topics for a given topic.
    
    Args:
        topic (str): The main topic
        max_results (int): Maximum number of related topics to return
        
    Returns:
        List[Dict]: List of related topics
    """
    return related_topics_recommender.get_related_topics(topic, max_results)