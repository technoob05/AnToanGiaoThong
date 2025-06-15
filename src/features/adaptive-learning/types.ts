export interface QuizQuestion {
  id: string;
  question: string;
  image?: string;
  video?: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'basic' | 'traffic_signs' | 'situations' | 'laws' | 'safety';
  level: 'cap1' | 'cap2' | 'thpt' | 'university';
  points: number;
  timeLimit?: number; // seconds
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface UserProgress {
  id: string;
  userId: string;
  level: 'cap1' | 'cap2' | 'thpt' | 'university';
  currentScore: number;
  totalQuizzes: number;
  correctAnswers: number;
  weakCategories: string[];
  strongCategories: string[];
  lastActivity: Date;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  points: number;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  startTime: Date;
  endTime?: Date;
  score: number;
  level: 'cap1' | 'cap2' | 'thpt' | 'university';
  adaptiveNext: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // milliseconds
  attempts: number;
}

export interface LearningPath {
  id: string;
  level: 'cap1' | 'cap2' | 'thpt' | 'university';
  modules: LearningModule[];
  prerequisites: string[];
  estimatedTime: number; // minutes
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  topics: string[];
  quizCount: number;
  isCompleted: boolean;
  unlockScore: number;
}

export interface AdaptiveFeedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextLevel?: 'cap1' | 'cap2' | 'thpt' | 'university';
  suggestedQuizzes: string[];
}
