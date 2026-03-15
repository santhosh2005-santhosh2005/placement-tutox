// Mock data storage for peer comparison (in a real app, this would be a database)
let userData: { [key: string]: any } = {};

// Function to get peer comparison data
export async function getPeerComparison(userId: string): Promise<any> {
  try {
    // In a real implementation, this would query a database with user data
    // For now, we'll generate mock data
    
    // Simulate having some user data
    if (!userData[userId]) {
      userData[userId] = {
        skills: {
          'JavaScript': Math.floor(Math.random() * 5) + 6, // 6-10
          'React': Math.floor(Math.random() * 5) + 6,
          'Node.js': Math.floor(Math.random() * 5) + 6,
          'Python': Math.floor(Math.random() * 5) + 6,
          'CSS': Math.floor(Math.random() * 5) + 6,
        },
        activities: {
          completedChallenges: Math.floor(Math.random() * 30) + 10,
          interviewsTaken: Math.floor(Math.random() * 10) + 1,
          daysActive: Math.floor(Math.random() * 60) + 20,
        }
      };
    }
    
    // Generate peer data (in a real app, this would come from database queries)
    const peerData = {
      totalUsers: 500,
      averageSkills: {
        'JavaScript': 7.2,
        'React': 6.9,
        'Node.js': 7.5,
        'Python': 8.1,
        'CSS': 6.8,
      },
      averageActivities: {
        completedChallenges: 18,
        interviewsTaken: 3,
        daysActive: 35,
      }
    };
    
    // Calculate user's ranking based on a simple scoring algorithm
    const userSkills = userData[userId].skills;
    const userActivities = userData[userId].activities;
    
    // Calculate user score (weighted average)
    const skillValues: number[] = Object.values(userSkills) as number[];
    const userSkillScore = skillValues.reduce((sum: number, score: number) => sum + score, 0) / Object.keys(userSkills).length;
    const userActivityScore = (userActivities.completedChallenges / 30 * 0.4) + 
                             (userActivities.interviewsTaken / 10 * 0.3) + 
                             (userActivities.daysActive / 60 * 0.3);
    
    const userTotalScore = (userSkillScore * 0.7) + (userActivityScore * 10 * 0.3);
    
    // Generate mock peer scores to determine ranking
    const peerScores: number[] = [];
    for (let i = 0; i < 1000; i++) {
      // Generate random peer scores
      const peerSkillScore = 5 + Math.random() * 5; // 5-10
      const peerActivityScore = Math.random(); // 0-1
      const peerTotalScore = (peerSkillScore * 0.7) + (peerActivityScore * 0.3);
      peerScores.push(peerTotalScore);
    }
    
    // Calculate ranking
    const betterThanCount = peerScores.filter(score => userTotalScore > score).length;
    const position = peerData.totalUsers - betterThanCount;
    const percentile = Math.round((betterThanCount / peerScores.length) * 100);
    
    // Prepare response data
    const comparisonData = {
      ranking: {
        position: position,
        totalUsers: peerData.totalUsers,
        percentile: percentile
      },
      skills: Object.keys(userSkills).map(skill => ({
        name: skill,
        userScore: userSkills[skill],
        peerAverage: (peerData.averageSkills as any)[skill] || 7.0
      })),
      activities: {
        completedChallenges: userActivities.completedChallenges,
        interviewsTaken: userActivities.interviewsTaken,
        daysActive: userActivities.daysActive,
        peerAvgChallenges: peerData.averageActivities.completedChallenges,
        peerAvgInterviews: peerData.averageActivities.interviewsTaken,
        peerAvgDays: peerData.averageActivities.daysActive
      }
    };
    
    return comparisonData;
  } catch (error) {
    console.error('Error getting peer comparison data:', error);
    throw new Error('Failed to get peer comparison data');
  }
}

// Function to initialize user data (for demo purposes)
export async function initializeUserData(userId: string): Promise<void> {
  if (!userData[userId]) {
    userData[userId] = {
      skills: {
        'JavaScript': Math.floor(Math.random() * 5) + 6,
        'React': Math.floor(Math.random() * 5) + 6,
        'Node.js': Math.floor(Math.random() * 5) + 6,
        'Python': Math.floor(Math.random() * 5) + 6,
        'CSS': Math.floor(Math.random() * 5) + 6,
      },
      activities: {
        completedChallenges: Math.floor(Math.random() * 30) + 10,
        interviewsTaken: Math.floor(Math.random() * 10) + 1,
        daysActive: Math.floor(Math.random() * 60) + 20,
      }
    };
  }
}