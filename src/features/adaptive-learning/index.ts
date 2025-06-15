// Export all adaptive learning components and hooks
export { useAdaptiveLearning } from './hooks/useAdaptiveLearning';
export { QuizInterface } from './components/QuizInterface';
export { LearningDashboard } from './components/LearningDashboard';

// Export types
export type {
  QuizQuestion,
  QuizSession,
  QuizAnswer,
  UserProgress,
  AdaptiveFeedback,
  Achievement,
  LearningPath,
  LearningModule
} from './types';

// Export data
export { QUIZ_QUESTIONS, LEARNING_PATHS, ACHIEVEMENTS, generateAdaptiveFeedback } from './data/quiz-data';
