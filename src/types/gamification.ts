export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: string;
}

export interface UserStats {
  userId: string;
  poolId: string;
  points: number;
  level: number;
  tasksCompleted: number;
  tasksClaimed: number;
  tasksPosted: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  achievements: Achievement[];
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  level: number;
  tasksCompleted: number;
  rank: number;
}

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  {
    id: 'first_task',
    title: 'Getting Started',
    description: 'Complete your first task',
    icon: 'checkmark-circle',
    points: 10,
  },
  {
    id: 'five_tasks',
    title: 'Helping Hand',
    description: 'Complete 5 tasks',
    icon: 'hand-left',
    points: 25,
  },
  {
    id: 'ten_tasks',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    icon: 'trophy',
    points: 50,
  },
  {
    id: 'twenty_five_tasks',
    title: 'Super Helper',
    description: 'Complete 25 tasks',
    icon: 'star',
    points: 100,
  },
  {
    id: 'fifty_tasks',
    title: 'Legend',
    description: 'Complete 50 tasks',
    icon: 'medal',
    points: 200,
  },
  {
    id: 'first_post',
    title: 'Request Creator',
    description: 'Post your first request',
    icon: 'add-circle',
    points: 10,
  },
  {
    id: 'week_streak',
    title: 'On Fire!',
    description: 'Complete tasks for 7 days in a row',
    icon: 'flame',
    points: 75,
  },
  {
    id: 'month_streak',
    title: 'Consistency King',
    description: 'Complete tasks for 30 days in a row',
    icon: 'sparkles',
    points: 250,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a task before 9 AM',
    icon: 'sunny',
    points: 15,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: 'moon',
    points: 15,
  },
];

export const LEVELS = [
  { level: 1, minPoints: 0, title: 'Beginner', color: '#9CA3AF' },
  { level: 2, minPoints: 50, title: 'Helper', color: '#3B82F6' },
  { level: 3, minPoints: 150, title: 'Contributor', color: '#10B981' },
  { level: 4, minPoints: 300, title: 'Pro', color: '#8B5CF6' },
  { level: 5, minPoints: 500, title: 'Expert', color: '#F59E0B' },
  { level: 6, minPoints: 800, title: 'Master', color: '#EF4444' },
  { level: 7, minPoints: 1200, title: 'Champion', color: '#EC4899' },
  { level: 8, minPoints: 1700, title: 'Legend', color: '#F97316' },
  { level: 9, minPoints: 2500, title: 'Superhero', color: '#6366F1' },
  { level: 10, minPoints: 5000, title: 'Ultimate', color: '#FFD700' },
];

export function calculateLevel(points: number): { level: number; title: string; color: string; nextLevelPoints: number; currentLevelPoints: number } {
  let currentLevel = LEVELS[LEVELS.length - 1];
  
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      currentLevel = LEVELS[i];
      const nextLevel = LEVELS[i + 1];
      return {
        level: currentLevel.level,
        title: currentLevel.title,
        color: currentLevel.color,
        nextLevelPoints: nextLevel ? nextLevel.minPoints : currentLevel.minPoints,
        currentLevelPoints: currentLevel.minPoints,
      };
    }
  }
  
  return {
    level: 1,
    title: 'Beginner',
    color: '#9CA3AF',
    nextLevelPoints: LEVELS[1].minPoints,
    currentLevelPoints: 0,
  };
}

export const POINTS_CONFIG = {
  TASK_COMPLETE: 20,
  TASK_CLAIM: 5,
  TASK_POST: 10,
  EARLY_COMPLETE: 10, // Bonus for completing before scheduled time
  QUICK_CLAIM: 5, // Bonus for claiming within 1 hour of posting
};

