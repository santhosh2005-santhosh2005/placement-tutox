// GitHub API service for portfolio integration
// This service would use the GitHub API to fetch user repositories
// For the hackathon, we'll implement a mock version that simulates the API calls

// Mock GitHub repository data
const mockRepositories = [
  {
    id: '1',
    name: 'portfolio-website',
    description: 'A responsive portfolio website built with React and Tailwind CSS',
    stars: 15,
    forks: 3,
    language: 'JavaScript',
    languages: ['JavaScript', 'HTML', 'CSS'],
    isPublic: true,
    url: 'https://github.com/username/portfolio-website',
    createdAt: '2023-01-15',
    updatedAt: '2023-05-20'
  },
  {
    id: '2',
    name: 'task-manager-api',
    description: 'RESTful API for a task management application built with Node.js and Express',
    stars: 8,
    forks: 2,
    language: 'JavaScript',
    languages: ['JavaScript', 'Node.js', 'MongoDB'],
    isPublic: true,
    url: 'https://github.com/username/task-manager-api',
    createdAt: '2022-11-03',
    updatedAt: '2023-03-12'
  },
  {
    id: '3',
    name: 'machine-learning-projects',
    description: 'Collection of machine learning projects implemented in Python',
    stars: 22,
    forks: 7,
    language: 'Python',
    languages: ['Python', 'Jupyter Notebook', 'Pandas'],
    isPublic: true,
    url: 'https://github.com/username/machine-learning-projects',
    createdAt: '2022-07-18',
    updatedAt: '2023-01-30'
  },
  {
    id: '4',
    name: 'mobile-expense-tracker',
    description: 'React Native mobile application for tracking personal expenses',
    stars: 5,
    forks: 1,
    language: 'TypeScript',
    languages: ['TypeScript', 'React Native'],
    isPublic: true,
    url: 'https://github.com/username/mobile-expense-tracker',
    createdAt: '2023-02-10',
    updatedAt: '2023-04-05'
  }
];

// Function to connect to GitHub (simulated)
export async function connectGitHub(username: string): Promise<{ success: boolean; message: string }> {
  try {
    // In a real implementation, this would authenticate with GitHub API
    // For now, we'll simulate a successful connection
    console.log(`Connecting to GitHub for user: ${username}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      success: true, 
      message: `Successfully connected to GitHub account for ${username}` 
    };
  } catch (error) {
    console.error('Error connecting to GitHub:', error);
    return { 
      success: false, 
      message: 'Failed to connect to GitHub. Please check your username and try again.' 
    };
  }
}

// Function to get user repositories from GitHub
export async function getGitHubRepositories(username: string): Promise<any[]> {
  try {
    // In a real implementation, this would call the GitHub API
    // For now, we'll return mock data with the username
    console.log(`Fetching repositories for GitHub user: ${username}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock repositories with the actual username in the URL
    return mockRepositories.map(repo => ({
      ...repo,
      url: `https://github.com/${username}/${repo.name}`
    }));
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    throw new Error('Failed to fetch repositories from GitHub');
  }
}

// Function to get repository languages (simulated)
export async function getRepositoryLanguages(repoUrl: string): Promise<string[]> {
  try {
    // In a real implementation, this would call the GitHub API to get languages
    // For now, we'll return mock data
    console.log(`Fetching languages for repository: ${repoUrl}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a random selection of languages for demo purposes
    const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'HTML', 'CSS'];
    const count = Math.floor(Math.random() * 3) + 1;
    const selected = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * languages.length);
      selected.push(languages[randomIndex]);
    }
    
    return [...new Set(selected)]; // Remove duplicates
  } catch (error) {
    console.error('Error fetching repository languages:', error);
    return ['JavaScript']; // Default fallback
  }
}

// Function to search GitHub repositories by topic
export async function searchGitHubRepositories(topic: string, limit: number = 10): Promise<any[]> {
  try {
    // In a real implementation, this would search GitHub API by topic
    // For now, we'll return mock data filtered by topic
    console.log(`Searching GitHub repositories for topic: ${topic}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter mock repositories by topic (simplified)
    return mockRepositories
      .filter(repo => 
        repo.name.toLowerCase().includes(topic.toLowerCase()) || 
        (repo.description && repo.description.toLowerCase().includes(topic.toLowerCase()))
      )
      .slice(0, limit);
  } catch (error) {
    console.error('Error searching GitHub repositories:', error);
    return [];
  }
}