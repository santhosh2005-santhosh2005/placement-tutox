"""
Quick Visual Generation Test and Troubleshooter
"""

import sys
import os
import requests
import json

# Test the visual generation endpoints directly
def test_visual_endpoint():
    """Test the visual generation endpoint"""
    base_url = "http://127.0.0.1:5500"
    
    test_cases = [
        {
            "name": "Simple Chart Request",
            "data": {"query": "show me a chart", "visual_type": "bar"}
        },
        {
            "name": "Diagram Request", 
            "data": {"query": "create a flowchart for user registration", "visual_type": "flowchart"}
        },
        {
            "name": "Auto Detection",
            "data": {"query": "visualize the data", "visual_type": "auto"}
        },
        {
            "name": "Educational Visual",
            "data": {"query": "explain mathematics", "visual_type": "general"}
        },
        {
            "name": "Sample Data Chart",
            "data": {
                "query": "sales data", 
                "visual_type": "bar",
                "chart_data": {
                    "x": ["Q1", "Q2", "Q3", "Q4"],
                    "y": [100, 150, 120, 180],
                    "title": "Quarterly Sales",
                    "xlabel": "Quarter",
                    "ylabel": "Sales ($k)"
                }
            }
        }
    ]
    
    print("🔍 Testing Visual Generation Endpoints")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing: {test_case['name']}")
        print(f"   Query: {test_case['data'].get('query', 'N/A')}")
        
        try:
            response = requests.post(
                f"{base_url}/generate-visual",
                json=test_case['data'],
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    visual_data_length = len(result.get('visual_data', ''))
                    print(f"   ✅ SUCCESS - Visual generated ({visual_data_length:,} characters)")
                else:
                    print(f"   ❌ FAILED - {result.get('message', 'Unknown error')}")
                    if 'debug_info' in result:
                        print(f"   Debug: {result['debug_info']}")
            else:
                print(f"   ❌ HTTP ERROR - Status: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('error', 'Unknown error')}")
                except:
                    print(f"   Error: {response.text}")
                    
        except requests.exceptions.ConnectionError:
            print(f"   ❌ CONNECTION ERROR - Flask server not running on {base_url}")
            print("   💡 Make sure to start the Flask server first!")
            break
        except requests.exceptions.Timeout:
            print(f"   ⏰ TIMEOUT - Request took longer than 30 seconds")
        except Exception as e:
            print(f"   ❌ EXCEPTION - {str(e)}")

def test_local_generation():
    """Test visual generation locally without Flask"""
    print("\n🔬 Testing Local Visual Generation")
    print("=" * 50)
    
    try:
        # Add path to import the module
        sys.path.append(os.path.join(os.path.dirname(__file__), 'aiFeatures', 'python'))
        from visual_generator import VisualContentGenerator
        
        generator = VisualContentGenerator()
        
        # Test cases
        test_cases = [
            ("Bar Chart", lambda: generator.generate_chart({
                'x': ['A', 'B', 'C'], 
                'y': [10, 20, 15],
                'title': 'Test Chart'
            }, 'bar')),
            ("Flowchart", lambda: generator.generate_simple_diagram('flowchart', 
                "1. Start process\\n2. Get input\\n3. Process data\\n4. Return result")),
            ("Educational Visual", lambda: generator.generate_educational_visual('mathematics', 'general')),
            ("Fallback Visual", lambda: generator._create_fallback_visual('test topic'))
        ]
        
        for name, test_func in test_cases:
            print(f"\nTesting {name}:")
            try:
                result = test_func()
                if result and result.startswith('data:image/png;base64,'):
                    print(f"   ✅ SUCCESS - Generated {len(result):,} characters")
                else:
                    print(f"   ❌ FAILED - No valid image data returned")
            except Exception as e:
                print(f"   ❌ ERROR - {str(e)}")
                import traceback
                traceback.print_exc()
                
    except ImportError as e:
        print(f"   ❌ IMPORT ERROR - {str(e)}")
        print("   💡 Make sure you're running this from the AI-Tutor directory")
    except Exception as e:
        print(f"   ❌ GENERAL ERROR - {str(e)}")

def check_dependencies():
    """Check if all required dependencies are installed"""
    print("\n📦 Checking Dependencies")
    print("=" * 50)
    
    required_packages = [
        'matplotlib', 'seaborn', 'plotly', 'pandas', 'numpy', 'pillow'
    ]
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"   ✅ {package} - Installed")
        except ImportError:
            print(f"   ❌ {package} - Missing")
            print(f"      Install with: pip install {package}")

def show_solutions():
    """Show common solutions for visual generation issues"""
    print("\n💡 Common Solutions")
    print("=" * 50)
    
    solutions = [
        "1. Check Flask Server Status:",
        "   - Make sure Flask is running on http://127.0.0.1:5500",
        "   - Look for any error messages in the terminal",
        "",
        "2. Check Dependencies:",
        "   - Run: pip install matplotlib seaborn plotly pandas numpy pillow",
        "   - Restart Flask server after installing packages",
        "",
        "3. Check Query Format:",
        "   - Try: 'show me a chart of data'",
        "   - Try: 'create a diagram for process flow'", 
        "   - Try: 'visualize this information'",
        "",
        "4. Check Visual Controls:",
        "   - Click the chart icon button in the UI",
        "   - Select a specific visual type",
        "   - Try manual generation instead of automatic",
        "",
        "5. Backend Issues:",
        "   - Check Flask terminal for Python errors",
        "   - Verify matplotlib backend works (not headless)",
        "   - Check file permissions for image generation",
        "",
        "6. Frontend Issues:",
        "   - Open browser developer tools (F12)",
        "   - Check Console tab for JavaScript errors",
        "   - Check Network tab for failed requests"
    ]
    
    for solution in solutions:
        print(solution)

if __name__ == "__main__":
    print("🚀 AI Tutor Visual Generation Troubleshooter")
    print("=" * 60)
    
    # Run all tests
    check_dependencies()
    test_local_generation()
    test_visual_endpoint()
    show_solutions()
    
    print("\n✨ Troubleshooting Complete!")
    print("If issues persist, check the Flask terminal for detailed error messages.")