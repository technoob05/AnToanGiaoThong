import { GoogleGenerativeAI } from '@google/generative-ai';
import { pdfProcessor, DocumentChunk } from './pdf-processor';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface RAGResponse {
  answer: string;
  sources: DocumentChunk[];
  confidence: 'high' | 'medium' | 'low';
}

export class RAGService {
  private model: any;
  private isInitialized = false;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: `Bạn là G-LawBot, một chuyên gia về luật giao thông Việt Nam.

NHIỆM VỤ:
- Trả lời câu hỏi dựa trên CHÍNH XÁC các tài liệu luật được cung cấp
- Trích dẫn cụ thể điều, khoản, nghị định từ tài liệu
- Giải thích rõ ràng, dễ hiểu cho người Việt Nam
- Đưa ra mức phạt cụ thể nếu có trong tài liệu

QUY TẮC:
1. CHỈ trả lời dựa trên thông tin từ tài liệu được cung cấp
2. Nếu không có thông tin trong tài liệu, hãy nói rõ "Tôi không tìm thấy thông tin này trong tài liệu luật"
3. Luôn trích dẫn nguồn (Điều, Khoản, Nghị định)
4. Sử dụng ngôn ngữ thân thiện, chuyên nghiệp
5. Trả lời bằng tiếng Việt

ĐỊNH DẠNG TRẢ LỜI:
- Trả lời trực tiếp câu hỏi
- Trích dẫn điều luật cụ thể
- Giải thích thêm nếu cần thiết`
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Initialize PDF processor
      await pdfProcessor.processPDF('/LUAT_DUONG_BO_MOI_NHAT_3276b.pdf');
      this.isInitialized = true;
      console.log('RAG Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RAG Service:', error);
      // Continue with mock data
      this.isInitialized = true;
    }
  }

  async askQuestion(question: string): Promise<RAGResponse> {
    await this.initialize();

    try {
      // 1. Search for relevant documents
      const relevantChunks = await pdfProcessor.searchRelevantChunks(question, 3);
      
      console.log('Found relevant chunks:', relevantChunks.length);
      
      if (relevantChunks.length === 0) {
        return {
          answer: 'Tôi không tìm thấy thông tin liên quan trong tài liệu luật giao thông. Bạn có thể hỏi về các chủ đề như: vi phạm giao thông, mức phạt, giấy phép lái xe, quy tắc đường bộ, etc.',
          sources: [],
          confidence: 'low'
        };
      }

      // 2. Create context from relevant chunks
      const context = this.buildContext(relevantChunks);
      
      // 3. Create prompt with context
      const prompt = this.buildPrompt(question, context);
      
      // 4. Get answer from Gemini
      const result = await this.model.generateContent(prompt);
      const answer = result.response.text();
      
      // 5. Determine confidence based on relevance
      const confidence = this.calculateConfidence(relevantChunks, question);
      
      return {
        answer,
        sources: relevantChunks,
        confidence
      };

    } catch (error) {
      console.error('Error in RAG query:', error);
      throw new Error('Không thể xử lý câu hỏi. Vui lòng thử lại sau.');
    }
  }

  private buildContext(chunks: DocumentChunk[]): string {
    let context = "=== TÀI LIỆU LUẬT GIAO THÔNG ===\n\n";
    
    chunks.forEach((chunk, index) => {
      context += `[Tài liệu ${index + 1}]\n`;
      context += `Nguồn: ${chunk.metadata.source}\n`;
      
      if (chunk.metadata.article) {
        context += `Điều luật: ${chunk.metadata.article}\n`;
      }
      
      if (chunk.metadata.section) {
        context += `Phần: ${chunk.metadata.section}\n`;
      }
      
      context += `Trang: ${chunk.metadata.page}\n`;
      context += `Nội dung: ${chunk.content}\n\n`;
    });
    
    return context;
  }

  private buildPrompt(question: string, context: string): string {
    return `${context}

=== CÂU HỎI ===
${question}

=== YÊU CẦU ===
Hãy trả lời câu hỏi dựa trên TÀI LIỆU LUẬT GIAO THÔNG ở trên. 
- Trích dẫn chính xác điều, khoản từ tài liệu
- Giải thích rõ ràng, dễ hiểu
- Đưa ra mức phạt cụ thể nếu có
- Chỉ sử dụng thông tin từ tài liệu được cung cấp`;
  }

  private calculateConfidence(chunks: DocumentChunk[], question: string): 'high' | 'medium' | 'low' {
    if (chunks.length === 0) return 'low';
    
    const questionLower = question.toLowerCase();
    let relevanceScore = 0;
    
    chunks.forEach(chunk => {
      const content = chunk.content.toLowerCase();
      
      // Check for exact keyword matches
      const keywords = questionLower.split(/\s+/).filter(word => word.length > 3);
      keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          relevanceScore += 1;
        }
      });
      
      // Boost for legal structure words
      const legalWords = ['điều', 'khoản', 'phạt', 'quy định', 'vi phạm'];
      legalWords.forEach(word => {
        if (content.includes(word) && questionLower.includes(word)) {
          relevanceScore += 2;
        }
      });
    });
    
    // Calculate confidence based on relevance score and number of chunks
    const avgScore = relevanceScore / chunks.length;
    
    if (avgScore >= 3 && chunks.length >= 2) return 'high';
    if (avgScore >= 1.5 || chunks.length >= 2) return 'medium';
    return 'low';
  }

  async getSuggestions(): Promise<string[]> {
    return [
      'Vượt đèn đỏ bị phạt bao nhiêu tiền?',
      'Tuổi tối thiểu để lái xe ô tô là bao nhiêu?',
      'Không đội mũ bảo hiểm bị phạt như thế nào?',
      'Quy định về tốc độ trên đường cao tốc?',
      'Giấy phép lái xe hết hạn phải làm gì?',
      'Uống rượu bia lái xe bị xử lý ra sao?'
    ];
  }
}

export const ragService = new RAGService();
