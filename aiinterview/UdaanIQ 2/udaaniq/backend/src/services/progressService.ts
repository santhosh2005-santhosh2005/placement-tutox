// Mock data storage for user progress (in a real app, this would be a database)
let userProgress: any = {};

// Function to record user activity
export async function recordActivity(userId: string, activity: any): Promise<any> {
  try {
    if (!userProgress[userId]) {
      userProgress[userId] = {
        userId,
        activities: [],
        skills: {},
        overallProgress: 0,
        lastUpdated: new Date().toISOString(),
        achievements: [] // New field for achievements
      };
    }
    
    // Add the activity to the user's history
    userProgress[userId].activities.push({
      ...activity,
      timestamp: new Date().toISOString()
    });
    
    // Update skill progress
    if (activity.skill && activity.score) {
      if (!userProgress[userId].skills[activity.skill]) {
        userProgress[userId].skills[activity.skill] = {
          skill: activity.skill,
          totalScore: 0,
          activityCount: 0,
          averageScore: 0,
          progressHistory: []
        };
      }
      
      const skillData = userProgress[userId].skills[activity.skill];
      skillData.totalScore += activity.score;
      skillData.activityCount += 1;
      skillData.averageScore = skillData.totalScore / skillData.activityCount;
      skillData.progressHistory.push({
        score: activity.score,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for new achievements
    checkForAchievements(userId, activity);
    
    // Update overall progress (simple calculation for demo)
    userProgress[userId].overallProgress = calculateOverallProgress(userId);
    userProgress[userId].lastUpdated = new Date().toISOString();
    
    return { success: true, message: 'Activity recorded successfully' };
  } catch (error) {
    console.error('Error recording activity:', error);
    return { success: false, message: 'Failed to record activity' };
  }
}

// Function to get user progress
export async function getUserProgress(userId: string): Promise<any> {
  try {
    if (!userProgress[userId]) {
      return {
        userId,
        activities: [],
        skills: {},
        overallProgress: 0,
        lastUpdated: new Date().toISOString(),
        achievements: []
      };
    }
    
    return userProgress[userId];
  } catch (error) {
    console.error('Error getting user progress:', error);
    return { 
      userId,
      activities: [],
      skills: {},
      overallProgress: 0,
      lastUpdated: new Date().toISOString(),
      achievements: []
    };
  }
}

// Function to get skill recommendations
export async function getSkillRecommendations(userId: string): Promise<any> {
  try {
    const progress = await getUserProgress(userId);
    
    // Simple recommendation logic based on low scores or lack of activity
    const recommendations: any[] = [];
    
    // If no skills tracked yet, recommend popular skills
    if (Object.keys(progress.skills).length === 0) {
      recommendations.push(
        { skill: 'JavaScript', reason: 'Essential for web development' },
        { skill: 'Python', reason: 'Great for beginners and data science' },
        { skill: 'React', reason: 'Popular frontend framework' }
      );
      return recommendations;
    }
    
    // Recommend skills with low average scores
    for (const [skillName, skillData] of Object.entries(progress.skills)) {
      const data: any = skillData;
      if (data.averageScore < 7) {
        recommendations.push({
          skill: skillName,
          reason: `Your average score is ${data.averageScore.toFixed(1)}. Focus on improving this skill.`
        });
      }
    }
    
    // Recommend new skills if user has mastered current ones
    const masteredSkills = Object.values(progress.skills).filter((skill: any) => skill.averageScore >= 8);
    if (masteredSkills.length > 0) {
      recommendations.push(
        { skill: 'System Design', reason: 'Advance to system design after mastering core skills' },
        { skill: 'Data Structures', reason: 'Deepen your understanding of fundamental concepts' }
      );
    }
    
    // If no specific recommendations, suggest popular skills
    if (recommendations.length === 0) {
      recommendations.push(
        { skill: 'TypeScript', reason: 'Build on your JavaScript knowledge' },
        { skill: 'Node.js', reason: 'Learn backend development' }
      );
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error getting skill recommendations:', error);
    return [
      { skill: 'JavaScript', reason: 'Essential for web development' },
      { skill: 'Python', reason: 'Great for beginners and data science' }
    ];
  }
}

// New function for AI-Powered Personalized Learning Path
export async function getPersonalizedLearningPath(userId: string): Promise<any> {
  try {
    const progress = await getUserProgress(userId);
    
    // Calculate skill proficiency levels
    const skillLevels: any = {};
    const masteredSkills: string[] = [];
    const intermediateSkills: string[] = [];
    const beginnerSkills: string[] = [];
    
    // Categorize skills based on proficiency
    for (const [skillName, skillData] of Object.entries(progress.skills)) {
      const data: any = skillData;
      skillLevels[skillName] = data.averageScore;
      
      if (data.averageScore >= 8) {
        masteredSkills.push(skillName);
      } else if (data.averageScore >= 6) {
        intermediateSkills.push(skillName);
      } else {
        beginnerSkills.push(skillName);
      }
    }
    
    // Generate learning path based on current skills
    const learningPath: any[] = [];
    
    // If no skills tracked yet, start with fundamentals
    if (Object.keys(progress.skills).length === 0) {
      learningPath.push(
        { 
          id: 'path-1',
          title: 'Start with Fundamentals',
          description: 'Begin your journey with essential programming skills',
          skills: ['JavaScript', 'Python', 'HTML/CSS'],
          estimatedTime: '4-6 weeks',
          priority: 'high'
        },
        { 
          id: 'path-2',
          title: 'Build Your First Project',
          description: 'Apply your knowledge by building a simple web application',
          skills: ['Web Development Basics'],
          estimatedTime: '2-3 weeks',
          priority: 'medium'
        }
      );
      return learningPath;
    }
    
    // For beginners with low scores
    if (beginnerSkills.length > 0) {
      learningPath.push({
        id: 'path-1',
        title: 'Strengthen Core Skills',
        description: 'Focus on improving your foundational skills',
        skills: beginnerSkills,
        estimatedTime: '3-4 weeks',
        priority: 'high'
      });
    }
    
    // For intermediate learners
    if (intermediateSkills.length > 0) {
      learningPath.push({
        id: 'path-2',
        title: 'Expand Your Skill Set',
        description: 'Learn complementary technologies to your current skills',
        skills: intermediateSkills.map(skill => {
          // Suggest related skills
          const relatedSkills: any = {
            'JavaScript': ['React', 'Node.js', 'TypeScript'],
            'Python': ['Django', 'Flask', 'Data Science'],
            'React': ['Redux', 'Next.js', 'React Native'],
            'Java': ['Spring Boot', 'Android Development'],
            'C++': ['Data Structures', 'Algorithms']
          };
          return relatedSkills[skill] || [`${skill} Advanced Concepts`];
        }).flat(),
        estimatedTime: '4-6 weeks',
        priority: 'high'
      });
    }
    
    // For advanced learners
    if (masteredSkills.length > 0) {
      learningPath.push({
        id: 'path-3',
        title: 'Advance to Professional Skills',
        description: 'Move beyond basics to industry-level expertise',
        skills: ['System Design', 'Cloud Computing', 'DevOps'],
        estimatedTime: '6-8 weeks',
        priority: 'medium'
      });
    }
    
    // Always include soft skills development
    learningPath.push({
      id: 'path-4',
      title: 'Develop Professional Skills',
      description: 'Enhance your communication and problem-solving abilities',
      skills: ['Technical Communication', 'Problem Solving', 'Interview Preparation'],
      estimatedTime: 'Ongoing',
      priority: 'low'
    });
    
    return learningPath;
  } catch (error) {
    console.error('Error generating personalized learning path:', error);
    // Return a default learning path
    return [
      {
        id: 'default-1',
        title: 'Beginner Path',
        description: 'Start with fundamental programming concepts',
        skills: ['JavaScript', 'Python', 'HTML/CSS'],
        estimatedTime: '4-6 weeks',
        priority: 'high'
      }
    ];
  }
}

// Helper function to calculate overall progress
function calculateOverallProgress(userId: string): number {
  try {
    const progress = userProgress[userId];
    if (!progress || progress.activities.length === 0) {
      return 0;
    }
    
    // Simple progress calculation based on activity count and average scores
    const recentActivities = progress.activities.slice(-10); // Last 10 activities
    const totalScore = recentActivities.reduce((sum: number, activity: any) => sum + (activity.score || 0), 0);
    const averageScore = totalScore / recentActivities.length;
    
    // Weight recent performance (70%) and activity count (30%)
    const activityScore = Math.min(progress.activities.length / 20, 1) * 30; // Max 30 points for 20+ activities
    const performanceScore = (averageScore / 10) * 70; // Max 70 points for perfect scores
    
    return Math.round(activityScore + performanceScore);
  } catch (error) {
    console.error('Error calculating overall progress:', error);
    return 0;
  }
}

// New function to check for achievements
function checkForAchievements(userId: string, activity: any) {
  const achievements = userProgress[userId].achievements || [];
  const activities = userProgress[userId].activities || [];
  
  // First activity achievement
  if (activities.length === 1 && !achievements.some((a: any) => a.id === 'first-activity')) {
    achievements.push({
      id: 'first-activity',
      title: 'First Step',
      description: 'Completed your first activity',
      icon: '👣',
      earnedAt: new Date().toISOString()
    });
  }
  
  // 5 activities achievement
  if (activities.length === 5 && !achievements.some((a: any) => a.id === 'five-activities')) {
    achievements.push({
      id: 'five-activities',
      title: 'Getting Started',
      description: 'Completed 5 activities',
      icon: '⭐',
      earnedAt: new Date().toISOString()
    });
  }
  
  // High score achievement
  if (activity.score && activity.score >= 9 && !achievements.some((a: any) => a.id === 'high-score')) {
    achievements.push({
      id: 'high-score',
      title: 'Excellent Work',
      description: 'Achieved a score of 9 or higher',
      icon: '🏆',
      earnedAt: new Date().toISOString()
    });
  }
  
  // Skill mastery achievement
  if (activity.skill && activity.score) {
    const skillData = userProgress[userId].skills[activity.skill];
    if (skillData && skillData.averageScore >= 8 && 
        !achievements.some((a: any) => a.id === `master-${activity.skill}`)) {
      achievements.push({
        id: `master-${activity.skill}`,
        title: `${activity.skill} Master`,
        description: `Mastered ${activity.skill} with an average score of 8 or higher`,
        icon: '🎓',
        earnedAt: new Date().toISOString()
      });
    }
  }
  
  userProgress[userId].achievements = achievements;
}

// New function to get user achievements
export async function getUserAchievements(userId: string): Promise<any[]> {
  try {
    const progress = await getUserProgress(userId);
    return progress.achievements || [];
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return [];
  }
}