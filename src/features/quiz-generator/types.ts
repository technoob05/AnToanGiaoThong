export interface Question {
  id: string;
  content: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  level: StudentLevel;
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  createdAt: Date;
  source: string; // document source
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId?: string;
  answers: { [questionId: string]: string | number };
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  feedback: QuestionFeedback[];
}

export interface QuestionFeedback {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string | number;
  correctAnswer: string | number;
  explanation: string;
  suggestion?: string;
}

export type StudentLevel = 'cap1' | 'cap2' | 'thpt' | 'sinhvien';

export interface StudentLevelConfig {
  level: StudentLevel;
  name: string;
  description: string;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionCount: number;
  passingScore: number;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  uploadedAt: Date;
  processedAt?: Date;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
}

export interface DocumentProcessingResult {
  documentId: string;
  extractedText: string;
  keyTopics: string[];
  suggestedQuestions: Question[];
  processingTime: number;
}

export interface QuizGenerationConfig {
  level: StudentLevel;
  questionCount: number;
  includeImages?: boolean;
  focusAreas?: string[];
  difficultyPreference?: 'adaptive' | 'fixed';
} 