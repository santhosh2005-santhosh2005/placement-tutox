'use client';

import { useState, useEffect } from 'react';
import { getForumPosts, createForumPost, addComment } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getForumPosts();
        setPosts(data);
      } catch (err) {
        setError('Failed to load forum posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, you would pass the actual user ID
      const post = await createForumPost('user123', newPost.title, newPost.content);
      setPosts([post, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowPostForm(false);
    } catch (err) {
      setError('Failed to create post');
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string, comment: string) => {
    try {
      // In a real app, you would pass the actual user ID
      const updatedPost = await addComment(postId, 'user123', comment);
      setPosts(posts.map(post => post.id === postId ? updatedPost : post));
    } catch (err) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Community Forum</h1>
          <p className="text-slate-600">Connect with peers, ask questions, and share knowledge</p>
        </div>

        <div className="mb-8 text-center">
          <button 
            onClick={() => setShowPostForm(!showPostForm)}
            className="btn-primary"
          >
            {showPostForm ? 'Cancel' : 'Create New Post'}
          </button>
        </div>

        {showPostForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create New Post</h2>
            <form onSubmit={handleCreatePost}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  rows={4}
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Post
                </button>
              </div>
            </form>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Posts</h2>
          <div className="space-y-6">
            {posts.map((post) => (
              <ForumPost 
                key={post.id} 
                post={post} 
                onAddComment={handleAddComment} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ForumPost({ post, onAddComment }: { post: any; onAddComment: (postId: string, comment: string) => void }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onAddComment(post.id, comment);
      setComment('');
      setShowCommentForm(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center font-bold">
            {post.author.charAt(0)}
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{post.title}</h3>
              <p className="text-slate-600">{post.author} • {post.timeAgo}</p>
            </div>
            <div className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium">
              {post.category}
            </div>
          </div>
          <p className="mt-3 text-slate-700">{post.content}</p>
          
          <div className="mt-4 flex items-center space-x-4">
            <button className="flex items-center text-slate-500 hover:text-blue-600">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              {post.likes}
            </button>
            <button 
              className="flex items-center text-slate-500 hover:text-blue-600"
              onClick={() => setShowCommentForm(!showCommentForm)}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.comments.length}
            </button>
          </div>
          
          {showCommentForm && (
            <div className="mt-4">
              <form onSubmit={handleSubmitComment}>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="mt-2 flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setShowCommentForm(false)}
                    className="mr-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Comment
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {post.comments.length > 0 && (
            <div className="mt-6 space-y-4">
              {post.comments.map((comment: any, index: number) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {comment.author.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-900">{comment.author}</span>
                        <span className="text-xs text-slate-500">{comment.timeAgo}</span>
                      </div>
                      <p className="mt-1 text-slate-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}