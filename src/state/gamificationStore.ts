import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserStats, Achievement, LeaderboardEntry, ACHIEVEMENTS, calculateLevel, POINTS_CONFIG } from "../types/gamification";
import { differenceInDays, format, isToday } from "date-fns";

interface GamificationState {
  userStats: Record<string, UserStats>; // key: `${userId}-${poolId}`
  
  // Actions
  getUserStats: (userId: string, poolId: string) => UserStats;
  addPoints: (userId: string, poolId: string, points: number) => void;
  completeTask: (userId: string, poolId: string, taskTime: Date, isEarly?: boolean) => void;
  claimTask: (userId: string, poolId: string, postedTime: Date) => void;
  postTask: (userId: string, poolId: string) => void;
  unlockAchievement: (userId: string, poolId: string, achievementId: string) => void;
  getLeaderboard: (poolId: string) => LeaderboardEntry[];
  checkAndAwardAchievements: (userId: string, poolId: string) => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      userStats: {},

      getUserStats: (userId: string, poolId: string) => {
        const key = `${userId}-${poolId}`;
        const stats = get().userStats[key];
        
        if (!stats) {
          // Initialize stats for new user
          const newStats: UserStats = {
            userId,
            poolId,
            points: 0,
            level: 1,
            tasksCompleted: 0,
            tasksClaimed: 0,
            tasksPosted: 0,
            currentStreak: 0,
            longestStreak: 0,
            achievements: [],
          };
          
          set((state) => ({
            userStats: {
              ...state.userStats,
              [key]: newStats,
            },
          }));
          
          return newStats;
        }
        
        return stats;
      },

      addPoints: (userId: string, poolId: string, points: number) => {
        const key = `${userId}-${poolId}`;
        set((state) => {
          const currentStats = state.userStats[key] || get().getUserStats(userId, poolId);
          const newPoints = currentStats.points + points;
          const levelInfo = calculateLevel(newPoints);
          
          return {
            userStats: {
              ...state.userStats,
              [key]: {
                ...currentStats,
                points: newPoints,
                level: levelInfo.level,
              },
            },
          };
        });
      },

      completeTask: (userId: string, poolId: string, taskTime: Date, isEarly = false) => {
        const key = `${userId}-${poolId}`;
        set((state) => {
          const currentStats = state.userStats[key] || get().getUserStats(userId, poolId);
          
          // Update streak
          let newStreak = currentStats.currentStreak;
          const lastActivity = currentStats.lastActivityDate ? new Date(currentStats.lastActivityDate) : null;
          
          if (!lastActivity || !isToday(lastActivity)) {
            if (lastActivity && differenceInDays(new Date(), lastActivity) === 1) {
              // Consecutive day
              newStreak += 1;
            } else if (!lastActivity || differenceInDays(new Date(), lastActivity) > 1) {
              // Streak broken or first activity
              newStreak = 1;
            }
          }
          
          const longestStreak = Math.max(currentStats.longestStreak, newStreak);
          
          // Calculate points
          let points = POINTS_CONFIG.TASK_COMPLETE;
          if (isEarly) points += POINTS_CONFIG.EARLY_COMPLETE;
          
          // Check time-based achievements
          const hour = taskTime.getHours();
          const hasEarlyBird = currentStats.achievements.some(a => a.id === 'early_bird');
          const hasNightOwl = currentStats.achievements.some(a => a.id === 'night_owl');
          
          if (hour < 9 && !hasEarlyBird) {
            get().unlockAchievement(userId, poolId, 'early_bird');
          } else if (hour >= 22 && !hasNightOwl) {
            get().unlockAchievement(userId, poolId, 'night_owl');
          }
          
          const newPoints = currentStats.points + points;
          const levelInfo = calculateLevel(newPoints);
          
          const newStats = {
            ...currentStats,
            points: newPoints,
            level: levelInfo.level,
            tasksCompleted: currentStats.tasksCompleted + 1,
            currentStreak: newStreak,
            longestStreak,
            lastActivityDate: new Date().toISOString(),
          };
          
          // Check for achievements after updating stats
          setTimeout(() => get().checkAndAwardAchievements(userId, poolId), 100);
          
          return {
            userStats: {
              ...state.userStats,
              [key]: newStats,
            },
          };
        });
      },

      claimTask: (userId: string, poolId: string, postedTime: Date) => {
        const key = `${userId}-${poolId}`;
        const hoursSincePosted = (Date.now() - postedTime.getTime()) / (1000 * 60 * 60);
        const isQuickClaim = hoursSincePosted <= 1;
        
        let points = POINTS_CONFIG.TASK_CLAIM;
        if (isQuickClaim) points += POINTS_CONFIG.QUICK_CLAIM;
        
        set((state) => {
          const currentStats = state.userStats[key] || get().getUserStats(userId, poolId);
          const newPoints = currentStats.points + points;
          const levelInfo = calculateLevel(newPoints);
          
          return {
            userStats: {
              ...state.userStats,
              [key]: {
                ...currentStats,
                points: newPoints,
                level: levelInfo.level,
                tasksClaimed: currentStats.tasksClaimed + 1,
              },
            },
          };
        });
      },

      postTask: (userId: string, poolId: string) => {
        const key = `${userId}-${poolId}`;
        
        set((state) => {
          const currentStats = state.userStats[key] || get().getUserStats(userId, poolId);
          const newPoints = currentStats.points + POINTS_CONFIG.TASK_POST;
          const levelInfo = calculateLevel(newPoints);
          
          const newStats = {
            ...currentStats,
            points: newPoints,
            level: levelInfo.level,
            tasksPosted: currentStats.tasksPosted + 1,
          };
          
          // Check for first post achievement
          if (newStats.tasksPosted === 1) {
            setTimeout(() => get().unlockAchievement(userId, poolId, 'first_post'), 100);
          }
          
          return {
            userStats: {
              ...state.userStats,
              [key]: newStats,
            },
          };
        });
      },

      unlockAchievement: (userId: string, poolId: string, achievementId: string) => {
        const key = `${userId}-${poolId}`;
        set((state) => {
          const currentStats = state.userStats[key] || get().getUserStats(userId, poolId);
          
          // Check if already unlocked
          if (currentStats.achievements.some(a => a.id === achievementId)) {
            return state;
          }
          
          const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
          if (!achievement) return state;
          
          const unlockedAchievement: Achievement = {
            ...achievement,
            unlockedAt: new Date().toISOString(),
          };
          
          const newPoints = currentStats.points + achievement.points;
          const levelInfo = calculateLevel(newPoints);
          
          return {
            userStats: {
              ...state.userStats,
              [key]: {
                ...currentStats,
                points: newPoints,
                level: levelInfo.level,
                achievements: [...currentStats.achievements, unlockedAchievement],
              },
            },
          };
        });
      },

      checkAndAwardAchievements: (userId: string, poolId: string) => {
        const stats = get().getUserStats(userId, poolId);
        
        // Task completion achievements
        const taskMilestones = [
          { count: 1, id: 'first_task' },
          { count: 5, id: 'five_tasks' },
          { count: 10, id: 'ten_tasks' },
          { count: 25, id: 'twenty_five_tasks' },
          { count: 50, id: 'fifty_tasks' },
        ];
        
        taskMilestones.forEach(({ count, id }) => {
          if (stats.tasksCompleted >= count && !stats.achievements.some(a => a.id === id)) {
            get().unlockAchievement(userId, poolId, id);
          }
        });
        
        // Streak achievements
        if (stats.currentStreak >= 7 && !stats.achievements.some(a => a.id === 'week_streak')) {
          get().unlockAchievement(userId, poolId, 'week_streak');
        }
        if (stats.currentStreak >= 30 && !stats.achievements.some(a => a.id === 'month_streak')) {
          get().unlockAchievement(userId, poolId, 'month_streak');
        }
      },

      getLeaderboard: (poolId: string) => {
        const allStats = Object.values(get().userStats)
          .filter(stats => stats.poolId === poolId)
          .sort((a, b) => b.points - a.points);
        
        return allStats.map((stats, index) => ({
          userId: stats.userId,
          userName: stats.userId, // Will be replaced with actual name in component
          points: stats.points,
          level: stats.level,
          tasksCompleted: stats.tasksCompleted,
          rank: index + 1,
        }));
      },
    }),
    {
      name: "gamification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

