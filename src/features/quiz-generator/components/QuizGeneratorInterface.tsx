import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  BookOpen, 
  Users, 
  Target, 
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentLevel, QuizGenerationConfig } from "../types";
import { useQuizGeneration } from "../hooks/useQuizGeneration";
import { QuizInterface } from "./QuizInterface";

const LEVEL_CONFIGS = {
  cap1: {
    name: 'Cấp 1 (6-11 tuổi)',
    description: 'Kiến thức cơ bản về an toàn giao thông',
    icon: '🎈',
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  cap2: {
    name: 'Cấp 2 (12-15 tuổi)',
    description: 'Hiểu biết về luật giao thông cơ bản',
    icon: '🎒',
    color: 'bg-green-100 text-green-700 border-green-300'
  },
  thpt: {
    name: 'THPT (16-18 tuổi)',
    description: 'Nắm vững các quy định giao thông',
    icon: '🎓',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  },
  sinhvien: {
    name: 'Sinh viên & Người lớn',
    description: 'Hiểu sâu pháp luật giao thông',
    icon: '🏆',
    color: 'bg-purple-100 text-purple-700 border-purple-300'
  }
};

export const QuizGeneratorInterface = () => {
  const [selectedLevel, setSelectedLevel] = useState<StudentLevel>('thpt');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const {
    currentQuiz,
    isGenerating,
    error,
    progress,
    generateFromUpload,
    generateFromPresetDocs,
    clearQuiz,
    retryGeneration
  } = useQuizGeneration();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setUploadedFile(file);
      } else {
        alert('Chỉ hỗ trợ file PDF. Vui lòng chọn file khác.');
      }
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setUploadedFile(file);
      } else {
        alert('Chỉ hỗ trợ file PDF. Vui lòng chọn file khác.');
      }
    }
  }, []);

  const generateQuizFromFile = async () => {
    if (!uploadedFile) return;

    const config: QuizGenerationConfig = {
      level: selectedLevel,
      questionCount,
      difficultyPreference: 'adaptive'
    };

    await generateFromUpload(uploadedFile, config);
    setShowQuiz(true);
  };

  const generateQuizFromPreset = async () => {
    const config: QuizGenerationConfig = {
      level: selectedLevel,
      questionCount,
      difficultyPreference: 'adaptive'
    };

    await generateFromPresetDocs(config);
    setShowQuiz(true);
  };

  const resetAndReturnToGenerator = () => {
    setShowQuiz(false);
    clearQuiz();
    setUploadedFile(null);
  };

  // Show quiz interface if quiz is generated
  if (showQuiz && currentQuiz) {
    return (
      <QuizInterface 
        quiz={currentQuiz}
        onBack={resetAndReturnToGenerator}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            📚 Tạo Quiz Pháp Luật Giao Thông
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tạo bài kiểm tra thông minh từ tài liệu pháp luật hoặc upload file của bạn
          </p>
        </div>

        {/* Level Selection */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Chọn Cấp Độ Học Tập
            </CardTitle>
            <CardDescription>
              Chọn trình độ phù hợp để tạo câu hỏi có độ khó tương ứng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(LEVEL_CONFIGS).map(([level, config]) => (
                <Card
                  key={level}
                  className={cn(
                    "cursor-pointer border-2 transition-all duration-200 hover:scale-105",
                    selectedLevel === level 
                      ? config.color + " ring-2 ring-offset-2 ring-purple-400" 
                      : "border-gray-200 hover:border-purple-300"
                  )}
                  onClick={() => setSelectedLevel(level as StudentLevel)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{config.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{config.name}</h3>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Label htmlFor="question-count" className="text-sm font-medium">
                  Số câu hỏi:
                </Label>
                <Select value={questionCount.toString()} onValueChange={(val) => setQuestionCount(parseInt(val))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.max(questionCount * 1.5, 10)} phút
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Generation Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload File Option */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Upload Tài Liệu
              </CardTitle>
              <CardDescription>
                Upload file PDF để tạo câu hỏi từ nội dung tài liệu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300",
                  uploadedFile ? "border-green-400 bg-green-50" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                    <p className="font-medium text-green-700">{uploadedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadedFile(null)}
                    >
                      Chọn file khác
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Kéo thả file PDF vào đây</p>
                      <p className="text-sm text-muted-foreground">hoặc click để chọn file</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Chọn File PDF
                      </label>
                    </Button>
                  </div>
                )}
              </div>
              
              {uploadedFile && (
                <Button
                  onClick={generateQuizFromFile}
                  disabled={isGenerating}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Tạo Quiz từ File
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Preset Documents Option */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Tài Liệu Có Sẵn
              </CardTitle>
              <CardDescription>
                Tạo câu hỏi từ tài liệu luật giao thông Việt Nam có sẵn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">📋 Tài liệu bao gồm:</h4>
                  <ul className="text-sm text-green-700 space-y-1 mb-3">
                    <li>• Luật Giao thông đường bộ mới nhất</li>
                    <li>• Quy định về biển báo giao thông</li>
                    <li>• Hướng dẫn thi bằng lái xe</li>
                    <li>• Các tình huống thực tế</li>
                  </ul>
                  
                  <details className="mt-3">
                    <summary className="text-sm font-medium text-green-800 cursor-pointer hover:text-green-900">
                      🔍 Xem ví dụ câu hỏi
                    </summary>
                    <div className="mt-2 p-3 bg-white rounded border border-green-200">
                      <div className="text-xs text-green-700 space-y-2">
                        <div>
                          <strong>Trắc nghiệm:</strong> "Tốc độ tối đa cho phép trong khu vực đông dân cư là?"
                          <br />A. 50 km/h  B. 60 km/h  C. 40 km/h  D. 70 km/h
                        </div>
                        <div>
                          <strong>Đúng/Sai:</strong> "Người đi bộ được phép băng qua đường tại bất kỳ vị trí nào."
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
                
                <Button
                  onClick={generateQuizFromPreset}
                  disabled={isGenerating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Tạo Quiz từ Tài liệu
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <Card className="border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-orange-600" />
                  <span className="font-medium">Đang tạo quiz...</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  AI đang phân tích tài liệu và tạo câu hỏi phù hợp với cấp độ {LEVEL_CONFIGS[selectedLevel].name}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={retryGeneration}>
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Users className="h-8 w-8 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">💡 Adaptive Learning</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Hệ thống sẽ tự động điều chỉnh độ khó câu hỏi theo cấp độ bạn chọn. 
                  Sau khi hoàn thành quiz, bạn sẽ nhận được phân tích chi tiết và gợi ý học tập tiếp theo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 