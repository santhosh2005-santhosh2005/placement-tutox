"""
Visual Content Generator Module for AI Tutor
Generates charts, diagrams, and visual content based on user queries and data
"""

# Set matplotlib to use non-interactive backend before importing pyplot
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for Flask

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import seaborn as sns
import pandas as pd
import numpy as np
import io
import base64
import json
import re
from typing import Dict, List, Any, Optional, Tuple
import os
from datetime import datetime
import plotly.graph_objects as go
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder

# Set style for matplotlib with modern, professional appearance
plt.style.use('seaborn-v0_8-whitegrid')
sns.set_palette("husl")

# Professional color schemes
COLOR_SCHEMES = {
    'modern': ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
    'business': ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#ecf0f1'],
    'education': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
    'data': ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
}

class VisualContentGenerator:
    """Main class for generating visual content"""
    
    def __init__(self):
        self.output_dir = "static/generated_visuals"
        self.ensure_output_directory()
        
    def ensure_output_directory(self):
        """Create output directory if it doesn't exist"""
        os.makedirs(self.output_dir, exist_ok=True)
    
    def _get_color_scheme(self, scheme_name: str = 'modern') -> List[str]:
        """Get a professional color scheme"""
        return COLOR_SCHEMES.get(scheme_name, COLOR_SCHEMES['modern'])
    
    def detect_visual_request(self, query: str) -> Dict[str, Any]:
        """
        Analyze user query to detect if visual content is requested
        Returns dict with visual type and extracted data
        """
        query_lower = query.lower()
        
        # Enhanced visual detection with topic-specific mapping
        visual_keywords = {
            'chart': ['chart', 'graph', 'plot', 'visualize', 'show me'],
            'diagram': ['diagram', 'flowchart', 'process', 'workflow', 'structure'],
            'comparison': ['compare', 'vs', 'versus', 'difference', 'contrast'],
            'timeline': ['timeline', 'chronology', 'sequence', 'history', 'over time'],
            'statistics': ['statistics', 'stats', 'data', 'analysis', 'numbers'],
            'map': ['map', 'location', 'geography', 'regional'],
            'table': ['table', 'tabulate', 'organize', 'list'],
            # Topic-specific visual types
            'dsa': ['array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'heap', 'hash', 'dsa', 'data structure'],
            'biology': ['photosynthesis', 'cell', 'mitosis', 'ecosystem', 'food chain', 'anatomy', 'biology'],
            'chemistry': ['molecule', 'atom', 'reaction', 'bond', 'chemistry', 'compound'],
            'physics': ['circuit', 'wave', 'force', 'energy', 'physics', 'mechanics'],
            'math': ['equation', 'function', 'geometry', 'calculus', 'algebra', 'mathematics'],
            'network': ['network', 'topology', 'architecture', 'system design', 'infrastructure'],
            'algorithm': ['algorithm', 'sorting', 'searching', 'complexity', 'big o']
        }
        
        detected_types = []
        topic_context = None
        
        for visual_type, keywords in visual_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_types.append(visual_type)
                if visual_type in ['dsa', 'biology', 'chemistry', 'physics', 'math', 'network', 'algorithm']:
                    topic_context = visual_type
        
        return {
            'has_visual_request': len(detected_types) > 0,
            'visual_types': detected_types,
            'topic_context': topic_context,
            'query': query
        }
    
    def generate_chart(self, data: Dict[str, Any], chart_type: str = 'bar') -> str:
        """Generate a professional, high-quality chart based on provided data"""
        try:
            # Create figure with modern styling
            fig, ax = plt.subplots(figsize=(12, 8), facecolor='white')
            ax.set_facecolor('#f8f9fa')
            
            # Get colors based on chart type
            colors = self._get_color_scheme('modern')
            
            if chart_type == 'bar':
                if 'x' in data and 'y' in data:
                    bars = ax.bar(data['x'], data['y'], 
                                 color=colors[:len(data['x'])],
                                 edgecolor='white',
                                 linewidth=2,
                                 alpha=0.8)
                    
                    # Add value labels on bars
                    for bar, value in zip(bars, data['y']):
                        height = bar.get_height()
                        ax.text(bar.get_x() + bar.get_width()/2., height + max(data['y']) * 0.01,
                               f'{value}', ha='center', va='bottom', 
                               fontweight='bold', fontsize=11)
                    
                    ax.set_xlabel(data.get('xlabel', 'Categories'), fontsize=14, fontweight='bold')
                    ax.set_ylabel(data.get('ylabel', 'Values'), fontsize=14, fontweight='bold')
                    
                    # Add grid for better readability
                    ax.grid(True, alpha=0.3, axis='y')
            
            elif chart_type == 'line':
                if 'x' in data and 'y' in data:
                    ax.plot(data['x'], data['y'], 
                           marker='o', markersize=8, linewidth=3,
                           color=colors[0], markerfacecolor=colors[1],
                           markeredgecolor='white', markeredgewidth=2)
                    
                    # Add data point labels
                    for i, (x, y) in enumerate(zip(data['x'], data['y'])):
                        ax.text(x, y + max(data['y']) * 0.02, f'{y}', 
                               ha='center', va='bottom', fontweight='bold')
                    
                    ax.set_xlabel(data.get('xlabel', 'X-axis'), fontsize=14, fontweight='bold')
                    ax.set_ylabel(data.get('ylabel', 'Y-axis'), fontsize=14, fontweight='bold')
                    ax.grid(True, alpha=0.3)
            
            elif chart_type == 'pie':
                if 'labels' in data and 'values' in data:
                    wedges, texts, autotexts = ax.pie(data['values'], 
                                                     labels=data['labels'], 
                                                     autopct='%1.1f%%',
                                                     colors=colors[:len(data['values'])],
                                                     startangle=90,
                                                     explode=[0.05] * len(data['values']),
                                                     shadow=True,
                                                     textprops={'fontsize': 12, 'fontweight': 'bold'})
                    
                    # Enhance text appearance
                    for autotext in autotexts:
                        autotext.set_color('white')
                        autotext.set_fontweight('bold')
            
            elif chart_type == 'scatter':
                if 'x' in data and 'y' in data:
                    scatter = ax.scatter(data['x'], data['y'], 
                                       s=100, alpha=0.7, 
                                       c=colors[0], 
                                       edgecolors='white',
                                       linewidth=2)
                    
                    ax.set_xlabel(data.get('xlabel', 'X-axis'), fontsize=14, fontweight='bold')
                    ax.set_ylabel(data.get('ylabel', 'Y-axis'), fontsize=14, fontweight='bold')
                    ax.grid(True, alpha=0.3)
            
            # Professional title styling
            title = data.get('title', 'Generated Chart')
            ax.set_title(title, fontsize=18, fontweight='bold', pad=20, color='#2c3e50')
            
            # Remove top and right spines for cleaner look
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['left'].set_color('#cccccc')
            ax.spines['bottom'].set_color('#cccccc')
            
            # Style tick labels
            ax.tick_params(axis='both', which='major', labelsize=11, colors='#2c3e50')
            
            plt.tight_layout()
            
            # Save to base64 string with high quality
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight', 
                       facecolor='white', edgecolor='none')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            plt.close()
            return f"data:image/png;base64,{image_base64}"
            
        except Exception as e:
            print(f"Error generating chart: {e}")
            return self._create_fallback_visual(f"Chart: {chart_type}")
    
    def generate_simple_diagram(self, diagram_type: str, content: str) -> str:
        """Generate simple diagrams using matplotlib"""
        try:
            fig, ax = plt.subplots(figsize=(12, 8))
            
            if diagram_type == 'flowchart':
                return self._create_flowchart(content)
            elif diagram_type == 'concept_map':
                return self._create_concept_map(content)
            elif diagram_type == 'timeline':
                return self._create_timeline(content)
            
            plt.close()
            return None
            
        except Exception as e:
            print(f"Error generating diagram: {e}")
            return None
    
    def _create_flowchart(self, content: str) -> str:
        """Create a professional flowchart"""
        fig, ax = plt.subplots(figsize=(14, 10), facecolor='white')
        ax.set_facecolor('#f8f9fa')
        
        # Parse steps from content
        steps = self._extract_steps(content)
        colors = self._get_color_scheme('education')
        
        # Calculate positions with better spacing
        y_positions = np.linspace(0.85, 0.15, len(steps))
        x_center = 0.5
        
        for i, step in enumerate(steps):
            # Choose shape based on step type
            color = colors[i % len(colors)]
            
            # Draw enhanced rectangle with gradient effect
            rect = patches.FancyBboxPatch(
                (x_center - 0.2, y_positions[i] - 0.06),
                0.4, 0.12,
                boxstyle="round,pad=0.02",
                facecolor=color,
                edgecolor='white',
                linewidth=3,
                alpha=0.9
            )
            ax.add_patch(rect)
            
            # Add shadow effect
            shadow = patches.FancyBboxPatch(
                (x_center - 0.2 + 0.01, y_positions[i] - 0.06 - 0.01),
                0.4, 0.12,
                boxstyle="round,pad=0.02",
                facecolor='gray',
                alpha=0.3,
                zorder=rect.zorder - 1
            )
            ax.add_patch(shadow)
            
            # Add step number
            circle = patches.Circle((x_center - 0.17, y_positions[i]), 0.03,
                                  facecolor='white', edgecolor=color, linewidth=2)
            ax.add_patch(circle)
            ax.text(x_center - 0.17, y_positions[i], str(i+1), 
                   ha='center', va='center', fontweight='bold', fontsize=10)
            
            # Add text with better formatting
            wrapped_text = self._wrap_text(step, 35)
            ax.text(x_center, y_positions[i], wrapped_text, ha='center', va='center', 
                   fontsize=11, weight='bold', color='white', 
                   bbox=dict(boxstyle="round,pad=0.3", facecolor=color, alpha=0.8))
            
            # Draw professional arrow to next step
            if i < len(steps) - 1:
                arrow = patches.FancyArrowPatch(
                    (x_center, y_positions[i] - 0.08),
                    (x_center, y_positions[i+1] + 0.08),
                    arrowstyle='->', mutation_scale=20, linewidth=3,
                    color='#2c3e50', alpha=0.8
                )
                ax.add_patch(arrow)
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_aspect('equal')
        ax.axis('off')
        ax.set_title('Process Flowchart', fontsize=20, fontweight='bold', 
                    pad=30, color='#2c3e50')
        
        # Save to base64 with high quality
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def _create_concept_map(self, content: str) -> str:
        """Create a concept map"""
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # Extract concepts
        concepts = self._extract_concepts(content)
        
        # Position concepts in a circular layout
        n_concepts = len(concepts)
        angles = np.linspace(0, 2*np.pi, n_concepts, endpoint=False)
        radius = 0.3
        center = (0.5, 0.5)
        
        positions = []
        for i, angle in enumerate(angles):
            x = center[0] + radius * np.cos(angle)
            y = center[1] + radius * np.sin(angle)
            positions.append((x, y))
            
            # Draw concept box
            rect = patches.FancyBboxPatch(
                (x - 0.08, y - 0.04),
                0.16, 0.08,
                boxstyle="round,pad=0.01",
                facecolor='lightgreen',
                edgecolor='darkgreen',
                linewidth=2
            )
            ax.add_patch(rect)
            
            # Add concept text
            ax.text(x, y, concepts[i], ha='center', va='center', 
                   fontsize=9, weight='bold')
        
        # Draw connections
        for i in range(len(positions)):
            for j in range(i + 1, len(positions)):
                x1, y1 = positions[i]
                x2, y2 = positions[j]
                ax.plot([x1, x2], [y1, y2], 'gray', alpha=0.5, linewidth=1)
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_aspect('equal')
        ax.axis('off')
        ax.set_title('Concept Map', fontsize=16, weight='bold', pad=20)
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def _create_timeline(self, content: str) -> str:
        """Create a timeline diagram"""
        fig, ax = plt.subplots(figsize=(14, 6))
        
        # Extract timeline events
        events = self._extract_timeline_events(content)
        
        # Create timeline
        y_center = 0.5
        x_positions = np.linspace(0.1, 0.9, len(events))
        
        # Draw main timeline line
        ax.plot([0.05, 0.95], [y_center, y_center], 'navy', linewidth=3)
        
        for i, (event, x_pos) in enumerate(zip(events, x_positions)):
            # Draw vertical line
            ax.plot([x_pos, x_pos], [y_center - 0.05, y_center + 0.05], 'navy', linewidth=2)
            
            # Draw event box
            y_pos = y_center + 0.15 if i % 2 == 0 else y_center - 0.15
            
            rect = patches.FancyBboxPatch(
                (x_pos - 0.06, y_pos - 0.04),
                0.12, 0.08,
                boxstyle="round,pad=0.01",
                facecolor='lightyellow',
                edgecolor='orange',
                linewidth=2
            )
            ax.add_patch(rect)
            
            # Add event text
            ax.text(x_pos, y_pos, event, ha='center', va='center', 
                   fontsize=8, weight='bold', wrap=True)
            
            # Connect to timeline
            ax.plot([x_pos, x_pos], [y_center + 0.05, y_pos - 0.04], 
                   'orange', linewidth=1, alpha=0.7)
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.set_aspect('equal')
        ax.axis('off')
        ax.set_title('Timeline', fontsize=16, weight='bold', pad=20)
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def generate_educational_visual(self, topic: str, visual_type: str) -> str:
        """Generate educational visuals for common topics"""
        try:
            if visual_type == 'general' or not visual_type:
                # Create a general knowledge visualization
                return self._create_general_visual(topic)
            elif topic.lower() in ['math', 'mathematics', 'equation']:
                return self._create_math_visual(visual_type)
            elif topic.lower() in ['science', 'physics', 'chemistry']:
                return self._create_science_visual(visual_type)
            elif topic.lower() in ['history', 'timeline', 'events']:
                return self._create_history_visual(visual_type)
            else:
                return self._create_generic_educational_visual(topic, visual_type)
        except Exception as e:
            print(f"Error generating educational visual: {e}")
            # Fallback to simple chart generation
            return self._create_fallback_visual(topic)
    
    def _create_math_visual(self, visual_type: str) -> str:
        """Create mathematical visualizations"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        if visual_type == 'function':
            x = np.linspace(-10, 10, 400)
            y1 = x**2
            y2 = 2*x + 1
            y3 = np.sin(x)
            
            ax.plot(x, y1, label='y = x²', linewidth=2)
            ax.plot(x, y2, label='y = 2x + 1', linewidth=2)
            ax.plot(x, y3, label='y = sin(x)', linewidth=2)
            
            ax.grid(True, alpha=0.3)
            ax.axhline(y=0, color='k', linewidth=0.5)
            ax.axvline(x=0, color='k', linewidth=0.5)
            ax.legend()
            ax.set_title('Mathematical Functions', fontsize=16, weight='bold')
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def _extract_steps(self, content: str) -> List[str]:
        """Extract steps from content for flowchart"""
        # Simple extraction - look for numbered lists or bullet points
        lines = content.split('\n')
        steps = []
        
        for line in lines:
            line = line.strip()
            if re.match(r'^\d+\.', line) or line.startswith('•') or line.startswith('-'):
                # Remove numbering and bullets
                clean_line = re.sub(r'^\d+\.\s*', '', line)
                clean_line = re.sub(r'^[•\-]\s*', '', clean_line)
                if clean_line:
                    steps.append(clean_line[:50] + '...' if len(clean_line) > 50 else clean_line)
        
        # If no structured steps found, split into sentences
        if not steps:
            sentences = content.split('. ')
            steps = [s.strip()[:50] + '...' if len(s.strip()) > 50 else s.strip() 
                    for s in sentences[:5] if s.strip()]
        
        return steps if steps else ['Step 1', 'Step 2', 'Step 3']
    
    def _extract_concepts(self, content: str) -> List[str]:
        """Extract key concepts from content"""
        # Simple keyword extraction
        words = content.split()
        # Filter out common words and get unique concepts
        stopwords = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were'}
        concepts = list(set([word.strip('.,!?()[]{}').title() for word in words 
                           if len(word) > 3 and word.lower() not in stopwords]))
        
        return concepts[:8] if len(concepts) >= 8 else concepts + ['Concept'] * (8 - len(concepts))
    
    def _extract_timeline_events(self, content: str) -> List[str]:
        """Extract timeline events from content"""
        # Look for dates or time-related keywords
        lines = content.split('\n')
        events = []
        
        for line in lines:
            if re.search(r'\d{4}|\d{1,2}/\d{1,2}|january|february|march|april|may|june|july|august|september|october|november|december', line.lower()):
                events.append(line.strip()[:30] + '...' if len(line.strip()) > 30 else line.strip())
        
        return events[:6] if events else ['Event 1', 'Event 2', 'Event 3', 'Event 4', 'Event 5']
    
    def _wrap_text(self, text: str, width: int) -> str:
        """Wrap text to specified width"""
        words = text.split()
        lines = []
        current_line = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) + 1 <= width:
                current_line.append(word)
                current_length += len(word) + 1
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
                current_length = len(word)
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return '\n'.join(lines)
    
    def generate_from_data(self, data_text: str) -> Optional[str]:
        """Generate professional visual from structured data in text"""
        try:
            # Try to parse as JSON first
            try:
                data = json.loads(data_text)
                return self.generate_chart(data)
            except:
                # Try to extract numbers and labels from text
                return self._parse_and_visualize_text_data(data_text)
        except Exception as e:
            print(f"Error generating visual from data: {e}")
            # Return a meaningful visualization even if parsing fails
            return self._create_sample_data_chart("Data Visualization")
    
    def _parse_and_visualize_text_data(self, text: str) -> Optional[str]:
        """Parse text data and create appropriate professional visualization"""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Try to extract numerical data from text
        numbers = re.findall(r'\d+(?:\.\d+)?', text)
        
        if numbers and len(numbers) >= 2:
            # Found numerical data, create a chart
            values = [float(num) for num in numbers[:6]]  # Limit to 6 values
            
            # Generate labels based on context
            if 'quarter' in text.lower() or 'q1' in text.lower():
                labels = [f'Q{i+1}' for i in range(len(values))]
                title = 'Quarterly Data Analysis'
            elif 'month' in text.lower():
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
                labels = months[:len(values)]
                title = 'Monthly Data Analysis'
            elif 'year' in text.lower():
                labels = [f'{2020+i}' for i in range(len(values))]
                title = 'Yearly Data Analysis'
            else:
                labels = [f'Item {i+1}' for i in range(len(values))]
                title = 'Data Analysis'
            
            chart_data = {
                'x': labels,
                'y': values,
                'title': title,
                'xlabel': 'Categories',
                'ylabel': 'Values'
            }
            return self.generate_chart(chart_data, 'bar')
        
        # Try to find tabular data
        elif len(lines) >= 2:
            first_line = lines[0]
            if ',' in first_line or '\t' in first_line or '|' in first_line:
                return self._create_table_visualization(lines)
        
        # If no structured data found, create a general visual
        return self._create_sample_data_chart("Data Visualization")
    
    def _create_table_visualization(self, lines: List[str]) -> str:
        """Create a table visualization from text data"""
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # Parse the data
        separator = ',' if ',' in lines[0] else '\t' if '\t' in lines[0] else '|'
        headers = [h.strip() for h in lines[0].split(separator)]
        
        data_rows = []
        for line in lines[1:6]:  # Limit to 5 rows for visibility
            row = [cell.strip() for cell in line.split(separator)]
            data_rows.append(row)
        
        # Create table
        table = ax.table(cellText=data_rows,
                        colLabels=headers,
                        cellLoc='center',
                        loc='center',
                        colColours=['lightblue'] * len(headers))
        
        table.auto_set_font_size(False)
        table.set_fontsize(10)
        table.scale(1.2, 2)
        
        ax.axis('off')
        ax.set_title('Data Table', fontsize=16, weight='bold', pad=20)
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def _create_general_visual(self, topic: str) -> str:
        """Create a professional general visual for any topic"""
        fig, ax = plt.subplots(figsize=(12, 8), facecolor='white')
        ax.set_facecolor('#f8f9fa')
        
        # Create a comprehensive learning progress chart
        categories = ['Understanding', 'Application', 'Analysis', 'Synthesis', 'Evaluation']
        values = [85, 72, 78, 65, 80]  # Realistic learning progression
        colors = self._get_color_scheme('education')
        
        # Create gradient bar chart
        bars = ax.bar(categories, values, 
                     color=colors[:len(categories)],
                     edgecolor='white',
                     linewidth=2,
                     alpha=0.9,
                     width=0.7)
        
        # Add value labels with percentage
        for bar, value in zip(bars, values):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + 2,
                   f'{value}%', ha='center', va='bottom', 
                   fontweight='bold', fontsize=12, color='#2c3e50')
        
        # Add target line
        ax.axhline(y=80, color='red', linestyle='--', linewidth=2, alpha=0.7, label='Target (80%)')
        
        # Professional styling
        ax.set_title(f'Learning Progress Analysis: {topic.title()}', 
                    fontsize=18, fontweight='bold', pad=25, color='#2c3e50')
        ax.set_ylabel('Proficiency Level (%)', fontsize=14, fontweight='bold', color='#2c3e50')
        ax.set_xlabel('Learning Domains', fontsize=14, fontweight='bold', color='#2c3e50')
        ax.set_ylim(0, 100)
        
        # Enhanced grid and styling
        ax.grid(axis='y', alpha=0.3, linestyle='--')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_color('#cccccc')
        ax.spines['bottom'].set_color('#cccccc')
        
        # Add legend
        ax.legend(loc='upper right', frameon=True, fancybox=True, shadow=True)
        
        # Style tick labels
        plt.xticks(rotation=45, fontsize=11, color='#2c3e50')
        plt.yticks(fontsize=11, color='#2c3e50')
        
        plt.tight_layout()
        
        # Save to base64 with high quality
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def _create_fallback_visual(self, topic: str) -> str:
        """Create a simple fallback visual when other methods fail"""
        try:
            fig, ax = plt.subplots(figsize=(8, 6))
            
            # Create a simple text-based visual
            ax.text(0.5, 0.7, f'📊 Visual Content', ha='center', va='center', 
                   fontsize=20, weight='bold', transform=ax.transAxes)
            ax.text(0.5, 0.5, f'Topic: {topic}', ha='center', va='center', 
                   fontsize=16, transform=ax.transAxes)
            ax.text(0.5, 0.3, 'Generated by AI Tutor', ha='center', va='center', 
                   fontsize=12, style='italic', transform=ax.transAxes)
            
            # Add a simple decorative element
            circle = patches.Circle((0.5, 0.1), 0.05, transform=ax.transAxes, 
                                  facecolor='lightblue', edgecolor='navy')
            ax.add_patch(circle)
            
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.axis('off')
            
            plt.tight_layout()
            
            # Save to base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            plt.close()
            return f"data:image/png;base64,{image_base64}"
            
        except Exception as e:
            print(f"Error in fallback visual generation: {e}")
            return None
    
    def _create_generic_educational_visual(self, topic: str, visual_type: str) -> str:
        """Create a generic educational visual"""
        try:
            if 'data' in topic.lower() or 'chart' in visual_type:
                return self._create_sample_data_chart(topic)
            else:
                return self._create_general_visual(topic)
        except Exception as e:
            print(f"Error in generic educational visual: {e}")
            return self._create_fallback_visual(topic)
    
    def _create_sample_data_chart(self, topic: str) -> str:
        """Create a professional sample data chart for demonstration"""
        fig, ax = plt.subplots(figsize=(12, 8), facecolor='white')
        ax.set_facecolor('#f8f9fa')
        
        # Generate diverse sample data based on topic
        if 'sales' in topic.lower() or 'business' in topic.lower():
            categories = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024']
            values = [125, 180, 165, 220]
            title = f'Quarterly Performance Analysis'
            ylabel = 'Revenue (in thousands)'
        elif 'student' in topic.lower() or 'grade' in topic.lower():
            categories = ['Math', 'Science', 'English', 'History', 'Art']
            values = [92, 88, 95, 85, 90]
            title = f'Student Performance by Subject'
            ylabel = 'Average Score (%)'
        else:
            categories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E']
            values = [65, 89, 78, 92, 56]
            title = f'Data Analysis: {topic.title()}'
            ylabel = 'Values'
        
        colors = self._get_color_scheme('modern')
        
        # Create enhanced bar chart
        bars = ax.bar(categories, values, 
                     color=colors[:len(categories)],
                     edgecolor='white',
                     linewidth=2,
                     alpha=0.8,
                     width=0.6)
        
        # Add value labels with better formatting
        for bar, value in zip(bars, values):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height + max(values) * 0.01,
                   f'{value}', ha='center', va='bottom', 
                   fontweight='bold', fontsize=12, color='#2c3e50')
        
        # Professional styling
        ax.set_title(title, fontsize=18, fontweight='bold', pad=25, color='#2c3e50')
        ax.set_xlabel('Categories', fontsize=14, fontweight='bold', color='#2c3e50')
        ax.set_ylabel(ylabel, fontsize=14, fontweight='bold', color='#2c3e50')
        
        # Enhanced grid and styling
        ax.grid(axis='y', alpha=0.3, linestyle='--')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_color('#cccccc')
        ax.spines['bottom'].set_color('#cccccc')
        
        # Rotate x-axis labels for better readability
        plt.xticks(rotation=0 if len(max(categories, key=len)) < 8 else 45, 
                  fontsize=11, color='#2c3e50')
        plt.yticks(fontsize=11, color='#2c3e50')
        
        plt.tight_layout()
        
        # Save to base64 with high quality
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def generate_topic_specific_visual(self, query: str, topic_context: str) -> str:
        """Generate visuals based on specific academic/technical topics"""
        try:
            if topic_context == 'dsa':
                return self._create_dsa_visual(query)
            elif topic_context == 'biology':
                return self._create_biology_visual(query)
            elif topic_context == 'chemistry':
                return self._create_chemistry_visual(query)
            elif topic_context == 'physics':
                return self._create_physics_visual(query)
            elif topic_context == 'math':
                return self._create_math_visual('function')
            elif topic_context == 'network':
                return self._create_network_visual(query)
            elif topic_context == 'algorithm':
                return self._create_algorithm_visual(query)
            else:
                return self._create_general_visual(query)
        except Exception as e:
            print(f"Error generating topic-specific visual: {e}")
            return self._create_fallback_visual(f"Topic: {topic_context}")
    
    def _create_dsa_visual(self, query: str) -> str:
        """Create Data Structure and Algorithm visualizations"""
        fig, ax = plt.subplots(figsize=(14, 10), facecolor='white')
        ax.set_facecolor('#f8f9fa')
        
        query_lower = query.lower()
        colors = self._get_color_scheme('data')
        
        if 'array' in query_lower:
            # Draw array visualization
            array_size = 6
            array_values = [23, 45, 12, 67, 89, 34]
            
            for i in range(array_size):
                # Draw array box
                rect = patches.Rectangle((i * 0.12 + 0.2, 0.4), 0.1, 0.2, 
                                       facecolor=colors[i % len(colors)], 
                                       edgecolor='black', linewidth=2)
                ax.add_patch(rect)
                
                # Add value
                ax.text(i * 0.12 + 0.25, 0.5, str(array_values[i]), 
                       ha='center', va='center', fontweight='bold', fontsize=12)
                
                # Add index
                ax.text(i * 0.12 + 0.25, 0.35, f'[{i}]', 
                       ha='center', va='center', fontsize=10, color='#666')
            
            ax.set_title('Array Data Structure', fontsize=20, fontweight='bold', pad=30)
            
        elif 'linked list' in query_lower:
            # Draw linked list visualization
            nodes = ['10', '20', '30', '40', 'NULL']
            
            for i in range(len(nodes)-1):
                x_pos = i * 0.18 + 0.1
                
                # Draw node box
                rect = patches.FancyBboxPatch((x_pos, 0.4), 0.12, 0.2,
                                            boxstyle="round,pad=0.02",
                                            facecolor=colors[i % len(colors)],
                                            edgecolor='black', linewidth=2)
                ax.add_patch(rect)
                
                # Add data
                ax.text(x_pos + 0.06, 0.5, nodes[i], ha='center', va='center', 
                       fontweight='bold', fontsize=12, color='white')
                
                # Draw arrow to next node
                if i < len(nodes) - 2:
                    arrow = patches.FancyArrowPatch((x_pos + 0.12, 0.5), 
                                                  (x_pos + 0.18, 0.5),
                                                  arrowstyle='->', mutation_scale=20,
                                                  color='#2c3e50', linewidth=3)
                    ax.add_patch(arrow)
            
            # Draw NULL
            ax.text(0.82, 0.5, 'NULL', ha='center', va='center', 
                   fontweight='bold', fontsize=12, color='red')
            
            ax.set_title('Linked List Data Structure', fontsize=20, fontweight='bold', pad=30)
            
        elif 'tree' in query_lower or 'binary' in query_lower:
            # Draw binary tree
            self._draw_binary_tree(ax, colors)
            ax.set_title('Binary Tree Data Structure', fontsize=20, fontweight='bold', pad=30)
            
        elif 'graph' in query_lower:
            # Draw graph visualization
            self._draw_graph_structure(ax, colors)
            ax.set_title('Graph Data Structure', fontsize=20, fontweight='bold', pad=30)
            
        else:
            # General DSA overview
            ax.text(0.5, 0.7, '🔧 Data Structures & Algorithms', ha='center', va='center',
                   fontsize=24, fontweight='bold', transform=ax.transAxes)
            ax.text(0.5, 0.5, 'Arrays • Linked Lists • Trees • Graphs\nStacks • Queues • Hash Tables', 
                   ha='center', va='center', fontsize=16, transform=ax.transAxes)
            ax.text(0.5, 0.3, 'Sorting • Searching • Dynamic Programming', 
                   ha='center', va='center', fontsize=14, transform=ax.transAxes, style='italic')
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def _create_biology_visual(self, query: str) -> str:
        """Create biology process visualizations"""
        fig, ax = plt.subplots(figsize=(14, 10), facecolor='white')
        ax.set_facecolor('#e8f5e8')  # Light green background for biology
        
        query_lower = query.lower()
        colors = self._get_color_scheme('education')
        
        if 'photosynthesis' in query_lower:
            # Draw photosynthesis process
            ax.set_title('Photosynthesis Process', fontsize=20, fontweight='bold', pad=30, color='#2d5016')
            
            # Draw sun
            sun = patches.Circle((0.15, 0.8), 0.08, facecolor='#FFD700', edgecolor='#FF8C00', linewidth=3)
            ax.add_patch(sun)
            ax.text(0.15, 0.8, '☀️', ha='center', va='center', fontsize=20)
            ax.text(0.15, 0.65, 'Sunlight\n(Energy)', ha='center', va='center', fontsize=10, fontweight='bold')
            
            # Draw leaf
            leaf = patches.Ellipse((0.5, 0.5), 0.3, 0.4, facecolor='#228B22', edgecolor='#006400', linewidth=3)
            ax.add_patch(leaf)
            ax.text(0.5, 0.5, '🍃\nChloroplast', ha='center', va='center', fontsize=14, fontweight='bold', color='white')
            
            # Draw CO2 input
            ax.text(0.15, 0.3, 'CO₂', ha='center', va='center', fontsize=16, fontweight='bold', color='#666')
            ax.text(0.15, 0.25, '(Carbon Dioxide)', ha='center', va='center', fontsize=8)
            
            # Draw H2O input
            ax.text(0.5, 0.15, 'H₂O', ha='center', va='center', fontsize=16, fontweight='bold', color='#4169E1')
            ax.text(0.5, 0.1, '(Water)', ha='center', va='center', fontsize=8)
            
            # Draw glucose output
            ax.text(0.85, 0.6, 'C₆H₁₂O₆', ha='center', va='center', fontsize=14, fontweight='bold', color='#8B4513')
            ax.text(0.85, 0.55, '(Glucose)', ha='center', va='center', fontsize=8)
            
            # Draw oxygen output
            ax.text(0.85, 0.3, 'O₂', ha='center', va='center', fontsize=16, fontweight='bold', color='#00CED1')
            ax.text(0.85, 0.25, '(Oxygen)', ha='center', va='center', fontsize=8)
            
            # Draw arrows
            arrows = [
                ((0.23, 0.75), (0.4, 0.65)),  # Sun to leaf
                ((0.25, 0.32), (0.4, 0.45)),  # CO2 to leaf
                ((0.52, 0.25), (0.52, 0.35)),  # H2O to leaf
                ((0.65, 0.55), (0.75, 0.58)),  # Leaf to glucose
                ((0.65, 0.45), (0.75, 0.32))   # Leaf to oxygen
            ]
            
            for start, end in arrows:
                arrow = patches.FancyArrowPatch(start, end, arrowstyle='->', 
                                              mutation_scale=15, color='#2c3e50', linewidth=2)
                ax.add_patch(arrow)
            
        elif 'cell' in query_lower:
            # Draw cell structure
            self._draw_cell_structure(ax, colors)
            ax.set_title('Cell Structure', fontsize=20, fontweight='bold', pad=30, color='#2d5016')
            
        else:
            # General biology concept
            ax.text(0.5, 0.7, '🧬 Biology Process', ha='center', va='center',
                   fontsize=24, fontweight='bold', transform=ax.transAxes, color='#2d5016')
            ax.text(0.5, 0.5, 'Cellular Processes • Photosynthesis • Respiration\nGenetics • Evolution • Ecology', 
                   ha='center', va='center', fontsize=16, transform=ax.transAxes)
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        # Save to base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def _draw_binary_tree(self, ax, colors):
        """Draw a binary tree structure"""
        # Node positions for a binary tree
        nodes = {
            'root': (0.5, 0.8, '50'),
            'left1': (0.3, 0.6, '30'),
            'right1': (0.7, 0.6, '70'),
            'left2': (0.2, 0.4, '20'),
            'right2': (0.4, 0.4, '40'),
            'left3': (0.6, 0.4, '60'),
            'right3': (0.8, 0.4, '80')
        }
        
        # Draw connections
        connections = [
            (nodes['root'][:2], nodes['left1'][:2]),
            (nodes['root'][:2], nodes['right1'][:2]),
            (nodes['left1'][:2], nodes['left2'][:2]),
            (nodes['left1'][:2], nodes['right2'][:2]),
            (nodes['right1'][:2], nodes['left3'][:2]),
            (nodes['right1'][:2], nodes['right3'][:2])
        ]
        
        for start, end in connections:
            ax.plot([start[0], end[0]], [start[1], end[1]], 'k-', linewidth=2, alpha=0.7)
        
        # Draw nodes
        for i, (name, (x, y, value)) in enumerate(nodes.items()):
            circle = patches.Circle((x, y), 0.05, facecolor=colors[i % len(colors)], 
                                  edgecolor='black', linewidth=2)
            ax.add_patch(circle)
            ax.text(x, y, value, ha='center', va='center', fontweight='bold', 
                   fontsize=10, color='white')
    
    def _draw_graph_structure(self, ax, colors):
        """Draw a graph structure"""
        # Node positions
        nodes = [(0.2, 0.7), (0.5, 0.8), (0.8, 0.7), (0.3, 0.4), (0.7, 0.4), (0.5, 0.2)]
        labels = ['A', 'B', 'C', 'D', 'E', 'F']
        
        # Edges
        edges = [(0, 1), (1, 2), (0, 3), (1, 4), (2, 4), (3, 5), (4, 5)]
        
        # Draw edges
        for start_idx, end_idx in edges:
            start_pos = nodes[start_idx]
            end_pos = nodes[end_idx]
            ax.plot([start_pos[0], end_pos[0]], [start_pos[1], end_pos[1]], 
                   'gray', linewidth=2, alpha=0.7)
        
        # Draw nodes
        for i, (pos, label) in enumerate(zip(nodes, labels)):
            circle = patches.Circle(pos, 0.06, facecolor=colors[i % len(colors)], 
                                  edgecolor='black', linewidth=2)
            ax.add_patch(circle)
            ax.text(pos[0], pos[1], label, ha='center', va='center', 
                   fontweight='bold', fontsize=12, color='white')
    
    def _draw_cell_structure(self, ax, colors):
        """Draw basic cell structure"""
        # Cell membrane
        cell = patches.Ellipse((0.5, 0.5), 0.7, 0.6, facecolor='#F0F8FF', 
                             edgecolor='#4169E1', linewidth=3)
        ax.add_patch(cell)
        
        # Nucleus
        nucleus = patches.Circle((0.5, 0.55), 0.12, facecolor='#DDA0DD', 
                               edgecolor='#8B008B', linewidth=2)
        ax.add_patch(nucleus)
        ax.text(0.5, 0.55, 'Nucleus', ha='center', va='center', fontsize=9, fontweight='bold')
        
        # Mitochondria
        mito1 = patches.Ellipse((0.35, 0.35), 0.08, 0.04, facecolor='#FFB6C1', 
                              edgecolor='#DC143C', linewidth=1)
        ax.add_patch(mito1)
        ax.text(0.35, 0.3, 'Mitochondria', ha='center', va='center', fontsize=7)
        
        # Add labels
        ax.text(0.5, 0.1, 'Plant/Animal Cell Structure', ha='center', va='center', 
               fontsize=14, fontweight='bold', color='#2d5016')
    
    def _create_chemistry_visual(self, query: str) -> str:
        """Create chemistry visualizations"""
        fig, ax = plt.subplots(figsize=(12, 8), facecolor='white')
        ax.set_facecolor('#fff8e1')  # Light yellow for chemistry
        
        ax.text(0.5, 0.7, '⚗️ Chemistry Visualization', ha='center', va='center',
               fontsize=24, fontweight='bold', transform=ax.transAxes, color='#e65100')
        ax.text(0.5, 0.5, 'Molecular Structures • Chemical Reactions\nAtomic Models • Bond Diagrams', 
               ha='center', va='center', fontsize=16, transform=ax.transAxes)
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def _create_physics_visual(self, query: str) -> str:
        """Create physics visualizations"""
        fig, ax = plt.subplots(figsize=(12, 8), facecolor='white')
        ax.set_facecolor('#e3f2fd')  # Light blue for physics
        
        ax.text(0.5, 0.7, '⚡ Physics Visualization', ha='center', va='center',
               fontsize=24, fontweight='bold', transform=ax.transAxes, color='#0d47a1')
        ax.text(0.5, 0.5, 'Force Diagrams • Wave Patterns\nCircuit Diagrams • Energy Flow', 
               ha='center', va='center', fontsize=16, transform=ax.transAxes)
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def _create_network_visual(self, query: str) -> str:
        """Create network topology visualizations"""
        fig, ax = plt.subplots(figsize=(12, 8), facecolor='white')
        ax.set_facecolor('#f3e5f5')  # Light purple for networks
        
        ax.text(0.5, 0.7, '🌐 Network Topology', ha='center', va='center',
               fontsize=24, fontweight='bold', transform=ax.transAxes, color='#4a148c')
        ax.text(0.5, 0.5, 'Network Architecture • System Design\nTopology Diagrams • Infrastructure', 
               ha='center', va='center', fontsize=16, transform=ax.transAxes)
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"
    
    def _create_algorithm_visual(self, query: str) -> str:
        """Create algorithm visualization"""
        fig, ax = plt.subplots(figsize=(12, 8), facecolor='white')
        ax.set_facecolor('#fff3e0')  # Light orange for algorithms
        
        ax.text(0.5, 0.7, '🔄 Algorithm Visualization', ha='center', va='center',
               fontsize=24, fontweight='bold', transform=ax.transAxes, color='#e65100')
        ax.text(0.5, 0.5, 'Sorting Algorithms • Search Algorithms\nComplexity Analysis • Step-by-Step Process', 
               ha='center', va='center', fontsize=16, transform=ax.transAxes)
        
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight',
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        plt.close()
        return f"data:image/png;base64,{image_base64}"