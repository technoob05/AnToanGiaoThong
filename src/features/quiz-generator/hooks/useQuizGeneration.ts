import { useState, useCallback } from 'react';
import { Question, Quiz, StudentLevel, QuizGenerationConfig } from '../types';
import { DocumentProcessor } from '../utils/documentProcessor';

interface UseQuizGenerationReturn {
  questions: Question[];
  currentQuiz: Quiz | null;
  isGenerating: boolean;
  error: string | null;
  progress: number;
  generateFromUpload: (file: File, config: QuizGenerationConfig) => Promise<void>;
  generateFromPresetDocs: (config: QuizGenerationConfig) => Promise<void>;
  clearQuiz: () => void;
  retryGeneration: () => void;
}

export const useQuizGeneration = (): UseQuizGenerationReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastConfig, setLastConfig] = useState<QuizGenerationConfig | null>(null);

  const initializeProcessor = useCallback(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API key không được tìm thấy. Vui lòng cấu hình VITE_GEMINI_API_KEY trong file .env');
    }
    return new DocumentProcessor(apiKey);
  }, []);

  const generateQuizId = () => crypto.randomUUID();

  const addQuestionIds = (questions: Question[]): Question[] => {
    return questions.map(q => ({
      ...q,
      id: q.id || crypto.randomUUID(),
      points: q.points || getPointsByDifficulty(q.difficulty)
    }));
  };

  const getPointsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    const pointMap = { easy: 5, medium: 10, hard: 15 };
    return pointMap[difficulty];
  };

  const getLevelConfig = (level: StudentLevel) => {
    const configs = {
      cap1: { name: 'Cấp 1', passingScore: 60 },
      cap2: { name: 'Cấp 2', passingScore: 65 },
      thpt: { name: 'THPT', passingScore: 70 },
      sinhvien: { name: 'Sinh viên', passingScore: 75 }
    };
    return configs[level];
  };

  const generateFromUpload = useCallback(async (file: File, config: QuizGenerationConfig) => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setLastConfig(config);

    try {
      const processor = initializeProcessor();
      
      setProgress(20);
      
      // Process uploaded file
      let result;
      if (file.size > 20 * 1024 * 1024) { // 20MB
        result = await processor.processLargePDF(file);
      } else {
        result = await processor.processLocalPDF(file);
      }
      
      setProgress(60);

      // Generate additional questions if needed
      let allQuestions = result.suggestedQuestions;
      
      if (allQuestions.length < config.questionCount) {
        const additionalQuestions = await processor.generateQuizFromPresetDocs(
          config.level, 
          config.questionCount - allQuestions.length
        );
        allQuestions = [...allQuestions, ...additionalQuestions];
      }

      setProgress(80);

      // Process and format questions
      const formattedQuestions = addQuestionIds(allQuestions.slice(0, config.questionCount));
      
      // Create quiz object
      const levelConfig = getLevelConfig(config.level);
      const quiz: Quiz = {
        id: generateQuizId(),
        title: `Quiz ${levelConfig.name} - ${file.name}`,
        description: `Bài kiểm tra được tạo từ tài liệu "${file.name}" cho học sinh ${levelConfig.name}`,
        level: config.level,
        questions: formattedQuestions,
        timeLimit: calculateTimeLimit(formattedQuestions.length),
        passingScore: levelConfig.passingScore,
        createdAt: new Date(),
        source: file.name
      };

      setProgress(100);
      setQuestions(formattedQuestions);
      setCurrentQuiz(quiz);

    } catch (err) {
      console.error('Error generating quiz from upload:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo quiz từ file upload');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [initializeProcessor]);

  const generateFromPresetDocs = useCallback(async (config: QuizGenerationConfig) => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setLastConfig(config);

    try {
      const processor = initializeProcessor();
      
      setProgress(30);
      
      // Generate questions from preset documents
      const generatedQuestions = await processor.generateQuizFromPresetDocs(
        config.level, 
        config.questionCount
      );
      
      setProgress(70);

      if (generatedQuestions.length === 0) {
        throw new Error('Không thể tạo câu hỏi từ tài liệu có sẵn. Vui lòng thử lại.');
      }

      // Process and format questions
      const formattedQuestions = addQuestionIds(generatedQuestions.slice(0, config.questionCount));
      
      // Create quiz object
      const levelConfig = getLevelConfig(config.level);
      const quiz: Quiz = {
        id: generateQuizId(),
        title: `Quiz ${levelConfig.name} - Luật Giao thông`,
        description: `Bài kiểm tra luật giao thông cho học sinh ${levelConfig.name} từ tài liệu pháp luật`,
        level: config.level,
        questions: formattedQuestions,
        timeLimit: calculateTimeLimit(formattedQuestions.length),
        passingScore: levelConfig.passingScore,
        createdAt: new Date(),
        source: 'Tài liệu luật giao thông Việt Nam'
      };

      setProgress(100);
      setQuestions(formattedQuestions);
      setCurrentQuiz(quiz);

    } catch (err) {
      console.error('Error generating quiz from preset docs:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo quiz từ tài liệu có sẵn');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [initializeProcessor]);

  const calculateTimeLimit = (questionCount: number): number => {
    // 1.5 minutes per question, minimum 10 minutes
    return Math.max(questionCount * 1.5, 10);
  };

  const clearQuiz = useCallback(() => {
    setQuestions([]);
    setCurrentQuiz(null);
    setError(null);
    setProgress(0);
  }, []);

  const retryGeneration = useCallback(() => {
    if (lastConfig) {
      generateFromPresetDocs(lastConfig);
    }
  }, [lastConfig, generateFromPresetDocs]);

  return {
    questions,
    currentQuiz,
    isGenerating,
    error,
    progress,
    generateFromUpload,
    generateFromPresetDocs,
    clearQuiz,
    retryGeneration
  };
}; 