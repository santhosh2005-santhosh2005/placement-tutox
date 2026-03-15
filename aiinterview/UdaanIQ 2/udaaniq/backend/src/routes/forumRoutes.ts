import express from 'express';
import { getForumPosts, createForumPost, addComment, likePost } from '../services/forumService';

const router = express.Router();

// Get all forum posts
router.get('/forum-posts', async (req, res) => {
  try {
    const posts = await getForumPosts();
    res.json(posts);
  } catch (error) {
    console.error('Error getting forum posts:', error);
    res.status(500).json({ error: 'Failed to get forum posts' });
  }
});

// Create a new forum post
router.post('/forum-posts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, content } = req.body;
    const post = await createForumPost(userId, title, content);
    res.json(post);
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(500).json({ error: 'Failed to create forum post' });
  }
});

// Add a comment to a forum post
router.post('/forum-posts/:postId/comment/:userId', async (req, res) => {
  try {
    const { postId, userId } = req.params;
    const { content } = req.body;
    const post = await addComment(postId, userId, content);
    res.json(post);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Like a forum post
router.post('/forum-posts/:postId/like/:userId', async (req, res) => {
  try {
    const { postId, userId } = req.params;
    const post = await likePost(postId, userId);
    res.json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

export default router;