import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { FileAttachment } from './chat-storage';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: Part[];
}

export interface MultimodalMessage {
  text: string;
  files?: FileAttachment[];
}

export interface EnhancedChatResponse {
  text: string;
  sources?: any[];
  confidence?: 'high' | 'medium' | 'low';
}

class EnhancedGeminiService {
  private chat: any = null;
  private history: ChatHistoryItem[] = [];

  // Initialize chat with history
  initializeChat(history: ChatHistoryItem[] = []): void {
    this.history = history;
    this.chat = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      systemInstruction: `Bạn là G-LawBot, một trợ lý AI chuyên gia về luật giao thông Việt Nam.

NHIỆM VỤ CHÍNH:
- Tư vấn luật giao thông đường bộ Việt Nam
- Phân tích tài liệu pháp luật được upload
- Trả lời câu hỏi về vi phạm, mức phạt, quy định
- Nhớ ngữ cảnh cuộc trò chuyện để đưa ra lời khuyên phù hợp
- Phân tích hình ảnh về biển báo, vi phạm giao thông

KHẢ NĂNG MULTIMODAL:
- Đọc và phân tích tài liệu PDF, Word, Excel
- Nhận diện biển báo giao thông từ hình ảnh
- Phân tích video về tình huống giao thông
- Nghe và phản hồi câu hỏi bằng giọng nói

QUY TẮC TRẢ LỜI:
1. Luôn dựa trên luật pháp Việt Nam hiện hành
2. Trích dẫn điều luật cụ thể khi có thể
3. Giải thích dễ hiểu, thân thiện
4. Nhớ ngữ cảnh cuộc trò chuyện trước đó
5. Hỏi lại nếu thông tin chưa rõ ràng
6. Đưa ra lời khuyên thực tế, hữu ích

ĐỊNH DẠNG TRẢ LỜI:
- Trả lời trực tiếp và cụ thể
- Giải thích luật liên quan
- Đưa ra lời khuyên thực tế
- Hỏi thêm nếu cần làm rõ`
    }).startChat({
      history: this.history
    });
  }

  // Send message with optional files
  async sendMessage(message: MultimodalMessage): Promise<EnhancedChatResponse> {
    try {
      if (!this.chat) {
        this.initializeChat();
      }

      // Prepare message parts
      const parts: any[] = [{ text: message.text }];

      // Add file attachments
      if (message.files && message.files.length > 0) {
        for (const file of message.files) {
          const fileData = await this.processFileAttachment(file);
          if (fileData) {
            parts.push(fileData);
          }
        }
      }

      // Send message
      const result = await this.chat.sendMessage(parts);
      const response = result.response;
      const text = response.text();

      // Update history
      this.history.push(
        { role: 'user', parts },
        { role: 'model', parts: [{ text }] }
      );

      return {
        text,
        confidence: this.calculateConfidence(text, message.files?.length || 0)
      };

    } catch (error) {
      console.error('Enhanced Gemini error:', error);
      throw new Error('Không thể xử lý tin nhắn. Vui lòng thử lại.');
    }
  }

  // Send message with streaming
  async sendMessageStream(message: MultimodalMessage): Promise<AsyncIterable<string>> {
    try {
      if (!this.chat) {
        this.initializeChat();
      }

      const parts: any[] = [{ text: message.text }];

      if (message.files && message.files.length > 0) {
        for (const file of message.files) {
          const fileData = await this.processFileAttachment(file);
          if (fileData) {
            parts.push(fileData);
          }
        }
      }

      const result = await this.chat.sendMessageStream(parts);
      
      return this.createStreamIterator(result, parts);

    } catch (error) {
      console.error('Enhanced Gemini streaming error:', error);
      throw new Error('Không thể xử lý tin nhắn streaming. Vui lòng thử lại.');
    }
  }

  private async *createStreamIterator(result: any, userParts: any[]): AsyncIterable<string> {
    let fullText = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      yield chunkText;
    }

    // Update history after streaming completes
    this.history.push(
      { role: 'user', parts: userParts },
      { role: 'model', parts: [{ text: fullText }] }
    );
  }

  // Process file attachment for Gemini
  private async processFileAttachment(file: FileAttachment): Promise<any | null> {
    try {
      // For images
      if (file.mimeType.startsWith('image/')) {
        const response = await fetch(file.url);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        return {
          inlineData: {
            mimeType: file.mimeType,
            data: base64
          }
        };
      }

      // For documents (PDF, text files)
      if (file.mimeType === 'application/pdf' || file.mimeType.startsWith('text/')) {
        // For now, we'll extract text content and send as text
        const textContent = await this.extractTextFromFile(file);
        return { text: `\n\n[Nội dung file ${file.name}]:\n${textContent}` };
      }

      return null;
    } catch (error) {
      console.error('Error processing file attachment:', error);
      return { text: `\n\n[Không thể đọc file ${file.name}]` };
    }
  }

  // Extract text from file (basic implementation)
  private async extractTextFromFile(file: FileAttachment): Promise<string> {
    try {
      const response = await fetch(file.url);
      
      if (file.mimeType.startsWith('text/')) {
        return await response.text();
      }
      
      if (file.mimeType === 'application/pdf') {
        // For PDF, we'd need a PDF parsing library
        // For now, return a placeholder
        return `[File PDF: ${file.name} - ${(file.size / 1024).toFixed(1)}KB]`;
      }

      return `[File: ${file.name} - ${file.mimeType}]`;
    } catch (error) {
      console.error('Error extracting text from file:', error);
      return `[Lỗi đọc file: ${file.name}]`;
    }
  }

  // Calculate response confidence
  private calculateConfidence(text: string, fileCount: number): 'high' | 'medium' | 'low' {
    let score = 0;

    // Length check
    if (text.length > 200) score += 1;
    if (text.length > 500) score += 1;

    // Legal terms check
    const legalTerms = ['điều', 'khoản', 'luật', 'nghị định', 'quy định', 'phạt'];
    const foundTerms = legalTerms.filter(term => text.toLowerCase().includes(term));
    score += Math.min(foundTerms.length, 3);

    // File attachment bonus
    if (fileCount > 0) score += 1;

    // Specific numbers/amounts (like fines)
    if (/\d+\.?\d*\s*(đồng|triệu|nghìn|VNĐ)/.test(text)) score += 1;

    // Article references
    if (/điều\s+\d+/i.test(text)) score += 1;

    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  // Get chat history
  getHistory(): ChatHistoryItem[] {
    return this.history;
  }

  // Set chat history (for loading sessions)
  setHistory(history: ChatHistoryItem[]): void {
    this.history = history;
    this.initializeChat(history);
  }

  // Clear chat history
  clearHistory(): void {
    this.history = [];
    this.chat = null;
  }

  // Get conversation summary
  async generateSummary(): Promise<string> {
    if (this.history.length === 0) return '';

    try {
      const summaryModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const conversation = this.history
        .map(item => `${item.role}: ${item.parts.map(p => p.text).join(' ')}`)
        .join('\n');

      const result = await summaryModel.generateContent(
        `Tóm tắt cuộc trò chuyện sau về luật giao thông trong 1-2 câu ngắn gọn:\n\n${conversation}`
      );

      return result.response.text();
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Cuộc trò chuyện về luật giao thông';
    }
  }
}

export const enhancedGemini = new EnhancedGeminiService();
