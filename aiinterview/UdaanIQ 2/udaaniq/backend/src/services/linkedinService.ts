// LinkedIn API service for profile integration
// This service would use the LinkedIn API to fetch user profile data
// For the hackathon, we'll implement a mock version that simulates the API calls

// Mock LinkedIn profile data
const mockProfile = {
  name: 'Alex Johnson',
  headline: 'Senior Software Engineer at TechCorp',
  summary: 'Passionate software engineer with 5+ years of experience in full-stack development. Specialized in React, Node.js, and cloud technologies.',
  profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  experiences: [
    {
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      duration: '2022 - Present',
      description: 'Leading frontend development for enterprise SaaS platform. Mentoring junior developers and implementing CI/CD pipelines.'
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      duration: '2020 - 2022',
      description: 'Developed and maintained multiple web applications using React and Node.js. Improved application performance by 40%.'
    },
    {
      title: 'Junior Developer',
      company: 'Digital Agency',
      duration: '2019 - 2020',
      description: 'Built responsive websites for clients using HTML, CSS, and JavaScript. Collaborated with design team to implement UI/UX.'
    }
  ],
  educations: [
    {
      degree: 'B.S. Computer Science',
      institution: 'University of Technology',
      duration: '2016 - 2020'
    },
    {
      degree: 'High School Diploma',
      institution: 'Central High School',
      duration: '2012 - 2016'
    }
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'CI/CD', 'Git', 'RESTful APIs', 'MongoDB']
};

// Function to connect to LinkedIn (simulated)
export async function connectLinkedIn(profileUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    // In a real implementation, this would authenticate with LinkedIn API
    // For now, we'll simulate a successful connection
    console.log(`Connecting to LinkedIn profile: ${profileUrl}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Extract username from URL for demo purposes
    const username = profileUrl.split('/').pop() || 'user';
    
    return { 
      success: true, 
      message: `Successfully connected to LinkedIn profile for ${username}` 
    };
  } catch (error) {
    console.error('Error connecting to LinkedIn:', error);
    return { 
      success: false, 
      message: 'Failed to connect to LinkedIn. Please check your profile URL and try again.' 
    };
  }
}

// Function to get user profile from LinkedIn
export async function getLinkedInProfile(profileUrl: string): Promise<any> {
  try {
    // In a real implementation, this would call the LinkedIn API
    // For now, we'll return mock data
    console.log(`Fetching LinkedIn profile: ${profileUrl}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extract username from URL for demo purposes
    const username = profileUrl.split('/').pop() || 'user';
    
    // Return mock profile with personalized name
    return {
      ...mockProfile,
      name: `${username.charAt(0).toUpperCase() + username.slice(1)} ${mockProfile.experiences[0].title.includes('Senior') ? 'Senior' : ''} Professional`
    };
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    throw new Error('Failed to fetch profile from LinkedIn');
  }
}

// Function to get user connections (simulated)
export async function getLinkedInConnections(accessToken: string, limit: number = 10): Promise<any[]> {
  try {
    // In a real implementation, this would call the LinkedIn API to get connections
    // For now, we'll return mock data
    console.log(`Fetching LinkedIn connections with token: ${accessToken}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock connections
    return [
      {
        id: '1',
        name: 'Sarah Chen',
        headline: 'Product Manager at InnovateX',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        id: '2',
        name: 'Michael Rodriguez',
        headline: 'Data Scientist at DataSystems',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        id: '3',
        name: 'Priya Sharma',
        headline: 'UX Designer at CreativeStudio',
        profileImage: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    ].slice(0, limit);
  } catch (error) {
    console.error('Error fetching LinkedIn connections:', error);
    return [];
  }
}

// Function to search LinkedIn profiles by keyword
export async function searchLinkedInProfiles(keyword: string, limit: number = 10): Promise<any[]> {
  try {
    // In a real implementation, this would search LinkedIn API by keyword
    // For now, we'll return mock data filtered by keyword
    console.log(`Searching LinkedIn profiles for keyword: ${keyword}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock profiles filtered by keyword
    return [
      {
        id: '1',
        name: 'Alex Johnson',
        headline: 'Senior Software Engineer',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      },
      {
        id: '2',
        name: 'Sarah Chen',
        headline: 'Product Manager',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    ].slice(0, limit);
  } catch (error) {
    console.error('Error searching LinkedIn profiles:', error);
    return [];
  }
}