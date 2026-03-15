"""
Test script for visual content generation functionality
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from aiFeatures.python.visual_generator import VisualContentGenerator
import json

def test_visual_detection():
    """Test visual content detection"""
    print("Testing visual content detection...")
    
    generator = VisualContentGenerator()
    
    test_queries = [
        "Show me a chart of sales data",
        "Create a diagram of the process",
        "I need a timeline of historical events", 
        "Compare these two options",
        "Just answer my question about math",
        "Visualize the data: A=10, B=20, C=15"
    ]
    
    for query in test_queries:
        detection = generator.detect_visual_request(query)
        print(f"Query: '{query}'")
        print(f"  Has visual request: {detection['has_visual_request']}")
        print(f"  Visual types: {detection['visual_types']}")
        print()

def test_chart_generation():
    """Test chart generation"""
    print("Testing chart generation...")
    
    generator = VisualContentGenerator()
    
    # Test data for bar chart
    test_data = {
        'x': ['Q1', 'Q2', 'Q3', 'Q4'],
        'y': [100, 150, 120, 180],
        'title': 'Quarterly Sales',
        'xlabel': 'Quarter',
        'ylabel': 'Sales ($k)'
    }
    
    chart_result = generator.generate_chart(test_data, 'bar')
    
    if chart_result:
        print("✅ Bar chart generated successfully")
        print(f"   Data URL length: {len(chart_result)} characters")
    else:
        print("❌ Failed to generate bar chart")

def test_diagram_generation():
    """Test diagram generation"""
    print("Testing diagram generation...")
    
    generator = VisualContentGenerator()
    
    test_content = """
    1. Start the process
    2. Collect user input
    3. Process the data
    4. Generate output
    5. Display results
    """
    
    diagram_result = generator.generate_simple_diagram('flowchart', test_content)
    
    if diagram_result:
        print("✅ Flowchart diagram generated successfully")
        print(f"   Data URL length: {len(diagram_result)} characters")
    else:
        print("❌ Failed to generate flowchart diagram")

def test_educational_visual():
    """Test educational visual generation"""
    print("Testing educational visual generation...")
    
    generator = VisualContentGenerator()
    
    visual_result = generator.generate_educational_visual('math', 'function')
    
    if visual_result:
        print("✅ Educational visual generated successfully")
        print(f"   Data URL length: {len(visual_result)} characters")
    else:
        print("❌ Failed to generate educational visual")

if __name__ == "__main__":
    print("🔍 Running Visual Content Generator Tests\n")
    print("=" * 50)
    
    try:
        test_visual_detection()
        print("=" * 50)
        test_chart_generation()
        print("=" * 50)
        test_diagram_generation()
        print("=" * 50)
        test_educational_visual()
        print("=" * 50)
        print("✅ All tests completed!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()