import { GoogleGenAI } from "@google/genai";
import { DocumentProcessingResult, Question, StudentLevel } from "../types";

// Structured output schemas for Gemini API
const QuestionSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    content: { type: "string", description: "Câu hỏi về luật giao thông" },
    type: { 
      type: "string", 
      enum: ["multiple-choice", "true-false"],
      description: "Loại câu hỏi"
    },
    options: { 
      type: "array", 
      items: { type: "string" },
      minItems: 2,
      maxItems: 4,
      description: "Các phương án trả lời (A, B, C, D cho trắc nghiệm hoặc Đúng/Sai)"
    },
    correctAnswer: { 
      type: "integer", 
      minimum: 0, 
      maximum: 3,
      description: "Chỉ số đáp án đúng (0=A, 1=B, 2=C, 3=D)"
    },
    explanation: { 
      type: "string",
      description: "Giải thích chi tiết tại sao đáp án này đúng"
    },
    difficulty: { 
      type: "string", 
      enum: ["easy", "medium", "hard"],
      description: "Độ khó của câu hỏi"
    },
    category: { 
      type: "string",
      description: "Chủ đề của câu hỏi (ví dụ: biển báo, luật lệ, an toàn)"
    },
    points: { 
      type: "integer", 
      minimum: 5, 
      maximum: 15,
      description: "Điểm số cho câu hỏi này"
    }
  },
  required: ["content", "type", "options", "correctAnswer", "explanation", "difficulty", "category"],
  propertyOrdering: ["content", "type", "options", "correctAnswer", "explanation", "difficulty", "category", "points"]
};

const DocumentAnalysisSchema = {
  type: "object",
  properties: {
    keyTopics: {
      type: "array",
      items: { type: "string" },
      description: "Các chủ đề chính trong tài liệu"
    },
    extractedText: {
      type: "string",
      description: "Tóm tắt nội dung chính của tài liệu"
    },
    suggestedQuestions: {
      type: "array",
      items: QuestionSchema,
      minItems: 5,
      maxItems: 15,
      description: "Danh sách câu hỏi được tạo từ tài liệu"
    }
  },
  required: ["keyTopics", "extractedText", "suggestedQuestions"],
  propertyOrdering: ["keyTopics", "extractedText", "suggestedQuestions"]
};

const QuizGenerationSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: QuestionSchema,
      description: "Danh sách câu hỏi quiz"
    }
  },
  required: ["questions"],
  propertyOrdering: ["questions"]
};

export class DocumentProcessor {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Process local PDF file and extract content
   */
  async processLocalPDF(file: File): Promise<DocumentProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString("base64");

      const contents = [
        { 
          text: `Analyze this Vietnamese traffic law document and create high-quality quiz questions.

Requirements:
- Create both multiple-choice questions (4 options A, B, C, D) and true/false questions
- Questions must be based on actual content from the document
- Provide detailed explanations for each correct answer
- Classify difficulty levels appropriately
- **IMPORTANT: Write all content in Vietnamese language**

Focus areas:
- Specific legal regulations and laws
- Traffic signs and signals
- Real-world traffic scenarios
- Violation penalties and enforcement
- Safety rules for pedestrians and vehicles

Output format: All questions, options, and explanations must be written in Vietnamese (Tiếng Việt).` 
        },
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Data
          }
        }
      ];

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: DocumentAnalysisSchema
        }
      });

      const responseText = response.text || '';
      const processingTime = Date.now() - startTime;

      // Parse JSON response
      const parsed = this.parseAIResponse(responseText);
      
      return {
        documentId: crypto.randomUUID(),
        extractedText: parsed.extractedText || responseText,
        keyTopics: parsed.keyTopics || [],
        suggestedQuestions: parsed.suggestedQuestions || [],
        processingTime
      };

    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error(`Lỗi xử lý file PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process large PDF using File API
   */
  async processLargePDF(file: File): Promise<DocumentProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Upload file using File API
      const uploadedFile = await this.ai.files.upload({
        file: file,
        config: {
          displayName: file.name,
        },
      });

      // Wait for processing
      let getFile = await this.ai.files.get({ name: uploadedFile.name || '' });
      while (getFile.state === 'PROCESSING') {
        console.log('File is still processing...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        getFile = await this.ai.files.get({ name: uploadedFile.name || '' });
      }

      if (getFile.state === 'FAILED') {
        throw new Error('File processing failed');
      }

      // Generate content with uploaded file
      const content = [
        `Analyze this Vietnamese traffic law document and create high-quality quiz questions.

Requirements:
- Create both multiple-choice questions (4 options A, B, C, D) and true/false questions
- Questions must be based on actual content from the document
- Provide detailed explanations for each correct answer
- Classify difficulty levels appropriately
- **IMPORTANT: Write all content in Vietnamese language**

Focus areas:
- Specific legal regulations and laws
- Traffic signs and signals
- Real-world traffic scenarios
- Violation penalties and enforcement
- Safety rules for pedestrians and vehicles

Output format: All questions, options, and explanations must be written in Vietnamese (Tiếng Việt).`
      ];

      if (uploadedFile.uri && uploadedFile.mimeType) {
        content.push({
          fileData: {
            mimeType: uploadedFile.mimeType,
            fileUri: uploadedFile.uri
          }
        } as any);
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: content,
        config: {
          responseMimeType: "application/json",
          responseSchema: DocumentAnalysisSchema
        }
      });

      const responseText = response.text || '';
      const processingTime = Date.now() - startTime;

      const parsed = this.parseAIResponse(responseText);
      
      return {
        documentId: crypto.randomUUID(),
        extractedText: parsed.extractedText || responseText,
        keyTopics: parsed.keyTopics || [],
        suggestedQuestions: parsed.suggestedQuestions || [],
        processingTime
      };

    } catch (error) {
      console.error("Error processing large PDF:", error);
      throw new Error(`Lỗi xử lý file PDF lớn: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate quiz from pre-existing documents
   */
  async generateQuizFromPresetDocs(level: StudentLevel, questionCount: number = 10): Promise<Question[]> {
    try {
      const prompt = `Create ${questionCount} traffic law quiz questions for Vietnamese students at ${this.getLevelDescription(level)} level.

Knowledge base:
- Latest Vietnamese Road Traffic Law (Luật Giao thông đường bộ)
- Traffic violation penalty regulations (Nghị định xử phạt vi phạm giao thông)
- Vietnamese standard traffic signs and signals
- Real-world traffic scenarios in Vietnam

Detailed requirements:
- Create both multiple-choice questions (4 options A, B, C, D) and true/false questions
- Questions appropriate for ${level} level students
- Difficulty distribution: ${this.getDifficultyDistribution(level)}
- Provide detailed and easy-to-understand explanations for each correct answer
- **CRITICAL: Write ALL content in Vietnamese language (Tiếng Việt)**

Priority topics:
- Basic traffic rules and regulations
- Traffic signs and signal lights
- Speed limits and safe following distances
- Traffic violation penalties and fines
- Pedestrian and bicycle safety
- Motorcycle and car driving rules
- Emergency vehicle protocols

Output language: All questions, answer options, and explanations MUST be written in Vietnamese (Tiếng Việt).`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ text: prompt }],
        config: {
          responseMimeType: "application/json",
          responseSchema: QuizGenerationSchema
        }
      });

      const parsed = this.parseAIResponse(response.text || '');
      return parsed.questions || [];

    } catch (error) {
      console.error("Error generating quiz:", error);
      throw new Error(`Lỗi tạo quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAIResponse(responseText: string): any {
    try {
      // With structured output, response should be valid JSON
      const parsed = JSON.parse(responseText);
      
      // Add IDs and points to questions if missing
      if (parsed.suggestedQuestions) {
        parsed.suggestedQuestions = parsed.suggestedQuestions.map((q: any) => ({
          ...q,
          id: q.id || crypto.randomUUID(),
          points: q.points || this.getPointsByDifficulty(q.difficulty || 'medium')
        }));
      }
      
      if (parsed.questions) {
        parsed.questions = parsed.questions.map((q: any) => ({
          ...q,
          id: q.id || crypto.randomUUID(),
          points: q.points || this.getPointsByDifficulty(q.difficulty || 'medium')
        }));
      }
      
      return parsed;
    } catch (error) {
      console.error("Error parsing structured AI response:", error);
      
      // Fallback for non-JSON responses
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (fallbackError) {
        console.error("Fallback parsing also failed:", fallbackError);
      }
      
      // Return empty structure as last resort
      return {
        extractedText: responseText,
        keyTopics: [],
        suggestedQuestions: [],
        questions: []
      };
    }
  }

  private getPointsByDifficulty(difficulty: string): number {
    const pointMap: { [key: string]: number } = { 
      easy: 5, 
      medium: 10, 
      hard: 15 
    };
    return pointMap[difficulty] || 10;
  }

  private getLevelDescription(level: StudentLevel): string {
    const descriptions = {
      'cap1': 'học sinh cấp 1 (6-11 tuổi)',
      'cap2': 'học sinh cấp 2 (12-15 tuổi)', 
      'thpt': 'học sinh THPT (16-18 tuổi)',
      'sinhvien': 'sinh viên và người lớn'
    };
    return descriptions[level];
  }

  private getDifficultyDistribution(level: StudentLevel): string {
    const distributions = {
      'cap1': '70% dễ, 30% trung bình',
      'cap2': '50% dễ, 40% trung bình, 10% khó',
      'thpt': '30% dễ, 50% trung bình, 20% khó',
      'sinhvien': '20% dễ, 40% trung bình, 40% khó'
    };
    return distributions[level];
  }
} 