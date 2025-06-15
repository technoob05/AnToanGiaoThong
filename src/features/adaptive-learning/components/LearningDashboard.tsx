import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Target, 
  Brain, 
  Award, 
  TrendingUp,
  Play,
  Star,
  Zap
} from 'lucide-react';
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning';
import { QuizInterface } from './QuizInterface';
import { LEARNING_PATHS } from '../data/quiz-data';
import { cn } from '@/lib/utils';

export function LearningDashboard() {
  const { userProgress, achievements, getRecommendedQuestions } = useAdaptiveLearning();
  const [activeTab, setActiveTab] = useState('overview');
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'cap1' | 'cap2' | 'thpt' | 'university'>('cap1');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <QuizInterface 
          level={selectedLevel}
          category={selectedCategory || undefined}
          onClose={() => setShowQuiz(false)}
        />
      </div>
    );
  }

  const levelColors = {
    cap1: 'bg-green-100 text-green-800 border-green-200',
    cap2: 'bg-blue-100 text-blue-800 border-blue-200',
    thpt: 'bg-purple-100 text-purple-800 border-purple-200',
    university: 'bg-red-100 text-red-800 border-red-200'
  };

  const levelNames = {
    cap1: 'Cấp 1',
    cap2: 'Cấp 2', 
    thpt: 'THPT',
    university: 'Đại học'
  };

  const categoryNames = {
    basic: 'Cơ bản',
    traffic_signs: 'Biển báo',
    situations: 'Tình huống',
    laws: 'Luật pháp',
    safety: 'An toàn'
  };

  const accuracyRate = userProgress ? 
    (userProgress.correctAnswers / (userProgress.totalQuizzes * 10)) * 100 : 0;

  const currentLevelPath = LEARNING_PATHS.find(path => path.level === userProgress?.level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎓 Adaptive Learning Dashboard
          </h1>
          <p className="text-gray-600">
            Học thích ứng theo trình độ - Nâng cao kiến thức giao thông một cách thông minh
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">📊 Tổng quan</TabsTrigger>
            <TabsTrigger value="quiz">🎯 Quiz</TabsTrigger>
            <TabsTrigger value="progress">📈 Tiến độ</TabsTrigger>
            <TabsTrigger value="achievements">🏆 Thành tích</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Trophy className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Điểm tổng</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {userProgress?.currentScore || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Độ chính xác</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(accuracyRate)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quiz hoàn thành</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {userProgress?.totalQuizzes || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Thành tích</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {achievements.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Level & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Cấp độ hiện tại
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <Badge className={cn("text-lg px-4 py-2", levelColors[userProgress?.level || 'cap1'])}>
                      {levelNames[userProgress?.level || 'cap1']}
                    </Badge>
                  </div>
                  
                  {currentLevelPath && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 text-center">
                        Thời gian ước tính: {currentLevelPath.estimatedTime} phút
                      </p>
                      
                      <div className="space-y-2">
                        {currentLevelPath.modules.map(module => (
                          <div key={module.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{module.title}</p>
                              <p className="text-sm text-gray-600">{module.quizCount} câu hỏi</p>
                            </div>
                            <Badge variant={module.isCompleted ? "default" : "secondary"}>
                              {module.isCompleted ? "✅" : "⏳"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Hành động nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                    onClick={() => {
                      setSelectedLevel(userProgress?.level || 'cap1');
                      setSelectedCategory('');
                      setShowQuiz(true);
                    }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Bắt đầu Quiz Adaptive
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedLevel(userProgress?.level || 'cap1');
                        setSelectedCategory('traffic_signs');
                        setShowQuiz(true);
                      }}
                    >
                      🚦 Biển báo
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedLevel(userProgress?.level || 'cap1');
                        setSelectedCategory('laws');
                        setShowQuiz(true);
                      }}
                    >
                      ⚖️ Luật pháp
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedLevel(userProgress?.level || 'cap1');
                        setSelectedCategory('situations');
                        setShowQuiz(true);
                      }}
                    >
                      🚗 Tình huống
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedLevel(userProgress?.level || 'cap1');
                        setSelectedCategory('safety');
                        setShowQuiz(true);
                      }}
                    >
                      🛡️ An toàn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quiz được đề xuất
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getRecommendedQuestions().map(question => (
                    <Card key={question.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="text-xs">
                            {categoryNames[question.category as keyof typeof categoryNames]}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {question.points} điểm
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-2 line-clamp-2">
                          {question.question}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs",
                              question.difficulty === 'easy' && "text-green-600",
                              question.difficulty === 'medium' && "text-yellow-600", 
                              question.difficulty === 'hard' && "text-red-600"
                            )}
                          >
                            {question.difficulty}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setSelectedLevel(question.level);
                              setSelectedCategory(question.category);
                              setShowQuiz(true);
                            }}
                          >
                            Làm bài
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Tạo Quiz tùy chỉnh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cấp độ</label>
                    <Select value={selectedLevel} onValueChange={(value: any) => setSelectedLevel(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cap1">Cấp 1</SelectItem>
                        <SelectItem value="cap2">Cấp 2</SelectItem>
                        <SelectItem value="thpt">THPT</SelectItem>
                        <SelectItem value="university">Đại học</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Chủ đề (tùy chọn)</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả chủ đề" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tất cả chủ đề</SelectItem>
                        <SelectItem value="basic">Cơ bản</SelectItem>
                        <SelectItem value="traffic_signs">Biển báo</SelectItem>
                        <SelectItem value="situations">Tình huống</SelectItem>
                        <SelectItem value="laws">Luật pháp</SelectItem>
                        <SelectItem value="safety">An toàn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={() => setShowQuiz(true)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Bắt đầu Quiz
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths & Weaknesses */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Phân tích năng lực</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-600 mb-2">Điểm mạnh</h4>
                    <div className="flex flex-wrap gap-2">
                      {userProgress?.strongCategories.map(category => (
                        <Badge key={category} className="bg-green-100 text-green-800">
                          {categoryNames[category as keyof typeof categoryNames]}
                        </Badge>
                      )) || <p className="text-sm text-gray-500">Chưa có dữ liệu</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-orange-600 mb-2">Cần cải thiện</h4>
                    <div className="flex flex-wrap gap-2">
                      {userProgress?.weakCategories.map(category => (
                        <Badge key={category} className="bg-orange-100 text-orange-800">
                          {categoryNames[category as keyof typeof categoryNames]}
                        </Badge>
                      )) || <p className="text-sm text-gray-500">Tất cả đều tốt!</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Path Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>🛤️ Lộ trình học tập</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {LEARNING_PATHS.map(path => (
                      <div key={path.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={levelColors[path.level]}>
                            {levelNames[path.level]}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {path.estimatedTime} phút
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {path.modules.map(module => (
                            <div key={module.id} className="flex items-center justify-between">
                              <span className="text-sm">{module.title}</span>
                              <Badge variant={module.isCompleted ? "default" : "secondary"} className="text-xs">
                                {module.isCompleted ? "Hoàn thành" : "Chưa hoàn thành"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🏆 Thành tích của bạn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map(achievement => (
                    <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <h3 className="font-semibold mb-1">{achievement.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          +{achievement.points} điểm
                        </Badge>
                        <p className="text-xs text-gray-500 mt-2">
                          {achievement.unlockedAt.toLocaleDateString('vi-VN')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {achievements.length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Chưa có thành tích nào</p>
                    <Button onClick={() => setActiveTab('quiz')}>
                      Bắt đầu làm quiz để mở khóa thành tích
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
