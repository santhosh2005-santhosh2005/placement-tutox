"""
Chat History Manager Module for AI Tutor
Handles persistent storage and retrieval of chat history
"""

import json
import os
import time
from datetime import datetime
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field, asdict
import sqlite3
import threading

@dataclass
class ChatMessage:
    """Enhanced message class with more metadata"""
    id: str
    session_id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: float = field(default_factory=time.time)
    message_type: str = "text"  # 'text', 'visual', 'error', 'system'
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert message to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'session_id': self.session_id,
            'role': self.role,
            'content': self.content,
            'timestamp': self.timestamp,
            'message_type': self.message_type,
            'metadata': self.metadata,
            'formatted_time': datetime.fromtimestamp(self.timestamp).strftime('%Y-%m-%d %H:%M:%S')
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ChatMessage':
        """Create message from dictionary"""
        return cls(
            id=data['id'],
            session_id=data['session_id'],
            role=data['role'],
            content=data['content'],
            timestamp=data.get('timestamp', time.time()),
            message_type=data.get('message_type', 'text'),
            metadata=data.get('metadata', {})
        )

class HistoryManager:
    """Manages chat history with persistent storage"""
    
    def __init__(self, storage_type: str = "sqlite", storage_path: str = "chat_history.db"):
        """
        Initialize history manager
        
        Args:
            storage_type: 'sqlite', 'json', or 'memory'
            storage_path: Path for storage file
        """
        self.storage_type = storage_type
        self.storage_path = storage_path
        self.lock = threading.Lock()
        
        # Initialize storage
        if storage_type == "sqlite":
            self._init_sqlite()
        elif storage_type == "json":
            self._init_json()
        elif storage_type == "memory":
            self.memory_storage = {}
        else:
            raise ValueError(f"Unsupported storage type: {storage_type}")
    
    def _init_sqlite(self):
        """Initialize SQLite database for chat history"""
        self.db_path = self.storage_path
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Create messages table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp REAL NOT NULL,
                    message_type TEXT DEFAULT 'text',
                    metadata TEXT DEFAULT '{}',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create sessions table for metadata
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT DEFAULT '{}'
                )
            ''')
            
            # Create indices for better performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_session_id ON messages(session_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp)')
            
            conn.commit()
    
    def _init_json(self):
        """Initialize JSON file storage"""
        if not os.path.exists(self.storage_path):
            with open(self.storage_path, 'w') as f:
                json.dump({'sessions': {}, 'messages': []}, f)
    
    def add_message(self, session_id: str, role: str, content: str, 
                   message_type: str = "text", metadata: Dict[str, Any] = None) -> str:
        """
        Add a message to chat history
        
        Args:
            session_id: Session identifier
            role: 'user' or 'assistant'
            content: Message content
            message_type: Type of message ('text', 'visual', 'error', 'system')
            metadata: Additional metadata
        
        Returns:
            Message ID
        """
        message_id = f"{session_id}_{int(time.time() * 1000000)}"
        metadata = metadata or {}
        
        message = ChatMessage(
            id=message_id,
            session_id=session_id,
            role=role,
            content=content,
            message_type=message_type,
            metadata=metadata
        )
        
        with self.lock:
            if self.storage_type == "sqlite":
                self._add_message_sqlite(message)
            elif self.storage_type == "json":
                self._add_message_json(message)
            elif self.storage_type == "memory":
                self._add_message_memory(message)
        
        return message_id
    
    def _add_message_sqlite(self, message: ChatMessage):
        """Add message to SQLite database"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Insert or update session
            cursor.execute('''
                INSERT OR REPLACE INTO sessions (session_id, last_activity)
                VALUES (?, ?)
            ''', (message.session_id, datetime.now()))
            
            # Insert message
            cursor.execute('''
                INSERT INTO messages (id, session_id, role, content, timestamp, message_type, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                message.id,
                message.session_id,
                message.role,
                message.content,
                message.timestamp,
                message.message_type,
                json.dumps(message.metadata)
            ))
            
            conn.commit()
    
    def _add_message_json(self, message: ChatMessage):
        """Add message to JSON file"""
        with open(self.storage_path, 'r') as f:
            data = json.load(f)
        
        data['messages'].append(message.to_dict())
        
        # Update session info
        if message.session_id not in data['sessions']:
            data['sessions'][message.session_id] = {
                'created_at': datetime.now().isoformat(),
                'message_count': 0
            }
        
        data['sessions'][message.session_id]['message_count'] += 1
        data['sessions'][message.session_id]['last_activity'] = datetime.now().isoformat()
        
        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def _add_message_memory(self, message: ChatMessage):
        """Add message to memory storage"""
        if message.session_id not in self.memory_storage:
            self.memory_storage[message.session_id] = []
        
        self.memory_storage[message.session_id].append(message.to_dict())
    
    def get_session_history(self, session_id: str, limit: int = None, 
                           offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get chat history for a specific session
        
        Args:
            session_id: Session identifier
            limit: Maximum number of messages to return
            offset: Number of messages to skip
        
        Returns:
            List of message dictionaries
        """
        with self.lock:
            if self.storage_type == "sqlite":
                return self._get_session_history_sqlite(session_id, limit, offset)
            elif self.storage_type == "json":
                return self._get_session_history_json(session_id, limit, offset)
            elif self.storage_type == "memory":
                return self._get_session_history_memory(session_id, limit, offset)
    
    def _get_session_history_sqlite(self, session_id: str, limit: int, offset: int) -> List[Dict[str, Any]]:
        """Get session history from SQLite"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            query = '''
                SELECT id, session_id, role, content, timestamp, message_type, metadata
                FROM messages 
                WHERE session_id = ?
                ORDER BY timestamp ASC
            '''
            
            if limit:
                query += f' LIMIT {limit} OFFSET {offset}'
            
            cursor.execute(query, (session_id,))
            rows = cursor.fetchall()
            
            messages = []
            for row in rows:
                message_dict = {
                    'id': row[0],
                    'session_id': row[1],
                    'role': row[2],
                    'content': row[3],
                    'timestamp': row[4],
                    'message_type': row[5],
                    'metadata': json.loads(row[6]) if row[6] else {},
                    'formatted_time': datetime.fromtimestamp(row[4]).strftime('%Y-%m-%d %H:%M:%S')
                }
                messages.append(message_dict)
            
            return messages
    
    def _get_session_history_json(self, session_id: str, limit: int, offset: int) -> List[Dict[str, Any]]:
        """Get session history from JSON file"""
        with open(self.storage_path, 'r') as f:
            data = json.load(f)
        
        session_messages = [
            msg for msg in data['messages'] 
            if msg['session_id'] == session_id
        ]
        
        # Sort by timestamp
        session_messages.sort(key=lambda x: x['timestamp'])
        
        # Apply pagination
        if limit:
            session_messages = session_messages[offset:offset + limit]
        
        return session_messages
    
    def _get_session_history_memory(self, session_id: str, limit: int, offset: int) -> List[Dict[str, Any]]:
        """Get session history from memory"""
        messages = self.memory_storage.get(session_id, [])
        
        # Sort by timestamp
        messages.sort(key=lambda x: x['timestamp'])
        
        # Apply pagination
        if limit:
            messages = messages[offset:offset + limit]
        
        return messages
    
    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """Get list of all chat sessions with metadata"""
        with self.lock:
            if self.storage_type == "sqlite":
                return self._get_all_sessions_sqlite()
            elif self.storage_type == "json":
                return self._get_all_sessions_json()
            elif self.storage_type == "memory":
                return self._get_all_sessions_memory()
    
    def _get_all_sessions_sqlite(self) -> List[Dict[str, Any]]:
        """Get all sessions from SQLite"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT s.session_id, s.created_at, s.last_activity,
                       COUNT(m.id) as message_count,
                       MAX(m.timestamp) as last_message_time
                FROM sessions s
                LEFT JOIN messages m ON s.session_id = m.session_id
                GROUP BY s.session_id
                ORDER BY s.last_activity DESC
            ''')
            
            rows = cursor.fetchall()
            sessions = []
            
            for row in rows:
                session = {
                    'session_id': row[0],
                    'created_at': row[1],
                    'last_activity': row[2],
                    'message_count': row[3],
                    'last_message_time': row[4]
                }
                sessions.append(session)
            
            return sessions
    
    def _get_all_sessions_json(self) -> List[Dict[str, Any]]:
        """Get all sessions from JSON file"""
        with open(self.storage_path, 'r') as f:
            data = json.load(f)
        
        sessions = []
        for session_id, session_info in data['sessions'].items():
            sessions.append({
                'session_id': session_id,
                'created_at': session_info.get('created_at'),
                'last_activity': session_info.get('last_activity'),
                'message_count': session_info.get('message_count', 0)
            })
        
        # Sort by last activity
        sessions.sort(key=lambda x: x.get('last_activity', ''), reverse=True)
        return sessions
    
    def _get_all_sessions_memory(self) -> List[Dict[str, Any]]:
        """Get all sessions from memory"""
        sessions = []
        for session_id, messages in self.memory_storage.items():
            if messages:
                last_message = max(messages, key=lambda x: x['timestamp'])
                sessions.append({
                    'session_id': session_id,
                    'message_count': len(messages),
                    'last_activity': datetime.fromtimestamp(last_message['timestamp']).isoformat(),
                    'last_message_time': last_message['timestamp']
                })
        
        # Sort by last activity
        sessions.sort(key=lambda x: x.get('last_message_time', 0), reverse=True)
        return sessions
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a chat session and all its messages"""
        with self.lock:
            if self.storage_type == "sqlite":
                return self._delete_session_sqlite(session_id)
            elif self.storage_type == "json":
                return self._delete_session_json(session_id)
            elif self.storage_type == "memory":
                return self._delete_session_memory(session_id)
    
    def _delete_session_sqlite(self, session_id: str) -> bool:
        """Delete session from SQLite"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Delete messages
            cursor.execute('DELETE FROM messages WHERE session_id = ?', (session_id,))
            messages_deleted = cursor.rowcount
            
            # Delete session
            cursor.execute('DELETE FROM sessions WHERE session_id = ?', (session_id,))
            session_deleted = cursor.rowcount
            
            conn.commit()
            return messages_deleted > 0 or session_deleted > 0
    
    def _delete_session_json(self, session_id: str) -> bool:
        """Delete session from JSON file"""
        with open(self.storage_path, 'r') as f:
            data = json.load(f)
        
        # Remove messages
        original_count = len(data['messages'])
        data['messages'] = [
            msg for msg in data['messages'] 
            if msg['session_id'] != session_id
        ]
        
        # Remove session
        session_existed = session_id in data['sessions']
        if session_existed:
            del data['sessions'][session_id]
        
        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        return len(data['messages']) < original_count or session_existed
    
    def _delete_session_memory(self, session_id: str) -> bool:
        """Delete session from memory"""
        if session_id in self.memory_storage:
            del self.memory_storage[session_id]
            return True
        return False
    
    def search_messages(self, query: str, session_id: str = None, 
                       limit: int = 50) -> List[Dict[str, Any]]:
        """
        Search messages by content
        
        Args:
            query: Search query
            session_id: Optional session filter
            limit: Maximum results to return
        
        Returns:
            List of matching messages
        """
        with self.lock:
            if self.storage_type == "sqlite":
                return self._search_messages_sqlite(query, session_id, limit)
            elif self.storage_type == "json":
                return self._search_messages_json(query, session_id, limit)
            elif self.storage_type == "memory":
                return self._search_messages_memory(query, session_id, limit)
    
    def _search_messages_sqlite(self, query: str, session_id: str, limit: int) -> List[Dict[str, Any]]:
        """Search messages in SQLite"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            sql = '''
                SELECT id, session_id, role, content, timestamp, message_type, metadata
                FROM messages 
                WHERE content LIKE ?
            '''
            params = [f'%{query}%']
            
            if session_id:
                sql += ' AND session_id = ?'
                params.append(session_id)
            
            sql += ' ORDER BY timestamp DESC LIMIT ?'
            params.append(limit)
            
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            
            messages = []
            for row in rows:
                message_dict = {
                    'id': row[0],
                    'session_id': row[1],
                    'role': row[2],
                    'content': row[3],
                    'timestamp': row[4],
                    'message_type': row[5],
                    'metadata': json.loads(row[6]) if row[6] else {},
                    'formatted_time': datetime.fromtimestamp(row[4]).strftime('%Y-%m-%d %H:%M:%S')
                }
                messages.append(message_dict)
            
            return messages
    
    def _search_messages_json(self, query: str, session_id: str, limit: int) -> List[Dict[str, Any]]:
        """Search messages in JSON file"""
        with open(self.storage_path, 'r') as f:
            data = json.load(f)
        
        matching_messages = []
        for msg in data['messages']:
            if query.lower() in msg['content'].lower():
                if not session_id or msg['session_id'] == session_id:
                    matching_messages.append(msg)
        
        # Sort by timestamp descending
        matching_messages.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return matching_messages[:limit]
    
    def _search_messages_memory(self, query: str, session_id: str, limit: int) -> List[Dict[str, Any]]:
        """Search messages in memory"""
        matching_messages = []
        
        sessions_to_search = [session_id] if session_id else self.memory_storage.keys()
        
        for sid in sessions_to_search:
            messages = self.memory_storage.get(sid, [])
            for msg in messages:
                if query.lower() in msg['content'].lower():
                    matching_messages.append(msg)
        
        # Sort by timestamp descending
        matching_messages.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return matching_messages[:limit]
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get chat history statistics"""
        with self.lock:
            if self.storage_type == "sqlite":
                return self._get_statistics_sqlite()
            elif self.storage_type == "json":
                return self._get_statistics_json()
            elif self.storage_type == "memory":
                return self._get_statistics_memory()
    
    def _get_statistics_sqlite(self) -> Dict[str, Any]:
        """Get statistics from SQLite"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Total messages
            cursor.execute('SELECT COUNT(*) FROM messages')
            total_messages = cursor.fetchone()[0]
            
            # Total sessions
            cursor.execute('SELECT COUNT(*) FROM sessions')
            total_sessions = cursor.fetchone()[0]
            
            # Messages by role
            cursor.execute('''
                SELECT role, COUNT(*) 
                FROM messages 
                GROUP BY role
            ''')
            messages_by_role = dict(cursor.fetchall())
            
            # Recent activity (last 7 days)
            week_ago = time.time() - (7 * 24 * 60 * 60)
            cursor.execute('SELECT COUNT(*) FROM messages WHERE timestamp > ?', (week_ago,))
            recent_messages = cursor.fetchone()[0]
            
            return {
                'total_messages': total_messages,
                'total_sessions': total_sessions,
                'messages_by_role': messages_by_role,
                'recent_messages_7_days': recent_messages,
                'storage_type': self.storage_type
            }
    
    def _get_statistics_json(self) -> Dict[str, Any]:
        """Get statistics from JSON file"""
        with open(self.storage_path, 'r') as f:
            data = json.load(f)
        
        messages = data['messages']
        total_messages = len(messages)
        total_sessions = len(data['sessions'])
        
        # Messages by role
        messages_by_role = {}
        for msg in messages:
            role = msg['role']
            messages_by_role[role] = messages_by_role.get(role, 0) + 1
        
        # Recent activity
        week_ago = time.time() - (7 * 24 * 60 * 60)
        recent_messages = sum(1 for msg in messages if msg['timestamp'] > week_ago)
        
        return {
            'total_messages': total_messages,
            'total_sessions': total_sessions,
            'messages_by_role': messages_by_role,
            'recent_messages_7_days': recent_messages,
            'storage_type': self.storage_type
        }
    
    def _get_statistics_memory(self) -> Dict[str, Any]:
        """Get statistics from memory"""
        total_messages = sum(len(messages) for messages in self.memory_storage.values())
        total_sessions = len(self.memory_storage)
        
        # Messages by role
        messages_by_role = {}
        for messages in self.memory_storage.values():
            for msg in messages:
                role = msg['role']
                messages_by_role[role] = messages_by_role.get(role, 0) + 1
        
        # Recent activity
        week_ago = time.time() - (7 * 24 * 60 * 60)
        recent_messages = 0
        for messages in self.memory_storage.values():
            recent_messages += sum(1 for msg in messages if msg['timestamp'] > week_ago)
        
        return {
            'total_messages': total_messages,
            'total_sessions': total_sessions,
            'messages_by_role': messages_by_role,
            'recent_messages_7_days': recent_messages,
            'storage_type': self.storage_type
        }

# Global instance
history_manager = HistoryManager(storage_type="sqlite", storage_path="chat_history.db")