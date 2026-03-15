// Mock data storage for forum posts (in a real app, this would be a database)
let forumPosts: any[] = [
  {
    id: '1',
    title: 'Best resources for learning React hooks?',
    content: "I'm trying to get better at using React hooks, especially useEffect and useContext. What are your favorite resources or tutorials?",
    author: 'Alex Johnson',
    timeAgo: '2 hours ago',
    category: 'React',
    likes: 12,
    comments: [
      {
        id: 'c1',
        author: 'Sarah Chen',
        content: 'I highly recommend the official React documentation! It has great examples for all hooks.',
        timeAgo: '1 hour ago'
      },
      {
        id: 'c2',
        author: 'Mike Rodriguez',
        content: 'Also check out "React Hooks in Action" by John Larsen. Great book with practical examples.',
        timeAgo: '45 minutes ago'
      }
    ]
  },
  {
    id: '2',
    title: 'How to prepare for system design interviews?',
    content: 'I have an upcoming interview that includes a system design round. Any tips on how to approach this and what to focus on?',
    author: 'Priya Sharma',
    timeAgo: '5 hours ago',
    category: 'Interviews',
    likes: 8,
    comments: [
      {
        id: 'c3',
        author: 'David Kim',
        content: 'Start with "Designing Data-Intensive Applications" by Martin Kleppmann. It\'s a must-read.',
        timeAgo: '3 hours ago'
      }
    ]
  },
  {
    id: '3',
    title: 'Career advice: Switching from QA to Development',
    content: "I've been working in QA for 2 years and want to transition to development. What steps should I take?",
    author: 'James Wilson',
    timeAgo: '1 day ago',
    category: 'Career',
    likes: 15,
    comments: [
      {
        id: 'c4',
        author: 'Emma Thompson',
        content: 'Start by building projects on your own. Contribute to open source if possible. Consider a bootcamp if you need structure.',
        timeAgo: '20 hours ago'
      },
      {
        id: 'c5',
        author: 'Robert Garcia',
        content: 'Leverage your QA experience! Your testing knowledge will be valuable in development.',
        timeAgo: '18 hours ago'
      }
    ]
  }
];

// Function to get all forum posts
export async function getForumPosts(): Promise<any[]> {
  try {
    // In a real implementation, this would query a database
    // For now, we'll return the mock data
    return forumPosts;
  } catch (error) {
    console.error('Error getting forum posts:', error);
    throw new Error('Failed to get forum posts');
  }
}

// Function to create a new forum post
export async function createForumPost(userId: string, title: string, content: string): Promise<any> {
  try {
    // In a real implementation, this would insert into a database
    // For now, we'll add to our mock data
    const newPost = {
      id: 'post-' + Date.now(),
      title,
      content,
      author: 'User ' + userId, // In a real app, this would be the user's name
      timeAgo: 'Just now',
      category: 'General',
      likes: 0,
      comments: []
    };
    
    forumPosts.unshift(newPost); // Add to the beginning of the array
    
    return newPost;
  } catch (error) {
    console.error('Error creating forum post:', error);
    throw new Error('Failed to create forum post');
  }
}

// Function to add a comment to a forum post
export async function addComment(postId: string, userId: string, content: string): Promise<any> {
  try {
    // In a real implementation, this would update the database
    // For now, we'll update our mock data
    const post = forumPosts.find(p => p.id === postId);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    const newComment = {
      id: 'comment-' + Date.now(),
      author: 'User ' + userId, // In a real app, this would be the user's name
      content,
      timeAgo: 'Just now'
    };
    
    post.comments.push(newComment);
    
    return post;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
}

// Function to like a forum post
export async function likePost(postId: string, userId: string): Promise<any> {
  try {
    // In a real implementation, this would update the database
    // For now, we'll update our mock data
    const post = forumPosts.find(p => p.id === postId);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    post.likes += 1;
    
    return post;
  } catch (error) {
    console.error('Error liking post:', error);
    throw new Error('Failed to like post');
  }
}