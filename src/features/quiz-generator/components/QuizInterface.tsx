import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Target,
  BookOpen,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Quiz, QuizAttempt, QuestionFeedback } from "../types";

interface QuizInterfaceProps {
  quiz: Quiz;
  onBack: () => void;
}

export const QuizInterface = ({ quiz, onBack }: QuizInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string | number }>({});
  const [timeLeft, setTimeLeft] = useState((quiz.timeLimit || 30) * 60); // Convert to seconds
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer effect
  useEffect(() => {
    if (quizCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setQuizCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizCompleted]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !quizCompleted) {
      handleSubmitQuiz();
    }
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };

  const calculateScore = useCallback((): QuizAttempt => {
    const feedback: QuestionFeedback[] = [];
    let totalScore = 0;
    let totalPoints = 0;

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      totalPoints += question.points;
      if (isCorrect) {
        totalScore += question.points;
      }

      feedback.push({
        questionId: question.id,
        isCorrect,
        userAnswer: userAnswer ?? '',
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        suggestion: isCorrect ? 
          'Tuyệt vời! Bạn đã trả lời đúng.' : 
          'Hãy xem lại phần lý thuyết để hiểu rõ hơn về vấn đề này.'
      });
    });

    const percentage = Math.round((totalScore / totalPoints) * 100);
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    return {
      id: crypto.randomUUID(),
      quizId: quiz.id,
      answers,
      score: totalScore,
      totalPoints,
      percentage,
      timeSpent,
      completedAt: new Date(),
      feedback
    };
  }, [quiz, answers, startTime]);

  const handleSubmitQuiz = useCallback(() => {
    const attempt = calculateScore();
    setQuizAttempt(attempt);
    setQuizCompleted(true);
  }, [calculateScore]);

  const getScoreColor = (percentage: number): string => {
    if (percentage >= quiz.passingScore) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= quiz.passingScore) return 'default';
    if (percentage >= 50) return 'secondary';
    return 'destructive';
  };

  const getLevelRecommendation = (percentage: number): string => {
    if (percentage >= 90) return 'Xuất sắc! Bạn có thể thử thách với cấp độ cao hơn.';
    if (percentage >= quiz.passingScore) return 'Tốt! Hãy tiếp tục luyện tập để nâng cao kiến thức.';
    if (percentage >= 50) return 'Khá tốt, nhưng cần ôn luyện thêm để đạt điểm tối thiểu.';
    return 'Cần học lại từ đầu và luyện tập nhiều hơn.';
  };

  // Quiz completed view
  if (quizCompleted && quizAttempt) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <Trophy className={cn("h-16 w-16 mx-auto mb-4", getScoreColor(quizAttempt.percentage))} />
            <h1 className="text-3xl font-bold mb-2">Kết Quả Quiz</h1>
            <p className="text-muted-foreground">{quiz.title}</p>
          </div>

          {/* Score Summary */}
          <Card className="border-2">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className={cn("text-4xl font-bold mb-2", getScoreColor(quizAttempt.percentage))}>
                    {quizAttempt.percentage}%
                  </div>
                  <p className="text-muted-foreground">Điểm số</p>
                  <Badge variant={getScoreBadgeVariant(quizAttempt.percentage)} className="mt-2">
                    {quizAttempt.percentage >= quiz.passingScore ? 'ĐẠT' : 'CHƯA ĐẠT'}
                  </Badge>
                </div>
                <div>
                  <div className="text-2xl font-semibold mb-2">
                    {quizAttempt.score}/{quizAttempt.totalPoints}
                  </div>
                  <p className="text-muted-foreground">Điểm chi tiết</p>
                  <p className="text-sm text-green-600 mt-2">
                    {quizAttempt.feedback.filter(f => f.isCorrect).length} đúng / {totalQuestions} câu
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-semibold mb-2">
                    {formatTime(quizAttempt.timeSpent)}
                  </div>
                  <p className="text-muted-foreground">Thời gian làm bài</p>
                  <p className="text-sm text-blue-600 mt-2">
                    Còn lại: {formatTime(timeLeft)}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-center font-medium">{getLevelRecommendation(quizAttempt.percentage)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chi Tiết Từng Câu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quizAttempt.feedback.map((feedback, index) => {
                const question = quiz.questions.find(q => q.id === feedback.questionId);
                if (!question) return null;

                return (
                  <div key={feedback.questionId} className={cn(
                    "p-4 rounded-lg border-2",
                    feedback.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  )}>
                    <div className="flex items-start gap-3">
                      {feedback.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">
                          Câu {index + 1}: {question.content}
                        </p>
                        {question.options && (
                          <div className="space-y-2 mb-3">
                            {question.options.map((option, optIndex) => {
                              const isCorrect = optIndex === question.correctAnswer;
                              const isUserAnswer = optIndex === feedback.userAnswer;
                              const optionLetter = String.fromCharCode(65 + optIndex);
                              
                              return (
                                <div
                                  key={optIndex}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border text-sm",
                                    isCorrect && "bg-green-100 border-green-300 text-green-800",
                                    isUserAnswer && !isCorrect && "bg-red-100 border-red-300 text-red-800",
                                    !isCorrect && !isUserAnswer && "bg-gray-50 border-gray-200 text-gray-600"
                                  )}
                                >
                                  <span className={cn(
                                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                    isCorrect && "bg-green-500 text-white",
                                    isUserAnswer && !isCorrect && "bg-red-500 text-white",
                                    !isCorrect && !isUserAnswer && "bg-gray-300 text-gray-600"
                                  )}>
                                    {optionLetter}
                                  </span>
                                  <span className="flex-1">
                                    {option.replace(/^[A-D]\.?\s*/, '')}
                                  </span>
                                  {isCorrect && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                  {isUserAnswer && !isCorrect && (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Giải thích:</strong> {question.explanation}
                        </p>
                        <p className="text-sm text-blue-600">
                          <strong>Gợi ý:</strong> {feedback.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tạo Quiz Mới
            </Button>
            <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm Lại Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking view
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {quiz.level.toUpperCase()}
            </Badge>
            <Badge variant="outline" className={cn(
              "flex items-center gap-1",
              timeLeft < 300 ? "text-red-600 border-red-300" : ""
            )}>
              <Clock className="h-3 w-3" />
              {formatTime(timeLeft)}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Câu {currentQuestionIndex + 1} / {totalQuestions}</span>
            <span>{Math.round(progressPercentage)}% hoàn thành</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Câu {currentQuestionIndex + 1}</span>
              <Badge variant="outline">
                {currentQuestion.points} điểm
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed">{currentQuestion.content}</p>

            {/* Multiple choice options */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestion.id] === index;
                  const optionLetter = String.fromCharCode(65 + index);
                  
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={cn(
                        "w-full text-left justify-start h-auto p-4 whitespace-normal transition-all duration-200",
                        isSelected 
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md" 
                          : "hover:border-blue-300 hover:bg-blue-25"
                      )}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <span className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          isSelected 
                            ? "bg-blue-500 text-white" 
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {optionLetter}
                        </span>
                        <span className="flex-1 text-left">
                          {option.replace(/^[A-D]\.?\s*/, '')} {/* Remove prefix A. B. etc if present */}
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* True/False options */}
            {currentQuestion.type === 'true-false' && (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 h-12",
                    answers[currentQuestion.id] === 1 ? "border-green-500 bg-green-50" : ""
                  )}
                  onClick={() => handleAnswerSelect(1)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Đúng
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 h-12",
                    answers[currentQuestion.id] === 0 ? "border-red-500 bg-red-50" : ""
                  )}
                  onClick={() => handleAnswerSelect(0)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Sai
                </Button>
              </div>
            )}

            {/* Show explanation if enabled */}
            {showExplanation && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Giải thích:</strong> {currentQuestion.explanation}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Câu trước
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-blue-600"
            >
              {showExplanation ? 'Ẩn' : 'Xem'} giải thích
            </Button>
            
            {isLastQuestion ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length !== totalQuestions}
                className="bg-green-600 hover:bg-green-700"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Nộp bài
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Câu tiếp
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Warning for unanswered questions */}
        {Object.keys(answers).length !== totalQuestions && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Bạn còn {totalQuestions - Object.keys(answers).length} câu chưa trả lời. 
              Hãy hoàn thành tất cả câu hỏi trước khi nộp bài.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}; 