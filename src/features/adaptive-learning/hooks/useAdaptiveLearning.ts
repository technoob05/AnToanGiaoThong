import { useState, useCallback, useEffect } from 'react';
import { 
  QuizQuestion, 
  QuizSession, 
  QuizAnswer, 
  UserProgress, 
  AdaptiveFeedback,
  Achievement 
} from '../types';
import { QUIZ_QUESTIONS, LEARNING_PATHS, ACHIEVEMENTS, generateAdaptiveFeedback } from '../data/quiz-data';

interface UseAdaptiveLearningReturn {
  // State
  currentSession: QuizSession | null;
  userProgress: UserProgress | null;
  currentQuestion: QuizQuestion | null;
  isLoading: boolean;
  feedback: AdaptiveFeedback | null;
  achievements: Achievement[];
  
  // Actions
  startQuiz: (level: 'cap1' | 'cap2' | 'thpt' | 'university', category?: string) => void;
  answerQuestion: (answerId: string) => void;
  nextQuestion: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  getRecommendedQuestions: () => QuizQuestion[];
  
  // Progress tracking
  updateProgress: (answers: QuizAnswer[]) => void;
  unlockAchievement: (achievementId: string) => void;
}

export function useAdaptiveLearning(): UseAdaptiveLearningReturn {
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('adaptive-learning-progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        lastActivity: new Date(parsed.lastActivity),
        achievements: parsed.achievements.map((a: any) => ({
          ...a,
          unlockedAt: new Date(a.unlockedAt)
        }))
      };
    }
    return {
      id: 'user-1',
      userId: 'user-1',
      level: 'cap1',
      currentScore: 0,
      totalQuizzes: 0,
      correctAnswers: 0,
      weakCategories: [],
      strongCategories: [],
      lastActivity: new Date(),
      achievements: []
    };
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AdaptiveFeedback | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Save progress to localStorage
  useEffect(() => {
    if (userProgress) {
      localStorage.setItem('adaptive-learning-progress', JSON.stringify(userProgress));
    }
  }, [userProgress]);

  const currentQuestion = currentSession?.questions[currentSession.currentQuestionIndex] || null;

  const startQuiz = useCallback((level: 'cap1' | 'cap2' | 'thpt' | 'university', category?: string) => {
    setIsLoading(true);
    
    // Filter questions by level and category
    let filteredQuestions = QUIZ_QUESTIONS.filter(q => q.level === level);
    if (category) {
      filteredQuestions = filteredQuestions.filter(q => q.category === category);
    }

    // Adaptive selection based on user progress
    if (userProgress) {
      // Prioritize weak categories
      const weakCategories = userProgress.weakCategories;
      if (weakCategories.length > 0) {
        const weakQuestions = filteredQuestions.filter(q => 
          weakCategories.includes(q.category)
        );
        if (weakQuestions.length > 0) {
          filteredQuestions = weakQuestions;
        }
      }
    }

    // Shuffle and select questions
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(10, shuffled.length));

    const session: QuizSession = {
      id: `session_${Date.now()}`,
      questions: selectedQuestions,
      currentQuestionIndex: 0,
      answers: [],
      startTime: new Date(),
      score: 0,
      level,
      adaptiveNext: []
    };

    setCurrentSession(session);
    setQuestionStartTime(Date.now());
    setFeedback(null);
    setIsLoading(false);
  }, [userProgress]);

  const answerQuestion = useCallback((answerId: string) => {
    if (!currentSession || !currentQuestion) return;

    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = currentQuestion.correctAnswer === answerId;

    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answerId,
      isCorrect,
      timeSpent,
      attempts: 1
    };

    const updatedSession = {
      ...currentSession,
      answers: [...currentSession.answers, answer],
      score: currentSession.score + (isCorrect ? currentQuestion.points : 0)
    };

    setCurrentSession(updatedSession);
  }, [currentSession, currentQuestion, questionStartTime]);

  const nextQuestion = useCallback(() => {
    if (!currentSession) return;

    if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentSession({
        ...currentSession,
        currentQuestionIndex: currentSession.currentQuestionIndex + 1
      });
      setQuestionStartTime(Date.now());
    } else {
      finishQuiz();
    }
  }, [currentSession]);

  const finishQuiz = useCallback(() => {
    if (!currentSession || !userProgress) return;

    const endTime = new Date();
    const totalTime = endTime.getTime() - currentSession.startTime.getTime();
    const correctAnswers = currentSession.answers.filter(a => a.isCorrect).length;
    const totalQuestions = currentSession.questions.length;

    // Calculate category performance
    const categoryPerformance: { [key: string]: number } = {};
    currentSession.questions.forEach(question => {
      const answer = currentSession.answers.find(a => a.questionId === question.id);
      if (answer) {
        if (!categoryPerformance[question.category]) {
          categoryPerformance[question.category] = 0;
        }
        categoryPerformance[question.category] += answer.isCorrect ? 1 : 0;
      }
    });

    // Normalize category performance
    Object.keys(categoryPerformance).forEach(category => {
      const categoryQuestions = currentSession.questions.filter(q => q.category === category);
      categoryPerformance[category] = categoryPerformance[category] / categoryQuestions.length;
    });

    // Generate adaptive feedback
    const adaptiveFeedback = generateAdaptiveFeedback(
      correctAnswers,
      totalQuestions,
      totalTime,
      categoryPerformance
    );

    // Update user progress
    const updatedProgress: UserProgress = {
      ...userProgress,
      totalQuizzes: userProgress.totalQuizzes + 1,
      correctAnswers: userProgress.correctAnswers + correctAnswers,
      currentScore: userProgress.currentScore + currentSession.score,
      lastActivity: endTime,
      weakCategories: Object.entries(categoryPerformance)
        .filter(([_, score]) => score < 0.7)
        .map(([category, _]) => category),
      strongCategories: Object.entries(categoryPerformance)
        .filter(([_, score]) => score >= 0.8)
        .map(([category, _]) => category)
    };

    // Check for level progression
    if (adaptiveFeedback.nextLevel && correctAnswers / totalQuestions >= 0.8) {
      const levelProgression = {
        'cap1': 'cap2',
        'cap2': 'thpt',
        'thpt': 'university'
      } as const;
      
      const nextLevel = levelProgression[userProgress.level as keyof typeof levelProgression];
      if (nextLevel) {
        updatedProgress.level = nextLevel;
      }
    }

    setUserProgress(updatedProgress);

    // Generate feedback
    const finalFeedback: AdaptiveFeedback = {
      score: (correctAnswers / totalQuestions) * 100,
      strengths: updatedProgress.strongCategories,
      weaknesses: updatedProgress.weakCategories,
      recommendations: adaptiveFeedback.recommendations,
      nextLevel: updatedProgress.level !== userProgress.level ? updatedProgress.level : undefined,
      suggestedQuizzes: getRecommendedQuestions().map(q => q.id)
    };

    setFeedback(finalFeedback);
    
    // Check for achievements
    checkAchievements(updatedProgress, correctAnswers, totalQuestions, totalTime);
    
    // Finish session
    setCurrentSession({
      ...currentSession,
      endTime
    });
  }, [currentSession, userProgress]);

  const checkAchievements = useCallback((
    progress: UserProgress, 
    correctAnswers: number, 
    totalQuestions: number,
    totalTime: number
  ) => {
    const newAchievements: Achievement[] = [];

    // First quiz achievement
    if (progress.totalQuizzes === 1) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'first_quiz');
      if (achievement && !progress.achievements.find(a => a.id === 'first_quiz')) {
        newAchievements.push({ ...achievement, unlockedAt: new Date() });
      }
    }

    // Perfect score achievement
    if (correctAnswers === totalQuestions && totalQuestions > 0) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'perfect_score');
      if (achievement && !progress.achievements.find(a => a.id === 'perfect_score')) {
        newAchievements.push({ ...achievement, unlockedAt: new Date() });
      }
    }

    // Speed achievement (less than 10 seconds per question)
    if (totalTime / totalQuestions < 10000) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'speed_demon');
      if (achievement && !progress.achievements.find(a => a.id === 'speed_demon')) {
        newAchievements.push({ ...achievement, unlockedAt: new Date() });
      }
    }

    // Update progress with new achievements
    if (newAchievements.length > 0) {
      setUserProgress(prev => prev ? {
        ...prev,
        achievements: [...prev.achievements, ...newAchievements],
        currentScore: prev.currentScore + newAchievements.reduce((sum, a) => sum + a.points, 0)
      } : null);
    }
  }, []);

  const resetQuiz = useCallback(() => {
    setCurrentSession(null);
    setFeedback(null);
    setQuestionStartTime(Date.now());
  }, []);

  const getRecommendedQuestions = useCallback((): QuizQuestion[] => {
    if (!userProgress) return [];

    const weakCategories = userProgress.weakCategories;
    const currentLevel = userProgress.level;

    // Get questions from weak categories
    let recommended = QUIZ_QUESTIONS.filter(q => 
      q.level === currentLevel && 
      weakCategories.includes(q.category)
    );

    // If no weak categories, get random questions from current level
    if (recommended.length === 0) {
      recommended = QUIZ_QUESTIONS.filter(q => q.level === currentLevel);
    }

    // Shuffle and return top 5
    return recommended.sort(() => Math.random() - 0.5).slice(0, 5);
  }, [userProgress]);

  const updateProgress = useCallback((answers: QuizAnswer[]) => {
    // This would be used for manual progress updates
    // Implementation depends on specific requirements
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (achievement && userProgress) {
      const isAlreadyUnlocked = userProgress.achievements.find(a => a.id === achievementId);
      if (!isAlreadyUnlocked) {
        setUserProgress({
          ...userProgress,
          achievements: [...userProgress.achievements, { ...achievement, unlockedAt: new Date() }],
          currentScore: userProgress.currentScore + achievement.points
        });
      }
    }
  }, [userProgress]);

  return {
    // State
    currentSession,
    userProgress,
    currentQuestion,
    isLoading,
    feedback,
    achievements: userProgress?.achievements || [],
    
    // Actions
    startQuiz,
    answerQuestion,
    nextQuestion,
    finishQuiz,
    resetQuiz,
    getRecommendedQuestions,
    
    // Progress tracking
    updateProgress,
    unlockAchievement
  };
}
