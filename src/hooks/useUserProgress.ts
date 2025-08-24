
import { useEffect, useState } from 'react';
import { createClient } from '../../supabase/client';
import { userProgressManager } from '@/utils/userProgress';

export const useUserProgress = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      setLoading(false);
    }
  };

  const trackMajorExplored = async (majorSlug: string) => {
    if (user) {
      await userProgressManager.addMajorExplored(user.id, majorSlug);
    }
  };

  const trackRoadmapViewed = async (majorSlug: string) => {
    if (user) {
      await userProgressManager.addRoadmapViewed(user.id, majorSlug);
    }
  };

  const trackAssessmentTaken = async (assessmentId: string) => {
    if (user) {
      const progress = await userProgressManager.getUserProgress(user.id);
      if (progress && !progress.assessments_taken.includes(assessmentId)) {
        await userProgressManager.updateUserProgress(user.id, {
          assessments_taken: [...progress.assessments_taken, assessmentId]
        });
        
        await userProgressManager.addActivity(user.id, {
          id: Date.now().toString(),
          action: { en: `Completed assessment: ${assessmentId}`, ru: `Завершена оценка: ${assessmentId}` },
          time: new Date().toLocaleString(),
          type: "assessment",
          points: 50,
        });
      }
    }
  };

  const updateMajorProgress = async (majorSlug: string, progressPercent: number) => {
    if (user) {
      await userProgressManager.updateMajorProgress(user.id, majorSlug, progressPercent);
    }
  };

  return {
    user,
    loading,
    trackMajorExplored,
    trackRoadmapViewed,
    trackAssessmentTaken,
    updateMajorProgress,
  };
};
