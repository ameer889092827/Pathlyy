import { createClient } from '../../supabase/client';

export interface UserProgress {
  id?: string;
  user_id: string;
  majors_explored: string[];
  roadmaps_viewed: string[];
  assessments_taken: string[];
  major_progress: Record<string, number>;
  total_points: number;
  level: number;
  experience: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_days_active: number;
  achievements: Record<string, { date: string; earned: boolean }>;
  goals: any[];
  activities: any[];
  welcome_challenges_completed: number;
  last_welcome_challenge_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export class UserProgressManager {
  private supabase = createClient();

  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user progress:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProgress:', error);
      return null;
    }
  }

  async createUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const newProgress = {
        user_id: userId,
        majors_explored: [],
        roadmaps_viewed: [],
        assessments_taken: [],
        major_progress: {},
        total_points: 0,
        level: 1,
        experience: 0,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: new Date().toISOString().split('T')[0],
        total_days_active: 0,
        achievements: {},
        goals: [],
        activities: [],
        welcome_challenges_completed: 0,
        last_welcome_challenge_date: null,
      };

      const { data, error } = await this.supabase
        .from('user_progress')
        .insert(newProgress)
        .select()
        .single();

      if (error) {
        console.error('Error creating user progress:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createUserProgress:', error);
      return null;
    }
  }

  async updateUserProgress(userId: string, progress: Partial<UserProgress>): Promise<UserProgress | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_progress')
        .update({ ...progress, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user progress:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserProgress:', error);
      return null;
    }
  }

  async addActivity(userId: string, activity: any): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) return;

      const activities = [...(progress.activities || []), activity].slice(-50);
      const newPoints = progress.total_points + (activity.points || 0);
      const newLevel = Math.floor(newPoints / 100) + 1;
      const newExperience = newPoints % 100;

      await this.updateUserProgress(userId, {
        activities,
        total_points: newPoints,
        level: newLevel,
        experience: newExperience,
      });
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  }

  async updateStreak(userId: string): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) return;

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = progress.last_activity_date;

      if (lastActivity === today) return; // Already updated today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      let newTotalDays = progress.total_days_active + 1;

      if (lastActivity === yesterdayStr) {
        newStreak = progress.current_streak + 1;
      }

      const newLongestStreak = Math.max(progress.longest_streak, newStreak);

      await this.updateUserProgress(userId, {
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        total_days_active: newTotalDays,
      });
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  async addMajorExplored(userId: string, majorSlug: string): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) return;

      if (!progress.majors_explored.includes(majorSlug)) {
        const newMajors = [...progress.majors_explored, majorSlug];
        await this.updateUserProgress(userId, {
          majors_explored: newMajors,
        });

        await this.addActivity(userId, {
          id: Date.now().toString(),
          action: { en: `Explored major: ${majorSlug}`, ru: `Изучена специальность: ${majorSlug}` },
          time: new Date().toLocaleString(),
          type: "major",
          points: 25,
        });
      }
    } catch (error) {
      console.error('Error adding major explored:', error);
    }
  }

  async addRoadmapViewed(userId: string, majorSlug: string): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) return;

      if (!progress.roadmaps_viewed.includes(majorSlug)) {
        const newRoadmaps = [...progress.roadmaps_viewed, majorSlug];
        await this.updateUserProgress(userId, {
          roadmaps_viewed: newRoadmaps,
        });

        await this.addActivity(userId, {
          id: Date.now().toString(),
          action: { en: `Viewed roadmap: ${majorSlug}`, ru: `Просмотрена карта: ${majorSlug}` },
          time: new Date().toLocaleString(),
          type: "roadmap",
          points: 30,
        });
      }
    } catch (error) {
      console.error('Error adding roadmap viewed:', error);
    }
  }

  async updateMajorProgress(userId: string, majorSlug: string, progressPercent: number): Promise<void> {
    try {
      const progress = await this.getUserProgress(userId);
      if (!progress) return;

      const newMajorProgress = {
        ...progress.major_progress,
        [majorSlug]: progressPercent,
      };

      await this.updateUserProgress(userId, {
        major_progress: newMajorProgress,
      });
    } catch (error) {
      console.error('Error updating major progress:', error);
    }
  }
}

export const userProgressManager = new UserProgressManager();