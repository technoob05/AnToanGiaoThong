import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Timer, Target, Award, Brain } from 'lucide-react';
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning';
import { cn } from '@/lib/utils';

interface QuizInterfaceProps {
  level?: 'cap1' | 'cap2' | 'thpt' | 'university';
  category?: string;
  onClose?: () => void;
}

export function QuizInterface({ level = 'cap1', category, onClose }: QuizInterfaceProps) {
  const {
    currentSession,
    currentQuestion,
    userProgress,
    feedback,
    isLoading,
    startQuiz,
    answerQuestion,
    nextQuestion,
    finishQuiz,
    resetQuiz
  } = useAdaptiveLearning();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Timer countdown
  useEffect(() => {
    if (currentQuestion && currentQuestion.timeLimit && !showExplanation) {
      setTimeLeft(currentQuestion.timeLimit);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto submit when time runs out
            if (!selectedAnswer) {
              handleAnswer(''); // Submit empty answer
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestion, showExplanation, selectedAnswer]);

  // Start quiz on mount
  useEffect(() => {
    if (!currentSession) {
      startQuiz(level, category);
    }
  }, [level, category, currentSession, startQuiz]);

  const handleAnswer = (answerId: string) => {
    if (selectedAnswer || !currentQuestion) return;
    
    setSelectedAnswer(answerId);
    answerQuestion(answerId);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    nextQuestion();
  };

  const handleFinish = () => {
    finishQuiz();
  };

  const handleRestart = () => {
    resetQuiz();
    startQuiz(level, category);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show feedback screen
  if (feedback) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardTitle className="text-2xl">🎉 Kết quả Quiz</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {Math.round(feedback.score)}%
            </div>
            <p className="text-lg text-gray-600">
              {feedback.score >= 90 ? 'Xuất sắc!' : 
               feedback.score >= 70 ? 'Tốt lắm!' :
               feedback.score >= 50 ? 'Khá ổn!' : 'Cần cố gắng thêm!'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Điểm mạnh
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.strengths.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {feedback.strengths.map(strength => (
                      <Badge key={strength} variant="secondary" className="bg-green-100 text-green-800">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Chưa có điểm mạnh nổi bật</p>
                )}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Cần cải thiện
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedback.weaknesses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {feedback.weaknesses.map(weakness => (
                      <Badge key={weakness} variant="secondary" className="bg-orange-100 text-orange-800">
                        {weakness}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Tất cả các lĩnh vực đều tốt!</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-blue-600 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Gợi ý học tập
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Level progression */}
          {feedback.nextLevel && (
            <div className="text-center mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                🎉 Chúc mừng! Bạn đã lên cấp độ mới!
              </h3>
              <p className="text-green-600">
                Cấp độ tiếp theo: <strong>{feedback.nextLevel}</strong>
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            <Button onClick={handleRestart} className="bg-blue-600 hover:bg-blue-700">
              🔄 Làm lại Quiz
            </Button>
            <Button variant="outline" onClick={() => startQuiz(userProgress?.level || 'cap1')}>
              🎯 Quiz mới
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                ← Quay lại
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion || !currentSession) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="text-center p-8">
          <p className="text-lg text-gray-600 mb-4">Không có câu hỏi nào được tìm thấy</p>
          <Button onClick={() => startQuiz(level, category)}>
            🎯 Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentSession.currentQuestionIndex + 1) / currentSession.questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                📚 Quiz Adaptive Learning
                <Badge variant="secondary">{level.toUpperCase()}</Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Câu {currentSession.currentQuestionIndex + 1} / {currentSession.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {currentQuestion.timeLimit && (
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  <span className={cn(
                    "font-mono font-bold",
                    timeLeft <= 10 ? "text-red-600" : "text-blue-600"
                  )}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                {currentSession.score} điểm
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{currentQuestion.category}</Badge>
            <Badge variant="outline">{currentQuestion.difficulty}</Badge>
            <Badge variant="outline">{currentQuestion.points} điểm</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Image */}
          {currentQuestion.image && (
            <div className="mb-6 text-center">
              <img 
                src={currentQuestion.image} 
                alt="Hình ảnh câu hỏi"
                className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}

          {/* Options */}
          <div className="grid gap-3">
            {currentQuestion.options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                onClick={() => handleAnswer(option.id)}
                disabled={selectedAnswer !== null}
                className={cn(
                  "p-4 h-auto text-left justify-start transition-all",
                  selectedAnswer === option.id && isCorrect && "bg-green-100 border-green-500 text-green-800",
                  selectedAnswer === option.id && !isCorrect && "bg-red-100 border-red-500 text-red-800",
                  showExplanation && option.isCorrect && selectedAnswer !== option.id && "bg-green-50 border-green-300",
                  !selectedAnswer && "hover:bg-blue-50 hover:border-blue-300"
                )}
              >
                <span className="font-semibold mr-3">{option.id.toUpperCase()}</span>
                {option.text}
              </Button>
            ))}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Giải thích:</h4>
              <p className="text-blue-700">{currentQuestion.explanation}</p>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <Badge className="bg-green-100 text-green-800">
                      ✅ Chính xác! +{currentQuestion.points} điểm
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      ❌ Sai rồi! +0 điểm
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {currentSession.currentQuestionIndex === currentSession.questions.length - 1 ? (
                    <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                      🏁 Hoàn thành Quiz
                    </Button>
                  ) : (
                    <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                      ➡️ Câu tiếp theo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
