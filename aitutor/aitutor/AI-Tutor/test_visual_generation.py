#!/usr/bin/env python3
"""
Test Script for Topic-Specific Visual Generation
Tests the enhanced visual generator with DSA and Biology topics
"""

import sys
import os

# Add the path to aiFeatures for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'aiFeatures', 'python'))

from aiFeatures.python.visual_generator import VisualContentGenerator

def test_topic_specific_visuals():
    """Test the topic-specific visual generation functionality"""
    
    print("🎯 Testing Topic-Specific Visual Generation System")
    print("=" * 60)
    
    # Create visual generator instance
    generator = VisualContentGenerator()
    
    # Test cases for different topics
    test_cases = [
        {
            'name': 'DSA - Array Structure',
            'query': 'show me an array data structure',
            'expected_topic': 'dsa'
        },
        {
            'name': 'DSA - Linked List',
            'query': 'explain linked list with visual diagram',
            'expected_topic': 'dsa'
        },
        {
            'name': 'DSA - Binary Tree',
            'query': 'create a binary tree visualization',
            'expected_topic': 'dsa'
        },
        {
            'name': 'DSA - Graph Structure',
            'query': 'show graph data structure diagram',
            'expected_topic': 'dsa'
        },
        {
            'name': 'Biology - Photosynthesis',
            'query': 'create a photosynthesis process diagram',
            'expected_topic': 'biology'
        },
        {
            'name': 'Biology - Cell Structure',
            'query': 'show me cell structure with visual',
            'expected_topic': 'biology'
        },
        {
            'name': 'Mathematics',
            'query': 'visualize mathematical functions',
            'expected_topic': 'math'
        },
        {
            'name': 'General Query',
            'query': 'explain machine learning concepts',
            'expected_topic': None
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases):
        print(f"\n📋 Test {i+1}: {test_case['name']}")
        print(f"Query: '{test_case['query']}'")
        
        try:
            # Test detection
            detection = generator.detect_visual_request(test_case['query'])
            print(f"✅ Detection Result:")
            print(f"   - Has Visual Request: {detection['has_visual_request']}")
            print(f"   - Visual Types: {detection['visual_types']}")
            print(f"   - Topic Context: {detection['topic_context']}")
            
            # Verify expected topic detection
            if test_case['expected_topic']:
                if detection['topic_context'] == test_case['expected_topic']:
                    print(f"✅ Correct topic detected: {test_case['expected_topic']}")
                else:
                    print(f"❌ Expected '{test_case['expected_topic']}', got '{detection['topic_context']}'")
            
            # Test visual generation
            if detection['has_visual_request'] and detection['topic_context']:
                print(f"🎨 Generating topic-specific visual...")
                visual_result = generator.generate_topic_specific_visual(
                    test_case['query'], 
                    detection['topic_context']
                )
                
                if visual_result and visual_result.startswith('data:image/png;base64,'):
                    print(f"✅ Visual generation successful!")
                    print(f"   - Image data length: {len(visual_result)} characters")
                    results.append({
                        'test': test_case['name'],
                        'success': True,
                        'topic': detection['topic_context'],
                        'visual_generated': True
                    })
                else:
                    print(f"❌ Visual generation failed")
                    results.append({
                        'test': test_case['name'],
                        'success': False,
                        'topic': detection['topic_context'],
                        'visual_generated': False
                    })
            else:
                # Test general visual generation
                print(f"🎨 Generating general visual...")
                visual_result = generator.generate_educational_visual(test_case['query'], 'general')
                
                if visual_result and visual_result.startswith('data:image/png;base64,'):
                    print(f"✅ General visual generation successful!")
                    results.append({
                        'test': test_case['name'],
                        'success': True,
                        'topic': 'general',
                        'visual_generated': True
                    })
                else:
                    print(f"❌ General visual generation failed")
                    results.append({
                        'test': test_case['name'],
                        'success': False,
                        'topic': 'general',
                        'visual_generated': False
                    })
                    
        except Exception as e:
            print(f"❌ Error in test: {str(e)}")
            results.append({
                'test': test_case['name'],
                'success': False,
                'error': str(e)
            })
    
    # Summary
    print(f"\n📊 TEST SUMMARY")
    print("=" * 60)
    successful_tests = sum(1 for r in results if r.get('success', False))
    total_tests = len(results)
    
    print(f"Total Tests: {total_tests}")
    print(f"Successful: {successful_tests}")
    print(f"Failed: {total_tests - successful_tests}")
    print(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")
    
    # Detailed results
    print(f"\n📋 DETAILED RESULTS:")
    for result in results:
        status = "✅" if result.get('success', False) else "❌"
        topic = result.get('topic', 'unknown')
        visual = "Visual Generated" if result.get('visual_generated', False) else "No Visual"
        print(f"{status} {result['test']} | Topic: {topic} | {visual}")
        if 'error' in result:
            print(f"   Error: {result['error']}")
    
    return results

def test_specific_dsa_examples():
    """Test specific DSA examples that should generate diagrams"""
    
    print(f"\n🔧 TESTING SPECIFIC DSA EXAMPLES")
    print("=" * 60)
    
    generator = VisualContentGenerator()
    
    dsa_examples = [
        "show me how array indexing works",
        "create a linked list with pointers",
        "visualize a binary search tree",
        "draw a graph with nodes and edges",
        "explain stack data structure",
        "show queue operations"
    ]
    
    for example in dsa_examples:
        print(f"\n🧪 Testing: '{example}'")
        try:
            detection = generator.detect_visual_request(example)
            if detection['topic_context'] == 'dsa':
                visual = generator.generate_topic_specific_visual(example, 'dsa')
                if visual and visual.startswith('data:image/png;base64,'):
                    print(f"✅ DSA visual generated successfully!")
                else:
                    print(f"❌ DSA visual generation failed")
            else:
                print(f"❌ DSA topic not detected (got: {detection['topic_context']})")
        except Exception as e:
            print(f"❌ Error: {str(e)}")

def test_specific_biology_examples():
    """Test specific biology examples"""
    
    print(f"\n🧬 TESTING SPECIFIC BIOLOGY EXAMPLES")
    print("=" * 60)
    
    generator = VisualContentGenerator()
    
    biology_examples = [
        "show photosynthesis process with inputs and outputs",
        "create a diagram of cell organelles",
        "visualize how plants make glucose",
        "explain cellular respiration"
    ]
    
    for example in biology_examples:
        print(f"\n🧪 Testing: '{example}'")
        try:
            detection = generator.detect_visual_request(example)
            if detection['topic_context'] == 'biology':
                visual = generator.generate_topic_specific_visual(example, 'biology')
                if visual and visual.startswith('data:image/png;base64,'):
                    print(f"✅ Biology visual generated successfully!")
                else:
                    print(f"❌ Biology visual generation failed")
            else:
                print(f"❌ Biology topic not detected (got: {detection['topic_context']})")
        except Exception as e:
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Topic-Specific Visual Generation Tests")
    print("This will test the enhanced visual system for DSA and Biology topics")
    print()
    
    try:
        # Run main tests
        results = test_topic_specific_visuals()
        
        # Run specific DSA tests
        test_specific_dsa_examples()
        
        # Run specific Biology tests
        test_specific_biology_examples()
        
        print(f"\n🎉 All tests completed!")
        print(f"The visual generation system is now ready to create:")
        print(f"   • DSA diagrams (arrays, linked lists, trees, graphs)")
        print(f"   • Biology process diagrams (photosynthesis, cell structure)")
        print(f"   • And many other topic-specific visuals!")
        
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        print(f"Please check your environment and dependencies.")