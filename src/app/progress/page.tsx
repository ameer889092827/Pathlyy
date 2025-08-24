"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Target,
  Award,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  Trophy,
  Users,
  Calendar,
  Flame,
  BarChart3,
  RefreshCw,
  Lightbulb,
  Share2,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from '../../../supabase/client';
import { userProgressManager, UserProgress } from '@/utils/userProgress';

type Achievement = {
  id: string;
  title: { en: string; ru: string };
  description: { en: string; ru: string };
  icon: any;
  earned: boolean;
  date?: string;
  progress?: number;
  requirement: number;
  current: number;
  points: number;
  rarity: "common" | "rare" | "epic" | "legendary";
};

type Activity = {
  id: string;
  action: { en: string; ru: string };
  time: string;
  type: "roadmap" | "assessment" | "major" | "milestone" | "goal" | "streak" | "challenge";
  points?: number;
};

type Goal = {
  id: string;
  title: { en: string; ru: string };
  description: { en: string; ru: string };
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  completed: boolean;
  category: "learning" | "exploration" | "skill" | "achievement";
  isCustom?: boolean;
};

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
  totalDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
  lastWeek?: number;
};

type WelcomeChallenge = {
  id: string;
  title: { en: string; ru: string };
  description: { en: string; ru: string };
  completed: boolean;
  points: number;
}

type WelcomeChallengeState = {
  challenge: WelcomeChallenge;
  completedToday: boolean;
  totalCompleted: number;
} | null;

const welcomeChallenges: Omit<WelcomeChallenge, 'completed'>[] = [
  { id: 'day1-explore-major', title: { en: "Day 1: Explore a Major", ru: "День 1: Изучите специальность" }, description: { en: "Start your journey by exploring one major in detail.", ru: "Начните свой путь с детального изучения одной специальности." }, points: 25 },
  { id: 'day2-view-roadmap', title: { en: "Day 2: View a Roadmap", ru: "День 2: Просмотрите дорожную карту" }, description: { en: "Check out the steps for a major you're interested in.", ru: "Ознакомьтесь с шагами для интересующей вас специальности." }, points: 20 },
  { id: 'day3-set-goal', title: { en: "Day 3: Set a Personal Goal", ru: "День 3: Установите личную цель" }, description: { en: "Add a custom goal to your progress tracker.", ru: "Добавьте персональную цель в свой трекер прогресса." }, points: 15 },
  { id: 'day4-explore-three', title: { en: "Day 4: Explore Three Majors", ru: "День 4: Изучите три специальности" }, description: { en: "Broaden your horizons by looking at three different majors.", ru: "Расширьте свой кругозор, рассмотрев три разные специальности." }, points: 30 },
  { id: 'day5-take-assessment', title: { en: "Day 5: Take an Assessment", ru: "День 5: Пройдите оценку" }, description: { en: "Learn more about yourself with our career assessment.", ru: "Узнайте больше о себе с помощью нашей карьерной оценки." }, points: 40 },
  { id: 'day6-share-progress', title: { en: "Day 6: Share Your Progress", ru: "День 6: Поделитесь своим прогрессом" }, description: { en: "Inspire others by sharing your journey so far.", ru: "Вдохновите других, поделившись своим путешествием." }, points: 20 },
  { id: 'day7-achieve-streak', title: { en: "Day 7: Achieve a 3-Day Streak", ru: "День 7: Достигните 3-дневной серии" }, description: { en: "Login for three consecutive days to build a habit.", ru: "Заходите в систему три дня подряд, чтобы выработать привычку." }, points: 50 },
];

const allPossibleGoals: Omit<Goal, "id" | "completed" | "current">[] = [
  { title: { en: "Explore 5 Majors", ru: "Изучить 5 специальностей" }, description: { en: "Broaden your horizons by looking at 5 different majors.", ru: "Расширьте свой кругозор, рассмотрев 5 различных специальностей." }, target: 5, unit: "majors", category: "exploration" },
  { title: { en: "View 3 Roadmaps", ru: "Просмотреть 3 дорожные карты" }, description: { en: "Get a detailed plan for 3 different majors.", ru: "Получите подробный план для 3 различных специальностей." }, target: 3, unit: "roadmaps", category: "learning" },
  { title: { en: "Achieve a 7-Day Streak", ru: "Достичь 7-дневной серии" }, description: { en: "Log in for 7 consecutive days.", ru: "Заходите в систему 7 дней подряд." }, target: 7, unit: "days", category: "achievement" },
  { title: { en: "Reach Level 5", ru: "Достичь 5-го уровня" }, description: { en: "Gain enough experience to get to level 5.", ru: "Наберите достаточно опыта, чтобы достичь 5-го уровня." }, target: 5, unit: "level", category: "achievement" }
];

export default function ProgressPage() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [stats, setStats] = useState({
    majorsExplored: 0,
    roadmapsViewed: 0,
    assessmentsTaken: 0,
    totalProgress: 0,
    totalPoints: 0,
    level: 1,
    experience: 0,
    experienceToNext: 100,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActivity: "",
    totalDays: 0,
    weeklyGoal: 7,
    weeklyProgress: 0,
  });
  const [selectedTab, setSelectedTab] = useState("overview");
  const [welcomeChallengeState, setWelcomeChallengeState] = useState<WelcomeChallengeState>(null);
  const [isCreateGoalModalOpen, setCreateGoalModalOpen] = useState(false);
  const [isEditGoalModalOpen, setEditGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: 1, unit: '' });
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      initializeUserProgress();
    }
  }, [user]);

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

  const initializeUserProgress = async () => {
    if (!user) return;

    try {
      let progress = await userProgressManager.getUserProgress(user.id);

      if (!progress) {
        progress = await userProgressManager.createUserProgress(user.id);
      }

      // Update streak on visit
      await userProgressManager.updateStreak(user.id);

      // Refresh progress after streak update
      progress = await userProgressManager.getUserProgress(user.id);

      if (progress) {
        setUserProgress(progress);
        updateStatsFromProgress(progress);
        updateStreakFromProgress(progress);
        updateGoalsFromProgress(progress);
        updateAchievementsFromProgress(progress);
        updateActivitiesFromProgress(progress);
        updateWelcomeChallengeFromProgress(progress);
      }
    } catch (error) {
      console.error('Error initializing user progress:', error);
    }
  };

  const updateStatsFromProgress = (progress: UserProgress) => {
    const totalProgress = calculateTotalProgress(progress);

    setStats({
      majorsExplored: progress.majors_explored.length,
      roadmapsViewed: progress.roadmaps_viewed.length,
      assessmentsTaken: progress.assessments_taken.length,
      totalProgress,
      totalPoints: progress.total_points,
      level: progress.level,
      experience: progress.experience,
      experienceToNext: 100,
    });
  };

  const calculateTotalProgress = (progress: UserProgress): number => {
    const explorationScore = Math.min(100, (progress.majors_explored.length * 8) + (progress.roadmaps_viewed.length * 12));
    const learningScore = Math.min(100, Object.values(progress.major_progress).reduce((sum, val) => sum + val, 0) / Math.max(1, Object.keys(progress.major_progress).length) * 0.6);
    const assessmentScore = Math.min(100, progress.assessments_taken.length * 20);

    return Math.round((explorationScore * 0.4) + (learningScore * 0.4) + (assessmentScore * 0.2));
  };

  const updateStreakFromProgress = (progress: UserProgress) => {
    const currentWeek = getWeekNumber(new Date());
    const weeklyProgress = Math.min(progress.current_streak, 7); // Cap at weekly goal

    setStreakData({
      currentStreak: progress.current_streak,
      longestStreak: progress.longest_streak,
      lastActivity: progress.last_activity_date,
      totalDays: progress.total_days_active,
      weeklyGoal: 7,
      weeklyProgress,
      lastWeek: currentWeek,
    });
  };

  const updateGoalsFromProgress = (progress: UserProgress) => {
    const goalsFromProgress = progress.goals.map((goal: any) => {
      let current = goal.current;

      // Update current value based on actual progress
      if (goal.id.includes('explore') && goal.unit === 'majors') {
        current = progress.majors_explored.length;
      } else if (goal.id.includes('roadmap') && goal.unit === 'roadmaps') {
        current = progress.roadmaps_viewed.length;
      } else if (goal.id.includes('streak') && goal.unit === 'days') {
        current = progress.current_streak;
      } else if (goal.id.includes('level') && goal.unit === 'level') {
        current = progress.level;
      }

      const completed = current >= goal.target;

      return {
        ...goal,
        current,
        completed,
      };
    });

    setGoals(goalsFromProgress);
  };

  const updateAchievementsFromProgress = (progress: UserProgress) => {
    const achievementsDefinitions: Omit<Achievement, 'earned' | 'date' | 'progress' | 'current'>[] = [
      { id: "first-major", title: { en: "Explorer", ru: "Исследователь" }, description: { en: "Explored your first college major", ru: "Изучили первую специальность" }, icon: BookOpen, requirement: 1, points: 50, rarity: "common" },
      { id: "major-enthusiast", title: { en: "Major Enthusiast", ru: "Энтузиаст специальностей" }, description: { en: "Explored 5 different college majors", ru: "Изучили 5 различных специальностей" }, icon: Target, requirement: 5, points: 150, rarity: "rare" },
      { id: "roadmap-master", title: { en: "Roadmap Master", ru: "Мастер дорожных карт" }, description: { en: "Viewed detailed roadmaps for 5 majors", ru: "Просмотрели детальные дорожные карты для 5 специальностей" }, icon: TrendingUp, requirement: 5, points: 200, rarity: "epic" },
      { id: "assessment-complete", title: { en: "Self-Aware", ru: "Самосознательный" }, description: { en: "Completed career assessment", ru: "Завершили карьерную оценку" }, icon: Award, requirement: 1, points: 100, rarity: "common" },
      { id: "streak-master", title: { en: "Streak Master", ru: "Мастер серий" }, description: { en: "Maintain a 7-day learning streak", ru: "Поддерживайте 7-дневную серию обучения" }, icon: Flame, requirement: 7, points: 300, rarity: "epic" },
      { id: "goal-achiever", title: { en: "Goal Achiever", ru: "Достигающий целей" }, description: { en: "Complete 3 personal goals", ru: "Завершите 3 личные цели" }, icon: Target, requirement: 3, points: 250, rarity: "rare" },
    ];

    const achievementsList = achievementsDefinitions.map(def => {
      const earnedInfo = progress.achievements[def.id];
      const current = getAchievementCurrentValue(def.id, progress);

      return {
        ...def,
        earned: !!earnedInfo?.earned,
        date: earnedInfo?.date,
        current: current,
        progress: Math.min(100, (current / def.requirement) * 100),
      };
    });

    setAchievements(achievementsList);
  };

  const getAchievementCurrentValue = (id: string, progress: UserProgress): number => {
    switch (id) {
      case 'first-major':
      case 'major-enthusiast':
        return progress.majors_explored.length;
      case 'roadmap-master':
        return progress.roadmaps_viewed.length;
      case 'assessment-complete':
        return progress.assessments_taken.length;
      case 'streak-master':
        return progress.current_streak;
      case 'goal-achiever':
        return progress.goals.filter((g: any) => g.completed).length;
      default:
        return 0;
    }
  };

  const updateActivitiesFromProgress = (progress: UserProgress) => {
    setRecentActivity(progress.activities.slice(-15).reverse());
  };

  const updateWelcomeChallengeFromProgress = (progress: UserProgress) => {
    const totalCompleted = progress.welcome_challenges_completed;
    const lastCompletionDate = progress.last_welcome_challenge_date;
    const today = new Date().toISOString().split('T')[0];

    if (totalCompleted >= welcomeChallenges.length) {
      setWelcomeChallengeState(null);
      return;
    }

    const completedToday = lastCompletionDate === today;
    const currentChallengeDef = welcomeChallenges[totalCompleted];
    const challenge: WelcomeChallenge = { ...currentChallengeDef, completed: completedToday };

    setWelcomeChallengeState({ challenge, completedToday, totalCompleted });
  };

  const completeWelcomeChallenge = async () => {
    if (!user || !welcomeChallengeState || welcomeChallengeState.completedToday) return;

    try {
      const newTotalCompleted = welcomeChallengeState.totalCompleted + 1;
      const today = new Date().toISOString().split('T')[0];

      await userProgressManager.updateUserProgress(user.id, {
        welcome_challenges_completed: newTotalCompleted,
        last_welcome_challenge_date: today,
      });

      await userProgressManager.addActivity(user.id, {
        id: Date.now().toString(),
        action: { en: `Completed challenge: ${welcomeChallengeState.challenge.title.en}`, ru: `Завершен вызов: ${welcomeChallengeState.challenge.title.ru}` },
        time: new Date().toLocaleString(language),
        type: "challenge",
        points: welcomeChallengeState.challenge.points,
      });

      await initializeUserProgress();
    } catch (error) {
      console.error('Error completing welcome challenge:', error);
    }
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const suggestNewGoal = async () => {
    if (!user) return;

    const existingGoalIds = goals.map(g => g.id);
    const nextGoalData = allPossibleGoals.find(p => !existingGoalIds.includes(p.title.en.toLowerCase().replace(/ /g, '-')));

    if (nextGoalData) {
      const newGoal: Goal = {
        ...nextGoalData,
        id: nextGoalData.title.en.toLowerCase().replace(/ /g, '-'),
        current: 0,
        completed: false,
      };

      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);

      await userProgressManager.updateUserProgress(user.id, {
        goals: updatedGoals,
      });
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGoal.title.trim() || !newGoal.unit.trim() || newGoal.target < 1) {
      alert("Please fill out all fields for your custom goal.");
      return;
    }

    const newCustomGoal: Goal = {
      id: `custom-${Date.now()}`,
      title: { en: newGoal.title, ru: newGoal.title },
      description: { en: `Achieve a target of ${newGoal.target} ${newGoal.unit}`, ru: `Достигните цели в ${newGoal.target} ${newGoal.unit}` },
      target: newGoal.target,
      current: 0,
      unit: newGoal.unit,
      completed: false,
      category: "skill",
      isCustom: true,
    };

    const updatedGoals = [...goals, newCustomGoal];
    setGoals(updatedGoals);

    await userProgressManager.updateUserProgress(user.id, {
      goals: updatedGoals,
    });

    await userProgressManager.addActivity(user.id, {
      id: Date.now().toString(),
      action: { en: `Created a new goal: ${newGoal.title}`, ru: `Создана новая цель: ${newGoal.title}` },
      time: new Date().toLocaleString(language),
      type: 'goal',
      points: 10,
    });

    setNewGoal({ title: '', target: 1, unit: '' });
    setCreateGoalModalOpen(false);
    await initializeUserProgress();
  };

  const completeGoal = async (goalId: string) => {
    if (!user) return;

    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, completed: true, current: goal.target } : goal
    );
    setGoals(updatedGoals);

    await userProgressManager.updateUserProgress(user.id, {
      goals: updatedGoals,
    });

    await userProgressManager.addActivity(user.id, {
      id: Date.now().toString(),
      action: { en: `Completed goal: ${goals.find(g => g.id === goalId)?.title.en}`, ru: `Завершена цель: ${goals.find(g => g.id === goalId)?.title.ru}` },
      time: new Date().toLocaleString(language),
      type: 'goal',
      points: 50,
    });

    await initializeUserProgress();
  };

  const removeGoal = async (goalId: string) => {
    if (!user) return;

    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);

    await userProgressManager.updateUserProgress(user.id, {
      goals: updatedGoals,
    });

    await initializeUserProgress();
  };

  const editGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setNewGoal({ title: goal.title.en, target: goal.target, unit: goal.unit });
    setEditGoalModalOpen(true);
  };

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingGoal || !newGoal.title.trim() || !newGoal.unit.trim() || newGoal.target < 1) {
      alert("Please fill out all fields for your goal.");
      return;
    }

    const updatedGoals = goals.map(goal => 
      goal.id === editingGoal.id 
        ? {
            ...goal,
            title: { en: newGoal.title, ru: newGoal.title },
            description: { en: `Achieve a target of ${newGoal.target} ${newGoal.unit}`, ru: `Достигните цели в ${newGoal.target} ${newGoal.unit}` },
            target: newGoal.target,
            unit: newGoal.unit,
          }
        : goal
    );
    setGoals(updatedGoals);

    await userProgressManager.updateUserProgress(user.id, {
      goals: updatedGoals,
    });

    setNewGoal({ title: '', target: 1, unit: '' });
    setEditingGoal(null);
    setEditGoalModalOpen(false);
    await initializeUserProgress();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-600 bg-gray-100";
      case "rare": return "text-blue-600 bg-blue-100";
      case "epic": return "text-purple-600 bg-purple-100";
      case "legendary": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common": return "border-gray-200";
      case "rare": return "border-blue-200";
      case "epic": return "border-purple-200";
      case "legendary": return "border-yellow-200";
      default: return "border-gray-200";
    }
  };

  const availableGoals = allPossibleGoals.filter(p => !goals.some(g => g.id === p.title.en.toLowerCase().replace(/ /g, '-')));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your progress</h1>
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">Your Learning Progress</h1>
              <p className="text-muted-foreground">Track your academic journey and achievements</p>
            </div>
          </div>


          <div className="max-w-7xl mx-auto">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 bg-white p-1 rounded-xl shadow-sm">
                <TabsTrigger value="overview" className="rounded-lg">{t("progress.overview")}</TabsTrigger>
                <TabsTrigger value="goals" className="rounded-lg">{t("progress.goals")}</TabsTrigger>
                <TabsTrigger value="achievements" className="rounded-lg">{t("progress.achievements")}</TabsTrigger>
                <TabsTrigger value="activity" className="rounded-lg">{t("progress.activity")}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Level {stats.level}</span>
                          <Badge variant="secondary" className="bg-white/20 text-white">{stats.experience}/{stats.experienceToNext} XP</Badge>
                        </CardTitle>
                        <CardDescription className="text-purple-100">Keep learning to level up and unlock new features!</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Progress value={(stats.experience / stats.experienceToNext) * 100} className="h-3 bg-white/20" />
                      </CardContent>
                    </Card>

                    {welcomeChallengeState && (
                      <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>🏆 {t("progress.welcomeChallenge")} ({welcomeChallengeState.totalCompleted + 1}/7)</span>
                            <Badge variant="secondary" className="bg-white/20 text-white">+{welcomeChallengeState.challenge.points} pts</Badge>
                          </CardTitle>
                          <CardDescription className="text-orange-100">{welcomeChallengeState.challenge.description[language]}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-orange-100 mb-4">{welcomeChallengeState.challenge.description[language]}</p>
                          {welcomeChallengeState.completedToday ? (
                            <div className="flex items-center text-green-200">
                              <CheckCircle className="w-5 h-5 mr-2" />
                              {t("progress.challengeCompletedToday")}
                            </div>
                          ) : (
                            <Button variant="secondary" className="bg-white/20 backdrop-blur-sm hover:bg-white/30" onClick={completeWelcomeChallenge}>
                              {t("progress.completeChallenge")}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center"><BarChart3 className="w-5 h-5 mr-2" />{t("progress.explorationProgress")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center mb-8">
                          <div className="relative w-32 h-32">
                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                              <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * (1 - stats.totalProgress / 100)}`} className="transition-all duration-1000 ease-out"/>
                              <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900">{stats.totalProgress}%</div>
                                <div className="text-sm text-gray-600">{t("progress.complete")}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-purple-50 rounded-xl">
                            <div className="text-2xl font-bold text-purple-600">{stats.majorsExplored}</div>
                            <div className="text-sm text-gray-600">{t("progress.majorsExplored")}</div>
                            <div className="text-xs text-purple-500 mt-1">
                              {stats.majorsExplored >= 5 ? t("progress.topExplorer") : stats.majorsExplored >= 3 ? t("progress.gettingThere") : t("progress.justStarting")}
                            </div>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-xl">
                            <div className="text-2xl font-bold text-blue-600">{stats.roadmapsViewed}</div>
                            <div className="text-sm text-gray-600">{t("progress.roadmapsViewed")}</div>
                            <div className="text-xs text-blue-500 mt-1">
                              {stats.roadmapsViewed >= 5 ? t("progress.roadmapMaster") : stats.roadmapsViewed >= 2 ? t("progress.goodPlanning") : t("progress.startExploring")}
                            </div>
                          </div>
                          <div className="p-4 bg-green-50 rounded-xl">
                            <div className="text-2xl font-bold text-green-600">{stats.assessmentsTaken}</div>
                            <div className="text-sm text-gray-600">{t("progress.assessmentsTaken")}</div>
                            <div className="text-xs text-green-500 mt-1">
                              {stats.assessmentsTaken >= 1 ? t("progress.selfAware") : t("progress.takeFirstStep")}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Flame className="w-5 h-5 mr-2 text-orange-500" />
                          {t("progress.learningStreak")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-orange-600 mb-2">{streakData.currentStreak}</div>
                            <div className="text-sm text-gray-600">{t("progress.currentStreak")}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {streakData.currentStreak > 0 ? t("progress.keepItUp") : t("progress.startYourStreak")}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">{streakData.longestStreak}</div>
                            <div className="text-sm text-gray-600">{t("progress.longestStreak")}</div>
                            <div className="text-xs text-gray-500 mt-1">{t("progress.personalBest")}</div>
                          </div>
                        </div>
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              {t("progress.weeklyGoal").replace('{current}', streakData.weeklyProgress.toString()).replace('{total}', streakData.weeklyGoal.toString())}
                            </span>
                            <span className="text-sm text-gray-600">{Math.round((streakData.weeklyProgress / streakData.weeklyGoal) * 100)}%</span>
                          </div>
                          <Progress value={(streakData.weeklyProgress / streakData.weeklyGoal) * 100} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader><CardTitle className="text-lg">{t("progress.quickStats")}</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{t("progress.totalPoints")}</span>
                          <span className="font-semibold text-purple-600">{stats.totalPoints}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{t("progress.totalDaysActive")}</span>
                          <span className="font-semibold text-blue-600">{streakData.totalDays}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{t("progress.achievements")}</span>
                          <span className="font-semibold text-green-600">{achievements.filter(a => a.earned).length}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                      <CardHeader>
                        <CardTitle>{t("progress.continueJourney")}</CardTitle>
                        <CardDescription className="text-purple-100">{t("progress.continueJourneyDesc")}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Link href="/majors">
                          <Button variant="secondary" className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
                            {t("progress.exploreMoreMajors")}
                          </Button>
                        </Link>
                        <Link href="/assessment">
                          <Button variant="secondary" className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
                            {t("progress.takeAssessment")}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-lg">{t("progress.shareProgress")}</CardTitle></CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full" onClick={() => {
                          const shareText = `🎓 I'm on Level ${stats.level} with ${stats.totalProgress}% progress on Pathly! Join me in exploring college majors!`;
                          if (navigator.share) {
                            navigator.share({ title: t("progress.myPathlyProgress"), text: shareText, url: window.location.origin });
                          } else {
                            navigator.clipboard.writeText(shareText);
                            alert(t("progress.progressCopied"));
                          }
                        }}>
                          <Share2 className="w-4 h-4 mr-2" />
                          {t("progress.shareProgressButton")}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="goals" className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{t("progress.personalGoals")}</h2>
                  <div className="flex gap-2">
                    <Button onClick={suggestNewGoal} disabled={availableGoals.length === 0} variant="outline">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      {availableGoals.length > 0 ? "Suggest Goal" : "No New Goals"}
                    </Button>
                    <Button onClick={() => setCreateGoalModalOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Goal
                    </Button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.map((goal: Goal) => (
                    <Card key={goal.id} className={goal.completed ? "border-green-200 bg-green-50" : ""}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className={goal.completed ? "text-green-800" : ""}>{goal.title[language]}</span>
                          {goal.completed && (<CheckCircle className="w-5 h-5 text-green-600" />)}
                        </CardTitle>
                        <CardDescription className={goal.completed ? "text-green-700" : ""}>{goal.description[language]}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">{t("progress.progress")}</span>
                            <span className="text-sm font-medium">{goal.current}/{goal.target} {goal.unit}</span>
                          </div>
                          <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                        </div>
                        <div className="flex gap-2 mt-4">
                          {!goal.completed && goal.isCustom && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => completeGoal(goal.id)}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          {goal.isCustom && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => editGoal(goal)}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => removeGoal(goal.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                Remove
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">{t("progress.achievements")}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {achievements.map((achievement: Achievement) => {
                    const IconComponent = achievement.icon;
                    return (
                      <Card key={achievement.id} className={`${achievement.earned ? getRarityBorder(achievement.rarity) : "border-gray-200"}`}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className={achievement.earned ? "text-gray-900" : "text-gray-500"}>{achievement.title[language]}</span>
                            <Badge variant="outline" className={getRarityColor(achievement.rarity)}>{achievement.points} pts</Badge>
                          </CardTitle>
                          <CardDescription className={achievement.earned ? "text-gray-600" : "text-gray-400"}>{achievement.description[language]}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <div className={`p-3 rounded-lg mr-4 ${achievement.earned ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              {achievement.earned ? (
                                <div className="flex items-center text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Earned on {achievement.date || 'Unknown date'}
                                </div>
                              ) : (
                                <div>
                                  <div className="text-sm text-gray-500 mb-2">{achievement.current}/{achievement.requirement}</div>
                                  <Progress value={achievement.progress || 0} className="h-2" />
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{t("progress.recentActivity")}</h2>
                  <Button variant="outline" size="sm" onClick={initializeUserProgress}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t("progress.refresh")}
                  </Button>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity: Activity) => (
                          <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-900 font-medium">{activity.action[language] || activity.action['en']}</p>
                                {activity.points && (<Badge variant="outline" className="text-xs">+{activity.points} pts</Badge>)}
                              </div>
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>{t("progress.noRecentActivity")}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {isCreateGoalModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setCreateGoalModalOpen(false)}>
          <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Create Custom Goal</CardTitle>
              <CardDescription>Set a personal learning goal to track your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <Label htmlFor="goal-title">Goal Title</Label>
                  <Input
                    id="goal-title"
                    value={newGoal.title}
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="e.g., Learn Python programming"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal-target">Target Amount</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      min="1"
                      value={newGoal.target}
                      onChange={e => setNewGoal({...newGoal, target: parseInt(e.target.value, 10)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-unit">Unit</Label>
                    <Input
                      id="goal-unit"
                      value={newGoal.unit}
                      onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                      placeholder="e.g., courses, projects, hours"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setCreateGoalModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Goal</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {isEditGoalModalOpen && editingGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditGoalModalOpen(false)}>
          <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Edit Goal</CardTitle>
              <CardDescription>Update your personal learning goal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditGoal} className="space-y-4">
                <div>
                  <Label htmlFor="edit-goal-title">Goal Title</Label>
                  <Input
                    id="edit-goal-title"
                    value={newGoal.title}
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="e.g., Learn Python programming"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-goal-target">Target Amount</Label>
                    <Input
                      id="edit-goal-target"
                      type="number"
                      min="1"
                      value={newGoal.target}
                      onChange={e => setNewGoal({...newGoal, target: parseInt(e.target.value, 10)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-goal-unit">Unit</Label>
                    <Input
                      id="edit-goal-unit"
                      value={newGoal.unit}
                      onChange={e => setNewGoal({...newGoal, unit: e.target.value})}
                      placeholder="e.g., courses, projects, hours"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setEditGoalModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Goal</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}