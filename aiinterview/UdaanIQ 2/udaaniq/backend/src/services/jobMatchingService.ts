// Mock data storage for user skills (in a real app, this would be a database)
let userSkills: { [key: string]: string[] } = {};

// Mock job database (in a real app, this would be a separate job database)
const jobDatabase = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Remote',
    experience: 'Entry Level',
    type: 'Full-time',
    description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user interfaces using React and modern web technologies.',
    skills: ['JavaScript', 'React', 'CSS', 'HTML'],
    postedDays: 3
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'InnovateX',
    location: 'San Francisco, CA',
    experience: 'Mid Level',
    type: 'Full-time',
    description: 'Join our dynamic team as a Full Stack Engineer. You will work on both frontend and backend technologies to build scalable web applications.',
    skills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'Express'],
    postedDays: 5
  },
  {
    id: '3',
    title: 'Software Engineer',
    company: 'DataSystems',
    location: 'New York, NY',
    experience: 'Senior Level',
    type: 'Full-time',
    description: 'Exciting opportunity for a Software Engineer to work on cutting-edge data processing systems and machine learning applications.',
    skills: ['Python', 'Java', 'SQL', 'Machine Learning'],
    postedDays: 7
  },
  {
    id: '4',
    title: 'Backend Developer',
    company: 'CloudTech',
    location: 'Remote',
    experience: 'Mid Level',
    type: 'Contract',
    description: 'We are seeking an experienced Backend Developer to help us build and maintain our cloud-based services.',
    skills: ['Python', 'Django', 'AWS', 'Docker'],
    postedDays: 2
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'InfraSolutions',
    location: 'Austin, TX',
    experience: 'Senior Level',
    type: 'Full-time',
    description: 'Join our infrastructure team to design and implement scalable cloud solutions.',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
    postedDays: 4
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'AnalyticsPro',
    location: 'Remote',
    experience: 'Mid Level',
    type: 'Full-time',
    description: 'We are looking for a Data Scientist to analyze large datasets and build predictive models.',
    skills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Pandas'],
    postedDays: 1
  }
];

// Function to get user skills
async function getUserSkills(userId: string): Promise<string[]> {
  // In a real implementation, this would query a database
  // For now, we'll return mock data
  if (!userSkills[userId]) {
    userSkills[userId] = ['JavaScript', 'React', 'Node.js', 'Python', 'CSS', 'HTML'];
  }
  return userSkills[userId];
}

// Function to get job matches
export async function getJobMatches(userId: string, preferences: any): Promise<any[]> {
  try {
    // Get user skills
    const skills = await getUserSkills(userId);
    
    // Filter jobs based on preferences
    let filteredJobs = [...jobDatabase];
    
    // Apply location filter
    if (preferences.location && preferences.location !== 'Remote') {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(preferences.location.toLowerCase()) || 
        job.location === 'Remote'
      );
    }
    
    // Apply experience filter
    if (preferences.experience) {
      filteredJobs = filteredJobs.filter(job => 
        job.experience === preferences.experience
      );
    }
    
    // Apply job type filter
    if (preferences.jobType) {
      filteredJobs = filteredJobs.filter(job => 
        job.type === preferences.jobType
      );
    }
    
    // Calculate match scores for each job
    const jobMatches = filteredJobs.map(job => {
      // Calculate skill match score
      const matchingSkills = job.skills.filter(skill => 
        skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      
      const matchScore = Math.round((matchingSkills.length / job.skills.length) * 100);
      
      return {
        ...job,
        userSkills: matchingSkills,
        matchScore
      };
    });
    
    // Sort by match score (descending)
    jobMatches.sort((a, b) => b.matchScore - a.matchScore);
    
    return jobMatches;
  } catch (error) {
    console.error('Error getting job matches:', error);
    throw new Error('Failed to get job matches');
  }
}

// Function to initialize user skills (for demo purposes)
export async function initializeUserSkills(userId: string, skills: string[]): Promise<void> {
  userSkills[userId] = skills;
}