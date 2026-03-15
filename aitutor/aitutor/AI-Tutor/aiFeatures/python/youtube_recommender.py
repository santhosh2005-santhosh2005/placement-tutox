import os
import requests
import urllib.parse
from typing import List, Dict, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

class YouTubeRecommender:
    def __init__(self):
        """Initialize the YouTube Recommender with API key and AI model."""
        # Try to get YouTube API key, fallback to Google API key
        self.api_key = os.getenv("YOUTUBE_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            print("Warning: No API key found for YouTube Recommender. Using placeholder functionality.")
        
        # Initialize AI model for generating search queries
        try:
            self.llm = ChatGoogleGenerativeAI(
                model="models/gemini-2.0-flash", 
                google_api_key=self.api_key
            )
        except Exception as e:
            print(f"Warning: Could not initialize AI model for YouTube Recommender: {e}")
            self.llm = None
    
    def generate_search_query(self, topic: str) -> str:
        """
        Generate an optimized YouTube search query for a given topic using AI.
        
        Args:
            topic (str): The user's topic of interest
            
        Returns:
            str: Optimized search query for YouTube
        """
        if not self.llm:
            # Fallback to simple query generation
            return f"{topic} tutorial"
        
        try:
            # Create prompt for generating search query
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert at creating effective YouTube search queries. "
                         "Given a topic, generate a concise, specific search query that will "
                         "find the most relevant and high-quality educational videos. "
                         "Focus on tutorials, explanations, and educational content. "
                         "Keep the query under 10 words. Return only the search query, nothing else."),
                ("human", "Topic: {topic}\n\nGenerate an effective YouTube search query:")
            ])
            
            # Generate search query using AI
            search_query = (prompt | self.llm | StrOutputParser()).invoke({
                "topic": topic
            })
            
            return search_query.strip()
        except Exception as e:
            print(f"Error generating search query: {e}")
            # Fallback to simple query
            return f"{topic} tutorial"
    
    def search_youtube_videos(self, query: str, max_results: int = 5) -> List[Dict]:
        """
        Search for YouTube videos based on a query.
        
        Args:
            query (str): Search query
            max_results (int): Maximum number of results to return
            
        Returns:
            List[Dict]: List of video information
        """
        # If no API key is available, return placeholder results
        if not self.api_key:
            return self._get_placeholder_videos(query, max_results)
        
        try:
            # YouTube Data API endpoint
            url = "https://www.googleapis.com/youtube/v3/search"
            
            # Parameters for the API request
            params = {
                "key": self.api_key,
                "q": query,
                "part": "snippet",
                "type": "video",
                "maxResults": min(max_results, 10),  # YouTube API limit
                "order": "relevance",
                "videoDuration": "any",
                "videoDefinition": "any"
            }
            
            # Make the API request with retry logic
            retries = 3
            for attempt in range(retries):
                try:
                    response = requests.get(url, params=params, timeout=15)
                    response.raise_for_status()
                    break
                except requests.exceptions.RequestException as e:
                    if attempt < retries - 1:
                        time.sleep(2 ** attempt)  # Exponential backoff
                        continue
                    else:
                        raise e
            
            # Parse the response
            data = response.json()
            
            # Extract video information
            videos = []
            for item in data.get("items", [])[:max_results]:
                try:
                    video_id = item["id"]["videoId"]
                    snippet = item["snippet"]
                    
                    # Filter out irrelevant videos
                    title = snippet["title"]
                    description = snippet.get("description", "")
                    
                    # Skip videos with irrelevant keywords
                    irrelevant_keywords = ["music", "song", "lyrics", "official video", "mv", "m/v", "audio", "full album"]
                    if any(keyword in title.lower() or (description and keyword in description.lower()) for keyword in irrelevant_keywords):
                        continue
                    
                    # Get the best available thumbnail
                    thumbnails = snippet.get("thumbnails", {})
                    thumbnail_url = ""
                    
                    # Try to get the best quality thumbnail available
                    for quality in ["maxres", "standard", "high", "medium", "default"]:
                        if quality in thumbnails and "url" in thumbnails[quality]:
                            thumbnail_url = thumbnails[quality]["url"]
                            break
                    
                    # Fallback to default YouTube thumbnail
                    if not thumbnail_url:
                        thumbnail_url = f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
                    
                    video_info = {
                        "title": title,
                        "description": description[:200] + "..." if description and len(description) > 200 else (description or "No description available"),
                        "channel": snippet.get("channelTitle", "Unknown Channel"),
                        "published_at": snippet.get("publishedAt", ""),
                        "thumbnail": thumbnail_url,
                        "url": f"https://www.youtube.com/watch?v={video_id}",
                        "video_id": video_id
                    }
                    videos.append(video_info)
                except KeyError as e:
                    print(f"Error processing video item: {e}")
                    continue
            
            # If we didn't get enough videos, pad with placeholder videos
            if len(videos) < max_results:
                additional_videos = self._get_placeholder_videos(query, max_results - len(videos))
                videos.extend(additional_videos)
            
            return videos[:max_results]
            
        except Exception as e:
            print(f"Error searching YouTube videos: {e}")
            # Return placeholder results if API fails
            return self._get_placeholder_videos(query, max_results)
    
    def _get_placeholder_videos(self, query: str, max_results: int) -> List[Dict]:
        """
        Generate placeholder video results when API is not available.
        
        Args:
            query (str): Search query
            max_results (int): Number of results to generate
            
        Returns:
            List[Dict]: Placeholder video information
        """
        # This is a fallback when no API key is available
        # Using well-known educational videos with matching thumbnails and titles
        placeholder_videos = [
            {
                "title": "Python Tutorial for Beginners [Full Course]",
                "description": "Learn Python for web development, data science, and automation. This complete Python tutorial teaches you everything from basic syntax to advanced concepts.",
                "channel": "Programming with Mosh",
                "published_at": "2023-01-01T00:00:00Z",
                "thumbnail": "https://img.youtube.com/vi/_uQrJ0TkZlc/mqdefault.jpg",
                "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
                "video_id": "_uQrJ0TkZlc"
            },
            {
                "title": "Machine Learning Course for Beginners",
                "description": "Complete machine learning course covering linear regression, logistic regression, neural networks, and more. Perfect for beginners in AI and data science.",
                "channel": "freeCodeCamp.org",
                "published_at": "2023-02-01T00:00:00Z",
                "thumbnail": "https://img.youtube.com/vi/GwIo3gDZCVQ/mqdefault.jpg",
                "url": "https://www.youtube.com/watch?v=GwIo3gDZCVQ",
                "video_id": "GwIo3gDZCVQ"
            },
            {
                "title": "Learn JavaScript - Full Course for Beginners",
                "description": "JavaScript tutorial for beginners. Covers variables, functions, objects, arrays, and DOM manipulation. Build interactive web applications.",
                "channel": "freeCodeCamp.org",
                "published_at": "2023-03-01T00:00:00Z",
                "thumbnail": "https://img.youtube.com/vi/PkZNo7MFNFg/mqdefault.jpg",
                "url": "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                "video_id": "PkZNo7MFNFg"
            },
            {
                "title": "Data Science Full Course - Learn Data Science in 10 Hours",
                "description": "Complete data science course covering Python, pandas, numpy, matplotlib, machine learning, and data visualization. Real-world projects included.",
                "channel": "Edureka!",
                "published_at": "2023-04-01T00:00:00Z",
                "thumbnail": "https://img.youtube.com/vi.-hsIXmZUv4/mqdefault.jpg",
                "url": "https://www.youtube.com/watch?v=-hsIXmZUv4",
                "video_id": "-hsIXmZUv4"
            },
            {
                "title": "HTML and CSS Tutorial for 2023",
                "description": "Complete HTML and CSS tutorial for beginners. Learn to build responsive websites with modern CSS techniques including Flexbox and Grid.",
                "channel": "SuperSimpleDev",
                "published_at": "2023-05-01T00:00:00Z",
                "thumbnail": "https://img.youtube.com/vi/salY_Sm6mv4/mqdefault.jpg",
                "url": "https://www.youtube.com/watch?v=salY_Sm6mv4",
                "video_id": "salY_Sm6mv4"
            }
        ]
        
        # Filter placeholder videos to match the topic
        relevant_videos = []
        query_lower = query.lower()
        
        for video in placeholder_videos:
            # Check if the video title or description contains the query topic
            if (query_lower in video["title"].lower() or 
                query_lower in video["description"].lower() or
                query_lower in video["channel"].lower()):
                relevant_videos.append(video)
        
        # If no relevant videos found, return the first N videos
        if not relevant_videos:
            relevant_videos = placeholder_videos[:max_results]
        else:
            # Limit to max_results
            relevant_videos = relevant_videos[:max_results]
        
        # If we still don't have enough videos, duplicate some
        while len(relevant_videos) < max_results and len(placeholder_videos) > 0:
            relevant_videos.append(placeholder_videos[len(relevant_videos) % len(placeholder_videos)])
        
        return relevant_videos[:max_results]
    
    def format_video_recommendations(self, videos: List[Dict]) -> str:
        """
        Format video recommendations as HTML for display.
        
        Args:
            videos (List[Dict]): List of video information
            
        Returns:
            str: HTML formatted video recommendations
        """
        if not videos:
            return "<p>No video recommendations available at this time.</p>"
        
        html = "<div class='youtube-recommendations'>"
        html += "<h3>📺 Recommended YouTube Videos</h3>"
        html += "<div class='video-grid'>"
        
        for video in videos:
            # Ensure thumbnail URL is properly formatted
            thumbnail_url = video['thumbnail']
            if not thumbnail_url.startswith('http'):
                thumbnail_url = f"https://img.youtube.com/vi/{video['video_id']}/mqdefault.jpg"
            
            html += f"""
            <div class='video-card'>
                <a href='{video['url']}' target='_blank' class='video-link'>
                    <img src='{thumbnail_url}' alt='{video['title']}' class='video-thumbnail' onerror="this.src='https://img.youtube.com/vi/{video['video_id']}/mqdefault.jpg'; this.onerror=null;">
                    <div class='video-info'>
                        <h4 class='video-title'>{video['title']}</h4>
                        <p class='video-channel'>{video['channel']}</p>
                        <p class='video-description'>{video['description']}</p>
                    </div>
                </a>
            </div>
            """
        
        html += "</div>"
        html += "</div>"
        
        return html
    
    def get_recommendations(self, topic: str, max_results: int = 5) -> str:
        """
        Get YouTube video recommendations for a given topic.
        
        Args:
            topic (str): The topic to get recommendations for
            max_results (int): Maximum number of results to return
            
        Returns:
            str: HTML formatted video recommendations
        """
        # Generate optimized search query
        search_query = self.generate_search_query(topic)
        print(f"Generated search query: {search_query}")
        
        # Search for videos
        videos = self.search_youtube_videos(search_query, max_results)
        
        # Format and return recommendations
        return self.format_video_recommendations(videos)

# Global instance of YouTubeRecommender
youtube_recommender = YouTubeRecommender()

def get_youtube_recommendations(topic: str, max_results: int = 5) -> str:
    """
    Get YouTube video recommendations for a given topic.
    
    Args:
        topic (str): The topic to get recommendations for
        max_results (int): Maximum number of results to return
        
    Returns:
        str: HTML formatted video recommendations
    """
    return youtube_recommender.get_recommendations(topic, max_results)

# Example usage
if __name__ == "__main__":
    # Example of how to use the YouTube recommender
    recommender = YouTubeRecommender()
    
    # Get recommendations for a topic
    topic = "machine learning"
    recommendations = recommender.get_recommendations(topic)
    
    print(f"Recommendations for '{topic}':")
    print(recommendations)