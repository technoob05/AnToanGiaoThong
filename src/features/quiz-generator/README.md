# 📚 Quiz Generator Feature

## Tổng quan

Quiz Generator là tính năng **Adaptive Learning & Quiz Pháp Luật** cho phép tạo bài kiểm tra thông minh về luật giao thông Việt Nam từ tài liệu AI và file upload.

## ✨ Tính năng chính

### 1. 🎯 Học theo cấp độ (Adaptive Learning)
- **Cấp 1 (6-11 tuổi)**: Kiến thức cơ bản về an toàn giao thông
- **Cấp 2 (12-15 tuổi)**: Hiểu biết về luật giao thông cơ bản  
- **THPT (16-18 tuổi)**: Nắm vững các quy định giao thông
- **Sinh viên & Người lớn**: Hiểu sâu pháp luật giao thông

### 2. 📄 RAG từ tài liệu
- **Tài liệu có sẵn**: Luật Giao thông đường bộ mới nhất, biển báo giao thông
- **Upload file**: Hỗ trợ PDF (≤20MB inline, >20MB qua File API)
- **Xử lý thông minh**: AI phân tích nội dung và tạo câu hỏi phù hợp

### 3. 🤖 AI-Powered với Gemini 2.0-flash + Structured Output
- **Structured Output**: Đảm bảo format JSON chuẩn và nhất quán
- **Schema Validation**: Kiểm soát chất lượng câu hỏi với OpenAPI 3.0 schema
- **Multiple Choice**: Câu hỏi trắc nghiệm 4 đáp án (A, B, C, D) và Đúng/Sai
- Tạo câu hỏi thông minh theo ngữ cảnh
- Phân loại độ khó adaptive theo cấp độ
- Giải thích chi tiết cho từng câu trả lời

### 4. 🎮 Quiz tương tác
- **Multiple Choice UI**: Giao diện trắc nghiệm đẹp với A, B, C, D buttons
- **True/False UI**: Câu hỏi Đúng/Sai với visual indicators
- Timer đếm ngược theo thời gian
- Navigation qua lại giữa các câu
- Xem giải thích trong lúc làm bài
- Visual feedback cho đáp án đã chọn

### 5. 📊 Phân tích kết quả chi tiết
- Chấm điểm tự động và tính phần trăm
- Feedback chi tiết từng câu hỏi
- Gợi ý học tập tiếp theo
- Phân tích điểm mạnh/yếu

## 🏗️ Cấu trúc Code

```
src/features/quiz-generator/
├── components/
│   ├── QuizGeneratorInterface.tsx    # Main UI component
│   └── QuizInterface.tsx            # Quiz taking interface
├── hooks/
│   └── useQuizGeneration.ts         # Quiz generation logic
├── utils/
│   └── documentProcessor.ts         # PDF/Document processing
├── types.ts                         # TypeScript interfaces
└── README.md                        # Documentation
```

## 📚 API Reference

### DocumentProcessor Class

```typescript
class DocumentProcessor {
  // Xử lý PDF nhỏ (<20MB)
  async processLocalPDF(file: File): Promise<DocumentProcessingResult>
  
  // Xử lý PDF lớn (>20MB) qua File API
  async processLargePDF(file: File): Promise<DocumentProcessingResult>
  
  // Tạo quiz từ tài liệu có sẵn
  async generateQuizFromPresetDocs(level: StudentLevel, count: number): Promise<Question[]>
}
```

### useQuizGeneration Hook

```typescript
const {
  questions,           // Danh sách câu hỏi
  currentQuiz,         // Quiz hiện tại
  isGenerating,        // Trạng thái đang tạo
  error,              // Lỗi nếu có
  progress,           // Tiến độ (0-100)
  generateFromUpload, // Tạo từ file upload
  generateFromPresetDocs, // Tạo từ tài liệu có sẵn
  clearQuiz,          // Xóa quiz
  retryGeneration     // Thử lại
} = useQuizGeneration();
```

## 🔧 Configuration

### Environment Variables
```bash
# .env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Level Configurations
```typescript
const LEVEL_CONFIGS = {
  cap1: {
    name: 'Cấp 1 (6-11 tuổi)',
    passingScore: 60,
    difficultyDistribution: { easy: 70, medium: 30, hard: 0 }
  },
  cap2: {
    name: 'Cấp 2 (12-15 tuổi)', 
    passingScore: 65,
    difficultyDistribution: { easy: 50, medium: 40, hard: 10 }
  },
  thpt: {
    name: 'THPT (16-18 tuổi)',
    passingScore: 70,
    difficultyDistribution: { easy: 30, medium: 50, hard: 20 }
  },
  sinhvien: {
    name: 'Sinh viên & Người lớn',
    passingScore: 75,
    difficultyDistribution: { easy: 20, medium: 40, hard: 40 }
  }
};
```

## 🚀 Usage

### 1. Tạo Quiz từ tài liệu có sẵn
```typescript
const config: QuizGenerationConfig = {
  level: 'thpt',
  questionCount: 10,
  difficultyPreference: 'adaptive'
};

await generateFromPresetDocs(config);
```

### 2. Tạo Quiz từ file upload
```typescript
const file = // File object from input
const config: QuizGenerationConfig = {
  level: 'sinhvien',
  questionCount: 15,
  includeImages: true
};

await generateFromUpload(file, config);
```

## 🎨 UI Components

### QuizGeneratorInterface
- Level selection với visual cards
- File upload với drag & drop
- Progress tracking
- Error handling với retry

### QuizInterface
- Question navigation
- Timer countdown
- Real-time scoring
- Detailed feedback
- Results analysis

## 📊 Data Models

### Question
```typescript
interface Question {
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
```

### Quiz
```typescript
interface Quiz {
  id: string;
  title: string;
  description: string;
  level: StudentLevel;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  createdAt: Date;
  source: string;
}
```

## 🔮 Tính năng nâng cao (Future)

- [ ] **VR Simulation**: Mô phỏng tình huống giao thông với Unity WebGL
- [ ] **Video 360°**: Trải nghiệm immersive "qua đường thế nào?"
- [ ] **Real-time Multiplayer**: Quiz thi đấu theo nhóm
- [ ] **Blockchain Certificates**: Chứng chỉ hoàn thành trên blockchain
- [ ] **Voice Recognition**: Trả lời bằng giọng nói
- [ ] **AR Overlays**: Hiển thị thông tin bổ sung qua camera

## 🚦 Integration

### Routing
```typescript
// src/App.tsx
<Route path="/quiz-generator" element={<QuizGeneratorInterface />} />
```

### Homepage Card
```typescript
// src/features/homepage/components/HomePage.tsx
<Card onClick={() => navigate('/quiz-generator')}>
  <CardTitle>📚 Quiz Pháp Luật</CardTitle>
  <CardDescription>Tạo bài kiểm tra thông minh từ AI</CardDescription>
</Card>
```

## 🐛 Troubleshooting

### Common Issues

**1. API Key Error**
```bash
Error: API key không được tìm thấy
Solution: Thêm VITE_GEMINI_API_KEY vào file .env
```

**2. File Upload Error**
```bash
Error: Chỉ hỗ trợ file PDF
Solution: Chọn file PDF hợp lệ, kiểm tra MIME type
```

**3. Large File Processing**
```bash
Error: File quá lớn
Solution: File >20MB sẽ dùng File API, cần thời gian xử lý lâu hơn
```

## 📈 Performance

- **Small PDFs (<20MB)**: Inline processing ~2-5 giây
- **Large PDFs (>20MB)**: File API processing ~10-30 giây  
- **Quiz Generation**: ~3-7 giây tùy độ phức tạp
- **Memory Usage**: ~50MB cho document processing

## 🔒 Security

- File validation: Chỉ accept PDF MIME types
- API key protection: Environment variables
- Rate limiting: Gemini API built-in limits
- Input sanitization: Escape special characters

---

**Tác giả**: G-Traffic Heroes Team  
**Phiên bản**: 1.0.0  
**Cập nhật**: 2025-01-15 